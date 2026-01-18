import prisma from "../prisma.server";
import type { FrequencyType } from "@prisma/client";
import type { HabitStatus, HabitWithCompletions, DashboardData } from "./types";
import {
  isHabitDueToday,
  countCompletionsInPeriod,
  isCompletedForPeriod,
  getCompletionForDate,
} from "./frequency";
import { calculateStreaks } from "./streaks";

export async function getHabitsForUser(userId: string): Promise<HabitWithCompletions[]> {
  return prisma.habit.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      completions: {
        orderBy: { completedAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getHabitById(
  habitId: string,
  userId: string
): Promise<HabitWithCompletions | null> {
  return prisma.habit.findFirst({
    where: {
      id: habitId,
      userId,
    },
    include: {
      completions: {
        orderBy: { completedAt: "desc" },
      },
    },
  });
}

export function getHabitStatus(
  habit: HabitWithCompletions,
  today: Date = new Date()
): HabitStatus {
  const isDueToday = isHabitDueToday(habit, today);
  const completionsThisPeriod = countCompletionsInPeriod(habit, today);
  const isCompletedThisPeriod = isCompletedForPeriod(habit, today);
  const todayCompletion = getCompletionForDate(habit, today);
  const { currentStreak, longestStreak } = calculateStreaks(habit, today);

  return {
    habit,
    isDueToday,
    completionsThisPeriod,
    targetThisPeriod: habit.targetCount,
    isCompletedThisPeriod,
    currentStreak,
    longestStreak,
    completedToday: todayCompletion !== null,
    todayCompletion,
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const habits = await getHabitsForUser(userId);
  const today = new Date();

  const habitsWithStatus = habits.map((h) => getHabitStatus(h, today));

  const habitsDue = habitsWithStatus.filter(
    (h) => h.isDueToday && !h.isCompletedThisPeriod
  );
  const habitsNotDue = habitsWithStatus.filter(
    (h) => !h.isDueToday || h.isCompletedThisPeriod
  );

  const completedToday = habitsWithStatus.filter((h) => h.completedToday).length;
  const totalDueToday = habitsWithStatus.filter((h) => h.isDueToday).length;
  const remainingToday = totalDueToday - completedToday;

  return {
    habitsdue: habitsDue,
    habitsNotDue,
    completedToday,
    remainingToday,
    totalDueToday,
  };
}

export async function createHabit(data: {
  userId: string;
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  frequencyType: FrequencyType;
  targetCount: number;
  specificDays?: number[];
}) {
  return prisma.habit.create({
    data: {
      userId: data.userId,
      name: data.name,
      description: data.description,
      emoji: data.emoji ?? "⭐",
      color: data.color ?? "#00ccff",
      frequencyType: data.frequencyType,
      targetCount: data.targetCount,
      specificDays: data.specificDays ?? [],
    },
  });
}

export async function updateHabit(
  habitId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    emoji?: string;
    color?: string;
    frequencyType?: FrequencyType;
    targetCount?: number;
    specificDays?: number[];
  }
) {
  return prisma.habit.updateMany({
    where: {
      id: habitId,
      userId,
    },
    data,
  });
}

export async function archiveHabit(habitId: string, userId: string) {
  return prisma.habit.updateMany({
    where: {
      id: habitId,
      userId,
    },
    data: {
      isActive: false,
      archivedAt: new Date(),
    },
  });
}

export async function deleteHabit(habitId: string, userId: string) {
  return prisma.habit.deleteMany({
    where: {
      id: habitId,
      userId,
    },
  });
}

export async function toggleHabitCompletion(
  habitId: string,
  userId: string,
  note?: string
): Promise<{ completed: boolean; completion?: { id: string } }> {
  const habit = await getHabitById(habitId, userId);
  if (!habit) {
    throw new Error("Habit not found");
  }

  const todayCompletion = getCompletionForDate(habit);

  if (todayCompletion) {
    // Undo completion
    await prisma.habitCompletion.delete({
      where: { id: todayCompletion.id },
    });
    return { completed: false };
  } else {
    // Mark complete
    const completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        userId,
        note,
      },
    });
    return { completed: true, completion: { id: completion.id } };
  }
}
