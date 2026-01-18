import { describe, it, expect } from "vitest";
import {
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getPeriodBoundary,
  isHabitDueToday,
  countCompletionsInPeriod,
  isCompletedForPeriod,
  formatFrequency,
} from "~/lib/habits/frequency";
import type { HabitWithCompletions } from "~/lib/habits/types";

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
    id: "completion-id",
    habitId: "test-id",
    userId: "user-id",
    completedAt,
    note: null,
  };
}

describe("getStartOfDay", () => {
  it("sets time to midnight", () => {
    const date = new Date("2024-03-15T14:30:00");
    const result = getStartOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe("getEndOfDay", () => {
  it("sets time to end of day", () => {
    const date = new Date("2024-03-15T14:30:00");
    const result = getEndOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getDate()).toBe(15);
  });
});

describe("getStartOfWeek", () => {
  it("returns Sunday of the current week", () => {
    // Wednesday March 13, 2024
    const date = new Date("2024-03-13T14:30:00");
    const result = getStartOfWeek(date);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(10); // March 10, 2024
  });

  it("returns same day if already Sunday", () => {
    const sunday = new Date("2024-03-10T14:30:00");
    const result = getStartOfWeek(sunday);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(10);
  });
});

describe("getEndOfWeek", () => {
  it("returns Saturday of the current week", () => {
    // Wednesday March 13, 2024
    const date = new Date("2024-03-13T14:30:00");
    const result = getEndOfWeek(date);
    expect(result.getDay()).toBe(6); // Saturday
    expect(result.getDate()).toBe(16); // March 16, 2024
  });
});

describe("getStartOfMonth", () => {
  it("returns first day of month", () => {
    const date = new Date("2024-03-15T14:30:00");
    const result = getStartOfMonth(date);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(2); // March (0-indexed)
  });
});

describe("getEndOfMonth", () => {
  it("returns last day of month", () => {
    const date = new Date("2024-03-15T14:30:00");
    const result = getEndOfMonth(date);
    expect(result.getDate()).toBe(31); // March has 31 days
    expect(result.getMonth()).toBe(2);
  });

  it("handles February correctly", () => {
    const date = new Date("2024-02-15T14:30:00");
    const result = getEndOfMonth(date);
    expect(result.getDate()).toBe(29); // 2024 is a leap year
  });
});

describe("getPeriodBoundary", () => {
  it("returns day boundaries for DAILY", () => {
    const date = new Date("2024-03-15T14:30:00");
    const result = getPeriodBoundary("DAILY", date);
    expect(result.start.getDate()).toBe(15);
    expect(result.end.getDate()).toBe(15);
  });

  it("returns week boundaries for WEEKLY", () => {
    const date = new Date("2024-03-13T14:30:00"); // Wednesday
    const result = getPeriodBoundary("WEEKLY", date);
    expect(result.start.getDate()).toBe(10); // Sunday
    expect(result.end.getDate()).toBe(16); // Saturday
  });

  it("returns month boundaries for MONTHLY", () => {
    const date = new Date("2024-03-15T14:30:00");
    const result = getPeriodBoundary("MONTHLY", date);
    expect(result.start.getDate()).toBe(1);
    expect(result.end.getDate()).toBe(31);
  });
});

describe("isHabitDueToday", () => {
  it("returns true for daily habits", () => {
    const habit = makeHabit({ frequencyType: "DAILY" });
    expect(isHabitDueToday(habit)).toBe(true);
  });

  it("returns true for weekly habits", () => {
    const habit = makeHabit({ frequencyType: "WEEKLY" });
    expect(isHabitDueToday(habit)).toBe(true);
  });

  it("returns true for monthly habits", () => {
    const habit = makeHabit({ frequencyType: "MONTHLY" });
    expect(isHabitDueToday(habit)).toBe(true);
  });

  it("returns true for specific days when today matches", () => {
    const habit = makeHabit({
      frequencyType: "SPECIFIC_DAYS",
      specificDays: [1, 3, 5], // Mon, Wed, Fri
    });
    const monday = new Date("2024-03-11T12:00:00"); // Monday
    expect(isHabitDueToday(habit, monday)).toBe(true);
  });

  it("returns false for specific days when today does not match", () => {
    const habit = makeHabit({
      frequencyType: "SPECIFIC_DAYS",
      specificDays: [1, 3, 5], // Mon, Wed, Fri
    });
    const tuesday = new Date("2024-03-12T12:00:00"); // Tuesday
    expect(isHabitDueToday(habit, tuesday)).toBe(false);
  });
});

describe("countCompletionsInPeriod", () => {
  it("counts daily completions correctly", () => {
    const today = new Date("2024-03-15T14:00:00");
    const habit = makeHabit({
      frequencyType: "DAILY",
      completions: [
        makeCompletion(new Date("2024-03-15T10:00:00")),
        makeCompletion(new Date("2024-03-14T10:00:00")), // yesterday
      ],
    });
    expect(countCompletionsInPeriod(habit, today)).toBe(1);
  });

  it("counts weekly completions correctly", () => {
    const wednesday = new Date("2024-03-13T14:00:00");
    const habit = makeHabit({
      frequencyType: "WEEKLY",
      completions: [
        makeCompletion(new Date("2024-03-11T10:00:00")), // Monday
        makeCompletion(new Date("2024-03-12T10:00:00")), // Tuesday
        makeCompletion(new Date("2024-03-03T10:00:00")), // Previous week
      ],
    });
    expect(countCompletionsInPeriod(habit, wednesday)).toBe(2);
  });
});

describe("isCompletedForPeriod", () => {
  it("returns true when target is met", () => {
    const habit = makeHabit({
      frequencyType: "DAILY",
      targetCount: 1,
      completions: [makeCompletion(new Date())],
    });
    expect(isCompletedForPeriod(habit)).toBe(true);
  });

  it("returns false when target is not met", () => {
    const habit = makeHabit({
      frequencyType: "WEEKLY",
      targetCount: 3,
      completions: [
        makeCompletion(new Date()),
        makeCompletion(new Date()),
      ],
    });
    expect(isCompletedForPeriod(habit)).toBe(false);
  });
});

describe("formatFrequency", () => {
  it("formats daily frequency", () => {
    expect(formatFrequency("DAILY", 1, [])).toBe("Every day");
  });

  it("formats weekly frequency singular", () => {
    expect(formatFrequency("WEEKLY", 1, [])).toBe("Once a week");
  });

  it("formats weekly frequency plural", () => {
    expect(formatFrequency("WEEKLY", 3, [])).toBe("3x per week");
  });

  it("formats monthly frequency", () => {
    expect(formatFrequency("MONTHLY", 2, [])).toBe("2x per month");
  });

  it("formats specific days", () => {
    expect(formatFrequency("SPECIFIC_DAYS", 1, [1, 3, 5])).toBe("Mon, Wed, Fri");
  });
});
