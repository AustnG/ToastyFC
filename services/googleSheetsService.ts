




import { Player, Match, PlayerStats, PlayerWithStats, MatchStatus, GameStatEntry } from '../types';
import { parseCSV } from '../utils/csvParser';
import { TEAM_NAME, TEAM_LOGO_URL, calculateAge, getPastSeasonKeysForSelector } from '../constants'; // Added getPastSeasonKeysForSelector

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

function parsePlayer(row: Record<string, string>): Player {
  const firstName = row['First'] || 'Player';
  const lastName = row['Last'] || '';
  const fullName = `${firstName} ${lastName}`.trim();

  const numStr = row['Number']?.trim();
  let jerseyNum: number | null = null;
  if (numStr && numStr !== "") {
    const parsed = parseInt(numStr, 10);
    if (!isNaN(parsed)) {
      jerseyNum = parsed;
    }
  }
  
  const dob = row['DoB'] || undefined;
  const ageFromSheet = row['Age'] ? parseInt(row['Age'], 10) : undefined;
  const calculatedAge = calculateAge(dob);

  const getSkillValue = (skillName: string): number | undefined => {
    const val = row[skillName];
    if (val === undefined || val === null || val.trim() === '') return undefined;
    const parsedVal = parseInt(val, 10);
    return isNaN(parsedVal) ? undefined : parsedVal;
  };

  return {
    id: parseInt(row['PlayerId'] || '000', 10),
    name: fullName,
    firstName: firstName,
    lastName: lastName,
    position: row['Position(s)'] || 'Unknown',
    imageUrl: row['ImageUrl'] || row['Image URL'] || '', // Added ImageUrl as an alternative column name
    bio: row['Bio'] || 'No bio available.',
    jerseyNumber: jerseyNum,
    nationality: (row['Nationality'] || 'US').toUpperCase(),
    status: (row['Status'] || 'Unknown').trim(),

    // New fields for Player Detail Page
    nickname: row['Nickname'] || undefined,
    joinedClubDate: row['JoinedClubDate'] || row['JoinedDate'] || undefined, // Added JoinedDate as alternative
    playerQuote: row['PlayerQuote'] || undefined,
    socialLink: row['SocialLink'] || undefined,
    dob: dob,
    age: ageFromSheet || calculatedAge, // Prefer age from sheet if available, else calculate
    height: row['Height'] || undefined,
    birthplace: row['Birthplace'] || undefined,

    // Selected skill attributes
    finishing: getSkillValue('Finishing'),
    shortPass: getSkillValue('Short Pass'),
    tackling: getSkillValue('Tackling'),
    sprintSpeed: getSkillValue('Sprint Speed'),
    reactions: getSkillValue('Reactions'),
    gkReflexes: getSkillValue('GK Reflexes'),

    // Attributes for Radar Chart
    ballSkills: getSkillValue('Ball Skills'),
    passing: getSkillValue('Passing'),
    shooting: getSkillValue('Shooting'),
    defence: getSkillValue('Defence'),
    goalkeeperRating: getSkillValue('GoalkeeperRating'), // Column name for GK specific ability for radar
    physical: getSkillValue('Physical'),
    mental: getSkillValue('Mental'),
  };
}

