import { format, parseISO } from "date-fns";
import type { DailyLog } from "./types";

export function emptyLog(date: string): DailyLog {
  return { date, workouts: [], weight: null, protein: null, steps: null };
}

export function getLog(logs: DailyLog[], date: string): DailyLog {
  return logs.find((l) => l.date === date) ?? emptyLog(date);
}

export function getLoggedDates(logs: DailyLog[]): Set<string> {
  return new Set(
    logs
      .filter(
        (log) =>
          (log.workouts && log.workouts.length > 0) ||
          log.weight != null ||
          log.protein != null ||
          log.steps != null,
      )
      .map((l) => l.date),
  );
}

export function getWeightSeries(logs: DailyLog[]) {
  return logs
    .filter((l) => l.weight != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({
      date: l.date,
      weight: l.weight as number,
      label: format(parseISO(l.date), "MMM d"),
    }));
}

export function getProteinSeries(logs: DailyLog[]) {
  return logs
    .filter((l) => l.protein != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({
      date: l.date,
      protein: l.protein as number,
      label: format(parseISO(l.date), "MMM d"),
    }));
}

export function getStepsSeries(logs: DailyLog[]) {
  return logs
    .filter((l) => l.steps != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({
      date: l.date,
      steps: l.steps as number,
      label: format(parseISO(l.date), "MMM d"),
    }));
}

export function getWorkoutStats(logs: DailyLog[]) {
  const workoutDays = logs.filter(
    (l) => l.workouts && l.workouts.length > 0 && !l.workouts.includes("Rest Day"),
  );
  const restDays = logs.filter((l) => l.workouts?.includes("Rest Day"));
  const totalWorkouts = workoutDays.reduce(
    (acc, l) => acc + l.workouts.filter((w) => w !== "Rest Day").length,
    0,
  );
  return {
    workoutDays: workoutDays.length,
    restDays: restDays.length,
    totalWorkouts,
  };
}

export function getWeightChange(logs: DailyLog[]): {
  start: number | null;
  current: number | null;
  change: number | null;
} {
  const series = getWeightSeries(logs);
  if (series.length === 0) return { start: null, current: null, change: null };
  const start = series[0].weight;
  const current = series[series.length - 1].weight;
  return { start, current, change: Math.round((current - start) * 10) / 10 };
}

export function getAverages(logs: DailyLog[]) {
  const proteins = logs.filter((l) => l.protein != null).map((l) => l.protein as number);
  const steps = logs.filter((l) => l.steps != null).map((l) => l.steps as number);
  return {
    avgProtein: proteins.length
      ? Math.round(proteins.reduce((a, b) => a + b, 0) / proteins.length)
      : null,
    avgSteps: steps.length ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length) : null,
  };
}
