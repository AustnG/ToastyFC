/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Trophy, TrendingUp, X, User, ShieldAlert, Heart, Calendar, MapPin, Globe, Filter } from 'lucide-react';
import { useState } from 'react';
import { Player, Match } from '../types';

interface RosterProps {
  players: Player[];
  matches: Match[];
}

export default function Roster({ players, matches }: RosterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'guest' | 'inactive'>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'attributes'>('overview');

  // Realistic fallback mapping of players to seasons if not synced from Sheets
  const getPlayerSeasonsList = (player: Player): string[] => {
    if (player.seasons && player.seasons.length > 0) {
      return player.seasons.map(s => s.name);
    }
    // Static fallback lists based on the player ID/status to make filters fully operational in offline state
    if (player.status === 'guest') {
      return ['2026 (Active Season)'];
    }
    if (player.status === 'inactive') {
      return ['2022 (Inaugural)', '2023 (Championship)'];
    }
    const legacyPlayers = ['austin-greer', 'goran-omerdic', 'zac-lechler', 'david-parra'];
    if (legacyPlayers.includes(player.id)) {
      return [
        '2022 (Inaugural)',
        '2023 (Championship)',
        '2024 (Winter/Spring)',
        '2025 (Autumn Cup)',
        '2026 (Active Season)'
      ];
    }
    return ['2024 (Winter/Spring)', '2025 (Autumn Cup)', '2026 (Active Season)'];
  };

  // Compile list of unique seasons available for filtering
  const allSeasons = Array.from(
    new Set(
      players.flatMap(player => getPlayerSeasonsList(player))
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort recent seasons first

  // Filter players based on search, status, and season selection
  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || player.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || player.status === statusFilter;

    // Season filter
    const playerSeasons = getPlayerSeasonsList(player);
    const matchesSeason = seasonFilter === 'all' || playerSeasons.includes(seasonFilter);

    return matchesSearch && matchesStatus && matchesSeason;
  });

  const getPositionColor = (pos: string) => {
    const lower = pos.toLowerCase();
    if (lower.includes('forward') || lower.includes('striker') || lower.includes('wing')) return 'border-jersey-red/20 text-jersey-red bg-jersey-red/5';
    if (lower.includes('midfield')) return 'border-jersey-gold/20 text-jersey-gold bg-jersey-gold/5 dark:bg-jersey-gold/10';
    if (lower.includes('defend') || lower.includes('back')) return 'border-blue-500/20 text-blue-500 bg-blue-500/5';
    if (lower.includes('keeper') || lower.includes('goal')) return 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5';
    return 'border-club-border text-club-text-muted bg-club-secondary';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'guest': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'inactive': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default: return 'bg-club-secondary text-club-text-dim';
    }
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setModalTab('overview');
  };

  const getAttrColor = (val: number) => {
    if (val >= 85) return 'bg-emerald-500';
    if (val >= 75) return 'bg-emerald-400';
    if (val >= 60) return 'bg-yellow-500';
    return 'bg-rose-500';
  };

  const getAttrTextColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400';
    if (val >= 75) return 'text-emerald-300';
    if (val >= 60) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getCategories = (p: Player) => {
    const isGK = p.position.toLowerCase().includes('keeper') || p.position.toLowerCase().includes('goal') || (p.goalkeeping && p.goalkeeping > 60);
    
    if (isGK) {
      return [
        { name: 'DIV (Diving)', val: p.diving || 50, desc: 'Ability to make spectacular aerial blocks' },
        { name: 'REF (Reflexes)', val: p.reflexes || 50, desc: 'Reaction speeds in tight, rapid scenarios' },
        { name: 'HAN (Handling)', val: p.handling || 50, desc: 'Ball retention and catching composure' },
        { name: 'KIC (Kicking)', val: p.kicking || 50, desc: 'Goal kick range and distance clearance' },
        { name: 'POS (Positioning)', val: p.positioning || p.goalkeeping || 50, desc: 'Tactical angle coverage in the penalty area' },
        { name: 'DIS (Distribution)', val: p.distribution || p.passing || 50, desc: 'Throw-ins and short-pass playmaker releases' }
      ];
    }

    return [
      {
        name: 'PAC (Pace)',
        val: p.pace || Math.round(((p.acceleration || 50) + (p.sprintSpeed || 50)) / 2),
        subStats: [
          { name: 'Acceleration', val: p.acceleration },
          { name: 'Sprint Speed', val: p.sprintSpeed }
        ]
      },
      {
        name: 'SHO (Shooting)',
        val: p.shooting || Math.round(((p.finishing || 50) + (p.shotPower || 50) + (p.longShots || 50) + (p.penalties || 50)) / 4),
        subStats: [
          { name: 'Finishing', val: p.finishing },
          { name: 'Shot Power', val: p.shotPower },
          { name: 'Long Shots', val: p.longShots },
          { name: 'Penalties', val: p.penalties },
          { name: 'Curve', val: p.curve },
          { name: 'Volleys', val: p.volleys }
        ]
      },
      {
        name: 'PAS (Passing)',
        val: p.passing || Math.round(((p.shortPass || 50) + (p.longPass || 50) + (p.vision || 50) + (p.crossing || 50)) / 4),
        subStats: [
          { name: 'Short Pass', val: p.shortPass },
          { name: 'Long Pass', val: p.longPass },
          { name: 'Vision', val: p.vision },
          { name: 'Crossing', val: p.crossing },
          { name: 'Free Kick Acc', val: p.freeKickAccuracy }
        ]
      },
      {
        name: 'DRI (Dribbling)',
        val: p.dribbling || Math.round(((p.ballControl || 50) + (p.agility || 50) + (p.balance || 50) + (p.composure || 50)) / 4),
        subStats: [
          { name: 'Ball Control', val: p.ballControl },
          { name: 'Agility', val: p.agility },
          { name: 'Balance', val: p.balance },
          { name: 'Composure', val: p.composure },
          { name: 'Reactions', val: p.reactions },
          { name: 'Skill Moves', val: p.skillMoves }
        ]
      },
      {
        name: 'DEF (Defending)',
        val: p.defending || Math.round(((p.interceptions || 50) + (p.heading || 50) + (p.tackling || 50)) / 3),
        subStats: [
          { name: 'Interceptions', val: p.interceptions },
          { name: 'Heading Acc', val: p.heading },
          { name: 'Tackling', val: p.tackling },
          { name: 'Marking', val: p.marking }
        ]
      },
      {
        name: 'PHY (Physicality)',
        val: p.physical || Math.round(((p.stamina || 50) + (p.strength || 50) + (p.jumping || 50) + (p.aggression || 50)) / 4),
        subStats: [
          { name: 'Stamina', val: p.stamina },
          { name: 'Strength', val: p.strength },
          { name: 'Jumping', val: p.jumping },
          { name: 'Aggression', val: p.aggression }
        ]
      }
    ];
  };

  const getPlayerOverall = (player: Player) => {
    if (player.pace !== undefined) {
      return Math.round(((player.pace || 50) + (player.shooting || 50) + (player.passing || 50) + (player.dribbling || 50) + (player.defending || 50) + (player.physical || 50)) / 6);
    }
    return 75; // dynamic fallback overall
  };

  return (
    <div className="space-y-8 pb-16" id="roster-view">
      
      {/* Header and Filter Controls */}
      <div className="bg-club-card border border-club-border rounded-3xl p-6 space-y-6 shadow-xs animate-fade-in" id="roster-header-filters">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-club-text">Team Roster</h3>
            <p className="text-xs text-club-text-muted mt-1">Filter our star players, view deep athletic metrics, and track individual performance history.</p>
          </div>
          <div className="flex items-center space-x-2 bg-jersey-red/10 border border-jersey-red/25 px-3 py-1.5 rounded-xl text-jersey-red text-xs font-mono w-fit">
            <Trophy className="h-3.5 w-3.5" />
            <span>{filteredPlayers.length} Active Candidates</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Search Box */}
          <div className="relative lg:col-span-4" id="roster-search-box">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-club-text-dim" />
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-club-secondary border border-club-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-club-text placeholder-club-text-dim focus:outline-hidden focus:border-jersey-red/50 transition duration-150"
            />
          </div>

          {/* Season Selector */}
          <div className="relative lg:col-span-4 flex items-center bg-club-secondary border border-club-border rounded-xl px-3" id="season-selector-wrapper">
            <Filter className="h-4 w-4 text-jersey-red/80 mr-2" />
            <span className="text-xs font-mono text-club-text-dim mr-2 whitespace-nowrap">Season:</span>
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold font-mono text-club-text focus:outline-hidden cursor-pointer py-2.5"
            >
              <option value="all" className="bg-zinc-900 text-club-text font-bold">All Historic Seasons</option>
              {allSeasons.map((season) => (
                <option key={season} value={season} className="bg-zinc-900 text-club-text">
                  {season}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="bg-club-secondary border border-club-border p-1 rounded-xl flex items-center lg:col-span-4" id="roster-tabs">
            {(['all', 'active', 'guest', 'inactive'] as const).map((tab) => (
              <button
                key={tab}
                id={`roster-tab-${tab}`}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 text-center py-1.5 text-[11px] font-bold font-mono rounded-lg capitalize transition cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-jersey-red text-white shadow-sm'
                    : 'text-club-text-muted hover:text-club-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Soccer Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in" id="roster-grid">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            id={`player-card-${player.id}`}
            onClick={() => handleSelectPlayer(player)}
            className="group relative bg-club-card border border-club-border rounded-3xl overflow-hidden hover:border-jersey-gold/30 hover:bg-club-card-hover transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg"
          >
            {/* Top Image block - Wide and elegant */}
            <div className="relative h-64 sm:h-72 w-full bg-club-secondary overflow-hidden border-b border-club-border">
              {player.playerImageUrl || player.avatarUrl ? (
                <img
                  src={player.playerImageUrl || player.avatarUrl}
                  alt={`${player.firstName} ${player.lastName}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-club-text-dim/30 bg-gradient-to-b from-club-secondary to-club-card">
                  <User className="h-16 w-16 mb-2" />
                  <span className="text-xs font-mono">TOASTY ATHLETE</span>
                </div>
              )}

              {/* Top Banner on Image */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="w-10 h-10 rounded-xl bg-black/75 backdrop-blur-xs border border-jersey-red/20 flex items-center justify-center font-mono text-lg font-black text-white">
                  {player.number !== undefined ? `#${player.number}` : '--'}
                </span>
              </div>

              {/* Status Tags on Image right */}
              <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono uppercase font-black bg-black/75 backdrop-blur-xs ${getStatusColor(player.status)}`}>
                  {player.status}
                </span>
                {player.captain && (
                  <span className="px-2.5 py-1 bg-jersey-gold text-black font-black font-mono text-[9px] uppercase rounded-md shadow-xs">
                    CAPTAIN
                  </span>
                )}
              </div>

              {/* Overall Badge overlay at bottom left of image */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-jersey-gold/20 flex items-center space-x-1.5 shadow-md">
                <span className="text-[10px] font-mono text-jersey-gold font-bold">OVR</span>
                <span className="text-sm font-black font-mono text-white">{getPlayerOverall(player)}</span>
              </div>
            </div>

            {/* Profile detail section below */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-sans text-lg font-black text-club-text leading-tight group-hover:text-jersey-red transition-colors">
                  {player.firstName} {player.lastName}
                </h4>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${getPositionColor(player.position)}`}>
                    {player.position}
                  </span>
                  {player.footedness && (
                    <span className="text-[10px] font-mono text-club-text-dim">
                      ({player.footedness} foot)
                    </span>
                  )}
                </div>
              </div>

              {/* Custom microstats layout - looks like athletic stats card */}
              <div className="pt-3.5 border-t border-club-border/40 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div>
                  <span className="text-club-text-dim text-[9px] uppercase block">GOALS</span>
                  <span className="font-bold text-club-text">{player.goals !== undefined ? player.goals : 0}</span>
                </div>
                <div>
                  <span className="text-club-text-dim text-[9px] uppercase block">ASSISTS</span>
                  <span className="font-bold text-club-text">{player.assists !== undefined ? player.assists : 0}</span>
                </div>
                <div>
                  <span className="text-club-text-dim text-[9px] uppercase block">GAMES</span>
                  <span className="font-bold text-emerald-400">
                    {player.gamesPlayedCount !== undefined ? player.gamesPlayedCount : Object.keys(player.ratings).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPlayers.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-club-border rounded-2xl bg-club-card" id="no-players-fallback">
            <ShieldAlert className="h-10 w-10 text-club-text-dim mx-auto" />
            <h4 className="text-club-text font-bold mt-3">No players found</h4>
            <p className="text-club-text-dim text-xs mt-1">Try adjusting your search terms or active filters.</p>
          </div>
        )}
      </div>

      {/* Dynamic Player Career Modal */}
      {selectedPlayer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          id="player-career-modal"
          onClick={() => setSelectedPlayer(null)}
        >
          <div 
            className="relative bg-club-card border border-club-border rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-jersey-red/5 rounded-bl-full blur-3xl"></div>
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-2 text-club-text-muted hover:text-club-text bg-club-secondary border border-club-border rounded-full hover:bg-club-card-hover transition z-10 cursor-pointer"
              id="close-player-modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Profile Overview Header with large image */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-shrink-0">
              {selectedPlayer.playerImageUrl || selectedPlayer.avatarUrl ? (
                <img
                  src={selectedPlayer.playerImageUrl || selectedPlayer.avatarUrl}
                  alt={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
                  referrerPolicy="no-referrer"
                  className="h-32 w-32 rounded-2xl border-2 border-jersey-gold object-cover shadow-md"
                />
              ) : (
                <div className="h-32 w-32 rounded-2xl bg-club-secondary border-2 border-club-border flex items-center justify-center text-club-text-dim">
                  <User className="h-14 w-14" />
                </div>
              )}
              
              <div className="text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-2xl font-mono font-black text-jersey-red">
                    {selectedPlayer.number !== undefined ? `#${selectedPlayer.number}` : '--'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-sans font-black text-club-text leading-tight">
                    {selectedPlayer.firstName} {selectedPlayer.lastName}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${getPositionColor(selectedPlayer.position)}`}>
                    {selectedPlayer.position}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${getStatusColor(selectedPlayer.status)}`}>
                    {selectedPlayer.status}
                  </span>
                  {selectedPlayer.captain && (
                    <span className="px-2 py-0.5 bg-jersey-gold text-black font-bold font-mono text-[9px] uppercase rounded-md shadow-xs">
                      CAPTAIN
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-club-text-dim">
                  Overall Skill Rating: <strong className="text-jersey-gold text-sm">{getPlayerOverall(selectedPlayer)}</strong>
                </p>
              </div>
            </div>

            {/* Selector Tabs: Overview vs Stats */}
            <div className="flex bg-club-secondary p-1 rounded-xl border border-club-border text-xs font-mono flex-shrink-0">
              <button
                onClick={() => setModalTab('overview')}
                className={`flex-1 py-2 font-bold rounded-lg transition cursor-pointer ${modalTab === 'overview' ? 'bg-jersey-red text-white' : 'text-club-text-muted hover:text-club-text'}`}
              >
                Overview & History
              </button>
              <button
                onClick={() => setModalTab('attributes')}
                className={`flex-1 py-2 font-bold rounded-lg transition cursor-pointer ${modalTab === 'attributes' ? 'bg-jersey-red text-white' : 'text-club-text-muted hover:text-club-text'}`}
              >
                Stats
              </button>
            </div>

            {/* Scrollable Container Content */}
            <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar flex-grow">
              
              {modalTab === 'overview' ? (
                <>
                  {/* Bio details list */}
                  {(selectedPlayer.nationality || selectedPlayer.dob || selectedPlayer.height || selectedPlayer.footedness) && (
                    <div className="bg-club-secondary/50 border border-club-border/60 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-6 text-xs font-mono">
                      {selectedPlayer.dob && (
                        <div className="flex justify-between border-b border-club-border/40 pb-1.5">
                          <span className="text-club-text-dim flex items-center gap-1"><Calendar className="h-3 w-3 text-jersey-red/70" /> Born:</span>
                          <span className="font-bold text-club-text">{selectedPlayer.dob}</span>
                        </div>
                      )}
                      {selectedPlayer.height && (
                        <div className="flex justify-between border-b border-club-border/40 pb-1.5">
                          <span className="text-club-text-dim flex items-center gap-1"><MapPin className="h-3 w-3 text-jersey-red/70" /> Height:</span>
                          <span className="font-bold text-club-text">{selectedPlayer.height}</span>
                        </div>
                      )}
                      {selectedPlayer.nationality && (
                        <div className="flex justify-between border-b border-club-border/40 pb-1.5">
                          <span className="text-club-text-dim flex items-center gap-1"><Globe className="h-3 w-3 text-jersey-red/70" /> Country:</span>
                          <span className="font-bold text-club-text truncate max-w-[120px]">{selectedPlayer.nationality}</span>
                        </div>
                      )}
                      {selectedPlayer.footedness && (
                        <div className="flex justify-between border-b border-club-border/40 pb-1.5">
                          <span className="text-club-text-dim flex items-center gap-1"><Heart className="h-3 w-3 text-jersey-red/70" /> Foot:</span>
                          <span className="font-bold text-club-text">{selectedPlayer.footedness}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Biography/Notes */}
                  {(selectedPlayer.bio || selectedPlayer.notes) && (
                    <div className="bg-club-secondary border border-club-border rounded-xl p-4">
                      <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-widest block mb-1 font-bold">
                        {selectedPlayer.bio ? 'PLAYER BIOGRAPHY' : 'COACH REMARKS'}
                      </span>
                      <p className="text-xs text-club-text-muted leading-relaxed whitespace-pre-line">
                        {selectedPlayer.bio || `"${selectedPlayer.notes}"`}
                      </p>
                    </div>
                  )}

                  {/* Registered Seasons list */}
                  <div className="bg-club-secondary/40 border border-club-border rounded-xl p-4">
                    <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-widest block mb-2.5 font-bold">REGISTERED CLUB SEASONS</span>
                    <div className="flex flex-wrap gap-2">
                      {getPlayerSeasonsList(selectedPlayer).map((season) => (
                        <span key={season} className="px-2.5 py-1 bg-club-card border border-club-border text-[10px] font-mono text-club-text font-semibold rounded-md">
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* General / Dynamic Statistics */}
                  <div className="grid grid-cols-3 gap-4" id="player-modal-stats-grid">
                    <div className="bg-club-secondary border border-club-border rounded-xl p-3.5 text-center">
                      <span className="text-[9px] font-mono text-club-text-dim uppercase tracking-wider block">Goals Scored</span>
                      <span className="text-lg font-bold font-mono text-jersey-red mt-1 block">
                        {selectedPlayer.goals !== undefined ? selectedPlayer.goals : 0}
                      </span>
                    </div>
                    <div className="bg-club-secondary border border-club-border rounded-xl p-3.5 text-center">
                      <span className="text-[9px] font-mono text-club-text-dim uppercase tracking-wider block">Assists</span>
                      <span className="text-lg font-bold font-mono text-club-text mt-1 block">
                        {selectedPlayer.assists !== undefined ? selectedPlayer.assists : 0}
                      </span>
                    </div>
                    <div className="bg-club-secondary border border-club-border rounded-xl p-3.5 text-center">
                      <span className="text-[9px] font-mono text-club-text-dim uppercase tracking-wider block">Games Played</span>
                      <span className="text-lg font-bold font-mono text-emerald-500 mt-1 block">
                        {selectedPlayer.gamesPlayedCount !== undefined ? selectedPlayer.gamesPlayedCount : Object.keys(selectedPlayer.ratings).length}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Rating Series Sparkline */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-widest flex items-center space-x-1.5 font-bold">
                        <TrendingUp className="h-3.5 w-3.5 text-jersey-red" />
                        <span>SEASON TEAM IMPACT INDEX</span>
                      </span>
                      <span className="text-[9px] text-club-text-dim font-mono font-medium">(Sync Match Series)</span>
                    </div>

                    {Object.keys(selectedPlayer.ratings).length > 0 ? (
                      <div className="bg-club-secondary border border-club-border rounded-2xl p-4" id="ratings-sparkline-container">
                        <div className="relative h-28 w-full">
                          <svg viewBox="0 0 500 100" className="w-full h-full" preserveAspectRatio="none">
                            <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(170,0,0,0.06)" strokeWidth="0.5" strokeDasharray="3,3" />
                            <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(170,0,0,0.12)" strokeWidth="0.5" />
                            <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(170,0,0,0.06)" strokeWidth="0.5" strokeDasharray="3,3" />
                            
                            <path
                              d={(() => {
                                const points = Object.entries(selectedPlayer.ratings).map(([gameNum, val]) => {
                                  const x = (parseInt(gameNum, 10) - 1) * (500 / 11);
                                  const y = val === 1 ? 20 : val === -1 ? 80 : 50;
                                  return `${x},${y}`;
                                });
                                return points.length > 1 ? `M ${points.join(' L ')}` : '';
                              })()}
                              fill="none"
                              stroke="url(#sparkline-grad)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            <defs>
                              <linearGradient id="sparkline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#aa0000" />
                                <stop offset="50%" stopColor="#cabba2" />
                                <stop offset="100%" stopColor="#aa0000" />
                              </linearGradient>
                            </defs>

                            {Object.entries(selectedPlayer.ratings).map(([gameNum, val]) => {
                              const x = (parseInt(gameNum, 10) - 1) * (500 / 11);
                              const y = val === 1 ? 20 : val === -1 ? 80 : 50;
                              const dotColor = val === 1 ? '#10b981' : val === -1 ? '#ef4444' : '#888888';
                              return (
                                <circle
                                  key={gameNum}
                                  cx={x}
                                  cy={y}
                                  r="4.5"
                                  fill={dotColor}
                                  stroke="var(--bg-card)"
                                  strokeWidth="1.5"
                                />
                              );
                            })}
                          </svg>

                          <div className="flex justify-between text-[9px] font-mono text-club-text-dim mt-2 px-1">
                            <span>M1</span>
                            <span>M3</span>
                            <span>M5</span>
                            <span>M7</span>
                            <span>M9</span>
                            <span>M11</span>
                            <span>M12</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-club-secondary border border-club-border rounded-2xl text-club-text-dim font-mono text-xs">
                        No matches or rating history sync active for this player.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* FIFA / FC Attributes panel */
                <div className="space-y-6" id="attributes-list">
                  {getCategories(selectedPlayer).map((cat, idx) => (
                    <div key={idx} className="bg-club-secondary/40 border border-club-border/70 rounded-xl p-4 space-y-3">
                      
                      {/* Main Category row */}
                      <div className="flex items-center justify-between border-b border-club-border/40 pb-2">
                        <span className="font-sans font-black text-xs text-club-text tracking-wider">{cat.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black font-mono ${getAttrTextColor(cat.val)}`}>{cat.val}</span>
                          <span className="text-[10px] text-club-text-dim uppercase font-semibold">Overall</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="h-1.5 w-full bg-club-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${getAttrColor(cat.val)}`} style={{ width: `${cat.val}%` }}></div>
                      </div>

                      {/* Goalkeeper description or Sub stats */}
                      {cat.desc ? (
                        <p className="text-xs text-club-text-dim italic leading-relaxed font-mono">{cat.desc}</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 pt-1 text-[11px] font-mono">
                          {cat.subStats?.map((sub, sidx) => (
                            <div key={sidx} className="flex justify-between">
                              <span className="text-club-text-dim">{sub.name}:</span>
                              <span className={`font-bold ${getAttrTextColor(sub.val || 50)}`}>{sub.val || 50}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Action buttons */}
            <div className="flex justify-end pt-3 border-t border-club-border/30 flex-shrink-0">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-5 py-2 bg-club-secondary hover:bg-club-card-hover text-xs font-mono font-bold rounded-xl border border-club-border text-club-text-muted hover:text-club-text transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
