import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) { }
    }
    return ''; // use external default escaping
  }
});

export function parseMarkdown(mdPath, configPath, assetsPath) {
  try {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');

    // Charger la config si disponible
    let config = {};
    if (configPath && fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    // Charger le CSS si disponible
    let customCSS = null;
    const cssPath = path.join(path.dirname(mdPath), 'style.css');
    if (fs.existsSync(cssPath)) {
      customCSS = fs.readFileSync(cssPath, 'utf-8');
    }

    // Diviser le contenu par slides (séparateur ---)
    const slideContents = mdContent.split(/^---$/gm).map(s => s.trim()).filter(s => s);

    const slides = [];

    // Ajouter la slide de titre si config disponible
    if (config.title) {
      const titleSlide = `
        <section>
          <h1>${config.title}</h1>
          ${config.authors ? `<p><strong>Présentateurs :</strong> ${config.authors}</p>` : ''}
          ${config.duration ? `<p><strong>Durée estimée :</strong> ${config.duration} minutes</p>` : ''}
        </section>
      `;
      slides.push(titleSlide);
    }

    for (const slideContent of slideContents) {
      let processedContent = slideContent;

      // Traiter les inclusions de code [Code](./assets/fichier.js#5-10)
      const codeIncludes = slideContent.match(/\[Code\]\(([^)]+)\)/g);
      if (codeIncludes) {
        for (const include of codeIncludes) {
          const match = include.match(/\[Code\]\(([^#]+)(?:#(\d+)-(\d+))?\)/);
          if (match) {
            const filePath = match[1];
            const startLine = match[2] ? parseInt(match[2]) : null;
            const endLine = match[3] ? parseInt(match[3]) : null;

            try {
              const fullPath = path.resolve(path.dirname(mdPath), filePath);
              const fileContent = fs.readFileSync(fullPath, 'utf-8');
              const lines = fileContent.split('\n');

              let codeToShow = fileContent;
              if (startLine && endLine) {
                codeToShow = lines.slice(startLine - 1, endLine).join('\n');
              }

              // Détecter l'extension pour la coloration
              const ext = path.extname(filePath).substring(1);
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
              };
              const language = langMap[ext] || ext;

              const codeBlock = `\`\`\`${language}\n${codeToShow}\n\`\`\``;
              processedContent = processedContent.replace(include, codeBlock);
            } catch (error) {
              console.error(`Erreur lors de l'inclusion du fichier ${filePath}:`, error);
              processedContent = processedContent.replace(include, `\`\`\`\nErreur: Impossible de charger ${filePath}\n\`\`\``);
            }
          }
        }
      }

      // Convertir le markdown en HTML
      let html = md.render(processedContent);

      // Traiter les blocs de commandes bash après le rendu markdown
      html = html.replace(/<pre><code class="language-bash">([\s\S]*?)<\/code><\/pre>/g, (match, command) => {
        // Décoder les entités HTML
        const decodedCommand = command
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .trim();

        // Générer un ID unique pour cette commande
        const commandId = 'cmd_' + Math.random().toString(36).substr(2, 9);

        return `
          <div class="command-block" data-command-id="${commandId}">
            <div class="command-header">
              <code class="command-text">${decodedCommand}</code>
              <button class="execute-btn" onclick="executeCommand('${commandId}', '${decodedCommand.replace(/'/g, "\\'")}')">
                ▶ Exécuter
              </button>
            </div>
            <div class="command-output" id="output_${commandId}" style="display: none;">
              <pre class="output-content"></pre>
            </div>
          </div>
        `;
      });

      // Corriger les chemins des images pour le mode Electron
      if (assetsPath) {
        // En mode Electron, utiliser le protocole personnalisé codeprez-asset://
        html = html.replace(/src="\.\/assets\/([^"]+)"/g, 'src="codeprez-asset://$1"');
        html = html.replace(/src="assets\/([^"]+)"/g, 'src="codeprez-asset://$1"');
      }

      slides.push(`<section>${html}</section>`);
    }

    return {
      slides,
      customCSS,
      config
    };
  } catch (err) {
    console.error('Erreur analyse markdown :', err);
    return {
      slides: [`<section><pre>Erreur : ${err.message}</pre></section>`],
      customCSS: null,
      config: {}
    };
  }
}
