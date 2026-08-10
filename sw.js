// Service worker: precaches the whole app so it works fully offline.
// Strategy: stale-while-revalidate — serve from cache instantly, refresh the
// cache in the background when online, so content updates arrive on the next launch.
const CACHE = 'hebrew-app-v3';

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/base.css',
  'css/components.css',
  'css/main.css',
  'css/responsive.css',
  'css/themes.css',
  'js/config/constants.js',
  'js/handlers/EventHandlers.js',
  'js/main.js',
  'js/managers/ChunkManager.js',
  'js/managers/StateManager.js',
  'js/services/AudioService.js',
  'js/services/DataService.js',
  'js/ui/ContentFormatter.js',
  'js/ui/MenuSystem.js',
  'js/ui/UI.js',
  'js/ui/icons.js',
  'js/utils/helpers.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'resources/audio/adjacent_correct.wav',
  'resources/audio/adjacent_lap.wav',
  'resources/audio/adjacent_mistake.wav',
  'resources/audio/cone_correct.wav',
  'resources/audio/cone_lap.wav',
  'resources/audio/cone_mistake.wav',
  'resources/audio/spline_correct.wav',
  'resources/audio/spline_lap.wav',
  'resources/audio/spline_mistake.wav',
  'resources/audio/vector_correct.wav',
  'resources/audio/vector_lap.wav',
  'resources/audio/vector_mistake.wav',
  'resources/data/adjectives.json',
  'resources/data/basics.json',
  'resources/data/grammar.json',
  'resources/data/nouns.json',
  'resources/data/sentences_future.json',
  'resources/data/sentences_past.json',
  'resources/data/sentences_present.json',
  'resources/data/verbs.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // no-cache: always revalidate with the server, never trust the HTTP cache
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'no-cache' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // ignoreSearch: the app appends ?t=<timestamp> cache-busters to data fetches
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      let cached = await cache.match(event.request, { ignoreSearch: true });
      // Any in-scope navigation falls back to the app shell when offline
      if (!cached && event.request.mode === 'navigate') {
        cached = await cache.match('./');
      }
      const network = fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response.ok) cache.put(event.request.url.split('?')[0], response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
