

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import MatchCard from '../components/MatchCard';
import { 
    TEAM_NAME, PRIMARY_COLOR, ACCENT_COLOR, THEME_BLACK, THEME_WHITE, 
    GOOGLE_SHEET_MATCHES_TAB, GOOGLE_SHEET_PLAYERS_TAB,
    MaterialEventIcon, MaterialStarIcon, MaterialEmojiEventsIcon, MaterialCalendarIcon, MaterialTeamIcon 
} from '../constants';
import { Match, Player } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const [upcomingMatch, setUpcomingMatch] = useState<Match | undefined>(undefined);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [upcomingMatchError, setUpcomingMatchError] = useState<string | null>(null);
  const [recentMatchesError, setRecentMatchesError] = useState<string | null>(null);
  const [spotlightPlayerError, setSpotlightPlayerError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomePageData = async () => {
      setIsLoading(true);
      setUpcomingMatchError(null);
      setRecentMatchesError(null);
      setSpotlightPlayerError(null);

      try {
        const allMatchesData = await googleSheetsService.fetchMatches(GOOGLE_SHEET_MATCHES_TAB);
        
        const nextMatch = allMatchesData
          .filter(match => match.isUpcoming)
          .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0];
        setUpcomingMatch(nextMatch);

        const playedMatches = allMatchesData
          .filter(match => !match.isUpcoming && (match.status === 'Win' || match.status === 'Loss' || match.status === 'Draw' || match.status === 'Played'))
          .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
        setRecentMatches(playedMatches.slice(0, 3));
        if (playedMatches.length === 0 && allMatchesData.length === 0 && !isLoading){
             setRecentMatchesError("No match data available to show recent results.");
        }

        const allPlayers = await googleSheetsService.fetchPlayers(GOOGLE_SHEET_PLAYERS_TAB);
        const activePlayers = allPlayers.filter(player => player.status === 'Active');
        
        if (activePlayers.length > 0) {
          const randomIndex = Math.floor(Math.random() * activePlayers.length);
          setSpotlightPlayer(activePlayers[randomIndex]);
        } else if (allPlayers.length > 0) {
           setSpotlightPlayerError("No active players available for spotlight right now.");
        } else {
           setSpotlightPlayerError("Player data couldn't be loaded for the spotlight.");
        }

      } catch (err) {
        console.error("Error fetching data for Home Page:", err);
        const genericMessage = "Could not load all page data. Please try refreshing.";
        if (!upcomingMatch) setUpcomingMatchError("Could not load upcoming match data.");
        if (recentMatches.length === 0 && !recentMatchesError && !isLoading) setRecentMatchesError("Could not load recent results.");
        if (!spotlightPlayer && !spotlightPlayerError && !isLoading) setSpotlightPlayerError("Could not load player spotlight.");
        if (!upcomingMatchError && !recentMatchesError && !spotlightPlayerError && !isLoading) {
            setUpcomingMatchError(genericMessage); 
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadHomePageData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-12">
      <HeroSection ctaText="Explore Fan Zone" ctaLink="/fanzone" /> {/* FanZone Link might be disabled in Navbar */}

      {isLoading && !upcomingMatch && !upcomingMatchError && (
        <section className="text-center py-8">
          <LoadingSpinner text="Loading upcoming match..." />
        </section>
      )}
      {!isLoading && upcomingMatchError && !upcomingMatch && (
         <section className="text-center py-8">
           <p className={`text-red-500 bg-red-100 p-3 rounded-md`}>{upcomingMatchError}</p>
         </section>
      )}
      {!isLoading && upcomingMatch && (
        <section>
          <h2 className={`text-3xl font-bold text-center mb-8 text-[${PRIMARY_COLOR}] flex items-center justify-center`}>
            <MaterialEventIcon className="mr-3" /> Upcoming Match
          </h2>
          <div className="max-w-2xl mx-auto">
            <MatchCard match={upcomingMatch} />
          </div>
        </section>
      )}
      {!isLoading && !upcomingMatch && !upcomingMatchError && !isLoading && ( // Added !isLoading to prevent double message
         <section className="text-center py-8">
           <p className="text-lg text-gray-600">No upcoming matches scheduled at the moment. Check back soon!</p>
         </section>
      )}

      <section className="py-8">
        <h2 className={`text-3xl font-bold text-center mb-8 text-[${PRIMARY_COLOR}] flex items-center justify-center`}>
          <MaterialStarIcon className="mr-3" /> Player Spotlight
        </h2>
        {isLoading && !spotlightPlayer && !spotlightPlayerError && (
          <div className="text-center">
            <LoadingSpinner text="Loading player spotlight..." />
          </div>
        )}
        {!isLoading && spotlightPlayerError && !spotlightPlayer && (
          <div className="text-center">
            <p className={`text-red-500 bg-red-100 p-3 rounded-md`}>{spotlightPlayerError}</p>
          </div>
        )}
        {!isLoading && spotlightPlayer && (
          <div className={`bg-white rounded-xl shadow-xl p-6 md:p-8 max-w-md mx-auto text-center border border-[${PRIMARY_COLOR}]/20`}>
            <Link to={`/player/${spotlightPlayer.id}`} className="group">
              <img 
                src={spotlightPlayer.imageUrl || `https://ui-avatars.com/api/?name=${spotlightPlayer.name.replace(' ','+')}&background=cabba2&color=000000&size=128&bold=true&rounded=true`} 
                alt={spotlightPlayer.name} 
                className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-[${PRIMARY_COLOR}]/50 shadow-md group-hover:border-[${ACCENT_COLOR}] transition-colors duration-200"
                loading="lazy"
              />
              <h3 className={`text-2xl font-bold text-[${ACCENT_COLOR}] group-hover:underline`}>{spotlightPlayer.name}</h3>
            </Link>
            <p className="text-gray-700 text-lg">{spotlightPlayer.position}</p>
            {spotlightPlayer.jerseyNumber !== null && (
              <p className="text-gray-500 text-md">#{spotlightPlayer.jerseyNumber}</p>
            )}
            <Link
              to={`/player/${spotlightPlayer.id}`}
              className={`mt-6 inline-block px-6 py-3 bg-[${PRIMARY_COLOR}] text-[${THEME_BLACK}] font-semibold rounded-lg shadow hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] transition-colors duration-200`}
            >
              View Profile
            </Link>
          </div>
        )}
        {!isLoading && !spotlightPlayer && !spotlightPlayerError && !isLoading && ( // Added !isLoading
             <div className="text-center">
                <p className="text-lg text-gray-600">Our players are camera shy today! Check back soon for a spotlight.</p>
             </div>
        )}
      </section>

      <section className="py-8">
        <h2 className={`text-3xl font-bold text-center mb-8 text-[${PRIMARY_COLOR}] flex items-center justify-center`}>
            <MaterialEmojiEventsIcon className="mr-3" /> Latest Results
        </h2>
        {isLoading && recentMatches.length === 0 && !recentMatchesError && (
          <div className="text-center">
            <LoadingSpinner text="Loading recent results..." />
          </div>
        )}
        {!isLoading && recentMatchesError && recentMatches.length === 0 && (
           <div className="text-center">
            <p className={`text-red-500 bg-red-100 p-3 rounded-md`}>{recentMatchesError}</p>
          </div>
        )}
        {!isLoading && recentMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMatches.map(match => (
              <MatchCard key={`${match.id}-${match.date}`} match={match} />
            ))}
          </div>
        )}
        {!isLoading && recentMatches.length === 0 && !recentMatchesError && !isLoading && ( // Added !isLoading
            <div className="text-center">
                <p className="text-lg text-gray-600">No recent match results to display. Check back after our next game!</p>
            </div>
        )}
      </section>

       <section className="text-center py-12 bg-white rounded-lg shadow-lg">
          <h2 className={`text-3xl font-bold mb-4 text-[${PRIMARY_COLOR}]`}>Join the {TEAM_NAME} Family!</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Whether you're a lifelong fan or new to the excitement, there's a place for you at {TEAM_NAME}. Follow our journey, cheer us on, and be part of our toasty community!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/fixtures" className={`block sm:inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[${PRIMARY_COLOR}] text-[${THEME_BLACK}] font-semibold rounded-lg shadow hover:bg-[${PRIMARY_COLOR}]/80 transition-colors`}>
              <MaterialCalendarIcon className="mr-2" /> View Fixtures
            </Link>
            <Link to="/club/about" className={`block sm:inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[${ACCENT_COLOR}] text-[${THEME_WHITE}] font-semibold rounded-lg shadow hover:bg-[${ACCENT_COLOR}]/90 transition-colors`}>
              <MaterialTeamIcon className="mr-2" /> Learn About Us
            </Link>
          </div>
        </section>
    </div>
  );
};

export default HomePage;