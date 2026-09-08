import type { RouterOptions, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/software',
      name: 'software',
      component: () => import('../views/SoftwareView.vue'),
    },
    {
      path: '/software/:slug',
      name: 'software-detail',
      component: () => import('../views/SoftwareDetailView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ]

export const routerOptions: Omit<RouterOptions, 'history'> = {
  routes,
  scrollBehavior(to, _from, savedPosition) {
    const behavior = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant' : 'smooth'
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 112, behavior }
    return { top: 0, behavior }
  },
}
