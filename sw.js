// Lentes Vision · funciona sem internet depois do primeiro acesso.
// Ao publicar uma nova versão do app, aumente o número abaixo (v2, v3...)
// para os tablets baixarem a atualização.
const VERSAO = "lentes-vision-v2";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./fonts/lexend-latin-300-normal.woff2",
  "./fonts/lexend-latin-400-normal.woff2",
  "./fonts/lexend-latin-500-normal.woff2",
  "./fonts/lexend-latin-600-normal.woff2",
  "./fonts/lexend-latin-700-normal.woff2"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Página: tenta a rede primeiro (pega a versão mais nova) e usa a cópia salva se estiver sem internet.
// Demais arquivos: usa a cópia salva primeiro.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put("./index.html", copia)); return r; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
