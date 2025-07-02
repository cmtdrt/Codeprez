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
        // Supprimer l'ancien style s'il existe
        const existingStyle = document.getElementById('presentation-css')
        if (existingStyle) {
          existingStyle.remove()
        }
        
        // Ajouter le nouveau style avec un ID
        const style = document.createElement('style')
        style.id = 'presentation-css'
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

// Gestion de l'exécution de commandes
window.executeCommand = async (commandId, command) => {
  
  const outputElement = document.getElementById(`output_${commandId}`);
  const statusElement = document.getElementById(`status_${commandId}`);
  const contentElement = outputElement?.querySelector('.output-content');
  const executeBtn = document.querySelector(`[data-command-id="${commandId}"] .execute-btn`);
  const clearBtn = document.querySelector(`[data-command-id="${commandId}"] .clear-btn`);
  
  if (!outputElement || !contentElement) {
    return;
  }
  
  // Changer l'état du bouton
  if (executeBtn) {
    executeBtn.disabled = true;
    executeBtn.innerHTML = '<span class="btn-icon loading">⏳</span><span class="btn-text">En cours...</span>';
  }
  
  // Afficher le statut
  if (statusElement) {
    statusElement.style.display = 'flex';
  }
  
  // Préparer la sortie
  outputElement.style.display = 'block';
  contentElement.textContent = '';
  
  try {
    if (window?.electronAPI?.executeCommand) {
      // Écouter les sorties en temps réel
      const outputListener = (event, outputData) => {
        if (outputData.type === 'stdout') {
          contentElement.textContent += outputData.data;
          // Auto-scroll vers le bas
          contentElement.scrollTop = contentElement.scrollHeight;
        } else if (outputData.type === 'stderr') {
          contentElement.innerHTML += `<span style="color: #ff6b6b;">${outputData.data}</span>`;
          contentElement.scrollTop = contentElement.scrollHeight;
        }
      };
      
      window.electronAPI.onCommandOutput(outputListener);
      
      // Exécuter la commande
      const result = await window.electronAPI.executeCommand(command);
      
      // Nettoyer le listener
      window.electronAPI.removeCommandOutputListener(outputListener);
      
      // Masquer le statut
      if (statusElement) {
        statusElement.style.display = 'none';
      }
      
      // Afficher le résultat final
      if (result.success) {
        if (!contentElement.textContent.trim()) {
          contentElement.textContent = result.stdout || 'Commande exécutée avec succès (aucune sortie)';
        }
        // Indiquer le succès
        if (executeBtn) {
          executeBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Terminé</span>';
          executeBtn.style.backgroundColor = '#51cf66';
        }
      } else {
        if (!contentElement.innerHTML.includes('color: #ff6b6b')) {
          contentElement.innerHTML += `<span style="color: #ff6b6b;">Erreur (code ${result.code}):\n${result.stderr || 'Erreur inconnue'}</span>`;
        }
        // Indiquer l'erreur
        if (executeBtn) {
          executeBtn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Erreur</span>';
          executeBtn.style.backgroundColor = '#ff6b6b';
        }
      }
      
      // Afficher le bouton d'effacement
      if (clearBtn) {
        clearBtn.style.display = 'inline-flex';
      }
      
    } else {
      contentElement.innerHTML = '<span style="color: #ffd43b;">⚠️ Exécution de commandes non disponible en mode navigateur</span>';
      if (statusElement) {
        statusElement.style.display = 'none';
      }
    }
  } catch (error) {
    contentElement.innerHTML = `<span style="color: #ff6b6b;">❌ Erreur: ${error.message}</span>`;
    
    if (statusElement) {
      statusElement.style.display = 'none';
    }
    
    if (executeBtn) {
      executeBtn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Erreur</span>';
      executeBtn.style.backgroundColor = '#ff6b6b';
    }
  }
  
  // Réactiver le bouton après 2 secondes
  setTimeout(() => {
    if (executeBtn) {
      executeBtn.disabled = false;
      if (executeBtn.innerHTML.includes('Terminé') || executeBtn.innerHTML.includes('Erreur')) {
        executeBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Réexécuter</span>';
        executeBtn.style.backgroundColor = '';
      }
    }
  }, 2000);
};

