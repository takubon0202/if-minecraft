/**
 * Execute & Scoreboard Generator - UI
 */

import { $, $$, createElement, debounce } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { getVersionGroup, getVersionNote } from '../../core/version-compat.js';

// === データ定義 ===

const EXECUTE_SUBCOMMANDS = {
  modify: [
    { id: 'as', label: 'as <targets>', desc: '実行者を変更', template: 'as @e[type=minecraft:creeper]' },
    { id: 'at', label: 'at <targets>', desc: '実行位置を変更', template: 'at @s' },
    { id: 'positioned', label: 'positioned <pos>', desc: '座標を指定', template: 'positioned ~ ~1 ~' },
    { id: 'rotated', label: 'rotated <rot>', desc: '向きを変更', template: 'rotated ~ ~' },
    { id: 'facing', label: 'facing <pos>', desc: '指定座標を向く', template: 'facing 0 64 0' },
    { id: 'in', label: 'in <dimension>', desc: 'ディメンションを指定', template: 'in minecraft:the_nether' },
    { id: 'align', label: 'align <axes>', desc: '座標をブロック整列', template: 'align xyz' },
    { id: 'anchored', label: 'anchored <anchor>', desc: '基準点を変更', template: 'anchored eyes' },
    { id: 'on', label: 'on <relation>', desc: 'エンティティ関係（1.19.4+）', template: 'on passengers', minVersion: '1.19' },
    { id: 'summon', label: 'summon <entity>', desc: '一時エンティティを召喚', template: 'summon minecraft:marker', minVersion: '1.19' },
  ],
  condition: [
    { id: 'if_block', label: 'if block', desc: 'ブロック判定', template: 'if block ~ ~-1 ~ minecraft:stone' },
    { id: 'if_entity', label: 'if entity', desc: 'エンティティ判定', template: 'if entity @e[type=minecraft:creeper,distance=..5]' },
    { id: 'if_score', label: 'if score', desc: 'スコア比較', template: 'if score @s obj matches 1..' },
    { id: 'if_data', label: 'if data', desc: 'NBTデータ判定', template: 'if data entity @s SelectedItem' },
    { id: 'if_predicate', label: 'if predicate', desc: 'プレディケート判定', template: 'if predicate minecraft:example' },
    { id: 'if_biome', label: 'if biome', desc: 'バイオーム判定', template: 'if biome ~ ~ ~ minecraft:plains' },
    { id: 'if_loaded', label: 'if loaded', desc: 'チャンク読込判定', template: 'if loaded ~ ~ ~' },
    { id: 'if_dimension', label: 'if dimension', desc: 'ディメンション判定', template: 'if dimension minecraft:overworld' },
    { id: 'if_items', label: 'if items', desc: 'アイテム判定（1.20.5+）', template: 'if items entity @s container.* minecraft:diamond', minVersion: '1.20.5' },
    { id: 'if_function', label: 'if function', desc: '関数の戻り値（1.20.2+）', template: 'if function minecraft:example', minVersion: '1.20' },
  ],
  store: [
    { id: 'store_score', label: 'store result score', desc: 'スコアに保存', template: 'store result score @s obj' },
    { id: 'store_block', label: 'store result block', desc: 'ブロックNBTに保存', template: 'store result block ~ ~ ~ Items[0].Count byte 1' },
    { id: 'store_entity', label: 'store result entity', desc: 'エンティティNBTに保存', template: 'store result entity @s Health float 1' },
    { id: 'store_bossbar', label: 'store result bossbar', desc: 'ボスバーに保存', template: 'store result bossbar minecraft:bar value' },
    { id: 'store_storage', label: 'store result storage', desc: 'ストレージに保存', template: 'store result storage minecraft:data val int 1' },
  ],
};

