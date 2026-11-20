const assert = require("assert");

const storage = {};

function resetStorage() {
  Object.keys(storage).forEach((key) => {
    delete storage[key];
  });
}

function installWxMock(requestHandler) {
  global.wx = {
    getStorageSync(key) {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : "";
    },
    setStorageSync(key, value) {
      storage[key] = value;
    },
    request: requestHandler,
    showToast() {}
  };
}

function installFailingWxMock(message) {
  installWxMock((options) => {
    options.fail(new Error(message || "connect ECONNREFUSED"));
  });
}

function succeed(data) {
  return {
    statusCode: 200,
    data
  };
}

const localState = require("../utils/local-state");
const dataSource = require("../services/data-source");

async function testMockDataByDefault() {
  resetStorage();
  installWxMock(() => {
    throw new Error("默认模拟数据不应请求 wx.request");
  });
  localState.setBackendApiEnabled(false);

  const result = await dataSource.getDashboardData();

  assert.strictEqual(result.source, "mock");
  assert.strictEqual(result.usedFallback, false);
  assert.strictEqual(result.data.device.id, dataSource.DEFAULT_DEVICE_ID);
}

async function testBackendDashboardSuccess() {
  resetStorage();
  const calls = [];

  installWxMock((options) => {
    calls.push(options.url);

    if (options.url.endsWith(`/api/devices/${dataSource.DEFAULT_DEVICE_ID}`)) {
      options.success(
        succeed({
          data: {
            id: dataSource.DEFAULT_DEVICE_ID,
            name: "后端绿萝",
            spaceName: "测试台",
            online: true,
            thresholds: {
              soilMoisture: { min: 30, max: 70 },
              lightLux: { min: 600, max: 4000 },
              temperature: { min: 18, max: 30 }
            }
          }
        })
      );
      return;
    }

    if (options.url.endsWith(`/api/devices/${dataSource.DEFAULT_DEVICE_ID}/telemetry/latest`)) {
      options.success(
        succeed({
          data: {
            deviceId: dataSource.DEFAULT_DEVICE_ID,
            ts: 1783526400,
            metrics: {
              soilMoisture: 44,
              lightLux: 1300,
              temperature: 25
            }
          }
        })
      );
      return;
    }

    options.fail(new Error(`未预期请求：${options.url}`));
  });
  localState.setBackendApiEnabled(true);

  const result = await dataSource.getDashboardData();

  assert.strictEqual(result.source, "backend");
  assert.strictEqual(result.data.device.name, "后端绿萝");
  assert.strictEqual(result.data.telemetry.metrics.soilMoisture, 44);
  assert.strictEqual(calls.length, 2);
}

async function testBackendFailureFallback() {
  resetStorage();
  installFailingWxMock();
  localState.setBackendApiEnabled(true);

  const result = await dataSource.getDiaryEntries();

  assert.strictEqual(result.source, "mock");
  assert.strictEqual(result.usedFallback, true);
  assert.strictEqual(localState.getBackendApiEnabled(), false);
  assert.ok(result.data.length > 0);
}

async function testBackendHealthFailureMessage() {
  resetStorage();
  installFailingWxMock();
  localState.setBackendApiEnabled(true);

  const result = await dataSource.checkBackendHealth();

  assert.strictEqual(result.source, "mock");
  assert.strictEqual(result.usedFallback, true);
  assert.strictEqual(result.message, dataSource.FALLBACK_MESSAGE);
  assert.strictEqual(result.data.service, "local-mock");
  assert.strictEqual(localState.getBackendApiEnabled(), false);
}

async function testThresholdFallbackMessage() {
  resetStorage();
  installFailingWxMock();
  localState.setBackendApiEnabled(true);

  const result = await dataSource.saveThresholds(dataSource.DEFAULT_DEVICE_ID, {
    soilMoistureMin: 42,
    lightLuxMin: 900,
    temperatureMax: 29
  });

  assert.strictEqual(result.source, "mock");
  assert.strictEqual(result.usedFallback, true);
  assert.strictEqual(result.message, "阈值已保存本地，后端已回退");
  assert.strictEqual(result.data.soilMoisture.min, 42);
  assert.strictEqual(localState.getBackendApiEnabled(), false);
}

async function testCommandFallbackMessage() {
  resetStorage();
  installFailingWxMock();
  localState.setBackendApiEnabled(true);

  const result = await dataSource.sendWaterCommand(dataSource.DEFAULT_DEVICE_ID, 6);

  assert.strictEqual(result.source, "mock");
  assert.strictEqual(result.usedFallback, true);
  assert.strictEqual(result.message, "命令已本地模拟，后端已回退");
  assert.strictEqual(result.data.type, "watering");
  assert.strictEqual(result.data.durationSeconds, 6);
  assert.strictEqual(localState.getBackendApiEnabled(), false);
}

async function testDiagnosisFallbackMessage() {
  resetStorage();
  installFailingWxMock();
  localState.setBackendApiEnabled(true);

  const result = await dataSource.diagnosePlant("叶子发黄怎么办");

  assert.strictEqual(result.source, "mock");
  assert.strictEqual(result.usedFallback, true);
  assert.strictEqual(result.message, "问诊接口未连接，已回退");
  assert.strictEqual(result.data.source, "local-rule");
  assert.strictEqual(localState.getBackendApiEnabled(), false);
}

async function run() {
  await testMockDataByDefault();
  await testBackendDashboardSuccess();
  await testBackendFailureFallback();
  await testBackendHealthFailureMessage();
  await testThresholdFallbackMessage();
  await testCommandFallbackMessage();
  await testDiagnosisFallbackMessage();
  console.log("data-source integration check passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
