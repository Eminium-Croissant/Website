#!/usr/bin/env node
/**
 * Script pour uploader le dossier uploads vers Cloudflare R2
 * Utilise l'API S3-compatible de Cloudflare R2
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { promises as fs, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';
config()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration R2 (utilise les variables d'environnement)
const R2_CONFIG = {
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  // Configuration pour améliorer la stabilité des connexions SSL
  requestHandler: {
    connectionTimeout: 30000, // 30 secondes
    socketTimeout: 30000,
  },
  maxAttempts: 3,
  retryDelayOptions: {
    customBackoff: function(retryCount) {
      return Math.pow(2, retryCount) * 1000; // Backoff exponentiel
    }
  }
};

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'croissant-uploads';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Initialize S3 client pour R2
const s3Client = new S3Client(R2_CONFIG);

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
 * Fonction utilitaire pour attendre un délai
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload un fichier vers R2 avec retry en cas d'erreur
 */
async function uploadFileWithRetry(filePath, key, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading: ${key}${attempt > 1 ? ` (attempt ${attempt}/${maxRetries})` : ''}`);
      
      const fileContent = readFileSync(filePath);
      const contentType = getContentType(filePath);
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        // Metadata optionnelle
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'original-path': filePath,
        },
      });

      const result = await s3Client.send(command);
      console.log(`✅ Uploaded: ${key}${attempt > 1 ? ` (succeeded on attempt ${attempt})` : ''}`);
      return result;
      
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryableError = 
        error.code === 'EPROTO' || 
        error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' ||
        error.message.includes('SSL') ||
        error.message.includes('handshake failure') ||
        error.message.includes('EPROTO');
      
      if (!isLastAttempt && isRetryableError) {
        const delayMs = Math.pow(2, attempt) * 1000; // Backoff exponentiel: 2s, 4s, 8s
        console.log(`⚠️ Attempt ${attempt} failed for ${key}: ${error.message}`);
        console.log(`🔄 Retrying in ${delayMs/1000}s...`);
        await sleep(delayMs);
        continue;
      }
      
      console.error(`❌ Failed to upload ${key} after ${attempt} attempts:`, error.message);
      throw error;
    }
  }
}

/**
 * Upload un fichier vers R2 (alias pour compatibilité)
 */
async function uploadFile(filePath, key) {
  return await uploadFileWithRetry(filePath, key);
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Starting upload to Cloudflare R2...');
    console.log(`📁 Source directory: ${UPLOADS_DIR}`);
    console.log(`🪣 Target bucket: ${BUCKET_NAME}`);
    
    // Vérifier que le répertoire uploads existe
    try {
      await fs.access(UPLOADS_DIR);
    } catch (error) {
      throw new Error(`Uploads directory not found: ${UPLOADS_DIR}`);
    }

    // Vérifier les variables d'environnement requises
    const requiredEnvVars = [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Obtenir tous les fichiers
    const files = await getAllFiles(UPLOADS_DIR);
    console.log(`📊 Found ${files.length} files to upload`);

    let uploadedCount = 0;
    let failedCount = 0;
    const failedFiles = [];

    // Uploader chaque fichier avec un délai entre les uploads pour éviter la surcharge
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      try {
        // Créer la clé relative depuis le dossier uploads
        const relativePath = path.relative(UPLOADS_DIR, filePath);
        const key = relativePath.replace(/\\/g, '/'); // Normaliser les séparateurs pour S3

        await uploadFile(filePath, key);
        uploadedCount++;
        
        // Petit délai entre les uploads pour éviter la surcharge du serveur
        if (i < files.length - 1) {
          await sleep(100); // 100ms de délai
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

    console.log('\n📈 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${uploadedCount} files`);
    console.log(`❌ Failed uploads: ${failedCount} files`);
    
    if (failedCount === 0) {
      console.log('🎉 All files uploaded successfully!');
    } else {
      console.log('⚠️  Some files failed to upload. Check the logs above.');
    }

  } catch (error) {
    console.error('💥 Upload failed:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (process.argv[1] === __filename || process.argv[1].endsWith('upload-to-r2.mjs')) {
  main().catch(console.error);
}

export { getAllFiles, uploadFile };

