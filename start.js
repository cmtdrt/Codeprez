import { spawn } from 'child_process';

// Sur Windows, on doit utiliser npm.cmd au lieu de npm
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Lancer Vite (frontend)
const vite = spawn(npmCmd, ['run', 'dev'], {
  cwd: './frontend',
  shell: true,
  stdio: 'inherit',
});

vite.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Vite process exited with code ${code}`);
    process.exit(code);
  }
});

// ⏱️ Attente de 3 sec pour laisser Vite démarrer (ou utiliser "wait-on" si besoin)
setTimeout(() => {
  console.log('� Lancement d\'Electron...');
  // Utiliser le chemin direct vers Electron sur Windows
  const electronCmd = process.platform === 'win32' ? '.\\node_modules\\.bin\\electron.cmd' : 'npx';
  const electronArgs = process.platform === 'win32' ? ['electron/main.cjs'] : ['electron', 'electron/main.cjs'];

  const electron = spawn(electronCmd, electronArgs, {
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: 'http://localhost:5173'
    }
  });

  electron.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Electron process exited with code ${code}`);
      process.exit(code);
    }
  });
}, 3000);
