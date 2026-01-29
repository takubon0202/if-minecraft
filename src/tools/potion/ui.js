/**
 * Potion Generator - UI
 */

import { $, $$, createElement, debounce, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';

// ポーションエフェクト
const EFFECTS = [
  // 有益
  { id: 'speed', name: '移動速度上昇', type: 'beneficial', color: '#7CAFC6' },
  { id: 'haste', name: '採掘速度上昇', type: 'beneficial', color: '#D9C043' },
  { id: 'strength', name: '攻撃力上昇', type: 'beneficial', color: '#932423' },
  { id: 'instant_health', name: '即時回復', type: 'beneficial', color: '#F82423' },
  { id: 'jump_boost', name: '跳躍力上昇', type: 'beneficial', color: '#22FF4C' },
  { id: 'regeneration', name: '再生', type: 'beneficial', color: '#CD5CAB' },
  { id: 'resistance', name: '耐性', type: 'beneficial', color: '#99453A' },
  { id: 'fire_resistance', name: '火炎耐性', type: 'beneficial', color: '#E49A3A' },
  { id: 'water_breathing', name: '水中呼吸', type: 'beneficial', color: '#2E5299' },
  { id: 'invisibility', name: '透明化', type: 'beneficial', color: '#7F8392' },
  { id: 'night_vision', name: '暗視', type: 'beneficial', color: '#1F1FA1' },
  { id: 'health_boost', name: '体力増強', type: 'beneficial', color: '#F87D23' },
  { id: 'absorption', name: '衝撃吸収', type: 'beneficial', color: '#2552A5' },
  { id: 'saturation', name: '満腹度回復', type: 'beneficial', color: '#F82423' },
  { id: 'luck', name: '幸運', type: 'beneficial', color: '#339900' },
  { id: 'slow_falling', name: '低速落下', type: 'beneficial', color: '#FFEFD1' },
  { id: 'conduit_power', name: 'コンジットパワー', type: 'beneficial', color: '#1DC2D1' },
  { id: 'dolphins_grace', name: 'イルカの好意', type: 'beneficial', color: '#88A3BE' },
  { id: 'hero_of_the_village', name: '村の英雄', type: 'beneficial', color: '#44FF44' },
  // 有害
  { id: 'slowness', name: '移動速度低下', type: 'harmful', color: '#5A6C81' },
  { id: 'mining_fatigue', name: '採掘速度低下', type: 'harmful', color: '#4A4217' },
  { id: 'instant_damage', name: '即時ダメージ', type: 'harmful', color: '#430A09' },
  { id: 'nausea', name: '吐き気', type: 'harmful', color: '#551D4A' },
  { id: 'blindness', name: '盲目', type: 'harmful', color: '#1F1F23' },
  { id: 'hunger', name: '空腹', type: 'harmful', color: '#587653' },
  { id: 'weakness', name: '弱体化', type: 'harmful', color: '#484D48' },
  { id: 'poison', name: '毒', type: 'harmful', color: '#4E9331' },
  { id: 'wither', name: 'ウィザー', type: 'harmful', color: '#352A27' },
  { id: 'levitation', name: '浮遊', type: 'harmful', color: '#CEFFFF' },
  { id: 'unluck', name: '不運', type: 'harmful', color: '#C0A44D' },
  { id: 'bad_omen', name: '不吉な予感', type: 'harmful', color: '#0B6138' },
  { id: 'darkness', name: '暗闇', type: 'harmful', color: '#292929' },
  // 中立
  { id: 'glowing', name: '発光', type: 'neutral', color: '#94A061' },
];

// ポーションタイプ
const POTION_TYPES = [
  { id: 'potion', name: '通常のポーション' },
  { id: 'splash_potion', name: 'スプラッシュポーション' },
  { id: 'lingering_potion', name: '残留ポーション' },
  { id: 'tipped_arrow', name: '効果付きの矢' },
];

let selectedEffects = [];

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const typeOptions = POTION_TYPES.map(t =>
    `<option value="${t.id}">${t.name}</option>`
  ).join('');

  return `
    <div class="tool-panel" id="potion-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
      </div>

      <form class="tool-form" id="potion-form">
        <!-- ポーションタイプ -->
        <div class="form-row">
          <div class="form-group">
            <label for="potion-type">ポーションタイプ</label>
            <select id="potion-type" class="mc-select">
              ${typeOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="potion-count">個数</label>
            <input type="number" id="potion-count" class="mc-input" value="1" min="1" max="64">
          </div>
        </div>

        <!-- カスタム名 -->
        <div class="form-group">
          <label for="potion-name">カスタム名（任意）</label>
          <input type="text" id="potion-name" class="mc-input" placeholder="究極のポーション">
        </div>

        <!-- カスタムカラー -->
        <div class="form-group">
          <label for="potion-color">ポーションの色</label>
          <div class="color-input-row">
            <input type="color" id="potion-color" value="#FF0000">
            <input type="text" id="potion-color-hex" class="mc-input" placeholder="#FF0000" style="width: 100px">
            <label class="option-label">
              <input type="checkbox" id="potion-use-color">
              カスタム色を使用
            </label>
          </div>
        </div>

        <!-- エフェクト追加 -->
        <div class="form-group">
          <label>エフェクトを追加</label>
          <div class="effect-tabs">
            <button type="button" class="effect-tab active" data-type="beneficial">有益</button>
            <button type="button" class="effect-tab" data-type="harmful">有害</button>
            <button type="button" class="effect-tab" data-type="neutral">中立</button>
          </div>
          <div class="effect-grid" id="effect-grid">
            ${EFFECTS.filter(e => e.type === 'beneficial').map(e => `
              <button type="button" class="effect-add-btn" data-effect="${e.id}"
                      style="border-left: 4px solid ${e.color}">
                ${e.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 選択されたエフェクト -->
        <div class="form-group">
          <label>選択中のエフェクト</label>
          <div class="selected-effects" id="selected-effects">
            <p class="empty-message">エフェクトを追加してください</p>
          </div>
        </div>

        <!-- プリセット -->
        <div class="form-group">
          <label>プリセット</label>
          <div class="preset-buttons">
            <button type="button" class="mc-btn preset-btn" data-preset="healing">回復II</button>
            <button type="button" class="mc-btn preset-btn" data-preset="strength">力II</button>
            <button type="button" class="mc-btn preset-btn" data-preset="speed">俊敏II</button>
            <button type="button" class="mc-btn preset-btn" data-preset="god">全能</button>
            <button type="button" class="mc-btn preset-btn" data-preset="clear">クリア</button>
          </div>
        </div>
      </form>

      <!-- プレビュー -->
      <div class="potion-preview">
        <div class="potion-bottle" id="potion-bottle">
          <div class="bottle-liquid" id="bottle-liquid"></div>
        </div>
        <div class="effect-list-preview" id="effect-list-preview"></div>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  selectedEffects = [];

  // エフェクトタブ切り替え
  delegate(container, 'click', '.effect-tab', (e, target) => {
    $$('.effect-tab', container).forEach(t => t.classList.remove('active'));
    target.classList.add('active');
    renderEffectGrid(container, target.dataset.type);
  });

  // エフェクト追加
  delegate(container, 'click', '.effect-add-btn', (e, target) => {
    const effectId = target.dataset.effect;
    if (!selectedEffects.find(e => e.id === effectId)) {
      selectedEffects.push({ id: effectId, duration: 600, amplifier: 0 });
      renderSelectedEffects(container);
      updateCommand();
    }
  });

  // エフェクト削除
  delegate(container, 'click', '.effect-remove', (e, target) => {
    const effectId = target.dataset.effect;
    selectedEffects = selectedEffects.filter(e => e.id !== effectId);
    renderSelectedEffects(container);
    updateCommand();
  });

  // 持続時間・レベル変更
  delegate(container, 'input', '.effect-duration, .effect-amplifier', debounce((e, target) => {
    const effectId = target.dataset.effect;
    const effect = selectedEffects.find(e => e.id === effectId);
    if (effect) {
      if (target.classList.contains('effect-duration')) {
        effect.duration = parseInt(target.value) || 600;
      } else {
        effect.amplifier = parseInt(target.value) || 0;
      }
      updateCommand();
    }
  }, 150));

  // プリセット
  delegate(container, 'click', '.preset-btn', (e, target) => {
    applyPreset(target.dataset.preset, container);
  });

  // カラー同期
  $('#potion-color', container)?.addEventListener('input', (e) => {
    $('#potion-color-hex', container).value = e.target.value;
    updateCommand();
  });
  $('#potion-color-hex', container)?.addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      $('#potion-color', container).value = e.target.value;
      updateCommand();
    }
  });

  // フォーム変更
  ['#potion-type', '#potion-count', '#potion-name', '#potion-use-color'].forEach(sel => {
    $(sel, container)?.addEventListener('change', updateCommand);
    $(sel, container)?.addEventListener('input', debounce(updateCommand, 150));
  });

  updateCommand();
}

