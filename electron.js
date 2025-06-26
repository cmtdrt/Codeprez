// electron.js
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseMarkdown } from './parser/markdown-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🟢 Electron démarre');

function createWindow() {
  console.log('🪟 Création de la fenêtre principale');

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // facultatif
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
    win.focus(); // utile sur Windows
  });

  const viteUrl = process.env.VITE_DEV_SERVER_URL;

  if (process.env.NODE_ENV === 'development' && viteUrl) {
    console.log('🌍 Chargement depuis Vite :', viteUrl);
    win.loadURL(viteUrl);
  } else {
    console.log('📦 Chargement du build local');
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  win.webContents.openDevTools();

  // 🔁 Quand le frontend demande les slides via IPC
  ipcMain.handle('slides:get', async () => {
    try {
      const raw = fs.readFileSync(path.join(__dirname, 'slides.md'), 'utf-8');
      const slides = parseMarkdown(raw);
      return slides;
    } catch (e) {
      console.error('❌ Erreur lors du chargement des slides :', e.message);
      return [];
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
