/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Club from './components/Club';
import Roster from './components/Roster';
import Matches from './components/Matches';
import Stats from './components/Stats';
import SheetsSync from './components/SheetsSync';
import { Player, Match, SheetConfig, NewsItem, Season } from './types';
import { DEFAULT_PLAYERS, DEFAULT_MATCHES, DEFAULT_NEWS, DEFAULT_SEASONS } from './data';
import { 
  fetchSheetCSV, 
  parsePlayersCSV, 
  parseRostersCSV, 
  parseGamesCSV, 
  parseGameStatsCSV, 
  parseNewsCSV,
  parseSeasonsCSV,
  compileSyncedData 
} from './sheets';
import { Flame, Heart, Database } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(() => 
    DEFAULT_MATCHES.map(m => ({ ...m, seasonId: m.seasonId || '11' }))
  );
  const [seasons, setSeasons] = useState<Season[]>(DEFAULT_SEASONS);
  const [news, setNews] = useState<NewsItem[]>(DEFAULT_NEWS);
  
  // Sheet config states
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccessLog, setSyncSuccessLog] = useState<string | null>(null);
  
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('toasty_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'dark'; // default to Dark mode
  });

  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(() => {
    const saved = localStorage.getItem('toasty_sheet_config_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, isCustom: true };
      } catch (e) {
        // ignore
      }
    }
    // Pre-populate with the team's official Google Sheet ID and actual tab names!
    return {
      sheetId: '1HDMxOrgqMzfB4LaBY-0JQfAfZd80ZVVI97C5zgUD_08',
      newsRange: 'News',
      playersRange: 'Players',
      seasonsRange: 'Seasons',
      rostersRange: 'Rosters',
      gamesRange: 'Games',
      gameStatsRange: 'GameStats',
      rosterRange: 'Rosters',
      ratingsRange: 'GameStats',
      matchesRange: 'Games',
      isCustom: true
    };
  });

  // Action: Synchronize from Google Sheets
  const syncFromSheets = async (config: SheetConfig) => {
    if (!config.sheetId) return;
    
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccessLog(null);

    try {
      // 1. Fetch News
      let parsedNews = DEFAULT_NEWS;
      try {
        const newsRows = await fetchSheetCSV(config.sheetId, config.newsRange || 'News');
        const freshlyParsedNews = parseNewsCSV(newsRows);
        if (freshlyParsedNews.length > 0) {
          parsedNews = freshlyParsedNews;
        }
      } catch (err: any) {
        console.warn('News worksheet sync failed, using default news:', err);
      }

      // 2. Fetch Players Directory (required as basis)
      const playersRows = await fetchSheetCSV(config.sheetId, config.playersRange || 'Players');
      const parsedPlayers = parsePlayersCSV(playersRows);
      
      if (parsedPlayers.length === 0) {
        throw new Error('Players worksheet was read, but no players could be parsed. Check column headers.');
      }

      // 3. Fetch Rosters
      let parsedRosters = [];
      try {
        const rostersRows = await fetchSheetCSV(config.sheetId, config.rostersRange || 'Rosters');
        parsedRosters = parseRostersCSV(rostersRows);
      } catch (err: any) {
        console.warn('Rosters tab sync failed:', err);
      }

      // 3.5. Fetch Seasons
      let parsedSeasons = DEFAULT_SEASONS;
      try {
        const seasonsRows = await fetchSheetCSV(config.sheetId, config.seasonsRange || 'Seasons');
        const freshlyParsedSeasons = parseSeasonsCSV(seasonsRows);
        if (freshlyParsedSeasons.length > 0) {
          parsedSeasons = freshlyParsedSeasons;
        }
      } catch (err: any) {
        console.warn('Seasons tab sync failed, using default:', err);
      }

      // 4. Fetch Games
      let parsedGames = [];
      try {
        const gamesRows = await fetchSheetCSV(config.sheetId, config.gamesRange || 'Games');
        parsedGames = parseGamesCSV(gamesRows);
      } catch (err: any) {
        console.warn('Games tab sync failed:', err);
      }

      // 5. Fetch GameStats
      let parsedGameStats = [];
      try {
        const gameStatsRows = await fetchSheetCSV(config.sheetId, config.gameStatsRange || 'GameStats');
        parsedGameStats = parseGameStatsCSV(gameStatsRows);
      } catch (err: any) {
        console.warn('GameStats tab sync failed:', err);
      }

      // 6. Compile everything
      const { players: compiledPlayers, matches: compiledMatches } = compileSyncedData(
        parsedPlayers,
        parsedRosters,
        parsedGames.length > 0 ? parsedGames : DEFAULT_MATCHES,
        parsedGameStats
      );

      // Update State
      setPlayers(compiledPlayers);
      setMatches(compiledMatches);
      setSeasons(parsedSeasons);
      setNews(parsedNews);
      setIsSynced(true);
      
      // Save configuration in localStorage
      localStorage.setItem('toasty_sheet_config_v2', JSON.stringify(config));

      // Generate visual log report
      setSyncSuccessLog(
        `• Successfully linked database Spreadsheet ID: ${config.sheetId.substring(0, 10)}...
• Syncing News feed: parsed ${parsedNews.length} active articles.
• Syncing Players directory: parsed ${parsedPlayers.length} profiles with full FC attributes.
• Syncing Seasons: parsed ${parsedSeasons.length} season specifications.
• Syncing Rosters: mapped ${parsedRosters.length} roster/captain records.
• Syncing Games: compiled ${compiledMatches.length} league fixtures.
• Syncing GameStats: merged ${parsedGameStats.length} individual performance sheets.`
      );
    } catch (error: any) {
      console.error('Spreadsheet sync error:', error);
      setSyncError(error.message || 'An unexpected error occurred while fetching the Google Sheet. Please check the ID and general access sharing.');
      setIsSynced(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset to default official spreadsheet settings
  const handleResetToDefault = () => {
    localStorage.removeItem('toasty_sheet_config_v2');
    const defaultConfig = {
      sheetId: '1HDMxOrgqMzfB4LaBY-0JQfAfZd80ZVVI97C5zgUD_08',
      newsRange: 'News',
      playersRange: 'Players',
      seasonsRange: 'Seasons',
      rostersRange: 'Rosters',
      gamesRange: 'Games',
      gameStatsRange: 'GameStats',
      rosterRange: 'Rosters',
      ratingsRange: 'GameStats',
      matchesRange: 'Games',
      isCustom: true
    };
    setSheetConfig(defaultConfig);
    syncFromSheets(defaultConfig);
  };

  // Sync theme to root class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('toasty_theme', theme);
  }, [theme]);

  // Auto-sync on mount
  useEffect(() => {
    if (sheetConfig.sheetId) {
      syncFromSheets(sheetConfig);
    }
  }, []);

  return (
    <div className="min-h-screen bg-club-bg text-club-text flex flex-col selection:bg-jersey-red selection:text-white transition-colors duration-200" id="app-root-container">
      {/* Navigation Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} isSynced={isSynced} theme={theme} setTheme={setTheme} />

      {/* Main Content Render */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-8" id="main-content-area">
        {currentTab === 'home' && (
          <Home matches={matches} players={players} news={news} setCurrentTab={setCurrentTab} />
        )}
        {currentTab === 'about' && (
          <Club subTab="about" setCurrentTab={setCurrentTab} />
        )}
        {currentTab === 'gear' && (
          <Club subTab="gear" setCurrentTab={setCurrentTab} />
        )}
        {currentTab === 'roster' && (
          <Roster players={players} matches={matches} seasons={seasons} />
        )}
        {currentTab === 'matches' && (
          <Matches matches={matches} players={players} seasons={seasons} />
        )}
        {currentTab === 'stats' && (
          <Stats matches={matches} players={players} />
        )}
        {currentTab === 'sync' && (
          <SheetsSync 
            sheetConfig={sheetConfig}
            updateSheetConfig={setSheetConfig}
            syncFromSheets={syncFromSheets}
            isSynced={isSynced}
            syncError={syncError}
            syncSuccessLog={syncSuccessLog}
            isSyncing={isSyncing}
            onResetToDefault={handleResetToDefault}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-club-border bg-club-secondary py-8 transition-colors duration-200" id="app-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-club-text-dim">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-jersey-red/60" />
            <span className="text-club-text-muted font-medium">TOASTY FC © 2026 - Est. 2022 -</span>
          </div>
          
          <div className="flex items-center space-x-1.5 text-club-text-dim">
            <span>Made with passion & fire</span>
            <Heart className="h-3 w-3 text-jersey-red/50 animate-pulse" />
          </div>

          <button
            onClick={() => setCurrentTab(currentTab === 'sync' ? 'home' : 'sync')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
              currentTab === 'sync'
                ? 'bg-jersey-red/10 border-jersey-red text-jersey-red font-bold'
                : 'bg-club-card border-club-border text-club-text-muted hover:text-club-text hover:border-club-border-strong hover:bg-club-card-hover shadow-xs'
            }`}
            title="Google Sheets Sync Settings"
            id="footer-sync-button"
          >
            <Database className="h-3.5 w-3.5 text-jersey-red/70" />
            <span>
              {isSynced 
                ? 'Google Sheets Connected' 
                : 'Local Sandbox Mode'}
            </span>
            {isSynced && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
