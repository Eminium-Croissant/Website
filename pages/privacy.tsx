import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
/**
 * Privacy Policy page for Croissant.
 * Explains how user data is handled and protected.
 */
const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className='glass-page-container'>
      <div className='glass-content-card max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-8 text-center' style={{ color: 'var(--glass-text)' }}>
          <span className='glass-method get'>{t('privacy.title')}</span>
        </h1>
        <div className='glass-content-card mb-8'>
          <p className='text-lg mb-6' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('privacy.intro')}
          </p>
          {/* Section 1 */}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-blue)' }}>
              {t('privacy.1.title')}
            </h3>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.1.1')}
            </p>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.1.2')}
            </p>
            <p className='indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.1.3')}
            </p>
          </div>
          {/* Section 2 */}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-purple)' }}>
              {t('privacy.2.title')}
            </h3>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.2.1')}
            </p>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.2.2')}
            </p>
            <p className='indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.2.3')}
            </p>
          </div>
          {/* Section 3 */}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-pink)' }}>
              {t('privacy.3.title')}
            </h3>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.3.1')}
            </p>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.3.2')}
            </p>
            <p className='indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.3.3')}
            </p>
          </div>
          {/* Section 4 */}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-green)' }}>
              {t('privacy.4.title')}
            </h3>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.4.1')}
            </p>
            <p className='indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.4.2')}
            </p>
          </div>
          {/* Section 5 */}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-orange)' }}>
              {t('privacy.5.title')}
            </h3>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.5.1')}
            </p>
            <p className='mb-3 indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.5.2')}
            </p>
            <p className='indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.5.3')}
            </p>
          </div>
          {/* Section 6 */}
          <div className='glass-card p-6 mb-8'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-cyan)' }}>
              {t('privacy.6.title')}
            </h3>
            <p className='indent' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('privacy.6.1')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
