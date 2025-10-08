import { useRef } from 'react';
import { DiscordRpcManager } from '../components/discordRpcManager';

let discordRpcManager: DiscordRpcManager;

export const useDiscordActivity = (ws: WebSocket) => {
  const currentActivity = useRef<any>(null);

  if (!discordRpcManager) {
    discordRpcManager = new DiscordRpcManager(ws);
  }

  const setActivity = (activity: any) => {
    if (JSON.stringify(currentActivity.current) !== JSON.stringify(activity)) {
      currentActivity.current = activity;
      discordRpcManager.setActivity(activity);
    }
  };

  const createLobby = (lobbyInfo: any) => {
    discordRpcManager.createLobby(lobbyInfo);
  };

  const clearLobby = () => {
    discordRpcManager.clearLobby();
  };

  const updateState = (state: string) => {
    discordRpcManager.updateState(state);
  };

  return {
    setActivity,
    createLobby,
    clearLobby,
    updateState,
  };
};

