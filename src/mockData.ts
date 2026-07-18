import { Player, Match, NewsItem, GalleryItem, RosterEntry, MatchStats } from './types';

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'Austin Greer',
    number: 10,
    position: 'Forward',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80',
    bio: 'Team captain and lead goalscorer. Known for precise finishing and physical play.',
    goals: 18,
    assists: 5,
    matchesPlayed: 18,
    isCaptain: true,
    dateOfBirth: '1998-04-12',
    height: '6\'1"',
    birthplace: 'Bowling Green, KY',
    nationality: 'American',
    seasons: ['2024 3v3 Live', '2025 Spring', '2025 Winter', '2026 Spring', '2026 SKY Summer'],
    skills: { pace: 82, shooting: 91, passing: 78, dribbling: 84, defending: 52, physical: 89 }
  },
  {
    id: 'p2',
    name: 'Ben Toasty',
    number: 7,
    position: 'Midfielder',
    imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=80',
    bio: 'Dynamic playmaker with extraordinary vision. Controls the tempo of every game.',
    goals: 6,
    assists: 15,
    matchesPlayed: 18,
    dateOfBirth: '1999-09-24',
    height: '5\'10"',
    birthplace: 'Lexington, KY',
    nationality: 'American',
    seasons: ['2024 3v3 Live', '2025 Spring', '2025 Winter', '2026 Spring', '2026 SKY Summer'],
    skills: { pace: 78, shooting: 74, passing: 92, dribbling: 89, defending: 68, physical: 72 }
  },
  {
    id: 'p3',
    name: 'Carlos Mendez',
    number: 4,
    position: 'Defender',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80',
    bio: 'Rock solid center-back. Unbeatable in aerial duels and exceptional leader from the back.',
    goals: 2,
    assists: 2,
    matchesPlayed: 15,
    dateOfBirth: '1997-02-18',
    height: '6\'3"',
    birthplace: 'Guadalajara, Mexico',
    nationality: 'Mexican',
    seasons: ['2025 Spring', '2025 Winter', '2026 Spring', '2026 SKY Summer'],
    skills: { pace: 74, shooting: 58, passing: 72, dribbling: 70, defending: 90, physical: 93 }
  },
  {
    id: 'p4',
    name: 'Danny Ward',
    number: 1,
    position: 'Goalkeeper',
    imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=80',
    bio: 'Incredible reflexes and aerial command. Saved three penalties in his career.',
    goals: 1,
    assists: 1,
    matchesPlayed: 18,
    cleanSheets: 8,
    saves: 72,
    goalsAllowed: 12,
    dateOfBirth: '1996-11-05',
    height: '6\'2"',
    birthplace: 'London, England',
    nationality: 'British',
    seasons: ['2024 3v3 Live', '2025 Spring', '2025 Winter', '2026 Spring', '2026 SKY Summer'],
    skills: { pace: 85, shooting: 62, passing: 76, dribbling: 81, defending: 88, physical: 84 } // For GK, we repurpose PAC/DIV, SHO/HAN, PAS/KIC, DRI/REF, DEF/SPD, PHY/POS values beautifully in visual descriptions!
  },
  {
    id: 'p5',
    name: 'Emily Smith',
    number: 11,
    position: 'Forward',
    imageUrl: 'https://images.unsplash.com/photo-1551952237-954a0e68786c?w=500&auto=format&fit=crop&q=80',
    bio: 'Blazing fast winger. Can cut inside or deliver pinpoint crosses under pressure.',
    goals: 9,
    assists: 7,
    matchesPlayed: 14,
    dateOfBirth: '2000-07-30',
    height: '5\'6"',
    birthplace: 'Bowling Green, KY',
    nationality: 'American',
    seasons: ['2025 Spring', '2026 Spring', '2026 SKY Summer'],
    skills: { pace: 94, shooting: 82, passing: 81, dribbling: 91, defending: 45, physical: 68 }
  },
  {
    id: 'p6',
    name: 'Marcus Vance',
    number: 8,
    position: 'Midfielder',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80',
    bio: 'Box-to-box midfielder with unlimited stamina. Wins back possession and starts counters.',
    goals: 4,
    assists: 4,
    matchesPlayed: 8,
    dateOfBirth: '2001-01-15',
    height: '5\'11"',
    birthplace: 'Nashville, TN',
    nationality: 'American',
    seasons: ['2026 Spring', '2026 SKY Summer'],
    skills: { pace: 80, shooting: 70, passing: 79, dribbling: 77, defending: 82, physical: 86 }
  }
];

