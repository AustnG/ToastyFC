import { Match, MatchStats, Player, RosterEntry, Season } from '../types';
import { compareDatesAsc, compareDatesDesc } from './dateUtils';

export interface PlayerEfficiencyRow {
  playerId: string;
  name: string;
  number?: number;
  position?: string;
  matchesPlayed: number;
  attendancePct: number;
  goals: number;
  assists: number;
  contributions: number;
  gaPerGame: number;
  totalShots: number;
  sot: number;
  shotAccuracy: number | null;
  conversionRate: number | null;
  plusMinus: number;
  teamWinsWithPlayer: number;
  teamDrawsWithPlayer: number;
  teamLossesWithPlayer: number;
  winRateWithPlayer: number | null;
  winRateDelta: number | null;
}

export interface SeasonTrendRow {
  seasonId: string;
  seasonName: string;
  shortLabel: string;
  division?: string;
  startDate?: string;
  endDate?: string;
  gp: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  gf: number;
  ga: number;
  gd: number;
  gfPerGame: number;
  gaPerGame: number;
  shutouts: number;
  topScorerName: string | null;
  topScorerGoals: number;
}

export interface StreakRecord {
  count: number;
  startDate?: string;
  endDate?: string;
  label: string;
}

export interface StreaksSummary {
  longestWinStreak: StreakRecord;
  longestUnbeatenStreak: StreakRecord;
  longestScoringStreak: StreakRecord;
  activeStreak: {
    type: 'Win' | 'Unbeaten' | 'Loss' | 'None';
    count: number;
    detail: string;
  };
}

export interface OpponentH2HRow {
  key: string;
  opponent: string;
  gp: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  gf: number;
  ga: number;
  gd: number;
  lastDate: string;
  lastScore: string;
  lastOutcome: 'W' | 'D' | 'L';
}

export interface CareerRecordLeader {
  label: string;
  playerName: string;
  number?: number;
  value: number;
  unit: string;
  subtext: string;
}

export interface SingleGamePlayerRecord {
  label: string;
  playerName: string;
  value: number;
  formattedValue: string;
  opponent: string;
  date: string;
  scoreline: string;
}

export interface HatTrickEntry {
  id: string;
  playerName: string;
  goals: number;
  assists: number;
  opponent: string;
  date: string;
  scoreline: string;
}

export interface SingleGameTeamRecord {
  label: string;
  headline: string;
  subtext: string;
  date?: string;
}

export interface ClubRecordsVault {
  careerLeaders: CareerRecordLeader[];
  singleGamePlayer: SingleGamePlayerRecord[];
  hatTricks: HatTrickEntry[];
  singleGameTeam: SingleGameTeamRecord[];
  totals: {
    totalMatches: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    gf: number;
    ga: number;
    gd: number;
    shutouts: number;
    seasonsCount: number;
  };
}

const normalizeKey = (s?: string) => (s || '').trim().toLowerCase();

const isTrueFlag = (val: unknown): boolean =>
  val === true || String(val).toLowerCase() === 'true';

const matchBelongsToSeason = (m: Match, season: Season): boolean => {
  if (m.seasonId && season.id && m.seasonId === season.id) return true;
  const sName = normalizeKey(season.name);
  if (!sName) return false;
  return normalizeKey(m.seasonName) === sName || normalizeKey(m.season) === sName;
};

const shortenSeasonName = (name: string): string => {
  // Keep chart axis labels compact and readable
  const cleaned = name
    .replace(/\s*-\s*/g, ' ')
    .replace(/BG Futsal/gi, 'BG')
    .replace(/SKY Indoor/gi, 'SKY')
    .replace(/SKY/gi, 'SKY')
    .trim();
  return cleaned.length > 14 ? `${cleaned.slice(0, 13)}…` : cleaned;
};

/**
 * Computes Player Efficiency & Win-Rate Impact Splits for the active scope (selected season or all-time).
 */
