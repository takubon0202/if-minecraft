/**
 * WorldEdit Command Generator - UI
 * WorldEditプラグイン/MODのコマンド生成ツール
 * 全ブロック対応・バージョン別フィルタリング機能付き
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import {
  BLOCK_CATEGORIES,
  ALL_BLOCKS,
  SUPPORTED_VERSIONS,
  getBlocksForVersion,
  getBlocksByCategory,
  searchBlocks,
  compareVersions
} from '../../data/blocks.js';

// WorldEditコマンドカテゴリ
const COMMAND_CATEGORIES = {
  selection: {
    name: '選択範囲',
    icon: 'wooden_axe',
    color: '#5CB746',
    commands: [
      { cmd: '//wand', desc: '木の斧（選択ツール）を取得', args: '' },
      { cmd: '//pos1', desc: '現在位置を開始点に設定', args: '' },
      { cmd: '//pos2', desc: '現在位置を終了点に設定', args: '' },
      { cmd: '//hpos1', desc: '注視ブロックを開始点に設定', args: '' },
      { cmd: '//hpos2', desc: '注視ブロックを終了点に設定', args: '' },
      { cmd: '//chunk', desc: '現在のチャンク全体を選択', args: '' },
      { cmd: '//expand', desc: '選択範囲を拡張', args: '<距離> [方向]' },
      { cmd: '//contract', desc: '選択範囲を縮小', args: '<距離> [方向]' },
      { cmd: '//shift', desc: '選択範囲を移動', args: '<距離> [方向]' },
      { cmd: '//size', desc: '選択範囲のサイズを表示', args: '' },
      { cmd: '//count', desc: '選択範囲内のブロック数をカウント', args: '<ブロック>' },
      { cmd: '//distr', desc: '選択範囲内のブロック分布を表示', args: '' },
    ]
  },
  editing: {
    name: 'ブロック編集',
    icon: 'stone',
    color: '#4DECF2',
    commands: [
      { cmd: '//set', desc: '選択範囲を指定ブロックで埋める', args: '<ブロック>' },
      { cmd: '//replace', desc: 'ブロックを置換', args: '[元のブロック] <新しいブロック>' },
      { cmd: '//overlay', desc: '上面にブロックを重ねる', args: '<ブロック>' },
      { cmd: '//walls', desc: '選択範囲の壁を生成', args: '<ブロック>' },
      { cmd: '//outline', desc: '選択範囲の輪郭を生成', args: '<ブロック>' },
      { cmd: '//hollow', desc: '選択範囲を中空化', args: '[厚さ] [ブロック]' },
      { cmd: '//center', desc: '選択範囲の中心にブロックを配置', args: '<ブロック>' },
      { cmd: '//smooth', desc: '地形を平滑化', args: '[回数] [マスク]' },
      { cmd: '//move', desc: '選択範囲を移動', args: '<距離> [方向] [ブロック]' },
      { cmd: '//stack', desc: '選択範囲を積み重ね', args: '<回数> [方向]' },
      { cmd: '//naturalize', desc: '地表を自然化（草→土→石）', args: '' },
      { cmd: '//line', desc: '2点間に線を引く', args: '<ブロック> [厚さ]' },
      { cmd: '//curve', desc: '曲線を描く', args: '<ブロック> [厚さ]' },
    ]
  },
  clipboard: {
    name: 'クリップボード',
    icon: 'paper',
    color: '#FFAA00',
    commands: [
      { cmd: '//copy', desc: '選択範囲をコピー', args: '' },
      { cmd: '//cut', desc: '選択範囲を切り取り', args: '[ブロック]' },
      { cmd: '//paste', desc: '貼り付け', args: '[-a] [-o] [-s]' },
      { cmd: '//rotate', desc: 'クリップボードを回転', args: '<角度>' },
      { cmd: '//flip', desc: 'クリップボードを反転', args: '[方向]' },
      { cmd: '//schematic save', desc: 'スキーマティック保存', args: '<ファイル名>' },
      { cmd: '//schematic load', desc: 'スキーマティック読み込み', args: '<ファイル名>' },
      { cmd: '//schematic list', desc: 'スキーマティック一覧', args: '' },
      { cmd: '/clearclipboard', desc: 'クリップボードをクリア', args: '' },
    ]
  },
  generation: {
    name: '図形生成',
    icon: 'clay_ball',
    color: '#FF55FF',
    commands: [
      { cmd: '//sphere', desc: '実心球体を生成', args: '<ブロック> <半径>' },
      { cmd: '//hsphere', desc: '中空球体を生成', args: '<ブロック> <半径>' },
      { cmd: '//cylinder', desc: '実心円柱を生成', args: '<ブロック> <半径> [高さ]' },
      { cmd: '//hcyl', desc: '中空円柱を生成', args: '<ブロック> <半径> [高さ]' },
      { cmd: '//pyramid', desc: '実心ピラミッドを生成', args: '<ブロック> <高さ>' },
      { cmd: '//hpyramid', desc: '中空ピラミッドを生成', args: '<ブロック> <高さ>' },
      { cmd: '//cyl', desc: '円柱（//cylinderの短縮形）', args: '<ブロック> <半径> [高さ]' },
      { cmd: '//generate', desc: '数式で図形を生成', args: '<ブロック> <式>' },
      { cmd: '//forest', desc: '森を生成', args: '<木の種類>' },
      { cmd: '//flora', desc: '植物を生成', args: '' },
      { cmd: '//pumpkins', desc: 'カボチャを生成', args: '' },
    ]
  },
  brush: {
    name: 'ブラシ',
    icon: 'brush',
    color: '#55FFFF',
    commands: [
      { cmd: '/brush sphere', desc: '球体ブラシ', args: '[-h] <ブロック> [半径]' },
      { cmd: '/brush cylinder', desc: '円柱ブラシ', args: '[-h] <ブロック> [半径] [高さ]' },
      { cmd: '/brush clipboard', desc: 'クリップボードブラシ', args: '[-a] [-o] [-e] [-b]' },
      { cmd: '/brush smooth', desc: '平滑化ブラシ', args: '[半径] [回数]' },
      { cmd: '/brush gravity', desc: '重力ブラシ', args: '[半径]' },
      { cmd: '/brush ex', desc: '消火ブラシ', args: '[半径]' },
      { cmd: '/brush butcher', desc: 'モブ削除ブラシ', args: '[半径]' },
      { cmd: '/brush forest', desc: '森ブラシ', args: '<木の種類> [半径] [密度]' },
      { cmd: '/brush none', desc: 'ブラシを解除', args: '' },
      { cmd: '/mask', desc: 'ブラシマスクを設定', args: '[マスク]' },
      { cmd: '/size', desc: 'ブラシサイズを変更', args: '<サイズ>' },
      { cmd: '/range', desc: 'ブラシ範囲を設定', args: '<範囲>' },
      { cmd: '/material', desc: 'ブラシ素材を変更', args: '<ブロック>' },
    ]
  },
  utility: {
    name: 'ユーティリティ',
    icon: 'compass',
    color: '#AAAAAA',
    commands: [
      { cmd: '//undo', desc: '操作を取り消す', args: '[回数]' },
      { cmd: '//redo', desc: '取り消しを復元', args: '[回数]' },
      { cmd: '//drain', desc: '水/溶岩を除去', args: '[半径]' },
      { cmd: '//fixwater', desc: '水源を修正', args: '[半径]' },
      { cmd: '//fixlava', desc: '溶岩源を修正', args: '[半径]' },
      { cmd: '//removeabove', desc: '上のブロックを削除', args: '[サイズ] [高さ]' },
      { cmd: '//removebelow', desc: '下のブロックを削除', args: '[サイズ] [深さ]' },
      { cmd: '//removenear', desc: '周囲のブロックを削除', args: '<ブロック> [半径]' },
      { cmd: '//snow', desc: '雪を積もらせる', args: '[半径]' },
      { cmd: '//thaw', desc: '雪を溶かす', args: '[半径]' },
      { cmd: '//green', desc: '緑化（土→草ブロック）', args: '[半径]' },
      { cmd: '//ex', desc: '火を消す', args: '[半径]' },
      { cmd: '//butcher', desc: 'モブを削除', args: '[半径] [-p] [-n] [-g] [-a]' },
      { cmd: '//calc', desc: '計算機', args: '<式>' },
    ]
  },
  navigation: {
    name: 'ナビゲーション',
    icon: 'ender_pearl',
    color: '#AA00AA',
    commands: [
      { cmd: '/thru', desc: '壁を通り抜ける', args: '' },
      { cmd: '/jumpto', desc: '注視先にテレポート', args: '' },
      { cmd: '/unstuck', desc: 'ブロックから脱出', args: '' },
      { cmd: '/ascend', desc: '上の床に移動', args: '[回数]' },
      { cmd: '/descend', desc: '下の床に移動', args: '[回数]' },
      { cmd: '/ceil', desc: '天井に移動', args: '[クリアランス]' },
      { cmd: '/up', desc: '上に移動', args: '<距離>' },
    ]
  },
  biome: {
    name: 'バイオーム',
    icon: 'grass_block',
    color: '#228B22',
    commands: [
      { cmd: '//setbiome', desc: 'バイオームを設定', args: '<バイオームID>' },
      { cmd: '//replacebiome', desc: 'バイオームを置換', args: '<元のバイオーム> <新しいバイオーム>' },
      { cmd: '/biomeinfo', desc: '現在のバイオームを確認', args: '[-p] [-t]' },
      { cmd: '/biomelist', desc: 'バイオーム一覧を表示', args: '' },
    ]
  },
  snapshot: {
    name: 'スナップショット',
    icon: 'clock',
    color: '#4169E1',
    commands: [
      { cmd: '/restore', desc: 'スナップショットから復元', args: '[スナップショット]' },
      { cmd: '/snapshot list', desc: 'スナップショット一覧', args: '' },
      { cmd: '/snapshot use', desc: 'スナップショット選択', args: '<名前>' },
      { cmd: '/snapshot before', desc: '指定日以前のスナップショット', args: '<日付>' },
      { cmd: '/snapshot after', desc: '指定日以後のスナップショット', args: '<日付>' },
    ]
  },
  entity: {
    name: 'エンティティ',
    icon: 'zombie_head',
    color: '#FF6B6B',
    commands: [
      { cmd: '/remove', desc: 'エンティティを削除', args: '<タイプ> <半径>' },
      { cmd: '//copy -e', desc: 'エンティティ込みでコピー', args: '' },
      { cmd: '//cut -e', desc: 'エンティティ込みで切り取り', args: '[ブロック]' },
      { cmd: '//paste -e', desc: 'エンティティ込みで貼り付け', args: '[-a] [-o] [-s]' },
      { cmd: '//butcher', desc: 'Mobを削除', args: '[半径] [-p] [-n] [-g] [-a] [-r] [-l]' },
    ]
  }
};

// 方向オプション
const DIRECTIONS = [
  { id: 'up', name: '上 (up)', alias: 'u' },
  { id: 'down', name: '下 (down)', alias: 'd' },
  { id: 'north', name: '北 (north)', alias: 'n' },
  { id: 'south', name: '南 (south)', alias: 's' },
  { id: 'east', name: '東 (east)', alias: 'e' },
  { id: 'west', name: '西 (west)', alias: 'w' },
  { id: 'me', name: '向いている方向 (me)', alias: 'm' },
];

// コマンドタイプ（全コマンドUI対応）
const COMMAND_TYPES = [
  // === 選択範囲 ===
  { id: 'expand', name: '//expand - 範囲拡張', category: 'selection' },
  { id: 'contract', name: '//contract - 範囲縮小', category: 'selection' },
  { id: 'shift', name: '//shift - 範囲移動', category: 'selection' },
  { id: 'outset', name: '//outset - 全方向拡張', category: 'selection' },
  { id: 'inset', name: '//inset - 全方向縮小', category: 'selection' },
  { id: 'count', name: '//count - ブロック数カウント', category: 'selection' },

  // === ブロック編集 ===
  { id: 'set', name: '//set - ブロック配置', category: 'editing' },
  { id: 'replace', name: '//replace - ブロック置換', category: 'editing' },
  { id: 'overlay', name: '//overlay - 上面重ね', category: 'editing' },
  { id: 'walls', name: '//walls - 壁生成', category: 'editing' },
  { id: 'outline', name: '//outline - 輪郭生成', category: 'editing' },
  { id: 'hollow', name: '//hollow - 中空化', category: 'editing' },
  { id: 'center', name: '//center - 中心配置', category: 'editing' },
  { id: 'smooth', name: '//smooth - 平滑化', category: 'editing' },
  { id: 'move', name: '//move - 移動', category: 'editing' },
  { id: 'stack', name: '//stack - 積み重ね', category: 'editing' },
  { id: 'naturalize', name: '//naturalize - 自然化', category: 'editing' },
  { id: 'line', name: '//line - 線描画', category: 'editing' },
  { id: 'curve', name: '//curve - 曲線描画', category: 'editing' },
  { id: 'deform', name: '//deform - 変形', category: 'editing' },
  { id: 'regen', name: '//regen - 地形再生成', category: 'editing' },

  // === クリップボード ===
  { id: 'copy', name: '//copy - コピー', category: 'clipboard' },
  { id: 'cut', name: '//cut - 切り取り', category: 'clipboard' },
  { id: 'paste', name: '//paste - 貼り付け', category: 'clipboard' },
  { id: 'rotate', name: '//rotate - 回転', category: 'clipboard' },
  { id: 'flip', name: '//flip - 反転', category: 'clipboard' },
  { id: 'schematic-save', name: '//schematic save - 保存', category: 'clipboard' },
  { id: 'schematic-load', name: '//schematic load - 読込', category: 'clipboard' },

  // === 図形生成 ===
  { id: 'sphere', name: '//sphere - 球体生成', category: 'generation' },
  { id: 'hsphere', name: '//hsphere - 中空球体', category: 'generation' },
  { id: 'cylinder', name: '//cylinder - 円柱生成', category: 'generation' },
  { id: 'hcyl', name: '//hcyl - 中空円柱', category: 'generation' },
  { id: 'cone', name: '//cone - 円錐生成', category: 'generation' },
  { id: 'pyramid', name: '//pyramid - ピラミッド', category: 'generation' },
  { id: 'hpyramid', name: '//hpyramid - 中空ピラミッド', category: 'generation' },
  { id: 'generate', name: '//generate - 式で生成', category: 'generation' },
  { id: 'forest', name: '//forest - 森生成', category: 'generation' },
  { id: 'flora', name: '//flora - 植物生成', category: 'generation' },

  // === ブラシ ===
  { id: 'brush-sphere', name: '/brush sphere - 球体ブラシ', category: 'brush' },
  { id: 'brush-cylinder', name: '/brush cylinder - 円柱ブラシ', category: 'brush' },
  { id: 'brush-clipboard', name: '/brush clipboard - クリップボード', category: 'brush' },
  { id: 'brush-smooth', name: '/brush smooth - 平滑化', category: 'brush' },
  { id: 'brush-gravity', name: '/brush gravity - 重力', category: 'brush' },
  { id: 'brush-forest', name: '/brush forest - 森ブラシ', category: 'brush' },
  { id: 'brush-extinguish', name: '/brush ex - 消火', category: 'brush' },
  { id: 'brush-butcher', name: '/brush butcher - モブ削除', category: 'brush' },
  { id: 'brush-deform', name: '/brush deform - 変形', category: 'brush' },
  { id: 'brush-snow', name: '/brush snow - 積雪', category: 'brush' },
  { id: 'brush-biome', name: '/brush biome - バイオーム', category: 'brush' },

  // === ユーティリティ ===
  { id: 'undo', name: '//undo - 取り消し', category: 'utility' },
  { id: 'redo', name: '//redo - やり直し', category: 'utility' },
  { id: 'drain', name: '//drain - 水抜き', category: 'utility' },
  { id: 'fixwater', name: '//fixwater - 水源修正', category: 'utility' },
  { id: 'fixlava', name: '//fixlava - 溶岩源修正', category: 'utility' },
  { id: 'fill', name: '//fill - 穴埋め', category: 'utility' },
  { id: 'fillr', name: '//fillr - 再帰穴埋め', category: 'utility' },
  { id: 'removeabove', name: '//removeabove - 上削除', category: 'utility' },
  { id: 'removebelow', name: '//removebelow - 下削除', category: 'utility' },
  { id: 'removenear', name: '//removenear - 周囲削除', category: 'utility' },
  { id: 'snow', name: '//snow - 積雪', category: 'utility' },
  { id: 'thaw', name: '//thaw - 解凍', category: 'utility' },
  { id: 'green', name: '//green - 緑化', category: 'utility' },
  { id: 'extinguish', name: '//ex - 消火', category: 'utility' },
  { id: 'butcher', name: '//butcher - モブ削除', category: 'utility' },

  // === バイオーム ===
  { id: 'setbiome', name: '//setbiome - バイオーム設定', category: 'biome' },
  { id: 'replacebiome', name: '//replacebiome - バイオーム置換', category: 'biome' },

  // === エンティティ ===
  { id: 'remove', name: '/remove - エンティティ削除', category: 'entity' },
];

// バイオーム一覧
const BIOMES = [
  { id: 'plains', name: '平原' },
  { id: 'sunflower_plains', name: 'ヒマワリ平原' },
  { id: 'forest', name: '森林' },
  { id: 'flower_forest', name: '花の森' },
  { id: 'birch_forest', name: 'シラカバの森' },
  { id: 'dark_forest', name: '暗い森' },
  { id: 'taiga', name: 'タイガ' },
  { id: 'snowy_taiga', name: '雪のタイガ' },
  { id: 'old_growth_pine_taiga', name: '原生タイガ（松）' },
  { id: 'old_growth_spruce_taiga', name: '原生タイガ（トウヒ）' },
  { id: 'jungle', name: 'ジャングル' },
  { id: 'sparse_jungle', name: 'まばらなジャングル' },
  { id: 'bamboo_jungle', name: '竹林' },
  { id: 'savanna', name: 'サバンナ' },
  { id: 'savanna_plateau', name: 'サバンナの高原' },
  { id: 'desert', name: '砂漠' },
  { id: 'badlands', name: '荒野' },
  { id: 'eroded_badlands', name: '侵食された荒野' },
  { id: 'wooded_badlands', name: '森のある荒野' },
  { id: 'swamp', name: '沼地' },
  { id: 'mangrove_swamp', name: 'マングローブの沼地' },
  { id: 'beach', name: '砂浜' },
  { id: 'stony_shore', name: '石の海岸' },
  { id: 'ocean', name: '海洋' },
  { id: 'deep_ocean', name: '深海' },
  { id: 'warm_ocean', name: '暖かい海' },
  { id: 'lukewarm_ocean', name: 'ぬるい海' },
  { id: 'cold_ocean', name: '冷たい海' },
  { id: 'frozen_ocean', name: '凍った海' },
  { id: 'river', name: '川' },
  { id: 'frozen_river', name: '凍った川' },
  { id: 'snowy_plains', name: '雪原' },
  { id: 'ice_spikes', name: '樹氷' },
  { id: 'snowy_beach', name: '雪の砂浜' },
  { id: 'mountains', name: '山岳' },
  { id: 'meadow', name: '牧草地' },
  { id: 'grove', name: '林' },
  { id: 'snowy_slopes', name: '雪の斜面' },
  { id: 'jagged_peaks', name: 'ギザギザの山頂' },
  { id: 'frozen_peaks', name: '凍った山頂' },
  { id: 'stony_peaks', name: '石の山頂' },
  { id: 'mushroom_fields', name: 'キノコ島' },
  { id: 'cherry_grove', name: 'サクラの木立' },
  { id: 'pale_garden', name: 'ペールガーデン' },
  { id: 'nether_wastes', name: 'ネザーの荒地' },
  { id: 'soul_sand_valley', name: 'ソウルサンドの谷' },
  { id: 'crimson_forest', name: '真紅の森' },
  { id: 'warped_forest', name: '歪んだ森' },
  { id: 'basalt_deltas', name: '玄武岩デルタ' },
  { id: 'the_end', name: 'ジ・エンド' },
  { id: 'end_highlands', name: 'エンドの高地' },
  { id: 'end_midlands', name: 'エンドの中地' },
  { id: 'small_end_islands', name: '小さなエンドの島' },
  { id: 'end_barrens', name: 'エンドの荒地' },
  { id: 'deep_dark', name: 'ディープダーク' },
  { id: 'dripstone_caves', name: '鍾乳洞' },
  { id: 'lush_caves', name: '繁茂した洞窟' },
];

// 木の種類
const TREE_TYPES = [
  { id: 'oak', name: 'オーク' },
  { id: 'spruce', name: 'トウヒ' },
  { id: 'birch', name: 'シラカバ' },
  { id: 'jungle', name: 'ジャングル' },
  { id: 'acacia', name: 'アカシア' },
  { id: 'dark_oak', name: 'ダークオーク' },
  { id: 'mangrove', name: 'マングローブ' },
  { id: 'cherry', name: 'サクラ' },
  { id: 'pale_oak', name: 'ペールオーク' },
  { id: 'random', name: 'ランダム' },
];

// Butcherフラグ
const BUTCHER_FLAGS = [
  { id: 'p', name: 'ペット（-p）', desc: '飼いならされた動物' },
  { id: 'n', name: 'NPC（-n）', desc: '村人など' },
  { id: 'g', name: 'ゴーレム（-g）', desc: 'アイアンゴーレム等' },
  { id: 'a', name: '動物（-a）', desc: '家畜など' },
  { id: 'b', name: 'アンビエント（-b）', desc: 'コウモリ等' },
  { id: 't', name: '名札付き（-t）', desc: '名前のついたMob' },
  { id: 'f', name: '友好的全て（-f）', desc: '全友好Mob' },
  { id: 'r', name: '防具立て（-r）', desc: 'アーマースタンド' },
  { id: 'w', name: '水棲（-w）', desc: '魚、イカ等' },
  { id: 'l', name: '落雷（-l）', desc: 'ライトニング' },
];

// エンティティタイプ（/remove用）
const ENTITY_TYPES = [
  // WorldEditエイリアス
  { id: 'items', name: 'ドロップアイテム', category: 'alias' },
  { id: 'arrows', name: '矢', category: 'alias' },
  { id: 'boats', name: 'ボート', category: 'alias' },
  { id: 'minecarts', name: 'トロッコ', category: 'alias' },
  { id: 'tnt', name: '点火されたTNT', category: 'alias' },
  { id: 'xp', name: '経験値オーブ', category: 'alias' },
  { id: 'paintings', name: '絵画', category: 'alias' },
  { id: 'itemframes', name: '額縁', category: 'alias' },
  { id: 'armorstands', name: '防具立て', category: 'alias' },
  { id: 'endercrystals', name: 'エンドクリスタル', category: 'alias' },
  // 投擲物
  { id: 'snowball', name: '雪玉', category: 'projectile' },
  { id: 'egg', name: '卵', category: 'projectile' },
  { id: 'ender_pearl', name: 'エンダーパール', category: 'projectile' },
  { id: 'trident', name: 'トライデント', category: 'projectile' },
  { id: 'firework_rocket', name: 'ロケット花火', category: 'projectile' },
  // その他
  { id: 'falling_block', name: '落下ブロック', category: 'other' },
  { id: 'lightning_bolt', name: '落雷', category: 'other' },
];

// クリップボードフラグ
const CLIPBOARD_FLAGS = {
  copy: [
    { id: 'e', name: 'エンティティを含める（-e）', desc: 'Mob、防具立て、絵画等もコピー' },
    { id: 'b', name: 'バイオームを含める（-b）', desc: 'バイオーム情報もコピー' },
  ],
  cut: [
    { id: 'e', name: 'エンティティを含める（-e）', desc: 'Mob等も切り取り' },
  ],
  paste: [
    { id: 'a', name: '空気を除外（-a）', desc: '空気ブロックを貼り付けない' },
    { id: 'e', name: 'エンティティを含める（-e）', desc: 'Mob等も貼り付け' },
    { id: 'o', name: '元の位置（-o）', desc: 'コピー時の座標に貼り付け' },
    { id: 's', name: '選択範囲を設定（-s）', desc: '貼り付け後に選択範囲を設定' },
    { id: 'n', name: 'NBTをスキップ（-n）', desc: 'タイルエンティティのNBTをスキップ' },
  ],
  schematic: [
    { id: 'e', name: 'エンティティを含める（-e）', desc: 'Mob等も保存' },
  ],
};

let currentTab = 'generator';  // 'generator' or 'reference'
let currentCommandType = 'set';
let selectedBlock = 'stone';
let blockSelectorVisible = false;
let currentBlockCategory = 'all';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const version = workspaceStore.get('version') || '1.21';

  return `
    <div class="tool-panel worldedit-tool" id="worldedit-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'golden_pickaxe')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="we-badge">Plugin/MOD</span>
      </div>
      <p class="we-description">WorldEditプラグイン/MODのコマンドを簡単に生成できます。初心者でも複雑なコマンドを作成可能！</p>

      <!-- バージョン選択 -->
      <div class="we-version-selector">
        <label for="we-version">対象バージョン:</label>
        <select id="we-version" class="mc-select">
          ${SUPPORTED_VERSIONS.map(v => `<option value="${v}" ${v === version ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <span class="we-block-count" id="we-block-count">利用可能ブロック: ${getBlocksForVersion(version).length}個</span>
      </div>

      <!-- タブ切り替え -->
      <div class="we-tabs">
        <button type="button" class="we-tab active" data-tab="generator">コマンド生成</button>
        <button type="button" class="we-tab" data-tab="reference">コマンドリファレンス</button>
        <button type="button" class="we-tab" data-tab="blocks">ブロック一覧</button>
      </div>

      <!-- コマンド生成タブ -->
      <div class="we-tab-content active" id="we-generator">
        <form class="tool-form" id="worldedit-form">
          <!-- コマンドタイプ選択 -->
          <div class="form-group">
            <label for="we-command-type">コマンドタイプ</label>
            <select id="we-command-type" class="mc-select">
              ${COMMAND_TYPES.map(t => `<option value="${t.id}" ${t.id === 'set' ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
          </div>

          <!-- 動的パラメータエリア -->
          <div id="we-params-area">
            ${renderParamsForType('set', version)}
          </div>

          <!-- パターン指定（複数ブロック） -->
          <div class="form-group" id="we-pattern-group">
            <label>
              <input type="checkbox" id="we-use-pattern"> 複数ブロックをランダム配置（パターン）
            </label>
            <div class="we-pattern-area" id="we-pattern-area" style="display: none;">
              <p class="we-hint">例: 20%grass_block,30%dirt,50%stone</p>
              <div id="we-pattern-items"></div>
              <button type="button" class="mc-btn mc-btn-secondary" id="we-add-pattern">+ ブロック追加</button>
            </div>
          </div>

          <!-- マスク指定 -->
          <div class="form-group" id="we-mask-group" style="display: none;">
            <label>
              <input type="checkbox" id="we-use-mask"> マスクを使用（特定ブロックのみ対象）
            </label>
            <div class="we-mask-area" id="we-mask-area" style="display: none;">
              <div class="form-row">
                <div class="form-group">
                  <label for="we-mask-type">マスクタイプ</label>
                  <select id="we-mask-type" class="mc-select">
                    <option value="include">指定ブロックのみ</option>
                    <option value="exclude">指定ブロック以外</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="we-mask-block">マスクブロック</label>
                  <input type="text" id="we-mask-block" class="mc-input" placeholder="air">
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- コマンドリファレンスタブ -->
      <div class="we-tab-content" id="we-reference">
        <div class="we-search-box">
          <input type="text" id="we-search" class="mc-input" placeholder="コマンドを検索...">
        </div>
        <div class="we-categories">
          ${Object.entries(COMMAND_CATEGORIES).map(([catId, cat]) => `
            <div class="we-category" data-category="${catId}">
              <div class="we-category-header" style="border-left-color: ${cat.color};">
                <img src="${getInviconUrl(cat.icon)}" class="we-category-icon mc-wiki-image" width="20" height="20" alt="">
                <span>${cat.name}</span>
                <span class="we-category-count">${cat.commands.length}</span>
              </div>
              <div class="we-command-list">
                ${cat.commands.map(cmd => `
                  <div class="we-command-item" data-cmd="${cmd.cmd}">
                    <code class="we-cmd">${cmd.cmd}</code>
                    <span class="we-args">${cmd.args}</span>
                    <p class="we-desc">${cmd.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ブロック一覧タブ -->
      <div class="we-tab-content" id="we-blocks">
        <div class="we-blocks-header">
          <input type="text" id="we-block-search" class="mc-input" placeholder="ブロックを検索...">
          <select id="we-block-category-filter" class="mc-select">
            <option value="all">全カテゴリ</option>
            ${Object.entries(BLOCK_CATEGORIES).map(([catId, cat]) => `
              <option value="${catId}">${cat.name}</option>
            `).join('')}
          </select>
        </div>
        <div class="we-blocks-grid" id="we-blocks-grid">
          ${renderBlocksGrid(version, 'all')}
        </div>
      </div>

      <!-- ブロックセレクターモーダル -->
      <div class="we-block-selector-modal" id="we-block-selector-modal" style="display: none;">
        <div class="we-block-selector-content">
          <div class="we-block-selector-header">
            <h3>ブロックを選択</h3>
            <button type="button" class="we-block-selector-close" id="we-block-selector-close">&times;</button>
          </div>
          <div class="we-block-selector-search">
            <input type="text" id="we-block-selector-search" class="mc-input" placeholder="検索...">
          </div>
          <div class="we-block-selector-categories">
            <button type="button" class="we-block-cat-btn active" data-category="all">全て</button>
            ${Object.entries(BLOCK_CATEGORIES).map(([catId, cat]) => `
              <button type="button" class="we-block-cat-btn" data-category="${catId}" title="${cat.name}">
                <img src="${getInviconUrl(cat.icon)}" width="16" height="16" alt="">
              </button>
            `).join('')}
          </div>
          <div class="we-block-selector-grid" id="we-block-selector-grid">
            ${renderBlockSelectorGrid(version, 'all', '')}
          </div>
        </div>
      </div>

      <!-- プレビュー -->
      <div class="we-preview-section">
        <h3>生成コマンド</h3>
        <div class="we-command-preview" id="we-command-preview">
          コマンドを設定してください
        </div>
        <div class="we-tips">
          <h4>使い方のヒント</h4>
          <ul>
            <li>ブロックIDは <code>minecraft:</code> プレフィックス不要</li>
            <li>ブロック状態は <code>block[state=value]</code> で指定</li>
            <li>パターンで複数ブロックをランダム配置可能</li>
            <li>マスクで特定ブロックのみ操作可能</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * ブロック一覧グリッドをレンダリング
 */
