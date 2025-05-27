

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FixturesPage from './pages/FixturesPage';
import StatsPage from './pages/StatsPage';
import FanZonePage from './pages/FanZonePage';
import GearSetupPage from './pages/GearSetupPage';
import RosterPage from './pages/RosterPage';
import FormerPlayersPage from './pages/FormerPlayersPage';
import PlayerDetailPage from './pages/PlayerDetailPage'; // Import new page
import SponsorPage from './pages/SponsorPage';
import ContactPage from './pages/ContactPage';
// ConnectPage2.tsx is removed as per previous cleanup/consolidation
import { BACKGROUND_COLOR_LIGHT, TEXT_COLOR_DARK } from './constants';

const App: React.FC = () => {
  return (
    <div className={`flex flex-col min-h-screen ${BACKGROUND_COLOR_LIGHT} ${TEXT_COLOR_DARK} font-sans`}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/club/about" element={<AboutPage />} />
          <Route path="/club/gear" element={<GearSetupPage />} />
          <Route path="/roster" element={<RosterPage />} />
          <Route path="/player/:playerId" element={<PlayerDetailPage />} /> {/* Add new route */}
          <Route path="/former-players" element={<FormerPlayersPage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/fanzone" element={<FanZonePage />} />
          <Route path="/connect/sponsor" element={<SponsorPage />} />
          <Route path="/connect/contact" element={<ContactPage />} />
          {/* Route for ConnectPage2 removed */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;