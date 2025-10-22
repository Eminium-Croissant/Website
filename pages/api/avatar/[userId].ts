import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (typeof userId !== 'string') {
    res.status(400).end('Invalid userId');
    return;
  }

  console.log(`[Avatar API] Looking for avatar: ${userId}`);

  // Extensions possibles par ordre de préférence
  const extensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg', '.gif'];
  
  // D'abord, essayer le CDN R2 public
  const cdnBaseUrl = process.env.R2_PUBLIC_URL || 'https://cdn.croissant-api.fr';
  
  for (const ext of extensions) {
    const cdnUrl = `${cdnBaseUrl}/avatars/${userId}${ext}`;
    console.log(`[Avatar API] Trying CDN URL: ${cdnUrl}`);
    
    try {
      const response = await fetch(cdnUrl);
      if (response.ok) {
        console.log(`[Avatar API] Found on CDN: ${cdnUrl}`);
        
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
      console.log(`[Avatar API] CDN fetch failed for ${cdnUrl}:`, error);
      // Continue vers l'extension suivante
    }
  }

  console.log(`[Avatar API] Not found on CDN, trying local fallback`);

  // Fallback: recherche locale - utiliser le dossier uploads global si pas dans un environnement worker
  const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
  
  for (const ext of extensions) {
    const localPath = path.join(avatarsDir, `${userId}${ext}`);
    if (fs.existsSync(localPath)) {
      console.log(`[Avatar API] Found local file: ${localPath}`);
      res.setHeader('Content-Type', getContentTypeFromExtension(ext));
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Image-Source', 'local-file'); // Source de l'image
      fs.createReadStream(localPath).pipe(res);
      return;
    }
  }

  console.log(`[Avatar API] Avatar not found anywhere, using default avatar`);

  // Fallback final: avatar par défaut
  const fallbackPath = path.join(process.cwd(), 'public/assets/default-avatar.avif');
  if (fs.existsSync(fallbackPath)) {
    console.log(`[Avatar API] Serving default avatar: ${fallbackPath}`);
    res.setHeader('Content-Type', 'image/avif');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Image-Source', 'default-fallback'); // Source de l'image
    fs.createReadStream(fallbackPath).pipe(res);
  } else {
    // Si même l'avatar par défaut n'existe pas, créer une image de base
    console.log(`[Avatar API] Default avatar not found, creating minimal fallback`);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Image-Source', 'text-fallback'); // Source de l'image
    res.redirect("/assets/default-avatar.avif");
  }
}

function getContentTypeFromExtension(ext: string): string {
  const types: Record<string, string> = {
    '.avif': 'image/avif',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
  };
  return types[ext.toLowerCase()] || 'image/avif';
}
