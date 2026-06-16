const STATIC_CACHE = 'test-companion-static-v1';
const DATA_CACHE = 'test-companion-api-v1'; // Отдельное хранилище для API
const BASE_PREFIX = '/test-companion-pwa/';

const ASSETS = [
  BASE_PREFIX,
  BASE_PREFIX + 'index.html',
  BASE_PREFIX + 'manifest.webmanifest',
  BASE_PREFIX + 'favicon.ico'
];

// 1. Установка: кэшируем только критическую статику
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Активация: чистим старые кэши, если поменялась версия
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Перехват всех запросов
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- СТРАТЕГИЯ ДЛЯ API (Network First) ---
  // Если запрос идет к jsonplaceholder (или любому другому внешнему API)
  if (url.hostname === 'jsonplaceholder.typicode.com' || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Если сеть ответила ок — дублируем свежие данные в DATA_CACHE
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Если сети нет — вытаскиваем из DATA_CACHE то, что успели сохранить ранее
          return caches.match(event.request);
        })
    );
    return; // Выходим, чтобы код ниже не перехватил этот запрос
  }

  // --- СТРАТЕГИЯ ДЛЯ СТАТИКИ ПРИЛОЖЕНИЯ (Cache First) ---
  if (!url.pathname.startsWith(BASE_PREFIX)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Фоновое обновление JS/CSS при наличии сети
        if (event.request.destination === 'script' || event.request.destination === 'style') {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(BASE_PREFIX + 'index.html');
        }
      });
    })
  );
});
