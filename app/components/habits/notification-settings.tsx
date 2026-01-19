import { useState } from "react";
import { usePushNotifications } from "~/hooks/use-push-notifications";
import { Button } from "~/components/ui/button";

export function NotificationSettings() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const [testSent, setTestSent] = useState(false);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const sendTestNotification = () => {
    if (!("Notification" in window) || permission !== "granted") return;

    new Notification("Test Notification", {
      body: "Push notifications are working! You'll receive habit reminders here.",
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const getStatusDisplay = () => {
    if (permission === "unsupported") {
      return {
        icon: "🚫",
        title: "Not Supported",
        description: "Push notifications are not available on this device or browser.",
        color: "text-gray-500",
      };
    }
    if (permission === "denied") {
      return {
        icon: "🔇",
        title: "Blocked",
        description: "Notifications are blocked. Please enable them in your browser settings.",
        color: "text-red-400",
      };
    }
    if (isSubscribed) {
      return {
        icon: "🔔",
        title: "Enabled",
        description: "You'll receive push notifications for habit reminders.",
        color: "text-[#00ff99]",
      };
    }
    return {
      icon: "🔕",
      title: "Disabled",
      description: "Enable notifications to receive habit reminders.",
      color: "text-[#00ff99]/60",
    };
  };

  const status = getStatusDisplay();
  const canToggle = permission !== "unsupported" && permission !== "denied";

  return (
    <div className="rounded-xl border border-[#00ff99]/30 bg-[#111] p-6">
      <h3 className="text-lg font-bold text-[#00ccff] mb-4">Push Notifications</h3>

      <div className="flex items-start gap-4 mb-6">
        <span className="text-3xl">{status.icon}</span>
        <div className="flex-1">
          <p className={`font-medium ${status.color}`}>{status.title}</p>
          <p className="text-sm text-[#00ff99]/60">{status.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {canToggle && (
          <Button
            onClick={handleToggle}
            disabled={isLoading}
            variant={isSubscribed ? "outline" : "default"}
            className={
              isSubscribed
                ? "border-[#00ff99]/30 text-[#00ff99] hover:border-red-500 hover:text-red-400"
                : "bg-[#00ccff] text-black hover:bg-[#00ff99]"
            }
          >
            {isLoading
              ? "Processing..."
              : isSubscribed
              ? "Disable Notifications"
              : "Enable Notifications"}
          </Button>
        )}

        {isSubscribed && (
          <Button
            onClick={sendTestNotification}
            variant="outline"
            disabled={testSent}
            className="border-[#00ff99]/30 text-[#00ff99] hover:border-[#00ccff] hover:text-[#00ccff]"
          >
            {testSent ? "Sent!" : "Send Test"}
          </Button>
        )}
      </div>

      {permission === "denied" && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-700/30 text-red-200 text-sm">
          <p className="font-medium mb-1">How to enable notifications:</p>
          <ol className="list-decimal list-inside space-y-1 text-red-200/80">
            <li>Click the lock/info icon in your browser&apos;s address bar</li>
            <li>Find &quot;Notifications&quot; in the site settings</li>
            <li>Change the setting to &quot;Allow&quot;</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      )}
    </div>
  );
}
