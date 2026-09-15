// 第一阶段最小安全 Service Worker：只缓存同源静态 GET，不缓存存档或第三方 API。
const CACHE_NAME = 'nahida-travel-static-v1';
self.addEventListener('install', (event) => { self.skipWaiting(); event.waitUntil(Promise.resolve()); });
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (!response.ok || response.type !== 'basic') return response;
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
    return response;
  })));
});
