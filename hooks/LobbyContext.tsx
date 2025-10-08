import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Lobby = {
  lobbyId: string;
  users: any[];
};

type LobbyContextType = {
  lobby: Lobby | null;
  loading: boolean;
  error: string | null;
  rpcStatus: string;
  createLobby: () => Promise<void>;
  leaveLobby: () => Promise<void>;
  refreshLobby: () => Promise<void>;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | null>>;
};

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

let ws: WebSocket | null = null;

export const LobbyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rpcStatus, setRpcStatus] = useState<string>('unknown');

  const refreshLobby = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lobbies/user/@me');
      const data = await res.json();
      if (data.success) {
        setLobby({ lobbyId: data.lobbyId, users: data.users });
      } else {
        setLobby(null);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLobby = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lobbies', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create lobby');
      }
      await refreshLobby();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [refreshLobby]);

  const leaveLobby = useCallback(async () => {
    if (!lobby) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lobbies/${lobby.lobbyId}/leave`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to leave lobby');
      }
      setLobby(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [lobby]);

  useEffect(() => {
    refreshLobby();
  }, [refreshLobby]);

  return (
    <LobbyContext.Provider
      value={{
        lobby,
        loading,
        error,
        rpcStatus,
        createLobby,
        leaveLobby,
        refreshLobby,
        setLobby,
      }}>
      {children}
    </LobbyContext.Provider>
  );
};

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error('useLobby must be used within a LobbyProvider');
  return ctx;
}
