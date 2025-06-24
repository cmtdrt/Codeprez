import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const mode = process.argv[2] === 'prod' ? 'production' : 'development';

console.log(`🚀 Lancement en mode ${mode.toUpperCase()}`);

function startElectron(env = {}) {
  console.log('🚀 Lancement d\'Electron...');

  const electronCmd = isWindows ? '.\\node_modules\\.bin\\electron.cmd' : 'electron';
  const args = ['.'];

  const electron = spawn(electronCmd, args, {
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: mode,
      ...env
    }
  });

  electron.on('close', (code) => {
    console.log(`🔴 Electron fermé (code ${code})`);
    process.exit(code);
  });

  electron.on('error', (err) => {
    console.error('❌ Erreur Electron:', err);
  });
}

if (mode === 'production') {
  startElectron();
} else {
  const vite = spawn(npmCmd, ['run', 'dev'], { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
  let buffer = '';

  vite.stdout.on('data', (data) => {
    const str = data.toString();
    process.stdout.write(str);
    buffer += str;

    if (buffer.includes('http://localhost:5173') && !global.electronStarted) {
      global.electronStarted = true;
      startElectron({ VITE_DEV_SERVER_URL: 'http://localhost:5173' });
    }
  });

  vite.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });

  vite.on('close', (code) => {
    console.log('🔴 Vite fermé');
    process.exit(code);
  });
}
