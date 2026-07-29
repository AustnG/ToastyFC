import { Player, Match, NewsItem, GalleryItem, RosterEntry, MatchStats } from '../types';
import { mockPlayers, mockMatches, mockNews, mockGallery, mockRoster, mockMatchStats } from '../mockData';

// Helper to convert an object into nested structures (e.g., stats_goals_toasty -> stats.goals.toasty)
const setNestedKey = (obj: any, path: string, value: any) => {
  const keys = path.split('_');
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      // Cast values correctly
      if (value === 'true' || value === true) current[key] = true;
      else if (value === 'false' || value === false) current[key] = false;
      else if (!isNaN(Number(value)) && value !== '' && value !== null) current[key] = Number(value);
      else current[key] = value;
    } else {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  }
};

// Helper to flatten nested object keys into a single depth (e.g., stats: { goals: { toasty: 3 } } -> stats_goals_toasty)
const flattenObject = (obj: any, prefix = ''): { [key: string]: any } => {
  return Object.keys(obj).reduce((acc: any, k) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (Array.isArray(obj[k])) {
      // Keep arrays as strings (e.g. comma separated or JSON)
      acc[pre + k] = JSON.stringify(obj[k]);
    } else if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

// Helper to parse standard CSV text (correctly handling quotes, commas, and line breaks)
const parseCSV = (csvText: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue);
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(currentValue);
      result.push(row);
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  if (currentValue !== '' || row.length > 0) {
    row.push(currentValue);
    result.push(row);
  }
  return result;
};

// Convert spreadsheet rows back into objects safely (filtering out empty rows and duplicates)
const rowsToObjects = (rows: any[]): any[] => {
  if (!rows || rows.length <= 1) return [];
  const headers = rows[0];
  const objects: any[] = [];
  const seenIds = new Set<string>();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    // Retrieve and check ID column
    const idIdx = headers.indexOf('id');
    let idVal = idIdx !== -1 ? row[idIdx] : undefined;

    // If there is no 'id' column but there are 'matchId' and 'playerId' columns, use a composite ID
    if (idIdx === -1) {
      const mIdIdx = headers.indexOf('matchId');
      const pIdIdx = headers.indexOf('playerId');
      if (mIdIdx !== -1 && pIdIdx !== -1) {
        idVal = `${row[mIdIdx]}_${row[pIdIdx]}`;
      }
    }

    if (idVal === undefined || idVal === null || String(idVal).trim() === '') {
      continue; // Skip empty rows or rows without an ID
    }

    const idStr = String(idVal).trim();
    if (seenIds.has(idStr)) {
      continue; // Skip duplicate IDs to avoid React duplicate key warnings
    }
    seenIds.add(idStr);

    const obj: any = {};
    if (idIdx === -1) {
      obj.id = idStr;
    }
    
    // Default present to true if not on sheet but it's a match-stats row
    if (!headers.includes('present') && headers.includes('matchId') && headers.includes('playerId')) {
      obj.present = true;
    }

    for (let h = 0; h < headers.length; h++) {
      const header = headers[h];
      const val = row[h] !== undefined ? row[h] : '';
      
      // Handle comma-separated arrays or JSON strings for specific fields
      if (header === 'seasons' || header === 'goalsScoredBy' || header === 'assistsBy') {
        try {
          if (typeof val === 'string' && val.startsWith('[')) {
            obj[header] = JSON.parse(val);
          } else {
            obj[header] = val ? String(val).split(',').map((s: string) => s.trim()) : [];
          }
        } catch {
          obj[header] = val ? String(val).split(',').map((s: string) => s.trim()) : [];
        }
      } else {
        setNestedKey(obj, header, val);
      }
    }

    // Normalize field aliases for YouTube URL column variations in Google Sheets (e.g. YouTubeurl, YouTubeUrl, youtube_url, YouTube URL)
    const ytVal = obj.youtubeUrl || obj.YouTubeurl || obj.YouTubeUrl || obj.youtube_url || obj['YouTube URL'] || obj['YouTube'] || obj['youtube'];
    if (ytVal && String(ytVal).trim() !== '' && String(ytVal).toLowerCase() !== 'null' && String(ytVal).toLowerCase() !== 'undefined' && String(ytVal).toLowerCase() !== 'none') {
      obj.youtubeUrl = String(ytVal).trim();
    }

    objects.push(obj);
  }
  return objects;
};

