import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Certification from '../../components/common/Certification';
import { DiscordRpcManager } from '../../components/discordRpcManager';
import CachedImage from '../../components/utils/CachedImage';
import { useTranslation } from '../../components/utils/CloudflareI18n';
import { useLobby } from '../../hooks/LobbyContext';
import useAuth from '../../hooks/useAuth';
import { useDiscordActivity } from '../../hooks/useDiscordActivity';
import { useGames } from '../../hooks/useGames';
import useUserCache from '../../hooks/useUserCache';
import Login from '../../pages/login';

interface Game {
  id?: number;
  gameId: string;
  name: string;
  description: string;
  price: number;
  ownerId?: string;
  owner_id?: string;
  showInStore?: boolean | number;
  image?: string;
  state?: 'installed' | 'not_installed' | 'playing' | 'to_update' | 'installing' | 'updating';
  download_link?: string;
  bannerHash?: string;
  iconHash?: string;
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
}

interface LobbyResponse {
  success: boolean;
  lobbyId: string;
  users: Array<{ id: string }>;
  maxUsers: number;
}

interface UserSearchResult {
  id: string;
  userId?: string;
  user_id?: string;
  username: string;
  displayName?: string;
  verified?: boolean;
}

interface OwnerInfo {
  id: string;
  username: string;
  verified?: boolean;
  admin?: boolean;
  isStudio?: boolean;
}

interface TransferResponse {
  message?: string;
}

interface WebSocketMessage {
  action: string;
  gameId?: string;
  lobbyId?: string;
  percent?: number;
  status?: string;
}

const myUrl = 'http://localhost:3333';
let discordRpcManager: DiscordRpcManager;

let ws: WebSocket;
try {
  ws = new WebSocket('ws://localhost:8081');
  ws.onerror = () => { };
  discordRpcManager = new DiscordRpcManager(ws);
} catch { }

const ENDPOINT = '/api';

