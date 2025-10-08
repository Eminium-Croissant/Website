import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Certification from '../../components/common/Certification';
import useAuth from '../../hooks/useAuth';

const endpoint = '/api';

type Item = {
  itemId: string;
  name: string;
  description: string;
  price: number;
  showInStore: boolean;
  iconHash?: string;
};

const MyItems = () => {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: Item;
  } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferItem, setTransferItem] = useState<Item | null>(null);
  const [transferUserId, setTransferUserId] = useState('');
  const [transferUserSearch, setTransferUserSearch] = useState('');
  const [transferUserResults, setTransferUserResults] = useState<any[]>([]);
  const [transferUserDropdownOpen, setTransferUserDropdownOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState(1);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const transferUserInputRef = React.useRef<HTMLInputElement>(null);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [ownershipItem, setOwnershipItem] = useState<Item | null>(null);
  const [ownershipUserId, setOwnershipUserId] = useState('');
  const [ownershipUserSearch, setOwnershipUserSearch] = useState('');
  const [ownershipUserResults, setOwnershipUserResults] = useState<any[]>([]);
  const [ownershipUserDropdownOpen, setOwnershipUserDropdownOpen] = useState(false);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const ownershipUserInputRef = React.useRef<HTMLInputElement>(null);

  const { user } = useAuth();

  useEffect(() => {
    let abortController = new AbortController();
    let debounceTimer: NodeJS.Timeout;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(endpoint + '/items/@mine', {
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data : data.items || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
        }
      } finally {
        setLoading(false);
      }
    };

    debounceTimer = setTimeout(fetchItems, 300);

    return () => {
      clearTimeout(debounceTimer);
      abortController.abort();
    };
  }, []);

  const handleEdit = (item: Item) => {
    setEditingId(item.itemId);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      showInStore: !!item.showInStore,
      iconHash: item.iconHash || item.itemId,
    });
    setIconFile(null);
    setErrors({});
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
    setIconFile(null);
    setErrors({});
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    let iconHash = formData.iconHash;
    if (iconFile) {
      const iconData = new FormData();
      iconData.append('icon', iconFile);
      try {
        const res = await fetch('/upload/item-icon', {
          method: 'POST',
          body: iconData,
        });
        if (res.ok) {
          const data = await res.json();
          iconHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || 'Failed to upload icon.' });
          setSubmitting(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || 'Failed to upload icon.' });
        setSubmitting(false);
        return;
      }
    }

    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      showInStore: !!formData.showInStore,
      ...(iconHash && { iconHash }),
    };

    try {
      const res = await fetch(endpoint + `/items/update/${editingId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess('Item updated successfully!');

        setItems(items => items.map(item => (item.itemId === editingId ? { ...item, ...data } : item)));
        setEditingId(null);
        setFormData(null);
        setIconFile(null);
      } else {
        const err = await res.json();
        setErrors({ submit: err.message || 'Failed to update item.' });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to update item.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferUserSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setTransferUserResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const users = await res.json();
      setTransferUserResults(users);
    } catch (e) {
      setTransferUserResults([]);
    }
  };

  const handleTransfer = (item: Item) => {
    setTransferItem(item);
    setShowTransferModal(true);
    setTransferUserId('');
    setTransferUserSearch('');
    setTransferUserResults([]);
    setTransferAmount(1);
    setTransferError(null);
  };

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItem || !transferUserId || !transferAmount || transferAmount <= 0) {
      setTransferError('Please select a user and enter a valid amount.');
      return;
    }
    setTransferLoading(true);
    setTransferError(null);
    try {
      const res = await fetch(`/api/items/transfer/${transferItem.itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: transferAmount,
          targetUserId: transferUserId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setTransferError(data.message || 'Error transferring item');
      } else {
        setShowTransferModal(false);
        setTransferItem(null);
        setTransferUserId('');
        setTransferUserSearch('');
        setTransferUserResults([]);
        setTransferAmount(1);
        setTransferError(null);

        setItems(prev => prev);
      }
    } catch (err) {
      setTransferError('Error transferring item');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleOwnershipUserSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setOwnershipUserResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const users = await res.json();
      setOwnershipUserResults(users);
    } catch (e) {
      setOwnershipUserResults([]);
    }
  };

  const handleOwnershipTransfer = (item: Item) => {
    setOwnershipItem(item);
    setShowOwnershipModal(true);
    setOwnershipUserId('');
    setOwnershipUserSearch('');
    setOwnershipUserResults([]);
    setOwnershipError(null);
  };

  const handleConfirmOwnershipTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipItem || !ownershipUserId) {
      setOwnershipError('Veuillez sélectionner un utilisateur.');
      return;
    }
    setOwnershipLoading(true);
    setOwnershipError(null);
    try {
      const res = await fetch(`/api/items/transfer-ownership/${ownershipItem.itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOwnerId: ownershipUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setOwnershipError(data.message || "Erreur lors du transfert d'ownership");
      } else {
        setShowOwnershipModal(false);
        setOwnershipItem(null);
        setOwnershipUserId('');
        setOwnershipUserSearch('');
        setOwnershipUserResults([]);
        setOwnershipError(null);

        setItems(prev => prev);
      }
    } catch (err) {
      setOwnershipError("Erreur lors du transfert d'ownership");
    } finally {
      setOwnershipLoading(false);
    }
  };

  return (
    <div className='glass-page-container min-h-screen py-10'>
      <div className='glass-content-card  w-full mx-auto p-8 rounded-xl'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}>
          <h1 className='myitems-title'>
            <span className='myitems-title-span'>{t('myItems.title')}</span>
          </h1>
          <Link href='/dev-zone/create-item' className='glass-button'>
            {t('myItems.addItem')}
          </Link>
        </div>
        {loading ? (
          <div className='myitems-loading'>{t('myItems.loading')}</div>
        ) : (
          <>
            {items.length === 0 && <div className='myitems-empty'>{t('myItems.empty')}</div>}
            <div
              className='myitems-grid'
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '28px',
                marginBottom: '32px',
              }}>
              {items.map(item => (
                <div
                  key={`item-${item.itemId}`}
                  className='myitems-card'
                  tabIndex={0}
                  draggable={false}
                  onMouseEnter={e => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({
                      x: rect.right + 8,
                      y: rect.top,
                      item,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => handleEdit(item)}>
                  <img src={'/items-icons/' + (item?.iconHash || item.itemId)} alt={item.name} className='myitems-card-icon' draggable={false} />
                  <div className='myitems-card-name'>{item.name}</div>
                  <div className='myitems-card-price'>
                    {item.price}
                    <img src='/assets/credit.avif' className='myitems-card-credit' />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                    <button
                      className='myitems-card-editbtn'
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}>
                      {t('myItems.edit')}
                    </button>
                    <button
                      className='myitems-card-editbtn'
                      onClick={e => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.itemId);
                        e.currentTarget.textContent = 'Copied!';
                        setTimeout(() => {
                          e.currentTarget.textContent = 'Id';
                        }, 1000);
                      }}>
                      {t('myItems.id')}
                    </button>
                    <button
                      className='myitems-card-editbtn'
                      onClick={e => {
                        e.stopPropagation();
                        handleOwnershipTransfer(item);
                      }}>
                      {t('myItems.transfer')}
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({
                length: Math.max(0, 3 * Math.ceil(items.length / 3) - items.length),
              }).map((_, idx) => (
                <div key={`empty-${idx}`} className='myitems-card-empty' />
              ))}
            </div>
            {tooltip && (
              <div
                className='myitems-tooltip'
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}>
                <div className='myitems-tooltip-title'>{tooltip.item.name}</div>
                <div className='myitems-tooltip-desc'>{tooltip.item.description}</div>
                <div className='myitems-tooltip-price'>
                  {t('myItems.price')}: {tooltip.item.price}
                  <img src='/assets/credit.avif' className='myitems-card-credit' />
                  <span className='myitems-tooltip-store'>
                    {t('myItems.showInStore')}: {tooltip.item.showInStore ? t('myItems.yes') : t('myItems.no')}
                  </span>
                </div>
              </div>
            )}
            {showTransferModal && (
              <div
                className='modal-overlay'
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.35)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => setShowTransferModal(false)}>
                <div
                  className='modal-content'
                  style={{
                    background: '#232323',
                    borderRadius: 10,
                    padding: 32,
                    minWidth: 320,
                    position: 'relative',
                    boxShadow: '0 2px 16px #0005',
                  }}
                  onClick={e => e.stopPropagation()}>
                  <button
                    className='close-modal-btn'
                    onClick={() => setShowTransferModal(false)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 16,
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: 24,
                      cursor: 'pointer',
                    }}>
                    &times;
                  </button>
                  <h3 style={{ marginBottom: 18 }}>Transfer Item</h3>

                  <form autoComplete='off' onSubmit={handleConfirmTransfer}>
                    <div style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          color: '#fff',
                          marginBottom: 4,
                          display: 'block',
                        }}>
                        Amount:
                      </label>

                      <input
                        type='number'
                        min={1}
                        value={transferAmount}
                        onChange={e => setTransferAmount(Number(e.target.value))}
                        style={{
                          marginRight: 8,
                          padding: '10px 12px',
                          borderRadius: 6,
                          border: '1px solid #444',
                          background: '#181818',
                          color: '#fff',
                          fontSize: '1rem',
                          width: '120px',
                        }}
                        required
                      />
                    </div>
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <label
                        style={{
                          color: '#fff',
                          marginBottom: 4,
                          display: 'block',
                        }}>
                        Select user:
                      </label>

                      <input
                        ref={transferUserInputRef}
                        type='text'
                        value={transferUserSearch}
                        onChange={async e => {
                          setTransferUserSearch(e.target.value);
                          setTransferUserDropdownOpen(true);
                          setTransferUserId('');
                          await handleTransferUserSearch(e.target.value);
                        }}
                        onFocus={() => {
                          if (transferUserSearch.length > 1) setTransferUserDropdownOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setTransferUserDropdownOpen(false), 150)}
                        placeholder={t('myItems.searchUser')}
                        style={{
                          marginRight: 8,
                          padding: '10px 12px',
                          borderRadius: 6,
                          border: '1px solid #444',
                          background: '#181818',
                          color: '#fff',
                          fontSize: '1rem',
                          width: '280px',
                        }}
                      />
                      {transferUserDropdownOpen && transferUserResults.length > 0 && (
                        <ul
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 40,
                            background: '#232323',
                            border: '1px solid #444',
                            borderRadius: 6,
                            maxHeight: 200,
                            overflowY: 'auto',
                            zIndex: 1001,
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                          }}>
                          {transferUserResults.map(u => (
                            <li
                              key={u.user_id || u.id}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                color: '#fff',
                              }}
                              onMouseDown={() => {
                                setTransferUserId(u.user_id || u.id);
                                setTransferUserSearch(u.username);
                                setTransferUserDropdownOpen(false);
                              }}>
                              {u.username}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        type='submit'
                        disabled={transferLoading || !transferUserId}
                        style={{
                          background: '#333',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontWeight: 500,
                          padding: '10px 24px',
                          fontSize: '1rem',
                          cursor: transferUserId ? 'pointer' : 'not-allowed',
                        }}>
                        {transferLoading ? t('myItems.transferring') : t('myItems.transfer')}
                      </button>
                      <button
                        type='button'
                        onClick={() => setShowTransferModal(false)}
                        style={{
                          background: '#222',
                          border: '1px solid #444',
                          color: '#fff',
                          borderRadius: 6,
                          padding: '10px 24px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                        }}>
                        {t('myItems.cancel')}
                      </button>
                    </div>
                    {transferError && <div style={{ color: 'red', marginTop: 12 }}>{transferError}</div>}
                  </form>
                </div>
              </div>
            )}
            {showOwnershipModal && (
              <div
                className='modal-overlay'
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.35)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => setShowOwnershipModal(false)}>
                <div
                  className='modal-content'
                  style={{
                    background: '#232323',
                    borderRadius: 10,
                    padding: 32,
                    minWidth: 320,
                    position: 'relative',
                    boxShadow: '0 2px 16px #0005',
                  }}
                  onClick={e => e.stopPropagation()}>
                  <button
                    className='close-modal-btn'
                    onClick={() => setShowOwnershipModal(false)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 16,
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: 24,
                      cursor: 'pointer',
                    }}>
                    &times;
                  </button>
                  <h3 style={{ marginBottom: 18 }}>Transfer ownership</h3>

                  <form autoComplete='off' onSubmit={handleConfirmOwnershipTransfer}>
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <label
                        style={{
                          color: '#fff',
                          marginBottom: 4,
                          display: 'block',
                        }}>
                        Select user:
                      </label>

                      <input
                        ref={ownershipUserInputRef}
                        type='text'
                        value={ownershipUserSearch}
                        onChange={async e => {
                          setOwnershipUserSearch(e.target.value);
                          setOwnershipUserDropdownOpen(true);
                          setOwnershipUserId('');
                          await handleOwnershipUserSearch(e.target.value);
                        }}
                        onFocus={() => {
                          if (ownershipUserSearch.length > 1) setOwnershipUserDropdownOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setOwnershipUserDropdownOpen(false), 150)}
                        placeholder={t('myItems.searchUser')}
                        style={{
                          marginRight: 8,
                          padding: '10px 12px',
                          borderRadius: 6,
                          border: '1px solid #444',
                          background: '#181818',
                          color: '#fff',
                          fontSize: '1rem',
                          width: '280px',
                        }}
                      />
                      {ownershipUserDropdownOpen && ownershipUserResults.length > 0 && (
                        <ul
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 60,
                            background: '#232323',
                            border: '1px solid #444',
                            borderRadius: 6,
                            maxHeight: 200,
                            overflowY: 'auto',
                            zIndex: 1001,
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            width: '304px',
                          }}>
                          {ownershipUserResults.map(u => (
                            <li
                              key={u.userId || u.user_id || u.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #333',
                              }}
                              onMouseDown={() => {
                                setOwnershipUserId(u.userId || u.user_id || u.id);
                                setOwnershipUserSearch(u.username);
                                setOwnershipUserDropdownOpen(false);
                              }}>
                              <img
                                src={`/avatar/${u.userId || u.user_id || u.id}`}
                                alt='avatar'
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                }}
                                onError={e => (e.currentTarget.src = '/avatar/default.avif')}
                              />
                              <span style={{ color: '#fff' }}>{u.username}</span>
                              <Certification
                                user={u}
                                style={{
                                  width: 16,
                                  height: 16,
                                  verticalAlign: 'middle',
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        type='submit'
                        disabled={ownershipLoading || !ownershipUserId}
                        style={{
                          background: '#333',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontWeight: 500,
                          padding: '10px 24px',
                          fontSize: '1rem',
                          cursor: ownershipUserId ? 'pointer' : 'not-allowed',
                        }}>
                        {ownershipLoading ? t('myItems.transferring') : t('myItems.transfer')}
                      </button>
                      <button
                        type='button'
                        onClick={() => setShowOwnershipModal(false)}
                        style={{
                          background: '#222',
                          border: '1px solid #444',
                          color: '#fff',
                          borderRadius: 6,
                          padding: '10px 24px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                        }}>
                        {t('myItems.cancel')}
                      </button>
                    </div>
                    {ownershipError && <div style={{ color: 'red', marginTop: 12 }}>{ownershipError}</div>}
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editingId && (
        <div className='myitems-modal-overlay'>
          <form
            onSubmit={handleSubmit}
            className='myitems-modal-form'
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
            <h2 className='myitems-modal-title'>Edit Item</h2>
            <input type='text' name='name' value={formData.name} onChange={handleChange} placeholder='Name' className='myitems-input' required />
            <textarea name='description' value={formData.description} onChange={handleChange} placeholder='Description' rows={2} className='myitems-input' required />
            <input type='number' name='price' value={formData.price} onChange={handleChange} placeholder='Price' min={0} className='myitems-input' required />
            <label className='myitems-label'>
              <input type='checkbox' name='showInStore' checked={formData.showInStore} onChange={handleChange} className='myitems-checkbox' />
              {t('myItems.showInStore')}
            </label>
            <input type='file' accept='image/*' onChange={handleIconChange} className='myitems-input' />
            {errors.submit && <div className='myitems-error'>{errors.submit}</div>}
            <div className='myitems-modal-btns'>
              <button type='submit' disabled={submitting} className='myitems-btn-save'>
                {submitting ? t('myItems.saving') : t('myItems.save')}
              </button>
              <button type='button' onClick={handleCancel} disabled={submitting} className='myitems-btn-cancel'>
                {t('myItems.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyItems;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
