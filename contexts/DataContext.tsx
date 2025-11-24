
import React, { createContext, useContext, ReactNode } from 'react';
import { useCsvData } from '../hooks/useCsvData';
import { Player, Season, Roster, Game, GameStat, Announcement } from '../types';
import { DATA_URLS } from '../constants';

export const calculateAge = (dobString: string): number | null => {
    if (!dobString || !/^\d{4}-\d{2}-\d{2}$/.test(dobString)) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const formatHeight = (inchesStr: string): string => {
    const inches = parseInt(inchesStr, 10);
    if (isNaN(inches) || inches <= 0) return "N/A";
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}' ${remainingInches}"`;
};

interface DataContextProps {
  players: Player[];
  seasons: Season[];
  rosters: Roster[];
  games: Game[];
  gameStats: GameStat[];
  announcements: Announcement[];
  loading: boolean;
  error: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: players, loading: loadingPlayers, error: errorPlayers } = useCsvData<Player>(DATA_URLS.PLAYERS);
  const { data: seasons, loading: loadingSeasons, error: errorSeasons } = useCsvData<Season>(DATA_URLS.SEASONS);
  const { data: rosters, loading: loadingRosters, error: errorRosters } = useCsvData<Roster>(DATA_URLS.ROSTERS);
  const { data: games, loading: loadingGames, error: errorGames } = useCsvData<Game>(DATA_URLS.GAMES);
  const { data: gameStats, loading: loadingGameStats, error: errorGameStats } = useCsvData<GameStat>(DATA_URLS.GAME_STATS);
  const { data: announcements, loading: loadingAnnouncements, error: errorAnnouncements } = useCsvData<Announcement>(DATA_URLS.ANNOUNCEMENTS);

  const loading = loadingPlayers || loadingSeasons || loadingRosters || loadingGames || loadingGameStats || loadingAnnouncements;
  const error = !!(errorPlayers || errorSeasons || errorRosters || errorGames || errorGameStats || errorAnnouncements);

  const value = {
    players,
    seasons: seasons.sort((a,b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime()),
    rosters,
    games,
    gameStats,
    announcements: announcements.sort((a,b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()),
    loading,
    error,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
