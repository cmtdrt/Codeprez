const { contextBridge, ipcRenderer } = require('electron');

console.log('✅ preload loaded');

// API exposée à la fenêtre Vue
contextBridge.exposeInMainWorld('electronAPI', {
  // Chargement des slides
  loadSlides: () => ipcRenderer.invoke('load-slides'),

  // Traitement des fichiers ZIP
  processZipFile: (zipBuffer) => ipcRenderer.invoke('process-zip-file', zipBuffer),
  cleanupTempPresentation: () => ipcRenderer.invoke('cleanup-temp-presentation'),
  readTempFile: (fileName) => ipcRenderer.invoke('read-temp-file', fileName),
  readTempDir: (subDir) => ipcRenderer.invoke('read-temp-dir', subDir),

  // Exécution de commandes
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  onCommandOutput: (callback) => ipcRenderer.on('command-output', callback),
  removeCommandOutputListener: (callback) => ipcRenderer.removeListener('command-output', callback),

  // Informations sur l'application
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Contrôles de fenêtre
  windowControl: (action) => ipcRenderer.invoke('window-control', action),

  // Écoute des événements d'Electron
  onElectronReady: (callback) => ipcRenderer.on('electron-ready', callback),
  removeElectronReadyListener: (callback) => ipcRenderer.removeListener('electron-ready', callback),

  // Utilitaires
  isElectron: true,
  platform: process.platform,

  saveFile: (buffer, defaultPath) => ipcRenderer.invoke('save-file', buffer, defaultPath)
});

// Confirmation que l'API est disponible
console.log('✅ electronAPI exposée dans le contexte principal');
