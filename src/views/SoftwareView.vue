<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import SoftwareCard from '../components/software/SoftwareCard.vue'
import { pageUrl, siteUrl, useSeo } from '../composables/useSeo'
import { softwareProjects } from '../data/software'

const activeCategory = shallowRef('全部')
const categories = ['全部', ...new Set(softwareProjects.map((project) => project.category))]
const visibleProjects = computed(() =>
  activeCategory.value === '全部'
    ? softwareProjects
    : softwareProjects.filter((project) => project.category === activeCategory.value),
)

const title = '开源软件作品 — 桌面应用、AI 图像处理与服务端 | X.LUCIFER'
const description =
  '浏览 X.LUCIFER 的开源软件作品，覆盖 AI 图像增强、Markdown 桌面客户端、静态资源服务以及 WebDAV、CalDAV、CardDAV 服务端。'

useSeo({
  title,
  description,
  path: '/software',
  keywords: [
    '开源软件作品',
    '桌面客户端',
    'AI 图像增强',
    'Markdown 编辑器',
    'WebDAV',
    'CalDAV',
    'CardDAV',
    '静态资源服务',
    ...softwareProjects.flatMap((project) => project.stack),
  ],
  structuredData: [
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl('/software')}#collection`,
      name: title,
      url: pageUrl('/software'),
      description,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${siteUrl}#website` },
    },
    {
      '@type': 'ItemList',
      name: 'X.LUCIFER 开源软件项目',
      numberOfItems: softwareProjects.length,
      itemListElement: softwareProjects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: project.title,
        url: pageUrl(`/software/${project.slug}`),
      })),
    },
  ],
})
</script>

<template>
  <div class="page container">
    <header class="page-header">
      <div>
        <p class="eyebrow">OPEN SOURCE / ARCHIVE</p>
        <h1 class="page-title">软件作品</h1>
      </div>
      <p class="page-description">
        覆盖 AI 图像增强、离线 Markdown 客户端、静态资源服务与 DAV 协议服务。
        每项作品均链接至公开源码，并记录产品边界、核心能力与工程实现。
      </p>
    </header>

    <div class="software-toolbar">
      <div class="filters" aria-label="按类型筛选">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="{ 'filter--active': activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
      <span class="result-count">{{ visibleProjects.length.toString().padStart(2, '0') }} PROJECTS</span>
    </div>

    <div class="software-grid">
      <SoftwareCard
        v-for="(project, index) in visibleProjects"
        :key="project.slug"
        :project="project"
        :index="index"
      />
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(5rem, 10vw, 8rem);
  padding-bottom: 7rem;
}

.page-header {
  display: grid;
  grid-template-columns: 1fr minmax(18rem, 0.65fr);
  gap: 3rem;
  align-items: end;
  padding-bottom: 3.5rem;
}

.page-title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(3.2rem, 8vw, 7rem);
  font-weight: 560;
  letter-spacing: -0.065em;
  line-height: 0.92;
}

.page-description {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.8;
}

.software-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.filters button {
  min-height: 2.35rem;
  padding: 0 0.8rem;
  border: 1px solid transparent;
  border-radius: 0.12rem;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.67rem;
}

.filters button:hover,
.filters .filter--active {
  border-color: var(--line);
  background: var(--surface-1);
  color: var(--text-strong);
}

.filters .filter--active {
  border-color: rgb(99 245 210 / 25%);
  color: var(--accent);
}

.result-count {
  flex: 0 0 auto;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.08em;
}

.software-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 700px) {
  .page-header {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .software-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .software-grid {
    grid-template-columns: 1fr;
  }
}
</style>
