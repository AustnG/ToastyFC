import React from 'react';
import { Link } from 'react-router-dom';
import { TEAM_NAME, PRIMARY_COLOR, ACCENT_COLOR, THEME_WHITE, THEME_BLACK } from '../constants';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = `Welcome to ${TEAM_NAME}!`,
  subtitle = "Get ready for some sizzling soccer action!",
  imageUrl = "https://picsum.photos/seed/hero/1200/600",
  ctaText = "Explore Fan Zone",
  ctaLink = "/fanzone"
}) => {
  return (
    <div className="relative bg-neutral-800 text-white rounded-lg shadow-xl overflow-hidden mb-12">
      <img src={imageUrl} alt="Toasty FC Hero" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="relative container mx-auto px-6 py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className={`block text-[${THEME_WHITE}]`}>{title}</span>
          <span className={`block text-[${PRIMARY_COLOR}]`}>🔥 We're Toasty! 🔥</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-xl text-gray-200 sm:max-w-3xl">
          {subtitle}
        </p>
        {ctaText && ctaLink && (
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <Link
              to={ctaLink}
              className={`w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[${THEME_BLACK}] bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] md:py-4 md:text-lg md:px-10 transition-colors duration-200`}
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;