import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCloudflareError } from '../../../components/utils/CloudflareUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hash } = req.query;
    if (typeof hash !== 'string') {
      res.status(400).end('Invalid hash');
      return;
    }

    // In Cloudflare Workers, icons should be served from R2 storage or static assets
    console.warn(`[Item Icons] Icon ${hash} not available in Cloudflare Workers environment`);
    
    res.status(404).json({ 
      error: 'Icon not found',
      message: 'Icons not available in Cloudflare Workers without R2 storage'
    });
    
  } catch (error) {
    handleCloudflareError(error, 'item icons handler');
    res.status(500).json({ error: 'Internal server error' });
  }
}
