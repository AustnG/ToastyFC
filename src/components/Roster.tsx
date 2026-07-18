import React, { useState } from 'react';
import { Player, MatchStats, Match } from '../types';
import { Shield, Sparkles, Award, Star, Search, PlusCircle, CalendarDays, User, MapPin, Ruler, FileText, Activity, ArrowUpDown, ChevronRight } from 'lucide-react';

interface RosterProps {
  players: Player[];
  seasons?: string[];
  activeSeason?: string;
  onSeasonChange?: (season: string) => void;
  playerMatchStats: MatchStats[];
  matches: Match[];
}

const getSkillLabel = (position: string, skillKey: string) => {
  if (position === 'Goalkeeper') {
    switch (skillKey) {
      case 'pace': return { short: 'DIV', full: 'Diving' };
      case 'shooting': return { short: 'HAN', full: 'Handling' };
      case 'passing': return { short: 'KIC', full: 'Kicking' };
      case 'dribbling': return { short: 'REF', full: 'Reflexes' };
      case 'defending': return { short: 'SPD', full: 'Speed' };
      case 'physical': return { short: 'POS', full: 'Positioning' };
      default: return { short: '???', full: 'Unknown' };
    }
  }
  switch (skillKey) {
    case 'pace': return { short: 'PAC', full: 'Pace' };
    case 'shooting': return { short: 'SHO', full: 'Shooting' };
    case 'passing': return { short: 'PAS', full: 'Passing' };
    case 'dribbling': return { short: 'DRI', full: 'Dribbling' };
    case 'defending': return { short: 'DEF', full: 'Defending' };
    case 'physical': return { short: 'PHY', full: 'Physicality' };
    default: return { short: '???', full: 'Unknown' };
  }
};

const getOverallRating = (player: Player): number | null => {
  if (!player.skills) return null;
  const { pace, shooting, passing, dribbling, defending, physical } = player.skills;
  if (player.position === 'Forward') {
    return Math.round(pace * 0.25 + shooting * 0.45 + passing * 0.1 + dribbling * 0.15 + physical * 0.05);
  }
  if (player.position === 'Midfielder') {
    return Math.round(pace * 0.15 + shooting * 0.15 + passing * 0.4 + dribbling * 0.2 + physical * 0.1);
  }
  if (player.position === 'Defender') {
    return Math.round(pace * 0.15 + defending * 0.45 + physical * 0.25 + passing * 0.1 + dribbling * 0.05);
  }
  if (player.position === 'Goalkeeper') {
    return Math.round(pace * 0.2 + shooting * 0.25 + passing * 0.15 + dribbling * 0.25 + physical * 0.15);
  }
  return Math.round((pace + shooting + passing + dribbling + defending + physical) / 6);
};

