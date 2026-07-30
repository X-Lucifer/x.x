---
title: XServer / Rust
slug: rust-xserver
summary: 基于 Actix Web 的单文件静态资源服务，以双栈监听、结构化日志和明确参数服务前端产物。
category: 开发工具
year: 2026
order: 4
status: Stable
accent: #f3a86b
stack: [Rust 2024, Actix Web, Clap, Tracing]
featured: true
repo: https://github.com/X-Lucifer/rust-xserver
demo:
---

## 项目概述

XServer / Rust 是一个用于托管静态目录的命令行 HTTP 服务。项目面向前端构建产物预览、局域网联调和交付验收，将服务目录、端口与监听地址收敛为可直接携带的单一可执行工具。

## 已实现的服务能力

- `--port` 配置 HTTP 端口，合法范围为 `1000–65535`
- `--dir` 指定静态资源根目录，启动前校验路径存在且为目录
- `--host` 可选择显式绑定地址；未指定时同时尝试 IPv4 与 IPv6 全接口监听
- 自动枚举非回环、非链路本地网络接口并输出可访问 URL
- 默认以目录内的 `index.html` 作为索引文件
- 每个请求生成 UUID，并写入 `X-Request-Id` 响应头
- 写入 `Server: xserver` 标识
- 记录客户端、方法、路径、内容长度、响应状态与处理耗时
- 通过 `RUST_LOG` 调整日志过滤级别

## 技术架构

服务基于 **Rust 2024、Actix Web 与 Actix Files**。Clap 负责命令行解析，`if-addrs` 负责网络接口枚举，Tracing 与 Tracing Subscriber 提供结构化日志，UUID 用于请求关联。

请求日志以 Actix 中间件实现：进入请求时创建关联标识并记录请求元数据，处理完成后写入响应头与状态、耗时日志。监听层显式创建 IPv4 listener，并在系统支持时追加 IPv6 listener。

## 构建与交付

项目结构保持紧凑，主要逻辑集中在 `src/main.rs`。Release 模式通过 Cargo 构建，Windows 资源由 `build.rs`、`winresource`、PNG 与 ICO 工具链嵌入可执行文件；Cargo 清单声明 MIT License。

## 适用场景与边界

当前实现提供静态文件与目录索引文件服务，不包含 TLS、身份认证、反向代理、内容压缩或显式的客户端路由通配回退。生产公网场景应在前置网关中补齐 HTTPS、安全策略与缓存控制。

## Go 对照实现

[Go 版本](https://github.com/X-Lucifer/go-xserver) 保持相同的端口、目录与局域网访问目标，但采用 Gin、标准库 flag 和 Zerolog。两个仓库用于直接比较 Rust 与 Go 在网络服务、中间件和可执行文件交付上的实现方式。
