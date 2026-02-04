/**
 * Summon Zombie Generator - UI
 * 最強ゾンビ召喚コマンド生成ツール
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl, getSpawnEggUrl } from '../../core/wiki-images.js';
import { applyTooltip } from '../../core/mc-tooltip.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';
import { compareVersions } from '../../core/version-compat.js';

// ゾンビタイプ
const ZOMBIE_TYPES = [
  { id: 'zombie', name: 'ゾンビ' },
  { id: 'zombie_villager', name: '村人ゾンビ' },
  { id: 'husk', name: 'ハスク' },
  { id: 'drowned', name: 'ドラウンド' },
  { id: 'zombified_piglin', name: 'ゾンビピグリン' },
];

// 装備スロット
const EQUIPMENT_SLOTS = [
  { id: 'head', name: 'ヘルメット', image: getInviconUrl('iron_helmet'), slot: 'head', itemId: 'iron_helmet' },
  { id: 'chest', name: 'チェストプレート', image: getInviconUrl('iron_chestplate'), slot: 'chest', itemId: 'iron_chestplate' },
  { id: 'legs', name: 'レギンス', image: getInviconUrl('iron_leggings'), slot: 'legs', itemId: 'iron_leggings' },
  { id: 'feet', name: 'ブーツ', image: getInviconUrl('iron_boots'), slot: 'feet', itemId: 'iron_boots' },
  { id: 'mainhand', name: 'メイン手', image: getInviconUrl('iron_sword'), slot: 'mainhand', itemId: 'iron_sword' },
  { id: 'offhand', name: 'オフハンド', image: getInviconUrl('shield'), slot: 'offhand', itemId: 'shield' },
];

// 装備アイテム一覧
const EQUIPMENT_ITEMS = {
  head: [
    { id: '', name: '-- なし --', image: null },
    { id: 'leather_helmet', name: '革のヘルメット', image: getInviconUrl('leather_helmet') },
    { id: 'chainmail_helmet', name: 'チェーンのヘルメット', image: getInviconUrl('chainmail_helmet') },
    { id: 'iron_helmet', name: '鉄のヘルメット', image: getInviconUrl('iron_helmet') },
    { id: 'golden_helmet', name: '金のヘルメット', image: getInviconUrl('golden_helmet') },
    { id: 'diamond_helmet', name: 'ダイヤのヘルメット', image: getInviconUrl('diamond_helmet') },
    { id: 'netherite_helmet', name: 'ネザライトのヘルメット', image: getInviconUrl('netherite_helmet') },
    { id: 'turtle_helmet', name: 'カメの甲羅', image: getInviconUrl('turtle_helmet') },
    { id: 'carved_pumpkin', name: 'くり抜かれたカボチャ', image: getInviconUrl('carved_pumpkin') },
    { id: 'player_head', name: 'プレイヤーの頭', image: getInviconUrl('player_head') },
    { id: 'zombie_head', name: 'ゾンビの頭', image: getInviconUrl('zombie_head') },
    { id: 'skeleton_skull', name: 'スケルトンの頭蓋骨', image: getInviconUrl('skeleton_skull') },
    { id: 'wither_skeleton_skull', name: 'ウィザースケルトンの頭蓋骨', image: getInviconUrl('wither_skeleton_skull') },
    { id: 'creeper_head', name: 'クリーパーの頭', image: getInviconUrl('creeper_head') },
    { id: 'dragon_head', name: 'ドラゴンの頭', image: getInviconUrl('dragon_head') },
    { id: 'piglin_head', name: 'ピグリンの頭', image: getInviconUrl('piglin_head') },
  ],
  chest: [
    { id: '', name: '-- なし --', image: null },
    { id: 'leather_chestplate', name: '革のチェストプレート', image: getInviconUrl('leather_chestplate') },
    { id: 'chainmail_chestplate', name: 'チェーンのチェストプレート', image: getInviconUrl('chainmail_chestplate') },
    { id: 'iron_chestplate', name: '鉄のチェストプレート', image: getInviconUrl('iron_chestplate') },
    { id: 'golden_chestplate', name: '金のチェストプレート', image: getInviconUrl('golden_chestplate') },
    { id: 'diamond_chestplate', name: 'ダイヤのチェストプレート', image: getInviconUrl('diamond_chestplate') },
    { id: 'netherite_chestplate', name: 'ネザライトのチェストプレート', image: getInviconUrl('netherite_chestplate') },
    { id: 'elytra', name: 'エリトラ', image: getInviconUrl('elytra') },
  ],
  legs: [
    { id: '', name: '-- なし --', image: null },
    { id: 'leather_leggings', name: '革のレギンス', image: getInviconUrl('leather_leggings') },
    { id: 'chainmail_leggings', name: 'チェーンのレギンス', image: getInviconUrl('chainmail_leggings') },
    { id: 'iron_leggings', name: '鉄のレギンス', image: getInviconUrl('iron_leggings') },
    { id: 'golden_leggings', name: '金のレギンス', image: getInviconUrl('golden_leggings') },
    { id: 'diamond_leggings', name: 'ダイヤのレギンス', image: getInviconUrl('diamond_leggings') },
    { id: 'netherite_leggings', name: 'ネザライトのレギンス', image: getInviconUrl('netherite_leggings') },
  ],
  feet: [
    { id: '', name: '-- なし --', image: null },
    { id: 'leather_boots', name: '革のブーツ', image: getInviconUrl('leather_boots') },
    { id: 'chainmail_boots', name: 'チェーンのブーツ', image: getInviconUrl('chainmail_boots') },
    { id: 'iron_boots', name: '鉄のブーツ', image: getInviconUrl('iron_boots') },
    { id: 'golden_boots', name: '金のブーツ', image: getInviconUrl('golden_boots') },
    { id: 'diamond_boots', name: 'ダイヤのブーツ', image: getInviconUrl('diamond_boots') },
    { id: 'netherite_boots', name: 'ネザライトのブーツ', image: getInviconUrl('netherite_boots') },
  ],
  mainhand: [
    { id: '', name: '-- なし --', image: null },
    { id: 'iron_sword', name: '鉄の剣', image: getInviconUrl('iron_sword') },
    { id: 'golden_sword', name: '金の剣', image: getInviconUrl('golden_sword') },
    { id: 'diamond_sword', name: 'ダイヤの剣', image: getInviconUrl('diamond_sword') },
    { id: 'netherite_sword', name: 'ネザライトの剣', image: getInviconUrl('netherite_sword') },
    { id: 'iron_axe', name: '鉄の斧', image: getInviconUrl('iron_axe') },
    { id: 'golden_axe', name: '金の斧', image: getInviconUrl('golden_axe') },
    { id: 'diamond_axe', name: 'ダイヤの斧', image: getInviconUrl('diamond_axe') },
    { id: 'netherite_axe', name: 'ネザライトの斧', image: getInviconUrl('netherite_axe') },
    { id: 'trident', name: 'トライデント', image: getInviconUrl('trident') },
    { id: 'bow', name: '弓', image: getInviconUrl('bow') },
    { id: 'crossbow', name: 'クロスボウ', image: getInviconUrl('crossbow') },
    { id: 'mace', name: 'メイス', image: getInviconUrl('mace') },
  ],
  offhand: [
    { id: '', name: '-- なし --', image: null },
    { id: 'shield', name: '盾', image: getInviconUrl('shield') },
    { id: 'totem_of_undying', name: '不死のトーテム', image: getInviconUrl('totem_of_undying') },
    { id: 'torch', name: '松明', image: getInviconUrl('torch') },
    { id: 'lantern', name: 'ランタン', image: getInviconUrl('lantern') },
    { id: 'nautilus_shell', name: 'オウムガイの殻', image: getInviconUrl('nautilus_shell') },
  ],
};

// エンチャント一覧（カテゴリ別）
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
  armor: {
    name: '防具',
    enchants: [
      { id: 'protection', name: 'ダメージ軽減', maxLevel: 4 },
      { id: 'fire_protection', name: '火炎耐性', maxLevel: 4 },
      { id: 'blast_protection', name: '爆発耐性', maxLevel: 4 },
      { id: 'projectile_protection', name: '飛び道具耐性', maxLevel: 4 },
      { id: 'thorns', name: 'トゲ', maxLevel: 3 },
      { id: 'respiration', name: '水中呼吸', maxLevel: 3 },
      { id: 'aqua_affinity', name: '水中採掘', maxLevel: 1 },
      { id: 'feather_falling', name: '落下耐性', maxLevel: 4 },
      { id: 'depth_strider', name: '水中歩行', maxLevel: 3 },
      { id: 'frost_walker', name: '氷渡り', maxLevel: 2 },
      { id: 'soul_speed', name: 'ソウルスピード', maxLevel: 3 },
    ]
  },
  universal: {
    name: '汎用',
    enchants: [
      { id: 'unbreaking', name: '耐久力', maxLevel: 3 },
      { id: 'mending', name: '修繕', maxLevel: 1 },
    ]
  },
};

// 属性一覧
const ATTRIBUTES = [
  { id: 'max_health', name: '最大体力', image: getInviconUrl('heart'), default: 20, min: 1, max: 1024, step: 1 },
  { id: 'attack_damage', name: '攻撃力', image: getInviconUrl('iron_sword'), default: 3, min: 0, max: 2048, step: 0.5 },
  { id: 'movement_speed', name: '移動速度', image: getInviconUrl('sugar'), default: 0.23, min: 0, max: 1, step: 0.01 },
  { id: 'knockback_resistance', name: 'ノックバック耐性', image: getInviconUrl('anvil'), default: 0, min: 0, max: 1, step: 0.1 },
  { id: 'armor', name: '防御力', image: getInviconUrl('iron_chestplate'), default: 0, min: 0, max: 30, step: 1 },
  { id: 'armor_toughness', name: '防具強度', image: getInviconUrl('diamond_chestplate'), default: 0, min: 0, max: 20, step: 1 },
  { id: 'follow_range', name: '追跡範囲', image: getInviconUrl('ender_eye'), default: 35, min: 0, max: 2048, step: 1 },
  { id: 'spawn_reinforcements', name: '増援召喚率', image: getSpawnEggUrl('zombie'), default: 0, min: 0, max: 1, step: 0.1 },
];

// プリセット
const PRESETS = [
  {
    id: 'strongest',
    name: '最強ゾンビ',
    desc: 'フル装備、最大エンチャント、超強化属性',
    config: {
      zombieType: 'zombie',
      equipment: {
        head: { item: 'netherite_helmet', enchants: [{ id: 'protection', level: 255 }, { id: 'thorns', level: 255 }] },
        chest: { item: 'netherite_chestplate', enchants: [{ id: 'protection', level: 255 }, { id: 'thorns', level: 255 }] },
        legs: { item: 'netherite_leggings', enchants: [{ id: 'protection', level: 255 }] },
        feet: { item: 'netherite_boots', enchants: [{ id: 'protection', level: 255 }, { id: 'feather_falling', level: 255 }] },
        mainhand: { item: 'netherite_sword', enchants: [{ id: 'sharpness', level: 255 }, { id: 'fire_aspect', level: 2 }, { id: 'knockback', level: 10 }] },
        offhand: { item: 'shield', enchants: [] },
      },
      attributes: {
        max_health: 1000,
        attack_damage: 100,
        movement_speed: 0.5,
        knockback_resistance: 1,
        armor: 30,
        armor_toughness: 20,
      },
      customName: '最強ゾンビ',
      glowing: true,
      noAI: false,
      invulnerable: false,
      persistenceRequired: true,
      canBreakDoors: true,
    }
  },
  {
    id: 'tank',
    name: 'タンクゾンビ',
    desc: '超高体力、高防御、低速',
    config: {
      zombieType: 'husk',
      equipment: {
        head: { item: 'netherite_helmet', enchants: [{ id: 'protection', level: 4 }] },
        chest: { item: 'netherite_chestplate', enchants: [{ id: 'protection', level: 4 }, { id: 'thorns', level: 3 }] },
        legs: { item: 'netherite_leggings', enchants: [{ id: 'protection', level: 4 }] },
        feet: { item: 'netherite_boots', enchants: [{ id: 'protection', level: 4 }] },
        mainhand: { item: '', enchants: [] },
        offhand: { item: 'shield', enchants: [] },
      },
      attributes: {
        max_health: 500,
        attack_damage: 5,
        movement_speed: 0.1,
        knockback_resistance: 1,
        armor: 30,
        armor_toughness: 20,
      },
      customName: 'タンクゾンビ',
      glowing: false,
      noAI: false,
      invulnerable: false,
      persistenceRequired: true,
      canBreakDoors: false,
    }
  },
  {
    id: 'speedster',
    name: 'スピードゾンビ',
    desc: '超高速、高攻撃力',
    config: {
      zombieType: 'zombie',
      equipment: {
        head: { item: '', enchants: [] },
        chest: { item: '', enchants: [] },
        legs: { item: '', enchants: [] },
        feet: { item: 'leather_boots', enchants: [{ id: 'soul_speed', level: 3 }] },
        mainhand: { item: 'diamond_sword', enchants: [{ id: 'sharpness', level: 10 }] },
        offhand: { item: '', enchants: [] },
      },
      attributes: {
        max_health: 40,
        attack_damage: 15,
        movement_speed: 0.8,
        knockback_resistance: 0,
        armor: 0,
        armor_toughness: 0,
      },
      customName: 'スピードゾンビ',
      glowing: true,
      noAI: false,
      invulnerable: false,
      persistenceRequired: true,
      canBreakDoors: true,
    }
  },
  {
    id: 'drowned-boss',
    name: 'ドラウンドボス',
    desc: 'トライデント持ち水中ボス',
    config: {
      zombieType: 'drowned',
      equipment: {
        head: { item: 'turtle_helmet', enchants: [{ id: 'respiration', level: 3 }, { id: 'protection', level: 4 }] },
        chest: { item: 'diamond_chestplate', enchants: [{ id: 'protection', level: 4 }] },
        legs: { item: 'diamond_leggings', enchants: [{ id: 'protection', level: 4 }] },
        feet: { item: 'diamond_boots', enchants: [{ id: 'depth_strider', level: 3 }] },
        mainhand: { item: 'trident', enchants: [{ id: 'sharpness', level: 10 }] },
        offhand: { item: 'nautilus_shell', enchants: [] },
      },
      attributes: {
        max_health: 200,
        attack_damage: 20,
        movement_speed: 0.35,
        knockback_resistance: 0.5,
        armor: 15,
        armor_toughness: 10,
      },
      customName: 'ドラウンドボス',
      glowing: true,
      noAI: false,
      invulnerable: false,
      persistenceRequired: true,
      canBreakDoors: false,
    }
  },
  {
    id: 'immortal',
    name: '不死のゾンビ',
    desc: '無敵、デスポーンしない',
    config: {
      zombieType: 'zombie',
      equipment: {
        head: { item: 'wither_skeleton_skull', enchants: [] },
        chest: { item: '', enchants: [] },
        legs: { item: '', enchants: [] },
        feet: { item: '', enchants: [] },
        mainhand: { item: '', enchants: [] },
        offhand: { item: 'totem_of_undying', enchants: [] },
      },
      attributes: {
        max_health: 100,
        attack_damage: 5,
        movement_speed: 0.23,
        knockback_resistance: 1,
        armor: 0,
        armor_toughness: 0,
      },
      customName: '不死のゾンビ',
      glowing: true,
      noAI: false,
      invulnerable: true,
      persistenceRequired: true,
      canBreakDoors: false,
    }
  },
  {
    id: 'statue',
    name: '動かないゾンビ',
    desc: 'NoAI、装飾用',
    config: {
      zombieType: 'zombie',
      equipment: {
        head: { item: 'diamond_helmet', enchants: [] },
        chest: { item: 'diamond_chestplate', enchants: [] },
        legs: { item: 'diamond_leggings', enchants: [] },
        feet: { item: 'diamond_boots', enchants: [] },
        mainhand: { item: 'diamond_sword', enchants: [] },
        offhand: { item: 'shield', enchants: [] },
      },
      attributes: {},
      customName: 'ゾンビの像',
      glowing: false,
      noAI: true,
      invulnerable: true,
      persistenceRequired: true,
      canBreakDoors: false,
    }
  },
];

// 状態管理
let state = {
  zombieType: 'zombie',
  pos: '~ ~ ~',
  equipment: {
    head: { item: '', enchants: [], dropChance: 0.085 },
    chest: { item: '', enchants: [], dropChance: 0.085 },
    legs: { item: '', enchants: [], dropChance: 0.085 },
    feet: { item: '', enchants: [], dropChance: 0.085 },
    mainhand: { item: '', enchants: [], dropChance: 0.085 },
    offhand: { item: '', enchants: [], dropChance: 0.085 },
  },
  attributes: {},
  customName: '',
  customNameSNBT: '',
  glowing: false,
  noAI: false,
  silent: false,
  invulnerable: false,
  persistenceRequired: true,
  canBreakDoors: false,
  isBaby: false,
};

// 現在編集中の装備スロット
let currentEditSlot = null;

// リッチテキストエディター（名前設定用）
let zombieNameEditor = null;

// RTE CSSを追加
const rteStyle = document.createElement('style');
rteStyle.textContent = RICH_TEXT_EDITOR_CSS;
document.head.appendChild(rteStyle);

/**
 * UIをレンダリング
 */
