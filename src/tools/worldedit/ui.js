/**
 * WorldEdit Command Generator - UI
 * WorldEditプラグイン/MODのコマンド生成ツール
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';

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
  }
};

// よく使うブロック
const COMMON_BLOCKS = [
  { id: 'stone', name: '石' },
  { id: 'granite', name: '花崗岩' },
  { id: 'diorite', name: '閃緑岩' },
  { id: 'andesite', name: '安山岩' },
  { id: 'cobblestone', name: '丸石' },
  { id: 'mossy_cobblestone', name: '苔むした丸石' },
  { id: 'stone_bricks', name: '石レンガ' },
  { id: 'mossy_stone_bricks', name: '苔むした石レンガ' },
  { id: 'cracked_stone_bricks', name: 'ひび割れた石レンガ' },
  { id: 'dirt', name: '土' },
  { id: 'grass_block', name: '草ブロック' },
  { id: 'sand', name: '砂' },
  { id: 'gravel', name: '砂利' },
  { id: 'oak_planks', name: 'オーク板材' },
  { id: 'spruce_planks', name: 'トウヒ板材' },
  { id: 'birch_planks', name: 'シラカバ板材' },
  { id: 'oak_log', name: 'オーク原木' },
  { id: 'spruce_log', name: 'トウヒ原木' },
  { id: 'glass', name: 'ガラス' },
  { id: 'white_wool', name: '白の羊毛' },
  { id: 'white_concrete', name: '白のコンクリート' },
  { id: 'bricks', name: 'レンガ' },
  { id: 'obsidian', name: '黒曜石' },
  { id: 'bedrock', name: '岩盤' },
  { id: 'netherrack', name: 'ネザーラック' },
  { id: 'end_stone', name: 'エンドストーン' },
  { id: 'quartz_block', name: 'クォーツブロック' },
  { id: 'prismarine', name: 'プリズマリン' },
  { id: 'sea_lantern', name: 'シーランタン' },
  { id: 'glowstone', name: 'グロウストーン' },
  { id: 'air', name: '空気' },
  { id: 'water', name: '水' },
  { id: 'lava', name: '溶岩' },
];

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

// コマンドタイプ
const COMMAND_TYPES = [
  { id: 'set', name: '//set - ブロック配置', category: 'editing' },
  { id: 'replace', name: '//replace - ブロック置換', category: 'editing' },
  { id: 'sphere', name: '//sphere - 球体生成', category: 'generation' },
  { id: 'hsphere', name: '//hsphere - 中空球体', category: 'generation' },
  { id: 'cylinder', name: '//cylinder - 円柱生成', category: 'generation' },
  { id: 'hcyl', name: '//hcyl - 中空円柱', category: 'generation' },
  { id: 'pyramid', name: '//pyramid - ピラミッド', category: 'generation' },
  { id: 'walls', name: '//walls - 壁生成', category: 'editing' },
  { id: 'outline', name: '//outline - 輪郭生成', category: 'editing' },
  { id: 'move', name: '//move - 移動', category: 'editing' },
  { id: 'stack', name: '//stack - 積み重ね', category: 'editing' },
  { id: 'copy', name: '//copy - コピー', category: 'clipboard' },
  { id: 'paste', name: '//paste - 貼り付け', category: 'clipboard' },
  { id: 'rotate', name: '//rotate - 回転', category: 'clipboard' },
  { id: 'expand', name: '//expand - 範囲拡張', category: 'selection' },
  { id: 'contract', name: '//contract - 範囲縮小', category: 'selection' },
  { id: 'brush-sphere', name: '/brush sphere - 球体ブラシ', category: 'brush' },
  { id: 'brush-cylinder', name: '/brush cylinder - 円柱ブラシ', category: 'brush' },
  { id: 'undo', name: '//undo - 取り消し', category: 'utility' },
  { id: 'drain', name: '//drain - 水抜き', category: 'utility' },
];

let currentTab = 'generator';  // 'generator' or 'reference'
let currentCommandType = 'set';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel worldedit-tool" id="worldedit-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'golden_pickaxe')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="we-badge">Plugin/MOD</span>
      </div>
      <p class="we-description">WorldEditプラグイン/MODのコマンドを簡単に生成できます。初心者でも複雑なコマンドを作成可能！</p>

      <!-- タブ切り替え -->
      <div class="we-tabs">
        <button type="button" class="we-tab active" data-tab="generator">コマンド生成</button>
        <button type="button" class="we-tab" data-tab="reference">コマンドリファレンス</button>
      </div>

      <!-- コマンド生成タブ -->
      <div class="we-tab-content active" id="we-generator">
        <form class="tool-form" id="worldedit-form">
          <!-- コマンドタイプ選択 -->
          <div class="form-group">
            <label for="we-command-type">コマンドタイプ</label>
            <select id="we-command-type" class="mc-select">
              ${COMMAND_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
          </div>

          <!-- 動的パラメータエリア -->
          <div id="we-params-area">
            ${renderParamsForType('set')}
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
                  <input type="text" id="we-mask-block" class="mc-input" placeholder="air" list="we-block-list">
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

      <!-- ブロックIDリスト（datalist） -->
      <datalist id="we-block-list">
        ${COMMON_BLOCKS.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
      </datalist>

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
 * コマンドタイプに応じたパラメータUIを生成
 */
