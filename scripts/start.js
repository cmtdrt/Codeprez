import { spawn } from 'child_process';

const vite = spawn('npm', ['run', 'dev'], { stdio: ['ignore', 'pipe', 'pipe'] });

let electronStarted = false;

vite.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);

  // On attend que Vite affiche "ready in" pour lancer Electron
  if (!electronStarted && str.includes('ready in')) {
    electronStarted = true;
    // On passe NODE_ENV=development pour Electron
    const electron = spawn('npm', ['run', 'electron:start'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    electron.on('close', (code) => {
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