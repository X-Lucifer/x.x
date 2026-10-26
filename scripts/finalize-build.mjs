import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'

const distDir = join(process.cwd(), 'dist')

async function findIndexFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return findIndexFiles(path)
      return entry.name === 'index.html' ? [path] : []
    }),
  )

  return files.flat()
}

const indexFiles = await findIndexFiles(distDir)
// These are the two font subsets used above the fold on every page. Discover
// their hashed URLs at build time so CSS does not delay the font requests.
const assets = await readdir(join(distDir, 'assets'))
const criticalFonts = ['space-grotesk', 'jetbrains-mono'].map(family => {
  const file = assets.find(asset => new RegExp(`^${family}-latin-wght-normal-[\\w-]+\\.woff2$`).test(asset))
  if (!file) throw new Error(`Missing critical font: ${family}`)
  return file
})
const styles = new Map(await Promise.all(assets.filter(asset => asset.endsWith('.css')).map(async asset => [
  asset, await readFile(join(distDir, 'assets', asset), 'utf8'),
])))

function inlinePageStyles(html, assetPrefix) {
  // SSG knows exactly which styles each page needs. Inline that page's CSS so
  // reading never waits for a second network round trip; warm the normal cached
  // stylesheets asynchronously for subsequent client-side navigation.
  const previousStyles = new Set()
  const withoutGeneratedStyles = html.replace(/<style\b(?:[^"'<>]|"[^"]*"|'[^']*')*>[\s\S]*?<\/style>/gi, style => {
    const name = attribute(style.match(/^<style\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/i)[0], 'data-page-styles')
    if (!name || !styles.has(name)) return style
    previousStyles.add(name)
    return ''
  })
  return withoutGeneratedStyles.replace(/<link\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi, link => {
    if (attribute(link, 'rel') !== 'stylesheet') return link
    const href = attribute(link, 'href')
    const name = href?.startsWith(`${assetPrefix}assets/`) ? href.slice(`${assetPrefix}assets/`.length) : undefined
    const css = name && styles.get(name)
    if (css === undefined) return link
    const previousOnload = attribute(link, 'onload')
    // Recognize output from the previous finalizer as well as our marked links.
    const legacyCache = previousStyles.has(name) && previousOnload === "this.media='all'"
    const originalMedia = attribute(link, 'data-original-media') ?? (legacyCache ? 'all' : attribute(link, 'media')) ?? 'all'
    const originalOnload = attribute(link, 'data-original-onload')
      ?? (attribute(link, 'data-page-style-cache') || legacyCache ? '' : previousOnload ?? '')
    const inlined = css.replace(/url\(\s*(?:(["'])(.*?)\1|([^\s)]+))\s*\)/g,
      (match, quote, quoted, unquoted) => {
        const asset = quoted ?? unquoted
        if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(asset)) return match
        return `url(${quote ?? ''}${assetPrefix}assets/${asset.replace(/^\.\//, '')}${quote ?? ''})`
      }).replace(/<\/style/gi, '<\\/style')
    let cached = setAttribute(link, 'data-page-style-cache', name)
    cached = setAttribute(cached, 'data-original-media', originalMedia)
    cached = setAttribute(cached, 'data-original-onload', originalOnload || undefined)
    cached = setAttribute(cached, 'media', 'print')
    cached = setAttribute(cached, 'onload', `this.onload=null;this.media=this.dataset.originalMedia;${originalOnload}`)
    const media = originalMedia === 'all' ? '' : ` media="${escapeAttribute(originalMedia)}"`
    return `<style data-page-styles="${escapeAttribute(name)}"${media}>${inlined}</style>${cached}`
  })
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  const value = match?.[1] ?? match?.[2] ?? match?.[3]
  return value?.replace(/&(?:quot|apos|lt|gt|amp|#(\d+)|#x([\da-f]+));/gi, (entity, decimal, hex) => {
    if (decimal || hex) return String.fromCodePoint(parseInt(decimal ?? hex, decimal ? 10 : 16))
    return { '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&amp;': '&' }[entity.toLowerCase()]
  })
}

function setAttribute(tag, name, value) {
  const removed = tag.replace(new RegExp(`\\s${name}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?(?=\\s|/?>)`, 'gi'), '')
  return value === undefined ? removed : removed.replace(/\s*\/?>$/, ending => ` ${name}="${escapeAttribute(value)}"${ending.trimStart()}`)
}

function rewriteBuiltAssetTags(html, assetPrefix) {
  // Match complete resource attributes. A global './assets/' replacement also
  // matches the tail of '../../assets/' and corrupts paths on a second run.
  return html.replace(/<(?:script|link)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi, tag => {
    const normalized = tag.replace(/(\s(?:href|src)\s*=\s*)(["'])((?:(?:\.\.?\/)+|\/)?assets\/[^"']+)\2/gi,
      (_match, start, quote, path) => `${start}${quote}${assetPrefix}${path.replace(/^(?:(?:\.\.?\/)+|\/)?/, '')}${quote}`)
    // The full SSG page is already readable. Let its typography arrive before
    // the larger hydration modules compete for a constrained connection.
    return attribute(normalized, 'type') === 'module' || attribute(normalized, 'rel') === 'modulepreload'
      ? setAttribute(normalized, 'fetchpriority', 'low') : normalized
  })
}

function preloadFonts(html, assetPrefix) {
  const withoutPreloads = html.replace(/<link\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi, link => {
    const name = attribute(link, 'href')?.split('/').at(-1)
    return attribute(link, 'rel') === 'preload' && attribute(link, 'as') === 'font' && criticalFonts.includes(name) ? '' : link
  })
  return withoutPreloads.replace(/<meta\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi, meta => attribute(meta, 'name') === 'viewport'
    ? `${meta}${criticalFonts.map(font => `<link rel="preload" href="${assetPrefix}assets/${font}" as="font" type="font/woff2" fetchpriority="high" crossorigin>`).join('')}`
    : meta)
}
const publicHeadAssets = [
  'favicon.svg',
  'favicon-32x32.png',
  'favicon-16x16.png',
  'apple-touch-icon-120.png',
  'apple-touch-icon-152.png',
  'apple-touch-icon-167.png',
  'apple-touch-icon.png',
  'site.webmanifest',
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function rewritePublicAssetHref(content, asset, assetPrefix) {
  const assetPattern = escapeRegExp(asset)
  const hrefPattern = new RegExp(
    `href=(["'])(?:/|(?:\\.{1,2}/)*)${assetPattern}\\1`,
    'g',
  )

  return content.replace(
    hrefPattern,
    (_match, quote) => `href=${quote}${assetPrefix}${asset}${quote}`,
  )
}

await Promise.all(
  indexFiles.map(async (file) => {
    const directory = dirname(file)
    const relativeDirectory = relative(distDir, directory)
    const depth = relativeDirectory ? relativeDirectory.split(sep).length : 0
    const assetPrefix = depth === 0 ? './' : '../'.repeat(depth)
    const html = await readFile(file, 'utf8')
    const finalized = publicHeadAssets.reduce(
      (content, asset) => rewritePublicAssetHref(content, asset, assetPrefix),
      preloadFonts(inlinePageStyles(rewriteBuiltAssetTags(html, assetPrefix), assetPrefix), assetPrefix),
    )

    for (const asset of publicHeadAssets) {
      if (!new RegExp(`href=(["'])${escapeRegExp(assetPrefix + asset)}\\1`).test(finalized)) {
        throw new Error(`Failed to finalize ${asset} path in ${file}`)
      }
    }

    await writeFile(file, finalized)
  }),
)

console.log(`Finalized relative asset paths in ${indexFiles.length} HTML pages`)
