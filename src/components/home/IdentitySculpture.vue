<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { RotateCcw, Terminal } from '@lucide/vue'
import UnicornLogo from '../brand/UnicornLogo.vue'
import type { IdentityScene } from './identityScene'

const stage = useTemplateRef<HTMLDivElement>('stage')
const status = ref<'loading' | 'ready' | 'fallback'>('loading')
const reducedMotion = ref(false)
let scene: IdentityScene | undefined
let alive = true
let media: MediaQueryList | undefined
let observer: IntersectionObserver | undefined

function updateMotion() {
  reducedMotion.value = media?.matches ?? false
}

onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotion()
  media.addEventListener('change', updateMotion)
  // Mobile visitors can read the introduction before downloading the 3D engine.
  observer = new IntersectionObserver(async entries => {
    if (!entries.some(entry => entry.isIntersecting)) return
    observer?.disconnect()
    try {
      const { createIdentityScene } = await import('./identityScene')
      if (!alive || !stage.value) return
      scene = createIdentityScene(stage.value, () => { status.value = 'fallback' })
      status.value = 'ready'
    } catch (error) {
      if (alive) status.value = 'fallback'
      console.warn('[Identity scene] Static artwork is active.', error)
    }
  }, { rootMargin: '160px' })
  if (stage.value) observer.observe(stage.value)
})

onUnmounted(() => {
  alive = false
  observer?.disconnect()
  media?.removeEventListener('change', updateMotion)
  scene?.dispose()
})
</script>

