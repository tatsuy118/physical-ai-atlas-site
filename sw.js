// 最小のオフライン対応: 同一オリジンのGETを「先にキャッシュ、裏で更新」。データJSONは常にネット優先。
const CACHE = 'pa-atlas-v1'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())))
self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin) return
  const isData = url.pathname.includes('/data/')
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(req)
      const net = fetch(req).then((r) => { if (r.ok) cache.put(req, r.clone()); return r }).catch(() => cached)
      return isData ? net.then((r) => r ?? cached) : cached ?? net
    })(),
  )
})
