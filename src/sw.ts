import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Declare the Workbox manifest type for TypeScript
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any;
};

// Clean up any previous precached files
cleanupOutdatedCaches();

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'euclid-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Cache images with cache-first strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'euclid-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache fonts with cache-first strategy
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'euclid-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Cache CSS and JS with stale-while-revalidate
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'euclid-static-resources',
  })
);

// Handle navigation requests with network-first, fallback to cached HTML
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'euclid-pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

console.log('Euclid Protocol Service Worker loaded');
