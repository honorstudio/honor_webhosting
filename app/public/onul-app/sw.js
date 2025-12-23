// Service Worker for 오늘 앱
const CACHE_NAME = 'onul-app-v1';
const STATIC_CACHE_NAME = 'onul-static-v1';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/app/',
  '/app/manifest.json',
  '/app/favicon.ico',
  '/app/icons/icon-192x192.png',
  '/app/icons/icon-512x512.png',
];

// 설치 이벤트 - 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // 새 서비스 워커 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // 모든 클라이언트에 즉시 적용
  self.clients.claim();
});

// Fetch 이벤트 - 네트워크 우선 전략 (API), 캐시 우선 전략 (정적 리소스)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 네트워크 우선
  if (url.pathname.includes('/rest/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 정적 리소스는 캐시 우선
  if (request.destination === 'image' ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      url.pathname.startsWith('/app/icons/') ||
      url.pathname.endsWith('.json')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 기타 요청은 네트워크 우선
  event.respondWith(networkFirst(request));
});

// 캐시 우선 전략
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache first fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// 네트워크 우선 전략
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Push 알림 (향후 확장용)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/app/icons/icon-192x192.png',
      badge: '/app/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/app/',
      },
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/app/')
  );
});