export const mockMatches: Match[] = [
  {
    id: 'm1',
    season: '2026 SKY Summer',
    date: '2026-07-15',
    time: '19:30',
    opponent: 'Flamin Hot FC',
    opponentColor: '#EF4444',
    type: 'League',
    status: 'Upcoming',
    location: 'Toasty Park Field 1',
  },
  {
    id: 'm2',
    season: '2026 SKY Summer',
    date: '2026-07-04',
    time: '18:00',
    opponent: 'Crispy United',
    opponentColor: '#F97316',
    type: 'League',
    status: 'Completed',
    location: 'Crispy Stadium',
    toastyScore: 3,
    opponentScore: 1,
    summary: 'An incredible team performance. Austin Greer opened the scoring with a spectacular header, Emily Smith doubled our lead with a blistering strike from the wing, and Ben Toasty calmly converted a late penalty to seal the three points.',
    goalsScoredBy: ['Austin Greer', 'Emily Smith', 'Ben Toasty'],
    assistsBy: ['Ben Toasty', 'Emily Smith'],
    goalScorersDetails: "Austin Greer (14'), Emily Smith (42'), Ben Toasty (78' Pen)",
    opponentGoalScorersDetails: "Opponent (54')",
    playerOfTheMatch: 'Ben Toasty',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    stats: {
      goals: { toasty: 3, opponent: 1 },
      assists: { toasty: 2, opponent: 1 },
      shots: { toasty: 14, opponent: 9 },
      shotsOnTarget: { toasty: 8, opponent: 4 },
      blocks: { toasty: 3, opponent: 5 },
      fouls: { toasty: 8, opponent: 11 },
      redCards: { toasty: 0, opponent: 0 },
      yellowCards: { toasty: 1, opponent: 2 },
      saves: { toasty: 3, opponent: 5 },
      corners: { toasty: 6, opponent: 4 },
    }
  },
  {
    id: 'm3',
    season: '2026 SKY Summer',
    date: '2026-06-27',
    time: '20:00',
    opponent: 'Salty Rovers',
    opponentColor: '#3B82F6',
    type: 'League',
    status: 'Completed',
    location: 'Toasty Park Field 1',
    toastyScore: 2,
    opponentScore: 2,
    summary: 'A dramatic ending to a hard-fought match. Salty Rovers scored a late equalizer in stoppage time, but Toasty FC played exceptionally well. Emily Smith put on a masterclass on the flank.',
    goalsScoredBy: ['Emily Smith', 'Austin Greer'],
    assistsBy: ['Ben Toasty'],
    goalScorersDetails: "Emily Smith (22'), Austin Greer (89')",
    opponentGoalScorersDetails: "Opponent Scorer (44'), Opponent Scorer (90+2')",
    playerOfTheMatch: 'Emily Smith',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    stats: {
      goals: { toasty: 2, opponent: 2 },
      assists: { toasty: 1, opponent: 2 },
      shots: { toasty: 11, opponent: 12 },
      shotsOnTarget: { toasty: 6, opponent: 7 },
      blocks: { toasty: 4, opponent: 2 },
      fouls: { toasty: 12, opponent: 9 },
      redCards: { toasty: 0, opponent: 0 },
      yellowCards: { toasty: 2, opponent: 1 },
      saves: { toasty: 5, opponent: 4 },
      corners: { toasty: 4, opponent: 5 },
    }
  },
  {
    id: 'm4',
    season: '2026 Spring',
    date: '2026-05-18',
    time: '17:00',
    opponent: 'The Frozen Ones',
    opponentColor: '#06B6D4',
    type: 'Friendly',
    status: 'Completed',
    location: 'Ice Arena Turf',
    toastyScore: 5,
    opponentScore: 0,
    summary: 'A completely dominant showing. Danny Ward recorded a clean sheet while Austin Greer bagged a spectacular hat-trick. Ben Toasty and Marcus Vance also added to the score sheet.',
    goalsScoredBy: ['Austin Greer', 'Austin Greer', 'Austin Greer', 'Ben Toasty', 'Marcus Vance'],
    assistsBy: ['Ben Toasty', 'Emily Smith', 'Austin Greer', 'Ben Toasty'],
    goalScorersDetails: "Austin Greer (9', 31', 45'), Ben Toasty (18'), Marcus Vance (60')",
    playerOfTheMatch: 'Austin Greer',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    stats: {
      goals: { toasty: 5, opponent: 0 },
      assists: { toasty: 4, opponent: 0 },
      shots: { toasty: 19, opponent: 4 },
      shotsOnTarget: { toasty: 12, opponent: 1 },
      blocks: { toasty: 1, opponent: 6 },
      fouls: { toasty: 6, opponent: 7 },
      redCards: { toasty: 0, opponent: 0 },
      yellowCards: { toasty: 0, opponent: 0 },
      saves: { toasty: 1, opponent: 7 },
      corners: { toasty: 8, opponent: 1 },
    }
  },
  {
    id: 'm5',
    season: '2025 Spring',
    date: '2025-04-12',
    time: '18:30',
    opponent: 'Salty Rovers',
    opponentColor: '#3B82F6',
    type: 'League',
    status: 'Completed',
    location: 'Toasty Park Field 1',
    toastyScore: 1,
    opponentScore: 0,
    summary: 'A rugged tactical battle where defensive organization triumphed. Austin Greer fired home a volley after a pin-point corner from Ben Toasty.',
    goalsScoredBy: ['Austin Greer'],
    assistsBy: ['Ben Toasty'],
    goalScorersDetails: "Austin Greer (48')",
    playerOfTheMatch: 'Carlos Mendez',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    stats: {
      goals: { toasty: 1, opponent: 0 },
      assists: { toasty: 1, opponent: 0 },
      shots: { toasty: 8, opponent: 6 },
      shotsOnTarget: { toasty: 4, opponent: 3 },
      blocks: { toasty: 5, opponent: 2 },
      fouls: { toasty: 10, opponent: 14 },
      redCards: { toasty: 0, opponent: 0 },
      yellowCards: { toasty: 1, opponent: 3 },
      saves: { toasty: 3, opponent: 3 },
      corners: { toasty: 5, opponent: 2 },
    }
  },
  {
    id: 'm6',
    season: '2025 Winter',
    date: '2025-11-18',
    time: '19:00',
    opponent: 'Crispy United',
    opponentColor: '#F97316',
    type: 'League',
    status: 'Completed',
    location: 'Indoor Soccer Palace',
    toastyScore: 2,
    opponentScore: 1,
    summary: 'Indoor soccer action! High-speed turns and wall passes. Carlos Mendez rose above everyone to seal the winner on a back-wall rebound.',
    goalsScoredBy: ['Ben Toasty', 'Carlos Mendez'],
    assistsBy: ['Austin Greer'],
    goalScorersDetails: "Ben Toasty (12'), Carlos Mendez (75')",
    opponentGoalScorersDetails: "Opponent Scorer (28')",
    playerOfTheMatch: 'Carlos Mendez',
    stats: {
      goals: { toasty: 2, opponent: 1 },
      assists: { toasty: 1, opponent: 1 },
      shots: { toasty: 15, opponent: 13 },
      shotsOnTarget: { toasty: 9, opponent: 6 },
      blocks: { toasty: 4, opponent: 5 },
      fouls: { toasty: 7, opponent: 8 },
      redCards: { toasty: 0, opponent: 0 },
      yellowCards: { toasty: 1, opponent: 1 },
      saves: { toasty: 5, opponent: 7 },
      corners: { toasty: 3, opponent: 3 },
    }
  },
  {
    id: 'm7',
    season: '2024 3v3 Live',
    date: '2024-07-22',
    time: '16:00',
    opponent: 'Ice Breakers',
    opponentColor: '#0284C7',
    type: 'Cup',
    status: 'Completed',
    location: 'Downtown BG Turf',
    toastyScore: 4,
    opponentScore: 3,
    summary: 'Thrilling 3v3 match with goals flying left and right! Austin Greer put on a masterclass of small-sided accuracy, and goalkeeper Danny Ward drove forward to score a spectacular distance goal in the dying minutes.',
    goalsScoredBy: ['Austin Greer', 'Austin Greer', 'Austin Greer', 'Danny Ward'],
    assistsBy: ['Ben Toasty', 'Danny Ward'],
    goalScorersDetails: "Austin Greer (4', 12', 19'), Danny Ward (28')",
    opponentGoalScorersDetails: "Opponent Scorer (6'), Opponent Scorer (18'), Opponent Scorer (25')",
    playerOfTheMatch: 'Austin Greer',
    stats: {
      goals: { toasty: 4, opponent: 3 },
      assists: { toasty: 2, opponent: 1 },
      shots: { toasty: 22, opponent: 18 },
      shotsOnTarget: { toasty: 15, opponent: 12 },
      blocks: { toasty: 2, opponent: 4 },
      fouls: { toasty: 4, opponent: 5 },
      redCards: { toasty: 0, opponent: 0 },
      yellowCards: { toasty: 0, opponent: 1 },
      saves: { toasty: 9, opponent: 11 },
      corners: { toasty: 0, opponent: 0 },
    }
  }
];

