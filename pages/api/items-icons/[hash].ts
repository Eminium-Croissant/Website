import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hash } = req.query;
    if (typeof hash !== 'string') {
      res.status(400).end('Invalid hash');
      return;
    }

    console.log(`[Item Icons API] Looking for item icon: ${hash}`);

    // Extensions possibles par ordre de préférence
    const extensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg'];
    
    // D'abord, essayer le CDN R2 public
    const cdnBaseUrl = process.env.R2_PUBLIC_URL || 'https://cdn.croissant-api.fr';
    
    for (const ext of extensions) {
      const cdnUrl = `${cdnBaseUrl}/itemsIcons/${hash}${ext}`;
      console.log(`[Item Icons API] Trying CDN URL: ${cdnUrl}`);
      
      try {
        const response = await fetch(cdnUrl);
        if (response.ok) {
          console.log(`[Item Icons API] Found on CDN: ${cdnUrl}`);
          
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
        console.log(`[Item Icons API] CDN fetch failed for ${cdnUrl}:`, error);
        // Continue vers l'extension suivante
      }
    }

    console.log(`[Item Icons API] Not found on CDN, trying local fallback`);

    // Fallback: recherche locale
    const itemIconsDir = path.join(process.cwd(), 'uploads/itemsIcons');
    
    for (const ext of extensions) {
      const localPath = path.join(itemIconsDir, `${hash}${ext}`);
      if (fs.existsSync(localPath)) {
        console.log(`[Item Icons API] Found local file: ${localPath}`);
        res.setHeader('Content-Type', getContentTypeFromExtension(ext));
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Image-Source', 'local-file'); // Source de l'image
        fs.createReadStream(localPath).pipe(res);
        return;
      }
    }

    console.log(`[Item Icons API] Item icon not found anywhere, using default icon`);

    // Fallback final: icône par défaut
    const fallbackPath = path.join(process.cwd(), 'public/assets/System_Shop.webp');
    if (fs.existsSync(fallbackPath)) {
      console.log(`[Item Icons API] Serving default item icon: ${fallbackPath}`);
      res.setHeader('Content-Type', 'image/avif');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Image-Source', 'default-fallback'); // Source de l'image
      fs.createReadStream(fallbackPath).pipe(res);
    } else {
      // Si même l'icône par défaut n'existe pas, rediriger vers un placeholder
      console.log(`[Item Icons API] Default item icon not found, redirecting to placeholder`);
      res.setHeader('X-Image-Source', 'redirect-fallback');
      res.redirect('/assets/System_Shop.webp');
    }
    
  } catch (error) {
    console.error('[Item Icons API] Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
