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
      34rem circle at var(--glow-x) var(--glow-y),
      rgb(79 255 160 / 7%),
      transparent 68%
    ),
    radial-gradient(32rem circle at 82% 24%, rgb(116 214 255 / 5%), transparent 72%);
}
</style>
