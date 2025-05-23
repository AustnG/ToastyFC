import { Player, Match, PlayerStats, PlayerSeasonStatsEntry, PlayerSeasonStatsData, PlayerWithStats, MatchStatus } from '../types';
import { parseCSV } from '../utils/csvParser';
import { TEAM_NAME } from '../constants';

const GOOGLE_SHEET_ID: string = '1gNPLTcpeJ8CDAOWuSz193S4IOSie8CHAhUxBROAzvnk';

async function fetchSheetData(sheetName: string): Promise<Record<string, string>[]> {
  if (GOOGLE_SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE' || !GOOGLE_SHEET_ID) {
    const errorMessage = "Google Sheet ID is not configured. Please replace 'YOUR_GOOGLE_SHEET_ID_HERE' in services/googleSheetsService.ts with your actual Google Sheet ID.";
    console.error(errorMessage);
    throw new Error(errorMessage + " You can find the ID in your Google Sheet's URL.");
  }
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
         throw new Error(`Failed to fetch sheet "${sheetName}". Response status: 404 (Not Found). This could mean the Google Sheet ID ('${GOOGLE_SHEET_ID}') is incorrect, the sheet name ('${sheetName}') is wrong, or the sheet is not properly shared or published for CSV export via the gviz endpoint. Ensure sharing is set to "Anyone with the link can view".`);
      }
      throw new Error(`Failed to fetch sheet "${sheetName}": ${response.status} ${response.statusText}. Check network connectivity and Google Sheet sharing permissions (must be "Anyone with the link can view").`);
    }
    const csvText = await response.text();
    if (!csvText || csvText.trim() === "") {
        console.warn(`Sheet "${sheetName}" is empty or returned no content. Fetch was successful but data is missing.`);
        return [];
    }
    return parseCSV(csvText);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.error(`Network error or CORS issue while fetching sheet "${sheetName}" from URL: ${url}. Ensure internet connectivity and that the Google Sheet (${GOOGLE_SHEET_ID}) is shared as "Anyone with the link can view". Some browser extensions (like ad-blockers) might also interfere.`, error);
        throw new Error(`Network error fetching sheet "${sheetName}". Please check your internet connection and ensure the Google Sheet's sharing permissions are set to "Anyone with the link can view".`);
    }
    console.error(`Error fetching or parsing sheet "${sheetName}":`, error);
    throw error;
  }
}

// --- Parsers for specific data types ---

function parsePlayer(row: Record<string, string>): Player {
  const firstName = row['First'] || 'Player';
  const lastName = row['Last'] || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: parseInt(row['PlayerId'] || '000', 10),
    name: fullName,
    firstName: firstName,
    lastName: lastName,
    position: row['Position(s)'] || 'Unknown',
    // If 'Image URL' is empty, set to empty string. Otherwise, use the provided URL.
    imageUrl: row['Image URL'] || '', 
    bio: row['Bio'] || 'No bio available.',
    jerseyNumber: parseInt(row['Number'] || '0', 10),
    nationality: (row['Nationality'] || 'US').toUpperCase(), // Default to 'US' if not specified, ensure uppercase for consistency
  };
}