export function computePlayerEfficiencySplits(
  scopedPlayers: Player[],
  scopedMatches: Match[],
  allPlayerMatchStats: MatchStats[]
): { rows: PlayerEfficiencyRow[]; baselineWinRate: number; completedCount: number } {
  const completedMatches = scopedMatches.filter(m => m.status === 'Completed');
  const completedCount = completedMatches.length;
  const completedMap = new Map<string, Match>();
  completedMatches.forEach(m => completedMap.set(m.id, m));

  const teamWins = completedMatches.filter(
    m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0)
  ).length;
  const baselineWinRate =
    completedCount > 0 ? Math.round((teamWins / completedCount) * 100) : 0;

  const rows: PlayerEfficiencyRow[] = scopedPlayers
    .filter(p => (p.matchesPlayed ?? 0) > 0)
    .map(p => {
      const mp = p.matchesPlayed ?? 0;
      const goals = p.goals ?? 0;
      const assists = p.assists ?? 0;
      const contributions = goals + assists;
      const gaPerGame = mp > 0 ? Number((contributions / mp).toFixed(2)) : 0;
      const sot = p.shotsOnTarget ?? 0;
      const offTarget = p.shotsOffTarget ?? p.shots ?? 0;
      const totalShots = offTarget + sot;
      const shotAccuracy = totalShots > 0 ? Math.round((sot / totalShots) * 100) : null;
      const conversionRate = sot > 0 ? Math.round((goals / sot) * 100) : null;
      const attendancePct =
        completedCount > 0 ? Math.min(100, Math.round((mp / completedCount) * 100)) : 0;

      // Calculate Win-Rate when this player logged a present appearance in scoped matches
      const appearances = allPlayerMatchStats.filter(
        s => s.playerId === p.id && s.present !== false && completedMap.has(s.matchId)
      );

      let w = 0;
      let d = 0;
      let l = 0;
      const seenMatchIds = new Set<string>();
      appearances.forEach(app => {
        if (seenMatchIds.has(app.matchId)) return;
        seenMatchIds.add(app.matchId);
        const match = completedMap.get(app.matchId);
        if (!match) return;
        const ts = match.toastyScore ?? 0;
        const os = match.opponentScore ?? 0;
        if (ts > os) w++;
        else if (ts === os) d++;
        else l++;
      });

      const loggedCount = w + d + l;
      const winRateWithPlayer =
        loggedCount > 0 ? Math.round((w / loggedCount) * 100) : null;
      const winRateDelta =
        winRateWithPlayer !== null ? winRateWithPlayer - baselineWinRate : null;

      return {
        playerId: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        matchesPlayed: mp,
        attendancePct,
        goals,
        assists,
        contributions,
        gaPerGame,
        totalShots,
        sot,
        shotAccuracy,
        conversionRate,
        plusMinus: p.plusMinus ?? 0,
        teamWinsWithPlayer: w,
        teamDrawsWithPlayer: d,
        teamLossesWithPlayer: l,
        winRateWithPlayer,
        winRateDelta
      };
    });

  return { rows, baselineWinRate, completedCount };
}

/**
 * Computes chronological season-over-season team progression metrics across all club campaigns.
 */
