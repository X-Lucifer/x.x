import type { SoftwareProject } from '../types/software.ts'

type ToolOptions = { signal?: AbortSignal }
export interface SiteTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations: { readOnlyHint: true; consequentialHint: false }
  execute(input: unknown, options?: ToolOptions): unknown | Promise<unknown>
}

export interface ProjectToolSources {
  pageUrl(slug: string): string
  loadMarkdown(slug: string, signal?: AbortSignal): Promise<{ url: string; markdown: string }>
}

function failure(code: string, message: string) {
  return { ok: false, error: { code, message } }
}

function argumentsObject(input: unknown, allowed: string[]): Record<string, unknown> | undefined {
  const value = input === undefined ? {} : input
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  if (Object.keys(value).some(key => !allowed.includes(key))) return
  return value as Record<string, unknown>
}

/** Only public, published project information is exposed by these read-only tools. */
export function createProjectTools(projects: readonly SoftwareProject[], sources: ProjectToolSources): SiteTool[] {
  const categories = [...new Set(projects.map(project => project.category))]
  const bySlug = new Map(projects.map(project => [project.slug, project]))
  const describe = (project: SoftwareProject) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    category: project.category,
    status: project.status,
    year: project.year,
    stack: [...project.stack],
    url: sources.pageUrl(project.slug),
    ...(project.repo ? { repository: project.repo } : {}),
    ...(project.demo ? { demo: project.demo } : {}),
  })
  return [
    {
      name: 'list_projects',
      description: 'List the public open-source software projects on X.LUCIFER, optionally filtered by an exact category. Returns summaries, project slugs and source links. Use get_project for a project’s complete published documentation.',
      inputSchema: {
        type: 'object',
        properties: { category: { type: 'string', enum: categories, description: 'Optional exact project category; omit to list all projects.' } },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, consequentialHint: false },
      execute(input) {
        const args = argumentsObject(input, ['category'])
        if (!args || args.category !== undefined && (typeof args.category !== 'string' || !categories.includes(args.category))) {
          return failure('INVALID_ARGUMENTS', `Use an object with an optional category from: ${categories.join(', ')}.`)
        }
        const selected = args.category === undefined ? projects : projects.filter(project => project.category === args.category)
        return { ok: true, categories: [...categories], projects: selected.map(describe) }
      },
    },
    {
      name: 'get_project',
      description: 'Read a project’s complete public Markdown documentation, summary and repository links from X.LUCIFER. Pass a slug returned by list_projects. Fetches only that project’s published document without navigating or changing the page.',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string', enum: [...bySlug.keys()], description: 'Exact project slug returned by list_projects.' } },
        required: ['slug'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, consequentialHint: false },
      async execute(input, options) {
        const args = argumentsObject(input, ['slug'])
        if (!args || typeof args.slug !== 'string') return failure('INVALID_ARGUMENTS', 'Provide an object containing only a string slug from list_projects.')
        const project = bySlug.get(args.slug)
        if (!project) return failure('UNKNOWN_PROJECT', 'No published project has this slug. Use list_projects to find a valid slug.')
        if (options?.signal?.aborted) return failure('CANCELLED', 'Project lookup was cancelled.')
        try {
          const document = await sources.loadMarkdown(project.slug, options?.signal)
          if (options?.signal?.aborted) return failure('CANCELLED', 'Project lookup was cancelled.')
          return { ok: true, project: describe(project), document: { url: document.url, format: 'text/markdown', text: document.markdown } }
        } catch {
          return options?.signal?.aborted
            ? failure('CANCELLED', 'Project lookup was cancelled.')
            : failure('DOCUMENT_UNAVAILABLE', 'The published document could not be loaded. Retry or use the project page returned by list_projects.')
        }
      },
    },
  ]
}
