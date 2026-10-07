export interface DailyLog {
  date: string;
  workouts: string[];
  weight: number | null;
  protein: number | null;
  steps: number | null;
  waterMl?: number | null;
  sleepHours?: number | null;
  sleepQuality?: "Great" | "Good" | "Fair" | "Poor" | null;
  prs?: Record<string, number>;
  calories?: number | null;
  carbs?: number | null;
  fats?: number | null;
  notes?: string;
}

export interface UserGoals {
  targetWeight: number | null;
  dailyProtein: number;
  dailySteps: number;
  workoutsPerWeek: number;
  dailyWater?: number;
  dailySleep?: number;
  dailyCalories?: number;
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

export const COMMON_EXERCISES = [
  "Bench Press (kg)",
  "Squat (kg)",
  "Deadlift (kg)",
  "Overhead Press (kg)",
  "Pull-ups (reps)",
  "5km Run (min)",
] as const;

export const DEFAULT_GOALS: UserGoals = {
  targetWeight: null,
  dailyProtein: 150,
  dailySteps: 10000,
  workoutsPerWeek: 4,
  dailyWater: 3000,
  dailySleep: 8,
  dailyCalories: 2500,
};

export interface DashboardPayload {
  goals: UserGoals;
  logs: DailyLog[];
}

export function parseLogNotes(rawNotes?: string | null): {
  notes?: string;
  waterMl?: number | null;
  sleepHours?: number | null;
  sleepQuality?: "Great" | "Good" | "Fair" | "Poor" | null;
  prs?: Record<string, number>;
  calories?: number | null;
  carbs?: number | null;
  fats?: number | null;
} {
  if (!rawNotes) return {};
  const metaMatch = rawNotes.match(/^<!--META:(.*?)-->\n?/s);
  if (!metaMatch) return { notes: rawNotes };

  const cleanNotes = rawNotes.replace(/^<!--META:(.*?)-->\n?/s, "").trim();
  try {
    const meta = JSON.parse(metaMatch[1]);
    return {
      notes: cleanNotes || undefined,
      waterMl: meta.waterMl ?? null,
      sleepHours: meta.sleepHours ?? null,
      sleepQuality: meta.sleepQuality ?? null,
      prs: meta.prs ?? {},
      calories: meta.calories ?? null,
      carbs: meta.carbs ?? null,
      fats: meta.fats ?? null,
    };
  } catch {
    return { notes: rawNotes };
  }
}

export function formatLogNotes(
  notes?: string | null,
  meta?: {
    waterMl?: number | null;
    sleepHours?: number | null;
    sleepQuality?: "Great" | "Good" | "Fair" | "Poor" | null;
    prs?: Record<string, number>;
    calories?: number | null;
    carbs?: number | null;
    fats?: number | null;
  }
): string | undefined {
  const cleanNotes = notes?.trim() || "";
  const metaObj: Record<string, unknown> = {};
  if (meta?.waterMl != null) metaObj.waterMl = meta.waterMl;
  if (meta?.sleepHours != null) metaObj.sleepHours = meta.sleepHours;
  if (meta?.sleepQuality != null) metaObj.sleepQuality = meta.sleepQuality;
  if (meta?.prs && Object.keys(meta.prs).length > 0) metaObj.prs = meta.prs;
  if (meta?.calories != null) metaObj.calories = meta.calories;
  if (meta?.carbs != null) metaObj.carbs = meta.carbs;
  if (meta?.fats != null) metaObj.fats = meta.fats;

  if (Object.keys(metaObj).length === 0) {
    return cleanNotes || undefined;
  }

  const metaTag = `<!--META:${JSON.stringify(metaObj)}-->`;
  return cleanNotes ? `${metaTag}\n${cleanNotes}` : metaTag;
}

