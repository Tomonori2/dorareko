// スマホドラレコ サービスワーカー（オフラインで動かすための仕組み）
// 役割：一度開いたファイルを"端末内"に保存し、次からネットなしでも開けるようにする
const CACHE = "dorareko-v3";
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

// 開くとき：まずネットから最新版を取り、取れたらキャッシュも更新
// （圏外のときだけキャッシュを使う）→ 更新がすぐ届き、オフラインでも動く
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 地図タイルや外部サービスはブラウザに任せる（キャッシュが膨らむのを防ぐ）
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
