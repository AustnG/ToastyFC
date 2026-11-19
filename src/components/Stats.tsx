import React, { useMemo, useState } from 'react';
import { Match, MatchStats, Player, RosterEntry, Season } from '../types';
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  ArrowUpDown,
  Trophy,
  Flame,
  Shield
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { formatDateDisplay, compareDatesAsc } from '../lib/dateUtils';
import {
  computePlayerEfficiencySplits,
  computeSeasonTrends,
  computeStreaks,
  computeOpponentH2H,
  computeClubRecordsVault,
  PlayerEfficiencyRow,
  OpponentH2HRow
} from '../lib/statsAnalytics';

interface StatsProps {
  players: Player[];
  seasons?: string[];
  seasonsList?: Season[];
  activeSeason?: string;
  onSeasonChange?: (season: string) => void;
  matches?: Match[];
  allMatches?: Match[];
  allPlayers?: Player[];
  playerMatchStats?: MatchStats[];
  roster?: RosterEntry[];
}

type SubTab = 'leaders' | 'trends' | 'records';
type CategoryTab = 'all' | 'attacking' | 'defending' | 'efficiency' | 'goalkeeping';
type EfficiencySortKey =
  | 'gaPerGame'
  | 'winRateDelta'
  | 'winRateWithPlayer'
  | 'conversionRate'
  | 'shotAccuracy'
  | 'attendancePct'
  | 'matchesPlayed';
type OpponentSortKey = 'gp' | 'winRate' | 'wins' | 'losses' | 'gd';

const formatShortDate = (dateStr?: string): string =>
  formatDateDisplay(dateStr, { month: 'short', day: 'numeric', year: 'numeric' });

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>;
  label?: string;
}

const MatchdayChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-toasty-obsidian border border-toasty-obsidian-border text-white rounded-lg px-3.5 py-2.5 shadow-xl text-xs font-mono tabular-nums space-y-1.5">
      <div className="text-toasty-tan font-semibold uppercase tracking-wider text-[10px] pb-1 border-b border-toasty-obsidian-border">
        {label}
      </div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4">
          <span className="text-zinc-300">{entry.name}</span>
          <span className="font-bold text-white">
            {entry.dataKey === 'winRate' ? `${entry.value}%` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const Stats: React.FC<StatsProps> = ({
  players,
  seasons,
  seasonsList = [],
  activeSeason = 'All Seasons',
  onSeasonChange,
  matches = [],
  allMatches,
  allPlayers,
  playerMatchStats = [],
  roster = []
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('leaders');
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [impactView, setImpactView] = useState<'highest' | 'lowest'>('highest');

  // Efficiency table interactive state
  const [minGamesOnly, setMinGamesOnly] = useState<boolean>(true);
  const [efficiencySort, setEfficiencySort] = useState<EfficiencySortKey>('gaPerGame');
  const [efficiencySortDir, setEfficiencySortDir] = useState<'desc' | 'asc'>('desc');

  // Trends & Rivalries interactive state
  const [chartMetric, setChartMetric] = useState<'perGame' | 'totals'>('perGame');
  const [opponentSearch, setOpponentSearch] = useState<string>('');
  const [opponentSort, setOpponentSort] = useState<OpponentSortKey>('gp');

  const fullMatches = allMatches && allMatches.length > 0 ? allMatches : matches;
  const fullPlayers = allPlayers && allPlayers.length > 0 ? allPlayers : players;

  const activeSeasonObj = seasonsList.find(
    s => s.name === activeSeason || s.id === activeSeason
  );

  // --- Season Leaders Computations ---
  const scorers = useMemo(
    () =>
      [...players]
        .filter(p => (p.goals ?? 0) > 0)
        .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
        .slice(0, 5),
    [players]
  );

  const playmakers = useMemo(
    () =>
      [...players]
        .filter(p => (p.assists ?? 0) > 0)
        .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))
        .slice(0, 5),
    [players]
  );

  const shotLeaders = useMemo(
    () =>
      [...players]
        .map(p => {
          const unTargetedShots = p.shots ?? 0;
          const sot = p.shotsOnTarget ?? 0;
          const totalShots = unTargetedShots + sot;
          const sotRate = totalShots > 0 ? Math.round((sot / totalShots) * 100) : 0;
          return { ...p, shots: unTargetedShots, sot, totalShots, sotRate };
        })
        .filter(p => p.totalShots > 0)
        .sort((a, b) => b.totalShots - a.totalShots || b.sot - a.sot)
        .slice(0, 5),
    [players]
  );

  const blockLeaders = useMemo(
    () =>
      [...players]
        .filter(p => p.position !== 'Goalkeeper' && (p.blocks ?? 0) > 0)
        .map(p => ({ ...p, blocks: p.blocks ?? 0 }))
        .sort((a, b) => b.blocks - a.blocks)
        .slice(0, 5),
    [players]
  );

  const foulLeaders = useMemo(
    () =>
      [...players]
        .filter(p => (p.fouls ?? 0) > 0)
        .map(p => ({
          ...p,
          fouls: p.fouls ?? 0,
          yellows: p.yellows ?? 0,
          reds: p.reds ?? 0
        }))
        .sort((a, b) => b.fouls - a.fouls)
        .slice(0, 5),
    [players]
  );

  const potmLeaders = useMemo(
    () =>
      [...players]
        .filter(p => (p.potm ?? 0) > 0)
        .map(p => ({ ...p, potm: p.potm ?? 0 }))
        .sort((a, b) => b.potm - a.potm)
        .slice(0, 5),
    [players]
  );

  const { highestImpact, lowestImpact } = useMemo(() => {
    const eligible = players
      .filter(p => (p.matchesPlayed ?? 0) > 0 || (p.plusMinus ?? 0) !== 0)
      .map(p => ({ ...p, plusMinus: p.plusMinus ?? 0 }));
    return {
      highestImpact: [...eligible].sort((a, b) => b.plusMinus - a.plusMinus).slice(0, 5),
      lowestImpact: [...eligible].sort((a, b) => a.plusMinus - b.plusMinus).slice(0, 5)
    };
  }, [players]);

  const activeImpactList = impactView === 'highest' ? highestImpact : lowestImpact;
  const maxImpactVal = Math.max(...activeImpactList.map(p => Math.abs(p.plusMinus)), 1);

  const maxGoals = Math.max(...scorers.map(p => p.goals ?? 0), 1);
  const maxAssists = Math.max(...playmakers.map(p => p.assists ?? 0), 1);
  const maxShots = Math.max(...shotLeaders.map(p => p.totalShots), 1);
  const maxBlocks = Math.max(...blockLeaders.map(p => p.blocks), 1);
  const maxFouls = Math.max(...foulLeaders.map(p => p.fouls), 1);
  const maxPotm = Math.max(...potmLeaders.map(p => p.potm), 1);

  // Scoped season summary metrics
  const totalGoals = players.reduce((acc, curr) => acc + (curr.goals ?? 0), 0);
  const totalAssists = players.reduce((acc, curr) => acc + (curr.assists ?? 0), 0);
  const totalOffTargetShots = players.reduce((acc, curr) => acc + (curr.shots ?? 0), 0);
  const totalSOT = players.reduce((acc, curr) => acc + (curr.shotsOnTarget ?? 0), 0);
  const totalShots = totalOffTargetShots + totalSOT;
  const overallSOTRate = totalShots > 0 ? Math.round((totalSOT / totalShots) * 100) : 0;

  const completedMatches = useMemo(
    () => matches.filter(m => m.status === 'Completed'),
    [matches]
  );
  const wins = completedMatches.filter(m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0)).length;
  const draws = completedMatches.filter(m => (m.toastyScore ?? 0) === (m.opponentScore ?? 0)).length;
  const losses = completedMatches.filter(m => (m.toastyScore ?? 0) < (m.opponentScore ?? 0)).length;
  const teamGoalsScored = completedMatches.reduce((acc, curr) => acc + (curr.toastyScore ?? 0), 0);
  const teamGoalsConceded = completedMatches.reduce(
    (acc, curr) => acc + (curr.opponentScore ?? 0),
    0
  );
  const teamGoalDifference = teamGoalsScored - teamGoalsConceded;
  const winRate =
    completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0;

  const lastMatches = useMemo(
    () =>
      [...completedMatches]
        .sort((a, b) => compareDatesAsc(a.date, b.date, a.time, b.time))
        .slice(-5),
    [completedMatches]
  );

  const goalkeeper = players.find(p => p.position === 'Goalkeeper');
  const cleanSheetsCount =
    goalkeeper?.cleanSheets ??
    completedMatches.filter(m => (m.opponentScore ?? 0) === 0).length;
  const savesCount = goalkeeper?.saves ?? 0;
  const goalsAllowedCount = goalkeeper?.goalsAllowed ?? teamGoalsConceded;
  const totalShotsFaced = savesCount + goalsAllowedCount;
  const savePercentage =
    totalShotsFaced > 0 ? ((savesCount / totalShotsFaced) * 100).toFixed(1) : '0.0';

  // --- Deep Analytics Memoized Engines ---
  const efficiencyData = useMemo(
    () => computePlayerEfficiencySplits(players, matches, playerMatchStats),
    [players, matches, playerMatchStats]
  );

  const minGamesThreshold = efficiencyData.completedCount >= 3 ? 3 : 1;

  const sortedEfficiencyRows = useMemo(() => {
    const filtered = minGamesOnly
      ? efficiencyData.rows.filter(r => r.matchesPlayed >= minGamesThreshold)
      : efficiencyData.rows;
    const pool = filtered.length > 0 ? filtered : efficiencyData.rows;

    return [...pool].sort((a, b) => {
      const valA = a[efficiencySort] ?? -999;
      const valB = b[efficiencySort] ?? -999;
      return efficiencySortDir === 'desc' ? valB - valA : valA - valB;
    });
  }, [efficiencyData.rows, minGamesOnly, minGamesThreshold, efficiencySort, efficiencySortDir]);

  const seasonTrends = useMemo(
    () => computeSeasonTrends(seasonsList, fullMatches, playerMatchStats),
    [seasonsList, fullMatches, playerMatchStats]
  );

  const streaks = useMemo(() => computeStreaks(fullMatches), [fullMatches]);

  const opponentData = useMemo(() => computeOpponentH2H(fullMatches), [fullMatches]);

  const filteredOpponents = useMemo(() => {
    const q = opponentSearch.trim().toLowerCase();
    const list = q
      ? opponentData.rows.filter(r => r.opponent.toLowerCase().includes(q))
      : opponentData.rows;

    return [...list].sort((a, b) => {
      if (opponentSort === 'gp') return b.gp - a.gp || b.wins - a.wins;
      if (opponentSort === 'winRate') return b.winRate - a.winRate || b.gp - a.gp;
      if (opponentSort === 'wins') return b.wins - a.wins || b.gd - a.gd;
      if (opponentSort === 'losses') return b.losses - a.losses || a.gd - b.gd;
      return b.gd - a.gd || b.gf - a.gf;
    });
  }, [opponentData.rows, opponentSearch, opponentSort]);

  const clubRecords = useMemo(
    () => computeClubRecordsVault(fullPlayers, fullMatches, playerMatchStats, roster, seasonsList),
    [fullPlayers, fullMatches, playerMatchStats, roster, seasonsList]
  );

  const handleEfficiencySort = (key: EfficiencySortKey) => {
    if (efficiencySort === key) {
      setEfficiencySortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setEfficiencySort(key);
      setEfficiencySortDir('desc');
    }
  };

  const showAttacking = activeCategory === 'all' || activeCategory === 'attacking';
  const showDefending = activeCategory === 'all' || activeCategory === 'defending';
  const showEfficiency = activeCategory === 'all' || activeCategory === 'efficiency';
  const showGoalkeeping = activeCategory === 'all' || activeCategory === 'goalkeeping';

  // Quick Efficiency Callouts (Lucky Charm + Clinical Finisher)
  const luckyCharm = useMemo(() => {
    const qualified = efficiencyData.rows.filter(
      r => r.matchesPlayed >= minGamesThreshold && r.winRateDelta !== null
    );
    return [...qualified].sort(
      (a, b) => (b.winRateDelta ?? -999) - (a.winRateDelta ?? -999) || b.matchesPlayed - a.matchesPlayed
    )[0];
  }, [efficiencyData.rows, minGamesThreshold]);

  const clinicalFinisher = useMemo(() => {
    const qualified = efficiencyData.rows.filter(r => r.sot >= 3 && r.conversionRate !== null);
    const pool = qualified.length > 0 ? qualified : efficiencyData.rows.filter(r => r.sot > 0);
    return [...pool].sort(
      (a, b) => (b.conversionRate ?? 0) - (a.conversionRate ?? 0) || b.goals - a.goals
    )[0];
  }, [efficiencyData.rows]);

  const isSeasonScope = activeSubTab === 'leaders';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header + Sub-Tab Navigation + Contextual Campaign Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-toasty-border pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
            Club Analytics
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
            Statistics &amp; Records
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            Campaign leaderboards, player efficiency splits, multi-season trends, rivalries, and club records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Primary 3-Tab Switcher */}
          <div className="bg-toasty-subtle border border-toasty-border p-1 rounded-lg flex">
            {(
              [
                { id: 'leaders', label: 'Season Leaders' },
                { id: 'trends', label: 'Trends & Rivalries' },
                { id: 'records', label: 'Club Records' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                id={`stats-subtab-${tab.id}`}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-toasty-obsidian text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Season Dropdown (scoped to Season Leaders) */}
          {isSeasonScope && seasons && activeSeason && onSeasonChange && (
            <div className="flex items-center gap-2 bg-white border border-toasty-border rounded-lg px-3 py-2">
              <CalendarDays size={14} className="text-toasty-red shrink-0" />
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
                Season
              </span>
              <select
                value={activeSeason}
                onChange={e => onSeasonChange(e.target.value)}
                id="stats-season-selector"
                className="bg-transparent text-zinc-900 font-semibold text-xs focus:outline-none cursor-pointer pr-1 flex-1"
              >
                {seasons.map(season => (
                  <option key={season} value={season} className="text-zinc-900 font-sans">
                    {season === 'All Seasons' ? 'All-Time Records' : season}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* UNIFIED OBSIDIAN HERO STAGE (Matches Home & Matches Visual Identity) */}
      <section className="bg-toasty-obsidian text-white rounded-xl border border-toasty-obsidian-border overflow-hidden">
        {isSeasonScope ? (
          <div>
            {/* Top Campaign Metadata Bar */}
            <div className="px-6 py-5 sm:px-8 border-b border-toasty-obsidian-border flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                  <span className="text-toasty-tan font-semibold">Campaign Ledger</span>
                  {activeSeasonObj?.division && (
                    <>
                      <span>·</span>
                      <span className="text-zinc-300">{activeSeasonObj.division}</span>
                    </>
                  )}
                  {activeSeasonObj?.startDate && (
                    <>
                      <span>·</span>
                      <span className="tabular-nums">
                        {formatShortDate(activeSeasonObj.startDate)}
                        {activeSeasonObj.endDate
                          ? ` – ${formatShortDate(activeSeasonObj.endDate)}`
                          : ''}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white leading-none">
                  {activeSeason === 'All Seasons' ? 'All-Time Club Totals' : activeSeason}
                </h2>
                {activeSeasonObj?.overview && (
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-0.5">
                    {activeSeasonObj.overview}
                  </p>
                )}
              </div>

              <div className="text-xs font-mono text-zinc-400 shrink-0 tabular-nums">
                <strong className="text-white">{completedMatches.length}</strong> Completed Fixtures
              </div>
            </div>

            {/* 4-Column Obsidian KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-toasty-obsidian-border">
              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                  Record &amp; Win Rate
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums leading-none">
                    {wins}-{draws}-{losses}
                  </span>
                  <span className="text-xs font-mono font-bold text-toasty-tan tabular-nums">
                    {winRate}%
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500 mt-1.5 block tabular-nums">
                  {wins}W · {draws}D · {losses}L
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                  Goals &amp; Differential
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums leading-none">
                    {teamGoalsScored}:{teamGoalsConceded}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold tabular-nums ${
                      teamGoalDifference > 0
                        ? 'text-emerald-400'
                        : teamGoalDifference < 0
                          ? 'text-red-400'
                          : 'text-zinc-400'
                    }`}
                  >
                    {teamGoalDifference > 0 ? `+${teamGoalDifference}` : teamGoalDifference} GD
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500 mt-1.5 block tabular-nums">
                  {completedMatches.length > 0
                    ? `${(teamGoalsScored / completedMatches.length).toFixed(1)} GF/G · ${totalGoals} logged`
                    : 'No fixtures completed'}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                  Shooting Precision
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-toasty-tan tabular-nums leading-none">
                    {overallSOTRate}%
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">SOT Rate</span>
                </div>
                <span className="text-xs font-mono text-zinc-500 mt-1.5 block tabular-nums">
                  {totalSOT} on target / {totalShots} total shots
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                    Recent Form
                  </span>
                  <span className="text-[10px] font-mono text-toasty-tan tabular-nums">
                    {cleanSheetsCount} Shutouts
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {lastMatches.length > 0 ? (
                    lastMatches.map(m => {
                      const isWin = (m.toastyScore ?? 0) > (m.opponentScore ?? 0);
                      const isDraw = (m.toastyScore ?? 0) === (m.opponentScore ?? 0);
                      const text = isWin ? 'W' : isDraw ? 'D' : 'L';
                      return (
                        <span
                          key={m.id}
                          title={`${text} vs ${m.opponent} (${m.toastyScore}-${m.opponentScore})`}
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[11px] font-bold ${
                            isWin
                              ? 'bg-toasty-red text-white'
                              : isDraw
                                ? 'bg-toasty-tan text-toasty-obsidian'
                                : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {text}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs font-mono text-zinc-500">No completed games</span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-2 block">
                  Last {lastMatches.length} fixtures
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* All-Time Club Vault Hero Banner (for Trends & Rivalries + Club Records) */
          <div>
            <div className="px-6 py-5 sm:px-8 border-b border-toasty-obsidian-border flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
                  {activeSubTab === 'trends'
                    ? 'Multi-Season Trajectory & Rivalries'
                    : 'Permanent Club Archive'}
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white leading-none mt-1">
                  {activeSubTab === 'trends'
                    ? 'Toasty FC Through The Seasons'
                    : 'All-Time Club Record Book'}
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400 tabular-nums">
                {clubRecords.totals.seasonsCount} Campaigns · {clubRecords.totals.totalMatches}{' '}
                Matches Logged
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-toasty-obsidian-border">
              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                  All-Time Record
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums leading-none">
                    {clubRecords.totals.wins}-{clubRecords.totals.draws}-{clubRecords.totals.losses}
                  </span>
                  <span className="text-xs font-mono font-bold text-toasty-tan tabular-nums">
                    {clubRecords.totals.winRate}%
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500 mt-1.5 block tabular-nums">
                  {clubRecords.totals.totalMatches} completed fixtures
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                  All-Time Goals
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums leading-none">
                    {clubRecords.totals.gf}:{clubRecords.totals.ga}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold tabular-nums ${
                      clubRecords.totals.gd > 0
                        ? 'text-emerald-400'
                        : clubRecords.totals.gd < 0
                          ? 'text-red-400'
                          : 'text-zinc-400'
                    }`}
                  >
                    {clubRecords.totals.gd > 0
                      ? `+${clubRecords.totals.gd}`
                      : clubRecords.totals.gd}{' '}
                    GD
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500 mt-1.5 block tabular-nums">
                  {clubRecords.totals.totalMatches > 0
                    ? `${(clubRecords.totals.gf / clubRecords.totals.totalMatches).toFixed(2)} goals / match`
                    : '—'}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                  Unique Opponents
                </span>
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-toasty-tan tabular-nums leading-none mt-1.5">
                  {opponentData.rows.length}
                </div>
                <span className="text-xs font-mono text-zinc-500 mt-1.5 block">
                  {opponentData.mostPlayed
                    ? `Most played: ${opponentData.mostPlayed.opponent} (${opponentData.mostPlayed.gp})`
                    : 'Across Bowling Green'}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                  Shutouts &amp; Hat-Tricks
                </span>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums leading-none">
                    {clubRecords.totals.shutouts}
                  </span>
                  <span className="text-xs font-mono text-toasty-tan tabular-nums">
                    · {clubRecords.hatTricks.length} Hat-Tricks
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500 mt-1.5 block">
                  Clean sheets kept all-time
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: SEASON LEADERS & PLAYER EFFICIENCY SPLITS                  */}
      {/* ===================================================================== */}
      {activeSubTab === 'leaders' && (
        <div className="space-y-8">
          {/* Category Segmented Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 bg-toasty-subtle border border-toasty-border p-1 rounded-lg text-xs">
              {(
                [
                  { id: 'all', label: 'All Categories' },
                  { id: 'attacking', label: 'Attacking' },
                  { id: 'defending', label: 'Defending & Impact' },
                  { id: 'efficiency', label: 'Efficiency & Splits' },
                  ...(goalkeeper ? [{ id: 'goalkeeping' as const, label: 'Goalkeeping' }] : [])
                ] as const
              ).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-toasty-obsidian text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider hidden sm:inline">
              Top 5 Leaderboards
            </span>
          </div>

          {/* Uniform Matchday Editorial Top-5 Leaderboards Grid */}
          {(showAttacking || showDefending || showGoalkeeping) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Golden Boot */}
              {showAttacking && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                          Attacking
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Golden Boot
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">Goals</span>
                    </div>

                    <div className="space-y-3.5">
                      {scorers.map((player, index) => (
                        <div key={player.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 text-center font-mono font-bold shrink-0 ${
                                  index === 0 ? 'text-toasty-red' : 'text-zinc-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {player.name}
                              </span>
                              {player.number !== undefined && player.number > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  #{player.number}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-toasty-red shrink-0 ml-2 tabular-nums">
                              {player.goals}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">G</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-toasty-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-toasty-red' : 'bg-zinc-800'
                              }`}
                              style={{ width: `${((player.goals ?? 0) / maxGoals) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {scorers.length === 0 && (
                        <p className="text-zinc-400 text-xs py-6 text-center">No goals recorded</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center tabular-nums">
                    <span>Top Scorers</span>
                    <span className="font-semibold text-zinc-900">{totalGoals} team goals</span>
                  </div>
                </div>
              )}

              {/* 2. Playmaker */}
              {showAttacking && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
                          Creation
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Playmaker
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">Assists</span>
                    </div>

                    <div className="space-y-3.5">
                      {playmakers.map((player, index) => (
                        <div key={player.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 text-center font-mono font-bold shrink-0 ${
                                  index === 0 ? 'text-toasty-tan-dark' : 'text-zinc-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {player.name}
                              </span>
                              {player.number !== undefined && player.number > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  #{player.number}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-toasty-tan-dark shrink-0 ml-2 tabular-nums">
                              {player.assists}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">A</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-toasty-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-toasty-tan-dark' : 'bg-toasty-tan'
                              }`}
                              style={{ width: `${((player.assists ?? 0) / maxAssists) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {playmakers.length === 0 && (
                        <p className="text-zinc-400 text-xs py-6 text-center">
                          No assists recorded
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center tabular-nums">
                    <span>Goal Creation</span>
                    <span className="font-semibold text-zinc-900">
                      {totalAssists} team assists
                    </span>
                  </div>
                </div>
              )}

              {/* 3. Shot Leader (Total Shots = Shots + SOT) */}
              {showAttacking && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                          Volume &amp; Accuracy
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Shot Leader
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">
                        Shots + SOT
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {shotLeaders.map((player, index) => (
                        <div key={player.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 text-center font-mono font-bold shrink-0 ${
                                  index === 0 ? 'text-toasty-red' : 'text-zinc-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {player.name}
                              </span>
                              {player.number !== undefined && player.number > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  #{player.number}
                                </span>
                              )}
                            </div>
                            <div className="text-right shrink-0 ml-2 font-mono tabular-nums">
                              <span className="font-bold text-zinc-900">{player.totalShots}</span>
                              <span className="text-zinc-500 text-[10px] ml-1">
                                ({player.sot} SOT · {player.sotRate}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-toasty-subtle rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-toasty-red"
                              style={{ width: `${(player.sot / maxShots) * 100}%` }}
                              title={`${player.sot} shots on target`}
                            />
                            <div
                              className="h-full bg-toasty-tan"
                              style={{ width: `${(player.shots / maxShots) * 100}%` }}
                              title={`${player.shots} shots off target`}
                            />
                          </div>
                        </div>
                      ))}
                      {shotLeaders.length === 0 && (
                        <p className="text-zinc-400 text-xs py-6 text-center">No shots recorded</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center tabular-nums">
                    <span className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-zinc-700">
                        <span className="w-2 h-2 rounded-xs bg-toasty-red" /> On Target
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-500">
                        <span className="w-2 h-2 rounded-xs bg-toasty-tan" /> Off
                      </span>
                    </span>
                    <span className="font-semibold text-zinc-900">{totalShots} total</span>
                  </div>
                </div>
              )}

              {/* 4. Block Leader (Outfield Non-GK) */}
              {showDefending && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 font-semibold block">
                          Outfield Defense
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Block Leader
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">Non-GK</span>
                    </div>

                    <div className="space-y-3.5">
                      {blockLeaders.map((player, index) => (
                        <div key={player.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 text-center font-mono font-bold shrink-0 ${
                                  index === 0 ? 'text-toasty-obsidian' : 'text-zinc-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {player.name}
                              </span>
                              {player.number !== undefined && player.number > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  #{player.number}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-zinc-900 shrink-0 ml-2 tabular-nums">
                              {player.blocks}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">Blk</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-toasty-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-toasty-obsidian' : 'bg-zinc-500'
                              }`}
                              style={{ width: `${(player.blocks / maxBlocks) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {blockLeaders.length === 0 && (
                        <p className="text-zinc-400 text-xs py-6 text-center">
                          No outfield blocks recorded
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center">
                    <span>Shot Blocks</span>
                    <span>Excludes Goalkeepers</span>
                  </div>
                </div>
              )}

              {/* 5. Foul Leader */}
              {showDefending && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 font-semibold block">
                          Discipline
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Foul Leader
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">
                        Fouls &amp; Cards
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {foulLeaders.map((player, index) => (
                        <div key={player.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 text-center font-mono font-bold shrink-0 ${
                                  index === 0 ? 'text-toasty-red' : 'text-zinc-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {player.name}
                              </span>
                              {player.number !== undefined && player.number > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  #{player.number}
                                </span>
                              )}
                            </div>
                            <div className="font-mono shrink-0 ml-2 flex items-center gap-2 tabular-nums">
                              <span className="font-bold text-zinc-900">
                                {player.fouls}{' '}
                                <span className="text-[10px] text-zinc-400 font-normal">F</span>
                              </span>
                              {player.yellows > 0 && (
                                <span className="text-amber-700 text-[10px] font-bold">
                                  {player.yellows}Y
                                </span>
                              )}
                              {player.reds > 0 && (
                                <span className="text-toasty-red text-[10px] font-bold">
                                  {player.reds}R
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-toasty-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-toasty-red' : 'bg-zinc-600'
                              }`}
                              style={{ width: `${(player.fouls / maxFouls) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {foulLeaders.length === 0 && (
                        <p className="text-zinc-400 text-xs py-6 text-center">No fouls recorded</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center">
                    <span>Physicality Ledger</span>
                    <span>Y = Yellow · R = Red</span>
                  </div>
                </div>
              )}

              {/* 6. Player of the Match */}
              {showDefending && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
                          Match Honors
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Player of the Match
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">POTM</span>
                    </div>

                    <div className="space-y-3.5">
                      {potmLeaders.map((player, index) => (
                        <div key={player.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 text-center font-mono font-bold shrink-0 ${
                                  index === 0 ? 'text-toasty-red' : 'text-zinc-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {player.name}
                              </span>
                              {player.number !== undefined && player.number > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  #{player.number}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-zinc-900 shrink-0 ml-2 inline-flex items-center gap-1 tabular-nums">
                              <Star size={11} className="text-toasty-red fill-toasty-red" />
                              {player.potm}x
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-toasty-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-toasty-red' : 'bg-toasty-tan-dark'
                              }`}
                              style={{ width: `${(player.potm / maxPotm) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {potmLeaders.length === 0 && (
                        <p className="text-zinc-400 text-xs py-6 text-center">No POTM awards yet</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center">
                    <span>Standout Performers</span>
                    <span>Squad Voted</span>
                  </div>
                </div>
              )}

              {/* 7. Net Impact (+/-) */}
              {showDefending && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 font-semibold block">
                          On-Court Differential
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Net Impact (+/-)
                        </h3>
                      </div>

                      <div className="flex items-center bg-toasty-subtle border border-toasty-border p-0.5 rounded-md text-[10px] font-mono shrink-0">
                        <button
                          type="button"
                          onClick={() => setImpactView('highest')}
                          className={`px-2 py-0.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                            impactView === 'highest'
                              ? 'bg-toasty-obsidian text-white'
                              : 'text-zinc-500 hover:text-zinc-900'
                          }`}
                        >
                          High +
                        </button>
                        <button
                          type="button"
                          onClick={() => setImpactView('lowest')}
                          className={`px-2 py-0.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                            impactView === 'lowest'
                              ? 'bg-toasty-red text-white'
                              : 'text-zinc-500 hover:text-toasty-red'
                          }`}
                        >
                          Low -
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {activeImpactList.map((player, index) => (
                        <div key={player.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 text-center font-mono font-bold shrink-0 ${
                                  index === 0 ? 'text-zinc-900' : 'text-zinc-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {player.name}
                              </span>
                              {player.number !== undefined && player.number > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  #{player.number}
                                </span>
                              )}
                            </div>
                            <span
                              className={`font-mono font-bold shrink-0 ml-2 tabular-nums ${
                                player.plusMinus > 0
                                  ? 'text-emerald-700'
                                  : player.plusMinus < 0
                                    ? 'text-toasty-red'
                                    : 'text-zinc-500'
                              }`}
                            >
                              {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-toasty-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                player.plusMinus >= 0 ? 'bg-emerald-600' : 'bg-toasty-red'
                              }`}
                              style={{
                                width: `${Math.max(
                                  10,
                                  (Math.abs(player.plusMinus) / maxImpactVal) * 100
                                )}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {activeImpactList.length === 0 && (
                        <p className="text-zinc-400 text-xs py-6 text-center">No impact records</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center">
                    <span>(+) for · (-) against</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-zinc-700">
                      {impactView === 'highest' ? (
                        <>
                          <TrendingUp size={12} className="text-emerald-600" /> Top 5
                        </>
                      ) : (
                        <>
                          <TrendingDown size={12} className="text-toasty-red" /> Bottom 5
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* 8. Goalkeeping Ledger */}
              {showGoalkeeping && goalkeeper && (
                <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-toasty-border">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
                          Between The Posts
                        </span>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wide text-zinc-900 leading-none mt-0.5">
                          Goalkeeping
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 truncate">
                        {goalkeeper.name}
                        {goalkeeper.number ? ` · #${goalkeeper.number}` : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 border border-toasty-border rounded-lg overflow-hidden divide-x divide-y divide-toasty-border text-center font-mono tabular-nums">
                      <div className="p-4 bg-toasty-subtle/40">
                        <span className="text-[10px] text-zinc-500 uppercase block">Saves</span>
                        <strong className="font-display font-extrabold text-3xl text-zinc-900 block mt-1 leading-none">
                          {savesCount}
                        </strong>
                      </div>
                      <div className="p-4 bg-toasty-subtle/40">
                        <span className="text-[10px] text-zinc-500 uppercase block">Allowed</span>
                        <strong className="font-display font-extrabold text-3xl text-toasty-red block mt-1 leading-none">
                          {goalsAllowedCount}
                        </strong>
                      </div>
                      <div className="p-4 bg-white">
                        <span className="text-[10px] text-zinc-500 uppercase block">Save %</span>
                        <strong className="font-display font-extrabold text-3xl text-emerald-700 block mt-1 leading-none">
                          {savePercentage}%
                        </strong>
                      </div>
                      <div className="p-4 bg-white">
                        <span className="text-[10px] text-zinc-500 uppercase block">
                          Clean Sheets
                        </span>
                        <strong className="font-display font-extrabold text-3xl text-toasty-tan-dark block mt-1 leading-none">
                          {cleanSheetsCount}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 mt-5 border-t border-toasty-border text-[11px] font-mono text-zinc-500 flex justify-between items-center tabular-nums">
                    <span>Net Shot Stopping</span>
                    <span className="font-semibold text-zinc-900">
                      {totalShotsFaced} shots faced
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NEW MODULE: PLAYER EFFICIENCY & WIN-RATE IMPACT SPLITS */}
          {showEfficiency && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-toasty-border pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                    Advanced Splits
                  </span>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                    Player Efficiency &amp; Win-Rate Impact
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Per-game output, clinical finishing, attendance, and how the team performs when each player is on the court (Club Baseline:{' '}
                    <span className="font-mono font-semibold text-zinc-800">
                      {efficiencyData.baselineWinRate}% Win Rate
                    </span>
                    ).
                  </p>
                </div>

                {/* Min Games Qualification Toggle */}
                <div className="flex items-center bg-toasty-subtle border border-toasty-border p-1 rounded-lg text-xs shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMinGamesOnly(true)}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      minGamesOnly
                        ? 'bg-toasty-obsidian text-white'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Min. {minGamesThreshold} GP
                  </button>
                  <button
                    type="button"
                    onClick={() => setMinGamesOnly(false)}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      !minGamesOnly
                        ? 'bg-toasty-obsidian text-white'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    All Players
                  </button>
                </div>
              </div>

              {/* Spotlight Duo: Lucky Charm & Clinical Finisher */}
              {(luckyCharm || clinicalFinisher) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {luckyCharm && luckyCharm.winRateWithPlayer !== null && (
                    <div className="bg-toasty-obsidian text-white border border-toasty-obsidian-border rounded-xl p-5 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan block">
                          Lucky Charm · Highest Win-Rate Lift
                        </span>
                        <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide text-white truncate leading-none">
                          {luckyCharm.name}
                        </h3>
                        <p className="text-xs font-mono text-zinc-400 tabular-nums">
                          {luckyCharm.teamWinsWithPlayer}W-{luckyCharm.teamDrawsWithPlayer}D-
                          {luckyCharm.teamLossesWithPlayer}L when playing ({luckyCharm.winRateWithPlayer}
                          % Win Rate)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-display font-extrabold text-3xl sm:text-4xl tabular-nums leading-none ${
                            (luckyCharm.winRateDelta ?? 0) >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {(luckyCharm.winRateDelta ?? 0) > 0
                            ? `+${luckyCharm.winRateDelta}%`
                            : `${luckyCharm.winRateDelta}%`}
                        </span>
                        <span className="block text-[10px] font-mono uppercase text-zinc-500 mt-1">
                          vs Club Avg
                        </span>
                      </div>
                    </div>
                  )}

                  {clinicalFinisher && clinicalFinisher.conversionRate !== null && (
                    <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                          Most Clinical · Goals Per Shot On Target
                        </span>
                        <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide text-zinc-900 truncate leading-none">
                          {clinicalFinisher.name}
                        </h3>
                        <p className="text-xs font-mono text-zinc-500 tabular-nums">
                          {clinicalFinisher.goals} goals from {clinicalFinisher.sot} SOT (
                          {clinicalFinisher.totalShots} total shots)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-display font-extrabold text-3xl sm:text-4xl text-toasty-red tabular-nums leading-none">
                          {clinicalFinisher.conversionRate}%
                        </span>
                        <span className="block text-[10px] font-mono uppercase text-zinc-400 mt-1">
                          Conversion
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sortable Efficiency Ledger Table */}
              <div className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
                {sortedEfficiencyRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-toasty-subtle border-b border-toasty-border font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                          <th className="px-4 py-3 font-semibold">Player</th>
                          {(
                            [
                              { key: 'matchesPlayed', label: 'GP' },
                              { key: 'attendancePct', label: 'Attend %' },
                              { key: 'gaPerGame', label: 'G+A / G' },
                              { key: 'shotAccuracy', label: 'SOT %' },
                              { key: 'conversionRate', label: 'Conv %' },
                              { key: 'winRateWithPlayer', label: 'Team Win %' },
                              { key: 'winRateDelta', label: 'Win Lift' }
                            ] as { key: EfficiencySortKey; label: string }[]
                          ).map(col => (
                            <th key={col.key} className="px-3 py-3 text-right font-semibold">
                              <button
                                type="button"
                                onClick={() => handleEfficiencySort(col.key)}
                                className={`inline-flex items-center gap-1 uppercase cursor-pointer hover:text-zinc-900 transition-colors ${
                                  efficiencySort === col.key ? 'text-toasty-red font-bold' : ''
                                }`}
                              >
                                {col.label}
                                <ArrowUpDown size={10} />
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-toasty-border tabular-nums">
                        {sortedEfficiencyRows.map((row: PlayerEfficiencyRow) => (
                          <tr
                            key={row.playerId}
                            className="hover:bg-toasty-subtle/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {row.number !== undefined && row.number > 0 && (
                                  <span className="text-[10px] font-mono text-zinc-400 w-6">
                                    #{row.number}
                                  </span>
                                )}
                                <span>{row.name}</span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  · {row.goals}G {row.assists}A
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-zinc-700">
                              {row.matchesPlayed}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-zinc-600">
                              {row.attendancePct}%
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-bold text-zinc-900">
                              {row.gaPerGame.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-zinc-700">
                              {row.shotAccuracy !== null ? `${row.shotAccuracy}%` : '—'}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-zinc-700">
                              {row.conversionRate !== null ? `${row.conversionRate}%` : '—'}
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-semibold text-zinc-900">
                              {row.winRateWithPlayer !== null ? (
                                <span
                                  title={`${row.teamWinsWithPlayer}W-${row.teamDrawsWithPlayer}D-${row.teamLossesWithPlayer}L`}
                                >
                                  {row.winRateWithPlayer}%
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td
                              className={`px-3 py-3 text-right font-mono font-bold ${
                                row.winRateDelta === null
                                  ? 'text-zinc-400'
                                  : row.winRateDelta > 0
                                    ? 'text-emerald-700'
                                    : row.winRateDelta < 0
                                      ? 'text-toasty-red'
                                      : 'text-zinc-500'
                              }`}
                            >
                              {row.winRateDelta === null
                                ? '—'
                                : row.winRateDelta > 0
                                  ? `+${row.winRateDelta}%`
                                  : `${row.winRateDelta}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-xs text-zinc-500">
                    No player appearances logged for this campaign yet.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: TRENDS & RIVALRIES (MULTI-SEASON & HEAD-TO-HEAD)           */}
      {/* ===================================================================== */}
      {activeSubTab === 'trends' && (
        <div className="space-y-10">
          {/* 1. Season-over-Season Progression Chart */}
          <section className="bg-toasty-surface border border-toasty-border rounded-xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-toasty-border pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                  Campaign Progression
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                  Season-by-Season Trajectory
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {chartMetric === 'perGame'
                    ? 'Goals For vs. Goals Against per match alongside campaign Win Rate %.'
                    : 'Total Goals Scored vs. Goals Conceded alongside campaign Win Rate %.'}
                </p>
              </div>

              <div className="flex items-center bg-toasty-subtle border border-toasty-border p-1 rounded-lg text-xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartMetric('perGame')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    chartMetric === 'perGame'
                      ? 'bg-toasty-obsidian text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Per Game
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('totals')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    chartMetric === 'totals'
                      ? 'bg-toasty-obsidian text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Season Totals
                </button>
              </div>
            </div>

            {seasonTrends.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={seasonTrends}
                      margin={{ top: 10, right: 12, left: -12, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DF" vertical={false} />
                      <XAxis
                        dataKey="shortLabel"
                        tick={{ fontSize: 11, fill: '#52525B', fontFamily: 'JetBrains Mono' }}
                        axisLine={{ stroke: '#E6E4DF' }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="goals"
                        tick={{ fontSize: 11, fill: '#52525B', fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="rate"
                        orientation="right"
                        domain={[0, 100]}
                        tickFormatter={v => `${v}%`}
                        tick={{ fontSize: 11, fill: '#7A674A', fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<MatchdayChartTooltip />} />
                      <Bar
                        yAxisId="goals"
                        dataKey={chartMetric === 'perGame' ? 'gfPerGame' : 'gf'}
                        name={chartMetric === 'perGame' ? 'Goals For / G' : 'Goals For'}
                        fill="#AA0000"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={32}
                      />
                      <Bar
                        yAxisId="goals"
                        dataKey={chartMetric === 'perGame' ? 'gaPerGame' : 'ga'}
                        name={chartMetric === 'perGame' ? 'Goals Against / G' : 'Goals Against'}
                        fill="#CABBA2"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={32}
                      />
                      <Line
                        yAxisId="rate"
                        type="monotone"
                        dataKey="winRate"
                        name="Win Rate"
                        stroke="#0D0D0F"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0D0D0F', stroke: '#FAF9F6', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#AA0000' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-5 text-[11px] font-mono text-zinc-500 pt-2 border-t border-toasty-border">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-toasty-red" />
                    {chartMetric === 'perGame' ? 'GF / Game' : 'Goals For'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-toasty-tan" />
                    {chartMetric === 'perGame' ? 'GA / Game' : 'Goals Against'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-toasty-obsidian" />
                    Win Rate (%)
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-zinc-500">
                Completed multi-season fixtures are needed to render progression trends.
              </p>
            )}
          </section>

          {/* 2. Obsidian Streaks & Momentum Strip */}
          <section className="bg-toasty-obsidian text-white rounded-xl border border-toasty-obsidian-border overflow-hidden">
            <div className="px-6 py-4 border-b border-toasty-obsidian-border flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold">
                Club Streaks &amp; Momentum
              </span>
              <span className="text-[11px] font-mono text-zinc-500">All-Time Chronological</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-toasty-obsidian-border">
              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                  Longest Win Streak
                </span>
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums mt-1.5 leading-none">
                  {streaks.longestWinStreak.count}{' '}
                  <span className="text-sm font-mono font-normal text-toasty-tan">Wins</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-2 block tabular-nums">
                  {streaks.longestWinStreak.startDate
                    ? `${formatShortDate(streaks.longestWinStreak.startDate)} – ${formatShortDate(
                        streaks.longestWinStreak.endDate
                      )}`
                    : streaks.longestWinStreak.label}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                  Longest Unbeaten Run
                </span>
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-toasty-tan tabular-nums mt-1.5 leading-none">
                  {streaks.longestUnbeatenStreak.count}{' '}
                  <span className="text-sm font-mono font-normal text-zinc-400">Matches</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-2 block tabular-nums">
                  {streaks.longestUnbeatenStreak.startDate
                    ? `${formatShortDate(
                        streaks.longestUnbeatenStreak.startDate
                      )} – ${formatShortDate(streaks.longestUnbeatenStreak.endDate)}`
                    : streaks.longestUnbeatenStreak.label}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                  Consecutive Scoring
                </span>
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums mt-1.5 leading-none">
                  {streaks.longestScoringStreak.count}{' '}
                  <span className="text-sm font-mono font-normal text-zinc-400">Matches</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-2 block tabular-nums">
                  {streaks.longestScoringStreak.startDate
                    ? `${formatShortDate(
                        streaks.longestScoringStreak.startDate
                      )} – ${formatShortDate(streaks.longestScoringStreak.endDate)}`
                    : streaks.longestScoringStreak.label}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                  Current Active Run
                </span>
                <div
                  className={`font-display font-extrabold text-3xl sm:text-4xl tabular-nums mt-1.5 leading-none ${
                    streaks.activeStreak.type === 'Win'
                      ? 'text-emerald-400'
                      : streaks.activeStreak.type === 'Loss'
                        ? 'text-red-400'
                        : 'text-toasty-tan'
                  }`}
                >
                  {streaks.activeStreak.detail}
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-2 block">
                  Heading into next fixture
                </span>
              </div>
            </div>
          </section>

          {/* 3. Season-by-Season Ledger Table */}
          {seasonTrends.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-end justify-between border-b border-toasty-border pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
                    Campaign Archive
                  </span>
                  <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                    Season-by-Season Ledger
                  </h3>
                </div>
              </div>

              <div className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-toasty-subtle border-b border-toasty-border font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        <th className="px-4 py-3 font-semibold">Campaign</th>
                        <th className="px-3 py-3 font-semibold">Division</th>
                        <th className="px-3 py-3 text-right font-semibold">GP</th>
                        <th className="px-3 py-3 text-right font-semibold">W-D-L</th>
                        <th className="px-3 py-3 text-right font-semibold">Win %</th>
                        <th className="px-3 py-3 text-right font-semibold">GF:GA</th>
                        <th className="px-3 py-3 text-right font-semibold">GD</th>
                        <th className="px-3 py-3 text-right font-semibold">CS</th>
                        <th className="px-4 py-3 font-semibold">Top Scorer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-toasty-border tabular-nums">
                      {[...seasonTrends].reverse().map(s => (
                        <tr
                          key={s.seasonId}
                          className="hover:bg-toasty-subtle/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                            {s.seasonName}
                          </td>
                          <td className="px-3 py-3 font-mono text-zinc-500 whitespace-nowrap">
                            {s.division || '—'}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-zinc-700">{s.gp}</td>
                          <td className="px-3 py-3 text-right font-mono font-semibold text-zinc-900">
                            {s.wins}-{s.draws}-{s.losses}
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-toasty-tan-dark">
                            {s.winRate}%
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-zinc-700">
                            {s.gf}:{s.ga}
                          </td>
                          <td
                            className={`px-3 py-3 text-right font-mono font-bold ${
                              s.gd > 0
                                ? 'text-emerald-700'
                                : s.gd < 0
                                  ? 'text-toasty-red'
                                  : 'text-zinc-500'
                            }`}
                          >
                            {s.gd > 0 ? `+${s.gd}` : s.gd}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-zinc-600">
                            {s.shutouts}
                          </td>
                          <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
                            {s.topScorerName ? (
                              <span>
                                {s.topScorerName}{' '}
                                <span className="font-mono text-toasty-red font-semibold">
                                  ({s.topScorerGoals})
                                </span>
                              </span>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 4. Rivalries & Head-to-Head Opponent History */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-toasty-border pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                  Head-to-Head Vault
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                  Opponent Rivalries
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    value={opponentSearch}
                    onChange={e => setOpponentSearch(e.target.value)}
                    placeholder="Filter opponents..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-toasty-border rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 w-full sm:w-48"
                  />
                </div>
                <select
                  value={opponentSort}
                  onChange={e => setOpponentSort(e.target.value as OpponentSortKey)}
                  className="bg-white border border-toasty-border rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none cursor-pointer"
                >
                  <option value="gp">Sort: Most Played</option>
                  <option value="wins">Sort: Most Wins</option>
                  <option value="losses">Sort: Most Losses</option>
                  <option value="winRate">Sort: Win %</option>
                  <option value="gd">Sort: Goal Diff</option>
                </select>
              </div>
            </div>

            {/* Rivalry Spotlights (3-Column Hairline Strip) */}
            {(opponentData.nemesis || opponentData.favoriteOpponent || opponentData.mostPlayed) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {opponentData.nemesis && (
                  <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                      Biggest Nemesis
                    </span>
                    <h4 className="font-display font-extrabold text-2xl uppercase tracking-wide text-zinc-900 leading-none truncate">
                      {opponentData.nemesis.opponent}
                    </h4>
                    <p className="text-xs font-mono text-zinc-600 tabular-nums pt-1">
                      {opponentData.nemesis.wins}W-{opponentData.nemesis.draws}D-
                      {opponentData.nemesis.losses}L · {opponentData.nemesis.winRate}% Win Rate (
                      {opponentData.nemesis.gd > 0
                        ? `+${opponentData.nemesis.gd}`
                        : opponentData.nemesis.gd}{' '}
                      GD)
                    </p>
                  </div>
                )}

                {opponentData.favoriteOpponent && (
                  <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-700 font-semibold block">
                      Favorite Opponent
                    </span>
                    <h4 className="font-display font-extrabold text-2xl uppercase tracking-wide text-zinc-900 leading-none truncate">
                      {opponentData.favoriteOpponent.opponent}
                    </h4>
                    <p className="text-xs font-mono text-zinc-600 tabular-nums pt-1">
                      {opponentData.favoriteOpponent.wins}W-{opponentData.favoriteOpponent.draws}D-
                      {opponentData.favoriteOpponent.losses}L ·{' '}
                      {opponentData.favoriteOpponent.winRate}% Win Rate (
                      {opponentData.favoriteOpponent.gd > 0
                        ? `+${opponentData.favoriteOpponent.gd}`
                        : opponentData.favoriteOpponent.gd}{' '}
                      GD)
                    </p>
                  </div>
                )}

                {opponentData.mostPlayed && (
                  <div className="bg-toasty-surface border border-toasty-border rounded-xl p-5 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
                      Most Frequent Rival
                    </span>
                    <h4 className="font-display font-extrabold text-2xl uppercase tracking-wide text-zinc-900 leading-none truncate">
                      {opponentData.mostPlayed.opponent}
                    </h4>
                    <p className="text-xs font-mono text-zinc-600 tabular-nums pt-1">
                      {opponentData.mostPlayed.gp} Meetings · {opponentData.mostPlayed.wins}W-
                      {opponentData.mostPlayed.draws}D-{opponentData.mostPlayed.losses}L (
                      {opponentData.mostPlayed.gf}:{opponentData.mostPlayed.ga})
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* All-Time Opponent Head-to-Head Table */}
            <div className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
              {filteredOpponents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-toasty-subtle border-b border-toasty-border font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        <th className="px-4 py-3 font-semibold">Opponent</th>
                        <th className="px-3 py-3 text-right font-semibold">GP</th>
                        <th className="px-3 py-3 text-right font-semibold">W-D-L</th>
                        <th className="px-3 py-3 text-right font-semibold">Win %</th>
                        <th className="px-3 py-3 text-right font-semibold">GF:GA</th>
                        <th className="px-3 py-3 text-right font-semibold">GD</th>
                        <th className="px-4 py-3 text-right font-semibold">Last Meeting</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-toasty-border tabular-nums">
                      {filteredOpponents.map((opp: OpponentH2HRow) => (
                        <tr
                          key={opp.key}
                          className="hover:bg-toasty-subtle/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                            {opp.opponent}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-zinc-700">{opp.gp}</td>
                          <td className="px-3 py-3 text-right font-mono font-semibold text-zinc-900">
                            {opp.wins}-{opp.draws}-{opp.losses}
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-toasty-tan-dark">
                            {opp.winRate}%
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-zinc-700">
                            {opp.gf}:{opp.ga}
                          </td>
                          <td
                            className={`px-3 py-3 text-right font-mono font-bold ${
                              opp.gd > 0
                                ? 'text-emerald-700'
                                : opp.gd < 0
                                  ? 'text-toasty-red'
                                  : 'text-zinc-500'
                            }`}
                          >
                            {opp.gd > 0 ? `+${opp.gd}` : opp.gd}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-zinc-600 whitespace-nowrap">
                            <span
                              className={`font-bold mr-2 ${
                                opp.lastOutcome === 'W'
                                  ? 'text-emerald-700'
                                  : opp.lastOutcome === 'L'
                                    ? 'text-toasty-red'
                                    : 'text-toasty-tan-dark'
                              }`}
                            >
                              {opp.lastOutcome} {opp.lastScore}
                            </span>
                            <span className="text-zinc-400 text-[11px]">
                              {formatShortDate(opp.lastDate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-xs text-zinc-500">
                  No opponents match &ldquo;{opponentSearch}&rdquo;.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: CLUB RECORDS VAULT (CAREER & SINGLE-GAME HIGHS)            */}
      {/* ===================================================================== */}
      {activeSubTab === 'records' && (
        <div className="space-y-10">
          {/* 1. All-Time Career Honor Roll */}
          <section className="space-y-4">
            <div className="border-b border-toasty-border pb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                Club Hall of Fame
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                All-Time Career Leaders
              </h3>
            </div>

            {clubRecords.careerLeaders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {clubRecords.careerLeaders.map((rec, idx) => (
                  <div
                    key={rec.label}
                    className={`rounded-xl p-5 border flex flex-col justify-between gap-4 ${
                      idx === 0
                        ? 'bg-toasty-obsidian text-white border-toasty-obsidian-border'
                        : 'bg-toasty-surface text-zinc-900 border-toasty-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-[0.14em] font-semibold ${
                          idx === 0 ? 'text-toasty-tan' : 'text-toasty-red'
                        }`}
                      >
                        {rec.label}
                      </span>
                      {idx === 0 && <Trophy size={14} className="text-toasty-tan shrink-0" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`font-display font-extrabold text-4xl tabular-nums leading-none ${
                            idx === 0 ? 'text-white' : 'text-zinc-900'
                          }`}
                        >
                          {rec.value}
                        </span>
                        <span
                          className={`text-xs font-mono uppercase ${
                            idx === 0 ? 'text-zinc-400' : 'text-zinc-500'
                          }`}
                        >
                          {rec.unit}
                        </span>
                      </div>
                      <div
                        className={`font-display font-bold text-xl uppercase tracking-wide leading-tight ${
                          idx === 0 ? 'text-toasty-tan' : 'text-zinc-900'
                        }`}
                      >
                        {rec.playerName}
                        {rec.number !== undefined && rec.number > 0 ? ` #${rec.number}` : ''}
                      </div>
                      <span
                        className={`text-[11px] font-mono block ${
                          idx === 0 ? 'text-zinc-400' : 'text-zinc-500'
                        }`}
                      >
                        {rec.subtext}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-toasty-border rounded-xl p-8 text-center text-xs text-zinc-500">
                Career records populate automatically from individual match logs.
              </div>
            )}
          </section>

          {/* 2. Single-Game Player Records */}
          <section className="space-y-4">
            <div className="border-b border-toasty-border pb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
                Peak Match Performances
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                Single-Game Player Records
              </h3>
            </div>

            {clubRecords.singleGamePlayer.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubRecords.singleGamePlayer.map(rec => (
                  <div
                    key={rec.label}
                    className="bg-toasty-surface border border-toasty-border rounded-xl p-5 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 font-semibold">
                        {rec.label}
                      </span>
                      <span className="font-display font-extrabold text-2xl text-toasty-red tabular-nums leading-none">
                        {rec.formattedValue}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xl uppercase tracking-wide text-zinc-900 leading-tight">
                        {rec.playerName}
                      </h4>
                      <p className="text-xs font-mono text-zinc-500 mt-1 tabular-nums">
                        vs. {rec.opponent} ({rec.scoreline}) · {formatShortDate(rec.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-toasty-border rounded-xl p-8 text-center text-xs text-zinc-500">
                No individual match records logged yet.
              </div>
            )}
          </section>

          {/* 3. Single-Game Team Records + Hat-Trick Club Split */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Team Records (5 cols) */}
            <div className="lg:col-span-5 bg-toasty-obsidian text-white border border-toasty-obsidian-border rounded-xl p-6 space-y-5">
              <div className="border-b border-toasty-obsidian-border pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
                    Team Benchmarks
                  </span>
                  <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide text-white leading-none mt-1">
                    Club Match Highs
                  </h3>
                </div>
                <Shield size={18} className="text-toasty-tan shrink-0" />
              </div>

              {clubRecords.singleGameTeam.length > 0 ? (
                <div className="divide-y divide-toasty-obsidian-border">
                  {clubRecords.singleGameTeam.map(rec => (
                    <div key={rec.label} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                        {rec.label}
                      </span>
                      <div className="font-display font-extrabold text-2xl text-white tabular-nums leading-none">
                        {rec.headline}
                      </div>
                      <span className="text-xs font-mono text-zinc-400 block tabular-nums">
                        {rec.subtext}
                        {rec.date ? ` · ${formatShortDate(rec.date)}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4">No completed team records logged yet.</p>
              )}
            </div>

            {/* Hat-Trick Club (7 cols) */}
            <div className="lg:col-span-7 bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-toasty-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                    3+ Goals In A Single Match
                  </span>
                  <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide text-zinc-900 leading-none mt-1">
                    The Hat-Trick Club
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold text-zinc-500 tabular-nums flex items-center gap-1.5">
                  <Flame size={14} className="text-toasty-red" />
                  {clubRecords.hatTricks.length} Logged
                </span>
              </div>

              {clubRecords.hatTricks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-toasty-subtle border-b border-toasty-border font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        <th className="px-5 py-2.5 font-semibold">Player</th>
                        <th className="px-3 py-2.5 text-center font-semibold">Goals</th>
                        <th className="px-3 py-2.5 font-semibold">Opponent</th>
                        <th className="px-5 py-2.5 text-right font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-toasty-border tabular-nums">
                      {clubRecords.hatTricks.map(ht => (
                        <tr key={ht.id} className="hover:bg-toasty-subtle/50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                            {ht.playerName}
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-bold text-toasty-red">
                            {ht.goals} G
                            {ht.assists > 0 && (
                              <span className="text-zinc-400 font-normal ml-1">
                                ({ht.assists}A)
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-zinc-700 whitespace-nowrap">
                            vs. {ht.opponent}{' '}
                            <span className="font-mono text-zinc-400">({ht.scoreline})</span>
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-zinc-500 whitespace-nowrap">
                            {formatShortDate(ht.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No 3-goal single-match performances logged yet.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
