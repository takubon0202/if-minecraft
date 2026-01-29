/**
 * Summon Generator - UI
 */

import { $, $$, createElement, debounce } from '../../core/dom.js';
import { dataStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { generateSummonCommand } from './engine.js';

// フォーム状態
let formState = {
  entity: 'minecraft:zombie',
  pos: '~ ~ ~',
  customName: '',
  noAI: false,
  silent: false,
  invulnerable: false,
  persistenceRequired: false,
  effects: [],
  rawNBT: '',
};

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="summon-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
      </div>

      <form class="tool-form" id="summon-form">
        <!-- エンティティ -->
        <div class="form-group">
          <label for="summon-entity">エンティティID</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="summon-entity" class="mc-input"
                   value="minecraft:zombie"
                   placeholder="minecraft:zombie"
                   autocomplete="off">
            <div class="autocomplete-list" id="entity-suggestions"></div>
          </div>
        </div>

        <!-- 座標 -->
        <div class="form-group">
          <label for="summon-pos">座標</label>
          <input type="text" id="summon-pos" class="mc-input"
                 value="~ ~ ~"
                 placeholder="~ ~ ~ または 100 64 200">
        </div>

        <!-- カスタム名 -->
        <div class="form-group">
          <label for="summon-name">カスタム名（任意）</label>
          <input type="text" id="summon-name" class="mc-input"
                 placeholder="ボスゾンビ">
        </div>

        <!-- オプション -->
        <div class="form-group options-group">
          <label>オプション</label>
          <div class="options-grid">
            <label class="option-label">
              <input type="checkbox" id="summon-noai">
              NoAI（動かない）
            </label>
            <label class="option-label">
              <input type="checkbox" id="summon-silent">
              Silent（音を出さない）
            </label>
            <label class="option-label">
              <input type="checkbox" id="summon-invulnerable">
              無敵
            </label>
            <label class="option-label">
              <input type="checkbox" id="summon-persistence">
              デスポーンしない
            </label>
          </div>
        </div>

        <!-- エフェクト -->
        <div class="form-group">
          <label>エフェクト（任意）</label>
          <div class="effect-list" id="effect-list">
            <div class="effect-item">
              <select class="effect-select mc-select">
                <option value="">-- 選択 --</option>
                <option value="speed">移動速度上昇</option>
                <option value="strength">攻撃力上昇</option>
                <option value="regeneration">再生</option>
                <option value="resistance">耐性</option>
                <option value="fire_resistance">火炎耐性</option>
                <option value="invisibility">透明化</option>
                <option value="glowing">発光</option>
                <option value="slowness">移動速度低下</option>
              </select>
              <input type="number" class="effect-amplifier mc-input" value="0" min="0" max="255" placeholder="Lv">
              <input type="number" class="effect-duration mc-input" value="600" min="1" placeholder="秒×20">
            </div>
          </div>
          <button type="button" class="mc-btn" id="add-effect">+ エフェクト追加</button>
        </div>

        <!-- Raw NBT -->
        <div class="form-group">
          <label for="summon-raw">
            Raw NBT/SNBT（上級者向け）
            <span class="hint">手動でNBTを追加</span>
          </label>
          <textarea id="summon-raw" class="mc-input mc-code" rows="3"
                    placeholder='例: Health:100f,Fire:200'></textarea>
        </div>
      </form>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  const form = $('#summon-form', container);

  // フォーム変更時にコマンド更新
  form.addEventListener('input', debounce(() => updateCommand(container), 150));
  form.addEventListener('change', () => updateCommand(container));

  // エンティティオートコンプリート
  setupAutocomplete(container);

  // エフェクト追加ボタン
  $('#add-effect', container)?.addEventListener('click', () => {
    addEffectRow(container);
  });

  // 初期コマンド生成
  updateCommand(container);
}

/**
 * オートコンプリートをセットアップ
 */
function setupAutocomplete(container) {
  const input = $('#summon-entity', container);
  const suggestions = $('#entity-suggestions', container);

  input.addEventListener('input', debounce(() => {
    const query = input.value.toLowerCase().replace('minecraft:', '');
    const entities = dataStore.get('entities') || [];

    if (query.length < 2) {
      suggestions.innerHTML = '';
      suggestions.style.display = 'none';
      return;
    }

    const matches = entities
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

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
      suggestions.style.display = 'none';
    }
  });
}

/**
 * エフェクト行を追加
 */
function addEffectRow(container) {
  const list = $('#effect-list', container);
  const row = createElement('div', { className: 'effect-item' });
  row.innerHTML = `
    <select class="effect-select mc-select">
      <option value="">-- 選択 --</option>
      <option value="speed">移動速度上昇</option>
      <option value="strength">攻撃力上昇</option>
      <option value="regeneration">再生</option>
      <option value="resistance">耐性</option>
      <option value="fire_resistance">火炎耐性</option>
      <option value="invisibility">透明化</option>
      <option value="glowing">発光</option>
      <option value="slowness">移動速度低下</option>
    </select>
    <input type="number" class="effect-amplifier mc-input" value="0" min="0" max="255" placeholder="Lv">
    <input type="number" class="effect-duration mc-input" value="600" min="1" placeholder="秒×20">
    <button type="button" class="remove-effect">×</button>
  `;

  row.querySelector('.remove-effect').addEventListener('click', () => {
    row.remove();
    updateCommand(container);
  });

  list.appendChild(row);
}

/**
 * コマンドを更新
 */
function updateCommand(container) {
  formState = {
    entity: $('#summon-entity', container).value || 'minecraft:zombie',
    pos: $('#summon-pos', container).value || '~ ~ ~',
    customName: $('#summon-name', container).value,
    noAI: $('#summon-noai', container).checked,
    silent: $('#summon-silent', container).checked,
    invulnerable: $('#summon-invulnerable', container).checked,
    persistenceRequired: $('#summon-persistence', container).checked,
    effects: getEffects(container),
    rawNBT: $('#summon-raw', container).value,
  };

  const command = generateSummonCommand(formState);
  setOutput(command, 'summon', formState);
}

/**
 * エフェクト一覧を取得
 */
function getEffects(container) {
  const effects = [];
  $$('.effect-item', container).forEach(row => {
    const select = row.querySelector('.effect-select');
    const amplifier = row.querySelector('.effect-amplifier');
    const duration = row.querySelector('.effect-duration');
    if (select.value) {
      effects.push({
        id: select.value,
        amplifier: parseInt(amplifier.value) || 0,
        duration: parseInt(duration.value) || 600,
      });
    }
  });
  return effects;
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--mc-space-sm);
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
    font-size: 0.85rem;
    cursor: pointer;
  }

  .effect-list {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-sm);
  }

  .effect-item {
    display: flex;
    gap: var(--mc-space-sm);
    align-items: center;
  }

  .effect-select {
    flex: 2;
  }

  .effect-amplifier,
  .effect-duration {
    width: 80px;
  }

  .remove-effect {
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0 var(--mc-space-sm);
  }
`;
document.head.appendChild(style);

export default { render, init };
