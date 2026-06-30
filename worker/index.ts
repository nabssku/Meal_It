// @ts-nocheck

// Prevent TS from complaining about missing types in worker environment
const swSelf = self as any;

swSelf.addEventListener("push", (event: any) => {
  let data = { title: "MEALIT", body: "Ada notifikasi baru untukmu!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "MEALIT", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    swSelf.registration.showNotification(data.title, options)
  );
});

swSelf.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  
  event.waitUntil(
    swSelf.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients: any[]) => {
      // Focus if window already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (swSelf.clients.openWindow) {
        return swSelf.clients.openWindow(urlToOpen);
      }
    })
  );
});
