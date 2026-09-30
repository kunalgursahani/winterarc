import { useMemo } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfWeek,
  format,
  getMonth,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getLoggedDates } from "@/lib/stats";

interface Props {
  logs: DailyLog[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  viewMonth: Date;
  onChangeMonth: (date: Date) => void;
}

const MONTH_NAMES = ["October", "November", "December"];

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function Calendar({ logs, selectedDate, onSelectDate, viewMonth, onChangeMonth }: Props) {
  const monthIndex = getMonth(viewMonth);
  const canPrev = monthIndex > 9;
  const canNext = monthIndex < 11;
  const logged = useMemo(() => getLoggedDates(logs), [logs]);
  const logMap = useMemo(() => Object.fromEntries(logs.map((l) => [l.date, l])), [logs]);

  const days = useMemo(() => {
    const start = startOfWeek(new Date(2026, monthIndex, 1), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(2026, monthIndex + 1, 0), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthIndex]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {MONTH_NAMES[monthIndex - 9]} 2026
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            disabled={!canPrev}
            onClick={() => onChangeMonth(subMonths(viewMonth, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            disabled={!canNext}
            onClick={() => onChangeMonth(addMonths(viewMonth, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-1 text-center text-xs font-medium uppercase tracking-wide text-subtle">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = dateKey(day);
            const inMonth = isSameMonth(day, viewMonth);
            const selected = isSameDay(day, selectedDate);
            const hasLog = logged.has(key);
            const log = logMap[key];
            const hasWorkout =
              log?.workouts && log.workouts.length > 0 && !log.workouts.includes("Rest Day");
            const isRest = log?.workouts?.includes("Rest Day");

            return (
              <button
                key={key}
                type="button"
                onClick={() => inMonth && onSelectDate(day)}
                disabled={!inMonth}
                className={cn(
                  "relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-sm text-sm transition-colors duration-150",
                  !inMonth && "cursor-default opacity-20",
                  inMonth && "text-fg hover:bg-surface-2",
                  selected && "bg-surface-2 ring-1 ring-border-strong",
                  isToday(day) && !selected && "ring-1 ring-border",
                )}
              >
                <span className="font-medium tabular-nums">{format(day, "d")}</span>
                {inMonth && hasLog && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {hasWorkout && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                    {isRest && <span className="h-1.5 w-1.5 rounded-full bg-subtle" />}
                    {log?.weight != null && <span className="h-1.5 w-1.5 rounded-full bg-chart" />}
                    {(log?.protein != null || log?.steps != null) && !hasWorkout && !isRest && (
                      <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-subtle">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-success" /> Workout
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-chart" /> Weight
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-warn" /> Protein / steps
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-subtle" /> Rest
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
