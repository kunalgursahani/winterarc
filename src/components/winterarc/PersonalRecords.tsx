import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Dumbbell, Plus, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DailyLog } from "@/lib/types";
import { COMMON_EXERCISES } from "@/lib/types";

interface Props {
  logs: DailyLog[];
  onSavePr?: (date: string, exercise: string, value: number) => Promise<void> | void;
}

export function PersonalRecords({ logs }: Props) {
  const [customExercise, setCustomExercise] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customDate, setCustomDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  // Calculate best records across all logs
  const allPrs = useMemo(() => {
    const records: Record<string, { value: number; date: string }> = {};

    logs.forEach((log) => {
      if (!log.prs) return;
      Object.entries(log.prs).forEach(([ex, val]) => {
        if (typeof val !== "number" || isNaN(val)) return;
        const isRun = ex.toLowerCase().includes("run") || ex.toLowerCase().includes("time");

        if (!records[ex]) {
          records[ex] = { value: val, date: log.date };
        } else {
          // For run time lower is better, for weight/reps higher is better
          if (isRun) {
            if (val < records[ex].value) records[ex] = { value: val, date: log.date };
          } else {
            if (val > records[ex].value) records[ex] = { value: val, date: log.date };
          }
        }
      });
    });

    return records;
  }, [logs]);

  const hasPrs = Object.keys(allPrs).length > 0;

  return (
    <div className="space-y-6">
      {/* PR Vault Header Banner */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-surface to-bg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
              <Trophy className="h-4 w-4" />
              Winter Arc Personal Records Vault
            </div>
            <h2 className="mt-2 font-display text-2xl font-medium text-fg sm:text-3xl">
              Your All-Time Heavy Lifts & Records
            </h2>
            <p className="mt-1 text-xs text-muted">
              Every personal best logged during your Winter Arc is stored here.
            </p>
          </div>
          <Badge tone="info" className="self-start sm:self-auto">
            {Object.keys(allPrs).length} Records Tracked
          </Badge>
        </div>
      </Card>

      {/* PR Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMMON_EXERCISES.map((ex) => {
          const record = allPrs[ex];
          return (
            <Card
              key={ex}
              className={`transition-all duration-200 ${
                record ? "border-amber-500/30 bg-surface shadow-sm" : "border-border/60 bg-bg/50 opacity-80"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-fg truncate">{ex}</CardTitle>
                <Trophy className={`h-4 w-4 ${record ? "text-amber-400" : "text-subtle"}`} />
              </CardHeader>
              <CardContent>
                {record ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-3xl font-semibold tabular-nums text-fg">
                        {record.value}
                      </span>
                      <span className="text-xs text-subtle">
                        {ex.includes("kg") ? "kg" : ex.includes("min") ? "min" : "reps"}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-subtle">
                      Achieved on {format(parseISO(record.date), "MMM d, yyyy")}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-semibold text-subtle">—</span>
                    <p className="mt-2 text-[11px] text-subtle">No record logged yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Logged PRs if any */}
      {hasPrs && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-accent" />
              All Personal Best Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {Object.entries(allPrs).map(([ex, record]) => (
                <div key={ex} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-fg">{ex}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-base font-semibold text-fg">
                      {record.value}
                    </span>
                    <span className="text-xs text-subtle">
                      ({format(parseISO(record.date), "MMM d")})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
