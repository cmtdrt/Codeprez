<template>
  <div class="app">
    <!-- Vue d'ensemble avec SlidesOverview -->
    <SlidesOverview
      v-if="!presentationMode"
      :slides="slides"
      :loading="loading"
      :error="error"
      :is-electron-mode="isElectronMode"
      :is-fullscreen="isFullscreen"
      :app-info="appInfo"
      @start-presentation="startPresentation"
      @start-presentation-at="startPresentationAt"
      @toggle-fullscreen="toggleFullscreen"
      @reload-slides="loadSlides"
    />

    <!-- Présentation simple -->
    <div v-else class="presentation" @click="nextSlide">
      <div v-html="currentSlide"></div>
      
      <div class="controls">
        <button @click.stop="prevSlide">←</button>
        <span>{{ currentSlideIndex + 1 }} / {{ slides.length }}</span>
        <button @click.stop="nextSlide">→</button>
        <button @click.stop="exitPresentation">Quitter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SlidesOverview from './SlidesOverview.vue'

// Variables simples
const slides = ref([])
const loading = ref(true)
const error = ref(null)
const presentationMode = ref(false)
const currentSlideIndex = ref(0)
const isFullscreen = ref(false)
const isElectronMode = ref(!!window?.electronAPI)
const appInfo = ref(null)

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

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Chargement simple
const loadSlides = async () => {
  try {
    if (window?.electronAPI?.loadSlides) {
      const result = await window.electronAPI.loadSlides()
      slides.value = result.slides || []
      
      // Charger le CSS de présentation
      if (result.customCSS) {
        const style = document.createElement('style')
        style.textContent = result.customCSS
        document.head.appendChild(style)
      }
    } else {
      // Mode navigateur - slides de test
      slides.value = [
        '<section><h1>Slide 1</h1><p>Test en mode navigateur</p></section>',
        '<section><h1>Slide 2</h1><p>Autre slide</p></section>'
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
onMounted(async () => {
  // Charger les informations de l'application si en mode Electron
  if (window?.electronAPI?.getAppInfo) {
    try {
      appInfo.value = await window.electronAPI.getAppInfo()
    } catch (e) {
      console.warn('Impossible de charger les infos de l\'application:', e)
    }
  }
  
  loadSlides()
  document.addEventListener('keydown', handleKeydown)
})
</script>
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

.overview h1 { 
  color: white; 
}

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
  color: white;
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
/* CSS de fallback pour les sections */
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
