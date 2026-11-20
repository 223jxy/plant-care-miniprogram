const {
  getDashboardData,
  saveThresholds,
  sendCaptureCommand,
  sendWaterCommand,
  showFallbackToast
} = require("../../services/data-source");
const { getOfflineDemo, getThresholdForm, setThresholdForm } = require("../../utils/local-state");

const WATER_DURATION_RANGE = {
  min: 1,
  max: 10
};

const THRESHOLD_LIMITS = {
  soilMoistureMin: {
    label: "土壤湿度下限",
    min: 20,
    max: 60
  },
  lightLuxMin: {
    label: "光照下限",
    min: 300,
    max: 2000
  },
  temperatureMax: {
    label: "温度上限",
    min: 25,
    max: 40
  }
};

Page({
  data: {
    device: {
      id: "demo-plant-001",
      name: "办公桌小绿萝",
      spaceName: "办公室",
      onlineText: "在线",
      onlineType: "online"
    },
    dataSourceNotice: "",
    isDeviceOffline: false,
    offlineNotice: "",
    durationSeconds: 5,
    waterErrorText: "",
    isSendingWater: false,
    waterButtonText: "立即浇水",
    waterCommandText: "等待操作",
    isTakingPhoto: false,
    cameraStateText: "就绪",
    captureButtonText: "手动拍照",
    cameraCommandText: "等待操作",
    thresholdForm: {
      soilMoistureMin: 35,
      lightLuxMin: 800,
      temperatureMax: 30
    },
    thresholdErrorText: "",
    thresholdSaveText: "尚未保存"
  },

  onLoad() {
    this.refreshDeviceDefaults();
  },

  onShow() {
    this.refreshDeviceDefaults();
  },

  refreshDeviceDefaults() {
    getDashboardData().then((result) => {
      this.renderDeviceDefaults(result.data.device, result);
      showFallbackToast(result);
    });
  },

  renderDeviceDefaults(device, result) {
    const thresholds = device.thresholds || {};
    const offlineDemo = getOfflineDemo();
    const isDeviceOnline = device.online && !offlineDemo;
    const defaultThresholdForm = {
      soilMoistureMin: thresholds.soilMoisture ? thresholds.soilMoisture.min : 35,
      lightLuxMin: thresholds.lightLux ? thresholds.lightLux.min : 800,
      temperatureMax: thresholds.temperature ? thresholds.temperature.max : 30
    };

    this.setData({
      device: {
        id: device.id,
        name: device.name,
        spaceName: device.spaceName,
        onlineText: isDeviceOnline ? "在线" : "离线",
        onlineType: isDeviceOnline ? "online" : "offline"
      },
      dataSourceNotice: result && result.usedFallback ? result.message : "",
      isDeviceOffline: !isDeviceOnline,
      offlineNotice: offlineDemo ? "离线演示已开启，暂时不能发送设备控制命令。" : "设备离线，暂时不能发送设备控制命令。",
      thresholdForm: getThresholdForm(defaultThresholdForm)
    });
  },

  onDurationChange(event) {
    const durationSeconds = normalizeNumber(event.detail.value, WATER_DURATION_RANGE.min);
    const checkedDuration = clampNumber(durationSeconds, WATER_DURATION_RANGE.min, WATER_DURATION_RANGE.max);

    this.setData({
      durationSeconds: checkedDuration,
      waterErrorText: checkedDuration === durationSeconds ? "" : "浇水时长已自动限制在 1-10 秒"
    });
  },

  onWaterTap() {
    const durationCheck = validateWaterDuration(this.data.durationSeconds);
    if (!durationCheck.valid) {
      this.setData({
        durationSeconds: durationCheck.value,
        waterErrorText: durationCheck.message,
        waterCommandText: "请先修正浇水时长"
      });
      showToast(durationCheck.message);
      return;
    }

    if (this.data.isDeviceOffline) {
      this.setData({
        waterCommandText: "设备离线，不能发送浇水命令"
      });

      if (typeof wx !== "undefined" && wx.showToast) {
        wx.showToast({
          title: "设备离线",
          icon: "none"
        });
      }
      return;
    }

    if (this.data.isSendingWater) {
      return;
    }

    this.setData({
      isSendingWater: true,
      waterErrorText: "",
      waterButtonText: "发送中",
      waterCommandText: `正在发送 ${this.data.durationSeconds} 秒浇水指令...`
    });

    sendWaterCommand(this.data.device.id, this.data.durationSeconds).then((result) => {
      const sourceText = result.isBackend ? "后端已接收" : "模拟执行成功";
      this.setData({
        isSendingWater: false,
        waterButtonText: "立即浇水",
        waterCommandText: `${sourceText}：水泵运行 ${this.data.durationSeconds} 秒`,
        dataSourceNotice: result.usedFallback ? result.message : ""
      });
      showFallbackToast(result);

      if (typeof wx !== "undefined" && wx.showToast) {
        wx.showToast({
          title: result.isBackend ? "后端已接收" : "指令已发送",
          icon: "success"
        });
      }
    });
  },

  onThresholdChange(event) {
    const key = event.currentTarget.dataset.key;
    const limit = THRESHOLD_LIMITS[key];
    const rawValue = normalizeNumber(event.detail.value, limit ? limit.min : 0);
    const value = limit ? clampNumber(rawValue, limit.min, limit.max) : rawValue;
    const thresholdForm = Object.assign({}, this.data.thresholdForm, {
      [key]: value
    });

    this.setData({
      thresholdForm,
      thresholdErrorText: value === rawValue ? "" : `${limit.label}已自动限制在允许范围内`,
      thresholdSaveText: "有未保存修改"
    });
  },

  onSaveThresholds() {
    const thresholdCheck = validateThresholdForm(this.data.thresholdForm);
    if (!thresholdCheck.valid) {
      this.setData({
        thresholdErrorText: thresholdCheck.message,
        thresholdSaveText: "请先修正阈值"
      });
      showToast(thresholdCheck.message);
      return;
    }

    setThresholdForm(this.data.thresholdForm);
    this.setData({
      thresholdErrorText: "",
      thresholdSaveText: "正在保存..."
    });

    saveThresholds(this.data.device.id, this.data.thresholdForm).then((result) => {
      this.setData({
        thresholdSaveText: result.isBackend ? "已保存到后端接口" : "已保存到本地模拟数据",
        dataSourceNotice: result.usedFallback ? result.message : ""
      });
      showFallbackToast(result);

      if (typeof wx !== "undefined" && wx.showToast) {
        wx.showToast({
          title: "阈值已保存",
          icon: "success"
        });
      }
    });
  },

  onCaptureTap() {
    if (this.data.isDeviceOffline) {
      this.setData({
        cameraCommandText: "设备离线，不能发送拍照命令"
      });

      if (typeof wx !== "undefined" && wx.showToast) {
        wx.showToast({
          title: "设备离线",
          icon: "none"
        });
      }
      return;
    }

    if (this.data.isTakingPhoto) {
      return;
    }

    this.setData({
      isTakingPhoto: true,
      cameraStateText: "请求中",
      captureButtonText: "拍照中",
      cameraCommandText: "正在请求设备拍照..."
    });

    sendCaptureCommand(this.data.device.id).then((result) => {
      const sourceText = result.isBackend ? "后端已接收" : "模拟拍照成功";
      this.setData({
        isTakingPhoto: false,
        cameraStateText: "就绪",
        captureButtonText: "手动拍照",
        cameraCommandText: `${sourceText}：缩略图将在日记中生成`,
        dataSourceNotice: result.usedFallback ? result.message : ""
      });
      showFallbackToast(result);

      if (typeof wx !== "undefined" && wx.showToast) {
        wx.showToast({
          title: result.isBackend ? "后端已接收" : "拍照指令已发送",
          icon: "success"
        });
      }
    });
  }
});

function normalizeNumber(value, fallbackValue) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallbackValue;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function validateWaterDuration(value) {
  const number = normalizeNumber(value, WATER_DURATION_RANGE.min);
  const checkedValue = clampNumber(number, WATER_DURATION_RANGE.min, WATER_DURATION_RANGE.max);

  if (number !== checkedValue) {
    return {
      valid: false,
      value: checkedValue,
      message: "浇水时长必须在 1-10 秒"
    };
  }

  return {
    valid: true,
    value: checkedValue,
    message: ""
  };
}

function validateThresholdForm(form) {
  const keys = Object.keys(THRESHOLD_LIMITS);

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const limit = THRESHOLD_LIMITS[key];
    const value = normalizeNumber(form[key], NaN);

    if (!Number.isFinite(value) || value < limit.min || value > limit.max) {
      return {
        valid: false,
        message: `${limit.label}必须在 ${limit.min}-${limit.max} 之间`
      };
    }
  }

  return {
    valid: true,
    message: ""
  };
}

function showToast(title) {
  if (typeof wx !== "undefined" && wx.showToast) {
    wx.showToast({
      title,
      icon: "none"
    });
  }
}
