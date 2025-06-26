<template>
  <div class="landing-container">
    <h1 class="landing-title">Sélectionnez ce que vous voulez importer :</h1>
    <div class="button-group">
      <button @click="goToDocs">
        <span class="button-text">Fichiers</span>
        <span class="icon">
          <img src="../assets/docs.png" alt="Icône documents" />
        </span>
      </button>
      <button @click="goToZip">
        <span class="button-text">Dossier</span>
        <span class="icon">
          <img src="../assets/zip.png" alt="Icône dossier compressé" />
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goToDocs = () => router.push('/insert-docs')
const goToZip = () => router.push('/insert-zip')
</script>

<style scoped>
:global(html, body, #app) {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.landing-container {
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.landing-title {
  color: #fff;
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif
}
.button-group {
  display: flex;
  gap: 3rem;
}
button {
  width: 180px;
  height: 170px;
  padding: 0;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  border-radius: 1rem;
  background: rgba(224,224,224,0.4); /* gris clair avec transparence */
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  backdrop-filter: blur(2px);
}
button:hover {
  background: rgba(200,200,200,0.6);
  transform: scale(1.05);
}
.button-text {
  margin-top: 1.2rem;
  margin-bottom: 0.7rem;
  text-align: center;
  line-height: 1.2;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}
</style>

