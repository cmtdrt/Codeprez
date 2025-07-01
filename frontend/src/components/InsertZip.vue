<template>
  <div class="insertzip-container">
    <button class="back-btn" @click="goBack" title="Retour">
      <span class="back-arrow">&#8592;</span>
    </button>
    <div class="zip-card">
      <h2 class="zip-title">Importer un dossier .codeprez</h2>
      <div class="zip-actions">
        <input
          ref="fileInput"
          type="file"
          accept=".codeprez"
          class="zip-input-hidden"
          @change="onFolderSelect"
        />
        <button class="select-btn" @click="openFileDialog">
          <span class="select-icon">📁</span>
          <span>Choisir un dossier .codeprez</span>
        </button>
        <transition name="fade">
          <div v-if="fileName" class="file-badge-center">
            <div class="file-badge">
              <span class="file-icon">🗂️</span>
              <span class="file-name">{{ fileName }}</span>
              <span class="remove-file" @click="clearSelection" title="Retirer le fichier">&#10060;</span>
            </div>
          </div>
        </transition>
        <button class="validate-btn" :disabled="!folderSelected" @click="validate">
          Valider
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const folderSelected = ref(false)
const fileName = ref('')
const fileInput = ref(null)
const router = useRouter()

function openFileDialog() {
  fileInput.value && fileInput.value.click()
}

function onFolderSelect(event) {
  const files = event.target.files
  if (files && files.length > 0) {
    fileName.value = files[0].name
    folderSelected.value = true
  } else {
    fileName.value = ''
    folderSelected.value = false
  }
}

function clearSelection() {
  fileName.value = ''
  folderSelected.value = false
  if (fileInput.value) fileInput.value.value = ''
}

async function validate() {
  if (!fileInput.value || !fileInput.value.files[0]) {
    alert('Veuillez sélectionner un fichier .codeprez');
    return;
  }

  if (!window.electronAPI) {
    alert('Erreur: API Electron non disponible. Vérifiez que l\'application est lancée dans Electron.');
    return;
  }

  const file = fileInput.value.files[0];

  try {
    // Lire le fichier comme ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log('📁 Fichier lu, taille:', uint8Array.length);

    // Envoyer au processus principal Electron
    const result = await window.electronAPI.processZipFile(Array.from(uint8Array));

    if (result.success) {
      console.log('Présentation chargée avec succès:', result.slides);
      router.push('/slides');
    } else {
      alert(`Erreur lors du chargement: ${result.error}`);
    }
  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error);
    alert('Erreur lors du traitement du fichier');
  }
}

/**
 * Retourne à la page d'accueil
 */
function goBack() {
  router.push('/')
}
</script>

<style scoped>
.insertzip-container {
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
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
.zip-card {
  background: rgba(30, 40, 60, 0.85);
  border-radius: 2rem;
  box-shadow: 0 8px 40px 0 rgba(0,0,0,0.35);
  padding: 3.5rem 2.5rem 2.5rem 2.5rem;
  min-width: 370px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: floatIn 0.7s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes floatIn {
  0% { opacity: 0; transform: translateY(40px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.zip-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.2rem;
  letter-spacing: 0.01em;
  text-align: center;
  text-shadow: 0 2px 12px #0008;
}
.zip-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.2rem;
  width: 100%;
}
.zip-input-hidden {
  display: none;
}
.select-btn {
  width: 100%;
  max-width: 320px;
  height: 54px;
  font-size: 1.08rem;
  font-weight: 500;
  border: 2px solid #e0e0e0;
  border-radius: 1.2rem;
  background: transparent;
  color: #e0e0e0;
  cursor: pointer;
  transition: border 0.2s, color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  backdrop-filter: blur(2px);
  margin-bottom: 0.2rem;
  letter-spacing: 0.01em;
}
.select-btn:hover {
  border: 2px solid #fff;
  color: #fff;
  background: rgba(255,255,255,0.04);
  transform: scale(1.03);
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
}
.select-icon {
  font-size: 1.3rem;
  margin-bottom: 0.1rem;
}
.file-badge-center {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: -1.2rem;
  margin-bottom: 0.2rem;
}
.file-badge {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.10);
  border-radius: 1.5rem;
  padding: 0.4rem 1.1rem 0.4rem 0.9rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: #fff;
  font-size: 0.98rem;
  gap: 0.5rem;
  min-width: 0;
  max-width: 220px;
  word-break: break-all;
  animation: badgeIn 0.4s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes badgeIn {
  0% { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}
.file-icon {
  font-size: 1.1rem;
  margin-right: 0.1rem;
}
.file-name {
  color: #fff;
  flex: 1;
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.remove-file {
  color: #ff1744;
  font-size: 1.1rem;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  user-select: none;
  margin-left: 0.4rem;
}
.remove-file:hover {
  color: #ff5252;
  transform: scale(1.18) rotate(12deg);
}
.validate-btn {
  width: 100%;
  max-width: 320px;
  height: 60px;
  font-size: 1.18rem;
  font-weight: 700;
  border: none;
  border-radius: 1.2rem;
  background: linear-gradient(90deg, #184e36 0%, #2e8b57 100%);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 16px rgba(0,0,0,0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  backdrop-filter: blur(2px);
  margin-top: 0.7rem;
  letter-spacing: 0.01em;
}
.validate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(90deg, #bdbdbd 0%, #e0e0e0 100%);
  color: #888;
}
.validate-btn:hover:enabled {
  background: linear-gradient(90deg, #2e8b57 0%, #184e36 100%);
  transform: scale(1.04);
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
