import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

const BASE_PREFIX = '/test-companion-pwa/';

// 1. Автоматический прекеш статики Angular
precacheAndRoute(self.__WB_MANIFEST || []);

// --- ВОТ ЭТОТ КУСОК МЫ ВОЗВРАЩАЕМ ---
// Говорим Workbox: "Если пользователь пытается перейти на любой внутренний URL (navigate),
// и сеть недоступна или этот путь не существует физически — отдай ему закешированный index.html"
const handler = createHandlerBoundToURL(BASE_PREFIX + 'index.html');
const navigationRoute = new NavigationRoute(handler, {
  // Игнорируем запросы, которые содержат точки (картинки, файлы конфигураций, стили)
  // чтобы не сломать скачивание реальных ассетов
  denylist: [new RegExp('/[^\\s\\.]+\\.[^\\s\\.]+$')],
});
registerRoute(navigationRoute);
// ------------------------------------

// 2. Стратегия для API (Network First)
registerRoute(
  ({ url }) => url.hostname === 'jsonplaceholder.typicode.com' || url.pathname.includes('/api/'),
  new NetworkFirst({
    cacheName: 'test-companion-api-v1',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        handlerDidError: async ({ request }) => {
          if (!navigator.onLine) {
            const cache = await caches.open('test-companion-api-v1');
            return await cache.match(request, { ignoreSearch: true });
          }
        }
      }
    ]
  })
);

// 3. Стратегия для картинок
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'test-companion-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
);

self.addEventListener('install', () => self.skipWaiting());
