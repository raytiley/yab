import type { HabitWithCompletions } from "./types";
import {
  getPeriodBoundary,
  getPreviousPeriodStart,
  getStartOfDay,
} from "./frequency";

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export function calculateStreaks(
  habit: HabitWithCompletions,
  today: Date = new Date()
): StreakResult {
  if (habit.completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  switch (habit.frequencyType) {
    case "DAILY":
      return calculateDailyStreak(habit, today);
    case "WEEKLY":
      return calculateWeeklyStreak(habit, today);
    case "MONTHLY":
      return calculateMonthlyStreak(habit, today);
    case "SPECIFIC_DAYS":
      return calculateSpecificDaysStreak(habit, today);
  }
}

function calculateDailyStreak(
  habit: HabitWithCompletions,
  today: Date
): StreakResult {
  const sortedCompletions = [...habit.completions].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  );

  const completedDays = new Set<string>();
  for (const c of sortedCompletions) {
    const dayKey = getStartOfDay(c.completedAt).toISOString();
    completedDays.add(dayKey);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let checkDate = getStartOfDay(today);

  // Check if today is completed, if not start from yesterday
  const todayKey = checkDate.toISOString();
  if (!completedDays.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate current streak
  while (completedDays.has(checkDate.toISOString())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak by checking all days from first completion
  const firstCompletion = sortedCompletions[sortedCompletions.length - 1];
  const lastCompletion = sortedCompletions[0];
  checkDate = getStartOfDay(firstCompletion.completedAt);
  const endDate = getStartOfDay(lastCompletion.completedAt);

  while (checkDate <= endDate) {
    if (completedDays.has(checkDate.toISOString())) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return { currentStreak, longestStreak };
}

function calculateWeeklyStreak(
  habit: HabitWithCompletions,
  today: Date
): StreakResult {
  return calculatePeriodStreak(habit, today, "WEEKLY");
}

function calculateMonthlyStreak(
  habit: HabitWithCompletions,
  today: Date
): StreakResult {
  return calculatePeriodStreak(habit, today, "MONTHLY");
}

function calculatePeriodStreak(
  habit: HabitWithCompletions,
  today: Date,
  frequencyType: "WEEKLY" | "MONTHLY"
): StreakResult {
  const period = getPeriodBoundary(frequencyType, today);

  // Count completions per period
  const completionsByPeriod = new Map<string, number>();
  for (const c of habit.completions) {
    const p = getPeriodBoundary(frequencyType, c.completedAt);
    const key = p.start.toISOString();
    completionsByPeriod.set(key, (completionsByPeriod.get(key) ?? 0) + 1);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let checkPeriod = period.start;

  // Check if current period is met, if not start from previous period
  const currentKey = checkPeriod.toISOString();
  const currentCount = completionsByPeriod.get(currentKey) ?? 0;
  if (currentCount < habit.targetCount) {
    checkPeriod = getPreviousPeriodStart(frequencyType, checkPeriod);
  }

  // Calculate current streak
  while (true) {
    const key = checkPeriod.toISOString();
    const count = completionsByPeriod.get(key) ?? 0;
    if (count >= habit.targetCount) {
      currentStreak++;
      checkPeriod = getPreviousPeriodStart(frequencyType, checkPeriod);
    } else {
      break;
    }
    // Safety check to prevent infinite loops
    if (currentStreak > 1000) break;
  }

  // Calculate longest streak
  const sortedPeriods = Array.from(completionsByPeriod.keys()).sort();
  if (sortedPeriods.length > 0) {
    const firstPeriod = new Date(sortedPeriods[0]);
    const lastPeriod = new Date(sortedPeriods[sortedPeriods.length - 1]);
    checkPeriod = firstPeriod;

    while (checkPeriod <= lastPeriod) {
      const key = checkPeriod.toISOString();
      const count = completionsByPeriod.get(key) ?? 0;
      if (count >= habit.targetCount) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      checkPeriod = new Date(checkPeriod);
      if (frequencyType === "WEEKLY") {
        checkPeriod.setDate(checkPeriod.getDate() + 7);
      } else {
        checkPeriod.setMonth(checkPeriod.getMonth() + 1);
      }
    }
  }

  return { currentStreak, longestStreak };
}

function calculateSpecificDaysStreak(
  habit: HabitWithCompletions,
  today: Date
): StreakResult {
  if (habit.specificDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedCompletions = [...habit.completions].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  );

  const completedDays = new Set<string>();
  for (const c of sortedCompletions) {
    const dayKey = getStartOfDay(c.completedAt).toISOString();
    completedDays.add(dayKey);
  }

  // Get previous scheduled day including today if today is scheduled
  function getPrevScheduledDay(date: Date): Date {
    const d = new Date(date);
    // Check today first
    if (habit.specificDays.includes(d.getDay())) {
      return getStartOfDay(d);
    }
    // Then go back
    for (let i = 0; i < 7; i++) {
      d.setDate(d.getDate() - 1);
      if (habit.specificDays.includes(d.getDay())) {
        return getStartOfDay(d);
      }
    }
    return getStartOfDay(d);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let checkDate = getPrevScheduledDay(today);

  // If today is scheduled but not completed, start from previous scheduled day
  const todayStart = getStartOfDay(today);
  if (
    habit.specificDays.includes(today.getDay()) &&
    !completedDays.has(todayStart.toISOString())
  ) {
    checkDate.setDate(checkDate.getDate() - 1);
    checkDate = getPrevScheduledDay(checkDate);
  }

  // Calculate current streak
  while (completedDays.has(checkDate.toISOString())) {
    currentStreak++;
    const prevDate = new Date(checkDate);
    prevDate.setDate(prevDate.getDate() - 1);
    checkDate = getPrevScheduledDay(prevDate);
    // Safety check
    if (currentStreak > 1000) break;
  }

  // Calculate longest streak
  const firstCompletion = sortedCompletions[sortedCompletions.length - 1];
  const lastCompletion = sortedCompletions[0];
  checkDate = getStartOfDay(firstCompletion.completedAt);
  const endDate = getStartOfDay(lastCompletion.completedAt);

  while (checkDate <= endDate) {
    if (habit.specificDays.includes(checkDate.getDay())) {
      if (completedDays.has(checkDate.toISOString())) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return { currentStreak, longestStreak };
}
