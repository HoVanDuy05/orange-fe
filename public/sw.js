self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Lỗi parse push data:', e);
    }
  }

  const title = data.notification?.title || 'IUH Food Court - QUẢN LÝ';
  const options = {
    body: data.notification?.body || 'Bạn có một thông báo mới.',
    icon: data.notification?.icon || '/logo-iuh.png', // Logo admin
    badge: data.notification?.badge || '/logo-iuh.png',
    vibrate: data.notification?.vibrate || [300, 100, 400], // Rung 3 nhịp cảnh báo
    data: data.notification?.data || { url: '/orders' },
    requireInteraction: true // Buộc admin phải tắt thông báo mới mất
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Tìm xem có tab nào của admin đang mở không
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
