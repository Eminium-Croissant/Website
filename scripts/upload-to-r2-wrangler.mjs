#!/usr/bin/env node
/**
 * Script alternatif d'upload vers R2 utilisant Wrangler CLI
 * À utiliser si le script AWS SDK rencontre des problèmes SSL
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'croissant-uploads';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Obtient tous les fichiers d'un répertoire de manière récursive
 */
async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

/**
 * Exécute une commande et retourne une Promise
 */
function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { 
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      ...options 
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Upload un fichier avec Wrangler CLI
 */
async function uploadFileWithWrangler(filePath, key, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading via Wrangler: ${key}${attempt > 1 ? ` (attempt ${attempt}/${maxRetries})` : ''}`);
      
      // Utilise wrangler r2 object put
      const args = [
        'r2', 'object', 'put',
        `${BUCKET_NAME}/${key}`,
        '--file', filePath
      ];
      
      await execCommand('npx wrangler', args);
      console.log(`✅ Uploaded: ${key}${attempt > 1 ? ` (succeeded on attempt ${attempt})` : ''}`);
      return { success: true, key, filePath };
      
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      
      if (!isLastAttempt) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`⚠️ Attempt ${attempt} failed for ${key}: ${error.message}`);
        console.log(`🔄 Retrying in ${delayMs/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      console.error(`❌ Failed to upload ${key} after ${attempt} attempts:`, error.message);
      throw error;
    }
  }
}

/**
 * Upload plusieurs fichiers en parallèle
 */
async function uploadBatchParallel(fileBatch, concurrency = 5) {
  const results = [];
  
  // Traiter par chunks de concurrence
  for (let i = 0; i < fileBatch.length; i += concurrency) {
    const chunk = fileBatch.slice(i, i + concurrency);
    console.log(`\n📦 Processing batch ${Math.floor(i/concurrency) + 1}/${Math.ceil(fileBatch.length/concurrency)} (${chunk.length} files in parallel)`);
    
    // Lancer tous les uploads du chunk en parallèle
    const promises = chunk.map(async ({ filePath, key }) => {
      try {
        const result = await uploadFileWithWrangler(filePath, key);
        return result;
      } catch (error) {
        return { success: false, key, filePath, error: error.message };
      }
    });
    
    // Attendre que tous les uploads du chunk se terminent
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
    
    // Petit délai entre les chunks pour éviter la surcharge
    if (i + concurrency < fileBatch.length) {
      console.log('⏳ Waiting 1s before next chunk...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Starting upload to Cloudflare R2 via Wrangler CLI...');
    console.log(`📁 Source directory: ${UPLOADS_DIR}`);
    console.log(`🪣 Target bucket: ${BUCKET_NAME}`);
    
    // Vérifier que wrangler est installé
    try {
      await execCommand('npx wrangler', ['--version']);
    } catch (error) {
      throw new Error('Wrangler CLI not found. Install it with: npm install wrangler');
    }

    // Vérifier que le répertoire uploads existe
    try {
      await fs.access(UPLOADS_DIR);
    } catch (error) {
      throw new Error(`Uploads directory not found: ${UPLOADS_DIR}`);
    }

    // Obtenir tous les fichiers
    const files = await getAllFiles(UPLOADS_DIR);
    console.log(`📊 Found ${files.length} files to upload`);

    let uploadedCount = 0;
    let failedCount = 0;
    const failedFiles = [];

    // Préparer les fichiers avec leurs clés
    const filesToUpload = files.map(filePath => {
      const relativePath = path.relative(UPLOADS_DIR, filePath);
      const key = relativePath.replace(/\\/g, '/');
      return { filePath, key };
    });

    // Upload en parallèle avec concurrence limitée
    console.log('🚀 Starting parallel upload...');
    const results = await uploadBatchParallel(filesToUpload, 5); // 5 fichiers en parallèle

    // Analyser les résultats
    results.forEach(result => {
      if (result.success) {
        uploadedCount++;
      } else {
        failedCount++;
        failedFiles.push({ path: result.filePath, error: result.error });
      }
    });

    console.log('\n📈 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${uploadedCount} files`);
    console.log(`❌ Failed uploads: ${failedCount} files`);
    
    if (failedFiles.length > 0) {
      console.log('\n📋 Failed files:');
      failedFiles.forEach(({ path, error }) => {
        console.log(`   • ${path}: ${error}`);
      });
    }
    
    if (failedCount === 0) {
      console.log('🎉 All files uploaded successfully!');
    } else {
      console.log('⚠️  Some files failed to upload. You can run the script again to retry failed uploads.');
    }

  } catch (error) {
    console.error('💥 Upload failed:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (process.argv[1] === __filename || process.argv[1].endsWith('upload-to-r2-wrangler.mjs')) {
  main().catch(console.error);
}

export { getAllFiles, uploadFileWithWrangler };

