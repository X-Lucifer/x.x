---
name: explore-projects
description: "发现、查询和比较 X.LUCIFER 的公开软件项目。当用户希望按用途或技术栈查找项目、阅读项目说明或比较已公开功能时使用；依据本站 Markdown 文档和源码链接回答。"
---

# 探索 X.LUCIFER 开源项目

帮助用户发现、查询和比较本站已公开的软件项目。所有步骤只读取公开资料。

## 使用步骤

1. 阅读 [站点文档索引](https://xlucifer.top/llms.txt) 和 [软件作品目录](https://xlucifer.top/software/index.md)，根据用户用途、项目分类或技术栈筛选候选项目。使用目录中的真实项目名称和 slug。
2. 如果用户的浏览器或 agent 集成已在 [本站页面](https://xlucifer.top/software/) 提供原生 WebMCP 工具，可调用 `list_projects({})` 获取列表；仅在需要时以工具返回的精确分类传入 `category`，再用 `get_project({"slug":"<列表返回的 slug>"})` 读取选定项目。工具不可用或读取失败时，直接通过 HTTP 读取上述目录及下面对应的 Markdown 文档。本技能不提供远程 MCP 服务，也不要求安装浏览器兼容层。
3. 只读取与问题相关的项目详情。核对正文中的用途、功能、使用边界、编程语言、运行平台与源码仓库；需要比较时，对各项目使用相同维度。文档未说明的项目明确标为“未说明”，不推断实测性能、兼容性或未公开功能。
4. 回答中给出选中项目、与用户需求的对应关系，并链接文档中的原页面和源码仓库。涉及发布版本或安装方法时，以项目仓库的当前公开说明为依据；若未核实，明确说明。仅查询资料，不自动下载、运行软件或修改用户环境。

## 项目文档

按需打开相关项目，不必预先读取全部正文。

- [XXray](https://xlucifer.top/software/x-xray/index.md): 基于 Avalonia 与 xray-core 的 VLESS 桌面客户端，将节点、订阅、智能分流与连接状态集中到一个清晰的工作台。
- [X.SuperResolution](https://xlucifer.top/software/x-superresolution/index.md): 面向 Windows 的本地 AI 图像增强软件，以原生 NCNN/Vulkan 引擎提供批量超分辨率处理。
- [Obsidian-Lite / Tauri](https://xlucifer.top/software/tauri-obsidian-lite/index.md): 以 Rust、Tauri 2 与 Vue 3 构建的本地 Markdown 工作台，覆盖编辑、预览与 Windows 安装交付。
- [Obsidian-Lite / Wails](https://xlucifer.top/software/wails-obsidian-lite/index.md): 使用 Go、Wails 2 与 Vue 3 实现的本地 Markdown 客户端，完整封装文件、窗口与安装能力。
- [XServer / Rust](https://xlucifer.top/software/rust-xserver/index.md): 基于 Actix Web 的单文件静态资源服务，以双栈监听、结构化日志和明确参数服务前端产物。
- [XServer / Go](https://xlucifer.top/software/go-xserver/index.md): 使用 Go 与 Gin 实现的静态资源服务，提供目录校验、局域网地址发现与请求级日志。
- [X.WebDAV.Server](https://xlucifer.top/software/x-webdav-server/index.md): 面向自托管场景的多租户 DAV 服务，统一提供文件、日历、联系人协议与 Web 管理端。