export function LobbyManager() {
  const [loading, setLoading] = useState(true);
  const { setLobby } = useLobby();

  const pollingInterval = useRef<number>(2000);
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const lastLobbyUsers = useRef<string>('');
  const pageVisible = useRef<boolean>(true);

  const fetchLobby = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${ENDPOINT}/lobbies/user/@me`);
      const data: LobbyResponse = await res.json();
      if (data.success) {
        const users = data.users;
        const usersString = users
          .map(u => u.id)
          .sort()
          .join(',');
        if (lastLobbyUsers.current !== usersString) {
          pollingInterval.current = 2000;
        } else {
          pollingInterval.current = Math.min(pollingInterval.current + 1000, 10000);
        }
        lastLobbyUsers.current = usersString;
        setLobby({ lobbyId: data.lobbyId, users });
        discordRpcManager.createLobby({
          id: data.lobbyId,
          size: 10,
          max: data.maxUsers,
          joinSecret: data.lobbyId + 'secret',
        });
      } else {
        setLobby(null);
        discordRpcManager.clearLobby();
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      pageVisible.current = true;
      if (pageVisible.current && !pollingTimer.current) {
        startPolling();
      } else if (!pageVisible.current && pollingTimer.current) {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const startPolling = useCallback(() => {
    if (pollingTimer.current) return;
    const poll = async () => {
      try {
        await fetchLobby(false);
      } finally {
        pollingTimer.current = setTimeout(poll, pollingInterval.current);
      }
    };
    pollingTimer.current = setTimeout(poll, pollingInterval.current);
  }, [fetchLobby]);

  const stopPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  useEffect(() => {
    fetchLobby();
    startPolling();
    return () => stopPolling();
  }, []);

  return <></>;
}

const Library: React.FC = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const { games, setGames, selected, setSelected, updateGameState, getGame, selectGame } = useGames();
  const { setActivity, createLobby, clearLobby, updateState } = useDiscordActivity(ws);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFetchError, setShowFetchError] = useState(false);
  const [search, setSearch] = useState('');
  const [downloadPercent, setDownloadPercent] = useState<number>(0);
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferUserResults, setTransferUserResults] = useState<UserSearchResult[]>([]);
  const [transferUserDropdownOpen, setTransferUserDropdownOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const { getUser: getUserFromCache } = useUserCache();
  const { t: commonT } = useTranslation();

  useEffect(() => {
    if (user && user.id) {
      updateState(user.username);
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetch(myUrl + '/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch games');
        return res.json();
      })
      .then((data: Game[]) => {
        setGames(data);
        const lastGameId = localStorage.getItem('lastSelectedGameId');
        const lastGame = data.find((g: Game) => g.gameId === lastGameId);
        setSelected(lastGame || data[0] || null);
        setLoading(false);
      })
      .catch(() => {
        fetch('/api/games/list/@me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(async res => {
            if (!res.ok) throw new Error('Failed to fetch games from API');
            return res.json();
          })
          .then((data: Game[]) => {
            setGames(data);
            const lastGameId = localStorage.getItem('lastSelectedGameId');
            const lastGame = data.find((g: Game) => g.gameId === lastGameId);
            setSelected(lastGame || data[0] || null);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
          });
      });
  }, []);

  useEffect(() => {
    ws.onmessage = event => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('Received message:', message);
        if (message.action === 'joinLobby') {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/lobbies/${message.lobbyId}/join`, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
              console.log('Successfully joined lobby:', message.lobbyId);
            }
          };
          xhr.send();
        }
        if (message.action === 'downloadProgress' && message.gameId === selected?.gameId) {
          setDownloadPercent(message.percent);
        }
        if (message.action === 'updateProgress' && message.gameId === selected?.gameId) {
          setDownloadPercent(message.percent);
        }
        if (message.action === 'downloadComplete' || message.action === 'alreadyInstalled' || message.action === 'downloadedGame') {
          setDownloadPercent(0);
          updateGameState(message.gameId, 'installed');
        }
        if (message.action === 'status') {
          updateGameState(message.gameId, message.status === 'installed' || message.status === 'not_installed' || message.status === 'playing' || message.status === 'to_update' ? (message.status as Game['state']) : undefined);
        }
        if (message.action === 'updateComplete') {
          setDownloadPercent(0);
          updateGameState(message.gameId, 'installed');
        }
        if (message.action === 'alreadyUpToDate') {
          setDownloadPercent(0);
          updateGameState(message.gameId, 'installed');
        }
        if (message.action === 'closeGame' || message.action === 'closed') {
          updateGameState(message.gameId, 'installed');
          clearGameActivity();
          setIsPlaying(false);
        }
        if (message.action === 'playing') {
          updateGameState(message.gameId, 'playing');
          setIsPlaying(true);
        }
        if (message.action === 'deleteComplete') {
          updateGameState(message.gameId, 'not_installed');
        }
        if (message.action === 'notFound' && message.gameId) {
          setError(`Game ${message.gameId} not found for deletion.`);
        }
      } catch (e) { }
    };
    return () => {
      ws.onmessage = null;
    };
  }, [selected]);

  useEffect(() => {
    if (selected?.owner_id || selected?.ownerId) {
      const ownerId = selected.owner_id || selected.ownerId;
      getUserFromCache(ownerId)
        .then(setOwnerInfo)
        .catch(() => setOwnerInfo(null));
    } else {
      setOwnerInfo(null);
    }
  }, [selected, getUserFromCache]);

  function setPlayingGame(game: Game) {
    setActivity({
      details: `Playing ${game.name}`,
      largeImageKey: 'game_icon',
      largeImageText: `Playing ${game.name}`,
      smallImageKey: 'play',
      smallImageText: 'In game',
    });
  }

  function clearGameActivity() {
    setActivity({
      details: 'Ready to play',
      state: 'In launcher',
      largeImageKey: 'launcher_icon',
      largeImageText: 'Croissant Launcher',
      smallImageText: 'Ready to play',
      instance: true,
    });
  }

  const handleInstall = () => {
    if (selected && selected.state === 'not_installed') {
      setDownloadPercent(0);
      updateGameState(selected.gameId, 'installing');
      ws.send(
        JSON.stringify({
          action: 'downloadGame',
          gameId: selected.gameId,
          downloadUrl: selected.download_link,
          token,
        })
      );
    }
  };

  const handlePlay = () => {
    if (selected && selected.state === 'installed') {
      ws.send(
        JSON.stringify({
          action: 'playGame',
          gameId: selected.gameId,
          playerId: user.id,
          verificationKey: localStorage.getItem('verificationKey'),
        })
      );
      setPlayingGame(selected);
      setIsPlaying(true);
    }
  };

  const handleUpdate = () => {
    if (selected && selected.state === 'to_update') {
      setDownloadPercent(0);
      updateGameState(selected.gameId, 'updating');
      ws.send(
        JSON.stringify({
          action: 'updateGame',
          gameId: selected.gameId,
          token,
        })
      );
    }
  };

  const handleDelete = () => {
    if (selected && (selected.state === 'installed' || selected.state === 'to_update')) {
      ws.send(JSON.stringify({ action: 'deleteGame', gameId: selected.gameId }));
    }
  };

  const handleSelect = (game: Game) => {
    selectGame(game);
    setIsPlaying(game.state === 'playing');
    localStorage.setItem('lastSelectedGameId', game.gameId);
  };

  const filteredGames = games.filter(game => game.name.toLowerCase().includes(search.toLowerCase()));

  const handleTransferUserSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setTransferUserResults([]);
      setTransferUserDropdownOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const users: UserSearchResult[] = await res.json();
      setTransferUserResults(users);
      setTransferUserDropdownOpen(true);
    } catch (e) {
      setTransferUserResults([]);
      setTransferUserDropdownOpen(false);
    }
  };

  const handleTransferGame = async () => {
    if (!selected || !transferTargetId.trim()) {
      setTransferError('Please select a user');
      return;
    }

    setTransferLoading(true);
    setTransferError(null);

    try {
      const response = await fetch(`/api/games/${selected.gameId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: transferTargetId.trim() }),
      });

      if (!response.ok) {
        const errorData: TransferResponse = await response.json();
        throw new Error(errorData.message || 'Transfer failed');
      }

      setGames(prevGames => prevGames.filter(g => g.gameId !== selected.gameId));
      setSelected(null);
      setShowTransferModal(false);
      setTransferTarget('');
      setTransferTargetId('');
      setTransferUserResults([]);
      setTransferUserDropdownOpen(false);

      alert('Game transferred successfully!');
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setTransferTarget('');
    setTransferTargetId('');
    setTransferUserResults([]);
    setTransferUserDropdownOpen(false);
    setTransferError(null);
  };

  const handleStop = () => {
    if (selected && selected.state === 'playing') {
      ws.send(
        JSON.stringify({
          action: 'stopGame',
          gameId: selected.gameId,
        })
      );
      clearGameActivity();
      setIsPlaying(false);
      updateGameState(selected.gameId, 'installed');
    }
  };

  if (loading || error) {
    return (
      <div className='glass-page-container'>
        <div className='glass-content-card'>
          <div className='flex items-center justify-center py-12'>
            {error ? (
              <div className='glass-card p-8 text-center'>
                <div className='text-2xl mb-4' style={{ color: 'var(--glass-text)' }}>
                  ⚠️ Erreur
                </div>
                <div style={{ color: 'var(--glass-text-secondary)' }}>{error}</div>
              </div>
            ) : (
              <div className='flex items-center gap-4'>
                <div className='w-8 h-8 border-4 border-glass-border border-t-neon-blue rounded-full animate-spin'></div>
                <span style={{ color: 'var(--glass-text)' }}>Chargement des jeux...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='glass-page-container'>
      <LobbyManager></LobbyManager>
      <div className='flex gap-6 h-screen'>
        <aside className='glass-content-card w-100 flex-shrink-0 p-6 flex flex-col'>
          <input type='text' placeholder={t('launcher.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className='glass-input w-full mb-6' />
          {filteredGames.length === 0 ? (
            <div className='text-center py-8' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('launcher.noGames')}
            </div>
          ) : (
            <div
              className='space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
              }}>
              {filteredGames.map(game => (
                <div
                  key={game.gameId}
                  className={`glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${selected && selected.gameId === game.gameId ? 'ring-2 ring-neon-blue' : ''}`}
                  onClick={() => handleSelect(game)}
                  onDoubleClick={() => {
                    if (game.state === 'installed') {
                      handlePlay();
                    } else if (game.state === 'to_update') {
                      handleUpdate();
                    }
                  }}>
                  <div className='flex items-center gap-3'>
                    <CachedImage src={`/games-icons/${game.iconHash ? game.iconHash : 'default'}`} alt={game.name} className='w-12 h-12 rounded-lg object-cover' />
                    <div className='flex-1'>
                      <div className='font-medium' style={{ color: 'var(--glass-text)' }}>
                        {game.name}
                      </div>
                      <div className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                        {game.state === 'not_installed' && t('launcher.install')}
                        {game.state === 'installed' && t('launcher.play')}
                        {game.state === 'to_update' && t('launcher.update')}
                        {game.state === 'playing' && t('launcher.play')}
                        {game.state === 'installing' && t('launcher.install')}
                        {game.state === 'updating' && t('launcher.update')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <main
          className='flex-1 overflow-y-auto'
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(74, 158, 255, 0.4) rgba(26, 26, 35, 0.3)',
          }}>
          {!selected ? (
            <div className='glass-content-card h-full flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-4xl mb-4' style={{ color: 'var(--glass-text)' }}>
                  🎮
                </div>
                <div className='text-xl' style={{ color: 'var(--glass-text-secondary)' }}>
                  Sélectionnez un jeu pour commencer
                </div>
              </div>
            </div>
          ) : (
            <div className='glass-content-card h-full' style={{ overflowY: 'scroll' }}>
              <div className='relative h-64 mb-6 rounded-xl overflow-hidden'>
                <img src={`/banners-icons/${selected.bannerHash ? selected.bannerHash : 'default'}`} alt={selected.name} className='w-full h-full object-cover' loading='lazy' />
                <div className='absolute inset-0 bg-gradient-to-t from-dark-primary via-transparent to-transparent'></div>
                <div className='absolute bottom-4 left-4 flex items-center gap-4'>
                  <img src={`/games-icons/${selected.iconHash ? selected.iconHash : 'default'}`} alt={selected.name} className='w-20 h-20 rounded-xl object-cover glass-card border-2 border-glass-border' loading='lazy' />
                  <div>
                    <h2 className='text-3xl font-bold' style={{ color: 'var(--glass-text)' }}>
                      {selected.name}
                    </h2>
                    {ownerInfo && (
                      <div className='flex items-center gap-2 mt-2'>
                        <Link href={`/profile?user=${ownerInfo.id}`} className='flex items-center gap-2 no-underline'>
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
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='glass-card p-6'>
                <div className='flex gap-4 flex-wrap'>
                  {selected.state === 'not_installed' && (
                    <button className='glass-button-neon' onClick={handleInstall}>
                      {t('launcher.install')}
                    </button>
                  )}
                  {selected.state === 'installing' && (
                    <div className='w-full'>
                      <button className='glass-button w-full' disabled>
                        Installation... {downloadPercent > 0 ? `${downloadPercent}%` : ''}
                      </button>
                      <div className='w-full h-2 bg-glass-border rounded-full mt-2 overflow-hidden'>
                        <div className='h-full bg-neon-green transition-all duration-300' style={{ width: `${downloadPercent}%` }} />
                      </div>
                    </div>
                  )}
                  {selected.state === 'updating' && (
                    <div className='w-full'>
                      <button className='glass-button w-full' disabled>
                        Mise à jour... {downloadPercent > 0 ? `${downloadPercent}%` : ''}
                      </button>
                      <div className='w-full h-2 bg-glass-border rounded-full mt-2 overflow-hidden'>
                        <div className='h-full bg-neon-green transition-all duration-300' style={{ width: `${downloadPercent}%` }} />
                      </div>
                    </div>
                  )}
                  {selected.state === 'to_update' && (
                    <>
                      <button className='glass-button-neon' onClick={handleUpdate}>
                        {t('launcher.update')}
                      </button>
                      <button className='glass-button' onClick={handleDelete} disabled={isPlaying}>
                        {t('launcher.delete')}
                      </button>
                    </>
                  )}
                  {selected.state === 'installed' && (
                    <>
                      <button className='glass-button-neon' onClick={handlePlay} disabled={isPlaying}>
                        {isPlaying ? t('launcher.play') : t('launcher.play')}
                      </button>
                      <button className='glass-button' onClick={handleDelete} disabled={isPlaying}>
                        {t('launcher.delete')}
                      </button>
                    </>
                  )}
                  {selected.state === 'playing' && (
                    <button className='glass-button-red' onClick={handleStop}>
                      Stop
                    </button>
                  )}
                  {selected.state !== 'installing' && selected.state !== 'updating' && (
                    <button className='glass-button' onClick={() => setShowTransferModal(true)} disabled={isPlaying}>
                      {t('launcher.transfer')}
                    </button>
                  )}
                </div>
              </div>

              {selected.description && (
                <div className='mt-6'>
                  <MarkdownDescription>{selected.description}</MarkdownDescription>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showTransferModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50' onClick={handleCloseTransferModal}>
          <div className='glass-card p-6 max-w-md w-full mx-4' onClick={e => e.stopPropagation()}>
            <h3 className='text-2xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
              {t('launcher.transferTitle')}
            </h3>
            <p className='mb-4' style={{ color: 'var(--glass-text-secondary)' }}>
              {t('launcher.transferDesc', { game: selected?.name || '' })}
            </p>
            <p className='text-sm mb-6' style={{ color: 'var(--glass-text-muted)' }}>
              {t('launcher.transferWarning')}
            </p>

            <div className='relative mb-6'>
              <label className='block mb-2' style={{ color: 'var(--glass-text)' }}>
                {t('launcher.selectUser')}
              </label>
              <input
                type='text'
                value={transferTarget}
                onChange={e => {
                  setTransferTarget(e.target.value);
                  setTransferTargetId('');
                  handleTransferUserSearch(e.target.value);
                }}
                onFocus={() => {
                  if (transferTarget.length > 1) setTransferUserDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setTransferUserDropdownOpen(false), 150)}
                placeholder={t('launcher.transferUserPlaceholder')}
                className='glass-input w-full'
                disabled={transferLoading}
              />

              {transferUserDropdownOpen && transferUserResults.length > 0 && (
                <div
                  className='absolute top-full left-0 right-0 mt-2 glass-card max-h-48 overflow-y-auto z-10 pr-2 custom-scrollbar'
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
                  }}>
                  {transferUserResults.map(user => (
                    <div
                      key={user.userId || user.user_id || user.id}
                      className='flex items-center gap-3 p-3 hover:bg-glass-accent cursor-pointer transition-colors'
                      onMouseDown={() => {
                        setTransferTargetId(user.userId || user.user_id || user.id);
                        setTransferTarget(user.username);
                        setTransferUserDropdownOpen(false);
                      }}>
                      <img
                        src={`/avatar/${user.userId || user.user_id || user.id}`}
                        alt='avatar'
                        className='w-8 h-8 rounded-full object-cover border-2 border-glass-border'
                        onError={e => {
                          e.currentTarget.src = '/avatar/default.avif';
                        }}
                      />
                      <span style={{ color: 'var(--glass-text)' }}>{user.username}</span>
                      <Certification user={{ ...user, verified: user.verified ?? false }} className='w-4 h-4' />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {transferError && (
              <div
                className='glass-card p-3 mb-4'
                style={{
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                }}>
                <div className='text-sm' style={{ color: '#ff4444' }}>
                  {transferError}
                </div>
              </div>
            )}

            <div className='flex gap-4'>
              <button onClick={handleCloseTransferModal} disabled={transferLoading} className='glass-button flex-1'>
                {t('launcher.cancel')}
              </button>
              <button onClick={handleTransferGame} disabled={transferLoading || !transferTargetId.trim()} className='glass-button-neon flex-1'>
                {transferLoading ? t('launcher.transferring') : t('launcher.transfer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps({ locale }) {
  const { getServerSideTranslations } = await import('../../components/utils/CloudflareI18n');
  return {
    props: {
      ...(await getServerSideTranslations(locale)),
      isLauncher: true,
    },
  };
}

const ExportedComponent = props => {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user || !document.cookie.includes('from=app')) {
      document.cookie = 'from=app; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    }
  }, [user]);

  return user ? <Library {...props} /> : <Login />;
};

export default ExportedComponent;

function MarkdownDescription({ children }: { children: string }) {
  return (
    <div className='markdown-body glass-card'>
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