/**
 * エフェクトグリッドをレンダリング
 */
function renderEffectGrid(container, type) {
  const grid = $('#effect-grid', container);
  if (!grid) return;

  grid.innerHTML = EFFECTS.filter(e => e.type === type).map(e => `
    <button type="button" class="effect-add-btn" data-effect="${e.id}"
            style="border-left: 4px solid ${e.color}">
      ${e.name}
    </button>
  `).join('');
}

/**
 * 選択されたエフェクトをレンダリング
 */
function renderSelectedEffects(container) {
  const list = $('#selected-effects', container);
  if (!list) return;

  if (selectedEffects.length === 0) {
    list.innerHTML = '<p class="empty-message">エフェクトを追加してください</p>';
    updatePreview(container);
    return;
  }

  list.innerHTML = selectedEffects.map(e => {
    const info = EFFECTS.find(ef => ef.id === e.id);
    return `
      <div class="selected-effect" style="border-left: 4px solid ${info?.color || '#888'}">
        <span class="effect-name">${info?.name || e.id}</span>
        <div class="effect-settings">
          <label>
            <span>秒</span>
            <input type="number" class="effect-duration mc-input" data-effect="${e.id}"
                   value="${Math.floor(e.duration / 20)}" min="1" max="9999">
          </label>
          <label>
            <span>Lv</span>
            <input type="number" class="effect-amplifier mc-input" data-effect="${e.id}"
                   value="${e.amplifier + 1}" min="1" max="255">
          </label>
        </div>
        <button type="button" class="effect-remove" data-effect="${e.id}">×</button>
      </div>
    `;
  }).join('');

  updatePreview(container);
}

