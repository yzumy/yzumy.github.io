<?php
// メトロノームWebアプリケーション
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>メトロノーム</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="metronome-container">
            <div class="bpm-display" id="bpm-display">120</div>
            <div class="visual-feedback" id="visual-feedback"></div>
            <button class="play-button" id="play-button">
                <i class="fas fa-play" id="play-icon"></i>
            </button>
            
            <div class="controls">
                <button class="control-button" id="bpm-settings-button">BPM設定</button>
                <button class="control-button" id="note-settings-button">音符設定</button>
                <button class="control-button" id="time-signature-button">拍子設定</button>
                <button class="control-button" id="timer-settings-button">タイマー設定</button>
            </div>
        </div>
        
        <div class="mascot-container">
            <div class="speech-bubble" id="speech-bubble">
                <p id="mascot-message">ほじろうだよ！メトロノームを始めてみよう！</p>
            </div>
            <div class="mascot-image">
                <img src="img/houjirou.jpg" alt="ほじろう" id="mascot-img">
            </div>
        </div>
    </div>

    <!-- モーダルウィンドウ -->
    <div class="modal" id="bpm-modal">
        <div class="modal-content">
            <span class="close-button" id="bpm-close">&times;</span>
            <h2>BPM設定</h2>
            <div class="bpm-controls">
                <button class="bpm-button" id="bpm-decrease">-</button>
                <input type="number" id="bpm-input" min="40" max="400" value="120">
                <button class="bpm-button" id="bpm-increase">+</button>
            </div>
            <input type="range" id="bpm-slider" min="40" max="400" value="120">
            <div class="tap-tempo">
                <button id="tap-tempo-button">タップテンポ</button>
                <span id="tap-tempo-info">タップして平均BPMを計測</span>
            </div>
        </div>
    </div>

    <div class="modal" id="note-modal">
        <div class="modal-content">
            <span class="close-button" id="note-close">&times;</span>
            <h2>音符設定</h2>
            <div class="note-options">
                <div class="note-option">
                    <input type="radio" id="quarter-note" name="note-type" value="quarter" checked>
                    <label for="quarter-note">4分音符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="eighth-note" name="note-type" value="eighth">
                    <label for="eighth-note">8分音符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="sixteenth-note" name="note-type" value="sixteenth">
                    <label for="sixteenth-note">16分音符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="triplet" name="note-type" value="triplet">
                    <label for="triplet">3連符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="triplet-2beat" name="note-type" value="triplet-2beat">
                    <label for="triplet-2beat">2拍3連符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="eighth-triplet" name="note-type" value="eighth-triplet">
                    <label for="eighth-triplet">8分音符の3連符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="sixteenth-triplet" name="note-type" value="sixteenth-triplet">
                    <label for="sixteenth-triplet">16分音符の3連符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="dotted-eighth-sixteenth" name="note-type" value="dotted-eighth-sixteenth">
                    <label for="dotted-eighth-sixteenth">付点8分音符 + 16分音符</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="eighth-two-sixteenth" name="note-type" value="eighth-two-sixteenth">
                    <label for="eighth-two-sixteenth">8分音符 + 16分音符2つ</label>
                </div>
                <div class="note-option">
                    <input type="radio" id="two-sixteenth-eighth" name="note-type" value="two-sixteenth-eighth">
                    <label for="two-sixteenth-eighth">16分音符2つ + 8分音符</label>
                </div>
            </div>
            <div class="accent-option">
                <input type="checkbox" id="accent-checkbox" checked>
                <label for="accent-checkbox">1拍目にアクセントをつける</label>
            </div>
        </div>
    </div>

    <div class="modal" id="time-signature-modal">
        <div class="modal-content">
            <span class="close-button" id="time-signature-close">&times;</span>
            <h2>拍子設定</h2>
            <div class="time-signature-controls">
                <select id="time-signature-numerator">
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4" selected>4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="9">9</option>
                    <option value="12">12</option>
                </select>
                <span>/</span>
                <select id="time-signature-denominator">
                    <option value="2">2</option>
                    <option value="4" selected>4</option>
                    <option value="8">8</option>
                </select>
            </div>
        </div>
    </div>

    <div class="modal" id="timer-modal">
        <div class="modal-content">
            <span class="close-button" id="timer-close">&times;</span>
            <h2>タイマー設定</h2>
            <div class="timer-controls">
                <div class="timer-unit">
                    <label>分:</label>
                    <button class="timer-button" id="minute-decrease">-</button>
                    <input type="number" id="minute-input" min="0" max="60" value="0">
                    <button class="timer-button" id="minute-increase">+</button>
                </div>
                <div class="timer-unit">
                    <label>秒:</label>
                    <button class="timer-button" id="second-decrease">-</button>
                    <input type="number" id="second-input" min="0" max="50" step="10" value="0">
                    <button class="timer-button" id="second-increase">+</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 追加機能用のモーダル -->
    <div class="modal" id="settings-modal">
        <div class="modal-content">
            <span class="close-button" id="settings-close">&times;</span>
            <h2>設定</h2>
            <div class="settings-section">
                <h3>音色選択</h3>
                <select id="sound-select">
                    <option value="click">クリック音</option>
                    <option value="woodblock">ウッドブロック</option>
                    <option value="cowbell">カウベル</option>
                    <option value="hihat">ハイハット</option>
                </select>
            </div>
            <div class="settings-section">
                <h3>ボリューム</h3>
                <input type="range" id="volume-slider" min="0" max="100" value="80">
                <span id="volume-value">80%</span>
            </div>
            <div class="settings-section">
                <h3>テーマ</h3>
                <button id="theme-toggle">ダークモード切替</button>
            </div>
        </div>
    </div>

    <div class="modal" id="presets-modal">
        <div class="modal-content">
            <span class="close-button" id="presets-close">&times;</span>
            <h2>プリセット</h2>
            <div class="presets-container">
                <div class="preset-slots">
                    <div class="preset-slot" data-slot="1">
                        <button class="preset-button" data-action="load">プリセット1を読込</button>
                        <button class="preset-button" data-action="save">現在の設定を保存</button>
                        <div class="preset-info" id="preset-info-1">未設定</div>
                    </div>
                    <div class="preset-slot" data-slot="2">
                        <button class="preset-button" data-action="load">プリセット2を読込</button>
                        <button class="preset-button" data-action="save">現在の設定を保存</button>
                        <div class="preset-info" id="preset-info-2">未設定</div>
                    </div>
                    <div class="preset-slot" data-slot="3">
                        <button class="preset-button" data-action="load">プリセット3を読込</button>
                        <button class="preset-button" data-action="save">現在の設定を保存</button>
                        <div class="preset-info" id="preset-info-3">未設定</div>
                    </div>
                    <div class="preset-slot" data-slot="4">
                        <button class="preset-button" data-action="load">プリセット4を読込</button>
                        <button class="preset-button" data-action="save">現在の設定を保存</button>
                        <div class="preset-info" id="preset-info-4">未設定</div>
                    </div>
                    <div class="preset-slot" data-slot="5">
                        <button class="preset-button" data-action="load">プリセット5を読込</button>
                        <button class="preset-button" data-action="save">現在の設定を保存</button>
                        <div class="preset-info" id="preset-info-5">未設定</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal" id="progressive-tempo-modal">
        <div class="modal-content">
            <span class="close-button" id="progressive-tempo-close">&times;</span>
            <h2>プログレッシブ・テンポ・トレーニング</h2>
            <div class="progressive-tempo-controls">
                <div class="tempo-range">
                    <label for="start-bpm">開始BPM:</label>
                    <input type="number" id="start-bpm" min="40" max="400" value="60">
                </div>
                <div class="tempo-range">
                    <label for="end-bpm">終了BPM:</label>
                    <input type="number" id="end-bpm" min="40" max="400" value="120">
                </div>
                <div class="tempo-range">
                    <label for="duration-minutes">変化時間 (分):</label>
                    <input type="number" id="duration-minutes" min="1" max="60" value="5">
                </div>
                <button id="start-progressive">開始</button>
            </div>
        </div>
    </div>

    <!-- 追加ボタン -->
    <div class="additional-controls">
        <button class="additional-button" id="settings-button"><i class="fas fa-cog"></i></button>
        <button class="additional-button" id="presets-button"><i class="fas fa-bookmark"></i></button>
        <button class="additional-button" id="progressive-tempo-button"><i class="fas fa-tachometer-alt"></i></button>
    </div>

    <script src="js/metronome.js"></script>
</body>
</html>
