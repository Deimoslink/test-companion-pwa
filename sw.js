const CACHE_NAME = 'app-cache-v1';
const INDEX_URL = '/test-companion-pwa/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(INDEX_URL)));
});

self.addEventListener('fetch', (event) => {
  // Перехватываем только навигационные запросы (переходы по страницам)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Если сеть лежит или сервер вернул 404 - отдаем index.html из кэша
        return caches.match(INDEX_URL);
      })
    );
  }
});
