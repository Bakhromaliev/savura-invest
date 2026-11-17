// Savura Invest — service worker (oddiy va xavfsiz)
const VER = "savura-v2";
const SHELL = ["/", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // Supabase, YouTube, Meta va boshqalar — tegmaymiz
  if (url.pathname.startsWith("/api/")) return;        // API — har doim jonli
  if (req.mode === "navigate") {                        // sahifa: avval tarmoq, internet yo'q bo'lsa — saqlangan
    e.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/")) {  // hash'li fayllar: avval kesh
    e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => {
      const cp = r.clone(); caches.open(VER).then(c => c.put(req, cp)); return r;
    })));
  }
});

// Push-bildirishnomalar (bot yuboradi: narx ogohlantirishi, signallar, ochilish rejasi)
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Savura Invest", {
    body: d.body || "", icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: d.tag || undefined, data: { url: d.url || "/terminal" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/terminal";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) { if (w.url.indexOf(self.location.origin) === 0 && "focus" in w) { w.navigate(url); return w.focus(); } }
    return clients.openWindow(url);
  }));
});
