/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Match, TeamStats, NewsItem, Season } from './types';

export const DEFAULT_PLAYERS: Player[] = [
  {
    id: 'austin-greer',
    firstName: 'Austin',
    lastName: 'Greer',
    position: 'Midfielder',
    status: 'active',
    notes: 'Team Captain & Midfield Engine',
    number: 8,
    ratings: { 3: 1, 4: 1, 6: -1, 9: 1 },
    totalRating: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'goran-omerdic',
    firstName: 'Goran',
    lastName: 'Omerdic',
    position: 'Midfielder',
    status: 'active',
    notes: 'Playmaker & Set-Piece Specialist',
    number: 10,
    ratings: { 1: -1, 2: 1, 3: 1, 4: 1, 5: 1, 6: -1, 7: 1, 8: -1, 9: 1, 10: 1, 11: 1, 12: 1 },
    totalRating: 6,
    avatarUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'zac-lechler',
    firstName: 'Zac',
    lastName: 'Lechler',
    position: 'Defender',
    status: 'active',
    notes: 'Club Co-founder & Defensive Rock',
    number: 4,
    ratings: { 1: -1, 2: 1, 5: 1, 7: 1, 8: -1, 9: 1, 10: 1 },
    totalRating: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'david-parra',
    firstName: 'David',
    lastName: 'Parra',
    position: 'Defender',
    status: 'active',
    notes: 'Speedy Fullback, great at overlap runs',
    number: 2,
    ratings: { 1: -1, 2: 1, 3: 1, 5: 1, 6: -1, 7: 1, 8: -1, 9: 1, 10: 1, 11: 1, 12: 1 },
    totalRating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'dan-williams',
    firstName: 'Dan',
    lastName: 'Williams',
    position: 'Forward',
    status: 'active',
    notes: 'Clincal Striker, lethal in the 18-yard box',
    number: 9,
    ratings: { 1: -1, 2: 1, 3: 1, 4: 1, 6: -1, 10: 1, 11: 1, 12: 1 },
    totalRating: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'niko-jokic',
    firstName: 'Niko',
    lastName: 'Jokic',
    position: 'Midfielder',
    status: 'active',
    notes: 'Creative Box-to-Box Midfielder',
    number: 14,
    ratings: { 1: -1, 2: 1, 4: 1, 5: 1, 6: -1, 10: 1, 11: 1, 12: 1 },
    totalRating: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'aj-ray',
    firstName: 'AJ',
    lastName: 'Ray',
    position: 'Forward',
    status: 'active',
    notes: 'Pacy Winger with incredible crossing ability',
    number: 11,
    ratings: { 3: 1, 4: 1, 5: 1, 6: -1, 7: 1, 8: -1, 9: 1, 11: 1, 12: 1 },
    totalRating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'eric-bowers',
    firstName: 'Eric',
    lastName: 'Bowers',
    position: 'Forward // Keeper',
    status: 'active',
    notes: 'Versatile utility player: can play Forward or Keeper',
    number: 1,
    ratings: { 1: -1, 2: 1, 5: 1, 7: 1, 8: -1, 11: 1, 12: 1 },
    totalRating: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'paige-hines',
    firstName: 'Paige',
    lastName: 'Hines',
    position: 'Midfielder',
    status: 'active',
    notes: 'Composed midfielder with excellent vision',
    number: 6,
    ratings: { 3: 1, 4: 1, 7: 1, 8: -1, 9: 1, 10: 1 },
    totalRating: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'glenn-rees',
    firstName: 'Glenn',
    lastName: 'Rees',
    position: 'Midfielder',
    status: 'active',
    notes: 'High work-rate midfielder',
    number: 7,
    ratings: {},
    totalRating: 0
  },
  {
    id: 'john-yohana',
    firstName: 'John',
    lastName: 'Yohana',
    position: 'Forward',
    status: 'active',
    notes: 'Dynamic attacker',
    number: 17,
    ratings: {},
    totalRating: 0
  },
  {
    id: 'driton-hyseni',
    firstName: 'Driton',
    lastName: 'Hyseni',
    position: 'Midfielder',
    status: 'active',
    notes: 'Technical control player',
    number: 5,
    ratings: {},
    totalRating: 0
  },
  {
    id: 'steven-torta',
    firstName: 'Steven',
    lastName: '?',
    position: 'Defender',
    status: 'active',
    notes: 'Transferred from Torta FC',
    number: 3,
    ratings: {},
    totalRating: 0
  },
  {
    id: 'eric-torta',
    firstName: 'Eric',
    lastName: '?',
    position: 'Midfielder',
    status: 'active',
    notes: 'Transferred from Torta FC',
    number: 15,
    ratings: {},
    totalRating: 0
  },
  {
    id: 'alex-jenkins',
    firstName: 'Alex',
    lastName: 'Jenkins',
    position: 'Defender',
    status: 'inactive',
    notes: 'Out for Winter 2024 season',
    number: 12,
    ratings: {},
    totalRating: 0
  },
  {
    id: 'dylan-goad',
    firstName: 'Dylan',
    lastName: 'Goad',
    position: 'Midfielder',
    status: 'active',
    notes: 'Agile wing midfielder',
    number: 13,
    ratings: {},
    totalRating: 0
  },
  {
    id: 'mo-alalawi',
    firstName: 'Mahmood "Mo"',
    lastName: 'Alalawi',
    position: 'Defender',
    status: 'active',
    notes: 'Sturdy center back',
    number: 22,
    ratings: {},
    totalRating: 0
  },
  // Guests
  {
    id: 'felix-guest',
    firstName: 'Felix',
    lastName: '?',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest from Purples Soccer',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'hamze-guest',
    firstName: 'Hamze',
    lastName: '?',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'mohadeen-guest',
    firstName: 'Mohadeen',
    lastName: '?',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'akhmet-duncan',
    firstName: 'Akhmet',
    lastName: '?',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player, recruited via Duncan',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'fanta-duncan',
    firstName: 'Fanta',
    lastName: '?',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player, recruited via Duncan',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'omar-duncan',
    firstName: 'Omar',
    lastName: '?',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player, recruited via Duncan',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'glen-reece-clay',
    firstName: 'Glen',
    lastName: 'Reece',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player, recruited via Clay/Zac',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'casey-tinius-clay',
    firstName: 'Casey',
    lastName: 'Tinius',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player, recruited via Clay',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'harrison-donnelly-clay',
    firstName: 'Harrison',
    lastName: 'Donnelly',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player, recruited via Clay',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'jabree-jones-clay',
    firstName: 'Jabree',
    lastName: 'Jones',
    position: 'Guest',
    status: 'guest',
    notes: 'Guest player, recruited via Clay',
    ratings: {},
    totalRating: 0
  },
  {
    id: 'edin-omerdic',
    firstName: 'Edin',
    lastName: 'Omerdic',
    position: 'Guest',
    status: 'guest',
    notes: "Goran Omerdic's brother",
    ratings: {},
    totalRating: 0
  },
  {
    id: 'duncan-mckenzie',
    firstName: 'Duncan',
    lastName: 'McKenzie',
    position: 'Defender',
    status: 'guest',
    notes: 'Reliable Guest Defender',
    ratings: {},
    totalRating: 0
  }
];

