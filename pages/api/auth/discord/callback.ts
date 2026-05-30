import type { NextApiRequest, NextApiResponse } from 'next';

type LoginOAuthResponse = {
  token?: string;
  message?: string;
  error?: string;
};

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = process.env.API_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return process.env.NODE_ENV !== 'production' ? 'https://croissant-api.eminium.ovh/api' : 'https://croissant-api.eminium.ovh/api';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    // 1. Envoie le code au backend, il gère tout (échange + userinfo)
    const apiBase = resolveApiBaseUrl();
    const loginRes = await fetch(`${apiBase}/users/login-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'discord',
        code: code as string,
        // plus besoin d'envoyer accessToken ici
      }),
    });
    const loginData = (await loginRes.json()) as LoginOAuthResponse;
    if (!loginRes.ok || !loginData.token) {
      const errorMsg = loginData.message || loginData.error || 'OAuth login failed';
      console.error('[Discord OAuth] Backend error:', {
        status: loginRes.status,
        message: errorMsg,
        apiBase,
      });
      return res.status(loginRes.status || 401).send(process.env.NODE_ENV === 'development' ? `[DEV] Discord OAuth failed: ${errorMsg}. Backend: ${apiBase}` : 'Authentication failed. Please try again.');
    }
    // 3. Place le token backend en cookie et redirige
    res.setHeader('Set-Cookie', `token=${loginData.token}; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`);
    res.redirect('/');
  } catch (error) {
    console.error('[Discord OAuth] Error during fetch to backend:', error);
    const isDev = process.env.NODE_ENV === 'development';
    const err: any = error;
    const isConnRefused = err && ((err.cause && err.cause.code === 'ECONNREFUSED') || err.code === 'ECONNREFUSED');
    const status = isConnRefused ? 502 : 500;
    const baseMsg = isConnRefused ? `Connection refused when contacting backend. Verify API_BASE_URL and that the backend is running and reachable from this runtime.` : (err && err.message) || String(err);

    return res.status(status).send(isDev ? `[DEV] Discord OAuth error: ${baseMsg}` : 'An error occurred during authentication.');
  }
}
