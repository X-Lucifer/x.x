export interface SoftwareProject {
  slug: string
  title: string
  summary: string
  category: string
  year: string
  order: number
  status: string
  accent: string
  stack: string[]
  featured: boolean
  repo?: string
  demo?: string
  demoLabel?: string
  body: string
  html: string
}
