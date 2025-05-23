

import React from 'react';
// Fix: Imported PlayerWithSeasonStats to resolve type errors.
import { Player, Match, PlayerWithStats, PlayerSeasonStatsEntry, PlayerSeasonStatsData, PlayerWithSeasonStats } from './types';

export const TEAM_NAME = "Toasty FC";

// New Theme Colors
export const THEME_PRIMARY = "#cabba2"; // Main theme color (Beige)
export const THEME_ACCENT = "#aa0000";  // Accent color (Red)
export const THEME_WHITE = "#ffffff";
export const THEME_BLACK = "#000000";

// Updated constants for consistent usage
export const PRIMARY_COLOR = THEME_PRIMARY;
export const SECONDARY_COLOR = THEME_WHITE; // Using white as a general secondary, previously yellow
export const ACCENT_COLOR = THEME_ACCENT;

export const TEXT_COLOR_DARK = `text-[${THEME_BLACK}]`;
export const TEXT_COLOR_LIGHT = `text-[${THEME_WHITE}]`;
export const BACKGROUND_COLOR_LIGHT = 'bg-neutral-100'; // Changed from white to soft grey
export const BACKGROUND_COLOR_DARK = `bg-[${THEME_BLACK}]`;

export const GEMINI_CHAT_MODEL = "gemini-2.5-flash-preview-04-17";

// SVG Icons - No color changes needed here as they inherit 'currentColor' or are explicitly set in components
export const MenuIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const CloseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ChevronDownIcon = ({ className = "w-4 h-4 ml-1" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

export const HomeIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.414V18a1 1 0 01-1 1H4a1 1 0 01-1-1V10.414a1 1 0 01.293-.707l7-7z" clipRule="evenodd" />
  </svg>
);

export const TeamIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

export const CalendarIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.75 3A.75.75 0 016.5 2.25h7A.75.75 0 0114.25 3v.75h.75a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5.75a2 2 0 012-2h.75V3zm-1 3.75v10a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V6.75a.5.5 0 00-.5-.5H3.5a.5.5 0 00-.5.5zm0-1.5V4.5a.5.5 0 01.5-.5h11a.5.5 0 01.5.5v.75a.5.5 0 01-.5.5H3.5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
  </svg>
);

export const StatsIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const SparklesIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.251.865 4.947 4.145 2.571 4.145-2.571.865-4.947-3.423-3.251-4.753-.39L10 2.884zm4.145 2.571L13.75 10l1.83 4.401 4.753.39 3.423-3.251-.865-4.947-4.145-2.571zM1.83 14.402L5.253 11l-1.83-4.401L.007 6.21.865 1.263 5 3.834l1.83 4.401L5.253 11l-3.423 3.251z" clipRule="evenodd" />
  </svg>
);

export const SendIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M3.105 3.105a.75.75 0 01.814-.153l12.024 4.315a.75.75 0 010 1.378L3.92 13.053a.75.75 0 01-.965-.258.755.755 0 01.156-.838l3.571-3.927L3.105 3.105zM5.073 9.073L3.087 11.99L15.03 7.497L5.073 9.073z" />
  </svg>
);

export const ClubIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V7.875c0-.621.504-1.125 1.125-1.125H6.75M12 21.75H8.625c-.621 0-1.125-.504-1.125-1.125V15m1.125-7.5V4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V7.5m-9 7.5h9" />
  </svg>
);

export const GearIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

