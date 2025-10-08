import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  if (typeof hash !== 'string') {
    res.status(400).end('Invalid hash');
    return;
  }

  const iconsDir = path.join(process.cwd(), 'uploads/gameIcons');
  const exts = ['.avif', '.png', '.jpg', '.jpeg', '.webp'];
  let iconPath: string | undefined;
  for (const ext of exts) {
    const candidate = path.join(iconsDir, `${hash}${ext}`);
    if (fs.existsSync(candidate)) {
      iconPath = candidate;
      break;
    }
  }

  if (iconPath && fs.existsSync(iconPath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300');
    fs.createReadStream(iconPath).pipe(res);
  } else {
    const fallbackPath = path.join(process.cwd(), 'public/assets', '8293566.avif');
    res.setHeader('Content-Type', 'image/png');
    // res.setHeader("Cache-Control", "public, max-age=300");
    fs.createReadStream(fallbackPath).pipe(res);
  }
}
