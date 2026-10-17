/* Service worker minimal Sanemi Tracker v1.
   Tugasnya: menangani klik notifikasi (fokuskan / buka app) dan tombol aksi
   alarm (Snooze / Sudah Recall) yang dikirim ke halaman via postMessage —
   alarm sebenarnya bunyi di thread halaman (Web Audio tidak jalan di SW).
   Penjadwalan terjadi di halaman app (lihat src/lib/notify.ts); push dari
   server sengaja belum ada — di luar scope web-app-saja. */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function allWindows() {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
}

function broadcast(clients, message) {
  for (const client of clients) client.postMessage(message);
}

self.addEventListener('notificationclick', (event) => {
  const action = event.action || '';
  const tag = (event.notification.data && event.notification.data.tag) || '';
  event.notification.close();

  event.waitUntil(
    (async () => {
      const all = await allWindows();

      // Sudah Recall: tutup saja, jangan paksa buka jendela app.
      if (action === 'dismiss') {
        broadcast(all, { type: 'alarm-action', action: 'dismiss', tag });
        return;
      }

      if (action === 'snooze') {
        broadcast(all, { type: 'alarm-action', action: 'snooze', tag });
      }

      for (const client of all) {
        if ('focus' in client) {
          await client.focus();
          return;
        }
      }
      // Tidak ada jendela terbuka (app ditutup): snooze tidak bisa dijadwalkan
      // ulang dari sini, jadi hanya buka app agar pengguna bisa melihat statusnya.
      if (self.clients.openWindow) {
        await self.clients.openWindow('./');
      }
    })(),
  );
});
