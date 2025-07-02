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
- **Sécurité** : Sandboxing, validation des commandes

---

# ⚡ Fonctionnalités Principales 

## 📝 Création de contenu
- **Markdown** pour l'écriture
- **CSS personnalisé** pour le style
- **Inclusion de code** depuis des fichiers externes
- **Images et médias** intégrés

## 🎮 Présentation interactive
- **Navigation** fluide entre slides
- **Mode plein écran**
- **Contrôles clavier** (flèches, Échap)
- **Vue d'ensemble** des slides

## 💻 Exécution de code
- **Commandes bash** exécutables
- **Sortie en temps réel**
- **Sécurité renforcée** (whitelist, sandbox)
- **Gestion des erreurs**

---

# 🔧 Technologies Utilisées {#technologies}

## Architecture Electron

### **Main Process** - Processus principal
```javascript
// Création de fenêtre sécurisée
const mainWindow = new BrowserWindow({
  width: 1280,
  height: 800,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true
  }
});
```

### **Communication IPC sécurisée**
```javascript
// preload.js - ContextBridge sécurisé
contextBridge.exposeInMainWorld('electronAPI', {
  loadSlides: () => ipcRenderer.invoke('load-slides'),
  executeCommand: (cmd) => ipcRenderer.invoke('execute-command', cmd),
  processZipFile: (buffer) => ipcRenderer.invoke('process-zip-file', buffer)
});
```

### **Manipulation système avec Node.js**
```javascript
// Décompression d'archives .codeprez
const zip = new AdmZip(Buffer.from(zipBuffer));
zip.extractAllTo(tempPresentationPath, true);

// Parsing Markdown avec MarkdownIt
const md = new MarkdownIt({
  html: true,
  highlight: (str, lang) => hljs.highlight(str, { language: lang }).value
});
```

---

# 💻 Démonstration - Commandes exécutables {#demo}

## ✅ **Critère : Exécution de commandes (BONUS)**

### Test système Windows
```bash
echo "CodePrez fonctionne sur Windows !"
```

### Vérification de l'environnement
```bash
node --version
```

### Affichage des fichiers du projet
```bash
dir
```

### Test multi-plateforme
```bash
systeminfo | findstr /C:"OS Name"
```

---

# 📝 Démonstration - Code de l'app {#code-demo}

## ✅ **Critère : Affichage de blocs de code**

### Frontend Vue.js - Navigation des slides

[Code](./assets/demo.js#1-25)

### Backend Electron - Gestion des fenêtres

[Code](./assets/demo.js#26-40)

### Parser Markdown - Inclusion de code externe

[Code](./assets/demo.js#41-61)

---

# 📝 Architecture Frontend - Vue.js 3

## ✅ **Critère : Interface graphique professionnelle**

### Composition API pour la réactivité
```javascript
// Gestion d'état réactive
const slides = ref([])
const presentationMode = ref(false)
const currentSlideIndex = ref(0)

// Computed properties
const currentSlide = computed(() => 
  slides.value[currentSlideIndex.value] || ''
)

// Gestion des événements clavier
const handleKeydown = (event) => {
  if (event.key === 'ArrowRight') nextSlide()
  if (event.key === 'ArrowLeft') prevSlide()
  if (event.key === 'Escape') exitPresentation()
}
```

---

# 🔐 Sécurité et Communication IPC

## ✅ **Critère : Communication Main/Renderer sécurisée**

### ContextBridge - Exposition sécurisée d'APIs
```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  // Chargement sécurisé des slides
  loadSlides: () => ipcRenderer.invoke('load-slides'),
  
  // Sélection de dossier avec dialogue natif
  selectPresentationFolder: () => 
    ipcRenderer.invoke('select-presentation-folder'),
  
  // Gestion des archives
  processZipFile: (buffer) => 
    ipcRenderer.invoke('process-zip-file', buffer)
});
```

### Main Process - Gestionnaires IPC
```javascript
// main.js - Handlers sécurisés
ipcMain.handle('load-slides', async () => {
  // Validation du chemin
  if (!currentPresentationPath) return { needSelection: true }
  
  // Parsing sécurisé
  return await parseMarkdown(
    path.join(currentPresentationPath, 'presentation.md'),
    path.join(currentPresentationPath, 'config.json'),
    path.join(currentPresentationPath, 'assets')
  )
});
```

---

# 🚀 Perspectives d'évolution {#perspectives}

## Fonctionnalités futures
- 🎨 **Thèmes** personnalisables
- 📊 **Graphiques** interactifs
- 🔄 **Synchronisation** en temps réel
- 🌐 **Export web** statique

## Améliorations techniques
- ⚡ **Performance** optimisée
- 🔒 **Sécurité** renforcée
- 📱 **Mobile** responsive
- 🧪 **Tests** automatisés

## Écosystème
- 📦 **Marketplace** de thèmes
- 🔌 **Plugins** tiers
- 📚 **Documentation** complète
- 👥 **Communauté** active

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
