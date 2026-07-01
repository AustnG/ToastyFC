/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Database, RefreshCw, Copy, Check, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { SheetConfig } from '../types';

interface SheetsSyncProps {
  sheetConfig: SheetConfig;
  updateSheetConfig: (config: SheetConfig) => void;
  syncFromSheets: (config: SheetConfig) => Promise<void>;
  isSynced: boolean;
  syncError: string | null;
  syncSuccessLog: string | null;
  isSyncing: boolean;
  onResetToDefault: () => void;
}

export default function SheetsSync({
  sheetConfig,
  updateSheetConfig,
  syncFromSheets,
  isSynced,
  syncError,
  syncSuccessLog,
  isSyncing,
  onResetToDefault,
}: SheetsSyncProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState(
    sheetConfig.isCustom && sheetConfig.sheetId
      ? `https://docs.google.com/spreadsheets/d/${sheetConfig.sheetId}`
      : ''
  );
  const [rosterGid, setRosterGid] = useState(sheetConfig.rosterRange);
  const [ratingsGid, setRatingsGid] = useState(sheetConfig.ratingsRange);
  const [matchesGid, setMatchesGid] = useState(sheetConfig.matchesRange);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSyncSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Extract Spreadsheet ID
    let finalId = inputUrl.trim();
    if (inputUrl.includes('/spreadsheets/d/')) {
      const match = inputUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        finalId = match[1];
      }
    }

    if (!finalId) {
      alert('Please enter a valid Google Spreadsheet URL or Spreadsheet ID.');
      return;
    }

    const newConfig: SheetConfig = {
      sheetId: finalId,
      rosterRange: rosterGid.trim() || 'Rosters',
      ratingsRange: ratingsGid.trim() || 'GameStats',
      matchesRange: matchesGid.trim() || 'Games',
      rostersRange: rosterGid.trim() || 'Rosters',
      gameStatsRange: ratingsGid.trim() || 'GameStats',
      gamesRange: matchesGid.trim() || 'Games',
      isCustom: true
    };

    updateSheetConfig(newConfig);
    await syncFromSheets(newConfig);
  };

  // Pre-compiled CSV blueprints for user copying
  const blueprints = {
    roster: `First,Last,Position,Notes,Number,Status,AvatarUrl
Austin,Greer,Midfielder,Team Captain & Midfield Engine,8,active,https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&h=150&q=80
Goran,Omerdic,Midfielder,Playmaker & Set-Piece Specialist,10,active,https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=150&h=150&q=80
Zac,Lechler,Defender,Club Co-founder & Defensive Rock,4,active,https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80
Glenn,Rees,Midfielder,High work-rate midfielder,7,active,`,
    ratings: `Last,1,2,3,4,5,6,7,8,9,10,11,12,TOTAL
Austin Greer,,,1,1,,-1,,,1,,,,2
Goran Omerdic,-1,1,1,1,1,-1,1,-1,1,1,1,1,6
Zac Lechler,-1,1,,,1,,1,-1,1,1,,,,3`,
    matches: `MatchNumber,Date,Opponent,Location,Status,ToastyScore,OpponentScore,Scorers,Assists,CleanSheet,Notes
1,2026-04-05,Torta FC,Westside Sports Complex,played,2,4,Dan Williams,Niko Jokic,FALSE,Tough season opener.
2,2026-04-12,Purple Soccer,Westside Sports Complex,played,3,1,Goran Omerdic,Zac Lechler,FALSE,Excellent bounce-back victory!
3,2026-04-19,Green Giants,Oakwood Athletic Field,played,1,0,AJ Ray,Goran Omerdic,TRUE,Tactical defensive masterpiece.`
  };

  return (
    <div className="space-y-12 pb-16" id="sync-view">
      {/* 1. Header & Quick Intro */}
      <section className="border-b border-club-border pb-6 animate-fade-in" id="sync-header">
        <h3 className="text-xl font-bold text-club-text flex items-center space-x-2">
          <Database className="h-5.5 w-5.5 text-jersey-red animate-pulse" />
          <span>Google Sheets Database Sync</span>
        </h3>
        <p className="text-club-text-dim text-xs mt-0.5">
          Connect your custom soccer database directly. Toasty FC reads and updates dynamically from your spreadsheet.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="sync-main-grid">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-club-card border border-club-border rounded-2xl p-6 space-y-5 shadow-xs">
            <h4 className="text-base font-bold text-club-text">Spreadsheet Connector</h4>
            
            <form onSubmit={handleSyncSubmit} className="space-y-4" id="sheets-config-form">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-club-text-dim uppercase tracking-wider font-bold">
                  Google Sheet URL or Spreadsheet ID
                </label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/your-id-here/edit"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-club-secondary border border-club-border rounded-xl px-4 py-3 text-sm text-club-text placeholder-club-text-dim focus:outline-hidden focus:border-jersey-red/50 transition duration-150"
                />
              </div>

              {/* Worksheet gid/name inputs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-club-text-dim uppercase tracking-wider font-bold">
                    Roster Tab (or GID)
                  </label>
                  <input
                    type="text"
                    placeholder="Rosters"
                    value={rosterGid}
                    onChange={(e) => setRosterGid(e.target.value)}
                    className="w-full bg-club-secondary border border-club-border rounded-xl px-3 py-2.5 text-xs text-club-text placeholder-club-text-dim text-center font-mono focus:outline-hidden focus:border-jersey-red/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-club-text-dim uppercase tracking-wider font-bold">
                    Ratings Tab (or GID)
                  </label>
                  <input
                    type="text"
                    placeholder="GameStats"
                    value={ratingsGid}
                    onChange={(e) => setRatingsGid(e.target.value)}
                    className="w-full bg-club-secondary border border-club-border rounded-xl px-3 py-2.5 text-xs text-club-text placeholder-club-text-dim text-center font-mono focus:outline-hidden focus:border-jersey-red/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-club-text-dim uppercase tracking-wider font-bold">
                    Matches Tab (or GID)
                  </label>
                  <input
                    type="text"
                    placeholder="Games"
                    value={matchesGid}
                    onChange={(e) => setMatchesGid(e.target.value)}
                    className="w-full bg-club-secondary border border-club-border rounded-xl px-3 py-2.5 text-xs text-club-text placeholder-club-text-dim text-center font-mono focus:outline-hidden focus:border-jersey-red/40"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="flex-1 bg-jersey-red hover:bg-jersey-red/95 disabled:bg-club-secondary disabled:text-club-text-dim text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
                  id="sync-submit-btn"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Save & Sync Sheet'}</span>
                </button>

                {sheetConfig.isCustom && (
                  <button
                    type="button"
                    onClick={onResetToDefault}
                    className="bg-club-secondary hover:bg-club-card-hover border border-club-border text-club-text-muted hover:text-club-text px-4 rounded-xl text-xs transition font-mono font-bold cursor-pointer"
                    id="sync-reset-btn"
                  >
                    Reset Sandbox
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sync logs and indicators */}
          <div className="bg-club-card border border-club-border rounded-2xl p-6 space-y-4 shadow-xs">
            <h4 className="text-base font-bold text-club-text">Sync Status Logs</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-club-secondary rounded-xl border border-club-border text-xs">
                <span className="text-club-text-dim font-mono font-bold">CONNECTION STATE</span>
                <span className={`font-bold flex items-center space-x-1 font-mono ${isSynced ? 'text-emerald-500' : 'text-jersey-red'}`}>
                  <span className={`h-2 w-2 rounded-full mr-1.5 ${isSynced ? 'bg-emerald-500' : 'bg-jersey-red'}`} />
                  {isSynced ? 'ACTIVE SHEET SYNC' : 'LOCAL EMBEDDED DEMO'}
                </span>
              </div>

              {syncSuccessLog && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    <span>Sync Completed Successfully</span>
                  </p>
                  <p className="font-mono text-[10px] mt-1.5 whitespace-pre-line text-club-text-muted leading-relaxed">
                    {syncSuccessLog}
                  </p>
                </div>
              )}

              {syncError && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs space-y-2">
                  <p className="font-bold flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 mr-1.5" />
                    <span>Sync Refused or Failed</span>
                  </p>
                  <p className="text-club-text-muted text-xs leading-relaxed">
                    {syncError}
                  </p>
                  <div className="border-t border-rose-500/10 pt-2 space-y-1 text-club-text-dim text-[10px]">
                    <p className="font-bold">TROUBLESHOOTING CHECKS:</p>
                    <p>1. Open Google Sheet &gt; File &gt; Share &gt; Share with others.</p>
                    <p>2. Set General Access to <span className="text-club-text font-bold">"Anyone with the link can view"</span>.</p>
                    <p>3. Confirm your tab names or GID values match exactly.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Blueprints and Guides */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-club-card border border-club-border rounded-2xl p-6 space-y-4 shadow-xs">
            <h4 className="text-base font-bold text-club-text flex items-center space-x-1.5">
              <HelpCircle className="h-5 w-5 text-jersey-red" />
              <span>Formatting Blueprints</span>
            </h4>
            <p className="text-club-text-muted text-xs leading-relaxed">
              For ToastyFC.com to read your Google Sheet smoothly, organize your tabs with these exact column headers. Click to copy sample data to paste into your sheet tabs:
            </p>

            <div className="space-y-4" id="blueprints-copiers">
              {/* Tab 1: Roster */}
              <div className="bg-club-secondary border border-club-border p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-club-text font-bold">1. Tab: Roster</span>
                  <button
                    onClick={() => handleCopy(blueprints.roster, 'roster')}
                    className="text-[10px] font-mono text-jersey-red hover:text-jersey-red/80 flex items-center space-x-1 font-bold cursor-pointer"
                  >
                    {copiedSection === 'roster' ? (
                      <span className="flex items-center text-emerald-500"><Check className="h-3 w-3 mr-0.5" /> Copied!</span>
                    ) : (
                      <span className="flex items-center"><Copy className="h-3 w-3 mr-0.5" /> Copy Data</span>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-club-text-dim leading-normal">
                  Headers: <code className="text-club-text-muted font-mono bg-club-card px-1 py-0.5 rounded">First,Last,Position,Notes,Number,Status,AvatarUrl</code>
                </p>
              </div>

              {/* Tab 2: Ratings */}
              <div className="bg-club-secondary border border-club-border p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-club-text font-bold">2. Tab: Ratings</span>
                  <button
                    onClick={() => handleCopy(blueprints.ratings, 'ratings')}
                    className="text-[10px] font-mono text-jersey-red hover:text-jersey-red/80 flex items-center space-x-1 font-bold cursor-pointer"
                  >
                    {copiedSection === 'ratings' ? (
                      <span className="flex items-center text-emerald-400"><Check className="h-3 w-3 mr-0.5" /> Copied!</span>
                    ) : (
                      <span className="flex items-center"><Copy className="h-3 w-3 mr-0.5" /> Copy Data</span>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-club-text-dim leading-normal">
                  Headers: <code className="text-club-text-muted font-mono bg-club-card px-1 py-0.5 rounded">Last,1,2,3,4,5,6,7,8,9,10,11,12,TOTAL</code>
                </p>
              </div>

              {/* Tab 3: Matches */}
              <div className="bg-club-secondary border border-club-border p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-club-text font-bold">3. Tab: Matches</span>
                  <button
                    onClick={() => handleCopy(blueprints.matches, 'matches')}
                    className="text-[10px] font-mono text-jersey-red hover:text-jersey-red/80 flex items-center space-x-1 font-bold cursor-pointer"
                  >
                    {copiedSection === 'matches' ? (
                      <span className="flex items-center text-emerald-400"><Check className="h-3 w-3 mr-0.5" /> Copied!</span>
                    ) : (
                      <span className="flex items-center"><Copy className="h-3 w-3 mr-0.5" /> Copy Data</span>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-club-text-dim leading-normal">
                  Headers: <code className="text-club-text-muted font-mono bg-club-card px-1 py-0.5 rounded text-[9px] block whitespace-pre-wrap">MatchNumber,Date,Opponent,Location,Status,ToastyScore,OpponentScore,Scorers,Assists,CleanSheet,Notes</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
