import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import useIsMobile from '../../hooks/useIsMobile';
import Certification from '../../components/common/Certification';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const endpoint = '/api'; // Replace with your actual API endpoint

type Game = {
  gameId: string;
  name: string;
  description: string;
  price: number;
  showInStore: boolean;
  iconHash?: string;
  bannerHash?: string;
  genre?: string;
  release_date?: string;
  developer?: string;
  publisher?: string;
  platforms?: string;
  website?: string;
  trailer_link?: string;
  multiplayer?: boolean;
  download_link?: string; // <-- Ajouté ici
};

const MyGames = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation('common');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    game: Game;
  } | null>(null);

  const { token } = useAuth(); // Assuming useAuth is imported from your hooks
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(endpoint + '/games/@mine');
        if (res.ok) {
          const data = await res.json();
          setGames(Array.isArray(data) ? data : data.games || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleEdit = (game: Game) => {
    setEditingId(game.gameId);
    setFormData({
      name: game.name,
      description: game.description,
      price: game.price.toString(),
      showInStore: game.showInStore,
      iconHash: game.iconHash || null,
      bannerHash: game.bannerHash || null,
      genre: game.genre || '',
      release_date: game.release_date || '',
      developer: game.developer || '',
      publisher: game.publisher || '',
      platforms: game.platforms || '',
      website: game.website || '',
      trailer_link: game.trailer_link || '',
      multiplayer: !!game.multiplayer,
      download_link: game.download_link || '', // <-- Ajouté ici
    });
    setIconFile(null);
    setBannerFile(null);
    setErrors({});
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
    setIconFile(null);
    setBannerFile(null);
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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
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
    let bannerHash = formData.bannerHash;

    if (iconFile) {
      const iconData = new FormData();
      iconData.append('icon', iconFile);
      try {
        const res = await fetch('/upload/game-icon', {
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

    if (bannerFile) {
      const bannerData = new FormData();
      bannerData.append('banner', bannerFile);
      try {
        const res = await fetch('/upload/banner', {
          method: 'POST',
          body: bannerData,
        });
        if (res.ok) {
          const data = await res.json();
          bannerHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || 'Failed to upload banner.' });
          setSubmitting(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || 'Failed to upload banner.' });
        setSubmitting(false);
        return;
      }
    }

    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      showInStore: formData.showInStore,
      iconHash,
      bannerHash,
      genre: formData.genre,
      release_date: formData.release_date,
      developer: formData.developer,
      publisher: formData.publisher,
      platforms: formData.platforms,
      website: formData.website,
      trailer_link: formData.trailer_link,
      multiplayer: formData.multiplayer,
      download_link: formData.download_link, // <-- Ajouté ici
    };

    try {
      const res = await fetch(endpoint + `/games/${editingId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess('Game updated successfully!');
        setGames(games => games.map(game => (game.gameId === editingId ? { ...game, ...data } : game)));
        setEditingId(null);
        setFormData(null);
        setIconFile(null);
        setBannerFile(null);
      } else {
        const err = await res.json();
        setErrors({ submit: err.message || 'Failed to update game.' });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to update game.' });
    } finally {
      setSubmitting(false);
    }
  };

  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [ownershipGame, setOwnershipGame] = useState<Game | null>(null);
  const [ownershipUserId, setOwnershipUserId] = useState('');
  const [ownershipUserSearch, setOwnershipUserSearch] = useState('');
  const [ownershipUserResults, setOwnershipUserResults] = useState<any[]>([]);
  const [ownershipUserDropdownOpen, setOwnershipUserDropdownOpen] = useState(false);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const ownershipUserInputRef = React.useRef<HTMLInputElement>(null);

  // User search for ownership transfer
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

  // Handle ownership transfer button click
  const handleOwnershipTransfer = (game: Game) => {
    setOwnershipGame(game);
    setShowOwnershipModal(true);
    setOwnershipUserId('');
    setOwnershipUserSearch('');
    setOwnershipUserResults([]);
    setOwnershipError(null);
  };

  // Confirm ownership transfer
  const handleConfirmOwnershipTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipGame || !ownershipUserId) {
      setOwnershipError('Veuillez sélectionner un utilisateur.');
      return;
    }
    setOwnershipLoading(true);
    setOwnershipError(null);
    try {
      const res = await fetch(`/api/games/transfer-ownership/${ownershipGame.gameId}`, {
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
        setOwnershipGame(null);
        setOwnershipUserId('');
        setOwnershipUserSearch('');
        setOwnershipUserResults([]);
        setOwnershipError(null);
        // Optionally refresh games
        setGames(prev => prev);
      }
    } catch (err) {
      setOwnershipError("Erreur lors du transfert d'ownership");
    } finally {
      setOwnershipLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className='glass-page-container flex justify-center items-center min-h-screen'>
        <div className='glass-content-card max-w-[340px] w-full mx-auto p-6 rounded-xl text-center'>
          <h2 className='mb-2'>{t('myGames.mobile.title')}</h2>
          <p>{t('myGames.mobile.desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='glass-page-container min-h-screen py-10'>
      <div className='glass-content-card  w-full mx-auto p-8 rounded-xl'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='mygames-title'>
            <span className='mygames-title-span'>{t('myGames.title')}</span>
          </h1>
          <Link href='/dev-zone/create-game' className='glass-button'>
            {t('myGames.addGame')}
          </Link>
        </div>
        {loading ? (
          <div className='mygames-loading'>{t('myGames.loading')}</div>
        ) : (
          <>
            {games.length === 0 && <div className='mygames-empty'>{t('myGames.empty')}</div>}
            <div className='mygames-grid'>
              {games.map(game => (
                <div
                  key={`game-${game.gameId}`}
                  className='mygames-card'
                  tabIndex={0}
                  draggable={false}
                  onMouseEnter={e => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    // setTooltip({
                    //   x: rect.right + 8,
                    //   y: rect.top,
                    //   game,
                    // });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => handleEdit(game)}
                >
                  <img src={'/games-icons/' + (game.iconHash ? game.iconHash : 'default')} alt={game.name} className='mygames-card-icon' draggable={false} />
                  <div className='mygames-card-name'>{game.name}</div>
                  <div className='mygames-card-price' style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {game.price}
                    <img
                      src='/assets/credit.avif'
                      className='mygames-card-credit'
                      style={{
                        width: 18,
                        height: 18,
                        objectFit: 'cover',
                        position: 'relative',
                        top: 0,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <button
                      className='glass-button-green'
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(game);
                      }}
                    >
                      {t('myGames.edit')}
                    </button>
                    <button
                      className='glass-button-green'
                      onClick={e => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(game.gameId);
                        e.currentTarget.textContent = 'Copied!';
                        setTimeout(() => {
                          e.currentTarget.textContent = 'Id';
                        }, 1000);
                      }}
                    >
                      {t('myGames.id')}
                    </button>
                    <button
                      className='glass-button-green'
                      onClick={e => {
                        e.stopPropagation();
                        handleOwnershipTransfer(game);
                      }}
                    >
                      {t('myGames.transfer')}
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({
                length: Math.max(0, 6 * Math.ceil(games.length / 6) - games.length),
              }).map((_, idx) => (
                <div key={`empty-${idx}`} className='mygames-card-empty' />
              ))}
            </div>
            {tooltip && (
              <div
                className='mygames-tooltip'
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}
              >
                <div className='mygames-tooltip-title'>{tooltip.game.name}</div>
                <div className='mygames-tooltip-desc'>{tooltip.game.description}</div>
                <div className='mygames-tooltip-price' style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t('myGames.price')}: {tooltip.game.price}
                  <img
                    src='/assets/credit.avif'
                    className='mygames-card-credit'
                    style={{
                      width: 14,
                      height: 14,
                      objectFit: 'cover',
                      marginLeft: 6,
                      marginBottom: 3,
                    }}
                  />
                  <span className='mygames-tooltip-store'>
                    {t('myGames.showInStore')}: {tooltip.game.showInStore ? t('myGames.yes') : t('myGames.no')}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Place le modal ici, en dehors du container */}
      {editingId && (
        <div className='mygames-modal-overlay'>
          <form
            onSubmit={handleSubmit}
            className='mygames-modal-form'
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className='mygames-modal-col'>
              <label className='mygames-label' htmlFor='name'>
                {t('myGames.name')}
              </label>
              <input id='name' type='text' name='name' value={formData.name} onChange={handleChange} placeholder='Name' className='mygames-input' required />
              <label className='mygames-label' htmlFor='description'>
                {t('myGames.description')}
              </label>
              <textarea id='description' name='description' value={formData.description} onChange={handleChange} placeholder='Description' rows={2} className='mygames-input' required style={{ height: 260 }} />
              <label className='mygames-label' htmlFor='price'>
                {t('myGames.price')}
              </label>
              <input id='price' type='number' name='price' value={formData.price} onChange={handleChange} placeholder='Price' min={0} className='mygames-input' required />
              <label className='mygames-label' style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type='checkbox' name='showInStore' checked={formData.showInStore} onChange={handleChange} className='glass-checkbox' />
                <span style={{ marginLeft: 4 }}>{t('myGames.showInStore')}</span>
              </label>
            </div>
            <div className='mygames-modal-col'>
              <label className='mygames-label' htmlFor='icon'>
                {t('myGames.icon')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type='button' className='glass-button' onClick={() => document.getElementById('icon-file-input')?.click()} style={{ zoom: 0.7 }}>
                  {t('myGames.chooseIcon')}
                </button>
                <span style={{ color: '#888', fontSize: '0.95em' }}>{iconFile ? iconFile.name : formData.iconHash ? t('myGames.iconSelected') : t('myGames.noFile')}</span>
                {(iconFile || formData.iconHash) && (
                  <img
                    src={iconFile ? URL.createObjectURL(iconFile) : `/games-icons/${formData.iconHash}`}
                    alt='icon preview'
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: 'cover',
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                  />
                )}
                <input id='icon-file-input' type='file' accept='image/*' style={{ display: 'none' }} onChange={handleIconChange} />
              </div>
              <label className='mygames-label' htmlFor='banner'>
                {t('myGames.banner')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type='button' className='glass-button' style={{ zoom: 0.7 }} onClick={() => document.getElementById('banner-file-input')?.click()}>
                  {t('myGames.chooseBanner')}
                </button>
                <span style={{ color: '#888', fontSize: '0.95em' }}>{bannerFile ? bannerFile.name : formData.bannerHash ? t('myGames.bannerSelected') : t('myGames.noFile')}</span>
                {(bannerFile || formData.bannerHash) && (
                  <img
                    src={bannerFile ? URL.createObjectURL(bannerFile) : `/banners-icons/${formData.bannerHash}`}
                    alt='banner preview'
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                  />
                )}
                <input id='banner-file-input' type='file' accept='image/*' style={{ display: 'none' }} onChange={handleBannerChange} />
              </div>
              <label className='mygames-label' htmlFor='download_link'>
                {t('myGames.downloadLink')}
              </label>
              <input id='download_link' type='url' name='download_link' value={formData.download_link} onChange={handleChange} placeholder='https://example.com/download' className='mygames-input' />
              <label className='mygames-label' style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type='checkbox' name='multiplayer' checked={formData.multiplayer} onChange={handleChange} className='glass-checkbox' />
                <span style={{ marginLeft: 4 }}>{t('myGames.multiplayer')}</span>
              </label>
            </div>
            <div className='mygames-modal-actions'>
              {errors.submit && <div className='mygames-error'>{errors.submit}</div>}
              <div className='mygames-modal-btns'>
                <button type='submit' disabled={submitting} className='glass-button-green'>
                  {submitting ? t('myGames.saving') : t('myGames.save')}
                </button>
                <button type='button' onClick={handleCancel} disabled={submitting} className='glass-button-red'>
                  {t('myGames.cancel')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      {showOwnershipModal && (
        <div className='modal-overlay' onClick={() => setShowOwnershipModal(false)}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
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
              }}
            >
              &times;
            </button>
            <h3 style={{ marginBottom: 18 }}>Transfer ownership</h3>

            <form autoComplete='off' onSubmit={handleConfirmOwnershipTransfer}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <label style={{ color: '#fff', marginBottom: 4, display: 'block' }}>Select user:</label>

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
                  placeholder={t('myGames.searchUser')}
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
                        }}
                      >
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
                  }}
                >
                  {ownershipLoading ? t('myGames.transferring') : t('myGames.transfer')}
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
                  }}
                >
                  {t('myGames.cancel')}
                </button>
              </div>
              {ownershipError && <div style={{ color: 'red', marginTop: 12 }}>{ownershipError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGames;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
