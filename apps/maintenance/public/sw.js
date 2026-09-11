// Bhagirathi PWA Service Worker - Static Shell Cache
const CACHE_NAME = 'bhagirathi-shell-v1';

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

// Activate event - cleanup old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.info('[SW] Removing outdated cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first for navigation, stale-while-revalidate for assets, strict bypass for APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Only intercept GET requests
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
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.woff2');

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