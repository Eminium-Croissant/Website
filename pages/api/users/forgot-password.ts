import type { NextApiRequest, NextApiResponse } from 'next'

type ForgotPasswordResponse = {
  success: boolean
  message: string
}

function getRealIP(req: NextApiRequest): string {
  const forwardedFor = req.headers['x-forwarded-for']
  if (forwardedFor) {
    const raw = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
    const firstIp = raw.split(',')[0]?.trim()
    if (firstIp) {
      return firstIp
    }
  }

  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp
  }

  const connection = (req as any).connection
  if (connection?.remoteAddress) {
    return connection.remoteAddress
  }

  return 'unknown'
}

function resolveApiBaseUrl(req: NextApiRequest): string {
  const configuredBaseUrl = process.env.API_BASE_URL
  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3456'
  }

  const host = (req.headers.host || '').toLowerCase()
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')) {
    return 'http://localhost:3456'
  }

  return 'https://croissant-api.eminium.ovh/api'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ForgotPasswordResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    })
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    })
  }

  const safeMessage = 'If this email exists, a reset link has been sent.'

  try {
    const apiBaseUrl = resolveApiBaseUrl(req)
    const upstreamRes = await fetch(`${apiBaseUrl}/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': getRealIP(req),
        'x-real-ip': getRealIP(req)
      },
      body: JSON.stringify({ email })
    })

    if (upstreamRes.ok) {
      return res.status(200).json({
        success: true,
        message: safeMessage
      })
    }

    // For password reset flow, always return a neutral success response.
    return res.status(200).json({
      success: true,
      message: safeMessage
    })
  } catch {
    return res.status(200).json({
      success: true,
      message: safeMessage
    })
  }
}
