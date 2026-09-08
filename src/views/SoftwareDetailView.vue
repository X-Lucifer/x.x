<script setup lang="ts">
import { ArrowUpRight, Code2 } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from '../components/AppLink.vue'
import { absoluteUrl, pageUrl, personSchema, siteUrl, useSeo } from '../composables/useSeo'
import { getSoftwareBySlug } from '../data/software'
import { getSoftwareContent } from '../data/softwareContent'
import { getSoftwareSeo } from '../data/softwareSeo'

const route = useRoute()
const project = computed(() => getSoftwareBySlug(String(route.params.slug)))
const detail = computed(() => getSoftwareSeo(String(route.params.slug)))

useSeo(() => {
  const currentProject = project.value

  const metadata = detail.value
  if (!currentProject || !metadata) {
    return {
      title: '软件项目未找到 | X.LUCIFER',
      description: '请求的软件项目不存在，请返回 X.LUCIFER 软件作品列表。',
      path: route.path,
      robots: 'noindex, nofollow',
    }
  }

  const path = `/software/${currentProject.slug}`
  const canonical = pageUrl(path)
  const { title, description } = metadata
  const screenshots = metadata.screenshots.map(image => ({
    '@type': 'ImageObject', url: absoluteUrl(image.path),
    caption: image.alt, width: image.width, height: image.height,
  }))

  return {
    title,
    description,
    path,
    keywords: metadata.keywords,
    image: metadata.screenshots[0],
    structuredData: [
      personSchema(),
      {
        '@type': 'WebSite', '@id': `${siteUrl}#website`,
        url: siteUrl, name: 'X.LUCIFER', inLanguage: 'zh-CN',
        publisher: { '@id': `${siteUrl}#person` },
      },
      {
        '@type': 'WebPage', '@id': `${canonical}#webpage`,
        name: title, url: canonical, description, inLanguage: 'zh-CN',
        isPartOf: { '@id': `${siteUrl}#website` },
        mainEntity: { '@id': `${canonical}#software` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        ...(screenshots.length ? { primaryImageOfPage: screenshots[0] } : {}),
      },
      {
        '@type': 'SoftwareApplication', '@id': `${canonical}#software`,
        name: currentProject.title, url: canonical, description,
        applicationCategory: metadata.applicationCategory,
        operatingSystem: metadata.operatingSystems.join(', '),
        featureList: metadata.features,
        screenshot: screenshots.length ? screenshots : undefined,
        sameAs: currentProject.repo,
        author: { '@id': `${siteUrl}#person` },
        mainEntityOfPage: { '@id': `${canonical}#webpage` },
      },
      {
        '@type': 'SoftwareSourceCode', '@id': `${canonical}#source`,
        name: currentProject.title, codeRepository: currentProject.repo,
        programmingLanguage: metadata.programmingLanguages,
        runtimePlatform: currentProject.stack.join(', '),
        targetProduct: { '@id': `${canonical}#software` },
        author: { '@id': `${siteUrl}#person` },
      },
      {
        '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: '软件作品', item: pageUrl('/software') },
          { '@type': 'ListItem', position: 3, name: currentProject.title, item: canonical },
        ],
      },
    ],
  }
})
</script>

<template>
  <article v-if="project" class="detail" :data-software-slug="project.slug">
    <header class="detail-hero container">
      <nav class="detail-breadcrumb" aria-label="面包屑">
        <AppLink to="/">首页</AppLink>
        <span aria-hidden="true">/</span>
        <AppLink to="/software">软件作品</AppLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ project.title }}</span>
      </nav>

      <div class="detail-heading">
        <div>
          <p class="eyebrow">{{ project.category.toUpperCase() }} {{ project.year }}</p>
          <h1>{{ project.title }}</h1>
        </div>
        <p>{{ project.summary }}</p>
      </div>

      <div class="detail-actions">
        <a
          v-if="project.repo"
          class="button button--primary"
          data-spatial
          :href="project.repo"
          target="_blank"
          rel="noreferrer"
        >
          <Code2 :size="18" />
          查看源码
        </a>
        <a
          v-if="project.demo"
          class="button button--ghost"
          data-spatial
          :href="project.demo"
          target="_blank"
          rel="noreferrer"
        >
          {{ project.demoLabel || '在线体验' }}
          <ArrowUpRight :size="18" />
        </a>
      </div>

      <div class="detail-panel" data-spatial="subtle">
        <div class="detail-emblem" aria-hidden="true">
          <span>{{ project.title.slice(0, 1) }}</span>
        </div>
        <dl>
          <div>
            <dt>STATUS</dt>
            <dd>{{ project.status }}</dd>
          </div>
          <div>
            <dt>RELEASE</dt>
            <dd>{{ project.year }}</dd>
          </div>
          <div>
            <dt>STACK</dt>
            <dd>{{ project.stack.join(' · ') }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <div class="content-layout container">
      <aside class="content-aside">
        <span>PROJECT / BRIEF</span>
        <div class="aside-line" aria-hidden="true" />
        <nav v-if="detail?.headings.length" class="content-toc" aria-label="本文目录">
          <a v-for="heading in detail.headings" :key="heading.id" :href="`#${heading.id}`">{{ heading.text }}</a>
        </nav>
      </aside>
      <div class="markdown-body" v-html="getSoftwareContent(project.slug)" />
    </div>
  </article>

  <section v-else class="not-found container">
    <p class="eyebrow">PROJECT NOT FOUND</p>
    <h1>没有找到这个项目。</h1>
    <AppLink class="button button--primary" to="/software">返回软件列表</AppLink>
  </section>
</template>

<style scoped>
.detail {
  --project-accent: var(--accent);
}

.detail-hero {
  position: relative;
  padding-top: 4rem;
  padding-bottom: 5rem;
}

.detail-hero::before {
  position: absolute;
  z-index: -1;
  top: 0;
  right: -10rem;
  width: 38rem;
  height: 38rem;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 10%, transparent),
    transparent 67%
  );
  content: '';
}

