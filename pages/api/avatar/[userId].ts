import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (typeof userId !== 'string') {
    res.status(400).end('Invalid userId');
    return;
  }

  // Chemin absolu vers le dossier avatars (à adapter selon ton arborescence)
  const avatarsDir = path.join(process.cwd(), 'uploads/avatars');
  // Recherche automatique de l'extension du fichier avatar
  const exts = ['.avif', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
  let avatarPath: string | undefined;
  for (const ext of exts) {
    const candidate = path.join(avatarsDir, `${userId}${ext}`);
    if (fs.existsSync(candidate)) {
      avatarPath = candidate;
      break;
    }
  }

  if (fs.existsSync(avatarPath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300');
    fs.createReadStream(avatarPath).pipe(res);
  } else {
    // Fallback: avatar par défaut
    const fallbackPath = path.join(process.cwd(), 'public/assets/default-avatar.avif');
    res.setHeader('Content-Type', 'image/png');
    // res.setHeader("Cache-Control", "public, max-age=300");
    fs.createReadStream(fallbackPath).pipe(res);
  }
}
