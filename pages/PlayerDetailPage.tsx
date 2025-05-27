
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayerWithStats, PlayerStats, RadarChartDataItem } from '../types'; // Player type is not directly used here, PlayerWithStats covers it.
import { googleSheetsService } from '../services/googleSheetsService';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import RadarChart from '../components/RadarChart'; // Import RadarChart
import { 
    PRIMARY_COLOR, ACCENT_COLOR, THEME_BLACK, THEME_WHITE, TEAM_NAME,
    GOOGLE_SHEET_PLAYERS_TAB, GOOGLE_SHEET_GAME_STATS_TAB,
    MaterialCakeIcon, MaterialHeightIcon, MaterialLocationCityIcon, MaterialLinkIcon,
    MaterialFormatQuoteIcon, MaterialPersonIcon, MaterialDateRangeIcon, MaterialSportsKabaddiIcon,
    MaterialBarChartIcon, MaterialStarIcon, MaterialClubIcon, MaterialSparklesIcon, ToastIcon, 
    MaterialArrowBackIcon, MaterialCalendarIcon, 
    MaterialTrendingUpIcon,
    MaterialTeamIcon
} from '../constants';

// Placeholder for a radar chart icon, you might want to add a specific one
const MaterialRadarChartIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style} aria-hidden="true">settings_ethernet</span>
);