const SCOREBOARD_COMMANDS = {
  objectives: [
    { id: 'obj_add', label: 'objectives add', desc: 'オブジェクティブ追加', template: 'scoreboard objectives add {name} {criteria} ["{display}"]' },
    { id: 'obj_remove', label: 'objectives remove', desc: 'オブジェクティブ削除', template: 'scoreboard objectives remove {name}' },
    { id: 'obj_list', label: 'objectives list', desc: '一覧表示', template: 'scoreboard objectives list' },
    { id: 'obj_setdisplay', label: 'objectives setdisplay', desc: '表示位置設定', template: 'scoreboard objectives setdisplay {slot} ["{name}"]' },
    { id: 'obj_modify_displayname', label: 'objectives modify displayname', desc: '表示名変更', template: 'scoreboard objectives modify {name} displayname "{display}"' },
    { id: 'obj_modify_rendertype', label: 'objectives modify rendertype', desc: 'レンダータイプ変更', template: 'scoreboard objectives modify {name} rendertype {type}' },
    { id: 'obj_modify_numberformat', label: 'objectives modify numberformat', desc: '数値フォーマット（1.20.3+）', template: 'scoreboard objectives modify {name} numberformat {format}', minVersion: '1.20' },
  ],
  players: [
    { id: 'pl_set', label: 'players set', desc: 'スコア設定', template: 'scoreboard players set {target} {objective} {value}' },
    { id: 'pl_add', label: 'players add', desc: 'スコア加算', template: 'scoreboard players add {target} {objective} {value}' },
    { id: 'pl_remove', label: 'players remove', desc: 'スコア減算', template: 'scoreboard players remove {target} {objective} {value}' },
    { id: 'pl_reset', label: 'players reset', desc: 'スコアリセット', template: 'scoreboard players reset {target} [{objective}]' },
    { id: 'pl_get', label: 'players get', desc: 'スコア取得', template: 'scoreboard players get {target} {objective}' },
    { id: 'pl_list', label: 'players list', desc: 'プレイヤー一覧', template: 'scoreboard players list [{target}]' },
    { id: 'pl_enable', label: 'players enable', desc: 'トリガー有効化', template: 'scoreboard players enable {target} {objective}' },
    { id: 'pl_operation', label: 'players operation', desc: 'スコア演算', template: 'scoreboard players operation {target} {targetObj} {op} {source} {sourceObj}' },
    { id: 'pl_display_numberformat', label: 'players display numberformat', desc: '個別数値フォーマット（1.20.3+）', template: 'scoreboard players display numberformat {target} {objective} {format}', minVersion: '1.20' },
  ],
};

const SCOREBOARD_CRITERIA = [
  'dummy', 'trigger', 'deathCount', 'playerKillCount', 'totalKillCount', 'health',
  'xp', 'level', 'food', 'air', 'armor',
];

const DISPLAY_SLOTS = [
  { id: 'sidebar', label: 'sidebar（サイドバー）' },
  { id: 'list', label: 'list（プレイヤーリスト）' },
  { id: 'below_name', label: 'below_name（名前の下）' },
];

const OPERATIONS = [
  { id: '+=', label: '+= 加算' },
  { id: '-=', label: '-= 減算' },
  { id: '*=', label: '*= 乗算' },
  { id: '/=', label: '/= 除算' },
  { id: '%=', label: '%= 剰余' },
  { id: '=', label: '= 代入' },
  { id: '<', label: '< 最小値' },
  { id: '>', label: '> 最大値' },
  { id: '><', label: '>< スワップ' },
];

// フォーム状態
let state = {
  mode: 'execute', // 'execute' | 'scoreboard'
  // execute用
  executeChain: [],
  runCommand: 'say Hello',
  // scoreboard用
  sbCommand: 'obj_add',
  sbParams: {},
};

// === レンダリング ===

export function render(manifest) {
  return `
    <div class="tool-panel execute-tool mc-themed" id="execute-panel">
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'command_block')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/execute & /scoreboard</h2>
            <p class="header-subtitle">コマンドブロック向けコマンド生成</p>
          </div>
        </div>
        <span class="version-badge" id="exec-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="exec-reset-btn" title="リセット">リセット</button>
      </div>
      <p class="version-note" id="exec-version-note"></p>

      <!-- モード切替タブ -->
      <div class="exec-mode-tabs">
        <button type="button" class="exec-mode-tab active" data-mode="execute">/execute</button>
        <button type="button" class="exec-mode-tab" data-mode="scoreboard">/scoreboard</button>
      </div>

      <!-- /execute モード -->
      <div class="exec-mode-content" id="exec-mode-execute">
        ${renderExecuteMode()}
      </div>

      <!-- /scoreboard モード -->
      <div class="exec-mode-content" id="exec-mode-scoreboard" style="display:none">
        ${renderScoreboardMode()}
      </div>
    </div>
  `;
}

