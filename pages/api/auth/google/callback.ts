import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    // 1. Envoie simplement le code au backend, il gère tout (échange + userinfo)
    const apiBase = process.env.API_BASE_URL || 'http://localhost:3456';
    const loginRes = await fetch(`${apiBase}/users/login-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        code: code as string,
        // plus besoin d'envoyer accessToken ici
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      return res.status(401).send(loginData.message || 'OAuth login failed');
    }
    // 4. Place le token backend en cookie et redirige
    res.setHeader('Set-Cookie', `token=${loginData.token}; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during the Google authentication process.');
  }
}
