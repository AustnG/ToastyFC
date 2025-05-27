import React from 'react';
import { 
  TEAM_NAME, 
  TEAM_LOGO_URL,
  PRIMARY_COLOR, 
  BACKGROUND_COLOR_DARK, 
  TEXT_COLOR_LIGHT, 
  MaterialYouTubeSocialIcon,
  MaterialInstagramSocialIcon,
  MaterialDiscordSocialIcon
} from '../constants';

const Footer: React.FC = () => {
  const iconStyle = { fontSize: '20px' }; // Equivalent to w-5 h-5 or 1.25rem

  return (
    <footer className={`${BACKGROUND_COLOR_DARK} ${TEXT_COLOR_LIGHT} body-font`}>
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <a href="#/" className={`flex title-font font-medium items-center md:justify-start justify-center text-white`}>
          <img src={TEAM_LOGO_URL} alt={`${TEAM_NAME} Logo`} className="h-10 w-auto rounded-full" />
        </a>
        <p className="text-sm text-gray-400 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-700 sm:py-2 sm:mt-0 mt-4">
          © {new Date().getFullYear()} {TEAM_NAME} — All Rights Reserved
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          <a 
            href="#" /* Replace with actual YouTube link */
            aria-label={`Follow ${TEAM_NAME} on YouTube`}
            className={`text-gray-400 hover:text-[${PRIMARY_COLOR}] cursor-pointer`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MaterialYouTubeSocialIcon style={iconStyle} />
          </a>
          <a 
            href="#" /* Replace with actual Instagram link */
            aria-label={`Follow ${TEAM_NAME} on Instagram`}
            className={`ml-3 text-gray-400 hover:text-[${PRIMARY_COLOR}] cursor-pointer`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MaterialInstagramSocialIcon style={iconStyle} />
          </a>
          <a 
            href="#" /* Replace with actual Discord link */
            aria-label={`Join the ${TEAM_NAME} Discord server`}
            className={`ml-3 text-gray-400 hover:text-[${PRIMARY_COLOR}] cursor-pointer`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MaterialDiscordSocialIcon style={iconStyle} />
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;