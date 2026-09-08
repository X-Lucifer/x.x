import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type { Plugin } from 'vite'
import type { SoftwareDetailMetadata, SoftwareProject } from '../src/types/software.ts'

function parseList(value = ''): string[] {
  return value.replace(/^\[|\]$/g, '').split(',')
    .map(item => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
}

export function parseSoftwareDocument(path: string, source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error(`软件文档缺少 frontmatter: ${path}`)
  const metadata = Object.fromEntries(match[1]!.split(/\r?\n/).flatMap(line => {
    const separator = line.indexOf(':')
    return separator < 0 ? [] : [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]]
  }))
  const slug = metadata.slug || path.split(/[\\/]/).at(-1)?.replace(/\.md$/, '') || ''
  const project: SoftwareProject = {
    slug,
    title: metadata.title || slug,
    summary: metadata.summary || '',
    category: metadata.category || 'Tool',
    year: metadata.year || new Date().getFullYear().toString(),
    order: Number(metadata.order || 999),
    status: metadata.status || 'Active',
    accent: metadata.accent || '#79d9c1',
    stack: parseList(metadata.stack),
    featured: metadata.featured === 'true',
    repo: metadata.repo || undefined,
    demo: metadata.demo || undefined,
    demoLabel: metadata.demoLabel || undefined,
  }
  const detail: SoftwareDetailMetadata = {
    slug,
    title: metadata.seoTitle || `${project.title} — ${project.category} | X.LUCIFER`,
    description: metadata.seoDescription || project.summary,
    keywords: parseList(metadata.keywords || `[${project.title}, ${project.category}]`),
    programmingLanguages: parseList(metadata.languages),
    operatingSystems: parseList(metadata.platforms),
    applicationCategory: metadata.appCategory || 'DeveloperApplication',
    features: parseList(metadata.features),
    headings: [],
    screenshots: [],
  }
  return { project, detail, body: match[2]!.trim() }
}

function addHeadings(tokens: Token[], detail: SoftwareDetailMetadata) {
  const used = new Set<string>()
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    if (token.type !== 'heading_open') continue
    const text = tokens[i + 1]?.children?.filter(child => child.type === 'text' || child.type === 'code_inline')
      .map(child => child.content).join('') || ''
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section'
    let id = base
    for (let suffix = 2; used.has(id); suffix++) id = `${base}-${suffix}`
    used.add(id)
    token.attrSet('id', id)
    if (token.tag === 'h2') detail.headings.push({ id, text })
  }
}

/** Keep the Markdown parser and source text entirely in the build/dev process. */
export function softwareMarkdown(): Plugin {
  const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true })
  let publicDirectory = resolve('public')
  return {
    name: 'software-markdown',
    enforce: 'pre',
    configResolved(config) { publicDirectory = config.publicDir },
    handleHotUpdate({ file, server }) {
      if (!file.replaceAll('\\', '/').includes('/src/content/software/') || !file.endsWith('.md')) return
      // Metadata, SEO and the cached body must advance to the same document version.
      server.ws.send({ type: 'full-reload' })
      return []
    },
    async load(id) {
      const separator = id.indexOf('?')
      if (separator < 0 || !id.slice(0, separator).endsWith('.md')) return
      const query = new URLSearchParams(id.slice(separator + 1))
      if (!['software-meta', 'software-html', 'software-seo'].some(key => query.has(key))) return
      const filename = id.slice(0, separator)
      this.addWatchFile(filename)
      const { project, detail, body } = parseSoftwareDocument(filename, await readFile(filename, 'utf8'))
      if (query.has('software-meta')) return { code: `export default ${JSON.stringify(project)}`, map: null }
      const tokens = markdown.parse(body, {})
      addHeadings(tokens, detail)
      for (const token of tokens) {
        if (token.type === 'th_open') token.attrSet('scope', 'col')
      }
      const images = tokens.flatMap(token => token.children ?? []).filter(token => token.type === 'image')
      for (const token of images) {
        token.attrSet('loading', 'lazy')
        token.attrSet('decoding', 'async')
        const src = token.attrGet('src') || ''
        // Project previews live at a known, deployment-independent relative path.
        if (!/^\.\.\/\.\.\/previews\/[\w/-]+\.png$/.test(src)) continue
        const path = src.slice('../../'.length)
        const imagePath = resolve(publicDirectory, path)
        this.addWatchFile(imagePath)
        const png = await readFile(imagePath)
        if (png.length < 24 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
          throw new Error(`软件预览不是有效 PNG: ${imagePath}`)
        }
        const width = png.readUInt32BE(16)
        const height = png.readUInt32BE(20)
        token.attrSet('width', String(width))
        token.attrSet('height', String(height))
        detail.screenshots.push({ path, alt: token.content, width, height })
      }
      const value = query.has('software-seo') ? detail : markdown.renderer.render(tokens, markdown.options, {})
      return { code: `export default ${JSON.stringify(value)}`, map: null }
    },
  }
}
