import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import Certification from '../components/common/Certification';
import CachedImage from '../components/utils/CachedImage';
import useAuth from '../hooks/useAuth';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

function StudioCard({ studio, onRemoveUser, onAddUser, onToggleApiKey, apiKeySpoilers }) {
  const { t } = useTranslation('common');

  return (
    <div className='bg-[#1c1c24] rounded-xl overflow-hidden flex flex-col border border-[#333] shadow-lg transform transition-transform hover:scale-[1.02] hover:shadow-xl'>
      {}
      <div className='relative h-32 bg-[#18181c]'>
        <div className='absolute inset-0 bg-gradient-to-t from-[#1c1c24] to-transparent opacity-60' />
        <div className='absolute -bottom-8 left-8 flex items-center gap-3'>
          <CachedImage src={'/avatar/' + studio.user_id} alt='Studio Avatar' className='w-24 h-24 rounded-xl object-cover border-2 border-[#444] shadow-lg bg-[#23232a]' />
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <span className='text-xl font-bold text-white'>{studio.name}</span>
              <Certification user={{ ...studio, isStudio: true }} className='w-5 h-5' />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className='pt-16 px-8 pb-6 flex flex-col gap-6'>
        {}
        <div className='bg-[#2a2a32] rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-400'>{t('studios.apiKey')}:</span>
            <div className='flex items-center gap-2'>
              <button onClick={() => onToggleApiKey(studio.user_id)} className='text-xs text-gray-400 hover:text-white transition-colors'>
                {apiKeySpoilers[studio.user_id] ? t('studios.hide') : t('studios.show')}
              </button>
              <button onClick={() => navigator.clipboard.writeText(studio.apiKey)} className='text-xs text-gray-400 hover:text-white transition-colors'>
                {t('studios.copy')}
              </button>
            </div>
          </div>
          <code onClick={() => navigator.clipboard.writeText(studio.apiKey)} className='block w-full bg-[#1c1c24] rounded p-2 text-sm font-mono cursor-pointer select-all truncate overflow-hidden text-ellipsis'>
            {apiKeySpoilers[studio.user_id] ? studio.apiKey : '*'.repeat(Math.max(8, String(studio.apiKey).length))}
          </code>
        </div>

        {}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-400'>{t('studios.users')}</span>
            <button onClick={() => onAddUser(studio)} className='bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors'>
              {t('studios.addUser')}
            </button>
          </div>
          <ul className='divide-y divide-[#2a2a32]'>
            {studio.users && studio.users.length > 0 ? (
              studio.users.map(user => (
                <li key={user.user_id} className='flex items-center justify-between py-2'>
                  <div className='flex items-center gap-3'>
                    <CachedImage src={'/avatar/' + user.user_id} alt={user.username} className='w-8 h-8 rounded-full object-cover border border-[#444]' />
                    <span className='text-white'>{user.username}</span>
                    <Certification user={user} className='w-4 h-4' />
                    {studio.admin_id === user.user_id && <span className='text-xs text-green-500'>(You)</span>}
                  </div>
                  {studio.admin_id !== user.user_id && (
                    <button onClick={() => onRemoveUser(studio.user_id, user.user_id)} className='text-red-500 hover:text-red-400 transition-colors'>
                      <i className='fa fa-trash' aria-hidden='true' />
                    </button>
                  )}
                </li>
              ))
            ) : (
              <li className='py-2 text-gray-500 text-sm'>{t('studios.noUsers')}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function StudiosPage() {
  const { t } = useTranslation('common');
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [studioName, setStudioName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserStudioId, setAddUserStudioId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState('');
  const [addUserSearch, setAddUserSearch] = useState('');
  const [addUserResults, setAddUserResults] = useState<any[]>([]);
  const [addUserDropdownOpen, setAddUserDropdownOpen] = useState(false);
  const addUserInputRef = useRef<HTMLInputElement>(null);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isStudio) {
      router.push('/');
    }
  }, [user, router]);

  const [apiKeySpoilers, setApiKeySpoilers] = useState<{
    [k: string]: boolean;
  }>({});

  const handleCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/studios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studioName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Error creating studio');
      } else {
        refreshStudiosList();
      }
    } catch (err) {
      setError('Error creating studio');
    }
    setLoading(false);
  };

  const refreshStudiosList = async () => {
    console.log('Refreshing studios list...');
    fetch(`/api/users/@me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.studios) {
          setUser(prevUser => ({
            ...prevUser,
            studios: data.studios,
          }));
        }
      });
  };

  const handleRemoveUser = async (studioId: string, userId: string) => {
    if (!confirm(t('studios.removeUserConfirm'))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/studios/${studioId}/remove-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || t('studios.errorRemoveUser'));
      } else {
        refreshStudiosList();
      }
    } catch (err) {
      alert(t('studios.errorRemoveUser'));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setAddUserResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const users = await res.json();
      setAddUserResults(users.filter((u: any) => !u.isStudio));
    } catch (e) {
      setAddUserResults([]);
    }
    console.log('User search results:', addUserResults);
  };

  const handleAddUser = async (studioId: string, userId: string) => {
    setLoading(true);
    setAddUserError(null);
    try {
      const res = await fetch(`/api/studios/${studioId}/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddUserError(data.message || 'Error adding user');
      } else {
        setShowAddUserModal(false);
        setAddUserId('');
        setAddUserError(null);
        refreshStudiosList();
      }
    } catch (err) {
      setAddUserError('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  function toggleApiKeySpoiler(studioId: string) {
    setApiKeySpoilers(s => ({ ...s, [studioId]: !s[studioId] }));
  }

  return (
    <div className='glass-page-container'>
      {}
      <div className='glass-content-card mb-8 flex justify-between items-center'>
        <h1 className='text-3xl font-bold' style={{ color: 'var(--glass-text)' }}>
          {t('studios.title')}
        </h1>
        <button onClick={() => setShowForm(true)} className='glass-button-neon'>
          {t('studios.create')}
        </button>
      </div>

      {}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {user?.studios && user.studios.length > 0 ? (
          user.studios.map(
            studio =>
              studio.admin_id == user.id && (
                <StudioCard
                  key={studio.user_id}
                  studio={studio}
                  onRemoveUser={handleRemoveUser}
                  onAddUser={studio => {
                    setAddUserStudioId(studio.studio_id || studio.id || studio.user_id);
                    setShowAddUserModal(true);
                    setAddUserId('');
                    setAddUserError(null);
                  }}
                  onToggleApiKey={toggleApiKeySpoiler}
                  apiKeySpoilers={apiKeySpoilers}
                />
              )
          )
        ) : (
          <div className='col-span-full text-center py-12 text-gray-400'>{t('studios.noStudios')}</div>
        )}
      </div>

      {}
      {showForm && (
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
          onClick={() => setShowForm(false)}
        >
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
            onClick={e => e.stopPropagation()}
          >
            <button
              className='close-modal-btn'
              onClick={() => setShowForm(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
            <h3 style={{ marginBottom: 18 }}>{t('studios.createTitle')}</h3>
            <form onSubmit={handleCreateStudio}>
              <input
                type='text'
                value={studioName}
                onChange={e => setStudioName(e.target.value)}
                placeholder={t('studios.studioNamePlaceholder')}
                required
                style={{
                  marginRight: 8,
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #444',
                  background: '#181818',
                  color: '#fff',
                  fontSize: '1rem',
                  marginBottom: 12,
                  width: '280px',
                }}
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  type='submit'
                  disabled={loading}
                  style={{
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: '10px 24px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  {t('studios.createBtn')}
                </button>
                <button
                  type='button'
                  onClick={() => setShowForm(false)}
                  style={{
                    background: '#222',
                    border: '1px solid #444',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  {t('studios.cancelBtn')}
                </button>
              </div>
              {error && <div style={{ color: 'red', marginTop: 12 }}>{t('studios.errorCreate')}</div>}
            </form>
          </div>
        </div>
      )}

      {}
      {showAddUserModal && (
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
          onClick={() => setShowAddUserModal(false)}
        >
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
            onClick={e => e.stopPropagation()}
          >
            <button
              className='close-modal-btn'
              onClick={() => setShowAddUserModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
            <h3 style={{ marginBottom: 18 }}>{t('studios.addUserTitle')}</h3>
            <form
              autoComplete='off'
              onSubmit={e => {
                e.preventDefault();
                if (addUserStudioId && addUserId) {
                  handleAddUser(addUserStudioId, addUserId);
                }
              }}
            >
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  ref={addUserInputRef}
                  type='text'
                  value={addUserSearch}
                  onChange={async e => {
                    setAddUserSearch(e.target.value);
                    setAddUserDropdownOpen(true);
                    setAddUserId('');
                    await handleUserSearch(e.target.value);
                  }}
                  onFocus={() => {
                    if (addUserSearch.length > 1) setAddUserDropdownOpen(true);
                  }}
                  onBlur={() => setTimeout(() => setAddUserDropdownOpen(false), 150)}
                  placeholder={t('studios.searchUserPlaceholder')}
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
                {addUserDropdownOpen && addUserResults.length > 0 && (
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
                    }}
                  >
                    {addUserResults.map(u => (
                      <li
                        key={u.userId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #333',
                        }}
                        onMouseDown={() => {
                          setAddUserId(u.userId);
                          setAddUserSearch(u.username);
                          setAddUserDropdownOpen(false);
                        }}
                      >
                        <CachedImage src={`/avatar/${u.userId}`} alt='avatar' style={{ width: 28, height: 28, borderRadius: '50%' }} />
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
                  disabled={loading || !addUserId}
                  style={{
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: '10px 24px',
                    fontSize: '1rem',
                    cursor: addUserId ? 'pointer' : 'not-allowed',
                  }}
                >
                  {t('studios.addBtn')}
                </button>
                <button
                  type='button'
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    background: '#222',
                    border: '1px solid #444',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  {t('studios.cancelBtn')}
                </button>
              </div>
              {addUserError && <div style={{ color: 'red', marginTop: 12 }}>{t('studios.errorAddUser')}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
