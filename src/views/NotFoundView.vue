<script setup lang="ts">
import AppLink from '../components/AppLink.vue'
import { useSeo } from '../composables/useSeo'

useSeo({
  title: '页面未找到 | X.LUCIFER',
  description: '请求的页面不存在，请返回 X.LUCIFER 首页或查看开源软件作品。',
  path: '/404',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <section class="not-found container">
    <p class="eyebrow">404 / NO SIGNAL</p>
    <h1>没有找到这个页面。</h1>
    <p>当前地址不存在或已经移动。</p>
    <div class="actions">
      <AppLink class="button button--primary" to="/">返回首页</AppLink>
      <AppLink class="button button--ghost" to="/software">查看软件作品</AppLink>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  display: grid;
  min-height: 70svh;
  align-content: center;
  justify-items: start;
}

.not-found h1 {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(2.5rem, 7vw, 5rem);
}

.not-found > p:not(.eyebrow) {
  margin: 1.25rem 0 2rem;
  color: var(--text-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
