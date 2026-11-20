const assert = require("assert");
const http = require("http");

const { demoDevice, server } = require("../src/app");

function requestJson(port, method, pathname, body) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port,
        method,
        path: pathname,
        headers: body === undefined ? {} : { "Content-Type": "application/json" }
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
        });
        response.on("end", () => {
          try {
            resolve({
              statusCode: response.statusCode,
              body: raw ? JSON.parse(raw) : {}
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    if (body !== undefined) {
      request.write(JSON.stringify(body));
    }
    request.end();
  });
}

function closeServer() {
  if (!server.listening) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function run() {
  const originalThresholds = JSON.parse(JSON.stringify(demoDevice.thresholds));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  try {
    const health = await requestJson(port, "GET", "/health");
    assert.strictEqual(health.statusCode, 200);
    assert.strictEqual(health.body.ok, true);

    const devices = await requestJson(port, "GET", "/api/devices");
    assert.strictEqual(devices.statusCode, 200);
    assert.strictEqual(devices.body.data[0].id, demoDevice.id);

    const telemetry = await requestJson(
      port,
      "GET",
      `/api/devices/${demoDevice.id}/telemetry/latest`
    );
    assert.strictEqual(telemetry.statusCode, 200);
    assert.strictEqual(telemetry.body.data.deviceId, demoDevice.id);

    const thresholds = await requestJson(
      port,
      "POST",
      `/api/devices/${demoDevice.id}/thresholds`,
      { thresholds: { soilMoisture: { min: 38, max: 72 } } }
    );
    assert.strictEqual(thresholds.statusCode, 200);
    assert.strictEqual(thresholds.body.data.soilMoisture.min, 38);

    const command = await requestJson(
      port,
      "POST",
      `/api/devices/${demoDevice.id}/commands`,
      { type: "watering", durationSeconds: 5 }
    );
    assert.strictEqual(command.statusCode, 200);
    assert.strictEqual(command.body.data.type, "watering");

    const diagnosis = await requestJson(port, "POST", "/api/diagnosis", {
      question: "叶子发黄怎么办"
    });
    assert.strictEqual(diagnosis.statusCode, 200);
    assert.ok(diagnosis.body.data.answer);

    console.log("server HTTP integration check passed");
  } finally {
    demoDevice.thresholds = originalThresholds;
    await closeServer();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
