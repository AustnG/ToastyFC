

import React from 'react';
import { Player, Match, PlayerWithStats } from './types';

export const TEAM_NAME = "Toasty FC";
export const TEAM_LOGO_URL = "https://yt3.googleusercontent.com/aGmpsObU-FDdohJ0M6Wbd2WMlFlXq5iLQ3vDMnYh1cEwinW66O82jvGrC20Xvwit-ANagZcm=s160-c-k-c0x00ffffff-no-rj";

// New Theme Colors
export const THEME_PRIMARY = "#cabba2"; // Main theme color (Beige)
export const THEME_ACCENT = "#aa0000";  // Accent color (Red)
export const THEME_WHITE = "#ffffff";
export const THEME_BLACK = "#000000";

// Updated constants for consistent usage
export const PRIMARY_COLOR = THEME_PRIMARY;
export const SECONDARY_COLOR = THEME_WHITE;
export const ACCENT_COLOR = THEME_ACCENT;

export const TEXT_COLOR_DARK = `text-[${THEME_BLACK}]`;
export const TEXT_COLOR_LIGHT = `text-[${THEME_WHITE}]`;
export const BACKGROUND_COLOR_LIGHT = 'bg-neutral-100';
export const BACKGROUND_COLOR_DARK = `bg-[${THEME_BLACK}]`;

export const GEMINI_CHAT_MODEL = "gemini-2.5-flash-preview-04-17";

// Calendar Subscription Constants
export const GOOGLE_CALENDAR_ID = "d8625b6ae82fe750e15154d20b52767fc9cf840dd528236cfa888072a7f0d62c@group.calendar.google.com";
export const ICAL_FEED_URL = "https://calendar.google.com/calendar/ical/d8625b6ae82fe750e15154d20b52767fc9cf840dd528236cfa888072a7f0d62c%40group.calendar.google.com/public/basic.ics";


interface MaterialIconProps {
  className?: string;
  style?: React.CSSProperties;
}

const defaultIconStyle: React.CSSProperties = { fontSize: '20px' }; // Standard size for nav/buttons
const largeIconStyle: React.CSSProperties = { fontSize: '24px' }; // For headers or prominent display
const smallIconStyle: React.CSSProperties = { fontSize: '16px' }; // For subtle uses like dropdown chevrons

// Material Symbol Icons
export const MaterialMenuIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...largeIconStyle, ...style}} aria-hidden="true">menu</span>
);

export const MaterialCloseIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...largeIconStyle, ...style}} aria-hidden="true">close</span>
);

export const MaterialChevronDownIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...smallIconStyle, ...style}} aria-hidden="true">expand_more</span>
);

export const MaterialHomeIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">home</span>
);

export const MaterialTeamIcon = ({ className, style }: MaterialIconProps) => ( // Used for "About" in Nav
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">info</span>
);

export const MaterialCalendarIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">calendar_month</span>
);

export const MaterialStatsIcon = ({ className, style }: MaterialIconProps) => ( // Generic stats/leaderboard
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">leaderboard</span>
);

export const MaterialSparklesIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">auto_awesome</span>
);

export const MaterialSendIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">send</span>
);

export const MaterialClubIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">sports_soccer</span>
);

export const MaterialGearIcon = ({ className, style }: MaterialIconProps) => ( // Used for "Gear & Setup"
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">construction</span>
);

export const MaterialUsersIcon = ({ className, style }: MaterialIconProps) => ( // Roster
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">groups</span>
);

export const MaterialConnectIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">hub</span>
);

export const MaterialDollarIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">payments</span>
);

export const MaterialMailIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">mail</span>
);

export const MaterialPlayCircleIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style} aria-hidden="true">play_circle</span> // Kept style prop flexibility for specific large use
);

export const MaterialStarIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...largeIconStyle, ...style}} aria-hidden="true">star</span>
);

export const MaterialEventIcon = ({ className, style }: MaterialIconProps) => ( // For upcoming events/matches
  <span className={`material-symbols-outlined ${className || ''}`} style={{...largeIconStyle, ...style}} aria-hidden="true">event</span>
);

export const MaterialEmojiEventsIcon = ({ className, style }: MaterialIconProps) => ( // For results/awards
  <span className={`material-symbols-outlined ${className || ''}`} style={{...largeIconStyle, ...style}} aria-hidden="true">emoji_events</span>
);

export const MaterialTrendingUpIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...largeIconStyle, ...style}} aria-hidden="true">trending_up</span>
);

export const MaterialBarChartIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">bar_chart</span>
);

// Icons for Player Detail Page
export const MaterialCakeIcon = ({ className, style }: MaterialIconProps) => ( // Date of Birth
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">cake</span>
);
export const MaterialHeightIcon = ({ className, style }: MaterialIconProps) => ( // Height
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">height</span>
);
export const MaterialLocationCityIcon = ({ className, style }: MaterialIconProps) => ( // Birthplace
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">location_city</span>
);
export const MaterialLinkIcon = ({ className, style }: MaterialIconProps) => ( // Social Link
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">link</span>
);
export const MaterialFormatQuoteIcon = ({ className, style }: MaterialIconProps) => ( // Player Quote
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">format_quote</span>
);
export const MaterialPersonIcon = ({ className, style }: MaterialIconProps) => ( // Nickname / Generic Person
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">badge</span>
);
export const MaterialDateRangeIcon = ({ className, style }: MaterialIconProps) => ( // Joined Date
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">date_range</span>
);
export const MaterialSportsKabaddiIcon = ({ className, style }: MaterialIconProps) => ( // For skills
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">sports_kabaddi</span>
);
export const MaterialArrowBackIcon = ({ className, style }: MaterialIconProps) => ( // Back Navigation
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">arrow_back</span>
);

