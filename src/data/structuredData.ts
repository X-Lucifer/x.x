import type { SoftwareDetailMetadata, SoftwareProject } from '../types/software'

export type StructuredData = Record<string, unknown>

interface SiteIdentity {
  name: string
  brand: string
  role: string
  description: string
  github: string
  email: string
}

interface PageDescription {
  title: string
  description: string
}

const reference = (id: string) => ({ '@id': id })

/** Pure builders shared by SSR and client navigation; the canonical base owns every URL. */
export function createSiteStructuredData(base: string, identity: SiteIdentity) {
  const siteUrl = base.endsWith('/') ? base : `${base}/`
  const absoluteUrl = (path = '/') => new URL(path.replace(/^\/+/, ''), siteUrl).href
  const pageUrl = (path = '/') => {
    const relative = path.replace(/^\/+|\/+$/g, '')
    return relative ? absoluteUrl(`${relative}/`) : siteUrl
  }
  const personId = `${siteUrl}#person`
  const websiteId = `${siteUrl}#website`

  function person(): StructuredData {
    return {
      '@type': 'Person',
      '@id': personId,
      name: identity.name,
      alternateName: identity.brand,
      description: identity.role,
      jobTitle: '全栈软件工程师',
      url: pageUrl('/about'),
      email: `mailto:${identity.email}`,
      sameAs: [identity.github],
      knowsAbout: ['桌面客户端开发', '服务端开发', '开源软件', 'AI 图像处理', 'C#', '.NET', 'Rust', 'Go', 'C++', 'Vue', 'TypeScript'],
    }
  }

  function website(): StructuredData {
    return {
      '@type': 'WebSite',
      '@id': websiteId,
      name: identity.brand,
      alternateName: `${identity.name} 的开源软件作品站`,
      url: siteUrl,
      description: identity.description,
      inLanguage: 'zh-CN',
      publisher: reference(personId),
    }
  }

  function page(type: string, path: string, content: PageDescription): StructuredData {
    const url = pageUrl(path)
    return {
      '@type': type,
      '@id': `${url}#webpage`,
      name: content.title,
      url,
      description: content.description,
      inLanguage: 'zh-CN',
      isPartOf: reference(websiteId),
    }
  }

  function projectList(id: string, name: string, projects: readonly SoftwareProject[]): StructuredData {
    return {
      '@type': 'ItemList',
      '@id': id,
      name,
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: project.title,
        url: pageUrl(`/software/${project.slug}`),
      })),
    }
  }

  function home(content: PageDescription, featured: readonly SoftwareProject[]): StructuredData[] {
    const listId = `${siteUrl}#featured-projects`
    return [
      person(),
      website(),
      {
        ...page('WebPage', '/', content),
        about: reference(personId),
        mainEntity: reference(personId),
        mentions: reference(listId),
      },
      projectList(listId, '精选软件作品', featured),
    ]
  }

  function profile(content: PageDescription): StructuredData[] {
    return [
      person(),
      website(),
      { ...page('ProfilePage', '/about', content), mainEntity: reference(personId) },
    ]
  }

  function collection(content: PageDescription, projects: readonly SoftwareProject[]): StructuredData[] {
    const listId = `${pageUrl('/software')}#projects`
    return [
      person(),
      website(),
      { ...page('CollectionPage', '/software', content), mainEntity: reference(listId) },
      projectList(listId, `${identity.brand} 开源软件项目`, projects),
    ]
  }

  function software(project: SoftwareProject, detail: SoftwareDetailMetadata): StructuredData[] {
    const path = `/software/${project.slug}`
    const canonical = pageUrl(path)
    const pageId = `${canonical}#webpage`
    const softwareId = `${canonical}#software`
    const sourceId = `${canonical}#source`
    const breadcrumbId = `${canonical}#breadcrumb`
    const screenshots = detail.screenshots.map((image, index) => ({
      '@type': 'ImageObject',
      '@id': `${canonical}#screenshot-${index + 1}`,
      url: absoluteUrl(image.path),
      contentUrl: absoluteUrl(image.path),
      caption: image.alt,
      width: image.width,
      height: image.height,
    }))
    const imageReferences = screenshots.map(image => reference(image['@id']))
    return [
      person(),
      website(),
      {
        ...page('WebPage', path, detail),
        mainEntity: reference(softwareId),
        breadcrumb: reference(breadcrumbId),
        ...(project.repo ? { mentions: reference(sourceId) } : {}),
        ...(imageReferences.length ? { primaryImageOfPage: imageReferences[0] } : {}),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': softwareId,
        name: project.title,
        url: canonical,
        description: detail.description,
        applicationCategory: detail.applicationCategory,
        ...(detail.operatingSystems.length ? { operatingSystem: detail.operatingSystems } : {}),
        ...(detail.features.length ? { featureList: detail.features } : {}),
        ...(imageReferences.length ? { screenshot: imageReferences } : {}),
        author: reference(personId),
        mainEntityOfPage: reference(pageId),
      },
      ...(project.repo ? [{
        '@type': 'SoftwareSourceCode',
        '@id': sourceId,
        name: project.title,
        url: project.repo,
        codeRepository: project.repo,
        ...(detail.programmingLanguages.length ? { programmingLanguage: detail.programmingLanguages } : {}),
        targetProduct: reference(softwareId),
        author: reference(personId),
      }] : []),
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: '软件作品', item: pageUrl('/software') },
          { '@type': 'ListItem', position: 3, name: project.title, item: canonical },
        ],
      },
      ...screenshots,
    ]
  }

  return { siteUrl, absoluteUrl, pageUrl, home, profile, collection, software }
}

export function serializeStructuredData(data: StructuredData | StructuredData[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': Array.isArray(data) ? data : [data],
  }).replaceAll('<', '\\u003c')
}
