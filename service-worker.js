/* ==========================================
   Service Worker - PWA Offline Support
   ========================================== */

const CACHE_NAME = 'exam-bank-v12';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/assets/css/login.css',
    '/assets/js/app.js',
    '/assets/css/style.css',
    '/assets/js/firebase-init.js',
    '/manifest.json',
    '/assets/js/sound-effects.js',
    '/assets/images/icon-192.svg',
    '/assets/images/icon-512.svg',
    '/assets/images/badge-72.svg',
    '/assets/images/pwa-screenshot-mobile.svg',
    '/assets/images/pwa-screenshot-desktop.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching static assets...');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('⚠️  Some assets failed to cache:', err);
                // Continue even if some assets fail to cache
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('✨ Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️  Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests and certain protocols
    if (url.origin !== location.origin) {
        return;
    }

    // Network-first for dynamic content (API calls)
    if (request.url.includes('/api/') || request.url.includes('firestore') || request.url.includes('firebase')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses
                    if (response && response.status === 200 && response.type !== 'error') {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Try to get from cache if network fails
                    return caches.match(request);
                })
        );
        return;
    }

    // Cache-first for static assets
    event.respondWith(
        caches.match(request).then((response) => {
            if (response) {
                return response;
            }

            return fetch(request).then((response) => {
                // Don't cache if not a success
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Cache the fetched response
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseClone);
                });

                return response;
            }).catch(() => {
                // Fallback for offline
                console.log('📡 Offline - no cached response for:', request.url);
                
                // Return a basic offline page if HTML is requested
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
                
                return new Response('Offline - Resource not available', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            });
        })
    );
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'رسالة جديدة',
        icon: '/assets/images/icon-192.svg',
        badge: '/assets/images/badge-72.svg',
        tag: data.tag || 'notification',
        requireInteraction: data.requireInteraction || false,
        actions: [
            {
                action: 'open',
                title: 'فتح'
            },
            {
                action: 'close',
                title: 'إغلاق'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'إيجزام بنك', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if window already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync event:', event.tag);
    
    if (event.tag === 'sync-answers') {
        event.waitUntil(syncAnswersWithServer());
    }
});

async function syncAnswersWithServer() {
    try {
        // This will be implemented when user is back online
        const cache = await caches.open(CACHE_NAME);
        console.log('✅ Syncing answers with server...');
    } catch (error) {
        console.error('❌ Sync failed:', error);
        throw error;
    }
}

// Message handler for client communication
self.addEventListener('message', (event) => {
    console.log('📨 Message received in SW:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME);
    }
});

console.log('✅ Service Worker loaded successfully');
