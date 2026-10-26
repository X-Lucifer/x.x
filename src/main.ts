import { ViteSSG } from 'vite-ssg'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './style.css'
import App from './App.vue'
import { routerOptions } from './router'
import { softwareProjects } from './data/software'
import { registerSiteTools } from './agent/webmcp'

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
}, ({ router }) => {
  if (!import.meta.env.SSR) {
    // Unhead identifies alternate links by type + href, ahead of explicit keys.
    // Adopt the relative SSG link using the same deployment URL as client updates.
    for (const link of document.querySelectorAll<HTMLLinkElement>('head link[rel="alternate"][type="text/markdown"]')) {
      link.setAttribute('href', new URL(link.href).pathname)
    }
    void registerSiteTools().ready.catch(error => {
      console.warn('WebMCP tools could not be registered', error)
    })
    // Freeze the initial SSG asset URLs before client navigation changes the document path.
    for (const link of document.querySelectorAll<HTMLLinkElement>(
      'head link[rel="icon"], head link[rel="apple-touch-icon"], head link[rel="manifest"]',
    )) {
      link.setAttribute('href', link.href)
    }
  }
  router.beforeResolve(async to => {
    if (to.name !== 'software-detail') return
    const { loadSoftwareContent } = await import('./data/softwareContent')
    await loadSoftwareContent(String(to.params.slug))
  })
}, { hydration: import.meta.env.PROD })

export function includedRoutes() {
  return [
    '/',
    '/software',
    '/about',
    ...softwareProjects.map((project) => `/software/${project.slug}`),
  ]
}
