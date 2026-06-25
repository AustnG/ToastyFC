/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: string; // legacy or computed main position
  status: 'active' | 'inactive' | 'guest' | 'alumni';
  notes?: string;
  number?: number;
  avatarUrl?: string;
  ratings: Record<number, number>; 
  totalRating: number;

  // New detailed FC attributes from actual Players sheet
  dob?: string;
  height?: string;
  birthplace?: string;
  nationality?: string;
  playerImageUrl?: string;
  footedness?: string;
  
  // Stats (0-99)
  pace?: number;
  acceleration?: number;
  sprintSpeed?: number;
  shooting?: number;
  finishing?: number;
  shotPower?: number;
  longShots?: number;
  curve?: number;
  volleys?: number;
  penalties?: number;
  passing?: number;
  vision?: number;
  crossing?: number;
  freeKickAccuracy?: number;
  shortPass?: number;
  longPass?: number;
  dribbling?: number;
  agility?: number;
  balance?: number;
  reactions?: number;
  composure?: number;
  ballControl?: number;
  weakFoot?: number;
  skillMoves?: number;
  defending?: number;
  interceptions?: number;
  heading?: number;
  marking?: number;
  tackling?: number;
  physical?: number;
  jumping?: number;
  stamina?: number;
  strength?: number;
  aggression?: number;
  goalkeeping?: number;
  positioning?: number;
  diving?: number;
  reflexes?: number;
  handling?: number;
  kicking?: number;
  distribution?: number;
  bio?: string;

  // Computed from Rosters & GameStats
  captain?: boolean;
  paidSeasonFee?: string;
  goals?: number;
  assists?: number;
  points?: number;
  shots?: number;
  sot?: number;
  blocks?: number;
  plusMinus?: number;
  fouls?: number;
  yellows?: number;
  reds?: number;
  saves?: number;
  potmCount?: number;
  savesCount?: number;
  gamesPlayedCount?: number;
  cleanSheetsCount?: number;
  seasons?: { id: string; name: string; }[];
}

export interface Match {
  id: string;
  matchNumber: number;
  date: string;
  opponent: string;
  location: string;
  status: 'played' | 'upcoming';
  score?: {
    toastyFc: number;
    opponent: number;
  };
  scorers?: string[];
  assists?: string[];
  cleanSheet?: boolean;
  notes?: string;

  // New rich attributes from Games sheet
  seasonId?: string;
  gameType?: string;
  time?: string;
  homeAway?: string;
  opponentColor?: string;
  wdl?: string;
  forfeit?: boolean;
  shots?: number;
  sot?: number;
  blocks?: number;
  corners?: number;
  fouls?: number;
  yellows?: number;
  reds?: number;
  saves?: number;
  opponentPks?: number;
  opponentShots?: number;
  opponentSoT?: number;
  opponentBlocks?: number;
  opponentCorners?: number;
  opponentFouls?: number;
  opponentYellows?: number;
  opponentReds?: number;
  opponentSaves?: number;
  manOfTheMatch?: string;
  youtubeLink?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  category: string;
  content: string;
  link?: string;
  imageUrl?: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  division: string;
  playersRostered: number;
  perPlayerFee: number;
  teamFee: number;
  amountPaid: number;
  overview: string;
}

export interface RosterEntry {
  rosterId: string;
  seasonId: string;
  formulaSeasonName: string;
  playerId: string;
  formulaFirstLast: string;
  number: number;
  positions: string;
  captain: boolean;
  paidSeasonFee: string;
  notes: string;
}

export interface GameStatEntry {
  gameId: string;
  formulaGameTitle: string;
  playerId: string;
  formulaFirstLast: string;
  goals: number;
  assists: number;
  points: number;
  shots: number;
  sot: number;
  sotPercentage: number;
  blocks: number;
  plusMinus: number;
  fouls: number;
  yellows: number;
  reds: number;
  potm: boolean;
  saves: number;
  savePercentage: number;
  saveRatio: string;
  goalsAllowed: number;
  cleanSheet: boolean;
}

export interface TeamStats {
  season: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
}

export interface SheetConfig {
  sheetId: string;
  isCustom: boolean;
  
  // Specific worksheets/tabs
  newsRange?: string;
  playersRange?: string;
  seasonsRange?: string;
  rostersRange?: string;
  gamesRange?: string;
  gameStatsRange?: string;

  // Legacy compatibility ranges
  rosterRange?: string;
  ratingsRange?: string;
  matchesRange?: string;
}
