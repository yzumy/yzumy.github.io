/**
 * メトロノームWebアプリケーションのメインスクリプト
 * 各モジュールを統合し、アプリケーションを初期化します
 */

document.addEventListener('DOMContentLoaded', function() {
    // 必要なスクリプトを動的に読み込む
    loadScript('js/metronome-core.js')
        .then(() => loadScript('js/ui-controller.js'))
        .then(() => loadScript('js/preset-manager.js'))
        .then(() => loadScript('js/sound-generator.js'))
        .then(() => {
            console.log('すべてのスクリプトが読み込まれました。アプリケーションを初期化します。');
            initApp();
        })
        .catch(error => {
            console.error('スクリプトの読み込みに失敗しました:', error);
        });
    
    // スクリプトを動的に読み込む関数
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`スクリプトの読み込みに失敗しました: ${src}`));
            document.head.appendChild(script);
        });
    }
    
    // アプリケーションの初期化
    function initApp() {
        // サービスワーカーの登録（オフライン対応やバックグラウンド再生のため）
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('ServiceWorkerが登録されました:', registration);
                })
                .catch(error => {
                    console.error('ServiceWorkerの登録に失敗しました:', error);
                });
        }
        
        // ページの可視性変更イベントを監視（バックグラウンド再生対応）
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // 初期メッセージを表示
        showWelcomeMessage();
    }
    
    // ページの可視性変更を処理
    function handleVisibilityChange() {
        // ページが非表示になっても再生を継続
        if (document.hidden) {
            console.log('ページがバックグラウンドになりました。再生を継続します。');
            // AudioContextが停止するのを防ぐための処理（必要に応じて）
        } else {
            console.log('ページがフォアグラウンドに戻りました。');
        }
    }
    
    // 初期メッセージを表示
    function showWelcomeMessage() {
        // 初回訪問かどうかを確認
        const isFirstVisit = !localStorage.getItem('metronome_visited');
        
        if (isFirstVisit) {
            // 初回訪問時のメッセージ
            document.getElementById('mascot-message').textContent = 
                'はじめまして！ほじろうだよ！メトロノームを使って練習してみよう！';
            
            // 訪問済みフラグを設定
            localStorage.setItem('metronome_visited', 'true');
            
            // 5秒後にメッセージを変更
            setTimeout(() => {
                document.getElementById('mascot-message').textContent = 
                    '再生ボタンを押すとメトロノームが始まるよ！下のボタンで設定を変えられるほじ！';
            }, 5000);
        }
    }
});
