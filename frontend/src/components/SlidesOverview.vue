<template>
  <div class="overview-mode">
    <div class="controls-bar">
      <div class="title-section">
        <h1>CodePrez - Vue d'ensemble</h1>
        <div class="mode-indicator">
          <span class="mode-badge" :class="{ 'electron': isElectronMode, 'web': !isElectronMode }">
            {{ isElectronMode ? '🖥️ Electron' : '🌐 Navigateur' }}
          </span>
          <span v-if="appInfo" class="version-info">
            v{{ appInfo.version }} - {{ appInfo.platform }}
          </span>
        </div>
      </div>
      <div class="control-buttons">
        <button @click="$emit('start-presentation')" class="start-btn">
          🎯 Commencer la présentation
        </button>
        <button @click="$emit('toggle-fullscreen')" class="fullscreen-btn">
          {{ isFullscreen ? '📱 Fenêtré' : '🖥️ Plein écran' }}
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des slides...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h2>❌ Erreur de chargement</h2>
      <p>{{ error }}</p>
      <button @click="$emit('reload-slides')" class="retry-btn">🔄 Réessayer</button>
    </div>

    <div v-else class="slides-overview">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="slide-thumbnail"
        @click="$emit('start-presentation-at', index)"
      >
        <div class="slide-number">{{ index + 1 }}</div>
        <div class="slide-preview" v-html="slide"></div>
        <div class="slide-overlay">
          <span>▶️ Commencer ici</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start-presentation', 'start-presentation-at', 'toggle-fullscreen', 'reload-slides'])

defineProps({
  slides: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  isElectronMode: { type: Boolean, default: false },
  isFullscreen: { type: Boolean, default: false },
  appInfo: { type: Object, default: null }
})
</script>

<style scoped>
.overview-mode {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  overflow-y: auto;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.controls-bar h1 {
  color: white;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.mode-indicator {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mode-badge {
  background: rgba(255,255,255,0.1);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(255,255,255,0.2);
}

.mode-badge.electron {
  background: rgba(100,200,100,0.2);
  border-color: rgba(100,200,100,0.4);
}

.mode-badge.web {
  background: rgba(100,150,255,0.2);  
  border-color: rgba(100,150,255,0.4);
}

.version-info {
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
}

.control-buttons {
  display: flex;
  gap: 15px;
}

.start-btn, .fullscreen-btn, .retry-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.fullscreen-btn {
  background: linear-gradient(45deg, #2196F3, #1976D2);
}

.retry-btn {
  background: linear-gradient(45deg, #FF9800, #F57C00);
}

.start-btn:hover, .fullscreen-btn:hover, .retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255,255,255,0.3);
  border-top: 5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  color: white;
  background: rgba(255,0,0,0.1);
  border: 1px solid rgba(255,0,0,0.3);
  border-radius: 12px;
  margin: 40px;
}

.slides-overview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 30px;
}

.slide-thumbnail {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  aspect-ratio: 16/9;
}

.slide-thumbnail:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

.slide-number {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 10;
}

.slide-preview {
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: scale(0.2);
  transform-origin: top left;
  pointer-events: none;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.slide-thumbnail:hover .slide-overlay {
  opacity: 1;
}

@media (max-width: 768px) {
  .controls-bar {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .slides-overview {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}
</style>
