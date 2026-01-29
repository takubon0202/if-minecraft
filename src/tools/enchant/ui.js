/**
 * Enchant Tool - UI (minecraft-blog.net参考)
 * 全42種エンチャント、属性追加、プレビュー機能
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';

// 全42種エンチャント（カテゴリ別）
const ENCHANT_CATEGORIES = {
  weapon: {
    name: '⚔️ 武器（剣）',
    icon: '⚔️',
    enchants: [
      { id: 'sharpness', name: 'ダメージ増加', en: 'Sharpness', maxLevel: 5, desc: '近接攻撃ダメージ増加' },
      { id: 'smite', name: 'アンデッド特効', en: 'Smite', maxLevel: 5, desc: 'アンデッド系に追加ダメージ' },
      { id: 'bane_of_arthropods', name: '虫特効', en: 'Bane of Arthropods', maxLevel: 5, desc: '虫系に追加ダメージ' },
      { id: 'knockback', name: 'ノックバック', en: 'Knockback', maxLevel: 2, desc: '攻撃時のノックバック増加' },
      { id: 'fire_aspect', name: '火属性', en: 'Fire Aspect', maxLevel: 2, desc: '攻撃対象に発火' },
      { id: 'looting', name: 'ドロップ増加', en: 'Looting', maxLevel: 3, desc: 'Mobのドロップ増加' },
      { id: 'sweeping_edge', name: '範囲ダメージ増加', en: 'Sweeping Edge', maxLevel: 3, desc: '範囲攻撃ダメージ増加' },
      { id: 'density', name: '密度', en: 'Density', maxLevel: 5, desc: 'メイス専用、落下ダメージ増加' },
      { id: 'breach', name: '貫通', en: 'Breach', maxLevel: 4, desc: 'メイス専用、防具無視ダメージ' },
      { id: 'wind_burst', name: '風爆発', en: 'Wind Burst', maxLevel: 3, desc: 'メイス専用、着地時に風爆発' },
    ]
  },
  tool: {
    name: '⛏️ ツール',
    icon: '⛏️',
    enchants: [
      { id: 'efficiency', name: '効率強化', en: 'Efficiency', maxLevel: 5, desc: '採掘速度増加' },
      { id: 'silk_touch', name: 'シルクタッチ', en: 'Silk Touch', maxLevel: 1, desc: 'ブロックをそのまま回収' },
      { id: 'fortune', name: '幸運', en: 'Fortune', maxLevel: 3, desc: 'ドロップ数増加' },
    ]
  },
  armor: {
    name: '🛡️ 防具（共通）',
    icon: '🛡️',
    enchants: [
      { id: 'protection', name: 'ダメージ軽減', en: 'Protection', maxLevel: 4, desc: '全ダメージ軽減' },
      { id: 'fire_protection', name: '火炎耐性', en: 'Fire Protection', maxLevel: 4, desc: '火炎ダメージ軽減' },
      { id: 'blast_protection', name: '爆発耐性', en: 'Blast Protection', maxLevel: 4, desc: '爆発ダメージ軽減' },
      { id: 'projectile_protection', name: '飛び道具耐性', en: 'Projectile Protection', maxLevel: 4, desc: '飛び道具ダメージ軽減' },
      { id: 'thorns', name: 'トゲ', en: 'Thorns', maxLevel: 3, desc: '反射ダメージ' },
    ]
  },
  helmet: {
    name: '⛑️ ヘルメット',
    icon: '⛑️',
    enchants: [
      { id: 'respiration', name: '水中呼吸', en: 'Respiration', maxLevel: 3, desc: '水中での呼吸時間延長' },
      { id: 'aqua_affinity', name: '水中採掘', en: 'Aqua Affinity', maxLevel: 1, desc: '水中採掘速度アップ' },
    ]
  },
  chestplate: {
    name: '🦺 チェストプレート',
    icon: '🦺',
    enchants: []
  },
  leggings: {
    name: '👖 レギンス',
    icon: '👖',
    enchants: [
      { id: 'swift_sneak', name: 'スニーク速度上昇', en: 'Swift Sneak', maxLevel: 3, desc: 'スニーク時の移動速度アップ' },
    ]
  },
  boots: {
    name: '👟 ブーツ',
    icon: '👟',
    enchants: [
      { id: 'feather_falling', name: '落下耐性', en: 'Feather Falling', maxLevel: 4, desc: '落下ダメージ軽減' },
      { id: 'depth_strider', name: '水中歩行', en: 'Depth Strider', maxLevel: 3, desc: '水中移動速度アップ' },
      { id: 'frost_walker', name: '氷渡り', en: 'Frost Walker', maxLevel: 2, desc: '水上を凍らせて歩く' },
      { id: 'soul_speed', name: 'ソウルスピード', en: 'Soul Speed', maxLevel: 3, desc: 'ソウルサンド上の速度アップ' },
    ]
  },
  bow: {
    name: '🏹 弓',
    icon: '🏹',
    enchants: [
      { id: 'power', name: '射撃ダメージ増加', en: 'Power', maxLevel: 5, desc: '矢のダメージ増加' },
      { id: 'punch', name: 'パンチ', en: 'Punch', maxLevel: 2, desc: '矢のノックバック増加' },
      { id: 'flame', name: 'フレイム', en: 'Flame', maxLevel: 1, desc: '矢に火属性付与' },
      { id: 'infinity', name: '無限', en: 'Infinity', maxLevel: 1, desc: '矢を消費しない' },
    ]
  },
  crossbow: {
    name: '🎯 クロスボウ',
    icon: '🎯',
    enchants: [
      { id: 'multishot', name: '拡散', en: 'Multishot', maxLevel: 1, desc: '3本同時発射' },
      { id: 'piercing', name: '貫通', en: 'Piercing', maxLevel: 4, desc: '敵を貫通' },
      { id: 'quick_charge', name: '高速装填', en: 'Quick Charge', maxLevel: 3, desc: 'リロード速度アップ' },
    ]
  },
  trident: {
    name: '🔱 トライデント',
    icon: '🔱',
    enchants: [
      { id: 'loyalty', name: '忠誠', en: 'Loyalty', maxLevel: 3, desc: '投げると戻ってくる' },
      { id: 'impaling', name: '水生特効', en: 'Impaling', maxLevel: 5, desc: '水中Mobに追加ダメージ' },
      { id: 'riptide', name: '激流', en: 'Riptide', maxLevel: 3, desc: '雨/水中で突進' },
      { id: 'channeling', name: '召雷', en: 'Channeling', maxLevel: 1, desc: '雷雨時に雷を落とす' },
    ]
  },
  fishing: {
    name: '🎣 釣り竿',
    icon: '🎣',
    enchants: [
      { id: 'luck_of_the_sea', name: '宝釣り', en: 'Luck of the Sea', maxLevel: 3, desc: 'レアアイテム確率アップ' },
      { id: 'lure', name: '入れ食い', en: 'Lure', maxLevel: 3, desc: '釣れるまでの時間短縮' },
    ]
  },
  universal: {
    name: '🔧 汎用',
    icon: '🔧',
    enchants: [
      { id: 'unbreaking', name: '耐久力', en: 'Unbreaking', maxLevel: 3, desc: '耐久値消費軽減' },
      { id: 'mending', name: '修繕', en: 'Mending', maxLevel: 1, desc: '経験値で耐久回復' },
    ]
  },
  curse: {
    name: '💀 呪い',
    icon: '💀',
    enchants: [
      { id: 'vanishing_curse', name: '消滅の呪い', en: 'Curse of Vanishing', maxLevel: 1, desc: '死亡時に消滅' },
      { id: 'binding_curse', name: '束縛の呪い', en: 'Curse of Binding', maxLevel: 1, desc: '外せなくなる' },
    ]
  },
};

// アイテムカテゴリとプリセット
const ITEM_CATEGORIES = {
  sword: {
    name: '剣',
    items: [
      { id: 'wooden_sword', name: '木の剣' },
      { id: 'stone_sword', name: '石の剣' },
      { id: 'iron_sword', name: '鉄の剣' },
      { id: 'golden_sword', name: '金の剣' },
      { id: 'diamond_sword', name: 'ダイヤの剣' },
      { id: 'netherite_sword', name: 'ネザライトの剣' },
    ]
  },
  pickaxe: {
    name: 'ツルハシ',
    items: [
      { id: 'wooden_pickaxe', name: '木のツルハシ' },
      { id: 'stone_pickaxe', name: '石のツルハシ' },
      { id: 'iron_pickaxe', name: '鉄のツルハシ' },
      { id: 'golden_pickaxe', name: '金のツルハシ' },
      { id: 'diamond_pickaxe', name: 'ダイヤのツルハシ' },
      { id: 'netherite_pickaxe', name: 'ネザライトのツルハシ' },
    ]
  },
  axe: {
    name: '斧',
    items: [
      { id: 'wooden_axe', name: '木の斧' },
      { id: 'stone_axe', name: '石の斧' },
      { id: 'iron_axe', name: '鉄の斧' },
      { id: 'golden_axe', name: '金の斧' },
      { id: 'diamond_axe', name: 'ダイヤの斧' },
      { id: 'netherite_axe', name: 'ネザライトの斧' },
    ]
  },
  shovel: {
    name: 'シャベル',
    items: [
      { id: 'wooden_shovel', name: '木のシャベル' },
      { id: 'stone_shovel', name: '石のシャベル' },
      { id: 'iron_shovel', name: '鉄のシャベル' },
      { id: 'golden_shovel', name: '金のシャベル' },
      { id: 'diamond_shovel', name: 'ダイヤのシャベル' },
      { id: 'netherite_shovel', name: 'ネザライトのシャベル' },
    ]
  },
  hoe: {
    name: 'クワ',
    items: [
      { id: 'wooden_hoe', name: '木のクワ' },
      { id: 'stone_hoe', name: '石のクワ' },
      { id: 'iron_hoe', name: '鉄のクワ' },
      { id: 'golden_hoe', name: '金のクワ' },
      { id: 'diamond_hoe', name: 'ダイヤのクワ' },
      { id: 'netherite_hoe', name: 'ネザライトのクワ' },
    ]
  },
  armor_helmet: {
    name: 'ヘルメット',
    items: [
      { id: 'leather_helmet', name: '革のヘルメット' },
      { id: 'chainmail_helmet', name: 'チェーンのヘルメット' },
      { id: 'iron_helmet', name: '鉄のヘルメット' },
      { id: 'golden_helmet', name: '金のヘルメット' },
      { id: 'diamond_helmet', name: 'ダイヤのヘルメット' },
      { id: 'netherite_helmet', name: 'ネザライトのヘルメット' },
      { id: 'turtle_helmet', name: 'カメの甲羅' },
    ]
  },
  armor_chestplate: {
    name: 'チェストプレート',
    items: [
      { id: 'leather_chestplate', name: '革のチェストプレート' },
      { id: 'chainmail_chestplate', name: 'チェーンのチェストプレート' },
      { id: 'iron_chestplate', name: '鉄のチェストプレート' },
      { id: 'golden_chestplate', name: '金のチェストプレート' },
      { id: 'diamond_chestplate', name: 'ダイヤのチェストプレート' },
      { id: 'netherite_chestplate', name: 'ネザライトのチェストプレート' },
      { id: 'elytra', name: 'エリトラ' },
    ]
  },
  armor_leggings: {
    name: 'レギンス',
    items: [
      { id: 'leather_leggings', name: '革のレギンス' },
      { id: 'chainmail_leggings', name: 'チェーンのレギンス' },
      { id: 'iron_leggings', name: '鉄のレギンス' },
      { id: 'golden_leggings', name: '金のレギンス' },
      { id: 'diamond_leggings', name: 'ダイヤのレギンス' },
      { id: 'netherite_leggings', name: 'ネザライトのレギンス' },
    ]
  },
  armor_boots: {
    name: 'ブーツ',
    items: [
      { id: 'leather_boots', name: '革のブーツ' },
      { id: 'chainmail_boots', name: 'チェーンのブーツ' },
      { id: 'iron_boots', name: '鉄のブーツ' },
      { id: 'golden_boots', name: '金のブーツ' },
      { id: 'diamond_boots', name: 'ダイヤのブーツ' },
      { id: 'netherite_boots', name: 'ネザライトのブーツ' },
    ]
  },
  ranged: {
    name: '遠距離武器',
    items: [
      { id: 'bow', name: '弓' },
      { id: 'crossbow', name: 'クロスボウ' },
      { id: 'trident', name: 'トライデント' },
      { id: 'mace', name: 'メイス' },
    ]
  },
  other: {
    name: 'その他',
    items: [
      { id: 'fishing_rod', name: '釣り竿' },
      { id: 'shield', name: '盾' },
      { id: 'shears', name: 'ハサミ' },
      { id: 'flint_and_steel', name: '火打石' },
      { id: 'carrot_on_a_stick', name: 'ニンジン付きの棒' },
      { id: 'warped_fungus_on_a_stick', name: '歪んだキノコ付きの棒' },
      { id: 'brush', name: 'ブラシ' },
    ]
  },
};

// 属性
const ATTRIBUTES = [
  { id: 'generic.max_health', name: '最大体力', icon: '❤️', default: 20 },
  { id: 'generic.movement_speed', name: '移動速度', icon: '💨', default: 0.1 },
  { id: 'generic.attack_damage', name: '攻撃力', icon: '⚔️', default: 1 },
  { id: 'generic.attack_speed', name: '攻撃速度', icon: '⚡', default: 4 },
  { id: 'generic.armor', name: '防御力', icon: '🛡️', default: 0 },
  { id: 'generic.armor_toughness', name: '防具強度', icon: '💎', default: 0 },
  { id: 'generic.knockback_resistance', name: 'ノックバック耐性', icon: '🦶', default: 0 },
  { id: 'generic.luck', name: '幸運', icon: '🍀', default: 0 },
];

// プリセット
const PRESETS = [
  {
    id: 'max-sword',
    name: '最強剣',
    item: 'netherite_sword',
    enchants: [
      { id: 'sharpness', level: 255 },
      { id: 'fire_aspect', level: 2 },
      { id: 'knockback', level: 2 },
      { id: 'looting', level: 3 },
      { id: 'sweeping_edge', level: 3 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'max-pickaxe',
    name: '最強ツルハシ',
    item: 'netherite_pickaxe',
    enchants: [
      { id: 'efficiency', level: 255 },
      { id: 'fortune', level: 3 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'silk-pickaxe',
    name: 'シルクツルハシ',
    item: 'netherite_pickaxe',
    enchants: [
      { id: 'efficiency', level: 5 },
      { id: 'silk_touch', level: 1 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'max-armor',
    name: '最強防具セット',
    item: 'netherite_chestplate',
    enchants: [
      { id: 'protection', level: 4 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
      { id: 'thorns', level: 3 },
    ]
  },
  {
    id: 'max-bow',
    name: '最強弓',
    item: 'bow',
    enchants: [
      { id: 'power', level: 255 },
      { id: 'punch', level: 2 },
      { id: 'flame', level: 1 },
      { id: 'infinity', level: 1 },
      { id: 'unbreaking', level: 3 },
    ]
  },
  {
    id: 'god-sword',
    name: 'ゴッド剣',
    item: 'netherite_sword',
    enchants: [
      { id: 'sharpness', level: 1000 },
      { id: 'fire_aspect', level: 10 },
      { id: 'knockback', level: 100 },
      { id: 'looting', level: 10 },
      { id: 'unbreaking', level: 10 },
    ]
  },
];

let selectedEnchants = [];
let selectedAttributes = [];
let searchQuery = '';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel enchant-tool" id="enchant-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
        <span class="version-badge">1.21.5+</span>
      </div>

      <form class="tool-form" id="enchant-form">
        <!-- アイテム選択 -->
        <div class="form-group">
          <label>アイテムを選択</label>
          <div class="item-selector">
            <select id="item-category" class="mc-select">
              ${Object.entries(ITEM_CATEGORIES).map(([id, cat]) =>
                `<option value="${id}">${cat.name}</option>`
              ).join('')}
            </select>
            <select id="item-select" class="mc-select">
              ${ITEM_CATEGORIES.sword.items.map(item =>
                `<option value="${item.id}">${item.name}</option>`
              ).join('')}
            </select>
          </div>
          <div class="custom-item-row">
            <label>
              <input type="checkbox" id="use-custom-item"> カスタムID
            </label>
            <input type="text" id="custom-item-id" class="mc-input" placeholder="minecraft:diamond_sword" disabled>
          </div>
        </div>

        <!-- エンチャント検索 -->
        <div class="form-group">
          <label>エンチャントを追加</label>
          <input type="text" id="enchant-search" class="mc-input" placeholder="🔍 エンチャント名で検索...">
        </div>

        <!-- エンチャントカテゴリ（アコーディオン） -->
        <div class="form-group">
          <div class="enchant-categories" id="enchant-categories">
            ${Object.entries(ENCHANT_CATEGORIES).map(([catId, cat]) => `
              <div class="enchant-category" data-category="${catId}">
                <button type="button" class="category-header">
                  <span class="cat-icon">${cat.icon}</span>
                  <span class="cat-name">${cat.name}</span>
                  <span class="cat-count">(${cat.enchants.length})</span>
                  <span class="cat-arrow">▶</span>
                </button>
                <div class="category-enchants" style="display: none;">
                  ${cat.enchants.map(e => `
                    <div class="enchant-item" data-enchant="${e.id}" data-max="${e.maxLevel}" title="${e.desc}">
                      <span class="enchant-name">${e.name}</span>
                      <span class="enchant-en">${e.en}</span>
                      <span class="enchant-max">Max: ${e.maxLevel}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 選択されたエンチャント -->
        <div class="form-group">
          <label>選択中のエンチャント <span id="enchant-count">(0)</span></label>
          <div class="selected-enchants" id="selected-enchants">
            <p class="empty-message">上のカテゴリからエンチャントをクリックして追加</p>
          </div>
        </div>

        <!-- 属性 -->
        <div class="form-group">
          <label>
            <input type="checkbox" id="use-attributes"> 属性を追加
          </label>
          <div class="attributes-section" id="attributes-section" style="display: none;">
            ${ATTRIBUTES.map(attr => `
              <div class="attribute-row">
                <span class="attr-icon">${attr.icon}</span>
                <span class="attr-name">${attr.name}</span>
                <input type="checkbox" class="attr-check" data-attr="${attr.id}">
                <input type="number" class="attr-value mc-input" data-attr="${attr.id}"
                       value="${attr.default}" step="0.1" disabled>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- オプション -->
        <div class="form-group options-row">
          <label class="option-item">
            <input type="checkbox" id="opt-unbreakable">
            <span>耐久無限</span>
          </label>
          <label class="option-item">
            <input type="checkbox" id="opt-hide-enchants">
            <span>エンチャント非表示</span>
          </label>
          <label class="option-item">
            <input type="checkbox" id="opt-hide-unbreakable">
            <span>耐久無限非表示</span>
          </label>
        </div>

        <!-- カスタム名・説明 -->
        <div class="form-row">
          <div class="form-group">
            <label for="custom-name">カスタム名</label>
            <input type="text" id="custom-name" class="mc-input" placeholder="最強の剣">
          </div>
          <div class="form-group">
            <label for="item-count">個数</label>
            <input type="number" id="item-count" class="mc-input" value="1" min="1" max="64">
          </div>
        </div>

        <!-- プリセット -->
        <div class="form-group">
          <label>プリセット</label>
          <div class="preset-grid">
            ${PRESETS.map(p => `
              <button type="button" class="preset-btn" data-preset="${p.id}" title="${p.enchants.map(e => findEnchantInfo(e.id)?.name).join(', ')}">
                ${p.name}
              </button>
            `).join('')}
            <button type="button" class="preset-btn preset-clear" data-preset="clear">クリア</button>
          </div>
        </div>
      </form>

      <!-- プレビュー -->
      <div class="enchant-preview-section">
        <h3>プレビュー</h3>
        <div class="enchant-preview">
          <div class="preview-item" id="preview-item">
            <div class="item-icon" id="item-icon">⚔️</div>
            <div class="item-name" id="item-name">ダイヤの剣</div>
          </div>
          <div class="preview-enchants" id="preview-enchants">
            <p class="text-muted">エンチャントなし</p>
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
  selectedEnchants = [];
  selectedAttributes = [];
  searchQuery = '';

  // アイテムカテゴリ変更
  $('#item-category', container)?.addEventListener('change', (e) => {
    const catId = e.target.value;
    const cat = ITEM_CATEGORIES[catId];
    const itemSelect = $('#item-select', container);
    if (itemSelect && cat) {
      itemSelect.innerHTML = cat.items.map(item =>
        `<option value="${item.id}">${item.name}</option>`
      ).join('');
      updatePreview(container);
      updateCommand(container);
    }
  });

  $('#item-select', container)?.addEventListener('change', () => {
    updatePreview(container);
    updateCommand(container);
  });

  // カスタムアイテム
  $('#use-custom-item', container)?.addEventListener('change', (e) => {
    const customInput = $('#custom-item-id', container);
    const itemSelect = $('#item-select', container);
    const catSelect = $('#item-category', container);
    if (customInput) {
      customInput.disabled = !e.target.checked;
      if (itemSelect) itemSelect.disabled = e.target.checked;
      if (catSelect) catSelect.disabled = e.target.checked;
    }
    updateCommand(container);
  });

  $('#custom-item-id', container)?.addEventListener('input', debounce(() => {
    updateCommand(container);
  }, 150));

  // カテゴリ折りたたみ
  delegate(container, 'click', '.category-header', (e, target) => {
    const category = target.closest('.enchant-category');
    const enchantsList = category?.querySelector('.category-enchants');
    const arrow = target.querySelector('.cat-arrow');
    if (enchantsList) {
      const isHidden = enchantsList.style.display === 'none';
      enchantsList.style.display = isHidden ? 'grid' : 'none';
      if (arrow) arrow.textContent = isHidden ? '▼' : '▶';
    }
  });

  // エンチャント検索
  $('#enchant-search', container)?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value.toLowerCase();
    filterEnchants(container);
  }, 150));

  // エンチャント追加
  delegate(container, 'click', '.enchant-item', (e, target) => {
    const enchantId = target.dataset.enchant;
    const maxLevel = parseInt(target.dataset.max) || 5;

    if (!selectedEnchants.find(e => e.id === enchantId)) {
      selectedEnchants.push({ id: enchantId, level: maxLevel });
      target.classList.add('selected');
      renderSelectedEnchants(container);
      updateCommand(container);
    }
  });

  // エンチャント削除
  delegate(container, 'click', '.enchant-remove', (e, target) => {
    const enchantId = target.dataset.enchant;
    selectedEnchants = selectedEnchants.filter(e => e.id !== enchantId);
    $(`.enchant-item[data-enchant="${enchantId}"]`, container)?.classList.remove('selected');
    renderSelectedEnchants(container);
    updateCommand(container);
  });

  // レベル変更
  delegate(container, 'input', '.enchant-level', debounce((e, target) => {
    const enchantId = target.dataset.enchant;
    const level = parseInt(target.value) || 1;
    const enchant = selectedEnchants.find(e => e.id === enchantId);
    if (enchant) {
      enchant.level = level;
      updateCommand(container);
    }
  }, 100));

  // 属性トグル
  $('#use-attributes', container)?.addEventListener('change', (e) => {
    $('#attributes-section', container).style.display = e.target.checked ? 'block' : 'none';
    updateCommand(container);
  });

  // 属性チェック
  delegate(container, 'change', '.attr-check', (e, target) => {
    const attrId = target.dataset.attr;
    const valueInput = $(`.attr-value[data-attr="${attrId}"]`, container);
    if (valueInput) valueInput.disabled = !target.checked;
    updateCommand(container);
  });

  delegate(container, 'input', '.attr-value', debounce(() => {
    updateCommand(container);
  }, 100));

  // プリセット
  delegate(container, 'click', '.preset-btn', (e, target) => {
    applyPreset(target.dataset.preset, container);
  });

  // オプション変更
  ['#opt-unbreakable', '#opt-hide-enchants', '#opt-hide-unbreakable', '#custom-name', '#item-count'].forEach(sel => {
    $(sel, container)?.addEventListener('change', () => updateCommand(container));
    $(sel, container)?.addEventListener('input', debounce(() => updateCommand(container), 150));
  });

  updatePreview(container);
  updateCommand(container);
}

/**
 * エンチャントをフィルタリング
 */
