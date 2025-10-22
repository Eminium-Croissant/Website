import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Certification from '../components/common/Certification';
import CachedImage from '../components/utils/CachedImage';
import { getServerSideTranslations, useTranslation } from '../components/utils/CloudflareI18n';
import useAuth from '../hooks/useAuth';
import useIsMobile from '../hooks/useIsMobile';
import useUserCache from '../hooks/useUserCache';

interface Game {
  gameId: string;
  name: string;
  description?: string;
  price: number;
  ownerId?: string;
  owner_id?: string;
  showInStore?: boolean;
  iconHash?: string;
  bannerHash?: string;
  splashHash?: string | null;
  developer?: string;
  publisher?: string;
  genre?: string;
  multiplayer?: number | boolean;
  platforms?: string;
  rating?: number;
  release_date?: string;
  trailer_link?: string;
  website?: string;
  download_link?: string;
}

interface OwnerInfo {
  id: string;
  username: string;
  verified?: boolean;
  admin?: boolean;
  isStudio?: boolean;
}

interface ApiErrorResponse {
  message?: string;
}

interface GiftResponse {
  gift: {
    giftCode: string;
  };
}

export async function getServerSideProps({ locale, query }) {
  const translations = await getServerSideTranslations(locale);
  let ogMeta = null;
  let gameFromQuery = null;

  if (query.gameId) {
    try {
      const res = await fetch(`https://croissant-api.fr/api/games/${query.gameId}`);
      if (res.ok) {
        const game: Game = await res.json();
        ogMeta = {
          title: game.name,
          description: game.description,
          bannerUrl: game.bannerHash ? `https://croissant-api.fr/banners-icons/${game.bannerHash}` : 'https://croissant.gg/assets/launcher.png',
          gameUrl: `https://croissant-api.fr/game?gameId=${game.gameId}`,
          card: true,
        };
        gameFromQuery = game;
      }
    } catch { }
  }

  return {
    props: {
      ...translations,
      isLauncher: true,
      ogMeta,
      gameFromQuery,
    },
  };
}

const endpoint = '/api';

