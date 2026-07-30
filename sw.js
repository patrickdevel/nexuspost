const CACHE_NAME = 'cliq-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // füge wichtige Ressourcen hinzu, z.B. CSS, JS, Bilder
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});