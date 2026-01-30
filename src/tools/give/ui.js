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

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel give-tool" id="give-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'chest')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="version-badge" id="give-version-badge">1.21+</span>
      </div>
      <p class="version-note" id="give-version-note"></p>

      <form class="tool-form" id="give-form">
        <!-- ターゲット -->
        <div class="form-row">
          <div class="form-group">
            <label for="give-target">ターゲット</label>
            <select id="give-target" class="mc-select">
              <option value="@p">@p (最も近いプレイヤー)</option>
              <option value="@s">@s (自分自身)</option>
              <option value="@a">@a (全プレイヤー)</option>
              <option value="@r">@r (ランダム)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="give-count">個数</label>
            <input type="number" id="give-count" class="mc-input"
                   value="1" min="1" max="64">
          </div>
        </div>

        <!-- アイテム -->
        <div class="form-group">
          <label for="give-item">アイテムID</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="give-item" class="mc-input"
                   value="minecraft:diamond_sword"
                   placeholder="minecraft:diamond_sword"
                   autocomplete="off">
            <div class="autocomplete-list" id="item-suggestions"></div>
          </div>
        </div>

        <!-- カスタム名 -->
        <div class="form-group">
          <label for="give-name">カスタム名（任意）</label>
          <input type="text" id="give-name" class="mc-input"
                 placeholder="伝説の剣">
        </div>

        <!-- 説明文 -->
        <div class="form-group">
          <label for="give-lore">説明文（任意・改行で複数行）</label>
          <textarea id="give-lore" class="mc-input" rows="2"
                    placeholder="古代の力が宿る剣"></textarea>
        </div>

        <!-- オプション -->
        <div class="form-group">
          <label>オプション</label>
          <div class="options-grid">
            <label class="option-label">
              <input type="checkbox" id="give-unbreakable">
              耐久無限 (Unbreakable)
            </label>
          </div>
        </div>

        <!-- エンチャント -->
        <div class="form-group">
          <label>エンチャント</label>
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
          <button type="button" class="mc-btn" id="add-enchant">+ エンチャント追加</button>
        </div>

        <!-- Raw Components -->
        <div class="form-group">
          <label for="give-raw">
            Raw Components（上級者向け）
            <span class="hint">手動でコンポーネントを追加</span>
          </label>
          <textarea id="give-raw" class="mc-input mc-code" rows="3"
                    placeholder='例: damage=100,custom_model_data=1234'></textarea>
        </div>
      </form>

      <!-- Minecraft風ゲーム画面プレビュー -->
      <div class="give-preview-section">
        <h3>プレビュー</h3>
        <div class="mc-inventory-preview">
          <!-- インベントリスロット風表示 -->
          <div class="mc-inv-slot-large" id="give-preview-slot">
            <img class="mc-inv-item-img" id="give-item-icon" src="" alt="">
            <span class="mc-inv-count" id="give-item-count">1</span>
          </div>

          <!-- Minecraft風ツールチップ -->
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

        <!-- アイテム情報バー -->
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

  // 初期表示
  updateVersionDisplay(container);
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
  formState = {
    target: $('#give-target', container).value,
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
  .autocomplete-wrapper {
    position: relative;
  }

  .autocomplete-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
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
  }

  .suggestion-item:hover {
    background-color: var(--mc-color-grass-main);
    color: white;
  }

  .enchant-list {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-sm);
  }

  .enchant-item {
    display: flex;
    gap: var(--mc-space-sm);
    align-items: center;
  }

  .enchant-select {
    flex: 1;
  }

  .enchant-level {
    width: 80px;
  }

  .remove-enchant {
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0 var(--mc-space-sm);
  }

  .hint {
    font-weight: normal;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
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
