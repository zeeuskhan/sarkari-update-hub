const CACHE_NAME = "sarkari-update-hub-v1";
const APP_SHELL = ["/", "/style.css", "/favicon.svg", "/manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
  }
});

self.addEventListener("push", event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch { payload = { body: event.data ? event.data.text() : "नई सरकारी अपडेट उपलब्ध है।" }; }
  const title = payload.title || "Sarkari Update Hub";
  const options = {
    body: payload.body || "नई नौकरी, योजना या स्कॉलरशिप अपडेट देखने के लिए टैप करें।",
    icon: payload.icon || "/favicon.svg",
    badge: payload.badge || "/favicon.svg",
    data: { url: payload.url || "/" },
    tag: payload.tag || "sarkari-update",
    renotify: false
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      const existing = clients.find(client => client.url === target);
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })
  );
});
