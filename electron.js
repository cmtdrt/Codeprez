import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  });

  if (process.env.NODE_ENV === 'development') {
    // En dev, charge l'URL Vite
    win.loadURL('http://localhost:5173');
  } else {
    // En prod, charge le build
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
    win.maximize();
  });
}

app.whenReady().then(createWindow);