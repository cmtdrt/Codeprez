#!/usr/bin/env node

/**
 * Script de test pour vérifier la création et validation d'archives .codeprez
 * Ce script test le workflow complet selon le cahier des charges
 */

import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXAMPLE_PRES_PATH = path.join(__dirname, 'example-pres');
const TEST_ARCHIVE_PATH = path.join(__dirname, 'test-presentation.codeprez');

// Fichiers et dossiers requis selon le cahier des charges
const REQUIRED_FILES = {
    'presentation.md': 'Fichier de présentation principal',
    'style.css': 'Fichier de styles CSS',
    'config.json': 'Configuration de la présentation'
};

const OPTIONAL_FOLDERS = {
    'assets': 'Dossier des ressources (images, etc.)',
    'env': 'Dossier de l\'environnement d\'exécution'
};

/**
 * Crée une archive .codeprez à partir du dossier example-pres
 */
function createCodeprezArchive() {
    console.log('🔨 Création de l\'archive .codeprez...');

    try {
        const zip = new AdmZip();

        // Ajouter récursivement tous les fichiers du dossier exemple
        zip.addLocalFolder(EXAMPLE_PRES_PATH, 'example-pres');

        // Écrire l'archive
        zip.writeZip(TEST_ARCHIVE_PATH);

        console.log('✅ Archive créée:', TEST_ARCHIVE_PATH);
        console.log('📦 Taille:', fs.statSync(TEST_ARCHIVE_PATH).size, 'bytes');

        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'archive:', error.message);
        return false;
    }
}

/**
 * Valide le contenu d'une archive .codeprez
 */
function validateCodeprezArchive(archivePath) {
    console.log('🔍 Validation de l\'archive .codeprez...');

    try {
        const zip = new AdmZip(archivePath);
        const entries = zip.getEntries();

        console.log('📋 Contenu de l\'archive:');
        entries.forEach(entry => {
            console.log(`  ${entry.isDirectory ? '📁' : '📄'} ${entry.entryName}`);
        });

        // Vérifier les fichiers requis
        console.log('\n✅ Vérification des fichiers requis:');
        let allRequiredPresent = true;

        for (const [fileName, description] of Object.entries(REQUIRED_FILES)) {
            const found = entries.some(entry =>
                entry.entryName.endsWith('/' + fileName) || entry.entryName === fileName
            );

            if (found) {
                console.log(`  ✅ ${fileName} - ${description}`);
            } else {
                console.log(`  ❌ ${fileName} - ${description} (MANQUANT)`);
                allRequiredPresent = false;
            }
        }

        // Vérifier les dossiers optionnels
        console.log('\n📁 Vérification des dossiers optionnels:');
        for (const [folderName, description] of Object.entries(OPTIONAL_FOLDERS)) {
            const found = entries.some(entry =>
                entry.isDirectory && entry.entryName.includes(folderName + '/')
            );

            if (found) {
                console.log(`  ✅ ${folderName}/ - ${description}`);
            } else {
                console.log(`  ⚠️  ${folderName}/ - ${description} (ABSENT)`);
            }
        }

        // Vérifier le contenu des fichiers requis
        console.log('\n🔍 Vérification du contenu:');

        // Vérifier config.json
        const configEntry = entries.find(entry => entry.entryName.endsWith('config.json'));
        if (configEntry) {
            try {
                const configContent = zip.readAsText(configEntry);
                const config = JSON.parse(configContent);

                if (config.title && config.authors && config.duration) {
                    console.log('  ✅ config.json - Format valide');
                    console.log(`    - Titre: "${config.title}"`);
                    console.log(`    - Auteurs: ${config.authors.join(', ')}`);
                    console.log(`    - Durée: ${config.duration} min`);
                } else {
                    console.log('  ❌ config.json - Format invalide (propriétés manquantes)');
                    allRequiredPresent = false;
                }
            } catch (error) {
                console.log('  ❌ config.json - JSON invalide:', error.message);
                allRequiredPresent = false;
            }
        }

        // Vérifier presentation.md
        const presentationEntry = entries.find(entry => entry.entryName.endsWith('presentation.md'));
        if (presentationEntry) {
            const presentationContent = zip.readAsText(presentationEntry);
            const slideCount = (presentationContent.match(/^---$/gm) || []).length + 1;
            console.log(`  ✅ presentation.md - ${slideCount} slides détectées`);

            // Vérifier les références d'images
            const imageRefs = presentationContent.match(/!\[.*?\]\(\.\/assets\/.*?\)/g) || [];
            if (imageRefs.length > 0) {
                console.log(`    - ${imageRefs.length} référence(s) d'image(s) détectée(s)`);
                imageRefs.forEach(ref => {
                    console.log(`      ${ref}`);
                });
            }

            // Vérifier les blocs de code
            const codeBlocks = presentationContent.match(/```[\s\S]*?```/g) || [];
            if (codeBlocks.length > 0) {
                console.log(`    - ${codeBlocks.length} bloc(s) de code détecté(s)`);
            }
        }

        return allRequiredPresent;

    } catch (error) {
        console.error('❌ Erreur lors de la validation:', error.message);
        return false;
    }
}

