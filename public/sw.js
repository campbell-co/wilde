// Wilde England service worker
// - Caches shell assets for offline
// - Network-first for app pages (so data is fresh when online) with cache fallback
// - API calls are NOT cached

const VERSION = 'we-v1';
const SHELL_CACHE = `we-shell-${VERSION}`;
const PAGE_CACHE = `we-pages-${VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Don't cache API responses (they're dynamic + potentially sensitive)
  if (url.pathname.startsWith('/api/')) return;

  // Network-first for navigation & everything else
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(PAGE_CACHE).then((cache) => {
          // Only cache successful GETs
          if (res.status === 200 && res.type === 'basic') cache.put(req, copy);
        });
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
  );
});