function renderBlocksGrid(version, category) {
  const blocks = category === 'all' ? getBlocksForVersion(version) : getBlocksByCategory(version, category);

  return blocks.map(block => `
    <div class="we-block-item" data-block-id="${block.id}" title="${block.name} (${block.id})">
      <img src="${getInviconUrl(block.id)}" width="48" height="48" alt="${block.name}"
        onerror="this.onerror=null; this.src='https://minecraft.wiki/images/Invicon_Barrier.png'; this.parentElement.classList.add('we-block-fallback');">
      <span class="we-block-name">${block.name}</span>
      <span class="we-block-version">${block.minVersion}+</span>
    </div>
  `).join('');
}

/**
 * ブロックセレクターグリッドをレンダリング
 */
function renderBlockSelectorGrid(version, category, searchQuery) {
  let blocks = category === 'all' ? getBlocksForVersion(version) : getBlocksByCategory(version, category);

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    blocks = blocks.filter(b =>
      b.id.toLowerCase().includes(query) ||
      b.name.toLowerCase().includes(query)
    );
  }

  if (blocks.length === 0) {
    return '<p class="we-no-blocks">該当するブロックがありません</p>';
  }

  return blocks.map(block => `
    <button type="button" class="we-block-selector-item" data-block-id="${block.id}" title="${block.name} (${block.id})">
      <img src="${getInviconUrl(block.id)}" width="32" height="32" alt="${block.name}"
        onerror="this.parentElement.classList.add('we-block-fallback')">
      <span class="we-block-selector-name">${block.name}</span>
    </button>
  `).join('');
}

