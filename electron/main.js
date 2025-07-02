const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { parseMarkdown } = require('../parser/markdown-parser.js');

console.log('>> Electron app démarre');

function createWindow() {
  console.log('>> Création de la fenêtre Electron');
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL('http://localhost:5173');
  win.webContents.openDevTools(); // Affiche DevTools
}

app.whenReady().then(() => {
  console.log('>> app ready');
  createWindow();

  ipcMain.handle('load-slides', async () => {
    console.log('>> ipcMain: load-slides appelé');
    return await parseMarkdown(
      './example-pres/presentation.md',
      './example-pres/config.json',
      './example-pres/assets'
    );
  });
});

// Gestion fermeture et relance (macOS friendly)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
