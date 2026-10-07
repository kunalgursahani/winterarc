import { useState } from "react";
import { format } from "date-fns";
import { Apple, Beef, CheckCircle2, Flame, Plus, Save, Sparkles, Utensils, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import type { DailyLog, UserGoals } from "@/lib/types";
import { getLog } from "@/lib/stats";
import { cn } from "@/lib/utils";

interface Props {
  logs: DailyLog[];
  goals: UserGoals;
  onSaveLog: (log: DailyLog) => Promise<void> | void;
}

interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const PRESET_MEALS = [
  { name: "Chicken Breast & Rice Bowl (200g/150g)", calories: 550, protein: 48, carbs: 60, fats: 8 },
  { name: "Double Whey Shake with Oats & Peanut Butter", calories: 480, protein: 52, carbs: 40, fats: 10 },
  { name: "6 Boiled Eggs + 2 Whole Wheat Toast", calories: 510, protein: 36, carbs: 30, fats: 25 },
  { name: "Paneer Tikka / Grilled Cottage Cheese (200g)", calories: 460, protein: 34, carbs: 12, fats: 28 },
  { name: "Greek Yogurt Bowl with Berries & Honey", calories: 280, protein: 22, carbs: 35, fats: 4 },
  { name: "Lean Beef Steak & Baked Sweet Potato", calories: 620, protein: 55, carbs: 42, fats: 20 },
];

export function CalorieTracker({ logs, goals, onSaveLog }: Props) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const existingLog = getLog(logs, todayKey);

  const [mealInput, setMealInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [synced, setSynced] = useState(false);

  const [loggedMeals, setLoggedMeals] = useState<MealItem[]>([
    { id: "1", name: "High-Protein Morning Oats & Whey", calories: 420, protein: 40, carbs: 45, fats: 6 },
  ]);

  // Totals
  const totalCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFats = loggedMeals.reduce((acc, m) => acc + m.fats, 0);

  // AI Meal Analysis Simulation (Intelligent parsing of user text)
  const handleAnalyzeAI = () => {
    if (!mealInput.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const text = mealInput.toLowerCase();
      let estCal = 350;
      let estProt = 25;
      let estCarbs = 30;
      let estFats = 10;

      // Smart heuristic estimations
      if (text.includes("chicken") || text.includes("murg")) {
        estCal += 200;
        estProt += 30;
      }
      if (text.includes("egg") || text.includes("anda")) {
        estCal += 140;
        estProt += 14;
        estFats += 10;
      }
      if (text.includes("whey") || text.includes("protein")) {
        estCal += 130;
        estProt += 24;
      }
      if (text.includes("rice") || text.includes("chawal") || text.includes("roti") || text.includes("oats")) {
        estCal += 220;
        estCarbs += 45;
      }
      if (text.includes("paneer") || text.includes("cheese")) {
        estCal += 250;
        estProt += 18;
        estFats += 18;
      }

      const newItem: MealItem = {
        id: Date.now().toString(),
        name: mealInput.trim(),
        calories: estCal,
        protein: estProt,
        carbs: estCarbs,
        fats: estFats,
      };

      setLoggedMeals((prev) => [...prev, newItem]);
      setMealInput("");
      setIsAnalyzing(false);
    }, 600);
  };

  const addPresetMeal = (preset: (typeof PRESET_MEALS)[0]) => {
    setLoggedMeals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: preset.name,
        calories: preset.calories,
        protein: preset.protein,
        carbs: preset.carbs,
        fats: preset.fats,
      },
    ]);
  };

  const removeMeal = (id: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  // Sync with daily log
  const handleSyncToLog = async () => {
    const updatedNotes = existingLog.notes
      ? `${existingLog.notes}\n[AI Calorie Sync: ${totalCalories} kcal, ${totalProtein}g P, ${totalCarbs}g C, ${totalFats}g F]`
      : `[AI Calorie Sync: ${totalCalories} kcal, ${totalProtein}g P, ${totalCarbs}g C, ${totalFats}g F]`;

    await onSaveLog({
      ...existingLog,
      date: todayKey,
      protein: totalProtein,
      calories: totalCalories,
      carbs: totalCarbs,
      fats: totalFats,
      notes: updatedNotes,
    });

    setSynced(true);
    setTimeout(() => setSynced(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-accent/30 bg-gradient-to-br from-surface to-bg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <Sparkles className="h-4 w-4 text-amber-400" />
              AI Calorie & Macro Estimator
            </div>
            <h2 className="mt-2 font-display text-2xl font-medium text-fg sm:text-3xl">
              Precision Nutrition & AI Calorie Tracker
            </h2>
            <p className="mt-1 text-xs text-muted">
              Type your meals in plain text or pick high-protein presets. Instant AI estimation & sync to your daily log.
            </p>
          </div>
          <Badge tone="info" className="self-start sm:self-auto">
            Target: {goals.dailyCalories ?? 2500} kcal
          </Badge>
        </div>
      </Card>

      {/* Daily Macros Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Calories */}
        <Card className="border-amber-500/30 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-xs text-subtle uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" /> Calories
            </span>
            <span>{Math.round((totalCalories / (goals.dailyCalories ?? 2500)) * 100)}%</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-fg">
            {totalCalories} <span className="text-xs font-normal text-subtle">/ {goals.dailyCalories ?? 2500} kcal</span>
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalCalories / (goals.dailyCalories ?? 2500)) * 100)}%` }}
            />
          </div>
        </Card>

        {/* Protein */}
        <Card className="border-emerald-500/30 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-xs text-subtle uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Beef className="h-3.5 w-3.5 text-emerald-400" /> Protein
            </span>
            <span>{Math.round((totalProtein / goals.dailyProtein) * 100)}%</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-fg">
            {totalProtein}g <span className="text-xs font-normal text-subtle">/ {goals.dailyProtein}g</span>
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalProtein / goals.dailyProtein) * 100)}%` }}
            />
          </div>
        </Card>

        {/* Carbs */}
        <Card className="border-sky-500/30 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-xs text-subtle uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Apple className="h-3.5 w-3.5 text-sky-400" /> Carbs
            </span>
            <span>Energy</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-fg">{totalCarbs}g</p>
          <p className="mt-1 text-[11px] text-subtle">Fuel for lifts</p>
        </Card>

        {/* Fats */}
        <Card className="border-indigo-500/30 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-xs text-subtle uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-indigo-400" /> Fats
            </span>
            <span>Hormones</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-fg">{totalFats}g</p>
          <p className="mt-1 text-[11px] text-subtle">Healthy fats</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* AI Input & Presets */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                AI Smart Meal Estimator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-subtle">Describe your meal in natural text</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="e.g. 200g chicken breast with 1 cup rice & 2 eggs"
                    value={mealInput}
                    onChange={(e) => setMealInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyzeAI()}
                  />
                  <Button onClick={handleAnalyzeAI} disabled={isAnalyzing || !mealInput.trim()}>
                    {isAnalyzing ? "Analyzing…" : "Estimate"}
                  </Button>
                </div>
              </div>

              {/* Presets Quick Add */}
              <div>
                <Label className="text-xs font-medium text-subtle">Quick Add Winter Arc Presets</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {PRESET_MEALS.map((pm, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addPresetMeal(pm)}
                      className="flex items-center justify-between rounded-md border border-border bg-surface p-2.5 text-left text-xs transition-all hover:border-accent hover:bg-surface-2"
                    >
                      <span className="font-medium text-fg truncate">{pm.name}</span>
                      <span className="ml-2 font-mono text-amber-400 shrink-0">+{pm.protein}g P</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Logged Meals & Sync Button */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-accent" />
                  Today's Meals ({loggedMeals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loggedMeals.length > 0 ? (
                  <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
                    {loggedMeals.map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2.5 text-xs">
                        <div>
                          <p className="font-medium text-fg">{m.name}</p>
                          <p className="mt-0.5 text-[11px] text-subtle">
                            {m.calories} kcal • P: {m.protein}g | C: {m.carbs}g | F: {m.fats}g
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMeal(m.id)}
                          className="text-subtle hover:text-danger text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-subtle py-6 text-center">No meals logged yet today.</p>
                )}
              </CardContent>
            </div>

            <CardContent className="pt-4 border-t border-border">
              <Button onClick={handleSyncToLog} className="w-full">
                {synced ? <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" /> : <Save className="h-4 w-4 mr-2" />}
                {synced ? "Synced to Daily Journal!" : "Sync Macros & Calories to Daily Log"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
