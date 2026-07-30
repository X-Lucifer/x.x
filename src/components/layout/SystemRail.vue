<script setup lang="ts">
import { siteConfig } from '../../data/site'
</script>

<template>
  <div class="system-rail">
    <div class="rail-inner container">
      <span class="rail-id">SYS::{{ siteConfig.brand }}</span>
      <span class="rail-stack">FULL STACK / OPEN SOURCE</span>
      <span class="rail-state"><i aria-hidden="true" /> ALL SYSTEMS NOMINAL</span>
    </div>
  </div>
</template>

<style scoped>
.system-rail {
  border-bottom: 1px solid var(--line);
  background: #030504;
}

.rail-inner {
  display: grid;
  min-height: 2rem;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.09em;
}

.rail-stack {
  color: #6f8277;
}

.rail-state {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 0.5rem;
}

.rail-state i {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0.65rem var(--accent);
}

@media (max-width: 700px) {
  .rail-inner {
    grid-template-columns: 1fr auto;
  }

  .rail-stack {
    display: none;
  }
}
</style>
