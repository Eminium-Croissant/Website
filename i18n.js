import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './public/locales/en/common.json';
import translationFR from './public/locales/fr/common.json';
import translationES from './public/locales/es/common.json';
import translationDE from './public/locales/de/common.json';
import translationIT from './public/locales/it/common.json';
import translationJA from './public/locales/ja/common.json';
import translationKO from './public/locales/ko/common.json';
import translationTR from './public/locales/tr/common.json';
import translationZH from './public/locales/zh/common.json';
import translationAR from './public/locales/ar/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: translationEN },
      fr: { common: translationFR },
      es: { common: translationES },
      de: { common: translationDE },
      it: { common: translationIT },
      ja: { common: translationJA },
      ko: { common: translationKO },
      tr: { common: translationTR },
      zh: { common: translationZH },
      ar: { common: translationAR },
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;