export const Roster: React.FC<RosterProps> = ({ 
  players, 
  seasons, 
  activeSeason, 
  onSeasonChange,
  playerMatchStats = [],
  matches = []
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'name' | 'number'>('number');

  const activeSelectedPlayer = selectedPlayer ? (players.find(p => p.id === selectedPlayer.id) || selectedPlayer) : null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const positions = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const filteredPlayers = players.filter(player => {
    return filter === 'All' || player.position === filter;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'number') {
      const numA = a.number;
      const numB = b.number;

      // Check if player has a valid positive jersey number
      const hasA = numA !== undefined && numA !== null && numA > 0;
      const hasB = numB !== undefined && numB !== null && numB > 0;

      if (hasA && hasB) {
        return numA - numB;
      }
      if (hasA && !hasB) {
        return -1; // a comes first
      }
      if (!hasA && hasB) {
        return 1; // b comes first
      }
      // Neither has a valid number, sort by name
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-2">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="text-amber-500 fill-amber-500/10 shrink-0" size={28} /> Meet the Squad
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            The heart and soul of Toasty FC. Currently rostered players for the active campaign.
          </p>
        </div>

        {/* Season Filters & Sort Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto lg:flex lg:items-center">
          {seasons && activeSeason && onSeasonChange && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm w-full lg:w-auto">
              <CalendarDays size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Campaign:</span>
              <select
                value={activeSeason}
                onChange={(e) => onSeasonChange(e.target.value)}
                className="bg-transparent text-slate-800 font-extrabold text-xs focus:outline-none cursor-pointer pr-1 w-full lg:w-auto"
                id="roster-season-selector"
              >
                {seasons.map(season => (
                  <option key={season} value={season} className="text-slate-800 font-sans font-semibold">
                    {season}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm w-full lg:w-auto">
            <ArrowUpDown size={14} className="text-amber-500 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'number')}
              className="bg-transparent text-slate-800 font-extrabold text-xs focus:outline-none cursor-pointer pr-1 w-full lg:w-auto"
              id="roster-sort-selector"
            >
              <option value="name" className="text-slate-800 font-sans font-semibold">Name</option>
              <option value="number" className="text-slate-800 font-sans font-semibold">Jersey #</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => setFilter(pos)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              filter === pos 
                ? 'bg-amber-500 text-white shadow' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            id={`filter-pos-${pos.toLowerCase()}`}
          >
            {pos === 'All' ? 'All' : `${pos}s`}
          </button>
        ))}
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPlayers.map((player, index) => (
          <div
            key={`${player.id}-${index}`}
            onClick={() => setSelectedPlayer(player)}
            className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            id={`player-card-${player.id}`}
          >
            {/* Jersey Number Floating Badge */}
            <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur text-amber-400 border border-amber-400/30 font-mono font-bold text-base flex items-center justify-center">
              {player.number !== undefined && player.number !== null && player.number > 0 ? `#${player.number}` : '—'}
            </div>

            {/* Captain Badge */}
            {player.isCaptain && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                <Award size={12} /> Captain
              </div>
            )}

            {/* Player Image */}
            <div className="h-[340px] overflow-hidden relative bg-slate-100 flex items-center justify-center">
              {!player.imageUrl || imageErrors[player.id] ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 text-center p-4">
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-800/80 border border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <User className="w-12 h-12 text-slate-400" />
                    {player.number !== undefined && player.number !== null && player.number > 0 && (
                      <span className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 font-mono text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">
                        {player.number}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-black font-mono tracking-tight text-slate-500 opacity-60">
                      {getInitials(player.name)}
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    setImageErrors(prev => ({ ...prev, [player.id]: true }));
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10" />
              
              {/* Bottom detail row overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end z-20">
                <div>
                  <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase font-mono">{player.position}</span>
                  <h4 className="font-bold text-lg leading-tight mt-0.5">{player.name}</h4>
                </div>
              </div>
            </div>

            {/* Micro Player stats inside card footer */}
            <div className="p-4 grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-500 bg-slate-50 border-t border-slate-100">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Apps</span>
                <strong className="text-slate-800 text-sm">{player.matchesPlayed}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Goals</span>
                <strong className="text-emerald-600 text-sm">{player.goals}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Assists</span>
                <strong className="text-amber-600 text-sm">{player.assists}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-slate-400 text-sm">No rostered players match your criteria. Let's add them or adjust the filters!</p>
        </div>
      )}

      {/* Detailed Player Modal */}
      {selectedPlayer && activeSelectedPlayer && (() => {
        const goals = activeSelectedPlayer.goals ?? 0;
        const assists = activeSelectedPlayer.assists ?? 0;
        const matchesPlayed = activeSelectedPlayer.matchesPlayed ?? 0;
        const shots = activeSelectedPlayer.shots ?? 0;
        const shotsOnTarget = activeSelectedPlayer.shotsOnTarget ?? 0;
        const blocks = activeSelectedPlayer.blocks ?? 0;
        const plusMinus = activeSelectedPlayer.plusMinus ?? 0;
        const fouls = activeSelectedPlayer.fouls ?? 0;
        const yellows = activeSelectedPlayer.yellows ?? 0;
        const reds = activeSelectedPlayer.reds ?? 0;
        const potm = activeSelectedPlayer.potm ?? 0;
        const cleanSheets = activeSelectedPlayer.cleanSheets ?? 0;
        const saves = activeSelectedPlayer.saves ?? 0;
        const goalsAllowed = activeSelectedPlayer.goalsAllowed ?? 0;

        const shotAccuracy = shots > 0 ? Math.round((shotsOnTarget / shots) * 100) : 0;
        const goalsPerMatch = matchesPlayed > 0 ? (goals / matchesPlayed).toFixed(2) : '0.00';
        const assistsPerMatch = matchesPlayed > 0 ? (assists / matchesPlayed).toFixed(2) : '0.00';
        const contributions = goals + assists;
        const contributionsPerMatch = matchesPlayed > 0 ? (contributions / matchesPlayed).toFixed(2) : '0.00';
        const foulsPerMatch = matchesPlayed > 0 ? (fouls / matchesPlayed).toFixed(2) : '0.00';
        const savesPerMatch = matchesPlayed > 0 && activeSelectedPlayer.position === 'Goalkeeper' ? (saves / matchesPlayed).toFixed(2) : '0.00';
        const goalsAllowedPerMatch = matchesPlayed > 0 && activeSelectedPlayer.position === 'Goalkeeper' ? (goalsAllowed / matchesPlayed).toFixed(2) : '0.00';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] md:h-[680px]">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-slate-900/10 text-slate-800 hover:bg-slate-900/20 hover:text-slate-950 flex items-center justify-center transition text-xl font-bold cursor-pointer backdrop-blur-sm md:bg-white/80 md:text-slate-600 md:hover:bg-white md:hover:text-slate-950 shadow-sm"
                id="close-player-modal-btn"
                aria-label="Close"
              >
                &times;
              </button>

              {/* Left Column: The Large-Scale Visual Player Card */}
              <div className="w-full md:w-[340px] shrink-0 bg-slate-950 text-white relative flex flex-col justify-between p-6 overflow-hidden border-b md:border-b-0 md:border-r border-slate-900">
                
                {/* Background ambient glow/patterns */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950/40 to-slate-950 pointer-events-none z-0" />
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-5">
                  
                  {/* 1. The Framed Portrait Segment */}
                  <div className="relative h-[280px] md:h-[390px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl group shrink-0 flex items-center justify-center">
                    {/* Player Image */}
                    {!activeSelectedPlayer.imageUrl || imageErrors[activeSelectedPlayer.id] ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 text-center p-4">
                        <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-slate-800/80 border border-slate-700/50 shadow-inner">
                          <User className="w-16 h-16 text-slate-400" />
                          {activeSelectedPlayer.number !== undefined && activeSelectedPlayer.number !== null && activeSelectedPlayer.number > 0 && (
                            <span className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 font-mono text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-900">
                              {activeSelectedPlayer.number}
                            </span>
                          )}
                        </div>
                        <div className="mt-4">
                          <span className="text-3xl font-black font-mono tracking-tight text-slate-500 opacity-60">
                            {getInitials(activeSelectedPlayer.name)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={activeSelectedPlayer.imageUrl}
                        alt={activeSelectedPlayer.name}
                        className="w-full h-full object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setImageErrors(prev => ({ ...prev, [activeSelectedPlayer.id]: true }));
                        }}
                      />
                    )}
                    {/* Sophisticated dual gradients to ensure readability and protect photo visibility */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                    <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-slate-950/60 to-transparent z-10" />

                    {/* Jersey Number Ribbon (Top-Right of Image) */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-20">
                      <span className="bg-amber-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg shadow-lg select-none">
                        {activeSelectedPlayer.number !== undefined && activeSelectedPlayer.number !== null && activeSelectedPlayer.number > 0 ? `#${activeSelectedPlayer.number}` : '—'}
                      </span>
                      {activeSelectedPlayer.isCaptain && (
                        <span className="bg-amber-400 text-slate-950 font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 shadow-md select-none">
                          <Award size={10} className="stroke-[3]" /> CAPTAIN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Identity & Core Stats (Lower Segment) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 shadow-inner">
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight leading-tight uppercase font-sans">
                          {activeSelectedPlayer.name}
                        </h3>
                        <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest font-bold block mt-0.5">
                          {activeSelectedPlayer.position}
                        </span>
                      </div>
                      {activeSelectedPlayer.skills ? (
                        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-400 to-yellow-600 shadow-lg px-3 py-1.5 rounded-xl text-slate-950 min-w-[50px] text-center border border-amber-300/50 select-none">
                          <span className="text-lg font-black tracking-tighter leading-none">
                            {getOverallRating(activeSelectedPlayer)}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest mt-0.5 text-slate-950/80">OVR</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-amber-400 shadow-md">
                          <Star size={11} className="fill-current text-amber-400" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-200">ACTIVE</span>
                        </div>
                      )}
                    </div>

                    {/* Core Stats Bar (Glassmorphism overlay) */}
                    <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Matches</span>
                        <strong className="text-base font-black text-white">{matchesPlayed}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Goals</span>
                        <strong className="text-base font-black text-emerald-400">{goals}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Assists</span>
                        <strong className="text-base font-black text-amber-400">{assists}</strong>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Dynamic Analytics, Demographics, & Tactical Breakdown Dashboard */}
              <div className="flex-1 bg-slate-50/45 text-slate-800 flex flex-col justify-between overflow-hidden">
                
                {/* Scrollable Dashboard Body */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
                  
                  {/* Dossier Header and Bio */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase font-mono text-amber-500">
                        Bio
                      </h4>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      {activeSelectedPlayer.bio}
                    </p>
                  </div>

                  {/* Personal Information Matrix */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> Personal Identity & Attributes
                    </span>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs border-t border-slate-50 pt-3">
                      {activeSelectedPlayer.dateOfBirth && (
                        <div className="space-y-0.5">
                          <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Date of Birth</span>
                          <strong className="text-slate-800 font-semibold">
                            {activeSelectedPlayer.dateOfBirth} ({new Date().getFullYear() - new Date(activeSelectedPlayer.dateOfBirth).getFullYear()} yrs)
                          </strong>
                        </div>
                      )}
                      {activeSelectedPlayer.height && (
                        <div className="space-y-0.5">
                          <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Physical Height</span>
                          <strong className="text-slate-800 font-semibold">{activeSelectedPlayer.height}</strong>
                        </div>
                      )}
                      {activeSelectedPlayer.birthplace && (
                        <div className="space-y-0.5">
                          <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Place of Origin</span>
                          <strong className="text-slate-800 font-semibold truncate block">{activeSelectedPlayer.birthplace}</strong>
                        </div>
                      )}
                      {activeSelectedPlayer.nationality && (
                        <div className="space-y-0.5">
                          <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Nationality</span>
                          <strong className="text-slate-800 font-semibold">{activeSelectedPlayer.nationality}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tactical Skills Attributes Profile if exists */}
                  {activeSelectedPlayer.skills && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm space-y-3">
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-bold block flex items-center gap-1.5">
                        <Activity size={12} className="text-amber-500" /> Tactical Skill Metrics
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-50 pt-3">
                        {(Object.entries(activeSelectedPlayer.skills) as [string, number][]).map(([key, value]) => {
                          const label = getSkillLabel(activeSelectedPlayer.position, key);
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium text-slate-700">
                                <span className="flex items-center gap-1.5">
                                  <span className="text-amber-600 font-bold text-[9px] font-mono bg-amber-50 px-1.5 py-0.5 rounded shrink-0">{label.short}</span>
                                  <span className="text-slate-600">{label.full}</span>
                                </span>
                                <strong className="font-mono text-slate-900">{value}</strong>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    value >= 90 
                                      ? 'bg-amber-500' 
                                      : value >= 80 
                                      ? 'bg-emerald-500' 
                                      : value >= 70 
                                      ? 'bg-indigo-500' 
                                      : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Aggregate Performance Summary */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 font-mono">
                        <Activity size={15} className="text-amber-500 animate-pulse" />
                        {activeSeason === 'All Seasons' ? 'All-Time Stats Summary' : `${activeSeason} Stats Summary`}
                      </span>
                      <span className="bg-amber-50 text-amber-800 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border border-amber-100/50">
                        {matchesPlayed} Matches
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Attack & Playmaking */}
                      <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Attack & Playmaking</h5>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Goals Scored</span>
                            <span className="font-mono font-extrabold text-emerald-600 text-sm">
                              {goals} <span className="text-[10px] text-slate-400 font-normal">({goalsPerMatch}/g)</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Assists Delivered</span>
                            <span className="font-mono font-extrabold text-amber-500 text-sm">
                              {assists} <span className="text-[10px] text-slate-400 font-normal">({assistsPerMatch}/g)</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Goal Contributions</span>
                            <span className="font-mono font-extrabold text-slate-800 text-sm">
                              {contributions} <span className="text-[10px] text-slate-400 font-normal">({contributionsPerMatch}/g)</span>
                            </span>
                          </div>
                          {shots > 0 && (
                            <div className="pt-1">
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Shot Accuracy</span>
                                <span>{shotAccuracy}% ({shotsOnTarget}/{shots} SOT)</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${shotAccuracy}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Defense & Discipline */}
                      <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Defense & Discipline</h5>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Plus / Minus (+/-)</span>
                            <span className={`font-mono font-extrabold text-sm ${plusMinus > 0 ? 'text-emerald-600' : plusMinus < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                              {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Blocks Logged</span>
                            <span className="font-mono font-extrabold text-indigo-600 text-sm">{blocks}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Fouls Committed</span>
                            <span className="font-mono font-extrabold text-slate-600 text-sm">
                              {fouls} <span className="text-[10px] text-slate-400 font-normal">({foulsPerMatch}/g)</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-0.5">
                            <span className="text-slate-600">Cards Received</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <div className="w-2.5 h-3.5 bg-amber-400 rounded-sm border border-amber-500" title="Yellow Cards" />
                                <span className="font-mono font-bold text-slate-700">{yellows}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2.5 h-3.5 bg-red-500 rounded-sm border border-red-600" title="Red Cards" />
                                <span className="font-mono font-bold text-slate-700">{reds}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role Specific Additional Metrics (Goalkeeper or Honors) */}
                    <div className="bg-amber-50/45 border border-amber-100/40 p-4 rounded-xl text-xs mt-1">
                      {activeSelectedPlayer.position === 'Goalkeeper' ? (
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">Goalkeeping Performance Metrics</h5>
                          <div className="grid grid-cols-3 gap-3 text-center pt-1">
                            <div className="bg-white p-2.5 rounded-lg border border-amber-100/50 shadow-sm">
                              <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wide">Clean Sheets</span>
                              <strong className="text-slate-800 font-mono font-black text-sm">{cleanSheets}</strong>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-amber-100/50 shadow-sm">
                              <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wide">Saves Logged</span>
                              <strong className="text-emerald-600 font-mono font-black text-sm">
                                {saves} <span className="text-[8px] text-slate-400 font-normal">({savesPerMatch}/g)</span>
                              </strong>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-amber-100/50 shadow-sm">
                              <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wide">Goals Allowed</span>
                              <strong className="text-rose-600 font-mono font-black text-sm">
                                {goalsAllowed} <span className="text-[8px] text-slate-400 font-normal">({goalsAllowedPerMatch}/g)</span>
                              </strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-0.5">
                            <h5 className="text-[10px] font-bold text-amber-850 uppercase tracking-wider font-mono">Accolades & Distinctions</h5>
                            <p className="text-[11px] text-slate-500 leading-tight">Key individual highlights logged during active campaigns.</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="bg-amber-100/70 border border-amber-200/60 text-amber-850 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                              <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                              <div className="text-left font-mono">
                                <div className="text-[8px] text-amber-700 uppercase tracking-widest font-black leading-none">POTM Trophies</div>
                                <div className="text-xs font-black mt-0.5">{potm} Awards</div>
                              </div>
                            </div>
                            {cleanSheets > 0 && (
                              <div className="bg-emerald-100/70 border border-emerald-200/60 text-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                                <Shield size={14} className="text-emerald-600 shrink-0" />
                                <div className="text-left font-mono">
                                  <div className="text-[8px] text-emerald-700 uppercase tracking-widest font-black leading-none">Clean Sheets</div>
                                  <div className="text-xs font-black mt-0.5">{cleanSheets} Match</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campaign History Chips */}
                  {activeSelectedPlayer.seasons && activeSelectedPlayer.seasons.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-widest font-bold">
                        Active Campaigns History
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeSelectedPlayer.seasons.map((season) => (
                          <span key={season} className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold border border-slate-200/50 shadow-sm hover:bg-slate-200/50 transition">
                            {season}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Footer Details */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
                  Toasty FC Player Analytics
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
