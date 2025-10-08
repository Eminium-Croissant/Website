import React from 'react';
import CachedImage from '../components/utils/CachedImage';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

interface Tier {
  img: string;
  alt: string;
  credits: string;
  price: string;
  id: string;
}

const BuyCredits: React.FC = () => {
  const { t } = useTranslation('common');

  const tiers: Tier[] = [
    {
      img: '/assets/credits/tier1.avif',
      alt: t('buyCredits.tier1.alt'),
      credits: '200',
      price: '0.99€',
      id: 'tier1',
    },
    {
      img: '/assets/credits/tier2.avif',
      alt: t('buyCredits.tier2.alt'),
      credits: '400',
      price: '1.98€',
      id: 'tier2',
    },
    {
      img: '/assets/credits/tier3.avif',
      alt: t('buyCredits.tier3.alt'),
      credits: '1000',
      price: '4.95€',
      id: 'tier3',
    },
    {
      img: '/assets/credits/tier4.avif',
      alt: t('buyCredits.tier4.alt'),
      credits: '2000',
      price: '9.90€',
      id: 'tier4',
    },
  ];

  const handlePurchase = async (tier: Tier) => {
    try {
      const response = await fetch(`/api/stripe/checkout?tier=${tier.id}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='min-h-screen bg-glass-gradient'>
      <div className='glass-page-container'>
        <div className='text-center mb-12'>
          <h1 className='glass-title text-5xl mb-4'>{t('buyCredits.title')}</h1>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {tiers.map(tier => (
            <div
              key={tier.credits}
              className='glass-card glass-glow cursor-pointer transform transition-all duration-200 hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-opacity-50'
              tabIndex={0}
              onClick={() => handlePurchase(tier)}
              onKeyPress={e => e.key === 'Enter' && handlePurchase(tier)}
            >
              <div className='flex flex-col items-center gap-4'>
                <div className='relative w-32 h-32'>
                  <CachedImage src={tier.img} alt={tier.alt} className='w-full h-full object-contain rounded-lg' />
                </div>

                <div className='flex items-center gap-2 text-xl font-bold text-glass-text'>
                  {tier.credits}
                  <CachedImage src='/assets/credit.avif' className='w-5 h-5' alt='credits' />
                </div>

                <div className='text-lg font-semibold text-neon-blue'>{tier.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;
