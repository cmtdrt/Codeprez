import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseMarkdown } from './parser/markdown-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  win.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('load-slides', async () => {
  return await parseMarkdown(
    './example-pres/presentation.md',
    './example-pres/config.json',
    './example-pres/assets'
  );
});
