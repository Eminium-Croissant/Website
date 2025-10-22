import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { createImageResponse, findFileWithExtensions } from '../../../utils/r2-utils';

// Fonction pour récupérer l'environnement Cloudflare
function getCloudflareEnv(req: NextApiRequest): CloudflareEnv | undefined {
  // @ts-ignore - L'environnement Cloudflare est injecté automatiquement
  return (req as any).env;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  if (typeof hash !== 'string') {
    res.status(400).end('Invalid hash');
    return;
  }

  // Récupérer l'environnement Cloudflare
  const env = getCloudflareEnv(req);
  
  // Essayer de récupérer depuis R2 d'abord
  if (env?.UPLOADS_BUCKET) {
    try {
      const result = await findFileWithExtensions(env.UPLOADS_BUCKET, `bannersIcons/${hash}`);
      if (result) {
        // Convertir la réponse R2 en Response Next.js
        const response = createImageResponse(result.object);
        
        // Copier les headers vers la réponse Next.js
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        
        // Stream le contenu
        if (result.object.body) {
          const reader = result.object.body.getReader();
          
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
      console.error('Error fetching banner from R2:', error);
      // Continue vers le fallback local
    }
  }

  // Fallback: recherche locale si R2 n'est pas disponible ou échec
  const bannersDir = path.join(process.cwd(), 'uploads/bannersIcons');
  const exts = ['.avif', '.png', '.jpg', '.jpeg', '.webp'];
  let bannerPath: string | undefined;
  
  for (const ext of exts) {
    const candidate = path.join(bannersDir, `${hash}${ext}`);
    if (fs.existsSync(candidate)) {
      bannerPath = candidate;
      break;
    }
  }

  if (bannerPath && fs.existsSync(bannerPath)) {
    res.setHeader('Content-Type', 'image/avif');
    res.setHeader('Cache-Control', 'public, max-age=300');
    fs.createReadStream(bannerPath).pipe(res);
  } else {
    // Fallback final: bannière par défaut
    const fallbackPath = path.join(process.cwd(), 'public/assets', 'Generic-Banner-03-blue-Game.avif');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Content-Type', 'image/avif');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache plus long pour l'image par défaut
      fs.createReadStream(fallbackPath).pipe(res);
    } else {
      res.status(404).end('Banner not found');
    }
  }
}
