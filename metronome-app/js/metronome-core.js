/**
 * メトロノームの基本機能を実装するコアモジュール
 */

// AudioContextとメトロノームの状態を管理するグローバル変数
let audioContext = null;
let isPlaying = false;
let currentBeat = 0;
let nextNoteTime = 0.0;
let timerID = null;
let lastNoteTime = 0;

// メトロノームの設定
const metronomeSettings = {
    tempo: 120,              // BPM (1分間の拍数)
    beatsPerMeasure: 4,      // 小節内の拍数 (分子)
    noteValue: 4,            // 拍の単位 (分母)
    subdivision: 'quarter',  // 拍の分割方法
    accent: true,            // 1拍目のアクセント
    soundType: 'click',      // 音色
    volume: 0.8,             // 音量 (0.0 〜 1.0)
    timerMinutes: 0,         // タイマー（分）
    timerSeconds: 0,         // タイマー（秒）
    timerActive: false,      // タイマーの有効/無効
    timerEndTime: 0          // タイマー終了時間
};

// 音声バッファを保存するオブジェクト
const soundBuffers = {
    click: null,
    clickAccent: null,
    woodblock: null,
    woodblockAccent: null,
    cowbell: null,
    cowbellAccent: null,
    hihat: null,
    hihatAccent: null
};

// 拍の分割パターンを定義
const subdivisionPatterns = {
    quarter: [1],                        // 4分音符
    eighth: [1, 0.5],                    // 8分音符
    sixteenth: [1, 0.5, 0.5, 0.5],       // 16分音符
    triplet: [1, 0.67, 0.67],            // 3連符
    'triplet-2beat': [1, 0.67, 0.67, 1, 0.67, 0.67], // 2拍3連符
    'eighth-triplet': [1, 0.33, 0.33, 0.5, 0.33, 0.33], // 8分音符の3連符
    'sixteenth-triplet': [1, 0.17, 0.17, 0.5, 0.17, 0.17, 0.5, 0.17, 0.17, 0.5, 0.17, 0.17], // 16分音符の3連符
    'dotted-eighth-sixteenth': [1, 0.75, 0.25], // 付点8分音符 + 16分音符
    'eighth-two-sixteenth': [1, 0.5, 0.25, 0.25], // 8分音符 + 16分音符2つ
    'two-sixteenth-eighth': [1, 0.25, 0.25, 0.5]  // 16分音符2つ + 8分音符
};

// 現在のサブディビジョンパターン
let currentSubdivisionPattern = subdivisionPatterns.quarter;

// 初期化関数
function initAudio() {
    // AudioContextの作成
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadSounds();
    } else if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// 音声ファイルの読み込み
function loadSounds() {
    // 音声ファイルのパス
    const soundFiles = {
        click: 'audio/click.mp3',
        clickAccent: 'audio/click_accent.mp3',
        woodblock: 'audio/woodblock.mp3',
        woodblockAccent: 'audio/woodblock_accent.mp3',
        cowbell: 'audio/cowbell.mp3',
        cowbellAccent: 'audio/cowbell_accent.mp3',
        hihat: 'audio/hihat.mp3',
        hihatAccent: 'audio/hihat_accent.mp3'
    };

    // 音声ファイルが存在しない場合は、オシレーターで代用する音を生成
    if (!soundBuffers.click) {
        // 音声ファイルが読み込まれるまでは、一時的にオシレーターで代用
        console.log('音声ファイルが読み込まれていないため、オシレーターで代用します');
    }
}

// オシレーターで音を生成（音声ファイルの代わり）
function createOscillatorSound(frequency, duration, time, isAccent) {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // アクセントの場合は音量を上げる
    const volume = isAccent ? metronomeSettings.volume : metronomeSettings.volume * 0.7;
    gainNode.gain.value = volume;
    
    // 音色によって周波数を変える
    switch(metronomeSettings.soundType) {
        case 'click':
            osc.type = 'sine';
            osc.frequency.value = isAccent ? 1000 : 800;
            break;
        case 'woodblock':
            osc.type = 'triangle';
            osc.frequency.value = isAccent ? 900 : 700;
            break;
        case 'cowbell':
            osc.type = 'square';
            osc.frequency.value = isAccent ? 800 : 600;
            break;
        case 'hihat':
            osc.type = 'sawtooth';
            osc.frequency.value = isAccent ? 1200 : 1000;
            break;
        default:
            osc.type = 'sine';
            osc.frequency.value = isAccent ? 1000 : 800;
    }
    
    // エンベロープを設定
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.start(time);
    osc.stop(time + duration);
}

