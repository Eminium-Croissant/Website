import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface I18nContextType {
  t: (key: string) => string;
  locale: string;
  changeLocale: (newLocale: string) => void;
}

const I18nContext = createContext<I18nContextType>({
  t: (key: string) => key,
  locale: 'en',
  changeLocale: (newLocale: string) => {},
});

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      t: (key: string, values?: Record<string, any>) => key,
      i18n: { language: 'en' },
      locale: 'en',
      changeLocale: (newLocale: string) => {},
    };
  }
  return {
    t: (key: string, values?: Record<string, any>) => {
      let translation = context.t(key);
      if (values) {
        Object.keys(values).forEach(placeholder => {
          translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), values[placeholder]);
        });
      }
      return translation;
    },
    i18n: { language: context.locale },
    locale: context.locale,
    changeLocale: context.changeLocale,
  };
};

// Simple Trans component for Cloudflare compatibility
export const Trans = ({ children, i18nKey, values, ...props }: { children?: ReactNode; i18nKey?: string; values?: Record<string, any>; [key: string]: any }) => {
  const { t } = useTranslation();

  if (i18nKey) {
    const translation = t(i18nKey, values);
    return <>{translation}</>;
  }

  return <>{children}</>;
};

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
  translations?: Record<string, any>;
}

export const I18nProvider = ({ children, locale = 'en', translations = {} }: I18nProviderProps) => {
  const [currentLocale, setCurrentLocale] = useState(locale);
  const [loadedTranslations, setLoadedTranslations] = useState(translations);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Cache pour éviter de recharger les mêmes traductions
  const translationCache = useRef<Record<string, Record<string, any>>>({});

  const loadTranslations = async (lang: string) => {
    // Vérifier le cache d'abord
    if (translationCache.current[lang]) {
      setLoadedTranslations(translationCache.current[lang]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/locales/${lang}/common.json`);
      if (response.ok) {
        const data: Record<string, any> = await response.json();
        translationCache.current[lang] = data;
        setLoadedTranslations(data);
      } else {
        console.warn(`Failed to load translations for ${lang}`);
      }
    } catch (error) {
      console.warn('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Éviter l'hydration mismatch
  useEffect(() => {
    setIsClient(true);
    if (Object.keys(translations).length === 0) {
      loadTranslations(currentLocale);
    }
  }, []);

  useEffect(() => {
    if (isClient && currentLocale !== locale) {
      setCurrentLocale(locale);
      if (Object.keys(translations).length === 0) {
        loadTranslations(locale);
      }
    }
  }, [locale, isClient]);

  const changeLocale = (newLocale: string) => {
    setCurrentLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    loadTranslations(newLocale);
  };

  const t = (key: string): string => {
    // Ne pas afficher les clés pendant le chargement côté client si on n'a pas encore de traductions
    if (!isClient && Object.keys(loadedTranslations).length === 0) {
      return key;
    }

    // Si on charge et qu'on n'a pas de traductions, retourner la clé temporairement
    if (isLoading && Object.keys(loadedTranslations).length === 0) {
      return key;
    }

    // Navigate through nested object using dot notation
    const keys = key.split('.');
    let result: any = loadedTranslations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof result === 'string' ? result : key;
  };

  return <I18nContext.Provider value={{ t, locale: currentLocale, changeLocale }}>{children}</I18nContext.Provider>;
};

// Helper function to get translations on server side
export const getServerSideTranslations = async (locale?: string) => {
  const safeLocale = locale || 'en';

  try {
    // In a Cloudflare environment, we need to handle translations differently
    // For now, return empty translations to avoid errors
    return {
      _nextI18Next: {
        initialI18nStore: {},
        initialLocale: safeLocale,
        ns: [],
        userConfig: {
          i18n: {
            defaultLocale: 'en',
            locales: ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'tr', 'zh', 'ar', 'ru'],
          },
          use: [],
        },
      },
    };
  } catch (error) {
    console.warn('Translation loading failed:', error);
    return {
      _nextI18Next: {
        initialI18nStore: {},
        initialLocale: 'en',
        ns: [],
        userConfig: {
          i18n: {
            defaultLocale: 'en',
            locales: ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'tr', 'zh', 'ar', 'ru'],
          },
          use: [],
        },
      },
    };
  }
};
