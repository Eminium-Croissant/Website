import { faBolt, faBug, faCodeBranch, faHandshake, faScrewdriverWrench, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

interface Badge {
  key: string;
  icon: any;
  color: string;
  hoverColor?: string;
}

const BADGES: Badge[] = [
  {
    key: 'early_user',
    icon: faBolt,
    color: '#ff3535',
    hoverColor: '#ff4545',
  },
  {
    key: 'staff',
    icon: faScrewdriverWrench,
    color: '#7289DA',
    hoverColor: '#8299EA',
  },
  {
    key: 'bug_hunter',
    icon: faBug,
    color: '#fff200',
    hoverColor: '#fff555',
  },
  {
    key: 'contributor',
    icon: faCodeBranch,
    color: '#7200b8',
    hoverColor: '#8210c8',
  },
  {
    key: 'moderator',
    icon: faShieldHalved,
    color: '#f2ad58',
    hoverColor: '#f2bd68',
  },
  {
    key: 'community_manager',
    icon: faUsers,
    color: '#23a548',
    hoverColor: '#33b558',
  },
  {
    key: 'partner',
    icon: faHandshake,
    color: '#677BC4',
    hoverColor: '#778BD4',
  },
];

const BadgesPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    const updateHighlight = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace(/^#/, '');
        setHighlighted(hash || null);
      }
    };
    updateHighlight();
    window.addEventListener('hashchange', updateHighlight);
    return () => window.removeEventListener('hashchange', updateHighlight);
  }, []);

  return (
    <div className='min-h-screen bg-glass-gradient'>
      <div className='glass-page-container max-w-4xl'>
        <div className='mb-8'>
          <h1 className='glass-title text-4xl mb-6'>{t('badges.title')}</h1>
          <div className='glass-content-card'>
            <p className='text-lg text-glass-text-secondary'>{t('badges.intro')}</p>
          </div>
        </div>

        <div className='space-y-6'>
          {BADGES.map(badge => {
            const isHighlighted = highlighted === badge.key;
            return (
              <div
                key={badge.key}
                id={badge.key}
                className={`
                  flex items-start gap-5 p-6 shadow-md transition-all duration-200
                  ${isHighlighted ? 'glass-card ring-2 ring-neon-yellow glass-shimmer' : 'glass-card glass-glow'}
                `}>
                <div className='flex items-center justify-center w-12 h-12 rounded-lg shrink-0' style={{ backgroundColor: `${badge.color}22` }}>
                  <FontAwesomeIcon icon={badge.icon} className='text-3xl' style={{ color: badge.color }} />
                </div>

                <div className='space-y-2'>
                  <h2 className='text-xl font-semibold' style={{ color: badge.color }}>
                    {t(`badges.${badge.key}.label`)}
                  </h2>

                  <p className='text-glass-text'>{t(`badges.${badge.key}.description`)}</p>

                  <div className='text-sm text-glass-text-secondary'>
                    <span className='font-semibold'>{t('badges.howtogetit')}</span>
                    &nbsp;{t(`badges.${badge.key}.how`)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className='mt-8 text-sm text-glass-text-secondary text-center'>{t('badges.lastUpdated')}</div>
      </div>
    </div>
  );
};

export default BadgesPage;