// メトロノームのスケジューラー
function scheduler() {
    // 先の音をスケジュールする時間（秒）
    const scheduleAheadTime = 0.1;
    
    // 現在時刻
    const currentTime = audioContext.currentTime;
    
    // タイマーが有効で、終了時間を過ぎた場合
    if (metronomeSettings.timerActive && metronomeSettings.timerEndTime > 0 && 
        currentTime >= metronomeSettings.timerEndTime) {
        stopMetronome();
        showTimerEndMessage();
        return;
    }
    
    // 次の音をスケジュールする
    while (nextNoteTime < currentTime + scheduleAheadTime) {
        scheduleNote(nextNoteTime);
        advanceNote();
    }
    
    // 次のスケジューリングをセット
    timerID = setTimeout(scheduler, 25);
}

// 音を再生するスケジュール
function scheduleNote(time) {
    // サブディビジョンパターンに基づいて音を再生
    const patternIndex = currentBeat % currentSubdivisionPattern.length;
    const isFirstBeatOfMeasure = currentBeat === 0;
    
    // アクセントが有効で、小節の最初の拍の場合はアクセント音を鳴らす
    const useAccent = metronomeSettings.accent && isFirstBeatOfMeasure;
    
    // オシレーターで音を生成
    createOscillatorSound(
        useAccent ? 1000 : 800,
        0.05,
        time,
        useAccent
    );
    
    // 視覚的フィードバックを更新
    if (patternIndex === 0) {
        // メインビートの場合のみ視覚的フィードバックを更新
        updateVisualFeedback(time, useAccent);
    }
    
    // 最後に再生した音の時間を記録
    lastNoteTime = time;
}

// 次の音に進む
function advanceNote() {
    // 1拍の長さ（秒）
    const secondsPerBeat = 60.0 / metronomeSettings.tempo;
    
    // サブディビジョンパターンに基づいて次の音の時間を計算
    const patternIndex = currentBeat % currentSubdivisionPattern.length;
    const noteDuration = secondsPerBeat * currentSubdivisionPattern[patternIndex];
    
    // 次の音の時間を設定
    nextNoteTime += noteDuration;
    
    // 次の拍に進む
    currentBeat++;
    
    // 小節の最後の拍の場合、次の小節の最初の拍に戻る
    if (currentBeat % getBeatsInMeasure() === 0) {
        currentBeat = 0;
    }
}

// 小節内の総拍数を取得（サブディビジョンを考慮）
function getBeatsInMeasure() {
    // サブディビジョンパターンの長さに基づいて計算
    return currentSubdivisionPattern.length;
}

// 視覚的フィードバックを更新
function updateVisualFeedback(time, isAccent) {
    // 現在の時間と音の時間の差を計算
    const diff = time - audioContext.currentTime;
    
    // 差分の時間後に視覚的フィードバックを更新
    setTimeout(() => {
        const bpmDisplay = document.getElementById('bpm-display');
        const visualFeedback = document.getElementById('visual-feedback');
        
        // アクセントの場合はクラスを追加
        if (isAccent) {
            bpmDisplay.classList.add('accent');
            visualFeedback.classList.add('accent');
        } else {
            bpmDisplay.classList.remove('accent');
            visualFeedback.classList.remove('accent');
        }
        
        // アクティブクラスを追加して点滅効果
        visualFeedback.classList.add('active');
        
        // 100ms後にアクティブクラスを削除
        setTimeout(() => {
            visualFeedback.classList.remove('active');
        }, 100);
    }, diff * 1000);
}

// メトロノームを開始
function startMetronome() {
    initAudio();
    
    if (!isPlaying) {
        isPlaying = true;
        currentBeat = 0;
        nextNoteTime = audioContext.currentTime;
        
        // タイマーが設定されている場合は終了時間を計算
        if (metronomeSettings.timerMinutes > 0 || metronomeSettings.timerSeconds > 0) {
            const totalSeconds = metronomeSettings.timerMinutes * 60 + metronomeSettings.timerSeconds;
            metronomeSettings.timerEndTime = audioContext.currentTime + totalSeconds;
            metronomeSettings.timerActive = true;
        } else {
            metronomeSettings.timerActive = false;
            metronomeSettings.timerEndTime = 0;
        }
        
        // 再生アイコンを停止アイコンに変更
        document.getElementById('play-icon').classList.remove('fa-play');
        document.getElementById('play-icon').classList.add('fa-stop');
        
        // スケジューラーを開始
        scheduler();
    }
}

// メトロノームを停止
function stopMetronome() {
    isPlaying = false;
    clearTimeout(timerID);
    
    // 停止アイコンを再生アイコンに変更
    document.getElementById('play-icon').classList.remove('fa-stop');
    document.getElementById('play-icon').classList.add('fa-play');
    
    // 視覚的フィードバックをリセット
    const bpmDisplay = document.getElementById('bpm-display');
    const visualFeedback = document.getElementById('visual-feedback');
    
    bpmDisplay.classList.remove('accent');
    visualFeedback.classList.remove('accent');
    visualFeedback.classList.remove('active');
}

