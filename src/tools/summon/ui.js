/**
 * Summon Generator - UI
 * エンティティ召喚コマンド生成ツール
 * Minecraft公式サイト風デザイン
 */

import { $, $$, createElement, debounce, delegate } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl, getSpawnEggUrl } from '../../core/wiki-images.js';
import { applyTooltip, addItemData } from '../../core/mc-tooltip.js';
import { compareVersions, getVersionGroup, getVersionNote } from '../../core/version-compat.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';

// RichTextEditorインスタンス
let summonNameEditor = null;

// エンチャントモーダル用の現在編集中スロット
let currentEditSlot = null;

// 装備スロット
const EQUIPMENT_SLOTS = [
  { id: 'head', name: 'ヘルメット', image: getInviconUrl('iron_helmet'), itemId: 'iron_helmet' },
  { id: 'chest', name: 'チェストプレート', image: getInviconUrl('iron_chestplate'), itemId: 'iron_chestplate' },
  { id: 'legs', name: 'レギンス', image: getInviconUrl('iron_leggings'), itemId: 'iron_leggings' },
  { id: 'feet', name: 'ブーツ', image: getInviconUrl('iron_boots'), itemId: 'iron_boots' },
  { id: 'mainhand', name: 'メイン手', image: getInviconUrl('iron_sword'), itemId: 'iron_sword' },
  { id: 'offhand', name: 'オフハンド', image: getInviconUrl('shield'), itemId: 'shield' },
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

// エンティティカテゴリ（カテゴリ別に整理）
const ENTITY_CATEGORIES = {
  hostile: {
    name: '敵対的Mob',
    icon: 'zombie',
    color: '#c80000',
    entities: [
      { id: 'zombie', name: 'ゾンビ', desc: '基本的な敵Mob' },
      { id: 'skeleton', name: 'スケルトン', desc: '弓を撃つ' },
      { id: 'creeper', name: 'クリーパー', desc: '爆発する' },
      { id: 'spider', name: 'クモ', desc: '壁を登れる' },
      { id: 'enderman', name: 'エンダーマン', desc: 'テレポートする' },
      { id: 'witch', name: 'ウィッチ', desc: 'ポーションを投げる' },
      { id: 'slime', name: 'スライム', desc: '分裂する' },
      { id: 'phantom', name: 'ファントム', desc: '空を飛ぶ' },
      { id: 'drowned', name: 'ドラウンド', desc: '水中ゾンビ' },
      { id: 'husk', name: 'ハスク', desc: '砂漠ゾンビ' },
      { id: 'stray', name: 'ストレイ', desc: '氷スケルトン' },
      { id: 'blaze', name: 'ブレイズ', desc: '火の玉を撃つ' },
      { id: 'ghast', name: 'ガスト', desc: '巨大な火の玉' },
      { id: 'magma_cube', name: 'マグマキューブ', desc: 'ネザーのスライム' },
      { id: 'wither_skeleton', name: 'ウィザースケルトン', desc: '衰弱効果' },
      { id: 'piglin_brute', name: 'ピグリンブルート', desc: '常に敵対的' },
      { id: 'hoglin', name: 'ホグリン', desc: 'ネザーの獣' },
      { id: 'zoglin', name: 'ゾグリン', desc: 'ゾンビ化ホグリン' },
      { id: 'ravager', name: 'ラヴェジャー', desc: '襲撃の獣' },
      { id: 'vex', name: 'ヴェックス', desc: '壁をすり抜ける' },
      { id: 'evoker', name: 'エヴォーカー', desc: '魔法を使う' },
      { id: 'vindicator', name: 'ヴィンディケーター', desc: '斧を持つ' },
      { id: 'pillager', name: 'ピリジャー', desc: 'クロスボウを持つ' },
      { id: 'warden', name: 'ウォーデン', desc: '最強の敵Mob' },
      { id: 'breeze', name: 'ブリーズ', desc: '風の攻撃' },
    ]
  },
  passive: {
    name: '友好的Mob',
    icon: 'pig',
    color: '#5cb746',
    entities: [
      { id: 'pig', name: 'ブタ', desc: '豚肉をドロップ' },
      { id: 'cow', name: 'ウシ', desc: '牛肉と革' },
      { id: 'sheep', name: 'ヒツジ', desc: '羊毛を刈れる' },
      { id: 'chicken', name: 'ニワトリ', desc: '卵を産む' },
      { id: 'rabbit', name: 'ウサギ', desc: '小さくて速い' },
      { id: 'horse', name: 'ウマ', desc: '乗れる' },
      { id: 'donkey', name: 'ロバ', desc: 'チェスト付き' },
      { id: 'mule', name: 'ラバ', desc: 'ウマとロバの子' },
      { id: 'llama', name: 'ラマ', desc: 'カーペット装備可' },
      { id: 'cat', name: 'ネコ', desc: 'クリーパー除け' },
      { id: 'wolf', name: 'オオカミ', desc: '飼いならせる' },
      { id: 'ocelot', name: 'ヤマネコ', desc: 'ジャングルに生息' },
      { id: 'parrot', name: 'オウム', desc: '音を真似る' },
      { id: 'fox', name: 'キツネ', desc: 'アイテムを拾う' },
      { id: 'bee', name: 'ミツバチ', desc: '蜂蜜を作る' },
      { id: 'turtle', name: 'カメ', desc: '卵を産む' },
      { id: 'axolotl', name: 'ウーパールーパー', desc: '水中で再生' },
      { id: 'frog', name: 'カエル', desc: 'マグマキューブを食べる' },
      { id: 'allay', name: 'アレイ', desc: 'アイテムを集める' },
      { id: 'sniffer', name: 'スニッファー', desc: '種を掘る' },
      { id: 'camel', name: 'ラクダ', desc: '2人乗り' },
      { id: 'armadillo', name: 'アルマジロ', desc: '鱗をドロップ' },
    ]
  },
  neutral: {
    name: '中立Mob',
    icon: 'iron_golem',
    color: '#f2c13d',
    entities: [
      { id: 'iron_golem', name: 'アイアンゴーレム', desc: '村を守る' },
      { id: 'snow_golem', name: 'スノウゴーレム', desc: '雪玉を投げる' },
      { id: 'piglin', name: 'ピグリン', desc: '金で取引' },
      { id: 'zombified_piglin', name: 'ゾンビピグリン', desc: '攻撃すると群れで襲う' },
      { id: 'endermite', name: 'エンダーマイト', desc: 'エンダーマンの敵' },
      { id: 'polar_bear', name: 'シロクマ', desc: '子供がいると攻撃的' },
      { id: 'panda', name: 'パンダ', desc: '竹を食べる' },
      { id: 'dolphin', name: 'イルカ', desc: '泳ぎを速くする' },
      { id: 'trader_llama', name: '行商人のラマ', desc: '行商人と一緒' },
      { id: 'goat', name: 'ヤギ', desc: '突進攻撃' },
    ]
  },
  npc: {
    name: 'NPC',
    icon: 'villager',
    color: '#8b6914',
    entities: [
      { id: 'villager', name: '村人', desc: '取引できる' },
      { id: 'wandering_trader', name: '行商人', desc: 'レアアイテム取引' },
      { id: 'zombie_villager', name: '村人ゾンビ', desc: '治療可能' },
    ]
  },
  boss: {
    name: 'ボス',
    icon: 'wither_skeleton_skull',
    color: '#7b3f9e',
    entities: [
      { id: 'ender_dragon', name: 'エンダードラゴン', desc: 'エンドのボス' },
      { id: 'wither', name: 'ウィザー', desc: '召喚して戦う' },
      { id: 'elder_guardian', name: 'エルダーガーディアン', desc: '海底神殿のボス' },
    ]
  },
  aquatic: {
    name: '水生Mob',
    icon: 'tropical_fish',
    color: '#4decf2',
    entities: [
      { id: 'squid', name: 'イカ', desc: '墨を吐く' },
      { id: 'glow_squid', name: '発光イカ', desc: '光る墨' },
      { id: 'cod', name: 'タラ', desc: '魚' },
      { id: 'salmon', name: 'サケ', desc: '魚' },
      { id: 'tropical_fish', name: '熱帯魚', desc: 'カラフル' },
      { id: 'pufferfish', name: 'フグ', desc: '毒' },
      { id: 'guardian', name: 'ガーディアン', desc: 'ビームを撃つ' },
    ]
  },
  other: {
    name: 'その他',
    icon: 'armor_stand',
    color: '#888888',
    entities: [
      { id: 'armor_stand', name: '防具立て', desc: '装飾用' },
      { id: 'item_frame', name: '額縁', desc: 'アイテムを飾る' },
      { id: 'glow_item_frame', name: '発光額縁', desc: '光る額縁' },
      { id: 'painting', name: '絵画', desc: '壁に飾る' },
      { id: 'minecart', name: 'トロッコ', desc: 'レール上を移動' },
      { id: 'boat', name: 'ボート', desc: '水上移動' },
      { id: 'tnt', name: 'TNT', desc: '爆発物' },
      { id: 'falling_block', name: '落下ブロック', desc: '落下する' },
      { id: 'experience_orb', name: '経験値オーブ', desc: '経験値を得る' },
      { id: 'lightning_bolt', name: '雷', desc: '落雷' },
    ]
  },
};

// JSONテキストの色
const TEXT_COLORS = [
  { id: 'black', name: '黒', hex: '#000000' },
  { id: 'dark_blue', name: '紺', hex: '#0000AA' },
  { id: 'dark_green', name: '緑', hex: '#00AA00' },
  { id: 'dark_aqua', name: '青緑', hex: '#00AAAA' },
  { id: 'dark_red', name: '暗赤', hex: '#AA0000' },
  { id: 'dark_purple', name: '紫', hex: '#AA00AA' },
  { id: 'gold', name: '金', hex: '#FFAA00' },
  { id: 'gray', name: '灰', hex: '#AAAAAA' },
  { id: 'dark_gray', name: '暗灰', hex: '#555555' },
  { id: 'blue', name: '青', hex: '#5555FF' },
  { id: 'green', name: '黄緑', hex: '#55FF55' },
  { id: 'aqua', name: '水色', hex: '#55FFFF' },
  { id: 'red', name: '赤', hex: '#FF5555' },
  { id: 'light_purple', name: 'ピンク', hex: '#FF55FF' },
  { id: 'yellow', name: '黄', hex: '#FFFF55' },
  { id: 'white', name: '白', hex: '#FFFFFF' },
];

// エフェクト一覧
const EFFECTS = [
  { id: 'speed', name: '移動速度上昇', icon: 'speed' },
  { id: 'slowness', name: '移動速度低下', icon: 'slowness' },
  { id: 'haste', name: '採掘速度上昇', icon: 'haste' },
  { id: 'mining_fatigue', name: '採掘速度低下', icon: 'mining-fatigue' },
  { id: 'strength', name: '攻撃力上昇', icon: 'strength' },
  { id: 'instant_health', name: '即時回復', icon: 'instant-health' },
  { id: 'instant_damage', name: '即時ダメージ', icon: 'instant-damage' },
  { id: 'jump_boost', name: '跳躍力上昇', icon: 'jump-boost' },
  { id: 'nausea', name: '吐き気', icon: 'nausea' },
  { id: 'regeneration', name: '再生', icon: 'regeneration' },
  { id: 'resistance', name: '耐性', icon: 'resistance' },
  { id: 'fire_resistance', name: '火炎耐性', icon: 'fire-resistance' },
  { id: 'water_breathing', name: '水中呼吸', icon: 'water-breathing' },
  { id: 'invisibility', name: '透明化', icon: 'invisibility' },
  { id: 'blindness', name: '盲目', icon: 'blindness' },
  { id: 'night_vision', name: '暗視', icon: 'night-vision' },
  { id: 'hunger', name: '空腹', icon: 'hunger' },
  { id: 'weakness', name: '弱体化', icon: 'weakness' },
  { id: 'poison', name: '毒', icon: 'poison' },
  { id: 'wither', name: 'ウィザー', icon: 'wither' },
  { id: 'health_boost', name: '体力増強', icon: 'health-boost' },
  { id: 'absorption', name: '衝撃吸収', icon: 'absorption' },
  { id: 'saturation', name: '満腹度回復', icon: 'saturation' },
  { id: 'glowing', name: '発光', icon: 'glowing' },
  { id: 'levitation', name: '浮遊', icon: 'levitation' },
  { id: 'luck', name: '幸運', icon: 'luck' },
  { id: 'unluck', name: '不運', icon: 'unluck' },
  { id: 'slow_falling', name: '低速落下', icon: 'slow-falling' },
  { id: 'conduit_power', name: 'コンジットパワー', icon: 'conduit-power' },
  { id: 'dolphins_grace', name: 'イルカの恩恵', icon: 'dolphins-grace' },
  { id: 'bad_omen', name: '凶兆', icon: 'bad-omen' },
  { id: 'hero_of_the_village', name: '村の英雄', icon: 'hero-of-the-village' },
  { id: 'darkness', name: '暗闇', icon: 'darkness' },
];

// フォーム状態
let formState = {
  entity: 'zombie',
  pos: '~ ~ ~',
  // customName, nameColor, nameBold, nameItalic は RichTextEditor が管理
  noAI: false,
  silent: false,
  invulnerable: false,
  persistenceRequired: false,
  glowing: false,
  effects: [],
  rawNBT: '',
  equipment: {
    head: { item: '', enchants: [], dropChance: 0.085 },
    chest: { item: '', enchants: [], dropChance: 0.085 },
    legs: { item: '', enchants: [], dropChance: 0.085 },
    feet: { item: '', enchants: [], dropChance: 0.085 },
    mainhand: { item: '', enchants: [], dropChance: 0.085 },
    offhand: { item: '', enchants: [], dropChance: 0.085 },
  },
};

let selectedCategory = 'hostile';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  // RichTextEditorインスタンスを作成
  summonNameEditor = new RichTextEditor('summon-name-editor', {
    placeholder: 'エンティティの名前を入力...',
    showPreview: true,
    onChange: () => {}
  });

  return `
    <style>${RICH_TEXT_EDITOR_CSS}</style>
    <div class="tool-panel summon-tool mc-themed" id="summon-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl('command_block')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/summon コマンド</h2>
            <p class="header-subtitle">エンティティを召喚するコマンドを生成</p>
          </div>
        </div>
        <span class="version-badge" id="summon-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="summon-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="summon-version-note"></p>

      <form class="tool-form mc-form" id="summon-form">

        <!-- ステップ1: エンティティ選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>エンティティを選択</h3>
          </div>

          <!-- カテゴリタブ -->
          <div class="category-tabs" id="category-tabs">
            ${Object.entries(ENTITY_CATEGORIES).map(([catId, cat]) => `
              <button type="button" class="category-tab ${catId === selectedCategory ? 'active' : ''}"
                      data-category="${catId}" style="--cat-color: ${cat.color}">
                <img src="${getSpawnEggUrl(cat.icon)}" alt="" class="tab-icon mc-pixelated"
                     onerror="this.src='${getInviconUrl(cat.icon)}'">
                <span>${cat.name}</span>
              </button>
            `).join('')}
          </div>

          <!-- エンティティグリッド -->
          <div class="entity-grid-container">
            <div class="entity-grid" id="entity-grid">
              ${renderEntityGrid('hostile')}
            </div>
          </div>

          <!-- 選択中のエンティティ表示 -->
          <div class="selected-entity-display" id="selected-display">
            <img src="${getSpawnEggUrl('zombie')}" alt="" class="selected-entity-icon mc-pixelated" id="selected-icon">
            <div class="selected-entity-info">
              <span class="selected-entity-name" id="selected-name">ゾンビ</span>
              <code class="selected-entity-id" id="selected-id">minecraft:zombie</code>
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
              <input type="text" id="summon-pos" class="mc-input coord-input"
                     value="~ ~ ~" placeholder="X Y Z">
            </div>
          </div>
        </section>

        <!-- ステップ3: カスタム名（RichTextEditor対応） -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>名前設定 <span class="optional-badge">任意</span></h3>
          </div>
          <p class="section-hint">1文字ずつ色やスタイルを設定できます。テキストを選択して書式を適用してください。</p>
          ${summonNameEditor.render()}
        </section>

        <!-- ステップ4: 装備設定 -->
        <section class="form-section mc-section collapsible" data-collapsed="true">
          <div class="section-header clickable" data-toggle="equipment-content">
            <span class="step-number">4</span>
            <h3>装備設定 <span class="optional-badge">任意</span></h3>
            <span class="collapse-icon">▶</span>
          </div>

          <div class="section-content" id="equipment-content" style="display: none;">
            <p class="section-hint">装備可能なモブ（ゾンビ、スケルトン等）のみ有効です。</p>
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
          </div>
        </section>

        <!-- ステップ5: 動作設定 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">5</span>
            <h3>動作設定</h3>
          </div>

          <div class="behavior-grid">
            <label class="behavior-option">
              <input type="checkbox" id="summon-noai">
              <div class="option-content">
                <img src="${getInviconUrl('barrier')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">NoAI</span>
                  <span class="option-desc">動かない・攻撃しない</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="summon-silent">
              <div class="option-content">
                <img src="${getInviconUrl('note_block')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">Silent</span>
                  <span class="option-desc">音を出さない</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="summon-invulnerable">
              <div class="option-content">
                <img src="${getInviconUrl('totem_of_undying')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">無敵</span>
                  <span class="option-desc">ダメージを受けない</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="summon-persistence" checked>
              <div class="option-content">
                <img src="${getInviconUrl('name_tag')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">デスポーンしない</span>
                  <span class="option-desc">永続的に存在</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="summon-glowing">
              <div class="option-content">
                <img src="${getInviconUrl('glowstone_dust')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">発光</span>
                  <span class="option-desc">輪郭が光る</span>
                </div>
              </div>
            </label>
          </div>
        </section>

        <!-- ステップ6: エフェクト -->
        <section class="form-section mc-section collapsible" data-collapsed="true">
          <div class="section-header clickable" data-toggle="effects-content">
            <span class="step-number">6</span>
            <h3>エフェクト <span class="optional-badge">任意</span></h3>
            <span class="collapse-icon">▶</span>
          </div>

          <div class="section-content" id="effects-content" style="display: none;">
            <div class="effect-list" id="effect-list"></div>

            <div class="add-effect-row">
              <select class="mc-select effect-add-select" id="effect-add-select">
                <option value="">エフェクトを選択...</option>
                ${EFFECTS.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
              </select>
              <button type="button" class="mc-btn mc-btn-secondary" id="add-effect">
                + 追加
              </button>
            </div>
          </div>
        </section>

        <!-- ステップ7: 上級者向け -->
        <section class="form-section mc-section collapsible" data-collapsed="true">
          <div class="section-header clickable" data-toggle="advanced-content">
            <span class="step-number">7</span>
            <h3>Raw NBT <span class="advanced-badge">上級者向け</span></h3>
            <span class="collapse-icon">▶</span>
          </div>

          <div class="section-content" id="advanced-content" style="display: none;">
            <p class="help-text">手動でNBTタグを追加します。カンマ区切りで複数指定可能。</p>
            <textarea id="summon-raw" class="mc-input mc-code" rows="3"
                      placeholder='例: Health:100f,Fire:200,CustomNameVisible:1b'></textarea>
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

      <!-- Minecraft風ゲーム画面プレビュー -->
      <div class="summon-preview-section">
        <h3>プレビュー</h3>
        <div class="mc-inventory-preview summon-preview">
          <!-- エンティティスロット風表示 -->
          <div class="mc-inv-slot-large entity-slot" id="summon-preview-slot">
            <img class="mc-inv-item-img" id="summon-preview-icon" src="" alt="">
          </div>

          <!-- Minecraft風ツールチップ -->
          <div class="mc-item-tooltip entity-tooltip" id="summon-item-tooltip">
            <div class="tooltip-name" id="summon-preview-name">エンティティ</div>
            <div class="tooltip-attrs" id="summon-preview-attrs">
              <p class="text-muted">属性なし</p>
            </div>
            <div class="tooltip-effects" id="summon-preview-effects"></div>
            <div class="tooltip-meta">
              <span class="tooltip-id" id="summon-preview-id">minecraft:pig</span>
            </div>
          </div>
        </div>

        <!-- アイテム情報バー -->
        <div class="item-stats-bar">
          <div class="stat-item">
            <span class="stat-label">座標</span>
            <span class="stat-value" id="summon-stat-pos">~ ~ ~</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">属性</span>
            <span class="stat-value" id="summon-stat-attrs">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">エフェクト</span>
            <span class="stat-value" id="summon-stat-effects">0</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * エンティティグリッドをレンダリング
 */
function renderEntityGrid(categoryId) {
  const cat = ENTITY_CATEGORIES[categoryId];
  if (!cat) return '';

  return cat.entities.map(entity => `
    <button type="button" class="entity-card ${entity.id === formState.entity ? 'selected' : ''}"
            data-entity="${entity.id}" data-name="${entity.name}">
      <img src="${getSpawnEggUrl(entity.id)}" alt="${entity.name}"
           class="entity-icon mc-pixelated"
           onerror="this.src='${getInviconUrl(entity.id + '_spawn_egg')}'">
      <span class="entity-name">${entity.name}</span>
      <span class="entity-desc">${entity.desc}</span>
    </button>
  `).join('');
}

/**
 * 初期化
 */
export function init(container) {
  // カテゴリタブ切り替え
  delegate(container, 'click', '.category-tab', (e, target) => {
    const catId = target.dataset.category;
    selectedCategory = catId;

    $$('.category-tab', container).forEach(t => t.classList.remove('active'));
    target.classList.add('active');

    $('#entity-grid', container).innerHTML = renderEntityGrid(catId);
  });

  // エンティティ選択
  delegate(container, 'click', '.entity-card', (e, target) => {
    const entityId = target.dataset.entity;
    const entityName = target.dataset.name;

    formState.entity = entityId;

    $$('.entity-card', container).forEach(c => c.classList.remove('selected'));
    target.classList.add('selected');

    // 選択表示を更新
    $('#selected-icon', container).src = getSpawnEggUrl(entityId);
    $('#selected-name', container).textContent = entityName;
    $('#selected-id', container).textContent = `minecraft:${entityId}`;

    updateCommand(container);
  });

  // 座標プリセット
  delegate(container, 'click', '.coord-preset', (e, target) => {
    const pos = target.dataset.pos;
    $('#summon-pos', container).value = pos;
    formState.pos = pos;

    $$('.coord-preset', container).forEach(b => b.classList.remove('active'));
    target.classList.add('active');

    updateCommand(container);
  });

  // 座標入力
  $('#summon-pos', container)?.addEventListener('input', debounce((e) => {
    formState.pos = e.target.value || '~ ~ ~';
    updateCommand(container);
  }, 150));

  // RichTextEditor初期化
  if (summonNameEditor) {
    summonNameEditor.init(container);
    summonNameEditor.options.onChange = () => {
      updateSummonPreview(container);
      updateCommand(container);
    };
  }

  // オプションチェックボックス
  ['noai', 'silent', 'invulnerable', 'persistence', 'glowing'].forEach(opt => {
    $(`#summon-${opt}`, container)?.addEventListener('change', (e) => {
      const key = opt === 'persistence' ? 'persistenceRequired' : opt;
      formState[key] = e.target.checked;
      updateCommand(container);
    });
  });

  // 折りたたみセクション
  delegate(container, 'click', '.section-header.clickable', (e, target) => {
    const contentId = target.dataset.toggle;
    const content = $(`#${contentId}`, container);
    const section = target.closest('.collapsible');
    const icon = target.querySelector('.collapse-icon');

    if (content) {
      const isCollapsed = section.dataset.collapsed === 'true';
      section.dataset.collapsed = isCollapsed ? 'false' : 'true';
      content.style.display = isCollapsed ? 'block' : 'none';
      if (icon) icon.textContent = isCollapsed ? '▼' : '▶';
    }
  });

  // 装備選択
  delegate(container, 'change', '.equipment-select', (e, target) => {
    const slot = target.dataset.slot;
    formState.equipment[slot].item = target.value;
    updateEquipmentImage(slot, target.value, container);
    updateCommand(container);
  });

  // ドロップ確率
  delegate(container, 'input', '.drop-chance', debounce((e, target) => {
    const slot = target.dataset.slot;
    formState.equipment[slot].dropChance = (parseFloat(target.value) || 0) / 100;
    updateCommand(container);
  }, 100));

  // エンチャントボタン
  delegate(container, 'click', '.enchant-btn', (e, target) => {
    const slot = target.dataset.slot;
    openEnchantModal(slot, container);
  });

  // モーダル制御
  $('#modal-close', container)?.addEventListener('click', () => closeEnchantModal(container));
  $('.modal-overlay', container)?.addEventListener('click', () => closeEnchantModal(container));
  $('#modal-apply', container)?.addEventListener('click', () => applyEnchantments(container));

  // エフェクト追加
  $('#add-effect', container)?.addEventListener('click', () => {
    const select = $('#effect-add-select', container);
    const effectId = select.value;
    if (!effectId) return;

    // 重複チェック
    if (formState.effects.find(e => e.id === effectId)) {
      select.value = '';
      return;
    }

    formState.effects.push({
      id: effectId,
      amplifier: 0,
      duration: 600,
    });

    select.value = '';
    renderEffectList(container);
    updateCommand(container);
  });

  // Raw NBT
  $('#summon-raw', container)?.addEventListener('input', debounce((e) => {
    formState.rawNBT = e.target.value;
    updateCommand(container);
  }, 200));

  // グローバルバージョン変更時にコマンド再生成
  window.addEventListener('mc-version-change', () => {
    updateVersionDisplay(container);
    updateCommand(container);
  });

  // リセットボタン
  $('#summon-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期状態
  $('#summon-persistence', container).checked = true;
  updateVersionDisplay(container);
  updateCommand(container);
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // フォーム状態をリセット
  formState = {
    entity: 'zombie',
    pos: '~ ~ ~',
    // customName, nameColor, nameBold, nameItalic は RichTextEditor が管理
    noAI: false,
    silent: false,
    invulnerable: false,
    persistenceRequired: true,
    glowing: false,
    effects: [],
    rawNBT: '',
    equipment: {
      head: { item: '', enchants: [], dropChance: 0.085 },
      chest: { item: '', enchants: [], dropChance: 0.085 },
      legs: { item: '', enchants: [], dropChance: 0.085 },
      feet: { item: '', enchants: [], dropChance: 0.085 },
      mainhand: { item: '', enchants: [], dropChance: 0.085 },
      offhand: { item: '', enchants: [], dropChance: 0.085 },
    },
  };
  selectedCategory = 'hostile';

  // カテゴリタブを敵対的Mobに戻す
  $$('.category-tab', container).forEach(t => {
    t.classList.toggle('active', t.dataset.category === 'hostile');
  });

  // エンティティグリッドをリセット
  const entityGrid = $('#entity-grid', container);
  if (entityGrid) {
    entityGrid.innerHTML = renderEntityGrid('hostile');
  }

  // 選択中のエンティティ表示をリセット
  const selectedIcon = $('#selected-icon', container);
  if (selectedIcon) selectedIcon.src = getSpawnEggUrl('zombie');
  const selectedName = $('#selected-name', container);
  if (selectedName) selectedName.textContent = 'ゾンビ';
  const selectedId = $('#selected-id', container);
  if (selectedId) selectedId.textContent = 'minecraft:zombie';

  // 座標をリセット
  const posInput = $('#summon-pos', container);
  if (posInput) posInput.value = '~ ~ ~';
  $$('.coord-preset', container).forEach(b => {
    b.classList.toggle('active', b.dataset.pos === '~ ~ ~');
  });

  // RichTextEditorをリセット
  if (summonNameEditor) {
    summonNameEditor.clear();
  }

  // オプションをリセット
  const noaiCheck = $('#summon-noai', container);
  if (noaiCheck) noaiCheck.checked = false;
  const silentCheck = $('#summon-silent', container);
  if (silentCheck) silentCheck.checked = false;
  const invulnerableCheck = $('#summon-invulnerable', container);
  if (invulnerableCheck) invulnerableCheck.checked = false;
  const persistenceCheck = $('#summon-persistence', container);
  if (persistenceCheck) persistenceCheck.checked = true;
  const glowingCheck = $('#summon-glowing', container);
  if (glowingCheck) glowingCheck.checked = false;

  // エフェクトリストをクリア
  renderEffectList(container);

  // エフェクト追加セレクトをリセット
  const effectSelect = $('#effect-add-select', container);
  if (effectSelect) effectSelect.value = '';

  // Raw NBTをリセット
  const rawInput = $('#summon-raw', container);
  if (rawInput) rawInput.value = '';

  // 装備UIをリセット
  EQUIPMENT_SLOTS.forEach(slot => {
    const select = $(`.equipment-select[data-slot="${slot.id}"]`, container);
    if (select) select.value = '';
    const img = $(`.selected-item-image[data-slot="${slot.id}"]`, container);
    if (img) img.style.display = 'none';
    const dropChance = $(`.drop-chance[data-slot="${slot.id}"]`, container);
    if (dropChance) dropChance.value = '8.5';
    const enchantCount = $(`.enchant-count[data-slot="${slot.id}"]`, container);
    if (enchantCount) enchantCount.textContent = '0';
  });

  // 折りたたみセクションを閉じる
  $$('.collapsible', container).forEach(section => {
    section.dataset.collapsed = 'true';
    const content = section.querySelector('.section-content');
    if (content) content.style.display = 'none';
    const icon = section.querySelector('.collapse-icon');
    if (icon) icon.textContent = '▶';
  });

  // コマンドを更新
  updateCommand(container);
}