const PlayerDetailPage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>("All Time");

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      if (!playerId) {
        setError("Player ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const playersWithStats = await googleSheetsService.fetchPlayersWithOverallStats(
          GOOGLE_SHEET_PLAYERS_TAB,
          GOOGLE_SHEET_GAME_STATS_TAB
        );
        const foundPlayer = playersWithStats.find(p => p.id.toString() === playerId);

        if (foundPlayer) {
          setPlayer(foundPlayer);
          // Reset selected season if player changes or on initial load
          setSelectedSeason("All Time"); 
        } else {
          setError(`Player with ID ${playerId} not found.`);
        }
      } catch (err) {
        console.error("Error fetching player details:", err);
        setError("Failed to load player details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [playerId]);

  const getFlagUrl = (nationalityCode?: string) => {
    return nationalityCode ? `https://flagcdn.com/w40/${nationalityCode.toLowerCase()}.png` : '';
  };
  
  const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; value?: string | number | null; link?: string }> = ({ icon, label, value, link }) => {
    if (value === null || typeof value === 'undefined' || value === '' || (typeof value === 'number' && isNaN(value))) return null;
    return (
        <div className="flex items-start py-2 border-b border-gray-200 last:border-b-0">
            {icon && <span className={`mr-3 mt-1 text-[${PRIMARY_COLOR}]`}>{icon}</span>}
            <span className="font-semibold text-gray-600 w-1/3">{label}:</span>
            {link && typeof value === 'string' ? (
                 <a href={link} target="_blank" rel="noopener noreferrer" className={`text-[${ACCENT_COLOR}] hover:underline break-all text-left`}>{value}</a>
            ) : (
                <span className="text-gray-800 break-all text-left">{value}</span>
            )}
        </div>
    );
  };

  const SkillItem: React.FC<{label: string; value?: number | null; maxValue?: number}> = ({label, value, maxValue = 100}) => {
    if (typeof value !== 'number' || isNaN(value)) return null;
    const percentage = (value / maxValue) * 100;
    return (
        <div className="mb-3">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`text-sm font-bold text-[${PRIMARY_COLOR}]`}>{value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`bg-[${ACCENT_COLOR}] h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
  };

  const currentStats = useMemo((): PlayerStats | null => {
    if (!player) return null;
    if (selectedSeason === "All Time" || !player.statsBySeason) {
        return {
            appearances: player.appearances,
            goals: player.goals,
            assists: player.assists,
            manOfTheMatch: player.manOfTheMatch,
            plusMinus: player.plusMinus,
            fouls: player.fouls,
            shots: player.shots,
            saves: player.saves,
        };
    }
    return player.statsBySeason[selectedSeason] || 
           { appearances: 0, goals: 0, assists: 0, manOfTheMatch: 0, plusMinus: 0, fouls: 0, shots: 0, saves: undefined };
  }, [player, selectedSeason]);

  const radarChartData: RadarChartDataItem[] = useMemo(() => {
    if (!player) return [];
    const dataMap = [
      { label: "Ball Skills", value: player.ballSkills },
      { label: "Passing", value: player.passing },
      { label: "Shooting", value: player.shooting },
      { label: "Defence", value: player.defence },
      { label: "GK Rating", value: player.goalkeeperRating },
      { label: "Physical", value: player.physical },
      { label: "Mental", value: player.mental },
    ];
    // Filter out attributes that are undefined or null, and ensure value is a number
    return dataMap.filter(item => typeof item.value === 'number' && !isNaN(item.value))
                  .map(item => ({ label: item.label, value: item.value as number }));
  }, [player]);

  const combinedBirthInfoValue = useMemo(() => {
    if (!player) return undefined;
    let info: string | undefined = undefined;
    const formattedDob = player.dob ? new Date(player.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'}) : undefined;

    if (formattedDob && player.age) {
      info = `${formattedDob} (${player.age} years old)`;
    } else if (formattedDob) {
      info = formattedDob;
    } else if (player.age) {
      info = `${player.age} years old (DOB not specified)`;
    }
    return info;
  }, [player]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner text="Loading player details..." size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center justify-center mx-auto px-6 py-2 bg-[${PRIMARY_COLOR}] text-[${THEME_BLACK}] rounded-md hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] transition-colors`}
        >
          <MaterialArrowBackIcon className="mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  if (!player || !currentStats) {
    return <div className="text-center py-10 text-xl text-gray-600">Player data could not be loaded.</div>;
  }

  const fanZoneLink = `/fanzone?query=Tell%20me%20about%20${encodeURIComponent(player.name)}`;

  return (
    <div className="py-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
         <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors`}
        >
          <MaterialArrowBackIcon className="mr-2" /> 
          Back
        </button>
        {player.status === 'Inactive' && (
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-neutral-200 text-neutral-700">ALUMNI</span>
        )}
      </div>

      {/* Header Section */}
      <header className={`relative p-6 rounded-lg shadow-xl bg-gradient-to-br from-[${PRIMARY_COLOR}]/80 to-[${ACCENT_COLOR}]/70 text-white overflow-hidden`}>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 opacity-20">
            <ToastIcon className={`text-white/10 transform rotate-12 scale-150`} />
        </div>
        <div className="relative z-10 md:flex md:items-center">
          <img
            src={player.imageUrl || `https://ui-avatars.com/api/?name=${player.name.replace(' ','+')}&size=150&background=fff&color=aa0000&bold=true&font-size=0.33`}
            alt={`${player.name}`}
            className="w-32 h-40 md:w-36 md:h-48 object-cover rounded-lg border-4 border-white shadow-lg mx-auto md:mx-0 md:mr-8"
          />
          <div className="text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{player.name}</h1>
            {player.nickname && <p className="text-xl italic opacity-90">"{player.nickname}"</p>}
            <div className="flex items-center justify-center md:justify-start mt-2 space-x-4">
              {player.jerseyNumber !== null && (
                <span className="text-3xl font-extrabold">#{player.jerseyNumber}</span>
              )}
              <span className="text-lg bg-black/20 px-3 py-1 rounded-full">{player.position}</span>
              {player.nationality && (
                <img src={getFlagUrl(player.nationality)} alt={`${player.nationality} flag`} className="w-8 h-auto rounded-sm shadow-md" />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column / Main Column on smaller screens */}
        <div className="lg:col-span-2 space-y-8">
            <Card title="About Player" icon={<MaterialPersonIcon className={`text-[${ACCENT_COLOR}]`} />}>
                {player.playerQuote && (
                    <blockquote className={`border-l-4 border-[${PRIMARY_COLOR}] pl-4 py-2 italic text-gray-600 bg-gray-50 rounded-r-md mb-6`}>
                        <MaterialFormatQuoteIcon className={`inline mr-1 -mt-1 text-[${PRIMARY_COLOR}]/70`} />
                        {player.playerQuote}
                    </blockquote>
                )}
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{player.bio}</p>
            </Card>

            {radarChartData.length > 0 && (
              <Card title="Player Attributes Radar" icon={<MaterialRadarChartIcon className={`text-[${ACCENT_COLOR}]`} />}>
                <RadarChart data={radarChartData} maxValue={100} size={Math.min(window.innerWidth * 0.8, 450)} />
                 <p className="text-xs text-gray-500 mt-4 text-center">Note: Attribute ratings are on a 0-100 scale, visualized for comparison.</p>
              </Card>
            )}

            <Card title="Personal Details" icon={<MaterialCakeIcon className={`text-[${ACCENT_COLOR}]`} />}>
                <DetailItem icon={<MaterialCakeIcon />} label="Born / Age" value={combinedBirthInfoValue} />
                <DetailItem icon={<MaterialHeightIcon />} label="Height" value={player.height} />
                <DetailItem icon={<MaterialLocationCityIcon />} label="Birthplace" value={player.birthplace} />
                <DetailItem icon={<MaterialDateRangeIcon />} label="Joined Club" value={player.joinedClubDate ? new Date(player.joinedClubDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long'}) : undefined} />
                <DetailItem icon={<MaterialLinkIcon />} label="Social" value={player.socialLink ? player.socialLink.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : undefined} link={player.socialLink} />
            </Card>

            {/* Combined Key Skills and Radar Chart section (old SkillItem list removed if radar chart is preferred) */}
            {/* If you want to keep the list-based skills in addition to radar, uncomment this:
            {((player.finishing || player.shortPass || player.tackling || player.sprintSpeed || player.reactions) || (player.position === "Goalkeeper" && player.gkReflexes)) && (
                <Card title="Key Skills (List)" icon={<MaterialSportsKabaddiIcon className={`text-[${ACCENT_COLOR}]`} />}>
                    <SkillItem label="Finishing" value={player.finishing} />
                    <SkillItem label="Short Passing" value={player.shortPass} />
                    <SkillItem label="Tackling" value={player.tackling} />
                    <SkillItem label="Sprint Speed" value={player.sprintSpeed} />
                    <SkillItem label="Reactions" value={player.reactions} />
                    {player.position === "Goalkeeper" && <SkillItem label="GK Reflexes" value={player.gkReflexes} />}
                    <p className="text-xs text-gray-500 mt-4">Note: Skill values are representative and for illustrative purposes.</p>
                </Card>
            )}
            */}
        </div>

        {/* Right Column / Sidebar */}
        <div className="space-y-8">
            <Card title="Overall Stats" icon={<MaterialBarChartIcon className={`text-[${ACCENT_COLOR}]`} />}>
                {player.availableSeasonsForStats && player.availableSeasonsForStats.length > 0 && (
                    <div className="mb-4">
                        <label htmlFor="season-filter" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                           <MaterialCalendarIcon className="mr-1" style={{fontSize: '18px'}} /> Filter by Season:
                        </label>
                        <select
                            id="season-filter"
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-[${ACCENT_COLOR}] focus:border-[${ACCENT_COLOR}] sm:text-sm rounded-md shadow-sm`}
                            aria-label="Filter player stats by season"
                        >
                            <option value="All Time">All Time</option>
                            {player.availableSeasonsForStats.map(season => (
                                <option key={season} value={season}>{season}</option>
                            ))}
                        </select>
                    </div>
                )}
                <DetailItem icon={<MaterialBarChartIcon/>} label="Appearances" value={currentStats.appearances} />
                <DetailItem icon={<MaterialClubIcon/>} label="Goals" value={currentStats.goals} />
                <DetailItem icon={<MaterialSparklesIcon/>} label="Assists" value={currentStats.assists} />
                <DetailItem icon={<MaterialStarIcon/>} label="Man of the Match" value={currentStats.manOfTheMatch} />
                <DetailItem icon={<MaterialTrendingUpIcon/>} label="+/-" value={currentStats.plusMinus} />
                <DetailItem icon={<MaterialTeamIcon />} label="Fouls" value={currentStats.fouls} />
                <DetailItem icon={<MaterialBarChartIcon style={{ transform: 'scale(-1,1)' }}/>} label="Shots" value={currentStats.shots} />

                {player.position === "Goalkeeper" && currentStats.saves !== undefined && (
                    <DetailItem icon={<MaterialTeamIcon/>} label="Saves" value={currentStats.saves} />
                )}
                 {selectedSeason !== "All Time" && currentStats.appearances === 0 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">No stats recorded for this player in {selectedSeason}.</p>
                )}
            </Card>
            
            <Card title={`Ask ${TEAM_NAME} Bot`} icon={<MaterialSparklesIcon className={`text-[${ACCENT_COLOR}]`} />}>
                <p className="text-gray-700 mb-4">Want to know more or have specific questions about {player.firstName}?</p>
                <Link
                  to={fanZoneLink} // FanZone may be disabled
                  className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[${THEME_BLACK}] bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] hover:text-[${THEME_WHITE}] transition-colors duration-200`}
                >
                  Ask Toasty Bot about {player.firstName}!
                </Link>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailPage;
