import { useState } from "react";
import { Save, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import type { UserGoals } from "@/lib/types";

interface Props {
  goals: UserGoals;
  onSave: (goals: UserGoals) => Promise<void> | void;
}

export function GoalsEditor({ goals: initial, onSave }: Props) {
  const [goals, setGoals] = useState<UserGoals>({ ...initial });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted" /> Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Target weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="Optional"
              value={goals.targetWeight ?? ""}
              onChange={(e) =>
                setGoals({
                  ...goals,
                  targetWeight: e.target.value === "" ? null : parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Daily protein (g)</Label>
            <Input
              type="number"
              value={goals.dailyProtein}
              onChange={(e) => setGoals({ ...goals, dailyProtein: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Daily steps</Label>
            <Input
              type="number"
              value={goals.dailySteps}
              onChange={(e) => setGoals({ ...goals, dailySteps: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Workouts / week</Label>
            <Input
              type="number"
              value={goals.workoutsPerWeek}
              onChange={(e) =>
                setGoals({ ...goals, workoutsPerWeek: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>
        <Button onClick={handleSave} variant="secondary" className="w-full">
          <Save className="h-4 w-4" />
          {saved ? "Synced" : "Update goals"}
        </Button>
      </CardContent>
    </Card>
  );
}
