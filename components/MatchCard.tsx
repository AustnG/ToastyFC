
import React from 'react';
import { Match } from '../types';
import { TEAM_NAME, PRIMARY_COLOR } from '../constants';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { date, time, homeTeam, awayTeam, venue, status, gameNumber } = match;

  const homeTeamName = homeTeam.name === TEAM_NAME ? <span className={`font-bold text-[${PRIMARY_COLOR}]`}>{homeTeam.name}</span> : homeTeam.name;
  const awayTeamName = awayTeam.name === TEAM_NAME ? <span className={`font-bold text-[${PRIMARY_COLOR}]`}>{awayTeam.name}</span> : awayTeam.name;
  
  const cardBg = status === 'Upcoming' ? 'bg-white' : 'bg-gray-50';

  let statusStyles = 'bg-gray-100 text-gray-700'; // Default for 'Played' or others
  let statusText = status || 'Info';

  switch (status) {
    case 'Upcoming':
      statusStyles = 'bg-cyan-100 text-cyan-700';
      statusText = 'Upcoming';
      break;
    case 'Win':
      statusStyles = 'bg-green-100 text-green-700';
      statusText = 'Win';
      break;
    case 'Draw':
      statusStyles = 'bg-yellow-100 text-yellow-700';
      statusText = 'Draw';
      break;
    case 'Loss':
      statusStyles = 'bg-red-100 text-red-700';
      statusText = 'Loss';
      break;
    case 'Played': 
      statusStyles = 'bg-neutral-100 text-neutral-700';
      statusText = 'Played';
      break;
    case 'Live': 
      statusStyles = 'bg-orange-100 text-orange-700 animate-pulse';
      statusText = 'Live';
      break;
    default:
      break;
  }


  return (
    <div className={`${cardBg} rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {time}</p>
          {gameNumber && <p className="text-xs text-gray-400 mt-0.5">Game #{gameNumber}</p>}
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles} whitespace-nowrap`}>
          {statusText}
        </span>
      </div>
      
      <div className="flex items-center justify-around mb-2 text-center flex-grow">
        <div className="flex-1 flex flex-col items-center justify-center">
          {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 mx-auto mb-1 object-contain"/>}
          <p className="text-lg font-semibold leading-tight">{homeTeamName}</p>
        </div>
        <div className="text-2xl font-bold text-gray-700 px-2 sm:px-4">
          {typeof homeTeam.score === 'number' && typeof awayTeam.score === 'number' ? (
            <span>{homeTeam.score} - {awayTeam.score}</span>
          ) : (
            'vs'
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 mx-auto mb-1 object-contain"/>}
          <p className="text-lg font-semibold leading-tight">{awayTeamName}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 text-center mt-4">
        <span className="font-semibold">Venue:</span> {venue}
      </p>
    </div>
  );
};

export default MatchCard;