function useGamePageLogic() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [game, setGame] = React.useState<Game | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { token, user } = useAuth();
  const [prompt, setPrompt] = React.useState<string | null>(null);
  const [alert, setAlert] = React.useState<string | JSX.Element | null>(null);
  const [buying, setBuying] = React.useState(false);
  const [isGifting, setIsGifting] = React.useState(false);
  const [giftMessage, setGiftMessage] = React.useState('');
  const [showGiftModal, setShowGiftModal] = React.useState(false);
  const [giftCode, setGiftCode] = React.useState<string | null>(null);
  const [userOwnsGame, setUserOwnsGame] = React.useState(false);

  const { getUser: getUserFromCache } = useUserCache();
  const [ownerInfo, setOwnerInfo] = React.useState<OwnerInfo | null>(null);

  React.useEffect(() => {
    if (!gameId) return;
    fetch(endpoint + '/games/' + gameId)
      .then(res => res.json())
      .then(setGame)
      .finally(() => setLoading(false));
  }, [gameId]);

  React.useEffect(() => {
    if (game?.owner_id || game?.ownerId) {
      const ownerId = game.owner_id || game.ownerId;
      getUserFromCache(ownerId)
        .then(setOwnerInfo)
        .catch(() => setOwnerInfo(null));
    } else {
      setOwnerInfo(null);
    }
  }, [game, getUserFromCache]);

  React.useEffect(() => {
    if (token && game) {
      fetch(`${endpoint}/games/list/@me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then((userGames: Game[]) => {
          setUserOwnsGame(userGames.some(g => g.gameId === game.gameId));
        })
        .catch(() => setUserOwnsGame(false));
    }
  }, [token, game]);

  const handleBuyGame = async () => {
    if (!game) return;
    setPrompt(`Acheter "${game.name}" ?\nPrix : ${game.price}`);
  };

  const { t } = useTranslation();
  const confirmBuy = async () => {
    setPrompt(null);
    setBuying(true);
    try {
      const res = await fetch(`${endpoint}/games/${game.gameId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: ApiErrorResponse = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'achat");
      setAlert(t('shop.purchaseSuccess'));
      setUserOwnsGame(true); // Update state to reflect ownership immediately
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBuying(false);
    }
  };

  const handleGiftGame = async () => {
    if (!game || !token) return;
    setShowGiftModal(true);
  };

  const confirmGift = async () => {
    setShowGiftModal(false);
    setIsGifting(true);
    try {
      const res = await fetch(`${endpoint}/gifts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: game.gameId,
          message: giftMessage.trim() || undefined,
        }),
      });
      const data: GiftResponse | ApiErrorResponse = await res.json();
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Erreur lors du gift');

      const giftData = data as GiftResponse;
      setGiftCode(giftData.gift.giftCode);
      setGiftMessage('');
      setAlert(
        <>
          Cadeau créé ! Partage ce lien :{' '}
          <a href={`/gift?code=${giftData.gift.giftCode}`} target='_blank' rel='noopener noreferrer' style={{ color: '#4caf50', textDecoration: 'underline' }}>
            {typeof window !== 'undefined' ? window.location.origin + `/gift?code=${giftData.gift.giftCode}` : `/gift?code=${giftData.gift.giftCode}`}
          </a>
        </>
      );
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setIsGifting(false);
    }
  };

  return {
    game,
    loading,
    router,
    ownerInfo,
    userOwnsGame,
    prompt,
    setPrompt,
    alert,
    setAlert,
    buying,
    handleBuyGame,
    confirmBuy,
    isGifting,
    handleGiftGame,
    confirmGift,
    showGiftModal,
    setShowGiftModal,
    giftMessage,
    setGiftMessage,
    token,
    user,
  };
}

function MarkdownDescription({ children }: { children: string }) {
  return (
    <div className='markdown-body glass-card w-full !w-full mx-auto'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeRaw,
            {
              passThrough: ['element'],
            },
          ],
        ]}
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              style={{
                maxWidth: '100%',
                borderRadius: 8,
                boxShadow: 'none',
                margin: '8px 4px',
                background: 'none',
              }}
              alt={props.alt ?? ''}
            />
          ),
        }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

function GameInterface(props: ReturnType<typeof useGamePageLogic>) {
  const { game, loading, ownerInfo, userOwnsGame, prompt, setPrompt, alert, setAlert, buying, handleBuyGame, confirmBuy, isGifting, handleGiftGame, confirmGift, showGiftModal, setShowGiftModal, giftMessage, setGiftMessage, token, user, router } = props;
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className='glass-page-container'>
        <div className='glass-content-card'>
          <div className='flex items-center justify-center py-12'>
            <div className='flex items-center gap-4'>
              <div className='w-8 h-8 border-4 border-glass-border border-t-neon-blue rounded-full animate-spin'></div>
              <span style={{ color: 'var(--glass-text)' }}>Chargement du jeu...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!game) {
    return (
      <div className='glass-page-container'>
        <div className='glass-content-card h-full flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-2xl mb-4' style={{ color: 'var(--glass-text)' }}>
              ⚠️ Jeu introuvable
            </div>
            <button className='glass-button-neon' style={{ marginTop: 16, minWidth: 80 }} onClick={() => router.back()}>
              ← {t('shop.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='glass-page-container'>
      <div className='flex gap-6 h-screen'>
        <main
          className='flex-1 overflow-y-auto'
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(74, 158, 255, 0.4) rgba(26, 26, 35, 0.3)',
          }}>
          <div className='glass-content-card h-full' style={{ overflowY: 'scroll' }}>
            <div className='relative h-64 mb-6 rounded-xl overflow-hidden'>
              <button className='glass-button-neon absolute top-4 left-4 z-10' onClick={() => router.back()} style={{ minWidth: 80 }}>
                {t('shop.back')}
              </button>
              <img src={`/banners-icons/${game.bannerHash ? game.bannerHash : 'default'}`} alt={game.name} className='w-full h-full object-cover' loading='lazy' />
              <div className='absolute inset-0 bg-gradient-to-t from-dark-primary via-transparent to-transparent'></div>
              <div className='absolute bottom-4 left-4 flex items-center gap-4'>
                <img src={'/games-icons/' + (game.iconHash ? game.iconHash : 'default')} alt={game.name} className='w-20 h-20 rounded-xl object-cover glass-card border-2 border-glass-border' loading='lazy' />
                <div>
                  <h2 className='text-3xl font-bold' style={{ color: 'var(--glass-text)' }}>
                    {game.name}
                  </h2>
                  {ownerInfo && (
                    <div className='flex items-center gap-2 mt-2'>
                      <a href={`/profile?user=${ownerInfo.id}`} className='flex items-center gap-2 no-underline'>
                        <CachedImage src={`/avatar/${ownerInfo.id}`} alt={ownerInfo.username} className='w-8 h-8 rounded-full object-cover border-2 border-glass-border' />
                        <span className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                          {ownerInfo.username}
                        </span>
                        <Certification
                          user={{
                            ...ownerInfo,
                            verified: ownerInfo.verified ?? false,
                          }}
                          className='w-4 h-4'
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className='absolute bottom-4 right-4 flex gap-4'>
                {!userOwnsGame && (
                  <button className='glass-button-neon' onClick={handleBuyGame} disabled={buying}>
                    {t('shop.buy')}
                  </button>
                )}
                {token && game.price > 0 && (
                  <button className='glass-button-yellow' onClick={handleGiftGame} disabled={isGifting} type='button'>
                    {t('shop.giftWithPrice', { price: game.price })}
                  </button>
                )}
              </div>
            </div>

            {game.description && (
              <div className="mt-6 w-full mx-auto">
                <MarkdownDescription>{game.description}</MarkdownDescription>
              </div>
            )}

            <div className='game-properties mt-6'>
              {game.genre && (
                <div>
                  <b>{t('shop.genre')}</b> {game.genre}
                </div>
              )}
              {game.developer && (
                <div>
                  <b>Developer:</b> {game.developer}
                </div>
              )}
              {game.publisher && (
                <div>
                  <b>Publisher:</b> {game.publisher}
                </div>
              )}
              {game.release_date && (
                <div>
                  <b>Release Date:</b> {game.release_date}
                </div>
              )}
              {game.platforms && (
                <div>
                  <b>Platforms:</b> {game.platforms}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showGiftModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50' onClick={() => setShowGiftModal(false)}>
          <div className='glass-card p-6 max-w-md w-full mx-4' onClick={e => e.stopPropagation()}>
            <h3 className='text-2xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
              {t('shop.gift')} "{game.name}"
            </h3>
            <textarea
              placeholder={t('shop.giftMessagePlaceholder')}
              value={giftMessage}
              onChange={e => setGiftMessage(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                margin: '10px 0',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                resize: 'vertical',
              }}
            />
            <div className='flex gap-4 mt-4'>
              <button className='glass-button flex-1' onClick={() => setShowGiftModal(false)} disabled={isGifting}>
                {t('shop.cancel')}
              </button>
              <button className='glass-button-neon flex-1' onClick={confirmGift} disabled={isGifting}>
                {t('shop.createGift')}
              </button>
            </div>
          </div>
        </div>
      )}

      {prompt && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='glass-card p-6 max-w-md w-full mx-4'>
            <div className='mb-4'>{prompt}</div>
            <div className='flex gap-4'>
              <button className='glass-button flex-1' onClick={() => setPrompt(null)} disabled={buying}>
                {t('shop.cancel')}
              </button>
              <button className='glass-button-neon flex-1' onClick={confirmBuy} disabled={buying}>
                {t('shop.buy')}
              </button>
            </div>
          </div>
        </div>
      )}

      {alert && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='glass-card p-6 max-w-md w-full mx-4'>
            <div className='mb-4'>{alert}</div>
            <button className='glass-button-neon w-full' onClick={() => setAlert(null)}>
              {t('shop.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamePage(props) {
  const isMobile = useIsMobile();
  const logic = useGamePageLogic();

  return <GameInterface {...logic} />;
}
