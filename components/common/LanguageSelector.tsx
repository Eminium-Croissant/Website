import { useState } from 'react';
import { useTranslation } from '../utils/CloudflareI18n';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
}

export default function LanguageSelector({ className = '', showFlag = true }: LanguageSelectorProps) {
  const { locale, changeLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    changeLocale(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setIsOpen(!isOpen)} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-glass-accent border border-glass-border text-glass-text hover:bg-glass-secondary transition-all duration-200'>
        {showFlag && <span className='text-lg'>{currentLanguage.flag}</span>}
        <span className='text-sm font-medium'>{currentLanguage.code.toUpperCase()}</span>
        <span className='text-xs text-glass-text-secondary'>▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className='absolute top-full right-0 mt-1 w-48 z-50 bg-glass-primary border border-glass-border rounded-lg shadow-glass max-h-64 overflow-y-auto'>
            {languages.map(language => (
              <button key={language.code} onClick={() => handleLanguageChange(language.code)} className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-glass-accent transition-colors duration-200 ${language.code === locale ? 'bg-glass-accent border-l-2 border-l-neon-blue' : ''}`}>
                <span className='text-lg'>{language.flag}</span>
                <div>
                  <div className='text-sm font-medium text-glass-text'>{language.name}</div>
                  <div className='text-xs text-glass-text-secondary'>{language.code}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
