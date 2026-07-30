<script setup lang="ts">
import { ArrowUpRight, Code2 } from '@lucide/vue'
import UnicornLogo from '../brand/UnicornLogo.vue'
import { siteConfig } from '../../data/site'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner container">
      <div class="footer-identity">
        <span class="footer-mark">
          <UnicornLogo title="X.LUCIFER" />
        </span>
        <div>
          <p class="footer-title">X.LUCIFER / SIGNAL ACTIVE</p>
          <p class="footer-copy">DESKTOP. SERVER. OPEN SOURCE.</p>
        </div>
      </div>

      <div class="footer-meta">
        <a :href="siteConfig.github" target="_blank" rel="noreferrer">
          <Code2 :size="16" />
          GitHub
          <ArrowUpRight :size="14" />
        </a>
        <span>© {{ currentYear }} {{ siteConfig.name }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 3rem 0 2rem;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
}

.footer-identity {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.footer-mark {
  --unicorn-fill: #edf4f0;
  --unicorn-hover-fill: #152019;
  display: block;
  width: 2.35rem;
  height: 2.35rem;
}

.footer-title,
.footer-copy {
  margin: 0;
}

.footer-title {
  color: var(--text-strong);
  font-family: var(--font-mono);
  font-size: 0.77rem;
  letter-spacing: 0.04em;
}

.footer-copy {
  margin-top: 0.15rem;
  color: var(--text-dim);
  font-size: 0.78rem;
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.footer-meta a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  text-decoration: none;
}

.footer-meta a:hover {
  color: var(--accent);
}

@media (max-width: 700px) {
  .footer-inner,
  .footer-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-meta {
    gap: 0.75rem;
  }
}
</style>
