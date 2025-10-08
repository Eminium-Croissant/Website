import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CachedImage from '../components/utils/CachedImage';
import useAuth from '../hooks/useAuth';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
const endpoint = '/api';

const GiftPage: React.FC = () => {
  const searchParams = useSearchParams();
  const giftCode = searchParams.get('code');
  const [giftInfo, setGiftInfo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [claiming, setClaiming] = React.useState(false);
  const [alert, setAlert] = React.useState<string | null>(null);
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!giftCode) {
      setLoading(false);
      return;
    }

    if (!token) {
      setAlert('You must be logged in to claim a gift');
      setLoading(false);
      return;
    }

    fetch(`${endpoint}/gifts/${giftCode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setAlert(data.message);
        } else {
          setGiftInfo(data);
          if (data.userOwnsGame) {
            setAlert('You already own this game and cannot claim this gift.');
          }
        }
      })
      .catch(() => setAlert('Failed to load gift information'))
      .finally(() => setLoading(false));
  }, [giftCode, token]);

  const handleClaimGift = async () => {
    if (!giftCode || !token) return;

    setClaiming(true);
    try {
      const res = await fetch(`${endpoint}/gifts/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ giftCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to claim gift');

      setAlert('Gift claimed successfully! The game has been added to your library.');
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setClaiming(false);
    }
  };

  // Use glass container similar to pages/game.tsx
  if (loading) {
    return (
      <div className='glass-page-container'>
        <div className='glass-content-card h-full flex items-center justify-center'>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className='w-8 h-8 border-4 border-glass-border border-t-neon-blue rounded-full animate-spin' />
            <span style={{ color: 'var(--glass-text)' }}>{t('shop.loading') ?? 'Loading...'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!giftCode) {
    return (
      <div className='glass-page-container'>
        <div className='glass-content-card h-full flex items-center justify-center'>
          <div style={{ textAlign: 'center' }}>
            <h2>{t('shop.invalidGiftLink')}</h2>
            <p>{t('shop.noGiftCode')}</p>
            <button onClick={() => router.push('/')} className='gamepage-back-btn'>
              {t('shop.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!giftInfo) {
    return (
      <div className='glass-page-container'>
        <div className='glass-content-card h-full flex items-center justify-center'>
          <div style={{ textAlign: 'center' }}>
            <h2>{t('shop.giftNotFound')}</h2>
            <p>{alert || t('shop.giftNotFoundDesc')}</p>
            <button onClick={() => router.push('/')} className='gamepage-back-btn'>
              {t('shop.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card'>
        <button onClick={() => router.back()} className='gamepage-back-btn'>
          ← Back
        </button>

        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2>🎁 {t('shop.youReceivedGift')}</h2>

          {giftInfo?.game && (
            <div
              style={{
                margin: '20px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 8,
              }}
            >
              <CachedImage src={`/games-icons/${giftInfo.game.iconHash}`} alt={giftInfo.game.name} style={{ width: 128, height: 128, borderRadius: 8 }} />
              <h3 style={{ margin: 0 }}>{giftInfo.game.name}</h3>
              <p style={{ margin: '8px 0 0', maxWidth: 560 }}>{giftInfo.game.description}</p>
            </div>
          )}

          {giftInfo?.fromUser && (
            <div style={{ margin: '20px 0' }}>
              <Trans i18nKey='shop.from' values={{ username: giftInfo.fromUser.username }} components={{ strong: <strong /> }} />
            </div>
          )}

          {giftInfo?.gift.message && (
            <div
              style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: 8,
                margin: '20px 0',
                color: '#333',
              }}
            >
              <p>
                <em>"{giftInfo.gift.message}"</em>
              </p>
            </div>
          )}

          {giftInfo?.gift.isActive && !giftInfo?.userOwnsGame ? (
            <button
              onClick={handleClaimGift}
              disabled={claiming}
              style={{
                padding: '15px 30px',
                fontSize: 18,
                borderRadius: 8,
                fontWeight: 700,
                background: '#4caf50',
                color: 'white',
                border: 'none',
                cursor: claiming ? 'not-allowed' : 'pointer',
                opacity: claiming ? 0.7 : 1,
              }}
            >
              {claiming ? t('shop.claiming') : t('shop.claimGift')}
            </button>
          ) : giftInfo?.userOwnsGame ? (
            <div>
              <p style={{ color: '#f44336', fontWeight: 'bold' }}>{t('shop.giftAlreadyOwned')}</p>
            </div>
          ) : (
            <div>
              <p style={{ color: '#666' }}>{t('shop.giftAlreadyClaimed')}</p>
              {giftInfo?.gift.claimedAt && (
                <p style={{ fontSize: '0.9em', color: '#999' }}>
                  {t('shop.giftClaimedOn', {
                    date: new Date(giftInfo.gift.claimedAt).toLocaleDateString(),
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {alert && (
        <div className='shop-alert-overlay'>
          <div className='shop-alert'>
            <div className='shop-alert-message'>{alert}</div>
            <button className='shop-alert-ok-btn' onClick={() => setAlert(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftPage;
