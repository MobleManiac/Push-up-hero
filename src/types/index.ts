export type ExerciseType = 'raw_pushup' | 'standard_pushup' | 'plank';

export interface ExerciseInfo {
  id: ExerciseType;
  name: string;
  shortName: string;
  unit: string;
  description: string;
  formCriteria: string;
  iconName: string;
  color: string;
}

export const EXERCISES: Record<ExerciseType, ExerciseInfo> = {
  raw_pushup: {
    id: 'raw_pushup',
    name: 'Raw Push-ups',
    shortName: 'Raw',
    unit: 'reps',
    description: 'Strict chest-to-deck dead-stop push-ups with full explosive lockout. No momentum, pure raw power.',
    formCriteria: 'Chest touches floor (<75° elbow), full lock at top (>165°)',
    iconName: 'Flame',
    color: 'amber'
  },
  standard_pushup: {
    id: 'standard_pushup',
    name: 'Standard Push-ups',
    shortName: 'Standard',
    unit: 'reps',
    description: 'Classic military cadence push-ups. 90-degree arm bend, straight torso, consistent rhythm.',
    formCriteria: 'Elbows break 90° (<95° elbow), full lock at top (>160°)',
    iconName: 'Shield',
    color: 'emerald'
  },
  plank: {
    id: 'plank',
    name: 'Planks',
    shortName: 'Plank',
    unit: 'sec',
    description: 'Isometric forearm/high plank hold. Core locked, glutes engaged, flat spine.',
    formCriteria: 'Straight spine alignment (<15° hip deviation), hold tension',
    iconName: 'Activity',
    color: 'cyan'
  }
};

export interface WorkoutSession {
  id: string;
  timestamp: string; // ISO
  dateStr: string;   // YYYY-MM-DD
  exercise: ExerciseType;
  reps: number;      // count for pushups, seconds for plank
  durationSeconds: number;
  mode: 'camera_vision' | 'screen_tap' | 'quick_log';
  accuracyScore?: number;
  notes?: string;
}

export interface UserGoals {
  dailyPushups: number;    // e.g. 50 (any number)
  weeklyPushups: number;   // e.g. 350 (any number)
  dailyPlankSeconds: number; // e.g. 120s
  weeklyPlankSeconds: number; // e.g. 840s
  preferredExercise: ExerciseType;
}

export interface UserProfile {
  username: string;
  avatar: string;
  joinedDate: string;
  level: number;
  title: string;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  isCurrentUser: boolean;
  dailyReps: number;
  weeklyReps: number;
  totalReps: number;
  rawPushups: number;
  standardPushups: number;
  plankSeconds: number;
  streak: number;
  badge: string;
  statusText: string;
}
