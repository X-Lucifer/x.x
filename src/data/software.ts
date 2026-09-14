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

// The first and fourth cards occupy the wide diagonal on the homepage.
const featuredProjectOrder = [
  'tauri-obsidian-lite',
  'x-xray',
  'x-webdav-server',
  'x-superresolution',
]

export const featuredProjects = featuredProjectOrder
  .map(slug => softwareProjects.find(project => project.slug === slug && project.featured))
  .filter((project): project is SoftwareProject => project !== undefined)

export function getSoftwareBySlug(slug: string) {
  return softwareProjects.find(project => project.slug === slug)
}
