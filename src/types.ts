export interface Player {
  id: number;
  name: string; // Full name, can be kept for backward compatibility or other uses
  firstName: string;
  lastName: string;
  position: string;
  imageUrl: string;
  bio: string;
  jerseyNumber: number;
  nationality: string; // e.g., "US", "RS", "SLV" (ISO 3166-1 alpha-2 codes)
}

export type MatchStatus = 'Upcoming' | 'Live' | 'Win' | 'Draw' | 'Loss' | 'Played';

export interface Match {
  id: number;
  date: string; // YYYY-MM-DD
  time: string;
  homeTeam: { name: string; logo?: string; score?: number };
  awayTeam: { name: string; logo?: string; score?: number };
  venue: string;
  isUpcoming: boolean;
  status?: MatchStatus;
  season: string; // e.g., "2023 Spring", "2022 Winter"
  gameNumber?: string; // Added to store Game # from the sheet
}

// Overall player stats (used on StatsPage)
export interface PlayerStats {
  appearances: number;
  manOfTheMatch: number;
  goals: number;
  assists: number;
  shots: number;
  plusMinus: number;
  fouls: number;
  saves?: number; // Optional, for GKs
}

export interface PlayerWithStats extends Player, PlayerStats {}


// Seasonal player stats (used on FixturesPage)
export interface PlayerSeasonStatsData {
  gamesPlayed: number;
  goals?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  plusMinus?: number;
  foulsCommitted?: number;
  yellowCards?: number;
  redCards?: number;
  manOfTheMatchAwards?: number;
  // GK specific
  saves?: number;
  goalsAgainst?: number;
  savePercentage?: string; // e.g., "75.0%"
  cleanSheets?: number;
}

export interface PlayerSeasonStatsEntry {
  playerId: number;
  seasonKey: string;
  stats: PlayerSeasonStatsData;
}

export interface PlayerWithSeasonStats extends Player {
  seasonStats: PlayerSeasonStatsData;
  isStatLeader?: { [key in keyof PlayerSeasonStatsData]?: boolean };
}


export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// For Gemini Chat
import { Chat } from "@google/genai"; // This import is a library import, path remains the same.
export type GeminiChat = Chat;

// Data structure for the Sponsor form
export interface SponsorFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  interestLevel: string;
  message: string;
}

// Data structure for the Contact Us form
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}