<template>
  <div class="identity-panel">
    <div class="panel-caption">
      <span class="panel-index">identity://x-lucifer</span>
      <button type="button" class="scene-icon-button" title="重置视角" aria-label="重置视角" :disabled="status !== 'ready'" @click="scene?.reset()">
        <RotateCcw :size="15" />
      </button>
    </div>

    <div class="sculpture-window" :class="{ 'is-ready': status === 'ready' }">
      <div class="scene-ambient" aria-hidden="true" />
      <div class="scene-watermark" aria-hidden="true">X.</div>
      <div
        ref="stage"
        class="sculpture-stage"
        :tabindex="status === 'ready' ? 0 : undefined"
        role="group"
        aria-label="交互式独角兽雕塑"
        aria-description="鼠标或单指拖拽可沿任意方向连续旋转，松手后惯性减速。方向键旋转，Home 键复位。鼠标移动可照亮附近的轮廓。"
      />
      <div v-if="status !== 'ready'" class="scene-fallback" aria-hidden="true">
        <div class="fallback-orbit" />
        <UnicornLogo :interactive="false" />
      </div>
      <div class="scene-corners" aria-hidden="true"><i /><i /><i /><i /></div>
      <div class="scene-topline" aria-hidden="true">
        <span>THE UNICORN</span>
      </div>
      <div class="scene-bottomline">
        <span class="scene-state" aria-live="polite">
          <i :class="{ 'is-active': status === 'ready' && !reducedMotion }" aria-hidden="true" />
          {{ status === 'loading' ? '加载中' : status === 'fallback' ? '静态' : reducedMotion ? '已静止' : '实时' }}
        </span>
      </div>
    </div>

    <div class="panel-terminal" aria-label="开源创作理念">
      <Terminal :size="15" aria-hidden="true" />
      <div class="terminal-output">
        <span><i>~/x-lucifer</i> build ideas into reality</span>
        <span class="terminal-response">source: open / boundaries: clear<b aria-hidden="true" /></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.identity-panel {
  position: relative;
  min-width: 0;
  border: 1px solid var(--line-strong);
  border-radius: 0.55rem;
  background: var(--panel-bg);
  box-shadow: 0 1px 0 rgb(var(--ink-rgb) / 6%) inset, 0 28px 80px -28px rgb(var(--shadow-rgb) / var(--panel-shadow-alpha)), 0 0 60px -20px rgb(var(--accent-rgb) / 9%);
  transition: border-color 350ms ease, box-shadow 350ms ease;
}
.identity-panel:hover, .identity-panel:focus-within {
  border-color: rgb(var(--accent-rgb) / 38%);
  box-shadow: 0 1px 0 rgb(var(--ink-rgb) / 8%) inset, 0 32px 90px -28px rgb(var(--shadow-rgb) / var(--panel-shadow-alpha)), 0 0 70px -20px rgb(var(--accent-rgb) / 17%);
}
.panel-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3.4rem;
  padding: 0 1.4rem;
  border-bottom: 1px solid var(--line);
}
.panel-index {
  color: var(--text-soft);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.13em;
}
.sculpture-window {
  position: relative;
  isolation: isolate;
  height: clamp(22rem, 32vw, 29rem);
  overflow: hidden;
  background:
    radial-gradient(circle, rgb(var(--accent-rgb) / 14%) 0.65px, transparent 1px) 0 0 / 20px 20px,
    radial-gradient(ellipse at 53% 46%, var(--scene-center) 0%, var(--scene-mid) 36%, var(--scene-edge) 72%);
}
.scene-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(120deg, transparent 25%, rgb(var(--accent-rgb) / 3%) 45%, transparent 65%),
    radial-gradient(ellipse at 52% 100%, rgb(var(--accent-rgb) / 9%), transparent 55%);
}
.scene-watermark {
  position: absolute;
  right: 7%;
  bottom: 4%;
  z-index: -1;
  color: rgb(var(--ink-rgb) / 2.5%);
  font-size: 24rem;
  font-weight: 700;
  letter-spacing: -0.1em;
  line-height: 1;
  pointer-events: none;
}
.sculpture-stage {
  position: absolute;
  z-index: 1;
  inset: 0;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  outline-offset: -5px;
}
.sculpture-stage[data-dragging] { cursor: grabbing; }
.sculpture-stage:focus-visible { outline: 1px solid var(--accent); }
.sculpture-stage :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  animation: canvas-reveal 900ms ease both;
}
.scene-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.scene-fallback :deep(.unicorn-shell) {
  width: 42%;
  height: 48%;
  filter: drop-shadow(0 0 25px rgb(var(--accent-rgb) / 22%));
}
.fallback-orbit {
  position: absolute;
  width: 76%;
  aspect-ratio: 1;
  border: 1px solid rgb(var(--accent-rgb) / 30%);
  border-radius: 50%;
  transform: rotate(-35deg) scaleY(0.6);
}
.scene-corners { position: absolute; z-index: 2; inset: 1rem; pointer-events: none; }
.scene-corners i { position: absolute; width: 0.65rem; height: 0.65rem; border-color: var(--text-dim); border-style: solid; }
.scene-corners i:nth-child(1) { left: 0; top: 0; border-width: 1px 0 0 1px; }
.scene-corners i:nth-child(2) { right: 0; top: 0; border-width: 1px 1px 0 0; }
.scene-corners i:nth-child(3) { left: 0; bottom: 0; border-width: 0 0 1px 1px; }
.scene-corners i:nth-child(4) { right: 0; bottom: 0; border-width: 0 1px 1px 0; }
.scene-topline,
.scene-bottomline {
  position: absolute;
  z-index: 2;
  left: 1.8rem;
  right: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  pointer-events: none;
}
.scene-topline { top: 1.6rem; color: var(--text-dim); font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.12em; }
.scene-bottomline { justify-content: flex-end; bottom: 1.6rem; color: var(--text-muted); font-size: 0.65rem; }
.scene-state { display: flex; align-items: center; gap: 0.4rem; }
.scene-state i { width: 4px; height: 4px; border-radius: 50%; background: var(--text-dim); }
.scene-state .is-active { background: var(--accent); box-shadow: 0 0 8px var(--accent); }
.scene-icon-button { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--text-muted); cursor: pointer; transition: color 220ms, background 220ms; }
.scene-icon-button svg { transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1); }
.scene-icon-button:hover { color: var(--accent); background: rgb(var(--accent-rgb) / 8%); }
.scene-icon-button:hover svg { transform: rotate(-65deg); }
.scene-icon-button:active svg { transform: rotate(-110deg) scale(0.9); }
button:disabled { opacity: 0.4; cursor: default; }
.panel-terminal { display: flex; align-items: flex-start; gap: 0.8rem; padding: 1.1rem 1.4rem; border-top: 1px solid var(--line); color: var(--text-dim); }
.terminal-output { display: grid; gap: 0.4rem; min-width: 0; font-family: var(--font-mono); font-size: clamp(0.49rem, 0.64vw, 0.61rem); line-height: 1.5; }
.terminal-output > span:first-child { color: var(--text-soft); }
.terminal-output i { color: var(--accent); font-style: normal; margin-right: 0.35rem; }
.terminal-response { color: var(--text-dim); }
.terminal-output b { display: inline-block; width: 0.32rem; height: 0.6rem; margin-left: 0.4rem; background: var(--accent); vertical-align: -0.08rem; animation: cursor-blink 1.6s step-end infinite; }
@keyframes cursor-blink { 50% { opacity: 0; } }
@keyframes canvas-reveal { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 1000px) {
  .sculpture-window { height: clamp(22rem, 65vw, 30rem); }
  .terminal-output { font-size: 0.58rem; }
}
@media (max-width: 420px) {
  .panel-caption { padding-inline: 1rem; }
  .panel-terminal { padding-inline: 1rem; gap: 0.55rem; }
  .terminal-output { font-size: 0.49rem; }
  .sculpture-window { height: 22rem; }
}
@media (prefers-reduced-motion: reduce) {
  .sculpture-stage :deep(canvas), .terminal-output b { animation: none; }
}
</style>
