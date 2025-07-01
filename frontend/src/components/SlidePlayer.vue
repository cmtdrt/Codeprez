<template>
  <div class="presentation-mode">
    <div class="slide-container">
      <div 
        class="current-slide" 
        v-html="currentSlideContent"
        @click="$emit('next-slide')"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['next-slide'])

defineProps({
  currentSlideContent: { type: String, default: '' }
})
</script>

<style scoped>
.presentation-mode {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #000;
  cursor: none;
  overflow: hidden;
}

.slide-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.current-slide {
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style>
/* S'assurer que les sections prennent toute la place en mode présentation */
.current-slide section {
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 40px 60px !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: flex-start !important;
  overflow: auto !important;
}
</style>
