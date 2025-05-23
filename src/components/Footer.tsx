import React from 'react';
import { TEAM_NAME, PRIMARY_COLOR, BACKGROUND_COLOR_DARK, TEXT_COLOR_LIGHT, ACCENT_COLOR } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className={`${BACKGROUND_COLOR_DARK} ${TEXT_COLOR_LIGHT} body-font`}>
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <a className={`flex title-font font-medium items-center md:justify-start justify-center text-white`}>
          <span className={`ml-3 text-xl text-[${PRIMARY_COLOR}]`}>{TEAM_NAME} 🔥</span>
        </a>
        <p className="text-sm text-gray-400 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-700 sm:py-2 sm:mt-0 mt-4">
          © {new Date().getFullYear()} {TEAM_NAME} — All Rights Reserved
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          {/* Placeholder for social media icons */}
          <a className={`text-gray-400 hover:text-[${PRIMARY_COLOR}] cursor-pointer`}>
            <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
            </svg>
          </a>
          <a className={`ml-3 text-gray-400 hover:text-[${PRIMARY_COLOR}] cursor-pointer`}>
            <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
            </svg>
          </a>
          <a className={`ml-3 text-gray-400 hover:text-[${PRIMARY_COLOR}] cursor-pointer`}>
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
            </svg>
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;