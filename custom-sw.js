const BASE_PATH = '/test-companion-pwa/';
const INDEX_URL = BASE_PATH + 'index.html';

(function () {
  'use strict';

  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      console.log('[SW] Fetching navigation:', event.request.url);
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Если сеть вернула 404, идем в кэш
            if (!response || response.status === 404) {
              throw new Error('404');
            }
            return response;
          })
          .catch(async () => {
            console.log('[SW] Network failed/404, serving cached index.html');
            const cachedResponse = await caches.match(INDEX_URL);
            return cachedResponse || fetch(INDEX_URL);
          })
      );
      return;
    }

    // Для остальных запросов
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  });
})();

// Подключаем стандартный Angular Service Worker
importScripts('./ngsw-worker.js');





