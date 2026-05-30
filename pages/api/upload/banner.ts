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

const bannersDir = path.join(process.cwd(), 'uploads/bannersIcons');
if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  // Récupérer l'environnement Cloudflare
  const env = getCloudflareEnv(req);

  const form = formidable({ uploadDir: bannersDir, keepExtensions: true });

  await new Promise<void>(resolve => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Upload error' });
        return resolve();
      }

      let file = files.banner;
      if (Array.isArray(file)) file = file[0];
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return resolve();
      }

      const tempPath = file.filepath || (file as any).path;
      if (!tempPath) {
        res.status(500).json({ error: 'File path missing' });
        return resolve();
      }

      const hash = crypto
        .createHash('sha256')
        .update(Date.now() + (file.originalFilename || ''))
        .digest('hex');

      try {
        const avifBuffer = await sharp(tempPath).avif({ quality: 80 }).toBuffer();

        try {
          fs.unlinkSync(tempPath);
        } catch (e) {}

        if (env?.UPLOADS_BUCKET) {
          const r2Key = `bannersIcons/${hash}.avif`;
          await uploadToR2(env.UPLOADS_BUCKET, r2Key, avifBuffer, 'image/avif', {
            'uploaded-at': new Date().toISOString(),
            'original-filename': file.originalFilename || 'unknown',
            type: 'banner',
          });
          console.log(`Banner uploaded to R2: ${r2Key}`);
        } else {
          const uploadsDir = path.join(process.cwd(), 'uploads', 'bannersIcons');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

          const destPath = path.join(uploadsDir, `${hash}.avif`);
          await fs.promises.writeFile(destPath, avifBuffer);
          console.log(`Banner uploaded locally: ${destPath}`);
        }

        res.json({ hash });
        return resolve();
      } catch (error) {
        console.error('Banner upload error:', error);
        res.status(500).json({ error: 'AVIF conversion or upload failed' });
        return resolve();
      }
    });
  });
}
