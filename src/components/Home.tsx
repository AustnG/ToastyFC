/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame, Calendar, MapPin, Trophy, Shield, Goal, ArrowRight, TrendingUp, Newspaper, Youtube, X, Heart, Play, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { Match, Player, NewsItem, Season } from '../types';

interface HomeProps {
  matches: Match[];
  players: Player[];
  news?: NewsItem[];
  setCurrentTab: (tab: string) => void;
  seasons?: Season[];
}

export default function Home({ matches, players, news = [], setCurrentTab, seasons = [] }: HomeProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Calculate the next match
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  // Recent results (past played matches)
  const pastMatches = matches.filter(m => m.status === 'played').sort((a, b) => b.matchNumber - a.matchNumber);
  const recentResults = pastMatches.slice(0, 3);

  // Active/current season definition
  const activeSeason = seasons && seasons.length > 0 ? seasons[seasons.length - 1] : null;
  const activeSeasonId = activeSeason ? activeSeason.id : null;

  // Filter played matches for the active season to calculate real-time season stats
  const activeSeasonMatches = activeSeasonId 
    ? pastMatches.filter(m => m.seasonId === activeSeasonId)
    : pastMatches;

  // Active season stats calculation
  const wins = activeSeasonMatches.filter(m => m.score && m.score.toastyFc > m.score.opponent).length;
  const losses = activeSeasonMatches.filter(m => m.score && m.score.toastyFc < m.score.opponent).length;
  const draws = activeSeasonMatches.filter(m => m.score && m.score.toastyFc === m.score.opponent).length;
  const cleanSheets = activeSeasonMatches.filter(m => m.cleanSheet).length;
  const totalGoals = activeSeasonMatches.reduce((sum, m) => sum + (m.score?.toastyFc || 0), 0);

  // Helper to extract YouTube ID from links
  const getYouTubeEmbedId = (url: string | undefined): string => {
    if (!url) return 'U_EAtzHscbQ';
    try {
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split(/[?#]/)[0];
      }
      if (url.includes('v=')) {
        return url.split('v=')[1].split(/[&#]/)[0];
      }
      if (url.includes('embed/')) {
        return url.split('embed/')[1].split(/[?#]/)[0];
      }
      const parts = url.split('/');
      const last = parts[parts.length - 1];
      if (last && last.length === 11) {
        return last;
      }
    } catch (e) {
      console.error('Error parsing YouTube link:', e);
    }
    return 'U_EAtzHscbQ';
  };

  // Find latest played match with a youtube link
  const matchesWithVideos = matches
    .filter(m => m.status === 'played' && m.youtubeLink)
    .sort((a, b) => b.matchNumber - a.matchNumber);
  
  const latestMatchWithVideo = matchesWithVideos.length > 0 ? matchesWithVideos[0] : null;
  const videoId = getYouTubeEmbedId(latestMatchWithVideo?.youtubeLink);

  // Filter players who are on the roster for the current season
  const activePlayers = players.filter(p => {
    if (!activeSeasonId) return true;
    if (p.seasons && p.seasons.length > 0) {
      return p.seasons.some(s => s.id === activeSeasonId);
    }
    // Fallback for active status
    return p.status === 'active' || p.status === 'guest';
  });

  // Top player highlight (MVP) strictly chosen from the current season roster
  const mvpCandidate = activePlayers.length > 0
    ? [...activePlayers].sort((a, b) => b.totalRating - a.totalRating)[0]
    : [...players].sort((a, b) => b.totalRating - a.totalRating)[0];

  return (
    <div className="space-y-12 pb-16 animate-fade-in" id="home-view">
      
      {/* 1. News Hero Section */}
      {news && news.length > 0 ? (
        <section className="space-y-6" id="news-hero-section">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="h-3 w-3 rounded-full bg-jersey-red animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-club-text uppercase tracking-tight">LATEST NEWS & CLUB UPDATES</h2>
            </div>
          </div>

          {/* Featured News Hero Card */}
          <div 
            onClick={() => setSelectedNews(news[0])}
            className="group relative overflow-hidden rounded-3xl bg-club-card border border-club-border shadow-md hover:border-jersey-gold/30 hover:bg-club-card-hover transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
          >
            {/* Image (Left on Desktop, Top on Mobile) */}
            <div className="lg:col-span-7 h-64 sm:h-96 lg:h-full min-h-[280px] relative overflow-hidden bg-club-secondary">
              {news[0].imageUrl ? (
                <img 
                  src={news[0].imageUrl} 
                  alt={news[0].title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-club-secondary flex items-center justify-center">
                  <Newspaper className="h-16 w-16 text-club-text-dim/40" />
                </div>
              )}
              {/* Cover Gradient for Mobile/Tablet readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden"></div>
              
              {/* Category Pill Floating on Image */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-jersey-red text-white text-[10px] font-mono font-bold uppercase rounded-lg tracking-wider shadow-md">
                {news[0].category}
              </div>
            </div>

            {/* Text details (Right on Desktop, Bottom on Mobile) */}
            <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-jersey-gold font-bold">{news[0].date}</span>
                  <h3 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-club-text leading-tight group-hover:text-jersey-red transition-colors">
                    {news[0].title}
                  </h3>
                </div>
                <p className="text-sm text-club-text-muted leading-relaxed font-sans line-clamp-4 sm:line-clamp-6">
                  {news[0].content}
                </p>
              </div>

              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNews(news[0]);
                  }}
                  className="px-5 py-3 bg-jersey-red hover:bg-jersey-red/90 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-[0_4px_20px_rgba(170,0,0,0.15)] flex items-center space-x-2 cursor-pointer w-fit"
                >
                  <span>Read Full Update</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary News items (Next 2 items) */}
          {news.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="secondary-news-grid">
              {news.slice(1, 3).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="bg-club-card border border-club-border rounded-2xl overflow-hidden hover:border-jersey-gold/30 hover:bg-club-card-hover transition-all duration-300 flex flex-col justify-between shadow-xs group cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    {item.imageUrl ? (
                      <div className="sm:w-2/5 h-44 sm:h-auto relative overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-club-secondary/85 border border-club-border/40 text-club-text text-[9px] font-mono font-bold uppercase rounded-md">
                          {item.category}
                        </div>
                      </div>
                    ) : (
                      <div className="sm:w-2/5 h-44 sm:h-full bg-club-secondary flex items-center justify-center border-r border-club-border flex-shrink-0">
                        <Newspaper className="h-10 w-10 text-club-text-dim/40" />
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-club-text-dim block">{item.date}</span>
                        <h4 className="text-sm sm:text-base font-bold text-club-text leading-snug group-hover:text-jersey-red transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-club-text-muted leading-relaxed line-clamp-2">
                          {item.content}
                        </p>
                      </div>

                      <span className="text-xs font-mono font-bold text-jersey-red hover:text-jersey-red/80 flex items-center space-x-1 cursor-pointer">
                        <span>Read Story</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Fallback Welcome Hero when there is no news */
        <section className="relative overflow-hidden rounded-3xl bg-club-card border border-club-border shadow-xs" id="hero-section">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-jersey-red/5 dark:bg-jersey-red/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-jersey-gold/5 dark:bg-jersey-gold/10 blur-3xl"></div>
          
          <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:px-16 flex flex-col items-center text-center">
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-club-text max-w-4xl leading-tight">
              TOASTY <span className="text-jersey-red bg-gradient-to-r from-jersey-red to-jersey-gold bg-clip-text text-transparent">FOOTBALL CLUB</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base text-club-text-muted max-w-2xl leading-relaxed">
              Based in Bowling Green, Kentucky. Bound together by sport, friendship, and relentless passion since 2022.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setCurrentTab('matches')}
                className="px-6 py-3 bg-jersey-red hover:bg-jersey-red/90 text-white font-semibold rounded-xl transition shadow-[0_4px_20px_rgba(170,0,0,0.15)] flex items-center space-x-2 text-sm cursor-pointer"
              >
                <span>Schedule & Results</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Combined Upcoming Match Section */}
      {nextMatch && (
        <section className="bg-club-card border border-club-border rounded-3xl overflow-hidden shadow-xs" id="next-fixture-section">
          <div className="border-b border-club-border bg-club-secondary px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-jersey-red" />
              <span className="text-xs font-mono font-bold text-jersey-red uppercase tracking-wider">NEXT UPCOMING FIXTURE</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-club-text-dim">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-jersey-red" />
                <span>{new Date(nextMatch.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
              {nextMatch.time && (
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-jersey-red" />
                  <span>{nextMatch.time}</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-jersey-red" />
                <span>{nextMatch.location}</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
            {/* Team 1: Toasty FC */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left flex-1 md:justify-end w-full">
              <span className="text-xl sm:text-2xl font-black text-club-text tracking-tight uppercase md:order-1">Toasty FC</span>
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-club-border shadow-xs overflow-hidden flex-shrink-0 bg-club-secondary md:order-2">
                <img 
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                  alt="Toasty FC Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* VS Division Badge */}
            <div className="flex flex-col items-center">
              <span className="px-4 py-2 rounded-full bg-club-secondary border border-club-border text-xs font-mono font-black text-club-text-muted uppercase tracking-wider shadow-xs">
                VS
              </span>
            </div>

            {/* Team 2: Opponent */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left flex-1 md:justify-start w-full">
              <div 
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-club-secondary border-2 border-club-border flex items-center justify-center p-2 shadow-xs overflow-hidden flex-shrink-0"
                style={nextMatch.opponentColor ? { backgroundColor: nextMatch.opponentColor } : {}}
              >
                <span className={`text-xl sm:text-2xl font-black ${nextMatch.opponentColor ? 'text-white' : 'text-club-text-muted'}`}>
                  {nextMatch.opponent.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-club-text tracking-tight uppercase">{nextMatch.opponent}</span>
            </div>
          </div>

          <div className="bg-club-secondary/40 border-t border-club-border px-6 py-4 flex justify-end">
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

      {/* 3. Season Stats & Recent Results */}
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
            <span>Active Season Stats {activeSeason ? `(${activeSeason.name})` : ''}</span>
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
                {activeSeasonMatches.length > 0 ? Math.round((wins / activeSeasonMatches.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-club-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-jersey-red to-jersey-gold"
                style={{ width: `${activeSeasonMatches.length > 0 ? (wins / activeSeasonMatches.length) * 100 : 0}%` }}
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

      {/* 4. Match Highlights YouTube Section */}
      <section className="bg-club-card border border-club-border rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6 shadow-xs" id="youtube-embed-showcase">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-club-border/60 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-red-500 uppercase">
              <Youtube className="h-4.5 w-4.5" />
              <span>OFFICIAL HIGHLIGHT REEL</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-club-text">Latest Match Highlights</h3>
            {latestMatchWithVideo ? (
              <p className="text-xs sm:text-sm text-club-text-muted">
                Highlights from our played match: <span className="font-bold text-club-text">Toasty FC vs {latestMatchWithVideo.opponent}</span> ({latestMatchWithVideo.date})
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-club-text-muted">
                Stay connected with the latest goals, saves, and triumphs from Bowling Green Futsal league matches.
              </p>
            )}
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

        {/* Responsive Embedded Player (Contained beautifully) */}
        <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-club-border aspect-video bg-black relative shadow-lg" id="yt-player-container">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`} 
            title="Toasty FC Match Highlights Replay"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        </div>
      </section>

      {/* 5. Featured Player Section */}
      {mvpCandidate && (
        <section className="bg-club-card border border-club-border rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 shadow-md" id="mvp-highlight-banner">
          {/* Left / Top Side: Large, Unconfined Player Image */}
          <div className="md:col-span-5 h-80 md:h-full min-h-[340px] relative bg-club-secondary border-b md:border-b-0 md:border-r border-club-border">
            {mvpCandidate.playerImageUrl || mvpCandidate.avatarUrl ? (
              <img 
                src={mvpCandidate.playerImageUrl || mvpCandidate.avatarUrl}
                alt={`${mvpCandidate.firstName} ${mvpCandidate.lastName}`}
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-club-text-dim/30 bg-gradient-to-b from-club-secondary to-club-card">
                <User className="h-20 w-20 mb-2" />
                <span className="text-xs font-mono">TOASTY ATHLETE</span>
              </div>
            )}
            {/* Elegant overlay gradient to make name legible and premium */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent"></div>
            
            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="w-12 h-12 rounded-xl bg-black/85 backdrop-blur-xs border border-jersey-red/20 flex items-center justify-center font-mono text-xl font-black text-white shadow-lg">
                {mvpCandidate.number !== undefined ? `#${mvpCandidate.number}` : '--'}
              </span>
            </div>
            
            <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
              <span className="px-3 py-1.5 bg-jersey-gold text-black font-black font-mono text-xs uppercase rounded-lg shadow-md flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                <span>SEASON MVP</span>
              </span>
            </div>

            {/* Overall Rating Overlay on Image */}
            <div className="absolute bottom-6 left-6 bg-black/85 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-jersey-gold/30 flex items-center space-x-2 shadow-xl">
              <span className="text-xs font-mono text-jersey-gold font-bold uppercase tracking-wider">OVR</span>
              <span className="text-xl font-black font-mono text-white">
                {mvpCandidate.pace !== undefined 
                  ? Math.round(((mvpCandidate.pace || 50) + (mvpCandidate.shooting || 50) + (mvpCandidate.passing || 50) + (mvpCandidate.dribbling || 50) + (mvpCandidate.defending || 50) + (mvpCandidate.physical || 50)) / 6)
                  : 75
                }
              </span>
            </div>
          </div>

          {/* Right / Bottom Side: Stats & Info Details */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-jersey-red tracking-widest uppercase font-black">FEATURED CLUB MVP</span>
                <h3 className="text-3xl sm:text-4xl font-black text-club-text leading-tight mt-1">{mvpCandidate.firstName} {mvpCandidate.lastName}</h3>
                <div className="flex flex-wrap gap-2 items-center mt-2">
                  <span className="px-3 py-0.5 bg-jersey-red/10 border border-jersey-red/20 text-jersey-red text-xs font-mono rounded-full font-bold uppercase">
                    {mvpCandidate.position}
                  </span>
                  {mvpCandidate.footedness && (
                    <span className="text-xs font-mono text-club-text-dim bg-club-secondary border border-club-border px-2.5 py-0.5 rounded-full">
                      {mvpCandidate.footedness} Footed
                    </span>
                  )}
                </div>
              </div>

              <p className="text-club-text-muted text-sm leading-relaxed font-sans">
                {mvpCandidate.bio || mvpCandidate.notes || `Based on current match-by-match database ratings, ${mvpCandidate.firstName} is having an incredible campaign supporting Toasty FC on and off the ball. With superior teamwork and technical grit, they represent the absolute legacy of the club.`}
              </p>
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-club-border/50 py-6 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-club-text-dim uppercase text-[10px] block">TOTAL IMPACT POINTS</span>
                <span className="text-xl font-black text-club-text font-mono">+{mvpCandidate.totalRating}</span>
              </div>
              <div className="space-y-1">
                <span className="text-club-text-dim uppercase text-[10px] block">GAMES PLAYED</span>
                <span className="text-xl font-black text-club-text font-mono">
                  {Object.keys(mvpCandidate.ratings || {}).length} / {pastMatches.length}
                </span>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-club-text-dim uppercase text-[10px] block">BIRTHPLACE</span>
                <span className="text-sm font-black text-club-text-muted block truncate mt-1">
                  {mvpCandidate.birthplace || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button 
                onClick={() => setCurrentTab('roster')}
                className="text-sm font-black text-jersey-red hover:text-jersey-red/80 flex items-center space-x-1.5 cursor-pointer group"
                id="mvp-btn-roster"
              >
                <span>View Full Team Roster</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
              
              {mvpCandidate.nationality && (
                <div className="text-xs font-mono text-club-text-dim flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-jersey-gold"></span>
                  <span>Representing {mvpCandidate.nationality}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. Interactive Full News Story Reader Modal */}
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
