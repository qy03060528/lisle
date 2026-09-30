// lisle Service Worker
const CACHE = 'lisle-v1'
const ASSETS = ['.', './index.html', './manifest.json', './icon.svg']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  if (request.method !== 'GET') return
  e.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
        }
        return resp
      }).catch(() => cached)
      return cached || network
    })
  )
})