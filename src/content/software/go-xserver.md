---
title: XServer / Go
slug: go-xserver
summary: 使用 Go 与 Gin 实现的静态资源服务，提供目录校验、局域网地址发现与请求级日志。
category: 开发工具
year: 2026
order: 5
status: Stable
accent: #7bcbd8
stack: [Go 1.26, Gin, Zerolog, UUID]
featured: false
repo: https://github.com/X-Lucifer/go-xserver
demo:
seoTitle: XServer Go — Gin 静态文件服务器与局域网预览 | X.LUCIFER
seoDescription: XServer Go 使用 Go 与 Gin 提供静态文件服务，支持自定义端口、目录校验、局域网地址发现和 Zerolog 请求日志，并禁用目录列表。查看命令参数、构建步骤及前端页面预览的适用范围。
keywords: [XServer Go, Go 静态文件服务器, Gin, 局域网预览, 前端静态资源, Zerolog]
languages: [Go]
platforms: [Windows, Linux, macOS]
appCategory: DeveloperApplication
features: [静态文件目录服务, 自定义端口与目录, 禁用目录列表, 局域网地址发现, 请求 ID 与请求日志, Windows 应用资源]
---

## XServer Go 是什么

XServer Go 是基于 Go 和 Gin 的命令行静态文件服务器，用于将本地目录快速提供为 HTTP 站点。它适合前端构建结果预览、局域网页面演示和静态资源检查，构建后可直接运行，无需安装 Go 开发工具链。

项目把目录与端口校验、访问地址发现、请求日志和 Windows 应用资源封装在一个小型服务入口中，便于开发环境使用和二次扩展。

## 静态服务功能

- **指定目录作为站点根目录**：解析绝对路径，检查目标是否存在及是否为目录，再交给 Gin 静态文件处理器。
- **禁用目录列表**：使用 `gin.Dir(path, false)`，没有索引页时不自动展示目录内容。
- **端口检查**：默认使用 `22345`，接受 1000–65535 的端口；无效、非数字或越界配置会警告并使用默认端口。
- **局域网访问地址**：枚举网络接口，输出去重后的访问 URL，过滤链路本地地址并规范格式化 IPv6 地址。
- **请求追踪**：每个请求生成 UUID，响应带有 `X-Request-Id` 和 `Server: xserver`，便于定位具体访问。

## 请求日志与异常恢复

服务使用 Zerolog 记录请求方法、URL、请求头、响应头、状态码与处理耗时。Gin Recovery 中间件处理请求中的 panic，避免单个处理异常直接终止整个服务。

项目关闭可信代理自动配置，客户端地址读取不依赖默认信任所有代理的行为。日志包含完整请求头，实际部署时应按所处理的数据管理日志访问和保存范围。

## 命令行参数

| 参数 | 默认值 | 用途 |
| --- | --- | --- |
| `-p` | `22345` | HTTP 监听端口 |
| `-d` | `.` | 静态资源目录 |
| `-h` | — | 显示帮助信息 |

从仓库目录构建并启动：

```bash
go build -o xserver .
./xserver -p 8080 -d ./dist
```

Windows 可构建为 `xserver.exe` 后运行。服务按 `:端口` 监听，局域网设备可通过启动日志中的地址访问；是否能访问还取决于本机网络和防火墙配置。

## 工程实现

项目使用 Go 1.26、Gin、Zerolog 与 UUID。命令行入口依次完成帮助处理、参数读取、路径检查、路由与中间件初始化，最后启动 HTTP 监听。

Windows 版本通过 `go-winres` 生成资源文件，将图标与版本信息嵌入可执行程序。其他平台按对应 Go 构建目标输出程序。

Go 版使用 Gin 的静态路由和标准命令行参数处理，监听地址由服务入口确定。需要通过 `--host` 指定监听地址时，可使用 [Rust 版 XServer](../rust-xserver/)。

## 使用范围与限制

静态目录中的页面和资源可直接访问，未知路径不会统一回退到根 `index.html`。采用 History 路由的 SPA 应另外配置回退服务；SSG 页面需确保发布了对应的目录首页。

XServer Go 不包含动态业务接口、账号管理或 TLS 证书管理。它适合作为开发工具或受控环境中的静态服务组件。源码与 Windows 资源构建说明见 [项目 README](https://github.com/X-Lucifer/go-xserver#readme)。
