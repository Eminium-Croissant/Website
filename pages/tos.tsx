import { faChevronDown, faChevronUp, faFileText, faGavel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState } from 'react';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const TermsOfService: React.FC = () => {
  const [openFr, setOpenFr] = useState(false);
  const [openEn, setOpenEn] = useState(false);
  const { t } = useTranslation('common');

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-8 text-center' style={{ color: 'var(--glass-text)' }}>
          <span className='glass-method get'>
            <FontAwesomeIcon icon={faFileText} className='mr-3' />
            {t('tos.title')}
          </span>
        </h1>

        <div className='glass-content-card mb-8'>
          <p className='text-lg mb-6' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('tos.intro')}
          </p>

          {}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-blue)' }}>
              <FontAwesomeIcon icon={faGavel} className='mr-2' />
              {t('tos.1.title')}
            </h3>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.1.1')}
            </p>
            <p style={{ color: 'var(--glass-text-secondary)' }}>{t('tos.1.2')}</p>
          </div>

          {}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-purple)' }}>
              <FontAwesomeIcon icon={faGavel} className='mr-2' />
              {t('tos.2.title')}
            </h3>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.2.1')}
            </p>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.2.2')}
            </p>
            <p style={{ color: 'var(--glass-text-secondary)' }}>{t('tos.2.3')}</p>
          </div>

          {}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-pink)' }}>
              <FontAwesomeIcon icon={faGavel} className='mr-2' />
              {t('tos.3.title')}
            </h3>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.3.1')}
            </p>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.3.2')}
            </p>
            <p style={{ color: 'var(--glass-text-secondary)' }}>{t('tos.3.3')}</p>
          </div>

          {}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-green)' }}>
              <FontAwesomeIcon icon={faGavel} className='mr-2' />
              {t('tos.4.title')}
            </h3>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.4.1')}
            </p>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.4.2')}
            </p>
            <p style={{ color: 'var(--glass-text-secondary)' }}>{t('tos.4.3')}</p>
          </div>

          {}
          <div className='glass-card p-6 mb-6'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-orange)' }}>
              <FontAwesomeIcon icon={faGavel} className='mr-2' />
              {t('tos.5.title')}
            </h3>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.5.1')}
            </p>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.5.2')}
            </p>
            <p style={{ color: 'var(--glass-text-secondary)' }}>{t('tos.5.3')}</p>
          </div>

          {}
          <div className='glass-card p-6 mb-8'>
            <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--neon-cyan)' }}>
              <FontAwesomeIcon icon={faGavel} className='mr-2' />
              {t('tos.6.title')}
            </h3>
            <p className='mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('tos.6.1')}
            </p>
            <p style={{ color: 'var(--glass-text-secondary)' }}>{t('tos.6.2')}</p>
          </div>

          <h2 className='text-3xl font-bold mb-6 text-center' style={{ color: 'var(--glass-text)' }}>
            <span className='glass-method put'>
              <FontAwesomeIcon icon={faGavel} className='mr-3' />
              {t('tos.legalMentions')}
            </span>
          </h2>

          {}
          <div className='glass-card mb-6'>
            <button onClick={() => setOpenFr(v => !v)} className='glass-button-neon w-full flex items-center justify-between p-4 text-left'>
              <span className='flex items-center'>
                <FontAwesomeIcon icon={faGavel} className='mr-3 text-neon-blue' />
                Mentions légales (Français)
              </span>
              <FontAwesomeIcon icon={openFr ? faChevronUp : faChevronDown} className='text-neon-blue transition-transform duration-300' />
            </button>
            {openFr && <div className='glass-card mt-4 p-6'>{}</div>}
          </div>

          {}
          <div className='glass-card'>
            <button onClick={() => setOpenEn(v => !v)} className='glass-button-neon w-full flex items-center justify-between p-4 text-left'>
              <span className='flex items-center'>
                <FontAwesomeIcon icon={faGavel} className='mr-3 text-neon-purple' />
                Legal Mentions (English)
              </span>
              <FontAwesomeIcon icon={openEn ? faChevronUp : faChevronDown} className='text-neon-purple transition-transform duration-300' />
            </button>
            {openEn && <div className='glass-card mt-4 p-6'>{}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
