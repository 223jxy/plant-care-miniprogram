const MQTT_TOPIC_TYPES = {
  telemetryUp: "telemetry/up",
  eventUp: "event/up",
  commandDown: "command/down",
  commandAck: "command/ack",
  shadowUpdate: "shadow/update"
};

const DEFAULT_PRODUCT_KEY = "green_guard";

function buildDeviceTopic(deviceId, type, productKey = DEFAULT_PRODUCT_KEY) {
  if (!deviceId) {
    throw new Error("deviceId 不能为空");
  }
  if (!MQTT_TOPIC_TYPES[type]) {
    throw new Error(`未知 MQTT 主题类型：${type}`);
  }

  return `plants/${productKey}/${deviceId}/${MQTT_TOPIC_TYPES[type]}`;
}

function buildTopicSet(deviceId, productKey = DEFAULT_PRODUCT_KEY) {
  return Object.keys(MQTT_TOPIC_TYPES).reduce((result, type) => {
    result[type] = buildDeviceTopic(deviceId, type, productKey);
    return result;
  }, {});
}

module.exports = {
  DEFAULT_PRODUCT_KEY,
  MQTT_TOPIC_TYPES,
  buildDeviceTopic,
  buildTopicSet
};
