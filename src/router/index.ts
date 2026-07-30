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
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0, behavior: 'smooth' }
  },
}
