import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createAgentDocuments, normalizeSiteUrl, readSoftwareDocuments, writeAgentDocuments } from '../build/agentDocuments.mjs'
import { siteConfig, technologyGroups } from '../src/data/site.ts'

const projectRoot = process.cwd()
const publicDir = join(projectRoot, 'public')
const contentDir = join(projectRoot, 'src', 'content', 'software')
const fallbackSiteUrl = 'https://xlucifer.top/'
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || fallbackSiteUrl)

function absoluteUrl(path = '/') {
  return new URL(path.replace(/^\/+/, ''), siteUrl).href
}

function pageUrl(path = '/') {
  const relativePath = path.replace(/^\/+|\/+$/g, '')
  return relativePath ? absoluteUrl(`${relativePath}/`) : siteUrl
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

const documents = await readSoftwareDocuments(contentDir)
const softwarePages = documents.map(({ project, body }) => ({
  slug: project.slug,
  images: [...body.matchAll(/!\[[^\]]*\]\(\.\.\/\.\.\/(previews\/[\w/-]+\.png)\)/g)]
    .map(match => absoluteUrl(match[1])),
}))

const paths = [
  '/',
  '/software',
  '/about',
  ...softwarePages.map(({ slug }) => `/software/${slug}`),
]
const urls = paths.map(pageUrl)

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((url) => {
  const images = softwarePages.find(({ slug }) => pageUrl(`/software/${slug}`) === url)?.images ?? []
  const imageTags = images.map(image => `\n    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`).join('')
  return `  <url>\n    <loc>${escapeXml(url)}</loc>${imageTags}\n  </url>`
}).join('\n')}
</urlset>
`

const sitemapText = `${urls.join('\n')}\n`
const robotsText = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
Sitemap: ${absoluteUrl('/sitemap.txt')}
`

const notFoundHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="color-scheme" content="dark" />
    <meta name="theme-color" content="#070a08" />
    <title>页面未找到 | X.LUCIFER</title>
    <script>
      const basePath = location.pathname === '/x.x' || location.pathname.startsWith('/x.x/')
        ? '/x.x/'
        : '/'
      const assetBase = document.createElement('base')
      assetBase.href = basePath
      document.head.append(assetBase)
    </script>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <link rel="manifest" href="./site.webmanifest" />
    <style>
      :root { color-scheme: dark; font-family: system-ui, sans-serif; background: #070a08; color: #e8efeb; }
      body { min-height: 100vh; display: grid; place-items: center; margin: 0; }
      main { width: min(42rem, calc(100% - 3rem)); }
      small { color: #7edfac; letter-spacing: .12em; }
      h1 { margin: 1rem 0; font-size: clamp(2.5rem, 8vw, 5rem); }
      p { color: #9aaba2; line-height: 1.7; }
      nav { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
      a { padding: .75rem 1rem; border: 1px solid #35483d; color: #e8efeb; text-decoration: none; }
      a:first-child { background: #7edfac; color: #07100b; }
    </style>
  </head>
  <body>
    <main>
      <small>404 / NO SIGNAL</small>
      <h1>没有找到这个页面。</h1>
      <p>当前地址不存在或已经移动，请返回首页或继续浏览开源软件作品。</p>
      <nav aria-label="404 页面导航">
        <a id="home-link" href="/">返回首页</a>
        <a id="software-link" href="/software/">查看软件作品</a>
      </nav>
    </main>
    <script>
      document.querySelector('#home-link').href = basePath
      document.querySelector('#software-link').href = basePath + 'software/'
    </script>
  </body>
</html>
`

const agentDocuments = createAgentDocuments({ documents, siteConfig, technologyGroups, siteUrl })
await writeAgentDocuments(publicDir, agentDocuments)
await Promise.all([
  writeFile(join(publicDir, 'sitemap.xml'), sitemapXml),
  writeFile(join(publicDir, 'sitemap.txt'), sitemapText),
  writeFile(join(publicDir, 'robots.txt'), robotsText),
  writeFile(join(publicDir, '404.html'), notFoundHtml),
])

console.log(`Generated SEO files for ${urls.length} URLs and ${agentDocuments.size - 1} Markdown pages at ${siteUrl}`)
