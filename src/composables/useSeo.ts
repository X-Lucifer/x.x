import { useHead } from '@unhead/vue'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { siteConfig } from '../data/site'

type StructuredData = Record<string, unknown>

export interface SeoConfig {
  title: string
  description: string
  path: string
  keywords?: readonly string[]
  type?: 'website' | 'article' | 'profile'
  robots?: string
  structuredData?: StructuredData | StructuredData[]
}

const fallbackSiteUrl = 'https://xlucifer.top/'

export const siteUrl = ensureTrailingSlash(
  import.meta.env.VITE_SITE_URL || fallbackSiteUrl,
)

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}

export function absoluteUrl(path = '/') {
  const relativePath = path.replace(/^\/+/, '')
  return new URL(relativePath, siteUrl).href
}

export function pageUrl(path = '/') {
  const relativePath = path.replace(/^\/+|\/+$/g, '')
  return relativePath ? absoluteUrl(`${relativePath}/`) : siteUrl
}

export function personSchema(): StructuredData {
  return {
    '@type': 'Person',
    '@id': `${siteUrl}#person`,
    name: siteConfig.name,
    alternateName: siteConfig.brand,
    description: siteConfig.description,
    jobTitle: '全栈软件工程师',
    url: siteUrl,
    email: `mailto:${siteConfig.email}`,
    sameAs: [siteConfig.github],
    knowsAbout: [
      '桌面客户端开发',
      '服务端开发',
      '开源软件',
      'AI 图像处理',
      'C#',
      '.NET',
      'Rust',
      'Go',
      'Vue',
      'TypeScript',
    ],
  }
}

function asSchemaGraph(data: StructuredData | StructuredData[]) {
  const graph = Array.isArray(data) ? data : [data]

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function useSeo(config: MaybeRefOrGetter<SeoConfig>) {
  useHead(() => {
    const seo = toValue(config)
    const canonical = pageUrl(seo.path)
    const keywords = [...new Set(seo.keywords ?? siteConfig.defaultKeywords)]
    const structuredData = seo.structuredData
      ? asSchemaGraph(seo.structuredData)
      : undefined

    return {
      title: seo.title,
      htmlAttrs: {
        lang: 'zh-CN',
      },
      link: [
        { rel: 'canonical', href: canonical },
        { rel: 'sitemap', type: 'application/xml', href: absoluteUrl('/sitemap.xml') },
      ],
      meta: [
        { name: 'description', content: seo.description },
        { name: 'keywords', content: keywords.join(', ') },
        { name: 'author', content: siteConfig.name },
        { name: 'robots', content: seo.robots ?? 'index, follow, max-image-preview:large' },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:site_name', content: siteConfig.brand },
        { property: 'og:type', content: seo.type ?? 'website' },
        { property: 'og:title', content: seo.title },
        { property: 'og:description', content: seo.description },
        { property: 'og:url', content: canonical },
        { property: 'og:image', content: absoluteUrl('/favicon.svg') },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: seo.title },
        { name: 'twitter:description', content: seo.description },
        { name: 'twitter:image', content: absoluteUrl('/favicon.svg') },
      ],
      script: structuredData
        ? [
            {
              type: 'application/ld+json',
              textContent: JSON.stringify(structuredData),
            },
          ]
        : [],
    }
  })
}