export function render(manifest) {
  // RTEインスタンスを作成
  zombieNameEditor = new RichTextEditor('zombie-name-editor', {
    placeholder: 'ゾンビの名前を入力...',
    showPreview: true,
    showClickEvent: false,
    showHoverEvent: false,
    onChange: (snbt, plainText) => {
      state.customName = plainText;
      state.customNameSNBT = snbt;
      updateCommand();
    }
  });
  return `
    <div class="tool-panel summon-zombie-tool mc-themed" id="summon-zombie-panel">
      <!-- ヘッダー（summonツール統一デザイン） -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'zombie_head')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>最強ゾンビ召喚</h2>
            <p class="header-subtitle">装備・属性をカスタマイズしたゾンビを召喚</p>
          </div>
        </div>
        <div class="header-actions">
          <span class="version-badge" id="zombie-version-badge">1.21+</span>
          <button type="button" class="reset-btn" id="summon-zombie-reset-btn" title="設定をリセット">リセット</button>
        </div>
      </div>

      <form class="tool-form mc-form" id="summon-zombie-form">

        <!-- ステップ1: プリセット＆ゾンビタイプ -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>ゾンビタイプ選択</h3>
          </div>

          <!-- プリセットカード -->
          <div class="preset-cards" id="preset-grid">
            ${PRESETS.map(p => `
              <button type="button" class="preset-card" data-preset="${p.id}" title="${p.desc}">
                <img src="${getSpawnEggUrl(p.config.zombieType)}" alt="" class="preset-icon mc-pixelated" onerror="this.style.opacity='0.3'">
                <span class="preset-name">${p.name}</span>
                <span class="preset-desc">${p.desc}</span>
              </button>
            `).join('')}
            <button type="button" class="preset-card preset-clear" data-preset="clear">
              <img src="${getInviconUrl('barrier')}" alt="" class="preset-icon mc-pixelated">
              <span class="preset-name">クリア</span>
              <span class="preset-desc">設定をリセット</span>
            </button>
          </div>

          <!-- ゾンビタイプ選択 -->
          <div class="zombie-type-selector" id="zombie-type-selector">
            ${ZOMBIE_TYPES.map(z => `
              <button type="button" class="zombie-type-btn ${z.id === 'zombie' ? 'active' : ''}" data-type="${z.id}">
                <img src="${getSpawnEggUrl(z.id)}" alt="${z.name}" class="type-icon mc-pixelated" width="40" height="40" onerror="this.style.opacity='0.3'">
                <span class="type-name">${z.name}</span>
              </button>
            `).join('')}
          </div>

          <!-- 選択中のゾンビ表示 -->
          <div class="selected-entity-display" id="selected-zombie-display">
            <img src="${getSpawnEggUrl('zombie')}" alt="" class="selected-entity-icon mc-pixelated" id="selected-zombie-icon">
            <div class="selected-entity-info">
              <span class="selected-entity-name" id="selected-zombie-name">ゾンビ</span>
              <code class="selected-entity-id" id="selected-zombie-id">minecraft:zombie</code>
            </div>
          </div>
        </section>

        <!-- ステップ2: 座標設定 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>召喚位置</h3>
          </div>

          <div class="coordinate-input">
            <div class="coord-preset-btns">
              <button type="button" class="coord-preset active" data-pos="~ ~ ~">
                現在地 <code>~ ~ ~</code>
              </button>
              <button type="button" class="coord-preset" data-pos="~ ~1 ~">
                1ブロック上 <code>~ ~1 ~</code>
              </button>
              <button type="button" class="coord-preset" data-pos="~ ~ ~5">
                前方5m <code>~ ~ ~5</code>
              </button>
            </div>
            <div class="coord-custom">
              <label>カスタム座標:</label>
              <input type="text" id="zombie-pos" class="mc-input coord-input" value="~ ~ ~" placeholder="X Y Z">
            </div>
          </div>
        </section>

        <!-- ステップ3: 装備設定 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>装備設定</h3>
          </div>

          <div class="equipment-grid" id="equipment-grid">
            ${EQUIPMENT_SLOTS.map(slot => `
              <div class="equipment-slot" data-slot="${slot.id}">
                <div class="slot-header">
                  <img src="${slot.image}" alt="${slot.name}" class="slot-icon mc-pixelated" width="24" height="24" data-mc-tooltip="${slot.itemId}" onerror="this.style.opacity='0.3'">
                  <span class="slot-name">${slot.name}</span>
                </div>
                <div class="equipment-select-wrapper">
                  <img src="" alt="" class="selected-item-image mc-pixelated" data-slot="${slot.id}" width="24" height="24" style="display: none;" onerror="this.style.opacity='0.3'">
                  <select class="equipment-select mc-select" data-slot="${slot.id}">
                    ${EQUIPMENT_ITEMS[slot.id].map(item => `
                      <option value="${item.id}" data-image="${item.image || ''}">${item.name}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="slot-actions">
                  <button type="button" class="enchant-btn" data-slot="${slot.id}" title="エンチャント設定">
                    <img src="${getInviconUrl('enchanted_book')}" alt="Enchant" class="mc-pixelated" width="16" height="16" onerror="this.style.opacity='0.3'">
                    <span class="enchant-count" data-slot="${slot.id}">0</span>
                  </button>
                  <div class="drop-chance-wrapper">
                    <label>Drop:</label>
                    <input type="number" class="drop-chance mc-input" data-slot="${slot.id}"
                           value="8.5" min="0" max="100" step="0.1">%
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ステップ4: 属性設定 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">4</span>
            <h3>属性設定 <span class="optional-badge">任意</span></h3>
          </div>

          <label class="attributes-toggle">
            <input type="checkbox" id="use-attributes">
            <span>属性をカスタマイズ</span>
          </label>

          <div class="attributes-section" id="attributes-section" style="display: none;">
            ${ATTRIBUTES.map(attr => `
              <div class="attribute-row">
                <img src="${attr.image}" alt="${attr.name}" class="attr-icon mc-pixelated" width="24" height="24" onerror="this.style.opacity='0.3'">
                <span class="attr-name">${attr.name}</span>
                <input type="number" class="attr-value mc-input" data-attr="${attr.id}"
                       value="${attr.default}" min="${attr.min}" max="${attr.max}" step="${attr.step}">
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ステップ5: 動作設定（behavior-grid スタイル） -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">5</span>
            <h3>動作設定</h3>
          </div>

          <div class="behavior-grid">
            <label class="behavior-option">
              <input type="checkbox" id="opt-noai">
              <div class="option-content">
                <img src="${getInviconUrl('barrier')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">NoAI</span>
                  <span class="option-desc">動かない・攻撃しない</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="opt-silent">
              <div class="option-content">
                <img src="${getInviconUrl('note_block')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">Silent</span>
                  <span class="option-desc">音を出さない</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="opt-invulnerable">
              <div class="option-content">
                <img src="${getInviconUrl('totem_of_undying')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">無敵</span>
                  <span class="option-desc">ダメージを受けない</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="opt-persistence" checked>
              <div class="option-content">
                <img src="${getInviconUrl('name_tag')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">永続化</span>
                  <span class="option-desc">デスポーンしない</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="opt-canbreakdoors">
              <div class="option-content">
                <img src="${getInviconUrl('oak_door')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">ドア破壊</span>
                  <span class="option-desc">木製ドアを壊せる</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="opt-isbaby">
              <div class="option-content">
                <img src="${getSpawnEggUrl('zombie')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">子供ゾンビ</span>
                  <span class="option-desc">小さく移動が速い</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="opt-glowing">
              <div class="option-content">
                <img src="${getInviconUrl('glowstone_dust')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">発光</span>
                  <span class="option-desc">壁越しでも見える</span>
                </div>
              </div>
            </label>
          </div>
        </section>

        <!-- ステップ6: 名前設定（リッチテキストエディター） -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">6</span>
            <h3>名前設定 <span class="optional-badge">任意</span></h3>
          </div>

          <div class="name-editor-container">
            ${zombieNameEditor.render()}
          </div>
        </section>
      </form>

      <!-- エンチャント設定モーダル -->
      <div class="enchant-modal" id="enchant-modal" style="display: none;">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">エンチャント設定</h3>
            <button type="button" class="modal-close" id="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p class="modal-hint">通常のエンチャントレベルを超えて255まで設定できます。</p>
            <div class="enchant-categories" id="modal-enchant-categories">
              ${Object.entries(ENCHANT_CATEGORIES).map(([catId, cat]) => `
                <div class="enchant-category">
                  <h4>${cat.name}</h4>
                  <div class="enchant-list">
                    ${cat.enchants.map(e => `
                      <div class="enchant-row" data-enchant="${e.id}">
                        <span class="enchant-name">${e.name}</span>
                        <input type="number" class="enchant-level mc-input" data-enchant="${e.id}"
                               value="0" min="0" max="255" placeholder="0">
                        <span class="enchant-max">通常:${e.maxLevel} / 最大:255</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="mc-btn" id="modal-apply">適用</button>
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
  // 状態リセット
  state = {
    zombieType: 'zombie',
    pos: '~ ~ ~',
    equipment: {
      head: { item: '', enchants: [], dropChance: 0.085 },
      chest: { item: '', enchants: [], dropChance: 0.085 },
      legs: { item: '', enchants: [], dropChance: 0.085 },
      feet: { item: '', enchants: [], dropChance: 0.085 },
      mainhand: { item: '', enchants: [], dropChance: 0.085 },
      offhand: { item: '', enchants: [], dropChance: 0.085 },
    },
    attributes: {},
    customName: '',
    nameColor: 'white',
    nameBold: false,
    nameItalic: false,
    nameUnderlined: false,
    nameObfuscated: false,
    glowing: false,
    noAI: false,
    silent: false,
    invulnerable: false,
    persistenceRequired: true,
    canBreakDoors: false,
    isBaby: false,
  };

  // プリセット選択
  delegate(container, 'click', '.preset-card', (e, target) => {
    applyPreset(target.dataset.preset, container);
  });

  // ゾンビタイプ選択
  delegate(container, 'click', '.zombie-type-btn', (e, target) => {
    $$('.zombie-type-btn', container).forEach(btn => btn.classList.remove('active'));
    target.classList.add('active');
    state.zombieType = target.dataset.type;
    updateSelectedZombieDisplay(container);
    updateCommand();
  });

  // 座標プリセット
  delegate(container, 'click', '.coord-preset', (e, target) => {
    $$('.coord-preset', container).forEach(btn => btn.classList.remove('active'));
    target.classList.add('active');
    const pos = target.dataset.pos;
    state.pos = pos;
    $('#zombie-pos', container).value = pos;
    updateCommand();
  });

  // 座標入力
  $('#zombie-pos', container)?.addEventListener('input', debounce((e) => {
    state.pos = e.target.value || '~ ~ ~';
    // カスタム入力時はプリセットのactiveを解除
    $$('.coord-preset', container).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pos === state.pos);
    });
    updateCommand();
  }, 150));

  // 装備選択
  delegate(container, 'change', '.equipment-select', (e, target) => {
    const slot = target.dataset.slot;
    state.equipment[slot].item = target.value;
    updateEquipmentImage(slot, target.value, container);
    updateCommand();
  });

  // ドロップ確率
  delegate(container, 'input', '.drop-chance', debounce((e, target) => {
    const slot = target.dataset.slot;
    state.equipment[slot].dropChance = (parseFloat(target.value) || 0) / 100;
    updateCommand();
  }, 100));

  // エンチャントボタン
  delegate(container, 'click', '.enchant-btn', (e, target) => {
    const slot = target.dataset.slot;
    openEnchantModal(slot, container);
  });

  // 属性トグル
  $('#use-attributes', container)?.addEventListener('change', (e) => {
    $('#attributes-section', container).style.display = e.target.checked ? 'block' : 'none';
    if (!e.target.checked) {
      state.attributes = {};
    } else {
      // デフォルト値を設定
      ATTRIBUTES.forEach(attr => {
        const input = $(`.attr-value[data-attr="${attr.id}"]`, container);
        if (input) {
          state.attributes[attr.id] = parseFloat(input.value);
        }
      });
    }
    updateCommand();
  });

  // 属性値変更
  delegate(container, 'input', '.attr-value', debounce((e, target) => {
    const attrId = target.dataset.attr;
    state.attributes[attrId] = parseFloat(target.value) || 0;
    updateCommand();
  }, 100));

  // オプション変更
  const optionMappings = [
    { id: '#opt-noai', key: 'noAI' },
    { id: '#opt-silent', key: 'silent' },
    { id: '#opt-invulnerable', key: 'invulnerable' },
    { id: '#opt-persistence', key: 'persistenceRequired' },
    { id: '#opt-canbreakdoors', key: 'canBreakDoors' },
    { id: '#opt-isbaby', key: 'isBaby' },
    { id: '#opt-glowing', key: 'glowing' },
  ];

  optionMappings.forEach(({ id, key }) => {
    $(id, container)?.addEventListener('change', (e) => {
      state[key] = e.target.checked;
      updateCommand();
    });
  });

  // リッチテキストエディター初期化（名前設定用）
  if (zombieNameEditor) {
    zombieNameEditor.init(container);
  }

  // モーダル制御
  $('#modal-close', container)?.addEventListener('click', () => closeEnchantModal(container));
  $('.modal-overlay', container)?.addEventListener('click', () => closeEnchantModal(container));
  $('#modal-apply', container)?.addEventListener('click', () => applyEnchantments(container));

  // リセットボタン
  $('#summon-zombie-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期コマンド生成
  updateCommand();
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // 状態をデフォルトに戻す
  state = {
    zombieType: 'zombie',
    pos: '~ ~ ~',
    equipment: {
      head: { item: '', enchants: [], dropChance: 0.085 },
      chest: { item: '', enchants: [], dropChance: 0.085 },
      legs: { item: '', enchants: [], dropChance: 0.085 },
      feet: { item: '', enchants: [], dropChance: 0.085 },
      mainhand: { item: '', enchants: [], dropChance: 0.085 },
      offhand: { item: '', enchants: [], dropChance: 0.085 },
    },
    attributes: {},
    customName: '',
    customNameSNBT: '',
    glowing: false,
    noAI: false,
    silent: false,
    invulnerable: false,
    persistenceRequired: true,
    canBreakDoors: false,
    isBaby: false,
  };

  // 属性セクションを非表示
  $('#use-attributes', container).checked = false;
  $('#attributes-section', container).style.display = 'none';

  // リッチテキストエディターをクリア
  if (zombieNameEditor) {
    zombieNameEditor.clear(container);
  }

  // UIを状態から同期
  syncUIFromState(container);
  updateSelectedZombieDisplay(container);

  // コマンドを更新
  updateCommand();
}

/**
 * 選択中のゾンビ表示を更新
 */
function updateSelectedZombieDisplay(container) {
  const zombieInfo = ZOMBIE_TYPES.find(z => z.id === state.zombieType);
  if (!zombieInfo) return;

  const iconEl = $('#selected-zombie-icon', container);
  const nameEl = $('#selected-zombie-name', container);
  const idEl = $('#selected-zombie-id', container);

  if (iconEl) iconEl.src = getSpawnEggUrl(state.zombieType);
  if (nameEl) nameEl.textContent = zombieInfo.name;
  if (idEl) idEl.textContent = `minecraft:${state.zombieType}`;
}

/**
 * 装備選択時に画像を更新
 */
function updateEquipmentImage(slot, itemId, container) {
  const imageEl = $(`.selected-item-image[data-slot="${slot}"]`, container);
  if (!imageEl) return;

  if (itemId) {
    imageEl.src = getInviconUrl(itemId);
    imageEl.style.display = 'block';
  } else {
    imageEl.style.display = 'none';
  }
}

/**
 * エンチャントモーダルを開く
 */
function openEnchantModal(slot, container) {
  currentEditSlot = slot;
  const modal = $('#enchant-modal', container);
  const slotInfo = EQUIPMENT_SLOTS.find(s => s.id === slot);

  $('#modal-title', container).textContent = `${slotInfo?.name || slot} のエンチャント`;

  // 現在のエンチャント値を設定
  const currentEnchants = state.equipment[slot]?.enchants || [];
  $$('.enchant-level', modal).forEach(input => {
    const enchantId = input.dataset.enchant;
    const current = currentEnchants.find(e => e.id === enchantId);
    input.value = current?.level || 0;
  });

  modal.style.display = 'block';
}

/**
 * エンチャントモーダルを閉じる
 */
function closeEnchantModal(container) {
  const modal = $('#enchant-modal', container);
  modal.style.display = 'none';
  currentEditSlot = null;
}

/**
 * エンチャントを適用
 */
function applyEnchantments(container) {
  if (!currentEditSlot) return;

  const enchants = [];
  $$('.enchant-level', container).forEach(input => {
    const level = parseInt(input.value) || 0;
    if (level > 0) {
      enchants.push({ id: input.dataset.enchant, level });
    }
  });

  state.equipment[currentEditSlot].enchants = enchants;

  // エンチャント数を更新
  const countEl = $(`.enchant-count[data-slot="${currentEditSlot}"]`, container);
  if (countEl) {
    countEl.textContent = enchants.length;
  }

  closeEnchantModal(container);
  updateCommand();
}

/**
 * プリセットを適用
 */
function applyPreset(presetId, container) {
  if (presetId === 'clear') {
    // クリア
    state = {
      zombieType: 'zombie',
      pos: '~ ~ ~',
      equipment: {
        head: { item: '', enchants: [], dropChance: 0.085 },
        chest: { item: '', enchants: [], dropChance: 0.085 },
        legs: { item: '', enchants: [], dropChance: 0.085 },
        feet: { item: '', enchants: [], dropChance: 0.085 },
        mainhand: { item: '', enchants: [], dropChance: 0.085 },
        offhand: { item: '', enchants: [], dropChance: 0.085 },
      },
      attributes: {},
      customName: '',
      customNameSNBT: '',
      glowing: false,
      noAI: false,
      silent: false,
      invulnerable: false,
      persistenceRequired: true,
      canBreakDoors: false,
      isBaby: false,
    };
    // RTEをクリア
    if (zombieNameEditor) {
      zombieNameEditor.clear(container);
    }
  } else {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const config = preset.config;
    state.zombieType = config.zombieType;
    state.customName = config.customName || '';
    state.customNameSNBT = '';  // プリセットではSNBTはリセット
    state.glowing = config.glowing || false;
    state.noAI = config.noAI || false;
    state.invulnerable = config.invulnerable || false;
    state.persistenceRequired = config.persistenceRequired || true;
    state.canBreakDoors = config.canBreakDoors || false;

    // RTEにプリセットの名前を設定
    if (zombieNameEditor && config.customName) {
      zombieNameEditor.setText(config.customName, container);
    } else if (zombieNameEditor) {
      zombieNameEditor.clear(container);
    }

    // 装備
    Object.keys(config.equipment).forEach(slot => {
      const eq = config.equipment[slot];
      state.equipment[slot] = {
        item: eq.item || '',
        enchants: eq.enchants ? [...eq.enchants] : [],
        dropChance: 0.085,
      };
    });

    // 属性
    if (config.attributes && Object.keys(config.attributes).length > 0) {
      state.attributes = { ...config.attributes };
      $('#use-attributes', container).checked = true;
      $('#attributes-section', container).style.display = 'block';
    } else {
      state.attributes = {};
      $('#use-attributes', container).checked = false;
      $('#attributes-section', container).style.display = 'none';
    }
  }

  // UI更新
  syncUIFromState(container);
  updateSelectedZombieDisplay(container);
  updateCommand();
}

/**
 * 状態からUIを同期
 */
function syncUIFromState(container) {
  // ゾンビタイプ
  $$('.zombie-type-btn', container).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === state.zombieType);
  });

  // 座標
  $('#zombie-pos', container).value = state.pos;

  // 装備
  EQUIPMENT_SLOTS.forEach(slot => {
    const select = $(`.equipment-select[data-slot="${slot.id}"]`, container);
    const itemId = state.equipment[slot.id]?.item || '';
    if (select) {
      select.value = itemId;
    }

    // 装備画像を更新
    updateEquipmentImage(slot.id, itemId, container);

    const dropInput = $(`.drop-chance[data-slot="${slot.id}"]`, container);
    if (dropInput) {
      dropInput.value = (state.equipment[slot.id]?.dropChance || 0.085) * 100;
    }

    const countEl = $(`.enchant-count[data-slot="${slot.id}"]`, container);
    if (countEl) {
      countEl.textContent = state.equipment[slot.id]?.enchants?.length || 0;
    }
  });

  // 属性
  ATTRIBUTES.forEach(attr => {
    const input = $(`.attr-value[data-attr="${attr.id}"]`, container);
    if (input && state.attributes[attr.id] !== undefined) {
      input.value = state.attributes[attr.id];
    }
  });

  // オプション
  $('#opt-noai', container).checked = state.noAI;
  $('#opt-silent', container).checked = state.silent;
  $('#opt-invulnerable', container).checked = state.invulnerable;
  $('#opt-persistence', container).checked = state.persistenceRequired;
  $('#opt-canbreakdoors', container).checked = state.canBreakDoors;
  $('#opt-isbaby', container).checked = state.isBaby;
  $('#opt-glowing', container).checked = state.glowing;
}

