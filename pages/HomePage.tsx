
import React from 'react';
import { useData } from '../contexts/DataContext';
import Spinner from '../components/Spinner';
import { HERO_IMAGE_URL, LATEST_HIGHLIGHT_URL, PLAYER_PLACEHOLDER_IMAGE_URL, LOGO_URL_ROUNDED } from '../constants';
import { Link } from 'react-router-dom';
import { Game } from '../types';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bold text-accent mb-8 pb-3 border-b-2 border-border">{children}</h2>
);

const Hero: React.FC = () => (
    <div className="relative h-[60vh] min-h-[350px] max-h-[500px] w-full">
        <img src={HERO_IMAGE_URL} alt="Toasty FC team" className="w-full h-full object-cover" />
    </div>
);


const MatchCard: React.FC<{ game: Game | undefined, type: 'last' | 'next' }> = ({ game, type }) => {
    if (!game) {
        return (
            <div className="p-6 text-center h-full flex flex-col justify-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">{type === 'last' ? 'Last Match' : 'Next Match'}</h3>
                <p className="text-gray-500">{type === 'last' ? 'No recent results.' : 'No upcoming matches scheduled.'}</p>
            </div>
        );
    }
    const isLastMatch = type === 'last';
    const gameDateTime = new Date(`${game.Date} ${game.Time}`);

    return (
        <div className="p-6 transition-all duration-300 hover:bg-background h-full flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 text-center">{isLastMatch ? 'Last Match' : 'Next Match'}</h3>
            <div className="grid grid-cols-3 items-center text-center gap-2 flex-grow">
                <div className="flex flex-col items-center justify-center gap-2">
                    <img src={LOGO_URL_ROUNDED} alt="Toasty FC" className="h-12 w-12" />
                    <h4 className="font-bold text-accent w-full truncate text-sm sm:text-base">Toasty FC</h4>
                </div>
                <div>
                    {isLastMatch && game.WDL ? (
                        <div className="flex flex-col">
                            <p className="text-3xl font-black text-accent">{game.Goals}-{game.GoalsAgainst}</p>
                            <span className={`mt-1 px-2 py-0.5 text-xs font-bold rounded-full inline-block self-center ${
                                game.WDL === 'W' ? 'bg-green-100 text-green-800' :
                                game.WDL === 'L' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {game.WDL === 'W' ? 'WIN' : game.WDL === 'L' ? 'LOSS' : 'DRAW'}
                            </span>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-400">VS</p>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <div 
                        className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-border ${!game.OpponentColor ? 'bg-background' : ''}`}
                        style={game.OpponentColor ? { backgroundColor: game.OpponentColor } : undefined}
                    >
                        <span className={`text-2xl font-bold ${game.OpponentColor ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>{game.Opponent.charAt(0)}</span>
                    </div>
                    <h4 className="font-bold text-accent w-full truncate text-sm sm:text-base">{game.Opponent}</h4>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
                {gameDateTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <div className="text-center mt-4">
                 <Link to="/fixtures" className="text-sm font-semibold text-primary hover:underline transition-colors">
                    View Fixtures <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>
        </div>
    );
};

const MatchCenter: React.FC<{ latestResult?: Game, upcomingGame?: Game }> = ({ latestResult, upcomingGame }) => (
    <div className="bg-surface border-b border-border shadow-sm">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <MatchCard game={latestResult} type="last" />
                <MatchCard game={upcomingGame} type="next" />
            </div>
        </div>
    </div>
);

const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    try {
        const urlObj = new URL(url);
        let videoId: string | null = null;
        if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.substring(1);
        else if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.startsWith('/embed/')) videoId = urlObj.pathname.split('/')[2];
            else if (urlObj.pathname === '/watch') videoId = urlObj.searchParams.get('v');
        }
        if (videoId) videoId = videoId.split('?')[0].split('&')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
        console.error("Invalid YouTube URL:", url, e);
        return null;
    }
};

const getGameDate = (game: Game) => new Date(`${game.Date} ${game.Time}`);

const HomePage: React.FC = () => {
    const { announcements, games, players, seasons, rosters, loading, error } = useData();

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (error) return <p className="text-center text-secondary py-20">Failed to load page data.</p>;

    const upcomingGames = games
        .filter(g => getGameDate(g) > new Date())
        .sort((a,b) => getGameDate(a).getTime() - getGameDate(b).getTime());
        
    const latestResults = games
        .filter(g => g.WDL && getGameDate(g) <= new Date())
        .sort((a,b) => getGameDate(b).getTime() - getGameDate(a).getTime());
    
    const latestSeason = seasons[0];
    const latestSeasonRosterIds = new Set(
        rosters
            .filter(r => r.SeasonId === latestSeason?.Id)
            .map(r => r.PlayerId)
    );

    const eligiblePlayers = players.filter(p => 
        p.PlayerImageUrl && 
        p.PlayerImageUrl.trim() !== '' &&
        latestSeasonRosterIds.has(p.Id)
    );
    
    const spotlightPlayer = eligiblePlayers.length > 0 ? eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)] : null;
    
    let latestVideoUrl = LATEST_HIGHLIGHT_URL;
    const latestHighlightGame = games
        .filter(g => g.YouTubeLink && g.YouTubeLink.trim() !== '')
        .sort((a, b) => getGameDate(b).getTime() - getGameDate(a).getTime())[0];
    
    if (latestHighlightGame) {
        const embedUrl = getYouTubeEmbedUrl(latestHighlightGame.YouTubeLink);
        if (embedUrl) latestVideoUrl = embedUrl;
    }
    
    const sortedAnnouncements = announcements.slice(0, 3);

    return (
        <div className="bg-background">
            <Hero />
            <MatchCenter latestResult={latestResults[0]} upcomingGame={upcomingGames[0]} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                <section>
                    <SectionTitle>Latest News</SectionTitle>
                    {sortedAnnouncements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sortedAnnouncements.map((item, index) => (
                                <div key={index} className="bg-surface rounded-xl shadow-lg overflow-hidden group relative flex flex-col min-h-[350px] transition-all duration-300 ease-in-out hover:shadow-primary/10 hover:-translate-y-1">
                                    <img src={item.ImageUrl} alt={item.Title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div className="relative z-10 p-6 text-white mt-auto">
                                        <h3 className="font-bold text-2xl drop-shadow-lg mb-2">{item.Title}</h3>
                                        <p className="text-gray-200 mb-4 flex-grow text-sm opacity-90 drop-shadow-sm">{item.Content}</p>
                                        <p className="text-xs text-gray-300 mt-auto opacity-80">{new Date(item.Date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500">No announcements at this time.</p>}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    <div className="lg:col-span-2">
                        <SectionTitle>Player Spotlight</SectionTitle>
                        {spotlightPlayer ? (
                            <Link to={`/roster/${spotlightPlayer.Id}`} className="group block bg-surface rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-secondary/20 hover:-translate-y-1">
                                <div className="relative h-[480px]">
                                    <img src={spotlightPlayer.PlayerImageUrl || PLAYER_PLACEHOLDER_IMAGE_URL} alt={`${spotlightPlayer.FirstName} ${spotlightPlayer.LastName}`} className="w-full h-full object-cover object-top transition-transform duration-500 ease-in-out group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <h3 className="text-3xl font-bold drop-shadow-md text-white">{`${spotlightPlayer.FirstName} ${spotlightPlayer.LastName}`}</h3>
                                        <p className="text-gray-200 text-lg drop-shadow-sm">{spotlightPlayer['Position(s)']}</p>
                                        <div className="mt-4 inline-flex items-center text-sm font-semibold bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full border border-white/20 group-hover:bg-secondary group-hover:border-secondary transition-all duration-300 text-white">
                                            View Profile
                                            <span className="material-symbols-rounded ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ) : <p className="text-gray-500">No player data available.</p>}
                    </div>

                    <div className="lg:col-span-3">
                         <SectionTitle>Latest Highlight</SectionTitle>
                         <div className="aspect-video">
                            <iframe className="w-full h-full rounded-lg shadow-lg border border-border" src={latestVideoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
