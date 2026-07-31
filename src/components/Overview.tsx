import React, { useState, useEffect } from 'react';
import { Player, Match, NewsItem } from '../types';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Star, 
  TrendingUp, 
  Heart, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Clock, 
  Quote, 
  Award, 
  Sparkles, 
  X,
  Tv,
  ChevronRight,
  BookOpen,
  User,
  Shield
} from 'lucide-react';

const formatTo12HourBadge = (timeStr?: string): string => {
  if (!timeStr) return '8:30\nPM';
  const clean = timeStr.trim().toUpperCase();
  if (clean.includes('AM') || clean.includes('PM')) {
    return clean.replace(' ', '\n');
  }
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  
  if (isNaN(hours)) return timeStr;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'
  
  return `${hours}:${minutes}\n${ampm}`;
};

interface OverviewProps {
  players: Player[];
  matches: Match[];
  news: NewsItem[];
  onSelectTab: (tab: string) => void;
}

interface HighlightVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  views: string;
  thumbnail: string;
  timeline: { min: string; event: string; detail: string }[];
  youtubeUrl?: string;
}

export const Overview: React.FC<OverviewProps> = ({ players, matches, news, onSelectTab }) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
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

  // 1. Hero News Navigation State
  const [selectedFullStory, setSelectedFullStory] = useState<NewsItem | null>(null);

  // 2. Player Spotlight State
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const activeSpotlightPlayer = players[spotlightIdx] || players[0];

  // If players list changes or index goes out of bounds, reset index
  useEffect(() => {
    if (spotlightIdx >= players.length) {
      setSpotlightIdx(0);
    }
  }, [players, spotlightIdx]);

  const handleNextSpotlight = () => {
    if (players.length > 0) {
      setSpotlightIdx(prev => (prev + 1) % players.length);
    }
  };

  // Helper to calculate age from DOB
  const getAge = (dobString?: string) => {
    if (!dobString) return null;
    try {
      const birthDate = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  };

  // Helper to get fun custom club metrics per player
  const getFunMetrics = (player: Player) => {
    const name = player.name;
    if (name.includes('Greer')) {
      return [
        { label: 'Toasted Sandwiches Eaten', value: '42' },
        { label: 'Vibe Captain Rating', value: '10/10' },
        { label: 'Laundry Duty Dodged', value: '100%' },
        { label: 'Pre-match DJ Influence', value: '95%' }
      ];
    } else if (name.includes('Toasty')) {
      return [
        { label: 'Vibe Level', value: 'Infinite' },
        { label: 'Toastiness Rating', value: '100%' },
        { label: 'Locker Room DJ Score', value: '4.8/5' },
        { label: 'Post-match Pizzas Eaten', value: '12 slices' }
      ];
    } else if (name.includes('Mendez')) {
      return [
        { label: 'Header Won with Smile', value: '98%' },
        { label: 'Tackles That Apologized', value: '14' },
        { label: 'Pre-match Hair Gel', value: '4.5 oz' },
        { label: 'Post-match High Fives', value: '75' }
      ];
    } else if (name.includes('Ward')) {
      return [
        { label: 'Celebration Delay', value: '1.2s' },
        { label: 'Clean Sheet Pride', value: 'Over 9000' },
        { label: 'Post-game Soda Sips', value: '15' },
        { label: 'Penalty Save Smirk', value: '9.5/10' }
      ];
    } else if (name.includes('Smith') || name.includes('Emily')) {
      return [
        { label: 'Defenders Left Confused', value: '37' },
        { label: 'Cheer Volume', value: '112 dB' },
        { label: 'Assist Celebrations', value: '15' },
        { label: 'Winger Sprint Speed', value: 'Fast AF' }
      ];
    } else if (name.includes('Vance')) {
      return [
        { label: 'Energy Drinks Drunk', value: '7' },
        { label: 'Socks Pulled Up (per match)', value: '42' },
        { label: 'Water Boy Support Level', value: '⭐⭐⭐⭐⭐' },
        { label: 'Vibe Presence', value: '100%' }
      ];
    } else {
      return [
        { label: 'Toastiness Factor', value: '92%' },
        { label: 'Locker Room Cheer Rating', value: '9.8/10' },
        { label: 'Slices of Pizza Consumed', value: '8' },
        { label: 'Ref Arguments Won', value: '0' }
      ];
    }
  };

  // Helper to extract YouTube video ID with support for standard, shorts, embed, live, and raw ID formats
  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const cleaned = url.trim();
    if (cleaned.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
      return cleaned;
    }
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = cleaned.match(regExp);
    return match ? match[1] : null;
  };

  // Helper to extract non-empty YouTube URL checking column header aliases (e.g. youtubeUrl, YouTubeurl, YouTubeUrl, etc.)
  const getMatchYouTubeUrl = (m: Match): string | undefined => {
    const val = m.youtubeUrl || (m as any).YouTubeurl || (m as any).YouTubeUrl || (m as any).youtube_url || (m as any)['YouTube URL'] || (m as any)['YouTube'] || (m as any)['youtube'];
    if (!val) return undefined;
    const str = String(val).trim();
    if (str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'none') {
      return undefined;
    }
    return str;
  };

  // Turn database matches with YouTube links into dynamic highlight videos (pulling the latest available records with a link)
  const matchesWithYoutube = [...matches]
    .filter(m => !!getMatchYouTubeUrl(m))
    .map(m => ({
      ...m,
      youtubeUrl: getMatchYouTubeUrl(m)
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA;
      }
      return (b.date || '').localeCompare(a.date || '');
    })
    .slice(0, 3);

  // Find next upcoming match
  const upcomingMatch = matches.find(m => m.status === 'Upcoming');
  const completedMatches = matches
    .filter(m => m.status === 'Completed')
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeB.localeCompare(timeA);
    });

  // Calculate quick metrics
  const wins = completedMatches.filter(m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0)).length;
  const draws = completedMatches.filter(m => (m.toastyScore ?? 0) === (m.opponentScore ?? 0)).length;
  const losses = completedMatches.filter(m => (m.toastyScore ?? 0) < (m.opponentScore ?? 0)).length;
  const goalsScored = players.reduce((acc, curr) => acc + curr.goals, 0);

  // Sort players for stats summary on home page
  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0];

  // Last 5 matches form guide
  const recentForm = [...completedMatches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .reverse()
    .map(m => {
      const weScored = m.toastyScore ?? 0;
      const theyScored = m.opponentScore ?? 0;
      let result: 'W' | 'D' | 'L' = 'D';
      if (weScored > theyScored) result = 'W';
      else if (weScored < theyScored) result = 'L';
      return {
        id: m.id,
        opponent: m.opponent,
        result,
        score: `${weScored}-${theyScored}`
      };
    });

  // Sort news in descending order by date so latest items appear at the top
  const sortedNews = [...news].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.date || '').localeCompare(a.date || '');
  });

  // Limit to the latest 4 articles
  const latestNews = sortedNews.slice(0, 4);

  return (
    <div className="space-y-10">
      
      {/* 1. Full-Width Hero News Section */}
      {latestNews.length > 0 && (
        <div className="bg-white border border-slate-200/65 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between relative group animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-12 h-full divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* Left Side: Big Hero Story (latest news record) */}
            <div className="md:col-span-7 flex flex-col justify-between p-6 sm:p-8 space-y-4">
              <div className="space-y-4">
                <div 
                  onClick={() => setSelectedFullStory(latestNews[0])}
                  className="relative h-44 sm:h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-sm group/hero cursor-pointer"
                >
                  <img 
                    src={latestNews[0].imageUrl || null} 
                    alt={latestNews[0].title} 
                    className="w-full h-full object-cover transition duration-500 group-hover/hero:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <span className="absolute top-3 left-3 bg-toasty-red text-white text-[9px] px-2.5 py-1 rounded-md font-mono font-black uppercase tracking-wider shadow-sm border border-red-500/20">
                    LATEST BULLETIN
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-toasty-tan font-bold">
                      ✍️ {latestNews[0].author}
                    </span>
                    <span className="text-slate-300 font-semibold">
                      {latestNews[0].date}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 
                    onClick={() => setSelectedFullStory(latestNews[0])}
                    className="font-display font-black text-slate-900 text-xl sm:text-2xl lg:text-3xl leading-tight tracking-tight hover:text-toasty-red transition duration-150 cursor-pointer"
                  >
                    {latestNews[0].title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    {latestNews[0].summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedFullStory(latestNews[0])}
                  className="bg-toasty-red hover:bg-toasty-red-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-950/30 uppercase tracking-wider cursor-pointer border border-red-500/30"
                >
                  <BookOpen size={13} /> Read Story
                </button>
                <button 
                  onClick={() => onSelectTab('news')}
                  className="text-slate-400 hover:text-slate-800 text-[10px] font-bold font-mono uppercase tracking-wider"
                >
                  Go To News &rarr;
                </button>
              </div>
            </div>

            {/* Right Side: Next 3 news records as options */}
            <div className="md:col-span-5 bg-slate-50/40 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase tracking-widest block">
                    More Bulletins
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>

                {latestNews.length > 1 ? (
                  <div className="space-y-3">
                    {latestNews.slice(1, 4).map((item, index) => {
                      return (
                        <div
                          key={`${item.id}-${index}`}
                          onClick={() => setSelectedFullStory(item)}
                          className="group/item cursor-pointer flex gap-4 bg-white p-3 rounded-2xl border border-slate-100/80 hover:border-slate-200 hover:shadow-md transition-all duration-200 items-center min-w-0"
                        >
                          <img 
                            src={item.imageUrl || null} 
                            alt={item.title} 
                            className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0 shadow-sm transition duration-350 group-hover/item:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="block text-[9px] font-mono font-bold text-toasty-tan uppercase tracking-wider">
                              {item.date}
                            </span>
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover/item:text-toasty-red transition duration-150 leading-snug tracking-tight line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 font-mono">
                    No additional bulletins available.
                  </div>
                )}
              </div>

              <button 
                onClick={() => onSelectTab('news')}
                className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all text-xs font-bold uppercase tracking-wider shadow-sm text-center cursor-pointer"
              >
                View All Bulletins ({news.length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Matchday, Season & Spotlight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-fade-in">

        {/* Card 1: Next Upcoming Clash */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-900 min-h-[430px]">
          {/* subtle background glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-toasty-red/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <h3 className="text-xs font-display font-bold tracking-widest text-toasty-tan uppercase flex items-center gap-1.5">
                <Calendar size={14} className="text-toasty-tan" /> Next Game
              </h3>
              <span className="bg-toasty-red/20 text-red-300 text-[9px] font-extrabold font-mono px-2.5 py-0.5 rounded border border-toasty-red/40 uppercase tracking-wider">
                {upcomingMatch?.type || 'Fixture'}
              </span>
            </div>

            {upcomingMatch ? (
              /* Premium Matchday Clash Section */
              <div className="flex-1 flex flex-col justify-center space-y-6">
                
                {/* Massive Opponent Headline */}
                <div className="text-center space-y-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">UPCOMING MATCHUP</span>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">
                    vs {upcomingMatch.opponent || 'Next Opponent'}
                  </h2>
                </div>

                {/* Big visual versus row */}
                <div className="bg-slate-900/45 border border-slate-900 rounded-2xl p-4.5 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-toasty-tan/5 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between gap-4">
                    {/* Home Team */}
                    <div className="flex-1 text-center min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-toasty-tan/30 p-1 flex items-center justify-center mx-auto shadow-md">
                        <img 
                          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                          alt="Toasty FC" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="font-black text-xs text-white uppercase tracking-tight mt-2 truncate">Toasty FC</p>
                      <span className="text-[9px] text-toasty-tan font-mono font-bold uppercase tracking-wider block mt-0.5">Home</span>
                    </div>

                    {/* VS Badge */}
                    <div className="shrink-0">
                      <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[11px] font-black text-toasty-tan font-mono shadow-lg">
                        VS
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center min-w-0">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-md"
                        style={{ 
                          backgroundColor: upcomingMatch.opponentColor ? `${upcomingMatch.opponentColor}20` : '#1E293B',
                          borderColor: upcomingMatch.opponentColor ? upcomingMatch.opponentColor : '#475569',
                          borderWidth: '1px'
                        }}
                      >
                        <Shield size={20} style={{ color: upcomingMatch.opponentColor || '#94A3B8' }} />
                      </div>
                      <p className="font-black text-xs text-white uppercase tracking-tight mt-2 truncate">
                        {upcomingMatch.opponent || 'Opponent'}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider block mt-0.5">Away</span>
                    </div>
                  </div>
                </div>

                {/* Info Block: Ticket details (Schedule & Venue combined) */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3.5">
                    <div className="bg-toasty-red text-white text-xs font-black py-2 px-2.5 rounded-xl text-center font-mono leading-none shrink-0 min-w-[54px] shadow-md border border-red-500/30 whitespace-pre-line">
                      {upcomingMatch.time ? formatTo12HourBadge(upcomingMatch.time) : '8:30\nPM'}
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                        SCHEDULED KICKOFF
                      </span>
                      <div className="text-sm font-black text-white tracking-tight mt-1">
                        {(() => {
                          if (!upcomingMatch.date) return 'TBD';
                          try {
                            const d = new Date(upcomingMatch.date);
                            if (!isNaN(d.getTime())) {
                              return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                            }
                          } catch (e) {}
                          return upcomingMatch.date;
                        })()}
                      </div>
                    </div>
                  </div>

                  {upcomingMatch.location && (
                    <div className="bg-slate-900/50 border border-slate-900/30 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5">
                      <MapPin size={14} className="text-toasty-tan shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 block leading-none">
                          MATCH VENUE
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate block mt-1 leading-tight">
                          {upcomingMatch.location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* No Upcoming Match Empty State */
              <div className="flex-1 flex flex-col justify-center items-center text-center px-4 py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-toasty-tan">
                  <Calendar size={28} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-200 font-mono tracking-wider uppercase">No Upcoming Match</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[210px] mx-auto">
                    Toasty FC has completed all scheduled fixtures. Check back soon for the next campaign!
                  </p>
                </div>
                <button
                  onClick={() => onSelectTab('matches')}
                  className="mt-2 text-[10px] font-black uppercase tracking-wider text-toasty-tan hover:text-white transition-colors bg-toasty-tan/10 hover:bg-toasty-tan/20 px-3.5 py-1.5 rounded-lg border border-toasty-tan/20 cursor-pointer"
                >
                  View Schedule & Results
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Card 2: Current Season */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[430px]">
          {/* subtle background gradient glow */}
          <div className="absolute top-0 left-0 w-44 h-44 bg-toasty-red/10 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <h3 className="text-xs font-display font-bold tracking-widest text-toasty-tan uppercase flex items-center gap-1.5">
                <TrendingUp size={14} className="text-toasty-tan" /> Current Season
              </h3>
              <span className="bg-toasty-tan/20 text-toasty-tan-light text-[9px] font-extrabold font-mono px-2.5 py-0.5 rounded border border-toasty-tan/40 tracking-wider">
                {matches[0]?.season ? `${matches[0].season}` : 'ACTIVE'}
              </span>
            </div>
            
            {/* Massive Season Record / Win Rate Dashboard */}
            <div className="flex items-stretch gap-3">
              <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center items-center text-center shadow-inner relative overflow-hidden">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-extrabold">Win Rate</span>
                <div className="text-5xl font-black text-toasty-red font-mono tracking-tighter mt-1 leading-none">
                  {Math.round((wins / (completedMatches.length || 1)) * 100)}%
                </div>
                <span className="text-[9px] text-slate-500 font-mono uppercase mt-1.5 font-bold block">
                  {wins}W / {completedMatches.length} GP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="bg-slate-900/40 border border-slate-900/80 p-2.5 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-toasty-red font-black block tracking-wider">WINS</span>
                  <span className="text-2xl font-black font-mono text-white block mt-1 leading-none">{wins}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900/80 p-2.5 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-toasty-tan font-black block tracking-wider">DRAWS</span>
                  <span className="text-2xl font-black font-mono text-white block mt-1 leading-none">{draws}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900/80 p-2.5 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-stone-400 font-black block tracking-wider">LOSSES</span>
                  <span className="text-2xl font-black font-mono text-white block mt-1 leading-none">{losses}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900/80 p-2.5 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-400 font-black block tracking-wider">GP</span>
                  <span className="text-2xl font-black font-mono text-white block mt-1 leading-none">{completedMatches.length}</span>
                </div>
              </div>
            </div>

            {/* Last 3 Results List */}
            <div className="space-y-2">
              <span className="text-slate-400 text-[9px] font-black uppercase font-mono tracking-widest block">Recent Results</span>
              {completedMatches.length > 0 ? (
                <div className="space-y-2">
                  {completedMatches.slice(0, 3).map((m) => {
                    const weScored = m.toastyScore ?? 0;
                    const theyScored = m.opponentScore ?? 0;
                    const isWin = weScored > theyScored;
                    const isLoss = weScored < theyScored;
                    const badgeColor = isWin 
                      ? 'bg-toasty-red/20 text-red-300 border border-toasty-red/40' 
                      : isLoss 
                        ? 'bg-stone-800 text-stone-300 border border-stone-700' 
                        : 'bg-toasty-tan/20 text-toasty-tan-light border border-toasty-tan/30';
                    return (
                      <div key={m.id} className="flex items-center justify-between text-xs bg-slate-900/40 border border-slate-900/60 px-3 py-2 rounded-xl">
                        <div className="min-w-0 truncate pr-2">
                          <span className="font-extrabold text-slate-200 block truncate">vs {m.opponent}</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-mono text-slate-300 font-black">{weScored} - {theyScored}</span>
                          <span className={`text-[9px] font-black font-mono w-5 h-5 flex items-center justify-center rounded ${badgeColor}`}>
                            {isWin ? 'W' : isLoss ? 'L' : 'D'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center p-3 bg-slate-900/30 border border-slate-900 border-dashed rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono">No matches completed</span>
                </div>
              )}
            </div>

            {/* Combined Goals Tracker & Form Guide */}
            <div className="bg-gradient-to-r from-toasty-red/15 via-toasty-tan/10 to-transparent border border-toasty-tan/20 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Goals Scored</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-toasty-tan font-mono leading-none">{goalsScored}</span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold">Avg {(goalsScored / (completedMatches.length || 1)).toFixed(1)}/G</span>
                </div>
              </div>
              
              {/* Form Guide */}
              {recentForm.length > 0 && (
                <div className="text-right">
                  <span className="text-slate-400 text-[8px] font-bold uppercase font-mono tracking-wider block mb-1">Recent Form</span>
                  <div className="flex items-center gap-1 justify-end">
                    {recentForm.map((f, i) => (
                      <span 
                        key={f.id || i} 
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold font-mono text-[9px] border ${
                          f.result === 'W' 
                            ? 'bg-toasty-red text-white border-red-500/30' 
                            : f.result === 'L' 
                              ? 'bg-stone-800 border-stone-700 text-stone-300' 
                              : 'bg-toasty-tan/20 border-toasty-tan/30 text-toasty-tan'
                        }`}
                        title={`vs ${f.opponent} (${f.score})`}
                      >
                        {f.result}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Card 3: Compact Player Spotlight */}
        {activeSpotlightPlayer && (
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden text-white min-h-[430px]">
            <div className="space-y-4 h-full flex flex-col justify-between">
              
              {/* Header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <h3 className="text-xs font-display font-bold tracking-widest text-toasty-tan uppercase flex items-center gap-1.5">
                  <Star size={14} className="text-toasty-tan fill-toasty-tan" /> Player Spotlight
                </h3>
                <button 
                  onClick={handleNextSpotlight}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-toasty-tan text-[10px] font-bold font-mono px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-md"
                >
                  Next <ChevronRight size={12} />
                </button>
              </div>

              {/* Massive Trading-Card Player Portrait Container */}
              <div className="relative w-full h-[225px] rounded-2xl overflow-hidden border border-slate-900 bg-slate-900 flex items-center justify-center shadow-2xl group">
                {!activeSpotlightPlayer.imageUrl || imageErrors[activeSpotlightPlayer.id] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 text-center p-4">
                    <User className="w-16 h-16 text-slate-700 mb-2 animate-pulse" />
                    <span className="text-base font-black font-mono tracking-wider text-slate-400">
                      {getInitials(activeSpotlightPlayer.name)}
                    </span>
                  </div>
                ) : (
                  <img 
                     src={activeSpotlightPlayer.imageUrl} 
                    alt={activeSpotlightPlayer.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [activeSpotlightPlayer.id]: true }));
                    }}
                  />
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                  {activeSpotlightPlayer.isCaptain && (
                    <span className="bg-toasty-red text-white font-mono text-[8px] font-black uppercase px-2.5 py-0.5 rounded shadow-md border border-red-500/30">
                      Captain
                    </span>
                  )}
                  <span className="bg-slate-950/85 backdrop-blur-sm text-slate-300 font-mono text-[8px] font-bold uppercase px-2 py-0.5 rounded border border-slate-800">
                    {activeSpotlightPlayer.nationality || 'American'}
                  </span>
                </div>

                {/* Top Right Massive Jersey Number & Overall Rating */}
                <div className="absolute top-3.5 right-3.5 flex flex-col items-center gap-1.5">
                  <div className="bg-toasty-red text-white font-mono text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-red-500/30">
                    #{activeSpotlightPlayer.number}
                  </div>
                  {getOverallRating(activeSpotlightPlayer) && (
                    <div className="bg-toasty-red text-white font-mono text-[9px] font-black w-7 h-7 rounded-lg flex flex-col items-center justify-center shadow-lg border border-red-500/30" title="Overall Rating">
                      <span className="leading-none text-[8px] text-red-200 uppercase font-mono">OVR</span>
                      <span className="leading-none mt-0.5 font-bold">{getOverallRating(activeSpotlightPlayer)}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Gradient Fade with Name and Position */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-16 pb-4 px-4 text-left">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-black text-lg sm:text-xl text-white tracking-tight uppercase leading-none truncate drop-shadow-lg">
                      {activeSpotlightPlayer.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {getAge(activeSpotlightPlayer.dateOfBirth) || '24'} YRS
                    </span>
                  </div>
                  <p className="text-toasty-tan text-[10px] font-mono font-extrabold uppercase tracking-widest mt-2 leading-none">
                    {activeSpotlightPlayer.position}
                  </p>
                </div>
              </div>

              {/* Metrics Row (Full Width, highly visual) */}
              <div className="flex gap-3 text-center">
                <div className="flex-1 bg-slate-900/40 border border-slate-900/80 p-3 rounded-2xl shadow-sm">
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Matches</span>
                  <strong className="text-2xl font-black text-white font-mono mt-1 block leading-none">{activeSpotlightPlayer.matchesPlayed}</strong>
                </div>
                <div className="flex-1 bg-toasty-red/10 border border-toasty-red/20 p-3 rounded-2xl shadow-sm">
                  <span className="text-[9px] text-toasty-red font-mono font-bold uppercase tracking-wider block">Goals</span>
                  <strong className="text-2xl font-black text-toasty-red font-mono mt-1 block leading-none">{activeSpotlightPlayer.goals}</strong>
                </div>
                <div className="flex-1 bg-toasty-tan/10 border border-toasty-tan/20 p-3 rounded-2xl shadow-sm">
                  <span className="text-[9px] text-toasty-tan-dark font-mono font-bold uppercase tracking-wider block">Assists</span>
                  <strong className="text-2xl font-black text-toasty-tan font-mono mt-1 block leading-none">{activeSpotlightPlayer.assists}</strong>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onSelectTab('roster')}
              className="mt-4 text-center w-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold py-2.5 px-3 rounded-xl border border-slate-900/80 transition font-mono uppercase tracking-wider cursor-pointer"
            >
              View Full Squad &rarr;
            </button>
          </div>
        )}

      </div>

      {/* 3. Latest Video Highlights Center */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden" id="video-highlights-section">
        
        {/* Glow ambient decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-toasty-red/10 via-transparent to-transparent pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Tv className="text-toasty-red" size={20} /> Latest Highlights
            </h3>
            <p className="text-xs text-slate-400">
              Watch real match footage and highlight reels of our latest fixtures.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {/* Subscribe Button */}
            <a 
              href="https://www.youtube.com/@toastyfc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-toasty-red hover:bg-toasty-red-hover text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md uppercase tracking-wider border border-red-500/30"
              id="youtube-subscribe-btn"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Subscribe to TostyFC
            </a>
          </div>
        </div>

        <div className={`relative z-10 grid gap-6 ${
          matchesWithYoutube.length === 1
            ? 'grid-cols-1 max-w-2xl mx-auto'
            : matchesWithYoutube.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {matchesWithYoutube.length > 0 ? (
            matchesWithYoutube.map((m) => {
              const videoId = getYouTubeId(m.youtubeUrl);
              let formattedDate = m.date;
              try {
                formattedDate = new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              } catch (e) {}

              return (
                <div 
                  key={m.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
                  id={`video-card-${m.id}`}
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    {videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Toasty FC vs. ${m.opponent} Highlights`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <Tv size={24} className="text-slate-600 mb-2 animate-pulse" />
                        <span className="text-xs text-slate-400 font-mono">No video embedding support</span>
                        <a 
                          href={m.youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-toasty-tan hover:underline mt-2 font-mono flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded"
                        >
                          Watch on YouTube &rarr;
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-1.5 bg-slate-900">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-100 text-sm tracking-tight leading-snug">
                        Toasty FC vs. {m.opponent}
                      </h4>
                      <span className="text-[9px] font-mono font-bold text-toasty-tan bg-toasty-tan/15 border border-toasty-tan/30 px-2 py-0.5 rounded uppercase shrink-0">
                        {formattedDate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Result: <span className="font-bold text-slate-100">{m.toastyScore ?? 0} - {m.opponentScore ?? 0}</span> ({m.type || 'Match'})
                    </p>
                    {m.summary && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 pt-1 border-t border-slate-800/60 mt-1">
                        {m.summary}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
              <Tv className="mx-auto text-slate-600 mb-3" size={32} />
              <p className="text-sm font-medium text-slate-400">No Matchday Highlights available yet.</p>
              <p className="text-xs text-slate-500 mt-1">Highlights will appear here once video links are uploaded to the match logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Full News Story Modal --- */}
      {selectedFullStory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 transition-all animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
              <span className="text-xs font-bold text-amber-600 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen size={13} className="text-amber-500" /> Club Editorial Bulletin
              </span>
              <button 
                onClick={() => setSelectedFullStory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 transition"
                id="btn-close-story-modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden shadow-md">
                <img 
                  src={selectedFullStory.imageUrl || null} 
                  alt={selectedFullStory.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Published on {selectedFullStory.date}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="bg-amber-500/10 text-amber-700 px-2.5 py-0.5 rounded-full font-bold">
                    HOT NEWS
                  </span>
                  <span>•</span>
                  <span>By {selectedFullStory.author}</span>
                </div>

                <h2 className="font-extrabold text-slate-950 text-2xl sm:text-3xl leading-tight tracking-tight">
                  {selectedFullStory.title}
                </h2>

                <div className="h-px bg-slate-100 my-4" />

                <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
                  {selectedFullStory.summary && selectedFullStory.summary.trim() !== selectedFullStory.content?.trim() && (
                    <p className="font-bold text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-100/80 leading-relaxed">
                      {selectedFullStory.summary}
                    </p>
                  )}
                  {selectedFullStory.content && (
                    <div className="whitespace-pre-line leading-relaxed text-slate-800">
                      {selectedFullStory.content}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-mono shrink-0">
              <span>Author: {selectedFullStory.author}</span>
              <span className="font-bold text-amber-600">Toasty FC Press Office</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
