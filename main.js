import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseMarkdown } from './parser/markdown-parser.js';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Variable pour stocker le chemin du dossier temporaire de la présentation
let presentationTempPath = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'electron', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  // Charger le frontend Vue.js en développement
  mainWindow.loadURL('http://localhost:5173');
  
  // Ouvrir les DevTools en développement
  mainWindow.webContents.openDevTools();
}

// Fonction pour nettoyer le dossier temporaire
function cleanupTempPresentation() {
  if (presentationTempPath && fs.existsSync(presentationTempPath)) {
    try {
      fs.rmSync(presentationTempPath, { recursive: true, force: true });
      console.log('>> Dossier temporaire nettoyé:', presentationTempPath);
      presentationTempPath = null;
    } catch (error) {
      console.error('>> Erreur lors du nettoyage:', error);
    }
  }
}

const launch = async () => {
  await app.whenReady();
  createWindow();
}
launch();

ipcMain.handle('load-slides', async () => {
  return await parseMarkdown(
    './example-pres/presentation.md',
    './example-pres/config.json',
    './example-pres/assets'
  );
});

// Nouveau handler pour traiter les fichiers zip
ipcMain.handle('process-zip-file', async (event, zipBuffer) => {
  try {
    // Nettoyer l'ancien dossier temporaire s'il existe
    cleanupTempPresentation();
    
    // Créer un nouveau dossier temporaire pour cette présentation
    const tempDir = path.join(os.tmpdir(), `codeprez-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    presentationTempPath = tempDir;
    
    console.log('>> Extraction du zip vers:', tempDir);
    
    // Extraire le contenu du zip
    const zip = new AdmZip(Buffer.from(zipBuffer));
    zip.extractAllTo(tempDir, true);
    
    // Vérifier que les fichiers requis existent
    const presentationPath = path.join(tempDir, 'presentation.md');
    const configPath = path.join(tempDir, 'config.json');
    const assetsPath = path.join(tempDir, 'assets');
    
    if (!fs.existsSync(presentationPath)) {
      throw new Error('Fichier presentation.md manquant');
    }
    if (!fs.existsSync(configPath)) {
      throw new Error('Fichier config.json manquant');
    }
    
    // Parser la présentation depuis le dossier temporaire
    const slides = await parseMarkdown(
      presentationPath,
      configPath,
      fs.existsSync(assetsPath) ? assetsPath : null
    );
    
    return {
      success: true,
      slides: slides,
      tempPath: tempDir
    };
    
  } catch (error) {
    console.error('>> Erreur lors du traitement du zip:', error);
    cleanupTempPresentation();
    return {
      success: false,
      error: error.message
    };
  }
});

// Handler pour nettoyer manuellement le dossier temporaire
ipcMain.handle('cleanup-temp-presentation', async () => {
  cleanupTempPresentation();
  return { success: true };
});

// Gestion fermeture et relance (macOS friendly)
app.on('window-all-closed', () => {
  cleanupTempPresentation();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Nettoyage à la fermeture de l'application
app.on('before-quit', () => {
  cleanupTempPresentation();
});
