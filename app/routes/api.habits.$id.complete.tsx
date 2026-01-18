import { data, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { createClient } from "~/lib/supabase/server";
import { toggleHabitCompletion, getHabitById } from "~/lib/habits/queries.server";
import { getHabitStatus } from "~/lib/habits/queries.server";
import { getCompletionCelebration } from "~/lib/habits/messages";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const habitId = params.id;
  if (!habitId) {
    return data({ error: "Habit ID required" }, { status: 400 });
  }

  try {
    const result = await toggleHabitCompletion(habitId, userData.user.id);

    // Get updated habit status for streak info
    const habit = await getHabitById(habitId, userData.user.id);
    let message: string | undefined;

    if (result.completed && habit) {
      const status = getHabitStatus(habit);
      message = getCompletionCelebration(status.currentStreak);
    }

    return data({
      success: true,
      completed: result.completed,
      message,
    });
  } catch (error) {
    console.error("Error toggling habit completion:", error);
    return data({ error: "Failed to toggle completion" }, { status: 500 });
  }
}

// No loader - this is an API-only route
export function loader() {
  return redirect("/habits");
}
