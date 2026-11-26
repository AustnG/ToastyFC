#!/usr/bin/env node
/**
 * Syncs Toasty FC Database (Google Sheets) -> public/data/toasty-data.json
 *
 * Authentication modes (checked in order):
 *   1. GOOGLE_SERVICE_ACCOUNT_JSON env var (recommended for GitHub Actions & private sheets)
 *   2. USE_GSHEETS_CLI=1 (uses local `gsheets` CLI if authenticated)
 *   3. Existing committed snapshot fallback (if SKIP_IF_NO_CREDS=1 and snapshot exists)
 *
 * Privacy guarantee:
 *   Uses strict field allowlists. Financial fields (perPlayerFee, teamFee, amountPaid)
 *   and raw dateOfBirth are NEVER written to public/data/toasty-data.json.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SPREADSHEET_ID =
  process.env.TOASTY_SPREADSHEET_ID || '1194eXv6isWkB-UYZejnki6I3J25FguxVMJZS26PgdeM';
const OUTPUT_PATH = path.resolve(ROOT_DIR, 'public/data/toasty-data.json');

const TABS = [
  'Players',
  'Seasons',
  'Roster',
  'Matches',
  'MatchStats',
  'MatchEvents',
  'News',
  'Gallery',
];

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getServiceAccountAccessToken(saJsonRaw) {
  const sa = typeof saJsonRaw === 'string' ? JSON.parse(saJsonRaw) : saJsonRaw;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = base64Url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  );
  const unsigned = `${header}.${claimSet}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer
    .sign(sa.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google OAuth token exchange failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function fetchTabsViaServiceAccount(saJsonRaw) {
  const token = await getServiceAccountAccessToken(saJsonRaw);
  const ranges = TABS.map((t) => `'${t}'!A:AZ`);
  const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${query}&valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Sheets API batchGet failed (${res.status}): ${await res.text()}`);
  }
  const payload = await res.json();
  const byTab = {};
  (payload.valueRanges || []).forEach((vr, idx) => {
    byTab[TABS[idx]] = vr.values || [];
  });
  return byTab;
}

function fetchTabsViaGsheetsCli() {
  const byTab = {};
  for (const tab of TABS) {
    try {
      const out = execFileSync(
        'gsheets',
        ['readonly', 'read', SPREADSHEET_ID, `'${tab}'!A1:AZ2000`, '--json'],
        { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 }
      );
      byTab[tab] = JSON.parse(out);
    } catch (err) {
      if (tab === 'MatchEvents') {
        byTab[tab] = [];
      } else {
        throw err;
      }
    }
  }
  return byTab;
}

function rowsToRecords(rows) {
  if (!Array.isArray(rows) || rows.length <= 1) return [];
  const headers = rows[0].map((h) => String(h || '').trim());
  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row) || !row.some((c) => String(c ?? '').trim() !== '')) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      if (!headers[j]) continue;
      obj[headers[j]] = row[j] !== undefined && row[j] !== null ? String(row[j]).trim() : '';
    }
    records.push(obj);
  }
  return records;
}

function toNumber(val, fallback = 0) {
  if (val === '' || val === null || val === undefined) return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function toOptionalNumber(val) {
  if (val === '' || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(val) {
  return val === true || String(val).trim().toLowerCase() === 'true';
}

function normalizeDate(val) {
  if (!val) return '';
  return String(val).trim().replace(/\//g, '-');
}

function computeAge(dobStr) {
  if (!dobStr) return undefined;
  const normalized = normalizeDate(dobStr);
  const parts = normalized.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return undefined;
  const [y, m, d] = parts;
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    age--;
  }
  return age >= 0 && age < 120 ? age : undefined;
}

function cleanString(val) {
  const s = String(val ?? '').trim();
  if (!s || ['null', 'undefined', 'none'].includes(s.toLowerCase())) return '';
  return s;
}

function buildPublicDataset(rawTabs) {
  const warnings = [];
  const errors = [];

  // 1. Players (strict allowlist: age only, NEVER raw dateOfBirth)
  const rawPlayers = rowsToRecords(rawTabs.Players);
  const players = [];
  const playerIds = new Set();
  for (const r of rawPlayers) {
    const id = cleanString(r.id);
    const name = cleanString(r.name);
    if (!id || !name) continue;
    if (playerIds.has(id)) {
      warnings.push(`Duplicate player id skipped: ${id}`);
      continue;
    }
    playerIds.add(id);
    const bioRaw = cleanString(r.bio);
    const bio = bioRaw.toLowerCase().includes('lorem ipsum') ? '' : bioRaw;
    const age = computeAge(r.dateOfBirth);
    const player = {
      id,
      name,
      bio,
    };
    if (age !== undefined) player.age = age;
    if (cleanString(r.height)) player.height = cleanString(r.height);
    if (cleanString(r.birthplace)) player.birthplace = cleanString(r.birthplace);
    if (cleanString(r.nationality)) player.nationality = cleanString(r.nationality);
    players.push(player);
  }

  // 2. Seasons (strict allowlist: NEVER perPlayerFee, teamFee, amountPaid)
  const rawSeasons = rowsToRecords(rawTabs.Seasons);
  const seasons = [];
  const seasonIds = new Set();
  for (const r of rawSeasons) {
    const id = cleanString(r.id);
    const name = cleanString(r.name);
    if (!id || !name) continue;
    if (seasonIds.has(id)) {
      warnings.push(`Duplicate season id skipped: ${id}`);
      continue;
    }
    seasonIds.add(id);
    const season = { id, name };
    if (normalizeDate(r.startDate)) season.startDate = normalizeDate(r.startDate);
    if (normalizeDate(r.endDate)) season.endDate = normalizeDate(r.endDate);
    if (cleanString(r.division)) season.division = cleanString(r.division);
    const rostered = toOptionalNumber(r.playersRostered);
    if (rostered !== undefined) season.playersRostered = rostered;
    if (cleanString(r.overview)) season.overview = cleanString(r.overview);
    seasons.push(season);
  }

  // 3. Roster (skip incomplete scratch rows like blank id/playerId/seasonId)
  const rawRoster = rowsToRecords(rawTabs.Roster);
  const roster = [];
  const rosterIds = new Set();
  for (const r of rawRoster) {
    const id = cleanString(r.id);
    const seasonId = cleanString(r.seasonId);
    const playerId = cleanString(r.playerId);
    if (!id || !seasonId || !playerId) {
      warnings.push(
        `Skipping incomplete Roster row (position="${cleanString(r.position)}", playerId="${playerId}")`
      );
      continue;
    }
    if (rosterIds.has(id)) continue;
    rosterIds.add(id);
    if (!seasonIds.has(seasonId)) warnings.push(`Roster ${id} references unknown seasonId ${seasonId}`);
    if (!playerIds.has(playerId)) warnings.push(`Roster ${id} references unknown playerId ${playerId}`);

    roster.push({
      id,
      seasonId,
      seasonName: cleanString(r.seasonName),
      season: cleanString(r.seasonName),
      playerId,
      playerName: cleanString(r.playerName),
      number: toNumber(r.number, 0),
      isCaptain: toBool(r.isCaptain),
      position: cleanString(r.position) || 'Midfielder',
      imageUrl: cleanString(r.imageUrl),
    });
  }

  // 4. MatchStats (supports renamed shotsOffTarget + legacy shots; pre-computes totalShots)
  const rawMatchStats = rowsToRecords(rawTabs.MatchStats);
  const playerMatchStats = [];
  const seenStatKeys = new Set();
  const goalsByMatch = new Map();

  for (const r of rawMatchStats) {
    const matchId = cleanString(r.matchId);
    const playerId = cleanString(r.playerId);
    if (!matchId || !playerId) continue;
    const compositeId = `${matchId}_${playerId}`;
    if (seenStatKeys.has(compositeId)) {
      warnings.push(`Duplicate MatchStats row skipped: ${compositeId}`);
      continue;
    }
    seenStatKeys.add(compositeId);

    const shotsOffTarget = toNumber(
      r.shotsOffTarget !== undefined && r.shotsOffTarget !== '' ? r.shotsOffTarget : r.shots,
      0
    );
    const shotsOnTarget = toNumber(r.shotsOnTarget, 0);
    const goals = toNumber(r.goals, 0);
    goalsByMatch.set(matchId, (goalsByMatch.get(matchId) || 0) + goals);

    const entry = {
      id: compositeId,
      matchId,
      gameName: cleanString(r.gameName),
      playerId,
      playerName: cleanString(r.playerName),
      present: true,
      goals,
      assists: toNumber(r.assists, 0),
      shots: shotsOffTarget, // legacy alias (off-target) for backwards compat
      shotsOffTarget,
      shotsOnTarget,
      totalShots: shotsOffTarget + shotsOnTarget,
      blocks: toNumber(r.blocks, 0),
      plusMinus: toNumber(r.plusMinus, 0),
      fouls: toNumber(r.fouls, 0),
      yellows: toNumber(r.yellows, 0),
      reds: toNumber(r.reds, 0),
      potm: toBool(r.potm),
      cleanSheet: toBool(r.cleanSheet),
    };
    const saves = toOptionalNumber(r.saves);
    const goalsAllowed = toOptionalNumber(r.goalsAllowed);
    if (saves !== undefined) entry.saves = saves;
    if (goalsAllowed !== undefined) entry.goalsAllowed = goalsAllowed;

    playerMatchStats.push(entry);
  }

  // 5. Matches
  const rawMatches = rowsToRecords(rawTabs.Matches);
  const matches = [];
  const matchIds = new Set();
  for (const r of rawMatches) {
    const id = cleanString(r.id);
    if (!id) continue;
    if (matchIds.has(id)) {
      warnings.push(`Duplicate match id skipped: ${id}`);
      continue;
    }
    matchIds.add(id);

    const seasonId = cleanString(r.seasonId);
    if (seasonId && !seasonIds.has(seasonId)) {
      warnings.push(`Match ${id} references unknown seasonId ${seasonId}`);
    }

    const toastyScore = toOptionalNumber(r.toastyScore);
    const opponentScore = toOptionalNumber(r.opponentScore);
    const ownGoalsFor = toOptionalNumber(r.ownGoalsFor);

    const offToasty = toOptionalNumber(
      r.stats_shotsOffTarget_toasty !== undefined && r.stats_shotsOffTarget_toasty !== ''
        ? r.stats_shotsOffTarget_toasty
        : r.stats_shots_toasty
    );
    const offOpp = toOptionalNumber(
      r.stats_shotsOffTarget_opponent !== undefined && r.stats_shotsOffTarget_opponent !== ''
        ? r.stats_shotsOffTarget_opponent
        : r.stats_shots_opponent
    );
    const sotToasty = toOptionalNumber(r.stats_shotsOnTarget_toasty);
    const sotOpp = toOptionalNumber(r.stats_shotsOnTarget_opponent);
    const savesToasty = toOptionalNumber(r.stats_saves_toasty);
    const savesOpp = toOptionalNumber(r.stats_saves_opponent);
    const cornersToasty = toOptionalNumber(r.stats_corners_toasty);
    const cornersOpp = toOptionalNumber(r.stats_corners_opponent);
    const blocksToasty = toOptionalNumber(r.stats_blocks_toasty);
    const blocksOpp = toOptionalNumber(r.stats_blocks_opponent);
    const foulsToasty = toOptionalNumber(r.stats_fouls_toasty);
    const foulsOpp = toOptionalNumber(r.stats_fouls_opponent);
    const ycToasty = toOptionalNumber(r.stats_yellowCards_toasty);
    const ycOpp = toOptionalNumber(r.stats_yellowCards_opponent);
    const rcToasty = toOptionalNumber(r.stats_redCards_toasty);
    const rcOpp = toOptionalNumber(r.stats_redCards_opponent);

    const hasDetailedTeamStats = [
      offToasty,
      offOpp,
      sotToasty,
      sotOpp,
      savesToasty,
      savesOpp,
      cornersToasty,
      cornersOpp,
      blocksToasty,
      blocksOpp,
      foulsToasty,
      foulsOpp,
    ].some((v) => v !== undefined);

    let stats;
    if (hasDetailedTeamStats) {
      const sOffT = offToasty ?? 0;
      const sOffO = offOpp ?? 0;
      const sOnT = sotToasty ?? 0;
      const sOnO = sotOpp ?? 0;
      stats = {
        goals: {
          toasty: toNumber(r.stats_goals_toasty, toastyScore ?? 0),
          opponent: toNumber(r.stats_goals_opponent, opponentScore ?? 0),
        },
        shotsOffTarget: { toasty: sOffT, opponent: sOffO },
        shots: { toasty: sOffT, opponent: sOffO }, // off-target alias
        shotsOnTarget: { toasty: sOnT, opponent: sOnO },
        totalShots: { toasty: sOffT + sOnT, opponent: sOffO + sOnO },
        blocks: { toasty: blocksToasty ?? 0, opponent: blocksOpp ?? 0 },
        fouls: { toasty: foulsToasty ?? 0, opponent: foulsOpp ?? 0 },
        yellowCards: { toasty: ycToasty ?? 0, opponent: ycOpp ?? 0 },
        redCards: { toasty: rcToasty ?? 0, opponent: rcOpp ?? 0 },
        saves: { toasty: savesToasty ?? 0, opponent: savesOpp ?? 0 },
        corners: { toasty: cornersToasty ?? 0, opponent: cornersOpp ?? 0 },
      };
    }

    const ytUrl = cleanString(r.youtubeUrl);
    const status = cleanString(r.status) || (toastyScore !== undefined ? 'Completed' : 'Upcoming');
    const statsStatus =
      cleanString(r.statsStatus) ||
      (status !== 'Completed'
        ? 'Scheduled'
        : hasDetailedTeamStats
          ? 'Full Stats'
          : ytUrl
            ? 'Video Only'
            : 'Result Only');

    const match = {
      id,
      seasonId,
      seasonName: cleanString(r.seasonName),
      season: cleanString(r.seasonName),
      date: normalizeDate(r.date),
      time: cleanString(r.time),
      opponent: cleanString(r.opponent),
      type: cleanString(r.type) || 'Season',
      status,
      statsStatus,
      location: cleanString(r.location),
    };
    if (cleanString(r.opponentColor)) match.opponentColor = cleanString(r.opponentColor);
    if (toastyScore !== undefined) match.toastyScore = toastyScore;
    if (opponentScore !== undefined) match.opponentScore = opponentScore;
    if (ownGoalsFor !== undefined) match.ownGoalsFor = ownGoalsFor;
    if (cleanString(r.notes)) match.notes = cleanString(r.notes);
    if (cleanString(r.summary)) match.summary = cleanString(r.summary);
    if (cleanString(r.goalScorersDetails)) match.goalScorersDetails = cleanString(r.goalScorersDetails);
    if (cleanString(r.opponentGoalScorersDetails)) {
      match.opponentGoalScorersDetails = cleanString(r.opponentGoalScorersDetails);
    }
    if (cleanString(r.playerOfTheMatch)) match.playerOfTheMatch = cleanString(r.playerOfTheMatch);
    if (ytUrl) match.youtubeUrl = ytUrl;
    if (stats) match.stats = stats;

    // Soft integrity check on Full Stats matches
    if (statsStatus === 'Full Stats' && toastyScore !== undefined && goalsByMatch.has(id)) {
      const summed = (goalsByMatch.get(id) || 0) + (ownGoalsFor || 0);
      if (summed !== toastyScore) {
        warnings.push(
          `Score check [${id} vs ${match.opponent}]: toastyScore=${toastyScore} vs SUM(MatchStats.goals)+OG=${summed}`
        );
      }
    }

    matches.push(match);
  }

  // Validate MatchStats references
  for (const s of playerMatchStats) {
    if (!matchIds.has(s.matchId)) warnings.push(`MatchStats ${s.id} references unknown matchId ${s.matchId}`);
    if (!playerIds.has(s.playerId)) warnings.push(`MatchStats ${s.id} references unknown playerId ${s.playerId}`);
  }

  // 6. MatchEvents (only publish verified events)
  const rawEvents = rowsToRecords(rawTabs.MatchEvents);
  const matchEvents = [];
  for (const r of rawEvents) {
    const eventId = cleanString(r.eventId);
    const matchId = cleanString(r.matchId);
    if (!eventId || !matchId || !toBool(r.verified)) continue;
    matchEvents.push({
      eventId,
      matchId,
      half: cleanString(r.half),
      videoTime: cleanString(r.videoTime),
      matchMinute: toOptionalNumber(r.matchMinute),
      eventType: cleanString(r.eventType),
      team: cleanString(r.team),
      playerId: cleanString(r.playerId) || undefined,
      assistPlayerId: cleanString(r.assistPlayerId) || undefined,
      onCourtIds: cleanString(r.onCourtIds)
        ? cleanString(r.onCourtIds)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      keepInHighlight: toBool(r.keepInHighlight),
      starForShorts: toBool(r.starForShorts),
      notes: cleanString(r.notes) || undefined,
    });
  }

  // 7. News
  const rawNews = rowsToRecords(rawTabs.News);
  const news = rawNews
    .filter((r) => cleanString(r.id) && cleanString(r.title))
    .map((r) => ({
      id: cleanString(r.id),
      date: normalizeDate(r.date),
      title: cleanString(r.title),
      summary: cleanString(r.summary),
      content: cleanString(r.content),
      imageUrl: cleanString(r.imageUrl),
    }));

  // 8. Gallery
  const rawGallery = rowsToRecords(rawTabs.Gallery);
  const gallery = rawGallery
    .filter((r) => cleanString(r.id) && cleanString(r.imageUrl))
    .map((r) => ({
      id: cleanString(r.id),
      date: normalizeDate(r.date),
      eventName: cleanString(r.eventName),
      imageUrl: cleanString(r.imageUrl),
      caption: cleanString(r.caption),
    }));

  if (players.length === 0 || seasons.length === 0 || matches.length === 0) {
    errors.push(
      `Refusing to overwrite snapshot with empty core table (players=${players.length}, seasons=${seasons.length}, matches=${matches.length})`
    );
  }

  return {
    dataset: {
      schemaVersion: 2,
      generatedAt: new Date().toISOString(),
      players,
      seasons,
      roster,
      matches,
      playerMatchStats,
      matchEvents,
      news,
      gallery,
    },
    warnings,
    errors,
  };
}

async function main() {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const useCli = process.env.USE_GSHEETS_CLI === '1';
  const skipIfNoCreds = process.env.SKIP_IF_NO_CREDS === '1';

  let rawTabs;
  if (saJson && saJson.trim() !== '') {
    console.log('Syncing Toasty FC Database via Google Service Account API...');
    rawTabs = await fetchTabsViaServiceAccount(saJson);
  } else if (useCli) {
    console.log('Syncing Toasty FC Database via local gsheets CLI...');
    rawTabs = fetchTabsViaGsheetsCli();
  } else if (skipIfNoCreds && fs.existsSync(OUTPUT_PATH)) {
    console.log(
      'GOOGLE_SERVICE_ACCOUNT_JSON not configured yet; using committed public/data/toasty-data.json snapshot.'
    );
    return;
  } else {
    throw new Error(
      'Missing credentials: set GOOGLE_SERVICE_ACCOUNT_JSON (for CI/private sheet) or USE_GSHEETS_CLI=1 (local).'
    );
  }

  const { dataset, warnings, errors } = buildPublicDataset(rawTabs);

  if (errors.length > 0) {
    for (const e of errors) console.error('ERROR:', e);
    process.exit(1);
  }

  // Final privacy assertion: ensure forbidden private keys never appear in serialized JSON
  const serialized = JSON.stringify(dataset, null, 2);
  for (const forbidden of ['"perPlayerFee"', '"teamFee"', '"amountPaid"', '"dateOfBirth"']) {
    if (serialized.includes(forbidden)) {
      throw new Error(`Privacy check failed: forbidden key ${forbidden} found in public output!`);
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, serialized + '\n', 'utf8');

  console.log(
    `Wrote ${OUTPUT_PATH}:\n` +
      `  players=${dataset.players.length}, seasons=${dataset.seasons.length}, roster=${dataset.roster.length},\n` +
      `  matches=${dataset.matches.length}, matchStats=${dataset.playerMatchStats.length}, matchEvents=${dataset.matchEvents.length},\n` +
      `  news=${dataset.news.length}, gallery=${dataset.gallery.length}`
  );
  if (warnings.length > 0) {
    console.log(`\nValidation warnings (${warnings.length}):`);
    for (const w of warnings) console.log('  -', w);
  }
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
