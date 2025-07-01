// Composable pour gérer la navigation entre les slides
export function useSlideNavigation(currentSlideIndex, totalSlides, resetControlsTimeout) {
    const nextSlide = () => {
        if (currentSlideIndex.value < totalSlides.value - 1) {
            currentSlideIndex.value++
            resetControlsTimeout()
        }
    }

    const prevSlide = () => {
        if (currentSlideIndex.value > 0) {
            currentSlideIndex.value--
            resetControlsTimeout()
        }
    }

    const goToSlide = (index) => {
        if (index >= 0 && index < totalSlides.value) {
            currentSlideIndex.value = index
            resetControlsTimeout()
        }
    }

    return {
        nextSlide,
        prevSlide,
        goToSlide
    }
}
