import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  if (typeof hash !== 'string') {
    res.status(400).end('Invalid hash');
    return;
  }

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
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300');
    fs.createReadStream(bannerPath).pipe(res);
  } else {
    const fallbackPath = path.join(process.cwd(), 'public/assets', 'Generic-Banner-03-blue-Game.avif');
    res.setHeader('Content-Type', 'image/png');
    // res.setHeader("Cache-Control", "public, max-age=300");
    fs.createReadStream(fallbackPath).pipe(res);
  }
}
