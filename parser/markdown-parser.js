const fs = require('fs');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

// Initialisation du parser Markdown avec coloration syntaxique
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

// Fonction principale d'analyse
function parseMarkdown(mdPath, configPath) {
  try {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const slides = [];

    // Slide d’intro
    slides.push(`
      <section class="slide">
        <h1>${config.title}</h1>
        <p><strong>Présentateurs :</strong> ${config.authors}</p>
        <p><strong>Durée estimée :</strong> ${config.duration} minutes</p>
      </section>
    `);

    // Découpe des slides à partir de ---
    const rawSections = mdContent.split(/\n\s*---\s*\n/g);

    for (const section of rawSections) {
      const html = md.render(section);
      slides.push(`
        <section class="slide">
          ${html}
        </section>
      `);
    }

    return slides;
  } catch (err) {
    console.error('Erreur analyse markdown :', err);
    return [`<section><pre>Erreur : ${err.message}</pre></section>`];
  }
}

module.exports = { parseMarkdown };
