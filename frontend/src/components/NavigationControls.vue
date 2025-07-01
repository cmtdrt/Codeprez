<template>
  <div class="navigation-controls" :class="{ 'visible': visible }">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: progressPercent + '%' }"
      ></div>
    </div>
    
    <div class="control-panel">
      <button @click="$emit('prev-slide')" :disabled="currentSlideIndex === 0" class="nav-btn">
        ⬅️ Précédent
      </button>
      
      <div class="slide-counter">
        {{ currentSlideIndex + 1 }} / {{ totalSlides }}
      </div>
      
      <button @click="$emit('next-slide')" :disabled="currentSlideIndex === totalSlides - 1" class="nav-btn">
        Suivant ➡️
      </button>
      
      <button @click="$emit('exit-presentation')" class="exit-btn">
        ❌ Quitter
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['prev-slide', 'next-slide', 'exit-presentation'])

const props = defineProps({
  visible: { type: Boolean, default: true },
  currentSlideIndex: { type: Number, default: 0 },
  totalSlides: { type: Number, default: 0 }
})

const progressPercent = computed(() => {
  if (props.totalSlides === 0) return 0
  return ((props.currentSlideIndex + 1) / props.totalSlides) * 100
})
</script>

<style scoped>
.navigation-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  padding: 15px 30px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.navigation-controls.visible {
  transform: translateY(0);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  margin-bottom: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.nav-btn, .exit-btn {
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-btn:hover:not(:disabled), .exit-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.4);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.exit-btn {
  background: rgba(255,0,0,0.2);
  border-color: rgba(255,0,0,0.4);
}

.exit-btn:hover {
  background: rgba(255,0,0,0.3);
}

.slide-counter {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    gap: 10px;
  }
  
  .navigation-controls {
    padding: 10px 15px;
  }
}
</style>
