/**
 * Enchant Tool - UI
 */

import { $, $$, createElement, debounce, delegate } from '../../core/dom.js';
import { dataStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';

// エンチャントカテゴリ
const ENCHANT_CATEGORIES = {
  weapon: {
    name: '武器',
    enchants: [
      { id: 'sharpness', name: 'ダメージ増加', maxLevel: 5 },
      { id: 'smite', name: 'アンデッド特効', maxLevel: 5 },
      { id: 'bane_of_arthropods', name: '虫特効', maxLevel: 5 },
      { id: 'knockback', name: 'ノックバック', maxLevel: 2 },
      { id: 'fire_aspect', name: '火属性', maxLevel: 2 },
      { id: 'looting', name: 'ドロップ増加', maxLevel: 3 },
      { id: 'sweeping_edge', name: '範囲ダメージ増加', maxLevel: 3 },
    ]
  },
  tool: {
    name: 'ツール',
    enchants: [
      { id: 'efficiency', name: '効率強化', maxLevel: 5 },
      { id: 'silk_touch', name: 'シルクタッチ', maxLevel: 1 },
      { id: 'fortune', name: '幸運', maxLevel: 3 },
    ]
  },
  armor: {
    name: '防具',
    enchants: [
      { id: 'protection', name: 'ダメージ軽減', maxLevel: 4 },
      { id: 'fire_protection', name: '火炎耐性', maxLevel: 4 },
      { id: 'blast_protection', name: '爆発耐性', maxLevel: 4 },
      { id: 'projectile_protection', name: '飛び道具耐性', maxLevel: 4 },
      { id: 'thorns', name: 'トゲ', maxLevel: 3 },
    ]
  },
  helmet: {
    name: 'ヘルメット',
    enchants: [
      { id: 'respiration', name: '水中呼吸', maxLevel: 3 },
      { id: 'aqua_affinity', name: '水中採掘', maxLevel: 1 },
    ]
  },
  boots: {
    name: 'ブーツ',
    enchants: [
      { id: 'feather_falling', name: '落下耐性', maxLevel: 4 },
      { id: 'depth_strider', name: '水中歩行', maxLevel: 3 },
      { id: 'frost_walker', name: '氷渡り', maxLevel: 2 },
      { id: 'soul_speed', name: 'ソウルスピード', maxLevel: 3 },
      { id: 'swift_sneak', name: 'スニーク速度上昇', maxLevel: 3 },
    ]
  },
  bow: {
    name: '弓',
    enchants: [
      { id: 'power', name: '射撃ダメージ増加', maxLevel: 5 },
      { id: 'punch', name: 'パンチ', maxLevel: 2 },
      { id: 'flame', name: 'フレイム', maxLevel: 1 },
      { id: 'infinity', name: '無限', maxLevel: 1 },
    ]
  },
  crossbow: {
    name: 'クロスボウ',
    enchants: [
      { id: 'multishot', name: '拡散', maxLevel: 1 },
      { id: 'piercing', name: '貫通', maxLevel: 4 },
      { id: 'quick_charge', name: '高速装填', maxLevel: 3 },
    ]
  },
  trident: {
    name: 'トライデント',
    enchants: [
      { id: 'loyalty', name: '忠誠', maxLevel: 3 },
      { id: 'impaling', name: '水生特効', maxLevel: 5 },
      { id: 'riptide', name: '激流', maxLevel: 3 },
      { id: 'channeling', name: '召雷', maxLevel: 1 },
    ]
  },
  universal: {
    name: '汎用',
    enchants: [
      { id: 'unbreaking', name: '耐久力', maxLevel: 3 },
      { id: 'mending', name: '修繕', maxLevel: 1 },
      { id: 'vanishing_curse', name: '消滅の呪い', maxLevel: 1 },
      { id: 'binding_curse', name: '束縛の呪い', maxLevel: 1 },
    ]
  },
};

// 人気アイテムプリセット
const ITEM_PRESETS = [
  { id: 'diamond_sword', name: 'ダイヤの剣' },
  { id: 'netherite_sword', name: 'ネザライトの剣' },
  { id: 'diamond_pickaxe', name: 'ダイヤのツルハシ' },
  { id: 'netherite_pickaxe', name: 'ネザライトのツルハシ' },
  { id: 'diamond_helmet', name: 'ダイヤのヘルメット' },
  { id: 'diamond_chestplate', name: 'ダイヤのチェストプレート' },
  { id: 'diamond_leggings', name: 'ダイヤのレギンス' },
  { id: 'diamond_boots', name: 'ダイヤのブーツ' },
  { id: 'bow', name: '弓' },
  { id: 'crossbow', name: 'クロスボウ' },
  { id: 'trident', name: 'トライデント' },
  { id: 'fishing_rod', name: '釣り竿' },
];

let selectedEnchants = [];

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const presetOptions = ITEM_PRESETS.map(p =>
    `<option value="${p.id}">${p.name}</option>`
  ).join('');

  return `
    <div class="tool-panel" id="enchant-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
      </div>

      <form class="tool-form" id="enchant-form">
        <!-- アイテム選択 -->
        <div class="form-row">
          <div class="form-group">
            <label for="enchant-item">アイテム</label>
            <select id="enchant-item" class="mc-select">
              ${presetOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="enchant-item-custom">またはカスタムID</label>
            <input type="text" id="enchant-item-custom" class="mc-input" placeholder="minecraft:diamond_sword">
          </div>
        </div>

        <!-- エンチャントカテゴリ -->
        <div class="form-group">
          <label>エンチャントを追加</label>
          <div class="enchant-categories" id="enchant-categories">
            ${Object.entries(ENCHANT_CATEGORIES).map(([catId, cat]) => `
              <div class="enchant-category">
                <h4 class="category-header" data-category="${catId}">${cat.name}</h4>
                <div class="category-enchants" id="cat-${catId}" style="display:none">
                  ${cat.enchants.map(e => `
                    <button type="button" class="enchant-add-btn" data-enchant="${e.id}" data-max="${e.maxLevel}">
                      ${e.name}
                    </button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 選択されたエンチャント -->
        <div class="form-group">
          <label>選択中のエンチャント</label>
          <div class="selected-enchants" id="selected-enchants">
            <p class="empty-message">エンチャントを追加してください</p>
          </div>
        </div>

        <!-- オプション -->
        <div class="form-row">
          <div class="form-group">
            <label class="option-label">
              <input type="checkbox" id="enchant-unbreakable">
              耐久無限
            </label>
          </div>
          <div class="form-group">
            <label class="option-label">
              <input type="checkbox" id="enchant-hide-flags">
              エンチャント非表示
            </label>
          </div>
        </div>

        <!-- プリセット -->
        <div class="form-group">
          <label>クイックプリセット</label>
          <div class="preset-buttons">
            <button type="button" class="mc-btn preset-btn" data-preset="max-sword">最強剣</button>
            <button type="button" class="mc-btn preset-btn" data-preset="max-pickaxe">最強ツルハシ</button>
            <button type="button" class="mc-btn preset-btn" data-preset="max-armor">最強防具</button>
            <button type="button" class="mc-btn preset-btn" data-preset="clear">クリア</button>
          </div>
        </div>
      </form>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  selectedEnchants = [];

  // カテゴリ折りたたみ
  delegate(container, 'click', '.category-header', (e, target) => {
    const catId = target.dataset.category;
    const enchantsList = $(`#cat-${catId}`, container);
    if (enchantsList) {
      const isHidden = enchantsList.style.display === 'none';
      enchantsList.style.display = isHidden ? 'flex' : 'none';
      target.classList.toggle('open', isHidden);
    }
  });

  // エンチャント追加
  delegate(container, 'click', '.enchant-add-btn', (e, target) => {
    const enchantId = target.dataset.enchant;
    const maxLevel = parseInt(target.dataset.max) || 5;

    // 既に追加されていないかチェック
    if (!selectedEnchants.find(e => e.id === enchantId)) {
      selectedEnchants.push({ id: enchantId, level: maxLevel });
      renderSelectedEnchants(container);
      updateCommand();
    }
  });

  // エンチャント削除
  delegate(container, 'click', '.enchant-remove', (e, target) => {
    const enchantId = target.dataset.enchant;
    selectedEnchants = selectedEnchants.filter(e => e.id !== enchantId);
    renderSelectedEnchants(container);
    updateCommand();
  });

  // レベル変更
  delegate(container, 'input', '.enchant-level', (e, target) => {
    const enchantId = target.dataset.enchant;
    const level = parseInt(target.value) || 1;
    const enchant = selectedEnchants.find(e => e.id === enchantId);
    if (enchant) {
      enchant.level = level;
      updateCommand();
    }
  });

  // プリセット
  delegate(container, 'click', '.preset-btn', (e, target) => {
    applyPreset(target.dataset.preset, container);
  });

  // フォーム変更
  $('#enchant-item', container)?.addEventListener('change', updateCommand);
  $('#enchant-item-custom', container)?.addEventListener('input', debounce(updateCommand, 150));
  $('#enchant-unbreakable', container)?.addEventListener('change', updateCommand);
  $('#enchant-hide-flags', container)?.addEventListener('change', updateCommand);

  updateCommand();
}