/**
 * バージョン表示を更新
 */
function updateVersionDisplay(container) {
  const version = workspaceStore.get('version') || '1.21';
  const badge = $('#summon-version-badge', container);
  const note = $('#summon-version-note', container);

  if (badge) {
    badge.textContent = version + '+';
  }
  if (note) {
    // summonが使えないバージョンの警告
    if (compareVersions(version, '1.4') < 0) {
      note.textContent = '注意: このバージョンでは /summon コマンドは使用できません';
      note.style.color = 'var(--mc-color-redstone)';
    } else {
      note.textContent = getVersionNote(version);
      note.style.color = 'var(--mc-color-diamond)';
    }
  }
}

/**
 * エフェクトリストをレンダリング
 */
function renderEffectList(container) {
  const list = $('#effect-list', container);
  if (!list) return;

  if (formState.effects.length === 0) {
    list.innerHTML = '<p class="empty-text">エフェクトなし</p>';
    return;
  }

  list.innerHTML = formState.effects.map((effect, index) => {
    const info = EFFECTS.find(e => e.id === effect.id);
    return `
      <div class="effect-row" data-index="${index}">
        <span class="effect-name">${info?.name || effect.id}</span>
        <div class="effect-controls">
          <label>
            Lv:
            <input type="number" class="mc-input effect-level" value="${effect.amplifier}"
                   min="0" max="255" data-index="${index}">
          </label>
          <label>
            時間:
            <input type="number" class="mc-input effect-duration" value="${effect.duration}"
                   min="1" data-index="${index}">
            <span class="unit">tick</span>
          </label>
          <button type="button" class="remove-effect-btn" data-index="${index}">×</button>
        </div>
      </div>
    `;
  }).join('');

  // イベント設定
  $$('.effect-level', list).forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      formState.effects[idx].amplifier = parseInt(e.target.value) || 0;
      updateCommand(container);
    });
  });

  $$('.effect-duration', list).forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      formState.effects[idx].duration = parseInt(e.target.value) || 600;
      updateCommand(container);
    });
  });

  $$('.remove-effect-btn', list).forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      formState.effects.splice(idx, 1);
      renderEffectList(container);
      updateCommand(container);
    });
  });
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
  const currentEnchants = formState.equipment[slot]?.enchants || [];
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

  formState.equipment[currentEditSlot].enchants = enchants;

  // エンチャント数を更新
  const countEl = $(`.enchant-count[data-slot="${currentEditSlot}"]`, container);
  if (countEl) {
    countEl.textContent = enchants.length;
  }

  closeEnchantModal(container);
  updateCommand(container);
}

