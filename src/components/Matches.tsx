/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, MapPin, Trophy, X, FileText, ArrowRight, ShieldCheck, Flame, Users, Play } from 'lucide-react';
import { useState } from 'react';
import { Match, Player } from '../types';

interface MatchesProps {
  matches: Match[];
  players: Player[];
}

export default function Matches({ matches, players }: MatchesProps) {
  const [filter, setFilter] = useState<'all' | 'played' | 'upcoming'>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Filter matches based on played/upcoming status
  const filteredMatches = matches.filter((match) => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const getMatchOutcome = (match: Match) => {
    if (match.status === 'upcoming' || !match.score) return 'upcoming';
    if (match.score.toastyFc > match.score.opponent) return 'win';
    if (match.score.toastyFc < match.score.opponent) return 'loss';
    return 'draw';
  };

  const getOutcomeBadgeClass = (outcome: string) => {
    switch (outcome) {
      case 'win': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'loss': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'draw': return 'bg-club-secondary text-club-text-muted border border-club-border';
      default: return 'bg-club-secondary border border-club-border text-club-text-dim';
    }
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

  return (
    <div className="space-y-8 pb-16" id="matches-view">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in" id="matches-controls">
        <div>
          <h3 className="text-xl font-bold text-club-text">Fixture List & Results</h3>
          <p className="text-club-text-dim text-xs mt-0.5">Track upcoming clashes and review details of our past encounters.</p>
        </div>

        <div className="flex bg-club-card border border-club-border p-1 rounded-xl w-full sm:w-auto" id="match-status-tabs">
          {(['all', 'played', 'upcoming'] as const).map((tab) => (
            <button
              key={tab}
              id={`match-tab-${tab}`}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                filter === tab
                  ? 'bg-jersey-red/10 text-jersey-red border border-jersey-red/20'
                  : 'text-club-text-muted hover:text-club-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-4 animate-fade-in" id="matches-list">
        {filteredMatches.map((match) => {
          const outcome = getMatchOutcome(match);
          const isWin = outcome === 'win';

          return (
            <div
              key={match.id}
              id={`match-row-${match.id}`}
              onClick={() => {
                if (match.status === 'played') setSelectedMatch(match);
              }}
              className={`relative bg-club-card border border-club-border rounded-2xl p-5 sm:p-6 hover:border-club-border-strong hover:bg-club-card-hover transition duration-150 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs ${
                match.status === 'played' ? 'cursor-pointer group' : ''
              }`}
            >
              {/* Match Date and Tag */}
              <div className="flex flex-row md:flex-col items-center md:items-start justify-between w-full md:w-auto gap-2 border-b border-club-border md:border-0 pb-3 md:pb-0">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-jersey-red font-bold">MATCH {match.matchNumber}</span>
                  {match.cleanSheet && (
                    <span className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-mono uppercase font-bold">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      <span>CS</span>
                    </span>
                  )}
                </div>
                <span className="text-sm font-mono text-club-text-muted">
                  {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Match Teams & Scoreline */}
              <div className="flex items-center justify-center gap-6 sm:gap-12 w-full md:w-auto flex-1">
                {/* Toasty FC */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-1/3 justify-end text-right">
                  <span className="text-sm sm:text-base font-bold text-club-text hidden sm:inline">Toasty FC</span>
                  <div className="h-10 w-10 rounded-full bg-jersey-red/10 border border-jersey-red/30 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-jersey-red" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-club-text sm:hidden">Toasty FC</span>
                </div>

                {/* Score */}
                <div className="flex items-center justify-center gap-3">
                  {match.status === 'played' && match.score ? (
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl sm:text-3xl font-mono font-black ${isWin ? 'text-jersey-red font-bold' : 'text-club-text'}`}>
                        {match.score.toastyFc}
                      </span>
                      <span className="text-club-text-dim font-mono text-sm">-</span>
                      <span className="text-2xl sm:text-3xl font-mono font-black text-club-text-muted">
                        {match.score.opponent}
                      </span>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-club-secondary border border-club-border rounded-lg text-xs font-mono text-club-text-dim uppercase tracking-widest">
                      VS
                    </span>
                  )}
                </div>

                {/* Opponent */}
                <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-1/3 justify-end sm:justify-start text-left">
                  <span className="text-sm sm:text-base font-bold text-club-text hidden sm:inline truncate max-w-[120px]">{match.opponent}</span>
                  <div className="h-10 w-10 rounded-full bg-club-secondary border border-club-border flex items-center justify-center text-club-text-dim font-black text-xs">
                    {match.opponent.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-club-text sm:hidden truncate max-w-[80px]">{match.opponent}</span>
                </div>
              </div>

              {/* Match Location & Details Link */}
              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 border-t border-club-border md:border-0 pt-3 md:pt-0">
                <div className="flex items-center space-x-1.5 text-club-text-dim text-xs font-mono">
                  <MapPin className="h-3.5 w-3.5 text-club-text-dim" />
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{match.location}</span>
                </div>

                {match.status === 'played' ? (
                  <button className="flex items-center space-x-1 text-xs font-mono font-bold text-jersey-red group-hover:text-jersey-red/80 cursor-pointer">
                    <span className="hidden sm:inline">Recap</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-jersey-red/10 border border-jersey-red/20 text-jersey-red font-mono text-[9px] uppercase font-bold">
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredMatches.length === 0 && (
          <div className="py-16 text-center border border-dashed border-club-border rounded-2xl bg-club-card" id="no-matches-fallback">
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
              <span className="text-[10px] font-mono text-jersey-red font-bold uppercase tracking-wider">MATCHDAY RECAP {selectedMatch.matchNumber}</span>
              <h3 className="text-base font-mono text-club-text-muted mt-1 leading-none">
                {new Date(selectedMatch.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>

            {/* Scrollable Recap body */}
            <div className="overflow-y-auto space-y-5 pr-1 custom-scrollbar flex-grow">
              
              {/* Scoreboard Board */}
              <div className="bg-club-secondary border border-club-border rounded-2xl p-6 flex items-center justify-around text-center">
                <div>
                  <span className="text-sm font-black text-club-text">Toasty FC</span>
                  <span className="text-[10px] font-mono text-jersey-red block mt-0.5 font-bold">EST. 2022</span>
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
                <div>
                  <span className="text-sm font-black text-club-text truncate max-w-[120px] block">{selectedMatch.opponent}</span>
                  <span className="text-[10px] font-mono text-club-text-dim block mt-0.5">LEAGUE RIVAL</span>
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
              {(selectedMatch.shots !== undefined || selectedMatch.saves !== undefined) && (selectedMatch.shots > 0 || selectedMatch.saves > 0) && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-wider block font-bold">MATCH TEAM STATS</span>
                  <div className="bg-club-secondary border border-club-border rounded-xl p-4 space-y-3.5 font-mono text-xs">
                    {/* Shots */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-club-text-muted">
                        <span>{selectedMatch.shots || 0} ({selectedMatch.sot || 0})</span>
                        <span className="text-club-text-dim">Shots (On Target)</span>
                        <span>{selectedMatch.opponentShots || 0} ({selectedMatch.opponentSoT || 0})</span>
                      </div>
                      <div className="h-1.5 w-full bg-club-card border border-club-border rounded-full flex overflow-hidden">
                        <div className="h-full bg-jersey-red" style={{ width: `${((selectedMatch.shots || 0) / Math.max((selectedMatch.shots || 0) + (selectedMatch.opponentShots || 0), 1)) * 100}%` }}></div>
                        <div className="h-full bg-zinc-600" style={{ width: `${((selectedMatch.opponentShots || 0) / Math.max((selectedMatch.shots || 0) + (selectedMatch.opponentShots || 0), 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    {/* Saves */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-club-text-muted">
                        <span>{selectedMatch.saves || 0}</span>
                        <span className="text-club-text-dim">Goal Saves</span>
                        <span>{selectedMatch.opponentSaves || 0}</span>
                      </div>
                      <div className="h-1.5 w-full bg-club-card border border-club-border rounded-full flex overflow-hidden">
                        <div className="h-full bg-jersey-red" style={{ width: `${((selectedMatch.saves || 0) / Math.max((selectedMatch.saves || 0) + (selectedMatch.opponentSaves || 0), 1)) * 100}%` }}></div>
                        <div className="h-full bg-zinc-600" style={{ width: `${((selectedMatch.opponentSaves || 0) / Math.max((selectedMatch.saves || 0) + (selectedMatch.opponentSaves || 0), 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Discipline metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-club-border/40 text-center text-[10px]">
                      <div>
                        <span className="text-club-text-dim uppercase block">Toasty Discipline</span>
                        <p className="mt-1.5 text-xs text-club-text-muted font-bold flex items-center justify-center gap-2">
                          <span>Fouls: {selectedMatch.fouls || 0}</span>
                          <span className="h-4 w-3 bg-yellow-400 rounded-xs inline-block" title="Yellow Cards"></span> {selectedMatch.yellows || 0}
                          <span className="h-4 w-3 bg-red-500 rounded-xs inline-block" title="Red Cards"></span> {selectedMatch.reds || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-club-text-dim uppercase block">Opponent Discipline</span>
                        <p className="mt-1.5 text-xs text-club-text-muted font-bold flex items-center justify-center gap-2">
                          <span>Fouls: {selectedMatch.opponentFouls || 0}</span>
                          <span className="h-4 w-3 bg-yellow-400 rounded-xs inline-block"></span> {selectedMatch.opponentYellows || 0}
                          <span className="h-4 w-3 bg-red-500 rounded-xs inline-block"></span> {selectedMatch.opponentReds || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Notes / Narrative */}
              {selectedMatch.notes && (
                <div className="bg-club-secondary border border-club-border p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-wider flex items-center space-x-1.5 font-bold">
                    <FileText className="h-3.5 w-3.5 text-jersey-red" />
                    <span>MATCH RECAP NARRATIVE</span>
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
                Close Recap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
