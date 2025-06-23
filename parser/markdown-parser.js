import fs from 'fs/promises';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export async function parseMarkdown(mdPath, configPath) {
    try {
        const mdContent = await fs.readFile(mdPath, 'utf-8');
        const configContent = await fs.readFile(configPath, 'utf-8');
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
            `);
        }

        return slides
    } catch (err) {
        console.error('Error parsing markdown:', err);
        return [`<section><pre>Erreur : ${err.message}</pre></section>`];
    }
}