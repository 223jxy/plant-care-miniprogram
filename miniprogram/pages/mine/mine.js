const { checkBackendHealth, getDevices, showFallbackToast } = require("../../services/data-source");
const {
  getBackendApiEnabled,
  getNotificationEnabled,
  getOfflineDemo,
  setBackendApiEnabled,
  setNotificationEnabled,
  setOfflineDemo
} = require("../../utils/local-state");

Page({
  data: {
    user: {
      nickname: "体验用户",
      role: "绿小护内测"
    },
    deviceCount: 0,
    devices: [
      {
        id: "demo-plant-001",
        name: "办公桌小绿萝",
        plantType: "绿萝",
        spaceName: "办公室",
        onlineText: "在线"
      }
    ],
    backendApiEnabled: false,
    dataSourceText: "本地模拟数据",
    isCheckingBackend: false,
    notificationEnabled: true,
    offlineDemoEnabled: false,
    exportText: "未导出"
  },

  onLoad() {
    this.refreshSettings();
    this.refreshDevices();
  },

  onShow() {
    this.refreshSettings();
    this.refreshDevices();
  },

  refreshSettings() {
    const backendApiEnabled = getBackendApiEnabled();

    this.setData({
      backendApiEnabled,
      dataSourceText: backendApiEnabled ? "本地后端接口" : "本地模拟数据",
      notificationEnabled: getNotificationEnabled()
    });
  },

  refreshDevices() {
    const offlineDemoEnabled = getOfflineDemo();
    getDevices().then((result) => {
      const devices = result.data.map((device) => ({
        id: device.id,
        name: device.name,
        plantType: device.plantType,
        spaceName: device.spaceName,
        onlineText: device.online && !offlineDemoEnabled ? "在线" : "离线",
        onlineType: device.online && !offlineDemoEnabled ? "online" : "offline"
      }));

      this.setData({
        devices,
        deviceCount: devices.length,
        offlineDemoEnabled
      });
      this.refreshSettings();
      showFallbackToast(result);
    });
  },

  onGoDeviceDetail(event) {
    const id = event.currentTarget.dataset.id;
    if (typeof wx !== "undefined" && wx.navigateTo) {
      wx.navigateTo({
        url: `/pages/device-detail/device-detail?id=${id}`
      });
    }
  },

  onGoBindDevice() {
    if (typeof wx !== "undefined" && wx.navigateTo) {
      wx.navigateTo({
        url: "/pages/bind-device/bind-device"
      });
    }
  },

  onNotificationChange(event) {
    const notificationEnabled = Boolean(event.detail.value);
    setNotificationEnabled(notificationEnabled);

    this.setData({
      notificationEnabled
    });

    if (typeof wx !== "undefined" && wx.showToast) {
      wx.showToast({
        title: notificationEnabled ? "已开启提醒" : "已关闭提醒",
        icon: "none"
      });
    }
  },

  onOfflineDemoChange(event) {
    const offlineDemoEnabled = Boolean(event.detail.value);
    setOfflineDemo(offlineDemoEnabled);

    this.setData({
      offlineDemoEnabled
    });
    this.refreshDevices();

    if (typeof wx !== "undefined" && wx.showToast) {
      wx.showToast({
        title: offlineDemoEnabled ? "已开启离线演示" : "已关闭离线演示",
        icon: "none"
      });
    }
  },

  onBackendApiChange(event) {
    const backendApiEnabled = Boolean(event.detail.value);
    setBackendApiEnabled(backendApiEnabled);

    this.setData({
      backendApiEnabled,
      dataSourceText: backendApiEnabled ? "正在检查本地后端..." : "本地模拟数据",
      isCheckingBackend: backendApiEnabled
    });

    if (!backendApiEnabled) {
      this.refreshDevices();
      showToast("已切回模拟数据");
      return;
    }

    checkBackendHealth().then((result) => {
      showFallbackToast(result);
      this.setData({
        isCheckingBackend: false
      });
      this.refreshSettings();
      this.refreshDevices();
      showToast(result.usedFallback ? "后端未启动" : "已连接后端接口");
    });
  },

  onExportData() {
    this.setData({
      exportText: "模拟导出成功：后续由后端生成 CSV"
    });

    if (typeof wx !== "undefined" && wx.showToast) {
      wx.showToast({
        title: "导出请求已创建",
        icon: "success"
      });
    }
  }
});

function showToast(title) {
  if (typeof wx !== "undefined" && wx.showToast) {
    wx.showToast({
      title,
      icon: "none"
    });
  }
}
