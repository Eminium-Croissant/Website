import crypto from 'crypto';
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

const iconsDir = path.join(process.cwd(), 'uploads/gameIcons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  // Récupérer l'environnement Cloudflare
  const env = getCloudflareEnv(req);

  const form = formidable({ uploadDir: iconsDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    let file = files.icon;
    if (Array.isArray(file)) file = file[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const tempPath = file.filepath || file.path;
    if (!tempPath) return res.status(500).json({ error: 'File path missing' });

    const hash = crypto
      .createHash('sha256')
      .update(Date.now() + (file.originalFilename || ''))
      .digest('hex');

    try {
      // Convertir l'image en AVIF
      const avifBuffer = await sharp(tempPath).avif({ quality: 80 }).toBuffer();
      
      // Nettoyer le fichier temporaire
      fs.unlinkSync(tempPath);

      // Si R2 est disponible, uploader vers R2
      if (env?.UPLOADS_BUCKET) {
        const r2Key = `gameIcons/${hash}.avif`;
        await uploadToR2(
          env.UPLOADS_BUCKET,
          r2Key,
          avifBuffer,
          'image/avif',
          {
            'uploaded-at': new Date().toISOString(),
            'original-filename': file.originalFilename || 'unknown',
            'type': 'game-icon',
          }
        );
        console.log(`Game icon uploaded to R2: ${r2Key}`);
      } else {
        // Fallback: sauvegarder localement si R2 n'est pas disponible
        // Utiliser le dossier uploads global si pas dans un environnement worker
        const uploadsDir = path.join(process.cwd(), 'uploads', 'gameIcons');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        
        const destPath = path.join(uploadsDir, `${hash}.avif`);
        await fs.promises.writeFile(destPath, avifBuffer);
        console.log(`Game icon uploaded locally: ${destPath}`);
      }

      res.json({ hash });
    } catch (error) {
      console.error('Game icon upload error:', error);
      return res.status(500).json({ error: 'AVIF conversion or upload failed' });
    }
  });
}
