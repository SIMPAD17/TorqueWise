// TorqueWise web edition: the service worker that keeps the page and the files it loads, so that it opens without a connection
// once it has been opened over HTTPS. `node build.js --web` fills in VERSION (a digest of the files) and FILES (every file of
// build/web/ but this one, with the page as "./").
const VERSION = "1057d2d1d73686aa";
const FILES = ["./","fonts/barlow-semi-condensed-latin-500-normal.woff2","fonts/barlow-semi-condensed-latin-600-normal.woff2","fonts/barlow-semi-condensed-latin-700-normal.woff2","fonts/barlow-semi-condensed-latin-ext-500-normal.woff2","fonts/barlow-semi-condensed-latin-ext-600-normal.woff2","fonts/barlow-semi-condensed-latin-ext-700-normal.woff2","fonts/inter-greek-400-normal.woff2","fonts/inter-greek-500-normal.woff2","fonts/inter-greek-600-normal.woff2","fonts/inter-latin-400-normal.woff2","fonts/inter-latin-500-normal.woff2","fonts/inter-latin-600-normal.woff2","fonts/inter-latin-ext-400-normal.woff2","fonts/inter-latin-ext-500-normal.woff2","fonts/inter-latin-ext-600-normal.woff2","fonts/jetbrains-mono-greek-400-normal.woff2","fonts/jetbrains-mono-greek-500-normal.woff2","fonts/jetbrains-mono-greek-600-normal.woff2","fonts/jetbrains-mono-latin-400-normal.woff2","fonts/jetbrains-mono-latin-500-normal.woff2","fonts/jetbrains-mono-latin-600-normal.woff2","fonts/jetbrains-mono-latin-ext-400-normal.woff2","fonts/jetbrains-mono-latin-ext-500-normal.woff2","fonts/jetbrains-mono-latin-ext-600-normal.woff2","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon.svg","manifest.webmanifest","vendor/three/LICENSE","vendor/three/build/three.module.min.js","vendor/three/examples/jsm/controls/OrbitControls.js","vendor/three/examples/jsm/environments/RoomEnvironment.js"];
const CACHE = 'torquewise-' + VERSION;
// The page's own addresses. The website's other pages (Privacy, Support, Terms; npm run site) are in this worker's scope too,
// and are left to the network, so that none of them is ever kept in the page's place.
const PAGE = [new URL('./', self.location).pathname, new URL('./index.html', self.location).pathname];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('torquewise-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    if (!PAGE.includes(url.pathname)) return;
    // The page from the network when there is one, so that a new version shows at once; the kept copy otherwise
    event.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(cache => cache.put('./', copy)); }
      return res;
    }).catch(() => caches.match('./', { cacheName: CACHE })));
    return;
  }
  // Fonts, three.js and icons change only with a new version, which has its own cache
  event.respondWith(caches.match(req, { cacheName: CACHE }).then(hit => hit || fetch(req)));
});
