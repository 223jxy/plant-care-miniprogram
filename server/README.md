# 绿小护后端服务草案

这个目录是后端接口的起点，当前提供本地模拟接口，不包含真实数据库、微信密钥、MQTT 密钥或 AI Key。

## 当前本地模拟接口

- 健康检查：`GET /health`
- 设备列表：`GET /api/devices`
- 设备详情：`GET /api/devices/demo-plant-001`
- 最新遥测：`GET /api/devices/demo-plant-001/telemetry/latest`
- 成长日记：`GET /api/devices/demo-plant-001/diary`
- 阈值读取：`GET /api/devices/demo-plant-001/thresholds`
- 阈值保存：`POST /api/devices/demo-plant-001/thresholds`
- 命令发送：`POST /api/devices/demo-plant-001/commands`
- AI 问诊模拟：`POST /api/diagnosis`

## 启动与检查

```powershell
npm.cmd run check
npm.cmd run test:integration
npm.cmd start
```

`test:integration` 会使用随机本地端口启动一次临时服务，自动检查健康、设备、遥测、阈值保存、命令和问诊接口，检查完成后自动关闭服务。

启动后可在浏览器访问：

```text
http://localhost:3000/health
http://localhost:3000/api/devices
http://localhost:3000/api/devices/demo-plant-001/telemetry/latest
```

## 后续需要接入的能力

- 微信登录：`POST /api/auth/wechat/login`
- 真实数据库存储设备、遥测、阈值和日记。
- 真实 MQTT/BLE/设备控制通道。
- 真实 AI 服务，只能通过后端环境变量读取密钥。

## 新人注意

真实 AppSecret、数据库密码、MQTT 密码、豆包 API Key 都只能放在服务器环境变量里，不能写进小程序前端代码。
