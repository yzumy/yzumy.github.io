/**
 * メトロノームアプリのサービスワーカー
 * オフライン機能とバックグラウンド再生をサポート
 */

// キャッシュの名前
const CACHE_NAME = 'metronome-app-v1';

// キャッシュするファイル
const FILES_TO_CACHE = [
  '/',
  '/index.php',
  '/css/style.css',
  '/js/metronome.js',
  '/js/metronome-core.js',
  '/js/ui-controller.js',
  '/js/preset-manager.js',
  '/js/sound-generator.js',
  '/img/houjirou.jpg',
  '/audio/click.mp3',
  '/audio/click_accent.mp3',
  '/audio/woodblock.mp3',
  '/audio/woodblock_accent.mp3',
  '/audio/cowbell.mp3',
  '/audio/cowbell_accent.mp3',
  '/audio/hihat.mp3',
  '/audio/hihat_accent.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// インストール時のイベント
self.addEventListener('install', event => {
  console.log('サービスワーカーをインストールしています...');
  
  // キャッシュを事前に作成
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ファイルをキャッシュしています...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch(error => {
        console.error('キャッシュの作成に失敗しました:', error);
      })
  );
});

// アクティベート時のイベント
self.addEventListener('activate', event => {
  console.log('サービスワーカーがアクティブになりました');
  
  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除しています:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 新しいサービスワーカーをすぐにアクティブにする
  return self.clients.claim();
});

// フェッチ時のイベント
self.addEventListener('fetch', event => {
  // オンラインの場合はネットワークを優先し、失敗したらキャッシュを使用
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// バックグラウンドでの同期イベント
self.addEventListener('sync', event => {
  if (event.tag === 'metronome-sync') {
    console.log('バックグラウンド同期が発生しました');
    // バックグラウンドでの処理を行う（必要に応じて）
  }
});

// プッシュ通知イベント
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/img/houjirou.jpg',
    badge: '/img/houjirou.jpg'
  };
  
  event.waitUntil(
    self.registration.showNotification('メトロノームアプリ', options)
  );
});

// 通知クリックイベント
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // 通知がクリックされたときにアプリを開く
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(clientList => {
        // すでに開いているウィンドウがあれば、それにフォーカス
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // なければ新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
