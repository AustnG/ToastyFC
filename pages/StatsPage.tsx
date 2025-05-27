
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TEAM_NAME,
  PRIMARY_COLOR,
  ACCENT_COLOR,
  THEME_BLACK,
  THEME_WHITE,
  calculateTeamRecord,
  GOOGLE_SHEET_PLAYERS_TAB,
  GOOGLE_SHEET_MATCHES_TAB,
  GOOGLE_SHEET_GAME_STATS_TAB, 
  STATIC_GOALS_SCORED,
  STATIC_GOALS_AGAINST,
  STATIC_AVG_GPG,
  STATIC_CLEAN_SHEETS,
  MaterialBarChartIcon, MaterialTrendingUpIcon, MaterialStatsIcon, MaterialUsersIcon,
  // Fix: Import missing icon components
  MaterialEmojiEventsIcon,
  MaterialClubIcon,
  MaterialSparklesIcon,
  MaterialStarIcon,
  MaterialTeamIcon
} from '../constants';
import { PlayerWithStats, Match } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';

interface TeamStatCardProps {
  label: string;
  value: string | number;
  bgColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
}

const TeamStatCard: React.FC<TeamStatCardProps> = ({ label, value, bgColor = 'bg-white', textColor = `text-[${PRIMARY_COLOR}]`, icon }) => (
  <div className={`${bgColor} p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center`}>
    {icon && <div className={`mb-2 ${textColor}`}>{icon}</div>}
    <p className={`text-4xl font-bold mb-1 ${textColor}`}>{value}</p>
    <p className="text-gray-600 text-sm font-medium">{label}</p>
  </div>
);

interface PlayerLeaderboardProps {
  title: string;
  players: PlayerWithStats[];
  statKey: keyof PlayerWithStats;
  statUnit?: string;
  isGKStat?: boolean;
  icon?: React.ReactNode;
}

