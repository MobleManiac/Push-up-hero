import { LeaderboardUser } from '../types';

export const INITIAL_COMMUNITY_USERS: Omit<LeaderboardUser, 'isCurrentUser'>[] = [
  {
    id: 'f1',
    username: 'Marcus_IronGrip',
    avatar: '🦁',
    dailyReps: 120,
    weeklyReps: 740,
    totalReps: 3850,
    rawPushups: 1420,
    standardPushups: 2430,
    plankSeconds: 1240,
    streak: 18,
    badge: 'Titan of Iron',
    statusText: 'Crushing standard 50s daily'
  },
  {
    id: 'f2',
    username: 'Elena_RawPower',
    avatar: '⚡',
    dailyReps: 95,
    weeklyReps: 610,
    totalReps: 2980,
    rawPushups: 2150,
    standardPushups: 830,
    plankSeconds: 980,
    streak: 14,
    badge: 'Spartan Beast',
    statusText: 'Strict chest-to-deck only'
  },
  {
    id: 'f3',
    username: 'Devin_PlankGod',
    avatar: '🛡️',
    dailyReps: 75,
    weeklyReps: 490,
    totalReps: 2420,
    rawPushups: 650,
    standardPushups: 1770,
    plankSeconds: 3600,
    streak: 21,
    badge: 'Core Striker',
    statusText: '3-min planks before coffee'
  },
  {
    id: 'f4',
    username: 'Coach_Sarah',
    avatar: '🔥',
    dailyReps: 80,
    weeklyReps: 520,
    totalReps: 2190,
    rawPushups: 980,
    standardPushups: 1210,
    plankSeconds: 840,
    streak: 9,
    badge: 'Push-up Grinder',
    statusText: 'Form over everything'
  },
  {
    id: 'f5',
    username: 'Viper_Kicks',
    avatar: '🦅',
    dailyReps: 50,
    weeklyReps: 350,
    totalReps: 1640,
    rawPushups: 540,
    standardPushups: 1100,
    plankSeconds: 620,
    streak: 6,
    badge: 'Push-up Grinder',
    statusText: 'Chasing the century club'
  },
  {
    id: 'f6',
    username: 'Liam_DailyGrind',
    avatar: '🐺',
    dailyReps: 40,
    weeklyReps: 280,
    totalReps: 890,
    rawPushups: 260,
    standardPushups: 630,
    plankSeconds: 480,
    streak: 4,
    badge: 'Iron Cadet',
    statusText: 'Never skipping a day'
  }
];
