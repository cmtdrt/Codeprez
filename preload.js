const { contextBridge, ipcRenderer } = require('electron');

console.log('✅ preload loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  loadSlides: () => ipcRenderer.invoke('load-slides')
});