/**
 * コマンドタイプに応じたパラメータUIを生成
 */
function renderParamsForType(type, version) {
  const blockInput = `
    <div class="form-group">
      <label for="we-block">ブロック</label>
      <div class="we-block-input-wrapper">
        <button type="button" class="we-block-preview" id="we-block-preview" title="クリックして変更">
          <img src="${getInviconUrl(selectedBlock)}" width="24" height="24" alt="">
          <span id="we-block-name">${selectedBlock}</span>
        </button>
        <input type="text" id="we-block" class="mc-input" value="${selectedBlock}">
      </div>
      <div class="we-block-quick" id="we-block-quick">
        ${renderQuickBlocks(version)}
      </div>
      <!-- ブロック状態入力（高度なオプション） -->
      <details class="we-block-state-details">
        <summary>ブロック状態を指定（任意）</summary>
        <div class="we-block-state-area">
          <input type="text" id="we-block-state" class="mc-input" placeholder="facing=north,half=top">
          <small class="we-hint">例: facing=north,half=top,waterlogged=true</small>
          <div class="we-state-presets">
            <span class="we-state-preset" data-state="facing=north">facing=north</span>
            <span class="we-state-preset" data-state="facing=south">facing=south</span>
            <span class="we-state-preset" data-state="facing=east">facing=east</span>
            <span class="we-state-preset" data-state="facing=west">facing=west</span>
            <span class="we-state-preset" data-state="axis=x">axis=x</span>
            <span class="we-state-preset" data-state="axis=y">axis=y</span>
            <span class="we-state-preset" data-state="axis=z">axis=z</span>
            <span class="we-state-preset" data-state="half=top">half=top</span>
            <span class="we-state-preset" data-state="half=bottom">half=bottom</span>
            <span class="we-state-preset" data-state="waterlogged=true">waterlogged</span>
            <span class="we-state-preset" data-state="lit=true">lit=true</span>
            <span class="we-state-preset" data-state="open=true">open=true</span>
            <span class="we-state-preset" data-state="powered=true">powered</span>
          </div>
        </div>
      </details>
    </div>
  `;

  switch (type) {
    case 'set':
      return blockInput;

    case 'replace':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-from-block">元のブロック</label>
            <div class="we-block-input-wrapper">
              <button type="button" class="we-block-preview we-from-block-preview" id="we-from-block-preview" title="クリックして変更">
                <img src="${getInviconUrl('stone')}" width="24" height="24" alt="">
                <span>stone</span>
              </button>
              <input type="text" id="we-from-block" class="mc-input" placeholder="stone" value="stone">
            </div>
            <small class="we-hint">空欄で全ブロック対象</small>
          </div>
          <div class="form-group">
            <label for="we-to-block">新しいブロック</label>
            <div class="we-block-input-wrapper">
              <button type="button" class="we-block-preview we-to-block-preview" id="we-to-block-preview" title="クリックして変更">
                <img src="${getInviconUrl('air')}" width="24" height="24" alt="">
                <span>air</span>
              </button>
              <input type="text" id="we-to-block" class="mc-input" placeholder="air" value="air">
            </div>
          </div>
        </div>
      `;

    case 'sphere':
    case 'hsphere':
      return `
        ${blockInput}
        <div class="form-group">
          <label for="we-radius">半径</label>
          <input type="number" id="we-radius" class="mc-input" value="5" min="1" max="100">
        </div>
      `;

    case 'cylinder':
    case 'hcyl':
      return `
        ${blockInput}
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="5" min="1" max="100">
          </div>
          <div class="form-group">
            <label for="we-height">高さ</label>
            <input type="number" id="we-height" class="mc-input" value="10" min="1" max="256">
          </div>
        </div>
      `;

    case 'pyramid':
      return `
        ${blockInput}
        <div class="form-group">
          <label for="we-size">高さ（サイズ）</label>
          <input type="number" id="we-size" class="mc-input" value="10" min="1" max="100">
        </div>
      `;

    case 'walls':
    case 'outline':
      return blockInput;

    case 'move':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-distance">移動距離</label>
            <input type="number" id="we-distance" class="mc-input" value="10" min="1">
          </div>
          <div class="form-group">
            <label for="we-direction">方向</label>
            <select id="we-direction" class="mc-select">
              ${DIRECTIONS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="we-leave-block">元の場所に残すブロック（任意）</label>
          <input type="text" id="we-leave-block" class="mc-input" placeholder="air">
        </div>
      `;

    case 'stack':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-count">回数</label>
            <input type="number" id="we-count" class="mc-input" value="5" min="1" max="100">
          </div>
          <div class="form-group">
            <label for="we-direction">方向</label>
            <select id="we-direction" class="mc-select">
              ${DIRECTIONS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `;

    case 'copy':
      return `
        <p class="we-info">選択範囲をクリップボードにコピーします。先に //pos1 と //pos2 で範囲を選択してください。</p>
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-copy-e"> -e（エンティティを含める：Mob、防具立て、絵画等）</label>
            <label><input type="checkbox" id="we-copy-b"> -b（バイオームを含める）</label>
          </div>
        </div>
      `;

    case 'cut':
      return `
        <p class="we-info">選択範囲を切り取ります。元の場所は空気に置き換わります。</p>
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-cut-e"> -e（エンティティを含める：Mob、防具立て、絵画等）</label>
          </div>
        </div>
        <div class="form-group">
          <label for="we-leave-block">元の場所に残すブロック（任意）</label>
          <input type="text" id="we-leave-block" class="mc-input" placeholder="air">
        </div>
      `;

    case 'paste':
      return `
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-paste-a"> -a（空気をコピーしない）</label>
            <label><input type="checkbox" id="we-paste-e"> -e（エンティティを含める：Mob、防具立て、絵画等）</label>
            <label><input type="checkbox" id="we-paste-o"> -o（元の位置を基準にする）</label>
            <label><input type="checkbox" id="we-paste-s"> -s（選択範囲を更新）</label>
            <label><input type="checkbox" id="we-paste-n"> -n（NBTをスキップ）</label>
          </div>
        </div>
      `;

    case 'rotate':
      return `
        <div class="form-group">
          <label for="we-angle">回転角度</label>
          <select id="we-angle" class="mc-select">
            <option value="90">90°（右回り）</option>
            <option value="180">180°</option>
            <option value="270">270°（左回り）</option>
            <option value="-90">-90°（左回り）</option>
          </select>
        </div>
      `;

    case 'expand':
    case 'contract':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-distance">距離（ブロック数）</label>
            <input type="number" id="we-distance" class="mc-input" value="10" min="1">
          </div>
          <div class="form-group">
            <label for="we-direction">方向</label>
            <select id="we-direction" class="mc-select">
              ${DIRECTIONS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `;

    case 'brush-sphere':
      return `
        ${blockInput}
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="we-hollow"> 中空（-h）
            </label>
          </div>
        </div>
      `;

    case 'brush-cylinder':
      return `
        ${blockInput}
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
          </div>
          <div class="form-group">
            <label for="we-height">高さ</label>
            <input type="number" id="we-height" class="mc-input" value="5" min="1" max="50">
          </div>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="we-hollow"> 中空（-h）
          </label>
        </div>
      `;

    case 'undo':
      return `
        <div class="form-group">
          <label for="we-count">取り消す回数</label>
          <input type="number" id="we-count" class="mc-input" value="1" min="1" max="100">
        </div>
      `;

    case 'drain':
    case 'fixwater':
    case 'fixlava':
    case 'snow':
    case 'thaw':
    case 'green':
    case 'extinguish':
      return `
        <div class="form-group">
          <label for="we-radius">半径</label>
          <input type="number" id="we-radius" class="mc-input" value="10" min="1" max="100">
        </div>
      `;

    case 'redo':
      return `
        <div class="form-group">
          <label for="we-count">やり直す回数</label>
          <input type="number" id="we-count" class="mc-input" value="1" min="1" max="100">
        </div>
      `;

    case 'overlay':
    case 'center':
      return blockInput;

    case 'hollow':
      return `
        ${blockInput}
        <div class="form-group">
          <label for="we-thickness">厚さ（任意）</label>
          <input type="number" id="we-thickness" class="mc-input" value="1" min="1" max="10">
        </div>
      `;

    case 'smooth':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-iterations">反復回数</label>
            <input type="number" id="we-iterations" class="mc-input" value="1" min="1" max="20">
          </div>
          <div class="form-group">
            <label for="we-mask-block">マスク（任意）</label>
            <input type="text" id="we-mask-block" class="mc-input" placeholder="grass_block,dirt">
          </div>
        </div>
      `;

    case 'naturalize':
      return '<p class="we-info">選択範囲の地表を自然化します（最上層→草、2-4層→土、5層以降→石）。先に範囲を選択してください。</p>';

    case 'line':
    case 'curve':
      return `
        ${blockInput}
        <div class="form-group">
          <label for="we-thickness">太さ（任意）</label>
          <input type="number" id="we-thickness" class="mc-input" value="1" min="1" max="10">
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="we-hollow"> 中空（-h）</label>
        </div>
        <p class="we-hint">//line: pos1とpos2を直線で結ぶ<br>//curve: 選択した全点を通る曲線</p>
      `;

    case 'deform':
      return `
        <div class="form-group">
          <label for="we-expression">変形式（x, y, z変数使用可）</label>
          <input type="text" id="we-expression" class="mc-input" placeholder="y+=sin(x*0.1)*3" value="y+=sin(x*0.1)*3">
          <small class="we-hint">例: y+=sin(x*0.1)*3 (波形)</small>
        </div>
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-deform-r"> -r（Raw座標）</label>
            <label><input type="checkbox" id="we-deform-o"> -o（オフセット）</label>
          </div>
        </div>
      `;

    case 'regen':
      return `
        <div class="form-group">
          <label for="we-seed">シード値（任意）</label>
          <input type="text" id="we-seed" class="mc-input" placeholder="ランダム">
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="we-regen-biome"> -b（バイオーム再生成）</label>
        </div>
        <p class="we-hint">選択範囲を元の地形に再生成します</p>
      `;

    case 'flip':
      return `
        <div class="form-group">
          <label for="we-direction">反転方向</label>
          <select id="we-direction" class="mc-select">
            ${DIRECTIONS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
          </select>
        </div>
      `;

    case 'schematic-save':
      return `
        <div class="form-group">
          <label for="we-filename">ファイル名</label>
          <input type="text" id="we-filename" class="mc-input" placeholder="my_build" value="my_build">
        </div>
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-schem-e"> -e（エンティティを含める）</label>
            <label><input type="checkbox" id="we-force"> -f（上書き）</label>
          </div>
        </div>
      `;

    case 'schematic-load':
      return `
        <div class="form-group">
          <label for="we-filename">ファイル名</label>
          <input type="text" id="we-filename" class="mc-input" placeholder="my_build">
        </div>
      `;

    case 'cone':
      return `
        ${blockInput}
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">底面半径</label>
            <input type="number" id="we-radius" class="mc-input" value="5" min="1" max="100">
          </div>
          <div class="form-group">
            <label for="we-height">高さ</label>
            <input type="number" id="we-height" class="mc-input" value="10" min="1" max="256">
          </div>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="we-hollow"> 中空（-h）</label>
        </div>
      `;

    case 'hpyramid':
      return `
        ${blockInput}
        <div class="form-group">
          <label for="we-size">高さ（サイズ）</label>
          <input type="number" id="we-size" class="mc-input" value="10" min="1" max="100">
        </div>
      `;

    case 'generate':
      return `
        ${blockInput}
        <div class="form-group">
          <label for="we-expression">生成式（x, y, z変数使用可）</label>
          <input type="text" id="we-expression" class="mc-input" placeholder="(x^2+y^2+z^2)^0.5 < 5" value="(x^2+y^2+z^2)^0.5 < 5">
          <small class="we-hint">例: (x^2+y^2+z^2)^0.5 < 5 (球体)</small>
        </div>
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-gen-h"> -h（中空）</label>
            <label><input type="checkbox" id="we-gen-r"> -r（Raw座標）</label>
            <label><input type="checkbox" id="we-gen-o"> -o（オフセット）</label>
            <label><input type="checkbox" id="we-gen-c"> -c（洞窟モード）</label>
          </div>
        </div>
      `;

    case 'forest':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-tree-type">木の種類</label>
            <select id="we-tree-type" class="mc-select">
              ${TREE_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="we-density">密度（%）</label>
            <input type="number" id="we-density" class="mc-input" value="5" min="1" max="100">
          </div>
        </div>
      `;

    case 'flora':
      return `
        <div class="form-group">
          <label for="we-density">密度（%）</label>
          <input type="number" id="we-density" class="mc-input" value="10" min="1" max="100">
        </div>
        <p class="we-info">選択範囲の上面に草花を生成します</p>
      `;

    case 'shift':
    case 'outset':
    case 'inset':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-distance">距離（ブロック数）</label>
            <input type="number" id="we-distance" class="mc-input" value="5" min="1">
          </div>
          ${type === 'shift' ? `
          <div class="form-group">
            <label for="we-direction">方向</label>
            <select id="we-direction" class="mc-select">
              ${DIRECTIONS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
          </div>
          ` : `
          <div class="form-group">
            <label>オプション</label>
            <div class="we-checkboxes">
              <label><input type="checkbox" id="we-horizontal"> -h（水平のみ）</label>
              <label><input type="checkbox" id="we-vertical"> -v（垂直のみ）</label>
            </div>
          </div>
          `}
        </div>
      `;

    case 'count':
      return `
        <div class="form-group">
          <label for="we-block">カウントするブロック</label>
          <div class="we-block-input-wrapper">
            <button type="button" class="we-block-preview" id="we-block-preview" title="クリックして変更">
              <img src="${getInviconUrl(selectedBlock)}" width="24" height="24" alt="">
              <span id="we-block-name">${selectedBlock}</span>
            </button>
            <input type="text" id="we-block" class="mc-input" value="${selectedBlock}">
          </div>
        </div>
      `;

    case 'fill':
    case 'fillr':
      return `
        ${blockInput}
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="10" min="1" max="100">
          </div>
          <div class="form-group">
            <label for="we-depth">深さ</label>
            <input type="number" id="we-depth" class="mc-input" value="10" min="1" max="256">
          </div>
        </div>
        <p class="we-hint">${type === 'fill' ? '指定半径内の穴を埋めます' : '再帰的に穴を埋めます（深い穴向け）'}</p>
      `;

    case 'removeabove':
    case 'removebelow':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-size">サイズ（半径）</label>
            <input type="number" id="we-size" class="mc-input" value="5" min="1" max="100">
          </div>
          <div class="form-group">
            <label for="we-height">${type === 'removeabove' ? '高さ' : '深さ'}</label>
            <input type="number" id="we-height" class="mc-input" value="256" min="1" max="256">
          </div>
        </div>
      `;

    case 'removenear':
      return `
        ${blockInput}
        <div class="form-group">
          <label for="we-radius">半径</label>
          <input type="number" id="we-radius" class="mc-input" value="5" min="1" max="50">
        </div>
      `;

    case 'butcher':
      return `
        <div class="form-group">
          <label for="we-radius">半径（-1で全て）</label>
          <input type="number" id="we-radius" class="mc-input" value="50" min="-1" max="500">
        </div>
        <div class="form-group">
          <label>対象Mobフラグ</label>
          <div class="we-checkboxes we-butcher-flags">
            ${BUTCHER_FLAGS.map(f => `
              <label title="${f.desc}"><input type="checkbox" id="we-butcher-${f.id}"> ${f.name}</label>
            `).join('')}
          </div>
        </div>
        <p class="we-hint">デフォルト: 敵対モブのみ削除</p>
      `;

    // === ブラシコマンド追加 ===
    case 'brush-clipboard':
      return `
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-brush-a"> -a（空気無視）</label>
            <label><input type="checkbox" id="we-brush-o"> -o（原位置）</label>
            <label><input type="checkbox" id="we-brush-e"> -e（エンティティ）</label>
            <label><input type="checkbox" id="we-brush-b"> -b（バイオーム）</label>
          </div>
        </div>
        <p class="we-info">クリップボードの内容をブラシとして使用</p>
      `;

    case 'brush-smooth':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
          </div>
          <div class="form-group">
            <label for="we-iterations">反復回数</label>
            <input type="number" id="we-iterations" class="mc-input" value="4" min="1" max="20">
          </div>
        </div>
      `;

    case 'brush-gravity':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
          </div>
          <div class="form-group">
            <label for="we-height">高さ（-h）</label>
            <input type="number" id="we-height" class="mc-input" value="5" min="1" max="50">
          </div>
        </div>
      `;

    case 'brush-forest':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-tree-type">木の種類</label>
            <select id="we-tree-type" class="mc-select">
              ${TREE_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
          </div>
        </div>
        <div class="form-group">
          <label for="we-density">密度（%）</label>
          <input type="number" id="we-density" class="mc-input" value="5" min="1" max="100">
        </div>
      `;

    case 'brush-extinguish':
      return `
        <div class="form-group">
          <label for="we-radius">半径</label>
          <input type="number" id="we-radius" class="mc-input" value="5" min="1" max="20">
        </div>
      `;

    case 'brush-butcher':
      return `
        <div class="form-group">
          <label for="we-radius">半径</label>
          <input type="number" id="we-radius" class="mc-input" value="5" min="1" max="20">
        </div>
        <div class="form-group">
          <label>対象Mobフラグ</label>
          <div class="we-checkboxes we-butcher-flags">
            ${BUTCHER_FLAGS.map(f => `
              <label title="${f.desc}"><input type="checkbox" id="we-butcher-${f.id}"> ${f.name}</label>
            `).join('')}
          </div>
        </div>
      `;

    case 'brush-deform':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
          </div>
        </div>
        <div class="form-group">
          <label for="we-expression">変形式</label>
          <input type="text" id="we-expression" class="mc-input" placeholder="y-=0.5" value="y-=0.5">
        </div>
      `;

    case 'brush-snow':
      return `
        <div class="form-group">
          <label for="we-radius">半径</label>
          <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="we-stack"> -s（積雪スタック）</label>
        </div>
      `;

    case 'brush-biome':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-biome">バイオーム</label>
            <select id="we-biome" class="mc-select">
              ${BIOMES.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="we-radius">半径</label>
            <input type="number" id="we-radius" class="mc-input" value="3" min="1" max="10">
          </div>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="we-column"> -c（Y軸全体）</label>
        </div>
      `;

    // === バイオームコマンド ===
    case 'setbiome':
      return `
        <div class="form-group">
          <label for="we-biome">バイオーム</label>
          <select id="we-biome" class="mc-select">
            ${BIOMES.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
          </select>
        </div>
        <p class="we-info">選択範囲のバイオームを変更します</p>
      `;

    case 'replacebiome':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-from-biome">元のバイオーム</label>
            <select id="we-from-biome" class="mc-select">
              ${BIOMES.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="we-to-biome">新しいバイオーム</label>
            <select id="we-to-biome" class="mc-select">
              ${BIOMES.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `;

    // === エンティティコマンド ===
    case 'remove':
      return `
        <div class="form-row">
          <div class="form-group">
            <label for="we-entity-type">エンティティタイプ</label>
            <select id="we-entity-type" class="mc-select">
              <optgroup label="WorldEditエイリアス">
                ${ENTITY_TYPES.filter(e => e.category === 'alias').map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('')}
              </optgroup>
              <optgroup label="投擲物">
                ${ENTITY_TYPES.filter(e => e.category === 'projectile').map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('')}
              </optgroup>
              <optgroup label="その他">
                ${ENTITY_TYPES.filter(e => e.category === 'other').map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('')}
              </optgroup>
            </select>
          </div>
          <div class="form-group">
            <label for="we-radius">半径（-1で全て）</label>
            <input type="number" id="we-radius" class="mc-input" value="50" min="-1" max="500">
          </div>
        </div>
        <p class="we-hint">/remove items 50 = 半径50以内のドロップアイテムを削除</p>
      `;

    default:
      return '<p class="we-info">パラメータを設定してください</p>';
  }
}

/**
 * クイックブロック選択ボタンをレンダリング
 */
function renderQuickBlocks(version) {
  const quickBlocks = [
    'stone', 'cobblestone', 'dirt', 'grass_block',
    'oak_planks', 'glass', 'white_wool', 'bricks'
  ];

  return quickBlocks.map(blockId => {
    const block = ALL_BLOCKS.find(b => b.id === blockId);
    if (!block || compareVersions(version, block.minVersion) < 0) return '';
    return `
      <button type="button" class="we-quick-block" data-block="${blockId}" title="${block.name}">
        <img src="${getInviconUrl(blockId)}" width="20" height="20" alt="${block.name}" onerror="this.style.opacity='0.3'">
      </button>
    `;
  }).join('');
}

/**
 * 初期化
 */
export function init(container) {
  currentTab = 'generator';
  currentCommandType = 'set';
  selectedBlock = 'stone';
  blockSelectorVisible = false;
  currentBlockCategory = 'all';

  const version = workspaceStore.get('version') || '1.21';

  // バージョン変更
  $('#we-version', container)?.addEventListener('change', (e) => {
    const newVersion = e.target.value;
    updateForVersion(container, newVersion);
  });

  // グローバルバージョン変更
  window.addEventListener('mc-version-change', (e) => {
    const newVersion = e.detail?.version || workspaceStore.get('version') || '1.21';
    const versionSelect = $('#we-version', container);
    if (versionSelect) versionSelect.value = newVersion;
    updateForVersion(container, newVersion);
  });

  // タブ切り替え
  delegate(container, 'click', '.we-tab', (e, target) => {
    const tab = target.dataset.tab;
    currentTab = tab;
    $$('.we-tab', container).forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    $$('.we-tab-content', container).forEach(c => c.classList.toggle('active', c.id === `we-${tab}`));
  });

  // コマンドタイプ変更
  $('#we-command-type', container)?.addEventListener('change', (e) => {
    currentCommandType = e.target.value;
    const currentVersion = $('#we-version', container)?.value || '1.21';
    $('#we-params-area', container).innerHTML = renderParamsForType(currentCommandType, currentVersion);
    bindParamEvents(container);
    updateCommand(container);
    updateVisibility(container);
  });

  // パターン使用チェック
  $('#we-use-pattern', container)?.addEventListener('change', (e) => {
    $('#we-pattern-area', container).style.display = e.target.checked ? 'block' : 'none';
    updateCommand(container);
  });

  // パターン追加ボタン
  $('#we-add-pattern', container)?.addEventListener('click', () => {
    addPatternItem(container);
  });

  // マスク使用チェック
  $('#we-use-mask', container)?.addEventListener('change', (e) => {
    $('#we-mask-area', container).style.display = e.target.checked ? 'block' : 'none';
    updateCommand(container);
  });

  // マスク変更
  delegate(container, 'input', '#we-mask-type, #we-mask-block', () => {
    updateCommand(container);
  });

  // リファレンス検索
  $('#we-search', container)?.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase();
    $$('.we-command-item', container).forEach(item => {
      const cmd = item.dataset.cmd.toLowerCase();
      const desc = item.querySelector('.we-desc')?.textContent.toLowerCase() || '';
      const visible = cmd.includes(query) || desc.includes(query);
      item.style.display = visible ? '' : 'none';
    });
    // カテゴリの表示/非表示
    $$('.we-category', container).forEach(cat => {
      const hasVisible = cat.querySelector('.we-command-item:not([style*="display: none"])');
      cat.style.display = hasVisible ? '' : 'none';
    });
  }, 150));

  // コマンドアイテムクリックでコピー
  delegate(container, 'click', '.we-command-item', (e, target) => {
    const cmd = target.dataset.cmd;
    const args = target.querySelector('.we-args')?.textContent || '';
    const fullCmd = `${cmd} ${args}`.trim();
    setOutput(fullCmd, 'worldedit', { command: fullCmd });
  });

  // ブロック一覧検索
  $('#we-block-search', container)?.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase();
    const currentVersion = $('#we-version', container)?.value || '1.21';
    const category = $('#we-block-category-filter', container)?.value || 'all';
    filterBlocksGrid(container, currentVersion, category, query);
  }, 150));

  // ブロック一覧カテゴリフィルター
  $('#we-block-category-filter', container)?.addEventListener('change', (e) => {
    const category = e.target.value;
    const currentVersion = $('#we-version', container)?.value || '1.21';
    const query = $('#we-block-search', container)?.value || '';
    filterBlocksGrid(container, currentVersion, category, query);
  });

  // ブロック一覧アイテムクリック
  delegate(container, 'click', '.we-block-item', (e, target) => {
    const blockId = target.dataset.blockId;
    selectBlock(container, blockId);
  });

  // ブロックセレクター関連
  setupBlockSelector(container);

  // 初期パラメータイベント
  bindParamEvents(container);
  updateVisibility(container);
  updateCommand(container);
}

