export interface Player {
  id: string;
  name: string;
  number?: number;
  position?: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  imageUrl?: string;
  bio: string;
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  cleanSheets?: number; // For Goalkeepers
  saves?: number;       // Goalkeeper saves
  goalsAllowed?: number;// Goalkeeper goals conceded
  isCaptain?: boolean;
  // Extended fields requested by user:
  dateOfBirth?: string;
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
  shots?: number;
  shotsOnTarget?: number;
  blocks?: number;
}

export interface RosterEntry {
  id: string;
  playerId: string;
  playerName?: string;
  season: string;
  number: number;
  imageUrl: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
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
  assists: StatMetric;
  shots: StatMetric;
  shotsOnTarget: StatMetric;
  blocks: StatMetric;
  fouls: StatMetric;
  redCards: StatMetric;
  yellowCards: StatMetric;
  saves: StatMetric;
  corners?: StatMetric; // Corners tracked for both teams
}

export interface Match {
  id: string;
  season: string; // e.g. "2026 SKY Summer" or "2025 Spring"
  date: string;
  time: string;
  opponent: string;
  opponentColor?: string;
  type: 'League' | 'Cup' | 'Friendly';
  status: 'Upcoming' | 'Completed' | 'Canceled';
  location: string;
  toastyScore?: number;
  opponentScore?: number;
  summary?: string;
  goalsScoredBy?: string[]; // Basic array of scorer names
  assistsBy?: string[]; // Basic array of playmaker names who assisted
  goalScorersDetails?: string; // Comma-separated with minutes for spreadsheet manual entry: "Austin Greer (14', 45'), Emily Smith (62')"
  opponentGoalScorersDetails?: string; // Comma-separated with minutes for opponent: "Opponent Scorer (33'), Goal (55')"
  playerOfTheMatch?: string; // MOTM player name
  youtubeUrl?: string; // Link to YouTube highlights
  stats?: TeamMatchStats; // Detailed match statistics
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
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
  shots: number;
  shotsOnTarget: number;
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

