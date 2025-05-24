/**
 * メトロノームのUIイベント処理を実装するモジュール
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の参照を取得
    const playButton = document.getElementById('play-button');
    const bpmDisplay = document.getElementById('bpm-display');
    const bpmSettingsButton = document.getElementById('bpm-settings-button');
    const noteSettingsButton = document.getElementById('note-settings-button');
    const timeSignatureButton = document.getElementById('time-signature-button');
    const timerSettingsButton = document.getElementById('timer-settings-button');
    const settingsButton = document.getElementById('settings-button');
    const presetsButton = document.getElementById('presets-button');
    const progressiveTempoButton = document.getElementById('progressive-tempo-button');
    
    // モーダル要素
    const bpmModal = document.getElementById('bpm-modal');
    const noteModal = document.getElementById('note-modal');
    const timeSignatureModal = document.getElementById('time-signature-modal');
    const timerModal = document.getElementById('timer-modal');
    const settingsModal = document.getElementById('settings-modal');
    const presetsModal = document.getElementById('presets-modal');
    const progressiveTempoModal = document.getElementById('progressive-tempo-modal');
    
    // 閉じるボタン
    const closeButtons = document.querySelectorAll('.close-button');
    
    // BPM設定要素
    const bpmDecrease = document.getElementById('bpm-decrease');
    const bpmIncrease = document.getElementById('bpm-increase');
    const bpmInput = document.getElementById('bpm-input');
    const bpmSlider = document.getElementById('bpm-slider');
    const tapTempoButton = document.getElementById('tap-tempo-button');
    
    // 音符設定要素
    const noteOptions = document.querySelectorAll('input[name="note-type"]');
    const accentCheckbox = document.getElementById('accent-checkbox');
    
    // 拍子設定要素
    const timeSignatureNumerator = document.getElementById('time-signature-numerator');
    const timeSignatureDenominator = document.getElementById('time-signature-denominator');
    
    // タイマー設定要素
    const minuteDecrease = document.getElementById('minute-decrease');
    const minuteIncrease = document.getElementById('minute-increase');
    const minuteInput = document.getElementById('minute-input');
    const secondDecrease = document.getElementById('second-decrease');
    const secondIncrease = document.getElementById('second-increase');
    const secondInput = document.getElementById('second-input');
    
    // 設定要素
    const soundSelect = document.getElementById('sound-select');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    const themeToggle = document.getElementById('theme-toggle');
    
    // プログレッシブテンポ要素
    const startBpm = document.getElementById('start-bpm');
    const endBpm = document.getElementById('end-bpm');
    const durationMinutes = document.getElementById('duration-minutes');
    const startProgressiveButton = document.getElementById('start-progressive');
    
    // タップテンポ用の変数
    let tapTimes = [];
    let tapTempoTimeout = null;
    
    // プログレッシブテンポ用の変数
    let progressiveTempoInterval = null;
    let progressiveStartTime = 0;
    let progressiveTotalDuration = 0;
    let progressiveStartBpm = 0;
    let progressiveEndBpm = 0;
    
    // 再生/停止ボタンのイベントリスナー
    playButton.addEventListener('click', function() {
        if (window.metronomeCore) {
            if (document.getElementById('play-icon').classList.contains('fa-play')) {
                window.metronomeCore.startMetronome();
            } else {
                window.metronomeCore.stopMetronome();
            }
        }
    });
    
    // 各設定ボタンのイベントリスナー
    bpmSettingsButton.addEventListener('click', function() {
        openModal(bpmModal);
    });
    
    noteSettingsButton.addEventListener('click', function() {
        openModal(noteModal);
    });
    
    timeSignatureButton.addEventListener('click', function() {
        openModal(timeSignatureModal);
    });
    
    timerSettingsButton.addEventListener('click', function() {
        openModal(timerModal);
    });
    
    settingsButton.addEventListener('click', function() {
        openModal(settingsModal);
    });
    
    presetsButton.addEventListener('click', function() {
        openModal(presetsModal);
    });
    
    progressiveTempoButton.addEventListener('click', function() {
        openModal(progressiveTempoModal);
    });
    
    // 閉じるボタンのイベントリスナー
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // モーダル外クリックで閉じる
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // BPM設定のイベントリスナー
    bpmDecrease.addEventListener('click', function() {
        const currentBpm = parseInt(bpmInput.value);
        window.metronomeCore.setTempo(currentBpm - 1);
    });
    
    bpmIncrease.addEventListener('click', function() {
        const currentBpm = parseInt(bpmInput.value);
        window.metronomeCore.setTempo(currentBpm + 1);
    });
    
    bpmInput.addEventListener('change', function() {
        window.metronomeCore.setTempo(parseInt(this.value));
    });
    
    bpmSlider.addEventListener('input', function() {
        window.metronomeCore.setTempo(parseInt(this.value));
    });
    
    // タップテンポのイベントリスナー
    tapTempoButton.addEventListener('click', function() {
        const now = Date.now();
        
        // タップ間の時間間隔を記録
        if (tapTimes.length > 0) {
            const lastTap = tapTimes[tapTimes.length - 1];
            const interval = now - lastTap;
            
            // 異常に長い間隔は無視（2秒以上）
            if (interval < 2000) {
                tapTimes.push(now);
            } else {
                // リセット
                tapTimes = [now];
            }
        } else {
            tapTimes.push(now);
        }
        
        // 最大5回分のタップを記録
        if (tapTimes.length > 5) {
            tapTimes.shift();
        }
        
        // 2回以上タップされたら平均BPMを計算
        if (tapTimes.length >= 2) {
            let totalInterval = 0;
            for (let i = 1; i < tapTimes.length; i++) {
                totalInterval += tapTimes[i] - tapTimes[i-1];
            }
            
            const averageInterval = totalInterval / (tapTimes.length - 1);
            const bpm = Math.round(60000 / averageInterval);
            
            // BPMの範囲を制限
            const validBpm = Math.min(Math.max(bpm, 40), 400);
            window.metronomeCore.setTempo(validBpm);
        }
        
        // タップが終了したと判断するタイムアウト
        clearTimeout(tapTempoTimeout);
        tapTempoTimeout = setTimeout(function() {
            tapTimes = [];
        }, 2000);
    });
    
    // 音符設定のイベントリスナー
    noteOptions.forEach(function(option) {
        option.addEventListener('change', function() {
            if (this.checked) {
                window.metronomeCore.setSubdivision(this.value);
            }
        });
    });
    
    // アクセント設定のイベントリスナー
    accentCheckbox.addEventListener('change', function() {
        window.metronomeCore.setAccent(this.checked);
    });
    
    // 拍子設定のイベントリスナー
    timeSignatureNumerator.addEventListener('change', function() {
        window.metronomeCore.setTimeSignature(
            parseInt(timeSignatureNumerator.value),
            parseInt(timeSignatureDenominator.value)
        );
    });
    
    timeSignatureDenominator.addEventListener('change', function() {
        window.metronomeCore.setTimeSignature(
            parseInt(timeSignatureNumerator.value),
            parseInt(timeSignatureDenominator.value)
        );
    });
    
    // タイマー設定のイベントリスナー
    minuteDecrease.addEventListener('click', function() {
        const currentMinutes = parseInt(minuteInput.value);
        if (currentMinutes > 0) {
            minuteInput.value = currentMinutes - 1;
            window.metronomeCore.setTimer(
                parseInt(minuteInput.value),
                parseInt(secondInput.value)
            );
        }
    });
    
    minuteIncrease.addEventListener('click', function() {
        const currentMinutes = parseInt(minuteInput.value);
        if (currentMinutes < 60) {
            minuteInput.value = currentMinutes + 1;
            window.metronomeCore.setTimer(
                parseInt(minuteInput.value),
                parseInt(secondInput.value)
            );
        }
    });
    
    minuteInput.addEventListener('change', function() {
        window.metronomeCore.setTimer(
            parseInt(minuteInput.value),
            parseInt(secondInput.value)
        );
    });
    
    secondDecrease.addEventListener('click', function() {
        const currentSeconds = parseInt(secondInput.value);
        if (currentSeconds >= 10) {
            secondInput.value = currentSeconds - 10;
            window.metronomeCore.setTimer(
                parseInt(minuteInput.value),
                parseInt(secondInput.value)
            );
        }
    });
    
    secondIncrease.addEventListener('click', function() {
        const currentSeconds = parseInt(secondInput.value);
        if (currentSeconds < 50) {
            secondInput.value = currentSeconds + 10;
            window.metronomeCore.setTimer(
                parseInt(minuteInput.value),
                parseInt(secondInput.value)
            );
        }
    });
    
    secondInput.addEventListener('change', function() {
        window.metronomeCore.setTimer(
            parseInt(minuteInput.value),
            parseInt(secondInput.value)
        );
    });
    
    // 音色設定のイベントリスナー
    soundSelect.addEventListener('change', function() {
        window.metronomeCore.setSoundType(this.value);
    });
    
    // 音量設定のイベントリスナー
    volumeSlider.addEventListener('input', function() {
        const volume = parseInt(this.value) / 100;
        window.metronomeCore.setVolume(volume);
        volumeValue.textContent = this.value + '%';
    });
    
    // テーマ切替のイベントリスナー
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        // ローカルストレージにテーマ設定を保存
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // ボタンのテキストを更新
        this.textContent = isDarkMode ? 'ライトモード切替' : 'ダークモード切替';
    });
    
    // プログレッシブテンポのイベントリスナー
    startProgressiveButton.addEventListener('click', function() {
        const startBpmValue = parseInt(startBpm.value);
        const endBpmValue = parseInt(endBpm.value);
        const durationMinutesValue = parseInt(durationMinutes.value);
        
        // 入力値の検証
        if (startBpmValue < 40 || startBpmValue > 400 ||
            endBpmValue < 40 || endBpmValue > 400 ||
            durationMinutesValue < 1 || durationMinutesValue > 60) {
            alert('入力値が範囲外です。BPMは40〜400、時間は1〜60分で設定してください。');
            return;
        }
        
        // プログレッシブテンポを開始
        startProgressiveTempo(startBpmValue, endBpmValue, durationMinutesValue);
        
        // モーダルを閉じる
        closeModal(progressiveTempoModal);
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', function(event) {
        // スペースキー: 再生/停止
        if (event.code === 'Space' && !isInputFocused()) {
            event.preventDefault();
            playButton.click();
        }
        
        // 上矢印キー: BPM増加
        if (event.code === 'ArrowUp' && !isInputFocused()) {
            event.preventDefault();
            window.metronomeCore.setTempo(parseInt(bpmDisplay.textContent) + 1);
        }
        
        // 下矢印キー: BPM減少
        if (event.code === 'ArrowDown' && !isInputFocused()) {
            event.preventDefault();
            window.metronomeCore.setTempo(parseInt(bpmDisplay.textContent) - 1);
        }
        
        // Tキー: タップテンポ
        if (event.code === 'KeyT' && !isInputFocused()) {
            event.preventDefault();
            tapTempoButton.click();
        }
    });
    
    // 入力フィールドにフォーカスがあるかチェック
    function isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || 
               activeElement.tagName === 'TEXTAREA' || 
               activeElement.tagName === 'SELECT';
    }
    
    // モーダルを開く
    function openModal(modal) {
        modal.style.display = 'block';
    }
    
    // モーダルを閉じる
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    // プログレッシブテンポを開始
    function startProgressiveTempo(startBpmValue, endBpmValue, durationMinutesValue) {
        // 既存のプログレッシブテンポを停止
        stopProgressiveTempo();
        
        // 現在のBPMを開始BPMに設定
        window.metronomeCore.setTempo(startBpmValue);
        
        // メトロノームを開始
        if (!document.getElementById('play-icon').classList.contains('fa-stop')) {
            window.metronomeCore.startMetronome();
        }
        
        // プログレッシブテンポのパラメータを設定
        progressiveStartTime = Date.now();
        progressiveTotalDuration = durationMinutesValue * 60 * 1000; // ミリ秒に変換
        progressiveStartBpm = startBpmValue;
        progressiveEndBpm = endBpmValue;
        
        // BPMを徐々に変化させるインターバルを設定
        progressiveTempoInterval = setInterval(updateProgressiveTempo, 1000);
        
        // マスコットメッセージを更新
        document.getElementById('mascot-message').textContent = 
            `プログレッシブテンポ: ${startBpmValue}から${endBpmValue}BPMへ ${durationMinutesValue}分かけて変化中...`;
    }
    
    // プログレッシブテンポを停止
    function stopProgressiveTempo() {
        if (progressiveTempoInterval) {
            clearInterval(progressiveTempoInterval);
            progressiveTempoInterval = null;
            
            // マスコットメッセージをリセット
            document.getElementById('mascot-message').textContent = 'ほじろうだよ！メトロノームを始めてみよう！';
        }
    }
    
    // プログレッシブテンポを更新
    function updateProgressiveTempo() {
        const elapsedTime = Date.now() - progressiveStartTime;
        const progress = Math.min(elapsedTime / progressiveTotalDuration, 1);
        
        // 現在のBPMを計算（線形補間）
        const currentBpm = Math.round(
            progressiveStartBpm + (progressiveEndBpm - progressiveStartBpm) * progress
        );
        
        // BPMを設定
        window.metronomeCore.setTempo(currentBpm);
        
        // 終了判定
        if (progress >= 1) {
            stopProgressiveTempo();
            
            // 完了メッセージ
            document.getElementById('mascot-message').textContent = 
                'プログレッシブテンポ完了ほじ！よく頑張ったほじ！';
                
            // 5秒後にメッセージをリセット
            setTimeout(() => {
                document.getElementById('mascot-message').textContent = 
                    'ほじろうだよ！メトロノームを始めてみよう！';
            }, 5000);
        }
    }
    
    // 保存されたテーマ設定を適用
    function applyStoredTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = 'ライトモード切替';
        }
    }
    
    // 初期化
    function init() {
        // 保存されたテーマを適用
        applyStoredTheme();
        
        // メトロノームの初期設定を適用
        if (window.metronomeCore) {
            window.metronomeCore.updateUIFromSettings();
        }
    }
    
    // 初期化を実行
    init();
});
