import fs from 'fs';
import unzipper from 'unzipper';

export async function unzipCodeprezArchive(archivePath, destDir) {
  await fs.createReadStream(archivePath)
    .pipe(unzipper.Extract({ path: destDir }))
    .promise();
  console.log(`Archive extraite dans : ${destDir}`);
}

unzipCodeprezArchive(
  'example-pres/presentation.codeprez',
  'example-pres/presentation.codeprez-extracted'
);