export const mockNews: NewsItem[] = [
  {
    id: 'n1',
    date: '2026-07-05',
    title: 'Toasty FC Clinches Major Victory Against Rivals Crispy United',
    summary: 'A stunning 3-1 performance propels Toasty FC to the top of the summer league standings.',
    content: 'On a beautiful Saturday afternoon, Toasty FC put on a masterclass of team chemistry and technical precision. Playing away at Crispy Stadium, our team took command of the possession from the whistle. Austin Greer broke the deadlock in the 14th minute. Crispy United fought back to equalize before halftime, but a spectacular second-half showing with goals from Emily Smith and Ben Toasty ensured three points for the Toasty Boys. We remain undefeated in our last four matches!',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    author: 'Coach Miller'
  },
  {
    id: 'n2',
    date: '2026-06-28',
    title: 'New Kit Partnership and Training Grounds Announced',
    summary: 'Toasty FC is proud to announce an exciting partnership and move to state-of-the-art training facilities.',
    content: 'We are thrilled to announce a major partnership with BreadBasket Sports, who will be our official apparel sponsor starting next month. The team will be sporting the brand new gold-and-charcoal gradient kits. Additionally, Toasty FC has secured weekly slots at the premier Toasty Turf training grounds, offering state-of-the-art turf, gym, and tactical discussion rooms to foster our growth.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80',
    author: 'Club Board'
  }
];