/**
 * プレビューを更新
 */
function updatePreview(container) {
  const liquid = $('#bottle-liquid', container);
  const effectList = $('#effect-list-preview', container);

  if (liquid) {
    if (selectedEffects.length > 0) {
      const firstEffect = EFFECTS.find(e => e.id === selectedEffects[0].id);
      liquid.style.backgroundColor = firstEffect?.color || '#FF0000';
    } else {
      liquid.style.backgroundColor = '#385dc6';
    }
  }

  if (effectList) {
    effectList.innerHTML = selectedEffects.map(e => {
      const info = EFFECTS.find(ef => ef.id === e.id);
      const seconds = Math.floor(e.duration / 20);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const time = minutes > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `0:${secs}`;
      return `<div class="preview-effect">${info?.name || e.id} ${e.amplifier > 0 ? toRoman(e.amplifier + 1) : ''} (${time})</div>`;
    }).join('');
  }
}

/**
 * プリセットを適用
 */
function applyPreset(preset, container) {
  switch (preset) {
    case 'healing':
      selectedEffects = [{ id: 'instant_health', duration: 1, amplifier: 1 }];
      break;
    case 'strength':
      selectedEffects = [{ id: 'strength', duration: 1800, amplifier: 1 }];
      break;
    case 'speed':
      selectedEffects = [{ id: 'speed', duration: 1800, amplifier: 1 }];
      break;
    case 'god':
      selectedEffects = [
        { id: 'strength', duration: 72000, amplifier: 4 },
        { id: 'speed', duration: 72000, amplifier: 4 },
        { id: 'regeneration', duration: 72000, amplifier: 4 },
        { id: 'resistance', duration: 72000, amplifier: 4 },
        { id: 'fire_resistance', duration: 72000, amplifier: 0 },
        { id: 'night_vision', duration: 72000, amplifier: 0 },
        { id: 'water_breathing', duration: 72000, amplifier: 0 },
      ];
      break;
    case 'clear':
      selectedEffects = [];
      break;
  }
  renderSelectedEffects(container);
  updateCommand();
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const potionType = $('#potion-type')?.value || 'potion';
  const count = parseInt($('#potion-count')?.value) || 1;
  const customName = $('#potion-name')?.value;
  const useColor = $('#potion-use-color')?.checked;
  const color = $('#potion-color')?.value;

  // 持続時間をチックに変換（秒→チック）
  const processedEffects = selectedEffects.map(e => {
    const durationInput = $(`.effect-duration[data-effect="${e.id}"]`)?.value;
    const amplifierInput = $(`.effect-amplifier[data-effect="${e.id}"]`)?.value;
    return {
      id: e.id,
      duration: (parseInt(durationInput) || 30) * 20,
      amplifier: Math.max(0, (parseInt(amplifierInput) || 1) - 1),
    };
  });

  const components = [];

  // カスタム名
  if (customName) {
    components.push(`custom_name='"${customName}"'`);
  }

  // ポーション効果
  if (processedEffects.length > 0) {
    const effectsJson = processedEffects.map(e =>
      `{id:"minecraft:${e.id}",duration:${e.duration},amplifier:${e.amplifier}}`
    ).join(',');
    components.push(`potion_contents={custom_effects:[${effectsJson}]}`);
  }

  // カスタム色
  if (useColor && color) {
    const colorInt = parseInt(color.replace('#', ''), 16);
    components.push(`potion_contents={custom_color:${colorInt}}`);
  }

  let command = `/give @p minecraft:${potionType}`;
  if (components.length > 0) {
    command += `[${components.join(',')}]`;
  }
  if (count > 1) {
    command += ` ${count}`;
  }

  setOutput(command, 'potion', { potionType, count, customName, effects: processedEffects });
}