function renderExecuteMode() {
  return `
    <section class="form-section mc-section">
      <div class="section-header">
        <span class="step-number">1</span>
        <h3>サブコマンドチェーン</h3>
      </div>
      <p class="section-desc">上から順にサブコマンドを追加して、executeチェーンを構築します。</p>

      <div class="exec-chain-list" id="exec-chain-list">
        <div class="exec-chain-empty">サブコマンドを追加してください</div>
      </div>

      <div class="exec-add-buttons">
        <div class="exec-add-group">
          <span class="add-group-label">修飾</span>
          <div class="add-group-btns">
            ${EXECUTE_SUBCOMMANDS.modify.map(s => `
              <button type="button" class="exec-add-btn" data-sub="${s.id}" title="${s.desc}">${s.label}</button>
            `).join('')}
          </div>
        </div>
        <div class="exec-add-group">
          <span class="add-group-label">条件</span>
          <div class="add-group-btns">
            ${EXECUTE_SUBCOMMANDS.condition.map(s => `
              <button type="button" class="exec-add-btn exec-add-condition" data-sub="${s.id}" title="${s.desc}">${s.label}</button>
            `).join('')}
          </div>
        </div>
        <div class="exec-add-group">
          <span class="add-group-label">保存</span>
          <div class="add-group-btns">
            ${EXECUTE_SUBCOMMANDS.store.map(s => `
              <button type="button" class="exec-add-btn exec-add-store" data-sub="${s.id}" title="${s.desc}">${s.label}</button>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="form-section mc-section">
      <div class="section-header">
        <span class="step-number">2</span>
        <h3>実行コマンド（run）</h3>
      </div>
      <div class="run-command-input">
        <label>run に続くコマンド</label>
        <input type="text" id="exec-run-cmd" class="mc-input" value="say Hello" placeholder="say Hello World">
      </div>
    </section>

    <!-- プリセット -->
    <section class="form-section mc-section">
      <div class="section-header">
        <span class="step-number">P</span>
        <h3>プリセット</h3>
      </div>
      <div class="exec-presets">
        <button type="button" class="preset-card" data-exec-preset="tp_nearest">
          <span class="preset-name">最寄りMobにTP</span>
        </button>
        <button type="button" class="preset-card" data-exec-preset="kill_low_hp">
          <span class="preset-name">HP1以下を倒す</span>
        </button>
        <button type="button" class="preset-card" data-exec-preset="detect_stone">
          <span class="preset-name">石の上で実行</span>
        </button>
        <button type="button" class="preset-card" data-exec-preset="store_hp">
          <span class="preset-name">HPをスコアに保存</span>
        </button>
      </div>
    </section>
  `;
}

function renderScoreboardMode() {
  return `
    <section class="form-section mc-section">
      <div class="section-header">
        <span class="step-number">1</span>
        <h3>コマンド種別</h3>
      </div>
      <div class="sb-type-groups">
        <div class="sb-type-group">
          <h4>objectives（オブジェクティブ）</h4>
          <div class="sb-type-btns">
            ${SCOREBOARD_COMMANDS.objectives.map(c => `
              <button type="button" class="sb-type-btn ${c.id === 'obj_add' ? 'active' : ''}" data-sb-cmd="${c.id}" title="${c.desc}">${c.label}</button>
            `).join('')}
          </div>
        </div>
        <div class="sb-type-group">
          <h4>players（プレイヤー）</h4>
          <div class="sb-type-btns">
            ${SCOREBOARD_COMMANDS.players.map(c => `
              <button type="button" class="sb-type-btn" data-sb-cmd="${c.id}" title="${c.desc}">${c.label}</button>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="form-section mc-section">
      <div class="section-header">
        <span class="step-number">2</span>
        <h3>パラメータ</h3>
      </div>
      <div id="sb-params-area">
        ${renderSbParams('obj_add')}
      </div>
    </section>
  `;
}

function renderSbParams(cmdId) {
  switch (cmdId) {
    case 'obj_add':
      return `
        <div class="param-row"><label>オブジェクティブ名</label><input type="text" class="mc-input sb-param" data-key="name" value="my_score" placeholder="my_score"></div>
        <div class="param-row"><label>基準</label><select class="mc-select sb-param" data-key="criteria">${SCOREBOARD_CRITERIA.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
        <div class="param-row"><label>表示名（任意）</label><input type="text" class="mc-input sb-param" data-key="display" value="" placeholder="スコア表示名"></div>
      `;
    case 'obj_remove':
      return `<div class="param-row"><label>オブジェクティブ名</label><input type="text" class="mc-input sb-param" data-key="name" value="my_score" placeholder="my_score"></div>`;
    case 'obj_list':
      return `<p class="param-hint">パラメータなし - 全オブジェクティブを一覧表示します。</p>`;
    case 'obj_setdisplay':
      return `
        <div class="param-row"><label>表示スロット</label><select class="mc-select sb-param" data-key="slot">${DISPLAY_SLOTS.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}</select></div>
        <div class="param-row"><label>オブジェクティブ名（空で解除）</label><input type="text" class="mc-input sb-param" data-key="name" value="" placeholder="my_score"></div>
      `;
    case 'obj_modify_displayname':
      return `
        <div class="param-row"><label>オブジェクティブ名</label><input type="text" class="mc-input sb-param" data-key="name" value="my_score"></div>
        <div class="param-row"><label>新しい表示名</label><input type="text" class="mc-input sb-param" data-key="display" value="" placeholder="表示名"></div>
      `;
    case 'obj_modify_rendertype':
      return `
        <div class="param-row"><label>オブジェクティブ名</label><input type="text" class="mc-input sb-param" data-key="name" value="my_score"></div>
        <div class="param-row"><label>レンダータイプ</label><select class="mc-select sb-param" data-key="type"><option value="integer">integer</option><option value="hearts">hearts</option></select></div>
      `;
    case 'obj_modify_numberformat':
      return `
        <div class="param-row"><label>オブジェクティブ名</label><input type="text" class="mc-input sb-param" data-key="name" value="my_score"></div>
        <div class="param-row"><label>フォーマット種別</label><select class="mc-select sb-param" data-key="format"><option value="styled">styled（スタイル付き）</option><option value="fixed">fixed（固定テキスト）</option><option value="blank">blank（非表示）</option></select></div>
        <div class="param-row"><label>値（styled/fixed時）</label><input type="text" class="mc-input sb-param" data-key="formatValue" value="" placeholder='{"color":"red"} or 固定テキスト'></div>
      `;
    case 'pl_set':
    case 'pl_add':
    case 'pl_remove':
      return `
        <div class="param-row"><label>ターゲット</label><input type="text" class="mc-input sb-param" data-key="target" value="@s" placeholder="@s"></div>
        <div class="param-row"><label>オブジェクティブ</label><input type="text" class="mc-input sb-param" data-key="objective" value="my_score" placeholder="my_score"></div>
        <div class="param-row"><label>値</label><input type="number" class="mc-input sb-param" data-key="value" value="1" min="0"></div>
      `;
    case 'pl_reset':
      return `
        <div class="param-row"><label>ターゲット</label><input type="text" class="mc-input sb-param" data-key="target" value="@s"></div>
        <div class="param-row"><label>オブジェクティブ（空で全て）</label><input type="text" class="mc-input sb-param" data-key="objective" value="" placeholder="my_score"></div>
      `;
    case 'pl_get':
      return `
        <div class="param-row"><label>ターゲット</label><input type="text" class="mc-input sb-param" data-key="target" value="@s"></div>
        <div class="param-row"><label>オブジェクティブ</label><input type="text" class="mc-input sb-param" data-key="objective" value="my_score"></div>
      `;
    case 'pl_list':
      return `<div class="param-row"><label>ターゲット（空で全て）</label><input type="text" class="mc-input sb-param" data-key="target" value="" placeholder="@a"></div>`;
    case 'pl_enable':
      return `
        <div class="param-row"><label>ターゲット</label><input type="text" class="mc-input sb-param" data-key="target" value="@s"></div>
        <div class="param-row"><label>オブジェクティブ（trigger型）</label><input type="text" class="mc-input sb-param" data-key="objective" value="my_trigger"></div>
      `;
    case 'pl_operation':
      return `
        <div class="param-row"><label>ターゲット</label><input type="text" class="mc-input sb-param" data-key="target" value="@s"></div>
        <div class="param-row"><label>ターゲットObj</label><input type="text" class="mc-input sb-param" data-key="targetObj" value="result"></div>
        <div class="param-row"><label>演算子</label><select class="mc-select sb-param" data-key="op">${OPERATIONS.map(o => `<option value="${o.id}">${o.label}</option>`).join('')}</select></div>
        <div class="param-row"><label>ソース</label><input type="text" class="mc-input sb-param" data-key="source" value="@s"></div>
        <div class="param-row"><label>ソースObj</label><input type="text" class="mc-input sb-param" data-key="sourceObj" value="input"></div>
      `;
    case 'pl_display_numberformat':
      return `
        <div class="param-row"><label>ターゲット</label><input type="text" class="mc-input sb-param" data-key="target" value="@s"></div>
        <div class="param-row"><label>オブジェクティブ</label><input type="text" class="mc-input sb-param" data-key="objective" value="my_score"></div>
        <div class="param-row"><label>フォーマット</label><select class="mc-select sb-param" data-key="format"><option value="styled">styled</option><option value="fixed">fixed</option><option value="blank">blank</option></select></div>
        <div class="param-row"><label>値</label><input type="text" class="mc-input sb-param" data-key="formatValue" value=""></div>
      `;
    default:
      return '<p class="param-hint">コマンド種別を選択してください。</p>';
  }
}

// === 初期化 ===

export function init(container) {
  // モード切替
  $$('.exec-mode-tab', container).forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.exec-mode-tab', container).forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.mode = tab.dataset.mode;
      $$('.exec-mode-content', container).forEach(c => c.style.display = 'none');
      $(`#exec-mode-${state.mode}`, container).style.display = 'block';
      updateCommand();
    });
  });

  // === Execute モード ===
  // サブコマンド追加ボタン
  $$('.exec-add-btn', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.dataset.sub;
      addChainItem(subId, container);
    });
  });

  // run コマンド入力
  $('#exec-run-cmd', container)?.addEventListener('input', debounce(() => {
    state.runCommand = $('#exec-run-cmd', container).value;
    updateCommand();
  }, 150));

  // プリセット
  $$('[data-exec-preset]', container).forEach(btn => {
    btn.addEventListener('click', () => applyExecutePreset(btn.dataset.execPreset, container));
  });

  // === Scoreboard モード ===
  $$('.sb-type-btn', container).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.sb-type-btn', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.sbCommand = btn.dataset.sbCmd;
      state.sbParams = {};
      const area = $('#sb-params-area', container);
      area.innerHTML = renderSbParams(state.sbCommand);
      bindSbParams(container);
      updateCommand();
    });
  });
  bindSbParams(container);

  // リセット
  $('#exec-reset-btn', container)?.addEventListener('click', () => resetAll(container));

  // バージョン変更
  window.addEventListener('mc-version-change', () => {
    updateVersionDisplay(container);
    updateCommand();
  });

  updateVersionDisplay(container);
  updateCommand();
}