/**
 * コマンドを生成・更新
 */
function updateCommand() {
  const command = generateSummonZombieCommand(state);
  setOutput(command, 'summon-zombie', state);
}

/**
 * /summon コマンドを生成
 * 1.21.5+: CustomNameはSNBT形式 {text:"...",color:"red"}
 * 1.13-1.21.4: CustomNameはJSON文字列形式 '{"text":"...","color":"red"}'
 * NBT: エンティティタグはPascalCase (CustomName, Attributes, ArmorItems, HandItems)
 * 属性ID: minecraft:generic.max_health（generic.プレフィックス必須）
 */
function generateSummonZombieCommand(s) {
  const entityId = `minecraft:${s.zombieType}`;
  const nbtParts = [];

  // 現在のバージョンを取得
  const version = workspaceStore.get('version') || '1.21';
  // 1.21.5以降: SNBTオブジェクト形式
  const useSNBT = compareVersions(version, '1.21.5') >= 0;

  // カスタム名（バージョンで形式が異なる）
  if (s.customName) {
    if (useSNBT) {
      // 1.21.5+ SNBTオブジェクト形式（コロン区切り、クォートなし）
      const snbtName = zombieNameEditor?.getSNBT() || generateCustomNameSNBT(s);
      nbtParts.push(`CustomName:${snbtName}`);
    } else {
      // 1.13-1.21.4 JSON文字列形式（シングルクォートで囲む）
      const jsonName = zombieNameEditor?.getJSON() || generateCustomNameJSON(s);
      nbtParts.push(`CustomName:'${jsonName}'`);
    }
  }

  // オプション（1.21+ エンティティタグはPascalCase）
  if (s.noAI) nbtParts.push('NoAI:1b');
  if (s.silent) nbtParts.push('Silent:1b');
  if (s.invulnerable) nbtParts.push('Invulnerable:1b');
  if (s.persistenceRequired) nbtParts.push('PersistenceRequired:1b');
  if (s.glowing) nbtParts.push('Glowing:1b');
  if (s.isBaby) nbtParts.push('IsBaby:1b');
  if (s.canBreakDoors) nbtParts.push('CanBreakDoors:1b');

  // 装備（1.21.5+はequipment形式、それ以前はArmorItems/HandItems形式）
  const equipmentItems = buildEquipmentNBT(s.equipment, version);
  if (equipmentItems) {
    nbtParts.push(equipmentItems);
    // 装備を確実に保持するため、他のアイテムを拾わないようにする
    nbtParts.push('CanPickUpLoot:0b');
  }

  // ドロップ確率
  const dropChances = buildDropChancesNBT(s.equipment);
  if (dropChances) {
    nbtParts.push(dropChances);
  }

  // 属性
  if (Object.keys(s.attributes).length > 0) {
    const attributesNBT = buildAttributesNBT(s.attributes);
    if (attributesNBT) {
      nbtParts.push(attributesNBT);
    }
    // max_healthを設定した場合、現在の体力も設定
    if (s.attributes.max_health) {
      nbtParts.push(`Health:${s.attributes.max_health}f`);
    }
  }

  // コマンド構築
  let command = `/summon ${entityId} ${s.pos}`;

  if (nbtParts.length > 0) {
    command += ` {${nbtParts.join(',')}}`;
  }

  return command;
}

