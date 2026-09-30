import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Beef, Dumbbell, Footprints, Save, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import type { DailyLog } from "@/lib/types";
import { WORKOUT_TYPES } from "@/lib/types";
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
  const [notes, setNotes] = useState(existing.notes ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const log = getLog(logs, dateKey);
    setWorkouts(log.workouts);
    setWeight(log.weight?.toString() ?? "");
    setProtein(log.protein?.toString() ?? "");
    setSteps(log.steps?.toString() ?? "");
    setNotes(log.notes ?? "");
    setSaved(false);
  }, [dateKey, logs]);

  const toggleWorkout = (w: string) => {
    setWorkouts((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  };

  const handleSave = async () => {
    await onSave({
      date: dateKey,
      workouts,
      weight: weight === "" ? null : parseFloat(weight),
      protein: protein === "" ? null : parseFloat(protein),
      steps: steps === "" ? null : parseInt(steps, 10),
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Log for {format(selectedDate, "EEEE, MMM d")}</CardTitle>
          <p className="mt-1 text-xs text-subtle">{dateKey}</p>
        </div>
        {saved && <Badge tone="success">Synced</Badge>}
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label className="flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5" /> Workouts
          </Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {WORKOUT_TYPES.map((w) => {
              const active = workouts.includes(w);
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleWorkout(w)}
                  className={cn(
                    "rounded-sm border px-2.5 py-2 text-xs font-medium transition-colors duration-150",
                    active
                      ? "border-border-strong bg-surface-2 text-fg"
                      : "border-border bg-bg text-muted hover:text-fg",
                  )}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" /> Weight (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Beef className="h-3.5 w-3.5" /> Protein (g)
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="160"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Footprints className="h-3.5 w-3.5" /> Steps
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="8500"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <Input
            placeholder="How did the session feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save & sync"}
        </Button>
      </CardContent>
    </Card>
  );
}
