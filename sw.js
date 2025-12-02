const CACHE_NAME = 'outlive-tracker-v2';
const localUrlsToCache = [
  '.',
  'index.html',
  'app.js',
  'icon.svg'
];
const remoteUrlToCache = 'https://cdn.tailwindcss.com';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        
        // Cache remote asset with no-cors
        const remoteCachePromise = fetch(remoteUrlToCache, { mode: 'no-cors' })
          .then(response => {
            return cache.put(remoteUrlToCache, response);
          })
          .catch(err => {
            console.error('Failed to cache remote URL:', err);
          });

        // Cache local assets
        const localCachePromise = cache.addAll(localUrlsToCache);
        
        return Promise.all([localCachePromise, remoteCachePromise]);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return from cache
        }
        return fetch(event.request); // Fetch from network
      })
  );
});
