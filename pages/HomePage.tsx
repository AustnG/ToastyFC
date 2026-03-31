
import React from 'react';
import { useData } from '../contexts/DataContext';
import Spinner from '../components/Spinner';
import { HERO_IMAGE_URL, LATEST_HIGHLIGHT_URL, PLAYER_PLACEHOLDER_IMAGE_URL, LOGO_URL_ROUNDED } from '../constants';
import { Link } from 'react-router-dom';
import { Game } from '../types';

const SectionTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <h2 className={`text-4xl md:text-5xl font-black text-accent mb-12 uppercase tracking-tighter ${className}`}>
    {children}
  </h2>
);

const Hero: React.FC = () => (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
        <img src={HERO_IMAGE_URL} alt="Toasty FC team" className="w-full h-full object-cover transform scale-105 animate-slow-zoom" />
        <div className="absolute inset-0 bg-gradient-to-t from-accent via-accent/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24">
            <div className="container mx-auto">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
                    Toasty <span className="text-secondary">FC</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mt-4 font-medium tracking-wide max-w-2xl drop-shadow-md">
                    Est. 2022 • Bowling Green, KY
                </p>
            </div>
        </div>
    </div>
);


const MatchCard: React.FC<{ game: Game | undefined, type: 'last' | 'next' }> = ({ game, type }) => {
    if (!game) {
        return (
            <div className="p-8 text-center h-full flex flex-col justify-center bg-accent text-white">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{type === 'last' ? 'Last Match' : 'Next Match'}</h3>
                <p className="text-gray-500 italic">{type === 'last' ? 'No recent results.' : 'No upcoming matches scheduled.'}</p>
            </div>
        );
    }
    const isLastMatch = type === 'last';
    const gameDateTime = new Date(`${game.Date} ${game.Time}`);

    return (
        <div className="p-8 h-full flex flex-col justify-center bg-accent text-white transition-colors duration-300 hover:bg-black/40">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-6 text-center">{isLastMatch ? 'Last Match' : 'Next Match'}</h3>
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center w-1/3">
                    <img src={LOGO_URL_ROUNDED} alt="Toasty FC" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg" />
                    <h4 className="font-bold mt-3 text-sm md:text-base tracking-wide">TOASTY FC</h4>
                </div>
                
                <div className="w-1/3 text-center">
                    {isLastMatch && game.WDL ? (
                        <div className="flex flex-col items-center">
                            <div className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                                {game.Goals}<span className="text-gray-600 mx-1">-</span>{game.GoalsAgainst}
                            </div>
                            <span className={`mt-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                game.WDL === 'W' ? 'bg-green-500 text-black' :
                                game.WDL === 'L' ? 'bg-red-500 text-white' :
                                'bg-yellow-400 text-black'
                            }`}>
                                {game.WDL === 'W' ? 'WIN' : game.WDL === 'L' ? 'LOSS' : 'DRAW'}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-gray-600">VS</span>
                            <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                                {gameDateTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                                {gameDateTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center w-1/3">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center border-4 border-white/10 shadow-lg bg-gray-800">
                        <span className="text-3xl font-black text-gray-500">{game.Opponent.charAt(0)}</span>
                    </div>
                    <h4 className="font-bold mt-3 text-sm md:text-base tracking-wide truncate w-full text-center">{game.Opponent}</h4>
                </div>
            </div>
            
            <div className="text-center mt-6">
                 <Link to="/fixtures" className="inline-block text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
                    View Schedule
                </Link>
            </div>
        </div>
    );
};

const MatchCenter: React.FC<{ latestResult?: Game, upcomingGame?: Game }> = ({ latestResult, upcomingGame }) => (
    <div className="bg-accent border-t-4 border-secondary relative z-10 -mt-20 mx-4 md:mx-auto max-w-6xl shadow-2xl rounded-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <MatchCard game={latestResult} type="last" />
            <MatchCard game={upcomingGame} type="next" />
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

    if (loading) return <div className="flex justify-center items-center h-screen bg-accent"><Spinner /></div>;
    if (error) return <p className="text-center text-secondary py-20 font-bold text-xl">Failed to load page data.</p>;

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
        <div className="bg-background min-h-screen pb-20">
            <Hero />
            <MatchCenter latestResult={latestResults[0]} upcomingGame={upcomingGames[0]} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                {/* News Section */}
                <section className="mb-24">
                    <div className="flex items-end justify-between mb-12 border-b-4 border-accent pb-4">
                        <SectionTitle className="mb-0 border-none">Latest News</SectionTitle>
                        <Link to="/club/about" className="hidden md:block text-sm font-bold uppercase tracking-widest hover:text-secondary transition-colors mb-2">
                            Read More News &rarr;
                        </Link>
                    </div>
                    
                    {sortedAnnouncements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sortedAnnouncements.map((item, index) => (
                                <div key={index} className={`group relative overflow-hidden rounded-sm shadow-xl transition-all duration-500 hover:-translate-y-2 ${index === 0 ? 'md:col-span-2 lg:col-span-2 min-h-[400px]' : 'min-h-[350px]'}`}>
                                    <img src={item.ImageUrl} alt={item.Title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-accent via-accent/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                                        <span className="inline-block px-3 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest mb-3 w-fit">
                                            {new Date(item.Date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <h3 className={`font-black text-white uppercase leading-none mb-3 drop-shadow-lg ${index === 0 ? 'text-3xl md:text-5xl' : 'text-2xl'}`}>
                                            {item.Title}
                                        </h3>
                                        <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                                            {item.Content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500 italic">No announcements at this time.</p>}
                </section>

                {/* Spotlight & Media Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Player Spotlight */}
                    <div className="lg:col-span-5 flex flex-col">
                         <div className="flex items-end justify-between mb-8 border-b-4 border-accent pb-4">
                            <SectionTitle className="mb-0 border-none">Spotlight</SectionTitle>
                             <Link to="/roster" className="text-xs font-bold uppercase tracking-widest hover:text-secondary transition-colors mb-2">
                                Full Roster &rarr;
                            </Link>
                        </div>
                        
                        {spotlightPlayer ? (
                            <Link to={`/roster/${spotlightPlayer.Id}`} className="group relative block flex-grow bg-accent rounded-sm overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="relative h-full min-h-[500px] flex flex-col">
                                    <div className="absolute top-0 right-0 p-6 z-20">
                                        <span className="text-6xl font-black text-white/10 group-hover:text-white/20 transition-colors duration-500">
                                            #{rosters.find(r => r.PlayerId === spotlightPlayer.Id && r.SeasonId === latestSeason?.Id)?.Number || '00'}
                                        </span>
                                    </div>
                                    
                                    <div className="relative flex-grow overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent z-10"></div>
                                        <img 
                                            src={spotlightPlayer.PlayerImageUrl || PLAYER_PLACEHOLDER_IMAGE_URL} 
                                            alt={`${spotlightPlayer.FirstName} ${spotlightPlayer.LastName}`} 
                                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" 
                                        />
                                    </div>
                                    
                                    <div className="relative z-20 p-8 bg-accent border-t border-white/10">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                            {spotlightPlayer.FirstName}<br/>
                                            <span className="text-secondary">{spotlightPlayer.LastName}</span>
                                        </h3>
                                        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-6">
                                            {spotlightPlayer['Position(s)']}
                                        </p>
                                        
                                        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                                            <div className="text-center">
                                                <span className="block text-2xl font-black text-white">{spotlightPlayer.Pace || '-'}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">PAC</span>
                                            </div>
                                            <div className="text-center border-l border-white/10">
                                                <span className="block text-2xl font-black text-white">{spotlightPlayer.Shooting || spotlightPlayer.Reflexes || '-'}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{spotlightPlayer['Position(s)'].includes('GK') ? 'REF' : 'SHO'}</span>
                                            </div>
                                            <div className="text-center border-l border-white/10">
                                                <span className="block text-2xl font-black text-white">{spotlightPlayer.Physical || '-'}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">PHY</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ) : <p className="text-gray-500 italic">No player data available.</p>}
                    </div>

                    {/* Latest Highlight */}
                    <div className="lg:col-span-7 flex flex-col">
                        <div className="flex items-end justify-between mb-8 border-b-4 border-accent pb-4">
                            <SectionTitle className="mb-0 border-none">Highlights</SectionTitle>
                             <a href="https://www.youtube.com/@ToastyFC" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest hover:text-secondary transition-colors mb-2">
                                YouTube Channel &rarr;
                            </a>
                        </div>
                        
                        <div className="bg-black p-2 rounded-sm shadow-2xl">
                            <div className="aspect-video w-full overflow-hidden rounded-sm relative group">
                                <iframe 
                                    className="w-full h-full" 
                                    src={latestVideoUrl} 
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                        
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-surface p-6 rounded-sm shadow-lg border-l-4 border-secondary">
                                <span className="material-symbols-rounded text-4xl text-secondary mb-2">military_tech</span>
                                <h4 className="font-black text-accent uppercase tracking-wide text-lg">Championships</h4>
                                <p className="text-3xl font-black text-gray-400">2</p>
                            </div>
                            <div className="bg-surface p-6 rounded-sm shadow-lg border-l-4 border-primary">
                                <span className="material-symbols-rounded text-4xl text-primary mb-2">groups</span>
                                <h4 className="font-black text-accent uppercase tracking-wide text-lg">Active Roster</h4>
                                <p className="text-3xl font-black text-gray-400">{rosters.filter(r => r.SeasonId === latestSeason?.Id).length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
