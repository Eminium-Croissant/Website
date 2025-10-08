import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import React from 'react';
import useIsMobile from '../hooks/useIsMobile';

interface NotFoundProps {
  t: (key: string) => string;
}

const NotFoundDesktop: React.FC<NotFoundProps> = ({ t }) => {
  return (
    <main className='min-h-screen bg-[#1c1c24] py-12'>
      <div className='max-w-2xl mx-auto px-8'>
        <h1 className='text-4xl font-bold text-white mb-6'>{t('404.title.desktop')}</h1>

        <div className='space-y-4 text-gray-300 mb-8'>
          <p className='leading-relaxed'>{t('404.desc1.desktop')}</p>
          <p className='leading-relaxed'>{t('404.desc2.desktop')}</p>
        </div>

        <h2 className='text-2xl font-semibold text-white mb-4'>{t('404.whatcan.desktop')}</h2>

        <div className='bg-[#23272e] rounded-xl p-6 shadow-lg border border-[#333]'>
          <p className='text-gray-300 mb-4'>{t('404.try.desktop')}</p>
          <ul className='space-y-3'>
            <li>
              <Link href='/' className='text-[#1e90ff] hover:text-[#40a9ff] transition-colors flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                </svg>
                {t('404.home')}
              </Link>
            </li>
            <li>
              <Link href='/contact' className='text-[#1e90ff] hover:text-[#40a9ff] transition-colors flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
                {t('404.contact')}
              </Link>
            </li>
            <li>
              <Link href='/api-docs' className='text-[#1e90ff] hover:text-[#40a9ff] transition-colors flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
                </svg>
                {t('404.api')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

const NotFoundMobile: React.FC<NotFoundProps> = ({ t }) => {
  return (
    <main className='min-h-screen bg-[#1c1c24] py-8 px-4'>
      <div className='max-w-sm mx-auto bg-[#23272e] rounded-xl p-6 shadow-lg border border-[#333]'>
        <h1 className='text-xl font-bold text-white text-center mb-4'>{t('404.title.mobile')}</h1>

        <div className='space-y-3 text-gray-300 mb-6'>
          <p>{t('404.desc1.mobile')}</p>
          <p>{t('404.desc2.mobile')}</p>
        </div>

        <ul className='space-y-3'>
          <li>
            <Link href='/' className='text-[#1e90ff] hover:text-[#40a9ff] transition-colors flex items-center gap-2'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
              </svg>
              {t('404.home')}
            </Link>
          </li>
          <li>
            <Link href='/contact' className='text-[#1e90ff] hover:text-[#40a9ff] transition-colors flex items-center gap-2'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
              {t('404.contact')}
            </Link>
          </li>
          <li>
            <Link href='/api-docs' className='text-[#1e90ff] hover:text-[#40a9ff] transition-colors flex items-center gap-2'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
              </svg>
              {t('404.api.mobile')}
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default function NotFoundPage() {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  return isMobile ? <NotFoundMobile t={t} /> : <NotFoundDesktop t={t} />;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
