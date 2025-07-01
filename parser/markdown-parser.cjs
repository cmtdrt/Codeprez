// parser/markdown-parser.cjs - Version CommonJS pour Electron
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

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

function parseMarkdown(mdPath, configPath, assetsPath) {
    try {
        console.log('>> Parsing Markdown:', mdPath);
        console.log('>> Config path:', configPath);
        console.log('>> Assets path:', assetsPath);

        // Lire le fichier Markdown
        const mdContent = fs.readFileSync(mdPath, 'utf8');

        // Diviser le contenu par slides (séparateur ---)
        const slideContents = mdContent.split(/^---$/gm).map(s => s.trim()).filter(s => s);
        console.log('>> Slides trouvés:', slideContents.length);

        const slides = [];

        // Lire la configuration si elle existe
        let config = {};
        if (configPath && fs.existsSync(configPath)) {
            try {
                const configContent = fs.readFileSync(configPath, 'utf8');
                config = JSON.parse(configContent);
                console.log('>> Configuration chargée:', config);
            } catch (e) {
                console.warn('>> Erreur lors du parsing de la config:', e.message);
            }
        }

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

        // Traiter chaque slide
        for (const slideContent of slideContents) {
            // Convertir le markdown en HTML
            let html = md.render(slideContent);

            // Corriger les chemins des images
            if (assetsPath) {
                html = html.replace(/src="\.\/assets\/([^"]+)"/g, `src="./example-pres/assets/$1"`);
                html = html.replace(/src="assets\/([^"]+)"/g, `src="./example-pres/assets/$1"`);
            }

            slides.push(`<section>${html}</section>`);
        }

        // Lire le CSS si il existe
        let customCSS = null;
        const cssPath = path.join(path.dirname(mdPath), 'style.css');
        if (fs.existsSync(cssPath)) {
            customCSS = fs.readFileSync(cssPath, 'utf8');
            console.log('>> CSS chargé:', cssPath);
        }

        const result = {
            slides,
            config,
            customCSS
        };

        console.log('>> Résultat final:', {
            slidesCount: result.slides.length,
            hasConfig: Object.keys(result.config).length > 0,
            hasCSS: !!result.customCSS
        });

        return result;

    } catch (error) {
        console.error('>> Erreur lors du parsing:', error);
        throw error;
    }
}

module.exports = { parseMarkdown };