.detail-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.detail-breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.detail-breadcrumb a:hover {
  color: var(--accent);
}

.detail-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.65fr);
  gap: 3rem;
  align-items: end;
  margin-top: 4rem;
}

.detail-heading h1,
.detail-heading p {
  margin: 0;
}

.detail-heading h1 {
  color: var(--text-strong);
  font-size: clamp(2rem, 5.5vw, 6rem);
  font-weight: 560;
  letter-spacing: -0.07em;
  line-height: 0.9;
  overflow-wrap: anywhere;
}

.detail-heading > p {
  color: var(--text-muted);
  font-size: 1.08rem;
  line-height: 1.8;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

.detail-panel {
  display: grid;
  grid-template-columns: 16rem 1fr;
  min-height: 16rem;
  margin-top: 4rem;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 0.25rem;
  background: var(--surface-1);
}

.detail-emblem {
  display: grid;
  place-items: center;
  border-right: 1px solid var(--line);
  background:
    radial-gradient(
      circle,
      color-mix(in srgb, var(--accent) 14%, transparent),
      transparent 62%
    ),
    repeating-radial-gradient(
      circle,
      transparent 0 1.3rem,
      color-mix(in srgb, var(--accent) 7%, transparent) 1.35rem
    );
}

.detail-emblem span {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 3.5rem;
  font-weight: 300;
  text-shadow: 0 0 2rem rgb(var(--accent-rgb) / 18%);
}

.detail-panel dl {
  display: grid;
  margin: 0;
}

.detail-panel dl div {
  display: grid;
  grid-template-columns: 8rem 1fr;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--line);
}

.detail-panel dl div:last-child {
  border-bottom: 0;
}

.detail-panel dt,
.detail-panel dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
}

.detail-panel dt {
  color: var(--text-dim);
}

.detail-panel dd {
  color: var(--text-strong);
}

.content-layout {
  display: grid;
  grid-template-columns: 15rem minmax(0, 45rem);
  justify-content: space-between;
  gap: clamp(3rem, 8vw, 8rem);
  padding-top: 5rem;
  padding-bottom: 8rem;
  border-top: 1px solid var(--line);
}

.content-aside {
  position: sticky;
  top: 7rem;
  align-self: start;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.07em;
}

.content-toc {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.75rem;
}

.content-toc a {
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  letter-spacing: 0;
  line-height: 1.65;
  text-decoration: none;
  transition: color 160ms ease;
}

.content-toc a:hover,
.content-toc a:focus-visible {
  color: var(--accent);
}

.aside-line {
  height: 1px;
  margin: 1rem 0;
  background: linear-gradient(90deg, var(--accent), transparent);
}

.markdown-body {
  min-width: 0;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.85;
}

.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  scroll-margin-top: 7rem;
  color: var(--text-strong);
  letter-spacing: -0.035em;
}

.markdown-body :deep(h2) {
  margin: 3.5rem 0 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
  font-size: 2rem;
}

.markdown-body :deep(h2:first-child) {
  margin-top: 0;
}

.markdown-body :deep(h3) {
  margin: 2.2rem 0 0.8rem;
  font-size: 1.25rem;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 1.25rem;
}

.markdown-body :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  margin: 1.5rem 0 2rem;
  border: 1px solid var(--line);
  border-radius: 0.3rem;
  background: var(--surface-1);
}

.markdown-body :deep(table) {
  width: 100%;
  margin: 1.5rem 0 2rem;
  border-collapse: collapse;
  font-size: 0.88rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}

.markdown-body :deep(th) {
  color: var(--text-strong);
  font-weight: 550;
  background: var(--surface-2);
}

.markdown-body :deep(strong) {
  color: var(--text-strong);
  font-weight: 550;
}

.markdown-body :deep(a) {
  color: var(--accent);
}

.markdown-body :deep(code) {
  padding: 0.18rem 0.4rem;
  border: 1px solid var(--line);
  border-radius: 0.12rem;
  background: var(--surface-2);
  color: var(--text-strong);
  font-family: var(--font-mono);
  font-size: 0.86em;
}

.markdown-body :deep(pre) {
  overflow-x: auto;
  margin: 1.5rem 0;
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: 0.2rem;
  background: var(--code-bg);
}

.markdown-body :deep(pre code) {
  padding: 0;
  border: 0;
  background: transparent;
}

.markdown-body :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 0.2rem 0 0.2rem 1.2rem;
  border-left: 2px solid var(--accent);
  color: var(--text-strong);
}

.not-found {
  display: grid;
  min-height: 70svh;
  align-content: center;
  justify-items: start;
}

.not-found h1 {
  margin: 0 0 2rem;
  color: var(--text-strong);
  font-size: clamp(2.3rem, 6.2vw, 4.4rem);
}

@media (max-width: 760px) {
  .detail-heading,
  .content-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-heading {
    gap: 1.5rem;
  }

  .detail-panel {
    grid-template-columns: 1fr;
  }

  .detail-emblem {
    min-height: 13rem;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .content-layout {
    gap: 2.5rem;
  }

  .content-aside {
    position: static;
  }

  .content-toc {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .detail-heading h1 {
    font-size: clamp(2rem, 9.7vw, 3rem);
    line-height: 1.05;
  }

  .detail-panel dl div {
    grid-template-columns: 6rem 1fr;
  }
}
</style>
