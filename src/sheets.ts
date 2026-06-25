/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Match, NewsItem, Season, RosterEntry, GameStatEntry } from './types';

/**
 * Parses RFC 4180 compliant CSV strings into 2D arrays.
 * Handles commas, line breaks, and escaped quotes inside double quotes.
 */
export function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        cell += '"';
        i++; // Skip the second quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      lines.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (row.length > 0 || cell !== '') {
    row.push(cell.trim());
    lines.push(row);
  }
  return lines.filter(r => r.length > 0 && r.some(c => c !== ''));
}

/**
 * Extracts Google Spreadsheet ID from various formats of share links or plain IDs.
 */
export function extractSpreadsheetId(input: string): string {
  const urlPattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = input.match(urlPattern);
  if (match && match[1]) {
    return match[1];
  }
  return input.trim();
}

/**
 * Fetches a specific worksheet from a published Google Sheet as CSV.
 * Supports both numerical GIDs (e.g. '0') and text-based tab names (e.g. 'Roster').
 * Requires the sheet to be "Published to the Web" as CSV or shared as "Anyone with link can view".
 */
export async function fetchSheetCSV(spreadsheetId: string, gidOrName: string = '0'): Promise<string[][]> {
  const isNumericGid = /^\d+$/.test(gidOrName.trim());
  const url = isNumericGid
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gidOrName.trim()}`
    : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(gidOrName.trim())}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet "${gidOrName}" (HTTP ${response.status}). Make sure the spreadsheet is shared with "Anyone with link can view" and the tab name is spelled correctly.`);
  }
  const text = await response.text();
  return parseCSV(text);
}

/**
 * Helper to match headers case-insensitively, ignoring non-alphanumeric characters.
 */
function findHeaderIdx(headers: string[], name: string): number {
  const normTarget = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // 1. Try exact normalized match first (safest and most precise)
  const exactIdx = headers.findIndex(h => {
    const normHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normHeader === normTarget;
  });
  if (exactIdx !== -1) return exactIdx;

  // 2. Fallback to descriptive headers that contain the target
  return headers.findIndex(h => {
    const normHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normHeader.includes(normTarget);
  });
}

/**
 * Parses News CSV
 */
export function parseNewsCSV(rows: string[][]): NewsItem[] {
  if (rows.length < 2) return [];
  const headers = rows[0];
  const idIdx = findHeaderIdx(headers, 'id');
  const dateIdx = findHeaderIdx(headers, 'date');
  const titleIdx = findHeaderIdx(headers, 'title');
  const categoryIdx = findHeaderIdx(headers, 'category');
  const contentIdx = findHeaderIdx(headers, 'content');
  const linkIdx = findHeaderIdx(headers, 'link');
  const imageIdx = findHeaderIdx(headers, 'imageurl');

  const news: NewsItem[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || !row[titleIdx === -1 ? 2 : titleIdx]) continue;
    news.push({
      id: idIdx !== -1 ? row[idIdx] : `news-${i}`,
      date: dateIdx !== -1 ? row[dateIdx] : '',
      title: titleIdx !== -1 ? row[titleIdx] : '',
      category: categoryIdx !== -1 ? row[categoryIdx] : 'General',
      content: contentIdx !== -1 ? row[contentIdx] : '',
      link: linkIdx !== -1 ? row[linkIdx] : undefined,
      imageUrl: imageIdx !== -1 ? row[imageIdx] : undefined,
    });
  }
  return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Parses Seasons CSV
 */
