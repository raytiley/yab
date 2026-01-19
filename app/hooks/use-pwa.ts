import { useEffect, useState } from "react";

interface PWAState {
  offlineReady: boolean;
}

export function usePWA(): PWAState {
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    async function registerSW() {
      try {
        const { Workbox } = await import("workbox-window");
        const wb = new Workbox("/sw.js");

        wb.addEventListener("installed", (event) => {
          if (!event.isUpdate) {
            setOfflineReady(true);
          }
          // With autoUpdate, updates are handled automatically
        });

        wb.addEventListener("controlling", () => {
          // New service worker has taken control, reload to get fresh content
          window.location.reload();
        });

        await wb.register();
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    }

    registerSW();
  }, []);

  return {
    offlineReady,
  };
}
