const CACHE_NAME = 'scan2print-share-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname.endsWith('index.html')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        let targetFile = null;

        for (const [key, value] of formData.entries()) {
          if (value instanceof File && value.size > 0) {
            targetFile = value;
            break;
          }
        }

        if (targetFile) {
          const cache = await caches.open(CACHE_NAME);
          const responseToCache = new Response(targetFile, {
            headers: {
              'Content-Type': targetFile.type || 'application/octet-stream',
              'X-Original-Name': encodeURIComponent(targetFile.name || 'Shared_Document')
            }
          });
          await cache.put('incoming_share', responseToCache);
        }
      } catch (err) {
        console.error('ServiceWorker Share Target Error:', err);
      }

      return Response.redirect('./index.html?shared=1', 303);
    })());
  }
});
