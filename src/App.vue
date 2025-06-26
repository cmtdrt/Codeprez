<script setup>
import { ref, onMounted } from 'vue'

// Réactive : contiendra les slides HTML
const slides = ref([])

onMounted(async () => {
  // Utilise la variable déjà déclarée, ne redéclare pas avec `const`
  slides.value = await window.electron.invoke('slides:get')
})
</script>

<template>
  <main class="slides">
    <div
      v-for="(slide, index) in slides"
      :key="index"
      class="slide"
      v-html="slide"
    />
  </main>
</template>

<style scoped>
.slides {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
  background-color: #1e1e1e;
  min-height: 100vh;
  color: #f0f0f0;
}

.slide {
  width: 80%;
  max-width: 800px;
  margin-bottom: 2rem;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  background-color: #2a2a2a;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.slide h1 {
  font-size: 2rem;
  color: #ffffff;
}

.slide p {
  font-size: 1.2rem;
  color: #dddddd;
}

.slide pre {
  background: #1e1e1e;
  color: #00ff90;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
</style>
