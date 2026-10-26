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

