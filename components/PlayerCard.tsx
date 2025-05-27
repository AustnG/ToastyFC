import React from 'react';
import { Player } from '../types';
import { PRIMARY_COLOR, THEME_WHITE } from '../constants';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const { name, position, imageUrl, bio, jerseyNumber } = player;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="relative">
        <img className="w-full h-64 object-cover" src={imageUrl} alt={name} />
        <div className={`absolute top-0 right-0 bg-[${PRIMARY_COLOR}] text-[${THEME_WHITE}] text-xl font-bold p-2 m-2 rounded-full w-12 h-12 flex items-center justify-center shadow-md`}>
          {jerseyNumber}
        </div>
      </div>
      <div className="p-6">
        <h3 className={`text-2xl font-bold text-[${PRIMARY_COLOR}] mb-1`}>{name}</h3>
        <p className="text-gray-700 font-semibold text-md mb-2">{position}</p>
        <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
      </div>
    </div>
  );
};

export default PlayerCard;