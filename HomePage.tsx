
import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MatchCard from '../components/MatchCard';
import { TEAM_NAME, PRIMARY_COLOR, ACCENT_COLOR, THEME_BLACK, THEME_WHITE, GOOGLE_SHEET_MATCHES_TAB } from '../constants';
import { Match } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const [upcomingMatch, setUpcomingMatch] = useState<Match | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Minimal error display for homepage, could be expanded
  const [error, setError] = useState<string | null>(null); 


  useEffect(() => {
    const loadUpcomingMatch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allMatches = await googleSheetsService.fetchMatches(GOOGLE_SHEET_MATCHES_TAB);
        const nextMatch = allMatches.filter(match => match.isUpcoming)
                                   .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        setUpcomingMatch(nextMatch);
      } catch (err) {
        console.error("Error fetching upcoming match for Home Page:", err);
        setError("Could not load upcoming match data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadUpcomingMatch();
  }, []);

  return (
    <div className="space-y-12">
      <HeroSection />

      {isLoading && (
        <section className="text-center py-8">
          <LoadingSpinner text="Loading upcoming match..." />
        </section>
      )}

      {!isLoading && error && (
         <section className="text-center py-8">
           <p className="text-red-500">{error}</p>
         </section>
      )}

      {!isLoading && !error && upcomingMatch && (
        <section>
          <h2 className={`text-3xl font-bold text-center mb-8 text-[${PRIMARY_COLOR}]`}>Upcoming Match</h2>
          <div className="max-w-2xl mx-auto">
            <MatchCard match={upcomingMatch} />
          </div>
        </section>
      )}
      
      {!isLoading && !error && !upcomingMatch && (
         <section className="text-center py-8">
           <p className="text-lg text-gray-600">No upcoming matches scheduled at the moment. Check back soon!</p>
         </section>
      )}


       <section className="text-center py-12 bg-white rounded-lg shadow-lg">
          <h2 className={`text-3xl font-bold mb-4 text-[${PRIMARY_COLOR}]`}>Join the {TEAM_NAME} Family!</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Whether you're a lifelong fan or new to the excitement, there's a place for you at {TEAM_NAME}. Follow our journey, cheer us on, and be part of our toasty community!
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#/fixtures" className={`px-6 py-3 bg-[${PRIMARY_COLOR}] text-[${THEME_BLACK}] font-semibold rounded-lg shadow hover:bg-[${PRIMARY_COLOR}]/80 transition-colors`}>View Fixtures</a>
            <a href="#/team" className={`px-6 py-3 bg-[${ACCENT_COLOR}] text-[${THEME_WHITE}] font-semibold rounded-lg shadow hover:bg-[${ACCENT_COLOR}]/90 transition-colors`}>Meet the Team</a>
          </div>
        </section>
    </div>
  );
};

export default HomePage;
