const BASE_PATH = '/test-companion-pwa/';
const INDEX_URL = BASE_PATH + 'index.html';

(function () {
  'use strict';

  // Это событие срабатывает, когда Service Worker успешно активирован и готов к работе
  self.addEventListener('activate', (event) => {
    console.log('[Custom SW] Service Worker успешно инициализирован и активирован.');
  });

  // Лог для подтверждения загрузки файла
  console.log('[Custom SW] Файл sw.js успешно загружен и применил importScripts для ngsw-worker.js');


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

})();

// Подключаем стандартный Angular Service Worker
importScripts('./ngsw-worker.js');





