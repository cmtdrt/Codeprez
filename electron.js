// electron.js
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🟢 Electron démarre');

function createWindow() {
    console.log('🪟 Création de la fenêtre');

    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.once('ready-to-show', () => {
        win.show();
        win.focus();
    });

    const viteUrl = process.env.VITE_DEV_SERVER_URL;
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 VITE_DEV_SERVER_URL:', viteUrl);

    if (process.env.NODE_ENV === 'development' && viteUrl) {
        console.log('🌍 Chargement depuis Vite :', viteUrl);
        win.loadURL(viteUrl).catch(err => {
            console.error('❌ Erreur lors du chargement de l\'URL:', err);
        });
    } else {
        console.log('📦 Chargement du build local');
        win.loadFile(path.join(__dirname, 'dist/index.html')).catch(err => {
            console.error('❌ Erreur lors du chargement du fichier:', err);
        });
    }

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('❌ Échec du chargement:', errorCode, errorDescription);
    });

    win.on('closed', () => {
        console.log('🔴 Fenêtre fermée');
    });
}

app.whenReady().then(() => {
    console.log('📱 App prête, création de la fenêtre');
    createWindow();
}).catch(err => {
    console.error('❌ Erreur app:', err);
});

app.on('window-all-closed', () => {
    console.log('🔴 Toutes les fenêtres fermées');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('❌ Exception non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
});