function parseMatch(row: Record<string, string>): Match {
  const gameId = parseInt(row['GameId'] || '0', 10);
  const gameNumber = row['Game#'] || undefined;
  const dateStrRaw = row['GameDate'];
  const timeStr = row['GameTime'] || '00:00';
  const youtubeLink = row['YouTubeLink'] || undefined; 

  const isValidDateRegex = /^\d{4}\/\d{2}\/\d{2}$/; // Expects YYYY/MM/DD
  let dateForMatchObject: string;

  if (dateStrRaw && isValidDateRegex.test(dateStrRaw)) {
    dateForMatchObject = dateStrRaw.replace(/\//g, '-'); // Convert YYYY/MM/DD to YYYY-MM-DD
  } else if (dateStrRaw) {
    // Attempt to parse other common date formats or log a warning
    try {
      const parsedDate = new Date(dateStrRaw);
      if (!isNaN(parsedDate.getTime())) {
        dateForMatchObject = parsedDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      } else {
        // console.warn(`Invalid date format for GameId ${gameId}: ${dateStrRaw}. Using current date as fallback.`);
        dateForMatchObject = new Date().toISOString().split('T')[0];
      }
    } catch (e) {
    //   console.warn(`Error parsing date for GameId ${gameId}: ${dateStrRaw}. Using current date as fallback.`, e);
      dateForMatchObject = new Date().toISOString().split('T')[0];
    }
  } else {
    // console.warn(`Missing date for GameId ${gameId}. Using current date as fallback.`);
    dateForMatchObject = new Date().toISOString().split('T')[0];
  }


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
    homeTeamLogo = TEAM_LOGO_URL; 
    homeTeamScore = toastyScore;
    awayTeamName = opponentName;
    awayTeamLogo = row['Away Logo'] || undefined; 
    awayTeamScore = opponentScore;
  } else { 
    homeTeamName = opponentName;
    homeTeamLogo = row['Home Logo'] || undefined; 
    homeTeamScore = opponentScore;
    awayTeamName = TEAM_NAME;
    awayTeamLogo = TEAM_LOGO_URL; 
    awayTeamScore = toastyScore;
  }

  const wdlValue = row['W-D-L']?.trim().toUpperCase();
  let determinedStatus: MatchStatus = 'Upcoming';
  let determinedIsUpcoming = true;

  const gameDateTime = new Date(`${dateForMatchObject}T${timeStr || '00:00'}`);
  const now = new Date();
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
  } else {
    if (isEffectivelyPastOrWithScores) {
      determinedStatus = 'Played';
      determinedIsUpcoming = false;
    } else {
      determinedStatus = 'Upcoming';
      determinedIsUpcoming = true;
    }
  }

  return {
    id: gameId,
    gameNumber: gameNumber,
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
    season: (row['Season'] || 'Unknown Season').trim(), 
    youtubeLink: youtubeLink,
  };
}

// Parser for individual game stat entries from 'GameStats' sheet
function parseGameStatEntry(row: Record<string, string>): GameStatEntry | null {
    const playerId = parseInt(row['Player ID'] || row['PlayerId'] || '', 10);
    if (isNaN(playerId) || playerId === 0) {
        // console.warn('Skipping GameStatEntry due to invalid or missing Player ID:', row);
        return null; // Skip if Player ID is invalid
    }

    return {
        playerId: playerId,
        gameId: row['GameId'] ? parseInt(row['GameId'], 10) : undefined,
        seasonKey: (row['Season'] || 'Unknown Season').trim(), 
        goals: row['Goals'] ? parseInt(row['Goals'], 10) : 0,
        assists: row['Assists'] ? parseInt(row['Assists'], 10) : 0,
        shots: row['Shots'] ? parseInt(row['Shots'], 10) : 0,
        plusMinus: row['+/-'] ? parseInt(row['+/-'], 10) : 0,
        fouls: row['Fouls'] ? parseInt(row['Fouls'], 10) : 0,
        saves: row['Saves'] ? parseInt(row['Saves'], 10) : 0, 
        manOfTheMatch: (row['MotM'] === 'TRUE' || row['MotM'] === '1' ) ? 1 : 0, // Accept '1' as true for MotM
    };
}

const createEmptyPlayerStats = (): PlayerStats => ({
  appearances: 0,
  manOfTheMatch: 0,
  goals: 0,
  assists: 0,
  shots: 0,
  plusMinus: 0,
  fouls: 0,
  saves: 0,
});

