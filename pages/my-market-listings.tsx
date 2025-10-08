import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
export interface MarketListing {
  id: string; 
  seller_id: string; 
  item_id: string; 
  price: number; 
  status: MarketListingStatus;
  metadata?: { [key: string]: unknown; _unique_id?: string }; 
  created_at: string; 
  updated_at: string; 
  sold_at?: string; 
  buyer_id?: string; 
}

export type MarketListingStatus = 'active' | 'sold' | 'cancelled';

export interface EnrichedMarketListing extends MarketListing {
  
  item_name: string;
  item_description: string;
  item_icon_hash: string;

  
  sellerName?: string;
}

export interface CreateMarketListingRequest {
  item_id: string;
  price: number;
  metadata?: { [key: string]: unknown; _unique_id?: string };
}

function ItemTooltip({ listing }: { listing: EnrichedMarketListing }) {
  return (
    <div
      className='inventory-tooltip'
      style={{
        position: 'fixed',
        left: 'auto',
        top: 'auto',
        zIndex: 1000,
        background: '#222',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        fontSize: 13,
        maxWidth: 320,
        boxShadow: '0 2px 12px #0008',
      }}>
      <div style={{ fontWeight: 'bold', fontSize: 15 }}>{listing.item_name}</div>
      <div style={{ color: '#bbb', marginBottom: 4 }}>{listing.item_description}</div>
      {listing.metadata && Object.keys(listing.metadata).length > 0 && (
        <div style={{ color: '#ffd700', fontSize: 12, marginBottom: 4 }}>
          {Object.entries(listing.metadata)
            .filter(([k]) => k !== '_unique_id')
            .map(([k, v]) => (
              <div key={k}>
                {k}: {String(v)}
              </div>
            ))}
        </div>
      )}
      {listing.price !== undefined && (
        <div style={{ color: '#ffd700', fontSize: 12, marginBottom: 4 }}>
          {` ${listing.price} `} <img src='/assets/credit.avif' alt='credits' style={{ width: 12, verticalAlign: 'middle' }} />
        </div>
      )}
      {listing.metadata?._unique_id && <div style={{ color: '#888', fontSize: 11, fontFamily: 'monospace' }}>{listing.metadata._unique_id}</div>}
    </div>
  );
}

export default function MyMarketListingsPage() {
  const { t } = useTranslation();
  const { user, loading: userLoading } = useAuth();
  const [listings, setListings] = useState<EnrichedMarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    listing: EnrichedMarketListing;
  } | null>(null);

  useEffect(() => {
    if (!user || userLoading) return;
    setLoading(true);
    fetch(`/api/market-listings/user/${user.id}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch listings');
        setListings(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user, userLoading]);

  if (userLoading) return <div>{t('myMarketListings.loading')}</div>;
  if (!user) return <div>{t('myMarketListings.mustLogin')}</div>;

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card' style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <h2>{t('myMarketListings.title')}</h2>
        {loading && <div>{t('myMarketListings.loading')}</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && listings.filter(listing => listing.status !== 'cancelled').length === 0 ? (
          <div>{t('myMarketListings.noActive')}</div>
        ) : (
          <>
            <div className='market-table-wrapper'>
              <table className='market-table'>
                <thead>
                  <tr>
                    <th>{t('myMarketListings.item')}</th>
                    <th>{t('myMarketListings.price')}</th>
                    <th>{t('myMarketListings.status')}</th>
                    <th>{t('myMarketListings.created')}</th>
                    <th>{t('myMarketListings.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {listings
                    .filter(listing => listing.status !== 'cancelled')
                    .map(listing => (
                      <tr key={listing.id}>
                        <td
                          onMouseEnter={e => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setTooltip({
                              x: rect.right + 8,
                              y: rect.top,
                              listing,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          style={{
                            cursor: 'pointer',
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}>
                            <img src={`/items-icons/${listing.item_icon_hash || listing.item_id}`} alt='' width={32} height={32} />
                            {listing.item_name}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {listing.price} <img src='/assets/credit.avif' alt='credits' style={{ width: 14, verticalAlign: 'middle' }} />
                        </td>
                        <td style={{ textAlign: 'center' }}>{listing.status}</td>
                        <td style={{ textAlign: 'center' }}>{new Date(listing.created_at).toISOString().slice(0, 16).replace('T', ' ')}</td>
                        <td style={{ textAlign: 'center' }}>
                          {listing.status === 'active' ? (
                            <button
                              onClick={async () => {
                                if (!confirm('Cancel this listing?')) return;
                                try {
                                  const res = await fetch(`/api/market-listings/${listing.id}/cancel`, {
                                    method: 'PUT',
                                  });
                                  if (!res.ok) throw new Error((await res.json()).message);
                                  setListings(listings => listings.filter(l => l.id !== listing.id));
                                } catch (e: any) {
                                  alert(e.message);
                                }
                              }}>
                              {t('myMarketListings.cancel')}
                            </button>
                          ) : (
                            <span style={{ color: '#888' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {tooltip && (
              <div style={{ position: 'fixed', left: tooltip.x, top: tooltip.y }}>
                <ItemTooltip listing={tooltip.listing} />
              </div>
            )}
            <style jsx>{`
              .market-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                background: #23272e;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 16px #0002;
                margin-top: 16px;
              }
              .market-table th,
              .market-table td {
                padding: 12px 10px;
                text-align: center;
              }
              .market-table th {
                background: #181b20;
                color: #ffd700;
                font-weight: 600;
                font-size: 15px;
                border-bottom: 2px solid #333;
              }
              .market-table td {
                background: #23272e;
                color: #eee;
                font-size: 14px;
                border-bottom: 1px solid #292c33;
                vertical-align: middle;
              }
              .market-table tr:last-child td {
                border-bottom: none;
              }
              .market-table tr:hover td {
                background: #2c313a;
                transition: background 0.15s;
              }
              .market-table img {
                border-radius: 6px;
                background: #181b20;
              }
              .market-table button {
                background: #ff6666;
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 6px 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s;
              }
              .market-table button:hover {
                background: #ff3333;
              }
              @media (max-width: 700px) {
                .market-table {
                  font-size: 12px;
                  min-width: 600px;
                  width: 100%;
                  border-radius: 0;
                  margin-top: 8px;
                }
                .market-table th,
                .market-table td {
                  padding: 8px 4px;
                  font-size: 12px;
                }
                .market-table th {
                  font-size: 13px;
                }
                .market-table img {
                  width: 24px !important;
                  height: 24px !important;
                }
                .market-table button {
                  padding: 4px 8px;
                  font-size: 12px;
                }
                
                .market-table-wrapper {
                  overflow-x: auto;
                  -webkit-overflow-scrolling: touch;
                }
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}


