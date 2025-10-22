import formidable from 'formidable';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import sharp from 'sharp';
import { uploadToR2 } from '../../../utils/r2-utils';

export const config = {
  api: { bodyParser: false },
};

// Fonction pour récupérer l'environnement Cloudflare
function getCloudflareEnv(req: NextApiRequest): CloudflareEnv | undefined {
  // @ts-ignore - L'environnement Cloudflare est injecté automatiquement
  return (req as any).env;
}

const avatarsDir = path.join(process.cwd(), 'uploads/avatars');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const cookies = req.headers.cookie || '';
  const authHeader = cookies;

  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  // Ici, tu dois vérifier l'utilisateur via ton API si besoin
  const user = await fetch('http://localhost:3456/users/@me', {
    method: 'GET',
    headers: {
      cookie: cookies,
      'Content-Type': 'application/json',
    },
  });
  if (!user.ok) return res.status(401).json({ error: 'Unauthorized' });
  const userData = await user.json() as { id: string };

  // Récupérer l'environnement Cloudflare
  const env = getCloudflareEnv(req);
  
  const form = formidable({ uploadDir: avatarsDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    let file = files.avatar;
    if (Array.isArray(file)) file = file[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Use 'filepath' for formidable v3+, fallback to 'path' for older versions
    const tempPath = file.filepath || file.path;
    if (!tempPath) return res.status(500).json({ error: 'File path missing' });

    const userId = userData.id || 'unknown';
    console.log(`Uploading avatar for user:`, userData);
    
    try {
      // Convertir l'image en AVIF
      const avifBuffer = await sharp(tempPath).avif({ quality: 80 }).toBuffer();
      
      // Nettoyer le fichier temporaire
      fs.unlinkSync(tempPath);
      
      // Si R2 est disponible, uploader vers R2
      if (env?.UPLOADS_BUCKET) {
        const r2Key = `avatars/${userId}.avif`;
        await uploadToR2(
          env.UPLOADS_BUCKET,
          r2Key,
          avifBuffer,
          'image/avif',
          {
            'uploaded-at': new Date().toISOString(),
            'user-id': userId,
          }
        );
        console.log(`Avatar uploaded to R2: ${r2Key}`);
      } else {
        // Fallback: sauvegarder localement si R2 n'est pas disponible
        // Utiliser le dossier uploads global si pas dans un environnement worker
        const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        
        const destPath = path.join(uploadsDir, `${userId}.avif`);
        await fs.promises.writeFile(destPath, avifBuffer);
        console.log(`Avatar uploaded locally: ${destPath}`);
      }
      
      res.json({ message: 'Avatar uploaded successfully', userId });
    } catch (error) {
      console.error('Avatar upload error:', error);
      return res.status(500).json({ error: 'AVIF conversion or upload failed' });
    }
  });
}