function bindSbParams(container) {
  $$('.sb-param', container).forEach(input => {
    const handler = () => {
      state.sbParams[input.dataset.key] = input.value;
      updateCommand();
    };
    input.addEventListener('input', debounce(handler, 150));
    input.addEventListener('change', handler);
    // 初期値を読み込み
    state.sbParams[input.dataset.key] = input.value;
  });
}

// === チェーン管理 ===

function addChainItem(subId, container) {
  const allSubs = [...EXECUTE_SUBCOMMANDS.modify, ...EXECUTE_SUBCOMMANDS.condition, ...EXECUTE_SUBCOMMANDS.store];
  const sub = allSubs.find(s => s.id === subId);
  if (!sub) return;

  // unless対応: if系コマンドのunless版
  const isCondition = EXECUTE_SUBCOMMANDS.condition.some(c => c.id === subId);

  state.executeChain.push({
    subId,
    value: sub.template,
    negate: false, // if → unless切替用
  });

  renderChain(container);
  updateCommand();
}

function removeChainItem(index, container) {
  state.executeChain.splice(index, 1);
  renderChain(container);
  updateCommand();
}

function moveChainItem(index, dir, container) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= state.executeChain.length) return;
  const tmp = state.executeChain[index];
  state.executeChain[index] = state.executeChain[newIndex];
  state.executeChain[newIndex] = tmp;
  renderChain(container);
  updateCommand();
}

