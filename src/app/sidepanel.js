/**
 * Side Panel Manager - サイドパネル管理
 * 履歴のピン留め、フィルタリング機能付き
 */

import { $, $$, delegate, empty, createElement } from '../core/dom.js';
import { historyStore } from '../core/store.js';
import storage from '../core/storage.js';
import { copyToClipboard, showCopyFeedback } from '../core/clipboard.js';
import { copyShareUrl } from '../core/share.js';

let currentCommand = '';
let currentToolId = '';
let currentState = null;
let historyFilter = ''; // 検索フィルター

/**
 * サイドパネルを初期化
 */
export function initSidePanel() {
  // パネルタブ切り替え
  delegate($('#side-panel'), 'click', '.panel-tab', (e, target) => {
    const panelId = target.dataset.panel;
    switchPanel(panelId);
  });

  // コピーボタン
  $('#copy-btn')?.addEventListener('click', handleCopy);

  // 共有ボタン
  $('#share-btn')?.addEventListener('click', handleShare);

  // 保存ボタン
  $('#save-btn')?.addEventListener('click', handleSave);

  // 履歴クリアボタン
  $('#clear-history-btn')?.addEventListener('click', clearHistory);

  // 履歴アイテムクリック（コマンド部分のみ）
  delegate($('#history-list'), 'click', '.history-command', (e, target) => {
    const command = target.textContent;
    setOutput(command);
    copyToClipboard(command);
  });

  // ピン留めボタン
  delegate($('#history-list'), 'click', '.history-pin-btn', (e, target) => {
    e.stopPropagation();
    const index = parseInt(target.dataset.index);
    togglePin(index);
  });

  // 削除ボタン
  delegate($('#history-list'), 'click', '.history-delete-btn', (e, target) => {
    e.stopPropagation();
    const index = parseInt(target.dataset.index);
    deleteHistoryItem(index);
  });

  // 検索フィルター
  $('#history-search')?.addEventListener('input', (e) => {
    historyFilter = e.target.value.toLowerCase();
    renderHistory(historyStore.get('commands'));
  });

  // 履歴を読み込み
  loadHistory();

  // ストア変更を監視
  historyStore.subscribe('commands', renderHistory);
}

/**
 * パネルを切り替え
 * @param {string} panelId - パネルID
 */
function switchPanel(panelId) {
  // タブのアクティブ状態
  $$('.panel-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panelId);
  });

  // パネルの表示
  $$('.panel-section').forEach(section => {
    section.classList.toggle('active', section.id === `panel-${panelId}`);
  });
}

// コマンド文字数制限
const CHAT_LIMIT = 256;           // チャット入力の最大文字数
const COMMAND_BLOCK_LIMIT = 32767; // コマンドブロックの最大文字数

/**
 * 出力を設定
 * @param {string} command - コマンド文字列
 * @param {string} toolId - ツールID
 * @param {Object} state - ツール状態
 */
export function setOutput(command, toolId = '', state = null) {
  currentCommand = command;
  currentToolId = toolId;
  currentState = state;

  const output = $('#command-output');
  if (output) {
    output.textContent = command || 'コマンドが生成されていません';
  }

  // ボタンの有効/無効
  const hasCommand = !!command;
  $('#copy-btn').disabled = !hasCommand;
  $('#share-btn').disabled = !hasCommand || !toolId;
  $('#save-btn').disabled = !hasCommand;

  // 文字数制限の警告を更新
  updateCommandLengthWarning(command);
}

/**
 * コマンド文字数制限の警告を更新
 * @param {string} command - コマンド文字列
 */
function updateCommandLengthWarning(command) {
  let warningEl = $('#command-length-warning');

  // 警告要素がなければ作成
  if (!warningEl) {
    const outputArea = $('.output-area');
    if (outputArea) {
      warningEl = createElement('div', {
        id: 'command-length-warning',
        className: 'command-length-warning'
      });
      outputArea.appendChild(warningEl);
    }
  }

  if (!warningEl) return;

  const len = command?.length || 0;

  if (len === 0) {
    // コマンドがない場合は警告を非表示
    warningEl.className = 'command-length-warning';
    warningEl.innerHTML = '';
  } else if (len > COMMAND_BLOCK_LIMIT) {
    // コマンドブロックの上限を超過
    warningEl.className = 'command-length-warning warning-error';
    warningEl.innerHTML = `
      <span class="warning-icon">⛔</span>
      <span class="warning-text">
        <strong>コマンドが長すぎます</strong>
        <span class="warning-detail">${len.toLocaleString()}文字（上限: ${COMMAND_BLOCK_LIMIT.toLocaleString()}文字）</span>
      </span>
    `;
  } else if (len > CHAT_LIMIT) {
    // チャット入力の上限を超過、コマンドブロック推奨
    warningEl.className = 'command-length-warning warning-alert';
    warningEl.innerHTML = `
      <span class="warning-icon">⚠️</span>
      <span class="warning-text">
        <strong>コマンドブロックを使用してください</strong>
        <span class="warning-detail">${len.toLocaleString()}文字（チャット上限: ${CHAT_LIMIT}文字）</span>
      </span>
    `;
  } else {
    // 制限内
    warningEl.className = 'command-length-warning';
    warningEl.innerHTML = '';
  }
}

