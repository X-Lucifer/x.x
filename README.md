# X.LUCIFER

基于 Vue 3、TypeScript、Vite SSG 与 pnpm 的个人开源作品站。构建时会为每个页面生成完整 HTML，并输出独立的 TDK、canonical、Open Graph、Twitter Card 与 JSON-LD。

## 开始使用

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm preview
```

构建产物位于 `dist/`，其中包括首页、软件列表、关于页、每个软件详情页以及：

- `sitemap.xml`：标准 XML Sitemap
- `sitemap.txt`：每行一个绝对 URL 的纯文本 Sitemap
- `robots.txt`：爬虫规则和 Sitemap 地址
- `llms.txt`：面向 AI 的简短内容索引
- `.well-known/ard.json`、`.well-known/ai-catalog.json`：新版 ARD 与兼容目录发现入口
- `skills/explore-projects/SKILL.md`：项目发现、查询和比较的只读 Agent Skill
- `index.md`、`about/index.md`、`software/index.md` 和 `software/<slug>/index.md`：公开 Markdown 内容入口
- `404.html`：GitHub Pages 自定义 404
- `.nojekyll`：关闭 GitHub Pages 的 Jekyll 处理

## 修改个人信息

编辑 `src/data/site.ts`，调整姓名、品牌、GitHub 地址、角色和所在地。

## 添加软件

在 `src/content/software/` 新建一个 Markdown 文件。文件顶部使用以下元数据：

```md
---
title: 软件名称
slug: software-slug
summary: 一句话介绍
category: Developer Tool
year: 2026
status: Active
accent: #63f5d2
stack: [Vue 3, TypeScript, Rust]
featured: true
repo: https://github.com/X-Lucifer/project
demo: https://example.com
---

## 项目介绍