function renderChain(container) {
  const list = $('#exec-chain-list', container);
  if (!list) return;

  if (state.executeChain.length === 0) {
    list.innerHTML = '<div class="exec-chain-empty">サブコマンドを追加してください</div>';
    return;
  }

  list.innerHTML = state.executeChain.map((item, i) => {
    const allSubs = [...EXECUTE_SUBCOMMANDS.modify, ...EXECUTE_SUBCOMMANDS.condition, ...EXECUTE_SUBCOMMANDS.store];
    const sub = allSubs.find(s => s.id === item.subId);
    const isCondition = EXECUTE_SUBCOMMANDS.condition.some(c => c.id === item.subId);

    return `
      <div class="exec-chain-item" data-index="${i}">
        <div class="chain-item-header">
          <span class="chain-index">${i + 1}</span>
          <span class="chain-label">${sub ? sub.label : item.subId}</span>
          ${isCondition ? `<button type="button" class="chain-negate-btn ${item.negate ? 'active' : ''}" data-index="${i}" title="if/unless切替">${item.negate ? 'unless' : 'if'}</button>` : ''}
          <div class="chain-item-actions">
            <button type="button" class="chain-move-btn" data-index="${i}" data-dir="-1" title="上へ">&#9650;</button>
            <button type="button" class="chain-move-btn" data-index="${i}" data-dir="1" title="下へ">&#9660;</button>
            <button type="button" class="chain-remove-btn" data-index="${i}" title="削除">&times;</button>
          </div>
        </div>
        <input type="text" class="mc-input chain-value-input" data-index="${i}" value="${escapeHtml(item.value)}">
      </div>
    `;
  }).join('');

  // イベントバインド
  $$('.chain-remove-btn', list).forEach(btn => {
    btn.addEventListener('click', () => removeChainItem(parseInt(btn.dataset.index), container));
  });
  $$('.chain-move-btn', list).forEach(btn => {
    btn.addEventListener('click', () => moveChainItem(parseInt(btn.dataset.index), parseInt(btn.dataset.dir), container));
  });
  $$('.chain-negate-btn', list).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      state.executeChain[idx].negate = !state.executeChain[idx].negate;
      // value内のif/unless切替
      const val = state.executeChain[idx].value;
      if (state.executeChain[idx].negate) {
        state.executeChain[idx].value = val.replace(/^if /, 'unless ');
      } else {
        state.executeChain[idx].value = val.replace(/^unless /, 'if ');
      }
      renderChain(container);
      updateCommand();
    });
  });
  $$('.chain-value-input', list).forEach(input => {
    input.addEventListener('input', debounce(() => {
      const idx = parseInt(input.dataset.index);
      state.executeChain[idx].value = input.value;
      updateCommand();
    }, 150));
  });
}

