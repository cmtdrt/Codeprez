// parser/markdown-parser.js
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

function parseMarkdown(mdPath, configPath, assetsPath) {
  const mdFile = fs.readFileSync(mdPath, 'utf-8');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const md = new MarkdownIt({
    html: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
        } catch (_) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
  });

  const slides = mdFile.split(config.separator || '\n---\n').map((slide) => {
    return md.render(slide);
  });

  return slides;
}

module.exports = {
  parseMarkdown
};