// タイマー終了時のメッセージを表示
function showTimerEndMessage() {
    const mascotMessage = document.getElementById('mascot-message');
    mascotMessage.textContent = 'おつかれさまほじ！頑張ったほじ！ちょっと休憩ほじ！';
    
    // 5秒後にメッセージをリセット
    setTimeout(() => {
        mascotMessage.textContent = 'ほじろうだよ！メトロノームを始めてみよう！';
    }, 5000);
}

// BPMを設定
function setTempo(bpm) {
    // BPMの範囲を制限
    bpm = Math.min(Math.max(bpm, 40), 400);
    metronomeSettings.tempo = bpm;
    
    // BPM表示を更新
    document.getElementById('bpm-display').textContent = bpm;
    document.getElementById('bpm-input').value = bpm;
    document.getElementById('bpm-slider').value = bpm;
}

// サブディビジョン（音符の分割パターン）を設定
function setSubdivision(subdivisionType) {
    if (subdivisionPatterns[subdivisionType]) {
        metronomeSettings.subdivision = subdivisionType;
        currentSubdivisionPattern = subdivisionPatterns[subdivisionType];
        
        // 再生中の場合は一度停止して再開
        if (isPlaying) {
            stopMetronome();
            startMetronome();
        }
    }
}

// 拍子を設定
function setTimeSignature(numerator, denominator) {
    metronomeSettings.beatsPerMeasure = numerator;
    metronomeSettings.noteValue = denominator;
    
    // 再生中の場合は一度停止して再開
    if (isPlaying) {
        stopMetronome();
        startMetronome();
    }
}

// タイマーを設定
function setTimer(minutes, seconds) {
    metronomeSettings.timerMinutes = minutes;
    metronomeSettings.timerSeconds = seconds;
    
    // 入力値を更新
    document.getElementById('minute-input').value = minutes;
    document.getElementById('second-input').value = seconds;
}

// 音量を設定
function setVolume(volume) {
    // 音量の範囲を制限
    volume = Math.min(Math.max(volume, 0), 1);
    metronomeSettings.volume = volume;
}

// 音色を設定
function setSoundType(soundType) {
    metronomeSettings.soundType = soundType;
}

// アクセントの有効/無効を設定
function setAccent(isEnabled) {
    metronomeSettings.accent = isEnabled;
}

// メトロノームの設定を取得
function getMetronomeSettings() {
    return { ...metronomeSettings };
}

// メトロノームの設定を適用
function applyMetronomeSettings(settings) {
    // 各設定を適用
    setTempo(settings.tempo);
    setSubdivision(settings.subdivision);
    setTimeSignature(settings.beatsPerMeasure, settings.noteValue);
    setTimer(settings.timerMinutes, settings.timerSeconds);
    setVolume(settings.volume);
    setSoundType(settings.soundType);
    setAccent(settings.accent);
    
    // UI要素を更新
    updateUIFromSettings();
}

// UI要素を設定から更新
function updateUIFromSettings() {
    // BPM関連
    document.getElementById('bpm-display').textContent = metronomeSettings.tempo;
    document.getElementById('bpm-input').value = metronomeSettings.tempo;
    document.getElementById('bpm-slider').value = metronomeSettings.tempo;
    
    // 音符設定
    document.querySelector(`input[name="note-type"][value="${metronomeSettings.subdivision}"]`).checked = true;
    
    // 拍子設定
    document.getElementById('time-signature-numerator').value = metronomeSettings.beatsPerMeasure;
    document.getElementById('time-signature-denominator').value = metronomeSettings.noteValue;
    
    // タイマー設定
    document.getElementById('minute-input').value = metronomeSettings.timerMinutes;
    document.getElementById('second-input').value = metronomeSettings.timerSeconds;
    
    // アクセント設定
    document.getElementById('accent-checkbox').checked = metronomeSettings.accent;
    
    // 音色設定
    document.getElementById('sound-select').value = metronomeSettings.soundType;
    
    // 音量設定
    document.getElementById('volume-slider').value = metronomeSettings.volume * 100;
    document.getElementById('volume-value').textContent = Math.round(metronomeSettings.volume * 100) + '%';
}

// エクスポート
window.metronomeCore = {
    startMetronome,
    stopMetronome,
    setTempo,
    setSubdivision,
    setTimeSignature,
    setTimer,
    setVolume,
    setSoundType,
    setAccent,
    getMetronomeSettings,
    applyMetronomeSettings,
    updateUIFromSettings
};