function filterEnchants(container) {
  $$('.enchant-item', container).forEach(item => {
    const name = item.querySelector('.enchant-name')?.textContent.toLowerCase() || '';
    const en = item.querySelector('.enchant-en')?.textContent.toLowerCase() || '';
    const id = item.dataset.enchant?.toLowerCase() || '';

    const matches = !searchQuery ||
      name.includes(searchQuery) ||
      en.includes(searchQuery) ||
      id.includes(searchQuery);

    item.style.display = matches ? '' : 'none';
  });

  // カテゴリが空なら非表示
  $$('.enchant-category', container).forEach(cat => {
    const visibleItems = cat.querySelectorAll('.enchant-item:not([style*="display: none"])');
    const content = cat.querySelector('.category-enchants');
    if (content && searchQuery) {
      content.style.display = visibleItems.length > 0 ? 'grid' : 'none';
      cat.style.display = visibleItems.length > 0 ? '' : 'none';
    }
  });
}

/**
 * 選択されたエンチャントをレンダリング
 */
function renderSelectedEnchants(container) {
  const list = $('#selected-enchants', container);
  const countEl = $('#enchant-count', container);
  if (!list) return;

  if (countEl) {
    countEl.textContent = `(${selectedEnchants.length})`;
  }

  if (selectedEnchants.length === 0) {
    list.innerHTML = '<p class="empty-message">上のカテゴリからエンチャントをクリックして追加</p>';
    updatePreview(container);
    return;
  }

  list.innerHTML = selectedEnchants.map(e => {
    const info = findEnchantInfo(e.id);
    const isCurse = e.id.includes('curse');
    return `
      <div class="selected-enchant ${isCurse ? 'curse' : ''}">
        <span class="enchant-label">${info?.name || e.id}</span>
        <input type="number" class="enchant-level mc-input" data-enchant="${e.id}"
               value="${e.level}" min="1" max="32767">
        <button type="button" class="enchant-remove" data-enchant="${e.id}">×</button>
      </div>
    `;
  }).join('');

  updatePreview(container);
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
 * プレビューを更新
 */
function updatePreview(container) {
  const itemNameEl = $('#item-name', container);
  const itemIconEl = $('#item-icon', container);
  const previewEnchantsEl = $('#preview-enchants', container);

  const useCustom = $('#use-custom-item', container)?.checked;
  const customId = $('#custom-item-id', container)?.value;
  const catId = $('#item-category', container)?.value;
  const itemId = $('#item-select', container)?.value;

  // アイテム名
  if (useCustom && customId) {
    if (itemNameEl) itemNameEl.textContent = customId;
    if (itemIconEl) itemIconEl.textContent = '📦';
  } else {
    const cat = ITEM_CATEGORIES[catId];
    const item = cat?.items.find(i => i.id === itemId);
    if (itemNameEl) itemNameEl.textContent = item?.name || 'アイテム';
    if (itemIconEl) itemIconEl.textContent = getItemIcon(itemId);
  }

  // エンチャント一覧
  if (previewEnchantsEl) {
    if (selectedEnchants.length === 0) {
      previewEnchantsEl.innerHTML = '<p class="text-muted">エンチャントなし</p>';
    } else {
      previewEnchantsEl.innerHTML = selectedEnchants.map(e => {
        const info = findEnchantInfo(e.id);
        const isCurse = e.id.includes('curse');
        return `
          <div class="preview-enchant ${isCurse ? 'curse' : ''}">
            ${info?.name || e.id} ${toRoman(e.level)}
          </div>
        `;
      }).join('');
    }
  }
}

/**
 * プリセットを適用
 */
function applyPreset(presetId, container) {
  if (presetId === 'clear') {
    selectedEnchants = [];
    $$('.enchant-item.selected', container).forEach(el => el.classList.remove('selected'));
  } else {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      // アイテム設定
      const itemId = preset.item;
      for (const [catId, cat] of Object.entries(ITEM_CATEGORIES)) {
        const item = cat.items.find(i => i.id === itemId);
        if (item) {
          $('#item-category', container).value = catId;
          const itemSelect = $('#item-select', container);
          itemSelect.innerHTML = cat.items.map(i =>
            `<option value="${i.id}">${i.name}</option>`
          ).join('');
          itemSelect.value = itemId;
          break;
        }
      }

      selectedEnchants = preset.enchants.map(e => ({ ...e }));
      $$('.enchant-item', container).forEach(el => {
        const isSelected = selectedEnchants.some(se => se.id === el.dataset.enchant);
        el.classList.toggle('selected', isSelected);
      });
    }
  }
  renderSelectedEnchants(container);
  updateCommand(container);
}

