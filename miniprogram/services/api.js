const API_CONFIG = {
  baseUrl: "http://127.0.0.1:3000",
  timeout: 10000,
  endpoints: {
    login: "/api/auth/wechat/login",
    devices: "/api/devices",
    deviceDetail: "/api/devices/{id}",
    latest: "/api/devices/{id}/telemetry/latest",
    telemetry: "/api/devices/{id}/telemetry",
    command: "/api/devices/{id}/commands",
    thresholds: "/api/devices/{id}/thresholds",
    diaries: "/api/devices/{id}/diary",
    diagnosis: "/api/diagnosis",
    exportTelemetry: "/api/export/telemetry.csv"
  }
};

function buildUrl(path, params = {}) {
  const resolvedPath = Object.keys(params).reduce((result, key) => {
    return result.replace(`{${key}}`, encodeURIComponent(params[key]));
  }, path);

  return `${API_CONFIG.baseUrl}${resolvedPath}`;
}

function request(options) {
  if (typeof wx === "undefined" || !wx.request) {
    return Promise.reject(new Error("wx.request 只能在微信小程序环境中调用"));
  }

  return new Promise((resolve, reject) => {
    const requestOptions = Object.assign({}, options || {});
    requestOptions.timeout = API_CONFIG.timeout;
    requestOptions.success = function success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }
        reject(new Error(`请求失败：${response.statusCode}`));
      };
    requestOptions.fail = reject;
    wx.request(requestOptions);
  });
}

module.exports = {
  API_CONFIG,
  buildUrl,
  request
};