export const DEFAULT_MATCHES: Match[] = [
  {
    id: 'm1',
    matchNumber: 1,
    date: '2026-04-05',
    opponent: 'Torta FC',
    location: 'Westside Sports Complex, Pitch A',
    status: 'played',
    score: { toastyFc: 2, opponent: 4 },
    scorers: ['Dan Williams', 'Goran Omerdic'],
    assists: ['Niko Jokic'],
    cleanSheet: false,
    notes: 'Tough season opener. Torta FC took an early lead, and we fought back hard but fell short in defensive transition.'
  },
  {
    id: 'm2',
    matchNumber: 2,
    date: '2026-04-12',
    opponent: 'Purple Soccer',
    location: 'Westside Sports Complex, Pitch C',
    status: 'played',
    score: { toastyFc: 3, opponent: 1 },
    scorers: ['Goran Omerdic', 'Eric Bowers', 'Dan Williams'],
    assists: ['Zac Lechler', 'David Parra'],
    cleanSheet: false,
    notes: 'Excellent bounce-back victory! Goran controlled the tempo, and Eric Bowers scored a screamer from outside the box.'
  },
  {
    id: 'm3',
    matchNumber: 3,
    date: '2026-04-19',
    opponent: 'Green Giants',
    location: 'Oakwood Athletic Field',
    status: 'played',
    score: { toastyFc: 1, opponent: 0 },
    scorers: ['AJ Ray'],
    assists: ['Goran Omerdic'],
    cleanSheet: true,
    notes: 'Tactical defensive masterpiece. Zac and David kept a flawless clean sheet, and AJ Ray scored the solo winner in the 68th minute.'
  },
  {
    id: 'm4',
    matchNumber: 4,
    date: '2026-04-26',
    opponent: 'FC Fire',
    location: 'Westside Sports Complex, Pitch B',
    status: 'played',
    score: { toastyFc: 4, opponent: 2 },
    scorers: ['Dan Williams', 'Dan Williams', 'Austin Greer', 'Goran Omerdic'],
    assists: ['Austin Greer', 'AJ Ray', 'Paige Hines'],
    cleanSheet: false,
    notes: 'High-octane game against rival Fire. Dan Williams bagged a double. Toasty elements prevailed over fire!'
  },
  {
    id: 'm5',
    matchNumber: 5,
    date: '2026-05-03',
    opponent: 'Shadows FC',
    location: 'Westside Sports Complex, Pitch A',
    status: 'played',
    score: { toastyFc: 2, opponent: 1 },
    scorers: ['Niko Jokic', 'Goran Omerdic'],
    assists: ['AJ Ray'],
    cleanSheet: false,
    notes: 'Fought back from 1-0 down at half time. Intense physicality, but our endurance showed in the final 15 minutes.'
  },
  {
    id: 'm6',
    matchNumber: 6,
    date: '2026-05-10',
    opponent: 'Real Toasty (Derby)',
    location: 'Oakwood Athletic Field',
    status: 'played',
    score: { toastyFc: 1, opponent: 3 },
    scorers: ['Austin Greer'],
    assists: [],
    cleanSheet: false,
    notes: 'Friendly rivalry derby. Lack of coordination in midfield let us down, but Captain Austin Greer got a consolation goal.'
  },
  {
    id: 'm7',
    matchNumber: 7,
    date: '2026-05-17',
    opponent: 'Strikers United',
    location: 'Westside Sports Complex, Pitch C',
    status: 'played',
    score: { toastyFc: 3, opponent: 0 },
    scorers: ['AJ Ray', 'Goran Omerdic', 'Eric Bowers'],
    assists: ['Paige Hines', 'Zac Lechler'],
    cleanSheet: true,
    notes: 'Absolute dominance. Paige Hines orchestrated the build-up. Solid team clean sheet with great saves by Eric Bowers in goal.'
  },
  {
    id: 'm8',
    matchNumber: 8,
    date: '2026-05-24',
    opponent: 'Apex Predator FC',
    location: 'Westside Sports Complex, Pitch B',
    status: 'played',
    score: { toastyFc: 1, opponent: 2 },
    scorers: ['AJ Ray'],
    assists: ['David Parra'],
    cleanSheet: false,
    notes: 'Narrow defeat. Controversial penalty awarded against us in the final minutes. We deserved a draw.'
  },
  {
    id: 'm9',
    matchNumber: 9,
    date: '2026-05-31',
    opponent: 'Inter Toast',
    location: 'Oakwood Athletic Field',
    status: 'played',
    score: { toastyFc: 3, opponent: 2 },
    scorers: ['Goran Omerdic', 'Austin Greer', 'Dan Williams'],
    assists: ['AJ Ray', 'Zac Lechler'],
    cleanSheet: false,
    notes: 'What a thriller! A 90th-minute header by Dan Williams sealed all three points. Incredible team spirit!'
  },
  {
    id: 'm10',
    matchNumber: 10,
    date: '2026-06-07',
    opponent: 'Vanguard FC',
    location: 'Westside Sports Complex, Pitch A',
    status: 'played',
    score: { toastyFc: 2, opponent: 0 },
    scorers: ['Dan Williams', 'Niko Jokic'],
    assists: ['Goran Omerdic', 'Paige Hines'],
    cleanSheet: true,
    notes: 'Professional and clinical. Completely snuffed out Vanguards attack while maintaining 65% ball possession.'
  },
  {
    id: 'm11',
    matchNumber: 11,
    date: '2026-06-14',
    opponent: 'Phoenix Rising',
    location: 'Westside Sports Complex, Pitch C',
    status: 'played',
    score: { toastyFc: 5, opponent: 1 },
    scorers: ['Dan Williams', 'Dan Williams', 'AJ Ray', 'Goran Omerdic', 'Niko Jokic'],
    assists: ['Goran Omerdic', 'David Parra', 'Eric Bowers'],
    cleanSheet: false,
    notes: 'Offensive explosion! Team displayed perfect Tiki-Taka soccer. Season-high 5 goals scored.'
  },
  {
    id: 'm12',
    matchNumber: 12,
    date: '2026-06-21',
    opponent: 'Renegades FC',
    location: 'Oakwood Athletic Field',
    status: 'played',
    score: { toastyFc: 4, opponent: 3 },
    scorers: ['Goran Omerdic', 'Austin Greer', 'David Parra', 'Dan Williams'],
    assists: ['Niko Jokic', 'AJ Ray', 'Goran Omerdic'],
    cleanSheet: false,
    notes: 'High drama! Came from behind twice. Goran Omerdic scored an unbelievable direct free kick from 30 yards out!'
  },
  {
    id: 'm13',
    matchNumber: 13,
    date: '2026-06-28',
    opponent: 'Crusaders FC',
    location: 'Westside Sports Complex, Pitch B',
    status: 'upcoming',
    notes: 'Crucial upcoming match. Crusaders are 3rd in the league. A win secures our spot in the playoffs!'
  },
  {
    id: 'm14',
    matchNumber: 14,
    date: '2026-07-05',
    opponent: 'FC Ballers',
    location: 'Oakwood Athletic Field',
    status: 'upcoming',
    notes: 'Final home match of the regular season. Let\'s end it with a spectacular performance for the fans!'
  },
  {
    id: 'm15',
    matchNumber: 15,
    date: '2026-07-12',
    opponent: 'Title Contenders',
    location: 'Westside Sports Complex, Stadium Turf',
    status: 'upcoming',
    notes: 'The grand finale. Could decide the entire league championship!'
  }
];