/**
 * コマンドを更新
 */
function updateCommand(container) {
  const useCustom = $('#use-custom-item', container)?.checked;
  const customId = $('#custom-item-id', container)?.value;
  const itemId = $('#item-select', container)?.value;
  const item = useCustom && customId ? customId : `minecraft:${itemId}`;

  const customName = $('#custom-name', container)?.value;
  const count = parseInt($('#item-count', container)?.value) || 1;
  const unbreakable = $('#opt-unbreakable', container)?.checked;
  const hideEnchants = $('#opt-hide-enchants', container)?.checked;
  const hideUnbreakable = $('#opt-hide-unbreakable', container)?.checked;
  const useAttributes = $('#use-attributes', container)?.checked;

  const components = [];

  // カスタム名
  if (customName) {
    components.push(`custom_name='"${customName}"'`);
  }

  // エンチャント
  if (selectedEnchants.length > 0) {
    const levels = selectedEnchants.map(e =>
      `"minecraft:${e.id}":${e.level}`
    ).join(',');
    if (hideEnchants) {
      components.push(`enchantments={levels:{${levels}},show_in_tooltip:false}`);
    } else {
      components.push(`enchantments={levels:{${levels}}}`);
    }
  }

  // 属性
  if (useAttributes) {
    const attrs = [];
    $$('.attr-check:checked', container).forEach(check => {
      const attrId = check.dataset.attr;
      const value = parseFloat($(`.attr-value[data-attr="${attrId}"]`, container)?.value) || 0;
      attrs.push(`{type:"${attrId}",amount:${value},operation:"add_value",id:"${attrId.replace('.', '_')}"}`);
    });
    if (attrs.length > 0) {
      components.push(`attribute_modifiers={modifiers:[${attrs.join(',')}]}`);
    }
  }

  // 耐久無限
  if (unbreakable) {
    if (hideUnbreakable) {
      components.push('unbreakable={show_in_tooltip:false}');
    } else {
      components.push('unbreakable={}');
    }
  }

  let command = `/give @p ${item}`;
  if (components.length > 0) {
    command += `[${components.join(',')}]`;
  }
  if (count > 1) {
    command += ` ${count}`;
  }

  setOutput(command, 'enchant', {
    item,
    enchants: selectedEnchants,
    unbreakable,
    customName,
    count
  });
}

