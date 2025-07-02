# Sommaire

1. 📋 **Sommaire** - Vue d'ensemble
2. 🎯 **Présentation du projet** - Objectifs & Fonctionnalités
3. 🔧 **Technologies utilisées** - Stack technique
4. 💻 **Architecture Electron** - Code de l'application
5. � **Améliorations possibles** - Futur du projet
6. ✨ **Points forts** - Avantages du projet
7. 🎓 **Apprentissages & Défis** - Compétences acquises
8. 🎬 **Fin** - Questions et démonstration

---

# 🎯 Présentation du projet

CodePrez est une **application de présentation** moderne qui répond aux critères suivants :

### ✅ **Fonctionnalités principales**
- **Création de fichiers .codeprez** via interface graphique
- **Ouverture d'archives** existantes 
- **Navigation fluide** entre diapositives
- **Affichage de code** avec coloration syntaxique


### 🎯 **Objectifs atteints**
- Interface desktop **professionnelle**
- Compatibilité **multi-plateforme** (Windows/Mac/Linux)
- Architecture **sécurisée** avec Electron

---

## Technologies clés
- **Frontend** : Vue.js 3, Vite, CSS moderne
- **Backend** : Electron, Node.js, ES Modules
- **Parsing** : MarkdownIt, Highlight.js
- **Compression**: adm-zip

---

#  Fonctionnalités Principales 
##  Création de contenu
- Markdown pour l'écriture
- CSS personnalisé pour le style
- Inclusion de code depuis des fichiers externes
- Images et médias intégrés

##  Présentation interactive
- Navigation fluide entre slides
- Mode plein écran
- Contrôles clavier (flèches, Échap)
- Vue d'ensemble des slides



##  Exécution de code
- Commandes bash exécutables
- Sortie en temps réel
- Gestion des erreurs

---


## Architecture Electron

### **Main Process** - Processus principal
```javascript
function createWindow() {
    console.log('>> Création de la fenêtre Electron');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true // Sécurité activée
        },
        show: false // Ne pas afficher tant que ce n'est pas prêt
    });

    // Charger l'URL appropriée selon le mode
    if (isDev) {
        console.log('>> Mode développement - Chargement de Vite:', viteServerUrl);
        mainWindow.loadURL(viteServerUrl);
        // mainWindow.webContents.openDevTools(); // Décommenter pour debug
    } else {
        console.log('>> Mode production - Chargement du build');
        const indexPath = path.join(__dirname, '../frontend/dist/index.html');
        mainWindow.loadFile(indexPath);
    }

    // Afficher la fenêtre quand elle est prête
    mainWindow.once('ready-to-show', () => {
        console.log('>> Fenêtre prête à être affichée');
        mainWindow.show();

        // Envoyer un message à Vue pour confirmer la connexion
        setTimeout(() => {
            mainWindow.webContents.send('electron-ready', {
                isDev,
                platform: process.platform,
                version: app.getVersion()
            });
        }, 1000);
    });

    // Gérer la fermeture de la fenêtre
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow;
}

```
---

### **Nettoyage à la fermeture de l'application**
```javascript
    app.on('before-quit', () => {
        if (fs.existsSync(tempPresentationPath)) {
            fs.rmSync(tempPresentationPath, { recursive: true, force: true });
            console.log(' Nettoyage final du dossier temporaire');
        }
    });
```
---

### **pour Zipper**
```javascript
async function validate() {
  try {
    const zip = new JSZip()
    // Ajoute chaque fichier sélectionné dans le zip, en respectant le chemin relatif
    for (const file of selectedFiles.value) {
      zip.file(file.webkitRelativePath, await file.arrayBuffer())
    }

    console.log(' Zip créé avec', selectedFiles.value.length, 'fichiers');

    // Génère le zip comme ArrayBuffer
    const zipArrayBuffer = await zip.generateAsync({ type: 'arraybuffer' })
    const uint8Array = new Uint8Array(zipArrayBuffer)


    // Demander à Electron d'ouvrir la boîte de dialogue d'enregistrement
    const saveResult = await window.electronAPI.saveFile(
      Array.from(new Uint8Array(zipArrayBuffer)),
      parentFolderName.value ? `${parentFolderName.value}.codeprez` : 'presentation.codeprez'
    );

    if (saveResult.canceled) {
      // L'utilisateur a annulé, on ne continue pas
      return;
    }

    // Ensuite, tu peux envoyer le zip à Electron et router vers /slides
    const result = await window.electronAPI.processZipFile(Array.from(uint8Array));
    if (result.success) {
      console.log('Présentation chargée avec succès:', result.slides);
      router.push('/slides');
    } else {
      alert(`Erreur lors du chargement: ${result.error}`);
    }
  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error);
    alert('Erreur lors du traitement du fichier');
  }
}
```

---
### **pour dézipper:**
```javascript
 ipcMain.handle('process-zip-file', async (event, zipBuffer) => {
        try {
            // Vérifier si un dossier temporaire existe déjà, si oui le supprimer
            if (fs.existsSync(tempPresentationPath)) {
                fs.rmSync(tempPresentationPath, { recursive: true, force: true });
            }
            // Créer le dossier temporaire
            fs.mkdirSync(tempPresentationPath, { recursive: true });

            // Dézipper avec AdmZip
            const zip = new AdmZip(Buffer.from(zipBuffer));
            zip.extractAllTo(tempPresentationPath, true);

```

---
## Fonctionnalités futures
-  Thèmes personnalisables
-  Graphiques interactifs
- Packaging de l'application pour distribution
- Preview des slides fonctionnelles

## Améliorations techniques
-  Performance optimisée
-  Mobile responsive
-  Tests automatisés



---

#  Points forts du projet

- **Exécution de code** dans les slides
- **Expérience utilisateur** soignée
- **Facilité d'utilisation**
- **Portabilité** (.codeprez)
- **Flexibilité** de contenu

---

# 🎓 Apprentissages & Défis


### **Mise en place de fenêtres Electron**
- Gestion des **dialogues natifs** (sélection de fichiers/dossiers)
- **Menus contextuels** et raccourcis clavier
- **Utilisation IPC** 

### **Traitement des données avec Node.js**
- **Compression/décompression** d'archives .codeprez
- **Parsing Markdown** avec MarkdownIt et Highlight.js
- **Gestion des fichiers et dossier**
- **Exécution de commandes**


---
# 🎬 Fin de la présentation
**🚀 Passons à la démonstration pratique et aux questions !**

*Merci d'avoir suivi cette présentation*
