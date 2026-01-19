import { useFetcher, Link } from "react-router";
import type { HabitStatus } from "~/lib/habits/types";
import { formatFrequency } from "~/lib/habits/frequency";
import { StreakCounter } from "./StreakCounter";

interface HabitCardProps {
  status: HabitStatus;
}

export function HabitCard({ status }: HabitCardProps) {
  const fetcher = useFetcher();
  const { habit, completedToday, currentStreak, completionsThisPeriod, targetThisPeriod } = status;

  // Optimistic UI
  const isToggling = fetcher.state !== "idle";
  const optimisticCompleted = isToggling ? !completedToday : completedToday;
  const optimisticStreak = isToggling
    ? completedToday
      ? currentStreak - 1
      : currentStreak + 1
    : currentStreak;

  const handleToggle = () => {
    fetcher.submit(null, {
      method: "POST",
      action: `/api/habits/${habit.id}/complete`,
    });
  };

  return (
    <div
      className={`
        bg-[#111] border rounded-xl p-4
        transition-all duration-300
        ${optimisticCompleted
          ? "border-[#00ff99]/50 shadow-lg shadow-[#00ff99]/20"
          : "border-[#00ff99]/20 hover:border-[#00ccff]/40"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Completion checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`
            w-10 h-10 rounded-full border-2 flex items-center justify-center
            transition-all duration-300 shrink-0
            ${isToggling ? "opacity-50 cursor-wait" : "cursor-pointer"}
            ${optimisticCompleted
              ? "border-[#00ff99] bg-[#00ff99]/20"
              : "border-[#00ff99]/40 hover:border-[#00ccff]"
            }
          `}
          style={{ borderColor: optimisticCompleted ? habit.color : undefined }}
          aria-label={optimisticCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          {optimisticCompleted ? (
            <span className="text-xl" style={{ color: habit.color }}>
              {habit.emoji}
            </span>
          ) : (
            <span className="text-2xl text-[#00ff99]/30">{habit.emoji}</span>
          )}
        </button>

        {/* Habit info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/habits/${habit.id}`}
            className="block hover:text-[#00ccff] transition-colors"
          >
            <h3 className={`font-bold truncate ${optimisticCompleted ? "line-through opacity-60" : ""}`}>
              {habit.name}
            </h3>
          </Link>
          <p className="text-sm text-[#00ff99]/60">
            {habit.frequencyType === "DAILY"
              ? "Every day"
              : habit.frequencyType === "SPECIFIC_DAYS"
                ? formatFrequency(habit.frequencyType, habit.targetCount, habit.specificDays)
                : `${completionsThisPeriod}/${targetThisPeriod} ${habit.frequencyType === "WEEKLY" ? "this week" : "this month"}`
            }
          </p>
        </div>

        {/* Streak counter */}
        <StreakCounter streak={optimisticStreak} color={habit.color} />
      </div>
    </div>
  );
}
