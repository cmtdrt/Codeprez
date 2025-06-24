<template>
  <div class="slides-container">
    <section
      v-for="(slide, index) in slides"
      :key="index"
      class="slide"
      v-html="slide"
    ></section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const slides = ref([])

onMounted(async () => {
  try {
    slides.value = await window.electronAPI.loadSlides()
  } catch (err) {
    slides.value = [`<section><pre>${err.message}</pre></section>`]
  }
})
</script>

<style>
.slides-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}
.slide {
  border: 1px solid #444;
  padding: 1rem;
  background: #1e1e1e;
  color: #fff;
}
</style>
