import { softwareProjects } from '../data/software'
import { createProjectTools } from './projectTools.ts'
import { registerTools } from './toolRegistration.ts'
import type { NativeModelContext, ToolRegistration } from './toolRegistration.ts'

let active: ToolRegistration | undefined

/** Progressive enhancement: do not install a shim or claim support without the native API. */
export function registerSiteTools(): ToolRegistration {
  if (typeof document === 'undefined' || typeof window === 'undefined') return registerTools(undefined, [])
  const context = (document as Document & { modelContext?: NativeModelContext }).modelContext
  if (!context || typeof context.registerTool !== 'function') return registerTools(undefined, [])
  const base = location.pathname === '/x.x' || location.pathname.startsWith('/x.x/') ? '/x.x/' : '/'
  const deployment = new URL(base, location.origin)
  const configuredSite = import.meta.env.VITE_SITE_URL || 'https://xlucifer.top/'
  const canonicalBase = configuredSite.endsWith('/') ? configuredSite : `${configuredSite}/`
  active = registerTools(context, createProjectTools(softwareProjects, {
    pageUrl: slug => new URL(`software/${slug}/`, canonicalBase).href,
    async loadMarkdown(slug, signal) {
      const url = new URL(`software/${encodeURIComponent(slug)}/index.md`, deployment).href
      const response = await fetch(url, { signal, credentials: 'omit', redirect: 'error', headers: { Accept: 'text/markdown, text/plain;q=0.9' } })
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) throw new Error('Published document unavailable')
      return { url, markdown: await response.text() }
    },
  }))
  return active
}

if (import.meta.hot) import.meta.hot.dispose(() => active?.dispose())
