import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import path from 'path'

// Plugin pour servir les slides via API
const slidesApiPlugin = () => {
  return {
    name: 'slides-api',
    configureServer(server) {
      server.middlewares.use('/api/slides', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            // Simuler le parsing des slides (version simplifiée)
            const mdPath = path.resolve('../example-pres/presentation.md')
            const configPath = path.resolve('../example-pres/config.json')

            if (fs.existsSync(mdPath) && fs.existsSync(configPath)) {
              const mdContent = fs.readFileSync(mdPath, 'utf-8')
              const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

              // Parse simple - diviser par ---
              const sections = mdContent.split(/\n\s*---\s*\n/g)
              const slides = []

              // Slide de titre
              slides.push(`
                <section class="slide">
                  <h1>${config.title}</h1>
                  <p><strong>Présentateurs :</strong> ${config.authors}</p>
                  <p><strong>Durée estimée :</strong> ${config.duration} minutes</p>
                </section>
              `)

              // Slides de contenu (conversion basique Markdown vers HTML)
              sections.forEach(section => {
                let html = section
                  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                  .replace(/^## (.+)$/gm, '<h2>$2</h2>')
                  .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
                  .replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`(.+?)`/g, '<code>$1</code>')
                  .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="hljs $1">$2</code></pre>')

                // Wrap les listes
                html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')

                slides.push(`<section class="slide">${html}</section>`)
              })

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(slides))
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Slides not found' }))
            }
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        } else {
          next()
        }
      })
    }
  }
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
