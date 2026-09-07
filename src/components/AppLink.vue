<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  to: string
}>()

const route = useRoute()
const router = useRouter()

function pathSegments(path: string) {
  return path.split(/[?#]/, 1)[0].split('/').filter(Boolean)
}

function relativePageHref(from: string, to: string) {
  const fromSegments = pathSegments(from)
  const toSegments = pathSegments(to)
  let commonSegments = 0

  while (
    commonSegments < fromSegments.length &&
    commonSegments < toSegments.length &&
    fromSegments[commonSegments] === toSegments[commonSegments]
  ) {
    commonSegments++
  }

  const parentPath = '../'.repeat(fromSegments.length - commonSegments)
  const childPath = toSegments.slice(commonSegments).join('/')
  const relativePath = `${parentPath}${childPath ? `${childPath}/` : ''}`

  return relativePath || './'
}

const href = computed(() => relativePageHref(route.path, props.to))
const currentPath = computed(() => route.path.replace(/\/+$/, '') || '/')
const isActive = computed(() => {
  if (props.to === '/') return currentPath.value === '/'
  return currentPath.value === props.to || currentPath.value.startsWith(`${props.to}/`)
})
const isCurrent = computed(() => currentPath.value === props.to)

function navigate(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  event.preventDefault()
  // Match the directory URLs emitted by SSG so refreshing a nested page keeps
  // resolving its relative styles, scripts and links from the same directory.
  const target = router.resolve(props.to)
  void router.push({
    path: target.path.endsWith('/') ? target.path : `${target.path}/`,
    query: target.query,
    hash: target.hash,
  })
}
</script>

<template>
  <a
    :href="href"
    :class="{ 'router-link-active': isActive }"
    :aria-current="isCurrent ? 'page' : undefined"
    @click="navigate"
  >
    <slot />
  </a>
</template>
