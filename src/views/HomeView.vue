<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import AppLink from '../components/AppLink.vue'
import SignalHero from '../components/home/SignalHero.vue'
import SoftwareCard from '../components/software/SoftwareCard.vue'
import { absoluteUrl, personSchema, siteUrl, useSeo } from '../composables/useSeo'
import { siteConfig } from '../data/site'
import { technologyGroups } from '../data/site'
import { featuredProjects } from '../data/software'

const title = 'X — 全栈软件工程师与开源软件作者 | X.LUCIFER'

useSeo({
  title,
  description: siteConfig.description,
  path: '/',
  structuredData: [
    personSchema(),
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: siteConfig.brand,
      alternateName: `${siteConfig.name} 的开源软件作品站`,
      url: siteUrl,
      description: siteConfig.description,
      inLanguage: 'zh-CN',
      publisher: { '@id': `${siteUrl}#person` },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}#webpage`,
      name: title,
      url: siteUrl,
      description: siteConfig.description,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': `${siteUrl}#person` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg'),
      },
    },
  ],
})
</script>

<template>
  <div>
    <SignalHero />

    <section class="featured section container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">SELECTED / BUILDS</p>
          <h2 class="section-title">软件作品</h2>
        </div>
        <AppLink class="text-link" to="/software">
          查看全部软件
          <ArrowRight :size="17" />
        </AppLink>
      </div>

      <div class="software-grid">
        <SoftwareCard
          v-for="(project, index) in featuredProjects"
          :key="project.slug"
          :project="project"
          :index="index"
        />
      </div>
    </section>

    <section class="technology section container">
      <div class="technology-intro">
        <p class="eyebrow">ENGINEERING / STACK</p>
        <h2 class="section-title">覆盖软件产品<br />完整生命周期。</h2>
        <p>
          技术能力从应用开发延伸至数据库、中间件、云基础设施与可观测性。
          当前公开作品重点呈现 C#/.NET、Rust、Go、C++ 与 Vue/TypeScript 的组合实践。
        </p>
      </div>

      <div class="technology-matrix">
        <article v-for="(group, index) in technologyGroups" :key="group.code">
          <span class="technology-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="technology-heading">
            <small>{{ group.code }}</small>
            <h3>{{ group.label }}</h3>
          </div>
          <ul>
            <li v-for="item in group.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="principles section container">
      <div class="principle-intro">
        <p class="eyebrow">WORK / PHILOSOPHY</p>
        <h2 class="section-title">从技术实现，<br />到完整交付。</h2>
      </div>
      <div class="principle-list">
        <article>
          <span>ENGINEERING</span>
          <h3>边界清晰</h3>
          <p>让界面、原生能力、服务协议与数据职责各自明确，降低系统长期维护成本。</p>
        </article>
        <article>
          <span>EXPERIENCE</span>
          <h3>面向真实使用</h3>
          <p>从离线可用、批量处理到安装升级，把运行环境和用户操作纳入产品设计。</p>
        </article>
        <article>
          <span>OPEN SOURCE</span>
          <h3>可验证的开放</h3>
          <p>以公开源码、清晰文档和可复现构建说明，让实现过程能够被理解与复用。</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--text-muted);
  font-size: 0.84rem;
  text-decoration: none;
}

.text-link:hover {
  color: var(--accent);
}

.software-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.technology,
.principles {
  display: grid;
  grid-template-columns: minmax(17rem, 0.8fr) minmax(0, 1.2fr);
  gap: clamp(3rem, 8vw, 8rem);
}

.technology {
  padding-bottom: 4rem;
}

.technology-intro,
.principle-intro {
  align-self: start;
}

.technology-intro > p:last-child {
  max-width: 31rem;
  margin: 1.5rem 0 0;
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.8;
}

.technology-matrix {
  border-top: 1px solid var(--line);
}

.technology-matrix article {
  display: grid;
  grid-template-columns: 3rem 10rem 1fr;
  gap: 1rem;
  align-items: start;
  padding: 1.45rem 0;
  border-bottom: 1px solid var(--line);
}

.technology-index,
.technology-heading small,
.technology-matrix li {
  font-family: var(--font-mono);
}

.technology-index,
.technology-heading small {
  color: var(--accent);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
}

.technology-heading h3 {
  margin: 0.38rem 0 0;
  color: var(--text-strong);
  font-size: 0.95rem;
}

.technology-matrix ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.technology-matrix li {
  color: var(--text-muted);
  font-size: 0.7rem;
  line-height: 1.8;
}

.technology-matrix li:not(:last-child)::after {
  margin-left: 0.75rem;
  color: var(--line-strong);
  content: '/';
}

.principles {
  padding-bottom: 8rem;
}

.principle-list {
  border-top: 1px solid var(--line);
}

.principle-list article {
  display: grid;
  grid-template-columns: 7rem 1fr 1.6fr;
  gap: 1.25rem;
  align-items: baseline;
  padding: 1.65rem 0;
  border-bottom: 1px solid var(--line);
}

.principle-list span {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
}

.principle-list h3,
.principle-list p {
  margin: 0;
}

.principle-list h3 {
  color: var(--text-strong);
  font-size: 1rem;
}

.principle-list p {
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.7;
}

@media (max-width: 860px) {
  .technology,
  .principles {
    grid-template-columns: 1fr;
  }

  .technology-matrix article {
    grid-template-columns: 3rem 9rem 1fr;
  }

  .principle-list article {
    grid-template-columns: 7rem 1fr;
  }

  .principle-list p {
    grid-column: 2;
  }
}

@media (max-width: 700px) {
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .software-grid {
    grid-template-columns: 1fr;
  }

  .technology-matrix article {
    grid-template-columns: 2rem 1fr;
  }

  .technology-matrix ul {
    grid-column: 2;
  }

  .principle-list article {
    grid-template-columns: 1fr;
  }

  .principle-list p {
    grid-column: auto;
  }
}
</style>
