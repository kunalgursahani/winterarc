export interface DailyLog {
  date: string;
  workouts: string[];
  weight: number | null;
  protein: number | null;
  steps: number | null;
  notes?: string;
}

export interface UserGoals {
  targetWeight: number | null;
  dailyProtein: number;
  dailySteps: number;
  workoutsPerWeek: number;
}

export const WORKOUT_TYPES = [
  "Push (Chest/Shoulders/Triceps)",
  "Pull (Back/Biceps)",
  "Legs",
  "Upper Body",
  "Lower Body",
  "Full Body",
  "Cardio",
  "HIIT",
  "Core/Abs",
  "Mobility/Stretch",
  "Rest Day",
  "Other",
] as const;

export const DEFAULT_GOALS: UserGoals = {
  targetWeight: null,
  dailyProtein: 150,
  dailySteps: 10000,
  workoutsPerWeek: 4,
};

export interface DashboardPayload {
  goals: UserGoals;
  logs: DailyLog[];
}
