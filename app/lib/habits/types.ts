import type { Habit, HabitCompletion, FrequencyType } from "@prisma/client";

export type { Habit, HabitCompletion, FrequencyType };

export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
}

export interface PeriodBoundary {
  start: Date;
  end: Date;
}

export interface HabitStatus {
  habit: HabitWithCompletions;
  isDueToday: boolean;
  completionsThisPeriod: number;
  targetThisPeriod: number;
  isCompletedThisPeriod: boolean;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  todayCompletion: HabitCompletion | null;
}

export interface DashboardData {
  habitsdue: HabitStatus[];
  habitsNotDue: HabitStatus[];
  completedToday: number;
  remainingToday: number;
  totalDueToday: number;
}

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  SPECIFIC_DAYS: "Specific Days",
};

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DAY_ABBREVIATIONS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
