import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export const config = {
  api: { bodyParser: false },
};

const iconsDir = path.join(process.cwd(), 'uploads/gameIcons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

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
    const destPath = path.join(iconsDir, `${hash}.avif`);
    try {
      await sharp(tempPath).avif({ quality: 80 }).toFile(destPath);
      fs.unlinkSync(tempPath);
    } catch (err) {
      return res.status(500).json({ error: 'AVIF conversion failed' });
    }
    res.json({ hash });
  });
}