export function computeSeasonTrends(
  seasonsList: Season[],
  allMatches: Match[],
  allPlayerMatchStats: MatchStats[]
): SeasonTrendRow[] {
  // Build canonical season list from seasonsList + any orphan season names on matches
  const canonicalSeasons: Season[] = [...seasonsList];
  const existingKeys = new Set(canonicalSeasons.map(s => normalizeKey(s.name)));

  allMatches.forEach(m => {
    const name = (m.seasonName || m.season || '').trim();
    if (name && !existingKeys.has(normalizeKey(name))) {
      existingKeys.add(normalizeKey(name));
      canonicalSeasons.push({ id: m.seasonId || name, name });
    }
  });

  const rows: (SeasonTrendRow & { sortDate: string })[] = [];

  canonicalSeasons.forEach(season => {
    const seasonMatches = allMatches
      .filter(m => matchBelongsToSeason(m, season) && m.status === 'Completed')
      .sort((a, b) => compareDatesAsc(a.date, b.date, a.time, b.time));

    if (seasonMatches.length === 0) return;

    const matchIds = new Set(seasonMatches.map(m => m.id));
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let gf = 0;
    let ga = 0;
    let shutouts = 0;

    seasonMatches.forEach(m => {
      const ts = m.toastyScore ?? 0;
      const os = m.opponentScore ?? 0;
      gf += ts;
      ga += os;
      if (ts > os) wins++;
      else if (ts === os) draws++;
      else losses++;
      if (os === 0) shutouts++;
    });

    const gp = seasonMatches.length;
    const winRate = Math.round((wins / gp) * 100);

    // Top scorer in this season from playerMatchStats (fallback to goalsScoredBy)
    const scorerTotals = new Map<string, number>();
    const seasonStats = allPlayerMatchStats.filter(
      s => s.present !== false && matchIds.has(s.matchId)
    );
    if (seasonStats.length > 0) {
      seasonStats.forEach(s => {
        const g = Number(s.goals || 0);
        if (g > 0) {
          scorerTotals.set(s.playerName, (scorerTotals.get(s.playerName) || 0) + g);
        }
      });
    } else {
      seasonMatches.forEach(m => {
        m.goalsScoredBy?.forEach(name => {
          scorerTotals.set(name, (scorerTotals.get(name) || 0) + 1);
        });
      });
    }

    let topScorerName: string | null = null;
    let topScorerGoals = 0;
    scorerTotals.forEach((g, name) => {
      if (g > topScorerGoals) {
        topScorerGoals = g;
        topScorerName = name;
      }
    });

    const sortDate = season.startDate || seasonMatches[0]?.date || '';

    rows.push({
      seasonId: season.id,
      seasonName: season.name,
      shortLabel: shortenSeasonName(season.name),
      division: season.division,
      startDate: season.startDate || seasonMatches[0]?.date,
      endDate: season.endDate || seasonMatches[seasonMatches.length - 1]?.date,
      gp,
      wins,
      draws,
      losses,
      winRate,
      gf,
      ga,
      gd: gf - ga,
      gfPerGame: Number((gf / gp).toFixed(2)),
      gaPerGame: Number((ga / gp).toFixed(2)),
      shutouts,
      topScorerName,
      topScorerGoals,
      sortDate
    });
  });

  return rows
    .sort((a, b) => compareDatesAsc(a.sortDate, b.sortDate))
    .map(({ sortDate: _omit, ...rest }) => rest);
}

/**
 * Computes all-time win, unbeaten, scoring, and active streaks chronologically.
 */
