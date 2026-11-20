const http = require("http");

const PORT = process.env.PORT || 3000;

const demoDevice = {
  id: "demo-plant-001",
  sn: "GXH-20260708-001",
  name: "办公桌小绿萝",
  plantType: "绿萝",
  spaceName: "办公室",
  firmwareVersion: "0.1.0",
  online: true,
  lastSeenAt: 1783526400,
  battery: 86,
  rssi: -61,
  thresholds: {
    soilMoisture: { min: 35, max: 75 },
    lightLux: { min: 800, max: 4000 },
    temperature: { min: 18, max: 30 },
    humidity: { min: 40, max: 75 },
    soilPh: { min: 5.8, max: 7.2 },
    soilEc: { min: 0.8, max: 2.0 }
  }
};

const latestTelemetry = {
  deviceId: demoDevice.id,
  seq: 10245,
  ts: 1783526400,
  metrics: {
    temperature: 25.6,
    humidity: 58.2,
    lightLux: 1250,
    soilMoisture: 43,
    soilPh: 6.4,
    soilEc: 1.21,
    battery: 86,
    rssi: -61
  },
  status: {
    pump: "idle",
    camera: "ready"
  }
};

const diaryEntries = [
  {
    id: "diary-001",
    deviceId: demoDevice.id,
    eventType: "health_up",
    eventName: "健康提升",
    createdAt: 1783526400,
    content: "今天土壤湿度回到舒适区，小绿萝精神看起来更好了。",
    snapshot: {
      soilMoisture: 43,
      lightLux: 1250,
      healthScore: 88
    },
    imageUrl: ""
  },
  {
    id: "diary-002",
    deviceId: demoDevice.id,
    eventType: "watering",
    eventName: "完成浇水",
    createdAt: 1783440000,
    content: "收到一次手动浇水指令，水泵运行 5 秒。",
    snapshot: {
      soilMoisture: 38,
      lightLux: 980,
      healthScore: 82
    },
    imageUrl: ""
  }
];

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(body));
}

function sendNotFound(response) {
  sendJson(response, 404, {
    error: "NOT_FOUND",
    message: "接口尚未实现"
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("REQUEST_TOO_LARGE"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function getDeviceId(pathname, suffix) {
  const prefix = "/api/devices/";
  if (!pathname.startsWith(prefix) || !pathname.endsWith(suffix)) {
    return "";
  }
  return pathname.slice(prefix.length, pathname.length - suffix.length);
}

function isDemoDevice(deviceId) {
  return deviceId === demoDevice.id;
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && pathname === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "green-plant-assistant-server"
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/devices") {
    sendJson(response, 200, {
      data: [demoDevice]
    });
    return;
  }

  if (request.method === "GET" && pathname === `/api/devices/${demoDevice.id}`) {
    sendJson(response, 200, {
      data: demoDevice
    });
    return;
  }

  const latestDeviceId = getDeviceId(pathname, "/telemetry/latest");
  if (request.method === "GET" && isDemoDevice(latestDeviceId)) {
    sendJson(response, 200, {
      data: latestTelemetry
    });
    return;
  }

  const diaryDeviceId = getDeviceId(pathname, "/diary");
  if (request.method === "GET" && isDemoDevice(diaryDeviceId)) {
    sendJson(response, 200, {
      data: diaryEntries
    });
    return;
  }

  const thresholdsDeviceId = getDeviceId(pathname, "/thresholds");
  if (request.method === "GET" && isDemoDevice(thresholdsDeviceId)) {
    sendJson(response, 200, {
      data: demoDevice.thresholds
    });
    return;
  }

  if ((request.method === "POST" || request.method === "PUT") && isDemoDevice(thresholdsDeviceId)) {
    const body = await readJsonBody(request);
    demoDevice.thresholds = {
      ...demoDevice.thresholds,
      ...(body.thresholds || body)
    };
    sendJson(response, 200, {
      ok: true,
      data: demoDevice.thresholds,
      message: "阈值已保存到本地模拟服务"
    });
    return;
  }

  const commandDeviceId = getDeviceId(pathname, "/commands");
  if (request.method === "POST" && isDemoDevice(commandDeviceId)) {
    const body = await readJsonBody(request);
    sendJson(response, 200, {
      ok: true,
      data: {
        commandId: `cmd-${Date.now()}`,
        deviceId: commandDeviceId,
        type: body.type || "watering",
        acceptedAt: Math.floor(Date.now() / 1000)
      },
      message: "模拟命令已接收"
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/diagnosis") {
    const body = await readJsonBody(request);
    const question = String(body.question || "").trim();
    sendJson(response, 200, {
      data: {
        question,
        answer: question
          ? "这是本地模拟建议：先检查土壤湿度和光照，保持通风，避免一次浇太多水。"
          : "请先输入植物问题，再生成养护建议。",
        source: "local-mock"
      }
    });
    return;
  }

  sendNotFound(response);
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    sendJson(response, 400, {
      error: "BAD_REQUEST",
      message: error.message || "请求格式不正确"
    });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  demoDevice,
  diaryEntries,
  latestTelemetry,
  server
};
