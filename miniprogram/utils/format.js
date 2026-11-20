const METRIC_LABELS = {
  temperature: "温度",
  humidity: "空气湿度",
  lightLux: "光照",
  soilMoisture: "土壤湿度",
  soilPh: "土壤 pH",
  soilEc: "EC 电导率",
  battery: "电量",
  rssi: "信号"
};

const METRIC_UNITS = {
  temperature: "℃",
  humidity: "%",
  lightLux: "lux",
  soilMoisture: "%",
  soilPh: "",
  soilEc: "mS/cm",
  battery: "%",
  rssi: "dBm"
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }

  const number = Number(value);
  return number.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function formatMetric(metricKey, value) {
  const label = METRIC_LABELS[metricKey] || metricKey;
  const unit = METRIC_UNITS[metricKey] || "";
  const digitsMap = {
    temperature: 1,
    humidity: 1,
    soilPh: 1,
    soilEc: 2
  };
  const digits = digitsMap[metricKey] || 0;
  const formattedValue = formatNumber(value, digits);

  return {
    key: metricKey,
    label,
    value: formattedValue,
    unit,
    displayValue: unit ? `${formattedValue} ${unit}` : formattedValue
  };
}

function formatTime(unixSeconds) {
  if (!unixSeconds) {
    return "--";
  }

  const date = new Date(unixSeconds * 1000);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatFreshness(unixSeconds, nowSeconds) {
  if (!unixSeconds) {
    return "暂无数据";
  }

  const now = nowSeconds || Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - unixSeconds);

  if (diff < 60) {
    return "刚刚更新";
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)} 分钟前更新`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)} 小时前更新`;
  }
  return `${Math.floor(diff / 86400)} 天前更新`;
}

function formatCommandStatus(status) {
  const map = {
    created: "待发送",
    published: "已发送",
    accepted: "设备已接收",
    running: "执行中",
    succeeded: "执行成功",
    failed: "执行失败",
    timeout: "设备未响应"
  };

  return map[status] || "未知状态";
}

module.exports = {
  METRIC_LABELS,
  METRIC_UNITS,
  formatNumber,
  formatMetric,
  formatTime,
  formatFreshness,
  formatCommandStatus
};
