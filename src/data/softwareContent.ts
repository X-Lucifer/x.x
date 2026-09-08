import { softwareDocumentPaths } from './software'

const documents = import.meta.glob<string>('../content/software/*.md', {
  query: '?software-html',
  import: 'default',
})
const content = new Map<string, string>()
const pending = new Map<string, Promise<void>>()

/** Navigation waits for only the selected document before mounting its view. */
export async function loadSoftwareContent(slug: string) {
  if (content.has(slug)) return
  const path = softwareDocumentPaths.get(slug)
  const load = path ? documents[path] : undefined
  if (!load) return

  // Direct visits already contain the complete SSG document. Reuse those bytes
  // for hydration instead of downloading the same article as a second asset.
  if (!import.meta.env.SSR) {
    const rendered = document.querySelector<HTMLElement>('[data-software-slug]')
    const body = rendered?.querySelector<HTMLElement>('.markdown-body')
    if (rendered?.dataset.softwareSlug === slug && body) {
      content.set(slug, body.innerHTML)
      return
    }
  }

  let request = pending.get(slug)
  if (!request) {
    request = load().then(html => { content.set(slug, html) })
      .finally(() => { pending.delete(slug) })
    pending.set(slug, request)
  }
  await request
}

export function getSoftwareContent(slug: string) {
  return content.get(slug) ?? ''
}