// Convert objects into spreadsheet rows based on specified headers
const objectsToRows = (objects: any[], headers: string[]): any[][] => {
  const rows: any[][] = [headers];
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    const flat = flattenObject(obj);
    const row = headers.map(header => {
      if (header === 'gameName') {
        if (i === 0) {
          return '=ARRAYFORMULA(IF(A2:A<>"", "[" & YEAR(VLOOKUP(A2:A, Matches!A:E, 3, FALSE)) & "] " & VLOOKUP(A2:A, Matches!A:E, 2, FALSE) & ": " & VLOOKUP(A2:A, Matches!A:E, 5, FALSE), ""))';
        } else {
          return '';
        }
      }
      if (header === 'playerName') {
        if (i === 0) {
          const idCol = headers.includes('gameName') ? 'C2:C' : 'B2:B';
          return `=ARRAYFORMULA(IF(${idCol}<>"", VLOOKUP(${idCol}, Players!A:B, 2, FALSE), ""))`;
        } else {
          return '';
        }
      }
      const val = flat[header];
      if (val === undefined || val === null) return '';
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
    rows.push(row);
  }
  return rows;
};

// Database headers definition
const HEADERS_PLAYERS = [
  'id', 'name', 'bio', 'dateOfBirth', 'height', 'birthplace',
  'nationality', 'skills_pace', 'skills_shooting', 'skills_passing',
  'skills_dribbling', 'skills_defending', 'skills_physical'
];

const HEADERS_MATCHES = [
  'id', 'season', 'date', 'time', 'opponent', 'opponentColor', 'type', 'status', 'location', 'toastyScore',
  'opponentScore', 'summary', 'goalsScoredBy', 'assistsBy', 'goalScorersDetails', 'opponentGoalScorersDetails',
  'playerOfTheMatch', 'youtubeUrl', 
  'stats_goals_toasty', 'stats_shots_toasty', 'stats_shotsOnTarget_toasty', 'stats_blocks_toasty', 'stats_fouls_toasty', 'stats_yellowCards_toasty', 'stats_redCards_toasty', 'stats_saves_toasty', 'stats_corners_toasty',
  'stats_goals_opponent', 'stats_shots_opponent', 'stats_shotsOnTarget_opponent', 'stats_blocks_opponent', 'stats_fouls_opponent', 'stats_yellowCards_opponent', 'stats_redCards_opponent', 'stats_saves_opponent', 'stats_corners_opponent'
];

const HEADERS_NEWS = ['id', 'date', 'title', 'summary', 'content', 'imageUrl', 'author'];

const HEADERS_GALLERY = ['id', 'date', 'eventName', 'imageUrl', 'caption'];

const HEADERS_ROSTER = ['id', 'playerId', 'playerName', 'season', 'number', 'imageUrl', 'position', 'isCaptain'];

const HEADERS_MATCH_STATS = [
  'matchId', 'gameName', 'playerId', 'playerName', 'goals', 'assists', 'shots', 'shotsOnTarget', 'blocks', 'plusMinus', 'fouls', 'yellows', 'reds', 'potm', 'saves', 'goalsAllowed', 'cleanSheet'
];

export const sheetsService = {
  // Find or create database in user's Google Drive
  findOrCreateDatabase: async (token: string): Promise<{ id: string; isNew: boolean }> => {
    try {
      // 1. Search for existing file
      const q = encodeURIComponent("name = 'Toasty FC Database' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();

      if (searchData.files && searchData.files.length > 0) {
        const spreadsheetId = searchData.files[0].id;
        try {
          await sheetsService.ensureSheetStructure(spreadsheetId, token);
        } catch (migErr) {
          console.error('Failed to run spreadsheet automatic migration:', migErr);
        }
        return { id: spreadsheetId, isNew: false };
      }

      // 2. Not found, create it with Google Sheets API directly
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: 'Toasty FC Database'
          },
          sheets: [
            { properties: { title: 'Players' } },
            { properties: { title: 'Roster' } },
            { properties: { title: 'Matches' } },
            { properties: { title: 'MatchStats' } },
            { properties: { title: 'News' } },
            { properties: { title: 'Gallery' } }
          ]
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        console.error('Failed to create spreadsheet. Status:', createRes.status, 'Response:', errText);
        throw new Error(`Failed to create Toasty FC Database spreadsheet: ${createRes.status} ${errText}`);
      }

      const createData = await createRes.json();
      const spreadsheetId = createData.spreadsheetId;

      // 3. Seed it with mock data
      await sheetsService.seedDatabase(spreadsheetId, token);

      return { id: spreadsheetId, isNew: true };
    } catch (err) {
      console.error('Error in findOrCreateDatabase:', err);
      throw err;
    }
  },

  // Seed the newly created spreadsheet with mock data
  seedDatabase: async (spreadsheetId: string, token: string): Promise<void> => {
    const playersRows = objectsToRows(mockPlayers, HEADERS_PLAYERS);
    const matchesRows = objectsToRows(mockMatches, HEADERS_MATCHES);
    const newsRows = objectsToRows(mockNews, HEADERS_NEWS);
    const galleryRows = objectsToRows(mockGallery, HEADERS_GALLERY);
    const rosterRows = objectsToRows(mockRoster, HEADERS_ROSTER);
    const matchStatsRows = objectsToRows(mockMatchStats, HEADERS_MATCH_STATS);

    const data = [
      { range: 'Players!A1', values: playersRows },
      { range: 'Matches!A1', values: matchesRows },
      { range: 'News!A1', values: newsRows },
      { range: 'Gallery!A1', values: galleryRows },
      { range: 'Roster!A1', values: rosterRows },
      { range: 'MatchStats!A1', values: matchStatsRows }
    ];

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: data
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to seed Toasty FC Database spreadsheet: ${res.status}`);
    }
  },

  // Fetch all data from the database in a single batch request
  fetchDatabaseData: async (spreadsheetId: string, token: string): Promise<{
    players: Player[];
    matches: Match[];
    news: NewsItem[];
    gallery: GalleryItem[];
    roster: RosterEntry[];
    playerMatchStats: MatchStats[];
  }> => {
    const ranges = ['Players!A1:Z100', 'Matches!A1:AK150', 'News!A1:G100', 'Gallery!A1:E100', 'Roster!A1:G200', 'MatchStats!A1:Q300'];
    const query = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch spreadsheet data: ${res.status}`);
    }

    const data = await res.json();
    const valueRanges = data.valueRanges || [];

    const players = rowsToObjects(valueRanges[0]?.values || []);
    const matches = rowsToObjects(valueRanges[1]?.values || []);
    const news = rowsToObjects(valueRanges[2]?.values || []);
    const gallery = rowsToObjects(valueRanges[3]?.values || []);
    const roster = rowsToObjects(valueRanges[4]?.values || []);
    const playerMatchStats = rowsToObjects(valueRanges[5]?.values || []);

    return { players, matches, news, gallery, roster, playerMatchStats };
  },

  // Fetch all data from the database using public read-only CSV exports (no token required)
  fetchPublicDatabaseData: async (spreadsheetId: string): Promise<{
    players: Player[];
    matches: Match[];
    news: NewsItem[];
    gallery: GalleryItem[];
    roster: RosterEntry[];
    playerMatchStats: MatchStats[];
  }> => {
    const sheets = ['Players', 'Matches', 'News', 'Gallery', 'Roster', 'MatchStats'];
    const results: any = {};

    for (const sheetName of sheets) {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (sheetName === 'Roster' || sheetName === 'PlayerMatchStats') {
          results[sheetName.toLowerCase()] = [];
          continue;
        }
        throw new Error(`Failed to fetch public sheet: ${sheetName}`);
      }
      const csvText = await res.text();
      const rows = parseCSV(csvText);
      results[sheetName.toLowerCase()] = rowsToObjects(rows);
    }

    return {
      players: results.players || [],
      matches: results.matches || [],
      news: results.news || [],
      gallery: results.gallery || [],
      roster: results.roster || [],
      playerMatchStats: results.matchstats || results.playermatchstats || []
    };
  },

  // Save single dataset back to Google Sheet (for full overwrite/sync)
  saveDatabaseData: async (
    spreadsheetId: string,
    token: string,
    type: 'players' | 'matches' | 'news' | 'gallery' | 'roster' | 'playerMatchStats',
    items: any[]
  ): Promise<void> => {
    let range = '';
    let rows: any[][] = [];

    if (type === 'players') {
      range = 'Players!A1:Z100';
      rows = objectsToRows(items, HEADERS_PLAYERS);
    } else if (type === 'matches') {
      range = 'Matches!A1:AK150';
      rows = objectsToRows(items, HEADERS_MATCHES);
    } else if (type === 'news') {
      range = 'News!A1:G100';
      rows = objectsToRows(items, HEADERS_NEWS);
    } else if (type === 'gallery') {
      range = 'Gallery!A1:E100';
      rows = objectsToRows(items, HEADERS_GALLERY);
    } else if (type === 'roster') {
      range = 'Roster!A1:G200';
      rows = objectsToRows(items, HEADERS_ROSTER);
    } else if (type === 'playerMatchStats') {
      range = 'MatchStats!A1:Q300';
      rows = objectsToRows(items, HEADERS_MATCH_STATS);
    }

    // First clear existing data range to avoid residual rows
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    // Write new values
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: range,
        majorDimension: 'ROWS',
        values: rows
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to save ${type} data to Google Sheet`);
    }
  },

  ensureSheetStructure: async (spreadsheetId: string, token: string): Promise<void> => {
    try {
      // 1. Fetch current spreadsheet info to see what sheets exist
      const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!metadataRes.ok) {
        throw new Error('Failed to fetch spreadsheet metadata for verification');
      }
      const metadata = await metadataRes.json();
      const existingSheetTitles: string[] = metadata.sheets?.map((s: any) => s.properties.title) || [];

      // 2. Add 'Roster' sheet if missing
      if (!existingSheetTitles.includes('Roster')) {
        console.log("Migrating database: Adding Roster sheet.");
        const addSheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: { title: 'Roster' }
                }
              }
            ]
          })
        });
        if (addSheetRes.ok) {
          // Seed Roster sheet
          const rosterRows = objectsToRows(mockRoster, HEADERS_ROSTER);
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Roster!A1?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: rosterRows })
          });
        }
      }

      // 3. Migrate/Rearrange 'Matches' columns if they are not in the new order
      // Fetch headers of current Matches sheet
      const headersRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Matches!A1:AZ1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (headersRes.ok) {
        const headersData = await headersRes.json();
        const currentHeaders: string[] = headersData.values?.[0] || [];
        
        // We need migration if 'opponentColor' is missing OR if 'assistsBy' is missing OR if 'stats_assists_toasty' is still in the headers
        const needsMatchesMigration = !currentHeaders.includes('opponentColor') || !currentHeaders.includes('assistsBy') || currentHeaders.includes('stats_assists_toasty');
        
        if (needsMatchesMigration) {
          console.log("Migrating database: Rearranging Matches sheet columns and adding opponentColor.");
          // Fetch all current matches rows
          const matchesRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Matches!A1:AZ150`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (matchesRes.ok) {
            const matchesData = await matchesRes.json();
            const currentRows = matchesData.values || [];
            if (currentRows.length > 0) {
              // Convert existing rows to objects using the *old* headers on the sheet
              const parsedMatches = rowsToObjects(currentRows);
              
              // Map/restructure matches to new HEADERS_MATCHES format
              const newMatchesRows = objectsToRows(parsedMatches, HEADERS_MATCHES);

              // Clear the old Matches sheet completely
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Matches!A1:AZ150:clear`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
              });

              // Write new matches rows with correct column order and removed/added fields
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Matches!A1?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values: newMatchesRows })
              });
            }
          }
        }
      }

      // 3b. Migrate 'Players' sheet if any deprecated columns (like 'number' or 'seasons') are still in the headers
      if (existingSheetTitles.includes('Players')) {
        const playersHeadersRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Players!A1:Z1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (playersHeadersRes.ok) {
          const playersHeadersData = await playersHeadersRes.json();
          const currentPlayersHeaders: string[] = playersHeadersData.values?.[0] || [];
          if (currentPlayersHeaders.includes('number') || currentPlayersHeaders.includes('seasons') || currentPlayersHeaders.includes('goals')) {
            console.log("Migrating database: Removing deprecated columns from Players sheet.");
            const playersRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Players!A1:Z100`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (playersRes.ok) {
              const playersData = await playersRes.json();
              const currentPlayersRows = playersData.values || [];
              if (currentPlayersRows.length > 0) {
                const parsedPlayers = rowsToObjects(currentPlayersRows);
                const newPlayersRows = objectsToRows(parsedPlayers, HEADERS_PLAYERS);

                // Clear the old Players sheet completely
                await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Players!A1:Z100:clear`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` }
                });

                // Write the clean, updated columns back to the Players sheet
                await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Players!A1?valueInputOption=USER_ENTERED`, {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ values: newPlayersRows })
                });
                console.log("Migrating database: Players sheet deprecated columns successfully removed.");
              }
            }
          }
        }
      }

      // 4. Migrate 'Roster' sheet if 'isCaptain' or 'playerName' is missing from headers
      if (existingSheetTitles.includes('Roster')) {
        const rosterHeadersRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Roster!A1:Z1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (rosterHeadersRes.ok) {
          const rosterHeadersData = await rosterHeadersRes.json();
          const currentRosterHeaders: string[] = rosterHeadersData.values?.[0] || [];
          if (currentRosterHeaders.length > 0 && (!currentRosterHeaders.includes('isCaptain') || !currentRosterHeaders.includes('playerName'))) {
            console.log("Migrating database: Adding missing columns to Roster sheet.");
            const rosterRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Roster!A1:H200`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (rosterRes.ok) {
              const rosterData = await rosterRes.json();
              const currentRosterRows = rosterData.values || [];
              if (currentRosterRows.length > 0) {
                const parsedRoster = rowsToObjects(currentRosterRows);
                // For existing roster rows, default isCaptain based on whether player p1 (Austin Greer) is the player (default captain)
                const updatedRoster = parsedRoster.map(r => ({
                  ...r,
                  isCaptain: r.isCaptain !== undefined ? (r.isCaptain === true || String(r.isCaptain).toLowerCase() === 'true') : (r.playerId === 'p1' ? true : false)
                }));
                const newRosterRows = objectsToRows(updatedRoster, HEADERS_ROSTER);

                // Clear the old range completely
                await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Roster!A1:Z200:clear`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` }
                });

                // Write new Roster rows with correct columns
                await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Roster!A1?valueInputOption=USER_ENTERED`, {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ values: newRosterRows })
                });
              }
            }
          }
        }
      }

      // 5. Migrate 'PlayerMatchStats' to 'MatchStats' if missing, or add and seed 'MatchStats' from scratch
      const hasOldStats = existingSheetTitles.includes('PlayerMatchStats');
      const hasNewStats = existingSheetTitles.includes('MatchStats');

      if (hasOldStats && !hasNewStats) {
        console.log("Migrating database: Migrating PlayerMatchStats sheet to new MatchStats sheet.");
        
        // 5a. Create the new 'MatchStats' sheet first
        const createSheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: { title: 'MatchStats' }
                }
              }
            ]
          })
        });

        if (createSheetRes.ok) {
          // 5b. Fetch old data to copy over
          const oldStatsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/PlayerMatchStats!A1:R300`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (oldStatsRes.ok) {
            const oldStatsData = await oldStatsRes.json();
            const oldRows = oldStatsData.values || [];
            if (oldRows.length > 0) {
              const parsedStats = rowsToObjects(oldRows);
              // Filter to keep ONLY records where players were present
              const presentStats = parsedStats.filter(s => s.present === true || s.present === 'true');
              
              // Map/convert to new HEADERS_MATCH_STATS (without 'id' and 'present')
              const newStatsRows = objectsToRows(presentStats, HEADERS_MATCH_STATS);

              // Write mapped rows to MatchStats
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/MatchStats!A1?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values: newStatsRows })
              });
            }
          }

          // 5c. Safely delete the old 'PlayerMatchStats' sheet
          const oldSheet = metadata.sheets?.find((s: any) => s.properties.title === 'PlayerMatchStats');
          const oldSheetId = oldSheet?.properties.sheetId;
          if (oldSheetId !== undefined) {
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                requests: [
                  {
                    deleteSheet: {
                      sheetId: oldSheetId
                    }
                  }
                ]
              })
            });
            console.log("Migrating database: Old PlayerMatchStats sheet successfully deleted.");
          }
        }
      } else if (!hasNewStats) {
        // Create brand new 'MatchStats' sheet and seed it
        console.log("Migrating database: Creating new MatchStats sheet.");
        const addSheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: { title: 'MatchStats' }
                }
              }
            ]
          })
        });
        if (addSheetRes.ok) {
          // Seed MatchStats sheet with mock stats
          const matchStatsRows = objectsToRows(mockMatchStats, HEADERS_MATCH_STATS);
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/MatchStats!A1?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: matchStatsRows })
          });
        }
      }

      // 5d. Migrate existing 'MatchStats' sheet if columns are not in the new/correct order, or seed it if empty
      const finalCheckRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (finalCheckRes.ok) {
        const finalCheckData = await finalCheckRes.json();
        const currentSheetTitles: string[] = finalCheckData.sheets?.map((s: any) => s.properties.title) || [];
        
        if (currentSheetTitles.includes('MatchStats')) {
          const statsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/MatchStats!A1:AZ300`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            const currentStatsRows = statsData.values || [];
            const currentStatsHeaders: string[] = currentStatsRows[0] || [];
            
            // Check if MatchStats headers match HEADERS_MATCH_STATS exactly in order
            const isMatchStatsInCorrectOrder = currentStatsHeaders.length === HEADERS_MATCH_STATS.length && 
              HEADERS_MATCH_STATS.every((h, idx) => currentStatsHeaders[idx] === h);

            const isMatchStatsEmpty = currentStatsRows.length <= 1;

            if (isMatchStatsEmpty) {
              console.log("Migrating database: MatchStats is empty, seeding with 10 rows of mock data.");
              const seedRows = objectsToRows(mockMatchStats.slice(0, 10), HEADERS_MATCH_STATS);
              
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/MatchStats!A1?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values: seedRows })
              });
              console.log("Migrating database: MatchStats sheet seeded with mock data successfully.");
            } else if (!isMatchStatsInCorrectOrder) {
              console.log("Migrating database: Rearranging MatchStats columns to requested order.");
              const parsedStats = rowsToObjects(currentStatsRows);
              const newStatsRows = objectsToRows(parsedStats, HEADERS_MATCH_STATS);

              // Clear old MatchStats sheet completely
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/MatchStats!A1:AZ300:clear`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
              });

              // Write new MatchStats rows with column C included for formula
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/MatchStats!A1?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values: newStatsRows })
              });
              console.log("Migrating database: MatchStats sheet columns rearranged successfully.");
            }
          }
        }
      }

      // 6. Enforce desired sheet order: Players, Roster, Matches, MatchStats, News, Gallery
      const finalMetadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (finalMetadataRes.ok) {
        const finalMetadata = await finalMetadataRes.json();
        const sheetsList = finalMetadata.sheets || [];
        const DESIRED_ORDER = ['Players', 'Roster', 'Matches', 'MatchStats', 'News', 'Gallery'];
        const requests: any[] = [];
        
        sheetsList.forEach((s: any) => {
          const title = s.properties.title;
          const sheetId = s.properties.sheetId;
          const currentIndex = s.properties.index;
          const targetIndex = DESIRED_ORDER.indexOf(title);
          
          if (targetIndex !== -1 && currentIndex !== targetIndex) {
            requests.push({
              updateSheetProperties: {
                properties: {
                  sheetId: sheetId,
                  index: targetIndex
                },
                fields: 'index'
              }
            });
          }
        });
        
        if (requests.length > 0) {
          console.log("Migrating database: Reordering sheets to match desired order.");
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests })
          });
        }
      }
    } catch (err) {
      console.error("Migration error:", err);
    }
  }
};
