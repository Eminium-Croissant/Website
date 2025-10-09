import { useState } from 'react';

type Game = {
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
};

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selected, setSelected] = useState<Game | null>(null);

  const updateGameState = (gameId: string, state: Game['state']) => {
    setGames(prevGames => prevGames.map(game => (game.gameId === gameId ? { ...game, state } : game)));
    if (selected && selected.gameId === gameId) {
      setSelected({ ...selected, state });
    }
  };

  const getGame = (gameId: string) => {
    return games.find(game => game.gameId === gameId);
  };

  const selectGame = (game: Game) => {
    setSelected(game);
  };

  return {
    games,
    setGames,
    selected,
    setSelected,
    updateGameState,
    getGame,
    selectGame,
  };
};
