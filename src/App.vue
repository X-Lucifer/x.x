<script setup lang="ts">
import AmbientGlow from './components/layout/AmbientGlow.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import SiteHeader from './components/layout/SiteHeader.vue'
import SystemRail from './components/layout/SystemRail.vue'
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <AmbientGlow />
    <SystemRail />
    <SiteHeader />
    <main id="main-content" class="site-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.site-shell {
  position: relative;
  min-height: 100svh;
  overflow: clip;
}

.site-main {
  min-height: calc(100svh - 10rem);
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
