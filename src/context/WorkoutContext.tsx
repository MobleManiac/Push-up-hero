import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ExerciseType,
  WorkoutSession,
  UserGoals,
  UserProfile,
  LeaderboardUser,
  EXERCISES
} from '../types';
import { INITIAL_COMMUNITY_USERS } from '../utils/leaderboardData';
import { playGoalCelebration } from '../utils/audio';

interface WorkoutContextType {
  profile: UserProfile;
  goals: UserGoals;
  sessions: WorkoutSession[];
  friends: LeaderboardUser[];
  updateUsername: (username: string, avatar?: string) => void;
  updateGoals: (newGoals: Partial<UserGoals>) => void;
  logSession: (session: Omit<WorkoutSession, 'id' | 'timestamp' | 'dateStr'>) => void;
  deleteSession: (id: string) => void;
  addFriend: (friend: { username: string; avatar: string; dailyReps: number; weeklyReps: number; plankSeconds: number }) => void;
  
  // Computed helpers
  todayStr: string;
  todayPushups: number;
  todayRawPushups: number;
  todayStandardPushups: number;
  todayPlankSeconds: number;
  
  weekPushups: number;
  weekRawPushups: number;
  weekStandardPushups: number;
  weekPlankSeconds: number;
  
  totalPushups: number;
  totalPlankSeconds: number;
  
  dailyPushupProgress: number; // 0 - 100+
  weeklyPushupProgress: number; // 0 - 100+
  dailyPlankProgress: number;
  weeklyPlankProgress: number;
  
  currentStreak: number;
  bestStreak: number;
  
