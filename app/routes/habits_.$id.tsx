import { Link, useLoaderData, redirect, useFetcher } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { createClient } from "~/lib/supabase/server";
import { getHabitById, getHabitStatus, deleteHabit, archiveHabit } from "~/lib/habits/queries.server";
import { formatFrequency, getStartOfDay } from "~/lib/habits/frequency";
import { StreakCounter } from "~/components/habits/StreakCounter";
import { useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData?.user) {
    return redirect("/login");
  }

  const habitId = params.id;
  if (!habitId) {
    return redirect("/habits");
  }

  const habit = await getHabitById(habitId, userData.user.id);
  if (!habit) {
    return redirect("/habits");
  }

  const status = getHabitStatus(habit);

  // Get recent completions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCompletions = habit.completions.filter(
    (c) => c.completedAt >= thirtyDaysAgo
  );

  // Build calendar data for last 30 days
  const calendarData: { date: Date; completed: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = getStartOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const completed = recentCompletions.some(
      (c) => c.completedAt >= dayStart && c.completedAt <= dayEnd
    );
    calendarData.push({ date: dayStart, completed });
  }

  return {
    habit,
    status,
    calendarData,
    user: userData.user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return redirect("/login");
  }

  const habitId = params.id;
  if (!habitId) {
    return redirect("/habits");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteHabit(habitId, userData.user.id);
    return redirect("/habits");
  }

  if (intent === "archive") {
    await archiveHabit(habitId, userData.user.id);
    return redirect("/habits");
  }

  return null;
}

export default function HabitDetailRoute() {
  const { habit, status, calendarData } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDeleting = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "delete";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${habit.color}20`, borderColor: habit.color }}
          >
            {habit.emoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#00ccff]">{habit.name}</h1>
            {habit.description && (
              <p className="text-[#00ff99]/70">{habit.description}</p>
            )}
            <p className="text-sm text-[#00ff99]/50 mt-1">
              {formatFrequency(habit.frequencyType, habit.targetCount, habit.specificDays)}
            </p>
          </div>
        </div>
        <Link
          to={`/habits/${habit.id}/edit`}
          className="px-4 py-2 border border-[#00ff99]/30 rounded-lg text-[#00ff99] hover:border-[#00ccff] transition-colors"
        >
          Edit
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <StreakCounter streak={status.currentStreak} color={habit.color} />
          </div>
          <div className="text-sm text-[#00ff99]/70">Current Streak</div>
        </div>
        <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: habit.color }}>
            {status.longestStreak}
          </div>
          <div className="text-sm text-[#00ff99]/70">Best Streak</div>
        </div>
        <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: habit.color }}>
            {habit.completions.length}
          </div>
          <div className="text-sm text-[#00ff99]/70">Total Completions</div>
        </div>
      </div>

      {/* Progress this period */}
      {(habit.frequencyType === "WEEKLY" || habit.frequencyType === "MONTHLY") && (
        <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-4">
          <h2 className="text-lg font-bold text-[#00ccff] mb-3">
            This {habit.frequencyType === "WEEKLY" ? "Week" : "Month"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-[#0d0d0d] rounded-full h-4 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (status.completionsThisPeriod / status.targetThisPeriod) * 100)}%`,
                  backgroundColor: habit.color,
                }}
              />
            </div>
            <span className="text-[#00ff99] font-bold">
              {status.completionsThisPeriod}/{status.targetThisPeriod}
            </span>
          </div>
        </div>
      )}

      {/* Last 30 days calendar */}
      <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-4">
        <h2 className="text-lg font-bold text-[#00ccff] mb-3">Last 30 Days</h2>
        <div className="grid grid-cols-10 gap-2">
          {calendarData.map(({ date, completed }, i) => (
            <div
              key={i}
              className={`
                w-full aspect-square rounded-md border-2
                transition-all
                ${completed
                  ? "border-[#00ff99]"
                  : "border-[#00ff99]/10"
                }
              `}
              style={{
                backgroundColor: completed ? `${habit.color}40` : "transparent",
              }}
              title={date.toLocaleDateString()}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#00ff99]/50">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-[#111] border border-red-800/30 rounded-xl p-4">
        <h2 className="text-lg font-bold text-red-400 mb-3">Danger Zone</h2>
        <div className="flex gap-4">
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="archive" />
            <button
              type="submit"
              className="px-4 py-2 border border-red-800/50 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
            >
              Archive Habit
            </button>
          </fetcher.Form>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-800/50 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
            >
              Delete Habit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm">Are you sure?</span>
              <fetcher.Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </fetcher.Form>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-[#00ff99]/30 rounded-lg text-[#00ff99] hover:border-[#00ccff] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <Link
        to="/habits"
        className="inline-block text-[#00ccff] hover:underline"
      >
        &larr; Back to Habits
      </Link>
    </div>
  );
}