/**
 * バージョン変更時の更新
 */
function updateForVersion(container, version) {
  // ブロック数を更新
  const blockCount = $('#we-block-count', container);
  if (blockCount) {
    blockCount.textContent = `利用可能ブロック: ${getBlocksForVersion(version).length}個`;
  }

  // ブロック一覧を更新
  const blocksGrid = $('#we-blocks-grid', container);
  if (blocksGrid) {
    const category = $('#we-block-category-filter', container)?.value || 'all';
    blocksGrid.innerHTML = renderBlocksGrid(version, category);
  }

  // クイックブロックを更新
  const quickBlocks = $('#we-block-quick', container);
  if (quickBlocks) {
    quickBlocks.innerHTML = renderQuickBlocks(version);
  }

  // セレクターグリッドを更新
  updateBlockSelectorGrid(container);

  updateCommand(container);
}

/**
 * ブロックセレクターのセットアップ
 */
function setupBlockSelector(container) {
  // ブロックプレビュークリックでセレクターを開く
  delegate(container, 'click', '.we-block-preview', (e, target) => {
    e.preventDefault();
    openBlockSelector(container, target);
  });

  // セレクター閉じる
  $('#we-block-selector-close', container)?.addEventListener('click', () => {
    closeBlockSelector(container);
  });

  // セレクター外クリックで閉じる
  $('#we-block-selector-modal', container)?.addEventListener('click', (e) => {
    if (e.target.id === 'we-block-selector-modal') {
      closeBlockSelector(container);
    }
  });

  // セレクター検索
  $('#we-block-selector-search', container)?.addEventListener('input', debounce((e) => {
    updateBlockSelectorGrid(container);
  }, 150));

  // セレクターカテゴリ切り替え
  delegate(container, 'click', '.we-block-cat-btn', (e, target) => {
    currentBlockCategory = target.dataset.category;
    $$('.we-block-cat-btn', container).forEach(btn => btn.classList.toggle('active', btn.dataset.category === currentBlockCategory));
    updateBlockSelectorGrid(container);
  });

  // セレクターブロック選択
  delegate(container, 'click', '.we-block-selector-item', (e, target) => {
    const blockId = target.dataset.blockId;
    selectBlock(container, blockId);
    closeBlockSelector(container);
  });
}

