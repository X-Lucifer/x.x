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
---

## 项目概述

X.WebDAV.Server 是面向个人与小型团队自托管场景的 DAV 协议服务。系统在统一部署中提供 WebDAV 文件、CalDAV 日历与 CardDAV 联系人入口，并附带用户管理和协议数据管理界面，使服务端不仅能够响应客户端同步，也具备独立的日常运维入口。

## 协议能力

公共 DAV 基础层实现以下方法：

`OPTIONS`、`GET`、`HEAD`、`PROPFIND`、`MKCOL`、`PUT`、`DELETE`、`REPORT`、`MOVE`、`COPY`、`LOCK`、`UNLOCK` 与 `PROPPATCH`。

在此基础上：

- **WebDAV** 提供文件与目录资源、属性查询和集合操作
- **CalDAV** 增加 `MKCALENDAR`、日历资源属性、principal 发现、`.well-known` 跳转、ICS 导入校验、REPORT 查询与同步令牌
- **CardDAV** 提供地址簿资源属性、principal 发现、VCF 导入处理、REPORT 查询与同步令牌
- 资源路径按已认证用户隔离到独立数据目录
- Basic Authentication 用于 DAV 客户端，JWT Bearer 用于管理 API

## 管理端能力

Vue 管理端覆盖协议数据和账号的日常操作：

- 在 WebDAV、CalDAV 与 CardDAV 三类空间之间切换
- 分页浏览目录，创建目录、上传、重命名、删除与批量删除
- 复制完整协议 URL
- 预览图片，查看并编辑文本类文件
- 创建用户、重置密码和删除用户
- 删除用户前统计其三类协议目录的文件数、目录数与空间占用，并执行二次确认
- 当前登录用户可修改自身密码

## 技术架构

### 服务端

后端基于 **ASP.NET Core 10**，使用 `CreateSlimBuilder` 与 Kestrel 组织轻量宿主。DAV 协议由独立中间件实现，管理接口采用 Minimal API；Microsoft.Data.Sqlite 持久化用户账户，NLog 负责日志，Forwarded Headers 用于反向代理场景。

协议数据直接保存到 WebDAV、CalDAV、CardDAV 对应的文件系统目录，账号信息保存在 SQLite。服务启动时会初始化目录和用户表，并分别注册协议认证、管理认证、静态管理端与协议中间件。

### 管理前端

管理界面采用 **Vue 3、TypeScript、Vite、Pinia、Axios 与 Naive UI**。路由守卫和 Pinia 管理登录状态，文件管理器按协议类型复用统一 API，并针对桌面与移动宽度调整操作布局。

## 构建与容器交付

项目使用多阶段 Docker 构建：

1. Node.js 阶段编译 Vue 管理端
2. .NET SDK 阶段构建并以 Linux x64 Native AOT 发布后端
3. `runtime-deps` 阶段组合原生服务与静态管理资源

容器默认监听 `8080`，以 `/data` 作为协议数据卷，并允许通过 `STATIC_ROOT` 与 `DATA_DIR` 调整静态资源和持久化位置。仓库同时提供 Docker Compose 配置。

## 部署边界

DAV 使用普通浏览器较少见的 HTTP 方法与协议头。经过 Cloudflare、Nginx 或其他安全网关时，需要显式放行 DAV 方法、深度与锁相关请求头，并处理部分客户端缺少 `User-Agent` 的情况。

用户信息持久化在 SQLite，协议文件持久化在数据卷；当前锁状态和扩展属性保存在服务进程内存中，重启后不会保留。生产部署应在首次启动时替换初始凭据与 JWT 签名配置，并由反向代理提供 HTTPS、访问限制和备份策略。