/**
 * 選択されたエンチャントをレンダリング
 */
function renderSelectedEnchants(container) {
  const list = $('#selected-enchants', container);
  if (!list) return;

  if (selectedEnchants.length === 0) {
    list.innerHTML = '<p class="empty-message">エンチャントを追加してください</p>';
    return;
  }

  list.innerHTML = selectedEnchants.map(e => {
    const info = findEnchantInfo(e.id);
    return `
      <div class="selected-enchant">
        <span class="enchant-name">${info?.name || e.id}</span>
        <input type="number" class="enchant-level mc-input" data-enchant="${e.id}"
               value="${e.level}" min="1" max="255">
        <button type="button" class="enchant-remove" data-enchant="${e.id}">×</button>
      </div>
    `;
  }).join('');
}

/**
 * エンチャント情報を検索
 */
function findEnchantInfo(id) {
  for (const cat of Object.values(ENCHANT_CATEGORIES)) {
    const found = cat.enchants.find(e => e.id === id);
    if (found) return found;
  }
  return null;
}

/**
 * プリセットを適用
 */
function applyPreset(preset, container) {
  switch (preset) {
    case 'max-sword':
      $('#enchant-item', container).value = 'netherite_sword';
      selectedEnchants = [
        { id: 'sharpness', level: 5 },
        { id: 'fire_aspect', level: 2 },
        { id: 'knockback', level: 2 },
        { id: 'looting', level: 3 },
        { id: 'sweeping_edge', level: 3 },
        { id: 'unbreaking', level: 3 },
        { id: 'mending', level: 1 },
      ];
      break;
    case 'max-pickaxe':
      $('#enchant-item', container).value = 'netherite_pickaxe';
      selectedEnchants = [
        { id: 'efficiency', level: 5 },
        { id: 'fortune', level: 3 },
        { id: 'unbreaking', level: 3 },
        { id: 'mending', level: 1 },
      ];
      break;
    case 'max-armor':
      $('#enchant-item', container).value = 'diamond_chestplate';
      selectedEnchants = [
        { id: 'protection', level: 4 },
        { id: 'unbreaking', level: 3 },
        { id: 'mending', level: 1 },
        { id: 'thorns', level: 3 },
      ];
      break;
    case 'clear':
      selectedEnchants = [];
      break;
  }
  renderSelectedEnchants(container);
  updateCommand();
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const itemSelect = $('#enchant-item')?.value;
  const itemCustom = $('#enchant-item-custom')?.value;
  const item = itemCustom || `minecraft:${itemSelect}`;
  const unbreakable = $('#enchant-unbreakable')?.checked;
  const hideFlags = $('#enchant-hide-flags')?.checked;

  const components = [];

  // エンチャント
  if (selectedEnchants.length > 0) {
    const levels = selectedEnchants.map(e => `"minecraft:${e.id}":${e.level}`).join(',');
    components.push(`enchantments={levels:{${levels}}}`);
  }

  // 耐久無限
  if (unbreakable) {
    components.push('unbreakable={}');
  }

  // エンチャント非表示
  if (hideFlags) {
    components.push('enchantment_glint_override=false');
  }

  let command = `/give @p ${item}`;
  if (components.length > 0) {
    command += `[${components.join(',')}]`;
  }

  setOutput(command, 'enchant', { item, enchants: selectedEnchants, unbreakable, hideFlags });
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .enchant-categories {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
  }

  .enchant-category {
    border: 1px solid var(--mc-border-dark);
    background-color: var(--mc-bg-surface);
  }

  .category-header {
    margin: 0;
    padding: var(--mc-space-sm);
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
  }

  .category-header::before {
    content: '▶';
    font-size: 0.7rem;
    transition: transform 0.2s;
  }

  .category-header.open::before {
    transform: rotate(90deg);
  }

  .category-enchants {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
  }

  .enchant-add-btn {
    padding: var(--mc-space-xs) var(--mc-space-sm);
    font-size: 0.75rem;
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .enchant-add-btn:hover {
    background-color: var(--mc-color-grass-main);
    color: white;
  }

  .selected-enchants {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    min-height: 60px;
  }

  .selected-enchant {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-xs);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .selected-enchant .enchant-name {
    flex: 1;
    font-size: 0.85rem;
  }

  .selected-enchant .enchant-level {
    width: 60px;
    padding: var(--mc-space-xs);
  }

  .selected-enchant .enchant-remove {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.25rem;
  }

  .preset-buttons {
    display: flex;
    gap: var(--mc-space-sm);
    flex-wrap: wrap;
  }

  .preset-btn {
    font-size: 0.75rem;
  }
`;
document.head.appendChild(style);

export default { render, init };
