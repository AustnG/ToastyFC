import React, { useState, useEffect } from 'react';
import { Player, Match, NewsItem, GalleryItem, RosterEntry, MatchStats } from './types';
import { mockPlayers, mockMatches, mockNews, mockGallery, mockRoster, mockMatchStats } from './mockData';
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

  // Core App states populated with default mock data, caching fallback for persistence
  const [players, setPlayers] = useState<Player[]>(() => {
    const cached = localStorage.getItem('toasty_fc_players');
    return cached ? JSON.parse(cached) : mockPlayers;
  });
  const [matches, setMatches] = useState<Match[]>(() => {
    const cached = localStorage.getItem('toasty_fc_matches');
    return cached ? JSON.parse(cached) : mockMatches;
  });
  const [news, setNews] = useState<NewsItem[]>(() => {
    const cached = localStorage.getItem('toasty_fc_news');
    return cached ? JSON.parse(cached) : mockNews;
  });
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const cached = localStorage.getItem('toasty_fc_gallery');
    return cached ? JSON.parse(cached) : mockGallery;
  });
  const [roster, setRoster] = useState<RosterEntry[]>(() => {
    const cached = localStorage.getItem('toasty_fc_roster');
    return cached ? JSON.parse(cached) : mockRoster;
  });
  const [playerMatchStats, setPlayerMatchStats] = useState<MatchStats[]>(() => {
    const cached = localStorage.getItem('toasty_fc_player_match_stats');
    return cached ? JSON.parse(cached) : mockMatchStats;
  });

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

  // Admin Mode state (hidden by default, unlocked via double-clicking soccer emoji in footer, URL parameter ?admin=true, or localStorage flag)
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

  // Helper to fetch public data without authentication
  const loadPublicData = async (sheetId: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const dbData = await sheetsService.fetchPublicDatabaseData(sheetId);
      
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
      if (dbData.playerMatchStats && dbData.playerMatchStats.length > 0) {
        setPlayerMatchStats(dbData.playerMatchStats);
        localStorage.setItem('toasty_fc_player_match_stats', JSON.stringify(dbData.playerMatchStats));
      }
    } catch (err: any) {
      console.warn('Public fetch failed (using local cached/mock data instead):', err);
      // Fallback is already loaded in useState initializers, so keep syncError null to avoid disruptive warning badges
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
      // Allow guests/anonymous users to pull down the latest public live updates!
      await loadPublicData(spreadsheetId || DEFAULT_SPREADSHEET_ID);
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

  const sortSeasonsChronologically = (seasonsList: string[]): string[] => {
    return [...seasonsList].sort((a, b) => getSeasonPriority(b) - getSeasonPriority(a));
  };

  // Helper to dynamically get unique seasons from both matches and roster entries
  const getDynamicSeasonsList = (): string[] => {
    const allSeasons = [
      ...matches.map(m => m.season),
      ...roster.map(r => r.season)
    ].filter(Boolean) as string[];
    return sortSeasonsChronologically(Array.from(new Set(allSeasons)));
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
  }, [matches, roster]);

  // Filter matches based on selected season
  const filteredMatchesBySeason = activeSeason === 'All Seasons'
    ? matches
    : matches.filter(m => m.season === activeSeason);

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
          shots = playerStatsList.reduce((sum, s) => sum + Number(s.shots || 0), 0);
          shotsOnTarget = playerStatsList.reduce((sum, s) => sum + Number(s.shotsOnTarget || 0), 0);
          blocks = playerStatsList.reduce((sum, s) => sum + Number(s.blocks || 0), 0);
          plusMinus = playerStatsList.reduce((sum, s) => sum + Number(s.plusMinus || 0), 0);
          fouls = playerStatsList.reduce((sum, s) => sum + Number(s.fouls || 0), 0);
          yellows = playerStatsList.reduce((sum, s) => sum + Number(s.yellows || 0), 0);
          reds = playerStatsList.reduce((sum, s) => sum + Number(s.reds || 0), 0);
          potm = playerStatsList.filter(s => s.potm === true || s.potm === 'true').length;
          cleanSheets = playerStatsList.filter(s => s.cleanSheet === true || s.cleanSheet === 'true').length;
          matchesPlayed = playerStatsList.length;
          if (resolvedPosition === 'Goalkeeper') {
            saves = playerStatsList.reduce((sum, s) => sum + Number(s.saves || 0), 0);
            goalsAllowed = playerStatsList.reduce((sum, s) => sum + Number(s.goalsAllowed || 0), 0);
          }
        } else {
          // Fallback to legacy arrays
          goals = completedMatches.reduce((sum, m) => {
            const count = m.goalsScoredBy?.filter(name => name === p.name).length ?? 0;
            return sum + count;
          }, 0);

          assists = completedMatches.reduce((sum, m) => {
            const count = m.assistsBy?.filter(name => name === p.name).length ?? 0;
            return sum + count;
          }, 0);

          matchesPlayed = completedMatches.length || (p.name === 'Marcus Vance' ? 0 : 1);

          if (resolvedPosition === 'Goalkeeper') {
            cleanSheets = completedMatches.filter(m => (m.opponentScore ?? 0) === 0).length;
            saves = completedMatches.reduce((sum, m) => sum + (m.stats?.saves.toasty ?? 4), 0);
            goalsAllowed = completedMatches.reduce((sum, m) => sum + (m.opponentScore ?? 0), 0);
          }
          plusMinus = goals * 3 + assists * 2 - (resolvedPosition === 'Defender' ? 1 : 3);
          fouls = Math.round((p.skills?.physical ?? 50) * 0.15 + (resolvedPosition === 'Defender' ? 5 : resolvedPosition === 'Midfielder' ? 3 : 1));
          yellows = Math.max(0, Math.floor(fouls / 4));
          reds = 0;
          potm = completedMatches.filter(m => m.playerOfTheMatch === p.name).length;
        }

        return {
          ...p,
          number: resolvedNumber,
          imageUrl: resolvedImageUrl,
          position: resolvedPosition,
          isCaptain: resolvedIsCaptain,
          seasons: playerRoster.map(r => r.season),
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
          shotsOnTarget,
          blocks
        };
      })
    : players
        .filter(p => roster.some(r => r.playerId === p.id && r.season === activeSeason))
        .map(p => {
          const playerRoster = roster.filter(r => r.playerId === p.id);
          // Resolve Roster Seasonal Attributes (number, imageUrl, position, isCaptain)
          const rosterEntry = roster.find(r => r.playerId === p.id && r.season === activeSeason);
          const seasonalNumber = rosterEntry ? rosterEntry.number : p.number;
          const seasonalImageUrl = rosterEntry ? rosterEntry.imageUrl : p.imageUrl;
          const seasonalPosition = rosterEntry ? rosterEntry.position : p.position;
          const seasonalIsCaptain = rosterEntry && rosterEntry.isCaptain !== undefined
            ? (rosterEntry.isCaptain === true || String(rosterEntry.isCaptain).toLowerCase() === 'true')
            : p.isCaptain;

          const completedMatches = matches.filter(m => m.season === activeSeason && m.status === 'Completed');
          
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
            shots = playerStatsList.reduce((sum, s) => sum + Number(s.shots || 0), 0);
            shotsOnTarget = playerStatsList.reduce((sum, s) => sum + Number(s.shotsOnTarget || 0), 0);
            blocks = playerStatsList.reduce((sum, s) => sum + Number(s.blocks || 0), 0);
            plusMinus = playerStatsList.reduce((sum, s) => sum + Number(s.plusMinus || 0), 0);
            fouls = playerStatsList.reduce((sum, s) => sum + Number(s.fouls || 0), 0);
            yellows = playerStatsList.reduce((sum, s) => sum + Number(s.yellows || 0), 0);
            reds = playerStatsList.reduce((sum, s) => sum + Number(s.reds || 0), 0);
            potm = playerStatsList.filter(s => s.potm === true || s.potm === 'true').length;
            cleanSheets = playerStatsList.filter(s => s.cleanSheet === true || s.cleanSheet === 'true').length;
            matchesPlayed = playerStatsList.length;
            if (seasonalPosition === 'Goalkeeper') {
              saves = playerStatsList.reduce((sum, s) => sum + Number(s.saves || 0), 0);
              goalsAllowed = playerStatsList.reduce((sum, s) => sum + Number(s.goalsAllowed || 0), 0);
            }
          } else {
            // Fallback to legacy arrays
            goals = completedMatches.reduce((sum, m) => {
              const count = m.goalsScoredBy?.filter(name => name === p.name).length ?? 0;
              return sum + count;
            }, 0);

            assists = completedMatches.reduce((sum, m) => {
              const count = m.assistsBy?.filter(name => name === p.name).length ?? 0;
              return sum + count;
            }, 0);

            matchesPlayed = completedMatches.length || (p.name === 'Marcus Vance' && activeSeason === '2026 Spring' ? 0 : 1);

            if (seasonalPosition === 'Goalkeeper') {
              cleanSheets = completedMatches.filter(m => (m.opponentScore ?? 0) === 0).length;
              saves = completedMatches.reduce((sum, m) => sum + (m.stats?.saves.toasty ?? 4), 0);
              goalsAllowed = completedMatches.reduce((sum, m) => sum + (m.opponentScore ?? 0), 0);
            }
            plusMinus = goals * 3 + assists * 2 - (seasonalPosition === 'Defender' ? 1 : 3);
            fouls = Math.round((p.skills?.physical ?? 50) * 0.15 + (seasonalPosition === 'Defender' ? 5 : seasonalPosition === 'Midfielder' ? 3 : 1));
            yellows = Math.max(0, Math.floor(fouls / 4));
            reds = 0;
            potm = completedMatches.filter(m => m.playerOfTheMatch === p.name).length;
          }

          return {
            ...p,
            number: seasonalNumber,
            imageUrl: seasonalImageUrl,
            position: seasonalPosition,
            isCaptain: seasonalIsCaptain,
            seasons: playerRoster.map(r => r.season),
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
            shotsOnTarget,
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      
      {/* Top Banner Header */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
              alt="Toasty FC Official Crest" 
              className="w-9 h-9 object-contain rounded-xl shadow-md shadow-red-900/20 border border-toasty-tan/30 hover:scale-105 transition-transform duration-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-display font-black text-sm sm:text-base tracking-wider leading-none text-toasty-tan">TOASTY FC</h1>
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none font-bold block mt-1">Est. 2022</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              if (item.isDropdown && item.subItems) {
                const isClubActive = activeTab === 'about' || activeTab === 'gear';
                return (
                  <div 
                    key={item.id} 
                    className="relative group"
                    onMouseEnter={() => setClubDropdownOpen(true)}
                    onMouseLeave={() => setClubDropdownOpen(false)}
                  >
                    <button
                      className={`px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-display font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        isClubActive 
                          ? 'bg-toasty-red text-white shadow-md shadow-red-950/40 border border-red-500/30' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                      id="nav-btn-club-dropdown"
                    >
                      <item.icon size={13} className="shrink-0" />
                      {item.label}
                      <svg className={`w-3 h-3 transition-transform ${clubDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute left-0 mt-1 w-48 rounded-xl bg-slate-950 border border-slate-900 shadow-xl overflow-hidden z-50 transition-all duration-150 ${
                      clubDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
                    }`}>
                      <div className="p-1.5 space-y-1">
                        {item.subItems.map(subItem => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeTab === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setActiveTab(subItem.id);
                                setClubDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-[10px] sm:text-[11px] font-display font-extrabold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                                isSubActive 
                                  ? 'bg-toasty-red text-white font-black' 
                                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
                              }`}
                            >
                              <SubIcon size={12} className="shrink-0 text-toasty-tan" />
                              {subItem.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-display font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-toasty-red text-white shadow-md shadow-red-950/40 border border-red-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                  id={`nav-btn-${item.id}`}
                >
                  <Icon size={13} className="shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Social Links */}
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-4 shrink-0">
            <a
              href="https://youtube.com/@toastyfc"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-red-500 hover:border-red-500/30 hover:bg-slate-900 transition flex items-center justify-center shadow-sm"
              title="YouTube: @toastyfc"
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
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-pink-500 hover:border-pink-500/30 hover:bg-slate-900 transition flex items-center justify-center shadow-sm"
              title="Instagram: @toasty.fc"
              id="header-social-instagram"
            >
              <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>
              </svg>
            </a>
            <button
              onClick={() => setShowDiscordToast(true)}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-slate-900 transition flex items-center justify-center shadow-sm cursor-pointer"
              title="Discord Community (Soon!)"
              id="header-social-discord"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
              </svg>
            </button>
          </div>

            {/* Mobile Menu Toggler */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white transition shrink-0"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </header>

      {/* Mobile navigation sliding drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-30 bg-slate-950/95 backdrop-blur-md text-white flex flex-col justify-between p-6 transition duration-200">
          <div className="space-y-4">
            <span className="block text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Navigation</span>
            <div className="flex flex-col gap-2">
              {navItems.map(item => {
                if (item.isDropdown && item.subItems) {
                  return (
                    <div key={item.id} className="space-y-1 py-1">
                      <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-4 mb-1">
                        {item.label}
                      </span>
                      <div className="flex flex-col gap-1 pl-3 border-l border-slate-800">
                        {item.subItems.map(subItem => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeTab === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setActiveTab(subItem.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-3 transition ${
                                isSubActive 
                                  ? 'bg-toasty-red text-white font-black shadow-md shadow-red-950/40 border border-red-500/30' 
                                  : 'hover:bg-slate-900 text-slate-300'
                              }`}
                            >
                              <SubIcon size={14} className="text-toasty-tan" />
                              {subItem.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center gap-3 transition ${
                      isActive 
                        ? 'bg-toasty-red text-white font-black shadow-md shadow-red-950/40 border border-red-500/30' 
                        : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-900 pt-6">
            <span className="block text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Follow Toasty FC</span>
            <div className="grid grid-cols-3 gap-3">
              <a 
                href="https://youtube.com/@toastyfc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/45 hover:bg-slate-900/60 text-center transition"
              >
                <div className="text-red-500">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-300">YouTube</span>
              </a>

              <a 
                href="https://instagram.com/toasty.fc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/45 hover:bg-slate-900/60 text-center transition"
              >
                <div className="text-pink-500">
                  <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-300">Instagram</span>
              </a>

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowDiscordToast(true);
                }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/45 hover:bg-slate-900/60 text-center cursor-pointer transition"
              >
                <div className="text-indigo-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-300">Discord</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Main Body Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="fade-in duration-300">
          {activeTab === 'overview' && (
            <Overview 
              players={filteredPlayersBySeason} 
              matches={filteredMatchesBySeason} 
              news={news} 
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
              activeSeason={activeSeason} 
              onSeasonChange={setActiveSeason}
              matches={filteredMatchesBySeason}
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
      </main>      {/* Footer Branding section */}
      <footer className="bg-slate-950 text-slate-400 py-6 border-t border-slate-900 mt-auto" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            {/* Brand Info & Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2.5">
                <img 
                  onDoubleClick={handleToggleAdmin}
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                  alt="Toasty FC Crest" 
                  className="w-7 h-7 object-contain rounded-lg shadow-sm select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <h4 className="font-display font-black text-[11px] text-white tracking-wider uppercase leading-none">TOASTY FC</h4>
                  <p className="text-[8px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest font-bold">EST. 2022</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 sm:border-l sm:border-slate-800 sm:pl-4">
                © {new Date().getFullYear()} Toasty FC. All rights reserved.
              </p>
            </div>

            {/* Socials & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Socials */}
              <div className="flex items-center gap-2">
                <a 
                  href="https://youtube.com/@toastyfc" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-450 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 transition duration-150"
                  title="YouTube Channel"
                  aria-label="YouTube"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/toasty.fc" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-450 hover:text-pink-500 hover:border-pink-500/20 hover:bg-pink-500/5 transition duration-150"
                  title="Instagram Profile"
                  aria-label="Instagram"
                >
                  <svg className="w-3 h-3 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>
                  </svg>
                </a>
                <button 
                  onClick={() => setShowDiscordToast(true)}
                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-450 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition duration-150 cursor-pointer"
                  title="Discord Community"
                  aria-label="Discord"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                  </svg>
                </button>
              </div>

              {/* Action Buttons & Sync Status - Only visible when Admin mode is unlocked or user is signed in */}
              {showAdminControls && (
                <div className="flex items-center gap-3.5">
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    {user ? (
                      <>
                        {spreadsheetId && (
                          <a
                            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800/80 hover:border-emerald-500/20 text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px] font-mono"
                            title="Database Spreadsheet"
                          >
                            <FileSpreadsheet size={10} className="text-emerald-500" />
                            <span>Spreadsheet</span>
                          </a>
                        )}
                        <button
                          onClick={handleLogout}
                          className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition cursor-pointer flex items-center gap-1"
                          title="Sign Out"
                        >
                          <LogOut size={10} />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {spreadsheetId && (
                          <a
                            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px] font-mono"
                            title="Google Sheet Database"
                          >
                            <FileSpreadsheet size={10} className="text-emerald-500/85" />
                            <span>View DB</span>
                          </a>
                        )}
                        <button
                          onClick={handleLogin}
                          className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800/80 hover:border-amber-500/20 text-slate-400 hover:text-amber-400 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition duration-150"
                          title="Admin Dashboard"
                        >
                          <Database size={10} className="text-amber-500/85" />
                          <span>Admin</span>
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={handleManualRefresh}
                      disabled={isSyncing}
                      className="p-1 rounded-md bg-slate-900 border border-slate-800/80 hover:border-slate-700 hover:text-white transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                      title="Refresh database"
                    >
                      <RefreshCw size={10} className={isSyncing ? "animate-spin text-amber-500" : "text-slate-500"} />
                    </button>
                  </div>

                  {/* Status Indicator Pill */}
                  <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-900/80 px-2 py-1 rounded-md animate-fade-in">
                    <span className={`w-1 h-1 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="font-mono text-[8px] tracking-wider uppercase text-slate-500 font-bold">
                      {isSyncing ? 'Syncing' : 'Connected'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {showDiscordToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3.5 max-w-sm animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
            </svg>
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-100">Discord Community</h5>
            <p className="text-xs text-slate-400 mt-0.5">Invite link is coming soon! Stay tuned, Toasty FC fans!</p>
          </div>
        </div>
      )}
    </div>
  );
}
