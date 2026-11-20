const demoDevice = {
  id: "demo-plant-001",
  sn: "GXH-20260708-001",
  name: "办公桌小绿萝",
  plantType: "绿萝",
  spaceName: "办公室",
  firmwareVersion: "0.1.0",
  online: true,
  lastSeenAt: 1783526400,
  battery: 86,
  rssi: -61,
  thresholds: {
    soilMoisture: {
      min: 35,
      max: 75
    },
    lightLux: {
      min: 800,
      max: 4000
    },
    temperature: {
      min: 18,
      max: 30
    },
    humidity: {
      min: 40,
      max: 75
    },
    soilPh: {
      min: 5.8,
      max: 7.2
    },
    soilEc: {
      min: 0.8,
      max: 2.0
    }
  }
};

const latestTelemetry = {
  deviceId: "demo-plant-001",
  seq: 10245,
  ts: 1783526400,
  metrics: {
    temperature: 25.6,
    humidity: 58.2,
    lightLux: 1250,
    soilMoisture: 43,
    soilPh: 6.4,
    soilEc: 1.21,
    battery: 86,
    rssi: -61
  },
  status: {
    pump: "idle",
    camera: "ready"
  }
};

const diaryEntries = [
  {
    id: "diary-001",
    deviceId: "demo-plant-001",
    eventType: "health_up",
    eventName: "健康提升",
    createdAt: 1783526400,
    content: "今天土壤湿度回到舒适区，小绿萝精神看起来更好了。",
    snapshot: {
      soilMoisture: 43,
      lightLux: 1250,
      healthScore: 88
    },
    imageUrl: ""
  },
  {
    id: "diary-002",
    deviceId: "demo-plant-001",
    eventType: "watering",
    eventName: "完成浇水",
    createdAt: 1783440000,
    content: "收到一次手动浇水指令，水泵运行 5 秒。",
    snapshot: {
      soilMoisture: 38,
      lightLux: 980,
      healthScore: 82
    },
    imageUrl: ""
  }
];

const historyTelemetry = [
  { ts: 1783180800, soilMoisture: 36, lightLux: 900, temperature: 24.8 },
  { ts: 1783267200, soilMoisture: 39, lightLux: 1100, temperature: 25.1 },
  { ts: 1783353600, soilMoisture: 41, lightLux: 1500, temperature: 25.5 },
  { ts: 1783440000, soilMoisture: 38, lightLux: 980, temperature: 24.9 },
  { ts: 1783526400, soilMoisture: 43, lightLux: 1250, temperature: 25.6 }
];

function getMockDevice() {
  return demoDevice;
}

function getMockDevices() {
  return [demoDevice];
}

function getMockLatestTelemetry() {
  return latestTelemetry;
}

function getMockDiaryEntries() {
  return diaryEntries;
}

function getMockHistoryTelemetry() {
  return historyTelemetry;
}

module.exports = {
  getMockDevice,
  getMockDevices,
  getMockLatestTelemetry,
  getMockDiaryEntries,
  getMockHistoryTelemetry
};
