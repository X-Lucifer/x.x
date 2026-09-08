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
    data-spatial
    :style="{ '--card-index': index }"
    :to="`/software/${project.slug}`"
    :aria-label="`查看 ${project.title} 详情`"
  >
    <span class="card-light" aria-hidden="true"><span data-spatial-light /></span>
    <div class="card-topline">
      <span>{{ project.category.toUpperCase() }}</span>
      <span class="status">
        <span class="status-dot" aria-hidden="true" />
        {{ project.status }}
      </span>
    </div>

    <div class="card-visual" aria-hidden="true">
      <div class="project-cube" data-spatial-detail><span v-for="face in 6" :key="face" /></div>
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
  overflow: visible;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--card-bg);
  transform-style: preserve-3d;
  color: inherit;
  text-decoration: none;
  animation: card-arrive 440ms cubic-bezier(0.2, 0.75, 0.25, 1) backwards;
  animation-delay: calc(var(--card-index, 0) * 85ms);
  transition:
    border-color 220ms ease,
    transform 220ms ease,
    box-shadow 220ms ease;
}

.software-card::after {
  position: absolute;
  inset: -1px;
  border: 1px solid transparent;
  border-radius: inherit;
  background: linear-gradient(135deg, rgb(var(--accent-rgb) / 65%), transparent 35%, transparent 65%, rgb(var(--accent-rgb) / 25%)) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;
  content: '';
}
.software-card:active { scale: 0.994; }

.card-light {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease;
}

.card-light > span {
  position: absolute;
  width: 56rem;
  height: 56rem;
  top: -28rem;
  left: -28rem;
  background: radial-gradient(
    28rem circle at center,
    rgb(var(--ink-rgb) / 8%) 0%,
    rgb(var(--accent-rgb) / 12%) 18%,
    transparent 65%
  );
  transform: translate3d(14rem, 8rem, 0);
}

.software-card[data-spatial-active] .card-light > span {
  will-change: transform;
}

.software-card:hover, .software-card:focus-visible {
  border-color: color-mix(in srgb, var(--accent) 38%, var(--line));
  box-shadow:
    0 1.5rem 4rem rgb(var(--shadow-rgb) / var(--shadow-alpha)),
    0 0 3.5rem rgb(var(--accent-rgb) / 9%);
}

.software-card:hover .card-light, .software-card:focus-visible .card-light,
.software-card:hover::after, .software-card:focus-visible::after {
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
  border-radius: inherit;
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
  overflow: clip;
  border-bottom: 1px solid var(--line);
  padding: clamp(1.5rem, 4vw, 3rem);
  background:
    linear-gradient(145deg, rgb(var(--accent-rgb) / 7%), transparent 44%),
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
    var(--card-visual-bg);
  background-size: auto, 2.25rem 2.25rem, 2.25rem 2.25rem, auto;
}

.project-cube {
  position: absolute;
  top: 2rem;
  right: 2.6rem;
  width: 4.2rem;
  height: 4.2rem;
  transform-style: preserve-3d;
  transform: perspective(600px) rotateX(-24deg) rotateY(35deg);
  transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}
.project-cube span { position: absolute; inset: 0; border: 1px solid rgb(var(--accent-rgb) / 36%); background: linear-gradient(135deg, rgb(var(--accent-rgb) / 6%), transparent); }
.project-cube span:nth-child(1) { transform: translateZ(2.1rem); }
.project-cube span:nth-child(2) { transform: rotateY(180deg) translateZ(2.1rem); }
.project-cube span:nth-child(3) { transform: rotateY(90deg) translateZ(2.1rem); }
.project-cube span:nth-child(4) { transform: rotateY(-90deg) translateZ(2.1rem); }
.project-cube span:nth-child(5) { transform: rotateX(90deg) translateZ(2.1rem); }
.project-cube span:nth-child(6) { transform: rotateX(-90deg) translateZ(2.1rem); }
.software-card:hover .project-cube, .software-card:focus-visible .project-cube { transform: perspective(600px) rotateX(-38deg) rotateY(125deg) translateZ(8px); }

.visual-sequence {
  position: absolute;
  top: 0.5rem;
  left: 1.25rem;
  color: rgb(var(--ink-rgb) / 6%);
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

.software-card:hover .visual-product strong, .software-card:focus-visible .visual-product strong {
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

.software-card:hover .card-arrow, .software-card:focus-visible .card-arrow {
  transform: translate(4px, -4px);
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

  .software-card:hover .project-cube { transform: perspective(600px) rotateX(-24deg) rotateY(35deg); }

  .software-card:hover,
  .software-card:hover .visual-product strong,
  .software-card:hover .card-arrow {
    transform: none;
  }
}
</style>
