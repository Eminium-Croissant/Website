import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import CachedImage from '../../../components/utils/CachedImage';
import { useLobby } from '../../../hooks/LobbyContext';
import useAuth from '../../../hooks/useAuth';
import Profile from '../../profile';

const ENDPOINT = '/api';

export default function LobbyPage() {
  const { lobby, loading, error, rpcStatus, createLobby, leaveLobby } = useLobby();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  
  const showTooltip = useCallback((msg: string) => {
    setTooltip(msg);
    setTimeout(() => setTooltip(null), 2000);
  }, []);

  
  const isUserInLobby = !!lobby;
  const isUserSelected = !!selectedUser;

  return (
    <>
      {}
      {tooltip && (
        <div className='lobby-tooltip'>
          <i className='fa fa-check-circle lobby-tooltip-icon' aria-hidden='true'></i>
          {tooltip}
        </div>
      )}
      {isCollapsed ? (
        <button onClick={() => setIsCollapsed(false)} className='lobby-expand-btn' aria-label='Expand lobby'>
          ...
        </button>
      ) : (
        <div className='lobby-container'>
          <button onClick={() => setIsCollapsed(true)} className='lobby-collapse-btn' aria-label='Collapse lobby'>
            X
          </button>
          {!isCollapsed && (
            <>
              <h1>Lobby</h1>
              {loading && <p>Loading...</p>}
              {error && <p className='lobby-error'>{error}</p>}

              {isUserSelected && (
                <div className='lobby-profile-wrapper'>
                  <button onClick={() => setSelectedUser(null)} className='lobby-back-btn'>
                    ← Retour au lobby
                  </button>
                  <Profile userId={selectedUser!} />
                </div>
              )}

              {!isUserSelected && (
                <>
                  {isUserInLobby ? (
                    <div>
                      <ul className='lobby-users-list'>
                        {lobby!.users.map(lobbyUser => (
                          <li key={lobbyUser.id}>
                            <button className='lobby-user-btn' onClick={() => router.push(`/profile?user=${lobbyUser.user_id}`)}>
                              <CachedImage className='lobby-user-avatar' src={`/avatar/${lobbyUser.user_id}`} style={{ objectFit: 'cover' }} />
                              <span className='lobby-user-name'>
                                {lobbyUser?.username}{' '}
                                {}
                                {lobbyUser.user_id === user.id ? '(You)' : ''}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      {}
                      <div className='lobby-actions'>
                        <button
                          onClick={async () => {
                            try {
                              
                              showTooltip('Lobby link copied!');
                            } catch {
                              showTooltip('Failed to copy link.');
                            }
                          }}
                        >
                          Copy Lobby Link
                        </button>
                        <button onClick={leaveLobby} disabled={actionLoading}>
                          {actionLoading ? 'Leaving...' : 'Leave Lobby'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p>You are not in any lobby.</p>
                      <button onClick={createLobby} disabled={actionLoading}>
                        {actionLoading ? 'Creating...' : 'Create and Join Lobby'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