/**
 * Simule le processus de chargement dans Electron
 */
function simulateElectronProcessing(archivePath) {
    console.log('\n🔧 Simulation du traitement Electron...');

    try {
        const zip = new AdmZip(archivePath);
        const tempPath = path.join(__dirname, 'temp-test-extraction');

        // Nettoyer le dossier temporaire s'il existe
        if (fs.existsSync(tempPath)) {
            fs.rmSync(tempPath, { recursive: true, force: true });
        }

        // Extraire l'archive
        zip.extractAllTo(tempPath, true);

        console.log('✅ Archive extraite dans:', tempPath);

        // Chercher le dossier de présentation
        const items = fs.readdirSync(tempPath);
        let presentationPath = null;

        for (const item of items) {
            const itemPath = path.join(tempPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
                if (fs.existsSync(path.join(itemPath, 'presentation.md'))) {
                    presentationPath = itemPath;
                    break;
                }
            }
        }

        if (presentationPath) {
            console.log('✅ Dossier de présentation trouvé:', presentationPath);

            // Vérifier la structure
            const hasPresentation = fs.existsSync(path.join(presentationPath, 'presentation.md'));
            const hasConfig = fs.existsSync(path.join(presentationPath, 'config.json'));
            const hasStyle = fs.existsSync(path.join(presentationPath, 'style.css'));
            const hasAssets = fs.existsSync(path.join(presentationPath, 'assets'));
            const hasEnv = fs.existsSync(path.join(presentationPath, 'env'));

            console.log('📋 Structure extraite:');
            console.log(`  ${hasPresentation ? '✅' : '❌'} presentation.md`);
            console.log(`  ${hasConfig ? '✅' : '❌'} config.json`);
            console.log(`  ${hasStyle ? '✅' : '❌'} style.css`);
            console.log(`  ${hasAssets ? '✅' : '⚠️ '} assets/`);
            console.log(`  ${hasEnv ? '✅' : '⚠️ '} env/`);

            // Nettoyer
            fs.rmSync(tempPath, { recursive: true, force: true });
            console.log('🧹 Dossier temporaire nettoyé');

            return hasPresentation && hasConfig && hasStyle;
        } else {
            console.log('❌ Aucun dossier de présentation valide trouvé');
            fs.rmSync(tempPath, { recursive: true, force: true });
            return false;
        }

    } catch (error) {
        console.error('❌ Erreur lors de la simulation:', error.message);
        return false;
    }
}

/**
 * Fonction principale de test
 */
function runTests() {
    console.log('🧪 === TEST DE CRÉATION D\'ARCHIVE .CODEPREZ ===\n');

    // Vérifier que le dossier exemple existe
    if (!fs.existsSync(EXAMPLE_PRES_PATH)) {
        console.log('❌ Le dossier example-pres n\'existe pas');
        process.exit(1);
    }

    console.log('📁 Dossier source:', EXAMPLE_PRES_PATH);
    console.log('📦 Archive cible:', TEST_ARCHIVE_PATH);
    console.log();

    // Nettoyer l'archive existante
    if (fs.existsSync(TEST_ARCHIVE_PATH)) {
        fs.unlinkSync(TEST_ARCHIVE_PATH);
        console.log('🧹 Archive existante supprimée\n');
    }

    let success = true;

    // Test 1: Créer l'archive
    if (!createCodeprezArchive()) {
        success = false;
    }

    console.log();

    // Test 2: Valider l'archive
    if (!validateCodeprezArchive(TEST_ARCHIVE_PATH)) {
        success = false;
    }

    console.log();

    // Test 3: Simuler le traitement Electron
    if (!simulateElectronProcessing(TEST_ARCHIVE_PATH)) {
        success = false;
    }

    console.log('\n🏁 === RÉSULTATS DES TESTS ===');

    if (success) {
        console.log('✅ Tous les tests sont passés avec succès !');
        console.log('✅ La création d\'archive .codeprez fonctionne correctement');
        console.log('✅ L\'archive respecte le cahier des charges');
    } else {
        console.log('❌ Certains tests ont échoué');
        console.log('❌ Des améliorations sont nécessaires');
    }

    // Garder l'archive pour inspection manuelle
    console.log(`\n📦 Archive de test conservée: ${TEST_ARCHIVE_PATH}`);
    console.log('💡 Vous pouvez tester manuellement en important cette archive dans l\'application');

    return success;
}

// Exécuter les tests directement
const success = runTests();
process.exit(success ? 0 : 1);

export { runTests, createCodeprezArchive, validateCodeprezArchive };
