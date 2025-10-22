import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCloudflareError } from '../../../components/utils/CloudflareUtils';

export const config = {
  api: { bodyParser: false },
};

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
    let user;
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
      
      user = await userResponse.json();
    } catch (error) {
      handleCloudflareError(error, 'user authentication');
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }

    // In Cloudflare Workers, file uploads need to be handled differently
    // We can't use formidable or write to the filesystem
    
    // For now, return a placeholder response
    // In a real implementation, you would:
    // 1. Parse the multipart form data manually or use a Cloudflare-compatible library
    // 2. Store the file in Cloudflare R2 instead of local filesystem
    // 3. Use Cloudflare Images for resizing instead of Sharp
    
    console.warn('[Avatar Upload] File upload not yet implemented for Cloudflare Workers');
    
    return res.status(501).json({ 
      error: 'File upload not implemented for Cloudflare Workers environment',
      message: 'This feature requires R2 storage configuration'
    });
    
  } catch (error) {
    handleCloudflareError(error, 'avatar upload handler');
    return res.status(500).json({ error: 'Internal server error' });
  }
}