const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { parseMarkdown } = require('./parser/markdown-parser'); // <- corrigé ici

function createWindow() {
  console.log('🚀 Création de la fenêtre');
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL('http://localhost:5173'); // ⚠️ en prod : utiliser .loadFile
  win.webContents.openDevTools(); // utile en dev
}

app.whenReady().then(() => {
  console.log('✅ App prête');
  createWindow();

  ipcMain.handle('load-slides', async () => {
    console.log("📥 Requête 'load-slides' reçue");
    return await parseMarkdown(
      path.join(__dirname, 'example-pres/presentation.md'),
      path.join(__dirname, 'example-pres/config.json'),
      path.join(__dirname, 'example-pres/assets')
    );
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
