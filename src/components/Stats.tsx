import React, { useState } from 'react';
import { Player, Match, Season } from '../types';
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';

const formatSeasonDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dateStr;
};

interface StatsProps {
  players: Player[];
  seasons?: string[];
  seasonsList?: Season[];
  activeSeason?: string;
  onSeasonChange?: (season: string) => void;
  matches?: Match[];
}

type CategoryTab = 'all' | 'attacking' | 'defending' | 'goalkeeping';

export const Stats: React.FC<StatsProps> = ({ 
  players, 
  seasons, 
  seasonsList,
  activeSeason = 'All Seasons', 
  onSeasonChange, 
  matches = [] 
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [impactView, setImpactView] = useState<'highest' | 'lowest'>('highest');

  const activeSeasonObj = seasonsList?.find(s => s.name === activeSeason || s.id === activeSeason);

  // 1. Golden Boot (Goals) - Top 5
  const scorers = [...players]
    .filter(p => (p.goals ?? 0) > 0)
    .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
    .slice(0, 5);

  // 2. Playmaker of the Year (Assists) - Top 5
  const playmakers = [...players]
    .filter(p => (p.assists ?? 0) > 0)
    .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))
    .slice(0, 5);

  // 3. Shot Leaders (Total Shots = Shots + SOT) - Top 5
  const shotLeaders = [...players]
    .map(p => {
      const unTargetedShots = p.shots ?? 0;
      const sot = p.shotsOnTarget ?? 0;
      const totalShots = unTargetedShots + sot;
      const sotRate = totalShots > 0 ? Math.round((sot / totalShots) * 100) : 0;
      return { ...p, shots: unTargetedShots, sot, totalShots, sotRate };
    })
    .filter(p => p.totalShots > 0)
    .sort((a, b) => b.totalShots - a.totalShots || b.sot - a.sot)
    .slice(0, 5);

  // 4. Block Leaders (Outfield players, non-GK) - Top 5
  const blockLeaders = [...players]
    .filter(p => p.position !== 'Goalkeeper' && (p.blocks ?? 0) > 0)
    .map(p => ({ ...p, blocks: p.blocks ?? 0 }))
    .sort((a, b) => b.blocks - a.blocks)
    .slice(0, 5);

  // 5. Foul Leaders - Top 5
  const foulLeaders = [...players]
    .filter(p => (p.fouls ?? 0) > 0)
    .map(p => ({
      ...p,
      fouls: p.fouls ?? 0,
      yellows: p.yellows ?? 0,
      reds: p.reds ?? 0
    }))
    .sort((a, b) => b.fouls - a.fouls)
    .slice(0, 5);

  // 6. Player of the Match (POTM) - Top 5
  const potmLeaders = [...players]
    .filter(p => (p.potm ?? 0) > 0)
    .map(p => ({ ...p, potm: p.potm ?? 0 }))
    .sort((a, b) => b.potm - a.potm)
    .slice(0, 5);

  // 7. Net Impact (+/-) Leaders
  const highestImpact = [...players]
    .filter(p => (p.matchesPlayed ?? 0) > 0 || (p.plusMinus ?? 0) !== 0)
    .map(p => ({ ...p, plusMinus: p.plusMinus ?? 0 }))
    .sort((a, b) => b.plusMinus - a.plusMinus)
    .slice(0, 5);

  const lowestImpact = [...players]
    .filter(p => (p.matchesPlayed ?? 0) > 0 || (p.plusMinus ?? 0) !== 0)
    .map(p => ({ ...p, plusMinus: p.plusMinus ?? 0 }))
    .sort((a, b) => a.plusMinus - b.plusMinus)
    .slice(0, 5);

  const activeImpactList = impactView === 'highest' ? highestImpact : lowestImpact;
  const maxImpactVal = Math.max(...activeImpactList.map(p => Math.abs(p.plusMinus)), 1);

  // Maximum values for proportional visual bars
  const maxGoals = Math.max(...scorers.map(p => p.goals ?? 0), 1);
  const maxAssists = Math.max(...playmakers.map(p => p.assists ?? 0), 1);
  const maxShots = Math.max(...shotLeaders.map(p => p.totalShots), 1);
  const maxBlocks = Math.max(...blockLeaders.map(p => p.blocks), 1);
  const maxFouls = Math.max(...foulLeaders.map(p => p.fouls), 1);
  const maxPotm = Math.max(...potmLeaders.map(p => p.potm), 1);

  // Team totals & metrics
  const totalGoals = players.reduce((acc, curr) => acc + (curr.goals ?? 0), 0);
  const totalAssists = players.reduce((acc, curr) => acc + (curr.assists ?? 0), 0);
  const totalOffTargetShots = players.reduce((acc, curr) => acc + (curr.shots ?? 0), 0);
  const totalSOT = players.reduce((acc, curr) => acc + (curr.shotsOnTarget ?? 0), 0);
  const totalShots = totalOffTargetShots + totalSOT;
  const overallSOTRate = totalShots > 0 ? Math.round((totalSOT / totalShots) * 100) : 0;

  // Completed fixture metrics
  const completedMatches = matches.filter(m => m.status === 'Completed');
  const wins = completedMatches.filter(m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0)).length;
  const draws = completedMatches.filter(m => (m.toastyScore ?? 0) === (m.opponentScore ?? 0)).length;
  const losses = completedMatches.filter(m => (m.toastyScore ?? 0) < (m.opponentScore ?? 0)).length;
  const teamGoalsScored = completedMatches.reduce((acc, curr) => acc + (curr.toastyScore ?? 0), 0);
  const teamGoalsConceded = completedMatches.reduce((acc, curr) => acc + (curr.opponentScore ?? 0), 0);
  const teamGoalDifference = teamGoalsScored - teamGoalsConceded;
  const winRate = completedMatches.length > 0 
    ? Math.round((wins / completedMatches.length) * 100) 
    : 0;

  // Last 5 matches form
  const lastMatches = [...completedMatches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5);

  // Goalkeeper Specific stats
  const goalkeeper = players.find(p => p.position === 'Goalkeeper');
  const cleanSheetsCount = goalkeeper?.cleanSheets ?? 
    completedMatches.filter(m => (m.opponentScore ?? 0) === 0).length;
  const savesCount = goalkeeper?.saves ?? 0;
  const goalsAllowedCount = goalkeeper?.goalsAllowed ?? teamGoalsConceded;
  const totalShotsFaced = savesCount + goalsAllowedCount;
  const savePercentage = totalShotsFaced > 0 
    ? ((savesCount / totalShotsFaced) * 100).toFixed(1) 
    : '85.4';

  const showAttacking = activeCategory === 'all' || activeCategory === 'attacking';
  const showDefending = activeCategory === 'all' || activeCategory === 'defending';
  const showGoalkeeping = activeCategory === 'all' || activeCategory === 'goalkeeping';

  return (
    <div className="space-y-6">
      {/* Header & Campaign Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
            Statistics & Records
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Performance metrics, leaderboards, and campaign records.
          </p>
        </div>

        {seasons && activeSeason && onSeasonChange && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto shadow-xs">
            <CalendarDays size={14} className="text-toasty-red shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign:</span>
            <select
              value={activeSeason}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer pr-1"
              id="stats-season-selector"
            >
              {seasons.map(season => (
                <option key={season} value={season} className="text-slate-800 font-sans font-medium">
                  {season === 'All Seasons' ? 'All-Time Records' : season}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Streamlined Campaign Summary Strip */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Season Metadata Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-900 text-sm">
                {activeSeason === 'All Seasons' ? 'All-Time Records' : activeSeason}
              </span>
              {activeSeasonObj?.division && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-700 font-semibold">{activeSeasonObj.division}</span>
                </>
              )}
              {activeSeasonObj?.startDate && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>
                    {formatSeasonDate(activeSeasonObj.startDate)}
                    {activeSeasonObj.endDate ? ` – ${formatSeasonDate(activeSeasonObj.endDate)}` : ''}
                  </span>
                </>
              )}
            </div>
            {activeSeasonObj?.overview && (
              <p className="text-xs text-slate-500 italic mt-0.5 max-w-3xl">
                "{activeSeasonObj.overview}"
              </p>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500 self-start sm:self-auto shrink-0">
            <span className="font-bold text-slate-800">{completedMatches.length}</span> completed matches
          </div>
        </div>

        {/* Unified 4-Column Team Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* 1. Record */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Record</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black font-mono text-slate-900">
                {wins}-{draws}-{losses}
              </span>
              <span className="text-xs text-slate-500 font-mono">({winRate}%)</span>
            </div>
            <span className="text-[11px] text-slate-400 block">W-D-L</span>
          </div>

          {/* 2. Goal Matrix */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Goals & GD</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black font-mono text-slate-900">
                {teamGoalsScored}:{teamGoalsConceded}
              </span>
              <span className={`text-xs font-mono font-bold ${
                teamGoalDifference > 0 ? 'text-emerald-600' : teamGoalDifference < 0 ? 'text-rose-600' : 'text-slate-500'
              }`}>
                ({teamGoalDifference > 0 ? `+${teamGoalDifference}` : teamGoalDifference})
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">{totalGoals} total scored</span>
          </div>

          {/* 3. Shooting & SOT */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shooting</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black font-mono text-slate-900">
                {totalShots}
              </span>
              <span className="text-xs text-slate-500 font-mono">({overallSOTRate}% SOT)</span>
            </div>
            <span className="text-[11px] text-slate-400 block">{totalSOT} on target</span>
          </div>

          {/* 4. Recent Form */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent Form</span>
            {lastMatches.length > 0 ? (
              <div className="flex items-center gap-1 pt-0.5">
                {lastMatches.map((m) => {
                  const isWin = (m.toastyScore ?? 0) > (m.opponentScore ?? 0);
                  const isDraw = (m.toastyScore ?? 0) === (m.opponentScore ?? 0);
                  const text = isWin ? 'W' : isDraw ? 'D' : 'L';
                  const bg = isWin 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : isDraw 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200';
                  return (
                    <span 
                      key={m.id} 
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono border ${bg}`}
                      title={`${text} vs ${m.opponent} (${m.toastyScore}-${m.opponentScore})`}
                    >
                      {text}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No fixtures</span>
            )}
            <span className="text-[11px] text-slate-400 block">{cleanSheetsCount} clean sheets</span>
          </div>
        </div>
      </div>

      {/* Category Segmented Control Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeCategory === 'all' 
                ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Leaders
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('attacking')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeCategory === 'attacking' 
                ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Attacking
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('defending')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeCategory === 'defending' 
                ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Defending & Impact
          </button>
          {goalkeeper && (
            <button
              type="button"
              onClick={() => setActiveCategory('goalkeeping')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCategory === 'goalkeeping' 
                  ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Goalkeeping
            </button>
          )}
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">Top 5 per category</span>
      </div>

      {/* Leaderboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Golden Boot */}
        {showAttacking && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Golden Boot
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Goals</span>
              </div>

              <div className="space-y-3">
                {scorers.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-3.5 font-mono text-slate-400 text-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{player.number}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">{player.goals}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                        style={{ width: `${((player.goals ?? 0) / maxGoals) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {scorers.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No goals recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Playmaker of the Year */}
        {showAttacking && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Playmaker of the Year
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Assists</span>
              </div>

              <div className="space-y-3">
                {playmakers.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-3.5 font-mono text-slate-400 text-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{player.number}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">{player.assists}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                        style={{ width: `${((player.assists ?? 0) / maxAssists) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {playmakers.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No assists recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Shot Leader & SOT */}
        {showAttacking && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Shot Leader
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Total (SOT · %)</span>
              </div>

              <div className="space-y-3">
                {shotLeaders.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-3.5 font-mono text-slate-400 text-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{player.number}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2 font-mono text-xs">
                        <span className="font-bold text-slate-900">{player.totalShots}</span>
                        <span className="text-slate-400 text-[10px] ml-1">({player.sot} · {player.sotRate}%)</span>
                      </div>
                    </div>
                    {/* Visual dual bar: dark segment is SOT, light segment is off-target */}
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-300" 
                        style={{ width: `${(player.sot / maxShots) * 100}%` }}
                        title={`${player.sot} on target`}
                      />
                      <div 
                        className="h-full bg-indigo-300 transition-all duration-300" 
                        style={{ width: `${(player.shots / maxShots) * 100}%` }}
                        title={`${player.shots} off target`}
                      />
                    </div>
                  </div>
                ))}
                {shotLeaders.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No shots recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Block Leader (Outfield non-GK) */}
        {showDefending && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Block Leader
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Outfield Stops</span>
              </div>

              <div className="space-y-3">
                {blockLeaders.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-3.5 font-mono text-slate-400 text-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{player.number}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">{player.blocks}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                        style={{ width: `${(player.blocks / maxBlocks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {blockLeaders.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No outfield blocks</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Foul Leader */}
        {showDefending && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Foul Leader
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Fouls</span>
              </div>

              <div className="space-y-3">
                {foulLeaders.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-3.5 font-mono text-slate-400 text-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{player.number}</span>
                      </div>
                      <div className="font-mono text-xs shrink-0 ml-2">
                        <span className="font-bold text-slate-900">{player.fouls}</span>
                        {player.yellows > 0 && (
                          <span className="text-amber-600 text-[10px] ml-1">({player.yellows} Y)</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-300" 
                        style={{ width: `${(player.fouls / maxFouls) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {foulLeaders.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No fouls recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Player of the Match */}
        {showDefending && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Player of the Match
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Awards</span>
              </div>

              <div className="space-y-3">
                {potmLeaders.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-3.5 font-mono text-slate-400 text-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{player.number}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-600 shrink-0 ml-2">{player.potm}x</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                        style={{ width: `${(player.potm / maxPotm) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {potmLeaders.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No awards recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. Net Impact (+/-) */}
        {showDefending && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Net Impact (+/-)
                  </h3>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {impactView === 'highest' ? 'Highest on court' : 'Lowest on court'}
                  </span>
                </div>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold font-mono">
                  <button
                    type="button"
                    onClick={() => setImpactView('highest')}
                    className={`px-2 py-0.5 rounded transition ${
                      impactView === 'highest' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    High (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImpactView('lowest')}
                    className={`px-2 py-0.5 rounded transition ${
                      impactView === 'lowest' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Low (-)
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {activeImpactList.map((player, index) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-3.5 font-mono text-slate-400 text-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{player.number}</span>
                      </div>
                      <span className={`font-mono font-bold text-xs shrink-0 ml-2 ${
                        player.plusMinus > 0 ? 'text-emerald-600' : player.plusMinus < 0 ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          player.plusMinus >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(12, (Math.abs(player.plusMinus) / maxImpactVal) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {activeImpactList.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No impact records</p>
                )}
              </div>
            </div>
            <div className="pt-2.5 mt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              (+) scored for · (-) scored against
            </div>
          </div>
        )}

        {/* 8. Goalkeeper Defending (Union) */}
        {showGoalkeeping && goalkeeper && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Goalkeeper Defending
                  </h3>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {goalkeeper.name} (#{goalkeeper.number})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{cleanSheetsCount} Shutouts</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Saves</span>
                  <strong className="text-base font-black font-mono text-slate-800">{savesCount}</strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Allowed</span>
                  <strong className="text-base font-black font-mono text-rose-600">{goalsAllowedCount}</strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Save %</span>
                  <strong className="text-base font-black font-mono text-emerald-600">{savePercentage}%</strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Clean Sheets</span>
                  <strong className="text-base font-black font-mono text-slate-800">{cleanSheetsCount}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
