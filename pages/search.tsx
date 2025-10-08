import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Certification from '../components/common/Certification';
import CachedImage from '../components/utils/CachedImage';
import useAuth from '../hooks/useAuth';
import useUserCache from '../hooks/useUserCache';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const API_ENDPOINT = '/api';

interface User {
  id: string;
  username: string;
  verified: boolean;
  isStudio?: boolean;
  admin?: boolean;
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
}

interface Item {
  itemId: string;
  name: string;
  description: string;
  owner: string;
  price: number;
  iconHash?: string;
  showInStore?: boolean;
}

const SearchPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { cacheUser } = useUserCache();
  const { t } = useTranslation('common');

  
  useEffect(() => {
    if (!query) {
      setUsers([]);
      setGames([]);
      setItems([]);
      return;
    }

    const controller = new AbortController();
    const debounceTimeout = setTimeout(() => {
      fetch(`${API_ENDPOINT}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(async data => {
          
          if (Array.isArray(data.users)) {
            for (const u of data.users) {
              await cacheUser(u); 
            }
          }
          setUsers(Array.isArray(data.users) ? data.users : []);
          setGames(Array.isArray(data.games) ? data.games : []);
          setItems(Array.isArray(data.items) ? data.items : []);
        })
        .catch(() => {
          setUsers([]);
          setGames([]);
          setItems([]);
        });
    }, 400); 

    return () => {
      clearTimeout(debounceTimeout);
      controller.abort();
    };
  }, [query, token, user?.admin]);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);

  
  const handleBuy = (item: Item) => {
    setSelectedItem(item);
    setBuyModalOpen(true);
    setBuyError(null);
    setBuySuccess(null);
  };
  const handleBuySubmit = async (amount: number) => {
    if (!selectedItem) return;
    setBuyLoading(true);
    setBuyError(null);
    setBuySuccess(null);
    try {
      const res = await fetch(`/api/items/buy/${selectedItem.itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to buy item');
      setBuySuccess('Item purchased!');
      setBuyModalOpen(false);
    } catch (e: any) {
      setBuyError(e.message);
    } finally {
      setBuyLoading(false);
    }
  };

  if (!query) {
    return (
      <div className='glass-page-container'>
        <div className='glass-content-card text-center py-12'>
          <h1 className='text-2xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
            {t('search.enterQuery')}
          </h1>
        </div>
      </div>
    );
  }

  
  function ItemBuyModal({ open, onClose, onBuy, item }: { open: boolean; onClose: () => void; onBuy: (amount: number) => void; item: Item | null }) {
    const [amount, setAmount] = useState(1);
    useEffect(() => {
      if (open) setAmount(1);
    }, [open]);
    if (!open || !item) return null;
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
        <div className='glass-card rounded-xl p-6 max-w-md w-full'>
          <div className='flex items-center gap-4 mb-6'>
            <CachedImage src={'/items-icons/' + (item.iconHash || item.itemId)} alt={item.name} className='w-16 h-16 object-contain rounded-xl glass-card border-2 border-glass-border' />
            <div className='flex-1'>
              <div className='text-xl font-bold mb-2' style={{ color: 'var(--glass-text)' }}>
                {item.name}
              </div>
              <div className='text-sm mb-2' style={{ color: 'var(--glass-text-secondary)' }}>
                {item.description}
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-neon-yellow font-bold'>
                  {t('search.price')}: {item.price}
                </span>
                <CachedImage src='/assets/credit.avif' className='w-5 h-5' />
              </div>
            </div>
          </div>
          <div className='mb-4' style={{ color: 'var(--glass-text)' }}>
            <Trans i18nKey='search.buyHowMany' values={{ item: item.name }} />
          </div>
          <div className='mb-6'>
            <input type='number' min={1} value={amount} onChange={e => setAmount(Math.max(1, Number(e.target.value)))} className='glass-input w-full py-2 px-4 mb-2' />
            <div className='flex items-center gap-2'>
              <span style={{ color: 'var(--glass-text-secondary)' }}>
                <Trans i18nKey='search.total' values={{ total: amount * (item.price || 0) }} />
              </span>
              <CachedImage src='/assets/credit.avif' className='w-5 h-5' />
            </div>
          </div>
          <div className='flex gap-3'>
            <button className='flex-1 glass-button-neon' onClick={() => onBuy(amount)}>
              {t('search.buy')}
            </button>
            <button className='flex-1 glass-button' onClick={onClose}>
              {t('search.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card mb-8'>
        <h1 className='text-3xl font-bold mb-6' style={{ color: 'var(--glass-text)' }}>
          <Trans i18nKey='search.resultsFor' values={{ query }} components={{ strong: <strong /> }} />
        </h1>
      </div>
      
      {users.length > 0 && (
        <div className='glass-content-card mb-8'>
          <h2 className='text-2xl font-bold mb-6' style={{ color: 'var(--glass-text)' }}>
            {t('search.users')}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {users.map(user => (
              <Link key={user.id} href={`/profile?user=${user.id}`} className='no-underline'>
                <div className='glass-card p-4 hover:scale-105 transition-transform duration-300 hover:shadow-glass-glow'>
                  <div className='flex items-center gap-4'>
                    <CachedImage src={`/avatar/${user.id}`} alt='User Avatar' className='w-12 h-12 rounded-full object-cover border-2 border-glass-border' />
                    <div className='flex-1'>
                      <div className='font-semibold mb-1 flex items-center gap-2' style={{ color: 'var(--glass-text)' }}>
                        {user.username?.length > 15 ? user.username.substring(0, 15) + '...' : user.username}
                        <Certification user={user} className='w-4 h-4' />
                      </div>
                      <div className='text-xs' style={{ color: 'var(--glass-text-secondary)' }}>
                        {user.id}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {games.length > 0 && (
        <div className='glass-content-card mb-8'>
          <h2 className='text-2xl font-bold mb-6' style={{ color: 'var(--glass-text)' }}>
            {t('search.games')}
          </h2>
          <div className='space-y-4'>
            {games.map(game => (
              <Link key={game.gameId} href={`/game?gameId=${game.gameId}`} className='no-underline'>
                <div className='glass-card p-4 hover:scale-105 transition-transform duration-300 hover:shadow-glass-glow'>
                  <div className='flex items-center gap-4'>
                    <CachedImage src={game.iconHash ? `/games-icons/${game.iconHash}` : '/games-icons/default.avif'} alt={game.name} className='w-16 h-16 object-contain rounded-xl glass-card border-2 border-glass-border' />
                    <div className='flex-1'>
                      <div className='text-xl font-bold mb-1' style={{ color: 'var(--glass-text)' }}>
                        {game.name}
                      </div>
                      <div className='text-sm mb-2' style={{ color: 'var(--glass-text-secondary)' }}>
                        {game.genre}
                      </div>
                      <div className='text-sm mb-3 line-clamp-2' style={{ color: 'var(--glass-text-secondary)' }}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
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
                                  display: 'inline-block',
                                  verticalAlign: 'middle',
                                }}
                                alt={props.alt ?? ''}
                              />
                            ),
                          }}>
                          {game.description || ''}
                        </ReactMarkdown>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-neon-yellow font-bold text-lg'>{game.price}</span>
                        <CachedImage src='/assets/credit.avif' alt='credits' className='w-5 h-5' />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {items.length > 0 && (
        <div className='glass-content-card mb-8'>
          <h2 className='text-2xl font-bold mb-6' style={{ color: 'var(--glass-text)' }}>
            {t('search.items')}
          </h2>
          <div className='space-y-4'>
            {items.map(item => (
              <Link
                key={item.itemId}
                href={'about:blank'}
                onClick={e => {
                  e.preventDefault();
                  handleBuy(item);
                }}
                className='no-underline'>
                <div className='glass-card p-4 hover:scale-105 transition-transform duration-300 hover:shadow-glass-glow'>
                  <div className='flex items-center gap-4'>
                    <CachedImage src={`/items-icons/${item?.iconHash || item.itemId ? item.iconHash || item.itemId : 'default.aviv'}`} alt={item.name} className='w-16 h-16 object-contain rounded-xl glass-card border-2 border-glass-border' />
                    <div className='flex-1'>
                      <div className='text-xl font-bold mb-1' style={{ color: 'var(--glass-text)' }}>
                        {item.name}
                      </div>
                      <div className='text-sm mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
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
                                  display: 'inline-block',
                                  verticalAlign: 'middle',
                                }}
                                alt={props.alt ?? ''}
                              />
                            ),
                          }}>
                          {item.description || ''}
                        </ReactMarkdown>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-neon-yellow font-bold text-lg'>{item.price}</span>
                        <CachedImage src='/assets/credit.avif' alt='credits' className='w-5 h-5' />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <ItemBuyModal open={buyModalOpen} onClose={() => setBuyModalOpen(false)} onBuy={handleBuySubmit} item={selectedItem} />
      
      {buyLoading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='glass-card rounded-xl p-6 max-w-md w-full text-center'>
            <div style={{ color: 'var(--glass-text)' }}>{t('search.buyingItem')}</div>
          </div>
        </div>
      )}
      {buyError && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='glass-card rounded-xl p-6 max-w-md w-full'>
            <div className='text-red-500 mb-4'>{buyError}</div>
            <button className='w-full glass-button-neon' onClick={() => setBuyError(null)}>
              {t('search.ok')}
            </button>
          </div>
        </div>
      )}
      {buySuccess && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='glass-card rounded-xl p-6 max-w-md w-full'>
            <div className='mb-4' style={{ color: 'var(--glass-text)' }}>
              {t('search.itemPurchased')}
            </div>
            <button className='w-full glass-button-neon' onClick={() => setBuySuccess(null)}>
              {t('search.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;