/**
 * 装備NBTを生成
 * 1.21.5+: equipment マップ形式（新形式）
 * 1.20.5-1.21.4: ArmorItems/HandItems リスト形式（旧形式）
 */
function buildEquipmentNBT(equipment, version = '1.21.5') {
  // 1.21.5以降はequipmentマップ形式を使用
  const useNewFormat = compareVersions(version, '1.21.5') >= 0;

  if (useNewFormat) {
    // 1.21.5+ equipment形式
    // equipment:{mainhand:{id:"...",count:1},head:{id:"...",count:1},...}
    const equipmentParts = [];
    const slots = ['mainhand', 'offhand', 'head', 'chest', 'legs', 'feet'];

    slots.forEach(slot => {
      const eq = equipment[slot];
      if (eq?.item) {
        equipmentParts.push(`${slot}:${buildItemNBT(eq.item, eq.enchants)}`);
      }
    });

    if (equipmentParts.length === 0) return null;
    return `equipment:{${equipmentParts.join(',')}}`;
  } else {
    // 1.20.5-1.21.4 ArmorItems/HandItems形式
    const armorItems = [];
    const handItems = [];

    // 足から頭の順（ArmorItemsの順序）
    ['feet', 'legs', 'chest', 'head'].forEach(slot => {
      const eq = equipment[slot];
      if (eq?.item) {
        armorItems.push(buildItemNBT(eq.item, eq.enchants));
      } else {
        armorItems.push('{}');
      }
    });

    // メイン手、オフハンドの順
    ['mainhand', 'offhand'].forEach(slot => {
      const eq = equipment[slot];
      if (eq?.item) {
        handItems.push(buildItemNBT(eq.item, eq.enchants));
      } else {
        handItems.push('{}');
      }
    });

    const parts = [];
    const hasArmor = armorItems.some(i => i !== '{}');
    const hasHands = handItems.some(i => i !== '{}');

    if (hasArmor) {
      parts.push(`ArmorItems:[${armorItems.join(',')}]`);
    }

    if (hasHands) {
      parts.push(`HandItems:[${handItems.join(',')}]`);
    }

    return parts.length > 0 ? parts.join(',') : null;
  }
}

