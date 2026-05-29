import type { NextApiRequest, NextApiResponse } from 'next'

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = process.env.API_BASE_URL
  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  return process.env.NODE_ENV !== 'production' ? 'https://croissant-api.eminium.ovh/api' : 'https://croissant-api.eminium.ovh/api'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query
  if (!code) return res.status(400).send('Missing code')

  try {
    // 1. Envoie le code au backend, il gère tout (échange + userinfo)
    const apiBase = resolveApiBaseUrl()
    const loginRes = await fetch(`${apiBase}/users/login-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'discord',
        code: code as string
        // plus besoin d'envoyer accessToken ici
      })
    })
    const loginData = await loginRes.json()
    if (!loginRes.ok || !loginData.token) {
      const errorMsg = loginData.message || loginData.error || 'OAuth login failed'
      console.error('[Discord OAuth] Backend error:', {
        status: loginRes.status,
        message: errorMsg,
        apiBase
      })
      return res
        .status(loginRes.status || 401)
        .send(
          process.env.NODE_ENV === 'development'
            ? `[DEV] Discord OAuth failed: ${errorMsg}. Backend: ${apiBase}`
            : 'Authentication failed. Please try again.'
        )
    }
    // 3. Place le token backend en cookie et redirige
    res.setHeader('Set-Cookie', `token=${loginData.token}; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`)
    res.redirect('/')
  } catch (error) {
    console.error(error)
    const isDev = process.env.NODE_ENV === 'development'
    const msg = error instanceof Error ? error.message : String(error)
    res
      .status(500)
      .send(
        isDev ? `[DEV] Discord OAuth error: ${msg}. Check API_BASE_URL or ensure backend is running.` : 'An error occurred during authentication.'
      )
  }
}
