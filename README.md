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

生产构建使用相对资源路径，并在构建收尾阶段按照 HTML 目录深度校正资源地址；内部链接也会根据当前页面生成相对地址。Vue Router 在浏览器中会自动识别 `/x.x/` 子目录，因此同一份 `dist/` 可以同时部署到：

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
