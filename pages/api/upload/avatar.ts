import formidable from 'formidable';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import sharp from 'sharp';

export const config = {
  api: { bodyParser: false },
};

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
  const userData = await user.json();

  const form = formidable({ uploadDir: avatarsDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    let file = files.avatar;
    if (Array.isArray(file)) file = file[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Use 'filepath' for formidable v3+, fallback to 'path' for older versions
    const tempPath = file.filepath || file.path;
    if (!tempPath) return res.status(500).json({ error: 'File path missing' });

    const userId = (userData.id as string) || 'unknown';
    console.log(`Uploading avatar for user:`, userData);
    const destPath = path.join(avatarsDir, `${userId}.avif`);
    try {
      await sharp(tempPath).avif({ quality: 80 }).toFile(destPath);
      fs.unlinkSync(tempPath);
    } catch (err) {
      return res.status(500).json({ error: 'AVIF conversion failed' });
    }
    res.json({ message: 'Avatar uploaded successfully', userId });
  });
}
