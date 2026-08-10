<script setup lang="ts">
import { ArrowUpRight, Code2 } from '@lucide/vue'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import AppLink from '../AppLink.vue'
import UnicornLogo from '../brand/UnicornLogo.vue'
import { siteConfig } from '../../data/site'

const lightStageRef = useTemplateRef<HTMLDivElement>('lightStage')

let lightFrameId = 0
let pointerX = 0
let pointerY = 0
let reducedMotion: MediaQueryList | undefined

function updateDirectionalLight() {
  const stage = lightStageRef.value
  if (!stage || reducedMotion?.matches) return

  const rect = stage.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) return

  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const deltaX = pointerX - centerX
  const deltaY = pointerY - centerY
  const distance = Math.hypot(deltaX, deltaY)
  const unitX = distance > 0 ? deltaX / distance : 0.8
  const unitY = distance > 0 ? deltaY / distance : -0.35
  const viewportDistance = Math.hypot(window.innerWidth, window.innerHeight)
  const distanceRatio = Math.min(distance / (viewportDistance * 0.72), 1)
  const proximity = 1 - distanceRatio
  const shadowDistance = 6 + proximity * 8

  stage.style.setProperty('--light-shadow-x', `${(-unitX * shadowDistance).toFixed(2)}px`)
  stage.style.setProperty('--light-shadow-y', `${(-unitY * shadowDistance).toFixed(2)}px`)
  stage.style.setProperty('--light-shadow-far-x', `${(-unitX * shadowDistance * 1.6).toFixed(2)}px`)
  stage.style.setProperty('--light-shadow-far-y', `${(-unitY * shadowDistance * 1.6).toFixed(2)}px`)
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch' || reducedMotion?.matches) return

  pointerX = event.clientX
  pointerY = event.clientY
  window.cancelAnimationFrame(lightFrameId)
  lightFrameId = window.requestAnimationFrame(updateDirectionalLight)
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.cancelAnimationFrame(lightFrameId)
})
</script>

<template>
  <section class="hero container">
    <div class="hero-grid" aria-hidden="true" />

    <div class="hero-content">
      <p class="hero-kicker">FULL-STACK SOFTWARE ENGINEER / OPEN-SOURCE AUTHOR</p>
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
      </dl>
    </div>

    <div class="operator-panel" aria-label="开发者身份状态">
      <div class="panel-topbar">
        <span>operator://x-lucifer.node</span>
        <span class="panel-live"><i aria-hidden="true" /> ONLINE</span>
      </div>

      <div ref="lightStage" class="identity-stage">
        <span class="stage-frame stage-frame--tl" aria-hidden="true" />
        <span class="stage-frame stage-frame--tr" aria-hidden="true" />
        <span class="stage-frame stage-frame--bl" aria-hidden="true" />
        <span class="stage-frame stage-frame--br" aria-hidden="true" />
        <span class="stage-axis stage-axis--x" aria-hidden="true" />
        <span class="stage-axis stage-axis--y" aria-hidden="true" />
        <span class="stage-orbit stage-orbit--outer" aria-hidden="true" />
        <span class="stage-orbit stage-orbit--inner" aria-hidden="true" />
        <span class="stage-scan" aria-hidden="true" />
        <span class="stage-readout stage-readout--top">BIOMETRIC / X-01</span>
        <span class="stage-readout stage-readout--bottom">SIGNATURE LOCKED</span>
        <div class="identity-logo">
          <UnicornLogo title="X 独角兽标志" />
        </div>
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
      </dl>

      <div class="panel-terminal" aria-label="终端状态">
        <div class="terminal-chrome" aria-hidden="true"><span /><span /><span /></div>
        <div class="terminal-output">
          <span><i>$</i> identify --operator x-lucifer</span>
          <span class="terminal-response">identity verified / access granted</span>
          <span><i>$</i> build --reliable --open-source <b aria-hidden="true" /></span>
        </div>
      </div>
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
  padding-bottom: 5.5rem;
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

.hero-content {
  position: relative;
  z-index: 2;
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
  font-size: clamp(2.8rem, 4.6vw, 4.9rem);
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
  filter: drop-shadow(0 0 1.9rem rgb(126 223 172 / 16%));
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
  background: linear-gradient(145deg, rgb(17 25 20 / 94%), rgb(7 11 9 / 98%));
  box-shadow:
    1.6rem 1.6rem 0 rgb(0 0 0 / 18%),
    0 2rem 6rem rgb(0 0 0 / 42%),
    0 0 5rem rgb(126 223 172 / 7%);
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
  animation: live-pulse 2.4s ease-in-out infinite;
  box-shadow: 0 0 0.7rem var(--accent);
}

.identity-stage {
  --light-shadow-x: -6px;
  --light-shadow-y: 4px;
  --light-shadow-far-x: -9.6px;
  --light-shadow-far-y: 6.4px;
  position: relative;
  isolation: isolate;
  display: grid;
  min-height: 19rem;
  place-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--line-strong);
  background:
    linear-gradient(rgb(126 223 172 / 3.5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(126 223 172 / 3.5%) 1px, transparent 1px),
    var(--surface-0);
  background-size:
    2rem 2rem,
    2rem 2rem,
    auto;
}

