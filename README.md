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

- Markdown 解析仅发生在 Vite 构建／开发进程。首页和列表只导入项目摘要，不包含 Markdown 解析器或详情正文。
- 每篇正文独立生成 HTML 模块，站内打开详情时按项目加载；详情 SEO 和章节目录随详情路由加载。
- 直接访问详情时，完整正文已经包含在 SSG HTML 中。浏览器复用已有正文和 DOM，不再重复下载正文模块；爬虫无需执行 JavaScript 即可读取内容。
- Vue 模板本身会压缩空白，SSG 使用 `formatting: 'none'` 保留其文本节点，避免二次 HTML 压缩造成 hydration 不匹配。开发时修改 Markdown 会刷新页面，使摘要、SEO 与正文同步更新。
- 背景网格通过索引共享顶点，保持全部原有线段及绘制顺序。矩阵点阵复用 GPU 缓冲，扩容时显式释放旧缓冲；窗口缩小时不重复分配。
- 独角兽粒子使用交错缓冲，移除未使用的 UV 数据，固定节点不再逐帧重算局部矩阵。桌面 24,000 点、触屏 14,000 点、画质、动画节奏、360° 拖拽与惯性均保留。
- 卡片弹簧在每帧共享系数，减少重复指数／三角函数计算与临时数组。离屏、后台暂停和资源销毁保持启用。

使用 Node.js 24 运行 `pnpm test`，验证网格展开后与原线段完全一致，以及文档分离、锚点和图片尺寸。`pnpm build` 继续包含 TypeScript 检查和全部页面静态生成。

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

`robots.txt` 允许通用爬虫访问，已覆盖 OAI-SearchBot。上线后仍需检查 CDN／WAF 是否拦截爬虫，并在搜索站长工具中检查抓取结果、提交 Sitemap。本地验证不能代替真实收录检查。

AI 搜索优化遵循可抓取、内容准确和结构清晰的原则。Google 不要求专用 AI 标记或 `llms.txt`，这些文件也不是其排名信号；OpenAI 的搜索爬虫与训练爬虫配置相互独立。参考 [Google AI 搜索指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) 和 [OpenAI 爬虫说明](https://developers.openai.com/api/docs/bots)。当前结构化数据用于准确描述项目，未具备真实评分等条件时不承诺软件富媒体搜索结果。

生产构建使用相对资源路径，并在构建收尾阶段按照 HTML 目录深度校正资源地址；内部链接也会根据当前页面生成相对地址，客户端导航保留目录末尾的 `/`，确保内页刷新时资源路径一致。Vue Router 在浏览器中会自动识别 `/x.x/` 子目录，因此同一份 `dist/` 可以同时部署到：

```text
https://x-lucifer.github.io/x.x/
https://xlucifer.top/
```

两个地址提供相同内容时，canonical、Sitemap 和 JSON-LD 会统一指向 `https://xlucifer.top/`，将自有域名作为 SEO 主站，避免搜索引擎把两个部署识别为互相竞争的重复页面。

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
