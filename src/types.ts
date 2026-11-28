export interface Season {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  division?: string;
  playersRostered?: number;
  // Private admin-only fields (stripped from public toasty-data.json)
  perPlayerFee?: number;
  teamFee?: number;
  amountPaid?: number;
  overview?: string;
}

export interface Player {
  id: string;
  name: string;
  number?: number;
  position?: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | string;
  imageUrl?: string;
  bio: string;
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  cleanSheets?: number; // For Goalkeepers
  saves?: number;       // Goalkeeper saves
  goalsAllowed?: number;// Goalkeeper goals conceded
  isCaptain?: boolean;
  // Extended fields:
  age?: number;         // Public computed age (raw dateOfBirth stripped from public JSON)
  dateOfBirth?: string; // Private admin-only field
  height?: string;
  birthplace?: string;
  nationality?: string;
  seasons?: string[]; // Player history over time (e.g. ['2025 Spring', '2026 SKY Summer'])
  skills?: PlayerSkills; // Optional FIFA style skills rating
  // Extended seasonal stats:
  plusMinus?: number;
  fouls?: number;
  yellows?: number;
  reds?: number;
  potm?: number;
  shots?: number;          // Legacy alias for shotsOffTarget
  shotsOffTarget?: number; // Shots off target
  shotsOnTarget?: number;  // Shots on target
  totalShots?: number;     // shotsOffTarget + shotsOnTarget
  blocks?: number;
}

export interface RosterEntry {
  id: string;
  seasonId?: string;
  seasonName?: string;
  season?: string; // backwards compatibility alias
  playerId: string;
  playerName?: string;
  number: number;
  imageUrl: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | string;
  isCaptain?: boolean;
}

export interface PlayerSkills {
  pace: number;      // PAC: Speed & acceleration
  shooting: number;  // SHO: Shooting accuracy & power
  passing: number;   // PAS: Short/long passing, crossing
  dribbling: number; // DRI: Agility, ball control
  defending: number; // DEF: Interceptions, tackling, positioning
  physical: number;  // PHY: Stamina, strength, aggression
}

export interface StatMetric {
  toasty: number;
  opponent: number;
}

export interface TeamMatchStats {
  goals: StatMetric;
  assists?: StatMetric;
  shots: StatMetric;           // Legacy alias for shotsOffTarget
  shotsOffTarget?: StatMetric; // Shots off target
  shotsOnTarget: StatMetric;   // Shots on target
  totalShots?: StatMetric;     // shotsOffTarget + shotsOnTarget
  blocks: StatMetric;
  fouls: StatMetric;
  redCards: StatMetric;
  yellowCards: StatMetric;
  saves: StatMetric;
  corners?: StatMetric; // Corners tracked for both teams
}

export type MatchStatsStatus =
  | 'Scheduled'
  | 'Result Only'
  | 'Video Only'
  | 'Full Stats'
  | 'Forfeit';

export interface Match {
  id: string;
  seasonId?: string;
  seasonName?: string;
  season?: string; // backwards compatibility alias (e.g. "2026 SKY Summer")
  date: string;
  time: string;
  opponent: string;
  opponentColor?: string;
  type:
    | 'Season'
    | 'Quarter-Final'
    | 'Semi-Final'
    | 'Final'
    | 'Tournament'
    | 'Consolation'
    | 'League'
    | 'Cup'
    | 'Friendly'
    | string;
  status: 'Upcoming' | 'Completed' | 'Canceled' | string;
  statsStatus?: MatchStatsStatus;
  ownGoalsFor?: number;
  notes?: string;
  location: string;
  toastyScore?: number;
  opponentScore?: number;
  summary?: string;
  goalsScoredBy?: string[]; // Basic array of scorer names
  assistsBy?: string[]; // Basic array of playmaker names who assisted
  goalScorersDetails?: string;
  opponentGoalScorersDetails?: string;
  playerOfTheMatch?: string; // MOTM player name
  youtubeUrl?: string; // Link to YouTube highlights
  stats?: TeamMatchStats; // Detailed match statistics
}

export interface MatchEvent {
  eventId: string;
  matchId: string;
  half: string;
  videoTime: string;
  matchMinute?: number;
  eventType: string;
  team: 'toasty' | 'opponent' | string;
  playerId?: string;
  assistPlayerId?: string;
  onCourtIds?: string[];
  keepInHighlight: boolean;
  starForShorts: boolean;
  notes?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author?: string; // removed from active sheet; optional for backwards compatibility
}

export interface GalleryItem {
  id: string;
  date: string;
  eventName: string;
  imageUrl: string;
  caption: string;
}

export interface SheetConfig {
  spreadsheetId: string;
  apiKey: string;
  isConfigured: boolean;
}

export interface MatchStats {
  id?: string; // e.g. "m2_p1" (optional/generated on the fly)
  matchId: string;
  gameName?: string;
  playerId: string;
  playerName: string;
  present?: boolean; // optional: true if player is present in this match
  goals: number;
  assists: number;
  shots: number;           // Legacy alias for shotsOffTarget
  shotsOffTarget?: number; // Shots off target
  shotsOnTarget: number;
  totalShots?: number;     // shotsOffTarget + shotsOnTarget
  blocks: number;
  saves?: number; // Goalkeepers
  goalsAllowed?: number; // Goalkeepers
  plusMinus: number;
  fouls: number;
  yellows: number;
  reds: number;
  potm: boolean;
  cleanSheet: boolean;
}

export interface ToastyDataset {
  schemaVersion: number;
  generatedAt: string;
  players: Player[];
  seasons: Season[];
  roster: RosterEntry[];
  matches: Match[];
  playerMatchStats: MatchStats[];
  matchEvents?: MatchEvent[];
  news: NewsItem[];
  gallery: GalleryItem[];
}
