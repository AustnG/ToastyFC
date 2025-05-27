


import React from 'react';
import { Match } from '../types';
import { TEAM_NAME, PRIMARY_COLOR, ACCENT_COLOR, THEME_WHITE, MaterialPlayCircleIcon, TEAM_LOGO_URL, MaterialEmojiEventsIcon } from '../constants';

interface MatchCardProps {
  match: Match;
}

const getYouTubeVideoId = (url: string | undefined): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
};

const getPlaceholderLogoUrl = (teamName: string): string => {
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2) // Max 2 initials
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=e0e0e0&color=333333&size=64&font-size=0.45&bold=true&rounded=true&format=svg`;
};

interface PostseasonInfo {
  text: string;
  className: string;
  originalGameNumber: string;
}

const getPostseasonStageInfo = (gameNumber?: string): PostseasonInfo | null => {
  if (!gameNumber) return null;

  const GN = gameNumber.toUpperCase();

  // Order is important: QF, SF, then F, to avoid "SF" matching "F" prematurely.
  if (GN.includes("QF") || GN.includes("QUARTERFINAL") || GN.includes("QUARTER-FINAL")) {
    return { text: "QUARTER-FINAL", className: "bg-yellow-600 text-white", originalGameNumber: gameNumber }; // Bronze
  }
  if (GN.includes("SF") || GN.includes("SEMIFINAL") || GN.includes("SEMI-FINAL")) {
    return { text: "SEMI-FINAL", className: "bg-slate-400 text-black", originalGameNumber: gameNumber }; // Silver
  }
  if (GN === "F" || /^F\d+$/.test(GN) || GN.includes("FINAL")) { // "F", "F1", "FINAL", "Final Game"
    return { text: "FINAL", className: "bg-amber-400 text-black", originalGameNumber: gameNumber }; // Gold
  }

  // Not a recognized postseason type based on QF/SF/F keywords, and not purely numeric
  return null;
};


const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { date, time, homeTeam, awayTeam, venue, status, gameNumber, youtubeLink } = match;

  const homeTeamNameDisplay = homeTeam.name === TEAM_NAME ? <span className={`font-bold text-[${PRIMARY_COLOR}]`}>{homeTeam.name}</span> : homeTeam.name;
  const awayTeamNameDisplay = awayTeam.name === TEAM_NAME ? <span className={`font-bold text-[${PRIMARY_COLOR}]`}>{awayTeam.name}</span> : awayTeam.name;

  const postseasonInfo = getPostseasonStageInfo(gameNumber);
  
  let cardBg = postseasonInfo ? 'bg-yellow-50' : (status === 'Upcoming' ? 'bg-white' : 'bg-gray-50');


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

  const videoId = getYouTubeVideoId(youtubeLink);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

  const getLogoClasses = (teamName: string, providedLogoUrl?: string) => {
    let classes = "w-12 h-12 mx-auto mb-1 object-contain";
    if (teamName === TEAM_NAME || !providedLogoUrl) {
      classes += " rounded-full";
    } else {
      classes += " rounded-md";
    }
    return classes;
  };
  
  const homeLogoSrc = homeTeam.name === TEAM_NAME ? TEAM_LOGO_URL : (homeTeam.logo || getPlaceholderLogoUrl(homeTeam.name));
  const awayLogoSrc = awayTeam.name === TEAM_NAME ? TEAM_LOGO_URL : (awayTeam.logo || getPlaceholderLogoUrl(awayTeam.name));

  const displayGameNumber = gameNumber && /^\d+$/.test(gameNumber); // True if gameNumber is purely numeric

  return (
    <div className={`${cardBg} rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col relative`}>
      {postseasonInfo && postseasonInfo.originalGameNumber?.toUpperCase() === "F" && status === "Win" && (
        <div 
          className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0"
          aria-hidden="true"
        >
          <MaterialEmojiEventsIcon 
            className="text-amber-400 opacity-20"
            style={{ fontSize: '10rem' }} // Large background icon
          />
        </div>
      )}

      <div className="relative z-10"> {/* Content wrapper to ensure it's above the trophy */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {time}</p>
            {postseasonInfo ? (
              <span className={`px-2 py-0.5 mt-1 text-xs font-semibold rounded-full ${postseasonInfo.className} inline-block`} aria-label={`Postseason stage: ${postseasonInfo.text}`}>
                {postseasonInfo.text}
                {!(postseasonInfo.originalGameNumber.toUpperCase() === postseasonInfo.text ||
                  (postseasonInfo.text === "QUARTER-FINAL" && postseasonInfo.originalGameNumber.toUpperCase() === "QF") ||
                  (postseasonInfo.text === "SEMI-FINAL" && postseasonInfo.originalGameNumber.toUpperCase() === "SF") ||
                  (postseasonInfo.text === "FINAL" && postseasonInfo.originalGameNumber.toUpperCase() === "F")
                ) ? ` (${postseasonInfo.originalGameNumber})` : ''}
              </span>
            ) : displayGameNumber ? ( 
              <p className="text-xs text-gray-400 mt-0.5">Game #{gameNumber}</p>
            ) : gameNumber ? ( 
              <p className="text-xs text-gray-400 mt-0.5">{gameNumber}</p>
            ) : null}
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles} whitespace-nowrap inline-flex items-center`}>
            <span>{statusText}</span>
            {/* Golden trophy icon removed from here */}
          </span>
        </div>

        <div className="flex items-center justify-around mb-2 text-center flex-grow">
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src={homeLogoSrc} alt={`${homeTeam.name} logo`} className={getLogoClasses(homeTeam.name, homeTeam.logo)} />
            <p className="text-lg font-semibold leading-tight">{homeTeamNameDisplay}</p>
          </div>
          <div className="text-2xl font-bold text-gray-700 px-2 sm:px-4">
            {typeof homeTeam.score === 'number' && typeof awayTeam.score === 'number' ? (
              <span>{homeTeam.score} - {awayTeam.score}</span>
            ) : (
              'vs'
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src={awayLogoSrc} alt={`${awayTeam.name} logo`} className={getLogoClasses(awayTeam.name, awayTeam.logo)} />
            <p className="text-lg font-semibold leading-tight">{awayTeamNameDisplay}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center mt-4">
          <span className="font-semibold">Venue:</span> {venue}
        </p>

        {thumbnailUrl && youtubeLink && (
          <div className="mt-6">
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch highlights for ${homeTeam.name} vs ${awayTeam.name} on YouTube`}
              className="block relative group rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={thumbnailUrl}
                alt={`YouTube thumbnail for ${homeTeam.name} vs ${awayTeam.name} highlights`}
                className="w-full h-auto object-cover aspect-video"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                <MaterialPlayCircleIcon
                  className={`text-[${THEME_WHITE}] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200`}
                  style={{ fontSize: '64px' }}
                />
              </div>
            </a>
            <p className="text-xs text-center mt-2 text-gray-500">
              Watch Highlights on <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className={`text-[${ACCENT_COLOR}] hover:underline`}>YouTube</a>
            </p>
          </div>
        )}
      </div> {/* End of content wrapper */}
    </div>
  );
};

export default MatchCard;
