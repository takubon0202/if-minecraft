/**
 * Enchant Tool - UI (minecraft-blog.net参考)
 * 全42種エンチャント、属性追加、プレビュー機能
 * 最大レベル255対応、Minecraft Wiki画像対応
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { applyTooltip } from '../../core/mc-tooltip.js';
import { getVersionGroup, getVersionNote, compareVersions, ENCHANT_ID_MAP } from '../../core/version-compat.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';

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
  spear: 'netherite_spear',
  fishing: 'fishing_rod',
  universal: 'enchanted_book',
  curse: 'wither_skeleton_skull',
};

// 全43種エンチャント（カテゴリ別）- defaultMaxはMinecraftのデフォルト最大レベル
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
    ]
  },
  mace: {
    name: 'メイス',
    iconItem: 'mace',
    enchants: [
      { id: 'density', name: '重撃', en: 'Density', defaultMax: 5, desc: '落下距離1ブロックあたり+0.5ダメージ（レベルごと）' },
      { id: 'breach', name: '防具貫通', en: 'Breach', defaultMax: 4, desc: '防具によるダメージ軽減を15%×レベル無視' },
      { id: 'wind_burst', name: 'ウィンドバースト', en: 'Wind Burst', defaultMax: 3, desc: 'スマッシュ攻撃時に使用者を打ち上げ（レベル×7ブロック）' },
      { id: 'smite', name: 'アンデッド特効', en: 'Smite', defaultMax: 5, desc: 'アンデッド系に追加ダメージ' },
      { id: 'bane_of_arthropods', name: '虫特効', en: 'Bane of Arthropods', defaultMax: 5, desc: '虫系に追加ダメージ' },
      { id: 'fire_aspect', name: '火属性', en: 'Fire Aspect', defaultMax: 2, desc: '攻撃対象に発火' },
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
  spear: {
    name: '槍',
    iconItem: 'netherite_spear',
    enchants: [
      { id: 'lunge', name: '突進', en: 'Lunge', defaultMax: 3, desc: '突き攻撃時に前方へ突進（レベルごとに距離増加）' },
      { id: 'sharpness', name: 'ダメージ増加', en: 'Sharpness', defaultMax: 5, desc: '近接攻撃ダメージ増加' },
      { id: 'smite', name: 'アンデッド特効', en: 'Smite', defaultMax: 5, desc: 'アンデッド系に追加ダメージ' },
      { id: 'bane_of_arthropods', name: '虫特効', en: 'Bane of Arthropods', defaultMax: 5, desc: '虫系に追加ダメージ' },
      { id: 'knockback', name: 'ノックバック', en: 'Knockback', defaultMax: 2, desc: '攻撃時のノックバック増加' },
      { id: 'fire_aspect', name: '火属性', en: 'Fire Aspect', defaultMax: 2, desc: '攻撃対象に発火' },
      { id: 'looting', name: 'ドロップ増加', en: 'Looting', defaultMax: 3, desc: 'Mobのドロップ増加' },
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
  mace: {
    name: 'メイス',
    items: [
      { id: 'mace', name: 'メイス' },
    ]
  },
  spear: {
    name: '槍',
    items: [
      { id: 'wooden_spear', name: '木の槍' },
      { id: 'stone_spear', name: '石の槍' },
      { id: 'copper_spear', name: '銅の槍' },
      { id: 'iron_spear', name: '鉄の槍' },
      { id: 'golden_spear', name: '金の槍' },
      { id: 'diamond_spear', name: 'ダイヤの槍' },
      { id: 'netherite_spear', name: 'ネザライトの槍' },
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

// 属性（1.21+対応 - slot必須）
const ATTRIBUTES = [
  { id: 'generic.max_health', name: '最大体力', iconItem: 'golden_apple', default: 20, defaultSlot: 'any', step: 1 },
  { id: 'generic.movement_speed', name: '移動速度', iconItem: 'sugar', default: 0.1, defaultSlot: 'feet', step: 0.01 },
  { id: 'generic.attack_damage', name: '攻撃力', iconItem: 'netherite_sword', default: 10, defaultSlot: 'mainhand', step: 1 },
  { id: 'generic.attack_speed', name: '攻撃速度', iconItem: 'clock', default: 4, defaultSlot: 'mainhand', step: 0.1 },
  { id: 'generic.armor', name: '防御力', iconItem: 'shield', default: 10, defaultSlot: 'chest', step: 1 },
  { id: 'generic.armor_toughness', name: '防具強度', iconItem: 'diamond', default: 5, defaultSlot: 'chest', step: 1 },
  { id: 'generic.knockback_resistance', name: 'ノックバック耐性', iconItem: 'netherite_boots', default: 1, defaultSlot: 'chest', step: 0.1 },
  { id: 'generic.luck', name: '幸運', iconItem: 'rabbit_foot', default: 5, defaultSlot: 'mainhand', step: 1 },
  { id: 'generic.attack_knockback', name: '攻撃ノックバック', iconItem: 'slime_ball', default: 5, defaultSlot: 'mainhand', step: 0.5 },
  { id: 'generic.flying_speed', name: '飛行速度', iconItem: 'elytra', default: 0.4, defaultSlot: 'chest', step: 0.01 },
  { id: 'generic.follow_range', name: '追跡距離', iconItem: 'ender_eye', default: 32, defaultSlot: 'any', step: 1 },
  { id: 'generic.block_interaction_range', name: 'ブロック操作範囲', iconItem: 'stick', default: 6, defaultSlot: 'mainhand', step: 0.5 },
  { id: 'generic.entity_interaction_range', name: 'エンティティ操作範囲', iconItem: 'lead', default: 6, defaultSlot: 'mainhand', step: 0.5 },
  { id: 'generic.block_break_speed', name: 'ブロック破壊速度', iconItem: 'netherite_pickaxe', default: 2, defaultSlot: 'mainhand', step: 0.1 },
  { id: 'generic.gravity', name: '重力', iconItem: 'anvil', default: 0.08, defaultSlot: 'any', step: 0.01 },
  { id: 'generic.safe_fall_distance', name: '安全落下距離', iconItem: 'feather', default: 10, defaultSlot: 'feet', step: 1 },
  { id: 'generic.fall_damage_multiplier', name: '落下ダメージ倍率', iconItem: 'leather_boots', default: 0, defaultSlot: 'feet', step: 0.1 },
  { id: 'generic.scale', name: 'スケール', iconItem: 'potion', default: 1, defaultSlot: 'any', step: 0.1 },
  { id: 'generic.step_height', name: 'ステップ高さ', iconItem: 'oak_stairs', default: 1, defaultSlot: 'feet', step: 0.5 },
  { id: 'generic.jump_strength', name: 'ジャンプ力', iconItem: 'rabbit_hide', default: 0.5, defaultSlot: 'feet', step: 0.1 },
  { id: 'generic.burning_time', name: '燃焼時間倍率', iconItem: 'blaze_powder', default: 0, defaultSlot: 'any', step: 0.1 },
  { id: 'generic.explosion_knockback_resistance', name: '爆発ノックバック耐性', iconItem: 'tnt', default: 1, defaultSlot: 'chest', step: 0.1 },
  { id: 'generic.oxygen_bonus', name: '酸素ボーナス', iconItem: 'turtle_helmet', default: 10, defaultSlot: 'head', step: 1 },
  { id: 'generic.water_movement_efficiency', name: '水中移動効率', iconItem: 'heart_of_the_sea', default: 0.5, defaultSlot: 'feet', step: 0.1 },
  { id: 'generic.submerged_mining_speed', name: '水中採掘速度', iconItem: 'prismarine_shard', default: 5, defaultSlot: 'head', step: 0.1 },
  { id: 'generic.sneaking_speed', name: 'スニーク速度', iconItem: 'leather_leggings', default: 0.3, defaultSlot: 'legs', step: 0.01 },
];

// スロット選択肢（1.21+）
const ATTRIBUTE_SLOTS = [
  { id: 'any', name: 'すべて' },
  { id: 'mainhand', name: 'メインハンド' },
  { id: 'offhand', name: 'オフハンド' },
  { id: 'head', name: '頭' },
  { id: 'chest', name: '胴体' },
  { id: 'legs', name: '脚' },
  { id: 'feet', name: '足' },
  { id: 'body', name: 'ボディ(動物)' },
];

// 演算方式（1.21+）
const ATTRIBUTE_OPERATIONS = [
  { id: 'add_value', name: '加算', desc: '+X' },
  { id: 'add_multiplied_base', name: '基本乗算', desc: '+X%（基本値）' },
  { id: 'add_multiplied_total', name: '最終乗算', desc: '+X%（最終値）' },
];

// Minecraft 標準16色（JSON Text Component用）
const TEXT_COLORS = [
  { id: 'white', name: '白', hex: '#FFFFFF' },
  { id: 'yellow', name: '黄', hex: '#FFFF55' },
  { id: 'gold', name: '金', hex: '#FFAA00' },
  { id: 'aqua', name: '水色', hex: '#55FFFF' },
  { id: 'green', name: '黄緑', hex: '#55FF55' },
  { id: 'blue', name: '青', hex: '#5555FF' },
  { id: 'light_purple', name: 'ピンク', hex: '#FF55FF' },
  { id: 'red', name: '赤', hex: '#FF5555' },
  { id: 'gray', name: '灰', hex: '#AAAAAA' },
  { id: 'dark_gray', name: '暗灰', hex: '#555555' },
  { id: 'dark_aqua', name: '青緑', hex: '#00AAAA' },
  { id: 'dark_green', name: '緑', hex: '#00AA00' },
  { id: 'dark_blue', name: '紺', hex: '#0000AA' },
  { id: 'dark_purple', name: '紫', hex: '#AA00AA' },
  { id: 'dark_red', name: '暗赤', hex: '#AA0000' },
  { id: 'black', name: '黒', hex: '#000000' },
];

// プリセットカテゴリ
const PRESET_CATEGORIES = {
  attack: { name: '攻撃', icon: 'netherite_sword', color: '#c80000' },
  mining: { name: '採掘', icon: 'netherite_pickaxe', color: '#4decf2' },
  defense: { name: '防御', icon: 'netherite_chestplate', color: '#5cb746' },
  ranged: { name: '遠距離', icon: 'bow', color: '#f2c13d' },
  extreme: { name: '極限', icon: 'nether_star', color: '#ff55ff' },
};

// プリセット（カテゴリ付き）
const PRESETS = [
  {
    id: 'max-sword',
    name: '最強剣',
    category: 'attack',
    item: 'netherite_sword',
    desc: 'ダメージ増加255、火属性、ノックバック、ドロップ増加',
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
    id: 'pvp-sword',
    name: 'PvP剣',
    category: 'attack',
    item: 'diamond_sword',
    desc: 'PvP向け：ダメージ5、火属性2、ノックバック2',
    enchants: [
      { id: 'sharpness', level: 5 },
      { id: 'fire_aspect', level: 2 },
      { id: 'knockback', level: 2 },
      { id: 'unbreaking', level: 3 },
    ]
  },
  {
    id: 'max-mace',
    name: '最強メイス',
    category: 'attack',
    item: 'mace',
    desc: '重撃5、防具貫通4、ウィンドバースト3、修繕付き',
    enchants: [
      { id: 'density', level: 5 },
      { id: 'breach', level: 4 },
      { id: 'wind_burst', level: 3 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'max-spear',
    name: '最強槍',
    category: 'attack',
    item: 'netherite_spear',
    desc: 'ダメージ増加255、突進3、火属性、ドロップ増加',
    enchants: [
      { id: 'sharpness', level: 255 },
      { id: 'lunge', level: 3 },
      { id: 'fire_aspect', level: 2 },
      { id: 'knockback', level: 2 },
      { id: 'looting', level: 3 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'charge-spear',
    name: '突撃槍',
    category: 'attack',
    item: 'diamond_spear',
    desc: '突進3で高速突撃、火属性付き',
    enchants: [
      { id: 'lunge', level: 3 },
      { id: 'sharpness', level: 5 },
      { id: 'fire_aspect', level: 2 },
      { id: 'unbreaking', level: 3 },
    ]
  },
  {
    id: 'smash-mace',
    name: 'スマッシュメイス',
    category: 'attack',
    item: 'mace',
    desc: '重撃255で超高落下ダメージ',
    enchants: [
      { id: 'density', level: 255 },
      { id: 'fire_aspect', level: 2 },
      { id: 'unbreaking', level: 3 },
    ]
  },
  {
    id: 'max-pickaxe',
    name: '最強ツルハシ',
    category: 'mining',
    item: 'netherite_pickaxe',
    desc: '効率255、幸運3、修繕付き',
    enchants: [
      { id: 'efficiency', level: 255 },
      { id: 'fortune', level: 3 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'silk-pickaxe',
    name: 'シルクタッチ',
    category: 'mining',
    item: 'netherite_pickaxe',
    desc: 'ブロック回収用：シルクタッチ、効率5',
    enchants: [
      { id: 'efficiency', level: 5 },
      { id: 'silk_touch', level: 1 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'max-armor',
    name: '最強防具',
    category: 'defense',
    item: 'netherite_chestplate',
    desc: 'ダメージ軽減4、トゲ3、修繕付き',
    enchants: [
      { id: 'protection', level: 4 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
      { id: 'thorns', level: 3 },
    ]
  },
  {
    id: 'fire-armor',
    name: '耐火防具',
    category: 'defense',
    item: 'netherite_chestplate',
    desc: 'ネザー探検用：火炎耐性4',
    enchants: [
      { id: 'fire_protection', level: 4 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'max-bow',
    name: '最強弓',
    category: 'ranged',
    item: 'bow',
    desc: '射撃ダメージ255、無限、フレイム',
    enchants: [
      { id: 'power', level: 255 },
      { id: 'punch', level: 2 },
      { id: 'flame', level: 1 },
      { id: 'infinity', level: 1 },
      { id: 'unbreaking', level: 3 },
    ]
  },
  {
    id: 'max-crossbow',
    name: '最強クロスボウ',
    category: 'ranged',
    item: 'crossbow',
    desc: '貫通4、高速装填3、修繕付き',
    enchants: [
      { id: 'piercing', level: 4 },
      { id: 'quick_charge', level: 3 },
      { id: 'unbreaking', level: 3 },
      { id: 'mending', level: 1 },
    ]
  },
  {
    id: 'god-sword',
    name: 'ゴッド剣',
    category: 'extreme',
    item: 'netherite_sword',
    desc: '超強化：ダメージ1000、ノックバック100',
    enchants: [
      { id: 'sharpness', level: 1000 },
      { id: 'fire_aspect', level: 10 },
      { id: 'knockback', level: 100 },
      { id: 'looting', level: 10 },
      { id: 'unbreaking', level: 10 },
    ]
  },
  {
    id: 'one-hit',
    name: 'ワンパン剣',
    category: 'extreme',
    item: 'netherite_sword',
    desc: '最大攻撃力：ダメージ増加32767',
    enchants: [
      { id: 'sharpness', level: 32767 },
    ]
  },
];

let selectedEnchants = [];
let selectedAttributes = [];
let searchQuery = '';
let enchantCustomNameEditor = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  // リッチテキストエディターのインスタンスを作成
  enchantCustomNameEditor = new RichTextEditor('enchant-name-rte', {
    placeholder: '最強の剣',
    showPreview: true,
    onChange: () => {}
  });

  return `
    <style>${RICH_TEXT_EDITOR_CSS}</style>
    <div class="tool-panel enchant-tool mc-themed" id="enchant-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'enchanted_book')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>エンチャントコマンド</h2>
            <p class="header-subtitle">最大レベル255対応</p>
          </div>
        </div>
        <span class="version-badge" id="enchant-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="enchant-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="enchant-version-note"></p>

      <form class="tool-form mc-form" id="enchant-form">

        <!-- ステップ1: アイテム選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>アイテム選択</h3>
          </div>

          <!-- プリセット -->
          <div class="preset-cards">
            ${PRESETS.slice(0, 6).map(p => `
              <button type="button" class="preset-card" data-preset="${p.id}">
                <img src="${getInviconUrl(p.item)}" alt="" class="preset-icon mc-pixelated" onerror="this.style.opacity='0.3'">
                <span class="preset-name">${p.name}</span>
              </button>
            `).join('')}
          </div>

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
        </section>

        <!-- ステップ2: エンチャント追加 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>エンチャント追加</h3>
          </div>

          <input type="text" id="enchant-search" class="mc-input" placeholder="エンチャント名で検索..." style="margin-bottom: var(--mc-space-md);">

          <div class="enchant-info-hint">
            <img src="${getInviconUrl('experience_bottle')}" class="hint-icon mc-pixelated" width="16" height="16" alt="">
            <span>通常の最大レベルはバニラの値です。コマンドでは最大255まで設定可能</span>
          </div>
          <div class="enchant-categories" id="enchant-categories">
            ${Object.entries(ENCHANT_CATEGORIES).map(([catId, cat]) => `
              <div class="enchant-category" data-category="${catId}">
                <button type="button" class="category-header">
                  <img class="cat-icon-img mc-pixelated" src="${getInviconUrl(cat.iconItem)}" alt="${cat.name}" data-mc-tooltip="${cat.iconItem}" onerror="this.style.opacity='0.3'">
                  <span class="cat-name">${cat.name}</span>
                  <span class="cat-count">(${cat.enchants.length})</span>
                  <span class="cat-arrow">▶</span>
                </button>
                <div class="category-enchants" style="display: none;">
                  ${cat.enchants.map(e => `
                    <div class="enchant-item" data-enchant="${e.id}" data-default-max="${e.defaultMax}" title="${e.desc}">
                      <div class="enchant-item-header">
                        <span class="enchant-name">${e.name}</span>
                        <span class="enchant-en">${e.en}</span>
                      </div>
                      <div class="enchant-level-selector">
                        <label class="level-label">Lv:</label>
                        <input type="number" class="enchant-level-input mc-input"
                               data-enchant="${e.id}" data-default-max="${e.defaultMax}"
                               value="${e.defaultMax}" min="1" max="255"
                               onclick="event.stopPropagation()">
                        <div class="level-presets">
                          <button type="button" class="level-preset-btn" data-level="${e.defaultMax}"
                                  data-enchant="${e.id}" onclick="event.stopPropagation()" title="通常最大">Max</button>
                          <button type="button" class="level-preset-btn extreme" data-level="255"
                                  data-enchant="${e.id}" onclick="event.stopPropagation()" title="コマンド最大">255</button>
                        </div>
                      </div>
                      <button type="button" class="enchant-add-btn" data-enchant="${e.id}"
                              data-default-max="${e.defaultMax}" title="追加">+</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ステップ3: 選択中のエンチャント -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>選択中のエンチャント <span id="enchant-count">(0)</span></h3>
          </div>
          <div class="selected-enchants" id="selected-enchants">
            <p class="empty-message">上のカテゴリからエンチャントをクリックして追加</p>
          </div>
        </section>

        <!-- ステップ4: 属性 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">4</span>
            <h3>属性 <span class="optional-badge">任意</span></h3>
          </div>
          <div class="behavior-grid">
            <label class="behavior-option">
              <input type="checkbox" id="use-attributes">
              <div class="option-content">
                <img src="${getInviconUrl('golden_apple')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">属性を追加</span>
                  <span class="option-desc">体力・攻撃力などを変更</span>
                </div>
              </div>
            </label>
          </div>
          <div class="attributes-section" id="attributes-section" style="display: none;">
            <div class="attr-grid-header">
              <span class="attr-col-icon"></span>
              <span class="attr-col-name">属性</span>
              <span class="attr-col-check">有効</span>
              <span class="attr-col-value">値</span>
              <span class="attr-col-slot">スロット</span>
              <span class="attr-col-op">演算</span>
            </div>
            ${ATTRIBUTES.map(attr => `
              <div class="attribute-row" data-attr="${attr.id}">
                <img src="${getInviconUrl(attr.iconItem)}" class="attr-icon mc-pixelated" width="20" height="20" alt="">
                <span class="attr-name">${attr.name}</span>
                <input type="checkbox" class="attr-check" data-attr="${attr.id}">
                <input type="number" class="attr-value mc-input" data-attr="${attr.id}"
                       value="${attr.default}" step="${attr.step || 0.1}" disabled>
                <select class="attr-slot mc-select" data-attr="${attr.id}" disabled>
                  ${ATTRIBUTE_SLOTS.map(slot => `
                    <option value="${slot.id}" ${slot.id === attr.defaultSlot ? 'selected' : ''}>${slot.name}</option>
                  `).join('')}
                </select>
                <select class="attr-operation mc-select" data-attr="${attr.id}" disabled>
                  ${ATTRIBUTE_OPERATIONS.map(op => `
                    <option value="${op.id}" title="${op.desc}">${op.name}</option>
                  `).join('')}
                </select>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ステップ5: 耐久力設定 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">5</span>
            <h3>耐久力 <span class="optional-badge">任意</span></h3>
          </div>
          <div class="behavior-grid">
            <label class="behavior-option">
              <input type="checkbox" id="use-durability">
              <div class="option-content">
                <img src="${getInviconUrl('anvil')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">耐久力をカスタム</span>
                  <span class="option-desc">現在/最大耐久力を設定</span>
                </div>
              </div>
            </label>
          </div>
          <div class="durability-section" id="durability-section" style="display: none;">
            <div class="durability-row">
              <div class="durability-item">
                <label>現在の耐久消費 (damage)</label>
                <input type="number" id="durability-damage" class="mc-input" value="0" min="0" step="1">
                <span class="durability-hint">0 = フル耐久</span>
              </div>
              <div class="durability-item">
                <label>最大耐久値 (max_damage)</label>
                <input type="number" id="durability-max" class="mc-input" value="" min="1" step="1" placeholder="デフォルト">
                <span class="durability-hint">空欄 = アイテムのデフォルト値</span>
              </div>
            </div>
            <div class="durability-presets">
              <span class="preset-label">プリセット:</span>
              <button type="button" class="durability-preset-btn" data-damage="0" data-max="">フル耐久</button>
              <button type="button" class="durability-preset-btn" data-damage="100" data-max="">少し消耗</button>
              <button type="button" class="durability-preset-btn" data-damage="0" data-max="10000">超高耐久</button>
              <button type="button" class="durability-preset-btn" data-damage="0" data-max="1">1回で壊れる</button>
            </div>
          </div>
        </section>

        <!-- ステップ6: オプション -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">6</span>
            <h3>オプション</h3>
          </div>

          <div class="behavior-grid">
            <label class="behavior-option">
              <input type="checkbox" id="opt-unbreakable">
              <div class="option-content">
                <img src="${getInviconUrl('anvil')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">耐久無限</span>
                  <span class="option-desc">耐久値が減らない</span>
                </div>
              </div>
            </label>
            <label class="behavior-option">
              <input type="checkbox" id="opt-hide-enchants">
              <div class="option-content">
                <img src="${getInviconUrl('enchanted_book')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">エンチャント非表示</span>
                  <span class="option-desc">ツールチップに表示しない</span>
                </div>
              </div>
            </label>
            <label class="behavior-option">
              <input type="checkbox" id="opt-hide-unbreakable">
              <div class="option-content">
                <img src="${getInviconUrl('barrier')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">耐久無限非表示</span>
                  <span class="option-desc">耐久無限を非表示に</span>
                </div>
              </div>
            </label>
          </div>

          <div class="count-input-group" style="margin-top: var(--mc-space-md);">
            <label>個数</label>
            <div class="count-presets">
              <button type="button" class="count-btn active" data-count="1">1</button>
              <button type="button" class="count-btn" data-count="16">16</button>
              <button type="button" class="count-btn" data-count="64">64</button>
            </div>
            <input type="number" id="item-count" class="mc-input count-input" value="1" min="1" max="64">
          </div>
        </section>

        <!-- ステップ7: カスタム名 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">7</span>
            <h3>カスタム名 <span class="optional-badge">任意</span></h3>
          </div>
          <p class="section-hint">1文字ごとに色や書式を設定可能</p>
          ${enchantCustomNameEditor.render()}
        </section>

        <!-- ステップ8: その他プリセット -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">8</span>
            <h3>その他のプリセット <span class="optional-badge">任意</span></h3>
          </div>
          <div class="preset-categories">
            ${Object.entries(PRESET_CATEGORIES).map(([catId, cat]) => `
              <div class="preset-category" data-category="${catId}">
                <div class="preset-category-header" style="border-left-color: ${cat.color};">
                  <img src="${getInviconUrl(cat.icon)}" class="preset-category-icon mc-pixelated" width="16" height="16" alt="">
                  <span>${cat.name}</span>
                </div>
                <div class="preset-category-buttons">
                  ${PRESETS.filter(p => p.category === catId).map(p => `
                    <button type="button" class="preset-btn" data-preset="${p.id}" title="${p.desc || p.enchants.map(e => findEnchantInfo(e.id)?.name).join(', ')}">
                      <img src="${getInviconUrl(p.item)}" class="preset-btn-icon mc-pixelated" width="16" height="16" alt="">
                      <span>${p.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="preset-btn preset-clear" data-preset="clear" style="margin-top: 8px;">
            クリア
          </button>
        </section>
      </form>

      <!-- Minecraft風ゲーム画面プレビュー -->
      <div class="enchant-preview-section">
        <h3>プレビュー</h3>
        <div class="mc-inventory-preview">
          <!-- インベントリスロット風表示 -->
          <div class="mc-inv-slot-large" id="preview-slot">
            <img class="mc-inv-item-img" id="item-icon-img" src="" alt="">
            <span class="mc-inv-count" id="item-count-display">1</span>
          </div>

          <!-- Minecraft風ツールチップ -->
          <div class="mc-item-tooltip" id="item-tooltip">
            <div class="tooltip-name" id="item-name">ダイヤの剣</div>
            <div class="tooltip-enchants" id="preview-enchants">
              <p class="text-muted">エンチャントなし</p>
            </div>
            <div class="tooltip-meta">
              <span class="tooltip-id" id="item-id">minecraft:diamond_sword</span>
            </div>
          </div>
        </div>

        <!-- アイテム情報バー -->
        <div class="item-stats-bar" id="item-stats">
          <div class="stat-item">
            <span class="stat-label">エンチャント</span>
            <span class="stat-value" id="enchant-total">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">レベル合計</span>
            <span class="stat-value" id="level-total">0</span>
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

  // リッチテキストエディターの初期化
  if (enchantCustomNameEditor) {
    enchantCustomNameEditor.init(container);
    enchantCustomNameEditor.options.onChange = () => {
      updatePreview(container);
      updateCommand(container);
    };
  }

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

  // エンチャント追加（追加ボタンクリック）
  delegate(container, 'click', '.enchant-add-btn', (e, target) => {
    e.stopPropagation();
    const enchantId = target.dataset.enchant;
    const defaultMax = parseInt(target.dataset.defaultMax) || 5;
    const levelInput = $(`.enchant-level-input[data-enchant="${enchantId}"]`, container);
    const level = parseInt(levelInput?.value) || defaultMax;

    if (!selectedEnchants.find(e => e.id === enchantId)) {
      selectedEnchants.push({ id: enchantId, level: Math.min(255, Math.max(1, level)), defaultMax });
      target.closest('.enchant-item')?.classList.add('selected');
      renderSelectedEnchants(container);
      updateCommand(container);
    }
  });

  // レベルプリセットボタン（グリッド内）
  delegate(container, 'click', '.level-preset-btn', (e, target) => {
    e.stopPropagation();
    const enchantId = target.dataset.enchant;
    const level = parseInt(target.dataset.level);
    const levelInput = $(`.enchant-level-input[data-enchant="${enchantId}"]`, container);
    if (levelInput) {
      levelInput.value = level;
    }
  });

  // エンチャントレベル入力でEnterキー押下時に追加
  delegate(container, 'keypress', '.enchant-level-input', (e, target) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const enchantId = target.dataset.enchant;
      const addBtn = $(`.enchant-add-btn[data-enchant="${enchantId}"]`, container);
      addBtn?.click();
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
    const slotSelect = $(`.attr-slot[data-attr="${attrId}"]`, container);
    const opSelect = $(`.attr-operation[data-attr="${attrId}"]`, container);
    if (valueInput) valueInput.disabled = !target.checked;
    if (slotSelect) slotSelect.disabled = !target.checked;
    if (opSelect) opSelect.disabled = !target.checked;
    updateCommand(container);
  });

  delegate(container, 'input', '.attr-value', debounce(() => {
    updateCommand(container);
  }, 100));

  delegate(container, 'change', '.attr-slot', () => updateCommand(container));
  delegate(container, 'change', '.attr-operation', () => updateCommand(container));

  // 耐久力設定トグル
  $('#use-durability', container)?.addEventListener('change', (e) => {
    const section = $('#durability-section', container);
    if (section) section.style.display = e.target.checked ? 'block' : 'none';
    updateCommand(container);
  });

  // 耐久力入力
  delegate(container, 'input', '#durability-damage', debounce(() => updateCommand(container), 100));
  delegate(container, 'input', '#durability-max', debounce(() => updateCommand(container), 100));

  // 耐久力プリセット
  delegate(container, 'click', '.durability-preset-btn', (e, target) => {
    const damage = target.dataset.damage;
    const max = target.dataset.max;
    const damageInput = $('#durability-damage', container);
    const maxInput = $('#durability-max', container);
    if (damageInput) damageInput.value = damage;
    if (maxInput) maxInput.value = max;
    updateCommand(container);
  });

  // プリセット（ボタン）
  delegate(container, 'click', '.preset-btn', (e, target) => {
    applyPreset(target.dataset.preset, container);
  });

  // プリセットカード（上部）
  $$('.preset-card', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.dataset.preset;
      applyPreset(presetId, container);
    });
  });

  // オプション変更
  ['#opt-unbreakable', '#opt-hide-enchants', '#opt-hide-unbreakable', '#custom-name'].forEach(sel => {
    $(sel, container)?.addEventListener('change', () => updateCommand(container));
    $(sel, container)?.addEventListener('input', debounce(() => updateCommand(container), 150));
  });

  // 個数プリセット
  $$('.count-btn', container).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.count-btn', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.count);
      $('#item-count', container).value = count;
      updatePreview(container);
      updateCommand(container);
    });
  });

  // 個数変更（プレビューも更新）
  $('#item-count', container)?.addEventListener('change', () => {
    updatePreview(container);
    updateCommand(container);
  });
  $('#item-count', container)?.addEventListener('input', debounce(() => {
    updatePreview(container);
    updateCommand(container);
  }, 150));

  // バージョン変更時にコマンド再生成
  window.addEventListener('mc-version-change', () => {
    updateVersionDisplay(container);
    updateCommand(container);
  });

  // リセットボタン
  $('#enchant-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  updateVersionDisplay(container);
  updatePreview(container);
  updateCommand(container);
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // エンチャントと属性をクリア
  selectedEnchants = [];
  selectedAttributes = [];
  searchQuery = '';

  // 検索フィールドをクリア
  const searchInput = $('#enchant-search', container);
  if (searchInput) searchInput.value = '';

  // アイテムカテゴリを剣にリセット
  const catSelect = $('#item-category', container);
  if (catSelect) {
    catSelect.value = 'sword';
    catSelect.disabled = false;
    // アイテムリストを更新
    const itemSelect = $('#item-select', container);
    if (itemSelect) {
      itemSelect.innerHTML = ITEM_CATEGORIES.sword.items.map(item =>
        `<option value="${item.id}">${item.name}</option>`
      ).join('');
      itemSelect.disabled = false;
    }
  }

  // カスタムアイテムをオフに
  const useCustom = $('#use-custom-item', container);
  if (useCustom) useCustom.checked = false;
  const customInput = $('#custom-item-id', container);
  if (customInput) {
    customInput.disabled = true;
    customInput.value = '';
  }

  // エンチャントの選択状態をクリア
  $$('.enchant-item.selected', container).forEach(el => el.classList.remove('selected'));
  filterEnchants(container);

  // 属性セクションを閉じる
  const useAttrs = $('#use-attributes', container);
  if (useAttrs) useAttrs.checked = false;
  const attrsSection = $('#attributes-section', container);
  if (attrsSection) attrsSection.style.display = 'none';

  // 属性チェックをリセット
  $$('.attr-check', container).forEach(el => {
    el.checked = false;
  });
  $$('.attr-value', container).forEach(el => {
    el.disabled = true;
    const attrId = el.dataset.attr;
    const attr = ATTRIBUTES.find(a => a.id === attrId);
    if (attr) el.value = attr.default;
  });

  // オプションをリセット
  const optUnbreakable = $('#opt-unbreakable', container);
  if (optUnbreakable) optUnbreakable.checked = false;
  const optHideEnchants = $('#opt-hide-enchants', container);
  if (optHideEnchants) optHideEnchants.checked = false;
  const optHideUnbreakable = $('#opt-hide-unbreakable', container);
  if (optHideUnbreakable) optHideUnbreakable.checked = false;

  // 個数をリセット
  const itemCount = $('#item-count', container);
  if (itemCount) itemCount.value = '1';

  // リッチテキストエディターをクリア
  if (enchantCustomNameEditor) {
    enchantCustomNameEditor.clear(container);
  }

  // 選択されたエンチャントの表示を更新
  renderSelectedEnchants(container);

  // プレビューとコマンドを更新
  updatePreview(container);
  updateCommand(container);
}

/**
 * バージョン表示を更新
 */
