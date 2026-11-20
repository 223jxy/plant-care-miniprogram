const SCORE_WEIGHTS = {
  soilMoisture: 35,
  lightLux: 20,
  temperature: 15,
  humidity: 10,
  soilPh: 10,
  soilEc: 10
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getMetricScore(value, range) {
  if (value === null || value === undefined || !range) {
    return 0.6;
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return 0.6;
  }

  const min = Number(range.min);
  const max = Number(range.max);
  if (number >= min && number <= max) {
    return 1;
  }

  const span = Math.max(1, max - min);
  const distance = number < min ? min - number : number - max;
  return clamp(1 - distance / span, 0, 1);
}

function calculateHealthScore(metrics, thresholds) {
  if (!metrics || !thresholds) {
    return 0;
  }

  const score = Object.keys(SCORE_WEIGHTS).reduce((total, key) => {
    const weight = SCORE_WEIGHTS[key];
    const metricScore = getMetricScore(metrics[key], thresholds[key]);
    return total + weight * metricScore;
  }, 0);

  return Math.round(clamp(score, 0, 100));
}

function getHealthLevel(score) {
  if (score >= 85) {
    return {
      text: "状态很好",
      type: "success"
    };
  }
  if (score >= 70) {
    return {
      text: "基本健康",
      type: "normal"
    };
  }
  if (score >= 50) {
    return {
      text: "需要关注",
      type: "warning"
    };
  }
  return {
    text: "风险较高",
    type: "danger"
  };
}

function evaluateMetricStatus(value, range) {
  if (value === null || value === undefined || !range) {
    return {
      text: "暂无",
      type: "muted"
    };
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return {
      text: "暂无",
      type: "muted"
    };
  }

  if (number < Number(range.min)) {
    return {
      text: "偏低",
      type: "warning"
    };
  }

  if (number > Number(range.max)) {
    return {
      text: "偏高",
      type: "warning"
    };
  }

  return {
    text: "适宜",
    type: "success"
  };
}

function buildMetricStatuses(metrics, thresholds) {
  if (!metrics || !thresholds) {
    return {};
  }

  return Object.keys(thresholds).reduce((result, key) => {
    result[key] = evaluateMetricStatus(metrics[key], thresholds[key]);
    return result;
  }, {});
}

module.exports = {
  SCORE_WEIGHTS,
  calculateHealthScore,
  getHealthLevel,
  evaluateMetricStatus,
  buildMetricStatuses
};
