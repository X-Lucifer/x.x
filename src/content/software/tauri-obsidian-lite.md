---
title: Obsidian-Lite / Tauri
slug: tauri-obsidian-lite
summary: 以 Rust、Tauri 2 与 Vue 3 构建的本地 Markdown 工作台，覆盖编辑、预览与 Windows 安装交付。
category: 桌面客户端
year: 2026
order: 2
status: Active
accent: #82c7dd
stack: [Rust 2024, Tauri 2, Vue 3, CodeMirror 6]
featured: true
repo: https://github.com/X-Lucifer/Tauri-Obsidian-Lite
demo:
---

## 项目概述

Obsidian-Lite / Tauri 是一款面向本地文档的 Markdown 阅读与写作客户端。应用不引入账号体系、云同步服务或专有文档格式，文件直接从本地磁盘读取并保存，适合技术文档、项目说明、长期笔记与代码片段的日常维护。

> 本项目为独立软件，与 Obsidian 官方没有隶属关系。

## 已实现的产品能力

### 本地工作区

- 新建、打开、编辑并保存 `.md`、`.markdown` 与 `.mdx`
- 打开文件夹并生成 Markdown 文件树
- 通过命令行参数或 Windows 文件关联直接载入文档
- 过滤点目录、`node_modules` 与 `vendor`，目录扫描最大递归 12 层
- 限制单文件最大 8 MB，避免大文件阻塞桌面交互

### 多文档与视图

- 使用标签页管理多个文档，重复打开时定位到已有标签
- 跟踪已保存内容与当前内容，明确显示未保存状态
- 关闭未保存标签前进行确认
- 提供源码、预览与实时分栏三种模式
- 支持编辑区和预览区双向滚动同步
- 提供文件栏、章节目录与 Zen 专注模式

### 编辑与渲染

- CodeMirror 6 编辑器、行号、当前行高亮、自动换行和查找替换
- 标题、列表、任务列表、表格、引用、删除线、链接和 Front Matter 处理
- 围栏代码块动态加载 Highlight.js 语言模块
- 代码块语言标识、行号与一键复制
- 自动生成稳定的章节锚点与文档目录
- 对宽表格和不规则缩进进行规范化处理
- 文档 HTML 经 DOMPurify 清理，外部链接附加安全属性

## 技术架构

### Rust 原生层

原生侧使用 **Rust 2024 与 Tauri 2**。文件读取、创建、保存、目录扫描、系统字体枚举、设置读写和启动文件解析均通过显式 Tauri Command 暴露；可能阻塞的文件系统操作使用 `spawn_blocking` 执行，避免占用异步运行时线程。

### Vue 应用层

前端采用 **Vue 3、TypeScript 与 Vite**。`useMarkdownWorkspace` 集中管理标签页、当前文档、文件树、视图模式、主题、侧栏、目录、Zen 状态以及操作反馈，原生调用统一收敛在 service 层，避免组件直接依赖 Tauri API。

### 设置与安全

主题、字体、字号、欢迎页和快捷键写入用户配置目录的 `settings.ini`。Rust 层会校验主题范围、12–24 px 字号、快捷键格式与按键冲突。Markdown 渲染允许受控 HTML，但最终结果必须经过 DOMPurify 清理。

## Windows 交付

Tauri 配置生成 NSIS 当前用户安装包，支持简体中文和英文、开始菜单、可选桌面快捷方式，以及 `.md`、`.markdown`、`.mdx` 文件关联。前端资源随应用封装，运行时不需要单独部署 Web 服务；目标电脑缺少 WebView2 时，安装器会按配置下载引导程序。

## 当前边界与对照实现

当前安装目标面向 Windows，文件夹工作区只展示 Markdown 文档，不承担通用文件管理职责，也不包含同步与多人协作服务。

项目另有 [Go + Wails 2 实现](https://github.com/X-Lucifer/Wails-Obsidian-Lite)。两套客户端保持接近的业务能力和 Vue 交互层，用于比较 Rust/Tauri 与 Go/Wails 在原生桥接、构建产物和安装链路上的差异。
