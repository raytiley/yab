import { usePWA } from "~/hooks/use-pwa";
import { useEffect, useState } from "react";

export function UpdatePrompt() {
  const { offlineReady } = usePWA();
  const [showOfflineReady, setShowOfflineReady] = useState(false);

  useEffect(() => {
    if (offlineReady) {
      setShowOfflineReady(true);
      // Auto-hide offline ready message after 3 seconds
      const timer = setTimeout(() => setShowOfflineReady(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  if (!showOfflineReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="rounded-lg border border-[#00ccff] bg-[#0d0d0d] p-4 shadow-lg shadow-[#00ccff]/20">
        <div className="font-mono text-sm text-[#00ff99]">
          Ready for offline use
        </div>
      </div>
    </div>
  );
}