// === プリセット ===

function applyExecutePreset(presetId, container) {
  switch (presetId) {
    case 'tp_nearest':
      state.executeChain = [
        { subId: 'as', value: 'as @a', negate: false },
        { subId: 'at', value: 'at @s', negate: false },
      ];
      state.runCommand = 'tp @s @e[type=!minecraft:player,sort=nearest,limit=1]';
      break;
    case 'kill_low_hp':
      state.executeChain = [
        { subId: 'as', value: 'as @e[type=!minecraft:player]', negate: false },
        { subId: 'if_score', value: 'if score @s health matches ..1', negate: false },
      ];
      state.runCommand = 'kill @s';
      break;
    case 'detect_stone':
      state.executeChain = [
        { subId: 'as', value: 'as @a', negate: false },
        { subId: 'at', value: 'at @s', negate: false },
        { subId: 'if_block', value: 'if block ~ ~-1 ~ minecraft:stone', negate: false },
      ];
      state.runCommand = 'say 石の上にいます！';
      break;
    case 'store_hp':
      state.executeChain = [
        { subId: 'store_score', value: 'store result score @s health', negate: false },
      ];
      state.runCommand = 'data get entity @s Health';
      break;
  }

  $('#exec-run-cmd', container).value = state.runCommand;
  renderChain(container);
  updateCommand();
}

// === コマンド生成 ===

function updateCommand() {
  let command = '';

  if (state.mode === 'execute') {
    command = generateExecuteCommand();
  } else {
    command = generateScoreboardCommand();
  }

  setOutput(command, 'execute', state);
}

function generateExecuteCommand() {
  if (state.executeChain.length === 0 && !state.runCommand) {
    return '';
  }

  const parts = ['execute'];

  state.executeChain.forEach(item => {
    if (item.value.trim()) {
      parts.push(item.value.trim());
    }
  });

  if (state.runCommand.trim()) {
    parts.push('run ' + state.runCommand.trim());
  }

  return parts.join(' ');
}

