import { spawn } from 'child_process';

// Sur Windows, on doit utiliser npm.cmd au lieu de npm
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const vite = spawn(npmCmd, ['run', 'dev'], {
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe']
});

let buffer = '';
let electronStarted = false;

vite.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);
  buffer += str;

  console.log('🔍 Buffer contient:', buffer.slice(-100)); // Debug: affiche les 100 derniers caractères

  const match = buffer.match(/http:\/\/localhost:\d+/); // capture l'URL
  if (match && !electronStarted) {
    const viteUrl = match[0];
    console.log('✅ URL détectée :', viteUrl);
    console.log('🚀 Lancement d\'Electron...');

    electronStarted = true;
    const electron = spawn(npmCmd, ['run', 'electron:start'], {
      shell: true,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_DEV_SERVER_URL: viteUrl
      }
    });

    electron.on('error', (err) => {
      console.error('❌ Erreur lors du lancement d\'Electron:', err);
    });

    electron.on('close', (code) => {
      console.log('🔴 Electron fermé avec le code:', code);
      process.exit(code);
    });
  }
});

vite.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

vite.on('close', (code) => {
  if (!electronStarted) process.exit(code);
});
