

<script setup>
import { ref, computed, onMounted } from 'vue'

// Variables simples
const slides = ref([])
const loading = ref(true)
const error = ref(null)
const presentationMode = ref(false)
const currentSlideIndex = ref(0)

// Calcul simple
const currentSlide = computed(() => slides.value[currentSlideIndex.value] || '')

// Fonctions simples
const startPresentation = () => {
  presentationMode.value = true
  currentSlideIndex.value = 0
}

const startPresentationAt = (index) => {
  presentationMode.value = true
  currentSlideIndex.value = index
}

const exitPresentation = () => {
  presentationMode.value = false
}

const nextSlide = () => {
  if (currentSlideIndex.value < slides.value.length - 1) {
    currentSlideIndex.value++
  }
}

const prevSlide = () => {
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--
  }
}

// Chargement simple
const loadSlides = async () => {
  try {
    if (window?.electronAPI?.loadSlides) {
      const result = await window.electronAPI.loadSlides()
      slides.value = result.slides || []
      
      if (result.customCSS) {
        const style = document.createElement('style')
        style.textContent = result.customCSS
        document.head.appendChild(style)
      }
    } else {
      slides.value = [
        '<section><h1>Slide 1</h1><p>Test</p></section>',
        '<section><h1>Slide 2</h1><p>Test 2</p></section>'
      ]
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Clavier simple
const handleKeydown = (event) => {
  if (!presentationMode.value) return
  
  if (event.key === 'ArrowRight' || event.key === ' ') {
    nextSlide()
  } else if (event.key === 'ArrowLeft') {
    prevSlide()
  } else if (event.key === 'Escape') {
    exitPresentation()
  }
}

// Démarrage
onMounted(() => {
  loadSlides()
  document.addEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="app">
    <!-- Vue d'ensemble simple -->
    <div v-if="!presentationMode" class="overview">
      <h1>CodePrez</h1>
      <button @click="startPresentation">Commencer</button>
      
      <div v-if="loading">Chargement...</div>
      <div v-if="error">Erreur: {{ error }}</div>
      
      <div class="slides-list">
        <div v-for="(slide, index) in slides" :key="index" @click="startPresentationAt(index)" class="slide-item">
          Slide {{ index + 1 }}
        </div>
      </div>
    </div>

    <!-- Présentation simple -->
    <div v-else class="presentation">
      <div v-html="currentSlide"></div>
      
      <div class="controls">
        <button @click="prevSlide">←</button>
        <span>{{ currentSlideIndex + 1 }} / {{ slides.length }}</span>
        <button @click="nextSlide">→</button>
        <button @click="exitPresentation">Quitter</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  background: #000;
  color: white;
  font-family: Arial, sans-serif;
}

.overview {
  padding: 20px;
  text-align: center;
}

.overview h1 { color: white; }

.overview button, .slide-item {
  background: #007acc;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block;
}

.presentation {
  width: 100%;
  height: 100%;
  position: relative;
}

.controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  padding: 10px;
  border-radius: 5px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.controls button {
  background: #007acc;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}
</style>

<style>
section {
  width: 100vw;
  height: 100vh;
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
}
</style>

<style>
/* Styles de fallback minimalistes uniquement si le CSS personnalisé ne se charge pas */
section {
  width: 100vw;
  height: 100vh;
  padding: 40px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1.3rem;
  line-height: 1.6;
  overflow: auto;
}

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
  max-width: 90% !important;
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
