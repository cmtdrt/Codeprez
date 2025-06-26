<template>
  <div class="slides-container">
    <section
      v-for="(slide, index) in slides"
      :key="index"
      class="slide"
      v-html="slide"
    ></section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const slides = ref([])

onMounted(async () => {
  try {
    if (window?.electronAPI?.loadSlides) {
      // Mode Electron - charger les slides depuis le backend
      slides.value = await window.electronAPI.loadSlides()
    } else {
      // Mode navigateur - essayer de charger depuis une API REST
      try {
        const response = await fetch('/api/slides')
        if (response.ok) {
          slides.value = await response.json()
        } else {
          throw new Error('API non disponible')
        }
      } catch (apiError) {
        // Fallback vers les slides de démonstration si l'API n'est pas disponible
        slides.value = [
          `<section class="slide">
            <h1>🎯 Codeprez - Mode Navigateur</h1>
            <p><strong>Slides de démonstration</strong></p>
            <p>Pour voir vos vraies slides, lancez l'application Electron avec <code>npm run start</code></p>
          </section>`,
          `<section class="slide">
            <h2>📝 Fonctionnalités</h2>
            <ul>
              <li>Parse les fichiers Markdown</li>
              <li>Coloration syntaxique du code</li>
              <li>Interface Electron + Vue.js</li>
              <li>Présentations style PowerPoint</li>
            </ul>
          </section>`,
          `<section class="slide">
            <h2>💻 Exemple de code</h2>
            <pre><code class="hljs javascript">function helloWorld() {
  console.log("Hello, Codeprez!");
  return "Présentations Markdown";
}</code></pre>
            <p>Le code est automatiquement coloré !</p>
          </section>`,
          `<section class="slide">
            <h2>🚀 Pour voir vos slides</h2>
            <p>Lancez l'application complète avec :</p>
            <pre><code class="hljs bash">npm run start</code></pre>
            <p>Puis modifiez <code>example-pres/presentation.md</code> avec votre contenu.</p>
          </section>`
        ]
      }
    }
  } catch (err) {
    slides.value = [`<section class="slide"><h2>❌ Erreur</h2><pre>${err.message}</pre></section>`]
  }
})
</script>

<style>
.slides-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #0d1117;
  min-height: 100vh;
}

.slide {
  border: 2px solid #30363d;
  border-radius: 8px;
  padding: 2rem;
  background: #161b22;
  color: #f0f6fc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.slide:hover {
  transform: translateY(-2px);
  border-color: #58a6ff;
}

.slide h1 {
  color: #58a6ff;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.slide h2 {
  color: #7c3aed;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.slide ul {
  margin-left: 1.5rem;
}

.slide li {
  margin-bottom: 0.5rem;
}

.slide pre {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.slide code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>
