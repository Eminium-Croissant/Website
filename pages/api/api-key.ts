import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const token = req.cookies['token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  else res.status(200).json({ apiKey: token });
}