export function parseSeasonsCSV(rows: string[][]): Season[] {
  if (rows.length < 2) return [];
  const headers = rows[0];
  const idIdx = findHeaderIdx(headers, 'id');
  const nameIdx = findHeaderIdx(headers, 'name');
  const startIdx = findHeaderIdx(headers, 'startdate');
  const endIdx = findHeaderIdx(headers, 'enddate');
  const divIdx = findHeaderIdx(headers, 'division');
  const rostIdx = findHeaderIdx(headers, 'playersrostered');
  const pFeeIdx = findHeaderIdx(headers, 'perplayerfee');
  const tFeeIdx = findHeaderIdx(headers, 'teamfee');
  const paidIdx = findHeaderIdx(headers, 'amountpaid');
  const overIdx = findHeaderIdx(headers, 'overview');

  const seasons: Season[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || !row[nameIdx === -1 ? 1 : nameIdx]) continue;
    seasons.push({
      id: idIdx !== -1 ? row[idIdx] : `season-${i}`,
      name: nameIdx !== -1 ? row[nameIdx] : '',
      startDate: startIdx !== -1 ? row[startIdx] : '',
      endDate: endIdx !== -1 ? row[endIdx] : '',
      division: divIdx !== -1 ? row[divIdx] : '',
      playersRostered: rostIdx !== -1 ? parseInt(row[rostIdx], 10) || 0 : 0,
      perPlayerFee: pFeeIdx !== -1 ? parseFloat(row[pFeeIdx]) || 0 : 0,
      teamFee: tFeeIdx !== -1 ? parseFloat(row[tFeeIdx]) || 0 : 0,
      amountPaid: paidIdx !== -1 ? parseFloat(row[paidIdx]) || 0 : 0,
      overview: overIdx !== -1 ? row[overIdx] : '',
    });
  }
  return seasons;
}

/**
 * Parses Rosters CSV
 */
export function parseRostersCSV(rows: string[][]): RosterEntry[] {
  if (rows.length < 2) return [];
  const headers = rows[0];
  const rIdIdx = findHeaderIdx(headers, 'rosterid');
  const sIdIdx = findHeaderIdx(headers, 'seasonid');
  const sNameIdx = findHeaderIdx(headers, 'formulaseasonname');
  const pIdIdx = findHeaderIdx(headers, 'playerid');
  const flIdx = findHeaderIdx(headers, 'formulafirstlast');
  const numIdx = findHeaderIdx(headers, 'number');
  const posIdx = findHeaderIdx(headers, 'position');
  const capIdx = findHeaderIdx(headers, 'captain');
  const feeIdx = findHeaderIdx(headers, 'paidseasonfee');
  const notesIdx = findHeaderIdx(headers, 'notes');

  const entries: RosterEntry[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || !row[pIdIdx === -1 ? 3 : pIdIdx]) continue;
    entries.push({
      rosterId: rIdIdx !== -1 ? row[rIdIdx] : `r-${i}`,
      seasonId: sIdIdx !== -1 ? row[sIdIdx] : '',
      formulaSeasonName: sNameIdx !== -1 ? row[sNameIdx] : '',
      playerId: pIdIdx !== -1 ? row[pIdIdx] : '',
      formulaFirstLast: flIdx !== -1 ? row[flIdx] : '',
      number: numIdx !== -1 ? parseInt(row[numIdx], 10) || 0 : 0,
      positions: posIdx !== -1 ? row[posIdx] : 'Player',
      captain: capIdx !== -1 ? row[capIdx].toLowerCase() === 'true' || row[capIdx] === '1' || row[capIdx].toLowerCase() === 'yes' : false,
      paidSeasonFee: feeIdx !== -1 ? row[feeIdx] : '',
      notes: notesIdx !== -1 ? row[notesIdx] : '',
    });
  }
  return entries;
}

/**
 * Parses GameStats CSV
 */
