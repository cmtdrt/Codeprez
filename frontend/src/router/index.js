import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'slides',
      component: () => import('@/components/Slides.vue') // ou le bon chemin vers ton composant principal
    }
  ]
})
