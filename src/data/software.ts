import type { SoftwareProject } from '../types/software'

const documents = import.meta.glob<SoftwareProject>('../content/software/*.md', {
  query: '?software-meta',
  import: 'default',
  eager: true,
})

export const softwareProjects = Object.values(documents)
  .sort((a, b) => Number(b.year) - Number(a.year) || a.order - b.order)

export const softwareDocumentPaths = new Map(
  Object.entries(documents).map(([path, project]) => [project.slug, path]),
)

export const featuredProjects = softwareProjects.filter(project => project.featured)

export function getSoftwareBySlug(slug: string) {
  return softwareProjects.find(project => project.slug === slug)
}
