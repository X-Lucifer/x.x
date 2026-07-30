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

await Promise.all(
  indexFiles.map(async (file) => {
    const directory = dirname(file)
    const relativeDirectory = relative(distDir, directory)
    const depth = relativeDirectory ? relativeDirectory.split(sep).length : 0
    const assetPrefix = depth === 0 ? './' : '../'.repeat(depth)
    const html = await readFile(file, 'utf8')
    const finalized = html
      .replaceAll('./assets/', `${assetPrefix}assets/`)
      .replaceAll('./favicon.svg', `${assetPrefix}favicon.svg`)

    await writeFile(file, finalized)
  }),
)

console.log(`Finalized relative asset paths in ${indexFiles.length} HTML pages`)
