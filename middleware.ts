import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Detect if running in Cloudflare Workers
  const isCloudflare = request.headers.has('cf-ray') || request.headers.has('cf-connecting-ip')

  if (isCloudflare) {
    console.log('[Middleware] Running in Cloudflare Workers environment')

    // Add Cloudflare-specific headers
    const response = NextResponse.next()
    response.headers.set('X-Environment', 'cloudflare-workers')
    response.headers.set('X-Powered-By', 'Cloudflare Workers')

    return response
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Note: The actual admin check is done on the page level
    // This middleware just ensures the user is logged in
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