function getItemIcon(itemId) {
  if (itemId?.includes('sword')) return '⚔️';
  if (itemId?.includes('pickaxe')) return '⛏️';
  if (itemId?.includes('axe')) return '🪓';
  if (itemId?.includes('shovel')) return '⏚';
  if (itemId?.includes('hoe')) return '🌾';
  if (itemId?.includes('helmet')) return '⛑️';
  if (itemId?.includes('chestplate')) return '🦺';
  if (itemId?.includes('leggings')) return '👖';
  if (itemId?.includes('boots')) return '👟';
  if (itemId?.includes('bow')) return '🏹';
  if (itemId?.includes('crossbow')) return '🎯';
  if (itemId?.includes('trident')) return '🔱';
  if (itemId?.includes('fishing')) return '🎣';
  if (itemId?.includes('shield')) return '🛡️';
  if (itemId?.includes('elytra')) return '🪽';
  if (itemId?.includes('mace')) return '🔨';
  return '📦';
}

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

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .enchant-tool .version-badge {
    background: var(--mc-color-grass-main);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    margin-left: auto;
  }

  .item-selector {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--mc-space-sm);
  }

  .custom-item-row {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-top: var(--mc-space-sm);
  }

  .custom-item-row input[type="text"] {
    flex: 1;
  }

  /* エンチャントカテゴリ */
  .enchant-categories {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--mc-border-dark);
  }

  .enchant-category {
    border-bottom: 1px solid var(--mc-border-dark);
  }

  .enchant-category:last-child {
    border-bottom: none;
  }

  .category-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 0.85rem;
  }

  .category-header:hover {
    background: var(--mc-color-stone-300);
  }

  .cat-icon {
    font-size: 1.1rem;
  }

  .cat-name {
    flex: 1;
  }

  .cat-count {
    color: var(--mc-text-muted);
    font-size: 0.75rem;
  }

  .cat-arrow {
    color: var(--mc-text-muted);
    font-size: 0.7rem;
  }

  .category-enchants {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 4px;
    padding: var(--mc-space-sm);
    background: var(--mc-bg-panel);
  }

  .enchant-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
    background: var(--mc-bg-surface);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
  }

  .enchant-item:hover {
    background: var(--mc-color-stone-300);
    transform: translateY(-1px);
  }

  .enchant-item.selected {
    background: rgba(92, 183, 70, 0.2);
    border-color: var(--mc-color-grass-main);
  }

  .enchant-item .enchant-name {
    font-size: 0.8rem;
    font-weight: bold;
  }

  .enchant-item .enchant-en {
    font-size: 0.65rem;
    color: var(--mc-text-muted);
  }

  .enchant-item .enchant-max {
    font-size: 0.65rem;
    color: var(--mc-color-diamond);
  }

  /* 選択されたエンチャント */
  .selected-enchants {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    min-height: 60px;
    max-height: 250px;
    overflow-y: auto;
  }

  .selected-enchant {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-xs) var(--mc-space-sm);
    background: var(--mc-bg-surface);
    border-left: 3px solid var(--mc-color-grass-main);
  }

  .selected-enchant.curse {
    border-left-color: var(--mc-color-redstone);
  }

  .selected-enchant .enchant-label {
    flex: 1;
    font-size: 0.85rem;
  }

  .selected-enchant .enchant-level {
    width: 70px;
  }

  .selected-enchant .enchant-remove {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.2rem;
  }

  /* 属性 */
  .attributes-section {
    margin-top: var(--mc-space-sm);
    padding: var(--mc-space-sm);
    background: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
  }

  .attribute-row {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: 4px 0;
  }

  .attribute-row .attr-icon {
    width: 24px;
    text-align: center;
  }

  .attribute-row .attr-name {
    flex: 1;
    font-size: 0.8rem;
  }

  .attribute-row .attr-value {
    width: 80px;
  }

  /* オプション */
  .options-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-md);
  }

  .option-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    cursor: pointer;
  }

  /* プリセット */
  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-xs);
  }

  .preset-btn {
    padding: var(--mc-space-xs) var(--mc-space-sm);
    background: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.15s;
  }

  .preset-btn:hover {
    background: var(--mc-color-grass-light);
    border-color: var(--mc-color-grass-main);
  }

  .preset-btn.preset-clear {
    background: var(--mc-color-redstone);
    color: white;
  }

  /* プレビュー */
  .enchant-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .enchant-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
  }

  .enchant-preview {
    display: flex;
    gap: var(--mc-space-lg);
  }

  .preview-item {
    text-align: center;
    padding: var(--mc-space-md);
    background: var(--mc-bg-panel);
    border: 2px solid var(--mc-border-dark);
    min-width: 100px;
  }

  .preview-item .item-icon {
    font-size: 2.5rem;
    margin-bottom: var(--mc-space-xs);
  }

  .preview-item .item-name {
    font-size: 0.8rem;
    color: var(--mc-color-diamond);
    font-weight: bold;
  }

  .preview-enchants {
    flex: 1;
    font-size: 0.85rem;
  }

  .preview-enchant {
    padding: 2px 0;
    color: var(--mc-text-secondary);
  }

  .preview-enchant.curse {
    color: var(--mc-color-redstone);
  }

  .text-muted {
    color: var(--mc-text-muted);
  }

  @media (max-width: 600px) {
    .item-selector {
      grid-template-columns: 1fr;
    }

    .category-enchants {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
