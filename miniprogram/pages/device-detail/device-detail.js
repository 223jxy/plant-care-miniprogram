Page({
  data: {
    device: {
      id: "demo-plant-001",
      sn: "GXH-20260708-001",
      name: "办公桌小绿萝",
      plantType: "绿萝",
      spaceName: "办公室",
      firmwareVersion: "0.1.0",
      onlineText: "在线"
    },
    lastSeenText: "2026-07-09 00:00",
    thresholdRows: [
      { label: "土壤湿度", value: "35% - 75%" },
      { label: "光照", value: "800 - 4000 lux" },
      { label: "温度", value: "18℃ - 30℃" }
    ]
  },

  onLoad() {
    console.log("设备详情页加载完成");
  }
});
