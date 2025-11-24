import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import GearPage from './pages/GearPage';
import RosterPage from './pages/RosterPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import FixturesPage from './pages/FixturesPage';
import StatsPage from './pages/StatsPage';
import SponsorPage from './pages/SponsorPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const mainClass = isHomePage
    ? "flex-grow"
    : "flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12";

  return (
    <div className="bg-background min-h-screen text-accent font-sans flex flex-col">
      <Navbar />
      <main className={mainClass}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/club/about" element={<AboutPage />} />
          <Route path="/club/gear" element={<GearPage />} />
          <Route path="/roster" element={<RosterPage />} />
          <Route path="/roster/:playerId" element={<PlayerDetailPage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/connect/sponsor" element={<SponsorPage />} />
          <Route path="/connect/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <ScrollToTop />
        <AppContent />
      </HashRouter>
    </DataProvider>
  );
};

export default App;