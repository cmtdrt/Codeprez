// scripts/start.js
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMarkdown } from '../parser/markdown-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownPath = path.join(__dirname, '../slides.md');

console.log('📄 Lecture de slides.md...');

try {
  const raw = fs.readFileSync(markdownPath, 'utf-8');
  const slides = parseMarkdown(raw);
  console.log(`✅ ${slides.length} slides détectées`);
} catch (err) {
  console.error('❌ Erreur lors du parsing de slides.md :', err.message);
  process.exit(1);
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('🚀 Démarrage du serveur Vite...');

const vite = spawn(npmCmd, ['run', 'dev'], {
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let buffer = '';
let electronStarted = false;

vite.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);
  buffer += str;

  const match = buffer.match(/http:\/\/localhost:\d+/);
  if (match && !electronStarted) {
    const viteUrl = match[0];
    console.log(`✅ Vite est prêt sur ${viteUrl}, lancement d'Electron...`);
    electronStarted = true;

    const electron = spawn(npmCmd, ['run', 'electron:start'], {
      shell: true,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_DEV_SERVER_URL: viteUrl,
      },
    });

    electron.on('close', (code) => {
      console.log(`🔴 Electron fermé avec le code ${code}`);
      process.exit(code);
    });
  }
});

vite.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

vite.on('close', (code) => {
  if (!electronStarted) {
    console.error('❌ Vite s\'est fermé avant le démarrage d\'Electron');
    process.exit(code);
  }
});
