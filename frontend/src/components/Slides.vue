<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="slides-container">
    <button class="back-btn" @click="goBack" title="Retour">
      <span class="back-arrow">&#8592;</span>
    </button>
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
import { useRouter } from 'vue-router'

const slides = ref([])
const router = useRouter()

onMounted(async () => {
  await listAndLogFiles();
  slides.value = [
    `<section class="slide">
      <h1>Slides chargées !</h1>
      <p>Vérifie la console pour le contenu de tous les fichiers et dossiers.</p>
    </section>`
  ]
});

/**
 * Lister les fichiers dans le dossier
 * @param dir - Le dossier à lister
 * @param prefix - Le préfixe à afficher
 */
async function listAndLogFiles(dir = '', prefix = '') {
  // Lister les fichiers dans le dossier
  const files = await window.electronAPI.readTempDir(dir);
  for (const file of files) {
    if (file.isDirectory) {
      console.log(`${prefix}📁 ${file.name}/`);
      await listAndLogFiles(pathJoin(dir, file.name), prefix + '  ');
    } else {
      const content = await window.electronAPI.readTempFile(pathJoin(dir, file.name));
      console.log(`${prefix}📄 ${file.name} :\n`, content);
    }
  }
}

// Permet de joindre les chemins
function pathJoin(...parts) {
  return parts.filter(Boolean).join('/');
}

function goBack() {
  router.back()
}
</script>

<style>
.slides-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #0d1117;
  min-height: 100vh;
}

.slide {
  border: 2px solid #30363d;
  border-radius: 8px;
  padding: 2rem;
  background: #161b22;
  color: #f0f6fc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.slide:hover {
  transform: translateY(-2px);
  border-color: #58a6ff;
}

.slide h1 {
  color: #58a6ff;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.slide h2 {
  color: #7c3aed;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.slide ul {
  margin-left: 1.5rem;
}

.slide li {
  margin-bottom: 0.5rem;
}

.slide pre {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.slide code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.back-btn {
  position: absolute;
  top: 2.2rem;
  left: 2.2rem;
  background: rgba(30,40,60,0.7);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
  transition: background 0.18s, transform 0.18s;
  z-index: 10;
}
.back-btn:hover {
  background: rgba(30,40,60,0.95);
  transform: scale(1.08);
}
.back-arrow {
  margin-bottom: 0.3rem;
  font-size: 2rem;
  line-height: 1;
}
</style>