在这里写正文。
```

`featured: true` 的项目会出现在首页。软件列表和详情路由会自动生成。

详情可以补充以下字段，分别描述用途、实际语言、运行平台和核心功能。`seoTitle` 与 `seoDescription` 应自然概括当前项目，`keywords` 保持少量且相关。

```md
seoTitle: 软件名称 — 具体用途 | X.LUCIFER
seoDescription: 说明软件为谁解决什么问题、已实现的主要功能和运行条件。
keywords: [软件名称, 核心用途, 关键技术]
languages: [Rust, TypeScript]
platforms: [Windows]
appCategory: DeveloperApplication
features: [本地文件编辑, 实时预览, 自定义快捷键]
```

运行截图放在 `public/previews/<slug>/`，详情中的引用示例为：

```md
![软件实际界面与展示功能](../../previews/software-slug/workspace.png)
```

PNG 的原始尺寸在构建时读取，自动输出 `width`、`height`、`loading="lazy"` 和 `decoding="async"`，同时用于图片 Sitemap 与社交分享信息。请使用真实运行截图并填写具体的替代文本。当前截图来自 X.SuperResolution 和 Wails-Obsidian-Lite 源项目文档，保持原始文件；其他项目没有借用不同版本的界面。

## 加载与动画性能

面向现代 Chromium、Firefox 和 Safari/WebKit；不提供 IE 或老旧浏览器的兼容包。不同内核仍通过能力检测选择任务调度、Worker 和并行着色器编译路径，不依赖 User-Agent 判断。

- Markdown 解析仅发生在 Vite 构建／开发进程。首页和列表只导入项目摘要，不包含 Markdown 解析器或详情正文。
- 每篇正文独立生成 HTML 模块，站内打开详情时按项目加载；详情 SEO 和章节目录随详情路由加载。
- 直接访问详情时，完整正文已经包含在 SSG HTML 中。浏览器复用已有正文和 DOM，不再重复下载正文模块；爬虫无需执行 JavaScript 即可读取内容。
- Vue 模板本身会压缩空白，SSG 使用 `formatting: 'none'` 保留其文本节点，避免二次 HTML 压缩造成 hydration 不匹配。开发时修改 Markdown 会刷新页面，使摘要、SEO 与正文同步更新。
- 每个静态页面内联自身所需的 CSS，外部样式表异步加载并供站内导航复用；首屏使用的两种 Latin 字体提前加载。其他字符集仍按需加载，所有资源保持根目录和 `/x.x/` 子目录兼容。
- 详情截图优先使用同尺寸的无损 WebP，保留 PNG 原图、浏览器回退和 SEO 引用。WebP 文件名包含原 PNG 的 SHA-256 前 12 位；更新原图后，缺少匹配的 WebP 时自动使用 PNG，避免展示过期截图。
- 背景网格通过索引共享顶点，保持全部原有线段及绘制顺序。矩阵点阵复用 GPU 缓冲，扩容时显式释放旧缓冲；窗口缩小时不重复分配。
- 独角兽全息采用前后两层圆润轮廓，在转角和曲线间隔处用侧边线对应连接，形成空心 3D 线框，不绘制中间轮廓层、实体填充面或内部格子；鼠标辉光仅沿轮廓分布。粒子使用交错缓冲，桌面 24,000 点、触屏 14,000 点，支持轮廓／粒子渐变、360° 拖拽、惯性、方向键旋转与复位。
- 全站背景采用第一视角网格地面与分层悬浮物。桌面分布 48 个矩形框和 20 个立体几何体，触屏或窄屏为 26 个与 10 个，并随屏幕比例缩小；物体随机错峰淡入淡出，响应鼠标视差、靠近照明和空白处点击涟漪。所有悬浮物合并为曲面、线框两次绘制，不按物体数量增加绘制调用。
- 背景限制像素预算，页面隐藏时停止动画，减少动态效果偏好下呈现静止场景；独角兽离屏时暂停。WebGL 不可用时保留静态页面，卸载时释放画布、GPU 资源和事件监听。
- Three.js 核心与 WebGL 渲染器独立分包，由背景和独角兽场景共享，并保持按需加载。
- WebGL 初始化分段执行，着色器利用并行编译扩展预热；浏览器不支持该扩展时逐个程序预热。初始化可以取消，路由切换、卸载和上下文丢失会释放未完成的任务及资源。
- 独角兽的几何体、轮廓、辉光和全部粒子在 Web Worker 中计算，通过 Transferable 缓冲交给渲染线程；随机序列与原效果一致。Worker 不可用时回退到分段计算，初始化结束后终止 Worker。
- 页面标题、正文、卡片、导航和页脚按深度响应鼠标视差，叠加轻微空间倾斜与悬浮阴影；卡片保留局部光感和弹簧反馈。位移、旋转和入场动画分别合成，拖拽或选择文字期间保持内容位置稳定。
- 内容视差与卡片共用按需调度器，只更新视口附近的元素，静止后停止请求动画帧；路由切换和列表筛选自动注册与释放内容层。触屏、减少动态效果偏好、后台状态与键盘聚焦会停止或复位鼠标动效。

验证环境、逐页 Lighthouse 分数和交互回归证据见 [性能验证报告](reports/performance/README.md)。

## SEO 配置

默认 SEO 主站为：

```text
https://xlucifer.top/
```

构建时可以使用以下环境变量覆盖：

| 变量 | 用途 | 默认值 |
| --- | --- | --- |
| `VITE_SITE_URL` | canonical、JSON-LD 与 Sitemap 的 SEO 主站根地址 | `https://xlucifer.top/` |

TDK 和结构化数据分别在页面组件中通过 `src/composables/useSeo.ts` 设置。新增软件后，执行 `pnpm build` 会自动把新的 slug 加入静态页面与两个 Sitemap。

详情页包含独立标题与描述、canonical、Open Graph／Twitter Card，以及相互关联的 WebPage、SoftwareApplication、SoftwareSourceCode、作者和 BreadcrumbList。章节目录与面包屑使用真实链接，项目用途、功能、安装条件与已知边界均可在正文中读取。编程语言与框架分别标注；不使用年份冒充完整发布时间，也不生成虚构评分、评论或价格。

