const { contextBridge, ipcRenderer } = require('electron');

console.log('✅ preload loaded')

contextBridge.exposeInMainWorld('electronAPI', {
  loadSlides: () => ipcRenderer.invoke('load-slides'),
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  onCommandOutput: (callback) => ipcRenderer.on('command-output', callback),
  removeCommandOutputListener: (callback) => ipcRenderer.removeListener('command-output', callback)
});