function generateScoreboardCommand() {
  const p = state.sbParams;

  switch (state.sbCommand) {
    case 'obj_add': {
      let cmd = `scoreboard objectives add ${p.name || 'obj'} ${p.criteria || 'dummy'}`;
      if (p.display) cmd += ` "${p.display}"`;
      return cmd;
    }
    case 'obj_remove':
      return `scoreboard objectives remove ${p.name || 'obj'}`;
    case 'obj_list':
      return 'scoreboard objectives list';
    case 'obj_setdisplay': {
      let cmd = `scoreboard objectives setdisplay ${p.slot || 'sidebar'}`;
      if (p.name) cmd += ` ${p.name}`;
      return cmd;
    }
    case 'obj_modify_displayname':
      return `scoreboard objectives modify ${p.name || 'obj'} displayname "${p.display || ''}"`;
    case 'obj_modify_rendertype':
      return `scoreboard objectives modify ${p.name || 'obj'} rendertype ${p.type || 'integer'}`;
    case 'obj_modify_numberformat': {
      const fmt = p.format || 'blank';
      let cmd = `scoreboard objectives modify ${p.name || 'obj'} numberformat ${fmt}`;
      if (fmt !== 'blank' && p.formatValue) cmd += ` ${p.formatValue}`;
      return cmd;
    }
    case 'pl_set':
      return `scoreboard players set ${p.target || '@s'} ${p.objective || 'obj'} ${p.value || '0'}`;
    case 'pl_add':
      return `scoreboard players add ${p.target || '@s'} ${p.objective || 'obj'} ${p.value || '1'}`;
    case 'pl_remove':
      return `scoreboard players remove ${p.target || '@s'} ${p.objective || 'obj'} ${p.value || '1'}`;
    case 'pl_reset': {
      let cmd = `scoreboard players reset ${p.target || '@s'}`;
      if (p.objective) cmd += ` ${p.objective}`;
      return cmd;
    }
    case 'pl_get':
      return `scoreboard players get ${p.target || '@s'} ${p.objective || 'obj'}`;
    case 'pl_list': {
      let cmd = 'scoreboard players list';
      if (p.target) cmd += ` ${p.target}`;
      return cmd;
    }
    case 'pl_enable':
      return `scoreboard players enable ${p.target || '@s'} ${p.objective || 'trigger'}`;
    case 'pl_operation':
      return `scoreboard players operation ${p.target || '@s'} ${p.targetObj || 'result'} ${p.op || '+='} ${p.source || '@s'} ${p.sourceObj || 'input'}`;
    case 'pl_display_numberformat': {
      const fmt = p.format || 'blank';
      let cmd = `scoreboard players display numberformat ${p.target || '@s'} ${p.objective || 'obj'} ${fmt}`;
      if (fmt !== 'blank' && p.formatValue) cmd += ` ${p.formatValue}`;
      return cmd;
    }
    default:
      return '';
  }
}

// === ユーティリティ ===

function resetAll(container) {
  state = {
    mode: state.mode,
    executeChain: [],
    runCommand: 'say Hello',
    sbCommand: 'obj_add',
    sbParams: {},
  };

  if (state.mode === 'execute') {
    $('#exec-run-cmd', container).value = 'say Hello';
    renderChain(container);
  } else {
    $$('.sb-type-btn', container).forEach(b => b.classList.remove('active'));
    const firstBtn = $('.sb-type-btn', container);
    if (firstBtn) firstBtn.classList.add('active');
    state.sbCommand = 'obj_add';
    const area = $('#sb-params-area', container);
    area.innerHTML = renderSbParams('obj_add');
    bindSbParams(container);
  }

  updateCommand();
}

