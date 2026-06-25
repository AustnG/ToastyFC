/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trophy, TrendingUp, ShieldCheck, Flame, Goal, Users, Star, Activity, Filter } from 'lucide-react';
import { useState } from 'react';
import { Match, Player, TeamStats } from '../types';
import { HISTORIC_STATS } from '../data';

interface StatsProps {
  matches: Match[];
  players: Player[];
}

export default function Stats({ matches, players }: StatsProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>('All Time (Aggregated)');

  // 1. Dynamic Calculations from Played Matches (mainly 2026 Season)
  const playedMatches = matches.filter(m => m.status === 'played');

  // Compute Aggregated "All Time" values by summing all HISTORIC_STATS
  const allTimeStats = HISTORIC_STATS.reduce((acc, curr) => {
    return {
      season: 'All Time (Aggregated)',
      played: acc.played + curr.played,
      wins: acc.wins + curr.wins,
      losses: acc.losses + curr.losses,
      draws: acc.draws + curr.draws,
      goalsFor: acc.goalsFor + curr.goalsFor,
      goalsAgainst: acc.goalsAgainst + curr.goalsAgainst,
      cleanSheets: acc.cleanSheets + curr.cleanSheets,
    };
  }, {
    season: 'All Time (Aggregated)',
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
  });

  // Active (2026) Season stats fallback
  const active2026Stats = HISTORIC_STATS.find(s => s.season.includes('2026')) || {
    season: '2026 (Active Season)',
    played: playedMatches.length,
    wins: playedMatches.filter(m => m.score && m.score.toastyFc > m.score.opponent).length,
    losses: playedMatches.filter(m => m.score && m.score.toastyFc < m.score.opponent).length,
    draws: playedMatches.filter(m => m.score && m.score.toastyFc === m.score.opponent).length,
    goalsFor: playedMatches.reduce((sum, m) => sum + (m.score?.toastyFc || 0), 0),
    goalsAgainst: playedMatches.reduce((sum, m) => sum + (m.score?.opponent || 0), 0),
    cleanSheets: playedMatches.filter(m => m.cleanSheet).length
  };

  // Determine which team snapshot stats to display based on dropdown
  const displayStats = selectedSeason === 'All Time (Aggregated)' 
    ? allTimeStats 
    : (HISTORIC_STATS.find(s => s.season === selectedSeason) || active2026Stats);

  // Dynamic Goalscorers Leaderboard Calculation from current matches (2026)
  const getDynamicGoalsLeaderboard = () => {
    const goalsMap: Record<string, number> = {};
    playedMatches.forEach(m => {
      m.scorers?.forEach(scorer => {
        goalsMap[scorer] = (goalsMap[scorer] || 0) + 1;
      });
    });
    return Object.entries(goalsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Dynamic Assist Kings Leaderboard Calculation from current matches (2026)
  const getDynamicAssistsLeaderboard = () => {
    const assistsMap: Record<string, number> = {};
    playedMatches.forEach(m => {
      m.assists?.forEach(assist => {
        assistsMap[assist] = (assistsMap[assist] || 0) + 1;
      });
    });
    return Object.entries(assistsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Dynamic Ratings Leaderboard (Impact Rating)
  const getDynamicImpactLeaderboard = () => {
    return [...players]
      .map(p => ({ name: `${p.firstName} ${p.lastName}`, count: p.totalRating }))
      .sort((a, b) => b.count - a.count)
      .filter(p => p.count !== 0);
  };

  // Dynamic Saves Leaderboard
  const getDynamicSavesLeaderboard = () => {
    const dynamicSaves = [...players]
      .filter(p => p.savesCount !== undefined && p.savesCount > 0)
      .map(p => ({ name: `${p.firstName} ${p.lastName}`, count: p.savesCount || 0 }))
      .sort((a, b) => b.count - a.count);
    return dynamicSaves.length > 0 ? dynamicSaves : [
      { name: 'Eric Bowers', count: 42 },
      { name: 'Austin Greer', count: 3 }
    ];
  };

  // Dynamic Fouls Leaderboard
  const getDynamicFoulsLeaderboard = () => {
    const dynamicFouls = [...players]
      .filter(p => p.fouls !== undefined && p.fouls > 0)
      .map(p => ({ name: `${p.firstName} ${p.lastName}`, count: p.fouls || 0 }))
      .sort((a, b) => b.count - a.count);
    return dynamicFouls.length > 0 ? dynamicFouls : [
      { name: 'David Parra', count: 14 },
      { name: 'Dan Williams', count: 9 },
      { name: 'Zac Lechler', count: 8 },
      { name: 'Niko Jokic', count: 6 }
    ];
  };

  // Custom high-fidelity static historic leaders lookup table to support filtering by previous seasons
  const getHistoricLeaderboards = (seasonName: string) => {
    if (seasonName === '2023 (Championship)') {
      return {
        goals: [
          { name: 'Goran Omerdic', count: 14 },
          { name: 'Dan Williams', count: 12 },
          { name: 'AJ Ray', count: 8 },
          { name: 'Austin Greer', count: 6 },
          { name: 'Niko Jokic', count: 4 }
        ],
        assists: [
          { name: 'Goran Omerdic', count: 11 },
          { name: 'David Parra', count: 7 },
          { name: 'AJ Ray', count: 6 },
          { name: 'Austin Greer', count: 5 },
          { name: 'Zac Lechler', count: 3 }
        ],
        impact: [
          { name: 'Goran Omerdic', count: 28 },
          { name: 'David Parra', count: 22 },
          { name: 'Zac Lechler', count: 18 },
          { name: 'Austin Greer', count: 15 }
        ],
        saves: [
          { name: 'Eric Bowers', count: 48 },
          { name: 'Austin Greer', count: 2 }
        ],
        fouls: [
          { name: 'David Parra', count: 10 },
          { name: 'Zac Lechler', count: 8 },
          { name: 'Dan Williams', count: 6 }
        ]
      };
    }

    if (seasonName === '2022 (Inaugural)') {
      return {
        goals: [
          { name: 'Dan Williams', count: 9 },
          { name: 'Goran Omerdic', count: 7 },
          { name: 'AJ Ray', count: 5 },
          { name: 'Austin Greer', count: 3 },
          { name: 'Niko Jokic', count: 2 }
        ],
        assists: [
          { name: 'Austin Greer', count: 6 },
          { name: 'Goran Omerdic', count: 5 },
          { name: 'David Parra', count: 4 },
          { name: 'Zac Lechler', count: 2 }
        ],
        impact: [
          { name: 'Dan Williams', count: 18 },
          { name: 'Goran Omerdic', count: 14 },
          { name: 'Austin Greer', count: 11 }
        ],
        saves: [
          { name: 'Eric Bowers', count: 35 }
        ],
        fouls: [
          { name: 'David Parra', count: 12 },
          { name: 'Zac Lechler', count: 9 },
          { name: 'Niko Jokic', count: 5 }
        ]
      };
    }

    if (seasonName === '2024 (Winter/Spring)') {
      return {
        goals: [
          { name: 'Goran Omerdic', count: 11 },
          { name: 'Dan Williams', count: 10 },
          { name: 'AJ Ray', count: 7 },
          { name: 'Austin Greer', count: 5 }
        ],
        assists: [
          { name: 'Goran Omerdic', count: 9 },
          { name: 'AJ Ray', count: 6 },
          { name: 'David Parra', count: 5 }
        ],
        impact: [
          { name: 'Goran Omerdic', count: 22 },
          { name: 'Dan Williams', count: 19 },
          { name: 'AJ Ray', count: 14 }
        ],
        saves: [
          { name: 'Eric Bowers', count: 40 }
        ],
        fouls: [
          { name: 'David Parra', count: 11 },
          { name: 'Zac Lechler', count: 7 }
        ]
      };
    }

    if (seasonName === '2025 (Autumn Cup)') {
      return {
        goals: [
          { name: 'Dan Williams', count: 12 },
          { name: 'Goran Omerdic', count: 8 },
          { name: 'AJ Ray', count: 6 },
          { name: 'Austin Greer', count: 3 }
        ],
        assists: [
          { name: 'Goran Omerdic', count: 7 },
          { name: 'AJ Ray', count: 5 },
          { name: 'David Parra', count: 4 }
        ],
        impact: [
          { name: 'Dan Williams', count: 24 },
          { name: 'Goran Omerdic', count: 16 }
        ],
        saves: [
          { name: 'Eric Bowers', count: 38 }
        ],
        fouls: [
          { name: 'David Parra', count: 9 },
          { name: 'Zac Lechler', count: 8 }
        ]
      };
    }

    // Default or All Time or 2026: Calculate dynamically!
    return {
      goals: getDynamicGoalsLeaderboard(),
      assists: getDynamicAssistsLeaderboard(),
      impact: getDynamicImpactLeaderboard(),
      saves: getDynamicSavesLeaderboard(),
      fouls: getDynamicFoulsLeaderboard()
    };
  };

  const activeLeaderboard = getHistoricLeaderboards(selectedSeason);

  return (
    <div className="space-y-12 pb-16" id="stats-view">
      
      {/* Page Header and Season Filter */}
      <div className="bg-club-card border border-club-border rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs animate-fade-in" id="stats-header-filters">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-club-text flex items-center space-x-2">
            <Trophy className="h-5.5 w-5.5 text-jersey-red" />
            <span>Club Statistics</span>
          </h3>
          <p className="text-club-text-muted text-xs sm:text-sm">Explore historical milestones, compare bento records, and view detailed player leaderboards.</p>
        </div>

        {/* Season Filter Dropdown */}
        <div className="flex items-center bg-club-secondary border border-club-border rounded-xl px-3 w-full sm:w-auto" id="stats-season-selector">
          <Filter className="h-4 w-4 text-jersey-red mr-2" />
          <span className="text-xs font-mono text-club-text-dim mr-2 whitespace-nowrap">Filter Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full sm:w-auto bg-transparent text-xs font-bold font-mono text-club-text focus:outline-hidden cursor-pointer py-2.5"
          >
            <option value="All Time (Aggregated)" className="bg-zinc-900 text-club-text">All Time (Aggregated)</option>
            {HISTORIC_STATS.map((s, idx) => (
              <option key={idx} value={s.season} className="bg-zinc-900 text-club-text">{s.season}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Bento Grid Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" id="team-snapshot-bento">
        {/* Match Record Card */}
        <div className="bg-club-card border border-club-border p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <span className="text-[10px] font-mono text-club-text-dim block uppercase tracking-wider font-bold">RECORD (W-L-D)</span>
          <span className="text-2xl font-black text-club-text font-mono mt-1 block">
            {displayStats.wins}-{displayStats.losses}-{displayStats.draws}
          </span>
          <p className="text-club-text-dim text-[10px] mt-1 font-semibold">Total played: {displayStats.played}</p>
        </div>

        {/* Goal Ratio Card */}
        <div className="bg-club-card border border-club-border p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <span className="text-[10px] font-mono text-club-text-dim block uppercase tracking-wider font-bold">GOAL RATIO</span>
          <span className="text-2xl font-black text-club-text font-mono mt-1 block">
            {displayStats.goalsFor} : {displayStats.goalsAgainst}
          </span>
          <p className="text-club-text-dim text-[10px] mt-1 font-semibold">Diff: +{displayStats.goalsFor - displayStats.goalsAgainst}</p>
        </div>

        {/* Clean Sheets Card */}
        <div className="bg-club-card border border-club-border p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <span className="text-[10px] font-mono text-club-text-dim block uppercase tracking-wider font-bold">CLEAN SHEETS</span>
          <span className="text-2xl font-black text-emerald-500 font-mono mt-1 block">
            {displayStats.cleanSheets}
          </span>
          <p className="text-club-text-dim text-[10px] mt-1 font-semibold">
            {displayStats.played > 0 ? Math.round((displayStats.cleanSheets / displayStats.played) * 100) : 0}% ratio
          </p>
        </div>

        {/* Win Ratio Card */}
        <div className="bg-club-card border border-club-border p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <span className="text-[10px] font-mono text-club-text-dim block uppercase tracking-wider font-bold">WIN INDEX</span>
          <span className="text-2xl font-black text-jersey-red font-mono mt-1 block">
            {displayStats.played > 0 ? Math.round((displayStats.wins / displayStats.played) * 100) : 0}%
          </span>
          <p className="text-club-text-dim text-[10px] mt-1 font-semibold">Points Eq: {displayStats.wins * 3 + displayStats.draws}</p>
        </div>
      </div>

      {/* SVG Multi-Season Historic Chart */}
      <section className="bg-club-card border border-club-border rounded-2xl p-6 space-y-4 shadow-xs animate-fade-in" id="team-historic-chart">
        <div>
          <h4 className="text-base font-bold text-club-text flex items-center space-x-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-jersey-red" />
            <span>Club Evolution (2022 - 2026)</span>
          </h4>
          <p className="text-club-text-dim text-xs mt-0.5">Chronological comparison of Goals Scored (Jersey Red) vs Goals Conceded (Slate) across seasons.</p>
        </div>

        <div className="h-56 w-full relative pt-4">
          {/* Custom SVG Line Area chart */}
          <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid background lines */}
            <line x1="50" y1="20" x2="570" y2="20" stroke="rgba(170,0,0,0.06)" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="50" y1="70" x2="570" y2="70" stroke="rgba(170,0,0,0.06)" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="50" y1="120" x2="570" y2="120" stroke="rgba(170,0,0,0.06)" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="50" y1="160" x2="570" y2="160" stroke="rgba(170,0,0,0.15)" strokeWidth="1" />

            {/* Area For Goals For */}
            <path
              d={(() => {
                const points = HISTORIC_STATS.map((s, idx) => {
                  const x = 50 + idx * 130;
                  // Map values (0 to 50 max) to y: 160 (0 goals) to 20 (50 goals)
                  const y = 160 - (s.goalsFor * 2.8);
                  return `${x},${y}`;
                });
                return `M 50,160 L ${points.join(' L ')} L 570,160 Z`;
              })()}
              fill="url(#goals-for-fill)"
              opacity="0.12"
            />

            {/* Line For Goals For */}
            <path
              d={(() => {
                const points = HISTORIC_STATS.map((s, idx) => {
                  const x = 50 + idx * 130;
                  const y = 160 - (s.goalsFor * 2.8);
                  return `${x},${y}`;
                });
                return `M ${points.join(' L ')}`;
              })()}
              fill="none"
              stroke="#aa0000"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Line For Goals Against */}
            <path
              d={(() => {
                const points = HISTORIC_STATS.map((s, idx) => {
                  const x = 50 + idx * 130;
                  const y = 160 - (s.goalsAgainst * 2.8);
                  return `${x},${y}`;
                });
                return `M ${points.join(' L ')}`;
              })()}
              fill="none"
              stroke="#cabba2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4,4"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="goals-for-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#aa0000" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#aa0000" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Data Dots */}
            {HISTORIC_STATS.map((s, idx) => {
              const x = 50 + idx * 130;
              const yFor = 160 - (s.goalsFor * 2.8);
              const yAgainst = 160 - (s.goalsAgainst * 2.8);
              return (
                <g key={idx}>
                  <circle cx={x} cy={yFor} r="5" fill="#aa0000" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx={x} cy={yAgainst} r="4.5" fill="#cabba2" stroke="currentColor" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between text-[10px] font-mono text-club-text-dim mt-2 px-10">
            {HISTORIC_STATS.map((s, idx) => (
              <span key={idx} className="text-center w-24 truncate font-semibold">{s.season.split(' ')[0]}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Individual Leaderboards Grid */}
      <section className="space-y-6 animate-fade-in" id="player-leaderboards-section">
        <h4 className="text-lg font-bold text-club-text flex items-center space-x-2">
          <Star className="h-5 w-5 text-jersey-red animate-pulse" />
          <span>Individual Standings ({selectedSeason === 'All Time (Aggregated)' ? 'All Time' : selectedSeason.split(' ')[0]})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="leaderboards-grid">
          {/* Goals Leaderboard */}
          <div className="bg-club-card border border-club-border rounded-2xl p-5 space-y-4 shadow-xs">
            <span className="text-[10px] font-mono text-jersey-red font-bold uppercase tracking-widest flex items-center space-x-1">
              <Goal className="h-4 w-4" />
              <span>TOP SCORERS</span>
            </span>
            <div className="space-y-2.5">
              {activeLeaderboard.goals.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-club-secondary rounded-xl border border-club-border hover:border-club-border-strong transition duration-150 animate-scale-up">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-xs text-club-text-dim">#{idx + 1}</span>
                    <span className="text-sm font-bold text-club-text">{player.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-jersey-red/10 text-jersey-red border border-jersey-red/20 px-2 py-0.5 rounded-lg">
                    {player.count} Goals
                  </span>
                </div>
              ))}
              {activeLeaderboard.goals.length === 0 && (
                <p className="text-center text-xs text-club-text-dim py-6 font-mono">No goals logged in database.</p>
              )}
            </div>
          </div>

          {/* Assists Leaderboard */}
          <div className="bg-club-card border border-club-border rounded-2xl p-5 space-y-4 shadow-xs">
            <span className="text-[10px] font-mono text-jersey-red font-bold uppercase tracking-widest flex items-center space-x-1 font-bold">
              <Users className="h-4 w-4" />
              <span>ASSIST KINGS</span>
            </span>
            <div className="space-y-2.5">
              {activeLeaderboard.assists.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-club-secondary rounded-xl border border-club-border hover:border-club-border-strong transition duration-150 animate-scale-up">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-xs text-club-text-dim">#{idx + 1}</span>
                    <span className="text-sm font-bold text-club-text">{player.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-jersey-gold/15 text-jersey-gold border border-jersey-gold/25 px-2 py-0.5 rounded-lg">
                    {player.count} Assists
                  </span>
                </div>
              ))}
              {activeLeaderboard.assists.length === 0 && (
                <p className="text-center text-xs text-club-text-dim py-6 font-mono">No assists logged in database.</p>
              )}
            </div>
          </div>

          {/* Impact Ratings Leaderboard */}
          <div className="bg-club-card border border-club-border rounded-2xl p-5 space-y-4 col-span-1 md:col-span-2 lg:col-span-1 shadow-xs">
            <span className="text-[10px] font-mono text-jersey-red font-bold uppercase tracking-widest flex items-center space-x-1.5 font-bold">
              <Activity className="h-4 w-4" />
              <span>DATABASE IMPACT</span>
            </span>
            <div className="space-y-2.5">
              {activeLeaderboard.impact.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-club-secondary rounded-xl border border-club-border hover:border-club-border-strong transition duration-150 animate-scale-up">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-xs text-club-text-dim">#{idx + 1}</span>
                    <span className="text-sm font-bold text-club-text">{player.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    +{player.count} Rating
                  </span>
                </div>
              ))}
              {activeLeaderboard.impact.length === 0 && (
                <p className="text-center text-xs text-club-text-dim py-6 font-mono">No ratings merged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Secondary: Saves and Discipline cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="discipline-stats-row">
          <div className="bg-club-card border border-club-border rounded-2xl p-5 space-y-4 shadow-xs animate-fade-in">
            <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-widest block font-bold">SAVES LEADERS</span>
            <div className="space-y-2">
              {activeLeaderboard.saves.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-club-secondary border border-club-border rounded-xl">
                  <span className="text-xs font-bold text-club-text">{item.name}</span>
                  <span className="text-xs font-mono text-emerald-500 font-bold">{item.count} Saves</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-club-card border border-club-border rounded-2xl p-5 space-y-4 shadow-xs animate-fade-in">
            <span className="text-[10px] font-mono text-club-text-dim uppercase tracking-widest block font-bold">COMMITMENT & FOULS</span>
            <div className="space-y-2">
              {activeLeaderboard.fouls.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-club-secondary border border-club-border rounded-xl">
                  <span className="text-xs font-bold text-club-text">{item.name}</span>
                  <span className="text-xs font-mono text-jersey-red font-bold">{item.count} Fouls</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
