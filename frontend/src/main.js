import './assets/main.css'
import 'highlight.js/styles/github-dark.css' // Thème GitHub Dark pour la coloration syntaxique

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
