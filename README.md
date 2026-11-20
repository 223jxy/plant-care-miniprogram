# Plant Care Mini Program · 绿小护

A WeChat Mini Program + Node.js backend for monitoring and caring for houseplants — live soil/light/temperature telemetry, automatic health scoring, one-tap watering, growth diary and an AI-assisted plant diagnosis flow.

![Mini Program](https://img.shields.io/badge/platform-WeChat%20Mini%20Program-07C160)
![Backend](https://img.shields.io/badge/backend-Node.js%20(no%20deps)-339933)
![Tests](https://img.shields.io/badge/tests-integration-informational)

---

## Overview

Most consumer plant monitors show raw numbers — soil moisture 43%, light 1250 lux — and leave the user to interpret them. This project turns raw sensor readings into a single **0–100 health score**, a per-metric pass/fail diagnosis, and a concrete next action ("water 200 ml", "move 1 m closer to the window").

The repository contains both halves of the product:

- **`miniprogram/`** — a native WeChat Mini Program (7 pages, no framework dependency)
- **`server/`** — a zero-dependency Node.js HTTP backend serving device, telemetry, threshold, command and diagnosis endpoints

The Mini Program works **standalone in mock mode** and automatically upgrades to the real backend when it is reachable — including automatic fallback to local mock data when the backend goes down, so the UI never breaks in a demo.

## Architecture: one data contract, three interchangeable sources

The design decision worth explaining in an interview is that the UI layer knows **nothing** about where data comes from. Every page talks to `services/data-source.js`, which exposes a uniform result shape:

```js
{
  data,            // the payload
  source,          // "backend" | "mock"
  isBackend,       // boolean
  usedFallback,    // did we degrade this call?
  message,         // user-facing notice
  error            // diagnostic string
}
```

Behind that single contract sit three sources that can be swapped at runtime:

| Source | Module | When it is used |
|---|---|---|
| **Backend HTTP** | `services/api.js` | Default when the Node server is reachable |
| **Local mock** | `services/mock-data.js` | Offline development, demos, and automatic fallback |
| **Device transport contracts** | `services/mqtt-topics.js`, `services/ble-config.js` | Topic/characteristic definitions for real MQTT and BLE device channels |

**Fallback is automatic, not manual.** If a backend request throws, the data layer flips `isBackend` off, serves the mock equivalent, and returns `usedFallback: true` so the page can show a banner instead of an error screen. The user can also force mock mode from the settings page — useful for demoing without a server.

**Handling 6-8 different pages' worth of errors identically** was the reason to centralise this rather than `try/catch` in each page: the fallback contract lives in one file, and adding a fourth source later means implementing one interface, not editing every page.

### The rules engine

`utils/plant-rules.js` is a pure, side-effect-free scorer — no network, no state, trivially unit-testable:

- Each metric is compared against the plant type's ideal `[min, max]` band.
- Inside the band → `1.0`. Outside → decays proportionally to the overshoot relative to the band span.
- A missing or non-numeric reading scores a **neutral 0.6**, deliberately not `0` and not `1` — an absent sensor must not masquerade as a healthy plant, nor as a dead one.
- Final score is the weighted sum (see table below), rounded to an integer 0–100.

## Measured results

All figures are counted from the committed source, not estimated.

| Metric | Value | How it was obtained |
|---|---|---|
| Pages | **7** (`index` / `control` / `device-detail` / `diagnosis` / `diary` / `mine` / `bind-device`) | `ls miniprogram/pages/` |
| Total code | **3,959 lines** across JS + WXML + WXSS | `find miniprogram server -name "*.js" -o -name "*.wxml" -o -name "*.wxss"` + `wc -l` |
| Data sources behind one contract | **3** (backend HTTP / local mock / MQTT-over-BLE) | `miniprogram/services/data-source.js` |
| Health-score inputs | **6** weighted metrics | `plant-rules.js` `SCORE_WEIGHTS` |
| Integration assertions | **44** (32 data-source + 12 HTTP) | `grep -cE "^(test\|it\|assert)"` on both test files |
| Test outcome | `server HTTP integration check passed` | `npm run test:integration` in `server/` |

### Health scoring model (verified weights)

```
soilMoisture 35 | lightLux 20 | temperature 15 | humidity 10 | soilPh 10 | soilEc 10
```

Each metric is normalised against a per-plant threshold range, then weighted and summed. **A missing or out-of-range reading scores 0.6** — deliberately neither 0 nor 1: a sensor dropout should drift the score toward "unknown" rather than trigger a false "plant is dying" alert. The score is clamped to 0–100 and bucketed (>=85 = 状态很好).

**Not measured / not claimed**: real-device BLE pairing success rate and long-term sensor drift — both need hardware in hand, so no figure is published.

## Features

| Area | What it does |
|---|---|
| **Device telemetry** | Soil moisture, light (lux), temperature, humidity, soil pH and soil EC, plus battery and RSSI |
| **Health scoring** | Weighted 6-metric scoring model → single 0–100 score with per-metric verdicts and suggested actions |
| **Threshold control** | Per-device min/max thresholds for each metric, editable from the app and persisted via the backend |
| **Actuator commands** | Watering (1–10 s duration) and camera capture commands dispatched to the device |
| **Growth diary** | Timestamped event log (health up/down, watering, alerts) with per-device filtering |
| **AI diagnosis** | Symptom photo + description → backend diagnosis endpoint (mock implementation, designed for a real LLM behind an env var) |
| **Device binding** | BLE scan / SN entry flow for onboarding a new sensor |
| **Offline resilience** | Automatic mock-data fallback: backend → mock, with a user-visible banner and one-tap retry |
| **Multi-source data layer** | A single `data-source` abstraction that transparently switches between backend and mock providers |

## Tech stack

**Frontend**
- Native WeChat Mini Program (WXML / WXSS / JS) — no third-party UI framework, kept deliberately dependency-free
- Page-level state via a small `local-state` utility; services layer shared across pages
- BLE configuration and MQTT topic contracts defined as swappable service modules

**Backend**
- Node.js with **only the standard library** (`http`) — no Express, no npm dependencies at runtime
- REST API with JSON responses, CORS headers, and request body parsing
- Integration test that boots the server on a random port, exercises every endpoint, and shuts down cleanly

## Project structure

```text
绿植系统/
├── miniprogram/                  # WeChat Mini Program client
│   ├── app.js / app.json / app.wxss
│   ├── pages/
│   │   ├── index/                # Dashboard: health score + key metrics
│   │   ├── control/             # Thresholds + watering/capture commands
│   │   ├── diary/               # Growth event timeline
│   │   ├── diagnosis/           # AI plant diagnosis flow
│   │   ├── bind-device/         # Device onboarding (BLE / SN)
│   │   ├── device-detail/       # Full telemetry breakdown
│   │   └── mine/                # Settings & backend toggle
│   ├── services/
│   │   ├── api.js               # HTTP client + base config
│   │   ├── data-source.js       # backend ⇄ mock switching + fallback
│   │   ├── mock-data.js         # Deterministic demo dataset
│   │   ├── ble-config.js        # BLE characteristic contract
│   │   └── mqtt-topics.js       # MQTT topic contract
│   ├── utils/
│   │   ├── plant-rules.js       # ★ Weighted health-scoring algorithm
│   │   ├── local-state.js       # Persisted local prefs / form state
│   │   └── format.js            # Display formatting helpers
│   └── tests/                   # Data-source integration test
├── server/
│   ├── src/app.js               # HTTP server + all routes (single file, stdlib only)
│   ├── tests/http.integration.js# Endpoint integration test
│   ├── package.json
│   └── .env.example             # All secrets are placeholders
├── project.config.json
└── README.md
```

## How to run

### 1. Backend

```bash
cd server
npm run check              # syntax check
npm run test:integration   # boot on random port, test all endpoints, shut down
npm start                  # serve on http://localhost:3000
```

Verify manually:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/devices
curl http://localhost:3000/api/devices/demo-plant-001/telemetry/latest
```

### 2. Mini Program

1. Open **WeChat DevTools** (微信开发者工具).
2. Import this repository root — `project.config.json` points the app root at `miniprogram/`.
3. Run in the simulator. No AppID is required for local preview; use **test/demo mode**.
4. To connect to the local backend: set `API_CONFIG.baseUrl` in `miniprogram/services/api.js` to your machine's LAN IP (e.g. `http://192.168.1.10:3000`), and enable the backend toggle on the **My (mine)** page. WeChat DevTools must have *"Do not verify valid domain names"* checked for local HTTP.

> The app runs fully in **mock mode** out of the box — no backend, no device, no credentials needed.

## API reference

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness probe |
| GET | `/api/devices` | List bound devices |
| GET | `/api/devices/:id` | Device detail with current thresholds |
| GET | `/api/devices/:id/telemetry/latest` | Latest sensor reading + actuator status |
| GET | `/api/devices/:id/diary` | Growth diary entries |
| GET | `/api/devices/:id/thresholds` | Read thresholds |
| POST | `/api/devices/:id/thresholds` | Save thresholds (validated per-metric) |
| POST | `/api/devices/:id/commands` | Dispatch `water` / `capture` command |
| POST | `/api/diagnosis` | AI plant diagnosis |

## Health scoring model

`miniprogram/utils/plant-rules.js` scores each metric by how close it sits to the plant's ideal band, then combines them with fixed domain weights:

| Metric | Weight |
|---|---|
| Soil moisture | 35% |
| Light | 20% |
| Temperature | 15% |
| Humidity | 10% |
| Soil pH | 10% |
| Soil EC | 10% |

A metric inside its `[min, max]` band scores 1.0; outside the band the score decays with distance relative to the band span. Missing or non-numeric readings fall back to a neutral 0.6 rather than pretending the sensor is healthy.

## Security notes

- **No credentials are committed.** `server/.env.example` contains placeholders only (`replace_with_...`).
- Real WeChat AppSecret, MQTT credentials and the AI API key are read from environment variables at runtime and never shipped to the client.
- `project.private.config.json` and `.env` are git-ignored.
- The AI diagnosis endpoint is a mock; wiring a real provider means adding the key **server-side only**.

## Roadmap

- [ ] Real persistence (SQLite/Postgres) replacing the in-memory demo dataset
- [ ] Real MQTT device channel and BLE provisioning
- [ ] WeChat `code2session` login
- [ ] Push notifications on threshold breach
- [ ] Historical charts instead of the latest-reading snapshot

## Screenshots

| Dashboard | Control | Diary | Diagnosis |
|---|---|---|---|
| _placeholder_ | _placeholder_ | _placeholder_ | _placeholder_ |

> Run the app in WeChat DevTools and capture the four tab screens here.

---

## 中文简介

**绿小护**是一个微信小程序 + Node.js 后端的花草养护系统。核心价值是把传感器原始数值（土壤湿度、光照、温度、湿度、pH、EC）转换成 **0–100 的健康分** 和具体的养护建议，而不是让人自己看数字。

小程序端完全无第三方 UI 框架，7 个页面；后端只用 Node 标准库 `http`，零运行时依赖。前端内置 mock 数据，后端不可用时会自动降级并提示，保证演示不白屏。

运行：`cd server && npm run test:integration && npm start`，然后微信开发者工具导入仓库根目录即可。
