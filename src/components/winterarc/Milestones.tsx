import { useMemo } from "react";
import { Award, CheckCircle2, Download, Flame, Footprints, Shield, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyLog, UserGoals } from "@/lib/types";
import { getLoggedDates, getWorkoutStats } from "@/lib/stats";

interface Props {
  logs: DailyLog[];
  goals: UserGoals;
}

export function Milestones({ logs, goals }: Props) {
  const loggedDays = useMemo(() => getLoggedDates(logs).size, [logs]);
  const stats = useMemo(() => getWorkoutStats(logs), [logs]);

  // Calculate totals
  const totalSteps = useMemo(() => {
    return logs.reduce((sum, l) => sum + (l.steps ?? 0), 0);
  }, [logs]);

  const totalWater = useMemo(() => {
    return logs.reduce((sum, l) => sum + (l.waterMl ?? 0), 0);
  }, [logs]);

  const proteinHits = useMemo(() => {
    return logs.filter((l) => (l.protein ?? 0) >= goals.dailyProtein).length;
  }, [logs, goals]);

  // Discipline Rank Calculation
  const rank = useMemo(() => {
    if (loggedDays >= 25) return { title: "Winter Sovereign", level: 4, color: "text-amber-400 border-amber-400/40 bg-amber-500/10" };
    if (loggedDays >= 12) return { title: "Iron Monk", level: 3, color: "text-indigo-400 border-indigo-400/40 bg-indigo-500/10" };
    if (loggedDays >= 5) return { title: "Cold Warrior", level: 2, color: "text-sky-400 border-sky-400/40 bg-sky-500/10" };
    return { title: "Novice Arc", level: 1, color: "text-muted border-border bg-surface" };
  }, [loggedDays]);

  // Badges list
  const badges = [
    {
      id: "first_blood",
      title: "First Blood",
      description: "Logged your first workout session",
      icon: Shield,
      unlocked: stats.totalWorkouts >= 1,
      progress: `${Math.min(stats.totalWorkouts, 1)}/1`,
    },
    {
      id: "streak_7",
      title: "Unstoppable",
      description: "Completed 7 or more workout sessions",
      icon: Flame,
      unlocked: stats.totalWorkouts >= 7,
      progress: `${Math.min(stats.totalWorkouts, 7)}/7`,
    },
    {
      id: "protein_master",
      title: "Hypertrophy Fuel",
      description: `Hit protein goal (${goals.dailyProtein}g) 5 times`,
      icon: Award,
      unlocked: proteinHits >= 5,
      progress: `${Math.min(proteinHits, 5)}/5`,
    },
    {
      id: "steps_100k",
      title: "100K March",
      description: "Accumulated 100,000 total steps",
      icon: Footprints,
      unlocked: totalSteps >= 100000,
      progress: `${Math.min(totalSteps, 100000).toLocaleString()}/100,000`,
    },
    {
      id: "hydration_king",
      title: "Hydration King",
      description: "Logged 20,000 ml of total water intake",
      icon: Trophy,
      unlocked: totalWater >= 20000,
      progress: `${Math.min(totalWater, 20000).toLocaleString()}/20,000 ml`,
    },
    {
      id: "winter_legend",
      title: "Winter Legend",
      description: "Logged 20 active days in the Arc",
      icon: Trophy,
      unlocked: loggedDays >= 20,
      progress: `${Math.min(loggedDays, 20)}/20 days`,
    },
  ];

  // CSV Export Handler
  const exportCsv = () => {
    const headers = ["Date", "Workouts", "Weight (kg)", "Protein (g)", "Steps", "Water (ml)", "Sleep (hrs)", "Sleep Quality", "Notes"];
    const rows = logs.map((l) => [
      l.date,
      `"${(l.workouts || []).join("; ")}"`,
      l.weight ?? "",
      l.protein ?? "",
      l.steps ?? "",
      l.waterMl ?? "",
      l.sleepHours ?? "",
      l.sleepQuality ?? "",
      `"${(l.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `winter_arc_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJson = () => {
    const dataStr = JSON.stringify({ goals, logs }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `winter_arc_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Rank Header */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-subtle">
              Current Arc Discipline Level
            </span>
            <div className="mt-2 flex items-center gap-3">
              <div className={`rounded-lg border px-3 py-1.5 text-sm font-semibold uppercase tracking-wider ${rank.color}`}>
                Rank {rank.level}: {rank.title}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              Logged {loggedDays} days & {stats.totalWorkouts} sessions. Keep pushing to reach Rank 4: Winter Sovereign.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="secondary" size="sm" onClick={exportCsv} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5 text-accent" />
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={exportJson} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
              Export JSON
            </Button>
          </div>
        </div>
      </Card>

      {/* Badges & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Arc Milestones & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map(({ id, title, description, icon: Icon, unlocked, progress }) => (
              <div
                key={id}
                className={`rounded-lg border p-4 transition-all ${
                  unlocked
                    ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
                    : "border-border/60 bg-bg/40 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-md p-2 border ${
                      unlocked ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400" : "border-border bg-surface text-subtle"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {unlocked ? (
                    <Badge tone="success" className="text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Unlocked
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-subtle font-mono">{progress}</span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-fg">{title}</h3>
                <p className="mt-1 text-xs text-subtle leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
