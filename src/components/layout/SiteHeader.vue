<script setup lang="ts">
import { ArrowUpRight, Menu, Moon, Sun, X } from '@lucide/vue'
import { shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from '../AppLink.vue'
import UnicornLogo from '../brand/UnicornLogo.vue'
import { siteConfig } from '../../data/site'
import { useTheme } from '../../composables/useTheme'

const { theme, toggleTheme } = useTheme()
const route = useRoute()
const mobileOpen = shallowRef(false)

const navigation = [
  { label: '首页', to: '/' },
  { label: '软件', to: '/software' },
  { label: '关于', to: '/about' },
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
          data-spatial="subtle"
          :to="item.to"
        >
          {{ item.label }}
        </AppLink>
        <a
          class="contact-link"
          data-spatial="subtle"
          :href="siteConfig.github"
          target="_blank"
          rel="noreferrer"
        >
          GITHUB
          <ArrowUpRight :size="15" />
        </a>
      </nav>
      <div class="header-actions">
        <button
          class="theme-toggle"
          type="button"
          role="switch"
          aria-label="亮色主题"
          :aria-checked="theme === 'light'"
          :title="theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'"
          @click="toggleTheme"
        >
          <span class="theme-toggle-thumb" aria-hidden="true" />
          <Sun class="theme-sun" :size="16" aria-hidden="true" />
          <Moon class="theme-moon" :size="15" aria-hidden="true" />
        </button>
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
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 50;
  top: 0;
  border-bottom: 1px solid var(--line-strong);
  background: var(--header-bg);
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
  margin-left: auto;
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
  background: rgb(var(--accent-rgb) / 5%);
  color: var(--text-strong);
}

.nav-link.router-link-active::after {
  transform: scaleX(1);
}

.contact-link {
  min-width: 7.4rem;
  border-right: 1px solid var(--line);
  background: var(--text-strong);
  color: var(--surface-0);
  font-weight: 700;
}

.contact-link:hover {
  background: var(--accent);
}

.menu-toggle {
  display: none;
}

.header-actions { display: flex; align-items: center; gap: 0.65rem; padding-left: 1.1rem; }
.theme-toggle {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-items: center;
  width: 4.65rem;
  height: 2.6rem;
  padding: 4px;
  border: 1px solid var(--line-strong);
  border-radius: 0.3rem;
  background: var(--surface-2);
  color: var(--text-dim);
  cursor: pointer;
}
.theme-toggle-thumb {
  position: absolute;
  inset: 4px auto 4px 4px;
  width: calc((100% - 8px) / 2);
  border-radius: 0.14rem;
  background: var(--surface-1);
  box-shadow: 0 1px 4px rgb(var(--shadow-rgb) / 12%);
  transform: translateX(100%);
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.theme-toggle svg { position: relative; }
.theme-moon { color: var(--accent); }
:global([data-theme='light'] .theme-toggle-thumb) { transform: translateX(0); }
:global([data-theme='light'] .theme-sun) { color: var(--accent); }
:global([data-theme='light'] .theme-moon) { color: var(--text-dim); }
.theme-toggle:hover { border-color: var(--accent); }

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
    background: var(--menu-bg);
    box-shadow: 0 1.5rem 4rem rgb(var(--shadow-rgb) / var(--shadow-alpha));
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
@media (max-width: 360px) {
  .brand { gap: 0.6rem; }
  .brand-copy strong { font-size: 0.72rem; letter-spacing: 0.08em; }
  .brand-copy small { display: none; }
  .header-actions { gap: 0.4rem; padding-left: 0.5rem; }
  .theme-toggle { width: 4.25rem; }
}
</style>
