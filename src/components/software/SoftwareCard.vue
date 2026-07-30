<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import { computed } from 'vue'
import AppLink from '../AppLink.vue'
import type { SoftwareProject } from '../../types/software'

const props = defineProps<{
  project: SoftwareProject
  index: number
}>()

const cardStyle = computed(() => ({
  '--project-accent': props.project.accent,
  '--card-index': props.index,
}))
const sequence = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<template>
  <AppLink
    class="software-card"
    :style="cardStyle"
    :to="`/software/${project.slug}`"
    :aria-label="`查看 ${project.title} 详情`"
  >
    <div class="card-topline">
      <span>{{ sequence }} / {{ project.category.toUpperCase() }}</span>
      <span class="status">
        <span class="status-dot" aria-hidden="true" />
        {{ project.status }}
      </span>
    </div>

    <div class="card-visual" aria-hidden="true">
      <div class="visual-ring" />
      <div class="visual-core">{{ project.title.slice(0, 1) }}</div>
      <span class="visual-axis visual-axis--x" />
      <span class="visual-axis visual-axis--y" />
    </div>

    <div class="card-copy">
      <div>
        <h3>{{ project.title }}</h3>
        <p>{{ project.summary }}</p>
      </div>
      <ArrowUpRight class="card-arrow" :size="22" />
    </div>

    <div class="card-stack">
      <span v-for="item in project.stack.slice(0, 3)" :key="item">{{ item }}</span>
      <span>{{ project.year }}</span>
    </div>
  </AppLink>
</template>

<style scoped>
.software-card {
  --project-accent: var(--accent);
  position: relative;
  display: flex;
  min-height: 30rem;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 0.25rem;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--project-accent) 6%, transparent), transparent 42%),
    var(--surface-1);
  color: inherit;
  text-decoration: none;
  animation: card-arrive 520ms cubic-bezier(0.2, 0.75, 0.25, 1) backwards;
  animation-delay: calc(var(--card-index, 0) * 85ms);
  transition:
    border-color 220ms ease,
    transform 220ms ease,
    box-shadow 220ms ease;
}

.software-card::before {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(
    28rem circle at 50% 28%,
    color-mix(in srgb, var(--project-accent) 12%, transparent),
    transparent 65%
  );
  content: '';
  transition: opacity 220ms ease;
}

.software-card::after {
  position: absolute;
  z-index: 3;
  top: 0.7rem;
  right: 0.7rem;
  width: 0.7rem;
  height: 0.7rem;
  border-top: 1px solid var(--project-accent);
  border-right: 1px solid var(--project-accent);
  content: '';
  opacity: 0.46;
  pointer-events: none;
}

.software-card:hover {
  border-color: color-mix(in srgb, var(--project-accent) 38%, var(--line));
  box-shadow:
    0 1.5rem 4rem rgb(0 0 0 / 26%),
    0 0 3.5rem color-mix(in srgb, var(--project-accent) 9%, transparent);
  transform: translateY(-4px);
}

.software-card:hover::before {
  opacity: 1;
}

.card-topline,
.card-stack {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.63rem;
  letter-spacing: 0.07em;
}

.card-topline {
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--line);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.status-dot {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: var(--project-accent);
  animation: status-glow 3s ease-in-out infinite;
  box-shadow: 0 0 0.7rem var(--project-accent);
}

.card-visual {
  position: relative;
  display: grid;
  min-height: 15rem;
  flex: 1;
  place-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  background-image:
    linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px);
  background-size: 2.25rem 2.25rem;
}

.visual-ring {
  position: absolute;
  width: 9rem;
  height: 9rem;
  border: 1px solid color-mix(in srgb, var(--project-accent) 26%, transparent);
  border-radius: 50%;
  box-shadow:
    0 0 3rem color-mix(in srgb, var(--project-accent) 10%, transparent),
    inset 0 0 2rem color-mix(in srgb, var(--project-accent) 7%, transparent);
  transition: transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.visual-ring::before,
.visual-ring::after {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--project-accent) 15%, transparent);
  border-radius: inherit;
  content: '';
}

.visual-ring::before {
  inset: 0.8rem;
}

.visual-ring::after {
  inset: -1rem;
  animation: orbit 18s linear infinite;
  border-style: dashed;
}

.software-card:hover .visual-ring {
  transform: rotate(22deg) scale(1.04);
}

.visual-core {
  position: relative;
  z-index: 1;
  color: var(--project-accent);
  font-family: var(--font-mono);
  font-size: 2.8rem;
  font-weight: 300;
  animation: core-glow 4.8s ease-in-out infinite;
  text-shadow: 0 0 1.5rem var(--project-accent);
}

.visual-axis {
  position: absolute;
  background: linear-gradient(90deg, transparent, var(--project-accent), transparent);
  opacity: 0.16;
}

.visual-axis--x {
  width: 90%;
  height: 1px;
}

.visual-axis--y {
  width: 1px;
  height: 90%;
}

.card-copy {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.4rem 1.2rem;
}

.card-copy h3,
.card-copy p {
  margin: 0;
}

.card-copy h3 {
  color: var(--text-strong);
  font-size: 1.4rem;
  letter-spacing: -0.035em;
}

.card-copy p {
  margin-top: 0.5rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.7;
}

.card-arrow {
  flex: 0 0 auto;
  color: var(--project-accent);
  transition: transform 180ms ease;
}

.software-card:hover .card-arrow {
  transform: translate(2px, -2px);
}

.card-stack {
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0 1.4rem 1.4rem;
}

.card-stack span {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 0.12rem;
}

.card-stack span:last-child {
  margin-left: auto;
  border-color: transparent;
}

@keyframes card-arrive {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
}

@keyframes status-glow {
  50% {
    opacity: 0.66;
    box-shadow:
      0 0 0.35rem var(--project-accent),
      0 0 1rem var(--project-accent);
  }
}

@keyframes orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes core-glow {
  50% {
    opacity: 0.88;
    text-shadow:
      0 0 0.8rem var(--project-accent),
      0 0 2.2rem var(--project-accent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .software-card,
  .visual-ring,
  .visual-ring::after,
  .visual-core,
  .status-dot,
  .card-arrow {
    animation: none;
    transition: none;
  }

  .software-card:hover,
  .software-card:hover .visual-ring,
  .software-card:hover .card-arrow {
    transform: none;
  }
}
</style>
