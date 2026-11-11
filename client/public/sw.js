// Future Center Clinic PWA Service Worker
const CACHE_NAME = 'future-center-pwa-v2';

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/pwa-192x192.png',
  '/icons/pwa-512x512.png',
  '/icons/apple-touch-icon.png',
  '/assets/brand-mark.png',
  '/assets/Alexandria.ttf',
  '/assets/Plex-Regular.ttf',
  '/assets/Plex-Medium.ttf',
  '/assets/Plex-Bold.ttf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache pre-fill partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NEVER cache or intercept API endpoints, auth checks, or non-GET requests
  if (request.method !== 'GET' || url.pathname.startsWith('/api')) {
    return;
  }

  // 2. Navigation requests (HTML pages) -> Network first, fallback to cached App Shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response(
            '<div style="font-family:sans-serif;text-align:center;padding:50px;direction:rtl"><h3>تعذر الاتصال بالشبكة</h3><p>يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.</p></div>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Static assets (fonts, images, scripts) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // Network failed, silently return cached if existed
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Web Push Notification Handlers
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'مركز المستقبل للتغذية 🔔';
  const options = {
    body: data.body || 'لديكِ إشعار جديد في حسابك بمركز المستقبل.',
    icon: data.icon || '/icons/pwa-192x192.png',
    badge: '/icons/pwa-192x192.png',
    dir: 'rtl',
    lang: 'ar',
    tag: data.tag || 'future-center-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    sound: '/sounds/future-chime.mp3',
    data: {
      url: data.link || '/account',
    },
    vibrate: [300, 150, 300, 150, 450],
    actions: [
      { action: 'open', title: 'عرض التفاصيل' },
      { action: 'close', title: 'إغلاق' },
    ],
  };

  // Broadcast to open client tabs so in-app chime plays immediately
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
    for (const client of windowClients) {
      client.postMessage({ type: 'FUTURE_PUSH_RECEIVED', data });
    }
  }).catch(() => {});

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/account';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/account') && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