// --- Public service functions ---
export const googleSheetsService = {
  fetchPlayers: async (sheetName: string): Promise<Player[]> => {
    let rawData = await fetchSheetData(sheetName);
    return rawData.map(parsePlayer).filter(player => player.id !== 0 && player.name.toLowerCase() !== 'player'); 
  },

  fetchMatches: async (sheetName: string): Promise<Match[]> => {
    const rawData = await fetchSheetData(sheetName);
    const matches = rawData.map(parseMatch).filter(match => match.id !== 0);


    return matches.sort((a, b) => {
        let dateAVal: number;
        let dateBVal: number;
        try {
            dateAVal = new Date(`${a.date.replace(/\//g, '-')}T${a.time || '00:00'}`).getTime();
            if (isNaN(dateAVal)) dateAVal = (a.isUpcoming ? -Infinity : Infinity); // Push invalid dates for upcoming to top, past to bottom
        } catch { dateAVal = (a.isUpcoming ? -Infinity : Infinity); }
         try {
            dateBVal = new Date(`${b.date.replace(/\//g, '-')}T${b.time || '00:00'}`).getTime();
            if (isNaN(dateBVal)) dateBVal = (b.isUpcoming ? -Infinity : Infinity);
        } catch { dateBVal = (b.isUpcoming ? -Infinity : Infinity); }

        // Prioritize upcoming matches first
        if (a.isUpcoming && !b.isUpcoming) return -1;
        if (!a.isUpcoming && b.isUpcoming) return 1;

        // If both are upcoming, sort by date ascending (sooner first)
        if (a.isUpcoming && b.isUpcoming) return dateAVal - dateBVal;

        // If both are past, sort by date descending (most recent first)
        return dateBVal - dateAVal;
    });
  },

  fetchPlayersWithOverallStats: async (playersSheetName: string, gameStatsSheetName: string): Promise<PlayerWithStats[]> => {
    const players = await googleSheetsService.fetchPlayers(playersSheetName);
    const rawGameStatsData = await fetchSheetData(gameStatsSheetName);

    const individualGameStats = rawGameStatsData.map(parseGameStatEntry).filter(Boolean) as GameStatEntry[];

    const playerOverallStatsMap = new Map<number, PlayerStats>();
    const playerSeasonalStatsMap = new Map<number, Record<string, PlayerStats>>();

    individualGameStats.forEach(gameStat => {
      const { playerId, seasonKey, ...stats } = gameStat;
      if (!seasonKey) return; // Skip if no season key

      // Aggregate overall stats
      if (!playerOverallStatsMap.has(playerId)) {
        playerOverallStatsMap.set(playerId, createEmptyPlayerStats());
      }
      const overallPlayerStats = playerOverallStatsMap.get(playerId)!;
      overallPlayerStats.appearances += 1;
      overallPlayerStats.goals += stats.goals || 0;
      overallPlayerStats.assists += stats.assists || 0;
      overallPlayerStats.shots += stats.shots || 0;
      overallPlayerStats.plusMinus += stats.plusMinus || 0;
      overallPlayerStats.fouls += stats.fouls || 0;
      overallPlayerStats.manOfTheMatch += stats.manOfTheMatch || 0;
      overallPlayerStats.saves = (overallPlayerStats.saves || 0) + (stats.saves || 0);

      // Aggregate seasonal stats
      if (!playerSeasonalStatsMap.has(playerId)) {
        playerSeasonalStatsMap.set(playerId, {});
      }
      const seasonalStatsCollection = playerSeasonalStatsMap.get(playerId)!;
      if (!seasonalStatsCollection[seasonKey]) {
        seasonalStatsCollection[seasonKey] = createEmptyPlayerStats();
      }
      const seasonalPlayerStats = seasonalStatsCollection[seasonKey];
      seasonalPlayerStats.appearances += 1;
      seasonalPlayerStats.goals += stats.goals || 0;
      seasonalPlayerStats.assists += stats.assists || 0;
      seasonalPlayerStats.shots += stats.shots || 0;
      seasonalPlayerStats.plusMinus += stats.plusMinus || 0;
      seasonalPlayerStats.fouls += stats.fouls || 0;
      seasonalPlayerStats.manOfTheMatch += stats.manOfTheMatch || 0;
      seasonalPlayerStats.saves = (seasonalPlayerStats.saves || 0) + (stats.saves || 0);
    });

    return players.map(player => {
        const overallStats = playerOverallStatsMap.get(player.id) || createEmptyPlayerStats();
        const statsBySeason = playerSeasonalStatsMap.get(player.id) || {};
        
        // Make saves undefined for non-GKs if saves are 0 for overall stats
        if (overallStats.saves === 0 && player.position !== "Goalkeeper") {
            overallStats.saves = undefined;
        }
        // Do the same for seasonal stats
        for (const season in statsBySeason) {
            if (statsBySeason[season].saves === 0 && player.position !== "Goalkeeper") {
                statsBySeason[season].saves = undefined;
            }
        }
        
        const availableSeasons = Object.keys(statsBySeason);
        // Use a dummy Match array with unique seasons to leverage getPastSeasonKeysForSelector's sorting.
        const dummyMatchesForSorting: Match[] = availableSeasons.map(sKey => ({ season: sKey } as Match));
        const sortedSeasons = getPastSeasonKeysForSelector(dummyMatchesForSorting);


        return { 
            ...player, 
            ...overallStats,
            statsBySeason: Object.keys(statsBySeason).length > 0 ? statsBySeason : undefined,
            availableSeasonsForStats: sortedSeasons.length > 0 ? sortedSeasons : undefined,
        };
    });
  },
};