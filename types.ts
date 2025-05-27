




export interface Player {
  id: number;
  name: string; 
  firstName: string;
  lastName: string;
  position: string;
  imageUrl: string;
  bio: string;
  jerseyNumber: number | null;
  nationality: string; 
  status: string; 

  // New fields for Player Detail Page
  nickname?: string;
  joinedClubDate?: string; // YYYY-MM-DD
  playerQuote?: string;
  socialLink?: string; // URL
  dob?: string; // Date of Birth YYYY-MM-DD
  age?: number; 
  height?: string; // e.g., "6'0\"" or "183cm"
  birthplace?: string;

  // Selected skill attributes (can be expanded)
  finishing?: number;
  shortPass?: number;
  tackling?: number;
  sprintSpeed?: number;
  reactions?: number;
  gkReflexes?: number; // Specifically for Goalkeepers

  // Attributes for Radar Chart (assuming a 0-20 scale from sheet)
  ballSkills?: number;
  passing?: number;
  shooting?: number;
  defence?: number;
  goalkeeperRating?: number; // Goalkeeping abilities for the chart
  physical?: number;
  mental?: number;
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
  youtubeLink?: string; // Link to YouTube highlights
}

// Overall player stats (used on StatsPage, now aggregated from GameStats)
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

export interface PlayerWithStats extends Player, PlayerStats {
  statsBySeason?: Record<string, PlayerStats>; // Key is seasonKey (e.g., "Spring 2023")
  availableSeasonsForStats?: string[]; // Sorted list of seasons for which the player has stats
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

// Represents a single row from the 'GameStats' sheet for aggregation
export interface GameStatEntry {
  playerId: number;
  gameId?: number; // Optional, useful if available for precise appearance counting
  seasonKey?: string; // Optional
  goals?: number;
  assists?: number;
  shots?: number;
  plusMinus?: number;
  fouls?: number;
  saves?: number;
  manOfTheMatch?: number; // Expecting 1 for yes, 0 or blank for no
}

// For Radar Chart
export interface RadarChartDataItem {
  label: string;
  value: number;
}

export interface RadarChartProps {
  data: RadarChartDataItem[];
  size?: number;
  maxValue?: number; // The maximum possible value for a stat (e.g., 20 or 100)
  levels?: number;
  labelFactor?: number;
  dotRadius?: number;
  strokeWidth?: number;
  showTooltip?: boolean;
}