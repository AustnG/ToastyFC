
import React, { useState, useMemo, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import Card from '../components/ui/Card'; // Import Card component
import {
    PRIMARY_COLOR, TEAM_NAME, CURRENT_SEASON_KEY,
    getPastSeasonKeysForSelector, calculateTeamRecord, ACCENT_COLOR, THEME_BLACK, THEME_WHITE,
    GOOGLE_SHEET_MATCHES_TAB, MaterialCalendarIcon, GOOGLE_CALENDAR_ID, ICAL_FEED_URL, MaterialContentCopyIcon
} from '../constants';
import { Match } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';

const FixturesPage: React.FC = () => {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<string | null>(null); // Initial default to null
  const [isIcalCopied, setIsIcalCopied] = useState<boolean>(false);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setActiveFilterTab(null); // Reset on new load attempt
        const fetchedMatches = await googleSheetsService.fetchMatches(GOOGLE_SHEET_MATCHES_TAB);
        setAllMatches(fetchedMatches);

        const seasonsFromData = getPastSeasonKeysForSelector(fetchedMatches); // Only seasons from data

        if (seasonsFromData.length > 0) {
          setActiveFilterTab(seasonsFromData[0]); // Default to the latest season WITH data
        } else {
          setActiveFilterTab(null); // No seasons found in data, remains null
        }

      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load match data. Please try again later.");
        setActiveFilterTab(null); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const seasonOptions = useMemo(() => {
    return getPastSeasonKeysForSelector(allMatches); // Only seasons from data
  }, [allMatches]);


  const {
    upcomingMatches,
    resultsToDisplay,
    resultsTitle,
    seasonRecord,
    seasonRecordDisplayTitle
  } = useMemo(() => {
    if (isLoading || error || !activeFilterTab) {
      return { 
        upcomingMatches: [], 
        resultsToDisplay: [], 
        resultsTitle: activeFilterTab === null && !isLoading && !error ? 'No season selected or available' : 'Loading results...',
        seasonRecord: null, 
        seasonRecordDisplayTitle: activeFilterTab === null && !isLoading && !error ? '' : 'Loading record...'
      };
    }
    const matchesForSelectedSeason = allMatches.filter(match => match.season === activeFilterTab);

    const completedMatchesForSelectedSeason = matchesForSelectedSeason
      .filter(match => !match.isUpcoming && typeof match.homeTeam.score === 'number' && typeof match.awayTeam.score === 'number')
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let upcoming: Match[] = [];
    // Only show upcoming matches if the selected filter tab is indeed the CURRENT_SEASON_KEY
    if (activeFilterTab === CURRENT_SEASON_KEY) {
      upcoming = matchesForSelectedSeason
        .filter(match => match.isUpcoming)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    const displayResults = completedMatchesForSelectedSeason;
    const titleText = `Results for ${activeFilterTab}`;
    const currentSeasonRecord = calculateTeamRecord(completedMatchesForSelectedSeason, TEAM_NAME);
    const recordTitleText = `Record for ${activeFilterTab}`;

    return {
        upcomingMatches: upcoming,
        resultsToDisplay: displayResults,
        resultsTitle: titleText,
        seasonRecord: currentSeasonRecord,
        seasonRecordDisplayTitle: recordTitleText
    };
  }, [activeFilterTab, allMatches, isLoading, error]);


  const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveFilterTab(event.target.value);
  };

  const handleAddToGoogleCalendar = () => {
    window.open(`https://calendar.google.com/calendar/render?cid=${GOOGLE_CALENDAR_ID}`, '_blank');
  };

  const handleCopyIcalUrl = () => {
    navigator.clipboard.writeText(ICAL_FEED_URL).then(() => {
      setIsIcalCopied(true);
      setTimeout(() => setIsIcalCopied(false), 3000); // Hide message after 3 seconds
    }).catch(err => {
      console.error('Failed to copy iCal URL: ', err);
      // You could add a more user-facing error message here if needed
    });
  };

  // Main loading state for the entire page content
  if (isLoading && !allMatches.length) { // Show main loader only if no data yet
    return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading fixtures..." size="lg" /></div>;
  }

  // Error state for the entire page
  if (error && !isLoading && !allMatches.length) { // Ensure not to show error if still loading something else.
    return <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">{error}</div>;
  }
  
  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className={`text-4xl font-bold text-[${PRIMARY_COLOR}] flex items-center justify-center`}>
            <MaterialCalendarIcon className="mr-3" style={{fontSize: '36px'}} /> Fixtures & Results
        </h1>
        <p className="text-lg text-gray-600 mt-2">Track {TEAM_NAME}'s journey, season by season!</p>
      </header>

      <div className="mb-6">
        <label htmlFor="season-select" className={`flex items-center text-sm font-medium text-gray-700 mb-1`}>
          <MaterialCalendarIcon className="mr-1" style={{fontSize: '18px'}} /> Select Season:
        </label>
        {isLoading && seasonOptions.length === 0 ? ( // Show skeleton if loading AND no options yet
            <div className="mt-1 block w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
        ) : seasonOptions.length > 0 ? (
            <select
            id="season-select"
            name="season-select"
            value={activeFilterTab || ''} // Handle null for select value
            onChange={handleSeasonChange}
            disabled={isLoading} // Disable while internal loading/refiltering might occur
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm rounded-md shadow-sm`}
            aria-label="Select a season to view fixtures and results"
            >
            {seasonOptions.map(seasonKey => (
                <option key={seasonKey} value={seasonKey}>
                {seasonKey} {/* No "(Current)" suffix */}
                </option>
            ))}
            </select>
        ) : (
            // Not loading, and no season options (error handled by page-level error above)
             !error && <p className="text-gray-500 mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded-md">
                No seasons with match data found.
            </p>
        )}
      </div>
      
      {activeFilterTab && seasonRecord && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-8 border border-neutral-200">
          <h3 className={`text-xl font-semibold text-[${PRIMARY_COLOR}] mb-1 text-center`}>{seasonRecordDisplayTitle}</h3>
          {seasonRecord.played > 0 ? (
            <p className="text-2xl font-bold text-gray-700 text-center">
              {seasonRecord.wins}W - {seasonRecord.draws}D - {seasonRecord.losses}L
            </p>
          ) : (
            <p className="text-lg text-gray-600 text-center">
              No completed matches with scores recorded for {activeFilterTab}.
            </p>
          )}
        </div>
      )}

      {isLoading && (upcomingMatches.length === 0 && resultsToDisplay.length === 0) && (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner text={`Loading matches for ${activeFilterTab || 'selected season'}...`} />
          </div>
      )}

      {!isLoading && upcomingMatches.length > 0 && activeFilterTab === CURRENT_SEASON_KEY && (
        <section>
          <h2 className={`text-2xl font-semibold mb-6 text-center md:text-left text-gray-700 border-b-2 border-[${PRIMARY_COLOR}] pb-2`}>Upcoming Matches ({CURRENT_SEASON_KEY})</h2>
          <div className="grid grid-cols-1 gap-8">
            {upcomingMatches.map(match => (
              <MatchCard key={`${match.season}-${match.id}-${match.gameNumber || 'upcoming'}`} match={match} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && resultsToDisplay.length > 0 && activeFilterTab && (
         <section className={(upcomingMatches.length > 0 && activeFilterTab === CURRENT_SEASON_KEY) ? "mt-12" : ""}>
          <h2 className={`text-2xl font-semibold mb-6 text-center md:text-left text-gray-700 border-b-2 border-[${PRIMARY_COLOR}] pb-2`}>{resultsTitle}</h2>
          <div className="grid grid-cols-1 gap-8">
            {resultsToDisplay.map(match => (
              <MatchCard key={`${match.season}-${match.id}-${match.gameNumber || 'result'}`} match={match} />
            ))}
          </div>
        </section>
      )}
      
      { !isLoading && !error && activeFilterTab && upcomingMatches.length === 0 && resultsToDisplay.length === 0 &&
        ( (seasonRecord && seasonRecord.played === 0) || !seasonRecord ) &&
        (
          <p className="text-center text-gray-500 text-xl py-10">
            No matches to display for {activeFilterTab}.
          </p>
        )
      }
      
      <hr className="my-8 border-gray-300" />
      
      <Card 
        title="Subscribe to Toasty FC Calendar"
        icon={<MaterialCalendarIcon className={`mr-2 text-[${ACCENT_COLOR}]`} style={{fontSize: '28px'}} />}
        titleClassName={`text-[${PRIMARY_COLOR}] text-2xl font-semibold mb-4`} 
        className="bg-white"
      >
        <div className="space-y-4">
          <button
            onClick={handleAddToGoogleCalendar}
            className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[${THEME_BLACK}] bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] transition-colors duration-200 shadow-md hover:shadow-lg`}
            aria-label="Add Toasty FC calendar to Google Calendar"
          >
            <MaterialCalendarIcon className="mr-2" /> Add to Google Calendar
          </button>
          
          <div>
            <p className="text-sm text-gray-700 mb-2">
              For other calendar apps (Outlook, Apple Calendar, etc.), use this iCal feed URL:
            </p>
            <div className="p-2 bg-gray-100 rounded-md text-xs text-gray-600 break-all mb-2 select-all">
              {ICAL_FEED_URL}
            </div>
            <div className="flex items-center">
              <button
                onClick={handleCopyIcalUrl}
                className={`flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150 shadow-sm`}
                aria-label="Copy iCal feed URL to clipboard"
              >
                <MaterialContentCopyIcon className="mr-2" style={{fontSize: '16px'}} /> Copy iCal URL
              </button>
              {isIcalCopied && (
                <span className="ml-3 text-sm text-green-600 font-medium">Copied!</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Message for when there's no data at all after loading, and no specific season could be selected */}
      { !isLoading && !error && !activeFilterTab && seasonOptions.length === 0 && (
         <p className="text-center text-gray-500 text-xl py-10">
            No match data with season information found. Please check the Google Sheet or configuration.
         </p>
      )}
    </div>
  );
};

export default FixturesPage;
