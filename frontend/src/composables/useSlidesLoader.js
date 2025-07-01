// Composable pour charger les slides et gérer les API
export function useSlidesLoader() {
    // Chargement des slides
    const loadSlides = async (slides, loading, error, isElectronMode, appInfo, loadCustomCSS, setupCommandExecution, loadPresentationCSS) => {
        try {
            // Détecter si on est en mode Electron
            if (window?.electronAPI?.isElectron) {
                console.log('🔗 Mode Electron détecté - Liaison active')
                isElectronMode.value = true

                // Récupérer les informations de l'app
                try {
                    appInfo.value = await window.electronAPI.getAppInfo()
                    console.log('📱 App Info:', appInfo.value)
                } catch (e) {
                    console.warn('Impossible de récupérer les infos de l\'app:', e)
                }

                // Charger les slides via IPC
                const result = await window.electronAPI.loadSlides()

                // Le parser renvoie maintenant un objet avec slides et customCSS
                if (result && typeof result === 'object' && result.slides) {
                    slides.value = result.slides
                    console.log('✅ Slides chargées via Electron:', slides.value.length)

                    // Charger le CSS personnalisé si disponible
                    if (result.customCSS) {
                        loadCustomCSS(result.customCSS)
                    }
                } else {
                    // Compatibilité avec l'ancien format (array de slides)
                    slides.value = Array.isArray(result) ? result : []
                }

                // Configurer l'écoute des sorties de commandes en temps réel
                setupCommandExecution()
            } else {
                // Mode navigateur pur
                console.log('🌐 Mode navigateur détecté')
                isElectronMode.value = false

                // Charger le CSS personnalisé en mode navigateur
                await loadPresentationCSS()

                // Utiliser l'API REST (mode navigateur)
                const response = await fetch('/api/slides')

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`)
                }

                const data = await response.json()

                if (data.error) {
                    throw new Error(data.error)
                }

                slides.value = data.slides || []
                console.log('✅ Slides chargées via API REST:', slides.value.length)

                if (slides.value.length === 0) {
                    error.value = "Aucune slide trouvée. Créez un fichier example-pres/presentation.md pour commencer."
                }
            }
        } catch (err) {
            console.error('❌ Erreur lors du chargement des slides:', err)
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    // Fonction pour charger le CSS personnalisé (mode Electron et navigateur)
    const loadCustomCSS = (cssContent) => {
        console.log('📎 Chargement du CSS personnalisé...')

        // Créer ou mettre à jour l'élément style pour le CSS de la présentation
        let styleEl = document.getElementById('presentation-style')
        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = 'presentation-style'
            styleEl.type = 'text/css'
            document.head.appendChild(styleEl)
        }

        // Injecter le CSS avec quelques améliorations pour la visibilité
        const enhancedCSS = `
      ${cssContent}
      
      /* Améliorations pour la visibilité en mode présentation */
      .presentation-mode section {
        min-height: 100vh !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        font-size: 1.2rem !important;
      }
      
      .presentation-mode h1, .presentation-mode h2, .presentation-mode h3 {
        font-size: inherit !important;
        margin-bottom: 20px !important;
      }
      
      .presentation-mode p, .presentation-mode li {
        font-size: inherit !important;
        line-height: 1.6 !important;
      }
    `

        styleEl.textContent = enhancedCSS

        console.log('✅ CSS de présentation chargé et appliqué')
    }

    // Fonction pour charger le CSS de la présentation (mode navigateur uniquement)
    const loadPresentationCSS = async () => {
        try {
            const response = await fetch('/api/presentation-style.css')
            if (response.ok) {
                const cssContent = await response.text()
                loadCustomCSS(cssContent)
                console.log('CSS de présentation chargé (mode navigateur)')
            } else {
                console.warn('Aucun CSS de présentation trouvé, utilisation du fallback')
            }
        } catch (error) {
            console.warn('Impossible de charger le CSS de présentation:', error)
        }
    }

    return {
        loadSlides,
        loadCustomCSS,
        loadPresentationCSS
    }
}
