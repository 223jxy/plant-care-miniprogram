const { getDashboardData, showFallbackToast } = require("../../services/data-source");
const { getOfflineDemo } = require("../../utils/local-state");
const { formatFreshness, formatMetric } = require("../../utils/format");
const { buildMetricStatuses, calculateHealthScore, getHealthLevel } = require("../../utils/plant-rules");

const METRIC_ORDER = [
  "temperature",
  "humidity",
  "lightLux",
  "soilMoisture",
  "soilPh",
  "soilEc",
  "battery",
  "rssi"
];

Page({
  data: {
    device: {
      name: "办公桌小绿萝",
      spaceName: "办公室",
      onlineText: "在线",
      onlineType: "online"
    },
    healthScore: 88,
    healthLevel: {
      text: "状态很好",
      type: "success"
    },
    dataSourceNotice: "",
    isDeviceOffline: false,
    offlineNotice: "",
    freshness: "刚刚更新",
    metricCards: [
      { key: "temperature", label: "温度", value: "25.6", unit: "℃", status: { text: "适宜", type: "success" } },
      { key: "humidity", label: "空气湿度", value: "58.2", unit: "%", status: { text: "适宜", type: "success" } },
      { key: "lightLux", label: "光照", value: "1,250", unit: "lux", status: { text: "适宜", type: "success" } },
      { key: "soilMoisture", label: "土壤湿度", value: "43", unit: "%", status: { text: "适宜", type: "success" } },
      { key: "soilPh", label: "土壤 pH", value: "6.4", unit: "", status: { text: "适宜", type: "success" } },
      { key: "soilEc", label: "EC 电导率", value: "1.21", unit: "mS/cm", status: { text: "适宜", type: "success" } },
      { key: "battery", label: "电量", value: "86", unit: "%", status: { text: "充足", type: "success" } },
      { key: "rssi", label: "信号", value: "-61", unit: "dBm", status: { text: "稳定", type: "success" } }
    ]
  },

  onLoad() {
    this.refreshDashboard();
  },

  onShow() {
    this.refreshDashboard();
  },

  refreshDashboard() {
    getDashboardData().then((result) => {
      this.renderDashboard(result.data.device, result.data.telemetry, result);
      showFallbackToast(result);
    });
  },

  renderDashboard(device, telemetry, result) {
    const offlineDemo = getOfflineDemo();
    const isDeviceOnline = device.online && !offlineDemo;
    const metrics = telemetry.metrics || {};
    const thresholds = device.thresholds || {};
    const statuses = buildMetricStatuses(metrics, thresholds);
    const healthScore = calculateHealthScore(metrics, thresholds);
    const metricCards = METRIC_ORDER.map((key) => {
      const metric = formatMetric(key, metrics[key]);
      const fallbackStatus = !isDeviceOnline
        ? { text: "离线", type: "muted" }
        : key === "battery"
        ? { text: "充足", type: "success" }
        : { text: "稳定", type: "success" };

      return {
        ...metric,
        status: isDeviceOnline ? statuses[key] || fallbackStatus : fallbackStatus
      };
    });

    this.setData({
      device: {
        ...device,
        onlineText: isDeviceOnline ? "在线" : "离线",
        onlineType: isDeviceOnline ? "online" : "offline"
      },
      healthScore,
      healthLevel: isDeviceOnline ? getHealthLevel(healthScore) : { text: "离线观察", type: "muted" },
      dataSourceNotice: result && result.usedFallback ? result.message : "",
      isDeviceOffline: !isDeviceOnline,
      offlineNotice: offlineDemo ? "离线演示已开启，当前显示上次同步数据。" : "设备离线，当前显示上次同步数据。",
      freshness: isDeviceOnline ? formatFreshness(telemetry.ts) : "上次同步数据",
      metricCards
    });
  },

  onGoDiagnosis() {
    if (typeof wx !== "undefined" && wx.navigateTo) {
      wx.navigateTo({
        url: "/pages/diagnosis/diagnosis"
      });
    }
  }
});
