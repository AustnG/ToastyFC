import React, { useState } from 'react';
import { Match, Player, MatchStats } from '../types';
import { Calendar, MapPin, ChevronDown, ChevronUp, Sparkles, Trophy, Plus, Clock, Award, CalendarDays, Target, TrendingUp, Activity, UserCheck, ShieldAlert, Edit2, Save, X, PlusCircle, Star, Shield } from 'lucide-react';

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
  hours = hours ? hours : 12; // '0' should be '12'
  
  return `${hours}:${minutes} ${ampm} CT`;
};

interface MatchesProps {
  matches: Match[];
  seasons?: string[];
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

    // Fetch existing stats for this match
    const existing = playerMatchStats.filter(pms => pms.matchId === matchId);
    
    // Find players who belong to the roster for this season or any players as fallback
    const seasonPlayers = players.filter(p => {
      // Return true if player is on the roster for this season, or simply exists
      return p.name;
    });

    // Merge existing stats or create blank default records
    const populated: MatchStats[] = seasonPlayers.map(p => {
      const found = existing.find(ex => ex.playerId === p.id);
      if (found) {
        return { 
          ...found,
          present: found.present !== false, // Default to true if not explicitly false
          // Ensure number format
          goals: Number(found.goals || 0),
          assists: Number(found.assists || 0),
          shots: Number(found.shots || 0),
          shotsOnTarget: Number(found.shotsOnTarget || 0),
          blocks: Number(found.blocks || 0),
          saves: found.saves !== undefined ? Number(found.saves) : (p.position === 'Goalkeeper' ? 0 : undefined),
          goalsAllowed: found.goalsAllowed !== undefined ? Number(found.goalsAllowed) : (p.position === 'Goalkeeper' ? 0 : undefined),
          plusMinus: found.plusMinus !== undefined ? Number(found.plusMinus) : 0,
          fouls: found.fouls !== undefined ? Number(found.fouls) : 0,
          yellows: found.yellows !== undefined ? Number(found.yellows) : 0,
          reds: found.reds !== undefined ? Number(found.reds) : 0,
          potm: found.potm === true || found.potm === 'true',
          cleanSheet: found.cleanSheet === true || found.cleanSheet === 'true'
        };
      }
      return {
        id: `pms_${matchId}_${p.id}`,
        matchId: matchId,
        playerId: p.id,
        playerName: p.name,
        present: false, // Start as absent in the UI checklist until checked
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

  const handleTempStatChange = (playerId: string, field: keyof MatchStats, value: any) => {
    setTempStats(prev => prev.map(stat => {
      if (stat.playerId === playerId) {
        if (field === 'present' || field === 'potm' || field === 'cleanSheet') {
          return { ...stat, [field]: value };
        }
        return { ...stat, [field]: Number(value) };
      }
      return stat;
    }));
  };

  const handleSaveStats = () => {
    if (!editingMatchId || !onSavePlayerMatchStats) return;
    
    // Filter out old records for this match
    const otherStats = playerMatchStats.filter(pms => pms.matchId !== editingMatchId);
    
    // Only save stats for players who were present (checked in UI)!
    const presentStats = tempStats.filter(s => s.present === true || s.present === 'true');
    
    onSavePlayerMatchStats([...otherStats, ...presentStats]);
    setEditingMatchId(null);
  };

  const filteredMatches = matches
    .filter(m => {
      if (filter === 'Upcoming') return m.status === 'Upcoming';
      if (filter === 'Completed') return m.status === 'Completed';
      return true;
    })
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeB.localeCompare(timeA);
    });

  const toggleExpand = (id: string) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  // Dynamic Season Stats for Overview Segment
  const completedMatches = matches.filter(m => m.status === 'Completed');
  const totalMatchesCount = matches.length;
  const completedCount = completedMatches.length;

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsScored = 0;
  let goalsConceded = 0;

  const chronologicalCompleted = [...completedMatches].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    const timeA = a.time || '';
    const timeB = b.time || '';
    return timeA.localeCompare(timeB);
  });

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
    if (ts > os) return { result: 'W', bg: 'bg-toasty-red text-white border border-red-500/40 shadow-sm font-bold', label: `Win vs ${m.opponent}` };
    if (ts === os) return { result: 'D', bg: 'bg-toasty-tan text-slate-950 border border-amber-200/50 shadow-sm font-bold', label: `Draw vs ${m.opponent}` };
    return { result: 'L', bg: 'bg-stone-800 text-stone-300 border border-stone-700 shadow-sm font-bold', label: `Loss vs ${m.opponent}` };
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="text-toasty-red" size={24} /> Match Center
          </h2>
          <p className="text-slate-500 text-sm">
            Keep up with upcoming fixtures, field locations, and live results from our games.
          </p>
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {seasons && activeSeason && onSeasonChange && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto shadow-sm">
              <CalendarDays size={14} className="text-toasty-red shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign:</span>
              <select
                value={activeSeason}
                onChange={(e) => onSeasonChange(e.target.value)}
                className="bg-transparent text-slate-800 font-extrabold text-xs focus:outline-none cursor-pointer pr-1"
                id="matches-season-selector"
              >
                {seasons.map(season => (
                  <option key={season} value={season} className="text-slate-800 font-sans font-semibold">
                    {season}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filters */}
          <div className="bg-slate-100 p-1 rounded-xl flex w-full sm:w-auto justify-center">
            {['All', 'Upcoming', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition text-center ${
                  filter === f 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                id={`filter-matches-${f.toLowerCase()}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Season Overview Segment */}
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0" id="matches-season-overview">
        {/* Record Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-md flex items-center justify-between transition-all duration-200 min-w-[280px] sm:min-w-0 shrink-0 snap-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campaign Record</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {wins}-{draws}-{losses}
              </span>
              <span className="text-xs text-slate-400 font-medium font-sans">W-D-L</span>
            </div>
            <span className="text-[11px] text-slate-400 block font-medium">
              {completedCount} of {totalMatchesCount} games played
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-toasty-tan/15 border border-toasty-tan/30 flex items-center justify-center text-toasty-tan shrink-0">
            <Trophy size={20} />
          </div>
        </div>

        {/* Goals Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-md flex items-center justify-between transition-all duration-200 min-w-[280px] sm:min-w-0 shrink-0 snap-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Goals & GD</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {goalsScored}:{goalsConceded}
              </span>
              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                goalDiff > 0 
                  ? 'bg-toasty-red/20 text-red-300 border-toasty-red/40' 
                  : goalDiff < 0 
                    ? 'bg-stone-800 text-stone-300 border-stone-700' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {goalDiff > 0 ? `+${goalDiff}` : goalDiff} GD
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block font-medium">
              Avg. {completedCount > 0 ? (goalsScored / completedCount).toFixed(1) : 0} goals/game
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-toasty-red/20 border border-toasty-red/40 flex items-center justify-center text-red-300 shrink-0">
            <Target size={20} />
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-md flex items-center justify-between transition-all duration-200 min-w-[280px] sm:min-w-0 shrink-0 snap-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Win Percentage</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                {winRate}%
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase font-mono">Rate</span>
            </div>
            {/* simple micro progress bar */}
            <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
              <div 
                className="h-full bg-toasty-red rounded-full animate-pulse" 
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-toasty-tan/15 border border-toasty-tan/30 flex items-center justify-center text-toasty-tan shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Form Guide Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-md flex items-center justify-between transition-all duration-200 min-w-[280px] sm:min-w-0 shrink-0 snap-start">
          <div className="space-y-1.5 w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent Form</span>
            <div className="flex items-center gap-1.5">
              {formGuide.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No games played yet</span>
              ) : (
                formGuide.map((game, i) => (
                  <div 
                    key={i} 
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-black select-none ${game.bg} cursor-help shadow-sm`}
                    title={game.label}
                  >
                    {game.result}
                  </div>
                ))
              )}
            </div>
            {formGuide.length > 0 && (
              <span className="text-[9px] text-slate-400 block font-medium">
                Newest matches on the right
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-toasty-red/20 border border-toasty-red/40 flex items-center justify-center text-red-300 shrink-0 self-start">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-4">
        {filteredMatches.map(match => {
          const isCompleted = match.status === 'Completed';
          const isUpcoming = match.status === 'Upcoming';
          const isExpanded = expandedMatchId === match.id;
          
          // Determine who won
          const didToastyWin = isCompleted && (match.toastyScore ?? 0) > (match.opponentScore ?? 0);
          const didToastyDraw = isCompleted && (match.toastyScore ?? 0) === (match.opponentScore ?? 0);
          const didToastyLose = isCompleted && (match.toastyScore ?? 0) < (match.opponentScore ?? 0);

          let outcomeBadge = null;
          if (isCompleted) {
            if (didToastyWin) {
              outcomeBadge = <span className="bg-toasty-red/15 text-toasty-red border border-toasty-red/30 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Win</span>;
            } else if (didToastyDraw) {
              outcomeBadge = <span className="bg-toasty-tan/25 text-toasty-tan-dark border border-toasty-tan/40 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Draw</span>;
            } else {
              outcomeBadge = <span className="bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Loss</span>;
            }
          }

          // Playoff Stage Detection Function
          const getPlayoffStage = (): 'quarter' | 'semi' | 'final' | null => {
            const textToSearch = [
              match.opponent,
              match.summary,
              match.location,
              match.type
            ].filter(Boolean).join(' ').toLowerCase();

            if (textToSearch.includes('quarter final') || textToSearch.includes('quarter-final') || textToSearch.includes('quarterfinal')) {
              return 'quarter';
            }
            if (textToSearch.includes('semi final') || textToSearch.includes('semi-final') || textToSearch.includes('semifinal')) {
              return 'semi';
            }
            const hasFinal = /\b(final|finals|grandfinal)\b/i.test(textToSearch) && 
                             !textToSearch.includes('final score') && 
                             !textToSearch.includes('final whistle');
            if (hasFinal) {
              return 'final';
            }
            return null;
          };

          const playoffStage = getPlayoffStage();
          
          let cardBorderClass = 'border-slate-200 hover:border-slate-300';
          let cardRingClass = isExpanded ? 'border-toasty-red ring-4 ring-toasty-red/10' : '';
          let headerBgClass = 'bg-slate-50';
          let playoffBadge = null;

          if (playoffStage === 'final') {
            cardBorderClass = 'border-toasty-red hover:border-toasty-red-bright';
            cardRingClass = isExpanded 
              ? 'border-toasty-red ring-4 ring-toasty-red/15 shadow-lg shadow-toasty-red/10' 
              : 'shadow-md shadow-toasty-red/5';
            headerBgClass = 'bg-gradient-to-r from-toasty-red/15 via-toasty-tan/10 to-transparent border-b border-toasty-red/20';
            playoffBadge = (
              <span className="bg-toasty-red text-white border border-red-500/30 font-mono text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Trophy size={10} className="shrink-0 text-toasty-tan" /> Cup Final
              </span>
            );
          } else if (playoffStage === 'semi') {
            cardBorderClass = 'border-toasty-tan hover:border-toasty-tan-hover';
            cardRingClass = isExpanded 
              ? 'border-toasty-tan ring-4 ring-toasty-tan/15 shadow-lg shadow-toasty-tan/10' 
              : 'shadow-md shadow-toasty-tan/5';
            headerBgClass = 'bg-gradient-to-r from-toasty-tan/20 via-toasty-tan-light/10 to-transparent border-b border-toasty-tan/30';
            playoffBadge = (
              <span className="bg-toasty-tan text-slate-950 border border-amber-200/50 font-mono text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Shield size={10} className="shrink-0 text-toasty-red" /> Semi Final
              </span>
            );
          } else if (playoffStage === 'quarter') {
            cardBorderClass = 'border-stone-300 hover:border-stone-400';
            cardRingClass = isExpanded 
              ? 'border-slate-700 ring-4 ring-slate-400/10 shadow-lg shadow-slate-950/5' 
              : 'shadow-md shadow-slate-950/5';
            headerBgClass = 'bg-slate-100/70 border-b border-slate-200';
            playoffBadge = (
              <span className="bg-slate-800 text-slate-200 font-mono text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Activity size={10} className="shrink-0 text-toasty-tan" /> Quarter Final
              </span>
            );
          }

          return (
            <div
              key={match.id}
              className={`border rounded-3xl overflow-hidden transition-all bg-white flex flex-col ${cardBorderClass} ${cardRingClass} ${
                playoffStage ? 'border-l-4' : ''
              } ${
                playoffStage === 'final' 
                  ? 'border-l-amber-500' 
                  : playoffStage === 'semi' 
                    ? 'border-l-indigo-500' 
                    : playoffStage === 'quarter' 
                      ? 'border-l-sky-500' 
                      : ''
              }`}
              id={`match-row-${match.id}`}
            >
              {/* Match Card Top Header Bar */}
              <div className={`${headerBgClass} px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs`}>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400" />
                  <span className="font-bold text-slate-700 font-mono">{match.date}</span>
                  <span className="text-slate-300 font-bold font-mono">&bull;</span>
                  <span className="text-slate-500 font-semibold font-mono">{formatTo12Hour(match.time)}</span>
                  <span className="bg-slate-200 text-slate-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    {match.type}
                  </span>
                  {playoffBadge}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <MapPin size={13} className="text-toasty-red shrink-0" />
                  <span>{match.location}</span>
                </div>
              </div>

              {/* Match Card Main Body - Balanced Scoreboard Layout */}
              <div 
                onClick={() => isCompleted && toggleExpand(match.id)}
                className={`p-4 sm:p-6 md:p-8 ${
                  isCompleted ? 'cursor-pointer hover:bg-slate-50/35' : ''
                }`}
              >
                <div className="flex flex-row items-center justify-between gap-3 sm:gap-6">
                  
                  {/* Left Side: Home Team (Toasty FC) */}
                  <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-950 border border-toasty-tan/30 p-1 flex items-center justify-center shadow-sm shrink-0">
                      <img 
                        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                        alt="Toasty FC Logo" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-slate-900 block text-xs sm:text-base md:text-lg truncate leading-tight">
                        Toasty FC
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-toasty-red font-black font-mono uppercase tracking-wider">
                        Home
                      </span>
                    </div>
                  </div>

                  {/* Center Scoreboard Block (Absolute center focus) */}
                  <div className="shrink-0 flex flex-col items-center justify-center gap-1.5 py-1 min-w-[70px] sm:min-w-[120px]">
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 sm:gap-3 font-mono">
                        <span className={`text-base sm:text-2xl md:text-3xl font-black w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-sm sm:shadow-md border ${
                          didToastyWin 
                            ? 'bg-toasty-red text-white border-red-500/40' 
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {match.toastyScore}
                        </span>
                        <span className="text-slate-300 font-bold text-sm sm:text-lg md:text-2xl">-</span>
                        <span className={`text-base sm:text-2xl md:text-3xl font-black w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-sm sm:shadow-md border ${
                          didToastyLose 
                            ? 'bg-stone-700 text-white border-stone-600' 
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {match.opponentScore}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-toasty-red text-white font-black font-mono text-[10px] sm:text-xs md:text-sm px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-2xl flex items-center gap-1 sm:gap-1.5 shadow-md uppercase tracking-wider border border-red-500/30">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-toasty-tan" /> VS
                      </div>
                    )}

                    {/* Outcome / Info badge beneath the score */}
                    <div className="text-center">
                      {isCompleted ? (
                        <div className="flex flex-col items-center gap-1">
                          {outcomeBadge}
                          <span className="text-[8px] sm:text-[10px] font-mono text-slate-400 font-semibold hover:text-slate-600 transition flex items-center gap-0.5">
                            {isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}
                          </span>
                        </div>
                      ) : (
                        <span className="bg-toasty-red/15 text-toasty-red border border-toasty-red/30 text-[8px] sm:text-[10px] font-bold uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-mono tracking-wider">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Away Team */}
                  <div className="flex-1 flex flex-col sm:flex-row-reverse items-center gap-2 sm:gap-4 text-center sm:text-right min-w-0">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                      style={{ 
                        backgroundColor: match.opponentColor ? `${match.opponentColor}15` : '#F5EFE6', 
                        border: match.opponentColor ? `1px solid ${match.opponentColor}30` : '1px solid #D6C5AD' 
                      }}
                    >
                      <Shield size={18} style={{ color: match.opponentColor || '#8C7A6B' }} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-slate-800 block text-xs sm:text-base md:text-lg truncate leading-tight">
                        {match.opponent}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-black font-mono uppercase tracking-wider">
                        Away
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Collapsible Match Summary Box */}
              {isCompleted && isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-100 p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Match report text column */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                          <Sparkles size={12} className="text-toasty-red" /> Match Report
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{match.summary}</p>
                      </div>

                      {/* Split Goals Record panel if goals were scored */}
                      {(match.goalScorersDetails || match.opponentGoalScorersDetails) && (
                        <div className="pt-4 border-t border-slate-200/60">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3">Timeline of Scorers</h4>
                          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              {/* Left side: Toasty FC */}
                              <div className="border-r border-slate-100 pr-2 space-y-1.5 text-left">
                                <span className="block text-[9px] font-mono font-black text-toasty-red uppercase tracking-widest mb-1.5">Toasty FC</span>
                                {match.goalScorersDetails ? (
                                  match.goalScorersDetails.split(',').map((scorer, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-slate-700 font-medium">
                                      <Target size={12} className="text-toasty-red shrink-0" />
                                      <span className="truncate">{scorer.trim()}</span>
                                    </div>
                                  ))
                                ) : (
                                  match.goalsScoredBy?.map((scorer, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-slate-700 font-medium">
                                      <Target size={12} className="text-toasty-red shrink-0" />
                                      <span className="truncate">{scorer}</span>
                                    </div>
                                  ))
                                )}
                                {(!match.goalScorersDetails && (!match.goalsScoredBy || match.goalsScoredBy.length === 0)) && (
                                  <span className="text-slate-400 text-[11px] italic block">No goals</span>
                                )}
                              </div>

                              {/* Right side: Opponent */}
                              <div className="pl-2 space-y-1.5 text-right">
                                <span className="block text-[9px] font-mono font-black text-stone-600 uppercase tracking-widest mb-1.5 truncate">{match.opponent}</span>
                                {match.opponentGoalScorersDetails ? (
                                  match.opponentGoalScorersDetails.split(',').map((scorer, idx) => (
                                    <div key={idx} className="flex items-center justify-end gap-1.5 text-slate-700 font-medium">
                                      <span className="truncate">{scorer.trim()}</span>
                                      <Target size={12} className="text-stone-500 shrink-0" />
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-[11px] italic block">No goals</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Player of the Match Award */}
                      {match.playerOfTheMatch && (
                        <div className="pt-4 border-t border-slate-200/60 flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-toasty-red/10 text-toasty-red border border-toasty-red/20">
                            <Award size={14} className="fill-toasty-red/15" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-none">Player of the Match</span>
                            <span className="text-xs font-extrabold text-slate-800 mt-1 block">{match.playerOfTheMatch}</span>
                          </div>
                        </div>
                      )}

                      {/* YouTube highlights Link */}
                      {(() => {
                        const ytUrl = match.youtubeUrl || (match as any).YouTubeurl || (match as any).YouTubeUrl || (match as any).youtube_url || (match as any)['YouTube URL'];
                        if (!ytUrl || String(ytUrl).trim() === '' || String(ytUrl).toLowerCase() === 'null') return null;
                        return (
                          <div className="pt-4 border-t border-slate-200/60">
                            <a
                              href={String(ytUrl).trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 bg-toasty-red hover:bg-toasty-red-hover text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition-all duration-200 w-full border border-red-500/30"
                            >
                              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                              Watch Video Highlights
                            </a>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Statistics Comparison Columns */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 border-b border-slate-50 pb-2">
                        <Activity size={12} className="text-toasty-red shrink-0" /> Full Match Statistics (TFC vs {match.opponent})
                      </h4>
                      
                      {match.stats ? (
                        <div className="space-y-3.5">
                          {Object.entries(match.stats)
                            .filter(([statKey]) => statKey !== 'goals')
                            .map(([statKey, values]) => {
                              const toastyVal = (values as any).toasty;
                              const oppVal = (values as any).opponent;
                            const total = toastyVal + oppVal || 1;
                            const toastyPercent = (toastyVal / total) * 100;
                            
                            // Humanize labels
                            const labels: Record<string, string> = {
                              goals: 'Goals',
                              assists: 'Assists',
                              shots: 'Total Shots',
                              shotsOnTarget: 'Shots on Target',
                              blocks: 'Blocks',
                              fouls: 'Fouls Committed',
                              redCards: 'Red Cards',
                              yellowCards: 'Yellow Cards',
                              saves: 'Goalkeeper Saves',
                              corners: 'Corner Kicks',
                            };
                            
                            return (
                              <div key={statKey} className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <span className="font-bold text-toasty-red w-12 text-left">{toastyVal}</span>
                                  <span className="text-slate-500 font-medium uppercase text-[10px] tracking-wide">
                                    {labels[statKey] || statKey}
                                  </span>
                                  <span className="font-bold text-slate-600 w-12 text-right">{oppVal}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full flex overflow-hidden">
                                  <div 
                                    className="h-full bg-toasty-red transition-all duration-500" 
                                    style={{ width: `${toastyPercent}%` }}
                                  />
                                  <div 
                                    className="h-full bg-toasty-tan transition-all duration-500" 
                                    style={{ width: `${100 - toastyPercent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-slate-400 italic">
                          Detailed team statistics for this game will be synced with your Google Sheet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full-width Row: Individual Player Performance Breakdown */}
                  <div className="pt-6 border-t border-slate-200/60 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
                          <UserCheck size={14} className="text-amber-500" /> Individual Player Stats & Attendance
                        </h4>
                        <p className="text-slate-400 text-[10px] font-mono mt-0.5">Stats recorded specifically for this completed fixture</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => startEditing(match.id)}
                          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-mono text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm transition cursor-pointer border border-amber-400"
                        >
                          <Edit2 size={12} /> Edit Individual Stats
                        </button>
                      )}
                    </div>

                    {playerMatchStats.filter(pms => pms.matchId === match.id && pms.present).length > 0 ? (
                      <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto font-sans">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50/75 border-b border-slate-100 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                                <th className="px-4 py-3 font-bold">Player</th>
                                <th className="px-4 py-3 text-center font-bold">Position</th>
                                <th className="px-4 py-3 text-center font-bold">Goals</th>
                                <th className="px-4 py-3 text-center font-bold">Assists</th>
                                <th className="px-4 py-3 text-center font-bold">Shots (SOT)</th>
                                <th className="px-4 py-3 text-center font-bold">Conversion</th>
                                <th className="px-4 py-3 text-center font-bold">Blocks</th>
                                <th className="px-4 py-3 text-center font-bold">GK Saves / GA</th>
                                <th className="px-4 py-3 text-center font-bold">+/-</th>
                                <th className="px-4 py-3 text-center font-bold">Fouls</th>
                                <th className="px-4 py-3 text-center font-bold">Cards</th>
                                <th className="px-4 py-3 text-center font-bold">CS</th>
                                <th className="px-4 py-3 text-center font-bold">Award</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {playerMatchStats
                                .filter(pms => pms.matchId === match.id && pms.present)
                                .map(stat => {
                                  const playerObj = players.find(p => p.id === stat.playerId);
                                  const number = playerObj?.number;
                                  const isGK = playerObj?.position === 'Goalkeeper';
                                  const shotAccuracy = stat.shots > 0 ? Math.round((stat.shotsOnTarget / stat.shots) * 100) : 0;
                                  const conversionRate = stat.shotsOnTarget > 0 ? Math.round((stat.goals / stat.shotsOnTarget) * 100) : 0;

                                  return (
                                    <tr key={stat.id} className="hover:bg-slate-50/50 transition">
                                      <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                                        {number !== undefined && number !== null && (
                                          <span className="bg-slate-100 text-slate-600 font-mono font-black text-[9px] px-1.5 py-0.5 rounded">
                                            #{number}
                                          </span>
                                        )}
                                        <span>{stat.playerName}</span>
                                      </td>
                                      <td className="px-4 py-3 text-center text-slate-500 font-mono font-bold text-[10px] uppercase">
                                        {playerObj?.position || '—'}
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold text-emerald-600">
                                        {stat.goals > 0 ? stat.goals : '—'}
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold text-amber-600">
                                        {stat.assists > 0 ? stat.assists : '—'}
                                      </td>
                                      <td className="px-4 py-3 text-center text-slate-700 font-mono">
                                        {stat.shots > 0 ? `${stat.shots} (${stat.shotsOnTarget})` : '—'}
                                      </td>
                                      <td className="px-4 py-3 text-center font-mono text-slate-500 text-[10px]">
                                        {stat.shotsOnTarget > 0 ? `${shotAccuracy}% s.acc` : '—'}
                                      </td>
                                      <td className="px-4 py-3 text-center text-indigo-600 font-bold">
                                        {stat.blocks > 0 ? stat.blocks : '—'}
                                      </td>
                                      <td className="px-4 py-3 text-center font-mono">
                                        {isGK ? (
                                          <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                            {stat.saves ?? 0} Sv / {stat.goalsAllowed ?? 0} GA
                                          </span>
                                        ) : (
                                          <span className="text-slate-350">—</span>
                                        )}
                                      </td>
                                      <td className={`px-4 py-3 text-center font-mono font-bold ${stat.plusMinus > 0 ? 'text-emerald-600' : stat.plusMinus < 0 ? 'text-rose-600' : 'text-slate-450'}`}>
                                        {stat.plusMinus > 0 ? `+${stat.plusMinus}` : stat.plusMinus < 0 ? stat.plusMinus : '0'}
                                      </td>
                                      <td className="px-4 py-3 text-center font-mono text-slate-700">
                                        {stat.fouls > 0 ? stat.fouls : '0'}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          {stat.yellows > 0 && (
                                            <span className="w-3.5 h-4.5 rounded bg-amber-400 border border-amber-500 inline-block font-mono text-[9px] font-black text-amber-950 text-center leading-4.5 shadow-sm" title={`${stat.yellows} Yellow Card(s)`}>
                                              {stat.yellows}
                                            </span>
                                          )}
                                          {stat.reds > 0 && (
                                            <span className="w-3.5 h-4.5 rounded bg-rose-500 border border-rose-600 inline-block font-mono text-[9px] font-black text-rose-50 text-center leading-4.5 shadow-sm" title="Red Card">
                                              R
                                            </span>
                                          )}
                                          {!stat.yellows && !stat.reds && <span className="text-slate-300">—</span>}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {stat.cleanSheet ? (
                                          <span className="inline-flex items-center justify-center" title="Clean Sheet achieved during playtime">
                                            <Shield size={14} className="text-emerald-500" />
                                          </span>
                                        ) : (
                                          <span className="text-slate-300">—</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {stat.potm ? (
                                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide border border-amber-200" title="Player of the Match">
                                            <Star size={10} className="text-amber-600 fill-amber-600 shrink-0" /> POTM
                                          </span>
                                        ) : (
                                          <span className="text-slate-300">—</span>
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
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                        <p className="text-slate-400 text-xs italic">No individual player stats entered for this completed fixture.</p>
                        {isAdmin && (
                          <button
                            onClick={() => startEditing(match.id)}
                            className="text-amber-600 hover:text-amber-700 font-mono font-bold text-[11px] underline flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle size={12} /> Log stats now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Individual Match Stats Editor Modal */}
      {editingMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">ADMIN PANEL</span>
                <h3 className="text-base font-black uppercase tracking-tight">
                  Edit Match Statistics
                </h3>
              </div>
              <button
                onClick={() => setEditingMatchId(null)}
                className="text-slate-400 hover:text-white transition text-lg cursor-pointer font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Body: Scrollable Sheet table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs">
                <ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold">Individual Match Statistics Editor</p>
                  <p className="text-amber-800 leading-relaxed">
                    Check the "Present" box for any player who participated in this match, then enter their individual stats. If they are a Goalkeeper, Saves and Goals Allowed inputs will be shown automatically. Saving will synchronize changes with Google Sheets.
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3 font-bold w-12 text-center">Present</th>
                        <th className="px-4 py-3 font-bold">Player Name</th>
                        <th className="px-4 py-3 font-bold text-center">Goals</th>
                        <th className="px-4 py-3 font-bold text-center">Assists</th>
                        <th className="px-4 py-3 font-bold text-center">Shots</th>
                        <th className="px-4 py-3 font-bold text-center">SOT</th>
                        <th className="px-4 py-3 font-bold text-center">Blocks</th>
                        <th className="px-4 py-3 font-bold text-center">GK Saves</th>
                        <th className="px-4 py-3 font-bold text-center">GK GA</th>
                        <th className="px-4 py-3 font-bold text-center">+/-</th>
                        <th className="px-4 py-3 font-bold text-center">Fouls</th>
                        <th className="px-4 py-3 font-bold text-center">Yellows</th>
                        <th className="px-4 py-3 font-bold text-center">Reds</th>
                        <th className="px-4 py-3 font-bold text-center">CS</th>
                        <th className="px-4 py-3 font-bold text-center">POTM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {tempStats.map(stat => {
                        const playerObj = players.find(p => p.id === stat.playerId);
                        const isGK = playerObj?.position === 'Goalkeeper';

                        return (
                          <tr key={stat.id} className={`hover:bg-slate-50/50 transition ${stat.present ? 'bg-amber-500/[0.02]' : 'opacity-60'}`}>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={stat.present}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'present', e.target.checked)}
                                className="w-4.5 h-4.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              <div className="flex items-center gap-2">
                                {playerObj?.number !== undefined && playerObj?.number !== null && (
                                  <span className="bg-slate-100 text-slate-500 font-mono font-black text-[9px] px-1.5 py-0.5 rounded">
                                    #{playerObj.number}
                                  </span>
                                )}
                                <span>{stat.playerName}</span>
                                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  {playerObj?.position || 'Outfielder'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.goals}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'goals', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.assists}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'assists', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.shots}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'shots', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.shotsOnTarget}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'shotsOnTarget', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.blocks}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'blocks', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present || !isGK}
                                value={stat.saves ?? 0}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'saves', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present || !isGK}
                                value={stat.goalsAllowed ?? 0}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'goalsAllowed', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                disabled={!stat.present}
                                value={stat.plusMinus ?? 0}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'plusMinus', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.fouls ?? 0}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'fouls', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.yellows ?? 0}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'yellows', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                disabled={!stat.present}
                                value={stat.reds ?? 0}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'reds', e.target.value)}
                                className="w-12 text-center border border-slate-200 rounded-lg p-1 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-350 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                disabled={!stat.present}
                                checked={stat.cleanSheet ?? false}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'cleanSheet', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20 cursor-pointer disabled:opacity-50"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                disabled={!stat.present}
                                checked={stat.potm ?? false}
                                onChange={(e) => handleTempStatChange(stat.playerId, 'potm', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20 cursor-pointer disabled:opacity-50"
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

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setEditingMatchId(null)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                <Save size={13} /> Save and Sync Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-slate-400 text-sm">No matches found for this category.</p>
        </div>
      )}
    </div>
  );
};
