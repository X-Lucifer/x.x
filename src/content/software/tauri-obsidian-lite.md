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
seoTitle: Obsidian-Lite Tauri — Rust 本地 Markdown 编辑器 | X.LUCIFER
seoDescription: Obsidian-Lite Tauri 使用 Rust、Tauri 2 与 Vue 3 构建本地 Markdown 工作台，提供多标签、文件树、实时分栏、目录、Mermaid 和自定义快捷键，并支持 Windows 安装包与文件关联。
keywords: [Obsidian-Lite Tauri, Rust Markdown 编辑器, Tauri 2, 本地笔记, Markdown 实时预览, Windows 桌面应用]
languages: [Rust, TypeScript]
platforms: [Windows]
appCategory: BusinessApplication
features: [本地 Markdown 编辑, 多标签与文件树, 源码 / 预览 / 实时分栏, 章节目录与滚动同步, Mermaid 与代码高亮, Windows NSIS 安装]
---

## Obsidian-Lite Tauri 是什么

Obsidian-Lite Tauri 是基于 Rust、Tauri 2 和 Vue 3 的本地 Markdown 编辑器，面向文档阅读、技术写作和文件夹式笔记管理。前端使用 CodeMirror 6 处理编辑，Rust 命令层承接文件读写、目录扫描、系统字体和设置保存，文档以普通 Markdown 文件保留在本机。

这是独立项目，不是 Obsidian 官方产品。与 [Wails 版](../wails-obsidian-lite/) 相比，Tauri 版以 Rust 命令和 Tauri 插件实现原生能力，采用独立的桌面构建与安装流程。

## Markdown 工作台功能

### 文件、文件夹与标签

- 支持新建、打开、编辑和保存 `.md`、`.markdown`、`.mdx`，单文件上限为 8 MB。
- 文件树按目录优先排列，最多递归 12 层，并过滤隐藏目录、`node_modules` 与 `vendor`。
- 多标签保留打开的文档，重复打开定位已有标签，未保存内容在关闭时提示处理。
- 关闭文件夹不自动关闭已打开的文档，便于在多个来源之间整理笔记。
- 支持启动参数传入文档路径，并接入 Windows Markdown 文件关联。

### 编辑、阅读与实时分栏

源码模式适合集中编写，预览模式适合阅读，实时模式同时展示源码和渲染结果。编辑器与预览支持滚动同步，章节目录根据文档标题生成。窄窗口下调整分栏和侧栏布局，Zen 模式可收起文件栏与目录。

编辑工具覆盖查找替换、撤销重做、缩进，以及标题、列表、加粗、斜体、链接、行内代码和代码块操作。主要操作可使用自定义快捷键。

### 预览与图表

Markdown 预览支持任务列表、表格、删除线、自动链接、Frontmatter 处理与标题锚点。代码块提供语言标识、行号和复制按钮，语法高亮语言模块按需加载。Mermaid 图表按需渲染，语法错误时显示反馈并保留源码；预览内容经过 DOMPurify 处理。

## 原生能力与设置

Rust 后端通过 Tauri 命令接口提供文件操作、文件树扫描、字体枚举和配置读写。可能阻塞的任务交给 `spawn_blocking`，避免在异步执行线程中直接进行长时间文件系统工作。

应用提供跟随系统、浅色和深色主题，支持系统字体选择、12–24 px 字号、欢迎页开关与快捷键冲突校验。设置存储在本地 `settings.ini`；写入路径包含互斥保护和文件同步操作。

## Windows 运行与安装

Windows 版通过 NSIS 安装包交付，采用当前用户安装范围，并提供中英文安装界面、开始菜单、可选桌面快捷方式以及 Markdown 文件关联。

Windows 运行依赖 WebView2。安装配置包含 WebView2 引导安装方式，目标设备缺少运行时时可能需要联网下载。应用通过手动获取新版本更新，没有内置自动更新器。

## 从源码启动

准备 Rust 工具链、Node.js、pnpm 及 Tauri 所需的 Windows 原生构建环境，然后在仓库根目录执行：

```bash
pnpm install
pnpm tauri dev
```

生成桌面发行产物：

```bash
pnpm tauri build
```

前端使用 Vue 3、TypeScript 和 Vite；桌面侧采用 Rust 2024 Edition、Tauri 2 与 Dialog／Opener 插件。依赖准备、安装器选项及校验命令见 [项目 README](https://github.com/X-Lucifer/Tauri-Obsidian-Lite#readme)。

## 适用范围

Tauri 版适合围绕本地文件工作的 Markdown 阅读与编辑，不提供账号、云同步和团队协作，也不包含 Obsidian 插件生态。`.mdx` 在这里作为文本文档处理，不执行 React／JSX。核心写作可离线使用，远程图片和外部链接仍需要相应网络连接。
