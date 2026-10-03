const PREFIX = 'fitvision-static-';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// Cache only a fixed build manifest: no API responses, photos or profile data.
self.addEventListener('message', event => {
  if (event.data?.type !== 'PREPARE_OFFLINE') return;
  event.waitUntil((async () => {
    try {
      const response = await fetch('/offline-assets.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Manifesto offline indisponível.');
      const manifest = await response.clone().json();
      const cacheName = PREFIX + manifest.version;
      const cache = await caches.open(cacheName);
      for (const path of manifest.assets) {
        if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/api/')) throw new Error('Manifesto offline inválido.');
        const result = await fetch(path, { cache: 'reload' });
        if (!result.ok) throw new Error('Falha ao preparar os arquivos. Verifique a conexão e tente novamente.');
        await cache.put(path, result);
      }
      await cache.put('/offline-assets.json', response);
      for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== cacheName) await caches.delete(name);
      event.ports[0]?.postMessage({ ok: true });
    } catch (error) { event.ports[0]?.postMessage({ ok: false, error: error.message }); }
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith((async () => {
    try { return await fetch(event.request); }
    catch {
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) return cached;
      if (event.request.mode === 'navigate') return (await caches.match('/')) || Response.error();
      return Response.error();
    }
  })());
});
