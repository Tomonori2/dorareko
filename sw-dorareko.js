// スマホドラレコ サービスワーカー（オフラインで動かすための仕組み）
// 役割：一度開いたファイルを"端末内"に保存し、次からネットなしでも開けるようにする
const CACHE = "dorareko-v2";
const ASSETS = [
  "./",
  "index.html",
  "dorareko-manifest.json",
  "dorareko-icon-192.png",
  "dorareko-icon-512.png"
];

// 初回：必要なファイルを端末内にキャッシュ
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// 更新時：古いキャッシュを片付ける
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 開くとき：まず端末内のキャッシュから（無ければネット）→ オフラインでも動く
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
