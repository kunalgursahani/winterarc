import { useMemo, useState } from "react";
import { Award, Brain, Flame, Sparkles, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyLog, UserGoals } from "@/lib/types";
import { getAverages, getLoggedDates, getWorkoutStats } from "@/lib/stats";

interface Props {
  logs: DailyLog[];
  goals: UserGoals;
}

const ARC_QUOTES = [
  {
    quote: "While they sleep, you execute. Winter is not a season; it's a filter.",
    author: "Winter Arc Creed",
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Arc Principle",
  },
  {
    quote: "Cold mornings build unbreakable character. The work done in silence speaks the loudest.",
    author: "Marcus Aurelius Mindset",
  },
  {
    quote: "Don't count the days; make the days count. The arc demands continuous momentum.",
    author: "Winter Discipline",
  },
  {
    quote: "Your body can stand almost anything. It's your mind that you have to convince.",
    author: "Arc Philosophy",
  },
];

export function MindsetCoach({ logs, goals }: Props) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const loggedDays = useMemo(() => getLoggedDates(logs).size, [logs]);
  const stats = useMemo(() => getWorkoutStats(logs), [logs]);
  const averages = useMemo(() => getAverages(logs), [logs]);

  // Calculate hydration & sleep stats
  const waterLogs = useMemo(() => logs.filter((l) => l.waterMl != null).map((l) => l.waterMl as number), [logs]);
  const sleepLogs = useMemo(() => logs.filter((l) => l.sleepHours != null).map((l) => l.sleepHours as number), [logs]);

  const avgWater = waterLogs.length ? Math.round(waterLogs.reduce((a, b) => a + b, 0) / waterLogs.length) : null;
  const avgSleep = sleepLogs.length ? (sleepLogs.reduce((a, b) => a + b, 0) / sleepLogs.length).toFixed(1) : null;

  const currentQuote = ARC_QUOTES[quoteIndex % ARC_QUOTES.length];

  // Tactical Audit Evaluation
  const auditReport = useMemo(() => {
    const strengths: string[] = [];
    const adjustments: string[] = [];
    let directive = "";

    if (loggedDays >= 5) {
      strengths.push(`High logging consistency: ${loggedDays} total days recorded.`);
    } else {
      adjustments.push("Log your metrics daily to build ironclad habits.");
    }

    if (averages.avgProtein != null) {
      if (averages.avgProtein >= goals.dailyProtein) {
        strengths.push(`Meeting protein target (${averages.avgProtein}g avg vs ${goals.dailyProtein}g goal).`);
      } else {
        adjustments.push(`Protein avg is ${averages.avgProtein}g — increase by ${goals.dailyProtein - averages.avgProtein}g/day.`);
      }
    }

    if (averages.avgSteps != null) {
      if (averages.avgSteps >= goals.dailySteps) {
        strengths.push(`Strong daily activity (${averages.avgSteps.toLocaleString()} avg steps).`);
      } else {
        adjustments.push(`Step count (${averages.avgSteps.toLocaleString()}) is below target (${goals.dailySteps.toLocaleString()}).`);
      }
    }

    if (avgSleep != null) {
      if (parseFloat(avgSleep) >= 7.5) {
        strengths.push(`Optimal recovery with an average of ${avgSleep} hours of sleep.`);
      } else {
        adjustments.push(`Average sleep is ${avgSleep} hrs — target 8 hours for maximum neurological & physical recovery.`);
      }
    }

    if (stats.workoutDays > 0) {
      directive = `Focus on high-intensity execution today. You have completed ${stats.totalWorkouts} total workout sessions across ${stats.workoutDays} active training days.`;
    } else {
      directive = "Initiate your first session of the week today. Zero excuses.";
    }

    return { strengths, adjustments, directive };
  }, [loggedDays, averages, goals, avgSleep, stats]);

  return (
    <div className="space-y-6">
      {/* Mindset Quote Banner */}
      <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-surface to-bg p-6 sm:p-8">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-accent/5 blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles className="h-4 w-4" />
            Winter Arc Mindset & Creed
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setQuoteIndex((i) => i + 1)}
            className="self-start sm:self-auto text-xs"
          >
            <Zap className="h-3.5 w-3.5 mr-1 text-amber-400" />
            Next Quote
          </Button>
        </div>

        <blockquote className="mt-4 font-display text-xl font-medium leading-snug tracking-tight text-fg sm:text-2xl">
          “{currentQuote.quote}”
        </blockquote>
        <figcaption className="mt-3 text-xs uppercase tracking-widest text-subtle">
          — {currentQuote.author}
        </figcaption>
      </Card>

      {/* AI Arc Audit & Tactical Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-accent/40 bg-accent/10 p-2">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">Tactical Arc Audit</CardTitle>
                <p className="text-xs text-subtle">Automated analytical feedback based on your logged metrics</p>
              </div>
            </div>
            <Badge tone="info">Active Audit</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Today's Directive */}
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <Target className="h-4 w-4" />
              Today's Directive
            </div>
            <p className="mt-2 text-sm leading-relaxed text-fg">{auditReport.directive}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Flame className="h-4 w-4" />
                Current Momentum & Strengths
              </div>
              {auditReport.strengths.length > 0 ? (
                <ul className="mt-2.5 space-y-2 text-xs text-muted">
                  {auditReport.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-subtle">Log more daily metrics to reveal your momentum.</p>
              )}
            </div>

            {/* Adjustments */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Award className="h-4 w-4" />
                Strategic Adjustments Needed
              </div>
              {auditReport.adjustments.length > 0 ? (
                <ul className="mt-2.5 space-y-2 text-xs text-muted">
                  {auditReport.adjustments.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-emerald-400">All key targets are currently on track!</p>
              )}
            </div>
          </div>

          {/* Key Metric Averages Overview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
            <div className="rounded-md border border-border bg-surface p-3">
              <span className="text-[10px] uppercase tracking-wider text-subtle">Avg Protein</span>
              <p className="mt-1 font-display text-lg text-fg">{averages.avgProtein ? `${averages.avgProtein}g` : "—"}</p>
            </div>
            <div className="rounded-md border border-border bg-surface p-3">
              <span className="text-[10px] uppercase tracking-wider text-subtle">Avg Steps</span>
              <p className="mt-1 font-display text-lg text-fg">{averages.avgSteps ? averages.avgSteps.toLocaleString() : "—"}</p>
            </div>
            <div className="rounded-md border border-border bg-surface p-3">
              <span className="text-[10px] uppercase tracking-wider text-subtle">Avg Water</span>
              <p className="mt-1 font-display text-lg text-fg">{avgWater ? `${avgWater} ml` : "—"}</p>
            </div>
            <div className="rounded-md border border-border bg-surface p-3">
              <span className="text-[10px] uppercase tracking-wider text-subtle">Avg Sleep</span>
              <p className="mt-1 font-display text-lg text-fg">{avgSleep ? `${avgSleep} hrs` : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
