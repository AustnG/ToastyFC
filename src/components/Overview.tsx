import React, { useState, useEffect } from 'react';
import { Player, Match, NewsItem } from '../types';
import {
  Calendar,
  MapPin,
  ChevronRight,
  BookOpen,
  User,
  Shield,
  X,
  Tv,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { formatDateDisplay, compareDatesAsc, compareDatesDesc, calculateAge } from '../lib/dateUtils';

const CLUB_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png';

const formatKickoffTime = (timeStr?: string): string => {
  if (!timeStr) return 'TBD';
  const clean = timeStr.trim().toUpperCase();
  if (clean.includes('AM') || clean.includes('PM')) {
    return clean;
  }
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm} CT`;
};

interface OverviewProps {
  players: Player[];
  matches: Match[];
  news: NewsItem[];
  onSelectTab: (tab: string) => void;
  activeSeason?: string;
}

export const Overview: React.FC<OverviewProps> = ({
  players,
  matches,
  news,
  onSelectTab,
  activeSeason
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedFullStory, setSelectedFullStory] = useState<NewsItem | null>(null);
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  const activeSpotlightPlayer = players[spotlightIdx] || players[0];

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

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

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

  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const cleaned = url.trim();
    if (cleaned.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
      return cleaned;
    }
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = cleaned.match(regExp);
    return match ? match[1] : null;
  };

  const getMatchYouTubeUrl = (m: Match): string | undefined => {
    const raw = m as unknown as Record<string, unknown>;
    const val =
      m.youtubeUrl ||
      raw.YouTubeurl ||
      raw.YouTubeUrl ||
      raw.youtube_url ||
      raw['YouTube URL'] ||
      raw['YouTube'] ||
      raw['youtube'];
    if (!val) return undefined;
    const str = String(val).trim();
    if (str === '' || ['null', 'undefined', 'none'].includes(str.toLowerCase())) {
      return undefined;
    }
    return str;
  };

  const matchesWithYoutube = [...matches]
    .filter(m => !!getMatchYouTubeUrl(m))
    .map(m => ({ ...m, youtubeUrl: getMatchYouTubeUrl(m) }))
    .sort((a, b) => compareDatesDesc(a.date, b.date, a.time, b.time))
    .slice(0, 3);

  const upcomingMatch = [...matches]
    .filter(m => m.status === 'Upcoming')
    .sort((a, b) => compareDatesAsc(a.date, b.date, a.time, b.time))[0];

  const completedMatches = matches
    .filter(m => m.status === 'Completed')
    .sort((a, b) => compareDatesDesc(a.date, b.date, a.time, b.time));

  const wins = completedMatches.filter(m => (m.toastyScore ?? 0) > (m.opponentScore ?? 0)).length;
  const draws = completedMatches.filter(m => (m.toastyScore ?? 0) === (m.opponentScore ?? 0)).length;
  const losses = completedMatches.filter(m => (m.toastyScore ?? 0) < (m.opponentScore ?? 0)).length;
  const completedCount = completedMatches.length;
  const winRate = completedCount > 0 ? Math.round((wins / completedCount) * 100) : 0;

  const teamGoalsFor = completedMatches.reduce((acc, m) => acc + (m.toastyScore ?? 0), 0);
  const teamGoalsAgainst = completedMatches.reduce((acc, m) => acc + (m.opponentScore ?? 0), 0);
  const goalDiff = teamGoalsFor - teamGoalsAgainst;

  const recentForm = [...completedMatches]
    .slice(0, 5)
    .reverse()
    .map(m => {
      const weScored = m.toastyScore ?? 0;
      const theyScored = m.opponentScore ?? 0;
      const result: 'W' | 'D' | 'L' = weScored > theyScored ? 'W' : weScored < theyScored ? 'L' : 'D';
      return {
        id: m.id,
        opponent: m.opponent,
        result,
        score: `${weScored}-${theyScored}`
      };
    });

  const sortedNews = [...news].sort((a, b) => compareDatesDesc(a.date, b.date));
  const latestNews = sortedNews.slice(0, 4);
  const seasonLabel = activeSeason || matches[0]?.season || matches[0]?.seasonName || 'Active Campaign';

  const spotlightNumber =
    activeSpotlightPlayer &&
    activeSpotlightPlayer.number !== undefined &&
    activeSpotlightPlayer.number !== null &&
    String(activeSpotlightPlayer.number).trim() !== '' &&
    Number(activeSpotlightPlayer.number) > 0
      ? activeSpotlightPlayer.number
      : null;

  const spotlightOvr = activeSpotlightPlayer ? getOverallRating(activeSpotlightPlayer) : null;
  const spotlightAge = activeSpotlightPlayer
    ? (activeSpotlightPlayer.age ?? calculateAge(activeSpotlightPlayer.dateOfBirth))
    : null;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* 1. MATCHDAY HERO (Obsidian Stage — Next Matchup + Season Ledger) */}
      <section className="bg-toasty-obsidian text-white rounded-xl border border-toasty-obsidian-border overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-toasty-obsidian-border">
          {/* Left 7 Cols: Next Matchup */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400">
              <span className="text-toasty-tan font-semibold">
                {upcomingMatch ? 'Next Matchup' : 'Match Center'}
              </span>
              <span>
                {upcomingMatch
                  ? `${upcomingMatch.season || upcomingMatch.seasonName || seasonLabel} · ${upcomingMatch.type || 'League'}`
                  : seasonLabel}
              </span>
            </div>

            {upcomingMatch ? (
              <div className="space-y-7">
                <div className="space-y-2">
                  <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] uppercase tracking-tight leading-[0.95] text-white">
                    Toasty FC <span className="text-toasty-tan font-semibold">vs.</span>{' '}
                    {upcomingMatch.opponent || 'Next Opponent'}
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Official fixture schedule and matchday venue details.
                  </p>
                </div>

                {/* Versus Crest Strip */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5 border-y border-toasty-obsidian-border">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-toasty-obsidian-card border border-toasty-obsidian-border p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={CLUB_LOGO_URL}
                        alt="Toasty FC Crest"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-xl uppercase tracking-wide text-white truncate leading-none">
                        Toasty FC
                      </p>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-toasty-tan mt-1 block">
                        Home
                      </span>
                    </div>
                  </div>

                  <span className="font-display font-extrabold text-xl text-zinc-500 px-2 tracking-widest">
                    VS
                  </span>

                  <div className="flex items-center justify-end gap-3.5 min-w-0 text-right">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-xl uppercase tracking-wide text-white truncate leading-none">
                        {upcomingMatch.opponent || 'Opponent'}
                      </p>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mt-1 block">
                        Away
                      </span>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: upcomingMatch.opponentColor
                          ? `${upcomingMatch.opponentColor}18`
                          : '#16161A',
                        borderColor: upcomingMatch.opponentColor || '#26262C'
                      }}
                    >
                      <Shield size={20} style={{ color: upcomingMatch.opponentColor || '#A1A1AA' }} />
                    </div>
                  </div>
                </div>

                {/* Kickoff & Venue Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-zinc-200 font-mono tabular-nums">
                      <Calendar size={14} className="text-toasty-tan shrink-0" />
                      <span className="font-semibold">
                        {upcomingMatch.date
                          ? formatDateDisplay(upcomingMatch.date, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Date TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-200 font-mono tabular-nums">
                      <Clock size={14} className="text-toasty-red shrink-0" />
                      <span className="font-semibold">{formatKickoffTime(upcomingMatch.time)}</span>
                    </div>
                    {upcomingMatch.location && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <MapPin size={14} className="text-toasty-tan shrink-0" />
                        <span>{upcomingMatch.location}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectTab('matches')}
                    className="bg-toasty-red hover:bg-toasty-red-hover text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    Match Center <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-5">
                <div className="space-y-2">
                  <h1 className="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tight leading-[0.95] text-white">
                    Campaign Complete
                  </h1>
                  <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
                    All scheduled fixtures for {seasonLabel} have been completed. Review match reports, box scores, and season leaders below.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => onSelectTab('matches')}
                    className="bg-toasty-red hover:bg-toasty-red-hover text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    View Match Archive <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => onSelectTab('stats')}
                    className="bg-toasty-obsidian-card hover:bg-zinc-800 border border-toasty-obsidian-border text-zinc-200 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Season Stats
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right 5 Cols: Season Ledger */}
          <div className="lg:col-span-5 bg-toasty-obsidian-card p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400">
              <span>Season Ledger</span>
              <span className="text-toasty-tan truncate">{seasonLabel}</span>
            </div>

            {/* Primary Record Metrics */}
            <div className="grid grid-cols-3 gap-4 pb-5 border-b border-toasty-obsidian-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Record
                </span>
                <div className="font-display font-extrabold text-3xl text-white tabular-nums mt-1 leading-none">
                  {wins}-{draws}-{losses}
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
                  {completedCount} GP
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Win Rate
                </span>
                <div className="font-display font-extrabold text-3xl text-toasty-tan tabular-nums mt-1 leading-none">
                  {winRate}%
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
                  {wins} {wins === 1 ? 'Win' : 'Wins'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Goals
                </span>
                <div className="font-display font-extrabold text-3xl text-white tabular-nums mt-1 leading-none">
                  {teamGoalsFor}:{teamGoalsAgainst}
                </div>
                <span
                  className={`text-[11px] font-mono mt-1 block tabular-nums ${
                    goalDiff > 0
                      ? 'text-emerald-400'
                      : goalDiff < 0
                        ? 'text-red-400'
                        : 'text-zinc-500'
                  }`}
                >
                  {goalDiff > 0 ? `+${goalDiff}` : goalDiff} GD
                </span>
              </div>
            </div>

            {/* Recent 3 Results */}
            <div className="space-y-2.5 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                Latest Results
              </span>
              {completedMatches.length > 0 ? (
                <div className="divide-y divide-toasty-obsidian-border">
                  {completedMatches.slice(0, 3).map(m => {
                    const we = m.toastyScore ?? 0;
                    const they = m.opponentScore ?? 0;
                    const outcome = we > they ? 'W' : we < they ? 'L' : 'D';
                    const outcomeColor =
                      outcome === 'W'
                        ? 'text-emerald-400'
                        : outcome === 'L'
                          ? 'text-zinc-400'
                          : 'text-toasty-tan';
                    return (
                      <div
                        key={m.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-100 block truncate">
                            vs. {m.opponent}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {formatDateDisplay(m.date, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
                          <span className="font-bold text-white">
                            {we} – {they}
                          </span>
                          <span className={`font-bold w-4 text-right ${outcomeColor}`}>
                            {outcome}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4">No completed fixtures logged yet.</p>
              )}
            </div>

            {/* Form Sequence Footer */}
            {recentForm.length > 0 && (
              <div className="pt-4 border-t border-toasty-obsidian-border flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  5-Match Form
                </span>
                <div className="flex items-center gap-1.5">
                  {recentForm.map((f, i) => (
                    <span
                      key={f.id || i}
                      title={`vs ${f.opponent} (${f.score})`}
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                        f.result === 'W'
                          ? 'bg-toasty-red text-white'
                          : f.result === 'D'
                            ? 'bg-toasty-tan text-toasty-obsidian'
                            : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {f.result}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CLUB BULLETINS (Daylight Editorial 7 / 5 Split) */}
      {latestNews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b border-toasty-border pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-red font-semibold block">
                Club Press Office
              </span>
              <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                Club Bulletins
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('news')}
              className="text-xs font-semibold text-zinc-600 hover:text-toasty-red transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              All News ({news.length}) <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-toasty-border">
              {/* Featured Lead Bulletin */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div
                    onClick={() => setSelectedFullStory(latestNews[0])}
                    className="relative aspect-[16/9] rounded-lg overflow-hidden bg-toasty-obsidian cursor-pointer group"
                  >
                    {latestNews[0].imageUrl && !imageErrors[`news-${latestNews[0].id}`] ? (
                      <img
                        src={latestNews[0].imageUrl}
                        alt={latestNews[0].title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setImageErrors(prev => ({ ...prev, [`news-${latestNews[0].id}`]: true }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-toasty-obsidian text-zinc-500 gap-2">
                        <img
                          src={CLUB_LOGO_URL}
                          alt="Toasty FC"
                          className="w-12 h-12 object-contain opacity-60"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[11px] font-mono uppercase tracking-widest text-toasty-tan">
                          Club Bulletin
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                      <span className="text-toasty-red font-semibold">Latest Bulletin</span>
                      <span>·</span>
                      <span className="tabular-nums">
                        {formatDateDisplay(latestNews[0].date, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3
                      onClick={() => setSelectedFullStory(latestNews[0])}
                      className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-zinc-900 hover:text-toasty-red transition-colors leading-[1.05] cursor-pointer"
                    >
                      {latestNews[0].title}
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                      {latestNews[0].summary}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-toasty-border flex items-center justify-between gap-4">
                  <button
                    onClick={() => setSelectedFullStory(latestNews[0])}
                    className="bg-toasty-red hover:bg-toasty-red-hover text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen size={13} /> Read Story
                  </button>
                  <button
                    onClick={() => onSelectTab('news')}
                    className="text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                  >
                    News Archive &rarr;
                  </button>
                </div>
              </div>

              {/* Secondary Bulletins List */}
              <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-toasty-subtle/50">
                <div className="space-y-4">
                  <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-500 font-semibold block">
                    Recent Dispatches
                  </span>

                  {latestNews.length > 1 ? (
                    <div className="divide-y divide-toasty-border">
                      {latestNews.slice(1, 4).map((item, index) => (
                        <button
                          key={`${item.id}-${index}`}
                          type="button"
                          onClick={() => setSelectedFullStory(item)}
                          className="w-full text-left py-4 first:pt-1 last:pb-1 flex items-start gap-3.5 group cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-toasty-obsidian shrink-0 border border-toasty-border">
                            {item.imageUrl && !imageErrors[`news-${item.id}`] ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setImageErrors(prev => ({
                                    ...prev,
                                    [`news-${item.id}`]: true
                                  }))
                                }
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center p-2">
                                <img
                                  src={CLUB_LOGO_URL}
                                  alt="Toasty FC"
                                  className="w-7 h-7 object-contain opacity-60"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="text-[11px] font-mono text-toasty-tan-dark tabular-nums block">
                              {formatDateDisplay(item.date, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <h4 className="font-semibold text-sm text-zinc-900 group-hover:text-toasty-red transition-colors leading-snug line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-xs text-zinc-500 line-clamp-1">{item.summary}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 py-6">No additional bulletins available.</p>
                  )}
                </div>

                <button
                  onClick={() => onSelectTab('news')}
                  className="mt-6 w-full py-2.5 rounded-lg bg-white border border-toasty-border hover:border-zinc-400 text-zinc-700 hover:text-zinc-900 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All Bulletins ({news.length})
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. PLAYER SPOTLIGHT (Editorial Band) */}
      {activeSpotlightPlayer && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b border-toasty-border pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan-dark font-semibold block">
                Squad Feature
              </span>
              <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-zinc-900 leading-none mt-1">
                Player Spotlight
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNextSpotlight}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-toasty-border hover:border-zinc-400 text-zinc-800 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                Next Player <ChevronRight size={14} />
              </button>
              <button
                onClick={() => onSelectTab('roster')}
                className="text-xs font-semibold text-zinc-600 hover:text-toasty-red transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer"
              >
                Full Squad <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Portrait Column */}
              <div className="md:col-span-4 bg-toasty-obsidian relative min-h-[260px] md:min-h-[300px] overflow-hidden flex items-center justify-center">
                {!activeSpotlightPlayer.imageUrl || imageErrors[activeSpotlightPlayer.id] ? (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 rounded-full bg-toasty-obsidian-card border border-toasty-obsidian-border flex items-center justify-center text-zinc-500">
                      <User size={34} />
                    </div>
                    <span className="mt-3 font-display font-extrabold text-3xl tracking-wider text-zinc-500">
                      {getInitials(activeSpotlightPlayer.name)}
                    </span>
                  </div>
                ) : (
                  <img
                    src={activeSpotlightPlayer.imageUrl}
                    alt={activeSpotlightPlayer.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImageErrors(prev => ({ ...prev, [activeSpotlightPlayer.id]: true }))
                    }
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {spotlightNumber !== null && (
                  <span className="absolute bottom-4 left-5 font-display font-extrabold text-5xl text-white/90 leading-none tabular-nums">
                    #{spotlightNumber}
                  </span>
                )}
                {spotlightOvr !== null && (
                  <div className="absolute bottom-4 right-5 text-right">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-toasty-tan leading-none">
                      OVR
                    </span>
                    <span className="font-display font-extrabold text-3xl text-white leading-none tabular-nums">
                      {spotlightOvr}
                    </span>
                  </div>
                )}
              </div>

              {/* Editorial Profile Column */}
              <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex flex-wrap items-center gap-2">
                    <span className="text-toasty-red font-semibold">
                      {activeSpotlightPlayer.position || 'Squad Member'}
                    </span>
                    {activeSpotlightPlayer.isCaptain && (
                      <>
                        <span>·</span>
                        <span className="text-zinc-900 font-semibold">Team Captain</span>
                      </>
                    )}
                    {spotlightAge !== null && (
                      <>
                        <span>·</span>
                        <span className="tabular-nums">{spotlightAge} yrs</span>
                      </>
                    )}
                    {activeSpotlightPlayer.nationality && (
                      <>
                        <span>·</span>
                        <span>{activeSpotlightPlayer.nationality}</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
                    {activeSpotlightPlayer.name}
                  </h3>

                  {activeSpotlightPlayer.bio && (
                    <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl line-clamp-3">
                      {activeSpotlightPlayer.bio}
                    </p>
                  )}
                </div>

                {/* Hairline-divided Tabular Stat Strip */}
                <div className="grid grid-cols-3 divide-x divide-toasty-border border-y border-toasty-border py-4">
                  <div className="pr-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                      Appearances
                    </span>
                    <span className="font-display font-extrabold text-3xl text-zinc-900 tabular-nums mt-0.5 block leading-none">
                      {activeSpotlightPlayer.matchesPlayed ?? 0}
                    </span>
                  </div>
                  <div className="px-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                      Goals
                    </span>
                    <span className="font-display font-extrabold text-3xl text-toasty-red tabular-nums mt-0.5 block leading-none">
                      {activeSpotlightPlayer.goals ?? 0}
                    </span>
                  </div>
                  <div className="pl-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                      Assists
                    </span>
                    <span className="font-display font-extrabold text-3xl text-toasty-tan-dark tabular-nums mt-0.5 block leading-none">
                      {activeSpotlightPlayer.assists ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-mono text-zinc-500 tabular-nums">
                    Player {spotlightIdx + 1} of {players.length}
                  </span>
                  <button
                    onClick={() => onSelectTab('roster')}
                    className="text-xs font-semibold uppercase tracking-wider text-toasty-red hover:text-toasty-red-hover inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Explore Roster &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. LATEST MATCH HIGHLIGHTS (Obsidian Screening Band) */}
      <section
        id="video-highlights-section"
        className="bg-toasty-obsidian text-white rounded-xl border border-toasty-obsidian-border p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-toasty-obsidian-border">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold block">
              Matchday Film Room
            </span>
            <h2 className="font-display font-extrabold text-3xl uppercase tracking-tight text-white leading-none mt-1">
              Latest Highlights
            </h2>
          </div>
          <a
            href="https://www.youtube.com/@toastyfc"
            target="_blank"
            rel="noopener noreferrer"
            id="youtube-subscribe-btn"
            className="bg-toasty-red hover:bg-toasty-red-hover text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Subscribe on YouTube
          </a>
        </div>

        <div
          className={`grid gap-6 ${
            matchesWithYoutube.length === 1
              ? 'grid-cols-1 max-w-2xl'
              : matchesWithYoutube.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {matchesWithYoutube.length > 0 ? (
            matchesWithYoutube.map(m => {
              const videoId = getYouTubeId(m.youtubeUrl);
              const formattedDate = formatDateDisplay(m.date, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={m.id}
                  id={`video-card-${m.id}`}
                  className="bg-toasty-obsidian-card border border-toasty-obsidian-border rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Toasty FC vs. ${m.opponent} Highlights`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center gap-2">
                        <Tv size={24} className="text-zinc-600" />
                        <a
                          href={m.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-toasty-tan hover:text-white inline-flex items-center gap-1"
                        >
                          Watch on YouTube <ArrowUpRight size={13} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between gap-2 tabular-nums">
                      <span className="text-toasty-tan">{formattedDate}</span>
                      <span>
                        {m.toastyScore ?? 0} – {m.opponentScore ?? 0} · {m.type || 'Match'}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg uppercase tracking-wide text-white leading-snug">
                      Toasty FC vs. {m.opponent}
                    </h3>
                    {m.summary && (
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 pt-1">
                        {m.summary}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-10 text-center border border-dashed border-toasty-obsidian-border rounded-lg">
              <Tv className="mx-auto text-zinc-600 mb-2" size={26} />
              <p className="text-sm font-medium text-zinc-400">
                No match highlights linked yet.
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Video links added to match logs automatically appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Full News Story Reader Modal */}
      {selectedFullStory && (
        <div
          onClick={() => setSelectedFullStory(null)}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-toasty-surface border border-toasty-border rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[88vh]"
          >
            <div className="bg-toasty-obsidian text-white px-6 py-4 flex justify-between items-center border-b border-toasty-obsidian-border shrink-0">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-toasty-tan font-semibold">
                Club Press Office · Bulletin
              </span>
              <button
                onClick={() => setSelectedFullStory(null)}
                id="btn-close-story-modal"
                aria-label="Close bulletin"
                className="w-8 h-8 rounded-lg bg-toasty-obsidian-card border border-toasty-obsidian-border hover:border-zinc-500 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {selectedFullStory.imageUrl && !imageErrors[`modal-${selectedFullStory.id}`] && (
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-toasty-obsidian border border-toasty-border">
                  <img
                    src={selectedFullStory.imageUrl}
                    alt={selectedFullStory.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImageErrors(prev => ({
                        ...prev,
                        [`modal-${selectedFullStory.id}`]: true
                      }))
                    }
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="text-xs font-mono text-zinc-500 flex items-center gap-2 uppercase tracking-wider">
                  <span className="text-toasty-red font-semibold">Official Release</span>
                  <span>·</span>
                  <span className="tabular-nums">
                    {formatDateDisplay(selectedFullStory.date, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-zinc-900 leading-none">
                  {selectedFullStory.title}
                </h2>
              </div>

              <div className="h-px bg-toasty-border" />

              <div className="text-zinc-700 text-sm sm:text-base leading-relaxed space-y-4">
                {selectedFullStory.summary &&
                  selectedFullStory.summary.trim() !== selectedFullStory.content?.trim() && (
                    <p className="font-semibold text-zinc-900 bg-toasty-subtle p-4 rounded-lg border border-toasty-border leading-relaxed">
                      {selectedFullStory.summary}
                    </p>
                  )}
                {selectedFullStory.content && (
                  <div className="whitespace-pre-line leading-relaxed text-zinc-700">
                    {selectedFullStory.content}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-toasty-subtle px-6 py-3.5 border-t border-toasty-border flex justify-between items-center text-xs text-zinc-500 font-mono shrink-0">
              <span className="tabular-nums">
                Published{' '}
                {formatDateDisplay(selectedFullStory.date, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="font-semibold text-toasty-tan-dark">Toasty FC Press Office</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