// Fonction pour effacer la sortie d'une commande
window.clearCommandOutput = (commandId) => {
  const outputElement = document.getElementById(`output_${commandId}`);
  const contentElement = outputElement?.querySelector('.output-content');
  const clearBtn = document.querySelector(`[data-command-id="${commandId}"] .clear-btn`);
  
  if (contentElement) {
    contentElement.textContent = '';
  }
  if (outputElement) {
    outputElement.style.display = 'none';
  }
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
};

// Fonction pour toggle l'affichage de la sortie
window.toggleCommandOutput = (commandId) => {
  const outputElement = document.getElementById(`output_${commandId}`);
  const contentElement = outputElement?.querySelector('.output-content');
  const toggleBtn = outputElement?.querySelector('.output-collapse');
  
  if (contentElement && toggleBtn) {
    if (contentElement.style.display === 'none') {
      contentElement.style.display = 'block';
      toggleBtn.textContent = '−';
    } else {
      contentElement.style.display = 'none';
      toggleBtn.textContent = '+';
    }
  }
};
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
  background: #cc0000;
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
  bottom: 30px; /* Augmenté l'espace du bas */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.9); /* Plus opaque */
  padding: 15px 20px; /* Plus de padding */
  border-radius: 10px; /* Plus arrondi */
  display: flex;
  gap: 15px; /* Plus d'espace entre les éléments */
  align-items: center;
  color: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3); /* Ombre pour plus de visibilité */
  border: 2px solid rgba(255,255,255,0.1); /* Bordure subtile */
  backdrop-filter: blur(10px); /* Effet de flou */
  z-index: 1000; /* S'assurer qu'ils sont au-dessus */
}

.controls button {
  background: #007acc;
  color: white;
  border: none;
  padding: 8px 15px; /* Plus de padding */
  border-radius: 6px; /* Plus arrondi */
  cursor: pointer;
  font-size: 16px; /* Taille de police plus grande */
  font-weight: 600; /* Texte en gras */
  transition: all 0.2s ease; /* Animation smooth */
  min-width: 40px; /* Largeur minimale */
}

.controls button:hover {
  background: #005a9e; /* Couleur au survol */
  transform: scale(1.05); /* Effet de zoom léger */
}

.controls span {
  font-weight: 600; /* Compteur en gras */
  color: #e2e8f0; /* Couleur plus claire */
  min-width: 80px; /* Largeur minimale pour éviter le saut */
  text-align: center;
}
</style>

<style>
/* CSS de fallback pour les sections */
section {
  width: 100vw;
  height: 100vh;
  padding: 100px 80px 180px 80px; /* Même padding que le CSS de présentation */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Changé de center à flex-start */
  overflow-y: auto; /* Ajouté pour le scroll */
  overflow-x: hidden;
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); /* Ajouté le même fond */
  color: #1f2937; /* Ajouté la même couleur de texte */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Même police */
}

/* Styles de fallback pour les titres */
section h1 {
  font-size: 3.2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
  background: linear-gradient(45deg, #2563eb, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  padding-top: 0;
}

section h2 {
  font-size: 2.2rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: #2563eb;
  border-left: 4px solid #059669;
  padding-left: 1rem;
}

section h3 {
  font-size: 1.6rem;
  font-weight: 500;
  margin: 1.5rem 0 0.8rem 0;
  color: #1f2937;
}

section p {
  font-size: 1.3rem;
  line-height: 1.7;
  margin-bottom: 1.2rem;
  color: #1f2937;
}

/* Zone de sécurité pour le dernier élément */
section > *:last-child {
  margin-bottom: 4rem;
}

/* Responsive pour le fallback */
@media (max-width: 1200px) {
  section {
    padding: 60px 40px 160px 40px;
  }
  
  section h1 {
    font-size: 2.8rem;
  }
}

@media (max-width: 768px) {
  section {
    padding: 40px 20px 140px 20px;
  }
  
  section h1 {
    font-size: 2.2rem;
  }
}
</style>
