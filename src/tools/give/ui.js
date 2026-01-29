/**
 * Give Generator - UI
 */

import { $, $$, createElement, debounce } from '../../core/dom.js';
import { dataStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { generateGiveCommand } from './engine.js';

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
    <div class="tool-panel" id="give-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
      </div>

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
          <label>
            <input type="checkbox" id="give-unbreakable">
            耐久無限 (Unbreakable)
          </label>
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

  // 初期コマンド生成
  updateCommand(container);
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

  // コマンド生成
  const command = generateGiveCommand(formState);

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
`;
document.head.appendChild(style);

export default { render, init };
