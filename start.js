import { spawn } from 'child_process';
import { readFileSync } from 'fs';

console.log('🚀 Démarrage de CodePrez - Liaison Vue + Electron');

// Sur Windows, on doit utiliser npm.cmd au lieu de npm
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Fonction pour attendre que Vite soit prêt
function waitForVite() {
  return new Promise((resolve) => {
    const checkVite = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:5173');
        if (response.ok) {
          console.log('✅ Vite est prêt');
          clearInterval(checkVite);
          resolve();
        }
      } catch (error) {
        console.log('⏳ Attente de Vite...');
      }
    }, 1000);
  });
}

// Lancer Vite (frontend)
console.log('📦 Démarrage du serveur Vite...');
const vite = spawn(npmCmd, ['run', 'dev'], {
  cwd: './frontend',
  shell: true,
  stdio: 'pipe',
  env: {
    ...process.env,
    FORCE_COLOR: '1'
  }
});

// Rediriger les sorties de Vite avec préfixe
vite.stdout.on('data', (data) => {
  console.log(`[VITE] ${data.toString().trim()}`);
});

vite.stderr.on('data', (data) => {
  console.log(`[VITE] ${data.toString().trim()}`);
});

vite.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Vite process exited with code ${code}`);
    process.exit(code);
  }
});

// Attendre que Vite soit prêt puis lancer Electron
waitForVite().then(() => {
  console.log('🔗 Lancement d\'Electron avec liaison Vue...');

  // Utiliser le chemin direct vers Electron sur Windows
  const electronCmd = process.platform === 'win32' ? '.\\node_modules\\.bin\\electron.cmd' : 'npx';
  const electronArgs = process.platform === 'win32' ? ['electron/main.js'] : ['electron', 'electron/main.js'];

  const electron = spawn(electronCmd, electronArgs, {
    shell: true,
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
      FORCE_COLOR: '1'
    }
  });

  // Rediriger les sorties d'Electron avec préfixe
  electron.stdout.on('data', (data) => {
    console.log(`[ELECTRON] ${data.toString().trim()}`);
  });

  electron.stderr.on('data', (data) => {
    console.log(`[ELECTRON] ${data.toString().trim()}`);
  });

  electron.on('close', (code) => {
    console.log(`🔚 Electron fermé avec le code ${code}`);
    // Fermer Vite quand Electron se ferme
    vite.kill();
    process.exit(code);
  });

  // Gérer la fermeture propre
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt en cours...');
    electron.kill();
    vite.kill();
    process.exit(0);
  });
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée:', reason);
  process.exit(1);
});