function updateVersionDisplay(container) {
  const version = workspaceStore.get('version') || '1.21';
  const badge = $('#enchant-version-badge', container);
  const note = $('#enchant-version-note', container);

  if (badge) {
    badge.textContent = version + '+';
  }
  if (note) {
    note.textContent = getVersionNote(version);
  }
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
        <div class="enchant-info">
          <span class="enchant-label">${info?.name || e.id}</span>
          <span class="enchant-level-display">Lv.${e.level}</span>
        </div>
        <div class="enchant-level-control">
          <div class="level-input-wrapper">
            <input type="number" class="enchant-level mc-input" data-enchant="${e.id}"
                   value="${e.level}" min="1" max="${ABSOLUTE_MAX_LEVEL}" aria-label="レベル">
            <span class="level-suffix">Lv</span>
          </div>
          <div class="level-quick-controls">
            <button type="button" class="level-quick-btn quick-btn-preset" data-enchant="${e.id}" data-level="1" title="レベル1">I</button>
            <button type="button" class="level-quick-btn quick-btn-normal" data-enchant="${e.id}" data-level="${defaultMax}" title="通常最大 (${defaultMax})">Max</button>
            <button type="button" class="level-quick-btn quick-btn-extreme" data-enchant="${e.id}" data-level="255" title="最大 (255)">255</button>
          </div>
          <span class="level-status-badge">${isMaxLevel ? '★' : isOverDefault ? '●' : ''}</span>
        </div>
        <button type="button" class="enchant-remove" data-enchant="${e.id}" aria-label="削除">×</button>
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
  const itemCountDisplay = $('#item-count-display', container);
  const enchantTotalEl = $('#enchant-total', container);
  const levelTotalEl = $('#level-total', container);
  const previewSlot = $('#preview-slot', container);
  const itemTooltip = $('#item-tooltip', container);

  const useCustom = $('#use-custom-item', container)?.checked;
  const customId = $('#custom-item-id', container)?.value;
  const catId = $('#item-category', container)?.value;
  const itemId = $('#item-select', container)?.value;
  const count = parseInt($('#item-count', container)?.value) || 1;

  // リッチテキストエディターからカスタム名を取得
  const customName = enchantCustomNameEditor?.getPlainText() || '';

  // アイテム名とアイコン
  let itemName = 'アイテム';
  if (useCustom && customId) {
    const customItemId = customId.split(':').pop() || customId;
    itemName = customItemId;
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
    itemName = item?.name || 'アイテム';
    if (itemIdEl) itemIdEl.textContent = `minecraft:${itemId}`;

    // Wiki Invicon画像を設定
    if (itemIconImg) {
      itemIconImg.src = getInviconUrl(itemId);
      itemIconImg.alt = item?.name || itemId;
      itemIconImg.style.opacity = '1';
      itemIconImg.onerror = () => { itemIconImg.style.opacity = '0.3'; };
    }
  }

  // ツールチップにカスタム名または通常名を表示
  if (itemNameEl) {
    const displayName = customName || itemName;
    itemNameEl.textContent = displayName;
    itemNameEl.style.color = ''; // リッチテキストエディターで色を設定するため、ここではリセット
  }

  // アイテム個数表示（2以上のみ表示）
  if (itemCountDisplay) {
    itemCountDisplay.textContent = count > 1 ? count : '';
    itemCountDisplay.style.display = count > 1 ? 'block' : 'none';
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

  // 統計バー更新
  const enchantCount = selectedEnchants.length;
  const levelSum = selectedEnchants.reduce((sum, e) => sum + e.level, 0);

  if (enchantTotalEl) {
    enchantTotalEl.textContent = enchantCount;
  }
  if (levelTotalEl) {
    levelTotalEl.textContent = levelSum;
  }

  // ツールチップ名にエンチャント色を適用
  if (itemNameEl) {
    if (selectedEnchants.length > 0) {
      itemNameEl.classList.add('enchanted');
    } else {
      itemNameEl.classList.remove('enchanted');
    }
  }

  // スロットにエンチャントグロー効果
  if (previewSlot) {
    if (selectedEnchants.length > 0) {
      previewSlot.classList.add('enchanted');
    } else {
      previewSlot.classList.remove('enchanted');
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
    // 属性もリセット
    $$('.attr-check', container).forEach(el => {
      el.checked = false;
      const attrId = el.dataset.attr;
      const valueInput = $(`.attr-value[data-attr="${attrId}"]`, container);
      const slotSelect = $(`.attr-slot[data-attr="${attrId}"]`, container);
      const opSelect = $(`.attr-operation[data-attr="${attrId}"]`, container);
      if (valueInput) valueInput.disabled = true;
      if (slotSelect) slotSelect.disabled = true;
      if (opSelect) opSelect.disabled = true;
    });
    // 耐久力もリセット
    const durabilityCheck = $('#use-durability', container);
    if (durabilityCheck) {
      durabilityCheck.checked = false;
      const durabilitySection = $('#durability-section', container);
      if (durabilitySection) durabilitySection.style.display = 'none';
    }
    const durabilityDamage = $('#durability-damage', container);
    const durabilityMax = $('#durability-max', container);
    if (durabilityDamage) durabilityDamage.value = '0';
    if (durabilityMax) durabilityMax.value = '';
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
  const version = workspaceStore.get('version') || '1.21';
  const group = getVersionGroup(version);

  const useCustom = $('#use-custom-item', container)?.checked;
  const customId = $('#custom-item-id', container)?.value;
  const itemId = $('#item-select', container)?.value;
  // 1.21.5+: minecraft:プレフィックスなし、それ以前: プレフィックスあり
  const usePrefixFreeFormat = compareVersions(version, '1.21.5') >= 0;
  const item = useCustom && customId ? customId : (usePrefixFreeFormat ? itemId : `minecraft:${itemId}`);

  // バージョンに応じてリッチテキストエディターから適切な形式を取得
  // 1.21.5以降: SNBT形式 {text:"...",color:"red"}
  // 1.20.5-1.21.4: JSON形式 {"text":"...","color":"red"}
  const useSNBT = compareVersions(version, '1.21.5') >= 0;
  const customNameForComponent = useSNBT
    ? enchantCustomNameEditor?.getSNBT() || ''
    : enchantCustomNameEditor?.getJSON() || '';
  const customNameJSON = enchantCustomNameEditor?.getJSON() || '';
  const customNamePlain = enchantCustomNameEditor?.getPlainText() || '';
  const count = parseInt($('#item-count', container)?.value) || 1;
  const unbreakable = $('#opt-unbreakable', container)?.checked;
  const hideEnchants = $('#opt-hide-enchants', container)?.checked;
  const hideUnbreakable = $('#opt-hide-unbreakable', container)?.checked;
  const useAttributes = $('#use-attributes', container)?.checked;

  let command;

  if (group === 'latest' || group === 'component') {
    // 1.20.5+: コンポーネント形式
    command = generateComponentCommand(item, count, customNameForComponent, useSNBT, unbreakable, hideEnchants, hideUnbreakable, useAttributes, container, version);
  } else if (group === 'nbt-modern' || group === 'nbt-legacy') {
    // 1.13-1.20.4: NBT形式（JSON Text Component）
    command = generateNBTCommand(item, count, customNameJSON, unbreakable, useAttributes, container);
  } else {
    // 1.12: レガシー形式（プレーンテキストのみ）
    command = generateLegacyCommand(item, count, customNamePlain, unbreakable, container);
  }

  setOutput(command, 'enchant', {
    item,
    enchants: selectedEnchants,
    unbreakable,
    customName: customNamePlain,
    count,
    version
  });
}

/**
 * コンポーネント形式（1.20.5+）
 * @param {string} item - アイテムID
 * @param {number} count - 個数
 * @param {string} customName - カスタム名（SNBT or JSON形式）
 * @param {boolean} useSNBT - true: 1.21.5+のSNBT形式, false: 1.20.5-1.21.4のJSON形式
 * @param {boolean} unbreakable
 * @param {boolean} hideEnchants
 * @param {boolean} hideUnbreakable
 * @param {boolean} useAttributes
 * @param {HTMLElement} container
 * @param {string} version - Minecraftバージョン
 */
function generateComponentCommand(item, count, customName, useSNBT, unbreakable, hideEnchants, hideUnbreakable, useAttributes, container, version = '1.21') {
  const components = [];

  // 1.21.5以降は簡略形式が使用可能
  const useSimplifiedForm = compareVersions(version, '1.21.5') >= 0;

  // カスタム名
  // 1.21.5+: SNBT形式 minecraft:custom_name={text:"...",color:"red"}
  // 1.20.5-1.21.4: JSON形式 minecraft:custom_name='{"text":"...","color":"red"}'
  if (customName) {
    if (useSNBT) {
      // SNBT形式（1.21.5+）: クォートなしで直接埋め込み
      components.push(`minecraft:custom_name=${customName}`);
    } else {
      // JSON形式（1.20.5-1.21.4）: シングルクォートで囲む
      components.push(`minecraft:custom_name='${customName}'`);
    }
  }

  if (selectedEnchants.length > 0) {
    // エンチャントの本は stored_enchantments を使用
    const isEnchantedBook = item.includes('enchanted_book');
    const componentName = isEnchantedBook ? 'stored_enchantments' : 'enchantments';

    if (useSimplifiedForm) {
      // 1.21.5+/1.21.11: 簡略形式（minecraft:プレフィックスなし）
      // 正しい形式: enchantments={"sharpness":10,"smite":5}
      const enchantPairs = selectedEnchants.map(e => `"${e.id}":${e.level}`).join(',');
      components.push(`${componentName}={${enchantPairs}}`);
      if (hideEnchants) {
        // 1.21.5+: tooltip_displayコンポーネントで非表示を制御
        components.push(`tooltip_display={hidden_components:["${componentName}"]}`);
      }
    } else {
      // 1.20.5-1.21.4: 長い形式（levelsラッパー必須、minecraft:プレフィックス必要）
      const enchantPairs = selectedEnchants.map(e => `"minecraft:${e.id}":${e.level}`).join(',');
      if (hideEnchants) {
        components.push(`${componentName}={levels:{${enchantPairs}},show_in_tooltip:false}`);
      } else {
        components.push(`${componentName}={levels:{${enchantPairs}}}`);
      }
    }
  }

  if (useAttributes) {
    const attrs = [];
    let idCounter = 1;
    $$('.attr-check:checked', container).forEach(check => {
      const attrId = check.dataset.attr;
      const value = parseFloat($(`.attr-value[data-attr="${attrId}"]`, container)?.value) || 0;
      const slot = $(`.attr-slot[data-attr="${attrId}"]`, container)?.value || 'mainhand';
      const operation = $(`.attr-operation[data-attr="${attrId}"]`, container)?.value || 'add_value';
      // 1.21.11+ attribute_modifiers 正式構文
      // 形式: attribute_modifiers=[{...},{...}] （直接配列形式）
      // type: 属性ID（generic.プレフィックスなし、attack_damage等の短縮形）
      // id: 一意な識別子（数字文字列）
      // amount: 数値
      // operation: add_value, add_multiplied_base, add_multiplied_total
      // slot: any, hand, armor, mainhand, offhand, head, chest, legs, feet, body

      // generic. プレフィックスを削除（generic.attack_damage → attack_damage）
      const shortAttrId = attrId.replace(/^generic\./, '');
      const modifierId = `${idCounter}${Date.now()}`;
      idCounter++;
      attrs.push(`{"type":"${shortAttrId}","amount":${value},"operation":"${operation}","slot":"${slot}","id":"${modifierId}"}`);
    });
    if (attrs.length > 0) {
      components.push(`attribute_modifiers=[${attrs.join(',')}]`);
    }
  }

  // 耐久力設定（1.20.5+）
  const useDurability = $('#use-durability', container)?.checked;
  if (useDurability) {
    const damage = parseInt($('#durability-damage', container)?.value) || 0;
    const maxDamage = $('#durability-max', container)?.value;
    if (damage > 0) {
      components.push(`damage=${damage}`);
    }
    if (maxDamage && parseInt(maxDamage) > 0) {
      components.push(`max_damage=${parseInt(maxDamage)}`);
    }
  }

  if (unbreakable) {
    components.push(hideUnbreakable ? 'unbreakable={show_in_tooltip:false}' : 'unbreakable={}');
  }

  let command = `/give @p ${item}`;
  if (components.length > 0) command += `[${components.join(',')}]`;
  if (count > 1) command += ` ${count}`;
  return command;
}

/**
 * NBT形式（1.13-1.20.4）
 */
function generateNBTCommand(item, count, customNameJSON, unbreakable, useAttributes, container) {
  const nbtParts = [];

  // カスタム名（JSON Text Component形式）
  // 形式: display:{Name:'{"text":"名前","color":"gold"}'}
  if (customNameJSON) {
    nbtParts.push(`display:{Name:'${customNameJSON}'}`);
  }

  if (selectedEnchants.length > 0) {
    const enchantList = selectedEnchants.map(e => `{id:"minecraft:${e.id}",lvl:${e.level}s}`).join(',');
    // エンチャントの本は StoredEnchantments を使用
    const isEnchantedBook = item.includes('enchanted_book');
    const tagName = isEnchantedBook ? 'StoredEnchantments' : 'Enchantments';
    nbtParts.push(`${tagName}:[${enchantList}]`);
  }

  if (useAttributes) {
    const attrs = [];
    $$('.attr-check:checked', container).forEach(check => {
      const attrId = check.dataset.attr;
      const value = parseFloat($(`.attr-value[data-attr="${attrId}"]`, container)?.value) || 0;
      attrs.push(`{AttributeName:"${attrId}",Name:"${attrId.replace('.','_')}",Amount:${value},Operation:0,UUID:[I;0,0,0,0]}`);
    });
    if (attrs.length > 0) nbtParts.push(`AttributeModifiers:[${attrs.join(',')}]`);
  }

  if (unbreakable) nbtParts.push('Unbreakable:1b');

  let command = `/give @p ${item}`;
  if (nbtParts.length > 0) command += `{${nbtParts.join(',')}}`;
  if (count > 1) command += ` ${count}`;
  return command;
}

/**
 * レガシー形式（1.12.2以前）
 * ※1.12以前はJSON Text Componentをサポートしないため、プレーンテキストのみ
 */
function generateLegacyCommand(item, count, customNamePlain, unbreakable, container) {
  const nbtParts = [];

  // カスタム名（レガシー形式ではプレーンテキスト）
  if (customNamePlain) {
    nbtParts.push(`display:{Name:"${escapeJsonString(customNamePlain)}"}`);
  }

  if (selectedEnchants.length > 0) {
    const enchantList = selectedEnchants.map(e => {
      // 文字列IDを数値IDに変換
      const numericId = Object.entries(ENCHANT_ID_MAP).find(([, name]) => name === e.id)?.[0] || 0;
      return `{id:${numericId}s,lvl:${e.level}s}`;
    }).join(',');
    nbtParts.push(`ench:[${enchantList}]`);
  }

  if (unbreakable) nbtParts.push('Unbreakable:1b');

  // 1.12形式: アイテムIDからminecraft:を削除
  const legacyItem = item.replace('minecraft:', '');
  let command = `/give @p ${legacyItem} ${count} 0`;
  if (nbtParts.length > 0) command += ` {${nbtParts.join(',')}}`;
  return command;
}

function escapeJsonString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
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
  /* ===== summonツール統一デザイン ===== */

  /* ヘッダー */
  .enchant-tool .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    border-radius: 8px 8px 0 0;
    margin: calc(-1 * var(--mc-space-lg));
    margin-bottom: var(--mc-space-lg);
  }

  .enchant-tool .header-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .enchant-tool .header-icon {
    width: 48px;
    height: 48px;
  }

  .enchant-tool .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .enchant-tool .header-subtitle {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.8);
  }

  .enchant-tool .version-badge {
    background: rgba(255,255,255,0.2);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-left: auto;
  }

  .enchant-tool .reset-btn {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.15s;
  }

  .enchant-tool .reset-btn:hover {
    background: rgba(255,255,255,0.25);
    border-color: rgba(255,255,255,0.5);
  }

  /* セクション構造 */
  .enchant-tool .form-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .enchant-tool .section-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-sm);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .enchant-tool .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .enchant-tool .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  .enchant-tool .optional-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    background: rgba(255,255,255,0.15);
    border-radius: 4px;
    color: #aaaaaa;
    margin-left: 8px;
  }

  .enchant-tool .section-hint {
    font-size: 0.8rem;
    color: #aaaaaa;
    margin: 0 0 var(--mc-space-md) 0;
  }

  /* プリセットカード */
  .enchant-tool .preset-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
  }

  .enchant-tool .preset-card {
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

  .enchant-tool .preset-card:hover {
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    border-color: #8b6cf8;
    transform: translateY(-2px);
  }

  .enchant-tool .preset-card .preset-icon {
    width: 40px;
    height: 40px;
  }

  .enchant-tool .preset-card .preset-name {
    font-size: 0.8rem;
    color: #ffffff;
    text-align: center;
  }

  /* behavior-grid */
  .enchant-tool .behavior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-md);
  }

  .enchant-tool .behavior-option {
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

  .enchant-tool .behavior-option:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
  }

  .enchant-tool .behavior-option:has(input:checked) {
    background: linear-gradient(180deg, rgba(107, 76, 232, 0.3) 0%, rgba(74, 50, 179, 0.3) 100%);
    border-color: #6b4ce8;
  }

  .enchant-tool .behavior-option input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #6b4ce8;
  }

  .enchant-tool .option-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    flex: 1;
  }

  .enchant-tool .option-icon {
    width: 32px;
    height: 32px;
  }

  .enchant-tool .option-text {
    display: flex;
    flex-direction: column;
  }

  .enchant-tool .option-name {
    font-weight: bold;
    color: #ffffff;
    font-size: 0.9rem;
  }

  .enchant-tool .option-desc {
    font-size: 0.75rem;
    color: #aaaaaa;
  }

  /* 個数プリセット */
  .enchant-tool .count-input-group label {
    display: block;
    color: #cccccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-xs);
  }

  .enchant-tool .count-presets {
    display: flex;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-sm);
  }

  .enchant-tool .count-btn {
    padding: 6px 16px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
  }

  .enchant-tool .count-btn:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
  }

  .enchant-tool .count-btn.active {
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    border-color: #8b6cf8;
  }

  .enchant-tool .count-input {
    width: 80px;
  }

  /* アイテムセレクター */
  .enchant-tool .item-selector {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-sm);
  }

  .enchant-tool .custom-item-row {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-top: var(--mc-space-sm);
    color: #cccccc;
  }

  .enchant-tool .custom-item-row input[type="text"] {
    flex: 1;
  }

  /* エンチャントカテゴリ */
  .enchant-tool .enchant-categories {
    border: 2px solid #555555;
    border-radius: 4px;
  }

  .enchant-tool .enchant-category {
    border-bottom: 1px solid #555555;
  }

  .enchant-tool .enchant-category:last-child {
    border-bottom: none;
  }

  .enchant-tool .category-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 1rem;
    color: #ffffff;
  }

  .enchant-tool .category-header:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
  }

  .enchant-tool .cat-icon-img {
    width: 28px;
    height: 28px;
    image-rendering: pixelated;
    flex-shrink: 0;
  }

  .enchant-tool .cat-name {
    flex: 1;
    color: #ffffff;
    font-weight: 600;
  }

  .enchant-tool .cat-count {
    color: #cccccc;
    font-size: 0.85rem;
  }

  .enchant-tool .cat-arrow {
    color: #aaaaaa;
    font-size: 0.7rem;
  }

  .enchant-tool .category-enchants {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
    padding: 12px;
    background: rgba(30,30,30,0.8);
    max-width: 100%;
  }

  .enchant-tool .enchant-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
    border: 2px solid #444444;
    border-radius: 6px;
    transition: all 0.15s;
    min-height: 90px;
  }

  .enchant-tool .enchant-item:hover {
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border-color: #6b4ce8;
  }

  .enchant-tool .enchant-item.selected {
    background: linear-gradient(180deg, rgba(107, 76, 232, 0.3) 0%, rgba(74, 50, 179, 0.3) 100%);
    border-color: #6b4ce8;
  }

  .enchant-tool .enchant-item .enchant-item-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .enchant-tool .enchant-item .enchant-name {
    font-size: 1rem;
    font-weight: bold;
    color: #ffffff;
  }

  .enchant-tool .enchant-item .enchant-en {
    font-size: 0.75rem;
    color: #aaaaaa;
  }

  /* レベル選択UI */
  .enchant-tool .enchant-level-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .enchant-tool .enchant-level-selector .level-label {
    font-size: 0.85rem;
    color: #cccccc;
    font-weight: bold;
  }

  .enchant-tool .enchant-level-selector .enchant-level-input {
    width: 65px;
    padding: 6px 8px;
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
    background: #2a2a2a;
    border: 2px solid #444444;
    color: var(--mc-color-diamond);
    border-radius: 4px;
  }

  .enchant-tool .enchant-level-selector .enchant-level-input:focus {
    outline: none;
    border-color: #6b4ce8;
    box-shadow: 0 0 0 2px rgba(107, 76, 232, 0.3);
  }

  .enchant-tool .enchant-level-selector .level-presets {
    display: flex;
    gap: 4px;
  }

  .enchant-tool .enchant-level-selector .level-preset-btn {
    padding: 4px 8px;
    font-size: 0.75rem;
    font-weight: bold;
    border-radius: 3px;
    border: 1px solid #555555;
    background: #3a3a3a;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
  }

  .enchant-tool .enchant-level-selector .level-preset-btn:hover {
    background: #6b4ce8;
    border-color: #8b6cf8;
    color: white;
  }

  .enchant-tool .enchant-level-selector .level-preset-btn.extreme {
    background: linear-gradient(135deg, rgba(255, 170, 0, 0.3) 0%, rgba(255, 107, 107, 0.3) 100%);
    border-color: var(--mc-color-gold);
    color: var(--mc-color-gold);
  }

  .enchant-tool .enchant-level-selector .level-preset-btn.extreme:hover {
    background: linear-gradient(135deg, #ffaa00 0%, #ff6b6b 100%);
    color: white;
    box-shadow: 0 0 6px rgba(255, 170, 0, 0.5);
  }

  /* 追加ボタン */
  .enchant-tool .enchant-add-btn {
    align-self: flex-end;
    padding: 8px 16px;
    font-size: 1.1rem;
    font-weight: bold;
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    color: white;
    border: 2px solid #5d3fd3;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    margin-top: auto;
  }

  .enchant-tool .enchant-add-btn:hover {
    background: linear-gradient(180deg, #7d5ef5 0%, #5a42c3 100%);
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(107, 76, 232, 0.5);
  }

  .enchant-tool .enchant-item.selected .enchant-add-btn {
    background: #555555;
    border-color: #444;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .enchant-tool .enchant-info-hint {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background: linear-gradient(135deg, rgba(107, 76, 232, 0.15) 0%, rgba(170, 0, 255, 0.15) 100%);
    border: 1px solid rgba(107, 76, 232, 0.4);
    border-radius: 4px;
    margin-bottom: var(--mc-space-sm);
    font-size: 0.8rem;
    color: #cccccc;
  }

  .enchant-tool .enchant-info-hint .hint-icon {
    font-size: 1.1rem;
  }

  /* 選択されたエンチャント */
  .enchant-tool .selected-enchants {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(30,30,30,0.8);
    border: 2px solid #555555;
    border-radius: 6px;
    min-height: 80px;
    max-height: none;
    overflow-y: visible;
  }

  .enchant-tool .selected-enchant {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
    border-left: 4px solid #6b4ce8;
    border-radius: 0 6px 6px 0;
    transition: all 0.2s;
  }

  .enchant-tool .selected-enchant:hover {
    background: linear-gradient(180deg, rgba(107, 76, 232, 0.2) 0%, rgba(74, 50, 179, 0.2) 100%);
  }

  .enchant-tool .selected-enchant.curse {
    border-left-color: var(--mc-color-redstone);
  }

  .enchant-tool .selected-enchant .enchant-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 120px;
  }

  .enchant-tool .selected-enchant .enchant-label {
    font-size: 1rem;
    font-weight: bold;
    color: #ffffff;
  }

  .enchant-tool .selected-enchant .enchant-level-display {
    font-size: 0.8rem;
    color: var(--mc-color-diamond);
    font-family: var(--mc-font-mono);
  }

  .enchant-tool .selected-enchant .enchant-level-control {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .enchant-tool .selected-enchant .level-input-wrapper {
    display: flex;
    align-items: center;
    position: relative;
  }

  .enchant-tool .selected-enchant .enchant-level {
    width: 55px;
    padding: 4px 6px;
    font-size: 0.85rem;
    font-weight: bold;
    text-align: center;
    background: #2a2a2a;
    border: 2px solid #555555;
    color: #ffffff;
    border-radius: 3px;
    transition: all 0.15s;
  }

  .enchant-tool .selected-enchant .enchant-level:hover {
    border-color: #6b4ce8;
    background: rgba(107, 76, 232, 0.1);
  }

  .enchant-tool .selected-enchant .enchant-level:focus {
    outline: none;
    border-color: #6b4ce8;
    box-shadow: 0 0 0 2px rgba(107, 76, 232, 0.3);
  }

  .enchant-tool .selected-enchant .level-suffix {
    font-size: 0.65rem;
    color: #aaaaaa;
    margin-left: 3px;
    font-weight: bold;
  }

  .enchant-tool .selected-enchant .level-quick-controls {
    display: flex;
    gap: 3px;
  }

  .enchant-tool .selected-enchant .level-quick-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
    font-weight: bold;
    border-radius: 3px;
    border: 1px solid #555555;
    background: #3a3a3a;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
    min-width: 32px;
  }

  .enchant-tool .selected-enchant .level-quick-btn:hover {
    transform: translateY(-1px);
  }

  .enchant-tool .selected-enchant .level-quick-btn.quick-btn-preset {
    min-width: 28px;
  }

  .enchant-tool .selected-enchant .level-quick-btn.quick-btn-preset:hover {
    background: #555555;
    border-color: #666666;
  }

  .enchant-tool .selected-enchant .level-quick-btn.quick-btn-normal:hover {
    background: #6b4ce8;
    border-color: #8b6cf8;
    color: white;
  }

  .enchant-tool .selected-enchant .level-quick-btn.quick-btn-extreme {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.8) 0%, rgba(255, 165, 0, 0.8) 100%);
    color: white;
    border-color: #ff6b6b;
  }

  .enchant-tool .selected-enchant .level-quick-btn.quick-btn-extreme:hover {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff9100 100%);
    border-color: #ff4444;
    box-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
  }

  .enchant-tool .selected-enchant .level-status-badge {
    font-size: 0.8rem;
    color: var(--mc-color-gold);
    min-width: 14px;
    text-align: center;
  }

  .enchant-tool .selected-enchant .enchant-remove {
    width: 28px;
    height: 28px;
    background: rgba(200, 0, 0, 0.2);
    border: 1px solid #aa0000;
    border-radius: 4px;
    color: #ff5555;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .enchant-tool .selected-enchant .enchant-remove:hover {
    background: #c80000;
    color: white;
    border-color: #a00000;
  }

  .enchant-tool .selected-enchant.over-default {
    border-left-color: var(--mc-color-gold);
    background: rgba(255, 170, 0, 0.15);
  }

  .enchant-tool .selected-enchant.over-default .enchant-level {
    border-color: var(--mc-color-gold);
    background: rgba(242, 193, 61, 0.2);
    color: var(--mc-color-gold);
  }

  .enchant-tool .selected-enchant.over-default .enchant-level-display {
    color: var(--mc-color-gold);
  }

  /* 属性 */
  .enchant-tool .attributes-section {
    margin-top: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: rgba(30,30,30,0.8);
    border: 2px solid #555555;
    border-radius: 4px;
    overflow-x: auto;
  }

  .enchant-tool .attr-grid-header {
    display: grid;
    grid-template-columns: 24px 1fr 50px 90px 120px 100px;
    gap: var(--mc-space-sm);
    padding: 8px 0;
    border-bottom: 2px solid #555555;
    font-size: 0.7rem;
    color: #888888;
    font-weight: bold;
    min-width: 550px;
  }

  .enchant-tool .attribute-row {
    display: grid;
    grid-template-columns: 24px 1fr 50px 90px 120px 100px;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: 6px 0;
    border-bottom: 1px solid #444444;
    min-width: 550px;
    transition: background 0.15s;
  }

  .enchant-tool .attribute-row:hover {
    background: rgba(107, 76, 232, 0.1);
  }

  .enchant-tool .attribute-row:last-child {
    border-bottom: none;
  }

  .enchant-tool .attribute-row .attr-icon {
    width: 20px;
    height: 20px;
    image-rendering: pixelated;
  }

  .enchant-tool .attribute-row .attr-name {
    font-size: 0.8rem;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .enchant-tool .attribute-row .attr-check {
    width: 18px;
    height: 18px;
    accent-color: #6b4ce8;
    justify-self: center;
  }

  .enchant-tool .attribute-row .attr-value {
    width: 100%;
    background: #2a2a2a;
    border: 2px solid #555555;
    color: #ffffff;
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .enchant-tool .attribute-row .attr-slot,
  .enchant-tool .attribute-row .attr-operation {
    width: 100%;
    background: #2a2a2a;
    border: 2px solid #555555;
    color: #ffffff;
    padding: 4px 4px;
    border-radius: 4px;
    font-size: 0.7rem;
    cursor: pointer;
  }

  .enchant-tool .attribute-row .attr-slot:disabled,
  .enchant-tool .attribute-row .attr-operation:disabled,
  .enchant-tool .attribute-row .attr-value:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 耐久力セクション */
  .enchant-tool .durability-section {
    margin-top: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: rgba(30,30,30,0.8);
    border: 2px solid #555555;
    border-radius: 4px;
  }

  .enchant-tool .durability-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--mc-space-lg);
    margin-bottom: var(--mc-space-md);
  }

  .enchant-tool .durability-item {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
  }

  .enchant-tool .durability-item label {
    font-size: 0.85rem;
    color: #cccccc;
    font-weight: bold;
  }

  .enchant-tool .durability-item input {
    background: #1a1a1a;
    border: 2px solid #555555;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .enchant-tool .durability-hint {
    font-size: 0.7rem;
    color: #888888;
  }

  .enchant-tool .durability-presets {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    flex-wrap: wrap;
  }

  .enchant-tool .durability-presets .preset-label {
    font-size: 0.8rem;
    color: #888888;
  }

  .enchant-tool .durability-preset-btn {
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    color: #ffffff;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .enchant-tool .durability-preset-btn:hover {
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    border-color: #8b6cf8;
  }

  /* プリセット */
  .enchant-tool .preset-categories {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
  }

  .enchant-tool .preset-category {
    background: rgba(30,30,30,0.5);
    border-radius: 4px;
    overflow: hidden;
  }

  .enchant-tool .preset-category-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
    border-left: 4px solid;
    font-size: 0.85rem;
    font-weight: bold;
    color: #ffffff;
  }

  .enchant-tool .preset-category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
  }

  .enchant-tool .preset-btn {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
    padding: 6px 12px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    color: #ffffff;
    transition: all 0.15s;
  }

  .enchant-tool .preset-btn:hover {
    background: linear-gradient(180deg, #6b4ce8 0%, #4a32b3 100%);
    border-color: #8b6cf8;
  }

  .enchant-tool .preset-btn .preset-btn-icon {
    width: 16px;
    height: 16px;
  }

  .enchant-tool .preset-btn.preset-clear {
    background: linear-gradient(180deg, #e04040 0%, #c80000 100%);
    border-color: #a00000;
    color: white;
  }

  .enchant-tool .preset-btn.preset-clear:hover {
    background: linear-gradient(180deg, #ff5050 0%, #e00000 100%);
  }

  /* プレビュー */
  .enchant-tool .enchant-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-radius: 8px;
  }

  .enchant-tool .enchant-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: #aaaaaa;
  }

  /* Minecraft風インベントリプレビュー */
  .enchant-tool .mc-inventory-preview {
    display: flex;
    align-items: flex-start;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(135deg, #0d0d1a 0%, #0a0f1e 100%);
    border: 3px solid #3d3d3d;
    border-radius: 4px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }

  /* インベントリスロット（大） */
  .mc-inv-slot-large {
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

  .mc-inv-slot-large.enchanted {
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

  .mc-inv-item-img {
    width: 48px;
    height: 48px;
    image-rendering: pixelated;
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  .mc-inv-slot-large:hover .mc-inv-item-img {
    transform: scale(1.1);
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5)) brightness(1.2);
  }

  .mc-inv-slot-large.enchanted .mc-inv-item-img {
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5)) drop-shadow(0 0 5px rgba(170, 0, 255, 0.5));
  }

  .mc-inv-count {
    position: absolute;
    bottom: 2px;
    right: 4px;
    font-family: 'Minecraft', monospace;
    font-size: 14px;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 0 #3f3f3f, -1px -1px 0 #3f3f3f;
    line-height: 1;
  }

  /* Minecraft風ツールチップ */
  .mc-item-tooltip {
    flex: 1;
    background: linear-gradient(180deg, #100010 0%, #1a001a 100%);
    border: 2px solid;
    border-color: #5000aa #28007f #28007f #5000aa;
    padding: 8px 12px;
    min-width: 180px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }

  .mc-item-tooltip .tooltip-name {
    font-family: 'Minecraft', sans-serif;
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 4px;
    text-shadow: 1px 1px 0 #3f3f3f;
  }

  .mc-item-tooltip .tooltip-name.enchanted {
    color: #55ffff;
    text-shadow: 0 0 10px rgba(85, 255, 255, 0.5);
  }

  .mc-item-tooltip .tooltip-enchants {
    border-top: 1px solid rgba(128, 0, 255, 0.3);
    padding-top: 6px;
    margin-top: 4px;
  }

  .mc-item-tooltip .tooltip-meta {
    border-top: 1px solid rgba(128, 0, 255, 0.2);
    padding-top: 6px;
    margin-top: 8px;
  }

  .mc-item-tooltip .tooltip-id {
    font-family: var(--mc-font-mono);
    font-size: 0.7rem;
    color: #555;
  }

  /* アイテムステータスバー */
  .item-stats-bar {
    display: flex;
    gap: var(--mc-space-lg);
    padding: var(--mc-space-sm) var(--mc-space-md);
    margin-top: var(--mc-space-sm);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .item-stats-bar .stat-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
  }

  .item-stats-bar .stat-label {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .item-stats-bar .stat-value {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--mc-color-diamond);
    font-family: var(--mc-font-mono);
  }

  /* 旧プレビュースタイル（後方互換） */
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

  .preview-enchants, .tooltip-enchants {
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

  @media (max-width: 900px) {
    .enchant-tool .category-enchants {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .item-selector {
      grid-template-columns: 1fr;
    }

    .enchant-tool .category-enchants {
      grid-template-columns: 1fr;
    }

    .enchant-tool .enchant-item {
      padding: 12px;
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

    /* Minecraft風プレビューダークモード */
    .enchant-tool .mc-inventory-preview {
      background: linear-gradient(135deg, #0d0d1a 0%, #0a0f1e 100%);
    }

    .enchant-tool .mc-item-tooltip {
      background: linear-gradient(180deg, #0a000a 0%, #0d000d 100%);
    }

    .enchant-tool .mc-item-tooltip .tooltip-name {
      color: #e8e8e8;
    }

    .enchant-tool .mc-item-tooltip .tooltip-id {
      color: #666;
    }

    .enchant-tool .item-stats-bar {
      background: rgba(0, 0, 0, 0.4);
    }

    .enchant-tool .item-stats-bar .stat-label {
      color: #888;
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
