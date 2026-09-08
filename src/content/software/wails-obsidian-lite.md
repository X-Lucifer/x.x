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
seoTitle: Obsidian-Lite Wails — Go 本地 Markdown 编辑器与实时预览 | X.LUCIFER
seoDescription: Obsidian-Lite Wails 是基于 Go、Wails 2 和 Vue 3 的本地 Markdown 编辑器，支持多标签、文件树、源码/预览/实时分栏、Mermaid、快捷键定制与 Windows 文件关联。查看运行截图、功能和构建方式。
keywords: [Obsidian-Lite Wails, Go Markdown 编辑器, Wails 2, 本地 Markdown 工作台, 实时预览, Mermaid]
languages: [Go, TypeScript]
platforms: [Windows]
appCategory: BusinessApplication
features: [本地 Markdown 文件与多标签, 源码 / 预览 / 实时分栏, 双向滚动同步, 代码高亮与 Mermaid, 字体主题与快捷键设置, Windows 安装与文件关联]
---

## Obsidian-Lite Wails 是什么

Obsidian-Lite Wails 是使用 Go、Wails 2 与 Vue 3 构建的本地 Markdown 工作台，适合阅读项目文档、编写技术笔记和维护文件夹中的 Markdown 内容。文档直接保存在本地文件系统，Go 后端负责原生文件与窗口操作，Vue 前端提供编辑、预览和设置界面。

这是独立项目，不是 Obsidian 官方产品。Wails 版与 [Tauri 版](../tauri-obsidian-lite/) 围绕相似的写作体验，分别实现 Go 与 Rust 桌面集成。

## 文件工作区与编辑流程

### 本地文件与多标签管理

- 打开、新建和保存 Markdown，支持 `.md`、`.markdown`、`.mdx` 扩展名，单文件上限为 8 MB。
- 以文件夹树浏览文档，目录优先排序；扫描深度最多 12 层，跳过隐藏目录、`node_modules` 和 `vendor`。
- 多标签同时打开文件，重复打开会激活已有标签；未保存状态可见，关闭时提供确认。
- 关闭文件夹保留已经打开的文档，文件工作区和标签状态分别管理。
- 支持命令行传入文件路径，以及 Windows 文件关联启动。

### 三种视图与写作工具

源码模式使用 CodeMirror 6；预览模式专注阅读；实时模式并列展示源码与渲染结果，并支持双向滚动同步。章节目录可用于定位标题，窄窗口下采用上下分栏，文件栏以覆盖方式展开。

编辑器提供查找替换、撤销重做、缩进、选区匹配，以及加粗、斜体、链接、行内代码、标题、列表和代码块等快捷操作。新建文档直接进入源码模式。

### Markdown 渲染

预览支持表格、任务列表、删除线、自动链接、Frontmatter 处理与标题锚点。代码块显示语言、行号和复制入口；Highlight.js 按需加载语言支持。Mermaid 支持流程图、时序图等图表，渲染随主题调整。预览内容经过 DOMPurify 处理。

## 运行预览

### 阅读视图与章节目录

![Obsidian-Lite Wails 预览模式：Markdown 欢迎文档、代码高亮和右侧章节目录](../../previews/wails-obsidian-lite/obsidian-lite-overview.png)

### 字体、主题与快捷键设置

![Obsidian-Lite Wails 设置窗口：跟随系统主题、字体大小和可自定义快捷键](../../previews/wails-obsidian-lite/obsidian-lite-settings.png)

### 源码与实时预览分栏

![Obsidian-Lite Wails 实时模式：左侧 CodeMirror 源码、中间渲染结果与右侧目录](../../previews/wails-obsidian-lite/obsidian-lite-live.png)

## 个性化与桌面集成

主题可跟随系统或固定为浅色／深色；字体可从系统字体中选择，字号范围为 12–24 px。欢迎页、文件栏和章节目录均有独立开关，Zen 模式可暂时收起导航区域。

快捷键设置支持录入组合键、格式与冲突校验，并可恢复默认配置。Windows 设置保存在 `%AppData%\Obsidian-Lite\settings.ini`。Go 端使用互斥锁和临时文件替换处理设置保存，文档写入保留原文件权限。

## 运行与构建

| 环境 | 说明 |
| --- | --- |
| 桌面运行 | Windows，需要 WebView2 Runtime |
| 后端开发 | Go 1.25 与 Wails 2 |
| 前端开发 | Node.js、Vue 3、TypeScript、Vite |
| 正式交付 | 前端产物通过 `go:embed` 嵌入桌面程序 |

在配置 Wails 开发环境后，于仓库根目录执行：

```bash
wails dev
wails build
```

仓库提供当前用户范围的 Windows NSIS 安装流程，支持升级卸载、开始菜单、可选桌面快捷方式和 Markdown 文件关联。详细依赖与安装包命令见 [项目 README](https://github.com/X-Lucifer/Wails-Obsidian-Lite#readme)。

## 适用范围

Wails 版面向本地 Markdown 阅读和写作，没有账号、云同步或多人协作。支持 `.mdx` 文件打开不代表提供 React／JSX 执行环境。核心编辑与本地文件访问可离线使用；文档内引用的远程资源仍取决于对应网络地址。
