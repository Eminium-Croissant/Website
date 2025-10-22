import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Certification from '../components/common/Certification';
import CachedImage from '../components/utils/CachedImage';
import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../components/utils/CloudflareI18n';
import useAuth from '../hooks/useAuth';
import useIsMobile from '../hooks/useIsMobile';
import useUserCache from '../hooks/useUserCache';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}
const ENDPOINT = '/api';

interface User {
  id: string;
  username: string;
  verified: boolean;
  certification?: boolean;
}

interface Game {
  gameId: string;
  name: string;
  price: number;
  rating?: number;
  genre?: string;
  description?: string;
  bannerHash?: string;
  iconHash?: string;
  owner_id?: string;
}

interface PromptState {
  message: string;
  resolve: (value: { confirmed: boolean }) => void;
  item?: Game;
}

interface AlertState {
  message: string;
}

type OwnerInfo = User;

interface ApiErrorResponse {
  message: string;
  error?: string;
}

interface BuyGameResponse {
  success: boolean;
  message?: string;
}

interface ShopProps {
  games: Game[];
  loading: boolean;
  error: string | null;
  prompt: PromptState | null;
  alert: AlertState | null;
  handleBuyGame: (game: Game) => void;
  setAlert: (alert: AlertState | null) => void;
  ownerInfoMap: Record<string, OwnerInfo>;
  handlePromptResult: (confirmed: boolean) => void;
}