let currentBlockTarget = null;

/**
 * ブロックセレクターを開く
 */
function openBlockSelector(container, target) {
  currentBlockTarget = target;
  const modal = $('#we-block-selector-modal', container);
  if (modal) {
    modal.style.display = 'flex';
    updateBlockSelectorGrid(container);
    $('#we-block-selector-search', container)?.focus();
  }
}

/**
 * ブロックセレクターを閉じる
 */
function closeBlockSelector(container) {
  const modal = $('#we-block-selector-modal', container);
  if (modal) {
    modal.style.display = 'none';
  }
  currentBlockTarget = null;
}

/**
 * ブロックセレクターグリッドを更新
 */
function updateBlockSelectorGrid(container) {
  const version = $('#we-version', container)?.value || '1.21';
  const query = $('#we-block-selector-search', container)?.value || '';
  const grid = $('#we-block-selector-grid', container);

  if (grid) {
    grid.innerHTML = renderBlockSelectorGrid(version, currentBlockCategory, query);
  }
}

/**
 * ブロックを選択
 */
function selectBlock(container, blockId) {
  selectedBlock = blockId;

  // メインブロック入力を更新
  const blockInput = $('#we-block', container);
  if (blockInput) {
    blockInput.value = blockId;
  }

  // プレビューを更新
  const blockPreview = $('#we-block-preview', container);
  if (blockPreview) {
    const img = blockPreview.querySelector('img');
    const name = blockPreview.querySelector('#we-block-name');
    if (img) img.src = getInviconUrl(blockId);
    if (name) name.textContent = blockId;
  }

  // ターゲットがある場合はそれも更新
  if (currentBlockTarget) {
    const img = currentBlockTarget.querySelector('img');
    const span = currentBlockTarget.querySelector('span');
    if (img) img.src = getInviconUrl(blockId);
    if (span) span.textContent = blockId;

    // 対応する入力フィールドを更新
    const inputId = currentBlockTarget.id.replace('-preview', '');
    const input = $(`#${inputId}`, container);
    if (input) input.value = blockId;
  }

  updateCommand(container);
}

