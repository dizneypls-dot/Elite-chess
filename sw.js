// Offline cache for the installed (Add to Home Screen) web app. Bump VERSION when files change.
const VERSION = 'gw-v2';
const FILES = ['./', 'index.html', 'manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'chess.js', 'data.js', 'puzzles.js', 'openings.js', 'lessons.js', 'core.js', 'play.js', 'learn.js',
  'stockfish.wasm.js', 'stockfish.wasm', 'stockfish.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Cache-first for app files and Google Fonts; everything else goes to the network.
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && (new URL(e.request.url).origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(e.request.url))){
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
    }
    return res;
  })));
});
