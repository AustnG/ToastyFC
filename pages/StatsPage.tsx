import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { Player } from '../types';
import { PLAYER_PLACEHOLDER_IMAGE_URL } from '../constants';

const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
    <div className="bg-surface border border-border p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
        <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
            <span className="material-symbols-rounded text-3xl text-primary/70">{icon}</span>
        </div>
        <p className="text-5xl font-bold text-accent mt-2">{value}</p>
    </div>
);

const leaderboardIcons: { [key: string]: React.ReactNode } = {
    'Man of the Match': <span className="material-symbols-rounded text-3xl text-primary">military_tech</span>,
    'Top Goalscorers': <span className="material-symbols-rounded text-3xl text-primary">sports_soccer</span>,
    'Assist Leaders': <span className="material-symbols-rounded text-3xl text-primary">handshake</span>,
    'Shot Leaders': <span className="material-symbols-rounded text-3xl text-primary">rocket_launch</span>,
    'Impact Players (+/-)': <span className="material-symbols-rounded text-3xl text-primary">trending_up</span>,
    'Foul Leaders': <span className="material-symbols-rounded text-3xl text-primary">gavel</span>,
    'Top Savers': <span className="material-symbols-rounded text-3xl text-primary">shield</span>,
};


const Leaderboard: React.FC<{ title: string; players: { player: Player, value: number, subValue?: number }[]; icon: React.ReactNode; allowNegative?: boolean }> = ({ title, players, icon, allowNegative = false }) => (
    <div className="bg-surface border border-border p-6 rounded-xl shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-4 mb-5">
            {icon}
            <h3 className="text-2xl font-bold text-accent">{title}</h3>
        </div>
        <ul className="space-y-3 flex-grow">
            {players.filter(p => allowNegative ? true : p.value > 0).slice(0, 5).map(({ player, value, subValue }, index) => {
                const isFirst = index === 0;

                return (
                    <li key={player.Id} className={`flex items-center p-3 rounded-lg transition-all duration-300 group ${isFirst ? 'bg-gradient-to-r from-primary/10 via-surface to-surface border-l-4 border-primary shadow-md' : 'bg-background border-l-4 border-transparent hover:bg-border hover:border-primary'}`}>
                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-lg mr-4 ${isFirst ? 'bg-primary text-background' : 'bg-border text-gray-600'}`}>
                            {isFirst ? <span className="material-symbols-rounded">military_tech</span> : index + 1}
                        </div>
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                             <img src={player.PlayerImageUrl || PLAYER_PLACEHOLDER_IMAGE_URL} alt={`${player.FirstName} ${player.LastName}`} className="w-11 h-11 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"/>
                             <div className="min-w-0">
                                <Link to={`/roster/${player.Id}`} className="font-semibold text-accent hover:text-primary truncate block transition-colors">{`${player.FirstName} ${player.LastName}`}</Link>
                             </div>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                            <span className="font-bold text-xl text-accent">{value}</span>
                            {subValue !== undefined && <span className="text-xs text-gray-500 font-medium">({subValue} SoT)</span>}
                        </div>
                    </li>
                );
            })}
             {players.filter(p => allowNegative ? true : p.value > 0).length === 0 &&
                <div className="flex items-center justify-center h-full text-center">
                     <p className="text-gray-500 py-8">No data available for this period.</p>
                </div>
            }
        </ul>
    </div>
);

const StatsPage: React.FC = () => {
    const { seasons, games, gameStats, players, rosters, loading, error } = useData();
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('all-time');
    
    const filteredGames = useMemo(() => {
        return selectedSeasonId === 'all-time' 
            ? games 
            : games.filter(g => g.SeasonId === selectedSeasonId);
    }, [selectedSeasonId, games]);

    const playedGames = useMemo(() => {
        return filteredGames.filter(g => g.WDL);
    }, [filteredGames]);

    const { teamStats, leaderboards } = useMemo(() => {
        const stats = {
            wins: playedGames.filter(g => g.WDL === 'W').length,
            draws: playedGames.filter(g => g.WDL === 'D').length,
            losses: playedGames.filter(g => g.WDL === 'L').length,
            goalsScored: playedGames.reduce((sum, g) => sum + parseInt(g.Goals || '0'), 0),
            goalsConceded: playedGames.reduce((sum, g) => sum + parseInt(g.GoalsAgainst || '0'), 0),
            cleanSheets: playedGames.filter(g => parseInt(g.GoalsAgainst || '0') === 0).length,
        };

        const filteredGameIds = new Set(filteredGames.map(g => g.Id));
        const filteredStats = gameStats.filter(gs => filteredGameIds.has(gs.GameId));

        const relevantPlayers = selectedSeasonId === 'all-time'
            ? players
            : players.filter(p => rosters.some(r => r.PlayerId === p.Id && r.SeasonId === selectedSeasonId));

        const playerTotals = relevantPlayers.map(player => {
            const playerStats = filteredStats.filter(s => s.PlayerId === player.Id);
            return {
                player,
                goals: playerStats.reduce((sum, s) => sum + parseInt(s.Goals || '0'), 0),
                assists: playerStats.reduce((sum, s) => sum + parseInt(s.Assists || '0'), 0),
                shots: playerStats.reduce((sum, s) => sum + parseInt(s.Shots || '0'), 0),
                sot: playerStats.reduce((sum, s) => sum + parseInt(s.SoT || '0'), 0),
                plusMinus: playerStats.reduce((sum, s) => sum + parseInt(s.PlusMinus || '0'), 0),
                hasPlusMinus: playerStats.some(s => s.PlusMinus !== "" && s.PlusMinus !== null),
                fouls: playerStats.reduce((sum, s) => sum + parseInt(s.Fouls || '0'), 0),
                saves: playerStats.reduce((sum, s) => sum + parseInt(s.Saves || '0'), 0),
                motm: playerStats.filter(s => s.MotM?.toUpperCase() === 'TRUE' || s.MotM === '1').length,
            };
        });

        const boards = {
            topScorers: playerTotals.map(p => ({ player: p.player, value: p.goals })).sort((a,b) => b.value - a.value),
            assistLeaders: playerTotals.map(p => ({ player: p.player, value: p.assists })).sort((a,b) => b.value - a.value),
            shotLeaders: playerTotals.map(p => ({ player: p.player, value: p.shots + p.sot, subValue: p.sot })).sort((a,b) => b.value - a.value),
            motm: playerTotals.map(p => ({ player: p.player, value: p.motm })).sort((a,b) => b.value - a.value),
            impact: playerTotals.filter(p => p.hasPlusMinus).map(p => ({ player: p.player, value: p.plusMinus })).sort((a,b) => b.value - a.value),
            fouls: playerTotals.map(p => ({ player: p.player, value: p.fouls })).sort((a,b) => b.value - a.value),
            saves: playerTotals.map(p => ({ player: p.player, value: p.saves })).sort((a,b) => b.value - a.value),
        };
        
        return { teamStats: stats, leaderboards: boards };
    }, [playedGames, filteredGames, gameStats, players, rosters, selectedSeasonId]);
    
    if (loading) return <Spinner />;
    if (error) return <p className="text-center text-secondary">Failed to load stats data.</p>;

    const winPercentage = playedGames.length > 0 ? ((teamStats.wins / playedGames.length) * 100).toFixed(1) + '%' : 'N/A';
    const avgGoalsPerGame = playedGames.length > 0 ? (teamStats.goalsScored / playedGames.length).toFixed(2) : 'N/A';

    return (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-4xl font-bold text-primary pb-3 border-b-2 border-border flex-grow">Club Statistics</h1>
                <select onChange={(e) => setSelectedSeasonId(e.target.value)} value={selectedSeasonId} className="bg-surface border border-border text-accent text-sm rounded-lg focus:ring-secondary focus:border-secondary block w-full sm:w-48 p-2.5 ml-4">
                    <option value="all-time">All Time</option>
                    {seasons.map(season => (<option key={season.Id} value={season.Id}>{season.Name}</option>))}
                </select>
            </div>
            
            <section>
                <h2 className="text-3xl font-bold text-accent mb-2">Team Performance</h2>
                <p className="text-gray-600 mb-6 max-w-2xl">A summary of the team's performance for the selected period.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <StatCard label="Wins" value={teamStats.wins} icon="emoji_events" />
                    <StatCard label="Draws" value={teamStats.draws} icon="horizontal_rule" />
                    <StatCard label="Losses" value={teamStats.losses} icon="trending_down" />
                    <StatCard label="Win %" value={winPercentage} icon="percent" />
                    <StatCard label="Goals Scored" value={teamStats.goalsScored} icon="sports_soccer" />
                    <StatCard label="Goals Conceded" value={teamStats.goalsConceded} icon="shield" />
                    <StatCard label="Avg. Goals/Game" value={avgGoalsPerGame} icon="functions" />
                    <StatCard label="Clean Sheets" value={teamStats.cleanSheets} icon="task_alt" />
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-accent mb-2">Player Standings</h2>
                <p className="text-gray-600 mb-6 max-w-2xl">Leaderboards showing the top individual player performances.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Leaderboard title="Man of the Match" players={leaderboards.motm} icon={leaderboardIcons['Man of the Match']} />
                    <Leaderboard title="Top Goalscorers" players={leaderboards.topScorers} icon={leaderboardIcons['Top Goalscorers']} />
                    <Leaderboard title="Assist Leaders" players={leaderboards.assistLeaders} icon={leaderboardIcons['Assist Leaders']} />
                    <Leaderboard title="Shot Leaders" players={leaderboards.shotLeaders} icon={leaderboardIcons['Shot Leaders']} />
                    <Leaderboard title="Impact Players (+/-)" players={leaderboards.impact} icon={leaderboardIcons['Impact Players (+/-)']} allowNegative />
                    {leaderboards.saves.length > 0 && leaderboards.saves.some(p => p.value > 0) && <Leaderboard title="Top Savers" players={leaderboards.saves} icon={leaderboardIcons['Top Savers']} />}
                    <Leaderboard title="Foul Leaders" players={leaderboards.fouls} icon={leaderboardIcons['Foul Leaders']} />
                </div>
            </section>
        </div>
    );
};

export default StatsPage;