/**
 * 装備NBTを生成（1.21+ エンティティタグはPascalCase）
 */
function buildEquipmentNBT(equipment) {
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

  // 装備があれば追加（1.21+ PascalCase）
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

/**
 * アイテムNBTを生成（1.21+ アイテムコンポーネント形式）
 * summonコマンドではlevelsラッパーが必須（giveコマンドとは異なる）
 */
function buildItemNBT(itemId, enchants) {
  const components = [];

  // エンチャント（1.21+ コンポーネント形式）
  // summonコマンドでは常にlevelsラッパーが必要
  // 形式: "minecraft:enchantments":{levels:{"minecraft:protection":4}}
  if (enchants && enchants.length > 0) {
    const enchantPairs = enchants.map(e => `"minecraft:${e.id}":${e.level}`).join(',');
    components.push(`"minecraft:enchantments":{levels:{${enchantPairs}}}`);
  }

  if (components.length > 0) {
    return `{id:"minecraft:${itemId}",count:1,components:{${components.join(',')}}}`;
  }

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
 * 装備が設定されているかチェック
 */
function hasEquipment(equipment) {
  return Object.values(equipment).some(eq => eq.item);
}

/**
 * コマンドを生成・更新（バージョン対応）
 */
function updateCommand(container) {
  // 現在のバージョンを取得
  const version = workspaceStore.get('version') || '1.21';
  const versionGroup = getVersionGroup(version);

  // 1.21.5以降: SNBTオブジェクト形式 {text:"...",color:"red"}
  // 1.13-1.21.4: JSON文字列形式 '{"text":"...","color":"red"}'
  const useSNBT = compareVersions(version, '1.21.5') >= 0;

  const nbtParts = [];

  // カスタム名（バージョンで形式が異なる）
  const customName = summonNameEditor?.getPlainText() || '';
  if (customName) {
    if (versionGroup === 'legacy') {
      // 1.12- では単純文字列
      nbtParts.push(`CustomName:"${customName}"`);
    } else if (useSNBT) {
      // 1.21.5+ では SNBTオブジェクト形式（コロン区切り、クォートなし）
      const snbtName = summonNameEditor?.getSNBT() || generateCustomNameSNBT(customName);
      nbtParts.push(`CustomName:${snbtName}`);
    } else {
      // 1.13-1.21.4 では JSON文字列形式（シングルクォートで囲む）
      const jsonName = summonNameEditor?.getJSON() || generateCustomNameJSON(customName);
      nbtParts.push(`CustomName:'${jsonName}'`);
    }
    nbtParts.push('CustomNameVisible:1b');
  }

  // オプション
  if (formState.noAI) nbtParts.push('NoAI:1b');
  if (formState.silent) nbtParts.push('Silent:1b');
  if (formState.invulnerable) nbtParts.push('Invulnerable:1b');
  if (formState.persistenceRequired) nbtParts.push('PersistenceRequired:1b');
  if (formState.glowing) nbtParts.push('Glowing:1b');

  // エフェクト（バージョンで形式が異なる）
  if (formState.effects.length > 0) {
    if (versionGroup === 'latest' || versionGroup === 'component') {
      // 1.20.5+ active_effects形式
      const effectsList = formState.effects.map(e =>
        `{id:"minecraft:${e.id}",amplifier:${e.amplifier}b,duration:${e.duration}}`
      ).join(',');
      nbtParts.push(`active_effects:[${effectsList}]`);
    } else {
      // 1.13-1.20.4 ActiveEffects形式
      const effectsList = formState.effects.map(e => {
        const effectId = getEffectNumericIdForSummon(e.id);
        return `{Id:${effectId}b,Amplifier:${e.amplifier}b,Duration:${e.duration}}`;
      }).join(',');
      nbtParts.push(`ActiveEffects:[${effectsList}]`);
    }
  }

  // 装備（装備可能なモブのみ有効）
  if (hasEquipment(formState.equipment)) {
    const equipmentItems = buildEquipmentNBT(formState.equipment);
    if (equipmentItems) nbtParts.push(equipmentItems);

    const dropChances = buildDropChancesNBT(formState.equipment);
    if (dropChances) nbtParts.push(dropChances);

    // 装備を確実に保持するため、他のアイテムを拾わないようにする
    nbtParts.push('CanPickUpLoot:0b');
  }

  // Raw NBT
  if (formState.rawNBT.trim()) {
    nbtParts.push(formState.rawNBT.trim());
  }

  // コマンド生成
  let entityId = formState.entity;

  // 1.12以前ではエンティティIDが異なる場合がある
  if (versionGroup === 'legacy') {
    entityId = getLegacyEntityId(formState.entity);
  }

  let command = `/summon minecraft:${entityId} ${formState.pos}`;
  if (nbtParts.length > 0) {
    command += ` {${nbtParts.join(',')}}`;
  }

  // プレビュー更新
  updateSummonPreview(container);

  setOutput(command, 'summon', { ...formState, version });
}

/**
 * JSON文字列をエスケープ
 * CustomName用：バックスラッシュ、ダブルクォート、改行をエスケープ
 */
function escapeJsonString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

/**
 * HTMLエスケープ
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * カスタム名のJSON Text Componentを生成
 * CustomNameはJSON形式の文字列（SNBTではない）
 *
 * 注意: CustomNameはデフォルトで斜体になるため、italic:falseを設定
 * 複数色の場合は配列形式で、最初に空のベースコンポーネントを追加
 */
function generateCustomNameJSON(plainText) {
  // RichTextEditorのcharactersがあればそれを使用
  if (summonNameEditor && summonNameEditor.characters && summonNameEditor.characters.length > 0) {
    const groups = summonNameEditor.getFormattedGroups();
    if (groups.length === 0) {
      return `{"text":"${escapeJsonString(plainText)}","italic":false}`;
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
  return `{"text":"${escapeJsonString(plainText)}","italic":false}`;
}

/**
 * グループをJSON形式に変換
 */
function formatGroupToJSON(group) {
  const parts = [`"text":"${escapeJsonString(group.text)}"`];
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
function generateCustomNameSNBT(plainText) {
  // RichTextEditorのcharactersがあればそれを使用
  if (summonNameEditor && summonNameEditor.characters && summonNameEditor.characters.length > 0) {
    const groups = summonNameEditor.getFormattedGroups();
    if (groups.length === 0) {
      return `{text:"${escapeJsonString(plainText)}",italic:false}`;
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
  return `{text:"${escapeJsonString(plainText)}",italic:false}`;
}

/**
 * グループをSNBT形式に変換（1.21.5+用）
 * SNBT形式: キーはクォートなし、値は文字列のみクォート
 */
function formatGroupToSNBT(group) {
  const parts = [`text:"${escapeJsonString(group.text)}"`];
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
 * Summonプレビューを更新
 */
function updateSummonPreview(container) {
  const iconImg = $('#summon-preview-icon', container);
  const nameEl = $('#summon-preview-name', container);
  const idEl = $('#summon-preview-id', container);
  const attrsEl = $('#summon-preview-attrs', container);
  const effectsEl = $('#summon-preview-effects', container);
  const previewSlot = $('#summon-preview-slot', container);

  // 統計バー
  const statPosEl = $('#summon-stat-pos', container);
  const statAttrsEl = $('#summon-stat-attrs', container);
  const statEffectsEl = $('#summon-stat-effects', container);

  // エンティティ情報を取得
  let entityInfo = null;
  for (const cat of Object.values(ENTITY_CATEGORIES)) {
    entityInfo = cat.entities.find(e => e.id === formState.entity);
    if (entityInfo) break;
  }

  // アイコン設定
  if (iconImg) {
    iconImg.src = getSpawnEggUrl(formState.entity);
    iconImg.alt = entityInfo?.name || formState.entity;
    iconImg.style.opacity = '1';
    iconImg.onerror = () => {
      iconImg.src = getInviconUrl(formState.entity + '_spawn_egg');
      iconImg.onerror = () => { iconImg.style.opacity = '0.3'; };
    };
  }

  // 名前表示
  if (nameEl) {
    const customName = summonNameEditor?.getPlainText() || '';
    const displayName = customName || entityInfo?.name || formState.entity;

    // RichTextEditorの出力を使ってリッチテキスト表示
    if (customName && summonNameEditor && summonNameEditor.characters && summonNameEditor.characters.length > 0) {
      const groups = summonNameEditor.getFormattedGroups();
      if (groups.length > 0) {
        // リッチテキストをHTML表示
        nameEl.innerHTML = groups.map(g => {
          const colorHex = TEXT_COLORS.find(c => c.id === g.color)?.hex || '#FFFFFF';
          let style = `color: ${colorHex};`;
          if (g.bold) style += ' font-weight: bold;';
          if (g.italic) style += ' font-style: italic;';
          if (g.underlined) style += ' text-decoration: underline;';
          if (g.strikethrough) style += ' text-decoration: line-through;';
          return `<span style="${style}">${escapeHtml(g.text)}</span>`;
        }).join('');
      } else {
        nameEl.textContent = displayName;
        nameEl.style.color = '';
        nameEl.style.fontWeight = '';
        nameEl.style.fontStyle = '';
      }
    } else {
      nameEl.textContent = displayName;
      nameEl.style.color = '';
      nameEl.style.fontWeight = '';
      nameEl.style.fontStyle = '';
    }
  }

  // ID表示
  if (idEl) {
    idEl.textContent = `minecraft:${formState.entity}`;
  }

  // 属性表示
  if (attrsEl) {
    const attrs = [];
    if (formState.noAI) attrs.push('NoAI');
    if (formState.silent) attrs.push('Silent');
    if (formState.invulnerable) attrs.push('無敵');
    if (formState.persistenceRequired) attrs.push('永続');
    if (formState.glowing) attrs.push('発光');

    if (attrs.length === 0) {
      attrsEl.innerHTML = '<p class="text-muted">属性なし</p>';
    } else {
      attrsEl.innerHTML = attrs.map(a => `<div class="preview-attr">${a}</div>`).join('');
    }
  }

  // エフェクト表示
  if (effectsEl) {
    if (formState.effects.length === 0) {
      effectsEl.innerHTML = '';
      effectsEl.style.display = 'none';
    } else {
      effectsEl.style.display = 'block';
      effectsEl.innerHTML = `
        <div class="effects-label">エフェクト:</div>
        ${formState.effects.map(e => {
          const info = EFFECTS.find(ef => ef.id === e.id);
          const level = e.amplifier > 0 ? ` ${toRoman(e.amplifier + 1)}` : '';
          return `<div class="preview-effect">${info?.name || e.id}${level}</div>`;
        }).join('')}
      `;
    }
  }

  // スロットのグロー効果
  if (previewSlot) {
    const customName = summonNameEditor?.getPlainText() || '';
    const hasCustomization = customName || formState.effects.length > 0 ||
      formState.noAI || formState.invulnerable || formState.glowing;
    if (hasCustomization) {
      previewSlot.classList.add('customized');
    } else {
      previewSlot.classList.remove('customized');
    }
  }

  // 統計バー更新
  if (statPosEl) statPosEl.textContent = formState.pos;
  if (statAttrsEl) {
    let attrCount = 0;
    if (formState.noAI) attrCount++;
    if (formState.silent) attrCount++;
    if (formState.invulnerable) attrCount++;
    if (formState.persistenceRequired) attrCount++;
    if (formState.glowing) attrCount++;
    statAttrsEl.textContent = attrCount;
  }
  if (statEffectsEl) statEffectsEl.textContent = formState.effects.length;
}

function toRoman(num) {
  const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return roman[num] || num.toString();
}

/**
 * エフェクトの数値IDを取得（summon用）
 */
function getEffectNumericIdForSummon(effectId) {
  const effectIdMap = {
    'speed': 1,
    'slowness': 2,
    'haste': 3,
    'mining_fatigue': 4,
    'strength': 5,
    'instant_health': 6,
    'instant_damage': 7,
    'jump_boost': 8,
    'nausea': 9,
    'regeneration': 10,
    'resistance': 11,
    'fire_resistance': 12,
    'water_breathing': 13,
    'invisibility': 14,
    'blindness': 15,
    'night_vision': 16,
    'hunger': 17,
    'weakness': 18,
    'poison': 19,
    'wither': 20,
    'health_boost': 21,
    'absorption': 22,
    'saturation': 23,
    'glowing': 24,
    'levitation': 25,
    'luck': 26,
    'unluck': 27,
    'slow_falling': 28,
    'conduit_power': 29,
    'dolphins_grace': 30,
    'bad_omen': 31,
    'hero_of_the_village': 32,
    'darkness': 33,
  };
  return effectIdMap[effectId] || 1;
}

/**
 * 1.12以前のエンティティIDを取得
 */
function getLegacyEntityId(entityId) {
  const legacyIdMap = {
    'zombified_piglin': 'zombie_pigman',
    'mooshroom': 'mooshroom',
  };
  return legacyIdMap[entityId] || entityId;
}

// スタイル
const style = document.createElement('style');
style.textContent = `
  /* Minecraft風テーマ */
  .summon-tool.mc-themed {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 0;
    border: 4px solid #0f0f23;
    box-shadow:
      inset 2px 2px 0 rgba(255,255,255,0.1),
      inset -2px -2px 0 rgba(0,0,0,0.3),
      0 8px 32px rgba(0,0,0,0.5);
  }

  .mc-pixelated {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  /* ヘッダー */
  .mc-header-banner {
    background: linear-gradient(90deg, #2d5016 0%, #3a6b1e 50%, #2d5016 100%);
    padding: 20px 24px;
    margin: -16px -16px 24px -16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #1a3009;
    position: relative;
  }

  .mc-header-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23000' opacity='0.1'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.5));
  }

  .header-text h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: bold;
    text-shadow: 2px 2px 0 #1a3009;
  }

  .header-subtitle {
    margin: 4px 0 0 0;
    color: rgba(255,255,255,0.8);
    font-size: 0.85rem;
  }

  .version-badge {
    background: linear-gradient(180deg, #f2c13d 0%, #d4a12a 100%);
    color: #1a1a2e;
    padding: 6px 12px;
    font-weight: bold;
    font-size: 0.8rem;
    border: 2px solid #8b6914;
    position: relative;
    z-index: 1;
  }

  /* セクション */
  .mc-section {
    background: rgba(255,255,255,0.05);
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .section-header.clickable {
    cursor: pointer;
    user-select: none;
  }

  .section-header.clickable:hover {
    opacity: 0.9;
  }

  .step-number {
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

  .section-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
    flex: 1;
  }

  .optional-badge, .advanced-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 3px;
    font-weight: normal;
  }

  .optional-badge {
    background: rgba(77, 236, 242, 0.2);
    color: #4decf2;
  }

  .advanced-badge {
    background: rgba(170, 0, 255, 0.2);
    color: #cc66ff;
  }

  .collapse-icon {
    color: rgba(255,255,255,0.5);
    font-size: 0.8rem;
  }

  /* カテゴリタブ */
  .category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .category-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.85rem;
  }

  .category-tab:hover {
    background: rgba(255,255,255,0.1);
    border-color: var(--cat-color, #5cb746);
  }

  .category-tab.active {
    background: linear-gradient(180deg, var(--cat-color, #5cb746) 0%, color-mix(in srgb, var(--cat-color, #5cb746) 70%, black) 100%);
    border-color: var(--cat-color, #5cb746);
    color: #ffffff;
  }

  .tab-icon {
    width: 24px;
    height: 24px;
  }

  /* エンティティグリッド */
  .entity-grid-container {
    max-height: 320px;
    overflow-y: auto;
    margin-bottom: 16px;
    border: 2px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.2);
  }

  .entity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    padding: 12px;
  }

  .entity-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: rgba(255,255,255,0.05);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }

  .entity-card:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
    transform: translateY(-2px);
  }

  .entity-card.selected {
    background: rgba(92, 183, 70, 0.2);
    border-color: #5cb746;
    box-shadow: 0 0 12px rgba(92, 183, 70, 0.3);
  }

  .entity-icon {
    width: 40px;
    height: 40px;
    filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.5));
  }

  .entity-name {
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .entity-desc {
    color: rgba(255,255,255,0.5);
    font-size: 0.65rem;
  }

  /* 選択中のエンティティ */
  .selected-entity-display {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(90deg, rgba(92, 183, 70, 0.2) 0%, rgba(92, 183, 70, 0.1) 100%);
    border: 2px solid #5cb746;
    border-left: 6px solid #5cb746;
  }

  .selected-entity-icon {
    width: 48px;
    height: 48px;
  }

  .selected-entity-name {
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .selected-entity-id {
    color: #5cb746;
    font-size: 0.85rem;
    display: block;
    margin-top: 4px;
  }

  /* 座標入力 */
  .coord-preset-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .coord-preset {
    padding: 10px 16px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.8);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.85rem;
  }

  .coord-preset code {
    display: block;
    color: #4decf2;
    margin-top: 4px;
    font-size: 0.75rem;
  }

  .coord-preset:hover {
    background: rgba(255,255,255,0.1);
  }

  .coord-preset.active {
    background: rgba(77, 236, 242, 0.2);
    border-color: #4decf2;
  }

  .coord-custom {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .coord-custom label {
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
  }

  .coord-input {
    flex: 1;
    max-width: 200px;
  }

  /* 名前エディタ */
  .name-input {
    width: 100%;
    margin-bottom: 16px;
  }

  .name-style-options {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 16px;
  }

  .color-selector label {
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    display: block;
    margin-bottom: 8px;
  }

  .color-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .color-btn {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.1s;
  }

  .color-btn:hover {
    transform: scale(1.2);
    z-index: 1;
  }

  .color-btn.active {
    border-color: #ffffff;
    box-shadow: 0 0 6px rgba(255,255,255,0.5);
  }

  .text-style-btns {
    display: flex;
    gap: 4px;
  }

  .style-btn {
    width: 36px;
    height: 36px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .style-btn:hover {
    background: rgba(255,255,255,0.1);
  }

  .style-btn.active {
    background: rgba(242, 193, 61, 0.3);
    border-color: #f2c13d;
    color: #f2c13d;
  }

  .name-preview {
    background: rgba(0,0,0,0.5);
    padding: 12px 16px;
    border: 2px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .preview-label {
    color: rgba(255,255,255,0.5);
    font-size: 0.8rem;
  }

  .preview-text {
    color: #ffffff;
    font-size: 1.1rem;
  }

  /* 動作設定 */
  .behavior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .behavior-option {
    cursor: pointer;
  }

  .behavior-option input {
    display: none;
  }

  .option-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    transition: all 0.15s;
  }

  .behavior-option:hover .option-content {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.2);
  }

  .behavior-option input:checked + .option-content {
    background: rgba(92, 183, 70, 0.2);
    border-color: #5cb746;
  }

  .option-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .option-text {
    display: flex;
    flex-direction: column;
  }

  .option-name {
    color: #ffffff;
    font-weight: 500;
  }

  .option-desc {
    color: rgba(255,255,255,0.5);
    font-size: 0.75rem;
  }

  /* エフェクト */
  .effect-list {
    margin-bottom: 16px;
  }

  .empty-text {
    color: rgba(255,255,255,0.4);
    font-size: 0.85rem;
    font-style: italic;
  }

  .effect-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 8px;
  }

  .effect-name {
    color: #ffffff;
    font-weight: 500;
    min-width: 120px;
  }

  .effect-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .effect-controls label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255,255,255,0.7);
    font-size: 0.8rem;
  }

  .effect-level, .effect-duration {
    width: 70px;
  }

  .unit {
    color: rgba(255,255,255,0.4);
    font-size: 0.75rem;
  }

  .remove-effect-btn {
    background: none;
    border: none;
    color: #c80000;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px 8px;
  }

  .remove-effect-btn:hover {
    color: #ff5555;
  }

  .add-effect-row {
    display: flex;
    gap: 12px;
  }

  .effect-add-select {
    flex: 1;
  }

  /* 装備グリッド */
  .equipment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .equipment-slot {
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
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

  .slot-icon {
    width: 32px;
    height: 32px;
    filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
  }

  .slot-name {
    color: #ffffff;
    font-weight: 600;
    font-size: 1rem;
  }

  .equipment-select-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .selected-item-image {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
  }

  .equipment-select {
    flex: 1;
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
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(170, 0, 255, 0.2);
    border: 2px solid rgba(170, 0, 255, 0.5);
    border-radius: 4px;
    color: #cc66ff;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.9rem;
  }

  .enchant-btn:hover {
    background: rgba(170, 0, 255, 0.3);
    border-color: #cc66ff;
  }

  .enchant-btn img {
    width: 20px;
    height: 20px;
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

  .drop-chance {
    width: 70px;
    padding: 6px 8px;
    font-size: 0.95rem;
    text-align: center;
  }

  /* エンチャントモーダル */
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
    background: rgba(0,0,0,0.7);
  }

  .modal-content {
    position: relative;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border: 4px solid #5d3fd3;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(90deg, #5d3fd3 0%, #4a2fb0 100%);
    border-bottom: 2px solid #3a2890;
  }

  .modal-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
  }

  .modal-close {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .modal-close:hover {
    color: #ff5555;
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
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

  .enchant-categories {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .enchant-category h4 {
    margin: 0 0 10px 0;
    color: #cc66ff;
    font-size: 0.9rem;
    border-bottom: 1px solid rgba(170, 0, 255, 0.3);
    padding-bottom: 6px;
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

  .enchant-name {
    flex: 1;
    color: #ffffff;
    font-size: 1rem;
    font-weight: 500;
  }

  .enchant-level {
    width: 70px;
    padding: 8px 10px;
    font-size: 1rem;
    text-align: center;
  }

  .enchant-max {
    color: rgba(255,255,255,0.5);
    font-size: 0.8rem;
    min-width: 100px;
    text-align: right;
  }

  .modal-footer {
    padding: 16px 20px;
    border-top: 2px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: flex-end;
  }

  /* 入力フィールド共通 */
  .summon-tool .mc-input {
    background: #1a1a2e;
    color: #ffffff;
    border: 2px solid rgba(255,255,255,0.2);
    padding: 10px 14px;
    font-size: 0.95rem;
  }

  .summon-tool .mc-input:focus {
    border-color: #5cb746;
    outline: none;
    box-shadow: 0 0 0 3px rgba(92, 183, 70, 0.2);
  }

  .summon-tool .mc-select {
    background: #1a1a2e;
    color: #ffffff;
    border: 2px solid rgba(255,255,255,0.2);
    padding: 10px 14px;
  }

  .summon-tool .mc-btn {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    color: #ffffff;
    border: 2px solid #2d5016;
    padding: 10px 20px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.15s;
  }

  .summon-tool .mc-btn:hover {
    background: linear-gradient(180deg, #6dc756 0%, #4a9138 100%);
    transform: translateY(-1px);
  }

  .summon-tool .mc-btn-secondary {
    background: linear-gradient(180deg, #4a4a4a 0%, #333333 100%);
    border-color: #222222;
  }

  .summon-tool .mc-btn-secondary:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #444444 100%);
  }

  .help-text {
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    margin-bottom: 12px;
  }

  .section-hint {
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    margin: -8px 0 16px 0;
  }

  /* スクロールバー */
  .entity-grid-container::-webkit-scrollbar {
    width: 8px;
  }

  .entity-grid-container::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.3);
  }

  .entity-grid-container::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
  }

  .entity-grid-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.3);
  }

  /* レスポンシブ */
  @media (max-width: 600px) {
    .category-tabs {
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 8px;
    }

    .entity-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    }

    .behavior-grid {
      grid-template-columns: 1fr;
    }

    .equipment-grid {
      grid-template-columns: 1fr;
    }

    .slot-actions {
      flex-wrap: wrap;
    }
  }

  /* ダークモードでのコントラスト改善（青紫/紺テーマ - コマンドブロック） */
  @media (prefers-color-scheme: dark) {
    .summon-tool .entity-card {
      background: rgba(93, 63, 211, 0.1);
    }

    .summon-tool .entity-card:hover {
      background: rgba(93, 63, 211, 0.2);
      border-color: #5d3fd3;
    }

    .summon-tool .entity-name {
      color: #f0f0f0;
    }

    .summon-tool .entity-desc {
      color: #a0a0a0;
    }

    .summon-tool .section-header h3 {
      color: #f0f0f0;
    }

    .summon-tool .coord-custom label {
      color: #c0c0c0;
    }

    .summon-tool .color-selector label {
      color: #c0c0c0;
    }

    .summon-tool .preview-label {
      color: #a0a0a0;
    }

    .summon-tool .option-name {
      color: #f0f0f0;
    }

    .summon-tool .option-desc {
      color: #a0a0a0;
    }

    .summon-tool .effect-name {
      color: #f0f0f0;
    }

    .summon-tool .effect-controls label {
      color: #c0c0c0;
    }

    .summon-tool .help-text {
      color: #a0a0a0;
    }

    .summon-tool .mc-input,
    .summon-tool .mc-select {
      background: #1e1e3c;
      color: #f0f0f0;
      border-color: rgba(93, 63, 211, 0.4);
    }

    .summon-tool .mc-input:focus,
    .summon-tool .mc-select:focus {
      border-color: #5d3fd3;
      box-shadow: 0 0 0 3px rgba(93, 63, 211, 0.3);
    }

    .summon-tool .mc-input::placeholder {
      color: #707090;
    }
  }

  /* Summonプレビューセクション */
  .summon-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    border-radius: 6px;
  }

  .summon-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
    text-transform: uppercase;
  }

  /* Minecraft風インベントリプレビュー */
  .summon-tool .mc-inventory-preview {
    display: flex;
    align-items: flex-start;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 3px solid #3d3d3d;
    border-radius: 4px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }

  .summon-tool .mc-inv-slot-large {
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

  .summon-tool .mc-inv-slot-large.customized {
    animation: entity-glow 2s ease-in-out infinite;
  }

  @keyframes entity-glow {
    0%, 100% {
      box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a, 0 0 10px rgba(93, 63, 211, 0.4);
    }
    50% {
      box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a, 0 0 20px rgba(93, 63, 211, 0.7), 0 0 30px rgba(93, 63, 211, 0.3);
    }
  }

  .summon-tool .mc-inv-item-img {
    width: 48px;
    height: 48px;
    image-rendering: pixelated;
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
    transition: transform 0.2s ease;
  }

  .summon-tool .mc-inv-slot-large:hover .mc-inv-item-img {
    transform: scale(1.1);
  }

  .summon-tool .mc-item-tooltip {
    flex: 1;
    background: linear-gradient(180deg, #100010 0%, #1a001a 100%);
    border: 2px solid;
    border-color: #5d3fd3 #3a2890 #3a2890 #5d3fd3;
    padding: 8px 12px;
    min-width: 180px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }

  .summon-tool .tooltip-name {
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 4px;
  }

  .summon-tool .tooltip-attrs {
    border-top: 1px solid rgba(93, 63, 211, 0.3);
    padding-top: 6px;
    margin-top: 4px;
  }

  .summon-tool .preview-attr {
    color: #aaa;
    font-size: 0.85rem;
    padding: 2px 0;
  }

  .summon-tool .tooltip-effects {
    border-top: 1px solid rgba(93, 63, 211, 0.2);
    padding-top: 6px;
    margin-top: 6px;
  }

  .summon-tool .effects-label {
    color: #888;
    font-size: 0.75rem;
    margin-bottom: 4px;
  }

  .summon-tool .preview-effect {
    color: #55ffff;
    font-size: 0.85rem;
    padding: 2px 0;
  }

  .summon-tool .tooltip-meta {
    border-top: 1px solid rgba(93, 63, 211, 0.2);
    padding-top: 6px;
    margin-top: 8px;
  }

  .summon-tool .tooltip-id {
    font-family: var(--mc-font-mono);
    font-size: 0.7rem;
    color: #555;
  }

  .summon-tool .item-stats-bar {
    display: flex;
    gap: var(--mc-space-lg);
    padding: var(--mc-space-sm) var(--mc-space-md);
    margin-top: var(--mc-space-sm);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .summon-tool .stat-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
  }

  .summon-tool .stat-label {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .summon-tool .stat-value {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--mc-color-diamond);
    font-family: var(--mc-font-mono);
  }

  .summon-tool .text-muted {
    color: var(--mc-text-muted);
  }
`;
document.head.appendChild(style);

export default { render, init };
