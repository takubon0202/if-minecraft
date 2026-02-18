/**
 * Give Generator - UI
 */

import { $, $$, createElement, debounce } from '../../core/dom.js';
import { dataStore, workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { generateGiveCommand } from './engine.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { getVersionGroup, getVersionNote } from '../../core/version-compat.js';

// フォーム状態
let formState = {
  target: '@p',
  item: 'minecraft:diamond_sword',
  count: 1,
  customName: '',
  lore: '',
  unbreakable: false,
  enchantments: [],
  rawComponents: '',
};

// プリセット定義
const GIVE_PRESETS = [
  { id: 'max_sword', name: '最強の剣', item: 'netherite_sword', enchants: [{id:'sharpness',level:255},{id:'fire_aspect',level:2},{id:'looting',level:10}], unbreakable: true },
  { id: 'max_pick', name: '最強ツルハシ', item: 'netherite_pickaxe', enchants: [{id:'efficiency',level:255},{id:'fortune',level:10}], unbreakable: true },
  { id: 'max_spear', name: '最強の槍', item: 'netherite_spear', enchants: [{id:'sharpness',level:255},{id:'lunge',level:3},{id:'fire_aspect',level:2},{id:'looting',level:10}], unbreakable: true },
  { id: 'max_armor', name: '最強チェスト', item: 'netherite_chestplate', enchants: [{id:'protection',level:255}], unbreakable: true },
  { id: 'god_apple', name: '金リンゴ', item: 'enchanted_golden_apple', enchants: [], unbreakable: false },
];

// ターゲットセレクター
const TARGET_OPTIONS = [
  { id: '@p', name: '最も近いプレイヤー', icon: 'player_head' },
  { id: '@s', name: '自分自身', icon: 'armor_stand' },
  { id: '@a', name: '全プレイヤー', icon: 'ender_eye' },
  { id: '@r', name: 'ランダム', icon: 'experience_bottle' },
];

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel give-tool mc-themed" id="give-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'chest')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/give コマンド</h2>
            <p class="header-subtitle">アイテムをプレイヤーに付与</p>
          </div>
        </div>
        <span class="version-badge" id="give-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="give-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="give-version-note"></p>

      <form class="tool-form mc-form" id="give-form">

        <!-- ステップ1: ターゲット選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>ターゲット選択</h3>
          </div>

          <div class="target-selector-grid">
            ${TARGET_OPTIONS.map(t => `
              <button type="button" class="target-option ${t.id === '@p' ? 'active' : ''}" data-target="${t.id}">
                <img src="${getInviconUrl(t.icon)}" alt="" class="target-icon mc-pixelated" onerror="this.style.opacity='0.3'">
                <div class="target-info">
                  <span class="target-id">${t.id}</span>
                  <span class="target-desc">${t.name}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </section>

        <!-- ステップ2: アイテム選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>アイテム選択</h3>
          </div>

          <!-- プリセット -->
          <div class="preset-cards give-presets">
            ${GIVE_PRESETS.map(p => `
              <button type="button" class="preset-card" data-preset="${p.id}">
                <img src="${getInviconUrl(p.item)}" alt="" class="preset-icon mc-pixelated" onerror="this.style.opacity='0.3'">
                <span class="preset-name">${p.name}</span>
              </button>
            `).join('')}
          </div>

          <div class="item-input-group">
            <label>アイテムID</label>
            <div class="autocomplete-wrapper">
              <input type="text" id="give-item" class="mc-input"
                     value="minecraft:diamond_sword"
                     placeholder="minecraft:diamond_sword"
                     autocomplete="off">
              <div class="autocomplete-list" id="item-suggestions"></div>
            </div>
          </div>

          <div class="count-input-group">
            <label>個数</label>
            <div class="count-presets">
              <button type="button" class="count-btn" data-count="1">1</button>
              <button type="button" class="count-btn" data-count="16">16</button>
              <button type="button" class="count-btn active" data-count="64">64</button>
            </div>
            <input type="number" id="give-count" class="mc-input count-input" value="1" min="1" max="64">
          </div>
        </section>

        <!-- ステップ3: 名前と説明 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>名前・説明 <span class="optional-badge">任意</span></h3>
          </div>

          <div class="name-editor">
            <label>カスタム名</label>
            <input type="text" id="give-name" class="mc-input name-input" placeholder="伝説の剣">
          </div>

          <div class="lore-editor">
            <label>説明文（改行で複数行）</label>
            <textarea id="give-lore" class="mc-input" rows="2" placeholder="古代の力が宿る剣"></textarea>
          </div>
        </section>

        <!-- ステップ4: エンチャント -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">4</span>
            <h3>エンチャント <span class="optional-badge">任意</span></h3>
          </div>

          <div class="enchant-list" id="enchant-list">
            <div class="enchant-item">
              <select class="enchant-select mc-select">
                <option value="">-- 選択 --</option>
                <option value="sharpness">ダメージ増加 (Sharpness)</option>
                <option value="smite">アンデッド特効 (Smite)</option>
                <option value="unbreaking">耐久力 (Unbreaking)</option>
                <option value="efficiency">効率強化 (Efficiency)</option>
                <option value="fortune">幸運 (Fortune)</option>
                <option value="silk_touch">シルクタッチ (Silk Touch)</option>
                <option value="protection">ダメージ軽減 (Protection)</option>
                <option value="fire_aspect">火属性 (Fire Aspect)</option>
                <option value="looting">ドロップ増加 (Looting)</option>
                <option value="mending">修繕 (Mending)</option>
              </select>
              <input type="number" class="enchant-level mc-input" value="1" min="1" max="255">
            </div>
          </div>
          <button type="button" class="mc-btn add-enchant-btn" id="add-enchant">+ エンチャント追加</button>
        </section>

        <!-- ステップ5: オプション -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">5</span>
            <h3>オプション</h3>
          </div>

          <div class="behavior-grid">
            <label class="behavior-option">
              <input type="checkbox" id="give-unbreakable">
              <div class="option-content">
                <img src="${getInviconUrl('anvil')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">耐久無限</span>
                  <span class="option-desc">耐久値が減らない</span>
                </div>
              </div>
            </label>
          </div>

          <!-- Raw Components -->
          <div class="raw-components-section">
            <label>Raw Components <span class="hint">（上級者向け）</span></label>
            <textarea id="give-raw" class="mc-input mc-code" rows="2" placeholder='例: damage=100,custom_model_data=1234'></textarea>
          </div>
        </section>
      </form>

      <!-- プレビュー -->
      <div class="give-preview-section">
        <h3>プレビュー</h3>
        <div class="mc-inventory-preview">
          <div class="mc-inv-slot-large" id="give-preview-slot">
            <img class="mc-inv-item-img" id="give-item-icon" src="" alt="">
            <span class="mc-inv-count" id="give-item-count">1</span>
          </div>

          <div class="mc-item-tooltip" id="give-item-tooltip">
            <div class="tooltip-name" id="give-item-name">アイテム</div>
            <div class="tooltip-enchants" id="give-preview-enchants">
              <p class="text-muted">エンチャントなし</p>
            </div>
            <div class="tooltip-lore" id="give-preview-lore"></div>
            <div class="tooltip-meta">
              <span class="tooltip-id" id="give-item-id">minecraft:stone</span>
            </div>
          </div>
        </div>

        <div class="item-stats-bar">
          <div class="stat-item">
            <span class="stat-label">ターゲット</span>
            <span class="stat-value" id="give-stat-target">@p</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">エンチャント</span>
            <span class="stat-value" id="give-stat-enchants">0</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  const form = $('#give-form', container);

  // フォーム変更時にコマンド更新
  form.addEventListener('input', debounce(() => updateCommand(container), 150));
  form.addEventListener('change', () => updateCommand(container));

  // ターゲット選択
  $$('.target-option', container).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.target-option', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      formState.target = btn.dataset.target;
      updateCommand(container);
    });
  });

  // プリセット選択
  $$('.preset-card', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.dataset.preset;
      const preset = GIVE_PRESETS.find(p => p.id === presetId);
      if (preset) {
        applyGivePreset(preset, container);
      }
    });
  });

  // 個数プリセット
  $$('.count-btn', container).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.count-btn', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.count);
      $('#give-count', container).value = count;
      formState.count = count;
      updateCommand(container);
    });
  });

  // アイテムオートコンプリート
  setupAutocomplete(container);

  // エンチャント追加ボタン
  $('#add-enchant', container)?.addEventListener('click', () => {
    addEnchantRow(container);
  });

  // バージョン変更時にコマンド再生成
  window.addEventListener('mc-version-change', () => {
    updateVersionDisplay(container);
    updateCommand(container);
  });

  // リセットボタン
  $('#give-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期表示
  updateVersionDisplay(container);
  updateCommand(container);
}

/**
 * プリセットを適用
 */
function applyGivePreset(preset, container) {
  // アイテム設定
  $('#give-item', container).value = `minecraft:${preset.item}`;
  formState.item = `minecraft:${preset.item}`;

  // 耐久無限
  $('#give-unbreakable', container).checked = preset.unbreakable;
  formState.unbreakable = preset.unbreakable;

  // エンチャントリストをクリア
  const enchantList = $('#enchant-list', container);
  enchantList.innerHTML = '';

  // エンチャントを追加
  if (preset.enchants.length > 0) {
    preset.enchants.forEach((ench, i) => {
      if (i === 0) {
        // 最初の行を作成
        const row = document.createElement('div');
        row.className = 'enchant-item';
        row.innerHTML = `
          <select class="enchant-select mc-select">
            <option value="">-- 選択 --</option>
            <option value="sharpness">ダメージ増加 (Sharpness)</option>
            <option value="smite">アンデッド特効 (Smite)</option>
            <option value="unbreaking">耐久力 (Unbreaking)</option>
            <option value="efficiency">効率強化 (Efficiency)</option>
            <option value="fortune">幸運 (Fortune)</option>
            <option value="silk_touch">シルクタッチ (Silk Touch)</option>
            <option value="protection">ダメージ軽減 (Protection)</option>
            <option value="fire_aspect">火属性 (Fire Aspect)</option>
            <option value="looting">ドロップ増加 (Looting)</option>
            <option value="mending">修繕 (Mending)</option>
          </select>
          <input type="number" class="enchant-level mc-input" value="${ench.level}" min="1" max="255">
        `;
        row.querySelector('.enchant-select').value = ench.id;
        enchantList.appendChild(row);
      } else {
        addEnchantRow(container);
        const rows = $$('.enchant-item', container);
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.enchant-select').value = ench.id;
        lastRow.querySelector('.enchant-level').value = ench.level;
      }
    });
  } else {
    // エンチャントなしの場合は空の行を1つ
    const row = document.createElement('div');
    row.className = 'enchant-item';
    row.innerHTML = `
      <select class="enchant-select mc-select">
        <option value="">-- 選択 --</option>
        <option value="sharpness">ダメージ増加 (Sharpness)</option>
        <option value="smite">アンデッド特効 (Smite)</option>
        <option value="unbreaking">耐久力 (Unbreaking)</option>
        <option value="efficiency">効率強化 (Efficiency)</option>
        <option value="fortune">幸運 (Fortune)</option>
        <option value="silk_touch">シルクタッチ (Silk Touch)</option>
        <option value="protection">ダメージ軽減 (Protection)</option>
        <option value="fire_aspect">火属性 (Fire Aspect)</option>
        <option value="looting">ドロップ増加 (Looting)</option>
        <option value="mending">修繕 (Mending)</option>
      </select>
      <input type="number" class="enchant-level mc-input" value="1" min="1" max="255">
    `;
    enchantList.appendChild(row);
  }

  updateCommand(container);
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // フォーム状態をリセット
  formState = {
    target: '@p',
    item: 'minecraft:diamond_sword',
    count: 1,
    customName: '',
    lore: '',
    unbreakable: false,
    enchantments: [],
    rawComponents: '',
  };

  // ターゲット選択をリセット
  const targetSelect = $('#give-target', container);
  if (targetSelect) targetSelect.value = '@p';

  // 個数をリセット
  const countInput = $('#give-count', container);
  if (countInput) countInput.value = '1';

  // アイテムIDをリセット
  const itemInput = $('#give-item', container);
  if (itemInput) itemInput.value = 'minecraft:diamond_sword';

  // カスタム名をリセット
  const nameInput = $('#give-name', container);
  if (nameInput) nameInput.value = '';

  // 説明文をリセット
  const loreInput = $('#give-lore', container);
  if (loreInput) loreInput.value = '';

  // 耐久無限をリセット
  const unbreakable = $('#give-unbreakable', container);
  if (unbreakable) unbreakable.checked = false;

  // エンチャントリストをリセット（最初の1行だけ残す）
  const enchantList = $('#enchant-list', container);
  if (enchantList) {
    const items = $$('.enchant-item', enchantList);
    items.forEach((item, index) => {
      if (index === 0) {
        // 最初の行はリセット
        const select = item.querySelector('.enchant-select');
        if (select) select.value = '';
        const level = item.querySelector('.enchant-level');
        if (level) level.value = '1';
      } else {
        // 追加された行は削除
        item.remove();
      }
    });
  }

  // Raw Componentsをリセット
  const rawInput = $('#give-raw', container);
  if (rawInput) rawInput.value = '';

  // プレビューとコマンドを更新
  updateCommand(container);
}

/**
 * バージョン表示を更新
 */
function updateVersionDisplay(container) {
  const version = workspaceStore.get('version') || '1.21';
  const badge = $('#give-version-badge', container);
  const note = $('#give-version-note', container);

  if (badge) {
    badge.textContent = version + '+';
  }
  if (note) {
    note.textContent = getVersionNote(version);
  }
}

/**
 * オートコンプリートをセットアップ
 */
function setupAutocomplete(container) {
  const input = $('#give-item', container);
  const suggestions = $('#item-suggestions', container);

  input.addEventListener('input', debounce(() => {
    const query = input.value.toLowerCase().replace('minecraft:', '');
    const items = dataStore.get('items') || [];

    if (query.length < 2) {
      suggestions.innerHTML = '';
      suggestions.style.display = 'none';
      return;
    }

    const matches = items
      .filter(id => id.includes(query))
      .slice(0, 10);

    if (matches.length === 0) {
      suggestions.style.display = 'none';
      return;
    }

    suggestions.innerHTML = matches.map(id => `
      <div class="suggestion-item" data-id="${id}">
        ${id.replace('minecraft:', '')}
      </div>
    `).join('');
    suggestions.style.display = 'block';
  }, 200));

  suggestions.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      input.value = item.dataset.id;
      suggestions.style.display = 'none';
      updateCommand(container);
    }
  });

  // 外部クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
      suggestions.style.display = 'none';
    }
  });
}

/**
 * エンチャント行を追加
 */
function addEnchantRow(container) {
  const list = $('#enchant-list', container);
  const row = createElement('div', { className: 'enchant-item' });
  row.innerHTML = `
    <select class="enchant-select mc-select">
      <option value="">-- 選択 --</option>
      <option value="sharpness">ダメージ増加 (Sharpness)</option>
      <option value="smite">アンデッド特効 (Smite)</option>
      <option value="unbreaking">耐久力 (Unbreaking)</option>
      <option value="efficiency">効率強化 (Efficiency)</option>
      <option value="fortune">幸運 (Fortune)</option>
      <option value="silk_touch">シルクタッチ (Silk Touch)</option>
      <option value="protection">ダメージ軽減 (Protection)</option>
      <option value="fire_aspect">火属性 (Fire Aspect)</option>
      <option value="looting">ドロップ増加 (Looting)</option>
      <option value="mending">修繕 (Mending)</option>
    </select>
    <input type="number" class="enchant-level mc-input" value="1" min="1" max="255">
    <button type="button" class="remove-enchant">×</button>
  `;

  row.querySelector('.remove-enchant').addEventListener('click', () => {
    row.remove();
    updateCommand(container);
  });

  list.appendChild(row);
}

/**
 * コマンドを更新
 */
function updateCommand(container) {
  // フォーム値を取得
  // Note: targetはボタン選択なのでformState.targetを維持
  const currentTarget = formState.target;
  formState = {
    target: currentTarget,
    item: $('#give-item', container).value || 'minecraft:stone',
    count: parseInt($('#give-count', container).value) || 1,
    customName: $('#give-name', container).value,
    lore: $('#give-lore', container).value,
    unbreakable: $('#give-unbreakable', container).checked,
    enchantments: getEnchantments(container),
    rawComponents: $('#give-raw', container).value,
  };

  // 現在のバージョンを取得
  const version = workspaceStore.get('version') || '1.21';

  // コマンド生成（バージョン指定）
  const command = generateGiveCommand(formState, version);

  // プレビュー更新
  updatePreview(container);

  // 出力パネルに表示
  setOutput(command, 'give', formState);
}

/**
 * エンチャント一覧を取得
 */
function getEnchantments(container) {
  const enchants = [];
  $$('.enchant-item', container).forEach(row => {
    const select = row.querySelector('.enchant-select');
    const level = row.querySelector('.enchant-level');
    if (select.value) {
      enchants.push({
        id: select.value,
        level: parseInt(level.value) || 1,
      });
    }
  });
  return enchants;
}

// エンチャント名マップ
const ENCHANT_NAMES = {
  sharpness: 'ダメージ増加',
  smite: 'アンデッド特効',
  unbreaking: '耐久力',
  efficiency: '効率強化',
  fortune: '幸運',
  silk_touch: 'シルクタッチ',
  protection: 'ダメージ軽減',
  fire_aspect: '火属性',
  looting: 'ドロップ増加',
  mending: '修繕',
};

/**
 * 数字をローマ数字に変換
 */
function toRoman(num) {
  if (num <= 0 || num > 3999) return num.toString();
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i];
      num -= values[i];
    }
  }
  return result;
}

/**
 * プレビューを更新
 */
function updatePreview(container) {
  const itemIconEl = $('#give-item-icon', container);
  const itemNameEl = $('#give-item-name', container);
  const itemIdEl = $('#give-item-id', container);
  const itemCountEl = $('#give-item-count', container);
  const previewEnchantsEl = $('#give-preview-enchants', container);
  const previewLoreEl = $('#give-preview-lore', container);
  const statTargetEl = $('#give-stat-target', container);
  const statEnchantsEl = $('#give-stat-enchants', container);
  const previewSlot = $('#give-preview-slot', container);

  // アイテムIDからアイコンを取得
  const itemId = formState.item.replace('minecraft:', '');
  if (itemIconEl) {
    itemIconEl.src = getInviconUrl(itemId);
    itemIconEl.alt = itemId;
    itemIconEl.style.opacity = '1';
    itemIconEl.onerror = () => { itemIconEl.style.opacity = '0.3'; };
  }

  // アイテム名
  if (itemNameEl) {
    const displayName = formState.customName || itemId;
    itemNameEl.textContent = displayName;
    if (formState.enchantments.length > 0) {
      itemNameEl.classList.add('enchanted');
    } else {
      itemNameEl.classList.remove('enchanted');
    }
  }

  // アイテムID
  if (itemIdEl) {
    itemIdEl.textContent = formState.item.startsWith('minecraft:') ? formState.item : `minecraft:${formState.item}`;
  }

  // 個数表示
  if (itemCountEl) {
    itemCountEl.textContent = formState.count > 1 ? formState.count : '';
    itemCountEl.style.display = formState.count > 1 ? 'block' : 'none';
  }

  // エンチャント表示
  if (previewEnchantsEl) {
    if (formState.enchantments.length === 0) {
      previewEnchantsEl.innerHTML = '<p class="text-muted">エンチャントなし</p>';
    } else {
      previewEnchantsEl.innerHTML = formState.enchantments.map(e => {
        const name = ENCHANT_NAMES[e.id] || e.id;
        return `<div class="preview-enchant">${name} ${toRoman(e.level)}</div>`;
      }).join('');
    }
  }

  // 説明文表示
  if (previewLoreEl) {
    if (formState.lore) {
      const lines = formState.lore.split('\n').filter(l => l.trim());
      previewLoreEl.innerHTML = lines.map(line => `<div class="lore-line">${line}</div>`).join('');
      previewLoreEl.style.display = 'block';
    } else {
      previewLoreEl.innerHTML = '';
      previewLoreEl.style.display = 'none';
    }
  }

  // 統計バー
  if (statTargetEl) statTargetEl.textContent = formState.target;
  if (statEnchantsEl) statEnchantsEl.textContent = formState.enchantments.length;

  // エンチャントグロー効果
  if (previewSlot) {
    if (formState.enchantments.length > 0) {
      previewSlot.classList.add('enchanted');
    } else {
      previewSlot.classList.remove('enchanted');
    }
  }
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  /* ===== summonツール統一デザイン ===== */

  /* セクション構造 */
  .give-tool .form-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .give-tool .section-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-sm);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .give-tool .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .give-tool .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  .give-tool .optional-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    background: rgba(255,255,255,0.15);
    border-radius: 4px;
    color: #aaaaaa;
    margin-left: 8px;
  }

  /* ターゲット選択グリッド */
  .target-selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--mc-space-md);
  }

  .target-option {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .target-option:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .target-option.active {
    background: linear-gradient(180deg, rgba(92, 183, 70, 0.3) 0%, rgba(58, 129, 40, 0.3) 100%);
    border-color: var(--mc-color-grass-main);
  }

  .target-option .target-icon {
    width: 32px;
    height: 32px;
  }

  .target-option .target-info {
    display: flex;
    flex-direction: column;
  }

  .target-option .target-id {
    font-weight: bold;
    color: #ffffff;
    font-family: var(--mc-font-mono);
  }

  .target-option .target-desc {
    font-size: 0.75rem;
    color: #aaaaaa;
  }

  /* プリセットカード */
  .give-presets {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
  }

  .give-tool .preset-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .give-tool .preset-card:hover {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: var(--mc-color-grass-main);
    transform: translateY(-2px);
  }

  .give-tool .preset-card .preset-icon {
    width: 40px;
    height: 40px;
  }

  .give-tool .preset-card .preset-name {
    font-size: 0.8rem;
    color: #ffffff;
    text-align: center;
  }

  /* アイテム入力 */
  .item-input-group,
  .count-input-group {
    margin-bottom: var(--mc-space-md);
  }

  .item-input-group label,
  .count-input-group label {
    display: block;
    color: #cccccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-xs);
  }

  /* 個数プリセット */
  .count-presets {
    display: flex;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-sm);
  }

  .count-btn {
    padding: 6px 16px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
  }

  .count-btn:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
  }

  .count-btn.active {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: var(--mc-color-grass-main);
  }

  .count-input {
    width: 80px;
  }

  /* 名前・説明エディター */
  .name-editor,
  .lore-editor {
    margin-bottom: var(--mc-space-md);
  }

  .name-editor label,
  .lore-editor label {
    display: block;
    color: #cccccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-xs);
  }

  /* behavior-grid */
  .give-tool .behavior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-md);
  }

  .give-tool .behavior-option {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .give-tool .behavior-option:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
  }

  .give-tool .behavior-option:has(input:checked) {
    background: linear-gradient(180deg, rgba(92, 183, 70, 0.3) 0%, rgba(58, 129, 40, 0.3) 100%);
    border-color: var(--mc-color-grass-main);
  }

  .give-tool .behavior-option input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--mc-color-grass-main);
  }

  .give-tool .option-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    flex: 1;
  }

  .give-tool .option-icon {
    width: 32px;
    height: 32px;
  }

  .give-tool .option-text {
    display: flex;
    flex-direction: column;
  }

  .give-tool .option-name {
    font-weight: bold;
    color: #ffffff;
    font-size: 0.9rem;
  }

  .give-tool .option-desc {
    font-size: 0.75rem;
    color: #aaaaaa;
  }

  /* Raw Components */
  .raw-components-section {
    margin-top: var(--mc-space-md);
  }

  .raw-components-section label {
    display: block;
    color: #cccccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-xs);
  }

  /* ヘッダー */
  .give-tool .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-radius: 8px 8px 0 0;
    margin: calc(-1 * var(--mc-space-lg));
    margin-bottom: var(--mc-space-lg);
  }

  .give-tool .header-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .give-tool .header-icon {
    width: 48px;
    height: 48px;
  }

  .give-tool .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .give-tool .header-subtitle {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.8);
  }

  /* エンチャント追加ボタン */
  .add-enchant-btn {
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    border: 2px solid #3d2694;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.15s;
  }

  .add-enchant-btn:hover {
    background: linear-gradient(180deg, #7d5ef5 0%, #5a42c3 100%);
    transform: translateY(-1px);
  }

  /* 既存スタイルを維持 */
  .autocomplete-wrapper {
    position: relative;
  }

  .autocomplete-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #2a2a2a;
    border: 2px solid #555555;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    display: none;
  }

  .suggestion-item {
    padding: var(--mc-space-sm);
    cursor: pointer;
    font-family: var(--mc-font-mono);
    font-size: 0.8rem;
    color: #ffffff;
  }

  .suggestion-item:hover {
    background-color: var(--mc-color-grass-main);
    color: white;
  }

  .enchant-list {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-md);
  }

  .enchant-item {
    display: flex;
    gap: var(--mc-space-sm);
    align-items: center;
  }

  .enchant-select {
    flex: 1;
    background: #2a2a2a;
    color: #ffffff;
    border: 2px solid #444444;
    border-radius: 4px;
    padding: 8px 12px;
  }

  .enchant-level {
    width: 80px;
    background: #2a2a2a;
    color: #ffffff;
    border: 2px solid #444444;
    border-radius: 4px;
    padding: 8px 12px;
    text-align: center;
  }

  .remove-enchant {
    background: linear-gradient(180deg, #e04040 0%, #c80000 100%);
    border: 2px solid #a00000;
    color: #ffffff;
    cursor: pointer;
    font-size: 1rem;
    padding: 6px 12px;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .remove-enchant:hover {
    background: linear-gradient(180deg, #ff5050 0%, #e00000 100%);
  }

  .hint {
    font-weight: normal;
    font-size: 0.75rem;
    color: #888888;
    margin-left: var(--mc-space-sm);
  }

  textarea.mc-code {
    font-family: var(--mc-font-mono);
    font-size: 0.8rem;
  }

  /* プレビューセクション */
  .give-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .give-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
  }

  /* Minecraft風インベントリプレビュー */
  .give-tool .mc-inventory-preview {
    display: flex;
    align-items: flex-start;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 3px solid #3d3d3d;
    border-radius: 4px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }

  .give-tool .mc-inv-slot-large {
    position: relative;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #8b8b8b 0%, #373737 100%);
    border: 2px solid;
    border-color: #373737 #fff #fff #373737;
    box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .give-tool .mc-inv-slot-large.enchanted {
    animation: slot-enchant-glow 2s ease-in-out infinite;
  }

  @keyframes slot-enchant-glow {
    0%, 100% {
      box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a, 0 0 10px rgba(170, 0, 255, 0.4);
    }
    50% {
      box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a, 0 0 20px rgba(170, 0, 255, 0.7), 0 0 30px rgba(85, 255, 255, 0.3);
    }
  }

  .give-tool .mc-inv-item-img {
    width: 48px;
    height: 48px;
    image-rendering: pixelated;
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
    transition: transform 0.2s ease;
  }

  .give-tool .mc-inv-slot-large:hover .mc-inv-item-img {
    transform: scale(1.1);
  }

  .give-tool .mc-inv-count {
    position: absolute;
    bottom: 2px;
    right: 4px;
    font-family: 'Minecraft', monospace;
    font-size: 14px;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 0 #3f3f3f;
    line-height: 1;
  }

  .give-tool .mc-item-tooltip {
    flex: 1;
    background: linear-gradient(180deg, #100010 0%, #1a001a 100%);
    border: 2px solid;
    border-color: #5000aa #28007f #28007f #5000aa;
    padding: 8px 12px;
    min-width: 180px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }

  .give-tool .tooltip-name {
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 4px;
  }

  .give-tool .tooltip-name.enchanted {
    color: #55ffff;
    text-shadow: 0 0 10px rgba(85, 255, 255, 0.5);
  }

  .give-tool .tooltip-enchants {
    border-top: 1px solid rgba(128, 0, 255, 0.3);
    padding-top: 6px;
    margin-top: 4px;
  }

  .give-tool .tooltip-lore {
    border-top: 1px solid rgba(128, 0, 255, 0.2);
    padding-top: 6px;
    margin-top: 6px;
  }

  .give-tool .lore-line {
    color: #aa00aa;
    font-size: 0.85rem;
    font-style: italic;
  }

  .give-tool .tooltip-meta {
    border-top: 1px solid rgba(128, 0, 255, 0.2);
    padding-top: 6px;
    margin-top: 8px;
  }

  .give-tool .tooltip-id {
    font-family: var(--mc-font-mono);
    font-size: 0.7rem;
    color: #555;
  }

  .give-tool .preview-enchant {
    color: #aaa;
    font-size: 0.85rem;
    padding: 2px 0;
  }

  .give-tool .item-stats-bar {
    display: flex;
    gap: var(--mc-space-lg);
    padding: var(--mc-space-sm) var(--mc-space-md);
    margin-top: var(--mc-space-sm);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .give-tool .stat-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
  }

  .give-tool .stat-label {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .give-tool .stat-value {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--mc-color-diamond);
    font-family: var(--mc-font-mono);
  }

  .give-tool .text-muted {
    color: var(--mc-text-muted);
  }
`;
document.head.appendChild(style);

export default { render, init };
