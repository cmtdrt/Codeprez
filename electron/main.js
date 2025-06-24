const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { parseMarkdown } = require('../parser/markdown-parser.js');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('load-slides', async () => {
    return await parseMarkdown(
      './example-pres/presentation.md',
      './example-pres/config.json',
      './example-pres/assets'
    );
  });
});
