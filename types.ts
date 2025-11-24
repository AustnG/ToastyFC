

export interface Player {
    Id: string;
    FirstName: string;
    LastName: string;
    'Position(s)': string;
    DoB: string;
    Height: string;
    Birthplace: string;
    Nationality: string;
    Bio: string;
    PlayerImageUrl: string;
    Pace: string;
    Shooting: string;
    Passing: string;
    Dribbling: string;
    Defending: string;
    Physical: string;
    Positioning: string;
    Diving: string;
    Reflexes: string;
    Handling: string;
    Kicking: string;
    Distribution: string;
}

export interface Season {
    Id: string;
    Name: string;
    StartDate: string;
    Overview: string;
}

export interface Roster {
    RosterId: string;
    PlayerId: string;
    SeasonId:string;
    Number: string;
}

export interface Game {
    Id: string;
    SeasonId: string;
    Date: string;
    Time: string;
    Opponent: string;
    Venue: string;
    WDL: 'W' | 'D' | 'L' | '';
    Goals: string;
    GoalsAgainst: string;
    YouTubeLink: string;
    GameType: string;
    Forfeit: string;
    PKs: string;
    OpponentPKs: string;
    Shots?: string;
    SoT?: string;
    Blocks?: string;
    Corners?: string;
    Fouls?: string;
    Yellows?: string;
    Reds?: string;
    Saves?: string;
    OpponentShots?: string;
    OpponentSoT?: string;
    OpponentBlocks?: string;
    OpponentCorners?: string;
    OpponentFouls?: string;
    OpponentYellows?: string;
    OpponentReds?: string;
    OpponentSaves?: string;
    ManOfTheMatch?: string;
    OpponentColor?: string;
}

export interface GameStat {
    GameId: string;
    PlayerId: string;
    Goals: string;
    Assists: string;
    Shots: string;
    Saves: string;
    Fouls: string;
    PlusMinus: string;
    MotM: string; // "Yes", "1", or other truthy value
}

export interface Announcement {
    Title: string;
    Content: string;
    Date: string;
    ImageUrl: string;
}