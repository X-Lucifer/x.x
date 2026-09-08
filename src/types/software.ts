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
}

export interface SoftwareDetailMetadata {
  slug: string
  title: string
  description: string
  keywords: string[]
  programmingLanguages: string[]
  operatingSystems: string[]
  applicationCategory: string
  features: string[]
  headings: { id: string; text: string }[]
  screenshots: { path: string; alt: string; width: number; height: number }[]
}
