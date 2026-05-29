import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['croissant-api.eminium.ovh'],

  async rewrites() {
    return [
      {
        source: '/launcher/:path*',
        destination: '/launcher/:path*'
      },
      {
        source: '/avatar/:path*',
        destination: '/api/avatar/:path*'
      },
      {
        source: '/items-icons/:path*',
        destination: '/api/items-icons/:path*'
      },
      {
        source: '/games-icons/:path*',
        destination: '/api/games-icons/:path*'
      },
      {
        source: '/banners-icons/:path*',
        destination: '/api/banners-icons/:path*'
      },
      {
        source: '/launcher',
        destination: '/launcher/home'
      },
      {
        source: '/upload/avatar',
        destination: '/api/upload/avatar'
      },
      {
        source: '/upload/banner',
        destination: '/api/upload/banner'
      },
      {
        source: '/upload/game-icon',
        destination: '/api/upload/game-icon'
      },
      {
        source: '/upload/item-icon',
        destination: '/api/upload/item-icon'
      },
      {
        source: '/join-lobby',
        destination: '/join-lobby.html'
      },
      {
        source: '/api-key',
        destination: '/api/api-key'
      }
      // Removed external rewrite for Cloudflare compatibility
    ]
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Real-IP',
            value: 'true'
          }
        ]
      },
      {
        source: '/oauth2/auth',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          }
        ]
      }
    ]
  },

  eslint: {
    ignoreDuringBuilds: true
  },

  images: {
    unoptimized: true
  },

  typescript: {
    ignoreBuildErrors: true
  },

  experimental: {
    optimizeCss: false
  },

  webpack: (config, { isServer }) => {
    // Redirect next-i18next imports to our compatibility layer
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-i18next': require.resolve('./next-i18next.js'),
      'next-i18next/serverSideTranslations': require.resolve('./next-i18next.js')
    }

    return config
  }

  // Remove i18n config for Cloudflare compatibility - handle it manually
}

export default nextConfig

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
