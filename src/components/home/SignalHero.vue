<script setup lang="ts">
import { ArrowUpRight, Code2 } from '@lucide/vue'
import AppLink from '../AppLink.vue'
import IdentitySculpture from './IdentitySculpture.vue'
import { siteConfig } from '../../data/site'
</script>

<template>
  <section class="hero container" aria-labelledby="hero-title">
    <div class="hero-grid" aria-hidden="true" />
    <div class="hero-content">
      <p class="hero-kicker"><span /> INDEPENDENT MIND. OPEN SOURCE.</p>
      <h1 id="hero-title" class="hero-title">
        <span class="hero-title-line">让复杂技术，</span>
        <span class="hero-title-line hero-title-accent">成为可靠产品。</span>
      </h1>
      <p class="hero-description">
        我是 <strong>{{ siteConfig.name }}</strong>，全栈软件工程师与开源作者。<br />
        从底层逻辑到交互细节，构建值得长久使用的软件。
      </p>
      <div class="hero-actions">
        <AppLink class="button button--primary" data-spatial="magnetic" to="/software">
          探索软件作品 <ArrowUpRight :size="18" />
        </AppLink>
        <a class="hero-github" data-spatial="magnetic" :href="siteConfig.github" target="_blank" rel="noreferrer">
          <Code2 :size="17" /> GitHub <ArrowUpRight :size="13" />
        </a>
      </div>
      <div class="hero-signature">
        <span class="signature-line" aria-hidden="true" />
        <div><span>DESKTOP / SERVER / TOOLING</span><p>C# / .NET <i>·</i> Rust <i>·</i> Go <i>·</i> Vue</p></div>
      </div>
    </div>
    <IdentitySculpture class="hero-sculpture" />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  min-height: min(49rem, calc(100svh - 6.75rem));
  grid-template-columns: minmax(0, 1.06fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(2rem, 4.5vw, 5rem);
  padding-top: 4.5rem;
  padding-bottom: 5rem;
}
.hero-grid {
  position: absolute;
  z-index: -2;
  inset: 0 -8rem 0;
  opacity: 0.24;
  background-image: linear-gradient(rgb(123 155 135 / 12%) 1px, transparent 1px), linear-gradient(90deg, rgb(123 155 135 / 12%) 1px, transparent 1px);
  background-size: 4.5rem 4.5rem;
  mask-image: radial-gradient(ellipse at 60% 35%, black, transparent 70%);
}
.hero-content { position: relative; z-index: 2; padding-bottom: 0.6rem; }
.hero-kicker {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0 0 2rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: clamp(0.54rem, 0.75vw, 0.65rem);
  letter-spacing: 0.1em;
}
.hero-kicker > span { width: 1.4rem; height: 1px; background: var(--accent); }
.hero-title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(2.6rem, 4.15vw, 4.25rem);
  font-weight: 560;
  letter-spacing: -0.065em;
  line-height: 1.23;
}
.hero-title-line { display: block; white-space: nowrap; }
.hero-title-accent { color: var(--accent); }
.hero-description {
  max-width: 30rem;
  margin: 1.85rem 0 0;
  color: var(--text-muted);
  font-size: clamp(0.91rem, 1.15vw, 1rem);
  line-height: 1.95;
  text-wrap: pretty;
}
.hero-description strong { color: var(--text-strong); font-weight: 500; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.8rem; margin-top: 2.3rem; }
.hero-actions .button { min-height: 3.35rem; padding-inline: 1.4rem; border-radius: 0.35rem; border: 1px solid rgb(var(--accent-rgb) / 55%); background: rgb(var(--accent-rgb) / 10%); color: var(--accent); box-shadow: inset 0 1px 0 rgb(var(--accent-rgb) / 15%), 0 6px 24px rgb(var(--accent-rgb) / 5%); font-family: var(--font-sans); font-size: 0.85rem; }
.hero-actions .button:hover, .hero-actions .button:focus-visible { border-color: var(--accent); background: var(--accent); color: var(--surface-0); box-shadow: inset 0 1px 0 rgb(var(--ink-rgb) / 20%), 0 10px 32px rgb(var(--accent-rgb) / 19%); }
.hero-github { display: inline-flex; min-height: 2.75rem; align-items: center; gap: 0.65rem; color: var(--text-muted); font-size: 0.85rem; text-decoration: none; transition: color 200ms; }
.hero-github:hover { color: var(--accent); }
.hero-github svg:last-child { transition: transform 200ms; }
.hero-github:hover svg:last-child { transform: translate(2px, -2px); }
.hero-signature { display: flex; align-items: stretch; gap: 1rem; margin-top: 3.7rem; }
.signature-line { width: 1px; background: linear-gradient(var(--text-dim), var(--line)); }
.hero-signature div > span { color: var(--text-dim); font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.07em; }
.hero-signature p { margin: 0.5rem 0 0; color: var(--text-soft); font-family: var(--font-mono); font-size: 0.69rem; }
.hero-signature i { padding-inline: 0.3rem; color: var(--text-dim); font-style: normal; }
@media (prefers-reduced-motion: no-preference) {
  .hero-content > * { animation: hero-arrive 800ms cubic-bezier(0.16, 1, 0.3, 1) both; }
  .hero-content > :nth-child(2) { animation-delay: 80ms; }
  .hero-content > :nth-child(3) { animation-delay: 160ms; }
  .hero-content > :nth-child(4) { animation-delay: 240ms; }
  .hero-content > :nth-child(5) { animation-delay: 320ms; }
  .hero-sculpture { animation: sculpture-arrive 1100ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both; }
}
@keyframes hero-arrive { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sculpture-arrive { from { opacity: 0; transform: translateY(20px) rotate(1deg); } to { opacity: 1; transform: translateY(0) rotate(0); } }
@media (max-width: 1000px) {
  .hero { min-height: auto; grid-template-columns: 1fr; gap: 3rem; padding-top: 4rem; }
  .hero-content { max-width: 38rem; }
  .hero-title { font-size: clamp(2.7rem, 6.5vw, 4rem); }
  .hero-sculpture { width: min(100%, 38rem); justify-self: center; }
  .hero-signature { margin-top: 2rem; }
}
@media (max-width: 560px) {
  .hero { padding-top: 3rem; padding-bottom: 3.5rem; gap: 2.5rem; }
  .hero-kicker { font-size: 0.52rem; margin-bottom: 1.5rem; }
  .hero-title { font-size: clamp(2rem, 8.8vw, 3rem); letter-spacing: -0.07em; line-height: 1.3; }
  .hero-description { font-size: 0.85rem; margin-top: 1.4rem; }
  .hero-actions { margin-top: 1.6rem; gap: 1.5rem; }
  .hero-actions .button { min-height: 3.15rem; padding-inline: 1.1rem; }
  .hero-signature { margin-top: 1.8rem; }
}
</style>
