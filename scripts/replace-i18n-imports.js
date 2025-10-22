// Script pour remplacer automatiquement les imports next-i18next
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fonction pour remplacer les imports dans un fichier
function replaceImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Déterminer le chemin relatif correct selon le dossier
    const isInComponents = filePath.includes('components');
    const isInCommonComponents = filePath.includes('components/common');
    const isInPages = filePath.includes('pages');
    let importPath = '../components/utils/CloudflareI18n';
    
    if (isInCommonComponents) {
        importPath = '../utils/CloudflareI18n';
    } else if (isInComponents) {
        importPath = './utils/CloudflareI18n';
    }
    
    // Remplacer les imports next-i18next
    const replacements = [
        {
            from: /import\s*{\s*useTranslation\s*}\s*from\s*['"]next-i18next['"];?/g,
            to: `import { useTranslation } from '${importPath}';`
        },
        {
            from: /import\s*{\s*Trans,\s*useTranslation\s*}\s*from\s*['"]next-i18next['"];?/g,
            to: `import { Trans, useTranslation } from '${importPath}';`
        },
        {
            from: /import\s*{\s*useTranslation,\s*Trans\s*}\s*from\s*['"]next-i18next['"];?/g,
            to: `import { useTranslation, Trans } from '${importPath}';`
        },
        {
            from: /import\s*{\s*Trans\s*}\s*from\s*['"]next-i18next['"];?/g,
            to: `import { Trans } from '${importPath}';`
        },
        {
            from: /import\s*{\s*serverSideTranslations\s*}\s*from\s*['"]next-i18next\/serverSideTranslations['"];?/g,
            to: `import { getServerSideTranslations as serverSideTranslations } from '${importPath}';`
        },
        {
            from: /import\s*{\s*appWithTranslation\s*}\s*from\s*['"]next-i18next['"];?/g,
            to: "// Removed appWithTranslation import for Cloudflare compatibility"
        }
    ];
    
    replacements.forEach(replacement => {
        const newContent = content.replace(replacement.from, replacement.to);
        if (newContent !== content) {
            content = newContent;
            modified = true;
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Modified: ${filePath}`);
    }
}

// Trouver tous les fichiers TypeScript/JavaScript
const files = glob.sync('{pages,components}/**/*.{ts,tsx,js,jsx}', { 
    cwd: process.cwd(),
    absolute: true 
});

console.log('Replacing next-i18next imports...');
files.forEach(replaceImports);
console.log('Done!');