function updateVersionDisplay(container) {
  const version = workspaceStore.get('version') || '1.21';
  const badge = $('#exec-version-badge', container);
  const note = $('#exec-version-note', container);
  if (badge) badge.textContent = version + '+';
  if (note) note.textContent = getVersionNote(version);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// === スタイル ===

const style = document.createElement('style');
style.textContent = `
  /* モード切替タブ */
  .exec-mode-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: var(--mc-space-lg);
    background: rgba(0,0,0,0.3);
    border-radius: 8px;
    padding: 4px;
  }

  .exec-mode-tab {
    flex: 1;
    padding: 10px 16px;
    background: transparent;
    border: 2px solid transparent;
    border-radius: 6px;
    color: #aaa;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .exec-mode-tab:hover {
    color: #fff;
    background: rgba(255,255,255,0.05);
  }

  .exec-mode-tab.active {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: var(--mc-color-grass-main);
    color: #fff;
  }

  /* セクション */
  .execute-tool .form-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .execute-tool .section-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-sm);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .execute-tool .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .execute-tool .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #fff;
  }

  .section-desc {
    color: #aaa;
    font-size: 0.85rem;
    margin: 0 0 var(--mc-space-md) 0;
  }

  /* ヘッダー */
  .execute-tool .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, #e07020 0%, #b04010 100%);
    border-radius: 8px 8px 0 0;
    margin: calc(-1 * var(--mc-space-lg));
    margin-bottom: var(--mc-space-lg);
  }

  .execute-tool .header-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .execute-tool .header-icon { width: 48px; height: 48px; }

  .execute-tool .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .execute-tool .header-subtitle {
    margin: 4px 0 0;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.8);
  }

  /* チェーンリスト */
  .exec-chain-list {
    min-height: 48px;
    margin-bottom: var(--mc-space-md);
  }

  .exec-chain-empty {
    padding: var(--mc-space-lg);
    text-align: center;
    color: #666;
    border: 2px dashed #444;
    border-radius: 8px;
  }

  .exec-chain-item {
    background: rgba(0,0,0,0.3);
    border: 1px solid #444;
    border-radius: 6px;
    padding: var(--mc-space-sm) var(--mc-space-md);
    margin-bottom: var(--mc-space-sm);
  }

  .chain-item-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-xs);
  }

  .chain-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #555;
    color: #fff;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .chain-label {
    font-weight: bold;
    color: #ddd;
    font-size: 0.85rem;
    flex: 1;
  }

  .chain-negate-btn {
    padding: 2px 8px;
    font-size: 0.75rem;
    background: #2a6040;
    border: 1px solid #3a8060;
    color: #8f8;
    border-radius: 4px;
    cursor: pointer;
  }

  .chain-negate-btn.active {
    background: #802020;
    border-color: #a03030;
    color: #f88;
  }

  .chain-item-actions {
    display: flex;
    gap: 4px;
  }

  .chain-move-btn, .chain-remove-btn {
    padding: 2px 8px;
    background: #444;
    border: 1px solid #555;
    color: #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .chain-move-btn:hover { background: #555; }
  .chain-remove-btn { background: #600; border-color: #800; color: #faa; }
  .chain-remove-btn:hover { background: #800; }

  .chain-value-input {
    width: 100%;
    font-family: var(--mc-font-mono);
    font-size: 0.85rem;
  }

  /* サブコマンド追加ボタン群 */
  .exec-add-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-md);
  }

  .exec-add-group {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
  }

  .add-group-label {
    font-size: 0.75rem;
    color: #888;
    font-weight: bold;
    text-transform: uppercase;
  }

  .add-group-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .exec-add-btn {
    padding: 4px 10px;
    font-size: 0.75rem;
    background: linear-gradient(180deg, #4a4a4a, #3a3a3a);
    border: 1px solid #555;
    border-radius: 4px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.15s;
  }

  .exec-add-btn:hover {
    background: linear-gradient(180deg, #5cb746, #3a8128);
    border-color: var(--mc-color-grass-main);
    color: #fff;
  }

  .exec-add-condition {
    border-color: #3a6050;
  }

  .exec-add-condition:hover {
    background: linear-gradient(180deg, #2a8060, #1a6040);
    border-color: #4a9070;
  }

  .exec-add-store {
    border-color: #504a3a;
  }

  .exec-add-store:hover {
    background: linear-gradient(180deg, #806020, #604010);
    border-color: #a08040;
  }

  /* run コマンド入力 */
  .run-command-input label {
    display: block;
    color: #ccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-xs);
  }

  .run-command-input .mc-input {
    font-family: var(--mc-font-mono);
  }

  /* プリセット */
  .exec-presets {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--mc-space-md);
  }

  .execute-tool .preset-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, #4a4a4a, #3a3a3a);
    border: 2px solid #555;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .execute-tool .preset-card:hover {
    background: linear-gradient(180deg, #e07020, #b04010);
    border-color: #ff8030;
    transform: translateY(-2px);
  }

  .execute-tool .preset-card .preset-name {
    font-size: 0.8rem;
    color: #fff;
    text-align: center;
  }

  /* Scoreboard 種別ボタン */
  .sb-type-groups {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-lg);
  }

  .sb-type-group h4 {
    margin: 0 0 var(--mc-space-sm);
    font-size: 0.85rem;
    color: #aaa;
  }

  .sb-type-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .sb-type-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
    background: linear-gradient(180deg, #4a4a4a, #3a3a3a);
    border: 1px solid #555;
    border-radius: 4px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.15s;
  }

  .sb-type-btn:hover {
    background: linear-gradient(180deg, #5a5a5a, #4a4a4a);
  }

  .sb-type-btn.active {
    background: linear-gradient(180deg, #5cb746, #3a8128);
    border-color: var(--mc-color-grass-main);
    color: #fff;
  }

  /* パラメータ */
  .param-row {
    margin-bottom: var(--mc-space-md);
  }

  .param-row label {
    display: block;
    color: #ccc;
    font-size: 0.85rem;
    margin-bottom: var(--mc-space-xs);
  }

  .param-hint {
    color: #888;
    font-size: 0.85rem;
    font-style: italic;
  }
`;
document.head.appendChild(style);

export default { render, init };
