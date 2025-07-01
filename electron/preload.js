import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('electronAPI', {
  loadSlides: () => {
    return ipcRenderer.invoke('load-slides');
  },
  processZipFile: (zipBuffer) => {
    return ipcRenderer.invoke('process-zip-file', zipBuffer);
  },
  cleanupTempPresentation: () => {
    return ipcRenderer.invoke('cleanup-temp-presentation');
  },
  readTempFile: (fileName) => ipcRenderer.invoke('read-temp-file', fileName),
  readTempDir: (subDir) => ipcRenderer.invoke('read-temp-dir', subDir)
});

