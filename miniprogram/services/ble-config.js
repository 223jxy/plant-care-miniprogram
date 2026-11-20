const BLE_CONFIG = {
  serviceUuid: "0000A001-0000-1000-8000-00805F9B34FB",
  writeCharacteristicUuid: "0000A002-0000-1000-8000-00805F9B34FB",
  notifyCharacteristicUuid: "0000A003-0000-1000-8000-00805F9B34FB",
  deviceNamePrefix: "GXH"
};

function buildProvisionPayload(options) {
  const payload = {
    v: 1,
    ssid: options.ssid || "",
    password: options.password || "",
    provision_token: options.provisionToken || "",
    user_hint: options.userHint || "",
    ts: options.ts || Math.floor(Date.now() / 1000)
  };

  return payload;
}

function maskProvisionPayload(payload) {
  return {
    v: payload.v,
    ssid: payload.ssid,
    provision_token: payload.provision_token,
    user_hint: payload.user_hint,
    ts: payload.ts,
    password: payload.password ? "******" : ""
  };
}

module.exports = {
  BLE_CONFIG,
  buildProvisionPayload,
  maskProvisionPayload
};
