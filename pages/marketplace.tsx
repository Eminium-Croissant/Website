import Link from 'next/link';
import { useEffect, useState } from 'react';
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

export interface EnrichedMarketListing {
  id: string;
  seller_id: string;
  item_id: string;
  price: number;
  status: string;
  metadata?: { [key: string]: unknown; _unique_id?: string };
  created_at: string;
  updated_at: string;
  sold_at?: string;
  buyer_id?: string;
  purchasePrice?: number;
  item_name: string;
  item_description: string;
  item_icon_hash: string;
  sellerName?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  credits: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface ApiErrorResponse {
  message: string;
  error?: string;
}

interface BuyResponse {
  success: boolean;
  message?: string;
}

interface BuyOrderResponse {
  id: string;
  message?: string;
}

interface Item {
  id: string;
  itemId: string; // for compatibility
  name: string;
  description: string;
  icon_hash?: string;
  iconHash?: string; // for compatibility
  game_id: string;
  price?: number;
}

function useMarketplaceLogic() {
  const { user, loading: userLoading } = useAuth();
  const [listings, setListings] = useState<EnrichedMarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuyOrderModal, setShowBuyOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EnrichedMarketListing | null>(null);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const { getUser: getUserFromCache } = useUserCache();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/market-listings?limit=100`)
      .then(async res => {
        const data = (await res.json()) as EnrichedMarketListing[] | ApiErrorResponse;
        if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Failed to fetch listings');
        setListings(data as EnrichedMarketListing[]);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const uniqueSellerIds = Array.from(new Set(listings.map(l => l.seller_id)));
    const missing = uniqueSellerIds.filter(id => !(id in sellerNames));
    if (missing.length === 0) return;
    Promise.all(missing.map(id => getUserFromCache(id).catch(() => null))).then(users => {
      const newNames: Record<string, string> = {};
      users.forEach((user, idx) => {
        if (user && user.username) newNames[missing[idx]] = user.username;
      });
      setSellerNames(prev => ({ ...prev, ...newNames }));
    });
  }, [listings]);

  const handleBuy = async (listing: EnrichedMarketListing) => {
    if (!user) return alert('You must be logged in to buy.');
    if (!confirm(`Buy "${listing.item_name}" for ${listing.price} credits?`)) return;
    try {
      const res = await fetch(`/api/market-listings/${listing.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = (await res.json()) as BuyResponse | ApiErrorResponse;
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Purchase failed');
      alert('Purchase successful!');
      setListings(listings => listings.filter(l => l.id !== listing.id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const [buyOrderItemId, setBuyOrderItemId] = useState('');
  const [buyOrderPrice, setBuyOrderPrice] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [buyOrderItemSearch, setBuyOrderItemSearch] = useState('');
  const [buyOrderItemResults, setBuyOrderItemResults] = useState<Item[]>([]);
  const [buyOrderDropdownOpen, setBuyOrderDropdownOpen] = useState(false);

  const handlePlaceBuyOrder = async () => {
    if (!user) return alert('You must be logged in.');
    if (!buyOrderItemId || buyOrderPrice <= 0) return alert('All fields are required.');
    setPlacingOrder(true);
    try {
      const res = await fetch('/api/buy-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: buyOrderItemId,
          price: buyOrderPrice,
        }),
      });
      const data = (await res.json()) as BuyOrderResponse | ApiErrorResponse;
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Failed to place buy order');
      alert('Buy order placed!');
      setShowBuyOrderModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleItemSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setBuyOrderItemResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/items/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const items = (await res.json()) as Item[];
      setBuyOrderItemResults(items);
    } catch {
      setBuyOrderItemResults([]);
    }
  };

  return {
    user,
    listings,
    loading,
    error,
    showBuyOrderModal,
    setShowBuyOrderModal,
    sellerNames,
    handleBuy,
    buyOrderItemId,
    setBuyOrderItemId,
    buyOrderPrice,
    setBuyOrderPrice,
    placingOrder,
    buyOrderItemSearch,
    setBuyOrderItemSearch,
    buyOrderItemResults,
    setBuyOrderItemResults,
    buyOrderDropdownOpen,
    setBuyOrderDropdownOpen,
    handlePlaceBuyOrder,
    handleItemSearch,
  };
}

function MarketplaceDesktop(props: ReturnType<typeof useMarketplaceLogic>) {
  const { user, listings, loading, error, showBuyOrderModal, setShowBuyOrderModal, sellerNames, handleBuy, buyOrderItemId, setBuyOrderItemId, buyOrderPrice, setBuyOrderPrice, placingOrder, buyOrderItemSearch, setBuyOrderItemSearch, buyOrderItemResults, buyOrderDropdownOpen, setBuyOrderDropdownOpen, handlePlaceBuyOrder, handleItemSearch } = props;

  const { t } = useTranslation();

  return (
    <div className='min-h-screen bg-glass-gradient'>
      <div className='glass-page-container11a00w-axluto p-6'>
        <div className='mb-8'>
          <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
            <h1 className='glass-title text-4xl'>{t('marketplace.title')}</h1>
            <div className='flex gap-3'>
              <button className='glass-button-neon glass-glow' onClick={() => setShowBuyOrderModal(true)}>
                {t('marketplace.placeBuyOrder')}
              </button>
              {user && (
                <Link href='/my-buy-orders'>
                  <button className='glass-button'>{t('marketplace.myBuyOrders')}</button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {loading && <div className='glass-content-card text-glass-text-secondary text-center py-8'>{t('marketplace.loading')}</div>}

        {error && <div className='glass-content-card text-red-400 text-center py-8'>{t('marketplace.error')}</div>}

        {!loading && listings.length === 0 ? (
          <div className='glass-content-card text-glass-text-secondary text-center py-8'>{t('marketplace.noItems')}</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border-separate border-spacing-0 glass-card overflow-hidden mt-4'>
              <thead>
                <tr>
                  <th className='bg-glass-dark/50 text-glass-text font-semibold text-sm p-3 border-b border-glass-border text-left'>{t('marketplace.item')}</th>
                  <th className='bg-glass-dark/50 text-glass-text font-semibold text-sm p-3 border-b border-glass-border'>{t('marketplace.description')}</th>
                  <th className='bg-glass-dark/50 text-glass-text font-semibold text-sm p-3 border-b border-glass-border'>{t('marketplace.seller')}</th>
                  <th className='bg-glass-dark/50 text-glass-text font-semibold text-sm p-3 border-b border-glass-border'>{t('marketplace.price')}</th>
                  <th className='bg-glass-dark/50 text-glass-text font-semibold text-sm p-3 border-b border-glass-border'>{t('marketplace.listed')}</th>
                  <th className='bg-glass-dark/50 text-glass-text font-semibold text-sm p-3 border-b border-glass-border'></th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.id} className='hover:bg-glass-dark/30 transition-colors'>
                    <td className='p-3 text-glass-text border-b border-glass-border/50'>
                      <div className='flex items-center gap-2 relative'>
                        <CachedImage src={`/items-icons/${listing.item_icon_hash || listing.item_id}`} alt='' className='w-8 h-8 rounded-lg bg-glass-dark/50' />
                        {listing.metadata?._unique_id && (
                          <span
                            className='absolute top-0.5 left-6 w-2.5 h-2.5 rounded-full bg-neon-yellow border border-black z-10 cursor-pointer'
                            onMouseEnter={e => {
                              const tooltip = document.createElement('div');
                              tooltip.innerText =
                                Object.entries(listing.metadata)
                                  .filter(([key]) => key !== '_unique_id')
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ') || 'Metadata';
                              tooltip.className = 'fixed glass-card text-neon-yellow px-3 py-1.5 rounded-lg text-xs z-50 marketplace-metadata-tooltip';
                              tooltip.style.left = e.clientX + 12 + 'px';
                              tooltip.style.top = e.clientY + 'px';
                              document.body.appendChild(tooltip);
                              const removeTooltip = () => {
                                document.body.querySelectorAll('.marketplace-metadata-tooltip').forEach(t => t.remove());
                                e.target.removeEventListener('mouseleave', removeTooltip);
                              };
                              e.target.addEventListener('mouseleave', removeTooltip);
                            }}
                          />
                        )}
                        {listing.item_name}
                      </div>
                    </td>
                    <td className='p-3 text-glass-text-secondary border-b border-glass-border/50[2ax-w-[260px]'>{listing.item_description}</td>
                    <td className='p-3 text-glass-text border-b border-glass-border/50'>
                      <div className='flex items-center gap-2'>
                        <CachedImage src={`/avatar/${listing.seller_id}`} alt='' className='w-6 h-6 rounded-full' />
                        {sellerNames[listing.seller_id] || listing.seller_id}
                      </div>
                    </td>
                    <td className='p-3 text-glass-text border-b border-glass-border/50'>
                      {listing.price}
                      <CachedImage src='/assets/credit.avif' alt='credits' className='w-3.5 inline-block ml-1 align-middle' />
                    </td>
                    <td className='p-3 text-glass-text border-b border-glass-border/50'>{typeof window === 'undefined' ? new Date(listing.created_at).toISOString().slice(0, 16).replace('T', ' ') : new Date(listing.created_at).toLocaleString()}</td>{' '}
                    <td className='p-3 text-glass-text border-b border-glass-border/50'>
                      {user && listing.seller_id !== user.id ? (
                        <button className='glass-button text-sm' onClick={() => handleBuy(listing)}>
                          {t('marketplace.buy')}
                        </button>
                      ) : (
                        <span className='text-glass-text-secondary'>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showBuyOrderModal && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
            <div className='glass-card glass-glow p-8 min-w-[340px] max-w-md'>
              <h3 className='glass-title text-2xl mb-6'>{t('marketplace.modalTitle')}</h3>
              <div className='mb-4 relative'>
                <label className='text-glass-text'>
                  {t('marketplace.item')}&nbsp;
                  <input
                    type='text'
                    value={buyOrderItemSearch}
                    onChange={async e => {
                      setBuyOrderItemSearch(e.target.value);
                      setBuyOrderDropdownOpen(true);
                      await handleItemSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (buyOrderItemSearch.length > 1) setBuyOrderDropdownOpen(true);
                    }}
                    onBlur={() => setTimeout(() => setBuyOrderDropdownOpen(false), 150)}
                    placeholder={t('marketplace.searchItem')}
                    className='glass-input w-[180px]'
                  />
                  {buyOrderDropdownOpen && buyOrderItemResults.length > 0 && (
                    <ul className='absolute left-0 right-0 top-[36px] glass-card border border-glass-border rounded-lg max-h-[200px] overflow-y-auto z-50'>
                      {buyOrderItemResults.map(item => (
                        <li
                          key={item.itemId}
                          className='flex items-center gap-2 p-3 cursor-pointer border-b border-glass-border hover:bg-glass-dark/30 transition-colors'
                          onMouseDown={() => {
                            setBuyOrderItemId(item.itemId);
                            setBuyOrderItemSearch(item.name);
                            setBuyOrderPrice(item.price || 1);
                            setBuyOrderDropdownOpen(false);
                          }}>
                          <CachedImage src={`/items-icons/${item.iconHash || item.itemId}`} alt='icon' className='w-6 h-6 rounded bg-glass-dark/50' />
                          <span className='text-glass-text'>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>
              <div className='mb-6'>
                <label className='text-glass-text'>
                  {t('marketplace.price')}&nbsp;
                  <input type='number' min={1} value={buyOrderPrice} onChange={e => setBuyOrderPrice(Number(e.target.value))} className='glass-input w-[100px]' />
                </label>
              </div>
              <div className='flex gap-3'>
                <button onClick={handlePlaceBuyOrder} disabled={placingOrder} className='flex-1 glass-button-neon glass-glow disabled:opacity-50'>
                  {placingOrder ? t('marketplace.placing') : t('marketplace.confirm')}
                </button>
                <button onClick={() => setShowBuyOrderModal(false)} className='flex-1 glass-button'>
                  {t('marketplace.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketplaceMobile(props: ReturnType<typeof useMarketplaceLogic>) {
  const { user, listings, loading, error, showBuyOrderModal, setShowBuyOrderModal, sellerNames, handleBuy, buyOrderItemId, setBuyOrderItemId, buyOrderPrice, setBuyOrderPrice, placingOrder, buyOrderItemSearch, setBuyOrderItemSearch, buyOrderItemResults, buyOrderDropdownOpen, setBuyOrderDropdownOpen, handlePlaceBuyOrder, handleItemSearch } = props;

  const { t } = useTranslation();

  return (
    <div className='min-h-screen bg-glass-gradient'>
      <div className='glass-page-container[4p -w-lg0.98em]'>
        <div className='flex flex-col gap-3 mb-4'>
          <h1 className='glass-title text-2xl'>{t('marketplace.title')}</h1>
          <div className='flex gap-2 flex-wrap'>
            <button className='glass-button-neon text-sm px-3 py-1.5' onClick={() => setShowBuyOrderModal(true)}>
              {t('marketplace.placeBuyOrder')}
            </button>
            {user && (
              <Link href='/my-buy-orders'>
                <button className='glass-button text-sm px-3 py-1.5'>{t('marketplace.myBuyOrders')}</button>
              </Link>
            )}
          </div>
        </div>

        {loading && <div className='glass-content-card text-glass-text-secondary text-center py-6'>{t('marketplace.loading')}</div>}
        {error && <div className='glass-content-card text-red-400 text-center py-6'>{t('marketplace.error')}</div>}

        {!loading && listings.length === 0 ? (
          <div className='glass-content-card text-glass-text-secondary text-center py-6'>{t('marketplace.noItems')}</div>
        ) : (
          <div className='flex flex-col gap-3'>
            {listings.map(listing => (
              <div key={listing.id} className='glass-card p-3 flex flex-col gap-2 relative'>
                <div className='flex items-center gap-2.5 relative'>
                  <CachedImage src={`/items-icons/${listing.item_icon_hash || listing.item_id}`} alt='' className='w-9 h-9 rounded-lg bg-glass-dark/50' />
                  {listing.metadata?._unique_id && (
                    <div
                      className='absolute top-1 left-8 w-2.5 h-2.5 rounded-full bg-neon-yellow border border-black z-10'
                      onMouseEnter={e => {
                        const tooltip = document.createElement('div');
                        tooltip.innerText =
                          Object.entries(listing.metadata)
                            .filter(([key]) => key !== '_unique_id')
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ') || 'Metadata';
                        tooltip.className = 'fixed glass-card text-neon-yellow px-3 py-1.5 rounded-lg text-xs z-50 marketplace-metadata-tooltip';
                        tooltip.style.left = e.clientX + 12 + 'px';
                        tooltip.style.top = e.clientY + 'px';
                        document.body.appendChild(tooltip);
                        const removeTooltip = () => {
                          document.body.querySelectorAll('.marketplace-metadata-tooltip').forEach(t => t.remove());
                          e.target.removeEventListener('mouseleave', removeTooltip);
                        };
                        e.target.addEventListener('mouseleave', removeTooltip);
                      }}
                    />
                  )}
                  <div>
                    <div className='font-semibold text-[1.05em] text-glass-text'>{listing.item_name}</div>
                    <div className='text-glass-text-secondary text-[0.97em]'>{listing.item_description}</div>
                  </div>
                </div>

                <div className='flex items-center gap-2 mt-1'>
                  <CachedImage src={`/avatar/${listing.seller_id}`} alt='' className='w-6 h-6 rounded-full' />
                  <span className='text-glass-text text-[0.97em]'>{sellerNames[listing.seller_id] || listing.seller_id}</span>
                  <span className='ml-auto text-glass-text font-semibold'>
                    {listing.price}
                    <CachedImage src='/assets/credit.avif' alt='credits' className='w-3.5 inline-block ml-1 align-middle' />
                  </span>
                </div>

                <div className='flex items-center gap-2 mt-0.5'>
                  <span className='text-glass-text-secondary text-[0.93em]'>Listed: {new Date(listing.created_at).toLocaleString()}</span>
                  <span className='ml-auto'>
                    {user && listing.seller_id !== user.id ? (
                      <button className='glass-button text-[0.97em] px-3.5 py-1.5' onClick={() => handleBuy(listing)}>
                        {t('marketplace.buy')}
                      </button>
                    ) : (
                      <span className='text-glass-text-secondary'>—</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {showBuyOrderModal && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50'>
            <div className='glass-card glass-glow w-full maw-w-lg[480px] rounded-xl p-4.5 shadow-lg animate-slideUp'>
              <div className='w-10 h-1 bg-glass-border rounded mx-auto mb-4' />
              <h3 className='glass-title text-xl text-center mb-4'>{t('marketplace.modalTitle')}</h3>

              <div className='mb-3 relative'>
                <label className='font-medium text-glass-text'>
                  {t('marketplace.item')}
                  <input
                    type='text'
                    value={buyOrderItemSearch}
                    onChange={async e => {
                      setBuyOrderItemSearch(e.target.value);
                      setBuyOrderDropdownOpen(true);
                      await handleItemSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (buyOrderItemSearch.length > 1) setBuyOrderDropdownOpen(true);
                    }}
                    onBlur={() => setTimeout(() => setBuyOrderDropdownOpen(false), 150)}
                    placeholder={t('marketplace.searchItem')}
                    className='glass-input w-full mt-1'
                  />
                  {buyOrderDropdownOpen && buyOrderItemResults.length > 0 && (
                    <ul className='absolute left-0 right-0 top-[70px] glass-card border border-glass-border rounded-lg max-h-[140px] overflow-y-auto z-50'>
                      {buyOrderItemResults.map(item => (
                        <li
                          key={item.itemId}
                          className='flex items-center gap-2 p-2 cursor-pointer border-b border-glass-border hover:bg-glass-dark/30 transition-colors'
                          onMouseDown={() => {
                            setBuyOrderItemId(item.itemId);
                            setBuyOrderItemSearch(item.name);
                            setBuyOrderPrice(item.price || 1);
                            setBuyOrderDropdownOpen(false);
                          }}>
                          <CachedImage src={`/items-icons/${item.iconHash || item.itemId}`} alt='icon' className='w-6 h-6 rounded bg-glass-dark/50' />
                          <span className='text-glass-text'>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>

              <div className='mb-4'>
                <label className='font-medium text-glass-text'>
                  {t('marketplace.price')}
                  <input type='number' min={1} value={buyOrderPrice} onChange={e => setBuyOrderPrice(Number(e.target.value))} className='glass-input w-full mt-1' />
                </label>
              </div>

              <div className='flex gap-2 mt-3'>
                <button onClick={handlePlaceBuyOrder} disabled={placingOrder} className='flex-1 glass-button-neon glass-glow py-2.5 text-sm disabled:opacity-50'>
                  {placingOrder ? t('marketplace.placing') : t('marketplace.confirm')}
                </button>
                <button onClick={() => setShowBuyOrderModal(false)} className='flex-1 glass-button py-2.5 text-sm'>
                  {t('marketplace.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0.7;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.18s cubic-bezier(0.4, 1.4, 0.6, 1) 1;
          }
        `}</style>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const isMobile = useIsMobile();
  const logic = useMarketplaceLogic();
  return isMobile ? <MarketplaceMobile {...logic} /> : <MarketplaceDesktop {...logic} />;
}
