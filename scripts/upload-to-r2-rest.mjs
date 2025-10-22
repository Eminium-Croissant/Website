#!/usr/bin/env node
/**
 * Script alternatif d'upload vers R2 utilisant l'API REST de Cloudflare
 * À utiliser si le script AWS SDK rencontre des problèmes SSL
 */

import { config } from 'dotenv';
import { promises as fs, readFileSync } from 'fs';
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
 * Obtient le Content-Type basé sur l'extension du fichier
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.avif': 'image/avif',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.txt': 'text/plain',
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Upload un fichier via l'API REST Cloudflare R2
 */
async function uploadFileViaRest(filePath, key) {
  const fileContent = readFileSync(filePath);
  const contentType = getContentType(filePath);
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${key}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': contentType,
    },
    body: fileContent,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/**
 * Upload avec retry
 */
async function uploadFileWithRetry(filePath, key, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading via REST: ${key}${attempt > 1 ? ` (attempt ${attempt}/${maxRetries})` : ''}`);
      
      const result = await uploadFileViaRest(filePath, key);
      console.log(`✅ Uploaded: ${key}${attempt > 1 ? ` (succeeded on attempt ${attempt})` : ''}`);
      return result;
      
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
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Starting upload to Cloudflare R2 via REST API...');
    console.log(`📁 Source directory: ${UPLOADS_DIR}`);
    console.log(`🪣 Target bucket: ${BUCKET_NAME}`);
    
    // Vérifier les variables d'environnement requises
    const requiredEnvVars = [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_API_TOKEN'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
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

    // Uploader chaque fichier
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      try {
        const relativePath = path.relative(UPLOADS_DIR, filePath);
        const key = relativePath.replace(/\\/g, '/');

        await uploadFileWithRetry(filePath, key);
        uploadedCount++;
        
        // Petit délai entre les uploads
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        failedCount++;
        failedFiles.push({ path: filePath, error: error.message });
        console.error(`Failed to upload ${filePath}:`, error.message);
      }
    }

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
if (process.argv[1] === __filename || process.argv[1].endsWith('upload-to-r2-rest.mjs')) {
  main().catch(console.error);
}

export { getAllFiles, uploadFileWithRetry };
