const CACHE_KEY = 'scan2print-core-v5';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept incoming files shared via Android system share menu
  if (event.request.method === 'POST' && url.pathname.endsWith('index.html')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        let incomingFile = null;

        for (const entry of formData.values()) {
          if (entry instanceof File && entry.size > 0) {
            incomingFile = entry;
            break;
          }
        }

        if (incomingFile) {
          const cache = await caches.open(CACHE_KEY);
          const cachedResponse = new Response(incomingFile, {
            headers: {
              'Content-Type': incomingFile.type || 'application/octet-stream',
              'X-Original-Name': encodeURIComponent(incomingFile.name || 'Mobile_Upload.pdf')
            }
          });
          await cache.put('pending_share', cachedResponse);
        }
      } catch (err) {
        console.error('ServiceWorker Share Target Error:', err);
      }
      return Response.redirect('./index.html?shared=true', 303);
    })());
  }
});
