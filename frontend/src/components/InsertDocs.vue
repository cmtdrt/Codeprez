<template>
  <div class="insertdocs-container">
    <button class="back-btn" @click="goBack" title="Retour">
      <span class="back-arrow">&#8592;</span>
    </button>
    <div class="docs-card">
      <h2 class="docs-title">Importer les fichiers de la présentation</h2>
      <div class="docs-actions">
        <div class="docs-help">Sélectionnez le dossier <strong style="color: #38ef7d;">parent</strong> contenant tous vos fichiers de présentation.</div>
        <button class="select-btn" @click="openFileDialog">
          <span class="select-icon">📁</span>
          <span>Sélectionner le dossier de présentation</span>
        </button>
        <div v-if="parentFolderName" class="file-badge-center">
          <div class="file-badge">
            <span class="file-icon">📁</span>
            <span class="file-name">{{ parentFolderName }}</span>
            <span class="remove-file" @click="clearSelection" title="Retirer le dossier">&#10060;</span>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="docs-input-hidden"
          @change="onFilesSelect"
          webkitdirectory
        />
        <div class="required-list">
          <div class="required-title">Fichiers obligatoires :</div>
          <div class="required-items">
            <span :class="['required-item', files.presentation ? 'true' : '']">presentation.md</span>
            <span :class="['required-item', files.style ? 'true' : '']">style.css</span>
            <span :class="['required-item', files.config ? 'true' : '']">config.json</span>
          </div>
        </div>
        <div class="optional-list">
          <div class="optional-title">Dossiers optionnels :</div>
          <div class="optional-items">
            <span :class="['optional-item', files.assets ? 'true' : '']">assets/</span>
            <span :class="['optional-item', files.env ? 'true' : '']">env/</span>
          </div>
        </div>
        <button class="validate-btn" :disabled="!canValidate" @click="validate">
          Valider
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import JSZip from 'jszip'

const fileInput = ref(null)
const router = useRouter()

// Debug: vérifier l'API Electron au montage du composant
onMounted(() => {
  console.log('🔄 InsertDocs.vue monté');
  console.log('🔍 window.electronAPI au montage:', !!window.electronAPI);
  console.log('🔍 window.electronAPI détails:', window.electronAPI);
});

const files = ref({
  presentation: false,
  style: false,
  config: false,
  assets: false,
  env: false
})
const parentFolderName = ref('')
const selectedFiles = ref([])

function openFileDialog() {
  fileInput.value && fileInput.value.click()
}

function onFilesSelect(event) {
  const fileList = Array.from(event.target.files)
  selectedFiles.value = fileList
  // On cherche le nom du dossier parent
  if (fileList.length > 0 && fileList[0].webkitRelativePath) {
    const path = fileList[0].webkitRelativePath
    parentFolderName.value = path.split('/')[0]
  } else {
    parentFolderName.value = ''
  }
  // On cherche les fichiers à la racine du dossier sélectionné
  files.value.presentation = fileList.some(f => f.webkitRelativePath.endsWith('/presentation.md'))
  files.value.style = fileList.some(f => f.webkitRelativePath.endsWith('/style.css'))
  files.value.config = fileList.some(f => f.webkitRelativePath.endsWith('/config.json'))
  // Correction : on cherche la présence d'au moins un fichier dans les dossiers optionnels, peu importe le nom du dossier parent
  files.value.assets = fileList.some(f => /\/assets\//.test(f.webkitRelativePath))
  files.value.env = fileList.some(f => /\/env\//.test(f.webkitRelativePath))
}

/**
 * Retire le dossier sélectionné
 */
function clearSelection() {
  parentFolderName.value = ''
  files.value.presentation = false
  files.value.style = false
  files.value.config = false
  files.value.assets = false
  files.value.env = false
  selectedFiles.value = []
  if (fileInput.value) fileInput.value.value = ''
}

const canValidate = computed(() =>
  files.value.presentation && files.value.style && files.value.config
)

async function validate() {
  try {
    const zip = new JSZip()
    // Ajoute chaque fichier sélectionné dans le zip, en respectant le chemin relatif
    for (const file of selectedFiles.value) {
      zip.file(file.webkitRelativePath, await file.arrayBuffer())
    }

    console.log('📦 Zip créé avec', selectedFiles.value.length, 'fichiers');

    // Génère le zip comme ArrayBuffer
    const zipArrayBuffer = await zip.generateAsync({ type: 'arraybuffer' })
    const uint8Array = new Uint8Array(zipArrayBuffer)


    // Demander à Electron d'ouvrir la boîte de dialogue d'enregistrement
    const saveResult = await window.electronAPI.saveFile(
      Array.from(new Uint8Array(zipArrayBuffer)),
      parentFolderName.value ? `${parentFolderName.value}.codeprez` : 'presentation.codeprez'
    );

    if (saveResult.canceled) {
      // L'utilisateur a annulé, on ne continue pas
      return;
    }

    // Ensuite, tu peux envoyer le zip à Electron et router vers /slides
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
  router.back()
}
</script>

<style scoped>
.insertdocs-container {
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
.docs-card {
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
.docs-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.2rem;
  letter-spacing: 0.01em;
  text-align: center;
  text-shadow: 0 2px 12px #0008;
}
.docs-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.2rem;
  width: 100%;
}
.docs-input-hidden {
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
.required-list, .optional-list {
  width: 100%;
  margin-top: 0.2rem;
}
.required-title, .optional-title {
  color: #fff;
  font-size: 1.08rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.required-items, .optional-items {
  display: flex;
  gap: 1.1rem;
  flex-wrap: wrap;
}
.required-item, .optional-item {
  padding: 0.35rem 1.1rem;
  border-radius: 1.2rem;
  font-size: 1.01rem;
  font-weight: 500;
  background: rgba(255,255,255,0.10);
  color: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  border: 2px solid transparent;
  transition: border 0.2s, background 0.2s, color 0.2s;
}
.required-item.true {
  border: 2px solid #38ef7d;
  background: rgba(56,239,125,0.13);
  color: #38ef7d;
}
.optional-item.true {
  border: 2px solid #3a7bd5;
  background: rgba(58,123,213,0.13);
  color: #3a7bd5;
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
.docs-help {
  color: #e0e0e0;
  font-size: 1.01rem;
  margin-bottom: 0.7rem;
  text-align: center;
  opacity: 0.85;
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
</style>
