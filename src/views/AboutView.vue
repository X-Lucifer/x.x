<script setup lang="ts">
import { ArrowUpRight, Code2, Mail, MapPin } from '@lucide/vue'
import UnicornLogo from '../components/brand/UnicornLogo.vue'
import { pageUrl, personSchema, siteUrl, useSeo } from '../composables/useSeo'
import { siteConfig, technologyGroups } from '../data/site'

const capabilities = [
  ['01', '客户端工程', '使用 Vue、TypeScript 与 Tauri、Wails、Avalonia 构建离线优先的桌面软件。'],
  ['02', '服务端开发', '围绕 ASP.NET Core、Web API、gRPC 与开放协议设计可部署的服务端系统。'],
  ['03', '原生与性能', '以 C#、Rust、Go、C++ 连接产品界面、系统能力与高性能处理引擎。'],
  ['04', '交付与运维', '覆盖 Linux、Docker、数据服务、消息组件及从构建到部署的完整工程链路。'],
]

const title = '关于 X — 全栈软件工程师与开源作者 | X.LUCIFER'
const description =
  '了解全栈软件工程师 X 的技术方向与工程实践，涵盖 Vue、TypeScript、C#/.NET、Rust、Go、桌面客户端、服务端和开源软件交付。'

useSeo({
  title,
  description,
  path: '/about',
  type: 'profile',
  structuredData: [
    personSchema(),
    {
      '@type': 'ProfilePage',
      '@id': `${pageUrl('/about')}#profile`,
      name: title,
      url: pageUrl('/about'),
      description,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${siteUrl}#website` },
      mainEntity: { '@id': `${siteUrl}#person` },
    },
  ],
})
</script>

<template>
  <div class="about container">
    <header class="about-hero">
      <div>
        <p class="eyebrow">ABOUT / OPERATOR</p>
        <h1>工程理性，<br /><span>产品感性。</span></h1>
      </div>
      <div class="about-intro">
        <p>
          你好，我是 {{ siteConfig.name }}，一名全栈软件工程师与开源作者。我专注于把产品需求转化为边界清晰、运行可靠、能够独立交付的软件。
        </p>
        <p>
          当前实践覆盖 AI 图像处理、离线桌面客户端、轻量服务与 WebDAV / CalDAV /
          CardDAV 协议服务，并持续探索不同语言与桌面运行时在同一产品命题下的工程取舍。
        </p>
      </div>
    </header>

    <section class="profile-panel">
      <div class="profile-id">
        <div class="profile-monogram">
          <UnicornLogo title="X 独角兽标志" />
        </div>
        <div>
          <span>IDENTITY</span>
          <strong>{{ siteConfig.name }}</strong>
          <small>{{ siteConfig.role }}</small>
        </div>
      </div>
      <div class="profile-links">
        <span><MapPin :size="15" /> {{ siteConfig.location }}</span>
        <a :href="siteConfig.github" target="_blank" rel="noreferrer">
          <Code2 :size="15" /> GitHub <ArrowUpRight :size="14" />
        </a>
        <a :href="`mailto:${siteConfig.email}`">
          <Mail :size="15" /> {{ siteConfig.email }}
        </a>
      </div>
    </section>

    <section class="capabilities">
      <div class="capability-heading">
        <p class="eyebrow">CAPABILITIES</p>
        <h2 class="section-title">我如何构建</h2>
      </div>
      <div class="capability-list">
        <article v-for="[index, title, description] in capabilities" :key="index">
          <span>{{ index }}</span>
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </article>
      </div>
    </section>

    <section class="technology-panel" aria-label="技术栈">
      <p class="eyebrow">TECHNOLOGY / MATRIX</p>
      <dl>
        <div v-for="group in technologyGroups" :key="group.code">
          <dt>{{ group.code }} / {{ group.label }}</dt>
          <dd>{{ group.items.join(' · ') }}</dd>
        </div>
      </dl>
    </section>

    <section class="contact-banner">
      <div>
        <p class="eyebrow">SOFTWARE / COLLABORATION</p>
        <h2>软件开发与技术合作，<br />从明确需求开始。</h2>
        <p class="contact-description">
          可就桌面客户端、服务端系统、工程工具、性能优化与开源项目协作进行沟通。
        </p>
      </div>
      <div class="contact-actions">
        <a class="button button--primary" :href="`mailto:${siteConfig.email}`">
          <Mail :size="18" />
          发送合作邮件
        </a>
        <a class="button button--ghost" :href="siteConfig.github" target="_blank" rel="noreferrer">
          <Code2 :size="18" />
          查看 GitHub
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about {
  padding-top: clamp(5rem, 10vw, 8rem);
  padding-bottom: 8rem;
}

