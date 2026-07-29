import React, { useState } from 'react';
import { Player, Match } from '../types';
import { Award, Zap, Shield, TrendingUp, Sparkles, Trophy, Star, Activity, Heart, CalendarDays, Target, Flame, RefreshCw, ShieldAlert } from 'lucide-react';

interface StatsProps {
  players: Player[];
  seasons?: string[];
  activeSeason?: string;
  onSeasonChange?: (season: string) => void;
  matches?: Match[];
}

export const Stats: React.FC<StatsProps> = ({ players, seasons, activeSeason, onSeasonChange, matches = [] }) => {
  // Sorted players lists (filtering out players with 0 goals/assists to keep leaderboard clean)
  const scorers = [...players].filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals);
  const playmakers = [...players].filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists);

  // Maximum goals/assists for percentage bar widths
  const maxGoals = Math.max(...players.map(p => p.goals), 1);
  const maxAssists = Math.max(...players.map(p => p.assists), 1);

  // Totals & averages
  const totalGoals = players.reduce((acc, curr) => acc + curr.goals, 0);
  const totalAssists = players.reduce((acc, curr) => acc + curr.assists, 0);
  const avgGoalsPerPlayer = (totalGoals / (players.length || 1)).toFixed(1);

  // Team campaign performance calculations
  const completedMatches = matches.filter(m => m.status === 'Completed');
  const wins = completedMatches.filter(m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0)).length;
  const draws = completedMatches.filter(m => (m.toastyScore ?? 0) === (m.opponentScore ?? 0)).length;
  const losses = completedMatches.filter(m => (m.toastyScore ?? 0) < (m.opponentScore ?? 0)).length;
  const teamGoalsScored = completedMatches.reduce((acc, curr) => acc + (curr.toastyScore ?? 0), 0);
  const teamGoalsConceded = completedMatches.reduce((acc, curr) => acc + (curr.opponentScore ?? 0), 0);
  const teamGoalDifference = teamGoalsScored - teamGoalsConceded;
  
  const winRate = completedMatches.length > 0 
    ? ((wins / completedMatches.length) * 100).toFixed(0) 
    : '0';

  // Last 5 games form guide (oldest to newest)
  const lastMatches = [...completedMatches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5);

  // Plus/Minus (+/-) calculations
  const playersWithPlusMinus = [...players].map(p => {
    return { 
      ...p, 
      plusMinus: p.plusMinus ?? 0, 
      matchesWithPlayer: p.matchesPlayed ?? 0 
    };
  }).sort((a, b) => b.plusMinus - a.plusMinus);

  // Player of the Match calculations
  const potmLeaders = [...players]
    .map(p => ({
      name: p.name,
      count: p.potm ?? 0,
      number: p.number ?? 0,
      position: p.position ?? 'Squad Member'
    }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.count - a.count);

  // Enforcer rating (estimated fouls, hard tackles, pressing)
  const enforcers = [...players]
    .map(p => {
      const fouls = p.fouls ?? Math.round((p.skills?.physical ?? 50) * 0.15 + (p.position === 'Defender' ? 5 : p.position === 'Midfielder' ? 3 : 1));
      const tackles = Math.round((p.skills?.defending ?? 50) * 0.22 + (p.position === 'Defender' ? 7 : p.position === 'Midfielder' ? 4 : 1));
      return { ...p, fouls, tackles };
    })
    .sort((a, b) => b.fouls - a.fouls);

  // Shot Conversion calculations using real dynamic player stats
  const shotConversion = [...players]
    .map(p => {
      const realShots = (p as any).shots || 0;
      const realSOT = (p as any).shotsOnTarget || 0;
      
      let shots = realShots;
      let conversion = 0;
      
      if (shots > 0) {
        conversion = Math.round((p.goals / shots) * 100);
      } else if (p.goals > 0) {
        // Fallback for legacy/seed players
        const factor = 4.2 - ((p.skills?.shooting ?? 70) / 40);
        shots = Math.round(p.goals * factor);
        conversion = Math.round((p.goals / Math.max(shots, p.goals)) * 100);
      }
      return { ...p, conversion, estimatedShots: shots, realSOT };
    })
    .filter(p => p.goals > 0)
    .sort((a, b) => b.conversion - a.conversion);

  // Goalkeeper Specific stats
  const goalkeeper = players.find(p => p.position === 'Goalkeeper');
  const cleanSheetsCount = goalkeeper?.cleanSheets ?? 0;
  const savesCount = goalkeeper?.saves ?? 0;
  const goalsAllowedCount = goalkeeper?.goalsAllowed ?? 0;
  
  const totalShotsFaced = savesCount + goalsAllowedCount;
  const savePercentage = totalShotsFaced > 0 
    ? ((savesCount / totalShotsFaced) * 100).toFixed(1) 
    : '85.4';

  const saveRatio = goalsAllowedCount > 0 
    ? (savesCount / goalsAllowedCount).toFixed(2) 
    : savesCount > 0 ? 'Goalless' : '4.50';

  // Storytelling / Fun Metrics:
  // 1. Toast Points = Goals + Assists (Contributions)
  const toastPointsLeaders = [...players]
    .map(p => {
      const points = p.goals + p.assists;
      return { ...p, points };
    })
    .sort((a, b) => b.points - a.points);

  // 2. Post-game Pizza Slices Consumed (Calculated based on matches played + size + goals scored)
  const pizzaLeaders = [...players]
    .map(p => {
      const slices = p.matchesPlayed * 2 + p.goals * 3 + (p.name.includes('Greer') ? 8 : p.name.includes('Toasty') ? 6 : 2);
      return { ...p, slices };
    })
    .sort((a, b) => b.slices - a.slices);

  // 3. Laundry Duty Dodge success rate
  const laundryDodgers = [...players]
    .map(p => {
      let successRate = 50;
      if (p.isCaptain) successRate = 95; // Captain gets away with it
      else if (p.name.includes('Greer')) successRate = 100; // Master dodger
      else if (p.name.includes('Toasty')) successRate = 88;
      else if (p.position === 'Goalkeeper') successRate = 75; // "Gloves are hard to wash" excuse
      else successRate = Math.max(40, Math.round(80 - (p.number * 1.5)));
      return { ...p, successRate };
    })
    .sort((a, b) => b.successRate - a.successRate);

  // 4. Ref Argument Success rate (hilariously 0% for everyone)
  const refArguers = [...players]
    .map(p => {
      const argumentsAttempted = p.matchesPlayed * 3 + (p.name.includes('Toasty') ? 12 : 4);
      const successRate = 0;
      return { ...p, argumentsAttempted, successRate };
    })
    .sort((a, b) => b.argumentsAttempted - a.argumentsAttempted);

  return (
    <div className="space-y-8">
      {/* Overview Header & Dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="text-toasty-red animate-pulse" size={24} /> Statistics & Records
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Dynamic squad metrics, Golden Boot rankings, and locker-room lore from our active campaigns.
          </p>
        </div>

        {seasons && activeSeason && onSeasonChange && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 w-full md:w-auto shadow-sm self-start md:self-auto hover:border-toasty-red/50 transition">
            <CalendarDays size={14} className="text-toasty-red shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign:</span>
            <select
              value={activeSeason}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="bg-transparent text-slate-800 font-extrabold text-xs focus:outline-none cursor-pointer pr-1"
              id="stats-season-selector"
            >
              {seasons.map(season => (
                <option key={season} value={season} className="text-slate-800 font-sans font-semibold">
                  {season === 'All Seasons' ? 'All-Time Records' : season}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Season Performance Summary Panel (Matches Season Performance card on Home) */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
        {/* Ambient top right glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-toasty-red/10 via-transparent to-transparent pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-900">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Trophy className="text-toasty-tan" size={20} /> Season Performance Overview
            </h3>
            <p className="text-xs text-slate-400">
              Overview of Toasty FC's competitive fixtures, goal metrics, and form trajectory for <strong className="text-toasty-tan font-mono font-bold">{activeSeason === 'All Seasons' ? 'All Seasons' : activeSeason}</strong>.
            </p>
          </div>
          <div className="bg-toasty-red/20 border border-toasty-red/40 rounded-full px-4 py-1.5 flex items-center gap-2 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-toasty-red animate-pulse" />
            <span className="text-[10px] font-bold text-red-300 font-mono uppercase tracking-widest">{completedMatches.length} Fixtures Played</span>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Record Split */}
          <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Record Split</span>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-0.5 rounded-full font-mono">
                {winRate}% Wins
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-emerald-400 font-bold uppercase font-mono tracking-wider">Wins</span>
                <strong className="text-2xl font-black font-mono text-emerald-400 block mt-0.5">{wins}</strong>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-amber-400 font-bold uppercase font-mono tracking-wider">Draws</span>
                <strong className="text-2xl font-black font-mono text-amber-400 block mt-0.5">{draws}</strong>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-rose-400 font-bold uppercase font-mono tracking-wider">Losses</span>
                <strong className="text-2xl font-black font-mono text-rose-400 block mt-0.5">{losses}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Goal Matrix */}
          <div className="md:col-span-4 bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Goal Matrix</span>
              <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full border shadow-sm ${
                teamGoalDifference > 0 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : teamGoalDifference < 0 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {teamGoalDifference > 0 ? `+${teamGoalDifference}` : teamGoalDifference} GD
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-center">
                <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Scored</span>
                <strong className="text-lg font-black font-mono text-white block mt-0.5">{teamGoalsScored}</strong>
                <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                  {(teamGoalsScored / (completedMatches.length || 1)).toFixed(1)} / game
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-center">
                <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Conceded</span>
                <strong className="text-lg font-black font-mono text-rose-400 block mt-0.5">{teamGoalsConceded}</strong>
                <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                  {(teamGoalsConceded / (completedMatches.length || 1)).toFixed(1)} / game
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Form Guide */}
          <div className="md:col-span-3 bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Recent Form</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">L to R</span>
            </div>

            {completedMatches.length > 0 ? (
              <div className="flex flex-col justify-center items-center py-1 space-y-2">
                <div className="flex items-center gap-1.5">
                  {lastMatches.map((m) => {
                    const isWin = (m.toastyScore ?? 0) > (m.opponentScore ?? 0);
                    const isDraw = (m.toastyScore ?? 0) === (m.opponentScore ?? 0);
                    let colorClass = 'bg-rose-500 text-white border-rose-400/30';
                    let text = 'L';
                    if (isWin) {
                      colorClass = 'bg-emerald-500 text-slate-950 border-emerald-400/30';
                      text = 'W';
                    } else if (isDraw) {
                      colorClass = 'bg-amber-500 text-slate-950 border-amber-400/30';
                      text = 'D';
                    }
                    return (
                      <div 
                        key={m.id} 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-md border ${colorClass}`}
                        title={`${text} vs ${m.opponent} (${m.toastyScore}-${m.opponentScore})`}
                      >
                        {text}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[9px] text-slate-400 font-mono font-medium text-center truncate w-full px-1">
                  Last Opp: {lastMatches[lastMatches.length - 1]?.opponent ?? 'None'}
                </span>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-xs italic">
                No completed fixtures found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Leaders Section Header */}
      <div className="pt-2 border-b border-slate-100 pb-3">
        <h3 className="text-xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Trophy size={18} className="text-amber-500 shrink-0" /> Performance Leaders
        </h3>
        <p className="text-slate-500 text-xs font-medium">Golden Boot rankings, Playmaker of the year, and goalkeeper statistics.</p>
      </div>

      <div className="space-y-8 animate-fade-in">
          {/* Bento Grid Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Total Goals</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap size={14} />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black font-mono">{totalGoals}</div>
                <p className="text-xs text-slate-400 mt-1">Scored across all active fixtures</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Playmaking Assists</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Star size={14} />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black font-mono">{totalAssists}</div>
                <p className="text-xs text-slate-400 mt-1">Key assists leading directly to goals</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Clean Sheets</span>
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Shield size={14} />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black font-mono">{cleanSheetsCount}</div>
                <p className="text-xs text-slate-400 mt-1">Shutouts recorded on the season</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-amber-400 font-mono text-xs uppercase tracking-wider">Squad Efficiency</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Award size={14} />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black font-mono">{avgGoalsPerPlayer}</div>
                <p className="text-xs text-slate-400 mt-1">Average goals per active squad member</p>
              </div>
            </div>
          </div>

          {/* Traditional Leaderboards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Scorers */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                  <Activity size={16} className="text-amber-500 shrink-0" /> Golden Boot Leaderboard
                </h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-mono font-medium">
                  Top Finishers
                </span>
              </div>

              <div className="space-y-4">
                {scorers.map((player, index) => (
                  <div key={player.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-5 font-mono text-xs font-bold text-slate-400 text-center">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{player.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 rounded-full font-mono font-medium">
                          #{player.number}
                        </span>
                      </div>
                      <span className="font-mono font-black text-slate-900">{player.goals} Goals</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${(player.goals / maxGoals) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {scorers.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No goals recorded in this campaign.</p>
                )}
              </div>
            </div>

            {/* Top Playmakers (Assists) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                  <Target size={16} className="text-emerald-500 shrink-0" /> Playmaker of the Year
                </h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-mono font-medium">
                  Top Assists
                </span>
              </div>

              <div className="space-y-4">
                {playmakers.map((player, index) => (
                  <div key={player.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-5 font-mono text-xs font-bold text-slate-400 text-center">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{player.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 rounded-full font-mono font-medium">
                          #{player.number}
                        </span>
                      </div>
                      <span className="font-mono font-black text-slate-900">{player.assists} Assists</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(player.assists / maxAssists) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {playmakers.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-4 text-center">No assists recorded in this campaign.</p>
                )}
              </div>
            </div>
          </div>

          {/* Goalkeeping stats portal */}
          {goalkeeper && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield size={16} className="text-rose-500 shrink-0" /> Goalkeeper Union & Defending Stats
                  </h3>
                  <p className="text-xs text-slate-500">Goalkeeper efficiency breakdown for {goalkeeper.name} (#{goalkeeper.number})</p>
                </div>
                <span className="text-[10px] bg-rose-500/10 text-rose-600 font-bold px-2.5 py-1 rounded-full border border-rose-500/20 font-mono uppercase tracking-wider">
                  Guard of the Net
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Saves Recorded</span>
                  <strong className="text-2xl font-black text-slate-800 font-mono mt-1 block">{savesCount}</strong>
                  <span className="text-[10px] text-slate-500 mt-1 block font-sans">Active, reflexive blocks</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Goals Conceded</span>
                  <strong className="text-2xl font-black text-rose-600 font-mono mt-1 block">{goalsAllowedCount}</strong>
                  <span className="text-[10px] text-slate-500 mt-1 block font-sans">Total goals let in</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Save Percentage</span>
                  <strong className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{savePercentage}%</strong>
                  <span className="text-[10px] text-slate-500 mt-1 block font-sans">Saves per shot on target</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Saves Ratio</span>
                  <strong className="text-2xl font-black text-amber-600 font-mono mt-1 block">{saveRatio}</strong>
                  <span className="text-[10px] text-slate-500 mt-1 block font-sans">Saves / Goals Against</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Club Lore & Vibes Section Header */}
        <div className="pt-8 border-t border-slate-200/80">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500 shrink-0" /> Club Lore & Vibes
            </h3>
            <p className="text-slate-500 text-xs font-medium">Locker room statistics, enforcer rankings, and humorous team highlights.</p>
          </div>
        </div>

        {/* Vibe Check and Locker Room Lore Grid */}
        <div className="space-y-8 animate-fade-in mt-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Plus/Minus Impact Leader */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Impact Leader (+/-)</span>
                  <span className="p-1 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <TrendingUp size={12} />
                  </span>
                </div>
                <div>
                  <strong className="text-lg font-black text-slate-900 block truncate">
                    {playersWithPlusMinus[0]?.name ?? 'None'}
                  </strong>
                  <span className="text-2xl font-black font-mono text-blue-600">
                    {playersWithPlusMinus[0]?.plusMinus > 0 ? '+' : ''}{playersWithPlusMinus[0]?.plusMinus ?? 0} GD
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Goal differential of the team while this player was on the roster.
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Top Impact Makers</span>
                {playersWithPlusMinus.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center text-[11px] font-medium text-slate-600">
                    <span className="truncate max-w-[120px]">{i+1}. {p.name}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {p.plusMinus > 0 ? '+' : ''}{p.plusMinus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Foul Leaders / Enforcers */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Enforcer (Fouls)</span>
                  <span className="p-1 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    <Flame size={12} />
                  </span>
                </div>
                <div>
                  <strong className="text-lg font-black text-slate-900 block truncate">
                    {enforcers[0]?.name ?? 'None'}
                  </strong>
                  <span className="text-2xl font-black font-mono text-rose-600">
                    {enforcers[0]?.fouls ?? 0} Fouls
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Aggressive sliding tackles, tactical blockings, and pressing interventions.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Foul & Tackle leaders</span>
                {enforcers.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center text-[11px] font-medium text-slate-600">
                    <span className="truncate max-w-[120px]">{i+1}. {p.name}</span>
                    <span className="font-mono font-bold text-slate-900">{p.fouls} Fls &bull; {p.tackles} Tkl</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Toast Points (Goal + Assist Involvement) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Toast Master (G+A)</span>
                  <span className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Zap size={12} />
                  </span>
                </div>
                <div>
                  <strong className="text-lg font-black text-slate-900 block truncate">
                    {toastPointsLeaders[0]?.name ?? 'None'}
                  </strong>
                  <span className="text-2xl font-black font-mono text-amber-500">
                    {toastPointsLeaders[0]?.points ?? 0} Points
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Sum of goal scoring and key assists combined on our active campaign.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Top Scorers + Creators</span>
                {toastPointsLeaders.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center text-[11px] font-medium text-slate-600">
                    <span className="truncate max-w-[120px]">{i+1}. {p.name}</span>
                    <span className="font-mono font-bold text-slate-900">{p.points} Pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Post-match Pizza Consumption */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Pizza Slices MVP</span>
                  <span className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Heart size={12} className="fill-amber-500/20" />
                  </span>
                </div>
                <div>
                  <strong className="text-lg font-black text-slate-900 block truncate">
                    {pizzaLeaders[0]?.name ?? 'None'}
                  </strong>
                  <span className="text-2xl font-black font-mono text-amber-500">
                    {pizzaLeaders[0]?.slices ?? 0} Slices
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Estimated post-match celebration pepperoni slices eaten in the locker room.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Locker Room Pizza Standings</span>
                {pizzaLeaders.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center text-[11px] font-medium text-slate-600">
                    <span className="truncate max-w-[120px]">{i+1}. {p.name}</span>
                    <span className="font-mono font-bold text-slate-900">{p.slices} Slices</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Expanded Fun Lore Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Laundry Dodger Leaderboard */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
                    <Activity size={15} className="text-indigo-500 shrink-0" /> Laundry Duty Dodgers
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">Who successfully dodged washing the jerseys</p>
                </div>
                <span className="text-[9px] font-bold font-mono text-amber-600 uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Dodge Rate %
                </span>
              </div>

              <div className="space-y-3.5">
                {laundryDodgers.slice(0, 5).map((player, idx) => (
                  <div key={player.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-400 w-4">{idx+1}.</span>
                      <span className="font-bold text-slate-800">{player.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono font-medium">#{player.number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 sm:w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${player.successRate}%` }} />
                      </div>
                      <span className="font-mono font-black text-slate-900 text-xs">{player.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ref Argument Success Rates */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
                    <ShieldAlert size={15} className="text-rose-500 shrink-0" /> Ref Argument Success Rate
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">Total minutes argued with referee vs decisions overturned</p>
                </div>
                <span className="text-[9px] font-bold font-mono text-rose-600 uppercase bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  Wins: 0
                </span>
              </div>

              <div className="space-y-3.5">
                {refArguers.slice(0, 5).map((player, idx) => (
                  <div key={player.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-400 w-4">{idx+1}.</span>
                      <span className="font-bold text-slate-800">{player.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono font-medium">#{player.number}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 block font-mono">{player.argumentsAttempted} Debates</span>
                      <span className="text-[9px] font-mono text-rose-500 block">Success: {player.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
    </div>
  );
};