function toRoman(num) {
  const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return roman[num] || num.toString();
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .color-input-row {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
  }

  .effect-tabs {
    display: flex;
    gap: var(--mc-space-xs);
    margin-bottom: var(--mc-space-sm);
  }

  .effect-tab {
    padding: var(--mc-space-sm) var(--mc-space-md);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.8rem;
  }

  .effect-tab.active {
    background-color: var(--mc-color-grass-main);
    color: white;
  }

  .effect-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--mc-space-xs);
    max-height: 200px;
    overflow-y: auto;
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
  }

  .effect-add-btn {
    padding: var(--mc-space-xs) var(--mc-space-sm);
    font-size: 0.75rem;
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s;
  }

  .effect-add-btn:hover {
    background-color: var(--mc-color-stone-300);
  }

  .selected-effects {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    min-height: 60px;
  }

  .selected-effect {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-xs);
    background-color: var(--mc-bg-surface);
  }

  .selected-effect .effect-name {
    flex: 1;
    font-size: 0.85rem;
  }

  .effect-settings {
    display: flex;
    gap: var(--mc-space-sm);
  }

  .effect-settings label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
  }

  .effect-settings input {
    width: 60px;
    padding: 4px;
  }

  .selected-effect .effect-remove {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.25rem;
  }

  .potion-preview {
    display: flex;
    align-items: flex-start;
    gap: var(--mc-space-lg);
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .potion-bottle {
    width: 48px;
    height: 64px;
    position: relative;
    background: linear-gradient(to bottom, transparent 20%, rgba(255,255,255,0.1) 20%);
    border: 3px solid #444;
    border-radius: 0 0 12px 12px;
  }

  .potion-bottle::before {
    content: '';
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 12px;
    background: #555;
    border-radius: 4px 4px 0 0;
  }

  .bottle-liquid {
    position: absolute;
    bottom: 4px;
    left: 4px;
    right: 4px;
    height: 70%;
    background-color: #385dc6;
    border-radius: 0 0 8px 8px;
    transition: background-color 0.3s;
  }

  .effect-list-preview {
    flex: 1;
  }

  .preview-effect {
    font-size: 0.8rem;
    padding: 2px 0;
    color: var(--mc-text-secondary);
  }

  .preset-buttons {
    display: flex;
    gap: var(--mc-space-sm);
    flex-wrap: wrap;
  }
`;
document.head.appendChild(style);

export default { render, init };
