import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from './components/LandingPage.vue'
import InsertDocs from './components/InsertDocs.vue'
import InsertZip from './components/InsertZip.vue'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/insert-docs', component: InsertDocs },
  { path: '/insert-zip', component: InsertZip }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

createApp(App).use(router).mount('#app')