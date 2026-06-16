const CACHE_NAME = 'test-companion-v1';
const BASE_PREFIX = '/test-companion-pwa/';

const ASSETS = [
  BASE_PREFIX,
  BASE_PREFIX + 'index.html',
  BASE_PREFIX + 'manifest.webmanifest',
  BASE_PREFIX + 'favicon.ico'
];

// 1. При установке воркера жестко кэшируем базовый каркас
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Активация и чистка старого кэша при обновлении версии
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Перехват ВСЕХ запросов приложения
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Обрабатываем только запросы к нашему приложению (игнорируем расширения Chrome и т.д.)
  if (!url.pathname.startsWith(BASE_PREFIX)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Если файл нашли в кэше — отдаем его СРАЗУ (без походов в сеть)
      if (cachedResponse) {
        // Параллельно, если это JS или CSS, обновляем его в кэше на будущее, если есть сеть
        if (event.request.destination === 'script' || event.request.destination === 'style') {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* молча игнорим ошибку сети в фоне */});
        }
        return cachedResponse;
      }

      // Если файла в кэше нет — идем в сеть
      return fetch(event.request).then((networkResponse) => {
        // Если это успешный запрос к нашим ресурсам (картинки, чанки), сохраняем в кэш
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Если СЕТИ НЕТ и файла НЕТ в кэше, но юзер запрашивает роут (навигацию) — отдаем index.html
        if (event.request.mode === 'navigate') {
          return caches.match(BASE_PREFIX + 'index.html');
        }
      });
    })
  );
});
