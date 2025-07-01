<template>
  <div v-if="visible" class="keyboard-help">
    <h3>🎹 Raccourcis clavier</h3>
    <ul>
      <li><kbd>→</kbd> ou <kbd>Espace</kbd> : Slide suivante</li>
      <li><kbd>←</kbd> : Slide précédente</li>
      <li><kbd>F</kbd> : Plein écran</li>
      <li><kbd>Échap</kbd> : Quitter la présentation</li>
      <li><kbd>H</kbd> : Afficher/masquer cette aide</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false }
})
</script>

<style scoped>
.keyboard-help {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  z-index: 2000;
  max-width: 400px;
}

.keyboard-help h3 {
  margin: 0 0 20px 0;
  text-align: center;
  color: #4CAF50;
}

.keyboard-help ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.keyboard-help li {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

kbd {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}
</style>
