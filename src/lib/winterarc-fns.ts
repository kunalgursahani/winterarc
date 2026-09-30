import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase.server";
import { authMiddleware } from "@/lib/auth/middleware";
import { DEFAULT_GOALS, type DailyLog, type DashboardPayload, type UserGoals } from "@/lib/types";

type ProfileRow = {
  target_weight: number | null;
  daily_protein: number;
  daily_steps: number;
  workouts_per_week: number;
};

type LogRow = {
  log_date: string;
  workouts: unknown;
  weight: number | null;
  protein: number | null;
  steps: number | null;
  notes: string | null;
};

function parseWorkouts(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    } catch {
      return [];
    }
  }
  return [];
}

function toGoals(row: ProfileRow | undefined): UserGoals {
  if (!row) return { ...DEFAULT_GOALS };
  return {
    targetWeight: row.target_weight,
    dailyProtein: row.daily_protein,
    dailySteps: row.daily_steps,
    workoutsPerWeek: row.workouts_per_week,
  };
}

function n(v: number | null): number | null {
  if (v == null || Number.isNaN(Number(v))) return null;
  return Math.round(Number(v) * 10) / 10;
}
function toLog(row: LogRow): DailyLog {
  return {
    date: typeof row.log_date === "string" ? row.log_date.slice(0, 10) : String(row.log_date),
    workouts: parseWorkouts(row.workouts),
    weight: n(row.weight),
    protein: n(row.protein),
    steps: row.steps,
    notes: row.notes ?? undefined,
  };
}

async function ensureProfile(userId: string) {
  if (!isSupabaseConfigured()) {
    const sql = await getSql();
    await sql`
      insert into winterarc_profiles (user_id)
      values (${userId})
      on conflict (user_id) do nothing
    `;
    return;
  }

  const { error } = await getSupabase()
    .from("winterarc_profiles")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw error;
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardPayload> => {
    await ensureProfile(context.userId);
    if (!isSupabaseConfigured()) {
      const sql = await getSql();
      const profiles = await sql<ProfileRow>`
        select target_weight, daily_protein, daily_steps, workouts_per_week
        from winterarc_profiles
        where user_id = ${context.userId}
      `;
      const logs = await sql<LogRow>`
        select log_date, workouts, weight, protein, steps, notes
        from winterarc_logs
        where user_id = ${context.userId}
        order by log_date asc
      `;
      return {
        goals: toGoals(profiles[0]),
        logs: logs.map(toLog),
      };
    }

    const supabase = getSupabase();
    const { data: profile, error: profileError } = await supabase
      .from("winterarc_profiles")
      .select("target_weight, daily_protein, daily_steps, workouts_per_week")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (profileError) throw profileError;

    const { data: logs, error: logsError } = await supabase
      .from("winterarc_logs")
      .select("log_date, workouts, weight, protein, steps, notes")
      .eq("user_id", context.userId)
      .order("log_date", { ascending: true });
    if (logsError) throw logsError;

    return {
      goals: toGoals(profile as ProfileRow | null ?? undefined),
      logs: (logs as LogRow[] | null ?? []).map(toLog),
    };
  });

export const saveLog = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: DailyLog) => input)
  .handler(async ({ context, data }): Promise<DailyLog> => {
    const notes = data.notes?.trim() ? data.notes.trim() : null;
    if (!isSupabaseConfigured()) {
      const sql = await getSql();
      const workoutsJson = JSON.stringify(data.workouts ?? []);
      await sql`
        insert into winterarc_logs (user_id, log_date, workouts, weight, protein, steps, notes, updated_at)
        values (
          ${context.userId},
          ${data.date}::date,
          ${workoutsJson}::jsonb,
          ${data.weight},
          ${data.protein},
          ${data.steps},
          ${notes},
          now()
        )
        on conflict (user_id, log_date) do update set
          workouts = excluded.workouts,
          weight = excluded.weight,
          protein = excluded.protein,
          steps = excluded.steps,
          notes = excluded.notes,
          updated_at = now()
      `;
      return {
        date: data.date,
        workouts: data.workouts ?? [],
        weight: data.weight,
        protein: data.protein,
        steps: data.steps,
        notes: notes ?? undefined,
      };
    }

    const { error } = await getSupabase()
      .from("winterarc_logs")
      .upsert(
        {
          user_id: context.userId,
          log_date: data.date,
          workouts: data.workouts ?? [],
          weight: data.weight,
          protein: data.protein,
          steps: data.steps,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,log_date" },
      );
    if (error) throw error;

    return {
      date: data.date,
      workouts: data.workouts ?? [],
      weight: data.weight,
      protein: data.protein,
      steps: data.steps,
      notes: notes ?? undefined,
    };
  });

export const saveGoals = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: UserGoals) => input)
  .handler(async ({ context, data }): Promise<UserGoals> => {
    if (!isSupabaseConfigured()) {
      const sql = await getSql();
      await sql`
        insert into winterarc_profiles (
          user_id, target_weight, daily_protein, daily_steps, workouts_per_week, updated_at
        )
        values (
          ${context.userId},
          ${data.targetWeight},
          ${data.dailyProtein},
          ${data.dailySteps},
          ${data.workoutsPerWeek},
          now()
        )
        on conflict (user_id) do update set
          target_weight = excluded.target_weight,
          daily_protein = excluded.daily_protein,
          daily_steps = excluded.daily_steps,
          workouts_per_week = excluded.workouts_per_week,
          updated_at = now()
      `;
      return data;
    }

    const { error } = await getSupabase()
      .from("winterarc_profiles")
      .upsert(
        {
          user_id: context.userId,
          target_weight: data.targetWeight,
          daily_protein: data.dailyProtein,
          daily_steps: data.dailySteps,
          workouts_per_week: data.workoutsPerWeek,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    if (error) throw error;

    return data;
  });
