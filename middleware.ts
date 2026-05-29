import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Detect if running in Cloudflare Workers
  const isCloudflare = request.headers.has('cf-ray') || request.headers.has('cf-connecting-ip') || typeof (globalThis as any).caches !== 'undefined'

  if (isCloudflare) {
    console.log('[Middleware] Running in Cloudflare Workers environment')

    // Add Cloudflare-specific headers
    const response = NextResponse.next()
    response.headers.set('X-Environment', 'cloudflare-workers')
    response.headers.set('X-Powered-By', 'Cloudflare Workers')

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals, including HMR websocket)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next|favicon.ico).*)'
  ]
}
