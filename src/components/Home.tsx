/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame, Calendar, MapPin, Trophy, Shield, Goal, ArrowRight, TrendingUp, Newspaper, Youtube, X, Heart, Play } from 'lucide-react';
import { useState } from 'react';
import { Match, Player, NewsItem } from '../types';

interface HomeProps {
  matches: Match[];
  players: Player[];
  news?: NewsItem[];
  setCurrentTab: (tab: string) => void;
}

export default function Home({ matches, players, news = [], setCurrentTab }: HomeProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Calculate the next match
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  // Recent results (past played matches)
  const pastMatches = matches.filter(m => m.status === 'played').sort((a, b) => b.matchNumber - a.matchNumber);
  const recentResults = pastMatches.slice(0, 3);

  // Active season stats calculation
  const wins = pastMatches.filter(m => m.score && m.score.toastyFc > m.score.opponent).length;
  const losses = pastMatches.filter(m => m.score && m.score.toastyFc < m.score.opponent).length;
  const draws = pastMatches.filter(m => m.score && m.score.toastyFc === m.score.opponent).length;
  const cleanSheets = pastMatches.filter(m => m.cleanSheet).length;
  const totalGoals = pastMatches.reduce((sum, m) => sum + (m.score?.toastyFc || 0), 0);

  // Top player highlight (MVP)
  const mvpCandidate = [...players].sort((a, b) => b.totalRating - a.totalRating)[0];

  return (
    <div className="space-y-12 pb-16 animate-fade-in" id="home-view">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-club-card border border-club-border shadow-xs" id="hero-section">
        {/* Decorative backdrop glow */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-jersey-red/5 dark:bg-jersey-red/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-jersey-gold/5 dark:bg-jersey-gold/10 blur-3xl"></div>
        
        <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:px-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-jersey-red/10 border border-jersey-red/25 text-jersey-red text-xs font-mono mb-6">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            <span>ACTIVE SINCE 2022</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-club-text max-w-4xl leading-tight">
            FEEL THE HEAT WITH <span className="text-jersey-red bg-gradient-to-r from-jersey-red to-jersey-gold bg-clip-text text-transparent">TOASTY FC</span>
          </h1>
          <p className="mt-5 text-sm sm:text-base text-club-text-muted max-w-2xl leading-relaxed">
            Welcome to the official hub of Toasty FC. Based in Bowling Green, Kentucky, fueled by absolute passion, and bound together since 2022. Follow our matches, track stats, and trace our golden history.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setCurrentTab('matches')}
              className="px-6 py-3 bg-jersey-red hover:bg-jersey-red/90 text-white font-semibold rounded-xl transition shadow-[0_4px_20px_rgba(170,0,0,0.15)] flex items-center space-x-2 text-sm cursor-pointer"
              id="hero-btn-matches"
            >
              <span>Schedule & Results</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentTab('club')}
              className="px-6 py-3 bg-club-secondary hover:bg-club-card-hover border border-club-border text-club-text-muted hover:text-club-text font-semibold rounded-xl transition flex items-center space-x-2 text-sm cursor-pointer"
              id="hero-btn-club"
            >
              <span>Our Story & Gear</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Combined Upcoming Match Section */}
      {nextMatch && (
        <section className="bg-club-card border border-club-border rounded-3xl overflow-hidden shadow-xs" id="next-fixture-section">
          <div className="border-b border-club-border bg-club-secondary px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-jersey-red animate-ping" />
              <span className="text-xs font-mono font-bold text-jersey-red uppercase tracking-wider">NEXT UPCOMING FIXTURE</span>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-club-text-dim">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-jersey-red" />
                <span>{new Date(nextMatch.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-jersey-red" />
                <span>{nextMatch.location}</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Team 1: Toasty FC */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left flex-1 justify-end">
              <div>
                <span className="text-lg sm:text-xl font-black text-club-text tracking-tight uppercase">Toasty FC</span>
                <span className="block text-xs font-mono text-club-text-dim mt-0.5">Home Team (Est. 2022)</span>
              </div>
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-jersey-red/10 border-2 border-jersey-gold/30 flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(170,0,0,0.1)]">
                <img 
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                  alt="Toasty FC" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* VS Division Badge */}
            <div className="flex flex-col items-center">
              <span className="px-3.5 py-1.5 rounded-full bg-club-secondary border border-club-border text-xs font-mono font-black text-club-text-muted uppercase shadow-xs">
                VS
              </span>
              <span className="text-[10px] font-mono text-club-text-dim mt-2 block uppercase font-semibold">Matchday {nextMatch.matchNumber}</span>
            </div>

            {/* Team 2: Opponent */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-4 text-center sm:text-left flex-1 justify-start">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-club-secondary border border-club-border flex items-center justify-center p-2 shadow-xs">
                <span className="text-2xl font-black text-club-text-muted">{nextMatch.opponent.substring(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-club-text tracking-tight uppercase">{nextMatch.opponent}</span>
                <span className="block text-xs font-mono text-club-text-dim mt-0.5">Bowling Green Futsal rival</span>
              </div>
            </div>
          </div>

          <div className="bg-club-secondary/40 border-t border-club-border px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs font-mono text-club-text-muted leading-relaxed">
              <span className="text-jersey-red font-bold uppercase mr-1.5">Coach's Briefing:</span>
              {nextMatch.notes || 'Tactics briefing is ongoing. Get ready for a battle on the turf!'}
            </p>
            <button 
              onClick={() => setCurrentTab('matches')}
              className="text-xs font-mono font-bold text-jersey-red hover:text-jersey-red/80 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Match Details & Lineups</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 3. YouTube Video Embed Integration */}
      <section className="bg-club-card border border-club-border rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6 shadow-xs" id="youtube-embed-showcase">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-club-border/60 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-red-500 uppercase">
              <Youtube className="h-4.5 w-4.5" />
              <span>OFFICIAL HIGHLIGHT REEL</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-club-text">Latest Match Highlights</h3>
            <p className="text-xs sm:text-sm text-club-text-muted">Stay connected to all the goals, saves, and triumphs from Bowling Green Futsal league matches.</p>
          </div>
          <a 
            href="https://www.youtube.com/@ToastyFC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-center"
          >
            <Youtube className="h-4 w-4" />
            <span>Subscribe on YouTube</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Responsive Embedded Player */}
          <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-club-border aspect-video bg-black relative shadow-lg" id="yt-player-container">
            <iframe 
              src="https://www.youtube.com/embed/U_EAtzHscbQ" 
              title="Toasty FC Match Highlights Replay"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
            />
          </div>

          <div className="lg:col-span-4 space-y-4" id="video-info-box">
            <div className="bg-club-secondary/60 border border-club-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-jersey-gold font-bold">
                <Play className="h-4 w-4 text-jersey-gold fill-current" />
                <span>FEATURED GAME PLAYLIST</span>
              </div>
              <h4 className="text-base font-bold text-club-text leading-snug">Championship Campaigns & Post-Match Coverage</h4>
              <p className="text-xs text-club-text-muted leading-relaxed">
                We use a three-camera wireless <strong>Mevo Start</strong> setup to record every single minute. Highlight clips, tactical breakdowns, and spectacular play reviews are uploaded directly to our official channel.
              </p>
              <div className="pt-2">
                <span className="block text-[10px] font-mono text-club-text-dim uppercase tracking-wider font-semibold">Video Features:</span>
                <ul className="text-xs font-mono text-club-text-dim space-y-1.5 mt-2">
                  <li className="flex items-center gap-1.5">
                    <span className="text-red-500">▶</span> Multi-Angle High-Definition Coverage
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-red-500">▶</span> Striker Goals & Key Saves
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-red-500">▶</span> Tactical Post-Match Debriefs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dynamic News Feed from Sheets */}
      {news && news.length > 0 && (
        <section className="space-y-6" id="news-section">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-club-text flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-jersey-red" />
              <span>Latest Club News</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="news-cards-grid">
            {news.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="bg-club-card border border-club-border rounded-2xl overflow-hidden hover:border-jersey-gold/30 hover:bg-club-card-hover transition-all duration-300 flex flex-col justify-between shadow-xs group cursor-pointer"
              >
                <div>
                  {item.imageUrl ? (
                    <div className="overflow-hidden relative h-44">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-jersey-red text-white text-[9px] font-mono font-bold uppercase rounded-md tracking-wider">
                        {item.category}
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 bg-club-secondary flex items-center justify-center border-b border-club-border">
                      <Newspaper className="h-12 w-12 text-club-text-dim/40" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-mono text-club-text-dim block">{item.date}</span>
                    <h4 className="text-base font-bold text-club-text leading-snug group-hover:text-jersey-red transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-club-text-muted leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                  </div>
                </div>
                
                <div className="px-5 pb-5 pt-2 border-t border-club-border/40">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNews(item);
                    }}
                    className="text-xs font-mono font-bold text-jersey-red hover:text-jersey-red/80 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Season Stats & Recent Results */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="quick-data-summary">
        {/* Left: Recent Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-club-text flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-jersey-red" />
              <span>Recent Results</span>
            </h3>
            <button 
              onClick={() => setCurrentTab('matches')} 
              className="text-xs font-mono text-jersey-red hover:text-jersey-red/80 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>All Games</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3" id="recent-results-list">
            {recentResults.map((match) => {
              const isWin = match.score && match.score.toastyFc > match.score.opponent;
              const isLoss = match.score && match.score.toastyFc < match.score.opponent;
              const resultColor = isWin 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500' 
                : isLoss 
                  ? 'bg-rose-500/10 border-rose-500/25 text-rose-500' 
                  : 'bg-club-secondary border-club-border text-club-text-muted';

              return (
                <div 
                  key={match.id}
                  className="bg-club-card border border-club-border rounded-xl p-4 flex items-center justify-between hover:border-club-border-strong hover:bg-club-card-hover transition duration-150"
                >
                  <div className="flex items-center space-x-3.5">
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${resultColor}`}>
                      {isWin ? 'W' : isLoss ? 'L' : 'D'}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-club-text">vs {match.opponent}</p>
                      <p className="text-xs text-club-text-dim font-mono">{match.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-base font-mono font-bold text-club-text">
                      {match.score?.toastyFc} - {match.score?.opponent}
                    </p>
                    <p className="text-[10px] text-club-text-dim font-mono truncate max-w-[150px]">
                      {match.scorers && match.scorers.length > 0 ? match.scorers.slice(0, 2).join(', ') : 'No scorer data'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Team Snapshot / Stats Meter */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-xl font-bold text-club-text flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-jersey-red" />
            <span>Active Season Stats</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="stats-snapshot-grid">
            {/* Wins */}
            <div className="bg-club-card border border-club-border rounded-xl p-4 text-center">
              <span className="block text-2xl font-black text-emerald-500 font-mono">{wins}</span>
              <span className="text-[11px] font-mono text-club-text-dim uppercase tracking-wider block mt-1">WINS</span>
            </div>
            {/* Losses */}
            <div className="bg-club-card border border-club-border rounded-xl p-4 text-center">
              <span className="block text-2xl font-black text-rose-500 font-mono">{losses}</span>
              <span className="text-[11px] font-mono text-club-text-dim uppercase tracking-wider block mt-1">LOSSES</span>
            </div>
            {/* Draws */}
            <div className="bg-club-card border border-club-border rounded-xl p-4 text-center col-span-2 sm:col-span-1">
              <span className="block text-2xl font-black text-club-text-muted font-mono">{draws}</span>
              <span className="text-[11px] font-mono text-club-text-dim uppercase tracking-wider block mt-1">DRAWS</span>
            </div>
          </div>

          <div className="bg-club-card border border-club-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-club-text-muted">
              <span>WIN RATIO</span>
              <span className="text-jersey-red font-bold">
                {pastMatches.length > 0 ? Math.round((wins / pastMatches.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-club-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-jersey-red to-jersey-gold"
                style={{ width: `${pastMatches.length > 0 ? (wins / pastMatches.length) * 100 : 0}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-club-border/50 text-center">
              <div>
                <span className="block text-lg font-bold text-club-text font-mono">{totalGoals}</span>
                <span className="text-[10px] text-club-text-dim font-mono block">Goals Scored</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-club-text font-mono">{cleanSheets}</span>
                <span className="text-[10px] text-club-text-dim font-mono block">Clean Sheets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Player of the Week / Highlight Section */}
      {mvpCandidate && (
        <section className="bg-club-card border border-club-border rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs" id="mvp-highlight-banner">
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-jersey-red to-jersey-gold rounded-full blur-md opacity-35 animate-pulse"></div>
              <img 
                src={mvpCandidate.avatarUrl || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=150&h=150&q=80'}
                alt={`${mvpCandidate.firstName} ${mvpCandidate.lastName}`}
                referrerPolicy="no-referrer"
                className="relative h-28 w-28 rounded-full border-2 border-jersey-gold object-cover"
              />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-club-card border border-jersey-gold flex items-center justify-center shadow-md">
                <Trophy className="h-4 w-4 text-jersey-gold" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-club-text mt-4">{mvpCandidate.firstName} {mvpCandidate.lastName}</h4>
            <span className="text-xs font-mono text-jersey-red font-semibold">{mvpCandidate.position}</span>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="text-[10px] font-mono text-jersey-red tracking-widest uppercase font-bold">SEASON IMPACT LEAD</span>
              <h3 className="text-2xl sm:text-3xl font-black text-club-text leading-tight mt-0.5">Match Rating Leader</h3>
              <p className="text-club-text-muted text-sm mt-1.5 leading-relaxed">
                Based on current match-by-match game database ratings, {mvpCandidate.firstName} is having an incredible campaign supporting Toasty FC on and off the ball.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-club-secondary border border-club-border rounded-xl p-3">
                <span className="text-club-text-dim text-[10px] font-mono block uppercase">TOTAL IMPACT</span>
                <span className="text-lg font-bold text-club-text font-mono">+{mvpCandidate.totalRating}</span>
              </div>
              <div className="bg-club-secondary border border-club-border rounded-xl p-3">
                <span className="text-club-text-dim text-[10px] font-mono block uppercase">GAMES PLAYED</span>
                <span className="text-lg font-bold text-club-text font-mono font-semibold">
                  {Object.keys(mvpCandidate.ratings).length} / {pastMatches.length}
                </span>
              </div>
              <div className="bg-club-secondary border border-club-border rounded-xl p-3 col-span-2 sm:col-span-1">
                <span className="text-club-text-dim text-[10px] font-mono block uppercase">VISION STATUS</span>
                <span className="text-xs text-club-text-muted block truncate mt-0.5">{mvpCandidate.notes || 'Incredible vision.'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setCurrentTab('roster')}
                className="text-sm font-bold text-jersey-red hover:text-jersey-red/80 flex items-center space-x-1.5 cursor-pointer"
                id="mvp-btn-roster"
              >
                <span>View Full Team Roster</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 7. Interactive Full News Story Reader Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in" id="news-modal-overlay">
          <div className="relative w-full max-w-2xl bg-club-card border border-club-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header image if any */}
            {selectedNews.imageUrl && (
              <div className="relative h-56 sm:h-64 w-full bg-club-secondary overflow-hidden">
                <img 
                  src={selectedNews.imageUrl} 
                  alt={selectedNews.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-6">
                  <span className="px-2.5 py-0.5 bg-jersey-red text-white text-[10px] font-mono font-bold uppercase rounded-md tracking-wider w-fit">
                    {selectedNews.category}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
                  id="close-news-modal-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-4 overflow-y-auto">
              {!selectedNews.imageUrl && (
                <div className="flex justify-between items-start gap-4">
                  <span className="px-2.5 py-0.5 bg-jersey-red text-white text-[10px] font-mono font-bold uppercase rounded-md tracking-wider">
                    {selectedNews.category}
                  </span>
                  <button 
                    onClick={() => setSelectedNews(null)}
                    className="p-1.5 rounded-full bg-club-secondary hover:bg-club-card-hover text-club-text-muted transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-club-text-dim block">{selectedNews.date}</span>
                <h3 className="text-xl sm:text-2xl font-black text-club-text leading-snug">{selectedNews.title}</h3>
              </div>

              <div className="h-px bg-club-border/60" />

              <p className="text-sm sm:text-base text-club-text-muted leading-relaxed font-sans whitespace-pre-line">
                {selectedNews.content}
              </p>

              {/* Dynamic support footer inside news story */}
              <div className="pt-6 border-t border-club-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-club-text-dim">
                  <Flame className="h-4 w-4 text-jersey-red" />
                  <span>Reported by Toasty FC Hub</span>
                </div>
                {selectedNews.link ? (
                  <a 
                    href={selectedNews.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-jersey-red hover:bg-jersey-red/90 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Visit External Link</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                ) : (
                  <button 
                    onClick={() => setSelectedNews(null)}
                    className="px-4 py-2 bg-club-secondary hover:bg-club-card-hover border border-club-border text-club-text font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Close Story
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
