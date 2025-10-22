// Cloudflare Workers compatible i18n configuration
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'tr', 'zh', 'ar', 'ru'],
    localeDetection: false, // Désactive la détection automatique de locale
  },
  react: { useSuspense: false },
  // Disable features that don't work in Cloudflare Workers
  compatibilityMode: 'cloudflare',
  reloadOnPrerender: false,
  serverLanguageDetection: false,
  
  // Override functions that cause issues
  use: () => ({
    ready: Promise.resolve(),
    changeLanguage: () => Promise.resolve(),
    language: 'en',
    languages: ['en'],
    t: (key) => key,
  }),
};

