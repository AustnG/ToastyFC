import React, { useState, useEffect } from 'react';
import { Player, Match, NewsItem, GalleryItem, RosterEntry, MatchStats, Season } from './types';
import { Overview } from './components/Overview';
import { Roster } from './components/Roster';
import { Matches } from './components/Matches';
import { Stats } from './components/Stats';
import { NewsGallery } from './components/NewsGallery';
import { About } from './components/About';
import { GearSetup } from './components/GearSetup';
import { 
  Users, Calendar, BarChart3, BookOpen, Menu, X, Home, CalendarDays, Shield,
  RefreshCw, FileSpreadsheet, ExternalLink, LogOut, Database, CheckCircle2, AlertCircle,
  Info, Video
} from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/firebase';
import { sheetsService } from './lib/sheetsService';
import { dataService } from './lib/dataService';
import { parseLocalDate } from './lib/dateUtils';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Mobile sidebar menu toggler
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Club sub navigation dropdown state
  const [clubDropdownOpen, setClubDropdownOpen] = useState<boolean>(false);

  // Discord invitation link pending toast indicator
  const [showDiscordToast, setShowDiscordToast] = useState<boolean>(false);

  useEffect(() => {
    if (showDiscordToast) {
      const timer = setTimeout(() => setShowDiscordToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showDiscordToast]);

  // Core App states (hydrated from build-time static snapshot public/data/toasty-data.json)
  const [players, setPlayers] = useState<Player[]>(() => {
    const cached = localStorage.getItem('toasty_fc_players');
    return cached ? JSON.parse(cached) : [];
  });
  const [matches, setMatches] = useState<Match[]>(() => {
    const cached = localStorage.getItem('toasty_fc_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [news, setNews] = useState<NewsItem[]>(() => {
    const cached = localStorage.getItem('toasty_fc_news');
    return cached ? JSON.parse(cached) : [];
  });
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const cached = localStorage.getItem('toasty_fc_gallery');
    return cached ? JSON.parse(cached) : [];
  });
  const [roster, setRoster] = useState<RosterEntry[]>(() => {
    const cached = localStorage.getItem('toasty_fc_roster');
    return cached ? JSON.parse(cached) : [];
  });
  const [playerMatchStats, setPlayerMatchStats] = useState<MatchStats[]>(() => {
    const cached = localStorage.getItem('toasty_fc_player_match_stats');
    return cached ? JSON.parse(cached) : [];
  });
  const [seasonsList, setSeasonsList] = useState<Season[]>(() => {
    const cached = localStorage.getItem('toasty_fc_seasons');
    return cached ? JSON.parse(cached) : [];
  });
  const [dataGeneratedAt, setDataGeneratedAt] = useState<string | null>(null);

  // Google Sheets Sync & Auth state
  const DEFAULT_SPREADSHEET_ID = '1194eXv6isWkB-UYZejnki6I3J25FguxVMJZS26PgdeM';
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('toasty_fc_spreadsheet_id') || DEFAULT_SPREADSHEET_ID;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isNewSheetCreated, setIsNewSheetCreated] = useState<boolean>(false);
  const [showSyncPanel, setShowSyncPanel] = useState<boolean>(true);

  // Admin Mode state (hidden by default, unlocked via double-clicking crest in footer, URL parameter ?admin=true, or localStorage flag)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        localStorage.setItem('toasty_fc_admin_unlocked', 'true');
        return true;
      }
    } catch (e) {}
    return localStorage.getItem('toasty_fc_admin_unlocked') === 'true';
  });

  const handleToggleAdmin = () => {
    setIsAdminUnlocked(prev => {
      const next = !prev;
      if (next) {
        localStorage.setItem('toasty_fc_admin_unlocked', 'true');
      } else {
        localStorage.removeItem('toasty_fc_admin_unlocked');
      }
      return next;
    });
  };

  const showAdminControls = isAdminUnlocked || !!user;

  // Load build-time static JSON snapshot (Option B: private Sheets -> GitHub Actions -> static CDN)
  const loadPublicData = async (_sheetId?: string, bustCache = false) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const dbData = await dataService.fetchStaticSnapshot(bustCache);

      if (Array.isArray(dbData.players)) {
        setPlayers(dbData.players);
        localStorage.setItem('toasty_fc_players', JSON.stringify(dbData.players));
      }
      if (Array.isArray(dbData.matches)) {
        setMatches(dbData.matches);
        localStorage.setItem('toasty_fc_matches', JSON.stringify(dbData.matches));
      }
      if (Array.isArray(dbData.news)) {
        setNews(dbData.news);
        localStorage.setItem('toasty_fc_news', JSON.stringify(dbData.news));
      }
      if (Array.isArray(dbData.gallery)) {
        setGallery(dbData.gallery);
        localStorage.setItem('toasty_fc_gallery', JSON.stringify(dbData.gallery));
      }
      if (Array.isArray(dbData.roster)) {
        setRoster(dbData.roster);
        localStorage.setItem('toasty_fc_roster', JSON.stringify(dbData.roster));
      }
      if (Array.isArray(dbData.seasons)) {
        setSeasonsList(dbData.seasons);
        localStorage.setItem('toasty_fc_seasons', JSON.stringify(dbData.seasons));
      }
      if (Array.isArray(dbData.playerMatchStats)) {
        setPlayerMatchStats(dbData.playerMatchStats);
        localStorage.setItem('toasty_fc_player_match_stats', JSON.stringify(dbData.playerMatchStats));
      }
      if (dbData.generatedAt) {
        setDataGeneratedAt(dbData.generatedAt);
      }
    } catch (err: any) {
      console.warn('Static snapshot fetch failed (using local cache if available):', err);
      setSyncError(null);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to sync data from the Google Sheet
  const syncData = async (accessToken: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const dbInfo = await sheetsService.findOrCreateDatabase(accessToken);
      setSpreadsheetId(dbInfo.id);
      localStorage.setItem('toasty_fc_spreadsheet_id', dbInfo.id);
      setIsNewSheetCreated(dbInfo.isNew);

      const dbData = await sheetsService.fetchDatabaseData(dbInfo.id, accessToken);
      
      // Update states and local storage fallback cache
      if (dbData.players && dbData.players.length > 0) {
        setPlayers(dbData.players);
        localStorage.setItem('toasty_fc_players', JSON.stringify(dbData.players));
      }
      if (dbData.matches && dbData.matches.length > 0) {
        setMatches(dbData.matches);
        localStorage.setItem('toasty_fc_matches', JSON.stringify(dbData.matches));
      }
      if (dbData.news && dbData.news.length > 0) {
        setNews(dbData.news);
        localStorage.setItem('toasty_fc_news', JSON.stringify(dbData.news));
      }
      if (dbData.gallery && dbData.gallery.length > 0) {
        setGallery(dbData.gallery);
        localStorage.setItem('toasty_fc_gallery', JSON.stringify(dbData.gallery));
      }
      if (dbData.roster && dbData.roster.length > 0) {
        setRoster(dbData.roster);
        localStorage.setItem('toasty_fc_roster', JSON.stringify(dbData.roster));
      }
      if (dbData.seasons && dbData.seasons.length > 0) {
        setSeasonsList(dbData.seasons);
        localStorage.setItem('toasty_fc_seasons', JSON.stringify(dbData.seasons));
      }
      if (dbData.playerMatchStats && dbData.playerMatchStats.length > 0) {
        setPlayerMatchStats(dbData.playerMatchStats);
        localStorage.setItem('toasty_fc_player_match_stats', JSON.stringify(dbData.playerMatchStats));
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      const errMsg = String(err.message || err).toLowerCase();
      const isAuthError = errMsg.includes('401') || errMsg.includes('unauthenticated') || errMsg.includes('invalid credentials') || errMsg.includes('auth');
      
      if (isAuthError) {
        setSyncError('Your Google session has expired. Please sign in with Google again to reconnect your Google Drive.');
        try {
          await logout();
          setUser(null);
          setToken(null);
          setSpreadsheetId(DEFAULT_SPREADSHEET_ID);
          localStorage.setItem('toasty_fc_spreadsheet_id', DEFAULT_SPREADSHEET_ID);
          setIsNewSheetCreated(false);
          await loadPublicData(DEFAULT_SPREADSHEET_ID);
        } catch (logoutErr) {
          console.error('Logout during auth error cleanup failed:', logoutErr);
        }
      } else {
        setSyncError(err.message || 'Failed to sync with Google Sheets');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Initialize auth state listener on mount and load public data
  useEffect(() => {
    // Fetch latest live data from public spreadsheet right away on boot
    const targetId = localStorage.getItem('toasty_fc_spreadsheet_id') || DEFAULT_SPREADSHEET_ID;
    loadPublicData(targetId);

    const unsubscribe = initAuth(
      async (firebaseUser, cachedToken) => {
        setUser(firebaseUser);
        setToken(cachedToken);
        if (cachedToken) {
          syncData(cachedToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setSyncError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await syncData(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setSyncError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setSpreadsheetId(DEFAULT_SPREADSHEET_ID);
      localStorage.setItem('toasty_fc_spreadsheet_id', DEFAULT_SPREADSHEET_ID);
      setIsNewSheetCreated(false);
      await loadPublicData(DEFAULT_SPREADSHEET_ID);
    } catch (err: any) {
      console.error('Logout failed:', err);
    }
  };

  const handleManualRefresh = async () => {
    const activeToken = token || (await getAccessToken());
    if (activeToken) {
      await syncData(activeToken);
    } else {
      await loadPublicData(spreadsheetId || DEFAULT_SPREADSHEET_ID, true);
    }
  };

  // Helper to get chronological priority of a season (newer/later seasons get higher score)
  const getSeasonPriority = (seasonName: string): number => {
    const yearMatch = seasonName.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
    
    const s = seasonName.toLowerCase();
    let phasePriority = 0;
    if (s.includes('winter')) {
      phasePriority = 1;
    } else if (s.includes('spring')) {
      phasePriority = 2;
    } else if (s.includes('summer')) {
      phasePriority = 3;
    } else if (s.includes('fall') || s.includes('autumn')) {
      phasePriority = 4;
    }
    
    return year * 10 + phasePriority;
  };

  // Helper to sort seasons chronologically using startDate from Seasons sheet
  const sortSeasonsChronologically = (seasonsNames: string[]): string[] => {
    return [...seasonsNames].sort((a, b) => {
      // Find matching Season object for a and b from seasons sheet
      const sA = seasonsList.find(s => s.name === a || s.id === a);
      const sB = seasonsList.find(s => s.name === b || s.id === b);

      const parsedA = parseLocalDate(sA?.startDate);
      const parsedB = parseLocalDate(sB?.startDate);
      const dateA = parsedA ? parsedA.getTime() : 0;
      const dateB = parsedB ? parsedB.getTime() : 0;

      if (dateA > 0 && dateB > 0 && dateA !== dateB) {
        return dateB - dateA; // Newest season startDate first
      }

      const parsedEndA = parseLocalDate(sA?.endDate);
      const parsedEndB = parseLocalDate(sB?.endDate);
      const endA = parsedEndA ? parsedEndA.getTime() : 0;
      const endB = parsedEndB ? parsedEndB.getTime() : 0;
      if (endA > 0 && endB > 0 && endA !== endB) {
        return endB - endA;
      }

      return getSeasonPriority(b) - getSeasonPriority(a);
    });
  };

  // Helper to dynamically get unique seasons from both matches, roster entries, and Seasons sheet
  const getDynamicSeasonsList = (): string[] => {
    const sheetSeasonNames = seasonsList.map(s => s.name).filter(Boolean);
    const matchesSeasonNames = matches.map(m => m.seasonName || m.season).filter(Boolean) as string[];
    const rosterSeasonNames = roster.map(r => r.seasonName || r.season).filter(Boolean) as string[];

    const allSeasons = Array.from(new Set([
      ...sheetSeasonNames,
      ...matchesSeasonNames,
      ...rosterSeasonNames
    ]));
    return sortSeasonsChronologically(allSeasons);
  };

  // Dynamically compute seasons list from matches and roster data so it scales automatically!
  const seasons = [
    ...getDynamicSeasonsList(),
    'All Seasons'
  ];

  // Active Season Filter
  const [activeSeason, setActiveSeason] = useState<string>(() => {
    // Default to the newest season found dynamically, or 'All Seasons'
    const dynamicSeasons = getDynamicSeasonsList();
    return dynamicSeasons[0] || 'All Seasons';
  });

  // Keep active season in sync if matches or roster change and current active season is no longer available
  useEffect(() => {
    const dynamicSeasons = getDynamicSeasonsList();
    if (dynamicSeasons.length > 0 && !dynamicSeasons.includes(activeSeason) && activeSeason !== 'All Seasons') {
      setActiveSeason(dynamicSeasons[0]);
    }
  }, [matches, roster, seasonsList]);

  const activeSeasonObj = seasonsList.find(s => s.name === activeSeason || s.id === activeSeason);

  const matchBelongsToActiveSeason = (m: Match) => {
    if (activeSeason === 'All Seasons') return true;
    if (m.seasonName && m.seasonName === activeSeason) return true;
    if (m.season && m.season === activeSeason) return true;
    if (activeSeasonObj && m.seasonId && m.seasonId === activeSeasonObj.id) return true;
    return false;
  };

  const rosterBelongsToActiveSeason = (r: RosterEntry) => {
    if (activeSeason === 'All Seasons') return true;
    if (r.seasonName && r.seasonName === activeSeason) return true;
    if (r.season && r.season === activeSeason) return true;
    if (activeSeasonObj && r.seasonId && r.seasonId === activeSeasonObj.id) return true;
    return false;
  };

  // Filter matches based on selected season
  const filteredMatchesBySeason = activeSeason === 'All Seasons'
    ? matches
    : matches.filter(matchBelongsToActiveSeason);

  // Compute player stats based on matches for that season to show dynamic leaderboards
  const filteredPlayersBySeason = activeSeason === 'All Seasons'
    ? players.map(p => {
        // Resolve roster-specific properties dynamically from their latest roster record
        const playerRoster = roster.filter(r => r.playerId === p.id);
        const rosterEntry = playerRoster[playerRoster.length - 1];
        const resolvedNumber = rosterEntry ? rosterEntry.number : p.number;
        const resolvedImageUrl = rosterEntry ? rosterEntry.imageUrl : p.imageUrl;
        const resolvedPosition = rosterEntry ? rosterEntry.position : p.position;
        const resolvedIsCaptain = rosterEntry && rosterEntry.isCaptain !== undefined
          ? (rosterEntry.isCaptain === true || String(rosterEntry.isCaptain).toLowerCase() === 'true')
          : p.isCaptain;

        const completedMatches = matches.filter(m => m.status === 'Completed');
        
        // Find match stats entered for this player in these completed matches
        const playerStatsList = playerMatchStats.filter(pms => 
          pms.playerId === p.id && 
          pms.present !== false && 
          completedMatches.some(m => m.id === pms.matchId)
        );

        let goals = 0;
        let assists = 0;
        let shots = 0;
        let shotsOnTarget = 0;
        let blocks = 0;
        let plusMinus = 0;
        let fouls = 0;
        let yellows = 0;
        let reds = 0;
        let potm = 0;
        let cleanSheets = 0;
        let saves = resolvedPosition === 'Goalkeeper' ? 0 : undefined;
        let goalsAllowed = resolvedPosition === 'Goalkeeper' ? 0 : undefined;
        let matchesPlayed = 0;

        if (playerStatsList.length > 0) {
          goals = playerStatsList.reduce((sum, s) => sum + Number(s.goals || 0), 0);
          assists = playerStatsList.reduce((sum, s) => sum + Number(s.assists || 0), 0);
          shots = playerStatsList.reduce((sum, s) => sum + Number(s.shotsOffTarget ?? s.shots ?? 0), 0);
          shotsOnTarget = playerStatsList.reduce((sum, s) => sum + Number(s.shotsOnTarget || 0), 0);
          blocks = playerStatsList.reduce((sum, s) => sum + Number(s.blocks || 0), 0);
          plusMinus = playerStatsList.reduce((sum, s) => sum + Number(s.plusMinus || 0), 0);
          fouls = playerStatsList.reduce((sum, s) => sum + Number(s.fouls || 0), 0);
          yellows = playerStatsList.reduce((sum, s) => sum + Number(s.yellows || 0), 0);
          reds = playerStatsList.reduce((sum, s) => sum + Number(s.reds || 0), 0);
          potm = playerStatsList.filter(s => s.potm === true || String(s.potm).toLowerCase() === 'true').length;
          cleanSheets = playerStatsList.filter(s => s.cleanSheet === true || String(s.cleanSheet).toLowerCase() === 'true').length;
          matchesPlayed = playerStatsList.length;
          if (resolvedPosition === 'Goalkeeper') {
            saves = playerStatsList.reduce((sum, s) => sum + Number(s.saves || 0), 0);
            goalsAllowed = playerStatsList.reduce((sum, s) => sum + Number(s.goalsAllowed || 0), 0);
          }
        } else {
          // No MatchStats rows yet for this player (e.g., unfilmed or upcoming season)
          potm = completedMatches.filter(m => m.playerOfTheMatch === p.name).length;
        }

        return {
          ...p,
          number: resolvedNumber,
          imageUrl: resolvedImageUrl,
          position: resolvedPosition,
          isCaptain: resolvedIsCaptain,
          seasons: playerRoster.map(r => r.seasonName || r.season || ''),
          goals,
          assists,
          matchesPlayed,
          cleanSheets,
          saves,
          goalsAllowed,
          plusMinus,
          fouls,
          yellows,
          reds,
          potm,
          shots,
          shotsOffTarget: shots,
          shotsOnTarget,
          totalShots: shots + shotsOnTarget,
          blocks
        };
      })
    : players
        .filter(p => roster.some(r => r.playerId === p.id && rosterBelongsToActiveSeason(r)))
        .map(p => {
          const playerRoster = roster.filter(r => r.playerId === p.id);
          // Resolve Roster Seasonal Attributes (number, imageUrl, position, isCaptain)
          const rosterEntry = roster.find(r => r.playerId === p.id && rosterBelongsToActiveSeason(r));
          const seasonalNumber = rosterEntry ? rosterEntry.number : p.number;
          const seasonalImageUrl = rosterEntry ? rosterEntry.imageUrl : p.imageUrl;
          const seasonalPosition = rosterEntry ? rosterEntry.position : p.position;
          const seasonalIsCaptain = rosterEntry && rosterEntry.isCaptain !== undefined
            ? (rosterEntry.isCaptain === true || String(rosterEntry.isCaptain).toLowerCase() === 'true')
            : p.isCaptain;

          const completedMatches = matches.filter(m => matchBelongsToActiveSeason(m) && m.status === 'Completed');
          
          // Find match stats entered for this player in this season's completed matches
          const playerStatsList = playerMatchStats.filter(pms => 
            pms.playerId === p.id && 
            pms.present !== false && 
            completedMatches.some(m => m.id === pms.matchId)
          );

          let goals = 0;
          let assists = 0;
          let shots = 0;
          let shotsOnTarget = 0;
          let blocks = 0;
          let plusMinus = 0;
          let fouls = 0;
          let yellows = 0;
          let reds = 0;
          let potm = 0;
          let cleanSheets = 0;
          let saves = seasonalPosition === 'Goalkeeper' ? 0 : undefined;
          let goalsAllowed = seasonalPosition === 'Goalkeeper' ? 0 : undefined;
          let matchesPlayed = 0;

          if (playerStatsList.length > 0) {
            goals = playerStatsList.reduce((sum, s) => sum + Number(s.goals || 0), 0);
            assists = playerStatsList.reduce((sum, s) => sum + Number(s.assists || 0), 0);
            shots = playerStatsList.reduce((sum, s) => sum + Number(s.shotsOffTarget ?? s.shots ?? 0), 0);
            shotsOnTarget = playerStatsList.reduce((sum, s) => sum + Number(s.shotsOnTarget || 0), 0);
            blocks = playerStatsList.reduce((sum, s) => sum + Number(s.blocks || 0), 0);
            plusMinus = playerStatsList.reduce((sum, s) => sum + Number(s.plusMinus || 0), 0);
            fouls = playerStatsList.reduce((sum, s) => sum + Number(s.fouls || 0), 0);
            yellows = playerStatsList.reduce((sum, s) => sum + Number(s.yellows || 0), 0);
            reds = playerStatsList.reduce((sum, s) => sum + Number(s.reds || 0), 0);
            potm = playerStatsList.filter(s => s.potm === true || String(s.potm).toLowerCase() === 'true').length;
            cleanSheets = playerStatsList.filter(s => s.cleanSheet === true || String(s.cleanSheet).toLowerCase() === 'true').length;
            matchesPlayed = playerStatsList.length;
            if (seasonalPosition === 'Goalkeeper') {
              saves = playerStatsList.reduce((sum, s) => sum + Number(s.saves || 0), 0);
              goalsAllowed = playerStatsList.reduce((sum, s) => sum + Number(s.goalsAllowed || 0), 0);
            }
          } else {
            // No MatchStats rows yet for this player in this season
            potm = completedMatches.filter(m => m.playerOfTheMatch === p.name).length;
          }

          return {
            ...p,
            number: seasonalNumber,
            imageUrl: seasonalImageUrl,
            position: seasonalPosition,
            isCaptain: seasonalIsCaptain,
            seasons: playerRoster.map(r => r.seasonName || r.season || ''),
            goals,
            assists,
            matchesPlayed,
            cleanSheets,
            saves,
            goalsAllowed,
            plusMinus,
            fouls,
            yellows,
            reds,
            potm,
            shots,
            shotsOffTarget: shots,
            shotsOnTarget,
            totalShots: shots + shotsOnTarget,
            blocks
          };
        });

  interface NavSubItem {
    id: string;
    label: string;
    icon: React.ElementType;
  }

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    isDropdown?: boolean;
    subItems?: NavSubItem[];
  }

  // Keep navigation scannable
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'roster', label: 'Roster', icon: Users },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { 
      id: 'club-dropdown', 
      label: 'Club', 
      icon: Shield,
      isDropdown: true,
      subItems: [
        { id: 'about', label: 'About', icon: Info },
        { id: 'gear', label: 'Gear & Setup', icon: Video }
      ]
    },
    { id: 'news', label: 'News & Gallery', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-toasty-canvas text-[#111113] flex flex-col font-sans overflow-x-hidden">
      
      {/* Top Bar Contract: 3-Zone Obsidian Matchday Header */}
      <header className="sticky top-0 z-40 bg-toasty-obsidian text-white border-b border-toasty-obsidian-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-toasty-tan rounded"
          >
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
              alt="Toasty FC Crest" 
              className="w-8 h-8 object-contain rounded-md transition-transform duration-150 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <span className="font-display font-extrabold text-xl tracking-wide uppercase text-white whitespace-nowrap shrink-0">
              Toasty FC
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Text Navigation */}
          <nav className="hidden lg:flex items-center gap-7 h-full" aria-label="Primary">
            {navItems.map(item => {
              if (item.isDropdown && item.subItems) {
                const isClubActive = activeTab === 'about' || activeTab === 'gear';
                return (
                  <div 
                    key={item.id} 
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setClubDropdownOpen(true)}
                    onMouseLeave={() => setClubDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setClubDropdownOpen(prev => !prev)}
                      className={`h-full inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 cursor-pointer ${
                        isClubActive 
                          ? 'text-white border-toasty-red' 
                          : 'text-neutral-300 border-transparent hover:text-white'
                      }`}
                      id="nav-btn-club-dropdown"
                    >
                      {item.label}
                      <svg className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${clubDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Editorial Dropdown Menu */}
                    <div className={`absolute left-0 top-full w-48 bg-toasty-obsidian-card border border-toasty-obsidian-border rounded-b-lg shadow-xl overflow-hidden z-50 transition-all duration-150 ${
                      clubDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
                    }`}>
                      <div className="py-1.5 divide-y divide-toasty-obsidian-border/60">
                        {item.subItems.map(subItem => {
                          const isSubActive = activeTab === subItem.id;
                          return (
                            <button
                              type="button"
                              key={subItem.id}
                              onClick={() => {
                                setActiveTab(subItem.id);
                                setClubDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer flex items-center justify-between ${
                                isSubActive 
                                  ? 'text-white bg-toasty-red/20 font-semibold' 
                                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span>{subItem.label}</span>
                              {isSubActive && <span className="w-1.5 h-1.5 bg-toasty-red rounded-xs" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`h-full inline-flex items-center text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 cursor-pointer ${
                    isActive 
                      ? 'text-white border-toasty-red' 
                      : 'text-neutral-300 border-transparent hover:text-white'
                  }`}
                  id={`nav-btn-${item.id}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Compact Club Channels & Mobile Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-1">
              <a
                href="https://youtube.com/@toastyfc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors duration-150 flex items-center justify-center"
                title="YouTube: @toastyfc"
                aria-label="YouTube"
                id="header-social-youtube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/toasty.fc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors duration-150 flex items-center justify-center"
                title="Instagram: @toasty.fc"
                aria-label="Instagram"
                id="header-social-instagram"
              >
                <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>
                </svg>
              </a>
              <button
                type="button"
                onClick={() => setShowDiscordToast(true)}
                className="w-9 h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors duration-150 flex items-center justify-center cursor-pointer"
                title="Discord Community"
                aria-label="Discord"
                id="header-social-discord"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                </svg>
              </button>
            </div>

            {/* Mobile Menu Toggler */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-30 bg-toasty-obsidian text-white flex flex-col justify-between p-6 overflow-y-auto">
          <div className="divide-y divide-toasty-obsidian-border">
            {navItems.map(item => {
              if (item.isDropdown && item.subItems) {
                return (
                  <div key={item.id} className="py-3 space-y-1">
                    <span className="block text-xs font-mono text-neutral-500 uppercase tracking-wider px-2 pb-1">
                      {item.label}
                    </span>
                    <div className="flex flex-col">
                      {item.subItems.map(subItem => {
                        const isSubActive = activeTab === subItem.id;
                        return (
                          <button
                            type="button"
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab(subItem.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-3 text-base font-semibold transition-colors cursor-pointer flex items-center justify-between rounded-lg ${
                              isSubActive 
                                ? 'text-white bg-toasty-red' 
                                : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-3.5 text-lg font-display font-bold tracking-wide uppercase transition-colors cursor-pointer flex items-center justify-between ${
                    isActive 
                      ? 'text-toasty-tan' 
                      : 'text-neutral-200 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-2 h-2 bg-toasty-red rounded-xs" />}
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-toasty-obsidian-border flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase tracking-wider">Follow Club</span>
            <div className="flex items-center gap-4">
              <a href="https://youtube.com/@toastyfc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-semibold">
                YouTube
              </a>
              <a href="https://instagram.com/toasty.fc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-semibold">
                Instagram
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowDiscordToast(true);
                }}
                className="hover:text-white transition-colors font-semibold cursor-pointer"
              >
                Discord
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <Overview 
              players={filteredPlayersBySeason} 
              matches={filteredMatchesBySeason} 
              news={news} 
              activeSeason={activeSeason}
              onSelectTab={(tab) => setActiveTab(tab)} 
            />
          )}
          {activeTab === 'roster' && (
            <Roster 
              players={filteredPlayersBySeason} 
              seasons={seasons} 
              activeSeason={activeSeason} 
              onSeasonChange={setActiveSeason} 
              playerMatchStats={playerMatchStats}
              matches={matches}
            />
          )}
          {activeTab === 'matches' && (
            <Matches 
              matches={filteredMatchesBySeason} 
              seasons={seasons} 
              seasonsList={seasonsList}
              activeSeason={activeSeason} 
              onSeasonChange={setActiveSeason} 
              playerMatchStats={playerMatchStats}
              onSavePlayerMatchStats={(updatedStats) => {
                setPlayerMatchStats(updatedStats);
                localStorage.setItem('toasty_fc_player_match_stats', JSON.stringify(updatedStats));
                if (token) {
                  sheetsService.saveDatabaseData(spreadsheetId, token, 'playerMatchStats', updatedStats);
                }
              }}
              players={players}
              isAdmin={showAdminControls}
            />
          )}
          {activeTab === 'stats' && (
            <Stats 
              players={filteredPlayersBySeason} 
              seasons={seasons} 
              seasonsList={seasonsList}
              activeSeason={activeSeason} 
              onSeasonChange={setActiveSeason}
              matches={filteredMatchesBySeason}
              allMatches={matches}
              allPlayers={players}
              playerMatchStats={playerMatchStats}
              roster={roster}
            />
          )}
          {activeTab === 'news' && (
            <NewsGallery news={news} gallery={gallery} />
          )}
          {activeTab === 'about' && (
            <About />
          )}
          {activeTab === 'gear' && (
            <GearSetup />
          )}
        </div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-toasty-obsidian text-neutral-400 py-8 border-t border-toasty-obsidian-border mt-auto" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand & Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <img 
                  onDoubleClick={handleToggleAdmin}
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                  alt="Toasty FC Crest" 
                  className="w-7 h-7 object-contain rounded select-none cursor-pointer transition-transform duration-150 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="font-display font-bold text-base text-white tracking-wide uppercase">
                  Toasty FC
                </span>
              </div>
              <span className="hidden sm:inline text-neutral-700" aria-hidden="true">·</span>
              <span className="text-xs text-neutral-400">
                Bowling Green, KY · Est. 2022
              </span>
              <span className="hidden sm:inline text-neutral-700" aria-hidden="true">·</span>
              <p className="text-xs text-neutral-500">
                © {new Date().getFullYear()} Toasty FC
              </p>
              {dataGeneratedAt && (
                <>
                  <span className="hidden sm:inline text-neutral-700" aria-hidden="true">·</span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    Synced {new Date(dataGeneratedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </>
              )}
            </div>

            {/* Links & Admin Controls */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
              <a
                href="https://youtube.com/@toastyfc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors font-medium"
              >
                YouTube
              </a>
              <a
                href="https://instagram.com/toasty.fc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors font-medium"
              >
                Instagram
              </a>
              <button
                type="button"
                onClick={() => setShowDiscordToast(true)}
                className="text-neutral-400 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Discord
              </button>

              {showAdminControls && (
                <div className="flex items-center gap-3 pl-4 border-l border-toasty-obsidian-border">
                  {spreadsheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 font-mono"
                      title="Google Sheet Database"
                    >
                      <FileSpreadsheet size={12} className="text-toasty-tan" />
                      <span>{user ? 'Spreadsheet' : 'View DB'}</span>
                    </a>
                  )}
                  {user ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                      className="text-neutral-300 hover:text-toasty-tan transition-colors cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <Database size={12} />
                      <span>{isLoggingIn ? 'Signing in...' : 'Admin'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isSyncing}
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    title="Refresh data from Google Sheets"
                    aria-label="Refresh database"
                  >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin text-toasty-tan' : ''} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {syncError && (
            <div className="mt-4 pt-3 border-t border-toasty-obsidian-border text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{syncError}</span>
            </div>
          )}
        </div>
      </footer>

      {showDiscordToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-toasty-obsidian-card border border-toasty-obsidian-border text-white rounded-lg px-5 py-4 shadow-xl flex items-center justify-between gap-4 max-w-sm animate-fade-in">
          <div>
            <p className="font-semibold text-sm text-white">Discord Community</p>
            <p className="text-xs text-neutral-400 mt-0.5">Invite link is coming soon. Stay tuned!</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDiscordToast(false)}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
