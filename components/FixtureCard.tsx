import React, { useState, useMemo } from 'react';
import { Game, GameStat, Player } from '../types';
import { LOGO_URL_ROUNDED } from '../constants';

const getGameTypeStyles = (gameType?: string) => {
    const type = (gameType || '').toLowerCase().trim();

    switch (type) {
        case 'final':
            return {
                badgeText: 'Championship Final',
                badgeClass: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg',
                cardClass: 'border-yellow-500/30 hover:border-yellow-500 hover:shadow-yellow-400/20',
            };
        case 'semi-final':
            return {
                badgeText: 'Semi-Final',
                badgeClass: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg',
                cardClass: 'border-slate-400/30 hover:border-slate-400 hover:shadow-slate-400/20',
            };
        case 'quarter-final':
            return {
                badgeText: 'Quarter-Final',
                badgeClass: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg',
                cardClass: 'border-orange-400/30 hover:border-orange-400 hover:shadow-orange-400/20',
            };
        case 'tournament':
            return {
                badgeText: 'Tournament',
                badgeClass: 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg',
                cardClass: 'border-teal-400/30 hover:border-teal-400 hover:shadow-teal-400/20',
            };
        case 'season':
        case 'regular season':
        case '':
            return {
                badgeText: null,
                badgeClass: '',
                cardClass: 'border-transparent hover:border-primary hover:shadow-primary/10',
            };
        default:
            // Fallback for any other type, like "Friendly"
            return {
                badgeText: gameType,
                badgeClass: 'bg-gray-600 text-white shadow-lg',
                cardClass: 'border-gray-600/30 hover:border-gray-600 hover:shadow-gray-600/20',
            };
    }
};

const StatRow: React.FC<{ icon: string; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex items-start text-left">
        <div className="flex-shrink-0 flex items-center w-32 sm:w-40">
            <span className="material-symbols-rounded text-lg text-primary mr-2">{icon}</span>
            <span className="font-bold text-sm text-gray-600 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-sm text-accent leading-relaxed">
            {children}
        </div>
    </div>
);

const StatComparisonRow: React.FC<{ label: string; value1?: string; value2?: string; lowerIsBetter?: boolean }> = ({ label, value1, value2, lowerIsBetter = false }) => {
    if ((value1 === undefined || value1 === null || value1 === '') && (value2 === undefined || value2 === null || value2 === '')) {
        return null;
    }

    const v1 = parseInt(value1 || '0', 10);
    const v2 = parseInt(value2 || '0', 10);

    let v1IsWinning = v1 > v2;
    let v2IsWinning = v2 > v1;

    if (lowerIsBetter) {
      v1IsWinning = v1 < v2;
      v2IsWinning = v2 < v1;
    }

    if (v1 === v2) {
        v1IsWinning = false;
        v2IsWinning = false;
    }

    return (
        <div className="flex items-center justify-between py-2 px-2 rounded-lg odd:bg-background">
            <span className={`w-1/3 text-left font-bold text-lg ${v1IsWinning ? 'text-secondary' : 'text-accent'}`}>{value1 ?? '-'}</span>
            <span className="w-1/3 text-center text-sm text-gray-500 uppercase tracking-wider">{label}</span>
            <span className={`w-1/3 text-right font-bold text-lg ${v2IsWinning ? 'text-secondary' : 'text-accent'}`}>{value2 ?? '-'}</span>
        </div>
    );
};


interface FixtureCardProps {
    game: Game;
    gameStats?: GameStat[];
    players?: Player[];
    showStatsToggle?: boolean;
}

