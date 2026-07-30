---
title: Obsidian-Lite / Wails
slug: wails-obsidian-lite
summary: 使用 Go、Wails 2 与 Vue 3 实现的本地 Markdown 客户端，完整封装文件、窗口与安装能力。
category: 桌面客户端
year: 2026
order: 3
status: Active
accent: #9c91dc
stack: [Go 1.25, Wails 2, Vue 3, CodeMirror 6]
featured: false
repo: https://github.com/X-Lucifer/Wails-Obsidian-Lite
demo:
---

## 项目概述

Obsidian-Lite / Wails 是同一 Markdown 产品的 Go 桌面实现。它以普通本地文件作为唯一内容来源，不依赖账号、网络服务或私有数据库；Go 负责文件系统、窗口和设置能力，Vue 应用层负责文档工作区与编辑体验。

> 本项目为独立软件，与 Obsidian 官方没有隶属关系。

## 已实现的产品能力

- 打开、新建、保存 `.md`、`.markdown` 与 `.mdx` 文档
- 通过文件夹工作区浏览最多 12 层的 Markdown 文件树
- 过滤点目录、`node_modules` 和 `vendor`
- 支持命令行启动文件和 Windows 文件关联
- 以多标签页管理文档、未保存状态和关闭确认
- 提供源码、预览、实时分栏、章节目录和 Zen 模式
- 支持主题、系统字体、字号、欢迎页与完整快捷键配置
- 使用 CodeMirror 6、markdown-it、Highlight.js 与 DOMPurify 完成编辑和安全预览

前端的 Markdown 管线包含任务列表、表格规范化、Front Matter 处理、标题锚点、代码行号、一键复制与语言模块按需加载，不只是对 markdown-it 默认输出的简单包装。

## 技术架构

### Go 原生层

应用基于 **Go 1.25 与 Wails 2**。绑定方法负责原生文件对话框、文件读写、目录树、启动参数、系统字体、应用版本和窗口控制。读取逻辑校验 Markdown 扩展名与 8 MB 文件上限；保存时保留原文件权限。

### 设置服务

设置服务使用互斥锁串行化读写，将主题、字体、字号、欢迎页和快捷键保存至用户目录。写入前统一校验字段范围、规范化快捷键并检测冲突，再通过临时文件生成设置内容，降低配置损坏风险。仓库同时包含设置校验与 Windows 字体枚举测试。

### Vue 应用层

前端采用 Vue 3、TypeScript、Vite 与 CodeMirror 6，业务结构与 Tauri 版本保持一致，但原生 service 改为 Wails 生成的 Go 绑定。Release 构建通过 `go:embed` 将 `frontend/dist` 嵌入可执行文件，部署时不需要额外静态目录。

## Windows 交付

仓库提供独立 NSIS 安装链路，生成 Windows amd64 当前用户安装包。安装器无需管理员权限，支持覆盖安装、桌面与开始菜单快捷方式、卸载注册，以及可选的 `.md` 文件关联；卸载时会尝试恢复安装前记录的关联状态。

## 当前边界与对照实现

当前产品专注本地 Markdown 阅读与写作，不提供云同步、账号体系和团队协作。安装脚本及文件关联面向 Windows。

项目另有 [Rust + Tauri 2 实现](https://github.com/X-Lucifer/Tauri-Obsidian-Lite)。共享的 Vue 产品层使比较集中在 Go 与 Rust 原生服务、桥接机制、可执行文件组织和安装工具链，而不是两套不同的产品设计。
