<script setup lang="ts">
import { ArrowUpRight, Menu, X } from '@lucide/vue'
import { shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from '../AppLink.vue'
import UnicornLogo from '../brand/UnicornLogo.vue'
import { siteConfig } from '../../data/site'

const route = useRoute()
const mobileOpen = shallowRef(false)

const navigation = [
  { label: '首页', code: '00', to: '/' },
  { label: '软件', code: '01', to: '/software' },
  { label: '关于', code: '02', to: '/about' },
]

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <header class="site-header">
    <div class="header-inner container">
      <AppLink class="brand" to="/" aria-label="返回首页">
        <span class="brand-logo">
          <UnicornLogo title="X.LUCIFER 独角兽标志" />
        </span>
        <span class="brand-copy">
          <strong>{{ siteConfig.brand }}</strong>
          <small>SOFTWARE ENGINEER</small>
        </span>
      </AppLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="mobileOpen"
        aria-controls="primary-navigation"
        aria-label="切换导航"
        @click="mobileOpen = !mobileOpen"
      >
        <X v-if="mobileOpen" :size="19" />
        <Menu v-else :size="19" />
      </button>

      <nav
        id="primary-navigation"
        class="navigation"
        :class="{ 'navigation--open': mobileOpen }"
        aria-label="主导航"
      >
        <AppLink
          v-for="item in navigation"
          :key="item.to"
          class="nav-link"
          :to="item.to"
        >
          <span>{{ item.code }}</span>
          {{ item.label }}
        </AppLink>
        <a
          class="contact-link"
          :href="siteConfig.github"
          target="_blank"
          rel="noreferrer"
        >
          GITHUB
          <ArrowUpRight :size="15" />
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 50;
  top: 0;
  border-bottom: 1px solid var(--line-strong);
  background: rgb(5 8 6 / 90%);
  backdrop-filter: blur(18px);
}

.header-inner {
  display: flex;
  min-height: 4.75rem;
  align-items: stretch;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  padding-right: 1.5rem;
  border-right: 1px solid var(--line);
  color: var(--text-strong);
  text-decoration: none;
}

.brand-logo {
  --unicorn-fill: #edf4f0;
  --unicorn-hover-fill: #152019;
  display: block;
  width: 2.65rem;
  height: 2.65rem;
}

.brand-copy {
  display: grid;
  gap: 0.16rem;
}

.brand-copy strong,
.brand-copy small {
  font-family: var(--font-mono);
}

.brand-copy strong {
  color: var(--text-strong);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
}

.brand-copy small {
  color: var(--text-dim);
  font-size: 0.5rem;
  letter-spacing: 0.1em;
}

.navigation {
  display: flex;
  align-items: stretch;
}

.nav-link,
.contact-link {
  position: relative;
  display: inline-flex;
  min-width: 5.4rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  border-left: 1px solid var(--line);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-decoration: none;
  transition:
    color 180ms ease,
    background-color 180ms ease;
}

.nav-link span {
  color: var(--text-dim);
  font-size: 0.55rem;
}

.nav-link::after {
  position: absolute;
  right: 0.8rem;
  bottom: -1px;
  left: 0.8rem;
  height: 2px;
  background: var(--accent);
  content: '';
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 180ms ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgb(126 223 172 / 5%);
  color: var(--text-strong);
}

.nav-link.router-link-active::after {
  transform: scaleX(1);
}

.contact-link {
  min-width: 7.4rem;
  border-right: 1px solid var(--line);
  background: var(--text-strong);
  color: #07100b;
  font-weight: 700;
}

.contact-link:hover {
  background: var(--accent);
}

.menu-toggle {
  display: none;
}

@media (max-width: 760px) {
  .header-inner {
    min-height: 4.2rem;
    align-items: center;
  }

  .brand {
    padding-right: 0;
    border-right: 0;
  }

  .brand-logo {
    width: 2.35rem;
    height: 2.35rem;
  }

  .menu-toggle {
    display: grid;
    width: 2.6rem;
    height: 2.6rem;
    place-items: center;
    border: 1px solid var(--line-strong);
    border-radius: 0.15rem;
    background: var(--surface-1);
    color: var(--text-strong);
  }

  .navigation {
    position: absolute;
    top: 100%;
    right: var(--container-padding);
    left: var(--container-padding);
    display: none;
    border: 1px solid var(--line-strong);
    border-bottom: 0;
    background: rgb(6 10 7 / 98%);
    box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 48%);
  }

  .navigation--open {
    display: flex;
    flex-direction: column;
  }

  .nav-link,
  .contact-link {
    width: 100%;
    min-height: 3.25rem;
    justify-content: flex-start;
    border-right: 0;
    border-bottom: 1px solid var(--line-strong);
    border-left: 0;
  }

  .nav-link::after {
    top: 0.7rem;
    right: auto;
    bottom: 0.7rem;
    left: -1px;
    width: 2px;
    height: auto;
    transform: scaleY(0);
  }

  .nav-link.router-link-active::after {
    transform: scaleY(1);
  }
}
</style>
