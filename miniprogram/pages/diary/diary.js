const { getDiaryEntries, showFallbackToast } = require("../../services/data-source");
const { formatTime } = require("../../utils/format");

Page({
  data: {
    entries: [
      {
        id: "diary-001",
        eventName: "健康提升",
        eventIcon: "新",
        displayTime: "2026-07-09 00:00",
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
        eventName: "完成浇水",
        eventIcon: "水",
        displayTime: "2026-07-08 00:00",
        content: "收到一次手动浇水指令，水泵运行 5 秒。",
        snapshot: {
          soilMoisture: 38,
          lightLux: 980,
          healthScore: 82
        },
        imageUrl: ""
      }
    ],
    dataSourceNotice: "",
    selectedEntry: null
  },

  onLoad() {
    this.refreshEntries();
  },

  onShow() {
    this.refreshEntries();
  },

  refreshEntries() {
    getDiaryEntries().then((result) => {
      const entries = result.data.map(buildDiaryView);

      this.setData({
        entries,
        dataSourceNotice: result.usedFallback ? result.message : "",
        selectedEntry: this.data.selectedEntry
          ? entries.find((entry) => entry.id === this.data.selectedEntry.id) || null
          : null
      });
      showFallbackToast(result);
    });
  },

  onDiaryTap(event) {
    const id = event.currentTarget.dataset.id;
    const selectedEntry = this.data.entries.find((entry) => entry.id === id);

    this.setData({
      selectedEntry
    });
  },

  onPreviewImage() {
    if (!this.data.selectedEntry || !this.data.selectedEntry.imageUrl) {
      if (typeof wx !== "undefined" && wx.showToast) {
        wx.showToast({
          title: "当前记录暂无照片",
          icon: "none"
        });
      }
      return;
    }

    wx.previewImage({
      urls: [this.data.selectedEntry.imageUrl]
    });
  }
});

function buildDiaryView(entry) {
  const hasImage = Boolean(entry.imageUrl);

  return {
    ...entry,
    eventIcon: entry.eventType === "watering" ? "水" : "新",
    displayTime: formatTime(entry.createdAt),
    hasImage,
    photoTitle: hasImage ? "植物照片" : "暂无照片",
    photoHint: hasImage ? "点击下方按钮查看原图。" : "真实摄像头接入后，这里会显示本次记录的植物缩略图。",
    previewButtonText: hasImage ? "查看照片" : "暂无照片可预览"
  };
}