export function computeStreaks(allMatches: Match[]): StreaksSummary {
  const completed = [...allMatches]
    .filter(m => m.status === 'Completed')
    .sort((a, b) => compareDatesAsc(a.date, b.date, a.time, b.time));

  if (completed.length === 0) {
    return {
      longestWinStreak: { count: 0, label: 'No completed matches' },
      longestUnbeatenStreak: { count: 0, label: 'No completed matches' },
      longestScoringStreak: { count: 0, label: 'No completed matches' },
      activeStreak: { type: 'None', count: 0, detail: 'No matches played yet' }
    };
  }

  let curWin = 0;
  let curWinStart: string | undefined;
  let bestWin: StreakRecord = { count: 0, label: 'No wins logged' };

  let curUnbeaten = 0;
  let curUnbeatenStart: string | undefined;
  let bestUnbeaten: StreakRecord = { count: 0, label: 'No unbeaten runs' };

  let curScoring = 0;
  let curScoringStart: string | undefined;
  let bestScoring: StreakRecord = { count: 0, label: 'No scoring runs' };

  completed.forEach(m => {
    const ts = m.toastyScore ?? 0;
    const os = m.opponentScore ?? 0;

    if (ts > os) {
      if (curWin === 0) curWinStart = m.date;
      curWin++;
      if (curWin >= bestWin.count) {
        bestWin = {
          count: curWin,
          startDate: curWinStart,
          endDate: m.date,
          label: `${curWin} consecutive ${curWin === 1 ? 'win' : 'wins'}`
        };
      }
    } else {
      curWin = 0;
      curWinStart = undefined;
    }

    if (ts >= os) {
      if (curUnbeaten === 0) curUnbeatenStart = m.date;
      curUnbeaten++;
      if (curUnbeaten >= bestUnbeaten.count) {
        bestUnbeaten = {
          count: curUnbeaten,
          startDate: curUnbeatenStart,
          endDate: m.date,
          label: `${curUnbeaten} straight unbeaten`
        };
      }
    } else {
      curUnbeaten = 0;
      curUnbeatenStart = undefined;
    }

    if (ts > 0) {
      if (curScoring === 0) curScoringStart = m.date;
      curScoring++;
      if (curScoring >= bestScoring.count) {
        bestScoring = {
          count: curScoring,
          startDate: curScoringStart,
          endDate: m.date,
          label: `Scored in ${curScoring} straight`
        };
      }
    } else {
      curScoring = 0;
      curScoringStart = undefined;
    }
  });

  // Active streak from the latest match backwards
  let activeType: 'Win' | 'Unbeaten' | 'Loss' | 'None' = 'None';
  let activeCount = 0;
  const last = completed[completed.length - 1];
  const lastTs = last.toastyScore ?? 0;
  const lastOs = last.opponentScore ?? 0;

  if (lastTs > lastOs) {
    activeType = 'Win';
    for (let i = completed.length - 1; i >= 0; i--) {
      if ((completed[i].toastyScore ?? 0) > (completed[i].opponentScore ?? 0)) activeCount++;
      else break;
    }
  } else if (lastTs === lastOs) {
    activeType = 'Unbeaten';
    for (let i = completed.length - 1; i >= 0; i--) {
      if ((completed[i].toastyScore ?? 0) >= (completed[i].opponentScore ?? 0)) activeCount++;
      else break;
    }
  } else {
    activeType = 'Loss';
    for (let i = completed.length - 1; i >= 0; i--) {
      if ((completed[i].toastyScore ?? 0) < (completed[i].opponentScore ?? 0)) activeCount++;
      else break;
    }
  }

  return {
    longestWinStreak: bestWin,
    longestUnbeatenStreak: bestUnbeaten,
    longestScoringStreak: bestScoring,
    activeStreak: {
      type: activeType,
      count: activeCount,
      detail:
        activeType === 'Win'
          ? `${activeCount}W active run`
          : activeType === 'Unbeaten'
            ? `${activeCount} unbeaten`
            : `${activeCount}L skid`
    }
  };
}

/**
 * Aggregates Head-to-Head opponent records across all completed club fixtures.
 */
export function computeOpponentH2H(allMatches: Match[]): {
  rows: OpponentH2HRow[];
  nemesis: OpponentH2HRow | null;
  favoriteOpponent: OpponentH2HRow | null;
  mostPlayed: OpponentH2HRow | null;
} {
  const completed = [...allMatches]
    .filter(m => m.status === 'Completed' && m.opponent && m.opponent.trim() !== '')
    .sort((a, b) => compareDatesDesc(a.date, b.date, a.time, b.time));

  const map = new Map<string, OpponentH2HRow>();

  completed.forEach(m => {
    const cleanName = m.opponent.trim();
    const key = cleanName.toLowerCase();
    const ts = m.toastyScore ?? 0;
    const os = m.opponentScore ?? 0;
    const outcome: 'W' | 'D' | 'L' = ts > os ? 'W' : ts < os ? 'L' : 'D';

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        opponent: cleanName,
        gp: 1,
        wins: outcome === 'W' ? 1 : 0,
        draws: outcome === 'D' ? 1 : 0,
        losses: outcome === 'L' ? 1 : 0,
        winRate: outcome === 'W' ? 100 : 0,
        gf: ts,
        ga: os,
        gd: ts - os,
        lastDate: m.date,
        lastScore: `${ts}-${os}`,
        lastOutcome: outcome
      });
    } else {
      existing.gp += 1;
      if (outcome === 'W') existing.wins += 1;
      else if (outcome === 'D') existing.draws += 1;
      else existing.losses += 1;
      existing.gf += ts;
      existing.ga += os;
      existing.gd = existing.gf - existing.ga;
      existing.winRate = Math.round((existing.wins / existing.gp) * 100);
    }
  });

  const rows = Array.from(map.values()).sort(
    (a, b) => b.gp - a.gp || b.wins - a.wins || b.gd - a.gd
  );

  const multiMeeting = rows.filter(r => r.gp >= 2);
  const pool = multiMeeting.length > 0 ? multiMeeting : rows;

  // Nemesis: most losses (tie-break lowest win rate, then worst GD)
  const nemesis =
    [...pool]
      .filter(r => r.losses > 0)
      .sort((a, b) => b.losses - a.losses || a.winRate - b.winRate || a.gd - b.gd)[0] || null;

  // Favorite Opponent: most wins (tie-break highest win rate, then best GD)
  const favoriteOpponent =
    [...pool]
      .filter(r => r.wins > 0)
      .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || b.gd - a.gd)[0] || null;

  const mostPlayed = rows[0] || null;

  return { rows, nemesis, favoriteOpponent, mostPlayed };
}

