---
title: XServer / Rust
slug: rust-xserver
summary: 基于 Actix Web 的单文件静态资源服务，以双栈监听、结构化日志和明确参数服务前端产物。
category: 开发工具
year: 2026
order: 4
status: Stable
accent: #dfa878
stack: [Rust 2024, Actix Web, Clap, Tracing]
featured: true
repo: https://github.com/X-Lucifer/rust-xserver
demo:
seoTitle: XServer Rust — Actix Web 静态文件服务器与双栈监听 | X.LUCIFER
seoDescription: XServer Rust 是基于 Actix Web 的轻量静态文件服务器，支持自定义目录、端口与监听地址，提供 IPv4/IPv6 监听、局域网访问地址和 Tracing 请求日志。适合前端构建产物预览与本地静态站点服务。
keywords: [XServer Rust, Rust 静态文件服务器, Actix Web, 前端构建预览, IPv6, Tracing]
languages: [Rust]
platforms: [Windows, Linux, macOS]
appCategory: DeveloperApplication
features: [静态目录与 index.html 服务, 端口与监听地址配置, IPv4 / IPv6 监听, 局域网地址发现, 请求 ID 与结构化日志]
---

## XServer Rust 是什么

XServer Rust 是使用 Rust 与 Actix Web 实现的命令行静态文件服务器。它将指定目录作为站点根目录，通过一个可执行文件提供 HTTP 访问，适合预览前端构建产物、演示静态页面，以及在局域网内临时提供静态资源。

项目重点是启动参数明确、访问地址可见和请求可追踪。使用已构建的程序时，不需要额外启动 Node.js 开发服务器。

## 静态服务与网络能力

- **目录服务**：将指定目录挂载到 `/`，目录首页使用 `index.html`。启动时检查目录是否存在、是否为文件夹，并在日志中展示规范化路径。
- **监听配置**：支持端口和指定 Host。未指定 Host 时监听 IPv4 通配地址，并尝试建立 IPv6 监听；指定 Host 时按给定地址绑定。
- **地址发现**：启动后列出本机、localhost 和可用网络接口地址，过滤重复及链路本地地址，IPv6 URL 使用方括号格式。
- **请求标识**：为请求生成 UUID，并在响应中写入 `X-Request-Id`，方便将浏览器请求与日志关联。
- **结构化日志**：记录客户端地址、请求方法、URI、内容长度、响应状态和处理耗时，使用 Tracing 输出，并支持 `RUST_LOG` 调整日志过滤。

## 启动参数

| 参数 | 默认值 | 用途 |
| --- | --- | --- |
| `-p` / `--port` | `22345` | 指定 HTTP 端口；代码检查范围为 1000–65535 |
| `-d` | `.` | 指定静态文件根目录 |
| `--host` | 不指定 | 限定监听地址，例如 `127.0.0.1` |
| `-h` / `--help` | — | 查看命令帮助 |

端口解析后若低于允许范围，会警告并回退到默认端口；无法解析为有效整数的输入由 Clap 拒绝。

## 构建与使用

在安装 Rust 工具链的环境中，从仓库根目录构建：

```bash
cargo build --release
```

使用构建后的程序提供 `dist` 目录，仅监听本机：

```bash
./target/release/xserver --host 127.0.0.1 -p 8080 -d ./dist
```

需要局域网访问时省略 `--host`，再使用启动日志中列出的接口地址访问。Windows 对应执行文件为 `xserver.exe`；其他系统按目标平台构建。

## 工程实现

服务主体采用 Rust 2024 Edition、Actix Web 与 Actix Files。Clap 解析命令行，`if-addrs` 枚举网络接口，Tracing 记录结构化请求，UUID 生成关联标识。Windows 构建通过资源脚本嵌入应用图标与版本信息。

与 [Go 版 XServer](../go-xserver/) 相比，Rust 版额外提供 `--host` 参数，并显式组织默认 IPv4 与可选 IPv6 监听逻辑。两者都围绕静态文件服务工作，没有动态业务 API。

## 服务边界

服务支持目录首页，但不会将未知路径统一回退到根 `index.html`。使用 History 路由的 SPA 直接刷新嵌套路由时，需要额外配置具有回退能力的服务；SSG 生成了对应目录首页的页面可按目录访问。

项目没有额外配置 TLS 终止、身份认证或反向代理管理。用于公开长期服务时，应由部署环境补齐相应能力。源码和完整构建信息见 [项目 README](https://github.com/X-Lucifer/rust-xserver#readme)。
