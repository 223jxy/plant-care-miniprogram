const { diagnosePlant, getDashboardData, showFallbackToast } = require("../../services/data-source");
const { formatMetric } = require("../../utils/format");

Page({
  data: {
    device: {
      name: "办公桌小绿萝"
    },
    contextMetrics: [
      { key: "soilMoisture", label: "土壤湿度", displayValue: "43 %" },
      { key: "lightLux", label: "光照", displayValue: "1,250 lux" },
      { key: "temperature", label: "温度", displayValue: "25.6 ℃" }
    ],
    dataSourceNotice: "",
    question: "",
    questionLength: 0,
    questionErrorText: "",
    isDiagnosing: false,
    diagnosisButtonText: "生成建议",
    diagnosisResult: null
  },

  onLoad() {
    this.refreshContextData();
  },

  refreshContextData() {
    getDashboardData().then((result) => {
      const device = result.data.device || this.data.device;
      const metrics = (result.data.telemetry && result.data.telemetry.metrics) || {};
      const contextMetrics = ["soilMoisture", "lightLux", "temperature"].map((key) => {
        return formatMetric(key, metrics[key]);
      });

      this.setData({
        device: {
          name: device.name
        },
        contextMetrics,
        dataSourceNotice: result.usedFallback ? result.message : ""
      });
      showFallbackToast(result);
    });
  },

  onQuestionInput(event) {
    const question = String(event.detail.value || "").slice(0, 120);
    const questionLength = question.length;

    this.setData({
      question,
      questionLength,
      questionErrorText: questionLength > 120 ? "问题描述不能超过 120 字" : ""
    });
  },

  onSubmitDiagnosis() {
    const question = this.data.question.trim();
    const validation = validateQuestion(question);

    if (!validation.valid) {
      this.setData({
        questionErrorText: validation.message
      });
      showToast(validation.message);
      return;
    }

    this.setData({
      isDiagnosing: true,
      diagnosisButtonText: "分析中",
      questionErrorText: "",
      diagnosisResult: null
    });

    diagnosePlant(question).then((result) => {
      this.setData({
        isDiagnosing: false,
        diagnosisButtonText: "生成建议",
        diagnosisResult: result.isBackend ? buildBackendAdvice(result.data) : buildLocalAdvice(question),
        dataSourceNotice: result.usedFallback ? result.message : ""
      });
      showFallbackToast(result);
    });
  }
});

function buildBackendAdvice(data) {
  const answer = data && data.answer ? data.answer : "后端已返回模拟问诊结果，请结合首页环境指标继续观察。";

  return {
    title: "本地后端模拟建议",
    reasons: [answer],
    actions: ["结合土壤湿度、光照和温度继续观察", "补充叶片、土壤或摆放位置描述后再问一次"]
  };
}

function buildLocalAdvice(question) {
  const hasYellowLeaf = question.includes("黄") || question.includes("发黄");
  const hasWater = question.includes("水") || question.includes("浇");

  if (hasYellowLeaf) {
    return {
      title: "可能是浇水、光照或肥力波动",
      reasons: ["先检查土壤是否长期偏湿或偏干", "避免突然强光直晒", "观察新叶是否继续发黄"],
      actions: ["保持土壤微湿但不积水", "移到明亮散射光位置", "连续 3 天观察土壤湿度变化"]
    };
  }

  if (hasWater) {
    return {
      title: "当前适合少量补水并观察",
      reasons: ["模拟数据中土壤湿度处于舒适区", "不建议一次浇太久"],
      actions: ["先手动浇水 3-5 秒", "30 分钟后再次观察土壤湿度", "若盆底积水请暂停浇水"]
    };
  }

  return {
    title: "建议先观察关键环境指标",
    reasons: ["当前土壤湿度、温度和光照会影响状态判断", "没有照片时诊断只能作为参考"],
    actions: ["补充叶片、土壤或摆放位置描述", "保持通风和散射光", "连续记录 2-3 天变化"]
  };
}

function validateQuestion(question) {
  if (!question) {
    return {
      valid: false,
      message: "请先输入问题"
    };
  }

  if (question.length < 4) {
    return {
      valid: false,
      message: "请至少输入 4 个字"
    };
  }

  if (question.length > 120) {
    return {
      valid: false,
      message: "问题描述不能超过 120 字"
    };
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
