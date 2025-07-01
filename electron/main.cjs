const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const AdmZip = require('adm-zip');
const { parseMarkdown } = require('../parser/markdown-parser.cjs');

console.log('>> Electron app démarre');

// Variables globales
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development';
const viteServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
let tempPresentationPath = path.join(os.tmpdir(), 'codeprez-presentation');

// Enregistrer le protocole personnalisé pour les assets
app.whenReady().then(() => {
  // Protocole pour servir les assets de présentation
  protocol.registerFileProtocol('codeprez-asset', (request, callback) => {
    const url = request.url.substr(17); // Retire 'codeprez-asset://'
    const assetPath = path.join(__dirname, '../example-pres/assets', url);

    console.log('>> Asset demandé via protocole:', url, '→', assetPath);

    if (fs.existsSync(assetPath)) {
      callback({ path: assetPath });
    } else {
      callback({ error: -2 }); // FILE_NOT_FOUND
    }
  });
});

function createWindow() {
  console.log('>> Création de la fenêtre Electron');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true // Sécurité activée
    },
    show: false // Ne pas afficher tant que ce n'est pas prêt
  });

  // Charger l'URL appropriée selon le mode
  if (isDev) {
    console.log('>> Mode développement - Chargement de Vite:', viteServerUrl);
    mainWindow.loadURL(viteServerUrl);
    // mainWindow.webContents.openDevTools(); // Décommenter pour debug
  } else {
    console.log('>> Mode production - Chargement du build');
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    console.log('>> Fenêtre prête à être affichée');
    mainWindow.show();

    // Envoyer un message à Vue pour confirmer la connexion
    setTimeout(() => {
      mainWindow.webContents.send('electron-ready', {
        isDev,
        platform: process.platform,
        version: app.getVersion()
      });
    }, 1000);
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

app.whenReady().then(() => {
  console.log('>> app ready');
  createWindow();

  // Gestionnaire pour charger les slides
  ipcMain.handle('load-slides', async () => {
    console.log('>> ipcMain: load-slides appelé');
    try {
      const result = await parseMarkdown(
        './example-pres/presentation.md',
        './example-pres/config.json',
        './example-pres/assets'
      );
      console.log('>> Slides chargées avec succès:', result.slides?.length || 0, 'slides');
      return result;
    } catch (error) {
      console.error('>> Erreur lors du chargement des slides:', error);
      throw error;
    }
  });

  // Gestionnaire pour obtenir des informations sur l'app
  ipcMain.handle('get-app-info', () => {
    return {
      platform: process.platform,
      version: app.getVersion(),
      isDev,
      userDataPath: app.getPath('userData')
    };
  });

  // Gestionnaire pour contrôler la fenêtre
  ipcMain.handle('window-control', (event, action) => {
    if (!mainWindow) return false;

    switch (action) {
      case 'minimize':
        mainWindow.minimize();
        return true;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        return true;
      case 'close':
        mainWindow.close();
        return true;
      case 'toggle-fullscreen':
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
        return true;
      default:
        return false;
    }
  });

  // Gestion de l'exécution de commandes
  ipcMain.handle('execute-command', async (event, command) => {
    console.log('>> ipcMain: execute-command appelé:', command);

    return new Promise((resolve) => {
      // Dossier d'exécution (env dans le dossier de présentation)
      const envPath = path.resolve('./example-pres/env');
      console.log('>> Exécution dans:', envPath);

      // Déterminer le shell selon l'OS
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'powershell.exe' : '/bin/bash';
      const shellArgs = isWindows ? ['-Command', command] : ['-c', command];

      const child = spawn(shell, shellArgs, {
        cwd: envPath,
        stdio: 'pipe',
        shell: false
      });

      let stdout = '';
      let stderr = '';
      let isComplete = false;

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('>> stdout:', output);

        // Envoyer la sortie en temps réel
        if (!isComplete) {
          event.sender.send('command-output', {
            type: 'stdout',
            data: output
          });
        }
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.log('>> stderr:', output);

        // Envoyer les erreurs en temps réel
        if (!isComplete) {
          event.sender.send('command-output', {
            type: 'stderr',
            data: output
          });
        }
      });

      child.on('close', (code) => {
        console.log('>> Commande terminée avec le code:', code);
        isComplete = true;

        resolve({
          success: code === 0,
          code,
          stdout,
          stderr,
          command
        });
      });

      child.on('error', (error) => {
        console.error('>> Erreur lors de l\'exécution:', error);
        isComplete = true;

        resolve({
          success: false,
          code: -1,
          stdout,
          stderr: stderr + '\nErreur: ' + error.message,
          command,
          error: error.message
        });
      });
    });
  });

  // Gestionnaires IPC pour les fichiers ZIP
  ipcMain.handle('process-zip-file', async (event, zipBuffer) => {
    try {
      // Créer le dossier temporaire
      if (fs.existsSync(tempPresentationPath)) {
        fs.rmSync(tempPresentationPath, { recursive: true, force: true });
      }
      fs.mkdirSync(tempPresentationPath, { recursive: true });

      // Dézipper avec AdmZip
      const zip = new AdmZip(Buffer.from(zipBuffer));
      zip.extractAllTo(tempPresentationPath, true);

      console.log('📦 Fichier ZIP dézippé dans:', tempPresentationPath);

      return {
        success: true,
        tempPath: tempPresentationPath,
        message: 'Fichier ZIP traité avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du traitement du ZIP:', error);
      // Nettoyer en cas d'erreur
      if (fs.existsSync(tempPresentationPath)) {
        fs.rmSync(tempPresentationPath, { recursive: true, force: true });
      }
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('cleanup-temp-presentation', async () => {
    try {
      if (fs.existsSync(tempPresentationPath)) {
        fs.rmSync(tempPresentationPath, { recursive: true, force: true });
        console.log('🧹 Dossier temporaire nettoyé');
      }
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('read-temp-file', async (event, fileName) => {
    try {
      const filePath = path.join(tempPresentationPath, fileName);
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (err) {
      console.error('Erreur lecture fichier temporaire:', err);
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
      console.error('Erreur lecture dossier temporaire:', err);
      return [];
    }
  });

  // Nettoyage à la fermeture de l'application
  app.on('before-quit', () => {
    if (fs.existsSync(tempPresentationPath)) {
      fs.rmSync(tempPresentationPath, { recursive: true, force: true });
      console.log('🧹 Nettoyage final du dossier temporaire');
    }
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
