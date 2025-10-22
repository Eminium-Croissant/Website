import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadToR2 } from '../../../utils/r2-utils';

export const config = {
  api: { bodyParser: false },
};

// Fonction pour récupérer l'environnement Cloudflare
function getCloudflareEnv(req: NextApiRequest): CloudflareEnv | undefined {
  // @ts-ignore - L'environnement Cloudflare est injecté automatiquement
  return (req as any).env;
}

// Fonction pour parser les données multipart manuellement
async function parseMultipartData(request: NextApiRequest): Promise<{ file?: ArrayBuffer; filename?: string; userId?: string }> {
  const contentType = request.headers['content-type'] || '';
  
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data');
  }

  // Récupérer le boundary
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    throw new Error('Boundary not found in Content-Type');
  }

  // Dans un vrai environnement Cloudflare Workers, vous utiliseriez request.body
  // Pour NextJS, nous devons traiter différemment
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    request.on('data', (chunk) => {
      chunks.push(chunk);
    });

    request.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const data = buffer.toString();
      
      // Parser simple pour extraire les données
      // Dans un environnement de production, utilisez une bibliothèque plus robuste
      const parts = data.split(`--${boundary}`);
      
      let file: ArrayBuffer | undefined;
      let filename: string | undefined;
      
      for (const part of parts) {
        if (part.includes('Content-Disposition: form-data; name="avatar"')) {
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const fileData = part.substring(headerEnd + 4);
            const endBoundary = fileData.indexOf('\r\n--');
            if (endBoundary !== -1) {
              const fileBuffer = Buffer.from(fileData.substring(0, endBoundary), 'binary');
              file = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
            }
          }
          
          const filenameMatch = part.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
      }
      
      resolve({ file, filename });
    });

    request.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const cookies = req.headers.cookie || '';
    
    if (!cookies) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Verify user authentication
    let user: { id: string };
    try {
      const userResponse = await fetch('http://localhost:3456/users/@me', {
        method: 'GET',
        headers: {
          cookie: cookies,
          'Content-Type': 'application/json',
        },
      });
      
      if (!userResponse.ok) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      user = await userResponse.json() as { id: string };
    } catch (error) {
      console.error('User authentication error:', error);
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }

    // Récupérer l'environnement Cloudflare
    const env = getCloudflareEnv(req);
    
    if (!env?.UPLOADS_BUCKET) {
      return res.status(500).json({ 
        error: 'R2 storage not configured',
        message: 'UPLOADS_BUCKET binding is required'
      });
    }

    try {
      // Parser les données multipart
      const { file, filename } = await parseMultipartData(req);
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = user.id || 'unknown';
      const r2Key = `avatars/${userId}.avif`;

      // Note: Dans un vrai environnement Cloudflare Workers, 
      // vous utiliseriez Cloudflare Images pour redimensionner automatiquement
      // ou WebAssembly pour le traitement d'image
      
      // Pour l'instant, nous stockons le fichier tel quel
      // En production, ajoutez la conversion d'image ici
      
      await uploadToR2(
        env.UPLOADS_BUCKET,
        r2Key,
        file,
        'image/avif', // Assumons que c'est déjà converti
        {
          'uploaded-at': new Date().toISOString(),
          'user-id': userId,
          'original-filename': filename || 'avatar',
          'source': 'cloudflare-worker',
        }
      );

      console.log(`Avatar uploaded to R2 via Cloudflare Worker: ${r2Key}`);
      
      return res.json({ 
        message: 'Avatar uploaded successfully to R2',
        userId,
        key: r2Key
      });
      
    } catch (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload avatar to R2' });
    }
    
  } catch (error) {
    console.error('Avatar upload handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}