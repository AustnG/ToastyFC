import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Spinner from '../components/Spinner';
import { Game } from '../types';
import FixtureCard from '../components/FixtureCard';

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-background p-4 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-secondary/10">
        <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-4xl font-extrabold text-accent mt-1">{value}</p>
    </div>
);

const FixturesPage: React.FC = () => {
    const { seasons, games, gameStats, players, loading, error } = useData();
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

    useEffect(() => {
        if(seasons.length > 0 && !selectedSeasonId) {
            setSelectedSeasonId(seasons[0].Id);
        }
    }, [seasons, selectedSeasonId]);

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSeasonId(e.target.value);
    };

    const selectedSeason = useMemo(() => {
        return seasons.find(s => s.Id === selectedSeasonId);
    }, [selectedSeasonId, seasons]);

    const seasonStats = useMemo(() => {
        if (!selectedSeasonId) return { played: 0, wins: 0, draws: 0, losses: 0 };
        
        const seasonGames = games.filter(g => g.SeasonId === selectedSeasonId && g.WDL);
        
        return {
            played: seasonGames.length,
            wins: seasonGames.filter(g => g.WDL === 'W').length,
            draws: seasonGames.filter(g => g.WDL === 'D').length,
            losses: seasonGames.filter(g => g.WDL === 'L').length,
        };
    }, [selectedSeasonId, games]);


    const fixturesForSeason = useMemo(() => {
        return games
            .filter(g => g.SeasonId === selectedSeasonId)
            .sort((a,b) => {
                const dateA = new Date(`${a.Date} ${a.Time}`);
                const dateB = new Date(`${b.Date} ${b.Time}`);
                return dateB.getTime() - dateA.getTime();
            });
    }, [selectedSeasonId, games]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-center text-secondary">Failed to load fixtures data.</p>;

    return (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <h1 className="text-4xl font-bold text-primary pb-3 border-b-2 border-border flex-grow">Fixtures & Results</h1>
                <select 
                    onChange={handleSeasonChange} 
                    value={selectedSeasonId}
                    aria-label="Select a season"
                    className="bg-surface border border-border text-accent text-sm rounded-lg focus:ring-secondary focus:border-secondary block w-full sm:w-60 p-2.5"
                >
                    {seasons.map(season => (
                        <option key={season.Id} value={season.Id}>{season.Name}</option>
                    ))}
                </select>
            </div>

            {selectedSeason && (
                <section aria-labelledby="season-overview-heading" className="bg-surface border border-border p-6 sm:p-8 rounded-lg shadow-lg">
                    <h2 id="season-overview-heading" className="text-3xl font-bold text-accent mb-2">{selectedSeason.Name}</h2>
                    <p className="text-gray-600 mb-6 italic">{selectedSeason.Overview}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Played" value={seasonStats.played} />
                        <StatCard label="Wins" value={seasonStats.wins} />
                        <StatCard label="Draws" value={seasonStats.draws} />
                        <StatCard label="Losses" value={seasonStats.losses} />
                    </div>
                </section>
            )}

            <div className="space-y-8">
                {fixturesForSeason.length > 0 ? (
                    fixturesForSeason.map(game => (
                        <FixtureCard 
                            key={game.Id} 
                            game={game} 
                            gameStats={gameStats}
                            players={players}
                            showStatsToggle={true}
                        />
                    ))
                ) : (
                    <div className="bg-surface text-center text-gray-500 p-8 rounded-lg shadow-inner">
                        <p>No fixtures available for this season.</p>
                    </div>
                )}
            </div>

            <section aria-labelledby="calendar-subscribe-heading" className="bg-surface border border-border p-8 rounded-lg shadow-lg text-center">
                 <h2 id="calendar-subscribe-heading" className="text-2xl font-bold text-accent mb-4">Never Miss a Match</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Subscribe to the Toasty FC calendar to get all fixtures automatically added to your personal calendar.</p>
                <div className="flex justify-center items-center gap-4 flex-col sm:flex-row">
                    <a href="https://calendar.google.com/calendar/u/0?cid=ZDg2MjViNmFlODJmZTc1MGUxNTE1NGQyMGI1Mjc2N2ZjOWNmODQwZGQ1MjgyMzZjZmE4ODgwNzJhN2YwZDYyY0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full sm:w-auto bg-[#ffffff] hover:bg-gray-200 text-[#202124] font-bold py-3 px-5 rounded-lg transition-colors shadow-md border border-border">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"><g><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z" fill="#4285F4"/><path d="M12.5,12.25V7h-1v5.5l4.5,2.67l0.5-0.86L12.5,12.25z" fill="#34A853"/><polygon points="12,12 12,12 12,12" fill="#1A73E8"/><path d="M12,12l4.5,2.67l0.5-0.86L12.5,12.25V7h-1v5.5L12,12z" fill="#EA4335"/></g></svg>
                        Google Calendar
                    </a>
                    <a href="https://calendar.google.com/calendar/ical/d862MjViNmFlODJmZTc1MGUxNTE1NGQyMGI1Mjc2N2ZjOWNmODQwZGQ1MjgyMzZjZmE4ODgwNzJhN2YwZDYyY0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t/public/basic.ics" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-surface hover:bg-background text-accent font-bold py-3 px-5 rounded-lg transition-colors shadow-md border border-border">
                        <span className="material-symbols-rounded mr-2">download</span>
                        Subscribe with iCal
                    </a>
                </div>
            </section>
        </div>
    );
};

export default FixturesPage;