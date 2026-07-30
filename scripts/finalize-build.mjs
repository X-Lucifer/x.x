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
      html.replaceAll('./assets/', `${assetPrefix}assets/`),
    )

    for (const asset of publicHeadAssets) {
      if (!finalized.includes(`href="${assetPrefix}${asset}"`)) {
        throw new Error(`Failed to finalize ${asset} path in ${file}`)
      }
    }

    await writeFile(file, finalized)
  }),
)

console.log(`Finalized relative asset paths in ${indexFiles.length} HTML pages`)
