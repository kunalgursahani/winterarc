import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Brain, CalendarDays, ChartLine, Cloud, Flame, LayoutDashboard, Share2, Snowflake, Trophy } from "lucide-react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDashboard, saveGoals, saveLog } from "@/lib/winterarc-fns";
import type { DailyLog, DashboardPayload, UserGoals } from "@/lib/types";
import { getLoggedDates, getWorkoutStats } from "@/lib/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar } from "./Calendar";
import { DailyLogForm } from "./DailyLogForm";
import { Analytics } from "./Analytics";
import { GoalsEditor } from "./GoalsEditor";
import { MindsetCoach } from "./MindsetCoach";
import { PersonalRecords } from "./PersonalRecords";
import { Milestones } from "./Milestones";
import { ShareCardGenerator } from "./ShareCardGenerator";
import { CalorieTracker } from "./CalorieTracker";

type Tab = "log" | "analytics" | "calories" | "prs" | "mindset" | "milestones" | "share" | "goals";

const SEASON_START = new Date(2026, 9, 1);
const SEASON_END = new Date(2026, 11, 31);

function defaultDate() {
  const now = new Date();
  if (now >= SEASON_START && now <= SEASON_END) return now;
  return SEASON_START;
}

export function Dashboard() {
  const { user, isPending } = useCurrentUserState();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("log");
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [viewMonth, setViewMonth] = useState(() => new Date(2026, 9, 1));

  const dashQuery = useQuery<DashboardPayload>({
    queryKey: ["winterarc", user?.id],
    queryFn: () => getDashboard(),
    enabled: Boolean(user),
  });

  const logMutation = useMutation({
    mutationFn: (log: DailyLog) => saveLog({ data: log }),
    onSuccess: (saved) => {
      queryClient.setQueryData<DashboardPayload>(["winterarc", user?.id], (prev) => {
        if (!prev) return prev;
        const rest = prev.logs.filter((l) => l.date !== saved.date);
        return { ...prev, logs: [...rest, saved].sort((a, b) => a.date.localeCompare(b.date)) };
      });
    },
  });

  const goalsMutation = useMutation({
    mutationFn: (goals: UserGoals) => saveGoals({ data: goals }),
    onSuccess: (goals) => {
      queryClient.setQueryData<DashboardPayload>(["winterarc", user?.id], (prev) =>
        prev ? { ...prev, goals } : prev,
      );
    },
  });

  const logs = dashQuery.data?.logs ?? [];
  const goals = dashQuery.data?.goals;
  const loggedDays = getLoggedDates(logs).size;
  const workoutStats = getWorkoutStats(logs);

  const tabs = useMemo(
    () => [
      { id: "log" as const, label: "Log", icon: CalendarDays },
      { id: "analytics" as const, label: "Analytics", icon: ChartLine },
      { id: "calories" as const, label: "AI Calories", icon: Flame },
      { id: "prs" as const, label: "PR Vault", icon: Trophy },
      { id: "mindset" as const, label: "AI Coach", icon: Brain },
      { id: "milestones" as const, label: "Milestones", icon: Award },
      { id: "share" as const, label: "Share Card", icon: Share2 },
      { id: "goals" as const, label: "Goals", icon: LayoutDashboard },
    ],
    [],
  );

  if (isPending) {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface">
                <Snowflake className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-lg font-medium leading-none tracking-[0.08em] sm:text-xl">WINTER ARC</h1>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-subtle">Training journal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-xs text-subtle sm:flex">
                <Cloud className="h-3.5 w-3.5" />
                Synced to your account
              </span>
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </header>
        <div className="min-h-screen bg-bg px-4 py-10">
          <Skeleton className="mx-auto h-12 w-64" />
          <Skeleton className="mx-auto mt-8 h-80 max-w-5xl" />
        </div>
      </div>
    );
  }

  if (!user) return <RedirectToSignIn />;

  const pageCopy = {
    log: {
      eyebrow: "Your training season",
      title: "Your season, in focus.",
      description: "A clear record of the work you put in, one day at a time.",
    },
    analytics: {
      eyebrow: "The bigger picture",
      title: "Progress, in perspective.",
      description: "Notice the patterns. Keep what works. Adjust as you go.",
    },
    calories: {
      eyebrow: "AI Calorie & Macro Estimator",
      title: "Fuel your performance.",
      description: "Smart AI meal estimation, macro breakdown, and high-protein presets.",
    },
    prs: {
      eyebrow: "Personal Bests Vault",
      title: "Break your limits.",
      description: "Track your heavy lifts, run times, and personal records across the Arc.",
    },
    mindset: {
      eyebrow: "Winter Mindset & AI Audit",
      title: "Cold focus & discipline.",
      description: "Daily mindset philosophy and automated tactical feedback for your arc.",
    },
    milestones: {
      eyebrow: "Discipline Ranks & Badges",
      title: "Unlock your potential.",
      description: "Earn ranks, track unlocked achievements, and export your data.",
    },
    share: {
      eyebrow: "Social Media Share Card",
      title: "Showcase your progress.",
      description: "Generate beautiful high-res progress cards for Instagram, X, and stories.",
    },
    goals: {
      eyebrow: "Your personal standard",
      title: "Set a direction.",
      description: "Choose a few meaningful targets and make them your own.",
    },
  }[tab];

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface">
              <Snowflake className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-lg font-medium leading-none tracking-[0.08em] sm:text-xl">WINTER ARC</h1>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-subtle">Training journal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-subtle sm:flex">
              <Cloud className="h-3.5 w-3.5" />
              Synced to your account
            </span>
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
        <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl overflow-x-auto justify-start gap-1 border-t border-border px-3 sm:px-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors duration-150 sm:text-sm",
                tab === id
                  ? "border-accent text-fg"
                  : "border-transparent text-subtle hover:text-fg",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 sm:pb-14 sm:pt-10">
        <section className="mb-7 border-b border-border pb-7 sm:mb-9 sm:pb-9 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-subtle sm:text-[11px]">
              <span className="h-px w-6 bg-accent/60" />
              {pageCopy.eyebrow}
              <span className="text-border-strong">/</span>
              Oct—Dec 2026
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg sm:text-5xl">
              {pageCopy.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base">
              {pageCopy.description}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:mt-0 lg:w-80 lg:shrink-0">
            <div className="bg-surface px-4 py-3.5 sm:px-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Days recorded</p>
              <p className="mt-1.5 font-display text-2xl tabular-nums text-fg">{loggedDays}</p>
            </div>
            <div className="bg-surface px-4 py-3.5 sm:px-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Sessions</p>
              <p className="mt-1.5 font-display text-2xl tabular-nums text-fg">{workoutStats.totalWorkouts}</p>
            </div>
          </div>
        </section>

        {dashQuery.isLoading && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        )}

        {dashQuery.isError && (
          <div className="rounded-md border border-danger/40 bg-surface p-4 text-sm text-danger">
            <p>Could not load your logs.</p>
            <p className="mt-1 text-subtle">
              Please try again. If this continues, check the database configuration.
            </p>
          </div>
        )}

        {dashQuery.data && goals && tab === "log" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Calendar
              logs={logs}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              viewMonth={viewMonth}
              onChangeMonth={setViewMonth}
            />
            <DailyLogForm
              logs={logs}
              selectedDate={selectedDate}
              saving={logMutation.isPending}
              onSave={async (log) => {
                await logMutation.mutateAsync(log);
              }}
            />
          </div>
        )}

        {dashQuery.data && goals && tab === "analytics" && <Analytics logs={logs} goals={goals} />}

        {dashQuery.data && goals && tab === "calories" && (
          <CalorieTracker
            logs={logs}
            goals={goals}
            onSaveLog={async (l) => {
              await logMutation.mutateAsync(l);
            }}
          />
        )}

        {dashQuery.data && goals && tab === "prs" && <PersonalRecords logs={logs} />}

        {dashQuery.data && goals && tab === "mindset" && <MindsetCoach logs={logs} goals={goals} />}

        {dashQuery.data && goals && tab === "milestones" && <Milestones logs={logs} goals={goals} />}

        {dashQuery.data && goals && tab === "share" && <ShareCardGenerator logs={logs} goals={goals} />}

        {dashQuery.data && goals && tab === "goals" && (
          <GoalsEditor
            goals={goals}
            onSave={async (g) => {
              await goalsMutation.mutateAsync(g);
            }}
          />
        )}
      </main>
    </div>
  );
}