function renderParamsForType(type) {
  const blockInput = `
    <div class="form-group">
      <label for="we-block">ブロック</label>
      <input type="text" id="we-block" class="mc-input" placeholder="stone" list="we-block-list" value="stone">
      <div class="we-block-quick">
        ${COMMON_BLOCKS.slice(0, 8).map(b => `
          <button type="button" class="we-quick-block" data-block="${b.id}" title="${b.name}">
            <img src="${getInviconUrl(b.id)}" width="20" height="20" alt="${b.name}" onerror="this.style.opacity='0.3'">
          </button>
        `).join('')}
      </div>
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
            <input type="text" id="we-from-block" class="mc-input" placeholder="stone" list="we-block-list">
            <small class="we-hint">空欄で全ブロック対象</small>
          </div>
          <div class="form-group">
            <label for="we-to-block">新しいブロック</label>
            <input type="text" id="we-to-block" class="mc-input" placeholder="air" list="we-block-list" value="air">
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
          <input type="text" id="we-leave-block" class="mc-input" placeholder="air" list="we-block-list">
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
      return `<p class="we-info">選択範囲をクリップボードにコピーします。先に //pos1 と //pos2 で範囲を選択してください。</p>`;

    case 'paste':
      return `
        <div class="form-group">
          <label>オプション</label>
          <div class="we-checkboxes">
            <label><input type="checkbox" id="we-paste-a"> -a（空気をコピーしない）</label>
            <label><input type="checkbox" id="we-paste-o"> -o（元の位置を基準にする）</label>
            <label><input type="checkbox" id="we-paste-s"> -s（選択範囲を更新）</label>
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
      return `
        <div class="form-group">
          <label for="we-radius">半径</label>
          <input type="number" id="we-radius" class="mc-input" value="10" min="1" max="100">
        </div>
      `;

    default:
      return '<p class="we-info">パラメータを設定してください</p>';
  }
}

/**
 * 初期化
 */
export function init(container) {
  currentTab = 'generator';
  currentCommandType = 'set';

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
    $('#we-params-area', container).innerHTML = renderParamsForType(currentCommandType);
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

  // 初期パラメータイベント
  bindParamEvents(container);
  updateVisibility(container);
  updateCommand(container);
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
    const blockInput = $('#we-block', container);
    if (blockInput) {
      blockInput.value = block;
      updateCommand(container);
    }
  });
}

/**
 * 表示/非表示を更新
 */
function updateVisibility(container) {
  const type = currentCommandType;

  // パターンはブロック配置系コマンドでのみ表示
  const showPattern = ['set', 'sphere', 'hsphere', 'cylinder', 'hcyl', 'pyramid', 'walls', 'outline', 'brush-sphere', 'brush-cylinder'].includes(type);
  $('#we-pattern-group', container).style.display = showPattern ? 'block' : 'none';

  // マスクは編集系コマンドでのみ表示
  const showMask = ['replace', 'move', 'stack'].includes(type);
  $('#we-mask-group', container).style.display = showMask ? 'block' : 'none';
}

/**
 * パターンアイテムを追加
 */
function addPatternItem(container) {
  const patternItems = $('#we-pattern-items', container);
  const index = patternItems.children.length;

  const item = document.createElement('div');
  item.className = 'we-pattern-item';
  item.innerHTML = `
    <input type="number" class="mc-input we-pattern-percent" value="50" min="1" max="100" style="width: 60px;">
    <span>%</span>
    <input type="text" class="mc-input we-pattern-block" placeholder="stone" list="we-block-list" style="flex: 1;">
    <button type="button" class="we-pattern-remove" title="削除">×</button>
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
  let blockValue = $('#we-block', container)?.value || 'stone';
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

    case 'copy':
      command = '//copy';
      break;

    case 'paste': {
      const flags = [];
      if ($('#we-paste-a', container)?.checked) flags.push('-a');
      if ($('#we-paste-o', container)?.checked) flags.push('-o');
      if ($('#we-paste-s', container)?.checked) flags.push('-s');
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

    case 'drain': {
      const radius = $('#we-radius', container)?.value || '10';
      command = `//drain ${radius}`;
      break;
    }

    default:
      command = `// ${type}`;
  }

  // マスク適用
  const useMask = $('#we-use-mask', container)?.checked;
  if (useMask) {
    const maskType = $('#we-mask-type', container)?.value || 'include';
    const maskBlock = $('#we-mask-block', container)?.value || 'air';
    if (maskBlock) {
      const maskArg = maskType === 'exclude' ? `!${maskBlock}` : maskBlock;
      // -m オプションをサポートするコマンドのみ
      if (['move', 'stack'].includes(type)) {
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

  .we-description {
    color: var(--mc-text-secondary);
    margin-bottom: var(--mc-space-md);
    font-size: 0.9rem;
  }

  /* タブ */
  .we-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: var(--mc-space-md);
    border-bottom: 2px solid var(--mc-border-dark);
    padding-bottom: 4px;
  }

  .we-tab {
    padding: 10px 20px;
    background: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-weight: bold;
    color: var(--mc-text-secondary);
    transition: all 0.15s;
  }

  .we-tab:hover {
    background: var(--mc-bg-surface);
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

  /* フォーム要素 */
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

  .we-quick-block img {
    display: block;
    image-rendering: pixelated;
  }

  .we-hint {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
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
    font-size: 0.8rem;
    color: var(--mc-text-secondary);
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
    padding: var(--mc-space-sm);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .we-tips h4 {
    margin: 0 0 var(--mc-space-xs) 0;
    font-size: 0.8rem;
    color: var(--mc-color-gold);
  }

  .we-tips ul {
    margin: 0;
    padding-left: var(--mc-space-lg);
    font-size: 0.8rem;
    color: var(--mc-text-secondary);
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
  }
`;
document.head.appendChild(style);

export default { render, init };
