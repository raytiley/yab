import type { FrequencyType } from "@prisma/client";
import type { PeriodBoundary, HabitWithCompletions } from "./types";

export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date): Date {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getPeriodBoundary(
  frequencyType: FrequencyType,
  date: Date = new Date()
): PeriodBoundary {
  switch (frequencyType) {
    case "DAILY":
    case "SPECIFIC_DAYS":
      return {
        start: getStartOfDay(date),
        end: getEndOfDay(date),
      };
    case "WEEKLY":
      return {
        start: getStartOfWeek(date),
        end: getEndOfWeek(date),
      };
    case "MONTHLY":
      return {
        start: getStartOfMonth(date),
        end: getEndOfMonth(date),
      };
  }
}

export function isHabitDueToday(habit: HabitWithCompletions, date: Date = new Date()): boolean {
  switch (habit.frequencyType) {
    case "DAILY":
      return true;
    case "WEEKLY":
    case "MONTHLY":
      // Always show weekly/monthly habits as due until they're completed for the period
      return true;
    case "SPECIFIC_DAYS": {
      const dayOfWeek = date.getDay();
      return habit.specificDays.includes(dayOfWeek);
    }
  }
}

export function countCompletionsInPeriod(
  habit: HabitWithCompletions,
  date: Date = new Date()
): number {
  const period = getPeriodBoundary(habit.frequencyType, date);
  return habit.completions.filter(
    (c) => c.completedAt >= period.start && c.completedAt <= period.end
  ).length;
}

export function isCompletedForPeriod(
  habit: HabitWithCompletions,
  date: Date = new Date()
): boolean {
  const completions = countCompletionsInPeriod(habit, date);
  return completions >= habit.targetCount;
}

export function getCompletionForDate(
  habit: HabitWithCompletions,
  date: Date = new Date()
): HabitWithCompletions["completions"][0] | null {
  const start = getStartOfDay(date);
  const end = getEndOfDay(date);
  return (
    habit.completions.find((c) => c.completedAt >= start && c.completedAt <= end) ?? null
  );
}

export function getPreviousPeriodStart(
  frequencyType: FrequencyType,
  date: Date
): Date {
  switch (frequencyType) {
    case "DAILY":
    case "SPECIFIC_DAYS": {
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      return getStartOfDay(d);
    }
    case "WEEKLY": {
      const d = getStartOfWeek(date);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "MONTHLY": {
      const d = getStartOfMonth(date);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
  }
}

export function getNextPeriodStart(
  frequencyType: FrequencyType,
  date: Date
): Date {
  switch (frequencyType) {
    case "DAILY":
    case "SPECIFIC_DAYS": {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      return getStartOfDay(d);
    }
    case "WEEKLY": {
      const d = getStartOfWeek(date);
      d.setDate(d.getDate() + 7);
      return d;
    }
    case "MONTHLY": {
      const d = getStartOfMonth(date);
      d.setMonth(d.getMonth() + 1);
      return d;
    }
  }
}

export function formatFrequency(
  frequencyType: FrequencyType,
  targetCount: number,
  specificDays: number[]
): string {
  switch (frequencyType) {
    case "DAILY":
      return "Every day";
    case "WEEKLY":
      return targetCount === 1 ? "Once a week" : `${targetCount}x per week`;
    case "MONTHLY":
      return targetCount === 1 ? "Once a month" : `${targetCount}x per month`;
    case "SPECIFIC_DAYS": {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = specificDays.sort().map((d) => dayNames[d]);
      return days.join(", ");
    }
  }
}