/**
 * ブロック一覧をフィルタリング
 */
function filterBlocksGrid(container, version, category, query) {
  let blocks = category === 'all' ? getBlocksForVersion(version) : getBlocksByCategory(version, category);

  if (query) {
    const lowerQuery = query.toLowerCase();
    blocks = blocks.filter(b =>
      b.id.toLowerCase().includes(lowerQuery) ||
      b.name.toLowerCase().includes(lowerQuery)
    );
  }

  const grid = $('#we-blocks-grid', container);
  if (grid) {
    if (blocks.length === 0) {
      grid.innerHTML = '<p class="we-no-blocks">該当するブロックがありません</p>';
    } else {
      grid.innerHTML = blocks.map(block => `
        <div class="we-block-item" data-block-id="${block.id}" title="${block.name} (${block.id})">
          <img src="${getInviconUrl(block.id)}" width="32" height="32" alt="${block.name}" onerror="this.style.opacity='0.3'">
          <span class="we-block-name">${block.name}</span>
          <span class="we-block-version">${block.minVersion}+</span>
        </div>
      `).join('');
    }
  }
}

/**
 * パラメータ入力イベントをバインド
 */
function bindParamEvents(container) {
  // 全入力フィールドの変更を監視
  const inputs = container.querySelectorAll('#we-params-area input, #we-params-area select');
  inputs.forEach(input => {
    input.addEventListener('input', () => updateCommand(container));
    input.addEventListener('change', () => updateCommand(container));
  });

  // クイックブロック選択
  delegate(container, 'click', '.we-quick-block', (e, target) => {
    const block = target.dataset.block;
    selectBlock(container, block);
  });

  // ブロック状態プリセット選択
  delegate(container, 'click', '.we-state-preset', (e, target) => {
    const state = target.dataset.state;
    const stateInput = $('#we-block-state', container);
    if (stateInput) {
      // 既存の状態があれば追加、なければセット
      const currentState = stateInput.value;
      if (currentState) {
        // 同じキーがあれば置換、なければ追加
        const key = state.split('=')[0];
        const states = currentState.split(',');
        const existingIndex = states.findIndex(s => s.startsWith(key + '='));
        if (existingIndex >= 0) {
          states[existingIndex] = state;
        } else {
          states.push(state);
        }
        stateInput.value = states.join(',');
      } else {
        stateInput.value = state;
      }
      updateCommand(container);
    }
  });

  // ブロック状態入力の変更
  delegate(container, 'input', '#we-block-state', () => {
    updateCommand(container);
  });

  // ブロック入力フィールドの変更
  const blockInput = $('#we-block', container);
  if (blockInput) {
    blockInput.addEventListener('input', (e) => {
      selectedBlock = e.target.value;
      const preview = $('#we-block-preview', container);
      if (preview) {
        const img = preview.querySelector('img');
        const name = preview.querySelector('#we-block-name');
        if (img) img.src = getInviconUrl(selectedBlock);
        if (name) name.textContent = selectedBlock;
      }
      updateCommand(container);
    });
  }
}

/**
 * 表示/非表示を更新
 */
function updateVisibility(container) {
  const type = currentCommandType;

  // パターンはブロック配置系コマンドでのみ表示
  const showPattern = ['set', 'sphere', 'hsphere', 'cylinder', 'hcyl', 'pyramid', 'walls', 'outline', 'brush-sphere', 'brush-cylinder'].includes(type);
  const patternGroup = $('#we-pattern-group', container);
  if (patternGroup) patternGroup.style.display = showPattern ? 'block' : 'none';

  // マスクは編集系コマンドで表示
  const maskSupportedCmds = [
    'replace', 'move', 'stack', 'copy', 'cut', 'paste', 'rotate', 'flip',
    'smooth', 'deform', 'hollow', 'regen', 'overlay', 'naturalize'
  ];
  const showMask = maskSupportedCmds.includes(type);
  const maskGroup = $('#we-mask-group', container);
  if (maskGroup) maskGroup.style.display = showMask ? 'block' : 'none';
}

/**
 * パターンアイテムを追加
 */
function addPatternItem(container) {
  const patternItems = $('#we-pattern-items', container);
  if (!patternItems) return;

  const item = document.createElement('div');
  item.className = 'we-pattern-item';
  item.innerHTML = `
    <input type="number" class="mc-input we-pattern-percent" value="50" min="1" max="100" style="width: 60px;">
    <span>%</span>
    <input type="text" class="mc-input we-pattern-block" placeholder="stone" style="flex: 1;">
    <button type="button" class="we-pattern-remove" title="削除">&times;</button>
  `;
  patternItems.appendChild(item);

  // 削除ボタン
  item.querySelector('.we-pattern-remove').addEventListener('click', () => {
    item.remove();
    updateCommand(container);
  });

  // 入力変更
  item.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => updateCommand(container));
  });
}

/**
 * パターン文字列を生成
 */
function getPatternString(container) {
  const items = $$('.we-pattern-item', container);
  if (items.length === 0) return '';

  const parts = [];
  items.forEach(item => {
    const percent = item.querySelector('.we-pattern-percent')?.value || '50';
    const block = item.querySelector('.we-pattern-block')?.value || 'stone';
    if (block) {
      parts.push(`${percent}%${block}`);
    }
  });
  return parts.join(',');
}

/**
 * コマンドを更新
 */
