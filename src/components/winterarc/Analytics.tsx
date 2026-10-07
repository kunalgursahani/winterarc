import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Beef, Dumbbell, Footprints, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyLog, UserGoals } from "@/lib/types";
import {
  getAverages,
  getProteinSeries,
  getStepsSeries,
  getWeightChange,
  getWeightSeries,
  getWorkoutStats,
} from "@/lib/stats";

interface Props {
  logs: DailyLog[];
  goals: UserGoals;
}

const tooltipStyle = {
  backgroundColor: "#12151b",
  border: "1px solid color-mix(in srgb, #eef1f4 12%, transparent)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#eef1f4",
};

export function Analytics({ logs, goals }: Props) {
  const weightSeries = getWeightSeries(logs);
  const proteinSeries = getProteinSeries(logs);
  const stepsSeries = getStepsSeries(logs);
  const workoutStats = getWorkoutStats(logs);
  const weightChange = getWeightChange(logs);
  const averages = getAverages(logs);
  const weightDelta = weightChange.change;
  const isLoss = weightDelta != null && weightDelta < 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Scale className="h-3.5 w-3.5" />}
          label="Weight"
          value={weightChange.current != null ? `${weightChange.current}` : "—"}
          unit="kg"
        >
          {weightDelta != null && (
            <div className={`mt-1 flex items-center gap-1 text-xs ${isLoss ? "text-success" : "text-warn"}`}>
              {isLoss ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {weightDelta > 0 ? "+" : ""}
              {weightDelta} kg from start
            </div>
          )}
        </StatCard>
        <StatCard
          icon={<Beef className="h-3.5 w-3.5" />}
          label="Avg protein"
          value={averages.avgProtein ?? "—"}
          unit="g"
        >
          <div className="mt-1 text-xs text-subtle">Goal {goals.dailyProtein}g</div>
        </StatCard>
        <StatCard
          icon={<Footprints className="h-3.5 w-3.5" />}
          label="Avg steps"
          value={averages.avgSteps != null ? averages.avgSteps.toLocaleString() : "—"}
        >
          <div className="mt-1 text-xs text-subtle">Goal {goals.dailySteps.toLocaleString()}</div>
        </StatCard>
        <StatCard
          icon={<Dumbbell className="h-3.5 w-3.5" />}
          label="Workout days"
          value={workoutStats.workoutDays}
        >
          <div className="mt-1 text-xs text-subtle">
            {workoutStats.totalWorkouts} sessions · {workoutStats.restDays} rest
          </div>
        </StatCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted" /> Weight progress
          </CardTitle>
          {goals.targetWeight != null && <Badge tone="info">Target {goals.targetWeight} kg</Badge>}
        </CardHeader>
        <CardContent>
          {weightSeries.length < 2 ? (
            <EmptyChart message="Log weight on at least 2 days to see the trend" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a32" />
                  <XAxis dataKey="label" tick={{ fill: "#9aa3ae", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    tick={{ fill: "#9aa3ae", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="weight" stroke="#b8c4d4" strokeWidth={2} fill="#b8c4d422" name="Weight (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beef className="h-4 w-4 text-muted" /> Protein intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proteinSeries.length === 0 ? (
              <EmptyChart message="Log protein to see intake" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={proteinSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262a32" />
                    <XAxis dataKey="label" tick={{ fill: "#9aa3ae", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9aa3ae", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="protein" fill="#c4b08a" radius={[6, 6, 0, 0]} name="Protein (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-muted" /> Daily steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stepsSeries.length === 0 ? (
              <EmptyChart message="Log steps to see activity" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stepsSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262a32" />
                    <XAxis dataKey="label" tick={{ fill: "#9aa3ae", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9aa3ae", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="steps" stroke="#8a9a8c" strokeWidth={2} dot={{ fill: "#8a9a8c", r: 3 }} name="Steps" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted">
        {icon} {label}
      </div>
      <div className="font-display text-2xl font-medium tabular-nums text-fg">
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-subtle">{unit}</span> : null}
      </div>
      {children}
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border text-sm text-subtle">
      {message}
    </div>
  );
}
