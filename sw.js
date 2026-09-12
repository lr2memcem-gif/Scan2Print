self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname.endsWith('index.html')) {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const file = formData.get('shared_files');

      const cache = await caches.open('scan2print-share');
      if (file) {
        await cache.put('incoming_share', new Response(file));
      }

      return Response.redirect('./index.html?shared=true', 303);
    })());
  } else {
    event.respondWith(fetch(event.request));
  }
});
