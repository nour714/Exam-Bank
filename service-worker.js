/* ==========================================
   Service Worker - PWA Offline Support
   ========================================== */

const CACHE_NAME = 'exam-bank-v15';
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
    '/assets/images/pwa-screenshot-desktop.svg',
    '/assets/images/subjects/physics.jpg',
    '/assets/images/subjects/chemistry.jpg',
    '/assets/images/subjects/biology.jpg',
    '/assets/images/subjects/math.jpg',
    '/assets/images/subjects/arabic.jpg',
    '/assets/images/subjects/english.jpg',
    '/assets/images/subjects/geology.jpg',
    '/assets/images/subjects/history.jpg',
    '/assets/images/subjects/geography.jpg'
];

// Install event - cache static assets and activate immediately
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching static assets...');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('⚠️  Some assets failed to cache:', err);
                return Promise.resolve();
            });
        })
    );
    // Activate immediately without waiting for old SW to finish
    self.skipWaiting();
});

// Activate event - clean up old caches and take control immediately
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
        }).then(() => {
            // Tell all open tabs to use the new SW immediately
            return self.clients.claim();
        }).then(() => {
            // Notify all clients to reload for new content
            return self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({ type: 'SW_ACTIVATED' });
                });
            });
        })
    );
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

    // Network-first for HTML, JS, CSS — always get fresh content, fallback to cache if offline
    const isAppShell = request.headers.get('accept')?.includes('text/html') ||
        request.url.endsWith('.js') ||
        request.url.endsWith('.css');

    if (isAppShell) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline fallback from cache
                    return caches.match(request).then(cached => {
                        if (cached) return cached;
                        if (request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        return new Response('Offline', { status: 503 });
                    });
                })
        );
        return;
    }

    // Cache-first for images and other static assets (fonts, icons, etc.)
    event.respondWith(
        caches.match(request).then((response) => {
            if (response) {
                // Return cached and also revalidate in background (stale-while-revalidate)
                fetch(request).then(freshResponse => {
                    if (freshResponse && freshResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(request, freshResponse));
                    }
                }).catch(() => {});
                return response;
            }

            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseClone);
                });
                return response;
            }).catch(() => {
                console.log('📡 Offline - no cached response for:', request.url);
                return new Response('Offline - Resource not available', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({ 'Content-Type': 'text/plain' })
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
