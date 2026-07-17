const CACHE_NAME = 'exambank-cache-v1';
const OFFLINE_URL = '/index.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/design-system/theme.css',
  '/src/design-system/reset.css',
  '/src/design-system/utilities.css',
  '/src/design-system/components.css',
  '/src/app.js'
  // Note: ES modules fetched dynamically will be cached at runtime
];

// 1. Install Event (Pre-cache static assets)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event (Clean up old caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event (Cache-First for static assets, Network-First for APIs)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET requests and WebSocket upgrades
  if (event.request.method !== 'GET' || url.protocol === 'ws:' || url.protocol === 'wss:') return;

  // Handle API Requests (Network First, fallback to IndexedDB or Cache is handled by api-client/dbService)
  if (url.pathname.startsWith('/api/v1')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle Static Assets & Navigation (Cache First, fallback to Network)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache newly fetched assets dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and requesting a page route, return the SPA shell
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

// 4. Background Sync (Triggered when connection returns)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(
      // We could query IndexedDB directly here to flush the syncQueue,
      // but typically we let the main app thread handle it when 'online' event fires
      // so it can handle auth tokens correctly.
      Promise.resolve()
    );
  }
});
