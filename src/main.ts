import { ViteSSG } from 'vite-ssg'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './style.css'
import App from './App.vue'
import { routerOptions } from './router'
import { softwareProjects } from './data/software'

function routerBase() {
  if (import.meta.env.SSR) return '/'

  return window.location.pathname === '/x.x' ||
    window.location.pathname.startsWith('/x.x/')
    ? '/x.x/'
    : '/'
}

export const createApp = ViteSSG(App, {
  ...routerOptions,
  base: routerBase(),
})

export function includedRoutes() {
  return [
    '/',
    '/software',
    '/about',
    ...softwareProjects.map((project) => `/software/${project.slug}`),
  ]
}
