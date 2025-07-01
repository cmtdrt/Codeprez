<template>
  <div class="slides-container">
    <div v-if="loading" class="loading">Chargement des slides...</div>
    <div v-else-if="error" class="error">
      <h2>Erreur</h2>
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <div class="slide" v-html="slides[current]"></div>
      <div class="nav">
        <button @click="prev" :disabled="current === 0">Précédent</button>
        <span>{{ current + 1 }} / {{ slides.length }}</span>
        <button @click="next" :disabled="current === slides.length - 1">Suivant</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const slides = ref([])
const loading = ref(true)
const error = ref(null)
const current = ref(0)

function prev() {
  if (current.value > 0) current.value--
}
function next() {
  if (current.value < slides.value.length - 1) current.value++
}

onMounted(async () => {
  try {
    if (window?.electronAPI?.loadSlides) {
      const result = await window.electronAPI.loadSlides()
      slides.value = result && typeof result === 'object' && result.slides
        ? result.slides
        : Array.isArray(result) ? result : []
      if (result && result.customCSS) {
        loadCustomCSS(result.customCSS)
      }
    } else {
      const response = await fetch('/api/slides')
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      slides.value = data.slides || []
      if (slides.value.length === 0) {
        error.value = "Aucune slide trouvée. Créez un fichier example-pres/presentation.md pour commencer."
      }
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

function loadCustomCSS(cssContent) {
  let styleEl = document.getElementById('presentation-style')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'presentation-style'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = cssContent
}
</script>

<style scoped>
.slides-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #fff;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
  margin: 2rem;
}

.error {
  background: #722;
  border-color: #f44;
}

.slide {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
</style>

<style>
/* Aucun style global par défaut - uniquement les styles de commandes */

/* Styles pour les blocs de commandes - design simple et contrasté */
.command-block {
  background: rgba(255, 255, 255, 0.95) !important;
  color: #000 !important;
  border: 2px solid #000 !important;
  border-radius: 8px !important;
  margin: 1rem 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  font-family: Arial, sans-serif !important;
}

.command-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 1rem !important;
  background: #f0f0f0 !important;
  border-bottom: 1px solid #ccc !important;
}

.command-text {
  font-family: 'Courier New', monospace !important;
  background: #000 !important;
  color: #fff !important;
  padding: 0.5rem !important;
  border-radius: 4px !important;
  flex: 1 !important;
  margin-right: 1rem !important;
}

.execute-btn {
  background: #007acc !important;
  color: white !important;
  border: none !important;
  padding: 0.5rem 1rem !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  font-weight: bold !important;
  transition: background-color 0.2s !important;
}

.execute-btn:hover:not(:disabled) {
  background: #005999 !important;
}

.execute-btn:disabled {
  background: #666 !important;
  cursor: not-allowed !important;
}

.command-output {
  max-height: 300px !important;
  overflow-y: auto !important;
  background: #000 !important;
  color: #fff !important;
}

.output-content {
  margin: 0 !important;
  padding: 1rem !important;
  font-family: 'Courier New', monospace !important;
  font-size: 0.9em !important;
  line-height: 1.4 !important;
  white-space: pre-wrap !important;
}
</style>
