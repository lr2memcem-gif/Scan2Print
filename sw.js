const CACHE_NAME = 'scan2print-share-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept POST request from Android Share Target
  if (event.request.method === 'POST' && url.pathname.endsWith('index.html')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('shared_files');

        if (file && file.size > 0) {
          const cache = await caches.open(CACHE_NAME);
          const responseToCache = new Response(file, {
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
              'X-Original-Name': encodeURIComponent(file.name || '')
            }
          });
          await cache.put('incoming_share', responseToCache);
        }
      } catch (err) {
        console.error('Error handling shared file:', err);
      }

      // Redirect to index.html with query param to notify UI
      return Response.redirect('./index.html?shared=1', 303);
    })());
  }
});