export const UsersIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const ConnectIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export const DollarIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const MailIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export const ToastIcon = ({ className = "w-24 h-24 text-white" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6H4C3.44772 6 3 6.44772 3 7V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V7C21 6.44772 20.5523 6 20 6ZM5 8H19V12H5V8ZM18 18H6C5.44772 18 5 17.5523 5 17V14H19V17C19 17.5523 18.5523 18 18 18Z" />
    <path d="M7 4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V6H7V4Z" fillOpacity="0.5"/>
  </svg>
);


// Sheet names, assuming these are the names of the tabs in your Google Sheet
export const GOOGLE_SHEET_PLAYERS_TAB = "Players";
export const GOOGLE_SHEET_MATCHES_TAB = "Games";
export const GOOGLE_SHEET_OVERALL_STATS_TAB = "OverallStats";
export const GOOGLE_SHEET_SEASON_STATS_TAB = "SeasonStats";

// Season Logic Helpers
export const getSeasonDetails = (date: Date): { name: 'Spring' | 'Winter', yearForSeason: number, key: string } => {
  const month = date.getMonth(); // 0-11 (Jan-Dec)
  const year = date.getFullYear();

  if (month >= 1 && month <= 6) { // Feb to July (Spring Season activities)
    return { name: 'Spring', yearForSeason: year, key: `Spring ${year}` };
  } else if (month >= 7 && month <= 11) { // Aug to Dec (Winter Season activities)
    return { name: 'Winter', yearForSeason: year, key: `Winter ${year}` };
  } else { // Jan (month 0) is part of the previous year's Winter season
    return { name: 'Winter', yearForSeason: year - 1, key: `Winter ${year - 1}` };
  }
};

export const CURRENT_SEASON_DETAILS = getSeasonDetails(new Date());
export const CURRENT_SEASON_KEY = CURRENT_SEASON_DETAILS.key;

const extractSeasonDetailsFromString = (seasonKey: string): { name: string, year: number, originalKey: string } => {
    const parts = seasonKey.split(' ');
    const yearStrIndex = parts.findIndex(part => /^\d{4}$/.test(part)); // Find the year (YYYY)
    let year = 0;
    let name = seasonKey;

    if (yearStrIndex !== -1) {
        year = parseInt(parts[yearStrIndex]);
        name = parts.slice(0, yearStrIndex).join(' ');
        if (!name && parts.length > yearStrIndex + 1) { 
          name = parts.slice(0, yearStrIndex +1).join(' '); 
        } else if (!name) {
          name = parts.join(' '); 
        }
    } else {
      const potentialYear = parseInt(parts[parts.length - 1]);
      if (!isNaN(potentialYear) && potentialYear > 2000 && potentialYear < 2100) {
        year = potentialYear;
        name = parts.slice(0, -1).join(' ');
      }
    }
    return { name: name || "Unknown Season", year, originalKey: seasonKey };
};


export const getPastSeasonKeysForSelector = (matches: Match[], currentSeasonKeyToEnsure?: string): string[] => {
    const seasonKeys = new Set<string>();
    
    if (currentSeasonKeyToEnsure && currentSeasonKeyToEnsure.trim().toLowerCase() !== "unknown season" && currentSeasonKeyToEnsure.trim() !== "") {
        seasonKeys.add(currentSeasonKeyToEnsure);
    }

    matches.forEach(match => {
        if (match.season && match.season.trim().toLowerCase() !== "unknown season" && match.season.trim() !== "") {
            seasonKeys.add(match.season);
        }
    });
    
    const seasonTypeOrder: { [key: string]: number } = { 
        "Winter": 3, 
        "3v3 Live": 2, 
        "Spring": 1  
    };
    
    return Array.from(seasonKeys).sort((a, b) => {
        const { name: aName, year: aYear } = extractSeasonDetailsFromString(a);
        const { name: bName, year: bYear } = extractSeasonDetailsFromString(b);

        if (aYear !== bYear) {
            return bYear - aYear; // Sort by year descending (most recent first)
        }
        
        const aOrder = seasonTypeOrder[aName.trim()] || 0; 
        const bOrder = seasonTypeOrder[bName.trim()] || 0;

        return bOrder - aOrder; // Sort by type order descending (Winter first for same year)
    });
};

// Define which stats are primary for leader highlighting
export const STAT_CATEGORIES: { fieldPlayer: (keyof PlayerSeasonStatsData)[], goalkeeper: (keyof PlayerSeasonStatsData)[] } = {
  fieldPlayer: ['goals', 'assists', 'shotsOnTarget', 'manOfTheMatchAwards'],
  goalkeeper: ['saves', 'savePercentage', 'cleanSheets', 'manOfTheMatchAwards']
};

export const getPlayersWithSeasonStats = (
    allPlayers: Player[], 
    allSeasonStats: PlayerSeasonStatsEntry[], 
    seasonKey: string
): PlayerWithSeasonStats[] => {
  const playersWithStats: PlayerWithSeasonStats[] = [];
  const seasonStatEntries = allSeasonStats.filter(entry => entry.seasonKey === seasonKey);

  for (const entry of seasonStatEntries) {
    const playerInfo = allPlayers.find(p => p.id === entry.playerId);
    if (playerInfo) {
      playersWithStats.push({
        ...playerInfo,
        seasonStats: entry.stats,
        isStatLeader: {} // Initialize, will be populated below
      });
    }
  }

  if (playersWithStats.length === 0) return [];

  const categoriesToConsider = playersWithStats[0].position === "Goalkeeper" 
    ? STAT_CATEGORIES.goalkeeper 
    : STAT_CATEGORIES.fieldPlayer;

  for (const statKey of categoriesToConsider) {
    let maxVal: number | string | undefined = undefined;
    
    playersWithStats.forEach(pws => {
      const val = pws.seasonStats[statKey];
      if (val !== undefined) {
        if (typeof val === 'number') {
          if (maxVal === undefined || val > (maxVal as number)) {
            maxVal = val;
          }
        } else if (typeof val === 'string' && statKey === 'savePercentage') { 
           const numVal = parseFloat(val.replace('%',''));
           if (!isNaN(numVal) && (maxVal === undefined || numVal > parseFloat((maxVal as string).replace('%','')))) {
             maxVal = val;
           }
        }
      }
    });

    if (maxVal !== undefined) {
      playersWithStats.forEach(pws => {
         const currentVal = pws.seasonStats[statKey];
        if (currentVal === maxVal && ((typeof maxVal === 'number' && maxVal > 0) || (typeof maxVal === 'string' && parseFloat(maxVal.replace('%','')) > 0)) ) { 
          pws.isStatLeader![statKey] = true;
        }
      });
    }
  }
  return playersWithStats;
};

// Function to calculate team record
export const calculateTeamRecord = (matches: Match[], teamName: string): { wins: number, draws: number, losses: number, played: number } => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let played = 0;

  matches.forEach(match => {
    // Only count matches that are not upcoming and have scores
    if (match.isUpcoming || typeof match.homeTeam.score !== 'number' || typeof match.awayTeam.score !== 'number') {
      return; 
    }
    // Check if Toasty FC is part of the match
    if (match.homeTeam.name === teamName || match.awayTeam.name === teamName) {
        played++;
        if (match.homeTeam.score === match.awayTeam.score) {
          draws++;
        } else if (match.homeTeam.name === teamName) {
          if (match.homeTeam.score > match.awayTeam.score) wins++;
          else losses++;
        } else if (match.awayTeam.name === teamName) {
          if (match.awayTeam.score > match.homeTeam.score) wins++;
          else losses++;
        }
    }
  });
  return { wins, draws, losses, played };
};

// Placeholder static team stats - these might also come from a sheet or be calculated differently in the future.
// For now, keeping them as they were in StatsPage.tsx
export const STATIC_GOALS_SCORED = 138;
export const STATIC_GOALS_AGAINST = 117;
export const STATIC_AVG_GPG = 4.45;
export const STATIC_CLEAN_SHEETS = 4;