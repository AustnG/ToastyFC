import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData, calculateAge, formatHeight } from '../contexts/DataContext';
import Spinner from '../components/Spinner';
import { Player } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PLAYER_PLACEHOLDER_IMAGE_URL } from '../constants';

const PlayerStats: React.FC<{ playerId: string, player: Player }> = ({ playerId, player }) => {
    const { seasons, games, gameStats } = useData();
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('all-time');
    
    const isGk = player['Position(s)']?.includes('Goalkeeper');

    const { baseStats, gkStats } = useMemo(() => {
        const relevantGames = selectedSeasonId === 'all-time'
            ? games
            : games.filter(g => g.SeasonId === selectedSeasonId);
        
        const relevantGameIds = new Set(relevantGames.map(g => g.Id));
        
        const playerStatsInGames = gameStats.filter(gs => gs.PlayerId === playerId && relevantGameIds.has(gs.GameId));
        
        const calculatedBaseStats = playerStatsInGames.reduce((acc, stat) => {
            acc.gamesPlayed += 1;
            acc.goals += parseInt(stat.Goals || '0');
            acc.assists += parseInt(stat.Assists || '0');
            acc.shots += parseInt(stat.Shots || '0');
            acc.saves += parseInt(stat.Saves || '0');
            acc.fouls += parseInt(stat.Fouls || '0');
            acc.plusMinus += parseInt(stat.PlusMinus || '0');
            if (stat.MotM?.toUpperCase() === 'TRUE' || stat.MotM === '1') {
                acc.motm += 1;
            }
            return acc;
        }, { gamesPlayed: 0, goals: 0, assists: 0, shots: 0, saves: 0, fouls: 0, plusMinus: 0, motm: 0 });

        if (!isGk) {
            return { baseStats: calculatedBaseStats };
        }

        const playedGameIds = new Set(playerStatsInGames.map(s => s.GameId));
        const gamesParticipated = relevantGames.filter(g => playedGameIds.has(g.Id) && g.WDL);

        const goalsAllowed = gamesParticipated.reduce((sum, g) => sum + parseInt(g.GoalsAgainst || '0'), 0);
        const cleanSheets = gamesParticipated.filter(g => parseInt(g.GoalsAgainst || '0') === 0).length;
        
        const totalShotsFaced = calculatedBaseStats.saves + goalsAllowed;
        const savePercentage = totalShotsFaced > 0 
            ? ((calculatedBaseStats.saves / totalShotsFaced) * 100).toFixed(1) + '%' 
            : 'N/A';
        
        const calculatedGkStats = {
            goalsAllowed,
            cleanSheets,
            savePercentage
        };

        return { baseStats: calculatedBaseStats, gkStats: calculatedGkStats };

    }, [playerId, selectedSeasonId, games, gameStats, isGk]);

    const statItems: Array<{label: string, value: string | number}> = [
        // Core Stats
        {label: "Games", value: baseStats.gamesPlayed},
        {label: "Goals", value: baseStats.goals},
        {label: "Assists", value: baseStats.assists},
        {label: "Shots", value: baseStats.shots},
        {label: "Saves", value: baseStats.saves},
    ];

    if (isGk && gkStats) {
        statItems.push(
            {label: "Goals Allowed", value: gkStats.goalsAllowed},
            {label: "Save %", value: gkStats.savePercentage},
            {label: "Clean Sheets", value: gkStats.cleanSheets}
        );
    }

    statItems.push(
        {label: "Fouls", value: baseStats.fouls},
        {label: "+/-", value: baseStats.plusMinus},
        {label: "MOTM", value: baseStats.motm}
    );


    return (
        <div className="bg-surface border border-border p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-accent">Player Stats</h3>
                 <select 
                    onChange={(e) => setSelectedSeasonId(e.target.value)} 
                    value={selectedSeasonId}
                    className="bg-background border border-border text-accent text-sm rounded-lg focus:ring-secondary focus:border-secondary block w-48 p-2.5"
                >
                    <option value="all-time">All Time</option>
                    {seasons.map(season => (
                        <option key={season.Id} value={season.Id}>{season.Name}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                {statItems.map(item => (
                    item.value.toString() !== '0' || item.value === 'N/A' || item.label === "Games" || item.label === "+/-" ?
                    <div key={item.label} className="bg-background p-3 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-secondary/10">
                        <p className="text-3xl font-bold text-accent">{item.value}</p>
                        <p className="text-sm text-gray-500 uppercase">{item.label}</p>
                    </div>
                    : null
                ))}
            </div>
        </div>
    );
};

const PlayerRadarChart: React.FC<{ player: Player }> = ({ player }) => {
    const isGk = player['Position(s)']?.includes('Goalkeeper');
    const chartData = isGk
    ? [
        { subject: 'Positioning', value: parseInt(player.Positioning) },
        { subject: 'Diving', value: parseInt(player.Diving) },
        { subject: 'Reflexes', value: parseInt(player.Reflexes) },
        { subject: 'Handling', value: parseInt(player.Handling) },
        { subject: 'Kicking', value: parseInt(player.Kicking) },
        { subject: 'Distribution', value: parseInt(player.Distribution) },
    ]
    : [
        { subject: 'Pace', value: parseInt(player.Pace) },
        { subject: 'Shooting', value: parseInt(player.Shooting) },
        { subject: 'Passing', value: parseInt(player.Passing) },
        { subject: 'Dribbling', value: parseInt(player.Dribbling) },
        { subject: 'Defending', value: parseInt(player.Defending) },
        { subject: 'Physical', value: parseInt(player.Physical) },
    ];

    return (
        <div className="bg-surface border border-border p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-bold text-accent mb-4">Player Attributes</h3>
            <ResponsiveContainer width="100%" height="90%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 14 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name={`${player.FirstName} ${player.LastName}`} dataKey="value" stroke="#aa0000" fill="#aa0000" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', color: '#111827', borderRadius: '0.5rem' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const PlayerDetailPage: React.FC = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const { players, loading, error } = useData();

    const player = useMemo(() => players.find(p => p.Id === playerId), [players, playerId]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-center text-secondary">Failed to load player data.</p>;
    if (!player) return <p className="text-center text-primary">Player not found.</p>;

    const age = calculateAge(player.DoB);
    const formattedHeight = formatHeight(player.Height);

    return (
        <div className="space-y-8">
            <div className="bg-surface border border-border p-8 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <img src={player.PlayerImageUrl || PLAYER_PLACEHOLDER_IMAGE_URL} alt={`${player.FirstName} ${player.LastName}`} className="rounded-lg w-full shadow-md" />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <h1 className="text-5xl font-bold text-accent">{`${player.FirstName} ${player.LastName}`}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-primary text-lg">
                        <span className="font-semibold">{player['Position(s)']}</span>
                        <span>•</span>
                        <span>{formattedHeight}</span>
                        {age !== null && (
                            <>
                                <span>•</span>
                                <span>{age} years old</span>
                            </>
                        )}
                    </div>
                    <div className="pt-4 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6 pt-4 border-t border-border">
                            <div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Nationality</h3>
                                {player.Nationality ? (
                                    <img 
                                        src={player.Nationality} 
                                        alt={`${player.FirstName} ${player.LastName}'s national flag`} 
                                        className="w-10 h-auto mt-2 rounded-sm shadow-md"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <p className="text-lg text-accent mt-1">N/A</p>
                                )}
                            </div>
                             <div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Birthplace</h3>
                                <p className="text-lg text-accent mt-1">{player.Birthplace || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Date of Birth</h3>
                                <p className="text-lg text-accent mt-1">
                                    {player.DoB ? new Date(player.DoB).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'N/A'}
                                    {age !== null && <span className="text-base text-gray-400 ml-2">[{age}]</span>}
                                </p>
                            </div>
                        </div>
                         <div>
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Bio</h3>
                            <p className="text-gray-700 whitespace-pre-line">{player.Bio}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PlayerRadarChart player={player} />
                <PlayerStats playerId={player.Id} player={player} />
            </div>
        </div>
    );
};

export default PlayerDetailPage;