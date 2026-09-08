import type { SoftwareDetailMetadata } from '../types/software'

// Only the detail route imports this small index; it contains no article HTML.
const documents = import.meta.glob<SoftwareDetailMetadata>('../content/software/*.md', {
  query: '?software-seo', import: 'default', eager: true,
})
const metadata = new Map(Object.values(documents).map(document => [document.slug, document]))

export function getSoftwareSeo(slug: string) {
  return metadata.get(slug)
}
