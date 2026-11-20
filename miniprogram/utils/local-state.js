const STORAGE_KEYS = {
  backendApiEnabled: "gxh_backend_api_enabled",
  offlineDemo: "gxh_offline_demo",
  notificationEnabled: "gxh_notification_enabled",
  thresholdForm: "gxh_threshold_form"
};

const fallbackStore = {};

function hasStorageApi() {
  return typeof wx !== "undefined" && wx.getStorageSync && wx.setStorageSync;
}

function readValue(key, fallbackValue) {
  if (hasStorageApi()) {
    try {
      const value = wx.getStorageSync(key);
      if (value !== "" && value !== null && value !== undefined) {
        return value;
      }
    } catch (error) {
      console.warn("读取本地缓存失败", key, error);
    }
  }

  if (Object.prototype.hasOwnProperty.call(fallbackStore, key)) {
    return fallbackStore[key];
  }

  return fallbackValue;
}

function writeValue(key, value) {
  fallbackStore[key] = value;

  if (hasStorageApi()) {
    try {
      wx.setStorageSync(key, value);
    } catch (error) {
      console.warn("写入本地缓存失败", key, error);
    }
  }

  return value;
}

function readBoolean(key, fallbackValue) {
  const value = readValue(key, fallbackValue);

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return Boolean(fallbackValue);
}

function getOfflineDemo() {
  return readBoolean(STORAGE_KEYS.offlineDemo, false);
}

function setOfflineDemo(value) {
  return writeValue(STORAGE_KEYS.offlineDemo, Boolean(value));
}

function getBackendApiEnabled() {
  return readBoolean(STORAGE_KEYS.backendApiEnabled, false);
}

function setBackendApiEnabled(value) {
  return writeValue(STORAGE_KEYS.backendApiEnabled, Boolean(value));
}

function getNotificationEnabled() {
  return readBoolean(STORAGE_KEYS.notificationEnabled, true);
}

function setNotificationEnabled(value) {
  return writeValue(STORAGE_KEYS.notificationEnabled, Boolean(value));
}

function getThresholdForm(defaultForm) {
  const value = readValue(STORAGE_KEYS.thresholdForm, null);

  if (value && typeof value === "object") {
    return Object.assign({}, defaultForm, value);
  }

  return Object.assign({}, defaultForm);
}

function setThresholdForm(form) {
  return writeValue(STORAGE_KEYS.thresholdForm, Object.assign({}, form));
}

module.exports = {
  STORAGE_KEYS,
  readValue,
  writeValue,
  getBackendApiEnabled,
  setBackendApiEnabled,
  getOfflineDemo,
  setOfflineDemo,
  getNotificationEnabled,
  setNotificationEnabled,
  getThresholdForm,
  setThresholdForm
};
