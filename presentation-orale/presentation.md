# Sommaire

1. 📋 **Sommaire** - Vue d'ensemble
2. 🎯 **Présentation du projet** - Objectifs & Ce que fait l'app
3. 🔧 **Technologies utilisées** - Stack technique
4. 💻 **Démonstration** - Commandes exécutables
5. 📝 **Démonstration** - Code de l'app sur plusieurs slides
6. 🚀 **Perspectives d'évolution** - Futur du projet
7. 🎓 **Apprentissages & Défis** - Retour d'expérience
8. 🙏 **Remerciements** - Conclusion
9. 🎬 **Fin** - Transition vers questions

---

# 🎯 Présentation du projet {#presentation}

## Qu'est-ce que CodePrez ?

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
- **Package distributable** de l'application

---



## Technologies clés
- **Frontend** : Vue.js 3, Vite, CSS moderne
- **Backend** : Electron, Node.js, ES Modules
- **Parsing** : MarkdownIt, Highlight.js

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
- Sécurité renforcée (whitelist, sandbox)
- Gestion des erreurs

---

# 🔧 Technologies Utilisées {#technologies}

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

### **Nettoyage à la fermeture de l'application**
```javascript
    app.on('before-quit', () => {
        if (fs.existsSync(tempPresentationPath)) {
            fs.rmSync(tempPresentationPath, { recursive: true, force: true });
            console.log(' Nettoyage final du dossier temporaire');
        }
    });
```

### **pour zipper**
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

#  Perspectives d'évolution 

## Fonctionnalités futures
-  Thèmes personnalisables
-  Graphiques interactifs
-  Synchronisation en temps réel
-  Export web statique

## Améliorations techniques
-  Performance optimisée
-  Sécurité renforcée
-  Mobile responsive
-  Tests automatisés



---

# ✨ Points forts du projet

## 🎯 Innovation
- **Exécution de code** dans les slides
- **Architecture modulaire** moderne
- **Expérience utilisateur** soignée

## 🔧 Technique
- **ES Modules** natifs
- **Sécurité** par design
- **Performance** optimisée

## 🚀 Pratique
- **Facilité d'utilisation**
- **Portabilité** (.codeprez)
- **Flexibilité** de contenu

---

# 🎓 Apprentissages & Défis {#apprentissages}

## ✅ **Compétences acquises selon le barème**

### **Mise en place de fenêtres Electron**
- Configuration des **webPreferences** sécurisées
- Gestion des **dialogues natifs** (sélection de fichiers/dossiers)
- **Menus contextuels** et raccourcis clavier
- **Packaging** de l'application pour distribution

### **Communication IPC sécurisée**
- **ContextBridge** pour isoler le contexte
- **Preload scripts** pour l'exposition d'APIs
- **IPC handlers** asynchrones dans le main process
- **Validation** et sanitisation des données

### **Manipulation système avec Node.js**
- **Compression/décompression** d'archives .codeprez
- **Parsing Markdown** avec MarkdownIt et Highlight.js
- **Gestion des fichiers** et chemins multi-plateformes
- **Exécution sécurisée** de commandes système

## 🚧 **Défis techniques relevés**

### **Migration ES Modules**
- Conversion complète vers **import/export**
- Résolution des **incompatibilités** CommonJS/ESM
- **Configuration** Electron pour ES modules

### **Sécurité applicative**
- **Sandboxing** des commandes exécutables
- **Validation** des entrées utilisateur
- **Isolation** des processus Electron

---

# ❓ Questions & Discussion {#questions}

## Questions possibles
- 🔒 Comment gérez-vous la **sécurité** ?
- ⚡ Quelles sont les **performances** ?
- 🔄 Comment **étendre** le projet ?
- 📦 Déploiement et **distribution** ?

## Démonstration live
- Création d'une **nouvelle présentation**
- **Exécution** de commandes
- **Navigation** dans l'interface

---

# 🙏 Remerciements {#remerciements}

## ✅ **Projet complété selon le barème**

### **Complétion - Toutes les fonctionnalités**
- ✅ **Création de fichier CodePrez** via interface graphique
- ✅ **Ouverture d'archives** .codeprez existantes  
- ✅ **Navigation** fluide entre diapositives
- ✅ **Affichage de code** avec coloration syntaxique
- ✅ **Code externe** inclus depuis fichiers assets
- ✅ **Packaging** de l'application
- ✅ **Exécution de commandes** *(BONUS)*

### **Compétences déployées**
- ✅ **Fenêtres Electron** avec dialogues natifs
- ✅ **Communication IPC** sécurisée (ContextBridge)
- ✅ **Manipulation Node.js** (archives, parsing)

### **Qualité du code**
- ✅ **Propreté** et nomenclature KISS/DRY
- ✅ **Multi-plateforme** Windows/Mac/Linux
- ✅ **UX professionnelle** avec design moderne

## 🎯 **Soutenance sur le projet lui-même (BONUS)**
*Cette présentation fonctionne avec CodePrez !*

### Merci pour votre attention ! 
**Questions et démonstration interactive**

---

# 🎬 Fin de la présentation {#fin}

## 🎤 **Place aux questions !**

### **Domaines d'expertise démontrés :**
- 🔧 **Electron** - Architecture desktop sécurisée
- ⚛️ **Vue.js 3** - Interface réactive moderne  
- 🔒 **Node.js** - Manipulation système et sécurité
- 📦 **Packaging** - Distribution multi-plateforme
- 🎨 **UX/UI** - Design professionnel

### **Prêt pour la démonstration interactive**
- Navigation complète de l'application
- Création et ouverture d'archives .codeprez
- Exécution de commandes en temps réel
- Affichage de code avec inclusion externe

---

**🚀 Passons à la démonstration pratique et aux questions !**

*Merci d'avoir suivi cette présentation de 15 minutes*