.about-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(19rem, 0.65fr);
  gap: clamp(3rem, 8vw, 8rem);
  align-items: end;
}

.about-hero h1 {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(3.5rem, 8vw, 7.2rem);
  font-weight: 560;
  letter-spacing: -0.07em;
  line-height: 0.94;
}

.about-hero h1 span {
  color: transparent;
  background: linear-gradient(100deg, var(--accent), #b8ffd6 52%, var(--accent-blue));
  background-clip: text;
  -webkit-background-clip: text;
}

.about-intro {
  color: var(--text-muted);
  font-size: 1.02rem;
  line-height: 1.85;
}

.about-intro p {
  margin: 0 0 1.2rem;
}

.profile-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 5rem;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 0.25rem;
  background: var(--surface-1);
}

.profile-id {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border-right: 1px solid var(--line);
}

.profile-monogram {
  --unicorn-fill: #edf4f0;
  --unicorn-hover-fill: #152019;
  display: grid;
  width: 6rem;
  height: 6rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(99 245 210 / 25%);
  border-radius: 0.2rem;
  background:
    radial-gradient(circle, rgb(101 245 173 / 13%), transparent 70%),
    var(--surface-0);
  box-shadow: 0 0 2rem rgb(101 245 173 / 6%);
}

.profile-id div:last-child {
  display: grid;
}

.profile-id span,
.profile-id small {
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
}

.profile-id strong {
  margin: 0.5rem 0;
  color: var(--text-strong);
  font-size: 1.55rem;
}

.profile-links {
  display: grid;
  align-content: center;
  padding: 1.5rem 2rem;
}

.profile-links span,
.profile-links a {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-decoration: none;
}

.profile-links a:hover {
  color: var(--accent);
}

.capabilities {
  display: grid;
  grid-template-columns: 15rem 1fr;
  gap: clamp(3rem, 8vw, 8rem);
  margin-top: 8rem;
}

.technology-panel {
  display: grid;
  grid-template-columns: 15rem 1fr;
  gap: clamp(3rem, 8vw, 8rem);
  margin-top: 8rem;
}

.technology-panel dl {
  margin: 0;
  border-top: 1px solid var(--line);
}

.technology-panel dl div {
  display: grid;
  grid-template-columns: 12rem 1fr;
  gap: 1rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--line);
}

.technology-panel dt,
.technology-panel dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  line-height: 1.7;
}

.technology-panel dt {
  color: var(--accent);
}

.technology-panel dd {
  color: var(--text-muted);
}

.capability-list {
  border-top: 1px solid var(--line);
}

.capability-list article {
  display: grid;
  grid-template-columns: 3rem 10rem 1fr;
  gap: 1rem;
  align-items: baseline;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--line);
}

.capability-list span {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.66rem;
}

.capability-list h3,
.capability-list p {
  margin: 0;
}

.capability-list h3 {
  color: var(--text-strong);
  font-size: 1rem;
}

.capability-list p {
  color: var(--text-muted);
  font-size: 0.87rem;
  line-height: 1.7;
}

.contact-banner {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 8rem;
  overflow: hidden;
  padding: clamp(2rem, 6vw, 4rem);
  border: 1px solid rgb(99 245 210 / 20%);
  border-radius: 0.25rem;
  background:
    radial-gradient(circle at 12% 100%, rgb(101 245 173 / 11%), transparent 35%),
    radial-gradient(circle at 90% 0, rgb(116 214 255 / 7%), transparent 40%),
    var(--surface-1);
}

.contact-banner::after {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(rgb(255 255 255 / 5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 5%) 1px, transparent 1px);
  background-size: 2.5rem 2.5rem;
  content: '';
  mask-image: linear-gradient(90deg, black, transparent 70%);
  pointer-events: none;
}

.contact-banner > * {
  position: relative;
  z-index: 1;
}

.contact-banner h2 {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(2.2rem, 5vw, 4rem);
  letter-spacing: -0.055em;
  line-height: 1.05;
}

.contact-description {
  max-width: 38rem;
  margin: 1.2rem 0 0;
  color: var(--text-muted);
  line-height: 1.8;
}

.contact-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 760px) {
  .about-hero,
  .profile-panel,
  .capabilities,
  .technology-panel {
    grid-template-columns: 1fr;
  }

  .profile-id {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .capability-list article {
    grid-template-columns: 2rem 1fr;
  }

  .capability-list p {
    grid-column: 2;
  }

  .contact-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .contact-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 460px) {
  .profile-id {
    align-items: flex-start;
    flex-direction: column;
  }

  .technology-panel dl div {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .contact-actions,
  .contact-actions .button {
    width: 100%;
  }
}
</style>
