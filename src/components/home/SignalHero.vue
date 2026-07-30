<script setup lang="ts">
import { ArrowUpRight, Code2 } from '@lucide/vue'
import AppLink from '../AppLink.vue'
import UnicornLogo from '../brand/UnicornLogo.vue'
import { siteConfig } from '../../data/site'
const currentYear = new Date().getFullYear()
</script>

<template>
  <section class="hero container">
    <div class="hero-grid" aria-hidden="true" />
    <span class="coordinate coordinate--top" aria-hidden="true">N 31°13' / E 121°28'</span>
    <span class="coordinate coordinate--side" aria-hidden="true">NODE::X-LUCIFER</span>

    <div class="hero-content">
      <div class="availability">
        <span class="availability-dot" aria-hidden="true" />
        STATUS / AVAILABLE FOR SOFTWARE COLLABORATION
      </div>

      <p class="hero-kicker">FULL-STACK SOFTWARE ENGINEER · OPEN-SOURCE AUTHOR</p>
      <h1 class="hero-title">
        <span class="hero-title-line">让复杂技术，</span>
        <span class="hero-title-line hero-title-accent">成为可靠产品。</span>
      </h1>
      <p class="hero-description">
        我是 {{ siteConfig.name }}。围绕桌面客户端、服务端与开发工具开展全栈软件开发，使用
        C#/.NET、Rust、Go 与 Vue 构建可部署、可维护并面向真实场景的软件产品。
      </p>

      <div class="hero-actions">
        <AppLink class="button button--primary" to="/software">
          进入作品档案
          <ArrowUpRight :size="18" />
        </AppLink>
        <a class="button button--ghost" :href="siteConfig.github" target="_blank" rel="noreferrer">
          <Code2 :size="18" />
          github.com/X-Lucifer
        </a>
      </div>

      <dl class="hero-meta">
        <div>
          <dt>PRODUCT_DOMAINS</dt>
          <dd>AI / Web / Server / DESKTOP</dd>
        </div>
        <div>
          <dt>ENGINEERING_MODE</dt>
          <dd>LOCAL FIRST</dd>
        </div>
        <div>
          <dt>LOCATION</dt>
          <dd>{{ siteConfig.location }}</dd>
        </div>
      </dl>
    </div>

    <div class="operator-panel" aria-label="开发者身份状态">
      <div class="panel-topbar">
        <span>operator://x-lucifer.node</span>
        <span class="panel-live"><i aria-hidden="true" /> ONLINE</span>
      </div>

      <div class="identity-stage">
        <span class="stage-corner stage-corner--tl" />
        <span class="stage-corner stage-corner--tr" />
        <span class="stage-corner stage-corner--bl" />
        <span class="stage-corner stage-corner--br" />
        <span class="stage-axis stage-axis--x" aria-hidden="true" />
        <span class="stage-axis stage-axis--y" aria-hidden="true" />
        <span class="stage-ring" aria-hidden="true" />
        <span class="stage-scan" aria-hidden="true" />
        <span class="stage-index">ID / 0xFF</span>
        <div class="identity-logo">
          <UnicornLogo title="X 独角兽标志" />
        </div>
        <span class="stage-label">UNICORN SIGNATURE</span>
      </div>

      <dl class="panel-data">
        <div>
          <dt>ROLE</dt>
          <dd>SOFTWARE ENGINEER</dd>
        </div>
        <div>
          <dt>FOCUS</dt>
          <dd>DESKTOP / SERVER / TOOLING</dd>
        </div>
        <div>
          <dt>SOURCE</dt>
          <dd>GITHUB.COM/X-LUCIFER</dd>
        </div>
      </dl>

      <div class="panel-command">
        <span class="prompt">x-lucifer@workstation:~$</span>
        <span>ship --reliable --open-source</span>
        <span class="cursor" aria-hidden="true" />
      </div>
    </div>

    <div class="signal-track" aria-hidden="true">
      <span>PORTFOLIO / REV.001</span>
      <span class="signal-track-line" />
      <span class="signal-track-node" />
      <span>{{currentYear}}</span>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  min-height: 49rem;
  grid-template-columns: minmax(0, 1.18fr) minmax(20rem, 0.82fr);
  align-items: center;
  gap: clamp(3rem, 7vw, 7rem);
  padding-top: clamp(5rem, 9vw, 7.5rem);
  padding-bottom: 7rem;
}

