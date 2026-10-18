// Offline cache for the installed (Add to Home Screen) web app. Built by tools/site.py.
const VERSION = 'gw-6877480984';
const FILES = ['./', 'index.html', 'config.js', 'chess.js', 'data.js', 'pieces.js', 'seasonal.js', 'flyovers.js', 'themes.js', 'sportthemes.js', 'sounds.js', 'world-data.js', 'repertoire.js', 'puzzles.js', 'puzzles-extra.js', 'openings.js', 'lessons.js', 'core.js', 'play.js', 'world.js', 'customize.js', 'firebase.js', 'sync.js', 'auth.js', 'learn.js', 'online.js', 'social.js', 'sports.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'stockfish.js', 'stockfish.wasm', 'stockfish.wasm.js', 'sf17-lite.js', 'sf17-lite.wasm'];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // The page itself: network first, so a new version shows up straight away; the cached copy when offline
  if (e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')){
    e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // App files and Google Fonts: cache first (the version above changes whenever a file changes)
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(e.request.url))){
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
    }
    return res;
  })));
});
