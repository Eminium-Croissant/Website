#!/usr/bin/env node
/**
 * Script d'upload R2 avec configuration SSL optimisée pour Windows
 * Résout les problèmes SSL/TLS courants sous Windows
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { promises as fs, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

// Configuration SSL optimisée pour Windows
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Désactive temporairement la vérification SSL stricte
process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = '1';

const endpoint = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const R2_CONFIG = {
  endpoint,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  requestHandler: {
    httpsAgent: {
      maxSockets: 25,
      keepAlive: true,
      keepAliveMsecs: 1000,
      timeout: 30000,
      freeSocketTimeout: 30000,
    }
  },
  maxAttempts: 5,
  requestTimeout: 30000,
  retryDelayOptions: {
    base: 1000,
    customBackoff: function(retryCount) {
      return Math.min(Math.pow(2, retryCount) * 1000, 10000);
    }
  }
};

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'croissant-uploads';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

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
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload un fichier avec retry robuste
 */
async function uploadFileRobust(filePath, key, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading (robust): ${key}${attempt > 1 ? ` (attempt ${attempt}/${maxRetries})` : ''}`);
      
      const fileContent = readFileSync(filePath);
      const contentType = getContentType(filePath);
      
      // Créer un nouveau client S3 à chaque tentative si échec précédent
      const clientToUse = attempt === 1 ? s3Client : new S3Client(R2_CONFIG);
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'original-path': filePath,
        },
      });

      const result = await clientToUse.send(command);
      console.log(`✅ Uploaded: ${key}${attempt > 1 ? ` (succeeded on attempt ${attempt})` : ''}`);
      return result;
      
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryableError = 
        error.code === 'EPROTO' || 
        error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.message.includes('SSL') ||
        error.message.includes('TLS') ||
        error.message.includes('handshake') ||
        error.message.includes('EPROTO') ||
        error.message.includes('socket') ||
        error.name === 'CredentialsProviderError';
      
      if (!isLastAttempt && isRetryableError) {
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000; // Ajouter du jitter pour éviter la collision
        const delayMs = baseDelay + jitter;
        
        console.log(`⚠️ Attempt ${attempt} failed for ${key}: ${error.message}`);
        console.log(`🔄 Retrying in ${Math.round(delayMs/1000)}s...`);
        await sleep(delayMs);
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
    console.log('🚀 Starting robust upload to Cloudflare R2...');
    console.log(`📁 Source directory: ${UPLOADS_DIR}`);
    console.log(`🪣 Target bucket: ${BUCKET_NAME}`);
    console.log(`🔧 Using SSL configuration optimized for Windows`);
    
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

    // Upload en parallèle avec concurrence contrôlée
    const CONCURRENCY = 3; // Concurrence réduite pour plus de stabilité
    const BATCH_SIZE = 10; // Taille des batches
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, Math.min(i + BATCH_SIZE, files.length));
      
      console.log(`\n📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(files.length/BATCH_SIZE)} (${batch.length} files)`);
      
      // Traiter le batch avec concurrence limitée
      for (let j = 0; j < batch.length; j += CONCURRENCY) {
        const chunk = batch.slice(j, j + CONCURRENCY);
        
        const uploadPromises = chunk.map(async (filePath) => {
          try {
            const relativePath = path.relative(UPLOADS_DIR, filePath);
            const key = relativePath.replace(/\\/g, '/');
            
            await uploadFileRobust(filePath, key);
            return { success: true, filePath };
          } catch (error) {
            return { success: false, filePath, error: error.message };
          }
        });
        
        // Attendre que tous les uploads du chunk se terminent
        const results = await Promise.all(uploadPromises);
        
        // Traiter les résultats
        results.forEach(result => {
          if (result.success) {
            uploadedCount++;
          } else {
            failedCount++;
            failedFiles.push({ path: result.filePath, error: result.error });
            console.error(`Failed to upload ${result.filePath}:`, result.error);
          }
        });
        
        // Petit délai entre les chunks
        if (j + CONCURRENCY < batch.length) {
          await sleep(500);
        }
      }
      
      // Délai plus long entre les batches
      if (i + BATCH_SIZE < files.length) {
        console.log('⏳ Waiting 3s before next batch...');
        await sleep(3000);
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
  } finally {
    // Rétablir les paramètres SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
}

// Exécuter le script
if (process.argv[1] === __filename || process.argv[1].endsWith('upload-to-r2-robust.mjs')) {
  main().catch(console.error);
}

export { getAllFiles, uploadFileRobust };