function useShopLogic() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<PromptState | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const { token } = useAuth();
  const { getUser: getUserFromCache } = useUserCache();
  const router = useRouter();

  const AUTH_HEADER = useMemo(
    () => ({
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const fetchGames = useCallback(() => {
    setLoading(true);
    fetch(`${ENDPOINT}/games`, {
      method: 'GET',
      headers: AUTH_HEADER,
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch games');
        return res.json() as Promise<Game[]>;
      })
      .then(data => {
        setGames(data);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [AUTH_HEADER]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const customPrompt = useCallback((message: string, item?: Game) => {
    return new Promise<{ confirmed: boolean }>(resolve => {
      setPrompt({ message, resolve, item });
    });
  }, []);

  const handlePromptResult = useCallback(
    (confirmed: boolean) => {
      if (prompt) {
        prompt.resolve({ confirmed });
        setPrompt(null);
      }
    },
    [prompt]
  );

  const handleBuyGame = useCallback(
    async (game: Game) => {
      const result = await customPrompt(`Buy "${game.name}"?\nPrice: ${game.price}`, game);
      if (result.confirmed) {
        fetch(`${ENDPOINT}/games/${game.gameId}/buy`, {
          method: 'POST',
          headers: AUTH_HEADER,
        })
          .then(async res => {
            const data = await res.json() as BuyGameResponse | ApiErrorResponse;
            if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Failed to buy game');
            return data;
          })
          .then(() => {
            fetchGames();
          })
          .catch(err => {
            setAlert({ message: err.message });
          });
      }
    },
    [AUTH_HEADER, customPrompt, fetchGames]
  );

  const skeletons = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='shop-game-modern-card shop-blur'
          style={{
            width: 420,
            background: 'var(--background-medium)',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 24,
            border: '2px solid var(--border-color)',
            filter: 'blur(0.5px) grayscale(0.2) brightness(0.8)',
            pointerEvents: 'none',
          }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 160,
              background: '#18181c',
            }}>
            <div className='skeleton-banner' />
            <div className='skeleton-icon' style={{ left: 32, bottom: -48, position: 'absolute' }} />
          </div>
          <div
            style={{
              padding: '56px 32px 24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              minHeight: 160,
            }}>
            <div className='skeleton-title' style={{ width: '60%' }} />
            <div className='skeleton-desc' style={{ width: '90%' }} />
            <div className='skeleton-properties' style={{ width: '40%', height: 32 }} />
          </div>
        </div>
      )),
    []
  );

  const [ownerInfoMap, setOwnerInfoMap] = useState<Record<string, OwnerInfo>>({});
  const [invalidOwnerIds, setInvalidOwnerIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchOwners = async () => {
      const ownersToFetch = games
        .map(g => g.owner_id)
        .filter(Boolean)
        .filter(id => !ownerInfoMap[id] && !invalidOwnerIds.has(id));

      if (ownersToFetch.length === 0) return;

      const newMap: Record<string, OwnerInfo> = {};
      const newInvalidIds: string[] = [];

      await Promise.all(
        ownersToFetch.map(async id => {
          try {
            const info = await getUserFromCache(id);
            if (info) {
              newMap[id] = info;
            } else {
              newInvalidIds.push(id);
            }
          } catch {
            newInvalidIds.push(id);
          }
        })
      );

      if (Object.keys(newMap).length > 0) {
        setOwnerInfoMap(prev => ({ ...prev, ...newMap }));
      }
      if (newInvalidIds.length > 0) {
        setInvalidOwnerIds(prev => new Set([...prev, ...newInvalidIds]));
      }

      setLoading(false);
    };
    if (games.length > 0) fetchOwners();
  }, [games, getUserFromCache, ownerInfoMap, invalidOwnerIds]);

  const validGames = useMemo(() => {
    return games.filter(game => {
      if (!game.owner_id) return true;
      return ownerInfoMap[game.owner_id] && !invalidOwnerIds.has(game.owner_id);
    });
  }, [games, ownerInfoMap, invalidOwnerIds]);

  return {
    games: validGames,
    loading,
    error,
    prompt,
    alert,
    handleBuyGame,
    setAlert,
    setPrompt,
    ownerInfoMap,
    skeletons,
    handlePromptResult,
  };
}

const Desktop: React.FC<ShopProps> = ({ games, loading, error, prompt, alert, handleBuyGame, setAlert, ownerInfoMap, handlePromptResult }) => {
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const genres = useMemo(() => {
    const uniqueGenres = new Set(games.map(game => game.genre).filter(Boolean));
    return Array.from(uniqueGenres);
  }, [games]);

  const stripMarkdown = (text: string) => {
    return text.replace(/[#]+|\*\*|__|\*|_|`|~~|\[.*?\]\(.*?\)|<.*?>/g, '').trim();
  };

  const filteredGames = useMemo(() => {
    return games
      .map(game => ({
        ...game,
        description: game.description ? stripMarkdown(game.description) : game.description,
      }))
      .filter(game => {
        const matchesSearch =
          searchTerm === '' ||
          game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGenre = !selectedGenre || game.genre === selectedGenre;
        return matchesSearch && matchesGenre;
      });
  }, [games, searchTerm, selectedGenre]);

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card mb-8'>
        <h1 className='text-3xl font-bold mb-6' style={{ color: 'var(--glass-text)' }}>
          {t('shop.title')}
        </h1>
        <div className='flex gap-6 items-center'>
          <div className='flex-1'>
            <input type='text' placeholder={t('shop.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className='glass-input w-full py-3 px-4' style={{ minWidth: 0 }} />
          </div>

          {}
        </div>
      </div>

      <div className='min-h-[calc(100vh-16rem)]  w-full justify-content'>
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='shop-game-modern-card shop-blur'
                style={{
                  width: 400,
                  background: 'var(--background-medium)',
                  borderRadius: 16,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: 24,
                  border: '2px solid var(--border-color)',
                  filter: 'blur(0.5px) grayscale(0.2) brightness(0.8)',
                  pointerEvents: 'none',
                }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 160,
                    background: '#18181c',
                  }}>
                  <div className='skeleton-banner' />
                  <div className='skeleton-icon' style={{ left: 32, bottom: -48, position: 'absolute' }} />
                </div>
                <div
                  style={{
                    padding: '56px 32px 24px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                    minHeight: 160,
                  }}>
                  <div className='skeleton-title' style={{ width: '60%' }} />
                  <div className='skeleton-desc' style={{ width: '90%' }} />
                  <div className='skeleton-properties' style={{ width: '40%', height: 32 }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <div className='text-red-500 text-lg mb-2'>{t('shop.error')}</div>
            <button onClick={() => window.location.reload()} className='text-neon-blue hover:underline'>
              {t('shop.retry')}
            </button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className='text-center py-12' style={{ color: 'var(--glass-text-secondary)' }}>
            {searchTerm || selectedGenre ? t('shop.noResults') : t('shop.noGames')}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredGames.map(game => (
              <GameCard key={game.gameId} game={game} ownerInfo={game.owner_id ? ownerInfoMap[game.owner_id] : null} />
            ))}
          </div>
        )}
      </div>

      {prompt && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='glass-card rounded-xl p-6 max-w-md w-full'>
            <h3 className='text-xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
              {t('shop.confirmPurchase')}
            </h3>
            <p className='mb-6' style={{ color: 'var(--glass-text-secondary)' }}>
              {prompt.message}
            </p>
            <div className='flex gap-3'>
              <button onClick={() => handlePromptResult(true)} className='flex-1 glass-button-neon'>
                {t('shop.buy')}
              </button>
              <button onClick={() => handlePromptResult(false)} className='flex-1 glass-button'>
                {t('shop.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {alert && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='glass-card rounded-xl p-6 max-w-md w-full'>
            <p className='mb-4' style={{ color: 'var(--glass-text)' }}>
              {alert.message}
            </p>
            <button onClick={() => setAlert(null)} className='w-full glass-button-neon'>
              {t('shop.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Mobile: React.FC<ShopProps> = ({ games, loading, error, prompt, alert, handleBuyGame, setAlert, ownerInfoMap, handlePromptResult }) => {
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const genres = useMemo(() => {
    const uniqueGenres = new Set(games.map(game => game.genre).filter(Boolean));
    return Array.from(uniqueGenres);
  }, [games]);

  const stripMarkdown = (text: string) => {
    return text.replace(/[#]+|\*\*|__|\*|_|`|~~|\[.*?\]\(.*?\)|<.*?>/g, '').trim();
  };

  const filteredGames = useMemo(() => {
    return games
      .map(game => ({
        ...game,
        description: game.description ? stripMarkdown(game.description) : game.description,
      }))
      .filter(game => {
        const matchesSearch =
          searchTerm === '' ||
          game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGenre = !selectedGenre || game.genre === selectedGenre;
        return matchesSearch && matchesGenre;
      });
  }, [games, searchTerm, selectedGenre]);

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card mb-6'>
        <h1 className='text-2xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
          {t('shop.title')}
        </h1>

        <div className='mb-4'>
          <input type='text' placeholder={t('shop.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className='glass-input w-full py-2.5 px-4' />
        </div>

        <div className='flex gap-2 overflow-x-auto pb-2 -mx-4 px-4'>
          <button onClick={() => setSelectedGenre(null)} className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-sm ${selectedGenre === null ? 'glass-button-neon' : 'glass-button'}`}>
            {t('shop.allGames')}
          </button>
          {genres.map(genre => (
            <button key={genre as string} onClick={() => setSelectedGenre(genre as string)} className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-sm ${selectedGenre === genre ? 'glass-button-neon' : 'glass-button'}`}>
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className='min-h-[calc(100vh-16rem)]'>
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse'>
                <div className='h-48 bg-gray-700'></div>
                <div className='p-4'>
                  <div className='h-4 bg-gray-700 rounded w-3/4 mb-4'></div>
                  <div className='h-4 bg-gray-700 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='text-center py-8'>
            <div className='text-red-500 text-base mb-2'>{t('shop.error')}</div>
            <button onClick={() => window.location.reload()} className='text-neon-blue hover:underline text-sm'>
              {t('shop.retry')}
            </button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className='text-center py-8 text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
            {searchTerm || selectedGenre ? t('shop.noResults') : t('shop.noGames')}
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredGames.map(game => (
              <GameCard key={game.gameId} game={game} ownerInfo={game.owner_id ? ownerInfoMap[game.owner_id] : null} />
            ))}
          </div>
        )}
      </div>

      {prompt && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='glass-card rounded-xl p-5 w-full  mx-4'>
            <h3 className='text-lg font-bold mb-3' style={{ color: 'var(--glass-text)' }}>
              {t('shop.confirmPurchase')}
            </h3>
            <p className='mb-4 text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
              {prompt.message}
            </p>
            <div className='flex gap-2'>
              <button onClick={() => handlePromptResult(true)} className='flex-1 glass-button-neon text-sm'>
                {t('shop.buy')}
              </button>
              <button onClick={() => handlePromptResult(false)} className='flex-1 glass-button text-sm'>
                {t('shop.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {alert && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='glass-card rounded-xl p-5 w-full  mx-4'>
            <p className='mb-4 text-sm' style={{ color: 'var(--glass-text)' }}>
              {alert.message}
            </p>
            <button onClick={() => setAlert(null)} className='w-full glass-button-neon text-sm'>
              {t('shop.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function GameCard({ game, ownerInfo }: { game: Game; ownerInfo: OwnerInfo | null }) {
  return (
    <Link href={`/game?gameId=${game.gameId}`} className='glass-card rounded-xl overflow-hidden flex flex-col shadow-glass transform transition-transform hover:scale-[1.02] hover:shadow-glass-glow cursor-pointer'>
      <div className='relative h-40' style={{ backgroundColor: 'var(--dark-secondary)' }}>
        {game?.bannerHash && <img src={'/banners-icons/' + (game.bannerHash ? game.bannerHash : 'default')} alt='banner' className='absolute inset-0 w-full h-full object-cover opacity-50' />}
        <div className='absolute inset-0 bg-gradient-to-t from-dark-primary to-transparent opacity-60' />
        <img src={'/games-icons/' + (game.iconHash ? game.iconHash : 'default')} alt={game.name} className='absolute -bottom-8 left-8 w-24 h-24 rounded-xl object-contain glass-card border-2 border-glass-border shadow-glass' />
      </div>

      <div className='pt-12 px-8 pb-6 flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <h3 className='text-xl font-bold hover:text-neon-blue transition-colors' style={{ color: 'var(--glass-text)' }}>
              {game.name}
            </h3>
            {game.genre && (
              <span className='text-sm mt-1' style={{ color: 'var(--glass-text-secondary)' }}>
                {game.genre}
              </span>
            )}
          </div>
          <div className='flex items-center gap-2 glass-card px-4 py-2 rounded-lg'>
            <span className='text-neon-yellow font-bold'>{game.price}</span>
            <CachedImage src='/assets/credit.avif' alt='credits' className='w-5 h-5' />
          </div>
        </div>

        {ownerInfo && (
          <Link href={`/profile?user=${ownerInfo.id}`} className='flex items-center gap-3 glass-card rounded-lg p-2 hover:bg-glass-accent transition-colors w-fit relative z-10' onClick={e => e.stopPropagation()}>
            <CachedImage src={`/avatar/${ownerInfo.id}`} alt={ownerInfo.username} className='w-8 h-8 rounded-full object-cover border-2 border-glass-border' />
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium' style={{ color: 'var(--glass-text)' }}>
                {ownerInfo.username}
              </span>
              <Certification user={ownerInfo} className='w-4 h-4 relative -top-0.5' />
            </div>
          </Link>
        )}

        <p className='text-sm line-clamp-3 glass-card p-3 rounded-lg' style={{ color: 'var(--glass-text-secondary)' }}>
          {game.description}
        </p>
      </div>
    </Link>
  );
}

const GameShop: React.FC = () => {
  const shop = useShopLogic();
  const isMobile = useIsMobile();

  return isMobile ? <Mobile {...shop} /> : <Desktop {...shop} />;
};

export default GameShop;
