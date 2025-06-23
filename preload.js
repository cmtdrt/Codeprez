const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('slidesAPI', {
  loadSlides: () => ipcRenderer.invoke('load-slides')
});
