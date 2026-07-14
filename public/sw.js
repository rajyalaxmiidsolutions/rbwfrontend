// Service Worker for Web Push Notifications

self.addEventListener('push', (event) => {
  let data = {
    title: 'New Notification',
    body: 'You have a new update from RBW.',
    icon: '/favicon.ico',
    url: '/'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Fallback if data is not JSON
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png', // Fallback to logo if icon not set
    badge: '/favicon.ico', // Small badge for system tray
    data: {
      url: data.url || '/'
    },
    vibrate: [100, 50, 100], // vibration pattern
    actions: [
      { action: 'open', title: 'Open Link' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const targetUrl = notification.data?.url || '/';

  notification.close();

  // Focus existing window or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If an open window matches our base domain, focus it and redirect
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'NAVIGATE', url: targetUrl });
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
