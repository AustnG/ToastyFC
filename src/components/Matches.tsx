import React, { useState } from 'react';
import { Match, Player, MatchStats, Season } from '../types';
import {
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Award,
  CalendarDays,
  Target,
  Activity,
  UserCheck,
  ShieldAlert,
  Edit2,
  Save,
  X,
  PlusCircle,
  Star,
  Shield
} from 'lucide-react';
import { compareDatesAsc, compareDatesDesc, formatDateDisplay } from '../lib/dateUtils';

const CLUB_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png';

const formatTo12Hour = (timeStr?: string): string => {
  if (!timeStr) return '';
  const clean = timeStr.trim().toUpperCase();
  if (clean.includes('AM') || clean.includes('PM')) {
    return timeStr;
  }
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm} CT`;
};

interface MatchesProps {
  matches: Match[];
  seasons?: string[];
  seasonsList?: Season[];
  activeSeason?: string;
  onSeasonChange?: (season: string) => void;
  playerMatchStats: MatchStats[];
  onSavePlayerMatchStats?: (updatedStats: MatchStats[]) => void;
  players: Player[];
  isAdmin: boolean;
}

export const Matches: React.FC<MatchesProps> = ({
  matches,
  seasons,
  activeSeason,
  onSeasonChange,
  playerMatchStats,
  onSavePlayerMatchStats,
  players,
  isAdmin
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [tempStats, setTempStats] = useState<MatchStats[]>([]);

  const startEditing = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const existing = playerMatchStats.filter(pms => pms.matchId === matchId);
    const seasonPlayers = players.filter(p => p.name);

    const populated: MatchStats[] = seasonPlayers.map(p => {
      const found = existing.find(ex => ex.playerId === p.id);
      if (found) {
        return {
          ...found,
          present: found.present !== false,
          goals: Number(found.goals || 0),
          assists: Number(found.assists || 0),
          shots: Number(found.shots || 0),
          shotsOnTarget: Number(found.shotsOnTarget || 0),
          blocks: Number(found.blocks || 0),
          saves:
            found.saves !== undefined
              ? Number(found.saves)
              : p.position === 'Goalkeeper'
                ? 0
                : undefined,
          goalsAllowed:
            found.goalsAllowed !== undefined
              ? Number(found.goalsAllowed)
              : p.position === 'Goalkeeper'
                ? 0
                : undefined,
          plusMinus: found.plusMinus !== undefined ? Number(found.plusMinus) : 0,
          fouls: found.fouls !== undefined ? Number(found.fouls) : 0,
          yellows: found.yellows !== undefined ? Number(found.yellows) : 0,
          reds: found.reds !== undefined ? Number(found.reds) : 0,
          potm: found.potm === true || (found.potm as unknown) === 'true',
          cleanSheet: found.cleanSheet === true || (found.cleanSheet as unknown) === 'true'
        };
      }
      return {
        id: `pms_${matchId}_${p.id}`,
        matchId,
        playerId: p.id,
        playerName: p.name,
        present: false,
        goals: 0,
        assists: 0,
        shots: 0,
        shotsOnTarget: 0,
        blocks: 0,
        saves: p.position === 'Goalkeeper' ? 0 : undefined,
        goalsAllowed: p.position === 'Goalkeeper' ? 0 : undefined,
        plusMinus: 0,
        fouls: 0,
        yellows: 0,
        reds: 0,
        potm: false,
        cleanSheet: false
      };
    });

    setTempStats(populated);
    setEditingMatchId(matchId);
  };

  const handleTempStatChange = (playerId: string, field: keyof MatchStats, value: unknown) => {
    setTempStats(prev =>
      prev.map(stat => {
        if (stat.playerId === playerId) {
          if (field === 'present' || field === 'potm' || field === 'cleanSheet') {
            return { ...stat, [field]: Boolean(value) };
          }
          return { ...stat, [field]: Number(value) };
        }
        return stat;
      })
    );
  };

  const handleSaveStats = () => {
    if (!editingMatchId || !onSavePlayerMatchStats) return;
    const otherStats = playerMatchStats.filter(pms => pms.matchId !== editingMatchId);
    const presentStats = tempStats.filter(
      s => s.present === true || (s.present as unknown) === 'true'
    );
    onSavePlayerMatchStats([...otherStats, ...presentStats]);
    setEditingMatchId(null);
  };

  const filteredMatches = matches
    .filter(m => {
      if (filter === 'Upcoming') return m.status === 'Upcoming';
      if (filter === 'Completed') return m.status === 'Completed';
      return true;
    })
    .sort((a, b) => compareDatesDesc(a.date, b.date, a.time, b.time));

  const toggleExpand = (id: string) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const completedMatches = matches.filter(m => m.status === 'Completed');
  const totalMatchesCount = matches.length;
  const completedCount = completedMatches.length;

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsScored = 0;
  let goalsConceded = 0;

  const chronologicalCompleted = [...completedMatches].sort((a, b) =>
    compareDatesAsc(a.date, b.date, a.time, b.time)
  );

  chronologicalCompleted.forEach(m => {
    const ts = m.toastyScore ?? 0;
    const os = m.opponentScore ?? 0;
    goalsScored += ts;
    goalsConceded += os;
    if (ts > os) wins++;
    else if (ts === os) draws++;
    else losses++;
  });

  const goalDiff = goalsScored - goalsConceded;
  const winRate = completedCount > 0 ? Math.round((wins / completedCount) * 100) : 0;

  const lastFiveMatches = chronologicalCompleted.slice(-5);
  const formGuide = lastFiveMatches.map(m => {
    const ts = m.toastyScore ?? 0;
    const os = m.opponentScore ?? 0;
    if (ts > os) {
      return {
        result: 'W',
        cls: 'bg-toasty-red text-white',
        label: `Win vs ${m.opponent} (${ts}-${os})`
      };
    }
    if (ts === os) {
      return {
        result: 'D',
        cls: 'bg-toasty-tan text-toasty-obsidian',
        label: `Draw vs ${m.opponent} (${ts}-${os})`
      };
    }
    return {
      result: 'L',
      cls: 'bg-zinc-800 text-zinc-400',
      label: `Loss vs ${m.opponent} (${ts}-${os})`
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-toasty-border pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
            Fixtures & Box Scores
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
            Match Center
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            Schedule, results, team telemetry, and individual match box scores.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {seasons && activeSeason && onSeasonChange && (
            <div className="flex items-center gap-2 bg-white border border-toasty-border rounded-lg px-3 py-2">
              <CalendarDays size={14} className="text-toasty-red shrink-0" />
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                Season
              </span>
              <select
                value={activeSeason}
                onChange={e => onSeasonChange(e.target.value)}
                id="matches-season-selector"
                className="bg-transparent text-zinc-900 font-semibold text-xs focus:outline-none cursor-pointer pr-1 flex-1"
              >
                {seasons.map(season => (
                  <option key={season} value={season} className="text-zinc-900 font-sans">
                    {season}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-toasty-subtle border border-toasty-border p-1 rounded-lg flex">
            {['All', 'Upcoming', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                id={`filter-matches-${f.toLowerCase()}`}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-toasty-obsidian text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Unified Season Record Strip (Obsidian Ledger) */}
      <div
        id="matches-season-overview"
        className="bg-toasty-obsidian text-white rounded-xl border border-toasty-obsidian-border overflow-hidden"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-toasty-obsidian-border">
          <div className="p-5 sm:p-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
              Campaign Record
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums leading-none">
                {wins}-{draws}-{losses}
              </span>
              <span className="text-[11px] font-mono text-zinc-500 uppercase">W-D-L</span>
            </div>
            <span className="text-xs font-mono text-zinc-400 mt-1.5 block tabular-nums">
              {completedCount} of {totalMatchesCount} played
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
              Goals & Differential
            </span>
            <div className="flex items-baseline gap-2.5 mt-1.5">
              <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums leading-none">
                {goalsScored}:{goalsConceded}
              </span>
              <span
                className={`text-xs font-mono font-bold tabular-nums ${
                  goalDiff > 0
                    ? 'text-emerald-400'
                    : goalDiff < 0
                      ? 'text-red-400'
                      : 'text-zinc-400'
                }`}
              >
                {goalDiff > 0 ? `+${goalDiff}` : goalDiff} GD
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400 mt-1.5 block tabular-nums">
              {completedCount > 0 ? (goalsScored / completedCount).toFixed(1) : '0.0'} goals / match
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
              Win Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="font-display font-extrabold text-3xl sm:text-4xl text-toasty-tan tabular-nums leading-none">
                {winRate}%
              </span>
            </div>
            <div className="w-full max-w-[140px] h-1 bg-zinc-800 rounded-full overflow-hidden mt-2.5">
              <div className="h-full bg-toasty-red" style={{ width: `${winRate}%` }} />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
              Recent Form
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {formGuide.length === 0 ? (
                <span className="text-xs text-zinc-500 font-mono">No completed games</span>
              ) : (
                formGuide.map((game, i) => (
                  <span
                    key={i}
                    title={game.label}
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[11px] font-bold select-none ${game.cls}`}
                  >
                    {game.result}
                  </span>
                ))
              )}
            </div>
            {formGuide.length > 0 && (
              <span className="text-[10px] font-mono text-zinc-500 mt-2 block">
                Oldest &rarr; Latest
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-4">
        {filteredMatches.map(match => {
          const isCompleted = match.status === 'Completed';
          const isExpanded = expandedMatchId === match.id;
          const didToastyWin = isCompleted && (match.toastyScore ?? 0) > (match.opponentScore ?? 0);
          const didToastyDraw =
            isCompleted && (match.toastyScore ?? 0) === (match.opponentScore ?? 0);
          const didToastyLose =
            isCompleted && (match.toastyScore ?? 0) < (match.opponentScore ?? 0);

          const getPlayoffStage = (): 'quarter' | 'semi' | 'final' | null => {
            const textToSearch = [match.opponent, match.summary, match.location, match.type]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            if (
              textToSearch.includes('quarter final') ||
              textToSearch.includes('quarter-final') ||
              textToSearch.includes('quarterfinal')
            ) {
              return 'quarter';
            }
            if (
              textToSearch.includes('semi final') ||
              textToSearch.includes('semi-final') ||
              textToSearch.includes('semifinal')
            ) {
              return 'semi';
            }
            const hasFinal =
              /\b(final|finals|grandfinal)\b/i.test(textToSearch) &&
              !textToSearch.includes('final score') &&
              !textToSearch.includes('final whistle');
            if (hasFinal) return 'final';
            return null;
          };

          const playoffStage = getPlayoffStage();
          const playoffLabel =
            playoffStage === 'final'
              ? 'Cup Final'
              : playoffStage === 'semi'
                ? 'Semi-Final'
                : playoffStage === 'quarter'
                  ? 'Quarter-Final'
                  : null;

          const outcomeLabel = isCompleted
            ? didToastyWin
              ? 'Win'
              : didToastyDraw
                ? 'Draw'
                : 'Loss'
            : 'Upcoming';

          const outcomeTextClass = isCompleted
            ? didToastyWin
              ? 'text-toasty-red'
              : didToastyDraw
                ? 'text-toasty-tan-dark'
                : 'text-zinc-500'
            : 'text-toasty-red';

          const matchBoxScores = playerMatchStats.filter(
            pms => pms.matchId === match.id && pms.present
          );

          const rawMatch = match as unknown as Record<string, unknown>;
          const ytRaw =
            match.youtubeUrl ||
            rawMatch.YouTubeurl ||
            rawMatch.YouTubeUrl ||
            rawMatch.youtube_url ||
            rawMatch['YouTube URL'];
          const ytUrl =
            ytRaw &&
            String(ytRaw).trim() !== '' &&
            String(ytRaw).toLowerCase() !== 'null'
              ? String(ytRaw).trim()
              : null;

          return (
            <article
              key={match.id}
              id={`match-row-${match.id}`}
              className={`bg-toasty-surface rounded-xl border overflow-hidden transition-colors ${
                isExpanded
                  ? 'border-zinc-400'
                  : playoffStage === 'final'
                    ? 'border-toasty-red/50'
                    : 'border-toasty-border hover:border-zinc-300'
              }`}
            >
              {/* Unboxed Match Metadata Bar */}
              <div className="bg-toasty-subtle/70 px-5 py-2.5 border-b border-toasty-border flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono tabular-nums text-zinc-600">
                  <Calendar size={13} className="text-zinc-400 shrink-0" />
                  <span className="font-semibold text-zinc-800">
                    {formatDateDisplay(match.date, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  {match.time && (
                    <>
                      <span className="text-zinc-300">·</span>
                      <span>{formatTo12Hour(match.time)}</span>
                    </>
                  )}
                  <span className="text-zinc-300">·</span>
                  <span className="uppercase tracking-wider text-zinc-500">{match.type}</span>
                  {playoffLabel && (
                    <>
                      <span className="text-zinc-300">·</span>
                      <span className="uppercase tracking-wider font-bold text-toasty-red">
                        {playoffLabel}
                      </span>
                    </>
                  )}
                </div>

                {match.location && (
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    <MapPin size={13} className="text-toasty-tan-dark shrink-0" />
                    <span>{match.location}</span>
                  </div>
                )}
              </div>

              {/* Balanced Scoreboard Body */}
              <div
                onClick={() => isCompleted && toggleExpand(match.id)}
                className={`px-4 py-5 sm:px-6 sm:py-6 ${
                  isCompleted ? 'cursor-pointer hover:bg-toasty-subtle/35 transition-colors' : ''
                }`}
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                  {/* Home: Toasty FC */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 text-center sm:text-left min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-toasty-obsidian border border-toasty-obsidian-border p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={CLUB_LOGO_URL}
                        alt="Toasty FC Logo"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-extrabold text-lg sm:text-2xl uppercase tracking-tight text-zinc-900 block truncate leading-none">
                        Toasty FC
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-toasty-red font-semibold mt-1 block">
                        Home
                      </span>
                    </div>
                  </div>

                  {/* Center Scoreboard */}
                  <div className="flex flex-col items-center justify-center gap-1.5 min-w-[92px] sm:min-w-[140px]">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 sm:gap-3 font-display tabular-nums">
                        <span
                          className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-extrabold leading-none ${
                            didToastyWin
                              ? 'bg-toasty-red text-white'
                              : 'bg-toasty-subtle text-zinc-900 border border-toasty-border'
                          }`}
                        >
                          {match.toastyScore}
                        </span>
                        <span className="text-zinc-300 font-bold text-lg">–</span>
                        <span
                          className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-extrabold leading-none ${
                            didToastyLose
                              ? 'bg-toasty-obsidian text-white'
                              : 'bg-toasty-subtle text-zinc-900 border border-toasty-border'
                          }`}
                        >
                          {match.opponentScore}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-toasty-obsidian text-toasty-tan font-display font-extrabold text-lg sm:text-xl uppercase tracking-widest px-4 py-1.5 rounded-lg">
                        VS
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
                      <span className={`font-bold ${outcomeTextClass}`}>{outcomeLabel}</span>
                      {isCompleted && (
                        <span className="text-zinc-400 inline-flex items-center gap-0.5">
                          · {isExpanded ? 'Hide' : 'Report'}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Away: Opponent */}
                  <div className="flex flex-col sm:flex-row-reverse items-center gap-2.5 sm:gap-3.5 text-center sm:text-right min-w-0">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: match.opponentColor
                          ? `${match.opponentColor}15`
                          : '#F3F1EC',
                        borderColor: match.opponentColor
                          ? `${match.opponentColor}40`
                          : '#E6E4DF'
                      }}
                    >
                      <Shield size={18} style={{ color: match.opponentColor || '#7A674A' }} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-extrabold text-lg sm:text-2xl uppercase tracking-tight text-zinc-900 block truncate leading-none">
                        {match.opponent}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold mt-1 block">
                        Away
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Match Report & Box Score */}
              {isCompleted && isExpanded && (
                <div className="bg-toasty-subtle/50 border-t border-toasty-border p-5 sm:p-7 space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Narrative, Scorers, POTM, Video */}
                    <div className="lg:col-span-5 space-y-5">
                      {match.summary && (
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                            Match Report
                          </h4>
                          <p className="text-sm text-zinc-700 leading-relaxed">{match.summary}</p>
                        </div>
                      )}

                      {(match.goalScorersDetails || match.opponentGoalScorersDetails) && (
                        <div className="pt-4 border-t border-toasty-border space-y-3">
                          <h4 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                            Goal Timeline
                          </h4>
                          <div className="bg-white border border-toasty-border rounded-lg p-4 grid grid-cols-2 gap-4 text-xs">
                            <div className="border-r border-toasty-border pr-3 space-y-1.5">
                              <span className="block text-[10px] font-mono font-bold text-toasty-red uppercase tracking-wider">
                                Toasty FC
                              </span>
                              {match.goalScorersDetails ? (
                                match.goalScorersDetails.split(',').map((scorer, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 text-zinc-800 font-medium"
                                  >
                                    <Target size={11} className="text-toasty-red shrink-0" />
                                    <span className="truncate">{scorer.trim()}</span>
                                  </div>
                                ))
                              ) : match.goalsScoredBy && match.goalsScoredBy.length > 0 ? (
                                match.goalsScoredBy.map((scorer, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 text-zinc-800 font-medium"
                                  >
                                    <Target size={11} className="text-toasty-red shrink-0" />
                                    <span className="truncate">{scorer}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-zinc-400">No goals</span>
                              )}
                            </div>

                            <div className="pl-2 space-y-1.5 text-right">
                              <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider truncate">
                                {match.opponent}
                              </span>
                              {match.opponentGoalScorersDetails ? (
                                match.opponentGoalScorersDetails.split(',').map((scorer, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-end gap-1.5 text-zinc-700 font-medium"
                                  >
                                    <span className="truncate">{scorer.trim()}</span>
                                    <Target size={11} className="text-zinc-400 shrink-0" />
                                  </div>
                                ))
                              ) : (
                                <span className="text-zinc-400">No goals</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {match.playerOfTheMatch && (
                        <div className="pt-4 border-t border-toasty-border flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-toasty-red/10 text-toasty-red flex items-center justify-center shrink-0">
                            <Award size={16} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                              Player of the Match
                            </span>
                            <span className="text-sm font-bold text-zinc-900">
                              {match.playerOfTheMatch}
                            </span>
                          </div>
                        </div>
                      )}

                      {ytUrl && (
                        <div className="pt-4 border-t border-toasty-border">
                          <a
                            href={ytUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-toasty-red hover:bg-toasty-red-hover text-white font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors w-full"
                          >
                            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            Watch Match Highlights
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Team Match Comparison */}
                    <div className="lg:col-span-7 bg-white border border-toasty-border rounded-lg p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-toasty-border pb-2.5">
                        <h4 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                          <Activity size={13} className="text-toasty-red" /> Team Match Stats
                        </h4>
                        <span className="text-[11px] font-mono text-zinc-500">
                          <strong className="text-toasty-red">TFC</strong> vs {match.opponent}
                        </span>
                      </div>

                      {match.stats ? (
                        <div className="space-y-3.5">
                          {Object.entries(match.stats)
                            .filter(([statKey]) => statKey !== 'goals')
                            .map(([statKey, values]) => {
                              const toastyVal = Number((values as { toasty: number }).toasty || 0);
                              const oppVal = Number((values as { opponent: number }).opponent || 0);
                              const total = toastyVal + oppVal || 1;
                              const toastyPercent = (toastyVal / total) * 100;

                              const labels: Record<string, string> = {
                                assists: 'Assists',
                                shots: 'Total Shots',
                                shotsOnTarget: 'Shots on Target',
                                blocks: 'Blocks',
                                fouls: 'Fouls',
                                redCards: 'Red Cards',
                                yellowCards: 'Yellow Cards',
                                saves: 'Goalkeeper Saves',
                                corners: 'Corners'
                              };

                              return (
                                <div key={statKey} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs font-mono tabular-nums">
                                    <span className="font-bold text-toasty-red w-10 text-left">
                                      {toastyVal}
                                    </span>
                                    <span className="text-zinc-500 uppercase text-[10px] tracking-wider">
                                      {labels[statKey] || statKey}
                                    </span>
                                    <span className="font-bold text-zinc-700 w-10 text-right">
                                      {oppVal}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-100 rounded-full flex overflow-hidden">
                                    <div
                                      className="h-full bg-toasty-red"
                                      style={{ width: `${toastyPercent}%` }}
                                    />
                                    <div
                                      className="h-full bg-toasty-tan"
                                      style={{ width: `${100 - toastyPercent}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-center py-6 text-xs text-zinc-400">
                          Team statistics have not been logged for this fixture.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Individual Player Box Score */}
                  <div className="pt-5 border-t border-toasty-border space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <h4 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
                          <UserCheck size={14} className="text-toasty-red" /> Player Box Score
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Individual attendance and match stats recorded for this fixture.
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => startEditing(match.id)}
                          className="inline-flex items-center gap-1.5 bg-toasty-obsidian hover:bg-zinc-800 text-toasty-tan font-mono font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={12} /> Edit Individual Stats
                        </button>
                      )}
                    </div>

                    {matchBoxScores.length > 0 ? (
                      <div className="bg-white border border-toasty-border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-toasty-subtle border-b border-toasty-border font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                                <th className="px-4 py-2.5 font-semibold">Player</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Pos</th>
                                <th className="px-3 py-2.5 text-center font-semibold">G</th>
                                <th className="px-3 py-2.5 text-center font-semibold">A</th>
                                <th className="px-3 py-2.5 text-center font-semibold">
                                  Shots (SOT)
                                </th>
                                <th className="px-3 py-2.5 text-center font-semibold">SOT%</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Blk</th>
                                <th className="px-3 py-2.5 text-center font-semibold">GK Sv/GA</th>
                                <th className="px-3 py-2.5 text-center font-semibold">+/-</th>
                                <th className="px-3 py-2.5 text-center font-semibold">F</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Cards</th>
                                <th className="px-3 py-2.5 text-center font-semibold">CS</th>
                                <th className="px-3 py-2.5 text-center font-semibold">POTM</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-toasty-border tabular-nums">
                              {matchBoxScores.map(stat => {
                                const playerObj = players.find(p => p.id === stat.playerId);
                                const number = playerObj?.number;
                                const isGK = playerObj?.position === 'Goalkeeper';
                                const rawShots = Number(stat.shots || 0);
                                const rawSOT = Number(stat.shotsOnTarget || 0);
                                const totalShots = rawShots + rawSOT;
                                const shotAccuracy =
                                  totalShots > 0 ? Math.round((rawSOT / totalShots) * 100) : 0;

                                return (
                                  <tr
                                    key={stat.id}
                                    className="hover:bg-toasty-subtle/50 transition-colors"
                                  >
                                    <td className="px-4 py-2.5 font-semibold text-zinc-900 whitespace-nowrap">
                                      <span className="inline-flex items-center gap-2">
                                        {number !== undefined &&
                                          number !== null &&
                                          number > 0 && (
                                            <span className="text-zinc-400 font-mono text-[11px] w-6">
                                              #{number}
                                            </span>
                                          )}
                                        <span>{stat.playerName}</span>
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono text-[10px] uppercase text-zinc-500">
                                      {playerObj?.position ? playerObj.position.slice(0, 3) : '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono font-bold text-toasty-red">
                                      {stat.goals > 0 ? stat.goals : '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono font-bold text-toasty-tan-dark">
                                      {stat.assists > 0 ? stat.assists : '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono text-zinc-700">
                                      {totalShots > 0 ? `${totalShots} (${rawSOT})` : '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono text-zinc-500">
                                      {totalShots > 0 ? `${shotAccuracy}%` : '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono font-semibold text-zinc-800">
                                      {stat.blocks > 0 ? stat.blocks : '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono text-zinc-700">
                                      {isGK
                                        ? `${stat.saves ?? 0} / ${stat.goalsAllowed ?? 0}`
                                        : '—'}
                                    </td>
                                    <td
                                      className={`px-3 py-2.5 text-center font-mono font-bold ${
                                        stat.plusMinus > 0
                                          ? 'text-emerald-700'
                                          : stat.plusMinus < 0
                                            ? 'text-rose-700'
                                            : 'text-zinc-400'
                                      }`}
                                    >
                                      {stat.plusMinus > 0
                                        ? `+${stat.plusMinus}`
                                        : stat.plusMinus < 0
                                          ? stat.plusMinus
                                          : '0'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono text-zinc-600">
                                      {stat.fouls > 0 ? stat.fouls : '0'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        {stat.yellows > 0 && (
                                          <span
                                            className="w-3.5 h-4 rounded-xs bg-amber-400 border border-amber-500 inline-flex items-center justify-center font-mono text-[9px] font-bold text-zinc-950"
                                            title={`${stat.yellows} Yellow Card(s)`}
                                          >
                                            {stat.yellows}
                                          </span>
                                        )}
                                        {stat.reds > 0 && (
                                          <span
                                            className="w-3.5 h-4 rounded-xs bg-red-600 border border-red-700 inline-flex items-center justify-center font-mono text-[9px] font-bold text-white"
                                            title="Red Card"
                                          >
                                            R
                                          </span>
                                        )}
                                        {!stat.yellows && !stat.reds && (
                                          <span className="text-zinc-300">—</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      {stat.cleanSheet ? (
                                        <span
                                          className="inline-flex items-center justify-center text-emerald-600 font-mono font-bold text-[10px]"
                                          title="Clean Sheet"
                                        >
                                          CS
                                        </span>
                                      ) : (
                                        <span className="text-zinc-300">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      {stat.potm ? (
                                        <span
                                          className="inline-flex items-center justify-center gap-1 text-toasty-red font-mono font-bold text-[10px]"
                                          title="Player of the Match"
                                        >
                                          <Star size={11} className="fill-toasty-red" /> POTM
                                        </span>
                                      ) : (
                                        <span className="text-zinc-300">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-7 border border-dashed border-toasty-border rounded-lg bg-white flex flex-col items-center justify-center gap-2">
                        <p className="text-zinc-500 text-xs">
                          No individual player stats logged for this fixture yet.
                        </p>
                        {isAdmin && (
                          <button
                            onClick={() => startEditing(match.id)}
                            className="text-toasty-red hover:text-toasty-red-hover font-mono font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle size={13} /> Log stats now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 border border-dashed border-toasty-border rounded-xl bg-white">
          <p className="text-zinc-500 text-sm">No matches found for this filter.</p>
        </div>
      )}

      {/* Admin Individual Match Stats Editor Modal */}
      {editingMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-toasty-border overflow-hidden max-w-5xl w-full shadow-2xl flex flex-col max-h-[86vh] animate-fade-in">
            <div className="bg-toasty-obsidian text-white px-6 py-4 flex items-center justify-between border-b border-toasty-obsidian-border">
              <div>
                <span className="text-[10px] font-mono font-semibold text-toasty-tan uppercase tracking-[0.14em] block">
                  Admin Match Sheet
                </span>
                <h3 className="font-display font-extrabold text-xl uppercase tracking-wide">
                  Edit Individual Match Statistics
                </h3>
              </div>
              <button
                onClick={() => setEditingMatchId(null)}
                aria-label="Close editor"
                className="w-8 h-8 rounded-lg bg-toasty-obsidian-card border border-toasty-obsidian-border text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-toasty-subtle border border-toasty-border rounded-lg p-4 flex gap-3 text-zinc-700 text-xs">
                <ShieldAlert size={16} className="shrink-0 text-toasty-red mt-0.5" />
                <p className="leading-relaxed">
                  Check <strong>Present</strong> for each player who participated, then enter their
                  match statistics. Goalkeeper Saves and Goals Allowed unlock automatically for
                  goalkeepers. Saving syncs directly to Google Sheets.
                </p>
              </div>

              <div className="border border-toasty-border rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[780px]">
                    <thead>
                      <tr className="bg-toasty-subtle border-b border-toasty-border font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        <th className="px-3 py-2.5 text-center w-12">In</th>
                        <th className="px-3 py-2.5">Player</th>
                        <th className="px-2 py-2.5 text-center">G</th>
                        <th className="px-2 py-2.5 text-center">A</th>
                        <th className="px-2 py-2.5 text-center">Shots</th>
                        <th className="px-2 py-2.5 text-center">SOT</th>
                        <th className="px-2 py-2.5 text-center">Blk</th>
                        <th className="px-2 py-2.5 text-center">Sv</th>
                        <th className="px-2 py-2.5 text-center">GA</th>
                        <th className="px-2 py-2.5 text-center">+/-</th>
                        <th className="px-2 py-2.5 text-center">F</th>
                        <th className="px-2 py-2.5 text-center">Y</th>
                        <th className="px-2 py-2.5 text-center">R</th>
                        <th className="px-2 py-2.5 text-center">CS</th>
                        <th className="px-2 py-2.5 text-center">POTM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-toasty-border tabular-nums">
                      {tempStats.map(stat => {
                        const playerObj = players.find(p => p.id === stat.playerId);
                        const isGK = playerObj?.position === 'Goalkeeper';

                        return (
                          <tr
                            key={stat.id}
                            className={`transition-colors ${
                              stat.present ? 'bg-white' : 'bg-toasty-subtle/40 opacity-60'
                            }`}
                          >
                            <td className="px-3 py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={Boolean(stat.present)}
                                onChange={e =>
                                  handleTempStatChange(stat.playerId, 'present', e.target.checked)
                                }
                                className="w-4 h-4 rounded border-zinc-300 accent-toasty-red cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-zinc-900 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {playerObj?.number !== undefined &&
                                  playerObj?.number !== null &&
                                  playerObj.number > 0 && (
                                    <span className="text-zinc-400 font-mono text-[10px]">
                                      #{playerObj.number}
                                    </span>
                                  )}
                                <span>{stat.playerName}</span>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                  · {playerObj?.position || 'Outfield'}
                                </span>
                              </div>
                            </td>
                            {(
                              [
                                ['goals', 0],
                                ['assists', 0],
                                ['shots', 0],
                                ['shotsOnTarget', 0],
                                ['blocks', 0]
                              ] as const
                            ).map(([field, min]) => (
                              <td key={field} className="px-2 py-2 text-center">
                                <input
                                  type="number"
                                  min={min}
                                  disabled={!stat.present}
                                  value={stat[field]}
                                  onChange={e =>
                                    handleTempStatChange(stat.playerId, field, e.target.value)
                                  }
                                  className="w-12 text-center border border-toasty-border rounded-md p-1 text-xs font-mono disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-toasty-red focus:outline-none"
                                />
                              </td>
                            ))}
                            <td className="px-2 py-2 text-center">
                              <input
                                type="number"
                                min={0}
                                disabled={!stat.present || !isGK}
                                value={stat.saves ?? 0}
                                onChange={e =>
                                  handleTempStatChange(stat.playerId, 'saves', e.target.value)
                                }
                                className="w-12 text-center border border-toasty-border rounded-md p-1 text-xs font-mono disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-toasty-red focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="number"
                                min={0}
                                disabled={!stat.present || !isGK}
                                value={stat.goalsAllowed ?? 0}
                                onChange={e =>
                                  handleTempStatChange(
                                    stat.playerId,
                                    'goalsAllowed',
                                    e.target.value
                                  )
                                }
                                className="w-12 text-center border border-toasty-border rounded-md p-1 text-xs font-mono disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-toasty-red focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="number"
                                disabled={!stat.present}
                                value={stat.plusMinus ?? 0}
                                onChange={e =>
                                  handleTempStatChange(stat.playerId, 'plusMinus', e.target.value)
                                }
                                className="w-12 text-center border border-toasty-border rounded-md p-1 text-xs font-mono disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-toasty-red focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="number"
                                min={0}
                                disabled={!stat.present}
                                value={stat.fouls ?? 0}
                                onChange={e =>
                                  handleTempStatChange(stat.playerId, 'fouls', e.target.value)
                                }
                                className="w-12 text-center border border-toasty-border rounded-md p-1 text-xs font-mono disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-toasty-red focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="number"
                                min={0}
                                disabled={!stat.present}
                                value={stat.yellows ?? 0}
                                onChange={e =>
                                  handleTempStatChange(stat.playerId, 'yellows', e.target.value)
                                }
                                className="w-12 text-center border border-toasty-border rounded-md p-1 text-xs font-mono disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-toasty-red focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="number"
                                min={0}
                                disabled={!stat.present}
                                value={stat.reds ?? 0}
                                onChange={e =>
                                  handleTempStatChange(stat.playerId, 'reds', e.target.value)
                                }
                                className="w-12 text-center border border-toasty-border rounded-md p-1 text-xs font-mono disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-toasty-red focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                disabled={!stat.present}
                                checked={Boolean(stat.cleanSheet)}
                                onChange={e =>
                                  handleTempStatChange(
                                    stat.playerId,
                                    'cleanSheet',
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 rounded border-zinc-300 accent-toasty-red cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                disabled={!stat.present}
                                checked={Boolean(stat.potm)}
                                onChange={e =>
                                  handleTempStatChange(stat.playerId, 'potm', e.target.checked)
                                }
                                className="w-4 h-4 rounded border-zinc-300 accent-toasty-red cursor-pointer disabled:opacity-40"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-toasty-subtle border-t border-toasty-border px-6 py-4 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setEditingMatchId(null)}
                className="bg-white border border-toasty-border hover:border-zinc-400 text-zinc-700 font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="inline-flex items-center gap-1.5 bg-toasty-red hover:bg-toasty-red-hover text-white font-semibold uppercase tracking-wider px-5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Save size={13} /> Save & Sync Stats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
