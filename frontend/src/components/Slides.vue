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

// Gestion de l'exécution de commandes
window.executeCommand = async (commandId, command) => {
  console.log('🚀 Exécution de la commande:', command);
  
  const outputElement = document.getElementById(`output_${commandId}`);
  const statusElement = document.getElementById(`status_${commandId}`);
  const contentElement = outputElement?.querySelector('.output-content');
  const executeBtn = document.querySelector(`[data-command-id="${commandId}"] .execute-btn`);
  const clearBtn = document.querySelector(`[data-command-id="${commandId}"] .clear-btn`);
  
  if (!outputElement || !contentElement) {
    console.error('Éléments de sortie non trouvés');
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
    console.error('Erreur lors de l\'exécution:', error);
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

/* Styles pour les blocs de commandes */
.command-block {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  border: 2px solid #4a90e2;
  border-radius: 12px;
  margin: 20px 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  transition: all 0.3s ease;
}

.command-block:hover {
  border-color: #63b3ed;
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
}

.command-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.command-info {
  flex: 1;
  min-width: 0;
}

.command-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.command-text {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  color: #f7fafc;
  display: block;
  word-break: break-all;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.command-controls {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.execute-btn, .clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.execute-btn:hover {
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.execute-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.clear-btn {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.clear-btn:hover {
  background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-size: 12px;
}

.loading {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.5; }
}

.command-status {
  padding: 12px 20px;
  background: rgba(74, 144, 226, 0.1);
  border-top: 1px solid rgba(74, 144, 226, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4a90e2;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite alternate;
}

.status-text {
  font-size: 13px;
  color: #a0aec0;
  font-weight: 500;
}

.command-output {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.output-header {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.output-title {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.output-collapse {
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.output-collapse:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.output-content {
  margin: 0;
  padding: 16px 20px;
  background: #1a202c;
  color: #e2e8f0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.output-content::-webkit-scrollbar {
  width: 8px;
}

.output-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive design */
@media (max-width: 768px) {
  .command-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .command-controls {
    justify-content: center;
  }
  
  .command-text {
    font-size: 12px;
  }
  
  .execute-btn, .clear-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
