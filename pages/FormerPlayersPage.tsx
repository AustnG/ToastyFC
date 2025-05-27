

import React, { useState, useEffect } from 'react';
import RosterItemCard from '../components/RosterItemCard';
import { PRIMARY_COLOR, TEAM_NAME, GOOGLE_SHEET_PLAYERS_TAB, MaterialUsersIcon } from '../constants';
import { Player } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';

const FormerPlayersPage: React.FC = () => {
  const [formerPlayers, setFormerPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFormerPlayers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPlayers = await googleSheetsService.fetchPlayers(GOOGLE_SHEET_PLAYERS_TAB);
        const inactivePlayers = fetchedPlayers.filter(player => player.status === 'Inactive');
        setFormerPlayers(inactivePlayers);
      } catch (err) {
        console.error("Error fetching former players:", err);
        setError("Failed to load former player data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadFormerPlayers();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading former players..." size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-8 py-8">
      <header className="text-center">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] mb-2 flex items-center justify-center`}>
            <MaterialUsersIcon className="mr-3" style={{fontSize: '36px'}} /> {TEAM_NAME} Alumni
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Remembering the players who have previously represented {TEAM_NAME}.
        </p>
      </header>

      {formerPlayers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {formerPlayers.map(player => (
            <RosterItemCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-xl py-10">
          No former players are listed at this time. Our legacy is still being written!
        </p>
      )}

      <section className="text-center mt-12 py-10 bg-gray-50 rounded-lg shadow-inner">
        <h3 className={`text-2xl font-bold text-[${PRIMARY_COLOR}] mb-3`}>Once Toasty, Always Toasty</h3>
        <p className="text-gray-700 max-w-2xl mx-auto">
          We thank all former players for their contributions and dedication to {TEAM_NAME}.
        </p>
      </section>
    </div>
  );
};

export default FormerPlayersPage;