JSON-LD 通过 `src/data/structuredData.ts` 的纯函数统一生成，首页、关于页、列表和详情页都包含本页可解析的 Person / WebSite 引用；列表的 ItemList 与可见项目顺序和数量一致，详情关联源码、真实截图和面包屑。人物信息不使用站点图标冒充个人照片，运行平台来自项目明确声明的平台字段。404 与 noindex 页面不输出该标记。Lighthouse 的“结构化数据有效”属于人工检查，不直接计入 SEO 分；Schema.org 语法正确也不保证获得 Google 软件富结果资格。参考 [Chrome 结构化数据说明](https://developer.chrome.com/docs/lighthouse/seo/structured-data?hl=zh-cn)。

`robots.txt` 允许通用爬虫访问，已覆盖 OAI-SearchBot。上线后仍需检查 CDN／WAF 是否拦截爬虫，并在搜索站长工具中检查抓取结果、提交 Sitemap。本地验证不能代替真实收录检查。

AI 搜索优化遵循可抓取、内容准确和结构清晰的原则。Google 不要求专用 AI 标记或 `llms.txt`，这些文件也不是其排名信号；OpenAI 的搜索爬虫与训练爬虫配置相互独立。参考 [Google AI 搜索指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) 和 [OpenAI 爬虫说明](https://developers.openai.com/api/docs/bots)。当前结构化数据用于准确描述项目，未具备真实评分等条件时不承诺软件富媒体搜索结果。

生产构建使用相对资源路径，并在构建收尾阶段按照 HTML 目录深度校正资源地址；内部链接也会根据当前页面生成相对地址，客户端导航保留目录末尾的 `/`，确保内页刷新时资源路径一致。Vue Router 在浏览器中会自动识别 `/x.x/` 子目录，因此同一份 `dist/` 可以同时部署到：

```text
https://x-lucifer.github.io/x.x/
https://xlucifer.top/
```

两个地址提供相同内容时，canonical、Sitemap 和 JSON-LD 会统一指向 `https://xlucifer.top/`，将自有域名作为 SEO 主站，避免搜索引擎把两个部署识别为互相竞争的重复页面。

## AI 内容入口与 WebMCP

`pnpm seo:generate` 和 `pnpm build` 会从 `src/data/site.ts` 与现有项目 Markdown 自动生成 `llms.txt` 和 Markdown 内容入口。软件详情保留完整正文、元数据和源码链接；首页与关于页是明确标注的页面摘要。图片和正文链接使用 `VITE_SITE_URL` 生成 canonical 绝对地址，不维护第二份项目介绍。开发时修改内容后重新运行生成命令即可更新这些静态文件。

每个有效页面通过 `rel="describedby"` 声明 llms.txt，通过 `rel="alternate" type="text/markdown"` 声明该页的 Markdown。链接兼容根目录与 `/x.x/` 部署；404 页不声明不存在的 Markdown。生成文件的路径和摘要保存在构建清单中，公开文档不包含生成声明注释。新增或删除项目后，生成器会同步索引，并仅清理清单中未被手工修改的过期详情 Markdown，保留手写文件和截图。

软件分类保存在 `?category=分类名` 中，支持分享、刷新和浏览器前进后退。选择“全部”会移除分类参数；其他查询参数和锚点保留。无效或重复的分类参数按“全部”展示，筛选按钮与结果数量提供对应的无障碍状态。

页面在原生 `document.modelContext` 可用时注册两个只读 WebMCP 工具：

- `list_projects({ category? })`：列出全部项目或指定分类，返回公开摘要、页面与源码链接。
- `get_project({ slug })`：按需读取单个项目的已发布 Markdown；不改变页面或打开外部链接。

参数依据实际分类、slug 和 JSON Schema 校验。注册复用同一浏览器上下文，路由切换不会重复注册；HMR 注销会清理工具。Markdown 仅在调用详情工具时获取，普通页面访问不会额外请求这些文档。不支持原生 API 的浏览器继续使用普通页面功能。

WebMCP 仍处于实验阶段。可在专用测试 Chrome 中启用 `chrome://flags/#enable-webmcp-testing`，重启后通过 DevTools → Application → WebMCP 查看并执行工具。公开域名面向未启用测试开关的浏览器使用时，需要按 Chrome 官方流程配置有效 Origin Trial。

Agentic Browsing 采用检查通过比例，具体项目会随 Lighthouse 版本变化。`llms.txt` 是内容发现提案，`llms-full.txt` 不是本站必需文件；抓取规则继续由 `robots.txt` 管理。这些入口不保证搜索收录、AI 引用或排名。参考 [llms.txt v2](https://llmstxt.org/)、[WebMCP 接入说明](https://developer.chrome.com/docs/ai/webmcp) 与 [Lighthouse 智能体浏览评分](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring)。

本地 Chrome 原生工具调用、页面回归与 Lighthouse Agentic Browsing 审计结果见 [AI 内容入口与 WebMCP 验证](reports/agentic/README.md)。

## ARD 与 AI Catalog

构建时同时生成 `.well-known/ard.json` 与 `.well-known/ai-catalog.json`，有效页面分别通过 `rel="ard"` 和 `rel="ai-catalog"` 声明地址。根目录部署可通过标准 well-known 路径发现；`/x.x/` 子目录部署通过页面链接发现对应目录内的文件。这些链接无需在普通访问时下载目录内容。

ARD 当前 v0.91 与独立 AI Catalog 的容器约定不同，项目分别生成二者。两个目录描述同一份真实的 `explore-projects` Agent Skill，使用规范认可的 `text/markdown; profile="urn:air:agent-skills"` 类型；ARD 额外提供 3 条代表查询。Skill 从现有项目数据生成，只说明如何按需使用公开 Markdown 与已注册的 WebMCP 查询工具。

独立 Catalog 遵守其规范性 CDDL，扩展字段不直接放入条目顶层。本机 Brave 内置 Lighthouse 13.5 仍读取旧 Catalog 并提示缺少顶层 `representativeQueries`；新版 ARD 文件已包含查询。这条旧版审计提示与实际结构校验分别记录，不能为了消除提示而混淆两个规范。

现有域名以 `VITE_SITE_URL` 生成资源 URL 和稳定 URN。该目录用于发现，不声明远程 MCP/A2A 服务、注册中心或已验证的身份认证；新增文件仍由非公开生成清单管理，不向公开文档写入生成注释。部署后应确认服务器允许读取 `.well-known/`、JSON 和 Skill Markdown。

规范与本轮验证见 [ARD v0.91](https://agenticresourcediscovery.org/spec/)、[AI Catalog](https://ai-catalog.io/spec/)、[Agent Skills](https://agentskills.io/specification) 和 [目录发现及结构化数据验证](reports/discovery/README.md)。

## 部署到 GitHub Pages

仓库已提供 `.github/workflows/deploy-pages.yml`。它会在代码推送到 `master` 后：

1. 使用锁文件安装 pnpm 依赖。
2. 静态生成全部页面和 SEO 文件。
3. 上传 `dist/`。
4. 部署到 GitHub Pages。

第一次部署前，在 GitHub 仓库中打开：

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

之后推送到 `master`，或者在仓库的 `Actions` 页面手动运行 `Deploy personal site to GitHub Pages`。GitHub Pages 镜像地址为：

```text
https://x-lucifer.github.io/x.x/
```

构建完成后，也可以把同一个 `dist/` 目录上传到 `xlucifer.top` 的 Web 根目录。服务器需要支持静态目录索引，让 `/software/` 返回 `software/index.html`；自定义 404 页面使用 `dist/404.html`。

如果以后更换 SEO 主域名，只需要修改工作流中的 `VITE_SITE_URL`，不需要修改资源路径或维护第二套构建配置。