export const mockGallery: GalleryItem[] = [
  {
    id: 'g1',
    date: '2026-07-04',
    eventName: 'Crispy United Victory Celebrations',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=80',
    caption: 'The team celebrating after secure three points away from home.'
  },
  {
    id: 'g2',
    date: '2026-06-20',
    eventName: 'Summer Friendly Domination',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    caption: 'Austin Greer mid-air celebrating one of his three spectacular goals.'
  },
  {
    id: 'g3',
    date: '2026-06-10',
    eventName: 'Weekly Training Drills',
    imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=600&auto=format&fit=crop&q=80',
    caption: 'Ben Toasty perfecting cross-field passes during sunset training.'
  }
];

export const mockRoster: RosterEntry[] = [
  // Austin Greer (Captain in all seasons)
  { id: 'r1', playerId: 'p1', season: '2026 SKY Summer', number: 10, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: true },
  { id: 'r2', playerId: 'p1', season: '2026 Spring', number: 10, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: true },
  { id: 'r3', playerId: 'p1', season: '2025 Winter', number: 10, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: true },
  { id: 'r4', playerId: 'p1', season: '2025 Spring', number: 99, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: true }, // Historical number change
  { id: 'r5', playerId: 'p1', season: '2024 3v3 Live', number: 99, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: true },

  // Ben Toasty
  { id: 'r6', playerId: 'p2', season: '2026 SKY Summer', number: 7, imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=80', position: 'Midfielder', isCaptain: false },
  { id: 'r7', playerId: 'p2', season: '2026 Spring', number: 7, imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=80', position: 'Midfielder', isCaptain: false },
  { id: 'r8', playerId: 'p2', season: '2025 Winter', number: 17, imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=80', position: 'Midfielder', isCaptain: false }, // Historical number change
  { id: 'r9', playerId: 'p2', season: '2025 Spring', number: 17, imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=80', position: 'Midfielder', isCaptain: false },
  { id: 'r10', playerId: 'p2', season: '2024 3v3 Live', number: 17, imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=80', position: 'Midfielder', isCaptain: false },

  // Carlos Mendez
  { id: 'r11', playerId: 'p3', season: '2026 SKY Summer', number: 4, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80', position: 'Defender', isCaptain: false },
  { id: 'r12', playerId: 'p3', season: '2026 Spring', number: 4, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80', position: 'Defender', isCaptain: false },
  { id: 'r13', playerId: 'p3', season: '2025 Winter', number: 4, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80', position: 'Defender', isCaptain: false },
  { id: 'r14', playerId: 'p3', season: '2025 Spring', number: 4, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80', position: 'Defender', isCaptain: false },

  // Danny Ward
  { id: 'r15', playerId: 'p4', season: '2026 SKY Summer', number: 1, imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=80', position: 'Goalkeeper', isCaptain: false },
  { id: 'r16', playerId: 'p4', season: '2026 Spring', number: 1, imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=80', position: 'Goalkeeper', isCaptain: false },
  { id: 'r17', playerId: 'p4', season: '2025 Winter', number: 12, imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=80', position: 'Goalkeeper', isCaptain: false }, // Historical number change
  { id: 'r18', playerId: 'p4', season: '2025 Spring', number: 12, imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=80', position: 'Goalkeeper', isCaptain: false },
  { id: 'r19', playerId: 'p4', season: '2024 3v3 Live', number: 12, imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=80', position: 'Goalkeeper', isCaptain: false },

  // Emily Smith
  { id: 'r20', playerId: 'p5', season: '2026 SKY Summer', number: 11, imageUrl: 'https://images.unsplash.com/photo-1551952237-954a0e68786c?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: false },
  { id: 'r21', playerId: 'p5', season: '2026 Spring', number: 11, imageUrl: 'https://images.unsplash.com/photo-1551952237-954a0e68786c?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: false },
  { id: 'r22', playerId: 'p5', season: '2025 Spring', number: 11, imageUrl: 'https://images.unsplash.com/photo-1551952237-954a0e68786c?w=500&auto=format&fit=crop&q=80', position: 'Forward', isCaptain: false },

  // Marcus Vance
  { id: 'r23', playerId: 'p6', season: '2026 SKY Summer', number: 8, imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80', position: 'Midfielder', isCaptain: false },
  { id: 'r24', playerId: 'p6', season: '2026 Spring', number: 8, imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80', position: 'Midfielder', isCaptain: false },
];

export const mockMatchStats: MatchStats[] = [
  // ==================== m2 (Crispy United, TFC won 3-1) ====================
  { matchId: 'm2', playerId: 'p1', playerName: 'Austin Greer', goals: 1, assists: 0, shots: 4, shotsOnTarget: 3, blocks: 0, plusMinus: 2, fouls: 1, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm2', playerId: 'p2', playerName: 'Ben Toasty', goals: 1, assists: 1, shots: 3, shotsOnTarget: 2, blocks: 1, plusMinus: 2, fouls: 2, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm2', playerId: 'p3', playerName: 'Carlos Mendez', goals: 0, assists: 0, shots: 1, shotsOnTarget: 1, blocks: 2, plusMinus: 2, fouls: 1, yellows: 1, reds: 0, potm: true, cleanSheet: false },
  { matchId: 'm2', playerId: 'p4', playerName: 'Danny Ward', goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, blocks: 0, saves: 3, goalsAllowed: 1, plusMinus: 2, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm2', playerId: 'p5', playerName: 'Emily Smith', goals: 1, assists: 1, shots: 4, shotsOnTarget: 2, blocks: 0, plusMinus: 2, fouls: 1, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm2', playerId: 'p6', playerName: 'Marcus Vance', goals: 0, assists: 0, shots: 2, shotsOnTarget: 0, blocks: 0, plusMinus: 2, fouls: 2, yellows: 0, reds: 0, potm: false, cleanSheet: false },

  // ==================== m3 (Salty Rovers, Draw 2-2) ====================
  { matchId: 'm3', playerId: 'p1', playerName: 'Austin Greer', goals: 1, assists: 0, shots: 4, shotsOnTarget: 2, blocks: 0, plusMinus: 0, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm3', playerId: 'p2', playerName: 'Ben Toasty', goals: 0, assists: 1, shots: 2, shotsOnTarget: 1, blocks: 0, plusMinus: 0, fouls: 1, yellows: 1, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm3', playerId: 'p3', playerName: 'Carlos Mendez', goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, blocks: 3, plusMinus: 0, fouls: 3, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm3', playerId: 'p4', playerName: 'Danny Ward', goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, blocks: 0, saves: 5, goalsAllowed: 2, plusMinus: 0, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm3', playerId: 'p5', playerName: 'Emily Smith', goals: 1, assists: 0, shots: 3, shotsOnTarget: 2, blocks: 0, plusMinus: 0, fouls: 1, yellows: 0, reds: 0, potm: true, cleanSheet: false },
  { matchId: 'm3', playerId: 'p6', playerName: 'Marcus Vance', goals: 0, assists: 0, shots: 2, shotsOnTarget: 1, blocks: 1, plusMinus: 0, fouls: 1, yellows: 0, reds: 0, potm: false, cleanSheet: false },

  // ==================== m4 (The Frozen Ones, TFC won 5-0) ====================
  { matchId: 'm4', playerId: 'p1', playerName: 'Austin Greer', goals: 3, assists: 1, shots: 7, shotsOnTarget: 5, blocks: 0, plusMinus: 5, fouls: 0, yellows: 0, reds: 0, potm: true, cleanSheet: true },
  { matchId: 'm4', playerId: 'p2', playerName: 'Ben Toasty', goals: 1, assists: 2, shots: 4, shotsOnTarget: 3, blocks: 0, plusMinus: 5, fouls: 1, yellows: 0, reds: 0, potm: false, cleanSheet: true },
  { matchId: 'm4', playerId: 'p3', playerName: 'Carlos Mendez', goals: 0, assists: 0, shots: 1, shotsOnTarget: 0, blocks: 1, plusMinus: 5, fouls: 2, yellows: 0, reds: 0, potm: false, cleanSheet: true },
  { matchId: 'm4', playerId: 'p4', playerName: 'Danny Ward', goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, blocks: 0, saves: 1, goalsAllowed: 0, plusMinus: 5, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: true },
  { matchId: 'm4', playerId: 'p5', playerName: 'Emily Smith', goals: 0, assists: 1, shots: 3, shotsOnTarget: 2, blocks: 0, plusMinus: 5, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: true },
  { matchId: 'm4', playerId: 'p6', playerName: 'Marcus Vance', goals: 1, assists: 0, shots: 4, shotsOnTarget: 2, blocks: 0, plusMinus: 5, fouls: 1, yellows: 0, reds: 0, potm: false, cleanSheet: true },

  // ==================== m5 (Salty Rovers, TFC won 1-0) ====================
  { matchId: 'm5', playerId: 'p1', playerName: 'Austin Greer', goals: 1, assists: 0, shots: 3, shotsOnTarget: 2, blocks: 0, plusMinus: 1, fouls: 1, yellows: 0, reds: 0, potm: true, cleanSheet: true },
  { matchId: 'm5', playerId: 'p2', playerName: 'Ben Toasty', goals: 0, assists: 1, shots: 2, shotsOnTarget: 1, blocks: 1, plusMinus: 1, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: true },
  { matchId: 'm5', playerId: 'p3', playerName: 'Carlos Mendez', goals: 0, assists: 0, shots: 1, shotsOnTarget: 0, blocks: 4, plusMinus: 1, fouls: 1, yellows: 0, reds: 0, potm: false, cleanSheet: true },
  { matchId: 'm5', playerId: 'p4', playerName: 'Danny Ward', goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, blocks: 0, saves: 3, goalsAllowed: 0, plusMinus: 1, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: true },
  { matchId: 'm5', playerId: 'p5', playerName: 'Emily Smith', goals: 0, assists: 0, shots: 2, shotsOnTarget: 1, blocks: 0, plusMinus: 1, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: true },

  // ==================== m6 (Crispy United, TFC won 2-1) ====================
  { matchId: 'm6', playerId: 'p1', playerName: 'Austin Greer', goals: 0, assists: 1, shots: 4, shotsOnTarget: 2, blocks: 0, plusMinus: 1, fouls: 2, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm6', playerId: 'p2', playerName: 'Ben Toasty', goals: 1, assists: 0, shots: 3, shotsOnTarget: 2, blocks: 1, plusMinus: 1, fouls: 1, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm6', playerId: 'p3', playerName: 'Carlos Mendez', goals: 1, assists: 0, shots: 2, shotsOnTarget: 2, blocks: 3, plusMinus: 1, fouls: 2, yellows: 1, reds: 0, potm: true, cleanSheet: false },
  { matchId: 'm6', playerId: 'p4', playerName: 'Danny Ward', goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, blocks: 0, saves: 5, goalsAllowed: 1, plusMinus: 1, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: false },

  // ==================== m7 (Ice Breakers, TFC won 4-3) ====================
  { matchId: 'm7', playerId: 'p1', playerName: 'Austin Greer', goals: 3, assists: 0, shots: 8, shotsOnTarget: 6, blocks: 0, plusMinus: 1, fouls: 1, yellows: 0, reds: 0, potm: true, cleanSheet: false },
  { matchId: 'm7', playerId: 'p2', playerName: 'Ben Toasty', goals: 0, assists: 1, shots: 4, shotsOnTarget: 2, blocks: 1, plusMinus: 1, fouls: 2, yellows: 0, reds: 0, potm: false, cleanSheet: false },
  { matchId: 'm7', playerId: 'p4', playerName: 'Danny Ward', goals: 1, assists: 1, shots: 2, shotsOnTarget: 2, blocks: 1, saves: 9, goalsAllowed: 3, plusMinus: 1, fouls: 0, yellows: 0, reds: 0, potm: false, cleanSheet: false }
];

