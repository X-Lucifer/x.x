<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

const field = useTemplateRef<HTMLElement>('field')
let alive = true
let world: ReturnType<typeof import('./spatialField').createSpatialField> | undefined
onMounted(async () => {
  try {
    const { createSpatialField } = await import('./spatialField')
    if (!alive || !field.value) return
    world = createSpatialField(field.value)
  } catch (error) {
    console.warn('[Spatial field] Static background is active.', error)
  }
})
onUnmounted(() => { alive = false; world?.dispose() })
</script>

<template>
  <div ref="field" class="spatial-field" aria-hidden="true" />
  <div class="spatial-vignette" aria-hidden="true" />
</template>

<style scoped>
.spatial-field { position: fixed; z-index: -2; inset: 0; pointer-events: none; }
.spatial-field :deep(canvas) { display: block; width: 100%; height: 100%; }
.spatial-vignette { position: fixed; z-index: -1; inset: 0; pointer-events: none; background: linear-gradient(to bottom, rgb(var(--surface-rgb) / 16%), transparent 42%), radial-gradient(ellipse at 50% 32%, rgb(var(--surface-rgb) / 28%) 15%, transparent 72%); }
</style>
