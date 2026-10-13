/* Service worker minimal Sanemi Tracker v1.
   Tugasnya hanya: menangani klik notifikasi (fokuskan / buka app).
   Penjadwalan notifikasi dilakukan halaman app (lihat src/lib/notify.ts);
   push dari server (backend) sengaja belum ada — di luar scope web-app-saja. */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        if ('focus' in client) {
          await client.focus();
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow('./');
      }
    })(),
  );
});
