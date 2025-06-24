const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadSlides: () => ipcRenderer.invoke('load-slides')
});