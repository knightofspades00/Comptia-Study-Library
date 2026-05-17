/* Service worker for the IT & Digital Skills Library.
 * Network-first: online visitors always get fresh content; the cache is the
 * offline fallback. Bump CACHE when the caching strategy itself changes. */
const CACHE = 'skills-library-v1';
const ASSETS = [
  './', './index.html', './study.js', './manifest.json', './icon.svg',
  './techplus.html', './aplus.html', './network_plus.html', './security_plus.html',
  './htmlcss.html', './python_pcap.html', './ai_literacy.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