const FixtureCard: React.FC<FixtureCardProps> = ({ game, gameStats, players, showStatsToggle = false }) => {
    const { badgeText, badgeClass, cardClass } = getGameTypeStyles(game.GameType);
    const isForfeit = game.Forfeit?.toLowerCase() === 'true' || game.Forfeit === '1';
    const hasPks = game.PKs && !isNaN(parseInt(game.PKs, 10)) && game.OpponentPKs && !isNaN(parseInt(game.OpponentPKs, 10));
    const [statsVisible, setStatsVisible] = useState(false);

    const gameStatsForThisGame = useMemo(() => {
        if (!gameStats || !game.WDL) return [];
        return gameStats.filter(gs => gs.GameId === game.Id);
    }, [gameStats, game.Id, game.WDL]);

    const hasPlayerGameStats = gameStatsForThisGame.length > 0;

    const playerStats = useMemo(() => {
        if (!players || !hasPlayerGameStats) return { goals: [], assists: [], saves: [], motm: null };

        const goals: { name: string, count: number }[] = [];
        const assists: { name: string, count: number }[] = [];
        const saves: { name: string, count: number }[] = [];
        let motm: string | null = null;

        gameStatsForThisGame.forEach(stat => {
            const player = players.find(p => p.Id === stat.PlayerId);
            if (!player) return;

            const playerName = `${player.FirstName} ${player.LastName}`;
            const goalCount = parseInt(stat.Goals || '0');
            const assistCount = parseInt(stat.Assists || '0');
            const saveCount = parseInt(stat.Saves || '0');

            if (goalCount > 0) goals.push({ name: playerName, count: goalCount });
            if (assistCount > 0) assists.push({ name: playerName, count: assistCount });
            if (saveCount > 0) saves.push({ name: playerName, count: saveCount });
            if (stat.MotM?.toUpperCase() === 'TRUE' || stat.MotM === '1') {
                motm = playerName;
            }
        });

        goals.sort((a, b) => b.count - a.count);
        assists.sort((a, b) => b.count - a.count);
        saves.sort((a, b) => b.count - a.count);

        return { goals, assists, saves, motm };
    }, [gameStatsForThisGame, players, hasPlayerGameStats]);

    const hasTeamStats = useMemo(() => [
        game.Shots, game.SoT, game.Blocks, game.Corners, game.Fouls, game.Yellows, game.Reds, game.Saves,
        game.OpponentShots, game.OpponentSoT, game.OpponentBlocks, game.OpponentCorners, game.OpponentFouls, game.OpponentYellows, game.OpponentReds, game.OpponentSaves
    ].some(stat => stat !== undefined && stat !== null && stat !== ''), [game]);

    const motm = game.ManOfTheMatch || playerStats.motm;
    const hasIndividualPlayerStats = playerStats.goals.length > 0 || playerStats.assists.length > 0 || playerStats.saves.length > 0;
    const hasAnyStats = hasTeamStats || hasIndividualPlayerStats || motm;
    
    const hasActions = game.YouTubeLink || (showStatsToggle && game.WDL && hasAnyStats);
    
    const gameDateTime = new Date(`${game.Date} ${game.Time}`);

    return (
         <div className={`relative bg-surface rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 border ${cardClass}`}>
            {badgeText && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-auto min-w-[40%] max-w-[80%] whitespace-nowrap py-1 px-4 text-center text-xs font-bold uppercase tracking-wider rounded-b-lg ${badgeClass}`}>
                    {badgeText}
                </div>
            )}
            <div className={`p-4 sm:p-6 ${badgeText ? 'pt-10' : ''}`}>
                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 mb-4 pb-3 border-b border-border">
                    <span className="font-semibold">{gameDateTime.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</span>
                    <span className="font-light italic hidden sm:block">{game.Venue}</span>
                </div>

                <div className="grid grid-cols-3 items-center text-center gap-2 sm:gap-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <img src={LOGO_URL_ROUNDED} alt="Toasty FC" className="h-16 w-16 md:h-20 md:w-20 object-cover" />
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-accent w-full truncate">Toasty FC</h3>
                    </div>

                    <div className="self-center">
                        {game.WDL ? (
                            <div>
                                <div className="min-h-[52px] md:min-h-[60px] flex flex-col justify-center">
                                    <div className="text-4xl md:text-5xl font-black text-accent flex items-center justify-center gap-x-2 md:gap-x-3">
                                        <span>{game.Goals}</span>
                                        <span className="text-2xl text-gray-400 font-light">-</span>
                                        <span>{game.GoalsAgainst}</span>
                                    </div>
                                    {hasPks && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            ({game.PKs} - {game.OpponentPKs}) penalties
                                        </p>
                                    )}
                                    {isForfeit && (
                                         <p className="text-xs text-yellow-500 uppercase tracking-wider font-bold mt-1">Forfeit</p>
                                    )}
                                </div>
                                <div className={`mt-2 px-3 py-1 text-xs sm:text-sm font-bold rounded-full inline-block ${
                                    game.WDL === 'W' ? 'bg-green-100 text-green-800' :
                                    game.WDL === 'L' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {game.WDL === 'W' ? 'WIN' : game.WDL === 'L' ? 'LOSS' : 'DRAW'}
                                </div>
                            </div>
                        ) : (
                            <span className="text-2xl md:text-3xl font-bold text-gray-400">VS</p>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-background flex items-center justify-center border-2 border-border">
                            <span className="text-3xl md:text-4xl font-bold text-gray-500 select-none">{game.Opponent.charAt(0)}</span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-accent w-full truncate px-1">{game.Opponent}</h3>
                    </div>
                </div>
                
                <div className="text-center sm:hidden text-xs text-gray-600 italic mt-2">{game.Venue}</div>

                {hasActions && (
                     <div className="mt-4 pt-4 border-t border-border flex justify-center items-center gap-4 flex-wrap">
                        {game.YouTubeLink && (
                            <a href={game.YouTubeLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-secondary text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg">
                                <span className="material-symbols-rounded mr-2">smart_display</span>
                                Watch Highlights
                            </a>
                        )}
                        {showStatsToggle && game.WDL && hasAnyStats && (
                            <button 
                                onClick={() => setStatsVisible(!statsVisible)}
                                aria-expanded={statsVisible}
                                aria-controls={`stats-${game.Id}`}
                                className="inline-flex items-center justify-center bg-surface text-accent px-4 py-2 rounded-lg hover:bg-background transition-colors text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg border border-border"
                            >
                                <span className={`material-symbols-rounded mr-2 transition-transform duration-300 ${statsVisible ? 'rotate-180' : ''}`}>
                                    {statsVisible ? 'expand_less' : 'expand_more'}
                                </span>
                                {statsVisible ? 'Hide Stats' : 'View Stats'}
                            </button>
                        )}
                     </div>
                )}

                {statsVisible && hasAnyStats && (
                    <div id={`stats-${game.Id}`} className="animate-bounce-in mt-4 pt-4 border-t border-border space-y-4">
                        {hasTeamStats && (
                            <div className="space-y-1">
                                <h4 className="font-bold text-lg text-accent text-center mb-3">Team Stats</h4>
                                <div className="flex justify-between items-center text-center font-bold text-accent px-2 text-sm">
                                    <span className="w-1/3 text-left">Toasty FC</span>
                                    <span className="w-1/3 text-center"></span>
                                    <span className="w-1/3 text-right truncate">{game.Opponent}</span>
                                </div>
                                <StatComparisonRow label="Shots" value1={game.Shots} value2={game.OpponentShots} />
                                <StatComparisonRow label="On Target" value1={game.SoT} value2={game.OpponentSoT} />
                                <StatComparisonRow label="Saves" value1={game.Saves} value2={game.OpponentSaves} />
                                <StatComparisonRow label="Blocks" value1={game.Blocks} value2={game.OpponentBlocks} />
                                <StatComparisonRow label="Corners" value1={game.Corners} value2={game.OpponentCorners} />
                                <StatComparisonRow label="Fouls" value1={game.Fouls} value2={game.OpponentFouls} lowerIsBetter={true} />
                                <StatComparisonRow label="Yellow Cards" value1={game.Yellows} value2={game.OpponentYellows} lowerIsBetter={true} />
                                <StatComparisonRow label="Red Cards" value1={game.Reds} value2={game.OpponentReds} lowerIsBetter={true} />
                            </div>
                        )}
                        
                        {(hasIndividualPlayerStats || motm) && (
                            <div className={`space-y-3 ${hasTeamStats ? 'pt-4 mt-4 border-t border-border' : ''}`}>
                                <h4 className="font-bold text-lg text-accent text-center mb-3">Player Stats</h4>
                                {motm && (
                                    <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 via-surface to-surface border-l-4 border-primary shadow-md">
                                        <StatRow icon="military_tech" label="Man of the Match">
                                            <span className="font-semibold">{motm}</span>
                                        </StatRow>
                                    </div>
                                )}
                                {playerStats.goals.length > 0 && (
                                    <StatRow icon="sports_soccer" label="Goals">
                                        {playerStats.goals.map((g, i) => (
                                            <span key={i}>{g.name}{g.count > 1 ? ` (${g.count})` : ''}{i < playerStats.goals.length - 1 ? ', ' : ''}</span>
                                        ))}
                                    </StatRow>
                                )}
                                {playerStats.assists.length > 0 && (
                                    <StatRow icon="handshake" label="Assists">
                                        {playerStats.assists.map((a, i) => (
                                            <span key={i}>{a.name}{a.count > 1 ? ` (${a.count})` : ''}{i < playerStats.assists.length - 1 ? ', ' : ''}</span>
                                        ))}
                                    </StatRow>
                                )}
                                {playerStats.saves.length > 0 && (
                                    <StatRow icon="shield" label="Saves">
                                        {playerStats.saves.map((s, i) => (
                                            <span key={i}>{s.name}{s.count > 1 ? ` (${s.count})` : ''}{i < playerStats.saves.length - 1 ? ', ' : ''}</span>
                                        ))}
                                    </StatRow>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default FixtureCard;