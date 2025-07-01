import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import path from 'path'

// Plugin pour servir les slides via API REST
const slidesApiPlugin = () => {
  return {
    name: 'slides-api',
    configureServer(server) {
      // API pour servir les slides
      server.middlewares.use('/api/slides', async (req, res, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        try {
          // Chemin vers le dossier de présentation (remonter de frontend vers example-pres)
          const presentationPath = path.resolve(process.cwd(), '../example-pres')
          const markdownFile = path.join(presentationPath, 'presentation.md')

          if (!fs.existsSync(markdownFile)) {
            throw new Error(`Fichier de présentation non trouvé: ${markdownFile}`)
          }

          const content = fs.readFileSync(markdownFile, 'utf-8')

          // Parser le markdown et créer les slides
          const slides = await parseMarkdownToSlides(content, presentationPath)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ slides }))
        } catch (error) {
          console.error('Erreur lors du chargement des slides:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message }))
        }
      })

      // API pour servir le CSS personnalisé
      server.middlewares.use('/api/presentation-style.css', (req, res, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        try {
          const presentationPath = path.resolve(process.cwd(), '../example-pres')
          const cssFile = path.join(presentationPath, 'style.css')

          if (fs.existsSync(cssFile)) {
            const cssContent = fs.readFileSync(cssFile, 'utf-8')
            res.setHeader('Content-Type', 'text/css')
            res.end(cssContent)
          } else {
            res.statusCode = 404
            res.end('/* CSS de présentation non trouvé */')
          }
        } catch (error) {
          console.error('Erreur lors du chargement du CSS:', error)
          res.statusCode = 500
          res.end('/* Erreur lors du chargement du CSS */')
        }
      })

      // API pour servir les assets (images, etc.)
      server.middlewares.use('/api/assets', (req, res, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        try {
          const presentationPath = path.resolve(process.cwd(), '../example-pres')
          const assetPath = req.url.replace('/api/assets', '')
          const fullAssetPath = path.join(presentationPath, 'assets', assetPath)

          if (fs.existsSync(fullAssetPath) && fs.statSync(fullAssetPath).isFile()) {
            const ext = path.extname(fullAssetPath).toLowerCase()
            const mimeTypes = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.webp': 'image/webp',
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.json': 'application/json'
            }

            const mimeType = mimeTypes[ext] || 'application/octet-stream'
            res.setHeader('Content-Type', mimeType)

            const fileContent = fs.readFileSync(fullAssetPath)
            res.end(fileContent)
          } else {
            res.statusCode = 404
            res.end('Asset non trouvé')
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'asset:', error)
          res.statusCode = 500
          res.end('Erreur serveur')
        }
      })
    }
  }
}

// Fonction de parsing markdown
async function parseMarkdownToSlides(content, presentationPath) {
  // Import dynamique des dépendances
  const markdownIt = (await import('markdown-it')).default
  const hljs = (await import('highlight.js')).default

  const md = markdownIt({
    html: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch (__) { }
      }
      return '' // use external default escaping
    }
  })

  // Diviser le contenu par slides (séparateur ---)
  const slideContents = content.split(/^---$/gm).map(s => s.trim()).filter(s => s)

  const slides = []

  for (const slideContent of slideContents) {
    let processedContent = slideContent

    // Traiter les inclusions de code [Code](./assets/fichier.js#5-10)
    const codeIncludes = slideContent.match(/\[Code\]\(([^)]+)\)/g)
    if (codeIncludes) {
      for (const include of codeIncludes) {
        const match = include.match(/\[Code\]\(([^#]+)(?:#(\d+)-(\d+))?\)/)
        if (match) {
          const filePath = match[1]
          const startLine = match[2] ? parseInt(match[2]) : null
          const endLine = match[3] ? parseInt(match[3]) : null

          try {
            const fullPath = path.resolve(presentationPath, filePath)
            const fileContent = fs.readFileSync(fullPath, 'utf-8')
            const lines = fileContent.split('\n')

            let codeToShow = fileContent
            if (startLine && endLine) {
              codeToShow = lines.slice(startLine - 1, endLine).join('\n')
            }

            // Détecter l'extension pour la coloration
            const ext = path.extname(filePath).substring(1)
            const langMap = {
              'js': 'javascript',
              'ts': 'typescript',
              'py': 'python',
              'java': 'java',
              'cpp': 'cpp',
              'c': 'c',
              'html': 'html',
              'css': 'css',
              'json': 'json'
            }
            const language = langMap[ext] || ext

            const codeBlock = `\`\`\`${language}\n${codeToShow}\n\`\`\``
            processedContent = processedContent.replace(include, codeBlock)
          } catch (error) {
            console.error(`Erreur lors de l'inclusion du fichier ${filePath}:`, error)
            processedContent = processedContent.replace(include, `\`\`\`\nErreur: Impossible de charger ${filePath}\n\`\`\``)
          }
        }
      }
    }

    // Convertir le markdown en HTML
    let html = md.render(processedContent)

    // Corriger les chemins des images pour utiliser l'API des assets
    html = html.replace(/src="\.\/assets\/([^"]+)"/g, 'src="/api/assets/$1"')
    html = html.replace(/src="assets\/([^"]+)"/g, 'src="/api/assets/$1"')

    slides.push(html)
  }

  return slides
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    slidesApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
