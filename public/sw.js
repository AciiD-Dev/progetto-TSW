const CACHE_NAME = 'homehub-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/login'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  // Use Network-First strategy so we always check the server for fresh auth state
  // and latest data, falling back to cache only if offline.
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clone the response and update the cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache API routes or non-GET requests to prevent stale data
          if (e.request.method === 'GET' && !e.request.url.includes('/api/')) {
            cache.put(e.request, responseClone);
          }
        });
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
