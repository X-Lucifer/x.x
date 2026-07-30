<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

const glowRef = useTemplateRef<HTMLDivElement>('glow')
let frameId = 0
let pointerX = 0
let pointerY = 0
let reducedMotion: MediaQueryList | undefined

function updateAmbientLight() {
  const glow = glowRef.value
  if (!glow || reducedMotion?.matches) return

  const deltaX = window.innerWidth / 2 - pointerX
  const deltaY = window.innerHeight / 2 - pointerY
  const distance = Math.hypot(deltaX, deltaY)
  const viewportRadius = Math.hypot(window.innerWidth, window.innerHeight) / 2
  const distanceRatio = Math.min(distance / viewportRadius, 1)
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

  glow.style.setProperty('--glow-x', `${pointerX}px`)
  glow.style.setProperty('--glow-y', `${pointerY}px`)
  glow.style.setProperty('--glow-angle', `${angle.toFixed(2)}deg`)
  glow.style.setProperty('--glow-beam-opacity', `${(0.14 + distanceRatio * 0.1).toFixed(3)}`)
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch' || reducedMotion?.matches) return

  pointerX = event.clientX
  pointerY = event.clientY
  window.cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(updateAmbientLight)
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.cancelAnimationFrame(frameId)
})
</script>

<template>
  <div ref="glow" class="ambient-glow" aria-hidden="true">
    <span class="ambient-glow__beam" />
  </div>
</template>

<style scoped>
.ambient-glow {
  --glow-x: 70vw;
  --glow-y: 18rem;
  --glow-angle: 156deg;
  --glow-beam-opacity: 0.2;
  position: fixed;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(
      12rem circle at var(--glow-x) var(--glow-y),
      rgb(230 255 241 / 12%),
      rgb(126 223 172 / 5%) 42%,
      transparent 70%
    ),
    radial-gradient(34rem circle at 82% 24%, rgb(134 199 220 / 6%), transparent 72%);
}

.ambient-glow__beam {
  position: absolute;
  top: var(--glow-y);
  left: var(--glow-x);
  width: 120vmax;
  height: 86vmax;
  background: linear-gradient(
    90deg,
    rgb(230 255 241 / 15%),
    rgb(126 223 172 / 10%) 28%,
    rgb(134 199 220 / 4%) 58%,
    transparent 84%
  );
  -webkit-mask-image: conic-gradient(
    from 60deg at 0 50%,
    transparent 0deg,
    black 8deg,
    black 52deg,
    transparent 60deg,
    transparent 360deg
  );
  mask-image: conic-gradient(
    from 60deg at 0 50%,
    transparent 0deg,
    black 8deg,
    black 52deg,
    transparent 60deg,
    transparent 360deg
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  mix-blend-mode: screen;
  opacity: var(--glow-beam-opacity);
  transform: translateY(-50%) rotate(var(--glow-angle));
  transform-origin: left center;
  will-change: transform;
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
  .ambient-glow__beam {
    opacity: 0.1;
    transform: translateY(-50%) rotate(156deg);
  }

  .ambient-glow::before,
  .ambient-glow::after {
    animation: none;
  }
}
</style>
