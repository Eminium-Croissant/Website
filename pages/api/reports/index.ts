import type { NextApiRequest, NextApiResponse } from 'next';

type ReportResponse = {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReportResponse>) {
  const apiBaseUrl = resolveApiBaseUrl(req);

  if (req.method === 'POST') {
    // Submit a new report
    const { reported_user_id, reason } = req.body;

    if (!reported_user_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'reported_user_id and reason are required',
      });
    }

    try {
      const upstreamRes = await fetch(`${apiBaseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': getRealIP(req),
          'x-real-ip': getRealIP(req),
          'Cookie': req.headers.cookie || '',
        },
        body: JSON.stringify({ reported_user_id, reason }),
      });

      const data = await upstreamRes.json() as ReportResponse;

      if (upstreamRes.ok) {
        return res.status(200).json(data);
      } else {
        return res.status(upstreamRes.status).json(data);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit report',
      });
    }
  } else if (req.method === 'GET') {
    // List reports (admin only)
    try {
      const upstreamRes = await fetch(`${apiBaseUrl}/reports`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': getRealIP(req),
          'x-real-ip': getRealIP(req),
          'Cookie': req.headers.cookie || '',
        },
      });

      const data = await upstreamRes.json() as ReportResponse;

      if (upstreamRes.ok) {
        return res.status(200).json(data);
      } else {
        return res.status(upstreamRes.status).json(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reports',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }
}
