import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { ShopItem } from '../pages/profile';
import CachedImage from './utils/CachedImage';
import { useTranslation } from './utils/CloudflareI18n';

const endpoint = '/api';

export interface Item {
  iconHash: string;
  item_id: string;
  name: string;
  description: string;
  amount: number;
  price?: number;
  purchasePrice?: number;
  owner?: string;
  showInStore?: boolean;
  deleted?: boolean;
  sellable?: boolean;
  rarity: 'very-common' | 'common' | 'uncommon' | 'rare' | 'very-rare' | 'epic' | 'ultra-epic' | 'legendary' | 'ancient' | 'mythic' | 'godlike' | 'radiant';
  custom_url_link?: string;
  metadata?: Record<string, any>;
  metadataString: string;
}

interface InventoryResponse {
  items: Item[];
}

interface ApiErrorResponse {
  message: string;
  error?: string;
}

interface ItemDetailsResponse {
  id: string;
  name: string;
  description?: string;
  rarity: string;
  game: string;
  gameItemId?: string;
  creator?: {
    id: string;
    username: string;
    discordId?: string;
  };
  thumbnailUrl?: string;
  iconUrl?: string;
  animatedIconUrl?: string;
  metadataUrl?: string;
  stackable?: boolean;
  tradeable?: boolean;
  sellable?: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface UserDetailsResponse {
  id: string;
  username: string;
  discordId?: string;
  isOnline?: boolean;
}

interface User {
  verified: boolean;
  id: string;
  username: string;
  disabled?: boolean;
  admin?: boolean;
  isStudio?: boolean;
  inventory?: (Item & { amount: number; rarity: string })[];
  ownedItems?: ShopItem[];
}

interface Props {
  profile: User;
  isMe?: boolean;
  reloadFlag: number;
}

export default function Inventory({ profile, isMe, reloadFlag }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<{
    message: string;
    resolve: (value: { confirmed: boolean; amount?: number; price?: number }) => void;
    maxAmount?: number;
    amount?: number;
    price?: number;
    showPrice?: boolean;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [ownerUser, setOwnerUser] = useState<any | null>(null);

  const { user } = useAuth();
  const selectedUser = profile.id === 'me' ? user?.id || 'me' : profile.id;
  const { t } = useTranslation();

  useEffect(() => {
    const processedItems = (profile.inventory || []).map(
      (item: any) =>
        ({
          ...item,
          uniqueId: item.metadata?._unique_id as string | undefined,
          sellable: item.sellable ?? false,
        }) as Item
    );
    setItems(processedItems);
    setLoading(false);
  }, [profile.inventory]);

  useEffect(() => {
    if (reloadFlag) refreshInventory();
  }, [reloadFlag]);

  function refreshInventory() {
    fetch(`${endpoint}/inventory/${selectedUser}`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch inventory'))))
      .then((data: InventoryResponse) => {
        const processedItems = (data.items || []).map(
          (item: any) =>
            ({
              ...item,
              uniqueId: item.metadata?._unique_id as string | undefined,
              sellable: item.sellable ?? false,
              iconHash: item.iconHash || item.item_id,
            }) as Item
        );
        setItems(processedItems);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  const handlePromptAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (prompt) {
      const value = Math.max(1, Math.min(Number(e.target.value), prompt.maxAmount || 1));
      setPrompt(prev => (prev ? { ...prev, amount: value } : null));
    }
  };

  const handlePromptPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (prompt) {
      const value = Math.max(1, Number(e.target.value));
      setPrompt(prev => (prev ? { ...prev, price: value } : null));
    }
  };

  const customPromptSell = (item: Item) => {
    return new Promise<{ confirmed: boolean; amount?: number }>(resolve => {
      setPrompt({
        message: t('inventory.sellPrompt', { item: item.name }),
        resolve: ({ confirmed, amount }) => resolve({ confirmed, amount }),
        maxAmount: item.amount,
        amount: 1,
        showPrice: false,
      });
    });
  };

  const customPromptDrop = (item: Item) => {
    return new Promise<{ confirmed: boolean; amount?: number }>(resolve => {
      setPrompt({
        message: t('inventory.dropPrompt', { item: item.name }),
        resolve: ({ confirmed, amount }) => resolve({ confirmed, amount }),
        maxAmount: item.amount,
        amount: 1,
        showPrice: false,
      });
    });
  };

  const handleSell = async (item: Item, dataItemIndex: number) => {
    if (!isMe) return;
    if (item.metadata) {
      setError('Items with metadata cannot be sold');
      return;
    }
    if (!item.sellable) {
      setError('This item cannot be sold. Only purchased items or items obtained from trades can be sold.');
      return;
    }
    const result = await customPromptSell(item);
    if (!result.confirmed || !result.amount || result.amount <= 0) return;
    const requestBody: any = { amount: result.amount, dataItemIndex };
    if (item.purchasePrice !== undefined) requestBody.purchasePrice = item.purchasePrice;
    fetch(`${endpoint}/items/sell/${item.item_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then(async res => {
        const data: ApiErrorResponse = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to sell item');
        return data;
      })
      .then(() => {
        refreshInventory();
      })
      .catch(err => setError(err.message));
  };

  const handleAuction = async (item: Item) => {
    if (!isMe) return;

    let price = 0;
    let confirmed = false;
    await new Promise<void>(resolve => {
      setPrompt({
        message: t('inventory.auctionPrompt', { item: item.name }),
        resolve: ({ confirmed: c, price: p }) => {
          confirmed = c;
          price = p || 0;
          resolve();
        },
        showPrice: true,
        price: item.purchasePrice || 1,
      });
    });
    if (!confirmed || price <= 0) return;

    fetch('/api/market-listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inventoryItem: item,
        sellingPrice: price,
      }),
    })
      .then(async res => {
        const data: ApiErrorResponse = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to auction item');
        return data;
      })
      .then(() => {
        refreshInventory();
      })
      .catch(err => setError(err.message));
  };

  const handleDrop = async (item: Item, dataItemIndex: number) => {
    if (!isMe) return;
    const result = await customPromptDrop(item);
    if (!result.confirmed || !result.amount || result.amount <= 0) return;
    let requestBody: any = { amount: result.amount, dataItemIndex };
    if (item.purchasePrice !== undefined) requestBody.purchasePrice = item.purchasePrice;
    if (item.metadata && item.metadata._unique_id) requestBody = { uniqueId: item.metadata._unique_id, dataItemIndex };
    fetch(`${endpoint}/items/drop/${item.item_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then(async res => {
        const data: ApiErrorResponse = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to drop item');
        return data;
      })
      .then(() => {
        refreshInventory();
      })
      .catch(err => setError(err.message));
  };

  const handleItemClick = async (item: Item) => {
    try {
      const res = await fetch(`${endpoint}/items/${item.item_id}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch item details');
      const details: ItemDetailsResponse = await res.json();
      let ownerUser: UserDetailsResponse | null = null;
      if (details.creator?.id) {
        const userRes = await fetch(`${endpoint}/users/${details.creator.id}`);
        if (userRes.ok) ownerUser = await userRes.json();
      }
      setSelectedItem({
        ...item,
        ...details,
        amount: item.amount,
        rarity: item.rarity, // Keep the original item's rarity which has the correct type
      });
      setOwnerUser(ownerUser);
    } catch {
      setSelectedItem(item);
      setOwnerUser(null);
    }
  };

  const handleBackToInventory = () => {
    setSelectedItem(null);
    setOwnerUser(null);
  };

  const formatMetadata = (metadata?: { [key: string]: unknown }) => {
    if (!metadata) return null;

    const displayMetadata = Object.entries(metadata)
      .filter(([key]) => key !== '_unique_id')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return displayMetadata || null;
  };

  const rarityColors: Record<string, string> = {
    'very-common': '#B0B0B0',
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    'very-rare': '#1976D2',
    epic: '#7B1FA2',
    'ultra-epic': '#9C27B0',
    legendary: '#FF5722',
    ancient: '#FF9800',
    mythic: '#07f7ff',
    godlike: '#ff0000',
    radiant: '#FFFFFF',
  };

  function getRarityColor(rarity?: string) {
    if (!rarity) return '#9E9E9E';
    return rarityColors[rarity] || '#9E9E9E';
  }

  const columns = 12;
  const minRows = Math.ceil(48 / 8);
  const totalItems = items.length;
  const rows = Math.max(minRows, Math.ceil(totalItems / columns));
  const totalCells = rows * columns;
  const emptyCells = totalCells - totalItems;

  const InventoryItem = React.memo(function InventoryItem({ item, onSelect, isMe, onSell, onDrop, onAuction, dataItemIndex }: { item: Item; onSelect: (item: Item) => void; isMe: boolean; onSell: (item: Item, dataItemIndex: number) => void; onDrop: (item: Item, dataItemIndex: number) => void; onAuction: (item: Item) => void; dataItemIndex: number }) {
    const [loaded, setLoaded] = React.useState(false);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [showContext, setShowContext] = React.useState(false);
    const [mousePos, setMousePos] = React.useState<{
      x: number;
      y: number;
    } | null>(null);
    const iconUrl = '/items-icons/' + (item?.iconHash || item.item_id);
    const formattedMetadata = formatMetadata(item.metadata);

    const handleMouseEnter = (e: React.MouseEvent) => {
      setShowTooltip(true);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setMousePos({ x: rect.right + 8, y: rect.top });
    };
    const handleMouseLeave = () => {
      setShowTooltip(false);
      setShowContext(false);
    };
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowContext(true);
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    return (
      <div className={'inventory-item rarity-' + (item.rarity?.replace(/-/g, '') || 'common')} data-item-index={dataItemIndex} tabIndex={0} draggable={false} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onContextMenu={handleContextMenu} onClick={() => onSelect(item)}>
        <div
          style={{
            position: 'relative',
            width: '48px',
            height: '48px',
            background: '#181a1a',
            borderRadius: '6px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <CachedImage
            src={item.custom_url_link || iconUrl}
            alt={item.name}
            className='inventory-item-img'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '6px',
              background: '#181a1a',
              display: 'block',
            }}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
        </div>
        <div className='inventory-item-qty' style={{ position: 'absolute', zIndex: 3 }}>
          x{item.amount}
        </div>

        {item.metadata && (
          <div
            className='inventory-item-metadata-indicator'
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ffd700',
              zIndex: 3,
              border: '1px solid #000',
            }}
          />
        )}
        {showTooltip && !showContext && mousePos && (
          <div className='inventory-tooltip' style={{ left: mousePos.x, top: mousePos.y }}>
            <div className='inventory-tooltip-name'>{item.name}</div>
            <div className='inventory-tooltip-desc'>{item.description}</div>

            <div
              className='inventory-tooltip-rarity'
              style={
                item.rarity === 'radiant'
                  ? {
                      background: 'linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }
                  : {
                      color: getRarityColor(item.rarity),
                      fontSize: '12px',
                      marginTop: '4px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }
              }>
              {t('inventory.rarity')}: {item.rarity?.replace(/-/g, ' ')}
            </div>
            {formattedMetadata && (
              <div
                className='inventory-tooltip-metadata'
                style={{
                  color: '#888',
                  fontSize: '12px',
                  marginTop: '4px',
                  fontStyle: 'italic',
                }}>
                {formattedMetadata}
              </div>
            )}

            {item.purchasePrice && (
              <div
                className='inventory-tooltip-price'
                style={{
                  color: '#ffd700',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                {t('inventory.price')}: {item.purchasePrice}
                <CachedImage
                  src='/assets/credit.avif'
                  className='inventory-credit-icon'
                  style={{
                    width: '12px',
                    height: '12px',
                    position: 'relative',
                    top: '0px',
                    left: '-2px',
                  }}
                />
              </div>
            )}

            {!item.metadata && (
              <div
                className='inventory-tooltip-sellable'
                style={{
                  color: item.sellable && item.purchasePrice != null ? '#66ff66' : '#ff6666',
                  fontSize: '11px',
                  marginTop: '4px',
                  fontWeight: 'bold',
                }}>
                {item.sellable && item.purchasePrice != null ? t('inventory.canBeSold') : t('inventory.cannotBeSold')}
              </div>
            )}

            {item.metadata?._unique_id && (
              <>
                <div
                  style={{
                    color: '#666',
                    fontSize: '10px',
                    marginTop: '2px',
                    fontFamily: 'monospace',
                  }}>
                  {t('inventory.uniqueId')}: {item.metadata._unique_id}
                </div>

                <div
                  className='inventory-tooltip-sellable'
                  style={{
                    color: '#ff6666',
                    fontSize: '11px',
                    marginTop: '4px',
                    fontWeight: 'bold',
                  }}>
                  {t('inventory.cannotBeSold')}
                </div>
              </>
            )}
          </div>
        )}
        {showContext && isMe && mousePos && (
          <div className='inventory-context-menu' style={{ left: mousePos.x, top: mousePos.y }} onClick={e => e.stopPropagation()}>
            {!item.metadata && item.sellable && item.purchasePrice != null ? (
              <div className='inventory-context-sell' onClick={() => onSell(item, dataItemIndex)}>
                Sell
              </div>
            ) : null}

            {item.purchasePrice != null ? (
              <div className='inventory-context-auction' onClick={() => onAuction(item)}>
                Auction
              </div>
            ) : null}
            <div className='inventory-context-drop' onClick={() => onDrop(item, dataItemIndex)}>
              Drop
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className='inventory-root'>
      {loading && (
        <div className='inventory-loading'>
          <div className='inventory-loading-spinner'></div>
          <span>{t('inventory.loading')}</span>
        </div>
      )}
      {error && <p className='inventory-error'>{t('inventory.error', { error })}</p>}
      <div
        className='inventory-grid'
        style={{
          gridTemplateColumns: !selectedItem ? `repeat(${columns}, 1fr)` : 'auto',
          gap: selectedItem ? '0px' : undefined,
        }}>
        {selectedItem ? (
          <>
            <button onClick={handleBackToInventory} className='inventory-back-btn'>
              {t('inventory.back')}
            </button>
            <div className='inventory-details-main'>
              <CachedImage src={selectedItem.custom_url_link || '/items-icons/' + (selectedItem.iconHash || selectedItem.item_id)} alt={selectedItem.name} className='inventory-details-img' />
              <div>
                <div className='inventory-details-name'>
                  {selectedItem.amount}x {selectedItem.name}
                </div>
                <div className='inventory-details-desc'>{selectedItem.description}</div>

                <div
                  className='inventory-details-rarity'
                  style={
                    selectedItem.rarity === 'radiant'
                      ? {
                          background: 'linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '14px',
                          marginTop: '6px',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                        }
                      : {
                          color: getRarityColor(selectedItem.rarity),
                          fontSize: '14px',
                          marginTop: '6px',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                        }
                  }>
                  {t('inventory.rarity')}: {selectedItem.rarity?.replace(/-/g, ' ')}
                </div>

                {formatMetadata(selectedItem.metadata) && (
                  <div
                    className='inventory-details-metadata'
                    style={{
                      color: '#888',
                      fontSize: '14px',
                      marginTop: '8px',
                      fontStyle: 'italic',
                    }}>
                    {t('inventory.metadata')}: {formatMetadata(selectedItem.metadata)}
                  </div>
                )}

                {selectedItem.purchasePrice !== undefined && (
                  <div
                    className='inventory-details-purchase-price'
                    style={{
                      color: '#ffd700',
                      fontSize: '14px',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                    {t('inventory.price')}: {selectedItem.purchasePrice || 'N/A'}
                    <CachedImage
                      src='/assets/credit.avif'
                      className='inventory-credit-icon'
                      style={{
                        width: '18px',
                        height: '18px',
                        position: 'relative',
                        top: '-2px',
                      }}
                    />
                  </div>
                )}

                {!selectedItem.metadata && (
                  <div
                    className='inventory-details-sellable'
                    style={{
                      color: selectedItem.sellable && selectedItem.purchasePrice != null ? '#00ff00' : '#ff6666',
                      fontSize: '13px',
                      marginTop: '6px',
                      fontWeight: 'bold',
                    }}>
                    {selectedItem.sellable && selectedItem.purchasePrice != null ? t('inventory.thisCanBeSold') : t('inventory.thisCannotBeSold')}
                  </div>
                )}

                {selectedItem.metadata?._unique_id && (
                  <div
                    className='inventory-details-unique-id'
                    style={{
                      color: '#666',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: 'monospace',
                    }}>
                    {t('inventory.uniqueId')}: {selectedItem.metadata._unique_id}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {!loading && !error && (
              <>
                {items.map((item, index) => (
                  <InventoryItem key={item?.metadata?._unique_id ? `${item.item_id}-${item.metadata._unique_id}` : `${item.item_id}-${index}`} dataItemIndex={index} item={item} onSelect={handleItemClick} isMe={!!isMe} onSell={handleSell} onDrop={handleDrop} onAuction={handleAuction} />
                ))}
                {Array.from({ length: emptyCells }).map((_, idx) => (
                  <div key={`empty-${idx}`} className='inventory-item-empty' draggable={false} />
                ))}
              </>
            )}
          </>
        )}
      </div>
      {prompt && (
        <div className='inventory-prompt-overlay'>
          <div className='inventory-prompt'>
            <div className='inventory-prompt-message'>{prompt.message}</div>
            {prompt.showPrice && (
              <div className='inventory-prompt-amount'>
                <input type='number' min={1} value={prompt.price} onChange={handlePromptPriceChange} className='inventory-prompt-amount-input' placeholder={t('inventory.price')} />
                <span className='inventory-prompt-amount-max'>{t('inventory.credits')}</span>
              </div>
            )}
            {prompt.maxAmount && (
              <div className='inventory-prompt-amount'>
                <input type='number' min={1} max={prompt.maxAmount} value={prompt.amount} onChange={handlePromptAmountChange} className='inventory-prompt-amount-input' />
                <span className='inventory-prompt-amount-max'>/ {prompt.maxAmount}</span>
              </div>
            )}
            <button
              className='inventory-prompt-yes-btn'
              onClick={() => {
                if (prompt.showPrice) {
                  prompt.resolve({ confirmed: true, price: prompt.price });
                } else {
                  prompt.resolve({ confirmed: true, amount: prompt.amount });
                }
                setPrompt(null);
              }}>
              {t('inventory.yes')}
            </button>
            <button
              className='inventory-prompt-no-btn'
              onClick={() => {
                prompt.resolve({ confirmed: false });
                setPrompt(null);
              }}>
              {t('inventory.no')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
