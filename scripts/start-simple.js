import { spawn } from 'child_process';

// Sur Windows, on doit utiliser npm.cmd au lieu de npm
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('🚀 Démarrage de Vite...');

const vite = spawn(npmCmd, ['run', 'dev'], {
    shell: true,
    stdio: 'pipe'
});

vite.stdout.on('data', (data) => {
    process.stdout.write(data);
});

vite.stderr.on('data', (data) => {
    process.stderr.write(data);
});

// Attendre 3 secondes puis lancer Electron
setTimeout(() => {
    console.log('🚀 Lancement d\'Electron...');

    const electron = spawn(npmCmd, ['run', 'electron:start'], {
        shell: true,
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'development',
            VITE_DEV_SERVER_URL: 'http://localhost:5173'
        }
    });

    electron.on('error', (err) => {
        console.error('❌ Erreur Electron:', err);
    });

    electron.on('close', (code) => {
        console.log('🔴 Electron fermé');
        vite.kill();
        process.exit(code);
    });
}, 3000);

vite.on('close', (code) => {
    console.log('🔴 Vite fermé');
    process.exit(code);
});