  // Personal Records
  personalRecords: {
    maxSingleSetPushups: number;
    maxDailyPushups: number;
    maxSinglePlankSeconds: number;
    bestStreak: number;
  };
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: 'pushup_hero_profile',
  GOALS: 'pushup_hero_goals',
  SESSIONS: 'pushup_hero_sessions',
  FRIENDS: 'pushup_hero_friends',
  STREAK: 'pushup_hero_streak',
};

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday is start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = getTodayString();

  // 1. Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return {
      username: 'Iron_Striker',
      avatar: '🦾',
      joinedDate: todayStr,
      level: 1,
      title: 'Novice Recruit'
    };
  });

  // 2. Goals State
  const [goals, setGoals] = useState<UserGoals>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return {
      dailyPushups: 50,
      weeklyPushups: 350,
      dailyPlankSeconds: 120,
      weeklyPlankSeconds: 840,
      preferredExercise: 'standard_pushup'
    };
  });

  // 3. Sessions State
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    // Generate realistic historical starter days so the user immediately sees charts and active progress
    const starterSessions: WorkoutSession[] = [];
    const now = new Date();
    
    // Seed 4 days of past activity
    for (let i = 4; i >= 1; i--) {
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - i);
      const pastStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;
      
      starterSessions.push({
        id: `seed-${i}-1`,
        timestamp: new Date(pastDate.getTime() + 10 * 3600000).toISOString(),
        dateStr: pastStr,
        exercise: 'standard_pushup',
        reps: 25,
        durationSeconds: 45,
        mode: 'camera_vision',
        accuracyScore: 92
      });

      starterSessions.push({
        id: `seed-${i}-2`,
        timestamp: new Date(pastDate.getTime() + 16 * 3600000).toISOString(),
        dateStr: pastStr,
        exercise: 'raw_pushup',
        reps: 15,
        durationSeconds: 35,
        mode: 'quick_log',
        accuracyScore: 88
      });

      starterSessions.push({
        id: `seed-${i}-3`,
        timestamp: new Date(pastDate.getTime() + 17 * 3600000).toISOString(),
        dateStr: pastStr,
        exercise: 'plank',
        reps: 60,
        durationSeconds: 60,
        mode: 'camera_vision',
        accuracyScore: 96
      });
    }

    return starterSessions;
  });

  // 4. Friends State
  const [friendsList, setFriendsList] = useState<Omit<LeaderboardUser, 'isCurrentUser'>[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_COMMUNITY_USERS;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friendsList));
  }, [friendsList]);

  // Derived stats: Today
  const todaySessions = useMemo(() => {
    return sessions.filter(s => s.dateStr === todayStr);
  }, [sessions, todayStr]);

  const todayPushups = useMemo(() => {
    return todaySessions
      .filter(s => s.exercise === 'standard_pushup' || s.exercise === 'raw_pushup')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [todaySessions]);

  const todayRawPushups = useMemo(() => {
    return todaySessions
      .filter(s => s.exercise === 'raw_pushup')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [todaySessions]);

  const todayStandardPushups = useMemo(() => {
    return todaySessions
      .filter(s => s.exercise === 'standard_pushup')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [todaySessions]);

  const todayPlankSeconds = useMemo(() => {
    return todaySessions
      .filter(s => s.exercise === 'plank')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [todaySessions]);

  // Derived stats: This Week
  const startOfWeek = useMemo(() => getStartOfWeek(new Date()), []);
  const startOfWeekStr = useMemo(() => {
    return `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
  }, [startOfWeek]);

  const weekSessions = useMemo(() => {
    return sessions.filter(s => s.dateStr >= startOfWeekStr);
  }, [sessions, startOfWeekStr]);

  const weekPushups = useMemo(() => {
    return weekSessions
      .filter(s => s.exercise === 'standard_pushup' || s.exercise === 'raw_pushup')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [weekSessions]);

  const weekRawPushups = useMemo(() => {
    return weekSessions
      .filter(s => s.exercise === 'raw_pushup')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [weekSessions]);

  const weekStandardPushups = useMemo(() => {
    return weekSessions
      .filter(s => s.exercise === 'standard_pushup')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [weekSessions]);

  const weekPlankSeconds = useMemo(() => {
    return weekSessions
      .filter(s => s.exercise === 'plank')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [weekSessions]);

  // Total stats
  const totalPushups = useMemo(() => {
    return sessions
      .filter(s => s.exercise === 'standard_pushup' || s.exercise === 'raw_pushup')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [sessions]);

  const totalPlankSeconds = useMemo(() => {
    return sessions
      .filter(s => s.exercise === 'plank')
      .reduce((acc, s) => acc + s.reps, 0);
  }, [sessions]);

  // Progress Percentages
  const dailyPushupProgress = useMemo(() => {
    if (goals.dailyPushups <= 0) return 0;
    return Math.round((todayPushups / goals.dailyPushups) * 100);
  }, [todayPushups, goals.dailyPushups]);

  const weeklyPushupProgress = useMemo(() => {
    if (goals.weeklyPushups <= 0) return 0;
    return Math.round((weekPushups / goals.weeklyPushups) * 100);
  }, [weekPushups, goals.weeklyPushups]);

  const dailyPlankProgress = useMemo(() => {
    if (goals.dailyPlankSeconds <= 0) return 0;
    return Math.round((todayPlankSeconds / goals.dailyPlankSeconds) * 100);
  }, [todayPlankSeconds, goals.dailyPlankSeconds]);

  const weeklyPlankProgress = useMemo(() => {
    if (goals.weeklyPlankSeconds <= 0) return 0;
    return Math.round((weekPlankSeconds / goals.weeklyPlankSeconds) * 100);
  }, [weekPlankSeconds, goals.weeklyPlankSeconds]);

  // Streak Calculation
  const { currentStreak, bestStreak } = useMemo(() => {
    const datesWithActivity = new Set(sessions.map(s => s.dateStr));
    const sortedDates = Array.from(datesWithActivity).sort().reverse();
    
    if (sortedDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    let streak = 0;
    let checkDate = new Date();
    
    // Check if worked out today
    const workedOutToday = datesWithActivity.has(todayStr);
    if (!workedOutToday) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (!datesWithActivity.has(yesterdayStr)) {
        return { currentStreak: 0, bestStreak: Math.max(1, sortedDates.length) };
      }
    }

    // Traverse backwards day by day
    while (true) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (datesWithActivity.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      bestStreak: Math.max(streak, 4) // starter seed had 4 continuous days
    };
  }, [sessions, todayStr]);

  // Personal Records
  const personalRecords = useMemo(() => {
    let maxSingleSetPushups = 0;
    let maxSinglePlankSeconds = 0;
    
    const dailyMap: Record<string, number> = {};

    sessions.forEach(s => {
      if (s.exercise === 'standard_pushup' || s.exercise === 'raw_pushup') {
        if (s.reps > maxSingleSetPushups) maxSingleSetPushups = s.reps;
        dailyMap[s.dateStr] = (dailyMap[s.dateStr] || 0) + s.reps;
      } else if (s.exercise === 'plank') {
        if (s.reps > maxSinglePlankSeconds) maxSinglePlankSeconds = s.reps;
      }
    });

    const maxDailyPushups = Math.max(0, ...Object.values(dailyMap));

    return {
      maxSingleSetPushups,
      maxDailyPushups,
      maxSinglePlankSeconds,
      bestStreak
    };
  }, [sessions, bestStreak]);

  // Combined Leaderboard with current user
  const friends: LeaderboardUser[] = useMemo(() => {
    const currentUserEntry: LeaderboardUser = {
      id: 'current-user',
      username: profile.username || 'You',
      avatar: profile.avatar || '🦾',
      isCurrentUser: true,
      dailyReps: todayPushups,
      weeklyReps: weekPushups,
      totalReps: totalPushups,
      rawPushups: sessions.filter(s => s.exercise === 'raw_pushup').reduce((a, b) => a + b.reps, 0),
      standardPushups: sessions.filter(s => s.exercise === 'standard_pushup').reduce((a, b) => a + b.reps, 0),
      plankSeconds: totalPlankSeconds,
      streak: currentStreak,
      badge: currentStreak >= 5 ? 'Streak Master' : 'Challenger',
      statusText: `Today: ${todayPushups} reps (${dailyPushupProgress}% of goal)`
    };

    const all = [
      currentUserEntry,
      ...friendsList.map(f => ({ ...f, isCurrentUser: false }))
    ];

    return all;
  }, [profile, todayPushups, weekPushups, totalPushups, sessions, totalPlankSeconds, currentStreak, dailyPushupProgress, friendsList]);

  // Handlers
  const updateUsername = useCallback((username: string, avatar?: string) => {
    setProfile(prev => ({
      ...prev,
      username: username.trim() || 'Warrior',
      ...(avatar ? { avatar } : {})
    }));
  }, []);

  const updateGoals = useCallback((newGoals: Partial<UserGoals>) => {
    setGoals(prev => ({ ...prev, ...newGoals }));
  }, []);

  const logSession = useCallback((sessionData: Omit<WorkoutSession, 'id' | 'timestamp' | 'dateStr'>) => {
    const prevTodayPushups = todayPushups;
    const isPushup = sessionData.exercise === 'standard_pushup' || sessionData.exercise === 'raw_pushup';

    const newSession: WorkoutSession = {
      ...sessionData,
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      dateStr: todayStr
    };

    setSessions(prev => [newSession, ...prev]);

    // Check if daily goal is achieved with this new session
    if (isPushup && goals.dailyPushups > 0) {
      const newTotal = prevTodayPushups + sessionData.reps;
      if (prevTodayPushups < goals.dailyPushups && newTotal >= goals.dailyPushups) {
        // First time hitting daily goal today! Fire confetti & celebratory audio!
        playGoalCelebration();
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [todayPushups, goals.dailyPushups, todayStr]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const addFriend = useCallback((friend: { username: string; avatar: string; dailyReps: number; weeklyReps: number; plankSeconds: number }) => {
    const newFriend: Omit<LeaderboardUser, 'isCurrentUser'> = {
      id: `friend-${Date.now()}`,
      username: friend.username,
      avatar: friend.avatar || '⚡',
      dailyReps: friend.dailyReps || 0,
      weeklyReps: friend.weeklyReps || 0,
      totalReps: (friend.weeklyReps || 0) * 3,
      rawPushups: Math.round((friend.dailyReps || 0) * 0.4),
      standardPushups: Math.round((friend.dailyReps || 0) * 0.6),
      plankSeconds: friend.plankSeconds || 0,
      streak: 1,
      badge: 'Iron Cadet',
      statusText: 'Just connected'
    };
    setFriendsList(prev => [newFriend, ...prev]);
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        profile,
        goals,
        sessions,
        friends,
        updateUsername,
        updateGoals,
        logSession,
        deleteSession,
        addFriend,
        todayStr,
        todayPushups,
        todayRawPushups,
        todayStandardPushups,
        todayPlankSeconds,
        weekPushups,
        weekRawPushups,
        weekStandardPushups,
        weekPlankSeconds,
        totalPushups,
        totalPlankSeconds,
        dailyPushupProgress,
        weeklyPushupProgress,
        dailyPlankProgress,
        weeklyPlankProgress,
        currentStreak,
        bestStreak,
        personalRecords
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
