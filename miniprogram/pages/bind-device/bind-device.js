Page({
  data: {
    isScanning: false,
    scanButtonText: "搜索设备",
    foundDevice: null,
    bindStep: "idle",
    bindMessage: "请让设备进入配网模式，然后开始搜索。"
  },

  onStartScan() {
    if (this.data.isScanning) {
      return;
    }

    this.setData({
      isScanning: true,
      scanButtonText: "搜索中",
      foundDevice: null,
      bindStep: "scanning",
      bindMessage: "正在搜索附近的绿小护设备..."
    });

    setTimeout(() => {
      this.setData({
        isScanning: false,
        scanButtonText: "搜索设备",
        foundDevice: {
          name: "绿小护设备 GXH-001",
          rssi: -58
        },
        bindStep: "found",
        bindMessage: "发现设备，可以开始模拟配网。"
      });
    }, 700);
  },

  onBindFoundDevice() {
    if (!this.data.foundDevice) {
      return;
    }

    this.setData({
      bindStep: "provisioning",
      bindMessage: "正在模拟写入 WiFi 信息..."
    });

    setTimeout(() => {
      this.setData({
        bindStep: "success",
        bindMessage: "模拟绑定成功，真实版本会等待设备 MQTT 上线确认。"
      });
    }, 800);
  }
});