function parseMatch(row: Record<string, string>): Match {
  const gameId = parseInt(row['GameId'] || '0', 10);
  const gameNumber = row['Game#'] || undefined; // Read the 'Game#' column
  const dateStrRaw = row['GameDate']; // Expected YYYY/MM/DD
  const timeStr = row['GameTime'] || '00:00';

  const isValidDateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
  const isValidDate = isValidDateRegex.test(dateStrRaw);
  const formattedDateForParsing = isValidDate ? dateStrRaw.replace(/\//g, '-') : new Date().toISOString().split('T')[0];
  const dateForMatchObject = formattedDateForParsing; // Store as YYYY-MM-DD
  
  const toastyLocation = row['Home//Away']?.trim().toLowerCase();
  const opponentName = row['Opponent'] || 'Opponent TBA';
  
  const toastyScoreStr = row['Goals'];
  const opponentScoreStr = row['GoalsAgainst'];

  const toastyScore = toastyScoreStr && !isNaN(parseInt(toastyScoreStr, 10)) ? parseInt(toastyScoreStr, 10) : undefined;
  const opponentScore = opponentScoreStr && !isNaN(parseInt(opponentScoreStr, 10)) ? parseInt(opponentScoreStr, 10) : undefined;

  let homeTeamName: string, awayTeamName: string;
  let homeTeamLogo: string | undefined, awayTeamLogo: string | undefined;
  let homeTeamScore: number | undefined, awayTeamScore: number | undefined;

  if (toastyLocation === 'home') {
    homeTeamName = TEAM_NAME;
    homeTeamLogo = row['Home Logo']; 
    homeTeamScore = toastyScore;
    awayTeamName = opponentName;
    awayTeamLogo = row['Away Logo']; 
    awayTeamScore = opponentScore;
  } else { 
    homeTeamName = opponentName;
    homeTeamLogo = row['Home Logo']; 
    homeTeamScore = opponentScore;
    awayTeamName = TEAM_NAME;
    awayTeamLogo = row['Away Logo']; 
    awayTeamScore = toastyScore;
  }
  
  const wdlValue = row['W-D-L']?.trim().toUpperCase();
  let determinedStatus: MatchStatus = 'Upcoming';
  let determinedIsUpcoming = true;

  const gameDateTime = new Date(`${dateForMatchObject}T${timeStr || '00:00'}`);
  const now = new Date();
  // Check if game is in the past, considering potentially invalid dates if scores are present
  const isPastGame = !isNaN(gameDateTime.getTime()) && gameDateTime < now;
  const isEffectivelyPastOrWithScores = isPastGame || (isNaN(gameDateTime.getTime()) && (typeof homeTeamScore === 'number' || typeof awayTeamScore === 'number'));


  if (wdlValue === 'W') {
    determinedStatus = 'Win';
    determinedIsUpcoming = false;
  } else if (wdlValue === 'D') {
    determinedStatus = 'Draw';
    determinedIsUpcoming = false;
  } else if (wdlValue === 'L') {
    determinedStatus = 'Loss';
    determinedIsUpcoming = false;
  } else { // W-D-L is not specified or not W, D, L
    if (isEffectivelyPastOrWithScores) {
      determinedStatus = 'Played'; // Game is over, but no W,D,L from sheet.
      determinedIsUpcoming = false;
    } else { // Future game or past game with no scores and no WDL
      determinedStatus = 'Upcoming';
      determinedIsUpcoming = true;
    }
  }

  return {
    id: gameId,
    gameNumber: gameNumber, // Populate gameNumber
    date: dateForMatchObject,
    time: timeStr,
    homeTeam: { 
      name: homeTeamName, 
      logo: homeTeamLogo, 
      score: homeTeamScore
    },
    awayTeam: { 
      name: awayTeamName, 
      logo: awayTeamLogo,
      score: awayTeamScore
    },
    venue: row['Venue'] || 'F.O. Moxley Community Center',
    isUpcoming: determinedIsUpcoming,
    status: determinedStatus,
    season: row['Season'] || 'Unknown Season',
  };
}


function parseOverallPlayerStats(row: Record<string, string>, player: Player): PlayerWithStats {
  return {
    ...player,
    appearances: parseInt(row['Appearances'] || '0', 10),
    manOfTheMatch: parseInt(row['Man of the Match'] || '0', 10),
    goals: parseInt(row['Goals'] || '0', 10),
    assists: parseInt(row['Assists'] || '0', 10),
    shots: parseInt(row['Shots'] || '0', 10),
    plusMinus: parseInt(row['Plus/Minus'] || '0', 10),
    fouls: parseInt(row['Fouls'] || '0', 10),
    saves: row['Saves'] ? parseInt(row['Saves'], 10) : undefined,
  };
}

function parsePlayerSeasonStatsEntry(row: Record<string, string>): PlayerSeasonStatsEntry {
  const stats: PlayerSeasonStatsData = {
    gamesPlayed: parseInt(row['Games Played'] || '0', 10),
    goals: row['Goals'] ? parseInt(row['Goals'], 10) : undefined,
    assists: row['Assists'] ? parseInt(row['Assists'], 10) : undefined,
    shots: row['Shots'] ? parseInt(row['Shots'], 10) : undefined,
    shotsOnTarget: row['Shots on Target'] ? parseInt(row['Shots on Target'], 10) : undefined,
    plusMinus: row['Plus/Minus'] ? parseInt(row['Plus/Minus'], 10) : undefined,
    foulsCommitted: row['Fouls Committed'] ? parseInt(row['Fouls Committed'], 10) : undefined,
    yellowCards: row['Yellow Cards'] ? parseInt(row['Yellow Cards'], 10) : undefined,
    redCards: row['Red Cards'] ? parseInt(row['Red Cards'], 10) : undefined,
    manOfTheMatchAwards: row['Man of the Match Awards'] ? parseInt(row['Man of the Match Awards'], 10) : undefined,
    saves: row['Saves'] ? parseInt(row['Saves'], 10) : undefined,
    goalsAgainst: row['Goals Against'] ? parseInt(row['Goals Against'], 10) : undefined,
    savePercentage: row['Save Percentage'], 
    cleanSheets: row['Clean Sheets'] ? parseInt(row['Clean Sheets'], 10) : undefined,
  };
  return {
    playerId: parseInt(row['Player ID'] || '0', 10),
    seasonKey: row['Season Key'] || 'Unknown Season',
    stats: stats,
  };
}

// --- Public service functions ---
export const googleSheetsService = {
  fetchPlayers: async (sheetName: string): Promise<Player[]> => {
    let rawData = await fetchSheetData(sheetName);
    if (rawData.length > 0) {
      // Assuming first row is headers for players, skip it if it matches specific header names or pattern
      const headers = Object.keys(rawData[0]);
      if (headers.includes('PlayerId') && headers.includes('First') && headers.includes('Last')) {
         // This check is heuristic. Adjust if your header row for players is different or not present.
        // If players sheet specifically has a header row that should be skipped, use:
        // rawData = rawData.slice(1);
      }
    }
    return rawData.map(parsePlayer);
  },

  fetchMatches: async (sheetName: string): Promise<Match[]> => {
    const rawData = await fetchSheetData(sheetName);
    // Assuming the first row of the Games sheet is headers and should be skipped by parseCSV logic
    // If parseCSV itself doesn't skip headers, and the first row is actual data, this slice(1) might be needed.
    // However, parseCSV is designed to handle headers, so rawData should be fine.
    const matches = rawData.map(parseMatch);
    
    return matches.sort((a, b) => {
        let dateAVal: number;
        let dateBVal: number;
        try {
            dateAVal = new Date(`${a.date.replace(/\//g, '-')}T${a.time || '00:00'}`).getTime();
            if (isNaN(dateAVal)) dateAVal = (a.isUpcoming ? -Infinity : Infinity); 
        } catch { dateAVal = (a.isUpcoming ? -Infinity : Infinity); }
         try {
            dateBVal = new Date(`${b.date.replace(/\//g, '-')}T${b.time || '00:00'}`).getTime();
            if (isNaN(dateBVal)) dateBVal = (b.isUpcoming ? -Infinity : Infinity);
        } catch { dateBVal = (b.isUpcoming ? -Infinity : Infinity); }

        if (a.isUpcoming && !b.isUpcoming) return -1;
        if (!a.isUpcoming && b.isUpcoming) return 1;
        
        if (a.isUpcoming && b.isUpcoming) return dateAVal - dateBVal; 
        
        return dateBVal - dateAVal; 
    });
  },

  fetchPlayersWithOverallStats: async (playersSheetName: string, overallStatsSheetName: string): Promise<PlayerWithStats[]> => {
    const players = await googleSheetsService.fetchPlayers(playersSheetName);
    const rawStatsData = await fetchSheetData(overallStatsSheetName);
    
    const statsMap = new Map<number, Record<string, string>>();
    // Assuming first row of overall stats sheet is headers. If parseCSV handles it, this is fine.
    // If not, and headers are included in rawStatsData, you might need:
    // rawStatsData.slice(1).forEach(row => { ... })
    rawStatsData.forEach(row => {
        const playerId = parseInt(row['Player ID'] || '0', 10);
        if (playerId) statsMap.set(playerId, row);
    });

    return players.map(player => {
        const playerStatsRow = statsMap.get(player.id);
        if (playerStatsRow) {
            return parseOverallPlayerStats(playerStatsRow, player);
        }
        // Return player with default/empty stats if no stats entry found
        return {
            ...player, 
            appearances: 0, manOfTheMatch: 0, goals: 0, assists: 0, shots: 0, plusMinus: 0, fouls: 0, saves: undefined
        };
    });
  },

  fetchPlayerSeasonStatsEntries: async (sheetName: string): Promise<PlayerSeasonStatsEntry[]> => {
    const rawData = await fetchSheetData(sheetName);
    // Assuming first row of season stats sheet is headers.
    // If not, and headers are included in rawData, you might need rawData.slice(1).map(...)
    return rawData.map(parsePlayerSeasonStatsEntry);
  },
};