<script setup lang="ts">
import { ArrowLeft, ArrowUpRight, Code2 } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from '../components/AppLink.vue'
import { pageUrl, siteUrl, useSeo } from '../composables/useSeo'
import { getSoftwareBySlug } from '../data/software'

const route = useRoute()
const project = computed(() => getSoftwareBySlug(String(route.params.slug)))
const projectStyle = computed(() => ({ '--project-accent': project.value?.accent ?? '#79d9c1' }))

useSeo(() => {
  const currentProject = project.value

  if (!currentProject) {
    return {
      title: '软件项目未找到 | X.LUCIFER',
      description: '请求的软件项目不存在，请返回 X.LUCIFER 软件作品列表。',
      path: route.path,
      robots: 'noindex, nofollow',
    }
  }

  const path = `/software/${currentProject.slug}`
  const title = `${currentProject.title} — ${currentProject.category}开源项目 | X.LUCIFER`
  const description = `${currentProject.summary} 核心技术栈：${currentProject.stack.join('、')}。查看项目能力、工程实现与开源仓库。`

  return {
    title,
    description,
    path,
    type: 'article',
    keywords: [
      currentProject.title,
      currentProject.category,
      ...currentProject.stack,
      '开源项目',
      '软件工程',
      'X.LUCIFER',
    ],
    structuredData: {
      '@type': 'SoftwareSourceCode',
      '@id': `${pageUrl(path)}#software`,
      name: currentProject.title,
      url: pageUrl(path),
      description,
      codeRepository: currentProject.repo,
      programmingLanguage: currentProject.stack,
      applicationCategory: currentProject.category,
      dateCreated: currentProject.year,
      inLanguage: 'zh-CN',
      author: { '@id': `${siteUrl}#person` },
    },
  }
})
</script>

<template>
  <article v-if="project" class="detail" :style="projectStyle">
    <header class="detail-hero container">
      <AppLink class="back-link" to="/software">
        <ArrowLeft :size="16" />
        返回软件列表
      </AppLink>

      <div class="detail-heading">
        <div>
          <p class="eyebrow">{{ project.category.toUpperCase() }} / {{ project.year }}</p>
          <h1>{{ project.title }}</h1>
        </div>
        <p>{{ project.summary }}</p>
      </div>

      <div class="detail-actions">
        <a
          v-if="project.repo"
          class="button button--primary"
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
          :href="project.demo"
          target="_blank"
          rel="noreferrer"
        >
          {{ project.demoLabel || '在线体验' }}
          <ArrowUpRight :size="18" />
        </a>
      </div>

      <div class="detail-panel">
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
        <p>依据公开源码与项目文档整理</p>
      </aside>
      <div class="markdown-body" v-html="project.html" />
    </div>
  </article>

  <section v-else class="not-found container">
    <p class="eyebrow">404 / NO SIGNAL</p>
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
    color-mix(in srgb, var(--project-accent) 10%, transparent),
    transparent 67%
  );
  content: '';
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.82rem;
  text-decoration: none;
}

.back-link:hover {
  color: var(--project-accent);
}

.detail-heading {
  display: grid;
  grid-template-columns: 1fr minmax(18rem, 0.65fr);
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
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 560;
  letter-spacing: -0.07em;
  line-height: 0.9;
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
      color-mix(in srgb, var(--project-accent) 14%, transparent),
      transparent 62%
    ),
    repeating-radial-gradient(
      circle,
      transparent 0 1.3rem,
      color-mix(in srgb, var(--project-accent) 7%, transparent) 1.35rem
    );
}

.detail-emblem span {
  color: var(--project-accent);
  font-family: var(--font-mono);
  font-size: 3.5rem;
  font-weight: 300;
  text-shadow: 0 0 2rem var(--project-accent);
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
  align-self: start;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.07em;
}

.aside-line {
  height: 1px;
  margin: 1rem 0;
  background: linear-gradient(90deg, var(--project-accent), transparent);
}

.content-aside p {
  margin: 0;
  line-height: 1.7;
}

.markdown-body {
  min-width: 0;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.85;
}

.markdown-body :deep(h2),
.markdown-body :deep(h3) {
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
.markdown-body :deep(ul) {
  margin: 0 0 1.25rem;
}

.markdown-body :deep(a) {
  color: var(--project-accent);
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
  background: #060b12;
}

.markdown-body :deep(pre code) {
  padding: 0;
  border: 0;
  background: transparent;
}

.markdown-body :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 0.2rem 0 0.2rem 1.2rem;
  border-left: 2px solid var(--project-accent);
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
    grid-template-columns: 1fr;
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
}

@media (max-width: 480px) {
  .detail-panel dl div {
    grid-template-columns: 6rem 1fr;
  }
}
</style>
