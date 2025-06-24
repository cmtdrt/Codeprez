// electron-test.js - Script de test simple
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🟢 Test Electron - Démarrage');

function createWindow() {
    console.log('🪟 Création de la fenêtre de test');

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: true, // Montrer immédiatement pour le test
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Charger une page HTML simple ou une URL
    win.loadURL('https://www.google.com').catch(err => {
        console.error('❌ Erreur chargement:', err);
        // Essayer de charger une page locale simple
        win.loadURL('data:text/html,<h1>Test Electron</h1><p>Electron fonctionne !</p>');
    });

    win.webContents.openDevTools();

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
    console.log('🔴 Toutes fenêtres fermées');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log('📋 Script chargé, en attente de l\'app...');
