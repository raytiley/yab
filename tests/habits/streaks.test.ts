import { describe, it, expect } from "vitest";
import { calculateStreaks } from "~/lib/habits/streaks";
import type { HabitWithCompletions } from "~/lib/habits/types";
import { getStartOfDay } from "~/lib/habits/frequency";

function makeHabit(overrides: Partial<HabitWithCompletions> = {}): HabitWithCompletions {
  return {
    id: "test-id",
    userId: "user-id",
    name: "Test Habit",
    description: null,
    emoji: "⭐",
    color: "#00ccff",
    frequencyType: "DAILY",
    targetCount: 1,
    specificDays: [],
    isActive: true,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completions: [],
    ...overrides,
  };
}

function makeCompletion(completedAt: Date) {
  return {
    id: `completion-${completedAt.getTime()}`,
    habitId: "test-id",
    userId: "user-id",
    completedAt,
    note: null,
  };
}

function daysAgo(days: number, from: Date = new Date()): Date {
  const d = getStartOfDay(from);
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0); // noon to avoid timezone issues
  return d;
}

describe("calculateStreaks - DAILY", () => {
  it("returns 0 for no completions", () => {
    const habit = makeHabit({ frequencyType: "DAILY" });
    const result = calculateStreaks(habit);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });

  it("returns 1 for single completion today", () => {
    const today = new Date();
    const habit = makeHabit({
      frequencyType: "DAILY",
      completions: [makeCompletion(today)],
    });
    const result = calculateStreaks(habit, today);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it("calculates consecutive day streak", () => {
    const today = new Date();
    const habit = makeHabit({
      frequencyType: "DAILY",
      completions: [
        makeCompletion(daysAgo(0, today)),
        makeCompletion(daysAgo(1, today)),
        makeCompletion(daysAgo(2, today)),
      ],
    });
    const result = calculateStreaks(habit, today);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it("breaks streak on missed day", () => {
    const today = new Date();
    const habit = makeHabit({
      frequencyType: "DAILY",
      completions: [
        makeCompletion(daysAgo(0, today)),
        makeCompletion(daysAgo(1, today)),
        // missed day 2
        makeCompletion(daysAgo(3, today)),
        makeCompletion(daysAgo(4, today)),
      ],
    });
    const result = calculateStreaks(habit, today);
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  it("tracks longest streak separately from current", () => {
    const today = new Date();
    const habit = makeHabit({
      frequencyType: "DAILY",
      completions: [
        makeCompletion(daysAgo(0, today)),
        // gap
        makeCompletion(daysAgo(5, today)),
        makeCompletion(daysAgo(6, today)),
        makeCompletion(daysAgo(7, today)),
        makeCompletion(daysAgo(8, today)),
      ],
    });
    const result = calculateStreaks(habit, today);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(4);
  });

  it("continues streak from yesterday if today not completed", () => {
    const today = new Date();
    const habit = makeHabit({
      frequencyType: "DAILY",
      completions: [
        // no completion today
        makeCompletion(daysAgo(1, today)),
        makeCompletion(daysAgo(2, today)),
        makeCompletion(daysAgo(3, today)),
      ],
    });
    const result = calculateStreaks(habit, today);
    expect(result.currentStreak).toBe(3);
  });
});

describe("calculateStreaks - WEEKLY", () => {
  it("returns 0 for no completions", () => {
    const habit = makeHabit({ frequencyType: "WEEKLY", targetCount: 2 });
    const result = calculateStreaks(habit);
    expect(result.currentStreak).toBe(0);
  });

  it("counts weeks where target was met", () => {
    const today = new Date("2024-03-15T12:00:00"); // Friday
    const habit = makeHabit({
      frequencyType: "WEEKLY",
      targetCount: 2,
      completions: [
        // This week (March 10-16)
        makeCompletion(new Date("2024-03-11T12:00:00")),
        makeCompletion(new Date("2024-03-13T12:00:00")),
        // Last week (March 3-9)
        makeCompletion(new Date("2024-03-04T12:00:00")),
        makeCompletion(new Date("2024-03-06T12:00:00")),
      ],
    });
    const result = calculateStreaks(habit, today);
    expect(result.currentStreak).toBe(2);
  });

  it("does not count incomplete weeks", () => {
    const today = new Date("2024-03-15T12:00:00");
    const habit = makeHabit({
      frequencyType: "WEEKLY",
      targetCount: 3,
      completions: [
        // This week - only 2 of 3
        makeCompletion(new Date("2024-03-11T12:00:00")),
        makeCompletion(new Date("2024-03-13T12:00:00")),
        // Last week - 3 of 3
        makeCompletion(new Date("2024-03-04T12:00:00")),
        makeCompletion(new Date("2024-03-05T12:00:00")),
        makeCompletion(new Date("2024-03-06T12:00:00")),
      ],
    });
    const result = calculateStreaks(habit, today);
    // Current week incomplete, so streak is from last week only
    expect(result.currentStreak).toBe(1);
  });
});

describe("calculateStreaks - SPECIFIC_DAYS", () => {
  it("returns 0 for no completions", () => {
    const habit = makeHabit({
      frequencyType: "SPECIFIC_DAYS",
      specificDays: [1, 3, 5], // Mon, Wed, Fri
    });
    const result = calculateStreaks(habit);
    expect(result.currentStreak).toBe(0);
  });

  it("counts only scheduled days", () => {
    // Friday March 15, 2024
    const friday = new Date("2024-03-15T12:00:00");
    const habit = makeHabit({
      frequencyType: "SPECIFIC_DAYS",
      specificDays: [1, 3, 5], // Mon, Wed, Fri
      completions: [
        makeCompletion(new Date("2024-03-15T12:00:00")), // Fri
        makeCompletion(new Date("2024-03-13T12:00:00")), // Wed
        makeCompletion(new Date("2024-03-11T12:00:00")), // Mon
      ],
    });
    const result = calculateStreaks(habit, friday);
    expect(result.currentStreak).toBe(3);
  });

  it("handles empty specificDays array", () => {
    const habit = makeHabit({
      frequencyType: "SPECIFIC_DAYS",
      specificDays: [],
    });
    const result = calculateStreaks(habit);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });
});