function updateCommand(container) {
  const type = currentCommandType;
  let command = '';

  // パターン使用チェック
  const usePattern = $('#we-use-pattern', container)?.checked;
  let blockValue = $('#we-block', container)?.value || selectedBlock || 'stone';

  // ブロック状態を追加
  const blockState = $('#we-block-state', container)?.value || '';
  if (blockState && !usePattern) {
    // ブロック状態がある場合は [state] 形式で追加
    blockValue = `${blockValue}[${blockState}]`;
  }

  if (usePattern) {
    const patternStr = getPatternString(container);
    if (patternStr) blockValue = patternStr;
  }

  switch (type) {
    case 'set':
      command = `//set ${blockValue}`;
      break;

    case 'replace': {
      const fromBlock = $('#we-from-block', container)?.value || '';
      const toBlock = $('#we-to-block', container)?.value || 'air';
      command = fromBlock ? `//replace ${fromBlock} ${toBlock}` : `//replace ${toBlock}`;
      break;
    }

    case 'sphere':
    case 'hsphere': {
      const radius = $('#we-radius', container)?.value || '5';
      command = `//${type} ${blockValue} ${radius}`;
      break;
    }

    case 'cylinder':
    case 'hcyl': {
      const radius = $('#we-radius', container)?.value || '5';
      const height = $('#we-height', container)?.value || '10';
      command = `//${type} ${blockValue} ${radius} ${height}`;
      break;
    }

    case 'pyramid': {
      const size = $('#we-size', container)?.value || '10';
      command = `//pyramid ${blockValue} ${size}`;
      break;
    }

    case 'walls':
    case 'outline':
      command = `//${type} ${blockValue}`;
      break;

    case 'move': {
      const distance = $('#we-distance', container)?.value || '10';
      const direction = $('#we-direction', container)?.value || 'up';
      const leaveBlock = $('#we-leave-block', container)?.value || '';
      command = `//move ${distance} ${direction}`;
      if (leaveBlock) command += ` ${leaveBlock}`;
      break;
    }

    case 'stack': {
      const count = $('#we-count', container)?.value || '5';
      const direction = $('#we-direction', container)?.value || 'up';
      command = `//stack ${count} ${direction}`;
      break;
    }

    case 'copy': {
      const flags = [];
      if ($('#we-copy-e', container)?.checked) flags.push('-e');
      if ($('#we-copy-b', container)?.checked) flags.push('-b');
      command = '//copy' + (flags.length ? ' ' + flags.join(' ') : '');
      break;
    }

    case 'paste': {
      const flags = [];
      if ($('#we-paste-a', container)?.checked) flags.push('-a');
      if ($('#we-paste-e', container)?.checked) flags.push('-e');
      if ($('#we-paste-o', container)?.checked) flags.push('-o');
      if ($('#we-paste-s', container)?.checked) flags.push('-s');
      if ($('#we-paste-n', container)?.checked) flags.push('-n');
      command = '//paste' + (flags.length ? ' ' + flags.join(' ') : '');
      break;
    }

    case 'rotate': {
      const angle = $('#we-angle', container)?.value || '90';
      command = `//rotate ${angle}`;
      break;
    }

    case 'expand':
    case 'contract': {
      const distance = $('#we-distance', container)?.value || '10';
      const direction = $('#we-direction', container)?.value || 'up';
      command = `//${type} ${distance} ${direction}`;
      break;
    }

    case 'brush-sphere': {
      const radius = $('#we-radius', container)?.value || '3';
      const hollow = $('#we-hollow', container)?.checked ? '-h ' : '';
      command = `/brush sphere ${hollow}${blockValue} ${radius}`;
      break;
    }

    case 'brush-cylinder': {
      const radius = $('#we-radius', container)?.value || '3';
      const height = $('#we-height', container)?.value || '5';
      const hollow = $('#we-hollow', container)?.checked ? '-h ' : '';
      command = `/brush cylinder ${hollow}${blockValue} ${radius} ${height}`;
      break;
    }

    case 'undo': {
      const count = $('#we-count', container)?.value || '1';
      command = count === '1' ? '//undo' : `//undo ${count}`;
      break;
    }

    case 'drain':
    case 'fixwater':
    case 'fixlava':
    case 'snow':
    case 'thaw':
    case 'green':
    case 'extinguish': {
      const radius = $('#we-radius', container)?.value || '10';
      const cmdName = type === 'extinguish' ? 'ex' : type;
      command = `//${cmdName} ${radius}`;
      break;
    }

    case 'redo': {
      const count = $('#we-count', container)?.value || '1';
      command = count === '1' ? '//redo' : `//redo ${count}`;
      break;
    }

    case 'overlay':
    case 'center':
      command = `//${type} ${blockValue}`;
      break;

    case 'hollow': {
      const thickness = $('#we-thickness', container)?.value || '';
      command = thickness ? `//hollow ${thickness} ${blockValue}` : `//hollow ${blockValue}`;
      break;
    }

    case 'smooth': {
      const iterations = $('#we-iterations', container)?.value || '1';
      const maskBlock = $('#we-mask-block', container)?.value || '';
      command = maskBlock ? `//smooth ${iterations} ${maskBlock}` : `//smooth ${iterations}`;
      break;
    }

    case 'naturalize':
      command = '//naturalize';
      break;

    case 'line':
    case 'curve': {
      const thickness = $('#we-thickness', container)?.value || '';
      const hollow = $('#we-hollow', container)?.checked ? '-h ' : '';
      command = thickness ? `//${type} ${hollow}${blockValue} ${thickness}` : `//${type} ${hollow}${blockValue}`;
      break;
    }

    case 'deform': {
      const expression = $('#we-expression', container)?.value || 'y+=0';
      const flags = [];
      if ($('#we-deform-r', container)?.checked) flags.push('-r');
      if ($('#we-deform-o', container)?.checked) flags.push('-o');
      command = `//deform ${flags.join(' ')} ${expression}`.replace(/  +/g, ' ');
      break;
    }

    case 'regen': {
      const seed = $('#we-seed', container)?.value || '';
      const biome = $('#we-regen-biome', container)?.checked ? '-b ' : '';
      command = seed ? `//regen ${biome}${seed}`.trim() : `//regen ${biome}`.trim();
      break;
    }

    case 'cut': {
      const leaveBlock = $('#we-leave-block', container)?.value || 'air';
      const flags = [];
      if ($('#we-cut-e', container)?.checked) flags.push('-e');
      if ($('#we-cut-b', container)?.checked) flags.push('-b');
      command = `//cut ${flags.join(' ')} ${leaveBlock}`.replace(/  +/g, ' ').trim();
      break;
    }

    case 'flip': {
      const direction = $('#we-direction', container)?.value || 'up';
      command = `//flip ${direction}`;
      break;
    }

    case 'schematic-save': {
      const filename = $('#we-filename', container)?.value || 'build';
      const flags = [];
      if ($('#we-schem-e', container)?.checked) flags.push('-e');
      if ($('#we-force', container)?.checked) flags.push('-f');
      const flagStr = flags.length ? flags.join(' ') + ' ' : '';
      command = `//schematic save ${flagStr}${filename}`;
      break;
    }

    case 'schematic-load': {
      const filename = $('#we-filename', container)?.value || 'build';
      command = `//schematic load ${filename}`;
      break;
    }

    case 'cone': {
      const radius = $('#we-radius', container)?.value || '5';
      const height = $('#we-height', container)?.value || '10';
      const hollow = $('#we-hollow', container)?.checked ? '-h ' : '';
      command = `//cone ${hollow}${blockValue} ${radius} ${height}`;
      break;
    }

    case 'hpyramid': {
      const size = $('#we-size', container)?.value || '10';
      command = `//hpyramid ${blockValue} ${size}`;
      break;
    }

    case 'generate': {
      const expression = $('#we-expression', container)?.value || '(x^2+y^2+z^2)^0.5 < 5';
      const flags = [];
      if ($('#we-gen-h', container)?.checked) flags.push('-h');
      if ($('#we-gen-r', container)?.checked) flags.push('-r');
      if ($('#we-gen-o', container)?.checked) flags.push('-o');
      if ($('#we-gen-c', container)?.checked) flags.push('-c');
      command = `//generate ${flags.join(' ')} ${blockValue} ${expression}`.replace(/  +/g, ' ');
      break;
    }

    case 'forest': {
      const treeType = $('#we-tree-type', container)?.value || 'oak';
      const density = $('#we-density', container)?.value || '5';
      command = `//forest ${treeType} ${density}`;
      break;
    }

    case 'flora': {
      const density = $('#we-density', container)?.value || '10';
      command = `//flora ${density}`;
      break;
    }

    case 'shift': {
      const distance = $('#we-distance', container)?.value || '5';
      const direction = $('#we-direction', container)?.value || 'up';
      command = `//shift ${distance} ${direction}`;
      break;
    }

    case 'outset':
    case 'inset': {
      const distance = $('#we-distance', container)?.value || '5';
      const flags = [];
      if ($('#we-horizontal', container)?.checked) flags.push('-h');
      if ($('#we-vertical', container)?.checked) flags.push('-v');
      command = `//${type} ${flags.join(' ')} ${distance}`.replace(/  +/g, ' ');
      break;
    }

    case 'count':
      command = `//count ${blockValue}`;
      break;

    case 'fill':
    case 'fillr': {
      const radius = $('#we-radius', container)?.value || '10';
      const depth = $('#we-depth', container)?.value || '10';
      command = `//${type} ${blockValue} ${radius} ${depth}`;
      break;
    }

    case 'removeabove':
    case 'removebelow': {
      const size = $('#we-size', container)?.value || '5';
      const height = $('#we-height', container)?.value || '256';
      command = `//${type} ${size} ${height}`;
      break;
    }

    case 'removenear': {
      const radius = $('#we-radius', container)?.value || '5';
      command = `//removenear ${blockValue} ${radius}`;
      break;
    }

    case 'butcher': {
      const radius = $('#we-radius', container)?.value || '50';
      const flags = [];
      BUTCHER_FLAGS.forEach(f => {
        if ($(`#we-butcher-${f.id}`, container)?.checked) flags.push(`-${f.id}`);
      });
      command = `//butcher ${flags.join(' ')} ${radius}`.replace(/  +/g, ' ');
      break;
    }

    // === ブラシコマンド ===
    case 'brush-clipboard': {
      const flags = [];
      if ($('#we-brush-a', container)?.checked) flags.push('-a');
      if ($('#we-brush-o', container)?.checked) flags.push('-o');
      if ($('#we-brush-e', container)?.checked) flags.push('-e');
      if ($('#we-brush-b', container)?.checked) flags.push('-b');
      command = `/brush clipboard ${flags.join(' ')}`.trim();
      break;
    }

    case 'brush-smooth': {
      const radius = $('#we-radius', container)?.value || '3';
      const iterations = $('#we-iterations', container)?.value || '4';
      command = `/brush smooth ${radius} ${iterations}`;
      break;
    }

    case 'brush-gravity': {
      const radius = $('#we-radius', container)?.value || '3';
      const height = $('#we-height', container)?.value || '5';
      command = `/brush gravity ${radius} -h ${height}`;
      break;
    }

    case 'brush-forest': {
      const treeType = $('#we-tree-type', container)?.value || 'oak';
      const radius = $('#we-radius', container)?.value || '3';
      const density = $('#we-density', container)?.value || '5';
      command = `/brush forest sphere ${radius} ${density} ${treeType}`;
      break;
    }

    case 'brush-extinguish': {
      const radius = $('#we-radius', container)?.value || '5';
      command = `/brush extinguish ${radius}`;
      break;
    }

    case 'brush-butcher': {
      const radius = $('#we-radius', container)?.value || '5';
      const flags = [];
      BUTCHER_FLAGS.forEach(f => {
        if ($(`#we-butcher-${f.id}`, container)?.checked) flags.push(`-${f.id}`);
      });
      command = `/brush butcher ${flags.join(' ')} ${radius}`.replace(/  +/g, ' ');
      break;
    }

    case 'brush-deform': {
      const radius = $('#we-radius', container)?.value || '3';
      const expression = $('#we-expression', container)?.value || 'y-=0.5';
      command = `/brush deform sphere ${radius} ${expression}`;
      break;
    }

    case 'brush-snow': {
      const radius = $('#we-radius', container)?.value || '3';
      const stack = $('#we-stack', container)?.checked ? '-s ' : '';
      command = `/brush snow ${stack}sphere ${radius}`;
      break;
    }

    case 'brush-biome': {
      const biome = $('#we-biome', container)?.value || 'plains';
      const radius = $('#we-radius', container)?.value || '3';
      const column = $('#we-column', container)?.checked ? '-c ' : '';
      command = `/brush biome ${column}sphere ${radius} ${biome}`;
      break;
    }

    // === バイオームコマンド ===
    case 'setbiome': {
      const biome = $('#we-biome', container)?.value || 'plains';
      command = `//setbiome ${biome}`;
      break;
    }

    case 'replacebiome': {
      const fromBiome = $('#we-from-biome', container)?.value || 'plains';
      const toBiome = $('#we-to-biome', container)?.value || 'forest';
      command = `//replacebiome ${fromBiome} ${toBiome}`;
      break;
    }

    // === エンティティコマンド ===
    case 'remove': {
      const entityType = $('#we-entity-type', container)?.value || 'items';
      const radius = $('#we-radius', container)?.value || '50';
      command = `/remove ${entityType} ${radius}`;
      break;
    }

    default:
      command = `// ${type}`;
  }

  // マスク適用（多くのコマンドで -m オプションをサポート）
  const useMask = $('#we-use-mask', container)?.checked;
  if (useMask) {
    const maskType = $('#we-mask-type', container)?.value || 'include';
    const maskBlock = $('#we-mask-block', container)?.value || 'air';
    if (maskBlock) {
      const maskArg = maskType === 'exclude' ? `!${maskBlock}` : maskBlock;
      // -m オプションをサポートするコマンド
      const maskSupportedCmds = [
        'move', 'stack', 'copy', 'cut', 'paste', 'rotate', 'flip',
        'smooth', 'deform', 'hollow', 'regen', 'overlay', 'naturalize'
      ];
      if (maskSupportedCmds.includes(type)) {
        command += ` -m ${maskArg}`;
      }
    }
  }

  // プレビュー更新
  const preview = $('#we-command-preview', container);
  if (preview) {
    preview.textContent = command;
  }

  // 出力を更新
  setOutput(command, 'worldedit', { commandType: type, command });
}

