// Cloudflare Workers compatible next-i18next replacement
export const useTranslation = () => {
  return {
    t: (key) => key,
    i18n: { 
      language: 'en',
      languages: ['en'],
      changeLanguage: () => Promise.resolve()
    }
  };
};

export const serverSideTranslations = async (locale, namespaces) => {
  return {
    props: {
      _nextI18Next: {
        initialI18nStore: {},
        initialLocale: locale || 'en',
        ns: namespaces || [],
        userConfig: null
      }
    }
  };
};

export const appWithTranslation = (App) => {
  return App;
};

// Export all common functions that might be imported
export default {
  useTranslation,
  serverSideTranslations,
  appWithTranslation
};