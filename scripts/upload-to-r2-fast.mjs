#!/usr/bin/env node
/**
 * Script d'upload R2 ultra-rapide avec parallélisme maximal
 * Utilise Promise.allSettled pour uploader le maximum de fichiers en parallèle
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { promises as fs, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const endpoint = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Configuration optimisée pour le parallélisme
const R2_CONFIG = {
  endpoint,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  requestHandler: {
    connectionTimeout: 15000,
    socketTimeout: 15000,
  },
  maxAttempts: 2, // Moins de retry pour aller plus vite
  retryDelayOptions: {
    base: 500,
  }
};

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'croissant-uploads';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Pool de clients S3 pour le parallélisme
const CLIENT_POOL_SIZE = 10;
const s3Clients = Array.from({ length: CLIENT_POOL_SIZE }, () => new S3Client(R2_CONFIG));

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
 * Upload un fichier (version rapide sans retry)
 */
async function uploadFileFast(filePath, key, clientIndex = 0) {
  const fileContent = readFileSync(filePath);
  const contentType = getContentType(filePath);
  
  const client = s3Clients[clientIndex % CLIENT_POOL_SIZE];
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    Metadata: {
      'uploaded-at': new Date().toISOString(),
    },
  });

  await client.send(command);
  return { success: true, key, filePath };
}

/**
 * Upload tous les fichiers en parallèle maximal
 */
async function uploadAllParallel(files, maxConcurrency = 50) {
  console.log(`🚀 Starting ultra-fast upload with ${maxConcurrency} concurrent uploads...`);
  
  // Préparer tous les uploads
  const uploadTasks = files.map((filePath, index) => {
    const relativePath = path.relative(UPLOADS_DIR, filePath);
    const key = relativePath.replace(/\\/g, '/');
    
    return async () => {
      try {
        console.log(`📤 [${index + 1}/${files.length}] ${key}`);
        const result = await uploadFileFast(filePath, key, index);
        console.log(`✅ [${index + 1}/${files.length}] ${key}`);
        return result;
      } catch (error) {
        console.log(`❌ [${index + 1}/${files.length}] ${key}: ${error.message}`);
        return { success: false, key, filePath, error: error.message };
      }
    };
  });

  // Traiter par chunks pour éviter de dépasser les limites système
  const results = [];
  for (let i = 0; i < uploadTasks.length; i += maxConcurrency) {
    const chunk = uploadTasks.slice(i, i + maxConcurrency);
    console.log(`\n📦 Processing chunk ${Math.floor(i/maxConcurrency) + 1}/${Math.ceil(uploadTasks.length/maxConcurrency)} (${chunk.length} files)`);
    
    // Exécuter tous les uploads du chunk en parallèle
    const chunkPromises = chunk.map(task => task());
    const chunkResults = await Promise.allSettled(chunkPromises);
    
    // Extraire les valeurs des résultats
    const processedResults = chunkResults.map(result => 
      result.status === 'fulfilled' ? result.value : { success: false, error: result.reason.message }
    );
    
    results.push(...processedResults);
    
    // Petit délai entre les chunks pour être gentil avec le serveur
    if (i + maxConcurrency < uploadTasks.length) {
      console.log('⏳ Cooling down 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Starting ULTRA-FAST upload to Cloudflare R2...');
    console.log(`📁 Source directory: ${UPLOADS_DIR}`);
    console.log(`🪣 Target bucket: ${BUCKET_NAME}`);
    console.log(`⚡ Using ${CLIENT_POOL_SIZE} S3 clients for maximum speed`);
    
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

    const startTime = Date.now();

    // Upload ultra-rapide
    const results = await uploadAllParallel(files, 30); // 30 uploads simultanés

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Analyser les résultats
    const uploadedCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    const failedFiles = results.filter(r => !r.success);

    console.log('\n📈 Ultra-Fast Upload Summary:');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log(`⚡ Average speed: ${(files.length / duration).toFixed(2)} files/second`);
    console.log(`✅ Successfully uploaded: ${uploadedCount} files`);
    console.log(`❌ Failed uploads: ${failedCount} files`);
    
    if (failedFiles.length > 0) {
      console.log('\n📋 Failed files:');
      failedFiles.forEach(({ filePath, error }) => {
        console.log(`   • ${filePath}: ${error}`);
      });
      console.log('\n💡 Tip: Run the robust script to retry failed files with more retries');
    }
    
    if (failedCount === 0) {
      console.log('🎉 All files uploaded successfully at lightning speed!');
    } else {
      console.log(`⚠️  ${failedCount} files failed. Consider running the robust script for failed uploads.`);
    }

  } catch (error) {
    console.error('💥 Ultra-fast upload failed:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (process.argv[1] === __filename || process.argv[1].endsWith('upload-to-r2-fast.mjs')) {
  main().catch(console.error);
}

export { getAllFiles, uploadAllParallel };
