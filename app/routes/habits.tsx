import { Link, useLoaderData, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { createClient } from "~/lib/supabase/server";
import { getDashboardData } from "~/lib/habits/queries.server";
import { getDashboardMessage } from "~/lib/habits/messages";
import { HabitCard } from "~/components/habits/HabitCard";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData?.user) {
    return redirect("/login");
  }

  const dashboard = await getDashboardData(userData.user.id);
  const highestStreak = Math.max(
    ...dashboard.habitsdue.map((h) => h.currentStreak),
    ...dashboard.habitsNotDue.map((h) => h.currentStreak),
    0
  );
  const message = getDashboardMessage(
    dashboard.completedToday,
    dashboard.remainingToday,
    dashboard.totalDueToday,
    highestStreak
  );

  return {
    ...dashboard,
    message,
    user: userData.user,
  };
}

export default function HabitsRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#00ccff]">Habits</h1>
        <Link
          to="/habits/new"
          className="px-4 py-2 bg-[#00ccff] text-black font-bold rounded hover:bg-[#00ff99] transition-colors"
        >
          + New Habit
        </Link>
      </header>

      {/* Encouraging message banner */}
      <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-4 shadow-lg shadow-[#00ff99]/10">
        <p className="text-[#b3ffec] text-lg">{data.message}</p>
      </div>

      {/* Progress summary */}
      <div className="flex gap-4">
        <div className="flex-1 bg-[#111] border border-[#00ff99]/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#00ff99]">{data.completedToday}</div>
          <div className="text-sm text-[#00ff99]/70">Completed</div>
        </div>
        <div className="flex-1 bg-[#111] border border-[#00ccff]/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#00ccff]">{data.remainingToday}</div>
          <div className="text-sm text-[#00ccff]/70">Remaining</div>
        </div>
      </div>

      {/* Today's habits */}
      {data.habitsdue.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[#00ccff] mb-4">Today</h2>
          <div className="space-y-3">
            {data.habitsdue.map((status) => (
              <HabitCard key={status.habit.id} status={status} />
            ))}
          </div>
        </section>
      )}

      {/* Completed / Not scheduled today */}
      {data.habitsNotDue.length > 0 && (
        <section className="opacity-70">
          <h2 className="text-lg font-bold text-[#00ff99]/70 mb-4">
            {data.habitsdue.length === 0 && data.habitsNotDue.length > 0
              ? "All Caught Up!"
              : "Completed / Not Scheduled"}
          </h2>
          <div className="space-y-3">
            {data.habitsNotDue.map((status) => (
              <HabitCard key={status.habit.id} status={status} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {data.habitsdue.length === 0 && data.habitsNotDue.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#00ff99]/70 text-lg mb-4">No habits yet!</p>
          <Link
            to="/habits/new"
            className="inline-block px-6 py-3 bg-[#00ccff] text-black font-bold rounded hover:bg-[#00ff99] transition-colors"
          >
            Create Your First Habit
          </Link>
        </div>
      )}
    </div>
  );
}
