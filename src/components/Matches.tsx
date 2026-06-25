/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, MapPin, Trophy, X, FileText, ArrowRight, Flame, Users, Play, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Match, Player, Season } from '../types';

interface MatchesProps {
  matches: Match[];
  players: Player[];
  seasons: Season[];
}

export default function Matches({ matches, players, seasons }: MatchesProps) {
  const [seasonFilter, setSeasonFilter] = useState<string>(() => {
    if (seasons && seasons.length > 0) {
      return seasons[seasons.length - 1].id;
    }
    return 'all';
  });
  const [hasSetDefaultSeason, setHasSetDefaultSeason] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (seasons && seasons.length > 0 && !hasSetDefaultSeason) {
      setSeasonFilter(seasons[seasons.length - 1].id);
      setHasSetDefaultSeason(true);
    }
  }, [seasons, hasSetDefaultSeason]);

  // Extract unique seasonIds for filter dropdown
  const uniqueSeasonIds = Array.from(new Set(matches.map((m) => m.seasonId).filter(Boolean))) as string[];

  // Reverse sort seasons so most recent is first
  const sortedSeasons = [...(seasons || [])].reverse();

  // Combine seasons from metadata sheet with any unique season IDs found in matches
  const seasonsForDropdown = [...sortedSeasons];
  uniqueSeasonIds.forEach((id) => {
    if (!seasonsForDropdown.some((s) => s.id === id)) {
      seasonsForDropdown.push({
        id,
        name: id.startsWith('S') ? `Season ${id.substring(1)}` : `Season ${id}`,
        startDate: '',
        endDate: '',
        division: '',
        playersRostered: 0,
        perPlayerFee: 0,
        teamFee: 0,
        amountPaid: 0,
        overview: ''
      });
    }
  });

  // Filter matches based on selected season
  const filteredMatches = matches.filter((match) => {
    return seasonFilter === 'all' || match.seasonId === seasonFilter;
  });

  // Sort matches from most recent to oldest
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    return (b.matchNumber || 0) - (a.matchNumber || 0);
  });

  const getMatchOutcome = (match: Match) => {
    if (match.status === 'upcoming' || !match.score) return 'upcoming';
    if (match.score.toastyFc > match.score.opponent) return 'win';
    if (match.score.toastyFc < match.score.opponent) return 'loss';
    return 'draw';
  };

  // Find players rated in a specific match
  const getMatchRatings = (matchNum: number) => {
    return players
      .filter(p => p.ratings[matchNum] !== undefined)
      .map(p => ({
        name: `${p.firstName} ${p.lastName}`,
        position: p.position,
        rating: p.ratings[matchNum]
      }))
      .sort((a, b) => b.rating - a.rating);
  };

  // Helper to render dual comparison progress bar rows
  const renderStatRow = (label: string, homeValue: number, awayValue: number) => {
    const total = homeValue + awayValue;
    const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
    const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

    return (
      <div className="space-y-1" key={label}>
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="font-bold text-club-text text-left w-12">{homeValue}</span>
          <span className="text-club-text-dim uppercase text-[10px] tracking-wider font-bold text-center flex-1">{label}</span>
          <span className="font-bold text-club-text-muted text-right w-12">{awayValue}</span>
        </div>
        <div className="h-1.5 w-full bg-club-card border border-club-border rounded-full flex overflow-hidden">
          <div 
            className="h-full bg-jersey-red transition-all duration-300" 
            style={{ width: `${homePercent}%` }} 
          />
          <div 
            className="h-full bg-zinc-600 transition-all duration-300" 
            style={{ width: `${awayPercent}%` }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in" id="matches-view">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4" id="matches-controls">
        <div>
          <h3 className="text-xl font-bold text-club-text">Fixture List & Results</h3>
          <p className="text-club-text-dim text-xs mt-0.5">Track upcoming clashes and review statistics of our past encounters.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          {/* Season Filter Dropdown */}
          {seasonsForDropdown.length > 0 && (
            <div className="relative flex-1 sm:flex-none">
              <select
                id="season-filter-dropdown"
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                className="w-full sm:w-56 px-4 py-2 text-xs font-semibold bg-club-card border border-club-border hover:border-club-border-strong rounded-xl text-club-text-muted hover:text-club-text appearance-none cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Seasons</option>
                {seasonsForDropdown.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-club-text-dim">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-4" id="matches-list">
        {sortedMatches.map((match) => {
          const isAwayGame = match.homeAway === 'away';

          return (
            <div
              key={match.id}
              id={`match-row-${match.id}`}
              onClick={() => {
                if (match.status === 'played') setSelectedMatch(match);
              }}
              className={`group flex flex-col bg-club-card border border-club-border rounded-2xl overflow-hidden hover:border-club-border-strong hover:bg-club-card-hover transition duration-150 shadow-xs ${
                match.status === 'played' ? 'cursor-pointer' : ''
              }`}
            >
              {/* Top/Main Scoreboard Area */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Match Number & Date */}
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center w-full sm:w-auto gap-1 border-b sm:border-0 border-club-border/40 pb-2.5 sm:pb-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-jersey-red font-extrabold uppercase bg-jersey-red/10 px-2 py-0.5 rounded-md">
                      MATCH {match.matchNumber}
                    </span>
                    {match.seasonId && (
                      <span className="font-mono text-[10px] text-club-text-dim uppercase font-bold">
                        {match.seasonId.startsWith('S') ? `S${match.seasonId.substring(1)}` : match.seasonId}
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-club-text-muted">
                    {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Center Scoreboard and Team Logos */}
                <div className="flex items-center justify-center gap-4 sm:gap-10 w-full sm:w-auto flex-grow max-w-xl mx-auto py-2 sm:py-0">
                  
                  {/* Team 1 (Left Side - Home) */}
                  <div className="flex items-center gap-2.5 w-5/12 justify-end text-right">
                    <span className="text-sm sm:text-base font-bold text-club-text leading-tight truncate">
                      {isAwayGame ? match.opponent : 'Toasty FC'}
                    </span>
                    <div 
                      className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={isAwayGame && match.opponentColor ? { backgroundColor: match.opponentColor } : {}}
                    >
                      {isAwayGame ? (
                        <div className="h-full w-full flex items-center justify-center font-black text-xs text-white" style={match.opponentColor ? { backgroundColor: match.opponentColor } : {}}>
                          {match.opponent.substring(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <img 
                          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                          alt="Toasty FC" 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Scoreboard Result Display */}
                  <div className="flex items-center justify-center min-w-[70px] flex-shrink-0">
                    {match.status === 'played' && match.score ? (
                      <div className="flex items-center justify-center gap-2 px-3 py-1 bg-club-secondary/80 rounded-xl border border-club-border">
                        <span className={`text-xl font-mono font-black ${isAwayGame ? 'text-club-text-muted' : 'text-jersey-red font-bold'}`}>
                          {isAwayGame ? match.score.opponent : match.score.toastyFc}
                        </span>
                        <span className="text-club-text-dim font-mono text-sm">-</span>
                        <span className={`text-xl font-mono font-black ${isAwayGame ? 'text-jersey-red font-bold' : 'text-club-text-muted'}`}>
                          {isAwayGame ? match.score.toastyFc : match.score.opponent}
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-club-secondary border border-club-border rounded-lg text-xs font-mono font-bold text-club-text-dim tracking-wider">
                        VS
                      </span>
                    )}
                  </div>

                  {/* Team 2 (Right Side - Away) */}
                  <div className="flex items-center gap-2.5 w-5/12 text-left">
                    <div 
                      className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={!isAwayGame && match.opponentColor ? { backgroundColor: match.opponentColor } : {}}
                    >
                      {!isAwayGame ? (
                        <div className="h-full w-full flex items-center justify-center font-black text-xs text-white" style={match.opponentColor ? { backgroundColor: match.opponentColor } : {}}>
                          {match.opponent.substring(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <img 
                          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                          alt="Toasty FC" 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-club-text leading-tight truncate">
                      {isAwayGame ? 'Toasty FC' : match.opponent}
                    </span>
                  </div>

                </div>
              </div>

              {/* Bottom Action & Location Bar */}
              <div className="bg-club-secondary/40 border-t border-club-border/40 px-4 py-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {/* Location Map Pin Info */}
                <div className="flex items-center space-x-1.5 text-club-text-muted font-mono w-full sm:w-auto">
                  <MapPin className="h-3.5 w-3.5 text-club-text-dim flex-shrink-0" />
                  <span className="truncate">{match.location}</span>
                  {match.time && (
                    <>
                      <span className="text-club-text-dim">•</span>
                      <span>{match.time}</span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2.5 w-full sm:w-auto">
                  {match.youtubeLink && (
                    <a 
                      href={match.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl transition duration-150 font-semibold cursor-pointer group"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Watch Highlights</span>
                    </a>
                  )}

                  {match.status === 'played' ? (
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-club-card hover:bg-club-card-hover text-club-text border border-club-border hover:border-club-border-strong rounded-xl transition duration-150 font-semibold cursor-pointer">
                      <span>Match Stats</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-jersey-red/10 border border-jersey-red/20 text-jersey-red rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}

        {sortedMatches.length === 0 && (
          <div className="py-16 text-center border border-dashed border-club-border rounded-2xl bg-club-card animate-fade-in" id="no-matches-fallback">
            <Calendar className="h-10 w-10 text-club-text-dim mx-auto" />
            <h4 className="text-club-text font-bold mt-3">No matches found</h4>
            <p className="text-club-text-dim text-xs mt-1">Try adjusting the filter options.</p>
          </div>
        )}
      </div>

      {/* Match Details Modal (Played matches) */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs animate-fade-in"
          id="match-detail-modal"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="relative bg-club-card border border-club-border rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-5 overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background heat glow */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-jersey-red/5 rounded-bl-full blur-3xl"></div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 p-2 text-club-text-muted hover:text-club-text bg-club-secondary border border-club-border rounded-full hover:bg-club-card-hover transition z-10"
              id="close-match-modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header: Match # and Date */}
            <div className="flex-shrink-0">
              <span className="text-[10px] font-mono text-jersey-red font-bold uppercase tracking-wider">MATCHDAY STATS {selectedMatch.matchNumber}</span>
              <h3 className="text-base font-mono text-club-text-muted mt-1 leading-none">
                {new Date(selectedMatch.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>

            {/* Scrollable Recap body */}
            <div className="overflow-y-auto space-y-5 pr-1 custom-scrollbar flex-grow">
              
              {/* Scoreboard Board */}
              <div className="bg-club-secondary border border-club-border rounded-2xl p-6 flex items-center justify-around text-center">
                <div className="w-1/3 flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center mb-1">
                    <img 
                      src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                      alt="Toasty FC" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-black text-club-text truncate max-w-[100px]">Toasty FC</span>
                  <span className="text-[9px] font-mono text-jersey-red font-bold uppercase">EST. 2022</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-mono font-black text-jersey-red">
                    {selectedMatch.score?.toastyFc}
                  </span>
                  <span className="text-club-text-dim font-mono text-xl">-</span>
                  <span className="text-3xl sm:text-4xl font-mono font-black text-club-text-muted">
                    {selectedMatch.score?.opponent}
                  </span>
                </div>

                <div className="w-1/3 flex flex-col items-center">
                  <div 
                    className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center mb-1"
                    style={selectedMatch.opponentColor ? { backgroundColor: selectedMatch.opponentColor } : {}}
                  >
                    <div className="h-full w-full flex items-center justify-center font-black text-xs text-white" style={selectedMatch.opponentColor ? { backgroundColor: selectedMatch.opponentColor } : {}}>
                      {selectedMatch.opponent.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-xs font-black text-club-text truncate max-w-[100px]">{selectedMatch.opponent}</span>
                  <span className="text-[9px] font-mono text-club-text-dim uppercase font-bold">RIVAL</span>
                </div>
              </div>

              {/* YouTube highlights Link if exists */}
              {selectedMatch.youtubeLink && (
                <div className="pt-1">
                  <a 
                    href={selectedMatch.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2.5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs font-mono transition shadow-md cursor-pointer group"
                  >
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.099-2.099C19.539 3.545 12 3.545 12 3.545s-7.54 0-9.399.519c-1.024.273-1.827 1.077-2.1 2.1C0 8.002 0 12 0 12s0 3.998.501 5.837c.272 1.022 1.074 1.826 2.099 2.099C4.46 20.455 12 20.455 12 20.455s7.54 0 9.399-.519c1.024-.273 1.827-1.077 2.1-2.1C24 15.998 24 12 24 12s0-3.998-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>WATCH REPLAY HIGHLIGHTS ON YOUTUBE</span>
                  </a>
                </div>
              )}

              {/* Scorers & Assists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="match-goals-assists">
                <div className="bg-club-secondary border border-club-border p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-jersey-red uppercase tracking-wider block mb-2 flex items-center space-x-1 font-bold">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>SCORERS</span>
                  </span>
                  {selectedMatch.scorers && selectedMatch.scorers.length > 0 ? (
                    <div className="space-y-1 font-mono text-xs text-club-text-muted">
                      {selectedMatch.scorers.map((scorer, idx) => (
                        <p key={idx} className="flex items-center justify-between">
                          <span>⚽ {scorer}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-club-text-dim italic">No goals logged.</p>
                  )}
                </div>

                <div className="bg-club-secondary border border-club-border p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-jersey-red uppercase tracking-wider block mb-2 flex items-center space-x-1 font-bold">
                    <Users className="h-3.5 w-3.5" />
                    <span>ASSISTS</span>
                  </span>
                  {selectedMatch.assists && selectedMatch.assists.length > 0 ? (
                    <div className="space-y-1 font-mono text-xs text-club-text-muted">
                      {selectedMatch.assists.map((assist, idx) => (
                        <p key={idx}>👟 {assist}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-club-text-dim italic">No assists logged.</p>
                  )}
                </div>
              </div>

              {/* Team Match Statistics Comparison */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-wider block font-bold">MATCH TEAM STATS</span>
                <div className="bg-club-secondary border border-club-border rounded-xl p-4 space-y-4 font-mono text-xs">
                  {renderStatRow('Goals', selectedMatch.score?.toastyFc || 0, selectedMatch.score?.opponent || 0)}
                  {renderStatRow('Penalty Kicks', selectedMatch.pks || 0, selectedMatch.opponentPks || 0)}
                  {renderStatRow('Total Shots', selectedMatch.shots || 0, selectedMatch.opponentShots || 0)}
                  {renderStatRow('Shots on Target', selectedMatch.sot || 0, selectedMatch.opponentSoT || 0)}
                  {renderStatRow('Blocks', selectedMatch.blocks || 0, selectedMatch.opponentBlocks || 0)}
                  {renderStatRow('Corners', selectedMatch.corners || 0, selectedMatch.opponentCorners || 0)}
                  {renderStatRow('Saves', selectedMatch.saves || 0, selectedMatch.opponentSaves || 0)}
                  {renderStatRow('Fouls Committed', selectedMatch.fouls || 0, selectedMatch.opponentFouls || 0)}
                  {renderStatRow('Yellow Cards', selectedMatch.yellows || 0, selectedMatch.opponentYellows || 0)}
                  {renderStatRow('Red Cards', selectedMatch.reds || 0, selectedMatch.opponentReds || 0)}
                </div>
              </div>

              {/* Match Notes / Narrative */}
              {selectedMatch.notes && (
                <div className="bg-club-secondary border border-club-border p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-wider flex items-center space-x-1.5 font-bold">
                    <FileText className="h-3.5 w-3.5 text-jersey-red" />
                    <span>MATCH STATS NARRATIVE</span>
                  </span>
                  <p className="text-xs text-club-text-muted leading-relaxed italic">
                    "{selectedMatch.notes}"
                  </p>
                </div>
              )}

              {/* Game-Specific Ratings / Impact Grid */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-wider block font-bold">MATCH DAY INDIVIDUAL IMPACTS</span>
                <div className="bg-club-secondary border border-club-border rounded-2xl p-4 grid grid-cols-2 gap-3 max-h-40 overflow-y-auto" id="match-modal-ratings">
                  {getMatchRatings(selectedMatch.matchNumber).map((playerRating, idx) => {
                    const ratingIsPositive = playerRating.rating === 1;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-club-card border border-club-border rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-club-text leading-none">{playerRating.name}</p>
                          <span className="text-[9px] text-club-text-dim font-mono mt-1 block">{playerRating.position}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg ${
                          ratingIsPositive 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {ratingIsPositive ? '+1 Win' : '-1 Loss'}
                        </span>
                      </div>
                    );
                  })}
                  {getMatchRatings(selectedMatch.matchNumber).length === 0 && (
                    <p className="col-span-full py-4 text-center text-xs text-club-text-dim font-mono">No performance metrics logged for this match.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="flex justify-between items-center pt-2 flex-shrink-0 border-t border-club-border/30">
              <span className="text-[10px] font-mono text-club-text-dim flex items-center space-x-1.5 font-semibold">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">{selectedMatch.location}</span>
              </span>
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-5 py-2 bg-club-secondary hover:bg-club-card-hover text-xs font-mono font-bold rounded-xl border border-club-border text-club-text-muted hover:text-club-text transition cursor-pointer"
              >
                Close Match Stats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
