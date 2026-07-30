---
title: XServer / Go
slug: go-xserver
summary: 使用 Go 与 Gin 实现的静态资源服务，提供目录校验、局域网地址发现与请求级日志。
category: 开发工具
year: 2026
order: 5
status: Stable
accent: #68d4e8
stack: [Go 1.26, Gin, Zerolog, UUID]
featured: false
repo: https://github.com/X-Lucifer/go-xserver
demo:
---

## 项目概述

XServer / Go 是静态资源服务的 Go 实现，面向本地开发、局域网联调和前端构建产物验收。程序默认在 `22345` 端口托管当前目录，也可以通过命令行参数切换端口与服务根目录。

```powershell
.\xserver -p 12345 -d dist
```

## 已实现的服务能力

- 使用 `-p` 与 `-d` 配置端口和静态目录
- 校验端口数值及 `1000–65535` 范围，非法输入回落到默认端口
- 将目标目录转换为绝对路径，并在启动前校验存在性与目录类型
- 枚举本机 IPv4 与 IPv6 地址，过滤链路本地地址并去重
- 以 Gin Recovery 中间件隔离未处理异常
- 禁用受信代理推断，避免本地工具错误接受代理来源
- 每个请求生成 UUID，并写入 `X-Request-Id` 和 `Server` 响应头
- 使用 Zerolog 记录请求头、响应头、状态码与执行耗时
- 静态目录不开放文件列表

## 技术架构

项目基于 **Go 1.26、Gin、Zerolog 与 Google UUID**。标准库 `flag` 负责命令行输入，`net.Interfaces` 用于发现局域网访问地址，`filepath` 与 `os.Stat` 负责路径标准化和启动前校验。

请求与响应日志集中在 Gin 中间件：日志上下文以 Request ID 关联，先记录来源、方法、URL 与内容长度，处理完成后补充状态、响应头和耗时。服务运行在 Gin Release Mode，并监听所有网络接口。

## 构建与交付

仓库保持单入口结构，可直接通过 `go build` 生成独立可执行文件。Windows 图标、版本与应用元数据由 `go-winres` 和预生成 `.syso` 资源注入，适合在不部署额外运行时的环境中携带使用。

## 适用场景与边界

当前配置面仅包含端口与目录，不提供 TLS、身份认证、缓存策略、内容压缩或客户端路由回退。它更适合作为受信开发环境中的静态资源工具；公网部署应由 Nginx 等前置服务承担 HTTPS 与安全控制。

## Rust 对照实现

[Rust 版本](https://github.com/X-Lucifer/rust-xserver) 使用 Actix Web、Clap 与 Tracing，并额外支持显式 `--host` 绑定和 `RUST_LOG` 过滤。两套实现保持一致的核心职责，同时保留各自语言生态的工程习惯。
