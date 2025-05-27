

import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '../types';
import { ACCENT_COLOR, THEME_WHITE, ToastIcon } from '../constants';

interface RosterItemCardProps {
  player: Player;
}

const RosterItemCard: React.FC<RosterItemCardProps> = ({ player }) => {
  const { id, firstName, lastName, imageUrl, jerseyNumber, nationality, name, status } = player;

  const displayFirstName = firstName || name.split(' ')[0] || '';
  const displayLastName = lastName || name.split(' ').slice(1).join(' ') || name;

  const flagUrl = nationality ? `https://flagcdn.com/w40/${nationality.toLowerCase()}.png` : '';
  const isSilhouette = !imageUrl || imageUrl.includes('picsum.photos/seed/silhouette');

  return (
    <Link
      to={`/player/${id}`}
      className="relative block w-full aspect-[3/4] shadow-xl rounded-lg overflow-hidden group transform transition-all duration-300 ease-in-out hover:scale-105"
      style={{ backgroundColor: ACCENT_COLOR }}
      aria-label={`View details for ${name}${status === 'Inactive' ? ' (Former Player)' : ''}`}
      role="listitem" // Ensures it's treated as a list item if part of a list by parent
    >
      {/* Background Toast Watermark */}
      <ToastIcon className="absolute inset-0 w-full h-full text-white opacity-10 scale-125 z-0" />

      {/* Player Image - Conditionally rendered */}
      {!isSilhouette && (
        <img
          src={imageUrl}
          alt={`${name}, ${player.position}`}
          className={`absolute inset-0 w-full h-full object-contain z-10 object-bottom`}
          style={{
              objectPosition: 'bottom center', 
              transform: 'scale(1.15)', 
          }}
          loading="lazy"
        />
      )}

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-20"></div>

      {/* Content Overlay: Number, Flag, Names */}
      <div className="absolute inset-0 z-30 p-3 flex flex-col justify-between text-white">
        {/* Top Section: Jersey Number */}
        <div className="flex justify-start items-start">
          {jerseyNumber !== null && (
            <span
              className="text-5xl sm:text-6xl font-black italic -ml-1"
              style={{ WebkitTextStroke: `1.5px ${THEME_WHITE}40`, textShadow: '2px 2px 5px rgba(0,0,0,0.6)' }}
              aria-hidden="true" // Number is part of the visual, name provides main label
            >
              {jerseyNumber}
            </span>
          )}
        </div>

        {/* Center-Left Flag */}
        {nationality && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="relative"> 
                    {flagUrl && (
                        <img
                        src={flagUrl}
                        alt={`${nationality} flag`}
                        className="w-10 h-auto border-2 border-white/50 shadow-md rounded-sm" 
                        onError={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.style.display = 'none'; 
                            const parent = imgElement.parentElement;
                            if(parent) {
                                if (parent.querySelector('.flag-fallback-text')) return;
                                const textFlag = document.createElement('span');
                                textFlag.className = 'text-xs px-1.5 py-0.5 bg-black/40 text-white rounded-sm font-mono flag-fallback-text';
                                textFlag.textContent = nationality.toUpperCase();
                                parent.appendChild(textFlag);
                            }
                        }}
                        />
                    )}
                    {!flagUrl && ( 
                        <span className="text-xs px-1.5 py-0.5 bg-black/40 text-white rounded-sm font-mono">
                        {nationality.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>
        )}

        {/* Bottom Section: Names */}
        <div className="text-left" id={`player-name-${player.id}`}>
          <p className="text-base font-light leading-tight">{displayFirstName}</p>
          <p className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter -ml-0.5">
            {displayLastName}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RosterItemCard;