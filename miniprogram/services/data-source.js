const { API_CONFIG, buildUrl, request } = require("./api");
const {
  getMockDevice,
  getMockDevices,
  getMockDiaryEntries,
  getMockLatestTelemetry
} = require("./mock-data");
const { getBackendApiEnabled, setBackendApiEnabled } = require("../utils/local-state");

const DEFAULT_DEVICE_ID = "demo-plant-001";
const FALLBACK_MESSAGE = "后端未启动，已回到模拟数据";

function unwrapResponse(response) {
  if (response && typeof response === "object" && Object.prototype.hasOwnProperty.call(response, "data")) {
    return response.data;
  }

  return response;
}

function buildResult(data, source, options = {}) {
  return {
    data,
    source,
    isBackend: source === "backend",
    usedFallback: Boolean(options.usedFallback),
    message: options.message || "",
    error: options.error ? String(options.error.message || options.error) : ""
  };
}

function buildMockResult(factory) {
  return buildResult(factory(), "mock");
}

function buildFallbackResult(factory, error, message = FALLBACK_MESSAGE) {
  if (getBackendApiEnabled()) {
    setBackendApiEnabled(false);
  }

  return buildResult(factory(), "mock", {
    usedFallback: true,
    message,
    error
  });
}

function requestJson(method, path, params = {}, data) {
  const options = {
    url: buildUrl(path, params),
    method
  };

  if (data !== undefined) {
    options.data = data;
    options.header = {
      "Content-Type": "application/json"
    };
  }

  return request(options);
}

function getMockDashboardData() {
  return {
    device: getMockDevice(),
    telemetry: getMockLatestTelemetry()
  };
}

function buildThresholdsFromForm(form) {
  const defaultThresholds = getMockDevice().thresholds || {};

  return {
    soilMoisture: Object.assign({}, defaultThresholds.soilMoisture, {
      min: Number(form.soilMoistureMin)
    }),
    lightLux: Object.assign({}, defaultThresholds.lightLux, {
      min: Number(form.lightLuxMin)
    }),
    temperature: Object.assign({}, defaultThresholds.temperature, {
      max: Number(form.temperatureMax)
    }),
    humidity: Object.assign({}, defaultThresholds.humidity),
    soilPh: Object.assign({}, defaultThresholds.soilPh),
    soilEc: Object.assign({}, defaultThresholds.soilEc)
  };
}

function buildMockCommand(deviceId, type, payload = {}) {
  return Object.assign(
    {
      commandId: `mock-${Date.now()}`,
      deviceId: deviceId || DEFAULT_DEVICE_ID,
      type,
      acceptedAt: Math.floor(Date.now() / 1000)
    },
    payload
  );
}

async function checkBackendHealth() {
  if (!getBackendApiEnabled()) {
    return buildMockResult(() => ({
      ok: false,
      service: "local-mock"
    }));
  }

  try {
    const response = await requestJson("GET", "/health");
    return buildResult(unwrapResponse(response), "backend", {
      message: "本地后端已连接"
    });
  } catch (error) {
    return buildFallbackResult(
      () => ({
        ok: false,
        service: "local-mock"
      }),
      error
    );
  }
}

async function getDevices() {
  if (!getBackendApiEnabled()) {
    return buildMockResult(getMockDevices);
  }

  try {
    const response = await requestJson("GET", API_CONFIG.endpoints.devices);
    return buildResult(unwrapResponse(response), "backend");
  } catch (error) {
    return buildFallbackResult(getMockDevices, error);
  }
}

async function getDashboardData(deviceId = DEFAULT_DEVICE_ID) {
  if (!getBackendApiEnabled()) {
    return buildMockResult(getMockDashboardData);
  }

  try {
    const [deviceResponse, telemetryResponse] = await Promise.all([
      requestJson("GET", API_CONFIG.endpoints.deviceDetail, { id: deviceId }),
      requestJson("GET", API_CONFIG.endpoints.latest, { id: deviceId })
    ]);

    return buildResult(
      {
        device: unwrapResponse(deviceResponse),
        telemetry: unwrapResponse(telemetryResponse)
      },
      "backend"
    );
  } catch (error) {
    return buildFallbackResult(getMockDashboardData, error);
  }
}

async function getDiaryEntries(deviceId = DEFAULT_DEVICE_ID) {
  if (!getBackendApiEnabled()) {
    return buildMockResult(getMockDiaryEntries);
  }

  try {
    const response = await requestJson("GET", API_CONFIG.endpoints.diaries, { id: deviceId });
    return buildResult(unwrapResponse(response), "backend");
  } catch (error) {
    return buildFallbackResult(getMockDiaryEntries, error);
  }
}

async function saveThresholds(deviceId = DEFAULT_DEVICE_ID, form) {
  const thresholds = buildThresholdsFromForm(form || {});
  const payload = {
    thresholds
  };

  if (!getBackendApiEnabled()) {
    return buildMockResult(() => thresholds);
  }

  try {
    const response = await requestJson("POST", API_CONFIG.endpoints.thresholds, { id: deviceId }, payload);
    return buildResult(unwrapResponse(response), "backend", {
      message: response.message || "后端已保存阈值"
    });
  } catch (error) {
    return buildFallbackResult(() => thresholds, error, "阈值已保存本地，后端已回退");
  }
}

async function sendDeviceCommand(deviceId = DEFAULT_DEVICE_ID, type, payload = {}) {
  const commandPayload = Object.assign({ type }, payload);

  if (!getBackendApiEnabled()) {
    return buildMockResult(() => buildMockCommand(deviceId, type, payload));
  }

  try {
    const response = await requestJson("POST", API_CONFIG.endpoints.command, { id: deviceId }, commandPayload);
    return buildResult(unwrapResponse(response), "backend", {
      message: response.message || "后端已接收模拟命令"
    });
  } catch (error) {
    return buildFallbackResult(
      () => buildMockCommand(deviceId, type, payload),
      error,
      "命令已本地模拟，后端已回退"
    );
  }
}

function sendWaterCommand(deviceId, durationSeconds) {
  return sendDeviceCommand(deviceId, "watering", {
    durationSeconds: Number(durationSeconds)
  });
}

function sendCaptureCommand(deviceId) {
  return sendDeviceCommand(deviceId, "capture", {
    reason: "manual"
  });
}

async function diagnosePlant(question) {
  const trimmedQuestion = String(question || "").trim();

  if (!getBackendApiEnabled()) {
    return buildMockResult(() => ({
      question: trimmedQuestion,
      answer: "",
      source: "local-rule"
    }));
  }

  try {
    const response = await requestJson("POST", API_CONFIG.endpoints.diagnosis, {}, {
      question: trimmedQuestion,
      deviceId: DEFAULT_DEVICE_ID
    });
    return buildResult(unwrapResponse(response), "backend");
  } catch (error) {
    return buildFallbackResult(
      () => ({
        question: trimmedQuestion,
        answer: "",
        source: "local-rule"
      }),
      error,
      "问诊接口未连接，已回退"
    );
  }
}

function showFallbackToast(result) {
  if (!result || !result.usedFallback || !result.message) {
    return;
  }

  if (typeof wx !== "undefined" && wx.showToast) {
    wx.showToast({
      title: result.message,
      icon: "none"
    });
  }
}

module.exports = {
  DEFAULT_DEVICE_ID,
  FALLBACK_MESSAGE,
  checkBackendHealth,
  diagnosePlant,
  getDashboardData,
  getDevices,
  getDiaryEntries,
  saveThresholds,
  sendCaptureCommand,
  sendWaterCommand,
  showFallbackToast
};
