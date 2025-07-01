// Composable pour gérer l'état de l'application
import { ref, computed } from 'vue'

export function useAppState() {
    // États réactifs
    const slides = ref([])
    const loading = ref(true)
    const error = ref(null)
    const presentationMode = ref(false)
    const currentSlideIndex = ref(0)
    const showControls = ref(true)
    const showKeyboardHelp = ref(false)
    const isFullscreen = ref(false)
    const isElectronMode = ref(false)
    const appInfo = ref(null)

    // Propriétés calculées
    const currentSlideContent = computed(() => {
        return slides.value[currentSlideIndex.value] || ''
    })

    const totalSlides = computed(() => slides.value.length)

    return {
        // États
        slides,
        loading,
        error,
        presentationMode,
        currentSlideIndex,
        showControls,
        showKeyboardHelp,
        isFullscreen,
        isElectronMode,
        appInfo,
        // Propriétés calculées
        currentSlideContent,
        totalSlides
    }
}
