import { usePushNotifications } from "~/hooks/use-push-notifications";

interface ReminderSettingsProps {
  enabled: boolean;
  time: string;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
}

export function ReminderSettings({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
}: ReminderSettingsProps) {
  const { permission, isSubscribed, isLoading, subscribe } = usePushNotifications();

  const handleEnableToggle = async () => {
    if (!enabled) {
      // Enabling reminders - ensure push notifications are enabled
      if (permission !== "granted" || !isSubscribed) {
        const success = await subscribe();
        if (!success) {
          // User denied or error occurred
          return;
        }
      }
    }
    onEnabledChange(!enabled);
  };

  const isPushUnavailable = permission === "unsupported" || permission === "denied";

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-[#00ccff]">
        Daily Reminder
      </label>

      {isPushUnavailable && (
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/50 text-yellow-200 text-sm">
          {permission === "unsupported"
            ? "Push notifications are not supported on this device/browser."
            : "Push notifications are blocked. Please enable them in your browser settings to use reminders."}
        </div>
      )}

      <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-[#00ff99]/30">
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {enabled ? "🔔" : "🔕"}
          </span>
          <div>
            <p className="text-[#00ff99] font-medium">
              {enabled ? "Reminder On" : "Reminder Off"}
            </p>
            <p className="text-[#00ff99]/60 text-sm">
              Get notified to complete this habit
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleEnableToggle}
          disabled={isPushUnavailable || isLoading}
          className={`
            relative w-12 h-6 rounded-full transition-colors
            ${enabled ? "bg-[#00ccff]" : "bg-[#333]"}
            ${isPushUnavailable || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-label={enabled ? "Disable reminder" : "Enable reminder"}
        >
          <span
            className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${enabled ? "translate-x-7" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {enabled && (
        <div className="p-4 rounded-xl bg-[#111] border border-[#00ff99]/30">
          <label htmlFor="reminderTime" className="block text-sm text-[#00ff99]/80 mb-2">
            Remind me at
          </label>
          <input
            type="time"
            id="reminderTime"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#00ff99]/20 rounded-lg text-[#00ccff] focus:outline-none focus:border-[#00ccff]"
          />
          <p className="mt-2 text-xs text-[#00ff99]/50">
            You&apos;ll receive a push notification at this time daily
          </p>
        </div>
      )}
    </div>
  );
}
