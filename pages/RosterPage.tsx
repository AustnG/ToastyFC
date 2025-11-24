import React, { useState, useMemo, useEffect } from 'react';
import { useData, calculateAge } from '../contexts/DataContext';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { PLAYER_PLACEHOLDER_IMAGE_URL, LOGO_URL_WHITE } from '../constants';

interface PlayerCardProps {
    playerId: string;
    name: string;
    position: string;
    headshotUrl: string;
    jerseyNumber: string;
    age: number | null;
    nationalityFlagUrl?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ playerId, name, position, headshotUrl, jerseyNumber, age, nationalityFlagUrl }) => (
    <Link to={`/roster/${playerId}`} className="group block [perspective:1000px]">
        <div className="relative h-96 w-full rounded-2xl bg-surface border border-border shadow-lg transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:scale-105 group-hover:-rotate-y-6 group-hover:rotate-x-2 overflow-hidden">
            
            {/* Player Image - In the middle */}
            <div className="absolute inset-0 [transform:translateZ(50px)] flex items-end justify-center">
                <img
                    src={headshotUrl || PLAYER_PLACEHOLDER_IMAGE_URL}
                    alt={name}
                    className="w-[90%] h-auto max-h-[110%] object-contain object-bottom drop-shadow-[0_25px_25px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            {/* Player Info Overlay - Furthest forward */}
            <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-background via-background/80 to-transparent [transform:translateZ(80px)]">
                <div className="flex justify-between items-end">
                    <div className="min-w-0">
                         <div className="flex items-center gap-3">
                            {nationalityFlagUrl && (
                                <img
                                    src={nationalityFlagUrl}
                                    alt={`${name} flag`}
                                    className="w-8 h-auto rounded-sm shadow-md flex-shrink-0 border border-border"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <h3 className="text-2xl font-bold text-accent truncate drop-shadow-lg">{name}</h3>
                        </div>
                        <div className="flex items-baseline text-base text-primary truncate mt-1 drop-shadow-lg">
                            <span>{position}</span>
                            {age !== null && <span className="text-sm ml-2 opacity-80">• {age} yrs</span>}
                        </div>
                    </div>
                    <div className="flex-shrink-0 ml-4 text-5xl font-black text-accent drop-shadow-lg opacity-80 group-hover:opacity-100 group-hover:text-primary transition-all duration-300 group-hover:scale-110">
                        {jerseyNumber}
                    </div>
                </div>
            </div>
        </div>
    </Link>
);


const RosterPage: React.FC = () => {
    const { players, seasons, rosters, loading, error } = useData();
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

    // Set default season to the latest one
    useEffect(() => {
        if(seasons.length > 0 && !selectedSeasonId) {
            setSelectedSeasonId(seasons[0].Id);
        }
    }, [seasons, selectedSeasonId]);

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSeasonId(e.target.value);
    };

    const rosterForSeason = useMemo(() => {
        if (!selectedSeasonId) return [];
        return rosters
            .filter(r => r.SeasonId === selectedSeasonId)
            .map(r => {
                const player = players.find(p => p.Id === r.PlayerId);
                return player ? { ...player, JerseyNumber: r.Number, age: calculateAge(player.DoB) } : null;
            })
            .filter((p): p is NonNullable<typeof p> & { age: number | null } => p !== null);
    }, [selectedSeasonId, rosters, players]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-center text-secondary">Failed to load roster data.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                 <h1 className="text-4xl font-bold text-primary pb-3 border-b-2 border-border flex-grow">Team Roster</h1>
                <select 
                    onChange={handleSeasonChange} 
                    value={selectedSeasonId}
                    className="bg-surface border border-border text-accent text-sm rounded-lg focus:ring-secondary focus:border-secondary block w-48 p-2.5 ml-4"
                >
                    {seasons.map(season => (
                        <option key={season.Id} value={season.Id}>{season.Name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {rosterForSeason.map(player => (
                    <PlayerCard
                        key={player.Id}
                        playerId={player.Id}
                        name={`${player.FirstName} ${player.LastName}`}
                        position={player['Position(s)']}
                        headshotUrl={player.PlayerImageUrl}
                        jerseyNumber={player.JerseyNumber}
                        age={player.age}
                        nationalityFlagUrl={player.Nationality}
                    />
                ))}
            </div>
        </div>
    );
};

export default RosterPage;