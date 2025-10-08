const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/launcher/:path*',
        destination: '/launcher/:path*',
      },
      {
        source: '/avatar/:path*',
        destination: '/api/avatar/:path*',
      },
      {
        source: '/items-icons/:path*',
        destination: '/api/items-icons/:path*',
      },
      {
        source: '/games-icons/:path*',
        destination: '/api/games-icons/:path*',
      },
      {
        source: '/banners-icons/:path*',
        destination: '/api/banners-icons/:path*',
      },
      {
        source: '/launcher',
        destination: '/launcher/home',
      },
      {
        source: '/upload/avatar',
        destination: '/api/upload/avatar',
      },
      {
        source: '/upload/banner',
        destination: '/api/upload/banner',
      },
      {
        source: '/upload/game-icon',
        destination: '/api/upload/game-icon',
      },
      {
        source: '/upload/item-icon',
        destination: '/api/upload/item-icon',
      },
      {
        source: '/join-lobby',
        destination: '/join-lobby.html',
      },
      {
        source: '/api-key',
        destination: '/api/api-key',
      },
      {
        source: '/explorer/:path*',
        destination: 'http://127.0.0.1:8080/explorer/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Real-IP',
            value: 'true',
          },
        ],
      },
      {
        source: '/oauth2/auth',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, buildId, dev, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,

        fs: false,
        path: false,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        new webpack.NormalModuleReplacementPlugin(/node:crypto/, resource => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  typescript: { ignoreBuildErrors: true },
  i18n: require('./next-i18next.config').i18n,
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;

