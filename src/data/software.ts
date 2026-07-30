import MarkdownIt from 'markdown-it'
import type { SoftwareProject } from '../types/software'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const documents = import.meta.glob('../content/software/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseList(value = ''): string[] {
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

function parseDocument(path: string, source: string): SoftwareProject {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!match) {
    throw new Error(`软件文档缺少 frontmatter: ${path}`)
  }

  const metadata = Object.fromEntries(
    match[1].split(/\r?\n/).flatMap((line) => {
      const separator = line.indexOf(':')
      if (separator < 0) return []
      return [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]]
    }),
  )

  const body = match[2].trim()
  const fileSlug = path.split('/').at(-1)?.replace(/\.md$/, '') ?? ''
  const slug = metadata.slug || fileSlug

  return {
    slug,
    title: metadata.title || slug,
    summary: metadata.summary || '',
    category: metadata.category || 'Tool',
    year: metadata.year || new Date().getFullYear().toString(),
    order: Number(metadata.order || 999),
    status: metadata.status || 'Active',
    accent: metadata.accent || '#63f5d2',
    stack: parseList(metadata.stack),
    featured: metadata.featured === 'true',
    repo: metadata.repo || undefined,
    demo: metadata.demo || undefined,
    demoLabel: metadata.demoLabel || undefined,
    body,
    // Markdown source is repository-owned, while raw HTML is disabled above.
    // Keeping rendering platform-neutral allows the same content to be generated during SSG.
    html: markdown.render(body),
  }
}

export const softwareProjects = Object.entries(documents)
  .map(([path, source]) => parseDocument(path, source))
  .sort((a, b) => Number(b.year) - Number(a.year) || a.order - b.order)

export const featuredProjects = softwareProjects.filter((project) => project.featured)

export function getSoftwareBySlug(slug: string) {
  return softwareProjects.find((project) => project.slug === slug)
}
