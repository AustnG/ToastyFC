import React, { useState } from 'react';
import { Player, MatchStats, Match } from '../types';
import { Shield, CalendarDays, User, ArrowUpDown, Star, X } from 'lucide-react';
import { calculateAge } from '../lib/dateUtils';

interface RosterProps {
  players: Player[];
  seasons?: string[];
  activeSeason?: string;
  onSeasonChange?: (season: string) => void;
  playerMatchStats: MatchStats[];
  matches: Match[];
}

const getSkillLabel = (position: string | undefined, skillKey: string) => {
  if (position === 'Goalkeeper') {
    switch (skillKey) {
      case 'pace':
        return { short: 'DIV', full: 'Diving' };
      case 'shooting':
        return { short: 'HAN', full: 'Handling' };
      case 'passing':
        return { short: 'KIC', full: 'Kicking' };
      case 'dribbling':
        return { short: 'REF', full: 'Reflexes' };
      case 'defending':
        return { short: 'SPD', full: 'Speed' };
      case 'physical':
        return { short: 'POS', full: 'Positioning' };
      default:
        return { short: '---', full: 'Unknown' };
    }
  }
  switch (skillKey) {
    case 'pace':
      return { short: 'PAC', full: 'Pace' };
    case 'shooting':
      return { short: 'SHO', full: 'Shooting' };
    case 'passing':
      return { short: 'PAS', full: 'Passing' };
    case 'dribbling':
      return { short: 'DRI', full: 'Dribbling' };
    case 'defending':
      return { short: 'DEF', full: 'Defending' };
    case 'physical':
      return { short: 'PHY', full: 'Physicality' };
    default:
      return { short: '---', full: 'Unknown' };
  }
};

const getOverallRating = (player: Player): number | null => {
  if (!player.skills) return null;
  const { pace, shooting, passing, dribbling, defending, physical } = player.skills;
  const vals = [pace, shooting, passing, dribbling, defending, physical];
  if (vals.some(v => v === undefined || v === null || v === ('' as unknown) || isNaN(Number(v)))) {
    return null;
  }
  const p = Number(pace);
  const s = Number(shooting);
  const pa = Number(passing);
  const d = Number(dribbling);
  const de = Number(defending);
  const ph = Number(physical);
  if (p + s + pa + d + de + ph === 0) return null;

  if (player.position === 'Forward') {
    return Math.round(p * 0.25 + s * 0.45 + pa * 0.1 + d * 0.15 + ph * 0.05);
  }
  if (player.position === 'Midfielder') {
    return Math.round(p * 0.15 + s * 0.15 + pa * 0.4 + d * 0.2 + ph * 0.1);
  }
  if (player.position === 'Defender') {
    return Math.round(p * 0.15 + de * 0.45 + ph * 0.25 + pa * 0.1 + d * 0.05);
  }
  if (player.position === 'Goalkeeper') {
    return Math.round(p * 0.2 + s * 0.25 + pa * 0.15 + d * 0.25 + ph * 0.15);
  }
  return Math.round((p + s + pa + d + de + ph) / 6);
};