export function parseGameStatsCSV(rows: string[][]): GameStatEntry[] {
  if (rows.length < 2) return [];
  const headers = rows[0];
  const gIdIdx = findHeaderIdx(headers, 'gameid');
  const titleIdx = findHeaderIdx(headers, 'formulagametitle');
  const pIdIdx = findHeaderIdx(headers, 'playerid');
  const nameIdx = findHeaderIdx(headers, 'forumlafirstlast') !== -1 ? findHeaderIdx(headers, 'forumlafirstlast') : findHeaderIdx(headers, 'formulafirstlast');
  const gIdx = findHeaderIdx(headers, 'goals');
  const aIdx = findHeaderIdx(headers, 'assists');
  const ptsIdx = findHeaderIdx(headers, 'points');
  const shIdx = findHeaderIdx(headers, 'shots');
  const sotIdx = findHeaderIdx(headers, 'sot');
  const sotPIdx = findHeaderIdx(headers, 'sot%');
  const blkIdx = findHeaderIdx(headers, 'blocks');
  const pmIdx = findHeaderIdx(headers, 'plusminus');
  const fIdx = findHeaderIdx(headers, 'fouls');
  const yIdx = findHeaderIdx(headers, 'yellows');
  const rIdx = findHeaderIdx(headers, 'reds');
  const potmIdx = findHeaderIdx(headers, 'potm');
  const sIdx = findHeaderIdx(headers, 'saves');
  const sPIdx = findHeaderIdx(headers, 'savepercentage');
  const sRIdx = findHeaderIdx(headers, 'saveratio');
  const gaIdx = findHeaderIdx(headers, 'goalsallowed');
  const csIdx = findHeaderIdx(headers, 'cleansheet');

  const stats: GameStatEntry[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || !row[pIdIdx === -1 ? 2 : pIdIdx]) continue;
    stats.push({
      gameId: gIdIdx !== -1 ? row[gIdIdx] : '',
      formulaGameTitle: titleIdx !== -1 ? row[titleIdx] : '',
      playerId: pIdIdx !== -1 ? row[pIdIdx] : '',
      formulaFirstLast: nameIdx !== -1 ? row[nameIdx] : '',
      goals: gIdx !== -1 ? parseInt(row[gIdx], 10) || 0 : 0,
      assists: aIdx !== -1 ? parseInt(row[aIdx], 10) || 0 : 0,
      points: ptsIdx !== -1 ? parseInt(row[ptsIdx], 10) || 0 : 0,
      shots: shIdx !== -1 ? parseInt(row[shIdx], 10) || 0 : 0,
      sot: sotIdx !== -1 ? parseInt(row[sotIdx], 10) || 0 : 0,
      sotPercentage: sotPIdx !== -1 ? parseFloat(row[sotPIdx].replace('%', '')) || 0 : 0,
      blocks: blkIdx !== -1 ? parseInt(row[blkIdx], 10) || 0 : 0,
      plusMinus: pmIdx !== -1 ? parseInt(row[pmIdx], 10) || 0 : 0,
      fouls: fIdx !== -1 ? parseInt(row[fIdx], 10) || 0 : 0,
      yellows: yIdx !== -1 ? parseInt(row[yIdx], 10) || 0 : 0,
      reds: rIdx !== -1 ? parseInt(row[rIdx], 10) || 0 : 0,
      potm: potmIdx !== -1 ? row[potmIdx].toLowerCase() === 'true' || row[potmIdx] === '1' || row[potmIdx].toLowerCase() === 'yes' || row[potmIdx].toLowerCase() === 'potm' : false,
      saves: sIdx !== -1 ? parseInt(row[sIdx], 10) || 0 : 0,
      savePercentage: sPIdx !== -1 ? parseFloat(row[sPIdx].replace('%', '')) || 0 : 0,
      saveRatio: sRIdx !== -1 ? row[sRIdx] : '',
      goalsAllowed: gaIdx !== -1 ? parseInt(row[gaIdx], 10) || 0 : 0,
      cleanSheet: csIdx !== -1 ? row[csIdx].toLowerCase() === 'true' || row[csIdx] === '1' || row[csIdx].toLowerCase() === 'yes' : false,
    });
  }
  return stats;
}

/**
 * Parses Players CSV (rich FIFA style columns)
 */