// Placeholders for SponsorPage & ContactPage (if specific icons are needed, replace 'badge', 'subject', 'notes')
export const MaterialBusinessIcon = ({ className, style }: MaterialIconProps) => ( // For Company Name
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">business_center</span>
);
export const MaterialChecklistIcon = ({ className, style }: MaterialIconProps) => ( // For Interest Level
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">checklist</span>
);
export const MaterialCommentIcon = ({ className, style }: MaterialIconProps) => ( // For Message/Comments
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">chat_bubble_outline</span>
);
export const MaterialPhoneIcon = ({ className, style }: MaterialIconProps) => ( // For Phone
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">call</span>
);
export const MaterialSubjectIcon = ({ className, style }: MaterialIconProps) => ( // For Subject
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">subject</span>
);

// Icons for GearSetupPage
export const MaterialCameraIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">photo_camera</span>
);
export const MaterialVideocamIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">videocam</span>
);
export const MaterialListIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">list_alt</span>
);
export const MaterialQuestionAnswerIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">question_answer</span>
);


// Social Media Icons
export const MaterialYouTubeSocialIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">smart_display</span>
);

export const MaterialInstagramSocialIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">photo_camera</span>
);

export const MaterialDiscordSocialIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">forum</span>
);

export const MaterialContentCopyIcon = ({ className, style }: MaterialIconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{...defaultIconStyle, ...style}} aria-hidden="true">content_copy</span>
);


// Custom SVG Icons (like brand logos) are kept
export const ToastIcon = ({ className = "w-24 h-24 text-white" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6H4C3.44772 6 3 6.44772 3 7V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V7C21 6.44772 20.5523 6 20 6ZM5 8H19V12H5V8ZM18 18H6C5.44772 18 5 17.5523 5 17V14H19V17C19 17.5523 18.5523 18 18 18Z" />
    <path d="M7 4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V6H7V4Z" fillOpacity="0.5"/>
  </svg>
);


// Sheet names, assuming these are the names of the tabs in your Google Sheet
export const GOOGLE_SHEET_PLAYERS_TAB = "Players";
export const GOOGLE_SHEET_MATCHES_TAB = "Games";
export const GOOGLE_SHEET_GAME_STATS_TAB = "GameStats"; // For game-by-game player stats, used for aggregation.

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
    const parts = seasonKey.trim().split(' '); // Trim seasonKey before splitting
    const yearStrIndex = parts.findIndex(part => /^\d{4}$/.test(part)); // Find the year (YYYY)
    let year = 0;
    let name = seasonKey.trim(); // Use trimmed key for default name

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
    return { name: name.trim() || "Unknown Season", year, originalKey: seasonKey.trim() };
};


export const getPastSeasonKeysForSelector = (matches: Match[]): string[] => {
    const seasonKeys = new Set<string>();

    matches.forEach(match => {
        const seasonToAdd = match.season ? match.season.trim() : "Unknown Season"; // Trim season from match
        if (seasonToAdd && seasonToAdd.toLowerCase() !== "unknown season" && seasonToAdd !== "") {
            seasonKeys.add(seasonToAdd);
        }
    });

    const seasonTypeOrder: { [key: string]: number } = {
        "Winter": 3,
        "3v3 Live": 2,
        "Spring": 1
    };

    return Array.from(seasonKeys).sort((a, b) => {
        // 'a' and 'b' from seasonKeys are already trimmed
        const { name: aName, year: aYear } = extractSeasonDetailsFromString(a);
        const { name: bName, year: bYear } = extractSeasonDetailsFromString(b);

        if (aYear !== bYear) {
            return bYear - aYear; // Sort by year descending (most recent first)
        }

        const aOrder = seasonTypeOrder[aName] || 0; // aName is already trimmed by extractSeasonDetailsFromString
        const bOrder = seasonTypeOrder[bName] || 0; // bName is already trimmed

        return bOrder - aOrder; // Sort by type order descending (Winter first for same year)
    });
};

// Function to calculate team record
export const calculateTeamRecord = (matches: Match[], teamName: string): { wins: number, draws: number, losses: number, played: number } => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let played = 0;

  matches.forEach(match => {
    if (match.isUpcoming || typeof match.homeTeam.score !== 'number' || typeof match.awayTeam.score !== 'number') {
      return;
    }
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

export const STATIC_GOALS_SCORED = 138;
export const STATIC_GOALS_AGAINST = 117;
export const STATIC_AVG_GPG = 4.45;
export const STATIC_CLEAN_SHEETS = 4;

export const calculateAge = (dobString?: string): number | undefined => {
  if (!dobString) return undefined;
  try {
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return undefined;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    return undefined;
  }
};