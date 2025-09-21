// sw.js
const CACHE_NAME = 'multi-llm-chat-v2';
// A list of assets to cache on install. This is hardcoded but fine for this setup.
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  // Note: Caching import-map based modules is tricky. The browser fetches them directly.
  // The service worker will intercept these and cache them on the fly.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Use a cache-first strategy for all requests.
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Serve from cache
        return response;
      }

      // Not in cache, fetch from network, then cache it
      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          if (networkResponse.type === 'opaque') {
             // For opaque responses (like CDN scripts with CORS), just return them without caching
             return networkResponse;
          }
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Do not cache API calls to Gemini or LM Studio
          const url = new URL(event.request.url);
          if (url.hostname !== 'localhost' && !url.hostname.includes('googleapis.com')) {
             cache.put(event.request, responseToCache);
          }
        });
        return networkResponse;
      });
    }).catch(() => {
        // If both cache and network fail, we can show a fallback page if we had one.
        // For now, it will just fail.
    })
  );
});
