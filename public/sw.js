/* Service worker: lets the game load and play offline.
 * Bump VERSION whenever this file changes so old caches are dropped. */
const VERSION = 'v3'
const CACHE = `hangman-${VERSION}`

// The game screens are separate URLs, so each one can be reloaded offline
const PRECACHE_URLS = [
  '/',
  '/settings',
  '/composition',
  '/discovery',
  '/summary',
  '/share',
  '/end',
  '/manifest.webmanifest',
  '/images/favicon.svg',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/scribble.mp3',
  '/win.mp3',
  '/loss.mp3',
  '/correct.mp3',
]

const isStaticAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/_next/image') ||
  url.pathname.startsWith('/images/') ||
  url.pathname === '/manifest.webmanifest' ||
  /\.(mp3|ttf|woff2?|png|jpe?g|webp|svg)$/.test(url.pathname)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      // Pages start downloading while the worker boots, instead of after
      .then(() => self.registration.navigationPreload?.enable())
      .then(() => self.clients.claim())
  )
})

// The page sends the assets it already loaded before this worker took control
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return
  const urls = event.data.urls.filter((href) => {
    const url = new URL(href, self.location.origin)
    return url.origin === self.location.origin && isStaticAsset(url)
  })
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.all(urls.map((url) => cache.add(url).catch(() => {})))))
})

// Pages: fresh from the network when online, the cached copy (or the game page) when offline.
// Kept by path alone, so each challenge link (?c=…) doesn't store another copy of the same page.
const networkFirst = async (event) => {
  const cache = await caches.open(CACHE)
  const key = new URL(event.request.url).pathname
  try {
    const response = (await event.preloadResponse) || (await fetch(event.request))
    if (response.ok) cache.put(key, response.clone())
    return response
  } catch {
    return (await cache.match(key)) || (await cache.match('/')) || Response.error()
  }
}

// Build files: their names change with their content, so a cached copy never goes stale
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

// Assets: answer from the cache right away and refresh it in the background
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached || Response.error())
  return cached || network
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  // Word requests (POST), ads and analytics (other origins) always go to the network
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event))
    return
  }
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }
  if (isStaticAsset(url)) event.respondWith(staleWhileRevalidate(request))
})
