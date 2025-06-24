// start.js
const { spawn } = require('child_process');

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

// Attendre quelques secondes avant de lancer Electron (ou améliore avec wait-on)
setTimeout(() => {
  const electron = spawn('npm', ['run', 'electron'], {
    shell: true,
    stdio: 'inherit',
  });

  electron.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Electron process exited with code ${code}`);
      process.exit(code);
    }
  });
}, 3000); // ⏱️ Attente simple de 3 sec (à ajuster)
