import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const projectRoot = process.cwd()
const publicDir = join(projectRoot, 'public')
const contentDir = join(projectRoot, 'src', 'content', 'software')
const fallbackSiteUrl = 'https://xlucifer.top/'
const siteUrl = ensureTrailingSlash(process.env.VITE_SITE_URL || fallbackSiteUrl)

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`
}

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

function parseSlug(source, filename) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const slug = frontmatter?.[1].match(/^slug:\s*(.+)$/m)?.[1].trim()

  return slug || filename.replace(/\.md$/, '')
}

const contentFiles = (await readdir(contentDir))
  .filter((filename) => filename.endsWith('.md'))
  .sort()

const softwareSlugs = await Promise.all(
  contentFiles.map(async (filename) => {
    const source = await readFile(join(contentDir, filename), 'utf8')
    return parseSlug(source, filename)
  }),
)

const paths = [
  '/',
  '/software',
  '/about',
  ...softwareSlugs.map((slug) => `/software/${slug}`),
]
const urls = paths.map(pageUrl)

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`).join('\n')}
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
      const basePath = location.pathname === '/x.x' || location.pathname.startsWith('/x.x/')
        ? '/x.x/'
        : '/'
      document.querySelector('#home-link').href = basePath
      document.querySelector('#software-link').href = basePath + 'software/'
    </script>
  </body>
</html>
`

await Promise.all([
  writeFile(join(publicDir, 'sitemap.xml'), sitemapXml),
  writeFile(join(publicDir, 'sitemap.txt'), sitemapText),
  writeFile(join(publicDir, 'robots.txt'), robotsText),
  writeFile(join(publicDir, '404.html'), notFoundHtml),
])

console.log(`Generated SEO files for ${urls.length} URLs at ${siteUrl}`)