/**
 * アイテムNBTを生成（1.21.5+ アイテムコンポーネント形式）
 * 1.21.5以降はlevelsラッパー不要
 * 形式: {id:"minecraft:diamond_sword",count:1,components:{"minecraft:enchantments":{"minecraft:sharpness":5}}}
 */
function buildItemNBT(itemId, enchants) {
  // 1.20.5+/1.21+: count は小文字で整数型
  // エンチャントがある場合のみcomponentsを追加

  // エンチャント（1.21.5+ コンポーネント形式）
  // 1.21.5以降はlevelsラッパーが削除された
  // 形式: components:{"minecraft:enchantments":{"minecraft:sharpness":5}}
  if (enchants && enchants.length > 0) {
    const enchantPairs = enchants.map(e => `"minecraft:${e.id}":${e.level}`).join(',');
    return `{id:"minecraft:${itemId}",count:1,components:{"minecraft:enchantments":{${enchantPairs}}}}`;
  }

  // エンチャントなしの場合はシンプルな形式
  return `{id:"minecraft:${itemId}",count:1}`;
}

/**
 * ドロップ確率NBTを生成（1.21+ PascalCase）
 */
function buildDropChancesNBT(equipment) {
  // ArmorDropChances: [feet, legs, chest, head]
  // HandDropChances: [mainhand, offhand]

  const armorDrops = ['feet', 'legs', 'chest', 'head'].map(slot => {
    return `${equipment[slot]?.dropChance || 0.085}f`;
  });

  const handDrops = ['mainhand', 'offhand'].map(slot => {
    return `${equipment[slot]?.dropChance || 0.085}f`;
  });

  const parts = [];
  parts.push(`ArmorDropChances:[${armorDrops.join(',')}]`);
  parts.push(`HandDropChances:[${handDrops.join(',')}]`);

  return parts.join(',');
}