/**
 * Computes the Permanent Club Records Vault (Career Leaders, Single-Game Player Highs, Hat-Tricks, Team Highs).
 */
export function computeClubRecordsVault(
  allPlayers: Player[],
  allMatches: Match[],
  allPlayerMatchStats: MatchStats[],
  roster: RosterEntry[],
  seasonsList: Season[]
): ClubRecordsVault {
  const completedMatches = allMatches.filter(m => m.status === 'Completed');
  const matchMap = new Map<string, Match>();
  completedMatches.forEach(m => matchMap.set(m.id, m));

  const wins = completedMatches.filter(m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0)).length;
  const draws = completedMatches.filter(m => (m.toastyScore ?? 0) === (m.opponentScore ?? 0)).length;
  const losses = completedMatches.filter(m => (m.toastyScore ?? 0) < (m.opponentScore ?? 0)).length;
  const gf = completedMatches.reduce((acc, m) => acc + (m.toastyScore ?? 0), 0);
  const ga = completedMatches.reduce((acc, m) => acc + (m.opponentScore ?? 0), 0);
  const shutouts = completedMatches.filter(m => (m.opponentScore ?? 0) === 0).length;
  const winRate =
    completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0;

  // Resolve latest jersey number & position per player
  const playerMeta = new Map<string, { name: string; number?: number; position?: string }>();
  allPlayers.forEach(p => {
    const entries = roster.filter(r => r.playerId === p.id);
    const latest = entries[entries.length - 1];
    playerMeta.set(p.id, {
      name: p.name,
      number: latest?.number ?? p.number,
      position: latest?.position ?? p.position
    });
  });

  // Career aggregates from allPlayerMatchStats across completed matches
  const careerMap = new Map<
    string,
    {
      name: string;
      number?: number;
      position?: string;
      apps: number;
      goals: number;
      assists: number;
      blocks: number;
      potm: number;
      cleanSheets: number;
      saves: number;
    }
  >();

  const validStats = allPlayerMatchStats.filter(
    s => s.present !== false && matchMap.has(s.matchId)
  );

  validStats.forEach(s => {
    const meta = playerMeta.get(s.playerId);
    const name = meta?.name || s.playerName;
    const cur = careerMap.get(s.playerId) || {
      name,
      number: meta?.number,
      position: meta?.position,
      apps: 0,
      goals: 0,
      assists: 0,
      blocks: 0,
      potm: 0,
      cleanSheets: 0,
      saves: 0
    };
    cur.apps += 1;
    cur.goals += Number(s.goals || 0);
    cur.assists += Number(s.assists || 0);
    cur.blocks += Number(s.blocks || 0);
    cur.saves += Number(s.saves || 0);
    if (isTrueFlag(s.potm)) cur.potm += 1;
    if (isTrueFlag(s.cleanSheet)) cur.cleanSheets += 1;
    careerMap.set(s.playerId, cur);
  });

  const careerList = Array.from(careerMap.values());

  const pickTop = (
    list: typeof careerList,
    selector: (c: (typeof careerList)[number]) => number,
    label: string,
    unit: string,
    subFn: (c: (typeof careerList)[number]) => string
  ): CareerRecordLeader | null => {
    const sorted = [...list]
      .filter(c => selector(c) > 0)
      .sort((a, b) => selector(b) - selector(a) || b.apps - a.apps);
    const top = sorted[0];
    if (!top) return null;
    return {
      label,
      playerName: top.name,
      number: top.number,
      value: selector(top),
      unit,
      subtext: subFn(top)
    };
  };

  const careerLeaders = [
    pickTop(careerList, c => c.goals, 'All-Time Top Scorer', 'Goals', c => `${c.apps} apps`),
    pickTop(careerList, c => c.assists, 'All-Time Assist Leader', 'Assists', c => `${c.apps} apps`),
    pickTop(
      careerList,
      c => c.goals + c.assists,
      'Most Goal Contributions',
      'G+A',
      c => `${c.goals}G · ${c.assists}A`
    ),
    pickTop(careerList, c => c.apps, 'Iron Man (Appearances)', 'Apps', c =>
      completedMatches.length > 0
        ? `${Math.round((c.apps / completedMatches.length) * 100)}% of club games`
        : `${c.apps} played`
    ),
    pickTop(
      careerList.filter(c => c.position !== 'Goalkeeper'),
      c => c.blocks,
      'All-Time Block Leader',
      'Blocks',
      c => `Outfield · ${c.apps} apps`
    ),
    pickTop(careerList, c => c.potm, 'Most POTM Awards', 'POTM', c => `${c.apps} apps`),
    pickTop(careerList, c => c.saves, 'All-Time Saves Leader', 'Saves', c => `${c.cleanSheets} clean sheets`),
    pickTop(careerList, c => c.cleanSheets, 'Most Clean Sheets', 'Shutouts', c => `${c.apps} apps`)
  ].filter((item): item is CareerRecordLeader => item !== null);

  // Single-Game Player Records
  const singleGamePlayer: SingleGamePlayerRecord[] = [];
  const pickSingleGame = (
    label: string,
    statsPool: MatchStats[],
    valFn: (s: MatchStats) => number,
    fmtFn: (v: number) => string
  ) => {
    let best: { stat: MatchStats; val: number; match: Match } | null = null;
    statsPool.forEach(s => {
      const m = matchMap.get(s.matchId);
      if (!m) return;
      const val = valFn(s);
      if (val <= 0) return;
      if (!best || val > best.val) {
        best = { stat: s, val, match: m };
      }
    });
    if (best) {
      const b = best as { stat: MatchStats; val: number; match: Match };
      const meta = playerMeta.get(b.stat.playerId);
      singleGamePlayer.push({
        label,
        playerName: meta?.name || b.stat.playerName,
        value: b.val,
        formattedValue: fmtFn(b.val),
        opponent: b.match.opponent,
        date: b.match.date,
        scoreline: `${b.match.toastyScore ?? 0}-${b.match.opponentScore ?? 0}`
      });
    }
  };

  pickSingleGame('Most Goals in a Match', validStats, s => Number(s.goals || 0), v => `${v} G`);
  pickSingleGame('Most Assists in a Match', validStats, s => Number(s.assists || 0), v => `${v} A`);
  pickSingleGame(
    'Most G+A in a Match',
    validStats,
    s => Number(s.goals || 0) + Number(s.assists || 0),
    v => `${v} G+A`
  );
  pickSingleGame(
    'Best Single-Game +/-',
    validStats,
    s => Number(s.plusMinus || 0),
    v => `+${v}`
  );
  pickSingleGame(
    'Most Shots in a Match',
    validStats,
    s => Number(s.shots || 0) + Number(s.shotsOnTarget || 0),
    v => `${v} Sh`
  );
  pickSingleGame(
    'Most Outfield Blocks',
    validStats.filter(s => playerMeta.get(s.playerId)?.position !== 'Goalkeeper'),
    s => Number(s.blocks || 0),
    v => `${v} Blk`
  );
  pickSingleGame('Most GK Saves in a Match', validStats, s => Number(s.saves || 0), v => `${v} Sv`);

  // Hat-Trick Club (3+ goals in a single match)
  const hatTricks: HatTrickEntry[] = validStats
    .filter(s => Number(s.goals || 0) >= 3)
    .map(s => {
      const m = matchMap.get(s.matchId)!;
      const meta = playerMeta.get(s.playerId);
      return {
        id: s.id || `${s.matchId}_${s.playerId}`,
        playerName: meta?.name || s.playerName,
        goals: Number(s.goals || 0),
        assists: Number(s.assists || 0),
        opponent: m.opponent,
        date: m.date,
        scoreline: `${m.toastyScore ?? 0}-${m.opponentScore ?? 0}`
      };
    })
    .sort((a, b) => b.goals - a.goals || compareDatesDesc(a.date, b.date));

  // Single-Game Team Records
  const singleGameTeam: SingleGameTeamRecord[] = [];
  if (completedMatches.length > 0) {
    const biggestWin = [...completedMatches]
      .filter(m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0))
      .sort(
        (a, b) =>
          (b.toastyScore ?? 0) -
          (b.opponentScore ?? 0) -
          ((a.toastyScore ?? 0) - (a.opponentScore ?? 0)) ||
          (b.toastyScore ?? 0) - (a.toastyScore ?? 0)
      )[0];

    if (biggestWin) {
      const margin = (biggestWin.toastyScore ?? 0) - (biggestWin.opponentScore ?? 0);
      singleGameTeam.push({
        label: 'Biggest Margin of Victory',
        headline: `+${margin} (${biggestWin.toastyScore}-${biggestWin.opponentScore})`,
        subtext: `vs. ${biggestWin.opponent}`,
        date: biggestWin.date
      });
    }

    const mostTeamGoals = [...completedMatches].sort(
      (a, b) => (b.toastyScore ?? 0) - (a.toastyScore ?? 0)
    )[0];
    if (mostTeamGoals && (mostTeamGoals.toastyScore ?? 0) > 0) {
      singleGameTeam.push({
        label: 'Most Team Goals in a Match',
        headline: `${mostTeamGoals.toastyScore} Goals`,
        subtext: `${mostTeamGoals.toastyScore}-${mostTeamGoals.opponentScore} vs. ${mostTeamGoals.opponent}`,
        date: mostTeamGoals.date
      });
    }

    const highestCombined = [...completedMatches].sort(
      (a, b) =>
        (b.toastyScore ?? 0) +
        (b.opponentScore ?? 0) -
        ((a.toastyScore ?? 0) + (a.opponentScore ?? 0))
    )[0];
    if (highestCombined) {
      const total = (highestCombined.toastyScore ?? 0) + (highestCombined.opponentScore ?? 0);
      singleGameTeam.push({
        label: 'Highest-Scoring Thriller',
        headline: `${total} Total Goals`,
        subtext: `${highestCombined.toastyScore}-${highestCombined.opponentScore} vs. ${highestCombined.opponent}`,
        date: highestCombined.date
      });
    }

    // Best Defensive Season (lowest GA/game with >= 2 matches)
    const seasonTrends = computeSeasonTrends(seasonsList, allMatches, allPlayerMatchStats);
    const qualifiedDef = seasonTrends.filter(s => s.gp >= 2);
    const bestDefSeason = [...(qualifiedDef.length > 0 ? qualifiedDef : seasonTrends)].sort(
      (a, b) => a.gaPerGame - b.gaPerGame || b.shutouts - a.shutouts
    )[0];
    if (bestDefSeason) {
      singleGameTeam.push({
        label: 'Best Defensive Campaign',
        headline: `${bestDefSeason.gaPerGame} GA / Game`,
        subtext: `${bestDefSeason.seasonName} (${bestDefSeason.shutouts} shutouts)`
      });
    }
  }

  return {
    careerLeaders,
    singleGamePlayer,
    hatTricks,
    singleGameTeam,
    totals: {
      totalMatches: completedMatches.length,
      wins,
      draws,
      losses,
      winRate,
      gf,
      ga,
      gd: gf - ga,
      shutouts,
      seasonsCount: computeSeasonTrends(seasonsList, allMatches, allPlayerMatchStats).length
    }
  };
}
