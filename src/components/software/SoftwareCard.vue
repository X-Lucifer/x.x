<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import AppLink from '../AppLink.vue'
import type { SoftwareProject } from '../../types/software'

const props = defineProps<{
  project: SoftwareProject
  index: number
}>()

const sequence = String(props.index + 1).padStart(2, '0')
</script>

<template>
  <AppLink
    class="software-card"
    :style="{ '--card-index': index }"
    :to="`/software/${project.slug}`"
    :aria-label="`查看 ${project.title} 详情`"
  >
    <div class="card-topline">
      <span>{{ project.category.toUpperCase() }}</span>
      <span class="status">
        <span class="status-dot" aria-hidden="true" />
        {{ project.status }}
      </span>
    </div>

    <div class="card-visual" aria-hidden="true">
      <span class="visual-sequence">{{ sequence }}</span>
      <div class="visual-product">
        <span class="visual-label">PROJECT / {{ project.year }}</span>
        <strong>{{ project.title }}</strong>
        <span>{{ project.stack.slice(0, 2).join(' + ') }}</span>
      </div>
      <div class="visual-terminal">
        <span>&gt; inspect {{ project.slug }}</span>
        <span>&gt; status {{ project.status.toLowerCase() }}</span>
      </div>
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
  position: relative;
  display: flex;
  min-height: 28rem;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 0.25rem;
  background: var(--surface-1);
  color: inherit;
  text-decoration: none;
  animation: card-arrive 440ms cubic-bezier(0.2, 0.75, 0.25, 1) backwards;
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

.software-card:hover {
  border-color: color-mix(in srgb, var(--accent) 38%, var(--line));
  box-shadow:
    0 1.5rem 4rem rgb(0 0 0 / 26%),
    0 0 3.5rem rgb(120 226 168 / 7%);
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
  background: var(--accent);
  box-shadow: 0 0 0.7rem var(--accent);
}

.card-visual {
  position: relative;
  display: grid;
  min-height: 16rem;
  flex: 1;
  place-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  padding: clamp(1.5rem, 4vw, 3rem);
  background:
    linear-gradient(145deg, rgb(120 226 168 / 7%), transparent 44%),
    linear-gradient(rgb(255 255 255 / 2.5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 2.5%) 1px, transparent 1px),
    #090d0b;
  background-size: auto, 2.25rem 2.25rem, 2.25rem 2.25rem, auto;
}

.visual-sequence {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  color: rgb(240 244 241 / 6%);
  font-family: var(--font-mono);
  font-size: clamp(5rem, 11vw, 9rem);
  font-weight: 700;
  letter-spacing: -0.1em;
  line-height: 1;
}

.visual-product {
  position: relative;
  z-index: 1;
  display: grid;
  width: 100%;
  align-self: end;
  gap: 0.65rem;
}

.visual-product span {
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.06em;
}

.visual-product strong {
  max-width: 11ch;
  color: var(--text-strong);
  font-size: clamp(2rem, 4.2vw, 4.4rem);
  font-weight: 540;
  letter-spacing: -0.07em;
  line-height: 0.95;
  transition: color 220ms ease, transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.software-card:hover .visual-product strong {
  color: var(--accent);
  transform: translateX(0.35rem);
}

.visual-terminal {
  position: absolute;
  right: 1.25rem;
  bottom: 1.25rem;
  display: grid;
  gap: 0.3rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.52rem;
  text-align: right;
}

.visual-terminal span:last-child {
  color: var(--accent);
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
  color: var(--accent);
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

@media (prefers-reduced-motion: reduce) {
  .software-card,
  .visual-product strong,
  .card-arrow {
    animation: none;
    transition: none;
  }

  .software-card:hover,
  .software-card:hover .visual-product strong,
  .software-card:hover .card-arrow {
    transform: none;
  }
}
</style>
