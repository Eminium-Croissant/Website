import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // Permet de forwarder les bodies bruts (utile pour fichiers, etc.)
  },
};

function filterHeaders(headers: Record<string, any>) {
  // Supprime les headers qui posent problème
  const excluded = ['host', 'connection', 'content-length', 'accept-encoding'];
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!excluded.includes(key.toLowerCase())) {
      result[key] = value;
    }
  }
  return result;
}

function getRealIP(req: NextApiRequest): string {
  const headers = req.headers;

  // Apache avec mod_remoteip peut modifier REMOTE_ADDR
  // Essayons d'abord les headers standards
  const forwardedFor = headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor).split(',').map(ip => ip.trim());

    // Prendre la première IP non-locale
    for (const ip of ips) {
      if (ip && !isLocalIP(ip)) {
        console.log('Using x-forwarded-for IP:', ip);
        return ip;
      }
    }
  }

  // Autres headers
  const realIp = headers['x-real-ip'];
  if (realIp && !isLocalIP(realIp as string)) {
    console.log('Using x-real-ip:', realIp);
    return realIp as string;
  }

  // Si tout le reste échoue, on peut essayer de récupérer l'IP depuis connection info
  const connection = (req as any).connection;
  if (connection && connection.remoteAddress && !isLocalIP(connection.remoteAddress)) {
    console.log('Using connection.remoteAddress:', connection.remoteAddress);
    return connection.remoteAddress;
  }

  return 'unknown';
}

function isLocalIP(ip: string): boolean {
  const localPatterns = [
    /^127\./, // 127.x.x.x
    /^10\./, // 10.x.x.x
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.x.x - 172.31.x.x
    /^192\.168\./, // 192.168.x.x
    /^::1$/, // IPv6 loopback
    /^::ffff:127\./, // IPv6-mapped IPv4 loopback
    /^fc00:/, // IPv6 unique local
    /^fe80:/, // IPv6 link-local
  ];

  return localPatterns.some(pattern => pattern.test(ip));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug = [], ...query } = req.query;

  // Détection du host pour choisir l'API cible
  const host = req.headers.host || '';
  let apiBaseUrl: string;
  if (host.includes('croissant-api.fr')) {
    apiBaseUrl = 'http://localhost:3456';
  } else {
    apiBaseUrl = 'https://croissant-api.fr/api';
  }
  // apiBaseUrl = "https://api.croissant-api.fr";

  let url = `${apiBaseUrl}/${Array.isArray(slug) ? slug.join('/') : slug}`;

  // Ajoute les query params à l'URL
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
    } else {
      searchParams.append(key, value as string);
    }
  }
  if ([...searchParams].length > 0) {
    url += `?${searchParams.toString()}`;
  }

  // Prépare les headers
  const headers = {
    ...filterHeaders(req.headers as Record<string, any>),
    'x-forwarded-for': getRealIP(req),
    'x-real-ip': getRealIP(req),
  };

  // Utilise le flux brut de la requête comme body si ce n'est pas GET/HEAD
  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    // @ts-ignore
    body: !['GET', 'HEAD'].includes(req.method || '') ? req : undefined,
    duplex: !['GET', 'HEAD'].includes(req.method || '') ? 'half' : undefined, // Important pour Node.js 18+ et fetch streaming
  };

  // Forward la requête
  const apiRes = await fetch(url, fetchOptions);

  // Forward le status et les headers
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => {
    if (
      ![
        'transfer-encoding',
        'connection',
        'content-encoding', // <-- Ajouté ici
      ].includes(key.toLowerCase())
    ) {
      res.setHeader(key, value);
    }
  });

  // Stream la réponse directement
  if (apiRes.body) {
    // Convertit le WHATWG ReadableStream en Node.js Readable
    const nodeStream = require('stream').Readable.fromWeb(apiRes.body);
    nodeStream.pipe(res);
  } else {
    res.end();
  }
}
