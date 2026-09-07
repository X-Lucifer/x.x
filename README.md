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

## 全站空间交互

使用 npm 包 `three` 构建极客风的三维空间。全站共享透视网格、悬浮线框与粒子节点，指针移动改变空间视角，滚动驱动背景纵深。作品卡片、导航和关于页内容使用统一的透视倾斜与分层悬浮反馈。

提供深色与亮色两套主题：深色使用近黑与薄荷绿；亮色使用瓷白、石墨灰与低饱和翡翠绿。导航栏的日月开关在桌面与手机上均可直接使用，选择保存在 `localStorage['x-theme']`，跨页面、刷新和同源标签页保持一致。首次访问默认暗色，不跟随系统配色；手动切换后记住选择，存储不可用时仍可在当前页面切换。主题在首屏绘制前初始化，避免刷新闪色。配色变量集中在 `src/style.css`，Three.js 材质通过 `observeTheme` 原位更新，切换主题不会重置独角兽旋转和演化进度。

首页独角兽使用品牌原始轮廓构建全息扫描与点阵形态，默认全息，并按 18 秒周期自动循环：全息停留 4 秒 → 线性过渡 5 秒 → 点阵停留 4 秒 → 线性返回 5 秒。鼠标附近的轮廓产生局部光晕，旋转后仍按屏幕位置准确照亮边缘。画面不显示形态名称、切换状态或指针/拖动提示，持续自动循环，不提供暂停或恢复按钮。面板右上角提供视角复位。键盘聚焦画面后使用方向键旋转、Home 复位。全站空间效果默认持续运行，不提供关闭开关。

- `src/components/layout/SpatialBackdrop.vue` / `spatialField.ts`：全站共享的三维场景。
- `src/composables/useSpatialInteraction.ts`：统一指针调度与透视交互。
- `src/components/home/IdentitySculpture.vue`：独角兽交互、加载与静态回退。
- `src/components/home/identityScene.ts`：全息与点阵自动过渡、指针边缘光晕、空间轨道与渲染生命周期。
- `src/components/brand/unicorn.ts`：SVG 标志与三维模型共用的品牌路径。

Three.js 仅在浏览器动态加载，不参与服务端渲染；首页局部场景在即将进入视口时加载。首页画面离屏或标签页隐藏时停止对应持续渲染，卸载时释放 GPU 资源。两个场景均使用屏幕原生 `requestAnimationFrame` 节奏，支持高刷新率，不再人为锁定 24/30/60 FPS；实际帧率取决于设备与浏览器。渲染器请求高性能 GPU，背景像素比上限为 1、总像素上限约 200 万，独角兽为桌面 1.5 / 触控 1、总像素上限约 80 万。尺寸未变化时不重建画布；8 个悬浮线框在 GPU 上运动、合并为一次绘制，背景每帧共 4 次绘制。跳过不可见的轮廓和光晕，避免透明双面重复渲染。指针跟随与拖动使用与帧率无关的快速缓动，浏览器长时间中断不会使形态突然跳变。卡片光斑通过移动固定渐变图层实现，按钮扫光使用 `transform`；指针移动不更新 Vue 状态或向子树传播样式变量。触控不启用卡片倾斜，保留原生纵向滚动。系统开启“减少动态效果”时保持静态全息画面，仍可通过方向键探索。WebGL 初始化失败或上下文丢失时保留静态品牌画面与完整网站内容。

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
