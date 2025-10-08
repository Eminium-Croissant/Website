import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function Footer() {
  const { t } = useTranslation('common');
  const [show, setShow] = useState('');
  const [footerPosition, setFooterPosition] = useState<'relative' | 'absolute'>('absolute');

  useEffect(() => {
    const checkFooterPosition = () => {
      if (document.body.scrollHeight <= window.innerHeight) {
        setFooterPosition('absolute');
      } else {
        setFooterPosition('relative');
      }

      requestAnimationFrame(checkFooterPosition);
    };

    checkFooterPosition();

    return () => {
      window.removeEventListener('resize', checkFooterPosition);
    };
  }, []);

  const footerLinks = [
    { href: '/tos', label: t('footer.terms') },
    { href: '/privacy', label: t('footer.privacy') },
  ];

  return (
    <footer className={`w-full glass-bg-gradient text-glass-text-secondary text-[0.92rem] text-center py-6 px-0 border-t border-glass-border backdrop-blur-md ${footerPosition === 'absolute' ? 'absolute bottom-0 left-0' : 'relative'}`} style={{ display: show }}>
      <div className='max-w-[1400px] mx-auto px-6'>
        <div className='flex items-center justify-center gap-4 flex-wrap'>
          <span className='bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent font-semibold'>{t('footer.copyright')}</span>
          {footerLinks.map((link, idx) => (
            <React.Fragment key={link.href}>
              {idx > 0 && <span className='text-neon-blue'>|</span>}
              <Link href={link.href} className='text-neon-blue no-underline mx-2 hover:text-neon-purple transition-all duration-300 hover:scale-105'>
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </div>
        <div className='mt-4 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent'></div>
      </div>
    </footer>
  );
}
