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
  const { userId } = req.query;
  if (typeof userId !== 'string') {
    res.status(400).end('Invalid userId');
    return;
  }

  // Récupérer l'environnement Cloudflare
  const env = getCloudflareEnv(req);
  
  // Essayer de récupérer depuis R2 d'abord
  if (env?.UPLOADS_BUCKET) {
    try {
      const result = await findFileWithExtensions(env.UPLOADS_BUCKET, `avatars/${userId}`);
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
      console.error('Error fetching avatar from R2:', error);
      // Continue vers le fallback local
    }
  }

  // Fallback: recherche locale si R2 n'est pas disponible ou échec
  const avatarsDir = path.join(process.cwd(), 'uploads/avatars');
  const exts = ['.avif', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
  let avatarPath: string | undefined;
  
  for (const ext of exts) {
    const candidate = path.join(avatarsDir, `${userId}${ext}`);
    if (fs.existsSync(candidate)) {
      avatarPath = candidate;
      break;
    }
  }

  if (avatarPath && fs.existsSync(avatarPath)) {
    res.setHeader('Content-Type', 'image/avif');
    res.setHeader('Cache-Control', 'public, max-age=300');
    fs.createReadStream(avatarPath).pipe(res);
  } else {
    // Fallback final: avatar par défaut
    const fallbackPath = path.join(process.cwd(), 'public/assets/default-avatar.avif');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Content-Type', 'image/avif');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache plus long pour l'avatar par défaut
      fs.createReadStream(fallbackPath).pipe(res);
    } else {
      res.status(404).end('Avatar not found');
    }
  }
}
