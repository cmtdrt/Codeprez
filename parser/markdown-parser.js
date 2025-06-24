import fs from 'fs';
// Ce module analyse un fichier markdown et un fichier de configuration pour générer des diapositives HTML.
// Il utilise la bibliothèque « markdown-it » pour analyser Markdown et « fs/promises » pour les opérations sur les fichiers.
import MarkdownIt from 'markdown-it';
// « highlight.js » pour la coloration syntaxique dans les blocs de code.
import hljs from 'highlight.js';

const md = new MarkdownIt({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs ${lang}">` +
               hljs.highlight(str, { language: lang }).value +
               `</code></pre>`;
      } catch (_) {}
    }
    return `<pre><code class="hljs">` + md.utils.escapeHtml(str) + `</code></pre>`;
  }
});


export function parseMarkdown(mdPath, configPath) {
    try {
        const mdContent = fs.readFileSync(mdPath, 'utf-8');
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);

        const slides = [];

        slides.push(`
            <section class="slide">
                <h1>${config.title}</h1>
                <p><strong>Présentateurs :</strong> ${config.authors}</p>
                <p><strong>Durée estimée :</strong> ${config.duration} minutes</p>
            </section>
        `);
        const rawSections = mdContent.split(/\n\s*---\s*\n/g);

        for (const section of rawSections) {
            const html = md.render(section);
            slides.push(`
                <section class="slide">
                    ${html}
                </section>
            `);        }

        return slides;
    } catch (err) {
        console.error('Error parsing markdown:', err);
        return [`<section><pre>Erreur : ${err.message}</pre></section>`];
    }
}