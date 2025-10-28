// BENIRAGE Service Worker for PWA functionality
const CACHE_NAME = 'benirage-v1.0.0';
const STATIC_CACHE = 'benirage-static-v1.0.0';
const DYNAMIC_CACHE = 'benirage-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/LOGO_CLEAR_stars.png',
  '/robots.txt',
  '/sitemap.xml'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 BENIRAGE Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 BENIRAGE Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ BENIRAGE Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ BENIRAGE Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 BENIRAGE Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ BENIRAGE Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ BENIRAGE Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 BENIRAGE Service Worker: Background sync triggered');
    event.waitUntil(syncFormSubmissions());
  }
});

// Sync pending form submissions when online
async function syncFormSubmissions() {
  try {
    const pendingSubmissions = await getStoredSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        // Attempt to submit to server
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          // Remove from pending submissions
          await removeStoredSubmission(submission.id);
          console.log('✅ BENIRAGE Service Worker: Synced submission', submission.id);
        }
      } catch (error) {
        console.error('❌ BENIRAGE Service Worker: Sync failed for submission', submission.id, error);
      }
    }
  } catch (error) {
    console.error('❌ BENIRAGE Service Worker: Background sync failed', error);
  }
}

// Helper functions for offline form storage
async function getStoredSubmissions() {
  try {
    const cache = await caches.open('benirage-offline-forms');
    const response = await cache.match('/offline-submissions');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting stored submissions:', error);
  }
  return [];
}

async function removeStoredSubmission(id) {
  try {
    const submissions = await getStoredSubmissions();
    const filtered = submissions.filter(s => s.id !== id);
    
    const cache = await caches.open('benirage-offline-forms');
    await cache.put('/offline-submissions', new Response(JSON.stringify(filtered)));
  } catch (error) {
    console.error('Error removing stored submission:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/LOGO_CLEAR_stars.png',
    badge: '/LOGO_CLEAR_stars.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/LOGO_CLEAR_stars.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/LOGO_CLEAR_stars.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'BENIRAGE', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🚀 BENIRAGE Service Worker: Loaded and ready');