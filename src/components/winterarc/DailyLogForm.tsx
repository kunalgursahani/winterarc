import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Beef, Droplets, Dumbbell, Footprints, Moon, Save, Scale, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import type { DailyLog } from "@/lib/types";
import { COMMON_EXERCISES, WORKOUT_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getLog } from "@/lib/stats";

interface Props {
  logs: DailyLog[];
  selectedDate: Date;
  onSave: (data: DailyLog) => Promise<void> | void;
  saving?: boolean;
}

export function DailyLogForm({ logs, selectedDate, onSave, saving }: Props) {
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const existing = getLog(logs, dateKey);
  const [workouts, setWorkouts] = useState<string[]>(existing.workouts);
  const [weight, setWeight] = useState(existing.weight?.toString() ?? "");
  const [protein, setProtein] = useState(existing.protein?.toString() ?? "");
  const [steps, setSteps] = useState(existing.steps?.toString() ?? "");
  const [waterMl, setWaterMl] = useState(existing.waterMl?.toString() ?? "");
  const [sleepHours, setSleepHours] = useState(existing.sleepHours?.toString() ?? "");
  const [sleepQuality, setSleepQuality] = useState<"Great" | "Good" | "Fair" | "Poor" | null>(
    existing.sleepQuality ?? null,
  );
  const [prs, setPrs] = useState<Record<string, number>>(existing.prs ?? {});
  const [notes, setNotes] = useState(existing.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [showPrSection, setShowPrSection] = useState(false);

  useEffect(() => {
    const log = getLog(logs, dateKey);
    setWorkouts(log.workouts);
    setWeight(log.weight?.toString() ?? "");
    setProtein(log.protein?.toString() ?? "");
    setSteps(log.steps?.toString() ?? "");
    setWaterMl(log.waterMl?.toString() ?? "");
    setSleepHours(log.sleepHours?.toString() ?? "");
    setSleepQuality(log.sleepQuality ?? null);
    setPrs(log.prs ?? {});
    setNotes(log.notes ?? "");
    setSaved(false);
  }, [dateKey, logs]);

  const toggleWorkout = (w: string) => {
    setWorkouts((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  };

  const addWater = (amount: number) => {
    const current = parseInt(waterMl || "0", 10);
    setWaterMl((current + amount).toString());
  };

  const handlePrChange = (ex: string, val: string) => {
    if (!val) {
      const next = { ...prs };
      delete next[ex];
      setPrs(next);
    } else {
      setPrs((prev) => ({ ...prev, [ex]: parseFloat(val) }));
    }
  };

  const handleSave = async () => {
    await onSave({
      date: dateKey,
      workouts,
      weight: weight === "" ? null : parseFloat(weight),
      protein: protein === "" ? null : parseFloat(protein),
      steps: steps === "" ? null : parseInt(steps, 10),
      waterMl: waterMl === "" ? null : parseInt(waterMl, 10),
      sleepHours: sleepHours === "" ? null : parseFloat(sleepHours),
      sleepQuality,
      prs,
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl">Log for {format(selectedDate, "EEEE, MMM d")}</CardTitle>
          <p className="mt-1 text-xs text-subtle">{dateKey}</p>
        </div>
        {saved && <Badge tone="success">Synced</Badge>}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Workouts section */}
        <div>
          <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-subtle">
            <Dumbbell className="h-3.5 w-3.5 text-accent" /> Workouts
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {WORKOUT_TYPES.map((w) => {
              const active = workouts.includes(w);
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleWorkout(w)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                    active
                      ? "border-accent bg-accent/15 text-fg shadow-sm"
                      : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Metrics: Weight, Protein, Steps */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-accent" /> Weight (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Beef className="h-3.5 w-3.5 text-accent" /> Protein (g)
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="160"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Footprints className="h-3.5 w-3.5 text-accent" /> Steps
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="8500"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Secondary Metrics: Hydration & Recovery */}
        <div className="rounded-lg border border-border/70 bg-surface/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-subtle">
              Hydration & Recovery
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Water ml */}
            <div>
              <Label className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-sky-400" /> Water Intake (ml)
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="3000"
                  value={waterMl}
                  onChange={(e) => setWaterMl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => addWater(250)}
                  className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20"
                >
                  +250ml
                </button>
                <button
                  type="button"
                  onClick={() => addWater(500)}
                  className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20"
                >
                  +500ml
                </button>
              </div>
            </div>

            {/* Sleep Hours & Quality */}
            <div>
              <Label className="flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-indigo-400" /> Sleep (Hours)
              </Label>
              <div className="mt-1.5 space-y-2">
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="8.0"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                />
                <div className="flex gap-1.5">
                  {(["Great", "Good", "Fair", "Poor"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSleepQuality(sleepQuality === q ? null : q)}
                      className={cn(
                        "flex-1 rounded-sm border py-1 text-[11px] font-medium transition-colors",
                        sleepQuality === q
                          ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                          : "border-border/60 bg-bg/50 text-subtle hover:text-fg",
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PR / Lift Logger Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowPrSection((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium text-accent hover:underline"
          >
            <Trophy className="h-3.5 w-3.5" />
            {showPrSection ? "Hide Exercise PRs" : "+ Log Personal Records (PRs) for this day"}
          </button>

          {showPrSection && (
            <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-border bg-bg/40 p-3 sm:grid-cols-2">
              {COMMON_EXERCISES.map((ex) => (
                <div key={ex} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted truncate">{ex}</span>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="—"
                    value={prs[ex] ?? ""}
                    onChange={(e) => handlePrChange(ex, e.target.value)}
                    className="h-8 w-24 text-right text-xs"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label className="text-xs font-medium text-subtle">Daily Notes & Reflections</Label>
          <Input
            placeholder="How did the session feel? Mindset notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "Saving Log…" : "Save & Sync Log"}
        </Button>
      </CardContent>
    </Card>
  );
}
