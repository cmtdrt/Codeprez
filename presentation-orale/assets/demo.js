// CodePrez - Architecture Vue.js 3
import { ref, computed, onMounted } from 'vue'
import SlidesOverview from './SlidesOverview.vue'

// Variables réactives pour la gestion des slides
const slides = ref([])
const presentationMode = ref(false)
const currentSlideIndex = ref(0)
const isFullscreen = ref(false)

// Computed property pour la slide actuelle
const currentSlide = computed(() =>
    slides.value[currentSlideIndex.value] || ''
)

// Fonctions de navigation
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

// Gestion du mode présentation
const startPresentation = () => {
    presentationMode.value = true
    currentSlideIndex.value = 0
}

const exitPresentation = () => {
    presentationMode.value = false
}

// Chargement des slides via Electron IPC
const loadSlides = async () => {
    try {
        if (window?.electronAPI?.loadSlides) {
            const result = await window.electronAPI.loadSlides()
            slides.value = result.slides || []
        }
    } catch (err) {
        console.error('Erreur chargement slides:', err)
    }
}

// Export des fonctions principales
export {
    slides,
    currentSlide,
    nextSlide,
    prevSlide,
    startPresentation,
    exitPresentation,
    loadSlides
}
