import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('>> Electron app démarre');

// Désactiver les avertissements de sécurité
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Chemin du dossier temporaire unique 'presentation'
let tempPresentationPath = path.join(os.tmpdir(), 'presentation');

function createWindow() {
  console.log('>> Création de la fenêtre Electron');
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      enableRemoteModule: false,
      sandbox: false,
      experimentalFeatures: true
    }
  });
  win.loadURL('http://localhost:5173');
}

// Handler pour dézipper dans un dossier 'presentation'
ipcMain.handle('process-zip-file', async (event, zipBuffer) => {
  try {
    // Créer le dossier temporaire
    fs.mkdirSync(tempPresentationPath, { recursive: true });

    // Dézipper dans le dossier temporaire
    const zip = new AdmZip(Buffer.from(zipBuffer));
    zip.extractAllTo(tempPresentationPath, true);

    // Retourner le chemin du dossier temporaire
    return { success: true, tempPath: tempPresentationPath };
  } catch (error) {
    if (fs.existsSync(tempPresentationPath)) {
      fs.rmSync(tempPresentationPath, { recursive: true, force: true });
    }
    return { success: false, error: error.message };
  }
});

// Nettoyage à la fermeture de l'application
app.on('before-quit', () => {
  if (fs.existsSync(tempPresentationPath)) {
    fs.rmSync(tempPresentationPath, { recursive: true, force: true });
  }
});

app.whenReady().then(() => {
  console.log('>> app ready');
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('read-temp-file', async (event, fileName) => {
  try {
    const filePath = path.join(tempPresentationPath, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (err) {
    return `Erreur lecture fichier : ${err.message}`;
  }
});

ipcMain.handle('read-temp-dir', async (event, subDir = '') => {
  try {
    const dirPath = path.join(tempPresentationPath, subDir);
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory()
    }));
  } catch (err) {
    return [];
  }
});

ipcMain.handle('load-slides', async () => {
  console.log('>> ipcMain: load-slides appelé');
  return await parseMarkdown(
    './example-pres/presentation.md',
    './example-pres/config.json',
    './example-pres/assets'
  );
});