const PlayerLeaderboard: React.FC<PlayerLeaderboardProps> = ({ title, players, statKey, statUnit = '', isGKStat = false, icon }) => {
  const topPlayers = useMemo(() => {
    let filteredPlayers = players;
    if (isGKStat) {
        filteredPlayers = players.filter(p => p.position === "Goalkeeper" && typeof p[statKey] === 'number');
    } else {
        filteredPlayers = players.filter(p => p.position !== "Goalkeeper" || (p[statKey] as number) !== 0);
    }

    return filteredPlayers
      .filter(p => typeof p[statKey] === 'number' && (p[statKey] as number) !== 0 && !isNaN(p[statKey] as number))
      .sort((a, b) => (b[statKey] as number) - (a[statKey] as number))
      .slice(0, 5);
  }, [players, statKey, isGKStat]);

  if (topPlayers.length === 0) {
    return (
      <div>
        <h3 className={`text-xl font-semibold text-[${ACCENT_COLOR}] mb-3 flex items-center`}>
            {icon && <span className="mr-2">{icon}</span>}
            {title}
        </h3>
        <p className="text-gray-500">No players currently leading in this category.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className={`text-xl font-semibold text-[${ACCENT_COLOR}] mb-4 flex items-center`}>
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <ul className="space-y-3">
        {topPlayers.map((player, index) => (
          <li
            key={player.id}
            className={`flex items-center p-3 rounded-lg shadow hover:shadow-md transition-shadow ${
              index === 0 ? `bg-[${PRIMARY_COLOR}]/10 border border-[${PRIMARY_COLOR}]/30` : 'bg-white'
            }`}
          >
            <span className={`text-lg font-bold ${index === 0 ? `text-[${ACCENT_COLOR}]` : 'text-gray-500'} mr-3 w-6 text-center`}>{index + 1}.</span>
            <img src={player.imageUrl || `https://ui-avatars.com/api/?name=${player.name.replace(' ','+')}&background=random&color=333`} alt={player.name} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-200" />
            <div className="flex-grow">
              <p className={`font-semibold ${index === 0 ? `text-black font-bold` : 'text-gray-800'}`}>{player.name}</p>
              <p className="text-xs text-gray-500">Appearances: {player.appearances}</p>
            </div>
            <p className={`text-lg font-bold ${index === 0 ? `text-[${ACCENT_COLOR}] font-extrabold` : `text-[${PRIMARY_COLOR}]`}`}>
              {player[statKey] as React.ReactNode}
              {statUnit}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};


const StatsPage: React.FC = () => {
  const [playersWithStats, setPlayersWithStats] = useState<PlayerWithStats[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [fetchedPlayersWithStats, fetchedMatches] = await Promise.all([
          googleSheetsService.fetchPlayersWithOverallStats(GOOGLE_SHEET_PLAYERS_TAB, GOOGLE_SHEET_GAME_STATS_TAB),
          googleSheetsService.fetchMatches(GOOGLE_SHEET_MATCHES_TAB)
        ]);
        setPlayersWithStats(fetchedPlayersWithStats);
        setMatches(fetchedMatches);
      } catch (err) {
        console.error("Error fetching stats page data:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadStatsData();
  }, []);

  const teamRecord = useMemo(() => {
      if (isLoading || error) return { wins: 0, draws: 0, losses: 0, played: 0 };
      return calculateTeamRecord(matches.filter(m => !m.isUpcoming), TEAM_NAME);
  }, [matches, isLoading, error]);

  const winPercentage = teamRecord.played > 0 ? ((teamRecord.wins / teamRecord.played) * 100).toFixed(1) + '%' : 'N/A';

  const teamStats = [
    { label: 'Wins', value: teamRecord.wins, icon: <MaterialEmojiEventsIcon style={{fontSize: '28px'}} /> },
    { label: 'Draws', value: teamRecord.draws, icon: <MaterialBarChartIcon style={{fontSize: '28px', transform: 'rotate(90deg)'}}/> }, // Placeholder, consider specific draw icon
    { label: 'Losses', value: teamRecord.losses, icon: <MaterialTrendingUpIcon style={{fontSize: '28px', transform: 'scaleY(-1)'}} /> }, // Flipped trending up
    { label: 'Win %', value: winPercentage, icon: <MaterialTrendingUpIcon style={{fontSize: '28px'}} /> },
    { label: 'Goals Scored', value: STATIC_GOALS_SCORED, icon: <MaterialClubIcon style={{fontSize: '28px'}} /> },
    { label: 'Goals Conceded', value: STATIC_GOALS_AGAINST, icon: <MaterialClubIcon style={{fontSize: '28px'}} /> }, // Could use a "shield with minus" or similar
    { label: 'Avg. Goals per Game', value: STATIC_AVG_GPG.toFixed(2), icon: <MaterialBarChartIcon style={{fontSize: '28px'}} /> },
    { label: 'Clean Sheets', value: STATIC_CLEAN_SHEETS, icon: <MaterialSparklesIcon style={{fontSize: '28px'}}/> }, // Placeholder, consider a shield icon
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading stats..." size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-12 py-8">
      <header className="text-center">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] mb-2 flex items-center justify-center`}>
            <MaterialStatsIcon className="mr-3" style={{fontSize: '36px'}} /> {TEAM_NAME} Statistics
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Dive into the numbers! Explore team performance and player leaderboards.
        </p>
      </header>

      <section aria-labelledby="team-stats-heading">
        <h2 id="team-stats-heading" className={`text-3xl font-bold text-center mb-8 text-gray-800 border-b-2 border-[${PRIMARY_COLOR}] pb-3 flex items-center justify-center`}>
            <MaterialTrendingUpIcon className="mr-3" />Team Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamStats.map(stat => (
            <TeamStatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} textColor={`text-[${ACCENT_COLOR}]`} />
          ))}
        </div>
      </section>

      <section aria-labelledby="player-leaderboards-heading">
        <h2 id="player-leaderboards-heading" className={`text-3xl font-bold text-center my-10 text-gray-800 border-b-2 border-[${PRIMARY_COLOR}] pb-3 flex items-center justify-center`}>
            <MaterialStatsIcon className="mr-3" /> Player Leaderboards
        </h2>
        {playersWithStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                <PlayerLeaderboard title="Man of the Match" players={playersWithStats} statKey="manOfTheMatch" statUnit=" Awards" icon={<MaterialStarIcon style={{fontSize: '24px'}}/>} />
                <PlayerLeaderboard title="Top Goalscorers" players={playersWithStats} statKey="goals" statUnit=" Goals" icon={<MaterialClubIcon style={{fontSize: '24px'}}/>} />
                <PlayerLeaderboard title="Top Assists" players={playersWithStats} statKey="assists" statUnit=" Assists" icon={<MaterialSparklesIcon style={{fontSize: '24px'}}/>} /> {/* Placeholder icon */}
                <PlayerLeaderboard title="Most Shots" players={playersWithStats} statKey="shots" statUnit=" Shots" icon={<MaterialBarChartIcon style={{fontSize: '24px'}}/>} />
                <PlayerLeaderboard title="Best Plus/Minus" players={playersWithStats} statKey="plusMinus" icon={<MaterialTrendingUpIcon style={{fontSize: '24px'}}/>} />
                <PlayerLeaderboard title="Most Fouls" players={playersWithStats} statKey="fouls" statUnit=" Fouls" />
                <PlayerLeaderboard title="Top Savers (GK)" players={playersWithStats} statKey="saves" statUnit=" Saves" isGKStat={true} icon={<MaterialTeamIcon style={{fontSize: '24px'}}/>} /> {/* Placeholder - could be a shield or glove icon */}
            </div>
        ) : (
            <p className="text-center text-gray-500">Player leaderboard data is currently unavailable. Ensure 'GameStats' sheet is populated and accessible.</p>
        )}
        <div className="mt-12 text-center">
          <Link
            to="/roster"
            className={`inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[${THEME_BLACK}] bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] md:py-4 md:text-lg md:px-10 transition-colors duration-200 shadow-md hover:shadow-lg`}
          >
            <MaterialUsersIcon className="mr-2" /> View Full Roster
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StatsPage;