import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false // Permet de forwarder les bodies bruts (utile pour fichiers, etc.)
  }
}

function filterHeaders(headers: Record<string, any>) {
  // Supprime les headers qui posent problème
  const excluded = ['host', 'connection', 'content-length', 'accept-encoding']
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (!excluded.includes(key.toLowerCase())) {
      result[key] = value
    }
  }
  return result
}

function getRealIP(req: NextApiRequest): string {
  const headers = req.headers

  // Apache avec mod_remoteip peut modifier REMOTE_ADDR
  // Essayons d'abord les headers standards
  const forwardedFor = headers['x-forwarded-for']
  if (forwardedFor) {
    const ips = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor).split(',').map((ip) => ip.trim())

    // Prendre la première IP non-locale
    for (const ip of ips) {
      if (ip && !isLocalIP(ip)) {
        console.log('Using x-forwarded-for IP:', ip)
        return ip
      }
    }
  }

  // Autres headers
  const realIp = headers['x-real-ip']
  if (realIp && !isLocalIP(realIp as string)) {
    console.log('Using x-real-ip:', realIp)
    return realIp as string
  }

  // Si tout le reste échoue, on peut essayer de récupérer l'IP depuis connection info
  const connection = (req as any).connection
  if (connection && connection.remoteAddress && !isLocalIP(connection.remoteAddress)) {
    console.log('Using connection.remoteAddress:', connection.remoteAddress)
    return connection.remoteAddress
  }

  return 'unknown'
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
    /^fe80:/ // IPv6 link-local
  ]

  return localPatterns.some((pattern) => pattern.test(ip))
}

function resolveApiBaseUrl(req: NextApiRequest): string {
  const configuredBaseUrl = process.env.API_BASE_URL
  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  const host = (req.headers.host || '').toLowerCase()
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')) {
    return 'http://localhost:3456'
  }

  return 'https://croissant-api.eminium.ovh/api'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug = [], ...query } = req.query

  const apiBaseUrl = resolveApiBaseUrl(req)

  let url = `${apiBaseUrl}/${Array.isArray(slug) ? slug.join('/') : slug}`

  // Ajoute les query params à l'URL
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v))
    } else {
      searchParams.append(key, value as string)
    }
  }
  if ([...searchParams].length > 0) {
    url += `?${searchParams.toString()}`
  }

  // Prépare les headers
  const headers = {
    ...filterHeaders(req.headers as Record<string, any>),
    'x-forwarded-for': getRealIP(req),
    'x-real-ip': getRealIP(req)
  }

  // Utilise le flux brut de la requête comme body si ce n'est pas GET/HEAD
  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    // @ts-ignore
    body: !['GET', 'HEAD'].includes(req.method || '') ? req : undefined,
    duplex: !['GET', 'HEAD'].includes(req.method || '') ? 'half' : undefined // Important pour Node.js 18+ et fetch streaming
  }

  // Forward la requête avec gestion d'erreur réseau
  let apiRes: Response
  try {
    apiRes = await fetch(url, fetchOptions)
  } catch (err: any) {
    console.error('Error fetching upstream API:', { url, err })

    const isConnRefused = err && ((err.cause && err.cause.code === 'ECONNREFUSED') || err.code === 'ECONNREFUSED')
    const message = isConnRefused
      ? `Connection refused when reaching API at ${url}. Verify API_BASE_URL and ensure the backend is reachable from this runtime.`
      : `Fetch to upstream API failed: ${err && err.message ? err.message : String(err)}`

    return res.status(isConnRefused ? 502 : 500).json({ error: message })
  }

  // Forward le status et les headers
  // Forward le status et les headers (possibilité d'enrichir les réponses utilisateur)
  res.status(apiRes.status)

  const contentType = apiRes.headers.get('content-type') || ''

  // Si c'est une requête GET sur /api/users/... on peut tenter d'enrichir la réponse
  if ((req.method || '').toUpperCase() === 'GET' && Array.isArray(slug) && slug[0] === 'users') {
    // Lit la réponse en texte (buffer) pour pouvoir la modifier si nécessaire
    const bodyText = await apiRes.text()
    let bodyJson: any = null
    try {
      bodyJson = JSON.parse(bodyText)
    } catch (e) {
      bodyJson = null
    }

    // Si la réponse est un objet utilisateur et manque les champs status/disabled, essaye de récupérer les détails admin
    if (bodyJson && typeof bodyJson === 'object') {
      // Détermine l'id cible si présent (ex: /users/123)
      const targetId = slug.length >= 2 && slug[1] && slug[1] !== '@me' ? String(slug[1]) : null
      if (targetId && (bodyJson.status === undefined || bodyJson.disabled === undefined)) {
        try {
          const adminRes = await fetch(`${apiBaseUrl}/users/admin/${targetId}`, { headers })
          if (adminRes.ok) {
            const adminJson: any = await adminRes.json()
            if (adminJson) {
              if (bodyJson.status === undefined && adminJson.status !== undefined) bodyJson.status = adminJson.status
              if (bodyJson.disabled === undefined && adminJson.disabled !== undefined) bodyJson.disabled = adminJson.disabled
            }
          }
        } catch (e) {
          // ignore, on renverra la réponse d'origine si l'enrichissement échoue
        }
      }

      // Forward headers (exclut certains hop-by-hop headers)
      apiRes.headers.forEach((value, key) => {
        if (!['transfer-encoding', 'connection', 'content-encoding'].includes(key.toLowerCase())) {
          // Ne pas écraser le content-type si on renvoie JSON modifié
          if (key.toLowerCase() === 'content-type') return
          res.setHeader(key, value)
        }
      })

      // Répond avec le JSON (possiblement enrichi)
      const out = JSON.stringify(bodyJson)
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.setHeader('content-length', Buffer.byteLength(out).toString())
      res.end(out)
      return
    }

    // Si ce n'est pas JSON modifiable, forwarder la réponse brute (texte)
    apiRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection', 'content-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value)
      }
    })
    res.end(bodyText)
    return
  }

  // Cas par défaut: stream la réponse directement
  apiRes.headers.forEach((value, key) => {
    if (!['transfer-encoding', 'connection', 'content-encoding'].includes(key.toLowerCase())) {
      res.setHeader(key, value)
    }
  })
  if (apiRes.body) {
    const nodeStream = require('stream').Readable.fromWeb(apiRes.body)
    nodeStream.pipe(res)
  } else {
    res.end()
  }
}

