<template>
  <div class="slides-container">
    <div v-if="loading" class="loading">Chargement des slides...</div>
    <div v-else-if="error" class="error">
      <h2>Erreur</h2>
      <p>{{ error }}</p>
    </div>
    <div
      v-else
      v-for="(slide, index) in slides"
      :key="index"
      class="slide"
      v-html="slide"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const slides = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Essayer d'abord l'API Electron
    if (window?.electronAPI?.loadSlides) {
      console.log('Mode Electron détecté, chargement via electronAPI')
      const result = await window.electronAPI.loadSlides()
      
      // Le parser renvoie maintenant un objet avec slides et customCSS
      if (result && typeof result === 'object' && result.slides) {
        slides.value = result.slides
        
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
      // Charger le CSS personnalisé en mode navigateur
      await loadPresentationCSS()
      
      // Sinon, utiliser l'API REST (mode navigateur)
      console.log('Mode navigateur détecté, chargement via API REST')
      const response = await fetch('/api/slides')
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      slides.value = data.slides || []
      
      if (slides.value.length === 0) {
        error.value = "Aucune slide trouvée. Créez un fichier example-pres/presentation.md pour commencer."
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement des slides:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
})

// Configuration de l'exécution de commandes (mode Electron)
function setupCommandExecution() {
  if (!window?.electronAPI?.executeCommand) return;
  
  // Fonction globale pour exécuter une commande (appelée depuis le HTML)
  window.executeCommand = async (commandId, command) => {
    console.log('Exécution de la commande:', command);
    
    const outputDiv = document.getElementById(`output_${commandId}`);
    const outputContent = outputDiv?.querySelector('.output-content');
    const executeBtn = document.querySelector(`[onclick*="${commandId}"]`);
    
    if (!outputDiv || !outputContent) {
      console.error('Éléments de sortie non trouvés pour:', commandId);
      return;
    }
    
    // Afficher la zone de sortie et désactiver le bouton
    outputDiv.style.display = 'block';
    if (executeBtn) {
      executeBtn.disabled = true;
      executeBtn.textContent = '⏳ Exécution...';
    }
    
    // Vider la sortie précédente
    outputContent.textContent = '';
    
    // Écouter les sorties en temps réel
    const outputHandler = (event, data) => {
      if (data.type === 'stdout') {
        outputContent.textContent += data.data;
      } else if (data.type === 'stderr') {
        outputContent.textContent += `[ERREUR] ${data.data}`;
      }
      // Auto-scroll vers le bas
      outputContent.scrollTop = outputContent.scrollHeight;
    };
    
    window.electronAPI.onCommandOutput(outputHandler);
    
    try {
      // Exécuter la commande
      const result = await window.electronAPI.executeCommand(command);
      
      // Arrêter d'écouter les sorties
      window.electronAPI.removeCommandOutputListener(outputHandler);
      
      // Afficher le résultat final
      if (!result.success) {
        outputContent.textContent += `\n[TERMINÉ] Code de sortie: ${result.code}`;
        if (result.error) {
          outputContent.textContent += `\nErreur: ${result.error}`;
        }
      } else {
        outputContent.textContent += `\n[TERMINÉ] Commande exécutée avec succès`;
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'exécution:', error);
      outputContent.textContent += `\n[ERREUR] ${error.message}`;
    } finally {
      // Réactiver le bouton
      if (executeBtn) {
        executeBtn.disabled = false;
        executeBtn.textContent = '▶ Exécuter';
      }
    }
  };
}

// Fonction pour charger le CSS personnalisé (mode Electron et navigateur)
function loadCustomCSS(cssContent) {
  // Créer ou mettre à jour l'élément style pour le CSS de la présentation
  let styleEl = document.getElementById('presentation-style')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'presentation-style'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = cssContent
  
  console.log('CSS de présentation chargé')
}

// Fonction pour charger le CSS de la présentation (mode navigateur uniquement)
async function loadPresentationCSS() {
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
</script>

<style scoped>
/* Conteneur complètement neutre */
.slides-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
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

/* Conteneur de slide complètement neutre */
.slide {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
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
