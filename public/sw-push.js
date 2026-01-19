// Push notification handlers for service worker
// This file is imported by the main service worker

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title, body, icon, badge, tag, data } = payload;

    const options = {
      body: body || "",
      icon: icon || "/pwa-192x192.png",
      badge: badge || "/pwa-64x64.png",
      tag: tag || "rayos-notification",
      data: data || {},
      vibrate: [100, 50, 100],
      requireInteraction: true,
    };

    event.waitUntil(
      self.registration.showNotification(title || "RayOS", options)
    );
  } catch (error) {
    console.error("Error handling push event:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/habits";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already an open window
      for (const client of windowClients) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus().then((focusedClient) => {
            if (focusedClient) {
              focusedClient.navigate(urlToOpen);
            }
          });
        }
      }
      // No open window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  // Could track analytics here if needed
  console.log("Notification closed:", event.notification.tag);
});
