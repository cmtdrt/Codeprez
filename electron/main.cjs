const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { parseMarkdown } = require('../parser/markdown-parser.js');

console.log('>> Electron app démarre');

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
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
      // Sécurité web réactivée - on utilise notre protocole personnalisé
    }
  });

  win.loadURL('http://localhost:5173');
  // win.webContents.openDevTools(); // DevTools désactivées - F12 pour les ouvrir manuellement
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