/**
 * 属性NBTを生成（1.21+ id/base形式、generic.プレフィックス必須）
 * 形式: Attributes:[{id:"minecraft:generic.max_health",base:100d}]
 *
 * 注意: 1.21.xでは generic. プレフィックスは必須です
 * - 旧形式: generic.maxHealth (camelCase)
 * - 新形式: generic.max_health (snake_case)
 */
function buildAttributesNBT(attributes) {
  const attrList = [];

  Object.entries(attributes).forEach(([id, value]) => {
    const attrInfo = ATTRIBUTES.find(a => a.id === id);
    if (!attrInfo) return;

    // 属性IDのマッピング（1.21+ 形式: minecraft:generic.xxx または minecraft:zombie.xxx）
    // generic. プレフィックスは必須
    const attrId = id === 'max_health' ? 'minecraft:generic.max_health' :
                   id === 'attack_damage' ? 'minecraft:generic.attack_damage' :
                   id === 'movement_speed' ? 'minecraft:generic.movement_speed' :
                   id === 'knockback_resistance' ? 'minecraft:generic.knockback_resistance' :
                   id === 'armor' ? 'minecraft:generic.armor' :
                   id === 'armor_toughness' ? 'minecraft:generic.armor_toughness' :
                   id === 'follow_range' ? 'minecraft:generic.follow_range' :
                   id === 'spawn_reinforcements' ? 'minecraft:zombie.spawn_reinforcements' :
                   `minecraft:generic.${id}`;

    // 1.21+: Attributes配列内はid/base形式
    attrList.push(`{id:"${attrId}",base:${value}d}`);
  });

  if (attrList.length === 0) return null;

  // エンティティNBTは Attributes（PascalCase）が正しい
  return `Attributes:[${attrList.join(',')}]`;
}

/**
 * カスタム名のJSON Text Componentを生成
 * CustomNameはJSON形式の文字列（SNBTではない）
 *
 * 注意: CustomNameはデフォルトで斜体になるため、italic:falseを設定
 * 複数色の場合は配列形式で、最初に空のベースコンポーネントを追加
 */
function generateCustomNameJSON(s) {
  // RTEのcharactersがあればそれを使用
  if (typeof zombieNameEditor !== 'undefined' && zombieNameEditor && zombieNameEditor.characters && zombieNameEditor.characters.length > 0) {
    const groups = zombieNameEditor.getFormattedGroups();
    if (groups.length === 0) {
      return `{"text":"${escapeJSON(s.customName)}","italic":false}`;
    }

    if (groups.length === 1) {
      return formatGroupToJSON(groups[0]);
    }

    // 複数グループの場合は配列形式
    // 最初に空のベースコンポーネントを追加して斜体を解除
    const components = groups.map(g => formatGroupToJSON(g));
    return `[{"text":"","italic":false},${components.join(',')}]`;
  }

  // フォールバック: プレーンテキスト
  return `{"text":"${escapeJSON(s.customName)}","italic":false}`;
}

/**
 * グループをJSON形式に変換
 */
function formatGroupToJSON(group) {
  const parts = [`"text":"${escapeJSON(group.text)}"`];
  parts.push(`"italic":false`);

  if (group.color && group.color !== 'white') {
    parts.push(`"color":"${group.color}"`);
  }
  if (group.bold) parts.push(`"bold":true`);
  if (group.italic) {
    // italic:falseを上書き
    const idx = parts.indexOf(`"italic":false`);
    if (idx !== -1) parts[idx] = `"italic":true`;
  }
  if (group.underlined) parts.push(`"underlined":true`);
  if (group.strikethrough) parts.push(`"strikethrough":true`);
  if (group.obfuscated) parts.push(`"obfuscated":true`);

  return `{${parts.join(',')}}`;
}

/**
 * カスタム名のSNBT Text Componentを生成（1.21.5+用）
 * CustomNameはSNBT形式のオブジェクト（クォートで囲まない）
 *
 * 注意: CustomNameはデフォルトで斜体になるため、italic:falseを設定
 * 複数色の場合は配列形式で、最初に空のベースコンポーネントを追加
 */
function generateCustomNameSNBT(s) {
  // RTEのcharactersがあればそれを使用
  if (typeof zombieNameEditor !== 'undefined' && zombieNameEditor && zombieNameEditor.characters && zombieNameEditor.characters.length > 0) {
    const groups = zombieNameEditor.getFormattedGroups();
    if (groups.length === 0) {
      return `{text:"${escapeJSON(s.customName)}",italic:false}`;
    }

    if (groups.length === 1) {
      return formatGroupToSNBT(groups[0]);
    }

    // 複数グループの場合は配列形式
    // 最初に空のベースコンポーネントを追加して斜体を解除
    const components = groups.map(g => formatGroupToSNBT(g));
    return `[{text:"",italic:false},${components.join(',')}]`;
  }

  // フォールバック: プレーンテキスト
  return `{text:"${escapeJSON(s.customName)}",italic:false}`;
}

/**
 * グループをSNBT形式に変換（1.21.5+用）
 * SNBT形式: キーはクォートなし、値は文字列のみクォート
 */
function formatGroupToSNBT(group) {
  const parts = [`text:"${escapeJSON(group.text)}"`];
  parts.push(`italic:false`);

  if (group.color && group.color !== 'white') {
    parts.push(`color:"${group.color}"`);
  }
  if (group.bold) parts.push(`bold:true`);
  if (group.italic) {
    // italic:falseを上書き
    const idx = parts.indexOf(`italic:false`);
    if (idx !== -1) parts[idx] = `italic:true`;
  }
  if (group.underlined) parts.push(`underlined:true`);
  if (group.strikethrough) parts.push(`strikethrough:true`);
  if (group.obfuscated) parts.push(`obfuscated:true`);

  return `{${parts.join(',')}}`;
}

/**
 * JSON文字列をエスケープ
 */
