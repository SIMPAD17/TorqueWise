// The website's service worker removes itself. The calculator (the web edition) was at the site's root on 15 Nov 2026 with a
// service worker that kept it for offline use, and was taken off the same day (D-TW-6). A browser that opened it fetches this
// file on its next visit; it deletes the kept copy, unregisters, and reloads the open pages from the network. The website's
// pages register no service worker. Remove this file when the web edition is published with its own (site/README.md).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('torquewise-')).map(k => caches.delete(k))))
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(clients => Promise.all(clients.map(c => c.navigate(c.url)))));
});