/**
 * コピー処理
 */
async function handleCopy() {
  if (!currentCommand) return;

  const success = await copyToClipboard(currentCommand);
  if (success) {
    showCopyFeedback($('#copy-btn'), 'コピー');
  }
}

/**
 * 共有処理
 */
async function handleShare() {
  if (!currentCommand || !currentToolId) return;

  const success = await copyShareUrl(currentToolId, currentState || { command: currentCommand });
  if (success) {
    showCopyFeedback($('#share-btn'), '🔗 共有');
  }
}

/**
 * 保存処理
 */
function handleSave() {
  if (!currentCommand) return;

  const commands = historyStore.get('commands');
  const maxItems = historyStore.get('maxItems');

  const newEntry = {
    command: currentCommand,
    toolId: currentToolId,
    timestamp: Date.now(),
    pinned: false,
  };

  // 重複チェック
  const exists = commands.some(c => c.command === currentCommand);
  if (!exists) {
    // ピン留めされたアイテムは保護
    const pinnedItems = commands.filter(c => c.pinned);
    const unpinnedItems = commands.filter(c => !c.pinned);
    const newUnpinned = [newEntry, ...unpinnedItems].slice(0, maxItems - pinnedItems.length);
    const newCommands = [...pinnedItems, ...newUnpinned];
    historyStore.set('commands', newCommands);
    saveHistory();
  }

  showCopyFeedback($('#save-btn'), '💾 保存');
}

/**
 * 履歴をクリア（ピン留めは保持）
 */
function clearHistory() {
  const commands = historyStore.get('commands');
  const pinnedItems = commands.filter(c => c.pinned);
  historyStore.set('commands', pinnedItems);
  saveHistory();
}

/**
 * ピン留めをトグル
 */
function togglePin(index) {
  const commands = historyStore.get('commands');
  if (index >= 0 && index < commands.length) {
    commands[index].pinned = !commands[index].pinned;
    // ピン留めアイテムを先頭に移動
    const pinnedItems = commands.filter(c => c.pinned);
    const unpinnedItems = commands.filter(c => !c.pinned);
    historyStore.set('commands', [...pinnedItems, ...unpinnedItems]);
    saveHistory();
  }
}

/**
 * 履歴アイテムを削除
 */
function deleteHistoryItem(index) {
  const commands = historyStore.get('commands');
  if (index >= 0 && index < commands.length) {
    commands.splice(index, 1);
    historyStore.set('commands', [...commands]);
    saveHistory();
  }
}

/**
 * 履歴を読み込み
 */
function loadHistory() {
  const saved = storage.load('history', []);
  historyStore.set('commands', saved);
}

/**
 * 履歴を保存
 */
function saveHistory() {
  storage.save('history', historyStore.get('commands'));
}

/**
 * 履歴をレンダリング
 */
function renderHistory(commands) {
  const list = $('#history-list');
  if (!list) return;

  empty(list);

  // フィルタリング
  let filteredCommands = commands;
  if (historyFilter) {
    filteredCommands = commands.filter(c =>
      c.command.toLowerCase().includes(historyFilter) ||
      (c.toolId && c.toolId.toLowerCase().includes(historyFilter))
    );
  }

  if (filteredCommands.length === 0) {
    list.innerHTML = historyFilter
      ? '<p class="empty-message">検索結果がありません</p>'
      : '<p class="empty-message">履歴はありません</p>';
    return;
  }

  filteredCommands.forEach((entry, index) => {
    // 元の配列でのインデックスを取得
    const originalIndex = commands.indexOf(entry);

    const time = new Date(entry.timestamp).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPinned = entry.pinned;

    const item = createElement('div', {
      className: `history-item ${isPinned ? 'pinned' : ''}`
    }, [
      createElement('div', { className: 'history-item-header' }, [
        createElement('button', {
          className: `history-pin-btn ${isPinned ? 'active' : ''}`,
          dataset: { index: originalIndex },
          title: isPinned ? 'ピン解除' : 'ピン留め'
        }, isPinned ? '📌' : '📍'),
        createElement('span', { className: 'history-time' }, time),
        createElement('button', {
          className: 'history-delete-btn',
          dataset: { index: originalIndex },
          title: '削除'
        }, '×'),
      ]),
      createElement('div', { className: 'history-command' }, entry.command),
      entry.toolId ? createElement('div', { className: 'history-tool' }, entry.toolId) : null,
    ].filter(Boolean));

    list.appendChild(item);
  });
}

export default { initSidePanel, setOutput };