// スタイル
const style = document.createElement('style');
style.textContent = `
  .worldedit-tool {
    max-width: 900px;
  }

  .we-badge {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: bold;
    margin-left: auto;
  }

  /* 入力欄とセレクトボックスのコントラスト改善 */
  .we-generator .mc-input,
  .we-panel .mc-input,
  .we-tab-content .mc-input {
    background: #2a2a40;
    border: 2px solid #4a4a6a;
    color: #ffffff;
    font-size: 0.95rem;
  }

  .we-generator .mc-input:focus,
  .we-panel .mc-input:focus,
  .we-tab-content .mc-input:focus {
    border-color: #5cb746;
    background: #2d2d48;
  }

  .we-generator .mc-select,
  .we-panel .mc-select,
  .we-tab-content .mc-select {
    background: #2a2a40;
    border: 2px solid #4a4a6a;
    color: #ffffff;
    font-size: 0.95rem;
  }

  .we-description {
    color: #c0c0c0;
    margin-bottom: var(--mc-space-md);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* バージョン選択 */
  .we-version-selector {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-md);
    padding: var(--mc-space-sm);
    background: var(--mc-bg-panel);
    border-radius: 6px;
  }

  .we-version-selector label {
    font-weight: bold;
    white-space: nowrap;
    color: #e0e0e0;
  }

  /* フォームラベルのコントラスト改善 */
  .we-generator .form-group label,
  .we-panel .form-group label,
  .we-tab-content .form-group label {
    color: #e8e8e8;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .we-version-selector select {
    max-width: 120px;
  }

  .we-block-count {
    margin-left: auto;
    font-size: 0.8rem;
    color: var(--mc-color-grass-main);
  }

  /* タブ */
  .we-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: var(--mc-space-md);
    border-bottom: 2px solid var(--mc-border-dark);
    padding-bottom: 4px;
    flex-wrap: wrap;
  }

  .we-tab {
    padding: 10px 20px;
    background: #2a2a3e;
    border: 2px solid #3d3d5c;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-weight: bold;
    color: #c0c0c0;
    transition: all 0.15s;
  }

  .we-tab:hover {
    background: #3a3a52;
    color: #ffffff;
  }

  .we-tab.active {
    background: var(--mc-color-grass-main);
    color: white;
    border-color: var(--mc-color-grass-dark);
  }

  .we-tab-content {
    display: none;
  }

  .we-tab-content.active {
    display: block;
  }

  /* ブロック入力 */
  .we-block-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .we-block-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: #2d2d44;
    border: 2px solid #4a4a6a;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    color: #e8e8e8;
  }

  .we-block-preview:hover {
    border-color: var(--mc-color-grass-main);
    background: #3d5c3d;
  }

  .we-block-preview span {
    color: #ffffff;
  }

  .we-block-preview img {
    image-rendering: pixelated;
  }

  .we-block-quick {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .we-quick-block {
    padding: 4px;
    background: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .we-quick-block:hover {
    background: var(--mc-color-grass-main);
    transform: scale(1.1);
  }

  /* ブロック状態入力 */
  .we-block-state-details {
    margin-top: 8px;
    font-size: 0.85rem;
  }

  .we-block-state-details summary {
    cursor: pointer;
    color: var(--mc-color-diamond);
    user-select: none;
  }

  .we-block-state-details summary:hover {
    text-decoration: underline;
  }

  .we-block-state-area {
    margin-top: 8px;
    padding: 8px;
    background: var(--mc-bg-panel);
    border-radius: 4px;
  }

  .we-state-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }

  .we-state-preset {
    padding: 2px 6px;
    background: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    border-radius: 3px;
    font-size: 0.75rem;
    font-family: monospace;
    cursor: pointer;
    transition: all 0.15s;
  }

  .we-state-preset:hover {
    background: var(--mc-color-diamond);
    color: white;
    border-color: var(--mc-color-diamond);
  }

  /* Butcherフラグ */
  .we-butcher-flags {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 4px;
  }

  .we-quick-block img {
    display: block;
    image-rendering: pixelated;
  }

  .we-hint {
    font-size: 0.8rem;
    color: #b0b0b0;
    margin-top: 4px;
  }

  .we-info {
    padding: 12px;
    background: rgba(77, 236, 242, 0.1);
    border-left: 3px solid var(--mc-color-diamond);
    border-radius: 0 4px 4px 0;
    font-size: 0.85rem;
  }

  .we-checkboxes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .we-checkboxes label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: normal;
    cursor: pointer;
  }

  /* パターン */
  .we-pattern-area {
    margin-top: 12px;
    padding: 12px;
    background: var(--mc-bg-panel);
    border-radius: 6px;
  }

  .we-pattern-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .we-pattern-remove {
    padding: 4px 8px;
    background: var(--mc-color-redstone);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  /* マスク */
  .we-mask-area {
    margin-top: 12px;
    padding: 12px;
    background: var(--mc-bg-panel);
    border-radius: 6px;
  }

  /* リファレンス */
  .we-search-box {
    margin-bottom: var(--mc-space-md);
  }

  .we-categories {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-md);
  }

  .we-category {
    background: var(--mc-bg-panel);
    border-radius: 8px;
    overflow: hidden;
  }

  .we-category-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border-left: 4px solid;
    font-weight: bold;
  }

  .we-category-icon {
    image-rendering: pixelated;
  }

  .we-category-count {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
  }

  .we-command-list {
    padding: 8px;
    display: grid;
    gap: 4px;
  }

  .we-command-item {
    padding: 10px 12px;
    background: var(--mc-bg-surface);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;
    align-items: center;
  }

  .we-command-item:hover {
    background: rgba(92, 183, 70, 0.2);
    transform: translateX(4px);
  }

  .we-cmd {
    font-family: var(--mc-font-mono);
    color: var(--mc-color-grass-main);
    font-weight: bold;
    white-space: nowrap;
  }

  .we-args {
    font-family: var(--mc-font-mono);
    color: var(--mc-color-diamond);
    font-size: 0.8rem;
  }

  .we-desc {
    grid-column: 1 / -1;
    margin: 0;
    font-size: 0.85rem;
    color: #b8b8b8;
    line-height: 1.4;
  }

  /* ブロック一覧 */
  .we-blocks-header {
    display: flex;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .we-blocks-header input {
    flex: 1;
    min-width: 200px;
  }

  .we-blocks-header select {
    min-width: 150px;
  }

  .we-blocks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    max-height: 600px;
    overflow-y: auto;
    padding: 12px;
    background: #1a1a2e;
    border-radius: 8px;
  }

  .we-block-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 10px;
    background: #2d2d44;
    border: 2px solid #4a4a6a;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    min-height: 100px;
  }

  .we-block-item:hover {
    background: #3d5c3d;
    border-color: #5cb746;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(92, 183, 70, 0.3);
  }

  .we-block-item img {
    image-rendering: pixelated;
    margin-bottom: 8px;
    width: 48px;
    height: 48px;
  }

  .we-block-name {
    font-size: 0.85rem;
    color: #e8e8e8;
    word-break: break-word;
    line-height: 1.3;
    font-weight: 500;
  }

  .we-block-version {
    font-size: 0.75rem;
    color: #a0a0b0;
    margin-top: 4px;
    background: rgba(0,0,0,0.2);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .we-no-blocks {
    text-align: center;
    color: #b0b0b0;
    padding: var(--mc-space-lg);
    font-size: 0.95rem;
  }

  /* ブロックセレクターモーダル */
  .we-block-selector-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .we-block-selector-content {
    background: #1e1e2e;
    border: 3px solid #4a4a6a;
    border-radius: 12px;
    width: 95%;
    max-width: 800px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  /* フォールバック表示 */
  .we-block-fallback {
    background: #3a3a50 !important;
    border-style: dashed !important;
  }

  .we-block-fallback img {
    opacity: 0.5;
  }

  .we-block-fallback .we-block-name {
    color: #a0a0a0;
  }

  .we-block-selector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--mc-space-md);
    border-bottom: 1px solid var(--mc-border-dark);
  }

  .we-block-selector-header h3 {
    margin: 0;
  }

  .we-block-selector-close {
    background: #3d3d5c;
    border: none;
    font-size: 1.5rem;
    color: #ffffff;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .we-block-selector-close:hover {
    background: #e55050;
  }

  .we-block-selector-close:hover {
    color: var(--mc-color-redstone);
  }

  .we-block-selector-search {
    padding: var(--mc-space-sm) var(--mc-space-md);
  }

  .we-block-selector-categories {
    display: flex;
    gap: 4px;
    padding: 0 var(--mc-space-md);
    flex-wrap: wrap;
  }

  .we-block-cat-btn {
    padding: 8px 12px;
    background: #2a2a3e;
    border: 2px solid #3d3d5c;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.85rem;
    color: #c0c0c0;
  }

  .we-block-cat-btn:hover {
    background: #3a3a52;
    color: #ffffff;
    border-color: #5a5a7a;
  }

  .we-block-cat-btn.active {
    background: var(--mc-color-grass-main);
    color: white;
    border-color: var(--mc-color-grass-dark);
  }

  .we-block-cat-btn img {
    display: block;
    image-rendering: pixelated;
  }

  .we-block-selector-grid {
    flex: 1;
    overflow-y: auto;
    padding: var(--mc-space-md);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 8px;
    align-content: start;
    background: #1a1a2e;
  }

  .we-block-selector-item {
    min-width: 90px;
    padding: 8px 6px;
    background: #2d2d44;
    border: 2px solid #3d3d5c;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
  }

  .we-block-selector-item:hover {
    background: #3d5c3d;
    border-color: #5a8a5a;
    transform: scale(1.02);
  }

  .we-block-selector-item:active {
    background: #4a7a4a;
    transform: scale(0.98);
  }

  .we-block-selector-item img {
    image-rendering: pixelated;
    flex-shrink: 0;
  }

  .we-block-selector-name {
    font-size: 0.7rem;
    color: #e0e0e0;
    text-align: center;
    line-height: 1.2;
    word-break: break-word;
    max-width: 100%;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .we-block-selector-item:hover .we-block-selector-name {
    color: #ffffff;
  }

  .we-block-fallback {
    background: #3d3d5c;
    border-style: dashed;
  }

  .we-block-fallback img {
    opacity: 0.4;
  }

  /* プレビュー */
  .we-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    border-radius: 6px;
  }

  .we-preview-section h3 {
    margin: 0 0 var(--mc-space-sm) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
    text-transform: uppercase;
  }

  .we-command-preview {
    font-family: var(--mc-font-mono);
    background: var(--mc-color-obsidian);
    color: var(--mc-color-grass-main);
    padding: var(--mc-space-md);
    border-radius: 4px;
    border-left: 4px solid var(--mc-color-grass-main);
    font-size: 1rem;
    word-break: break-all;
    min-height: 40px;
  }

  .we-tips {
    margin-top: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: #2a2a3e;
    border-radius: 6px;
    border: 1px solid #3d3d5c;
  }

  .we-tips h4 {
    margin: 0 0 var(--mc-space-sm) 0;
    font-size: 0.9rem;
    color: #ffc107;
    font-weight: bold;
  }

  .we-tips ul {
    margin: 0;
    padding-left: var(--mc-space-lg);
    font-size: 0.85rem;
    color: #c0c0c0;
    line-height: 1.5;
  }

  .we-tips li {
    margin-bottom: 4px;
  }

  .we-tips code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: var(--mc-font-mono);
    color: var(--mc-color-diamond);
  }

  /* レスポンシブ */
  @media (max-width: 600px) {
    .we-tabs {
      flex-direction: column;
    }

    .we-tab {
      border-radius: 4px;
      border: 1px solid var(--mc-border-dark);
    }

    .we-command-item {
      grid-template-columns: 1fr;
    }

    .we-version-selector {
      flex-wrap: wrap;
    }

    .we-block-count {
      width: 100%;
      margin-left: 0;
      margin-top: var(--mc-space-xs);
    }

    .we-blocks-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .we-block-selector-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }

    .we-block-selector-item {
      min-width: 80px;
      padding: 6px 4px;
    }

    .we-block-selector-name {
      font-size: 0.65rem;
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
