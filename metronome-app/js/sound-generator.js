/**
 * メトロノーム用の音声ファイルを生成するモジュール
 */

document.addEventListener('DOMContentLoaded', function() {
    // 音声ファイルの生成と保存
    generateMetronomeSounds();
    
    // メトロノーム用の音声ファイルを生成
    function generateMetronomeSounds() {
        // AudioContextが利用可能か確認
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.error('Web Audio APIがサポートされていません。');
            return;
        }
        
        // AudioContextを作成
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 音声タイプと対応する生成関数
        const soundTypes = {
            'click': generateClickSound,
            'woodblock': generateWoodblockSound,
            'cowbell': generateCowbellSound,
            'hihat': generateHihatSound
        };
        
        // 各音声タイプの通常音とアクセント音を生成
        for (const type in soundTypes) {
            // 通常音を生成
            const normalBuffer = soundTypes[type](audioContext, false);
            
            // アクセント音を生成
            const accentBuffer = soundTypes[type](audioContext, true);
            
            // 音声バッファをキャッシュ
            if (window.metronomeCore) {
                // ここでキャッシュ処理を行う（実際のアプリでは実装が必要）
            }
        }
    }
    
    // クリック音を生成
    function generateClickSound(audioContext, isAccent) {
        // サンプルレート
        const sampleRate = audioContext.sampleRate;
        
        // 音の長さ（秒）
        const duration = 0.05;
        
        // バッファを作成
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        
        // バッファにデータを書き込む
        const data = buffer.getChannelData(0);
        
        // クリック音の周波数
        const frequency = isAccent ? 1000 : 800;
        
        // サイン波を生成
        for (let i = 0; i < bufferSize; i++) {
            // 時間（秒）
            const t = i / sampleRate;
            
            // サイン波
            data[i] = Math.sin(2 * Math.PI * frequency * t);
            
            // エンベロープを適用（音量を徐々に下げる）
            data[i] *= (1 - t / duration);
        }
        
        return buffer;
    }
    
    // ウッドブロック音を生成
    function generateWoodblockSound(audioContext, isAccent) {
        // サンプルレート
        const sampleRate = audioContext.sampleRate;
        
        // 音の長さ（秒）
        const duration = 0.08;
        
        // バッファを作成
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        
        // バッファにデータを書き込む
        const data = buffer.getChannelData(0);
        
        // ウッドブロック音の周波数
        const frequency = isAccent ? 900 : 700;
        
        // 三角波を生成
        for (let i = 0; i < bufferSize; i++) {
            // 時間（秒）
            const t = i / sampleRate;
            
            // 三角波
            const wave = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
            
            // ノイズを加える
            const noise = Math.random() * 0.1;
            
            // 波形にノイズを混ぜる
            data[i] = wave * 0.9 + noise;
            
            // エンベロープを適用（急速に減衰）
            data[i] *= Math.exp(-t * 30);
        }
        
        return buffer;
    }
    
    // カウベル音を生成
    function generateCowbellSound(audioContext, isAccent) {
        // サンプルレート
        const sampleRate = audioContext.sampleRate;
        
        // 音の長さ（秒）
        const duration = 0.1;
        
        // バッファを作成
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        
        // バッファにデータを書き込む
        const data = buffer.getChannelData(0);
        
        // カウベル音の周波数
        const frequency1 = isAccent ? 800 : 600;
        const frequency2 = frequency1 * 1.5;
        
        // 矩形波を生成
        for (let i = 0; i < bufferSize; i++) {
            // 時間（秒）
            const t = i / sampleRate;
            
            // 2つの周波数の矩形波を合成
            const wave1 = Math.sign(Math.sin(2 * Math.PI * frequency1 * t));
            const wave2 = Math.sign(Math.sin(2 * Math.PI * frequency2 * t));
            
            // ノイズを加える
            const noise = Math.random() * 0.2 - 0.1;
            
            // 波形を合成
            data[i] = (wave1 * 0.5 + wave2 * 0.3 + noise) * 0.8;
            
            // エンベロープを適用（金属的な減衰）
            data[i] *= Math.exp(-t * 20) * (1 + Math.sin(t * 100));
        }
        
        return buffer;
    }
    
    // ハイハット音を生成
    function generateHihatSound(audioContext, isAccent) {
        // サンプルレート
        const sampleRate = audioContext.sampleRate;
        
        // 音の長さ（秒）
        const duration = isAccent ? 0.1 : 0.05;
        
        // バッファを作成
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        
        // バッファにデータを書き込む
        const data = buffer.getChannelData(0);
        
        // ホワイトノイズを生成
        for (let i = 0; i < bufferSize; i++) {
            // 時間（秒）
            const t = i / sampleRate;
            
            // ホワイトノイズ
            data[i] = Math.random() * 2 - 1;
            
            // ハイパスフィルタ効果（高周波成分を強調）
            if (i > 0) {
                data[i] = (data[i] - data[i-1] * 0.3);
            }
            
            // エンベロープを適用（急速に減衰）
            data[i] *= Math.exp(-t * (isAccent ? 30 : 50));
        }
        
        return buffer;
    }
});
