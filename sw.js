/* Breakpoint City service worker (generated at build time from pwa/sw.template.js).
 *
 * Precaches the whole production build under a versioned cache, serves it cache-first so the
 * game launches offline (including from an iOS Home Screen icon), and never swaps versions
 * under a running game: an updated worker waits until the page asks it to take over
 * (the "Update ready" prompt), then deletes the old caches.
 */
const VERSION = '4516f156a3f5';
const PRECACHE = [
  "./",
  "./assets/basis/basis_transcoder.js",
  "./assets/basis/basis_transcoder.wasm",
  "./assets/basis_transcoder-VXdx5NbI.wasm",
  "./assets/basis_transcoder-o4Hde_L7.js",
  "./assets/index-DnYUVPg9.js",
  "./assets/index-TNbEpx64.css",
  "./assets/manifest.json",
  "./assets/models/commuter.glb",
  "./assets/models/cooling-unit.glb",
  "./assets/streamWorker-Bw2QLYR1.js",
  "./assets/textures/commuter-detail.ktx2",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
];
const CACHE = `bpc-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // cache: 'reload' bypasses the HTTP cache so a new version never stores stale files.
      await cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })));
      // First install: nothing to replace, take control at once (offline works after one visit).
      if (!self.registration.active) await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key.startsWith('bpc-') && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'VERSION') event.source && event.source.postMessage({ type: 'VERSION', version: VERSION, files: PRECACHE.length });
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // Navigations (any ?query) are served the cached app shell.
      if (req.mode === 'navigate') {
        const shell = await cache.match('./index.html');
        if (shell) return shell;
        return fetch(req);
      }
      const hit = await cache.match(req, { ignoreSearch: url.pathname.endsWith('.html') });
      if (hit) return hit;
      return fetch(req);
    })(),
  );
});
