/**
 * Enchant Tool - UI (minecraft-blog.net参考)
 * 全42種エンチャント、属性追加、プレビュー機能
 * 最大レベル255対応、Minecraft Wiki画像対応
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { applyTooltip } from '../../core/mc-tooltip.js';

// 最大レベル定数
const ABSOLUTE_MAX_LEVEL = 255;  // ゲーム内で設定可能な絶対最大値

// カテゴリアイコン用のアイテムID
const CATEGORY_ICONS = {
  weapon: 'netherite_sword',
  tool: 'netherite_pickaxe',
  armor: 'netherite_chestplate',
  helmet: 'netherite_helmet',
  chestplate: 'netherite_chestplate',
  leggings: 'netherite_leggings',
  boots: 'netherite_boots',
  bow: 'bow',
  crossbow: 'crossbow',
  trident: 'trident',
  fishing: 'fishing_rod',
  universal: 'enchanted_book',
  curse: 'wither_skeleton_skull',
};

// 全42種エンチャント（カテゴリ別）- defaultMaxはMinecraftのデフォルト最大レベル
const ENCHANT_CATEGORIES = {
  weapon: {
    name: '武器（剣）',
    iconItem: 'netherite_sword',
    enchants: [
      { id: 'sharpness', name: 'ダメージ増加', en: 'Sharpness', defaultMax: 5, desc: '近接攻撃ダメージ増加' },
      { id: 'smite', name: 'アンデッド特効', en: 'Smite', defaultMax: 5, desc: 'アンデッド系に追加ダメージ' },
      { id: 'bane_of_arthropods', name: '虫特効', en: 'Bane of Arthropods', defaultMax: 5, desc: '虫系に追加ダメージ' },
      { id: 'knockback', name: 'ノックバック', en: 'Knockback', defaultMax: 2, desc: '攻撃時のノックバック増加' },
      { id: 'fire_aspect', name: '火属性', en: 'Fire Aspect', defaultMax: 2, desc: '攻撃対象に発火' },
      { id: 'looting', name: 'ドロップ増加', en: 'Looting', defaultMax: 3, desc: 'Mobのドロップ増加' },
      { id: 'sweeping_edge', name: '範囲ダメージ増加', en: 'Sweeping Edge', defaultMax: 3, desc: '範囲攻撃ダメージ増加' },
      { id: 'density', name: '密度', en: 'Density', defaultMax: 5, desc: 'メイス専用、落下ダメージ増加' },
      { id: 'breach', name: '貫通', en: 'Breach', defaultMax: 4, desc: 'メイス専用、防具無視ダメージ' },
      { id: 'wind_burst', name: '風爆発', en: 'Wind Burst', defaultMax: 3, desc: 'メイス専用、着地時に風爆発' },
    ]
  },
  tool: {
    name: 'ツール',
    iconItem: 'netherite_pickaxe',
    enchants: [
      { id: 'efficiency', name: '効率強化', en: 'Efficiency', defaultMax: 5, desc: '採掘速度増加' },
      { id: 'silk_touch', name: 'シルクタッチ', en: 'Silk Touch', defaultMax: 1, desc: 'ブロックをそのまま回収' },
      { id: 'fortune', name: '幸運', en: 'Fortune', defaultMax: 3, desc: 'ドロップ数増加' },
    ]
  },
  armor: {
    name: '防具（共通）',
    iconItem: 'netherite_chestplate',
    enchants: [
      { id: 'protection', name: 'ダメージ軽減', en: 'Protection', defaultMax: 4, desc: '全ダメージ軽減' },
      { id: 'fire_protection', name: '火炎耐性', en: 'Fire Protection', defaultMax: 4, desc: '火炎ダメージ軽減' },
      { id: 'blast_protection', name: '爆発耐性', en: 'Blast Protection', defaultMax: 4, desc: '爆発ダメージ軽減' },
      { id: 'projectile_protection', name: '飛び道具耐性', en: 'Projectile Protection', defaultMax: 4, desc: '飛び道具ダメージ軽減' },
      { id: 'thorns', name: 'トゲ', en: 'Thorns', defaultMax: 3, desc: '反射ダメージ' },
    ]
  },
  helmet: {
    name: 'ヘルメット',
    iconItem: 'netherite_helmet',
    enchants: [
      { id: 'respiration', name: '水中呼吸', en: 'Respiration', defaultMax: 3, desc: '水中での呼吸時間延長' },
      { id: 'aqua_affinity', name: '水中採掘', en: 'Aqua Affinity', defaultMax: 1, desc: '水中採掘速度アップ' },
    ]
  },
  chestplate: {
    name: 'チェストプレート',
    iconItem: 'netherite_chestplate',
    enchants: []
  },
  leggings: {
    name: 'レギンス',
    iconItem: 'netherite_leggings',
    enchants: [
      { id: 'swift_sneak', name: 'スニーク速度上昇', en: 'Swift Sneak', defaultMax: 3, desc: 'スニーク時の移動速度アップ' },
    ]
  },
  boots: {
    name: 'ブーツ',
    iconItem: 'netherite_boots',
    enchants: [
      { id: 'feather_falling', name: '落下耐性', en: 'Feather Falling', defaultMax: 4, desc: '落下ダメージ軽減' },
      { id: 'depth_strider', name: '水中歩行', en: 'Depth Strider', defaultMax: 3, desc: '水中移動速度アップ' },
      { id: 'frost_walker', name: '氷渡り', en: 'Frost Walker', defaultMax: 2, desc: '水上を凍らせて歩く' },
      { id: 'soul_speed', name: 'ソウルスピード', en: 'Soul Speed', defaultMax: 3, desc: 'ソウルサンド上の速度アップ' },
    ]
  },
  bow: {
    name: '弓',
    iconItem: 'bow',
    enchants: [
      { id: 'power', name: '射撃ダメージ増加', en: 'Power', defaultMax: 5, desc: '矢のダメージ増加' },
      { id: 'punch', name: 'パンチ', en: 'Punch', defaultMax: 2, desc: '矢のノックバック増加' },
      { id: 'flame', name: 'フレイム', en: 'Flame', defaultMax: 1, desc: '矢に火属性付与' },
      { id: 'infinity', name: '無限', en: 'Infinity', defaultMax: 1, desc: '矢を消費しない' },
    ]
  },
  crossbow: {
    name: 'クロスボウ',
    iconItem: 'crossbow',
    enchants: [
      { id: 'multishot', name: '拡散', en: 'Multishot', defaultMax: 1, desc: '3本同時発射' },
      { id: 'piercing', name: '貫通', en: 'Piercing', defaultMax: 4, desc: '敵を貫通' },
      { id: 'quick_charge', name: '高速装填', en: 'Quick Charge', defaultMax: 3, desc: 'リロード速度アップ' },
    ]
  },
  trident: {
    name: 'トライデント',
    iconItem: 'trident',
    enchants: [
      { id: 'loyalty', name: '忠誠', en: 'Loyalty', defaultMax: 3, desc: '投げると戻ってくる' },
      { id: 'impaling', name: '水生特効', en: 'Impaling', defaultMax: 5, desc: '水中Mobに追加ダメージ' },
      { id: 'riptide', name: '激流', en: 'Riptide', defaultMax: 3, desc: '雨/水中で突進' },
      { id: 'channeling', name: '召雷', en: 'Channeling', defaultMax: 1, desc: '雷雨時に雷を落とす' },
    ]
  },
  fishing: {
    name: '釣り竿',
    iconItem: 'fishing_rod',
    enchants: [
      { id: 'luck_of_the_sea', name: '宝釣り', en: 'Luck of the Sea', defaultMax: 3, desc: 'レアアイテム確率アップ' },
      { id: 'lure', name: '入れ食い', en: 'Lure', defaultMax: 3, desc: '釣れるまでの時間短縮' },
    ]
  },
  universal: {
    name: '汎用',
    iconItem: 'enchanted_book',
    enchants: [
      { id: 'unbreaking', name: '耐久力', en: 'Unbreaking', defaultMax: 3, desc: '耐久値消費軽減' },
      { id: 'mending', name: '修繕', en: 'Mending', defaultMax: 1, desc: '経験値で耐久回復' },
    ]
  },
  curse: {
    name: '呪い',
    iconItem: 'wither_skeleton_skull',
    enchants: [
      { id: 'vanishing_curse', name: '消滅の呪い', en: 'Curse of Vanishing', defaultMax: 1, desc: '死亡時に消滅' },
      { id: 'binding_curse', name: '束縛の呪い', en: 'Curse of Binding', defaultMax: 1, desc: '外せなくなる' },
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
        <img src="${getInviconUrl(manifest.iconItem || 'enchanted_book')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="version-badge">1.21.11</span>
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
          <div class="enchant-info-hint">
            <span class="hint-icon">💡</span>
            <span>通常の最大レベルはバニラの値です。コマンドでは最大255まで設定可能！</span>
          </div>
          <div class="enchant-categories" id="enchant-categories">
            ${Object.entries(ENCHANT_CATEGORIES).map(([catId, cat]) => `
              <div class="enchant-category" data-category="${catId}">
                <button type="button" class="category-header">
                  <img class="cat-icon-img" src="${getInviconUrl(cat.iconItem)}" alt="${cat.name}" data-mc-tooltip="${cat.iconItem}" onerror="this.style.opacity='0.3'">
                  <span class="cat-name">${cat.name}</span>
                  <span class="cat-count">(${cat.enchants.length})</span>
                  <span class="cat-arrow">▶</span>
                </button>
                <div class="category-enchants" style="display: none;">
                  ${cat.enchants.map(e => `
                    <div class="enchant-item" data-enchant="${e.id}" data-default-max="${e.defaultMax}" title="${e.desc}">
                      <span class="enchant-name">${e.name}</span>
                      <span class="enchant-en">${e.en}</span>
                      <div class="enchant-level-info">
                        <span class="enchant-default-max">通常Max: ${e.defaultMax}</span>
                        <span class="enchant-cmd-max">コマンド: 255</span>
                      </div>
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
            <div class="item-icon-wrapper">
              <img class="item-icon-img" id="item-icon-img" src="" alt="">
            </div>
            <div class="item-name" id="item-name">ダイヤの剣</div>
            <div class="item-id" id="item-id">minecraft:diamond_sword</div>
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
    const defaultMax = parseInt(target.dataset.defaultMax) || 5;

    if (!selectedEnchants.find(e => e.id === enchantId)) {
      // デフォルトの最大レベルで追加（ユーザーは後で255まで上げられる）
      selectedEnchants.push({ id: enchantId, level: defaultMax, defaultMax });
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

  // レベルクイックボタン
  delegate(container, 'click', '.level-quick-btn', (e, target) => {
    const enchantId = target.dataset.enchant;
    const level = parseInt(target.dataset.level);
    const enchant = selectedEnchants.find(e => e.id === enchantId);
    if (enchant) {
      enchant.level = level;
      renderSelectedEnchants(container);
      updateCommand(container);
    }
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
    const defaultMax = info?.defaultMax || e.defaultMax || 5;
    const isOverDefault = e.level > defaultMax;
    const isMaxLevel = e.level === 255;
    return `
      <div class="selected-enchant ${isCurse ? 'curse' : ''} ${isOverDefault ? 'over-default' : ''} ${isMaxLevel ? 'max-level' : ''}">
        <span class="enchant-label">${info?.name || e.id}</span>
        <div class="enchant-level-wrapper">
          <input type="number" class="enchant-level mc-input" data-enchant="${e.id}"
                 value="${e.level}" min="1" max="${ABSOLUTE_MAX_LEVEL}">
          <span class="default-max-hint" title="通常の最大レベル">(通常:${defaultMax})</span>
        </div>
        <div class="level-quick-btns">
          <button type="button" class="level-quick-btn" data-enchant="${e.id}" data-level="${defaultMax}">Max</button>
          <button type="button" class="level-quick-btn extreme" data-enchant="${e.id}" data-level="255">255</button>
        </div>
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
  const itemIdEl = $('#item-id', container);
  const itemIconImg = $('#item-icon-img', container);
  const previewEnchantsEl = $('#preview-enchants', container);

  const useCustom = $('#use-custom-item', container)?.checked;
  const customId = $('#custom-item-id', container)?.value;
  const catId = $('#item-category', container)?.value;
  const itemId = $('#item-select', container)?.value;

  // アイテム名とアイコン
  if (useCustom && customId) {
    const customItemId = customId.split(':').pop() || customId;
    if (itemNameEl) itemNameEl.textContent = customItemId;
    if (itemIdEl) itemIdEl.textContent = customId.startsWith('minecraft:') ? customId : `minecraft:${customId}`;
    // カスタムアイテムもInvicon画像を試行
    if (itemIconImg) {
      itemIconImg.src = getInviconUrl(customItemId);
      itemIconImg.alt = customItemId;
      itemIconImg.style.opacity = '1';
      itemIconImg.onerror = () => { itemIconImg.style.opacity = '0.3'; };
    }
  } else {
    const cat = ITEM_CATEGORIES[catId];
    const item = cat?.items.find(i => i.id === itemId);
    if (itemNameEl) itemNameEl.textContent = item?.name || 'アイテム';
    if (itemIdEl) itemIdEl.textContent = `minecraft:${itemId}`;

    // Wiki Invicon画像を設定
    if (itemIconImg) {
      itemIconImg.src = getInviconUrl(itemId);
      itemIconImg.alt = item?.name || itemId;
      itemIconImg.style.opacity = '1';
      itemIconImg.onerror = () => { itemIconImg.style.opacity = '0.3'; };
    }
  }

  // エンチャント一覧
  if (previewEnchantsEl) {
    if (selectedEnchants.length === 0) {
      previewEnchantsEl.innerHTML = '<p class="text-muted">エンチャントなし</p>';
    } else {
      previewEnchantsEl.innerHTML = selectedEnchants.map(e => {
        const info = findEnchantInfo(e.id);
        const isCurse = e.id.includes('curse');
        const isOverDefault = e.level > (info?.defaultMax || 5);
        const isMaxLevel = e.level === 255;
        return `
          <div class="preview-enchant ${isCurse ? 'curse' : ''} ${isOverDefault ? 'over-default' : ''} ${isMaxLevel ? 'max-level' : ''}">
            ${info?.name || e.id} ${toRoman(e.level)}
            ${isOverDefault ? '<span class="over-badge">+</span>' : ''}
            ${isMaxLevel ? '<span class="max-badge">MAX</span>' : ''}
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

  .cat-icon-img {
    width: 24px;
    height: 24px;
    image-rendering: pixelated;
    flex-shrink: 0;
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

  .enchant-item .enchant-level-info {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }

  .enchant-item .enchant-default-max {
    font-size: 0.65rem;
    color: var(--mc-color-diamond);
    background: rgba(85, 255, 255, 0.1);
    padding: 1px 4px;
    border-radius: 2px;
  }

  .enchant-item .enchant-cmd-max {
    font-size: 0.6rem;
    color: var(--mc-color-gold);
    opacity: 0.7;
  }

  .enchant-info-hint {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background: linear-gradient(135deg, rgba(85, 255, 255, 0.1) 0%, rgba(255, 170, 0, 0.1) 100%);
    border: 1px solid rgba(85, 255, 255, 0.3);
    border-radius: 4px;
    margin-bottom: var(--mc-space-sm);
    font-size: 0.8rem;
  }

  .enchant-info-hint .hint-icon {
    font-size: 1.1rem;
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

  .selected-enchant .enchant-level-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .selected-enchant .default-max-hint {
    font-size: 0.65rem;
    color: var(--mc-text-muted);
    white-space: nowrap;
  }

  .selected-enchant .level-quick-btns {
    display: flex;
    gap: 2px;
  }

  .selected-enchant .level-quick-btn {
    padding: 2px 6px;
    background: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.65rem;
    border-radius: 2px;
    transition: all 0.15s;
  }

  .selected-enchant .level-quick-btn:hover {
    background: var(--mc-color-grass-light);
    border-color: var(--mc-color-grass-main);
  }

  .selected-enchant .level-quick-btn.extreme {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
    color: white;
    border-color: #ff6b6b;
  }

  .selected-enchant .level-quick-btn.extreme:hover {
    background: linear-gradient(135deg, #ff4444 0%, #ff8800 100%);
  }

  .selected-enchant.over-default {
    border-left-color: var(--mc-color-gold);
    background: rgba(255, 170, 0, 0.1);
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

  .preview-item .item-icon-wrapper {
    width: 32px;
    height: 32px;
    margin: 0 auto var(--mc-space-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-item .item-icon-img {
    width: 32px;
    height: 32px;
    image-rendering: pixelated;
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
  }

  .preview-item .item-name {
    font-size: 0.9rem;
    color: var(--mc-color-diamond);
    font-weight: bold;
    margin-bottom: 2px;
  }

  .preview-item .item-id {
    font-size: 0.65rem;
    color: var(--mc-text-muted);
    font-family: monospace;
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

  .preview-enchant.over-default {
    color: var(--mc-color-gold);
    font-weight: bold;
  }

  .preview-enchant .over-badge {
    font-size: 0.65rem;
    color: var(--mc-color-gold);
    vertical-align: super;
  }

  /* Minecraft風アニメーション */
  @keyframes enchant-glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(170, 0, 255, 0.3), 0 0 10px rgba(170, 0, 255, 0.2);
    }
    50% {
      box-shadow: 0 0 15px rgba(170, 0, 255, 0.5), 0 0 25px rgba(170, 0, 255, 0.3);
    }
  }

  @keyframes gold-pulse {
    0%, 100% {
      box-shadow: 0 0 5px rgba(255, 170, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.3);
      background: linear-gradient(135deg, rgba(255, 170, 0, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%);
    }
    50% {
      box-shadow: 0 0 20px rgba(255, 170, 0, 0.7), 0 0 35px rgba(255, 215, 0, 0.4);
      background: linear-gradient(135deg, rgba(255, 170, 0, 0.25) 0%, rgba(255, 215, 0, 0.2) 100%);
    }
  }

  @keyframes item-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  /* エンチャント選択時のエフェクト */
  .enchant-item.selected {
    animation: enchant-glow 2s ease-in-out infinite;
  }

  /* アイテム画像のホバーエフェクト */
  .preview-item .item-icon-img {
    transition: transform 0.3s ease, filter 0.3s ease;
  }

  .preview-item:hover .item-icon-img {
    transform: scale(1.1);
    filter: drop-shadow(0 0 8px rgba(85, 255, 255, 0.5));
    animation: item-float 1.5s ease-in-out infinite;
  }

  /* レベル255選択時の特別エフェクト */
  .selected-enchant.over-default {
    animation: gold-pulse 2s ease-in-out infinite;
  }

  .selected-enchant .level-quick-btn.extreme:hover {
    animation: gold-pulse 0.5s ease-in-out;
  }

  /* プレビューの超過レベル表示 */
  .preview-enchant.over-default {
    text-shadow: 0 0 10px rgba(255, 170, 0, 0.7);
  }

  /* レベル255（MAX）選択時のゴールドシマーエフェクト */
  @keyframes gold-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .selected-enchant.max-level {
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0.1) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 215, 0, 0.1) 100%);
    background-size: 200% 100%;
    animation: gold-shimmer 3s infinite linear, gold-pulse 2s ease-in-out infinite;
    border-left-color: #ffd700 !important;
  }

  .preview-enchant.max-level {
    color: #ffd700;
    font-weight: bold;
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 5px rgba(255, 255, 255, 0.5);
  }

  .preview-enchant .max-badge {
    font-size: 0.6rem;
    color: #ffd700;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 170, 0, 0.2) 100%);
    padding: 1px 4px;
    border-radius: 3px;
    margin-left: 4px;
    vertical-align: middle;
    animation: gold-pulse 1.5s ease-in-out infinite;
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

  /* ダークモードでのコントラスト改善（紫/マゼンタテーマ） */
  @media (prefers-color-scheme: dark) {
    .enchant-tool .category-header {
      background: #2a2535;
      color: #f0f0f0;
    }

    .enchant-tool .category-header:hover {
      background: rgba(170, 0, 255, 0.25);
    }

    .enchant-tool .enchant-item {
      background: #2a2535;
      border: 2px solid #444;
    }

    .enchant-tool .enchant-item:hover {
      background: rgba(170, 0, 255, 0.2);
      border-color: #aa00ff;
    }

    .enchant-tool .enchant-item .enchant-name {
      color: #e8e8e8;
    }

    .enchant-tool .enchant-item .enchant-en {
      color: #b0b0b0;
    }

    .enchant-tool .selected-enchants {
      background: #1a1a1a;
      border-color: #555;
    }

    .enchant-tool .selected-enchant {
      background: #2a2535;
      border-left-color: #aa00ff;
    }

    .enchant-tool .selected-enchant .enchant-label {
      color: #e8e8e8;
    }

    .enchant-tool .selected-enchant .enchant-level {
      background: #1a1a1a;
      color: #e8e8e8;
      border-color: #555;
    }

    .enchant-tool .selected-enchant .level-quick-btn {
      background: #3a3a3a;
      color: #e0e0e0;
      border-color: #555;
    }

    .enchant-tool .selected-enchant .level-quick-btn:hover {
      background: #aa00ff;
      color: white;
      border-color: #aa00ff;
    }

    .enchant-tool .attributes-section {
      background: #1a1a1a;
      border-color: #555;
    }

    .enchant-tool .attribute-row .attr-name {
      color: #e0e0e0;
    }

    .enchant-tool .attribute-row .attr-value {
      background: #2a2a2a;
      color: #e8e8e8;
      border-color: #555;
    }

    .enchant-tool .preset-btn {
      background: #3a3a3a;
      color: #e0e0e0;
      border-color: #555;
    }

    .enchant-tool .preset-btn:hover {
      background: #aa00ff;
      color: white;
      border-color: #aa00ff;
    }

    .enchant-tool .enchant-preview-section {
      background: #2a2535;
      border-color: #555;
    }

    .enchant-tool .enchant-preview-section h3 {
      color: #b0b0b0;
    }

    .enchant-tool .preview-item {
      background: #1a1a1a;
      border-color: #555;
    }

    .enchant-tool .preview-item .item-name {
      color: #ff55ff;
    }

    .enchant-tool .preview-item .item-id {
      color: #b0b0b0;
    }

    .enchant-tool .preview-enchant {
      color: #d0d0d0;
    }

    .enchant-tool .option-item {
      color: #e0e0e0;
    }

    .enchant-tool .mc-input {
      background: #2a2a2a;
      color: #e8e8e8;
      border-color: #555;
    }

    .enchant-tool .mc-input:focus {
      border-color: #aa00ff;
      box-shadow: 0 0 0 2px rgba(170, 0, 255, 0.3);
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
