import fs from 'fs';
import archiver from 'archiver';
import path from 'path';

async function createCodeprez({
  markdown,
  css,
  config,
  assetsDir,
  envDir,
  output
}) {
  const outputZip = fs.createWriteStream(output);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(outputZip);

  archive.file(markdown, { name: 'presentation.md' });
  archive.file(css, { name: 'style.css' });
  archive.file(config, { name: 'config.json' });

  if (fs.existsSync(assetsDir)) {
    archive.directory(assetsDir, 'assets');
  }
  if (fs.existsSync(envDir)) {
    archive.directory(envDir, 'env');
  }

  await archive.finalize();
  console.log(`Archive créée : ${output}`);
}

createCodeprez({
  markdown: path.resolve('example-pres/presentation.md'),
  css: path.resolve('example-pres/style.css'),
  config: path.resolve('example-pres/config.json'),
  assetsDir: path.resolve('example-pres/assets'),
  envDir: path.resolve('example-pres/env'),
  output: path.resolve('example-pres/presentation.codeprez')
});