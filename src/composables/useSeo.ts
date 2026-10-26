import { useHead } from '@unhead/vue'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { useRouter } from 'vue-router'
import { agentDiscoveryLinks } from '../data/agentDiscovery'
import { siteConfig } from '../data/site'
import { createSiteStructuredData, serializeStructuredData, type StructuredData } from '../data/structuredData'

export interface SeoConfig {
  title: string
  description: string
  path: string
  keywords?: readonly string[]
  type?: 'website' | 'article' | 'profile'
  robots?: string
  image?: { path: string; alt: string; width: number; height: number }
  structuredData?: StructuredData | StructuredData[]
}

const fallbackSiteUrl = 'https://xlucifer.top/'

export const siteStructuredData = createSiteStructuredData(
  import.meta.env.VITE_SITE_URL || fallbackSiteUrl,
  siteConfig,
)
export const { siteUrl, absoluteUrl, pageUrl } = siteStructuredData

export function useSeo(config: MaybeRefOrGetter<SeoConfig>) {
  const router = useRouter()
  useHead(() => {
    const seo = toValue(config)
    const canonical = pageUrl(seo.path)
    const keywords = [...new Set(seo.keywords ?? siteConfig.defaultKeywords)]
    const structuredData = seo.structuredData && !/\bnoindex\b/i.test(seo.robots ?? '')
      ? serializeStructuredData(seo.structuredData)
      : undefined
    const socialImage = absoluteUrl(seo.image?.path ?? '/social-card.png')
    const socialImageAlt = seo.image?.alt ?? `${siteConfig.brand} 独角兽标志与软件工程作品站`

    return {
      title: seo.title,
      htmlAttrs: {
        lang: 'zh-CN',
      },
      link: [
        { rel: 'canonical', href: canonical },
        { rel: 'sitemap', type: 'application/xml', href: absoluteUrl('/sitemap.xml') },
        ...(/\bnoindex\b/i.test(seo.robots ?? '') ? [] : agentDiscoveryLinks(
          seo.path,
          import.meta.env.SSR ? undefined : router.options.history.base,
        )),
      ],
      meta: [
        { name: 'description', content: seo.description },
        { name: 'keywords', content: keywords.join(', ') },
        { name: 'author', content: siteConfig.name },
        { name: 'robots', content: seo.robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:site_name', content: siteConfig.brand },
        { property: 'og:type', content: seo.type ?? 'website' },
        { property: 'og:title', content: seo.title },
        { property: 'og:description', content: seo.description },
        { property: 'og:url', content: canonical },
        { property: 'og:image', content: socialImage },
        { property: 'og:image:secure_url', content: socialImage },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: String(seo.image?.width ?? 1200) },
        { property: 'og:image:height', content: String(seo.image?.height ?? 630) },
        { property: 'og:image:alt', content: socialImageAlt },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seo.title },
        { name: 'twitter:description', content: seo.description },
        { name: 'twitter:image', content: socialImage },
        { name: 'twitter:image:alt', content: socialImageAlt },
      ],
      script: structuredData
        ? [
            {
              type: 'application/ld+json',
              key: 'page-schema',
              textContent: structuredData,
            },
          ]
        : [],
    }
  })
}
