/**
 * メトロノームのプリセット管理機能を実装するモジュール
 */

document.addEventListener('DOMContentLoaded', function() {
    // プリセットスロット要素
    const presetSlots = document.querySelectorAll('.preset-slot');
    
    // ローカルストレージのキープレフィックス
    const STORAGE_PREFIX = 'metronome_preset_';
    
    // プリセットの初期化
    initPresets();
    
    // プリセットボタンのイベントリスナーを設定
    presetSlots.forEach(function(slot) {
        const slotNumber = slot.dataset.slot;
        const loadButton = slot.querySelector('[data-action="load"]');
        const saveButton = slot.querySelector('[data-action="save"]');
        
        // 読み込みボタンのイベントリスナー
        loadButton.addEventListener('click', function() {
            loadPreset(slotNumber);
        });
        
        // 保存ボタンのイベントリスナー
        saveButton.addEventListener('click', function() {
            savePreset(slotNumber);
        });
    });
    
    // プリセットの初期化
    function initPresets() {
        // 各プリセットスロットの情報を更新
        for (let i = 1; i <= 5; i++) {
            updatePresetInfo(i);
        }
    }
    
    // プリセット情報を更新
    function updatePresetInfo(slotNumber) {
        const presetInfo = document.getElementById(`preset-info-${slotNumber}`);
        const preset = loadPresetFromStorage(slotNumber);
        
        if (preset) {
            // プリセット情報を表示
            presetInfo.textContent = `${preset.tempo} BPM, ${preset.beatsPerMeasure}/${preset.noteValue}, ${getSubdivisionName(preset.subdivision)}`;
        } else {
            // プリセットが未設定の場合
            presetInfo.textContent = '未設定';
        }
    }
    
    // サブディビジョン名を取得
    function getSubdivisionName(subdivision) {
        const subdivisionNames = {
            'quarter': '4分音符',
            'eighth': '8分音符',
            'sixteenth': '16分音符',
            'triplet': '3連符',
            'triplet-2beat': '2拍3連符',
            'eighth-triplet': '8分音符の3連符',
            'sixteenth-triplet': '16分音符の3連符',
            'dotted-eighth-sixteenth': '付点8分音符+16分音符',
            'eighth-two-sixteenth': '8分音符+16分音符2つ',
            'two-sixteenth-eighth': '16分音符2つ+8分音符'
        };
        
        return subdivisionNames[subdivision] || subdivision;
    }
    
    // プリセットを保存
    function savePreset(slotNumber) {
        if (window.metronomeCore) {
            // 現在のメトロノーム設定を取得
            const settings = window.metronomeCore.getMetronomeSettings();
            
            // ローカルストレージに保存
            savePresetToStorage(slotNumber, settings);
            
            // プリセット情報を更新
            updatePresetInfo(slotNumber);
            
            // マスコットメッセージを更新
            document.getElementById('mascot-message').textContent = 
                `プリセット${slotNumber}に保存したほじ！`;
                
            // 3秒後にメッセージをリセット
            setTimeout(() => {
                document.getElementById('mascot-message').textContent = 
                    'ほじろうだよ！メトロノームを始めてみよう！';
            }, 3000);
        }
    }
    
    // プリセットを読み込み
    function loadPreset(slotNumber) {
        // ストレージからプリセットを取得
        const preset = loadPresetFromStorage(slotNumber);
        
        if (preset && window.metronomeCore) {
            // プリセットを適用
            window.metronomeCore.applyMetronomeSettings(preset);
            
            // マスコットメッセージを更新
            document.getElementById('mascot-message').textContent = 
                `プリセット${slotNumber}を読み込んだほじ！`;
                
            // 3秒後にメッセージをリセット
            setTimeout(() => {
                document.getElementById('mascot-message').textContent = 
                    'ほじろうだよ！メトロノームを始めてみよう！';
            }, 3000);
        } else {
            // プリセットが未設定の場合
            document.getElementById('mascot-message').textContent = 
                `プリセット${slotNumber}は未設定だほじ...`;
                
            // 3秒後にメッセージをリセット
            setTimeout(() => {
                document.getElementById('mascot-message').textContent = 
                    'ほじろうだよ！メトロノームを始めてみよう！';
            }, 3000);
        }
    }
    
    // ローカルストレージにプリセットを保存
    function savePresetToStorage(slotNumber, settings) {
        const storageKey = STORAGE_PREFIX + slotNumber;
        localStorage.setItem(storageKey, JSON.stringify(settings));
    }
    
    // ローカルストレージからプリセットを読み込み
    function loadPresetFromStorage(slotNumber) {
        const storageKey = STORAGE_PREFIX + slotNumber;
        const presetJson = localStorage.getItem(storageKey);
        
        if (presetJson) {
            try {
                return JSON.parse(presetJson);
            } catch (e) {
                console.error('プリセットの読み込みに失敗しました:', e);
                return null;
            }
        }
        
        return null;
    }
});
