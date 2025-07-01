const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const AdmZip = require('adm-zip');
const { parseMarkdown } = require('../parser/markdown-parser.cjs');

console.log('>> Electron app démarre');

// Désactiver les avertissements de sécurité
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow;
let tempPresentationPath = path.join(os.tmpdir(), 'codeprez-presentation');

function createWindow() {
    console.log('>> Création de la fenêtre Electron');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false,
            enableRemoteModule: false,
            sandbox: false
        },
        show: false
    });

    // Charger l'URL de Vite en mode développement
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Afficher la fenêtre une fois prête
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Gestionnaires IPC
ipcMain.handle('load-slides', async () => {
    console.log('>> ipcMain: load-slides appelé');
    try {
        return await parseMarkdown(
            './example-pres/presentation.md',
            './example-pres/config.json',
            './example-pres/assets'
        );
    } catch (error) {
        console.error('Erreur lors du chargement des slides:', error);
        return { slides: [], config: {} };
    }
});

ipcMain.handle('get-app-info', async () => {
    return {
        version: app.getVersion(),
        name: app.getName(),
        platform: process.platform
    };
});

ipcMain.handle('window-control', async (event, action) => {
    if (!mainWindow) return;

    switch (action) {
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'maximize':
            mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
            break;
        case 'close':
            mainWindow.close();
            break;
    }
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
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
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

// Événements de l'application
app.whenReady().then(() => {
    console.log('>> app ready');
    createWindow();
});

app.on('window-all-closed', () => {
    // Nettoyer le dossier temporaire
    if (fs.existsSync(tempPresentationPath)) {
        fs.rmSync(tempPresentationPath, { recursive: true, force: true });
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    // Nettoyer le dossier temporaire
    if (fs.existsSync(tempPresentationPath)) {
        fs.rmSync(tempPresentationPath, { recursive: true, force: true });
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

console.log('✅ main.js chargé');