export function parsePlayersCSV(rows: string[][]): Player[] {
  if (rows.length < 2) return [];
  const headers = rows[0];

  const getIdx = (colName: string) => findHeaderIdx(headers, colName);

  const idIdx = getIdx('id');
  const fNameIdx = getIdx('firstname');
  const lNameIdx = getIdx('lastname');
  const dobIdx = getIdx('dob');
  const heightIdx = getIdx('height');
  const birthplaceIdx = getIdx('birthplace');
  const nationalityIdx = getIdx('nationality');
  const imgIdx = getIdx('playerimageurl');
  const posIdx = getIdx('position');
  const footIdx = getIdx('footedness');
  const bioIdx = getIdx('bio');
  const notesIdx = getIdx('notes');

  // FC stats
  const statFields = [
    'pace', 'acceleration', 'sprintspeed', 'shooting', 'finishing', 'shotpower',
    'longshots', 'curve', 'volleys', 'penalties', 'passing', 'vision', 'crossing',
    'freekickaccuracy', 'shortpass', 'longpass', 'dribbling', 'agility', 'balance',
    'reactions', 'composure', 'ballcontrol', 'weakfoot', 'skillmoves', 'defending',
    'interceptions', 'heading', 'marking', 'tackling', 'physical', 'jumping',
    'stamina', 'strength', 'aggression', 'goalkeeping', 'positioning', 'diving',
    'reflexes', 'handling', 'kicking', 'distribution'
  ];

  const statIndices: Record<string, number> = {};
  statFields.forEach(field => {
    statIndices[field] = getIdx(field);
  });

  const players: Player[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || !row[fNameIdx === -1 ? 1 : fNameIdx]) continue;

    const firstName = row[fNameIdx] || '';
    const lastName = row[lNameIdx] || '';
    const id = idIdx !== -1 && row[idIdx] ? row[idIdx] : `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const player: Player = {
      id,
      firstName,
      lastName,
      position: posIdx !== -1 ? row[posIdx] : 'Player',
      status: 'active',
      notes: notesIdx !== -1 ? row[notesIdx] : '',
      avatarUrl: imgIdx !== -1 && row[imgIdx] ? row[imgIdx] : undefined,
      ratings: {},
      totalRating: 0,

      dob: dobIdx !== -1 ? row[dobIdx] : '',
      height: heightIdx !== -1 ? row[heightIdx] : '',
      birthplace: birthplaceIdx !== -1 ? row[birthplaceIdx] : '',
      nationality: nationalityIdx !== -1 ? row[nationalityIdx] : '',
      playerImageUrl: imgIdx !== -1 ? row[imgIdx] : '',
      footedness: footIdx !== -1 ? row[footIdx] : 'Right',
      bio: bioIdx !== -1 ? row[bioIdx] : '',
    };

    // Parse stat values (0-99)
    statFields.forEach(field => {
      const idx = statIndices[field];
      if (idx !== -1 && row[idx]) {
        (player as any)[field] = parseInt(row[idx], 10) || 0;
      } else {
        (player as any)[field] = 50; // default medium stat if empty
      }
    });

    players.push(player);
  }
  return players;
}

/**
 * Parses Games CSV
 */
export function parseGamesCSV(rows: string[][]): Match[] {
  if (rows.length < 2) return [];
  const headers = rows[0];

  const getIdx = (name: string) => findHeaderIdx(headers, name);

  const idIdx = getIdx('id');
  const sIdIdx = getIdx('seasonid');
  const typeIdx = getIdx('gametype');
  const dateIdx = getIdx('date');
  const timeIdx = getIdx('time');
  const venueIdx = getIdx('venue');
  const haIdx = getIdx('homeaway');
  const oppIdx = getIdx('opponent');
  const colIdx = getIdx('opponentcolor');
  const wdlIdx = getIdx('wdl');
  const forfeitIdx = getIdx('forfeit');
  const goalsIdx = getIdx('goals');
  const pksIdx = getIdx('pks');
  const shotsIdx = getIdx('shots');
  const sotIdx = getIdx('sot');
  const blocksIdx = getIdx('blocks');
  const cornersIdx = getIdx('corners');
  const foulsIdx = getIdx('fouls');
  const yellowsIdx = getIdx('yellows');
  const redsIdx = getIdx('reds');
  const savesIdx = getIdx('saves');
  const gaIdx = getIdx('goalsagainst');
  const oppPksIdx = getIdx('opponentpks');
  const oppShotsIdx = getIdx('opponentshots');
  const oppSotIdx = getIdx('opponentsot');
  const oppBlocksIdx = getIdx('opponentblocks');
  const oppCornersIdx = getIdx('opponentcorners');
  const oppFoulsIdx = getIdx('opponentfouls');
  const oppYellowsIdx = getIdx('opponentyellows');
  const oppRedsIdx = getIdx('opponentreds');
  const oppSavesIdx = getIdx('opponentsaves');
  const motmIdx = getIdx('playerofthematch') !== -1 ? getIdx('playerofthematch') : getIdx('manofthematch');
  const ytIdx = getIdx('youtubelink');
  const notesIdx = getIdx('notes');

  const matches: Match[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;

    const gameId = idIdx !== -1 && idIdx < row.length ? row[idIdx] : `g-${i}`;
    const opponent = oppIdx !== -1 && oppIdx < row.length ? row[oppIdx] : '';
    if (!opponent) continue; // skip rows with empty opponent

    const dateVal = dateIdx !== -1 && dateIdx < row.length ? row[dateIdx] : '';
    const wdlVal = wdlIdx !== -1 && wdlIdx < row.length ? row[wdlIdx] : '';
    
    // Status can be determined if a WDL or Goals exists, or date is in the past
    let status: 'played' | 'upcoming' = 'upcoming';
    const hasGoalsVal = goalsIdx !== -1 && goalsIdx < row.length && row[goalsIdx] !== '';
    if (wdlVal || hasGoalsVal) {
      status = 'played';
    } else if (dateVal) {
      const matchDate = new Date(dateVal);
      const today = new Date();
      if (matchDate < today) {
        status = 'played';
      }
    }

    // Safe parser for integers
    const getSafeInt = (idx: number): number => {
      if (idx === -1 || idx >= row.length) return 0;
      const val = row[idx];
      if (!val || val.trim() === '') return 0;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    const tFcGoals = getSafeInt(goalsIdx);
    const oppGoals = getSafeInt(gaIdx);

    const match: Match = {
      id: gameId,
      matchNumber: i, // sequential ordering for simplicity
      date: dateVal,
      opponent,
      location: venueIdx !== -1 && venueIdx < row.length ? row[venueIdx] : 'TBD',
      status,
      score: status === 'played' ? { toastyFc: tFcGoals, opponent: oppGoals } : undefined,
      cleanSheet: status === 'played' ? oppGoals === 0 : false,
      notes: notesIdx !== -1 && notesIdx < row.length ? row[notesIdx] : '',
      
      seasonId: sIdIdx !== -1 && sIdIdx < row.length ? row[sIdIdx] : '',
      gameType: typeIdx !== -1 && typeIdx < row.length ? row[typeIdx] : '',
      time: timeIdx !== -1 && timeIdx < row.length ? row[timeIdx] : '',
      homeAway: haIdx !== -1 && haIdx < row.length ? row[haIdx] : '',
      opponentColor: colIdx !== -1 && colIdx < row.length ? row[colIdx] : '',
      wdl: wdlVal,
      forfeit: forfeitIdx !== -1 && forfeitIdx < row.length ? row[forfeitIdx].toLowerCase() === 'true' || row[forfeitIdx] === '1' : false,
      pks: getSafeInt(pksIdx),
      shots: getSafeInt(shotsIdx),
      sot: getSafeInt(sotIdx),
      blocks: getSafeInt(blocksIdx),
      corners: getSafeInt(cornersIdx),
      fouls: getSafeInt(foulsIdx),
      yellows: getSafeInt(yellowsIdx),
      reds: getSafeInt(redsIdx),
      saves: getSafeInt(savesIdx),
      opponentPks: getSafeInt(oppPksIdx),
      opponentShots: getSafeInt(oppShotsIdx),
      opponentSoT: getSafeInt(oppSotIdx),
      opponentBlocks: getSafeInt(oppBlocksIdx),
      opponentCorners: getSafeInt(oppCornersIdx),
      opponentFouls: getSafeInt(oppFoulsIdx),
      opponentYellows: getSafeInt(oppYellowsIdx),
      opponentReds: getSafeInt(oppRedsIdx),
      opponentSaves: getSafeInt(oppSavesIdx),
      manOfTheMatch: motmIdx !== -1 && motmIdx < row.length ? row[motmIdx] : '',
      playerOfTheMatch: motmIdx !== -1 && motmIdx < row.length ? row[motmIdx] : '',
      youtubeLink: ytIdx !== -1 && ytIdx < row.length ? row[ytIdx] : '',
    };

    matches.push(match);
  }

  // Sort matches chronologically by date
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((m, idx) => {
    m.matchNumber = idx + 1; // set sequential friendly numbers
    return m;
  });
}

/**
 * Compiler to compile parsed tables (relational model) into Player[] and Match[]
 */
export function compileSyncedData(
  parsedPlayers: Player[],
  parsedRosters: RosterEntry[],
  parsedGames: Match[],
  parsedGameStats: GameStatEntry[]
): { players: Player[]; matches: Match[] } {
  // 1. Compile Match lists
  // Map GameStats details (scorers, assists) into each Match
  const compiledMatches = parsedGames.map(game => {
    // Find all game stats for this game
    const gameStats = parsedGameStats.filter(stat => stat.gameId === game.id);
    
    const scorers: string[] = [];
    const assists: string[] = [];
    
    gameStats.forEach(stat => {
      for (let g = 0; g < stat.goals; g++) {
        scorers.push(stat.formulaFirstLast || 'Toasty Player');
      }
      for (let a = 0; a < stat.assists; a++) {
        assists.push(stat.formulaFirstLast);
      }
    });

    return {
      ...game,
      scorers: scorers.length > 0 ? scorers : game.scorers || [],
      assists: assists.length > 0 ? assists : game.assists || []
    };
  });

  // 2. Compile Player list
  const compiledPlayers = parsedPlayers.map(player => {
    // Find active season roster details (e.g. latest season or any season they belong to)
    const rosterEntries = parsedRosters.filter(r => r.playerId === player.id);
    const activeRoster = rosterEntries[rosterEntries.length - 1]; // pick latest entry
    const seasonsList = rosterEntries.map(r => ({
      id: r.seasonId,
      name: r.formulaSeasonName || r.seasonId
    }));

    // Aggregate performance stats from GameStats
    const playerStats = parsedGameStats.filter(stat => stat.playerId === player.id);
    
    let sumGoals = 0;
    let sumAssists = 0;
    let sumPoints = 0;
    let sumShots = 0;
    let sumSot = 0;
    let sumBlocks = 0;
    let sumPlusMinus = 0;
    let sumFouls = 0;
    let sumYellows = 0;
    let sumReds = 0;
    let sumPotm = 0;
    let sumSaves = 0;
    let sumCleanSheets = 0;
    const gamesPlayed = playerStats.length;

    playerStats.forEach(stat => {
      sumGoals += stat.goals;
      sumAssists += stat.assists;
      sumPoints += stat.points;
      sumShots += stat.shots;
      sumSot += stat.sot;
      sumBlocks += stat.blocks;
      sumPlusMinus += stat.plusMinus;
      sumFouls += stat.fouls;
      sumYellows += stat.yellows;
      sumReds += stat.reds;
      if (stat.potm) sumPotm++;
      sumSaves += stat.saves;
      if (stat.cleanSheet) sumCleanSheets++;
    });

    // Compute dynamic rating sparkline matching games played
    // We can map the match number to WDL outcome: +1 for Win, 0 for Draw, -1 for Loss
    // If the player played in the match, record their rating
    const ratings: Record<number, number> = {};
    let totalRating = 0;

    playerStats.forEach(stat => {
      // Find associated match
      const matchObj = compiledMatches.find(m => m.id === stat.gameId);
      if (matchObj) {
        // Determine outcome rating
        let outcomeRating = 0;
        if (matchObj.score) {
          const diff = matchObj.score.toastyFc - matchObj.score.opponent;
          if (diff > 0) outcomeRating = 1; // Win
          else if (diff < 0) outcomeRating = -1; // Loss
        }
        ratings[matchObj.matchNumber] = outcomeRating;
        totalRating += outcomeRating;
      }
    });

    return {
      ...player,
      number: activeRoster ? activeRoster.number : player.number,
      position: activeRoster && activeRoster.positions ? activeRoster.positions : player.position,
      captain: activeRoster ? activeRoster.captain : false,
      paidSeasonFee: activeRoster ? activeRoster.paidSeasonFee : undefined,
      status: activeRoster 
        ? (activeRoster.positions.toLowerCase().includes('guest') ? 'guest' as const : 'active' as const)
        : player.status,
      
      // aggregated stats
      goals: sumGoals,
      assists: sumAssists,
      points: sumPoints,
      shots: sumShots,
      sot: sumSot,
      blocks: sumBlocks,
      plusMinus: sumPlusMinus,
      fouls: sumFouls,
      yellows: sumYellows,
      reds: sumReds,
      potmCount: sumPotm,
      savesCount: sumSaves,
      gamesPlayedCount: gamesPlayed,
      cleanSheetsCount: sumCleanSheets,

      ratings,
      totalRating: totalRating || sumPlusMinus, // fallback to aggregate plus/minus if ratings sum is 0
      seasons: seasonsList
    };
  });

  return {
    players: compiledPlayers,
    matches: compiledMatches
  };
}
