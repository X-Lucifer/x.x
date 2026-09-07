<script setup lang="ts">
import { unicornPath } from './unicorn'
withDefaults(
  defineProps<{
    title?: string
    interactive?: boolean
  }>(),
  {
    title: '',
    interactive: true,
  },
)
</script>

<template>
  <span class="unicorn-shell" :class="{ 'unicorn-shell--interactive': interactive }">
    <svg
      class="unicorn"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      :aria-hidden="title ? undefined : true"
      :role="title ? 'img' : undefined"
    >
      <title v-if="title">{{ title }}</title>
      <path
        :d="unicornPath"
      />
    </svg>
  </span>
</template>

<style scoped>
.unicorn-shell {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
}

.unicorn {
  width: 100%;
  height: 100%;
  overflow: visible;
  transition:
    filter 250ms ease,
    transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.unicorn path {
  fill: var(--unicorn-fill, #edf4f0);
  transition: fill 250ms ease;
}

.unicorn-shell--interactive:hover .unicorn,
.unicorn-shell--interactive:focus-within .unicorn {
  filter:
    drop-shadow(0 0 0.75rem rgb(var(--accent-rgb) / 50%))
    drop-shadow(0 0 2rem rgb(var(--accent-rgb) / 22%));
  transform: translateY(-2px) scale(1.015);
}

.unicorn-shell--interactive:hover .unicorn path,
.unicorn-shell--interactive:focus-within .unicorn path {
  fill: var(--unicorn-hover-fill, #18251e);
}

@media (prefers-reduced-motion: reduce) {
  .unicorn,
  .unicorn path {
    transition: none;
  }

  .unicorn-shell--interactive:hover .unicorn {
    transform: none;
  }
}
</style>
