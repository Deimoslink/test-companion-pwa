const CACHE_NAME = 'app-cache-v1';
const BASE_PATH = '/test-companion-pwa/';
const INDEX_URL = BASE_PATH + 'index.html';

self.addEventListener('install', (event) => {
  console.log('[SW] Install: Caching initial files');
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(INDEX_URL)));
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {

  if (event.request.mode === 'navigate') {
    console.log('[SW] Fetching navigation:', event.request.url);
    event.respondWith(
      fetch(event.request)
      .then(response => {
        if (!response || response.status === 404) {
          throw new Error('404');
        }
        return response;
      })
      .catch(() => {
        console.log('[SW] Network failed/404, serving cached index.html');
        return caches.match(INDEX_URL);
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
