import React, { useState, useMemo, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import { 
    PRIMARY_COLOR, TEAM_NAME, CURRENT_SEASON_KEY, 
    getPastSeasonKeysForSelector, calculateTeamRecord, ACCENT_COLOR,
    GOOGLE_SHEET_MATCHES_TAB
} from '../constants';
import { Match } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';

const FixturesPage: React.FC = () => {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<string>(CURRENT_SEASON_KEY); 

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedMatches = await googleSheetsService.fetchMatches(GOOGLE_SHEET_MATCHES_TAB);
        setAllMatches(fetchedMatches);

        // Determine the default active season tab
        // Get sorted list of seasons present in the fetched data (excluding "unknown season" as per getPastSeasonKeysForSelector logic)
        const validSeasonsInFetchedData = getPastSeasonKeysForSelector(fetchedMatches); 
        
        if (validSeasonsInFetchedData.length > 0) {
          // If there are valid (non-"Unknown") seasons in the data, pick the most recent one
          setActiveFilterTab(validSeasonsInFetchedData[0]);
        } else if (fetchedMatches.length > 0 && fetchedMatches[0]?.season) {
          // Fallback: if no "valid" seasons from getPastSeasonKeysForSelector (e.g., all are "Unknown Season"),
          // pick the season of the first match. This allows "Unknown Season" to be selected if it's the only type of data.
          setActiveFilterTab(fetchedMatches[0].season);
        } else {
          // Ultimate fallback: no matches at all, or no seasons identifiable in matches,
          // then default to CURRENT_SEASON_KEY (which is the initial state).
           setActiveFilterTab(CURRENT_SEASON_KEY);
        }

      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load match data. Please try again later.");
        setActiveFilterTab(CURRENT_SEASON_KEY); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };
    loadMatches();
  }, []);

  const seasonOptions = useMemo(() => {
    if (isLoading || error) {
        // On loading or error, if CURRENT_SEASON_KEY is valid and we want to show it as a placeholder,
        // we *could* add it here. However, the request is to only show seasons from data.
        // So, if there's an error or still loading, the options should ideally reflect potentially empty data.
        // For now, let's stick to deriving from allMatches, even in loading/error, so it's consistent.
        // If allMatches is empty, getPastSeasonKeysForSelector will return empty.
        return getPastSeasonKeysForSelector(allMatches);
    }
    // Derive season options strictly from the fetched match data.
    return getPastSeasonKeysForSelector(allMatches);
  }, [allMatches, isLoading, error]);


  useEffect(() => {
    // This effect ensures that activeFilterTab is always a valid selection based on available seasonOptions.
    // It runs after the initial data load and activeFilterTab selection, and also if seasonOptions changes.
    if (seasonOptions.length > 0 && !seasonOptions.includes(activeFilterTab)) {
        // If activeFilterTab (potentially set to an old season no longer in options, or CURRENT_SEASON_KEY not in data)
        // is not in the current valid seasonOptions, reset to the first (most recent) valid option.
        setActiveFilterTab(seasonOptions[0]);
    } else if (seasonOptions.length === 0 && allMatches.length > 0) {
        // This case handles if seasonOptions ended up empty (e.g. all matches are "Unknown Season",
        // or CURRENT_SEASON_KEY was "Unknown Season" and no other valid seasons exist).
        // We try to find any season from matches to set, even if it's "Unknown Season".
        const anySeasonFromMatchesOverall = allMatches.find(m => m.season && m.season.trim().toLowerCase() !== "unknown season" && m.season.trim() !== "")?.season;
        if (anySeasonFromMatchesOverall) {
             setActiveFilterTab(anySeasonFromMatchesOverall);
        } else if (allMatches[0]?.season) { // Fallback to the first match's season (could be "Unknown Season")
             setActiveFilterTab(allMatches[0].season);
        }
    } else if (seasonOptions.length === 0 && allMatches.length === 0 && activeFilterTab !== CURRENT_SEASON_KEY) {
        // If there are no options and no matches, and the active tab isn't already CURRENT_SEASON_KEY,
        // set it to CURRENT_SEASON_KEY as a last resort placeholder, even if it won't be in the dropdown.
        // This helps display relevant "No matches for CURRENT_SEASON_KEY" messages.
        setActiveFilterTab(CURRENT_SEASON_KEY);
    }
  }, [seasonOptions, activeFilterTab, allMatches, CURRENT_SEASON_KEY]);


  const { 
    upcomingMatches, 
    resultsToDisplay, 
    resultsTitle,
    seasonRecord,
    seasonRecordDisplayTitle 
  } = useMemo(() => {
    if (isLoading || error || (allMatches.length === 0 && !activeFilterTab)) return { upcomingMatches: [], resultsToDisplay: [], resultsTitle: '', seasonRecord: null, seasonRecordDisplayTitle: ''};

    let upcoming: Match[] = [];
    let displayResults: Match[] = [];
    let title = "";
    let record: { wins: number; draws: number; losses: number; played: number } | null = null;
    let recordTitle = "";

    const relevantMatchesForTab = allMatches.filter(match => match.season === activeFilterTab);

    const completedMatchesForTab = relevantMatchesForTab.filter(
        match => !match.isUpcoming && 
                 typeof match.homeTeam.score === 'number' && 
                 typeof match.awayTeam.score === 'number'
    );
    
    record = calculateTeamRecord(completedMatchesForTab, TEAM_NAME);
    
    // Determine if the activeFilterTab is the current season for perspective.
    // This is true if activeFilterTab IS CURRENT_SEASON_KEY AND that key is actually selectable (i.e., in data).
    const isCurrentSeasonViewPerspective = activeFilterTab === CURRENT_SEASON_KEY && seasonOptions.includes(CURRENT_SEASON_KEY);


    if (isCurrentSeasonViewPerspective) {
      upcoming = relevantMatchesForTab.filter(match => match.isUpcoming).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      displayResults = completedMatchesForTab.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      title = `Results (${CURRENT_SEASON_KEY})`;
      recordTitle = `Record for ${CURRENT_SEASON_KEY}`;
    } else {
      // For past seasons or any other selected season (including "Unknown Season" if selected, or CURRENT_SEASON_KEY if it has data but is not the "latest")
      upcoming = []; // Generally, don't show "upcoming" for historical season views.
      displayResults = relevantMatchesForTab 
                        .filter(match => typeof match.homeTeam.score === 'number' && typeof match.awayTeam.score === 'number') // that have scores
                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      title = `Results for ${activeFilterTab || 'Selected Period'}`;
      recordTitle = `Record for ${activeFilterTab || 'Selected Period'}`;
    }
    
    // Special handling: If activeFilterTab is CURRENT_SEASON_KEY, but it's not in seasonOptions (no data for it),
    // we might still want to show its "Upcoming" section if relevantMatchesForTab (which would be empty) has upcoming matches.
    // However, the above logic already sets `isCurrentSeasonViewPerspective` to false in this case.
    // Let's refine: show upcoming for CURRENT_SEASON_KEY if activeFilterTab is CURRENT_SEASON_KEY, regardless of it being in seasonOptions.
    // This ensures the "Upcoming Matches (Current Season)" section can appear if the user hasn't changed selection from default yet.
    if (activeFilterTab === CURRENT_SEASON_KEY) {
        const currentSeasonMatches = allMatches.filter(match => match.season === CURRENT_SEASON_KEY);
        upcoming = currentSeasonMatches.filter(match => match.isUpcoming).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // If we are here, results and title might need to be for CURRENT_SEASON_KEY if not already set.
        if (title === "" || title === `Results for ${activeFilterTab || 'Selected Period'}`) { // if not set by isCurrentSeasonViewPerspective
            const completedCurrentSeasonMatches = currentSeasonMatches.filter(
                match => !match.isUpcoming && 
                         typeof match.homeTeam.score === 'number' && 
                         typeof match.awayTeam.score === 'number'
            );
            displayResults = completedCurrentSeasonMatches.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            title = `Results (${CURRENT_SEASON_KEY})`;
            record = calculateTeamRecord(completedCurrentSeasonMatches, TEAM_NAME);
            recordTitle = `Record for ${CURRENT_SEASON_KEY}`;
        }
    }


    return { 
        upcomingMatches: upcoming, 
        resultsToDisplay: displayResults, 
        resultsTitle: title,
        seasonRecord: record,
        seasonRecordDisplayTitle: recordTitle
    };
  }, [activeFilterTab, allMatches, isLoading, error, CURRENT_SEASON_KEY, seasonOptions]);
  
  const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveFilterTab(event.target.value);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading fixtures..." size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}]`}>Fixtures & Results</h1>
        <p className="text-lg text-gray-600 mt-2">Track {TEAM_NAME}'s journey, season by season!</p>
      </header>

      <div className="mb-6">
        <label htmlFor="season-select" className={`block text-sm font-medium text-gray-700 mb-1`}>
          Select Season:
        </label>
        {seasonOptions.length > 0 ? (
            <select
            id="season-select"
            name="season-select"
            value={activeFilterTab} 
            onChange={handleSeasonChange}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm rounded-md shadow-sm`}
            aria-label="Select a season to view fixtures and results"
            >
            {seasonOptions.map(seasonKey => (
                <option key={seasonKey} value={seasonKey}>
                {seasonKey}{seasonKey === CURRENT_SEASON_KEY ? ' (Current)' : ''}
                </option>
            ))}
            </select>
        ) : (
             allMatches.length > 0 && activeFilterTab && activeFilterTab.trim().toLowerCase() === "unknown season" ? (
                <p className="text-gray-500 mt-1 bg-yellow-50 border border-yellow-300 p-2 rounded-md">
                    Displaying matches from "Unknown Season". No other specific seasons found in the data.
                </p>
             ) : (
                <p className="text-gray-500 mt-1">No specific seasons found in the match data.
                {(activeFilterTab === CURRENT_SEASON_KEY && (!allMatches || allMatches.filter(m => m.season === CURRENT_SEASON_KEY).length === 0)) ? ` Currently viewing placeholder for ${CURRENT_SEASON_KEY}.` : ''}
                </p>
             )
        )}
      </div>

      {seasonRecord && (
        <div className="bg-neutral-50 p-4 rounded-lg shadow-md mb-8 border border-neutral-200">
          <h3 className={`text-xl font-semibold text-[${PRIMARY_COLOR}] mb-1 text-center`}>{seasonRecordDisplayTitle || `Record for ${activeFilterTab}`}</h3>
          {seasonRecord.played > 0 ? (
            <p className="text-2xl font-bold text-gray-700 text-center">
              {seasonRecord.wins}W - {seasonRecord.draws}D - {seasonRecord.losses}L
            </p>
          ) : (
            <p className="text-lg text-gray-600 text-center">
              No completed matches with scores recorded for {activeFilterTab || "this period"}.
            </p>
          )}
        </div>
      )}

      {/* Display upcoming matches for the *activeFilterTab* if it is CURRENT_SEASON_KEY 
          and there are upcoming matches.
      */}
      {activeFilterTab === CURRENT_SEASON_KEY && upcomingMatches.length > 0 && (
        <section>
          <h2 className={`text-2xl font-semibold mb-6 text-center md:text-left text-gray-700 border-b-2 border-[${PRIMARY_COLOR}] pb-2`}>Upcoming Matches ({CURRENT_SEASON_KEY})</h2>
          <div className="grid grid-cols-1 gap-8">
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
      
      {resultsToDisplay.length > 0 && (
         <section className={(activeFilterTab === CURRENT_SEASON_KEY && upcomingMatches.length > 0) ? "mt-12" : ""}>
          <h2 className={`text-2xl font-semibold mb-6 text-center md:text-left text-gray-700 border-b-2 border-[${PRIMARY_COLOR}] pb-2`}>{resultsTitle}</h2>
          <div className="grid grid-cols-1 gap-8">
            {resultsToDisplay.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
      
      {/* Message for no data for the selected/active tab */}
      { !isLoading && !error && upcomingMatches.length === 0 && resultsToDisplay.length === 0 &&
        (seasonRecord && seasonRecord.played === 0 ? true : !seasonRecord ) && 
        (
          <p className="text-center text-gray-500 text-xl py-10">
            No matches to display for {activeFilterTab || "the selected period"}.
            {activeFilterTab === CURRENT_SEASON_KEY && " Check back soon for updates on the current season!"}
          </p>
        )
      }

      {allMatches.length === 0 && !isLoading && !error && (
         <p className="text-center text-gray-500 text-xl py-10">No match data found at all. Please check the Google Sheet or configuration.</p>
      )}
    </div>
  );
};

export default FixturesPage;