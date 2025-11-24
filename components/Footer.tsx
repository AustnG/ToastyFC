import React from 'react';
import { LOGO_URL_ROUNDED } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <img src={LOGO_URL_ROUNDED} alt="Toasty FC Logo" className="h-16 mx-auto mb-4" />
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Toasty FC. All Rights Reserved.
        </p>
        <p className="text-xs mt-2">
          Bowling Green, KY | Established 2022
        </p>
      </div>
    </footer>
  );
};

export default Footer;