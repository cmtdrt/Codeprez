import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: () => import('@/components/LandingPage.vue')
    },
    {
      path: '/insert-docs',
      name: 'insert-docs',
      component: () => import('@/components/InsertDocs.vue')
    },
    {
      path: '/insert-zip',
      name: 'insert-zip',
      component: () => import('@/components/InsertZip.vue')
    },
    {
      path: '/slides',
      name: 'slides',
      component: () => import('@/components/Slides.vue')
    }
  ]
})