export const Roster: React.FC<RosterProps> = ({
  players,
  seasons,
  activeSeason,
  onSeasonChange
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'name' | 'number'>('number');

  const activeSelectedPlayer = selectedPlayer
    ? players.find(p => p.id === selectedPlayer.id) || selectedPlayer
    : null;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const positions = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const filteredPlayers = players.filter(player => {
    return filter === 'All' || player.position === filter;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'number') {
      const numA = a.number;
      const numB = b.number;
      const hasA = numA !== undefined && numA !== null && numA > 0;
      const hasB = numB !== undefined && numB !== null && numB > 0;
      if (hasA && hasB) return numA - numB;
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-toasty-border pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
            First Team Squad
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
            Squad Roster
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            Active roster profiles, tactical ratings, and campaign production.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {seasons && activeSeason && onSeasonChange && (
            <div className="flex items-center gap-2 bg-white border border-toasty-border rounded-lg px-3 py-2">
              <CalendarDays size={14} className="text-toasty-red shrink-0" />
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
                Season
              </span>
              <select
                value={activeSeason}
                onChange={e => onSeasonChange(e.target.value)}
                id="roster-season-selector"
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

          <div className="flex items-center gap-2 bg-white border border-toasty-border rounded-lg px-3 py-2">
            <ArrowUpDown size={14} className="text-toasty-tan-dark shrink-0" />
            <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'number')}
              id="roster-sort-selector"
              className="bg-transparent text-zinc-900 font-semibold text-xs focus:outline-none cursor-pointer pr-1 flex-1"
            >
              <option value="number" className="text-zinc-900 font-sans">
                Jersey #
              </option>
              <option value="name" className="text-zinc-900 font-sans">
                Name
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Position Segmented Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-toasty-subtle border border-toasty-border p-1 rounded-lg flex flex-wrap gap-1">
          {positions.map(pos => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              id={`filter-pos-${pos.toLowerCase()}`}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === pos
                  ? 'bg-toasty-obsidian text-white'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {pos === 'All' ? 'All' : `${pos}s`}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-zinc-500 tabular-nums">
          {sortedPlayers.length} {sortedPlayers.length === 1 ? 'Player' : 'Players'}
        </span>
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPlayers.map((player, index) => {
          const hasNumber =
            player.number !== undefined && player.number !== null && player.number > 0;
          return (
            <div
              key={`${player.id}-${index}`}
              onClick={() => setSelectedPlayer(player)}
              id={`player-card-${player.id}`}
              className="group bg-toasty-surface border border-toasty-border hover:border-zinc-400 rounded-xl overflow-hidden transition-colors cursor-pointer flex flex-col"
            >
              {/* Portrait */}
              <div className="h-[320px] relative bg-toasty-obsidian overflow-hidden flex items-center justify-center">
                {!player.imageUrl || imageErrors[player.id] ? (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 rounded-full bg-toasty-obsidian-card border border-toasty-obsidian-border flex items-center justify-center text-zinc-500">
                      <User size={34} />
                    </div>
                    <span className="mt-3 font-display font-extrabold text-3xl tracking-wider text-zinc-600">
                      {getInitials(player.name)}
                    </span>
                  </div>
                ) : (
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                    onError={() => setImageErrors(prev => ({ ...prev, [player.id]: true }))}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Bottom Overlay: Position, Name, Jersey Number */}
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan flex items-center gap-1.5">
                      <span>{player.position || 'Squad'}</span>
                      {player.isCaptain && (
                        <>
                          <span className="text-zinc-500">·</span>
                          <span className="text-red-400 font-semibold">Captain</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white leading-tight truncate mt-0.5">
                      {player.name}
                    </h3>
                  </div>

                  {hasNumber && (
                    <span className="font-display font-extrabold text-4xl text-white/80 leading-none tabular-nums shrink-0">
                      {player.number}
                    </span>
                  )}
                </div>
              </div>

              {/* Hairline-divided Tabular Footer */}
              <div className="grid grid-cols-3 divide-x divide-toasty-border bg-toasty-surface py-3.5 text-center font-mono tabular-nums">
                <div>
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">
                    Apps
                  </span>
                  <strong className="text-zinc-900 text-sm font-bold">
                    {player.matchesPlayed ?? 0}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">
                    Goals
                  </span>
                  <strong className="text-toasty-red text-sm font-bold">
                    {player.goals ?? 0}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">
                    Assists
                  </span>
                  <strong className="text-toasty-tan-dark text-sm font-bold">
                    {player.assists ?? 0}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12 border border-dashed border-toasty-border rounded-xl bg-white">
          <p className="text-zinc-500 text-sm">
            No rostered players match the selected position filter.
          </p>
        </div>
      )}

      {/* Editorial Player Dossier Modal */}
      {selectedPlayer &&
        activeSelectedPlayer &&
        (() => {
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

          const totalShots = shots + shotsOnTarget;
          const shotAccuracy = totalShots > 0 ? Math.round((shotsOnTarget / totalShots) * 100) : 0;
          const goalsPerMatch = matchesPlayed > 0 ? (goals / matchesPlayed).toFixed(2) : '0.00';
          const assistsPerMatch = matchesPlayed > 0 ? (assists / matchesPlayed).toFixed(2) : '0.00';
          const contributions = goals + assists;
          const contributionsPerMatch =
            matchesPlayed > 0 ? (contributions / matchesPlayed).toFixed(2) : '0.00';
          const foulsPerMatch = matchesPlayed > 0 ? (fouls / matchesPlayed).toFixed(2) : '0.00';
          const savesPerMatch =
            matchesPlayed > 0 && activeSelectedPlayer.position === 'Goalkeeper'
              ? (saves / matchesPlayed).toFixed(2)
              : '0.00';
          const goalsAllowedPerMatch =
            matchesPlayed > 0 && activeSelectedPlayer.position === 'Goalkeeper'
              ? (goalsAllowed / matchesPlayed).toFixed(2)
              : '0.00';

          const ovr = getOverallRating(activeSelectedPlayer);
          const hasNumber =
            activeSelectedPlayer.number !== undefined &&
            activeSelectedPlayer.number !== null &&
            activeSelectedPlayer.number > 0;
          const age = calculateAge(activeSelectedPlayer.dateOfBirth);

          return (
            <div
              onClick={() => setSelectedPlayer(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="bg-toasty-surface rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl border border-toasty-border flex flex-col md:flex-row relative animate-fade-in max-h-[90vh] md:h-[680px]"
              >
                <button
                  onClick={() => setSelectedPlayer(null)}
                  id="close-player-modal-btn"
                  aria-label="Close player profile"
                  className="absolute top-4 right-4 z-30 w-8 h-8 rounded-lg bg-white/90 border border-toasty-border text-zinc-700 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Left Column: Obsidian Player Portrait & Identity */}
                <div className="w-full md:w-[320px] shrink-0 bg-toasty-obsidian text-white flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-toasty-obsidian-border gap-5">
                  <div className="relative h-[250px] md:h-[360px] rounded-lg overflow-hidden border border-toasty-obsidian-border bg-toasty-obsidian-card flex items-center justify-center shrink-0">
                    {!activeSelectedPlayer.imageUrl || imageErrors[activeSelectedPlayer.id] ? (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-toasty-obsidian-border flex items-center justify-center text-zinc-500">
                          <User size={34} />
                        </div>
                        <span className="mt-3 font-display font-extrabold text-3xl text-zinc-500">
                          {getInitials(activeSelectedPlayer.name)}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={activeSelectedPlayer.imageUrl}
                        alt={activeSelectedPlayer.name}
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setImageErrors(prev => ({
                            ...prev,
                            [activeSelectedPlayer.id]: true
                          }))
                        }
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                    {hasNumber && (
                      <span className="absolute bottom-3 left-4 font-display font-extrabold text-4xl text-white leading-none tabular-nums">
                        #{activeSelectedPlayer.number}
                      </span>
                    )}
                    {ovr !== null && (
                      <div className="absolute bottom-3 right-4 text-right">
                        <span className="block text-[9px] font-mono uppercase tracking-widest text-toasty-tan leading-none">
                          OVR
                        </span>
                        <span className="font-display font-extrabold text-3xl text-white leading-none tabular-nums">
                          {ovr}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-toasty-tan flex items-center gap-1.5">
                        <span>{activeSelectedPlayer.position || 'Squad'}</span>
                        {activeSelectedPlayer.isCaptain && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span className="text-red-400 font-semibold">Captain</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white leading-tight mt-0.5">
                        {activeSelectedPlayer.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-toasty-obsidian-border border-t border-toasty-obsidian-border pt-4 text-center font-mono tabular-nums">
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase">Apps</span>
                        <strong className="text-lg font-bold text-white">{matchesPlayed}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase">Goals</span>
                        <strong className="text-lg font-bold text-toasty-red">{goals}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase">Assists</span>
                        <strong className="text-lg font-bold text-toasty-tan">{assists}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Daylight Dossier */}
                <div className="flex-1 bg-toasty-canvas text-zinc-800 flex flex-col justify-between overflow-hidden">
                  <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                    {/* Bio */}
                    {activeSelectedPlayer.bio && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-toasty-red">
                          Player Bio
                        </h4>
                        <p className="text-sm text-zinc-700 leading-relaxed">
                          {activeSelectedPlayer.bio}
                        </p>
                      </div>
                    )}

                    {/* Personal Identity */}
                    {(activeSelectedPlayer.dateOfBirth ||
                      activeSelectedPlayer.height ||
                      activeSelectedPlayer.birthplace ||
                      activeSelectedPlayer.nationality) && (
                      <div className="pt-4 border-t border-toasty-border space-y-3">
                        <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-zinc-500">
                          Personal Details
                        </h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                          {activeSelectedPlayer.dateOfBirth && (
                            <div>
                              <span className="block text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                                Date of Birth
                              </span>
                              <strong className="text-zinc-900 font-semibold tabular-nums">
                                {activeSelectedPlayer.dateOfBirth}
                                {age !== null && <> ({age} yrs)</>}
                              </strong>
                            </div>
                          )}
                          {activeSelectedPlayer.height && (
                            <div>
                              <span className="block text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                                Height
                              </span>
                              <strong className="text-zinc-900 font-semibold">
                                {activeSelectedPlayer.height}
                              </strong>
                            </div>
                          )}
                          {activeSelectedPlayer.birthplace && (
                            <div>
                              <span className="block text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                                Hometown
                              </span>
                              <strong className="text-zinc-900 font-semibold block truncate">
                                {activeSelectedPlayer.birthplace}
                              </strong>
                            </div>
                          )}
                          {activeSelectedPlayer.nationality && (
                            <div>
                              <span className="block text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                                Nationality
                              </span>
                              <strong className="text-zinc-900 font-semibold">
                                {activeSelectedPlayer.nationality}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tactical Skill Ratings */}
                    {activeSelectedPlayer.skills && (
                      <div className="pt-4 border-t border-toasty-border space-y-3">
                        <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-zinc-500">
                          Tactical Attributes
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          {(
                            Object.entries(activeSelectedPlayer.skills) as [string, number][]
                          ).map(([key, value]) => {
                            const label = getSkillLabel(activeSelectedPlayer.position, key);
                            const numVal = Number(value || 0);
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-xs items-baseline">
                                  <span className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-[10px] text-toasty-red w-7">
                                      {label.short}
                                    </span>
                                    <span className="text-zinc-600">{label.full}</span>
                                  </span>
                                  <strong className="font-mono tabular-nums text-zinc-900">
                                    {numVal}
                                  </strong>
                                </div>
                                <div className="w-full bg-zinc-200/80 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      numVal >= 90
                                        ? 'bg-toasty-red'
                                        : numVal >= 80
                                          ? 'bg-toasty-tan-dark'
                                          : 'bg-zinc-600'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, numVal))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Season Stats Summary */}
                    <div className="pt-4 border-t border-toasty-border space-y-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-zinc-500">
                          {activeSeason === 'All Seasons'
                            ? 'All-Time Statistics'
                            : `${activeSeason} Statistics`}
                        </h4>
                        <span className="text-xs font-mono text-zinc-500 tabular-nums">
                          {matchesPlayed} {matchesPlayed === 1 ? 'Match' : 'Matches'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-toasty-border rounded-lg p-4">
                        {/* Attack */}
                        <div className="space-y-2.5 text-xs sm:pr-4 sm:border-r sm:border-toasty-border">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                            Attack & Playmaking
                          </span>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Goals</span>
                            <span className="font-mono font-bold text-toasty-red tabular-nums">
                              {goals}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">
                                ({goalsPerMatch}/g)
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Assists</span>
                            <span className="font-mono font-bold text-toasty-tan-dark tabular-nums">
                              {assists}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">
                                ({assistsPerMatch}/g)
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">G+A Contributions</span>
                            <span className="font-mono font-bold text-zinc-900 tabular-nums">
                              {contributions}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">
                                ({contributionsPerMatch}/g)
                              </span>
                            </span>
                          </div>
                          {totalShots > 0 && (
                            <div className="pt-1.5 space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-zinc-500 tabular-nums">
                                <span>Shot Accuracy</span>
                                <span>
                                  {shotAccuracy}% ({shotsOnTarget}/{totalShots} SOT)
                                </span>
                              </div>
                              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-toasty-red h-full rounded-full"
                                  style={{ width: `${shotAccuracy}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Defense & Discipline */}
                        <div className="space-y-2.5 text-xs">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                            Defense & Discipline
                          </span>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Net Impact (+/-)</span>
                            <span
                              className={`font-mono font-bold tabular-nums ${
                                plusMinus > 0
                                  ? 'text-emerald-700'
                                  : plusMinus < 0
                                    ? 'text-rose-700'
                                    : 'text-zinc-500'
                              }`}
                            >
                              {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Blocks</span>
                            <span className="font-mono font-bold text-zinc-900 tabular-nums">
                              {blocks}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Fouls</span>
                            <span className="font-mono font-bold text-zinc-700 tabular-nums">
                              {fouls}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">
                                ({foulsPerMatch}/g)
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Cards</span>
                            <div className="flex items-center gap-2.5 font-mono tabular-nums">
                              <span className="inline-flex items-center gap-1 text-zinc-800 font-semibold">
                                <span className="w-2 h-3 bg-amber-400 border border-amber-500 rounded-[1px]" />
                                {yellows}
                              </span>
                              <span className="inline-flex items-center gap-1 text-zinc-800 font-semibold">
                                <span className="w-2 h-3 bg-red-600 border border-red-700 rounded-[1px]" />
                                {reds}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Goalkeeping or Honors */}
                      {activeSelectedPlayer.position === 'Goalkeeper' ? (
                        <div className="grid grid-cols-3 divide-x divide-toasty-border bg-white border border-toasty-border rounded-lg py-3 text-center font-mono tabular-nums">
                          <div className="px-2">
                            <span className="block text-[10px] text-zinc-400 uppercase">
                              Clean Sheets
                            </span>
                            <strong className="text-zinc-900 text-base font-bold">
                              {cleanSheets}
                            </strong>
                          </div>
                          <div className="px-2">
                            <span className="block text-[10px] text-zinc-400 uppercase">Saves</span>
                            <strong className="text-toasty-red text-base font-bold">
                              {saves}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">
                                ({savesPerMatch}/g)
                              </span>
                            </strong>
                          </div>
                          <div className="px-2">
                            <span className="block text-[10px] text-zinc-400 uppercase">
                              Goals Allowed
                            </span>
                            <strong className="text-zinc-700 text-base font-bold">
                              {goalsAllowed}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">
                                ({goalsAllowedPerMatch}/g)
                              </span>
                            </strong>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-toasty-border rounded-lg px-4 py-3 text-xs">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                            Campaign Distinctions
                          </span>
                          <div className="flex items-center gap-4 font-mono tabular-nums">
                            <span className="inline-flex items-center gap-1.5 text-zinc-900 font-bold">
                              <Star size={13} className="text-toasty-red fill-toasty-red" />
                              {potm} POTM
                            </span>
                            {cleanSheets > 0 && (
                              <span className="inline-flex items-center gap-1.5 text-zinc-700 font-bold">
                                <Shield size={13} className="text-toasty-tan-dark" />
                                {cleanSheets} Clean Sheets
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Campaign History (Unboxed dot-separated list) */}
                    {activeSelectedPlayer.seasons && activeSelectedPlayer.seasons.length > 0 && (
                      <div className="pt-4 border-t border-toasty-border space-y-1.5">
                        <span className="block text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                          Campaign History
                        </span>
                        <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                          {activeSelectedPlayer.seasons.join('  ·  ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3 bg-toasty-subtle border-t border-toasty-border text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                    <span>Toasty FC Squad Dossier</span>
                    <span>{activeSeason || 'Active Roster'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};
