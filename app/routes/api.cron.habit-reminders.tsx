import { data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import prisma from "~/lib/prisma.server";
import { sendPushNotification } from "~/lib/push/web-push.server";

// Cron job runs every hour at minute 0
// It checks for habits with reminders matching the current hour

export async function loader({ request }: LoaderFunctionArgs) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, require auth. In dev, allow without auth.
  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return data({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Get current hour in HH:00 format
    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");

    // Find all enabled reminders for the current hour
    const reminders = await prisma.habitReminder.findMany({
      where: {
        enabled: true,
        time: {
          startsWith: currentHour + ":",
        },
      },
      include: {
        habit: true,
      },
    });

    let sent = 0;
    let failed = 0;

    // Group reminders by user to batch notifications
    const remindersByUser = new Map<string, typeof reminders>();
    for (const reminder of reminders) {
      const existing = remindersByUser.get(reminder.userId) || [];
      existing.push(reminder);
      remindersByUser.set(reminder.userId, existing);
    }

    // Send notifications to each user
    for (const [userId, userReminders] of remindersByUser) {
      for (const reminder of userReminders) {
        const result = await sendPushNotification(userId, {
          title: `${reminder.habit.emoji} Time for: ${reminder.habit.name}`,
          body: reminder.habit.description || "Don't forget to complete your habit!",
          tag: `habit-reminder-${reminder.habitId}`,
          data: {
            url: `/habits`,
            habitId: reminder.habitId,
          },
        });

        sent += result.success;
        failed += result.failed;
      }
    }

    return data({
      success: true,
      processed: reminders.length,
      sent,
      failed,
      hour: currentHour,
    });
  } catch (error) {
    console.error("Error processing habit reminders:", error);
    return data({ error: "Failed to process reminders" }, { status: 500 });
  }
}
