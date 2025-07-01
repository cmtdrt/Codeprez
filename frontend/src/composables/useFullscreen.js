// Composable pour gérer le plein écran
export function useFullscreen(isFullscreen, isElectronMode) {
    const toggleFullscreen = async () => {
        if (isElectronMode.value) {
            // Utiliser l'API Electron pour le plein écran
            try {
                await window.electronAPI.windowControl('toggle-fullscreen')
                isFullscreen.value = !isFullscreen.value
            } catch (error) {
                console.error('Erreur lors du toggle plein écran Electron:', error)
                // Fallback vers l'API web
                await toggleWebFullscreen()
            }
        } else {
            // Utiliser l'API web standard
            await toggleWebFullscreen()
        }
    }

    const toggleWebFullscreen = async () => {
        if (!isFullscreen.value) {
            await enterFullscreen()
        } else {
            await exitFullscreen()
        }
    }

    const enterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen()
            } else if (document.documentElement.mozRequestFullScreen) {
                await document.documentElement.mozRequestFullScreen()
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen()
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen()
            }
            isFullscreen.value = true
        } catch (err) {
            console.error('Erreur lors de l\'activation du plein écran:', err)
        }
    }

    const exitFullscreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen()
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen()
            }
            isFullscreen.value = false
        } catch (err) {
            console.error('Erreur lors de la désactivation du plein écran:', err)
        }
    }

    const onFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        )
        isFullscreen.value = isCurrentlyFullscreen
    }

    return {
        toggleFullscreen,
        onFullscreenChange
    }
}
