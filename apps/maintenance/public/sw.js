// Bhagirathi PWA Service Worker - Static Shell Cache
const CACHE_NAME = 'bhagirathi-shell-v2';

// Critical shell assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png'
];

// Install event - precache app shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache asset fetch failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleanup older Bhagirathi shell caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('bhagirathi-shell-') && cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.info('[SW] Removing outdated shell cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first for navigation, stale-while-revalidate for assets, strict bypass for APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Only intercept GET requests - NEVER intercept or queue POST, PUT, PATCH, DELETE business mutations
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 2. Only handle http and https schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 3. STRICT SECURITY & SAFETY: Never intercept, cache, or block API requests, backend endpoints, or auth headers
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/auth/') ||
    url.hostname.includes('railway.app') ||
    url.port === '8000' ||
    request.headers.has('Authorization')
  ) {
    return; // Pass through to standard browser network fetch
  }

  // 4. HTML Navigation requests: Network-First with cached shell fallback
  // This guarantees new deployments are immediately received online,
  // while allowing the app shell to open when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html')
            .then((cachedResponse) => cachedResponse || caches.match('/'));
        })
    );
    return;
  }

  // 5. Static assets (same-origin JS, CSS, images, fonts): Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    const isStaticAsset =
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.webmanifest') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.woff');

    if (isStaticAsset) {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return networkResponse;
            })
            .catch(() => null);

          return cachedResponse || fetchPromise;
        })
      );
      return;
    }
  }

  // Default: let standard network fetch handle everything else
});

// 6. Push Event - Handle incoming Web Push payloads
self.addEventListener('push', (event) => {
  let data = {
    title: 'Bhagirathi Notification',
    body: 'You have a new notification.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || payload.message || data.body;
      data.icon = payload.icon || '/icons/icon-192x192.png';
      data.badge = payload.badge || '/icons/icon-192x192.png';
      data.data = {
        url: payload.url || (payload.data && payload.data.url) || '/',
        notification_id: payload.notification_id,
        reference_id: payload.reference_id,
        reference_type: payload.reference_type,
      };
    } catch (err) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    vibrate: [100, 50, 100],
    tag: data.data.notification_id || 'bhagirathi-maintenance-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 7. Notification Click Event - Focus existing tab or open new same-origin window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = '/';
  if (event.notification.data && event.notification.data.url) {
    const rawUrl = event.notification.data.url;
    try {
      const parsed = new URL(rawUrl, self.location.origin);
      if (parsed.origin === self.location.origin) {
        targetUrl = parsed.pathname + parsed.search + parsed.hash;
      }
    } catch (e) {
      targetUrl = '/';
    }
  }

  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.navigate(fullTargetUrl).then((focusedClient) => {
            return focusedClient ? focusedClient.focus() : client.focus();
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});