import React, { useState, useEffect } from 'react';
import RosterItemCard from '../components/RosterItemCard';
import { PRIMARY_COLOR, TEAM_NAME, GOOGLE_SHEET_PLAYERS_TAB } from '../constants';
import { Player } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';

const RosterPage: React.FC = () => {
  const [rosterPlayers, setRosterPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoster = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPlayers = await googleSheetsService.fetchPlayers(GOOGLE_SHEET_PLAYERS_TAB);
        // Sort players by jersey number
        const sortedPlayers = fetchedPlayers.sort((a, b) => a.jerseyNumber - b.jerseyNumber);
        setRosterPlayers(sortedPlayers);
      } catch (err) {
        console.error("Error fetching roster:", err);
        setError("Failed to load roster data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRoster();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading roster..." size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-8 py-8">
      <header className="text-center">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] mb-2`}>Meet the {TEAM_NAME} Roster</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Our talented squad ready to hit the pitch! Get to know the players who make {TEAM_NAME} shine.
        </p>
      </header>

      {rosterPlayers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {rosterPlayers.map(player => (
            <RosterItemCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-xl py-10">
          The roster is currently empty or could not be loaded. Check back soon to meet the team!
        </p>
      )}

      <section className="text-center mt-12 py-10 bg-gray-50 rounded-lg shadow-inner">
        <h3 className={`text-2xl font-bold text-[${PRIMARY_COLOR}] mb-3`}>Future Stars</h3>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Each player has a unique story and brings their best to {TEAM_NAME}. More details coming soon!
        </p>
      </section>
    </div>
  );
};

export default RosterPage;