.hero-grid {
  position: absolute;
  z-index: -2;
  inset: 0 var(--container-padding) 3rem;
  opacity: 0.32;
  border-right: 1px solid var(--line);
  border-left: 1px solid var(--line);
  background-image:
    linear-gradient(rgb(123 155 135 / 10%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(123 155 135 / 10%) 1px, transparent 1px);
  background-size: 2.5rem 2.5rem;
  mask-image: linear-gradient(to bottom, transparent, black 10%, black 82%, transparent);
}

.coordinate {
  position: absolute;
  color: #435449;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.1em;
}

.coordinate--top {
  top: 2.1rem;
  left: var(--container-padding);
}

.coordinate--side {
  top: 50%;
  right: -1.6rem;
  transform: rotate(90deg);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.availability {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 2.2rem;
  padding: 0.48rem 0.65rem;
  border: 1px solid rgb(101 245 173 / 22%);
  background: rgb(101 245 173 / 4%);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.61rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.availability-dot {
  width: 0.38rem;
  height: 0.38rem;
  animation: pulse 2.4s ease-in-out infinite;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0.85rem var(--accent);
}

.hero-kicker {
  margin: 0 0 1.25rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: clamp(0.65rem, 1.2vw, 0.75rem);
  letter-spacing: 0.09em;
}

.hero-title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(3rem, 5vw, 5.4rem);
  font-weight: 560;
  letter-spacing: -0.07em;
  line-height: 0.98;
}

.hero-title-line {
  display: block;
  white-space: nowrap;
}

.hero-title-accent {
  color: var(--accent);
  filter: drop-shadow(0 0 1.7rem rgb(101 245 173 / 12%));
}

.hero-description {
  max-width: 39rem;
  margin: 2rem 0 0;
  color: var(--text-muted);
  font-size: clamp(0.98rem, 1.7vw, 1.1rem);
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 2.35rem;
}

.hero-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 3rem 0 0;
  border-top: 1px solid var(--line-strong);
  border-bottom: 1px solid var(--line-strong);
}

.hero-meta div {
  min-width: 0;
  padding: 0.9rem 0.8rem;
  border-right: 1px solid var(--line);
}

.hero-meta div:first-child {
  padding-left: 0;
}

.hero-meta div:last-child {
  border-right: 0;
}

.hero-meta dt,
.hero-meta dd {
  overflow: hidden;
  margin: 0;
  font-family: var(--font-mono);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-meta dt {
  color: var(--text-dim);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
}

.hero-meta dd {
  margin-top: 0.38rem;
  color: var(--text-strong);
  font-size: 0.65rem;
}

.operator-panel {
  position: relative;
  z-index: 2;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  border-radius: 0.25rem;
  background: linear-gradient(145deg, rgb(13 20 15 / 92%), rgb(4 8 6 / 98%));
  box-shadow:
    1.6rem 1.6rem 0 rgb(0 0 0 / 18%),
    0 2rem 6rem rgb(0 0 0 / 42%),
    0 0 5rem rgb(58 255 149 / 5%);
}

.panel-topbar {
  display: flex;
  min-height: 2.8rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid var(--line-strong);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.06em;
}

.panel-live {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--accent);
}

.panel-live i {
  width: 0.32rem;
  height: 0.32rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0.7rem var(--accent);
}

.identity-stage {
  position: relative;
  display: grid;
  min-height: 18rem;
  place-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--line-strong);
  background:
    radial-gradient(circle, rgb(101 245 173 / 12%), transparent 48%),
    linear-gradient(rgb(101 245 173 / 3%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(101 245 173 / 3%) 1px, transparent 1px);
  background-size:
    auto,
    2rem 2rem,
    2rem 2rem;
}

.identity-logo {
  --unicorn-fill: #edf4f0;
  --unicorn-hover-fill: #142119;
  position: relative;
  z-index: 2;
  width: 10.5rem;
  height: 10.5rem;
}

.stage-axis {
  position: absolute;
  opacity: 0.24;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}

.stage-axis--x {
  width: 86%;
  height: 1px;
}

.stage-axis--y {
  width: 1px;
  height: 86%;
}

.stage-ring {
  position: absolute;
  width: 13rem;
  height: 13rem;
  border: 1px dashed rgb(101 245 173 / 16%);
  border-radius: 50%;
  animation: rotate 24s linear infinite;
}

.stage-ring::before {
  position: absolute;
  inset: 1rem;
  border: 1px solid rgb(101 245 173 / 10%);
  border-radius: inherit;
  content: '';
}

.stage-scan {
  position: absolute;
  z-index: 3;
  top: -20%;
  right: 0;
  left: 0;
  height: 18%;
  animation: scan 4.5s linear infinite;
  background: linear-gradient(to bottom, transparent, rgb(101 245 173 / 14%), transparent);
  pointer-events: none;
}

.stage-index,
.stage-label {
  position: absolute;
  z-index: 4;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.53rem;
  letter-spacing: 0.08em;
}

.stage-index {
  top: 0.8rem;
  left: 0.9rem;
}

.stage-label {
  right: 0.9rem;
  bottom: 0.8rem;
}

.stage-corner {
  position: absolute;
  z-index: 4;
  width: 0.8rem;
  height: 0.8rem;
  border-color: var(--accent);
  opacity: 0.62;
}

.stage-corner--tl {
  top: 1.8rem;
  left: 1.8rem;
  border-top: 1px solid;
  border-left: 1px solid;
}

.stage-corner--tr {
  top: 1.8rem;
  right: 1.8rem;
  border-top: 1px solid;
  border-right: 1px solid;
}

.stage-corner--bl {
  bottom: 1.8rem;
  left: 1.8rem;
  border-bottom: 1px solid;
  border-left: 1px solid;
}

.stage-corner--br {
  right: 1.8rem;
  bottom: 1.8rem;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.panel-data {
  display: grid;
  margin: 0;
}

.panel-data div {
  display: grid;
  min-height: 2.8rem;
  grid-template-columns: 5.5rem 1fr;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid var(--line);
}

.panel-data dt,
.panel-data dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.58rem;
}

.panel-data dt {
  color: var(--text-dim);
}

.panel-data dd {
  color: var(--text-strong);
}

.panel-command {
  display: flex;
  min-height: 3rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
}

.prompt {
  color: var(--accent);
}

.cursor {
  width: 0.38rem;
  height: 0.75rem;
  animation: blink 1.1s step-end infinite;
  background: var(--accent);
}

.signal-track {
  position: absolute;
  right: var(--container-padding);
  bottom: 2rem;
  left: var(--container-padding);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.52rem;
  letter-spacing: 0.1em;
}

.signal-track-line {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, var(--line), rgb(101 245 173 / 50%), var(--line));
}

.signal-track-node {
  width: 0.45rem;
  height: 0.45rem;
  border: 1px solid var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 1rem rgb(101 245 173 / 45%);
}

@keyframes pulse {
  50% {
    opacity: 0.42;
    transform: scale(0.8);
  }
}

@keyframes scan {
  to {
    top: 110%;
  }
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 940px) {
  .hero {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 4rem;
    padding-top: 5rem;
  }

  .operator-panel {
    width: min(100%, 34rem);
    justify-self: center;
  }

  .coordinate--side {
    display: none;
  }
}

@media (max-width: 560px) {
  .hero {
    padding-top: 3.5rem;
  }

  .hero-title {
    font-size: clamp(2.5rem, 13vw, 4rem);
  }

  .hero-actions .button {
    width: 100%;
  }

  .hero-meta {
    grid-template-columns: 1fr;
  }

  .hero-meta div,
  .hero-meta div:first-child {
    padding-left: 0;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .hero-meta div:last-child {
    border-bottom: 0;
  }

  .panel-command {
    overflow: hidden;
  }

  .signal-track {
    bottom: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .availability-dot,
  .stage-ring,
  .stage-scan,
  .cursor {
    animation: none;
  }
}
</style>