.identity-logo {
  --unicorn-fill: #edf4f0;
  --unicorn-hover-fill: #142119;
  position: relative;
  z-index: 5;
  width: 10.5rem;
  height: 10.5rem;
  filter:
    drop-shadow(var(--light-shadow-x) var(--light-shadow-y) 0.75rem rgb(126 223 172 / 48%))
    drop-shadow(
      var(--light-shadow-far-x)
      var(--light-shadow-far-y)
      2rem
      rgb(120 226 168 / 16%)
    );
  transition: filter 90ms linear;
  will-change: filter;
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

.stage-frame {
  position: absolute;
  z-index: 6;
  width: 2.2rem;
  height: 2.2rem;
  border-color: rgb(120 226 168 / 68%);
  filter: drop-shadow(0 0 0.45rem rgb(120 226 168 / 32%));
}

.stage-frame--tl { top: 1.25rem; left: 1.25rem; border-top: 1px solid; border-left: 1px solid; }
.stage-frame--tr { top: 1.25rem; right: 1.25rem; border-top: 1px solid; border-right: 1px solid; }
.stage-frame--bl { bottom: 1.25rem; left: 1.25rem; border-bottom: 1px solid; border-left: 1px solid; }
.stage-frame--br { right: 1.25rem; bottom: 1.25rem; border-right: 1px solid; border-bottom: 1px solid; }

.stage-orbit {
  position: absolute;
  z-index: 2;
  border-radius: 50%;
}

.stage-orbit--outer {
  width: 14.5rem;
  height: 14.5rem;
  animation: orbit-forward 22s linear infinite;
  border: 1px dashed rgb(120 226 168 / 27%);
}

.stage-orbit--outer::before,
.stage-orbit--outer::after {
  position: absolute;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 1rem var(--accent);
  content: '';
}

.stage-orbit--outer::before { top: 1.35rem; left: 1.65rem; }
.stage-orbit--outer::after { right: 1.35rem; bottom: 1.65rem; }

.stage-orbit--inner {
  width: 12rem;
  height: 12rem;
  animation: orbit-reverse 16s linear infinite;
  border: 1px solid rgb(120 226 168 / 13%);
  border-right-color: rgb(120 226 168 / 54%);
  border-left-color: rgb(120 226 168 / 54%);
}

.stage-scan {
  position: absolute;
  z-index: 4;
  top: -28%;
  right: 0;
  left: 0;
  height: 24%;
  animation: stage-scan 4.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  background: linear-gradient(to bottom, transparent, rgb(120 226 168 / 3%) 45%, rgb(120 226 168 / 45%) 49%, rgb(230 255 241 / 72%) 50%, rgb(120 226 168 / 12%) 52%, transparent);
  filter: drop-shadow(0 0 0.7rem rgb(120 226 168 / 44%));
  pointer-events: none;
}

.stage-readout {
  position: absolute;
  z-index: 6;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
}

.stage-readout--top { top: 1.5rem; left: 4.2rem; }
.stage-readout--bottom { right: 4.2rem; bottom: 1.5rem; color: var(--accent); }

.panel-terminal {
  display: grid;
  min-height: 5.5rem;
  grid-template-columns: 2.8rem 1fr;
  border-top: 1px solid var(--line-strong);
  background: rgb(3 6 4 / 86%);
}

.terminal-chrome {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.22rem;
  padding-top: 1.05rem;
  border-right: 1px solid var(--line);
}

.terminal-chrome span {
  width: 0.22rem;
  height: 0.22rem;
  border-radius: 50%;
  background: var(--text-dim);
}

.terminal-chrome span:first-child { background: var(--accent); box-shadow: 0 0 0.5rem rgb(120 226 168 / 54%); }

.terminal-output {
  display: grid;
  align-content: center;
  gap: 0.38rem;
  padding: 0.8rem 1rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.55rem;
}

.terminal-output i { margin-right: 0.5rem; color: var(--accent); font-style: normal; }
.terminal-response { padding-left: 1.05rem; color: var(--text-dim); }

.terminal-output b {
  display: inline-block;
  width: 0.38rem;
  height: 0.72rem;
  margin-left: 0.32rem;
  animation: terminal-cursor 1.1s step-end infinite;
  background: var(--accent);
  vertical-align: -0.12rem;
}

@keyframes stage-scan {
  0%, 12% { top: -28%; opacity: 0; }
  20%, 80% { opacity: 1; }
  92%, 100% { top: 104%; opacity: 0; }
}

@keyframes orbit-forward { to { transform: rotate(360deg); } }
@keyframes orbit-reverse { to { transform: rotate(-360deg); } }
@keyframes terminal-cursor { 50% { opacity: 0; } }
@keyframes live-pulse { 50% { opacity: 0.45; transform: scale(0.72); } }

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

}

@media (max-width: 560px) {
  .hero {
    padding-top: 3.5rem;
  }

  .hero-title {
    font-size: clamp(2.25rem, 10.6vw, 3.25rem);
    letter-spacing: -0.065em;
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

}

@media (prefers-reduced-motion: reduce) {
  .operator-panel,
  .panel-live i,
  .stage-orbit,
  .stage-scan,
  .terminal-output b {
    animation: none;
  }

  .identity-logo {
    filter: drop-shadow(-5px 4px 1rem rgb(126 223 172 / 32%));
    transition: none;
  }
}
</style>
