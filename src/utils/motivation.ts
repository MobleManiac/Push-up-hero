export interface Quote {
  quote: string;
  author: string;
  category: 'discipline' | 'grit' | 'strength' | 'focus';
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    quote: "You don't have to be extreme, just consistent. One rep today is infinitely better than zero.",
    author: "Arnold Schwarzenegger",
    category: "discipline"
  },
  {
    quote: "Don't count the days, make the days count. The body achieves what the mind believes.",
    author: "Muhammad Ali",
    category: "grit"
  },
  {
    quote: "When you feel like quitting, remember why you started. Push past the burn.",
    author: "David Goggins",
    category: "grit"
  },
  {
    quote: "Discipline equals freedom. Put the work in when no one is watching.",
    author: "Jocko Willink",
    category: "discipline"
  },
  {
    quote: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.",
    author: "Bruce Lee",
    category: "strength"
  },
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant (on Aristotle)",
    category: "focus"
  },
  {
    quote: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Iron Mindset",
    category: "strength"
  },
  {
    quote: "Fall in love with the process and the results will come. Lock in.",
    author: "Marcus Aurelius",
    category: "focus"
  }
];

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}

export function getMotivationalStatus(completed: number, goal: number): {
  message: string;
  subtext: string;
  badge: string;
  color: string;
} {
  if (goal <= 0) {
    return {
      message: "Set your daily goal to begin your ascent!",
      subtext: "Every champion starts with a clear target.",
      badge: "Target Ready",
      color: "zinc"
    };
  }

  const percentage = Math.round((completed / goal) * 100);

  if (completed === 0) {
    return {
      message: "Zero reps logged yet. The floor is calling!",
      subtext: "Drop and get your first set in. Momentum starts now.",
      badge: "Warmup Time",
      color: "amber"
    };
  }

  if (percentage < 25) {
    return {
      message: "First spark ignited! Keep the rhythm going.",
      subtext: `${completed} of ${goal} reps down. Build that streak!`,
      badge: "Underway",
      color: "amber"
    };
  }

  if (percentage < 50) {
    return {
      message: "Building serious heat. Solid cadence!",
      subtext: `${goal - completed} more reps to hit your daily mission.`,
      badge: "In The Zone",
      color: "amber"
    };
  }

  if (percentage < 75) {
    return {
      message: "Over halfway there! The hardest part is behind you.",
      subtext: "Stay locked in. Form over ego, rep by rep.",
      badge: "Over Halfway",
      color: "emerald"
    };
  }

  if (percentage < 100) {
    return {
      message: "Striking distance! Finish today's mission!",
      subtext: `Only ${goal - completed} reps remaining to seal today's victory.`,
      badge: "Final Stretch",
      color: "emerald"
    };
  }

  if (percentage === 100) {
    return {
      message: "GOAL CRUSHED! 🎯 Today is conquered!",
      subtext: "Mission accomplished. Your discipline is legendary.",
      badge: "100% Conquered",
      color: "emerald"
    };
  }

  return {
    message: `BEAST MODE! ${percentage}% of daily goal!`,
    subtext: `${completed - goal} bonus reps in the bank. You're unstoppable!`,
    badge: "Overdelivery",
    color: "cyan"
  };
}

export interface UserRankTier {
  minReps: number;
  title: string;
  badgeColor: string;
  icon: string;
}

export const RANK_TIERS: UserRankTier[] = [
  { minReps: 0, title: 'Novice Recruit', badgeColor: 'bg-zinc-800 text-zinc-300', icon: '🌱' },
  { minReps: 100, title: 'Iron Cadet', badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-500/40', icon: '⚔️' },
  { minReps: 300, title: 'Push-up Grinder', badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40', icon: '💪' },
  { minReps: 750, title: 'Core Striker', badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-500/40', icon: '⚡' },
  { minReps: 1500, title: 'Spartan Beast', badgeColor: 'bg-orange-900/40 text-orange-300 border-orange-500/40', icon: '🔥' },
  { minReps: 3000, title: 'Titan of Iron', badgeColor: 'bg-purple-900/40 text-purple-300 border-purple-500/40', icon: '👑' },
  { minReps: 5000, title: 'Push-up Deity', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400', icon: '🏆' }
];

export function getRankTier(totalReps: number): UserRankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (totalReps >= RANK_TIERS[i].minReps) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}
