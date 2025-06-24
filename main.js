import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseMarkdown } from './parser/markdown-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  mainWindow.loadFile('renderer/index.html');
}

//app.whenReady().then(createWindow);

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
