---
title: X.WebDAV.Server
slug: x-webdav-server
summary: 面向自托管场景的多租户 DAV 服务，统一提供文件、日历、联系人协议与 Web 管理端。
category: 服务端
year: 2026
order: 6
status: Active
accent: #df9898
stack: [ASP.NET Core 10, Native AOT, Vue 3, SQLite]
featured: true
repo: https://github.com/X-Lucifer/x.webdav.server
demo:
seoTitle: X.WebDAV.Server — 自托管 WebDAV、CalDAV 与 CardDAV 服务 | X.LUCIFER
seoDescription: X.WebDAV.Server 基于 ASP.NET Core 10 与 Native AOT，提供 WebDAV 文件、CalDAV 日历、CardDAV 联系人服务，配套 Vue 管理端、SQLite 用户存储和 Docker 部署。查看协议功能、数据组织与运行边界。
keywords: [X.WebDAV.Server, 自托管 WebDAV, CalDAV 服务端, CardDAV 服务端, ASP.NET Core, Native AOT, Docker]
languages: [C#, TypeScript]
platforms: [Linux x64 / Docker]
appCategory: UtilitiesApplication
features: [WebDAV 文件操作, CalDAV 日历集合, CardDAV 联系人集合, 用户目录隔离, Web 文件与用户管理, Docker 与 Native AOT 交付]
---

## X.WebDAV.Server 是什么

X.WebDAV.Server 是面向自托管场景的 DAV 服务端，将文件、日历和联系人访问整合到同一个 ASP.NET Core 10 应用中。后端分别实现 WebDAV、CalDAV、CardDAV 协议入口，前端提供 Vue 3 管理界面，用户信息保存在 SQLite，文件与集合内容存放在本地目录。

项目适合需要自行管理数据存储、通过 DAV 客户端访问资源，并希望保留浏览器管理入口的场景。Docker 构建采用 Linux x64 Native AOT 发布。

## 三类 DAV 协议能力

| 服务 | 路径前缀 | 主要用途 |
| --- | --- | --- |
| WebDAV | `/webdav/` | 文件上传、下载、目录和属性操作 |
| CalDAV | `/caldav/` | iCalendar 日历集合与 `.ics` 资源 |
| CardDAV | `/carddav/` | vCard 地址簿与 `.vcf` 资源 |
| Web 管理端 | `/admin/` | 浏览器登录、文件与用户管理 |

### 文件与集合操作

共享 DAV 中间件实现 `OPTIONS`、`GET`、`HEAD`、`PROPFIND`、`MKCOL`、`PUT`、`DELETE`、`MOVE`、`COPY`、`LOCK`、`UNLOCK`、`PROPPATCH` 和 `REPORT` 的分发。支持资源属性查询、集合创建、文件读写、移动复制、锁与属性更新。

CalDAV 提供 `MKCALENDAR`、日历查询和批量读取；CardDAV 提供地址簿查询与批量读取。服务包含 `/.well-known` 发现入口和集合同步令牌，以便客户端定位相应用户资源。

### 日历与联系人同步边界

日历查询包含组件和时间范围处理，日历与联系人都支持 `sync-collection`。客户端令牌与服务端一致时返回空变更结果；不一致时返回当前集合内容。实现没有保存完整历史增量日志，不能将其等同于包含删除历史的增量同步服务。

具体 DAV 客户端的兼容情况需要结合客户端使用的协议特性验证，不能仅凭支持某个方法名推定所有扩展均完整实现。

## Web 管理功能

### 文件管理

管理端可以浏览协议目录、创建文件夹、上传文件、下载或查看原始内容、读取和保存文本内容，并提供移动、重命名、删除与批量删除操作。相关 API 统一放在 `/api/manage/files` 路径下。

### 用户与数据管理

用户接口提供登录、修改自身密码，以及用户列表、创建、删除和密码重置。删除用户前可查询数据影响，统计 WebDAV、CalDAV 和 CardDAV 下的用户目录及文件情况；存在关联数据时要求显式确认删除。

DAV 请求使用 Basic Authentication，管理接口使用 JWT。存储路径按协议类型与用户名组织，创建用户时准备对应目录，删除用户时同步处理其关联资源。

## 数据与部署结构

| 配置或目录 | 用途 |
| --- | --- |
| `DATA_DIR` | DAV 内容根目录；容器默认 `/data` |
| `STATIC_ROOT` | 管理端静态文件根目录；容器默认 `/app/wwwroot` |
| `/app/database` | SQLite 数据库存储位置 |
| `/app/nlog` | 日志持久化目录 |
| 容器端口 `8080` | HTTP 服务；仓库 Compose 示例映射为主机 `9090` |

Dockerfile 分阶段构建 Vue 前端和 .NET 后端，将 Native AOT 程序与管理页面复制到运行镜像。管理页面保存在镜像内的 `/app/wwwroot/admin`，与挂载到 `/data` 的用户内容分开，避免数据卷覆盖管理页面。

## 本地构建与预览

准备 Docker，在源码根目录构建镜像：

```bash
docker build -t x-webdav-server:local .
```

以下示例仅映射本机地址，并使用独立数据卷保存内容、数据库和日志：

```bash
docker run --rm -p 127.0.0.1:9090:8080 \
  -v webdav-data:/data \
  -v webdav-database:/app/database \
  -v webdav-logs:/app/nlog \
  x-webdav-server:local
```

启动后访问 `http://127.0.0.1:9090/admin/`。用于正式部署前应按项目配置修改初始账号和 JWT 签名配置，并为 Basic Authentication 入口配置 HTTPS。完整构建方式见 [项目仓库](https://github.com/X-Lucifer/x.webdav.server)。

## 工程实现与持久化边界

后端使用 `CreateSlimBuilder`、Minimal API、源生成 JSON 序列化与 SQLite，日志由 NLog 输出。协议中间件共享路径、属性、锁与 XML 响应处理，再由各协议实现专有集合行为。

用户数据库和 DAV 文件可以通过卷持久化。锁信息与 DAV 自定义属性保存在进程内存中，重启后不会保留。项目没有实现跨实例共享锁或完整分布式一致性，部署规划应遵循这一边界。
