import type { NextApiRequest, NextApiResponse } from 'next';

type VoteResponse = {
  success: boolean;
  message: string;
  report?: any;
};

function getRealIP(req: NextApiRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const raw = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const firstIp = raw.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp;
  }

  const connection = (req as any).connection;
  if (connection?.remoteAddress) {
    return connection.remoteAddress;
  }

  return 'unknown';
}

function resolveApiBaseUrl(req: NextApiRequest): string {
  const configuredBaseUrl = process.env.API_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3456';
  }

  const host = (req.headers.host || '').toLowerCase();
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')) {
    return 'http://localhost:3456';
  }

  return 'https://croissant-api.eminium.ovh/api';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<VoteResponse>) {
  const { id } = req.query;
  const apiBaseUrl = resolveApiBaseUrl(req);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }

  const { vote } = req.body; // 'ban' or 'keep'

  if (!vote || (vote !== 'ban' && vote !== 'keep')) {
    return res.status(400).json({
      success: false,
      message: 'vote must be either "ban" or "keep"',
    });
  }

  try {
    const upstreamRes = await fetch(`${apiBaseUrl}/reports/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': getRealIP(req),
        'x-real-ip': getRealIP(req),
        'Cookie': req.headers.cookie || '',
      },
      body: JSON.stringify({ vote }),
    });

    const data = await upstreamRes.json() as VoteResponse;

    if (upstreamRes.ok) {
      return res.status(200).json(data);
    } else {
      return res.status(upstreamRes.status).json(data);
    }
  } catch (error) {
    console.error('Error voting on report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to vote on report',
    });
  }
}
