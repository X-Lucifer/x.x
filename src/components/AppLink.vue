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
const isActive = computed(() => {
  if (props.to === '/') return route.path === '/'
  return route.path === props.to || route.path.startsWith(`${props.to}/`)
})
const isCurrent = computed(() => route.path === props.to)

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
  void router.push(props.to)
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