export const HISTORIC_STATS: TeamStats[] = [
  {
    season: '2022 (Inaugural)',
    played: 14,
    wins: 6,
    losses: 6,
    draws: 2,
    goalsFor: 28,
    goalsAgainst: 30,
    cleanSheets: 2
  },
  {
    season: '2023 (Championship)',
    played: 16,
    wins: 11,
    losses: 3,
    draws: 2,
    goalsFor: 44,
    goalsAgainst: 21,
    cleanSheets: 6
  },
  {
    season: '2024 (Winter/Spring)',
    played: 15,
    wins: 9,
    losses: 4,
    draws: 2,
    goalsFor: 38,
    goalsAgainst: 24,
    cleanSheets: 4
  },
  {
    season: '2025 (Autumn Cup)',
    played: 12,
    wins: 8,
    losses: 3,
    draws: 1,
    goalsFor: 31,
    goalsAgainst: 18,
    cleanSheets: 5
  },
  {
    season: '2026 (Active Season)',
    played: 12,
    wins: 9,
    losses: 3,
    draws: 0,
    goalsFor: 33,
    goalsAgainst: 19,
    cleanSheets: 3
  }
];

export const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'n1',
    date: '2026-06-20',
    title: 'Toasty FC Clinches Division Semifinals in Thriller',
    category: 'Match Recap',
    content: 'An incredible 90th minute game-winner by striker Dan Williams propelled Toasty FC into the league cup semifinals. In what fans are calling the match of the season, Toasty FC overcame a two-goal deficit to beat Renegades FC 4-3 at Oakwood Athletic Field. Playmaker Goran Omerdic assisted twice and scored a spectacular free-kick from 30 yards.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&h=400&q=80'
  },
  {
    id: 'n2',
    date: '2026-06-15',
    title: 'Official Google Sheets Database Real-Time Sync Launched',
    category: 'Club Announcement',
    content: 'Our development team has successfully integrated our core administration Google Sheets database with our web hub. Starting today, all roster listings, detailed individual player attributes, match fixtures, and game stats are fully synchronized live. Check out the Database Sync tab to connect your own sheet copy!',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&h=400&q=80'
  },
  {
    id: 'n3',
    date: '2026-06-10',
    title: 'Captain\'s Corner: Austin Greer Believes we can go All the Way',
    category: 'Interview',
    content: '"The team camaraderie this season is the highest I have ever seen since we founded the club back in 2022," Captain Austin Greer remarked in yesterday\'s press conference. With only three regular games left on the schedule, Greer emphasizes tactical discipline and focus during training session drills.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&h=400&q=80'
  }
];

export const DEFAULT_SEASONS: Season[] = [
  {
    id: '11',
    name: '2026 Active Season',
    startDate: '2026-04-01',
    endDate: '2026-07-31',
    division: 'Division 1',
    playersRostered: 15,
    perPlayerFee: 50,
    teamFee: 750,
    amountPaid: 750,
    overview: 'The current running season where Toasty FC is dominating.'
  },
  {
    id: '10',
    name: '2025 Autumn Cup',
    startDate: '2025-09-01',
    endDate: '2025-11-30',
    division: 'Division 1',
    playersRostered: 14,
    perPlayerFee: 50,
    teamFee: 700,
    amountPaid: 700,
    overview: 'A historic cup run ending with a silver medal.'
  }
];