function escapeJSON(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  /* Minecraft Wiki画像共通スタイル */
  .mc-wiki-image {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    object-fit: contain;
  }

  .summon-zombie-tool .version-badge {
    background: linear-gradient(180deg, #f2c13d 0%, #d4a12a 100%);
    color: #1a1a2e;
    padding: 6px 12px;
    font-weight: bold;
    font-size: 0.8rem;
    border: 2px solid #8b6914;
    position: relative;
    z-index: 1;
  }

  /* フォームラベル */
  .summon-zombie-tool .form-group > label {
    display: block;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: var(--mc-space-sm);
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  }

  /* 汎用入力フィールド */
  .summon-zombie-tool .mc-input {
    background: #2a2a2a;
    color: #ffffff;
    border: 2px solid #444444;
    border-radius: 4px;
    padding: 10px 14px;
    font-size: 0.95rem;
    width: 100%;
  }

  .summon-zombie-tool .mc-input:focus {
    border-color: var(--mc-color-grass-main);
    outline: none;
    box-shadow: 0 0 0 3px rgba(92, 183, 70, 0.3);
  }

  .summon-zombie-tool .mc-input::placeholder {
    color: #888888;
  }

  /* プリセット */
  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-sm);
  }

  .preset-btn {
    padding: 8px 16px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.15s;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
  }

  .preset-btn:hover {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: var(--mc-color-grass-main);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .preset-btn.preset-clear {
    background: linear-gradient(180deg, #e04040 0%, #c80000 100%);
    border-color: #a00000;
    color: white;
  }

  .preset-btn.preset-clear:hover {
    background: linear-gradient(180deg, #ff5050 0%, #e00000 100%);
    border-color: #c80000;
  }

  /* ゾンビタイプ選択 */
  .zombie-type-selector {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-md);
  }

  .zombie-type-btn {
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
    min-width: 90px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .zombie-type-btn:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }

  .zombie-type-btn.active {
    background: linear-gradient(180deg, rgba(92, 183, 70, 0.4) 0%, rgba(58, 129, 40, 0.4) 100%);
    border-color: var(--mc-color-grass-main);
    box-shadow: 0 0 12px rgba(92, 183, 70, 0.4);
  }

  .zombie-type-btn .type-icon {
    width: 40px;
    height: 40px;
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
  }

  .zombie-type-btn .type-name {
    font-size: 0.8rem;
    color: #ffffff;
    font-weight: 500;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
  }

  /* 装備選択ラッパー */
  .equipment-select-wrapper {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-sm);
  }

  .equipment-select-wrapper .selected-item-image {
    flex-shrink: 0;
    border-radius: 4px;
    background: #222222;
    padding: 2px;
  }

  .equipment-select-wrapper .equipment-select {
    flex: 1;
    margin-bottom: 0;
    background: #2a2a2a;
    color: #ffffff;
    border: 2px solid #444444;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 0.9rem;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
  }

  .equipment-select-wrapper .equipment-select:hover {
    border-color: #666666;
    background-color: #333333;
  }

  .equipment-select-wrapper .equipment-select:focus {
    border-color: var(--mc-color-grass-main);
    outline: none;
    box-shadow: 0 0 0 2px rgba(92, 183, 70, 0.3);
  }

  .equipment-select-wrapper .equipment-select option {
    background: #2a2a2a;
    color: #ffffff;
    padding: 8px;
  }

  /* 装備設定 */
  .equipment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .equipment-slot {
    padding: 16px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.15s ease;
  }

  .equipment-slot:hover {
    border-color: rgba(92, 183, 70, 0.5);
    background: rgba(0,0,0,0.4);
  }

  .slot-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .slot-name {
    color: #ffffff;
    font-weight: 600;
    font-size: 1rem;
  }

  .slot-header .slot-icon {
    width: 32px;
    height: 32px;
    filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
  }

  .equipment-slot > .equipment-select {
    width: 100%;
    font-size: 0.95rem;
    padding: 8px 12px;
  }

  .slot-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 4px;
  }

  .enchant-btn {
    padding: 8px 14px;
    background: rgba(170, 0, 255, 0.2);
    border: 2px solid rgba(170, 0, 255, 0.5);
    border-radius: 4px;
    color: #cc66ff;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
  }

  .enchant-btn img {
    width: 20px;
    height: 20px;
  }

  .enchant-btn:hover {
    background: rgba(170, 0, 255, 0.3);
    border-color: #cc66ff;
  }

  .enchant-btn:active {
    transform: translateY(1px);
  }

  .enchant-count {
    font-size: 0.9rem;
    font-weight: bold;
  }

  .drop-chance-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.8);
  }

  .drop-chance-wrapper label {
    color: #cccccc;
  }

  .drop-chance {
    width: 70px;
    background: #1a1a2e;
    color: #ffffff;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 0.95rem;
    text-align: center;
  }

  .drop-chance:focus {
    border-color: var(--mc-color-grass-main);
    outline: none;
    box-shadow: 0 0 0 2px rgba(92, 183, 70, 0.3);
  }

  /* 属性設定 */
  .attributes-section {
    margin-top: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%);
    border: 2px solid #4a4a4a;
    border-radius: 6px;
  }

  .attribute-row {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: 8px 4px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .attribute-row:last-child {
    border-bottom: none;
  }

  .attribute-row .attr-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .attribute-row .attr-name {
    flex: 1;
    font-size: 0.9rem;
    color: #ffffff;
    font-weight: 500;
  }

  .attribute-row .attr-value {
    width: 100px;
    background: #2a2a2a;
    color: #ffffff;
    border: 2px solid #444444;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 0.9rem;
    text-align: center;
  }

  .attribute-row .attr-value:focus {
    border-color: var(--mc-color-grass-main);
    outline: none;
    box-shadow: 0 0 0 2px rgba(92, 183, 70, 0.3);
  }

  /* オプション */
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--mc-space-md);
    padding: var(--mc-space-sm);
    background: rgba(0,0,0,0.2);
    border-radius: 6px;
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    font-size: 0.9rem;
    cursor: pointer;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.15s;
  }

  .option-label:hover {
    background: rgba(255,255,255,0.1);
  }

  .option-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--mc-color-grass-main);
    cursor: pointer;
  }

  /* モーダル */
  .enchant-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
  }

  .modal-content {
    position: relative;
    background: var(--mc-bg-panel);
    border: 2px solid var(--mc-border-dark);
    max-width: 500px;
    max-height: 80vh;
    width: 90%;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--mc-space-md);
    border-bottom: 1px solid var(--mc-border-dark);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--mc-text-secondary);
    line-height: 1;
  }

  .modal-close:hover {
    color: var(--mc-color-redstone);
  }

  .modal-body {
    padding: var(--mc-space-md);
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: var(--mc-space-md);
    border-top: 1px solid var(--mc-border-dark);
    text-align: right;
  }

  .enchant-category {
    margin-bottom: var(--mc-space-md);
  }

  .enchant-category h4 {
    margin: 0 0 var(--mc-space-sm) 0;
    font-size: 0.85rem;
    color: var(--mc-color-grass-main);
  }

  .enchant-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .enchant-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
  }

  .enchant-row:hover {
    background: rgba(0,0,0,0.4);
    border-color: rgba(170, 0, 255, 0.3);
  }

  .enchant-row .enchant-name {
    flex: 1;
    font-size: 1rem;
    font-weight: 500;
  }

  .enchant-row .enchant-level {
    width: 70px;
    padding: 8px 10px;
    font-size: 1rem;
    text-align: center;
  }

  .enchant-row .enchant-max {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.5);
    min-width: 100px;
    text-align: right;
  }

  .modal-hint {
    color: #55ffff;
    font-size: 0.9rem;
    margin: 0 0 16px 0;
    padding: 10px 14px;
    background: rgba(85, 255, 255, 0.1);
    border: 1px solid rgba(85, 255, 255, 0.3);
    border-radius: 4px;
  }

  /* ===== 新UI要素（summonツール統一デザイン） ===== */

  /* セクション構造（summonツール統一） */
  .summon-zombie-tool .form-section.mc-section {
    background: rgba(255,255,255,0.05);
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .summon-zombie-tool .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .summon-zombie-tool .step-number {
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
    border: 2px solid #2d5016;
  }

  .summon-zombie-tool .section-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
    flex: 1;
  }

  .summon-zombie-tool .optional-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 3px;
    font-weight: normal;
    background: rgba(77, 236, 242, 0.2);
    color: #4decf2;
  }

  /* プリセットカード */
  .preset-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
  }

  .preset-card {
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
    text-align: center;
  }

  .preset-card:hover {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: var(--mc-color-grass-main);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(92, 183, 70, 0.4);
  }

  .preset-card.preset-clear {
    background: linear-gradient(180deg, #e04040 0%, #c80000 100%);
    border-color: #a00000;
  }

  .preset-card.preset-clear:hover {
    background: linear-gradient(180deg, #ff5050 0%, #e00000 100%);
    border-color: #c80000;
  }

  .preset-card .preset-icon {
    width: 40px;
    height: 40px;
  }

  .preset-card .preset-name {
    font-weight: bold;
    color: #ffffff;
    font-size: 0.9rem;
  }

  .preset-card .preset-desc {
    font-size: 0.7rem;
    color: #aaaaaa;
    line-height: 1.3;
  }

  /* 選択中エンティティ表示 */
  .selected-entity-display {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: rgba(92, 183, 70, 0.15);
    border: 2px solid var(--mc-color-grass-main);
    border-radius: 8px;
    margin-top: var(--mc-space-md);
  }

  .selected-entity-icon {
    width: 48px;
    height: 48px;
  }

  .selected-entity-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .selected-entity-name {
    font-weight: bold;
    color: #ffffff;
    font-size: 1.1rem;
  }

  .selected-entity-id {
    font-size: 0.8rem;
    color: #aaaaaa;
    background: rgba(0,0,0,0.3);
    padding: 2px 8px;
    border-radius: 4px;
  }

  /* 座標入力 */
  .coordinate-input {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-md);
  }

  .coord-preset-btns {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-sm);
  }

  .coord-preset {
    padding: 8px 16px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.15s;
  }

  .coord-preset:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .coord-preset.active {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: var(--mc-color-grass-main);
  }

  .coord-preset code {
    background: rgba(0,0,0,0.3);
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: 4px;
    font-size: 0.8rem;
  }

  .coord-custom {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
  }

  .coord-custom label {
    color: #cccccc;
    font-size: 0.9rem;
  }

  .coord-input {
    flex: 1;
    max-width: 200px;
  }

  /* 動作設定（behavior-grid） */
  .behavior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--mc-space-md);
  }

  .behavior-option {
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

  .behavior-option:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .behavior-option:has(input:checked) {
    background: linear-gradient(180deg, rgba(92, 183, 70, 0.3) 0%, rgba(58, 129, 40, 0.3) 100%);
    border-color: var(--mc-color-grass-main);
  }

  .behavior-option input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--mc-color-grass-main);
  }

  .option-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    flex: 1;
  }

  .option-icon {
    width: 32px;
    height: 32px;
  }

  .option-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-name {
    font-weight: bold;
    color: #ffffff;
    font-size: 0.9rem;
  }

  .option-desc {
    font-size: 0.75rem;
    color: #aaaaaa;
  }

  /* 属性トグル */
  .attributes-toggle {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: var(--mc-space-md);
  }

  .attributes-toggle input {
    width: 18px;
    height: 18px;
    accent-color: var(--mc-color-grass-main);
  }

  .attributes-toggle span {
    color: #ffffff;
    font-weight: 500;
  }

  /* 名前エディター（リッチテキストUI改善） */
  .summon-zombie-tool .name-editor {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-md);
  }

  .summon-zombie-tool .name-input {
    font-size: 1.1rem;
    padding: var(--mc-space-md);
    background: #2a2a2a;
    color: #ffffff;
    border: 2px solid #444444;
    border-radius: 4px;
  }

  .summon-zombie-tool .name-input:focus {
    border-color: var(--mc-color-grass-main);
    outline: none;
    box-shadow: 0 0 0 3px rgba(92, 183, 70, 0.3);
  }

  .summon-zombie-tool .name-input::placeholder {
    color: #888888;
  }

  .summon-zombie-tool .name-style-options {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 16px;
    padding: var(--mc-space-md);
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .summon-zombie-tool .color-selector {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
  }

  .summon-zombie-tool .color-selector label {
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    display: block;
    margin-bottom: 8px;
  }

  .summon-zombie-tool .color-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
  }

  .summon-zombie-tool .color-btn {
    width: 28px;
    height: 28px;
    border: 2px solid rgba(255,255,255,0.2);
    cursor: pointer;
    transition: all 0.15s;
  }

  .summon-zombie-tool .color-btn:hover {
    transform: scale(1.15);
    border-color: rgba(255,255,255,0.5);
    z-index: 1;
  }

  .summon-zombie-tool .color-btn.active {
    border-color: #ffffff;
    box-shadow: 0 0 6px rgba(255,255,255,0.5);
    transform: scale(1.1);
  }

  .summon-zombie-tool .text-style-btns {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
  }

  .summon-zombie-tool .text-style-btns-label {
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  .summon-zombie-tool .text-style-btns-row {
    display: flex;
    gap: 4px;
  }

  .summon-zombie-tool .style-btn {
    width: 36px;
    height: 36px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .summon-zombie-tool .style-btn:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
    color: #ffffff;
  }

  .summon-zombie-tool .style-btn.active {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: var(--mc-color-grass-main);
    color: #ffffff;
  }

  /* 名前プレビュー（Minecraft風デザイン） */
  .summon-zombie-tool .name-preview {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md) var(--mc-space-lg);
    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
    border: 3px solid #444444;
    border-radius: 4px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
  }

  .summon-zombie-tool .preview-label {
    color: #888888;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .summon-zombie-tool .preview-text {
    font-size: 1.2rem;
    color: #ffffff;
    font-family: 'Minecraft', monospace;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
  }

  .preview-text.obfuscated {
    animation: obfuscate 0.1s infinite;
  }

  @keyframes obfuscate {
    0% { content: '▓▒░▓▒░'; }
    50% { content: '░▒▓░▒▓'; }
    100% { content: '▒░▓▒░▓'; }
  }

  /* ヘッダー（summonツール統一 - mc-header-banner） */
  .summon-zombie-tool .mc-header-banner {
    background: linear-gradient(90deg, #2d5016 0%, #3a6b1e 50%, #2d5016 100%);
    padding: 20px 24px;
    margin: -16px -16px 24px -16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #1a3009;
    position: relative;
  }

  .summon-zombie-tool .mc-header-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23000' opacity='0.1'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .summon-zombie-tool .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .summon-zombie-tool .header-icon {
    width: 48px;
    height: 48px;
    filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.5));
  }

  .summon-zombie-tool .header-text h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: bold;
    text-shadow: 2px 2px 0 #1a3009;
  }

  .summon-zombie-tool .header-subtitle {
    margin: 4px 0 0 0;
    color: rgba(255,255,255,0.8);
    font-size: 0.85rem;
  }

  .summon-zombie-tool .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .summon-zombie-tool .reset-btn {
    background: linear-gradient(180deg, #e04040 0%, #c80000 100%);
    color: white;
    border: 2px solid #a00000;
    padding: 8px 16px;
    font-weight: bold;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .summon-zombie-tool .reset-btn:hover {
    background: linear-gradient(180deg, #ff5050 0%, #e00000 100%);
    border-color: #c80000;
    transform: translateY(-1px);
  }

  @media (max-width: 600px) {
    .summon-zombie-tool .zombie-type-selector {
      justify-content: center;
    }

    .summon-zombie-tool .equipment-grid {
      grid-template-columns: 1fr;
    }

    .summon-zombie-tool .behavior-grid {
      grid-template-columns: 1fr;
    }

    .summon-zombie-tool .preset-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .summon-zombie-tool .color-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .summon-zombie-tool .name-style-options {
      flex-direction: column;
      gap: var(--mc-space-md);
    }

    .summon-zombie-tool .text-style-btns {
      width: 100%;
    }

    .summon-zombie-tool .text-style-btns-row {
      justify-content: flex-start;
    }

    .summon-zombie-tool .header-actions {
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
  }

  /* ダークモードでのコントラスト改善（緑/暗緑テーマ - ゾンビ肌） */
  @media (prefers-color-scheme: dark) {
    .summon-zombie-tool .modal-content {
      background: #252520;
      border-color: #555;
    }

    .summon-zombie-tool .modal-header {
      border-bottom-color: #444;
    }

    .summon-zombie-tool .modal-header h3 {
      color: #e0e0e0;
    }

    .summon-zombie-tool .modal-close {
      color: #b0b0b0;
    }

    .summon-zombie-tool .modal-close:hover {
      color: #ff5555;
    }

    .summon-zombie-tool .modal-body {
      background: #1a1a1a;
    }

    .summon-zombie-tool .modal-footer {
      border-top-color: #444;
    }

    .summon-zombie-tool .enchant-category h4 {
      color: #5cb746;
    }

    .summon-zombie-tool .enchant-row {
      background: #2a2a2a;
    }

    .summon-zombie-tool .enchant-row .enchant-name {
      color: #e0e0e0;
    }

    .summon-zombie-tool .enchant-row .enchant-max {
      color: #888;
    }

    .summon-zombie-tool .enchant-row .mc-input {
      background: #1a1a1a;
      color: #e8e8e8;
      border-color: #444;
    }

    .summon-zombie-tool .mc-btn {
      background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
      color: white;
      border-color: #2d5016;
    }

    .summon-zombie-tool .mc-btn:hover {
      background: linear-gradient(180deg, #6dc756 0%, #4a9138 100%);
    }

    /* リッチテキストエディターのダークモード */
    .summon-zombie-tool .name-style-options {
      background: rgba(0,0,0,0.3);
      border-color: rgba(255,255,255,0.05);
    }

    .summon-zombie-tool .color-selector label,
    .summon-zombie-tool .text-style-btns-label {
      color: #c0c0c0;
    }

    .summon-zombie-tool .name-preview {
      background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
      border-color: #333;
    }

    .summon-zombie-tool .preview-label {
      color: #a0a0a0;
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
