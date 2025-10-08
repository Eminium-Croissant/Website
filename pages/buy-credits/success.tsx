import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export default function Success() {
  const { t } = useTranslation('common');

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card mx-auto max-w-xl'>
        <h1 className='text-4xl font-bold mb-8 text-center' style={{ color: 'var(--glass-text)' }}>
          <span className='glass-method put'>{t('success.title')}</span>
        </h1>
        <div className='glass-card p-6 mb-8'>
          <p className='text-xl mb-4' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('success.description')}
          </p>
          <p className='text-base mb-4' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('success.support')}
          </p>
        </div>
        <div className='glass-card p-6 mb-8'>
          <h2 className='text-2xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
            {t('success.nextTitle')}
          </h2>
          <ul className='list-disc list-inside space-y-3 text-lg' style={{ color: 'var(--glass-text-secondary)' }}>
            <li>
              <Link href='/' className=''>
                {t('success.home')}
              </Link>
            </li>
            <li>
              <Link href='/dashboard' className=''>
                {t('success.dashboard')}
              </Link>
            </li>
            <li>
              <Link href='/contact' className=''>
                {t('success.contact')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
