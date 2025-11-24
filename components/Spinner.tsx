import React from 'react';
import { LOGO_URL_ROUNDED } from '../constants';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8 [perspective:800px]">
      <img 
        src={LOGO_URL_ROUNDED} 
        alt="Loading..." 
        className="animate-spin-y h-20 w-20"
      />
    </div>
  );
};

export default Spinner;