const { spawn } = require('child_process');

// Lancer Vite (frontend)
const vite = spawn('npm', ['run', 'dev'], {
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
  // 👉 Important : forcer le mode dev pour Electron
  const electron = spawn('npm', ['run', 'electron'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });

  electron.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Electron process exited with code ${code}`);
      process.exit(code);
    }
  });
}, 3000);
