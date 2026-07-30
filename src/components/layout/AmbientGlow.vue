<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

const glowRef = useTemplateRef<HTMLDivElement>('glow')
let frameId = 0

function handlePointerMove(event: PointerEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  window.cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(() => {
    glowRef.value?.style.setProperty('--glow-x', `${event.clientX}px`)
    glowRef.value?.style.setProperty('--glow-y', `${event.clientY}px`)
  })
}

onMounted(() => window.addEventListener('pointermove', handlePointerMove, { passive: true }))
onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.cancelAnimationFrame(frameId)
})
</script>

<template>
  <div ref="glow" class="ambient-glow" aria-hidden="true" />
</template>

<style scoped>
.ambient-glow {
  --glow-x: 70vw;
  --glow-y: 18rem;
  position: fixed;
  z-index: -1;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      38rem circle at var(--glow-x) var(--glow-y),
      rgb(126 223 172 / 8.5%),
      transparent 70%
    ),
    radial-gradient(34rem circle at 82% 24%, rgb(134 199 220 / 6%), transparent 72%);
}

.ambient-glow::before,
.ambient-glow::after {
  position: absolute;
  width: 30rem;
  height: 30rem;
  border-radius: 50%;
  content: '';
  filter: blur(2rem);
  opacity: 0.58;
  will-change: transform;
}

.ambient-glow::before {
  top: 14%;
  left: -12rem;
  animation: drift-left 18s ease-in-out infinite alternate;
  background: radial-gradient(circle, rgb(126 223 172 / 8%), transparent 68%);
}

.ambient-glow::after {
  right: -10rem;
  bottom: 3%;
  animation: drift-right 22s ease-in-out infinite alternate;
  background: radial-gradient(circle, rgb(170 155 221 / 7%), transparent 68%);
}

@keyframes drift-left {
  to {
    transform: translate(8vw, 10vh) scale(1.08);
  }
}

@keyframes drift-right {
  to {
    transform: translate(-9vw, -8vh) scale(0.92);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-glow::before,
  .ambient-glow::after {
    animation: none;
  }
}
</style>
