import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCloudflareError } from '../../../components/utils/CloudflareUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hash } = req.query;
    if (typeof hash !== 'string') {
      res.status(400).end('Invalid hash');
      return;
    }

    // In Cloudflare Workers, we can't access local filesystem
    // Icons should be served from R2 storage or static assets
    
    // For now, return a 404 or redirect to a default icon
    // In a real implementation, you would:
    // 1. Check R2 storage for the icon
    // 2. Return the icon from Cloudflare R2
    // 3. Set appropriate cache headers
    
    console.warn(`[Game Icons] Icon ${hash} not available in Cloudflare Workers environment`);
    
    // Return a placeholder or redirect to default icon
    res.status(404).json({ 
      error: 'Icon not found',
      message: 'Icons not available in Cloudflare Workers without R2 storage'
    });
    
  } catch (error) {
    handleCloudflareError(error, 'game icons handler');
    res.status(500).json({ error: 'Internal server error' });
  }
}
