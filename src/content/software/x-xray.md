---
title: XXray
slug: x-xray
summary: 基于 Avalonia 与 xray-core 的 VLESS 桌面客户端，将节点、订阅、智能分流与连接状态集中到一个清晰的工作台。
category: 网络工具
year: 2026
order: 0
status: Active
accent: #65b18d
stack: [C# / .NET 10, Avalonia 12, xray-core]
featured: true
repo: https://github.com/X-Lucifer/X-Xray
seoTitle: XXray — VLESS 桌面客户端与节点订阅管理 | X.LUCIFER
seoDescription: XXray 是基于 .NET 10、Avalonia 与 xray-core 的 VLESS 桌面客户端，支持节点与订阅管理、智能分流、HTTP/SOCKS5 代理、测速、流量统计和内核更新，提供石墨与雾白主题及 Windows 安装包。
keywords: [XXray, X-Xray, VLESS 客户端, xray-core, 节点订阅管理, 智能分流, Avalonia]
languages: [C#]
platforms: [Windows 10 x64, Windows 11 x64]
appCategory: UtilitiesApplication
features: [VLESS 节点与订阅管理, HTTP / SOCKS5 代理, 智能分流与路由编辑, TCP 与真实代理测速, 实时流量统计, 内核与 GeoData 更新, 石墨与雾白主题]
---

## XXray 是什么

XXray 是基于 .NET 10、Avalonia 与 xray-core 的 VLESS 桌面客户端。它把连接总览、节点库、订阅、分流规则、测速与日志整合到同一个工作台，适合需要管理多个节点、订阅和本地代理配置的桌面使用场景。

应用负责配置管理与桌面交互，实际网络连接由 xray-core 执行。使用时需要准备可用的 VLESS 节点或订阅；客户端本身不提供节点服务。

## 连接与节点管理

- **连接总览**：查看当前节点、连接状态、内核和网络环境，按分组选择节点并启动或断开连接。
- **节点库**：导入、创建、编辑、复制与删除 VLESS 节点，支持分组、搜索、重复节点识别和批量操作。
- **订阅管理**：导入明文或 Base64 编码的 VLESS 列表，配置更新间隔、User-Agent 和自定义请求头，查看更新时间与错误。
- **分享与二维码**：复制完整 VLESS 链接、生成二维码，并从图片或剪贴板导入节点。
- **传输与安全参数**：配置 RAW、XHTTP、gRPC、WebSocket 等传输，以及兼容的 TLS、REALITY 与高级 JSON 参数。

### 本地代理与运行反馈

支持独立的 HTTP / SOCKS5 入站端口、回环监听与局域网访问；局域网入站可配置账号密码认证。Windows 系统代理在连通性探测通过后接管，并在断开、退出或内核异常退出时尝试恢复原设置。

单节点与批量 TCP 测速用于比较连接延迟，真实代理测速通过独立内核验证代理链路。总览展示上传与下载速率、累计流量和趋势曲线，日志支持筛选、复制与导出。

## 分流、内核与设置

| 功能 | 说明 |
| --- | --- |
| 路由预设 | 智能分流、全局代理与 GFWList，可恢复默认规则 |
| 分流编辑 | 代理／直连／阻断分别管理域名与 IP，支持 GeoData 标签补全 |
| 完整路由 | 使用 JSON 编辑有序规则、组合匹配、负载均衡与高级配置 |
| 内核管理 | 检测内核版本、下载匹配平台的内核、校验文件并提供更新备份 |
| GeoData | 手动或定时更新 GeoIP / GeoSite，支持默认与自定义来源 |
| 备份恢复 | 导入、导出节点、分组、订阅、网络设置和完整路由 |
| 桌面设置 | 托盘操作、启动隐藏、关闭到托盘、Windows 自启动及连接设置 |

Windows 下的敏感字段使用当前用户加密。节点、订阅、设置与日志保存在当前用户的数据目录中。

## 运行预览

### 石墨总览

![XXray 石墨主题：连接总览、节点选择与实时流量](../../previews/x-xray/overview-dark.png)

### 雾白总览

![XXray 雾白主题：连接工作台与网络状态](../../previews/x-xray/overview-light.png)

### 节点库与分流规则

![XXray 节点库：节点检索、分组、测速与批量管理](../../previews/x-xray/profiles-light.png)

![XXray 完整路由编辑器：有序分流规则与高级匹配](../../previews/x-xray/routing-ordered-dark.png)

## 安装与使用

Windows 安装包面向 Windows 10／11 x64，采用无边框窗口和石墨／雾白主题。客户端以自包含单文件方式发布，无需单独安装 .NET；默认仅为当前用户安装，可选择安装目录和桌面快捷方式。

1. 安装并启动 XXray，在设置中准备 xray-core 与 GeoData；默认安装包可在首次使用时下载内核。
2. 导入 VLESS 链接或订阅，选择需要使用的节点。
3. 按需设置入站端口、DNS 和分流规则，运行测速后启动连接。

升级保留已有安装位置，卸载保留个人节点、订阅和设置。需要离线分发时，可在构建安装包时加入完整的 Windows x64 内核文件组。

## 从源码构建

准备 .NET 10 SDK，在项目根目录执行：

```powershell
dotnet build XXray.slnx -c Release -p:AvaloniaBuildServicesEnabled=false
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-installer.ps1
```

安装包脚本自动读取实际版本、生成 NSIS 文件清单与主题资源，再构建安装程序。打包需要 NSIS 3 Unicode 和 Visual Studio C++ Build Tools。完整功能与构建选项见 [项目源码](https://github.com/X-Lucifer/X-Xray) 和 [安装包说明](https://github.com/X-Lucifer/X-Xray/blob/master/installer/README.md)。
