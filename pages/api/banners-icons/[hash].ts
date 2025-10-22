import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  if (typeof hash !== 'string') {
    res.status(400).end('Invalid hash');
    return;
  }

  console.log(`[Banners API] Looking for banner: ${hash}`);

  // Extensions possibles par ordre de préférence
  const extensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg'];
  
  // D'abord, essayer le CDN R2 public
  const cdnBaseUrl = process.env.R2_PUBLIC_URL || 'https://cdn.croissant-api.fr';
  
  for (const ext of extensions) {
    const cdnUrl = `${cdnBaseUrl}/bannersIcons/${hash}${ext}`;
    console.log(`[Banners API] Trying CDN URL: ${cdnUrl}`);
    
    try {
      const response = await fetch(cdnUrl);
      if (response.ok) {
        console.log(`[Banners API] Found on CDN: ${cdnUrl}`);
        
        // Copier les headers de la réponse CDN
        res.setHeader('Content-Type', response.headers.get('content-type') || getContentTypeFromExtension(ext));
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Image-Source', 'cdn-r2'); // Source de l'image
        
        if (response.headers.get('etag')) {
          res.setHeader('ETag', response.headers.get('etag')!);
        }
        
        if (response.headers.get('content-length')) {
          res.setHeader('Content-Length', response.headers.get('content-length')!);
        }
        
        // Stream la réponse
        const reader = response.body?.getReader();
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(Buffer.from(value));
            }
            res.end();
            return;
          } finally {
            reader.releaseLock();
          }
        }
      }
    } catch (error) {
      console.log(`[Banners API] CDN fetch failed for ${cdnUrl}:`, error);
      // Continue vers l'extension suivante
    }
  }

  console.log(`[Banners API] Not found on CDN, trying local fallback`);

  // Fallback: recherche locale - utiliser le dossier uploads global si pas dans un environnement worker
  const bannersDir = path.join(process.cwd(), 'uploads', 'bannersIcons');
  
  for (const ext of extensions) {
    const localPath = path.join(bannersDir, `${hash}${ext}`);
    if (fs.existsSync(localPath)) {
      console.log(`[Banners API] Found local file: ${localPath}`);
      res.setHeader('Content-Type', getContentTypeFromExtension(ext));
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Image-Source', 'local-file'); // Source de l'image
      fs.createReadStream(localPath).pipe(res);
      return;
    }
  }

  console.log(`[Banners API] Banner not found anywhere, using default banner`);

  // Fallback final: bannière par défaut
  const fallbackPath = path.join(process.cwd(), 'public/assets/Generic-Banner-03-blue-Game.avif');
  if (fs.existsSync(fallbackPath)) {
    console.log(`[Banners API] Serving default banner: ${fallbackPath}`);
    res.setHeader('Content-Type', 'image/avif');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Image-Source', 'default-fallback'); // Source de l'image
    fs.createReadStream(fallbackPath).pipe(res);
  } else {
    // Si même la bannière par défaut n'existe pas, rediriger vers un placeholder
    console.log(`[Banners API] Default banner not found, redirecting to placeholder`);
    res.setHeader('X-Image-Source', 'redirect-fallback');
    res.redirect('/assets/Generic-Banner-03-blue-Game.avif');
  }
}

function getContentTypeFromExtension(ext: string): string {
  const types: Record<string, string> = {
    '.avif': 'image/avif',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  return types[ext.toLowerCase()] || 'image/avif';
}
