/**
 * Side Panel Manager - サイドパネル管理
 */

import { $, $$, delegate, empty, createElement } from '../core/dom.js';
import { historyStore } from '../core/store.js';
import storage from '../core/storage.js';
import { copyToClipboard, showCopyFeedback } from '../core/clipboard.js';
import { copyShareUrl } from '../core/share.js';

let currentCommand = '';
let currentToolId = '';
let currentState = null;

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

  // 履歴アイテムクリック
  delegate($('#history-list'), 'click', '.history-item', (e, target) => {
    const command = target.querySelector('.command').textContent;
    setOutput(command);
    copyToClipboard(command);
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
  };

  // 重複チェック
  const exists = commands.some(c => c.command === currentCommand);
  if (!exists) {
    const newCommands = [newEntry, ...commands].slice(0, maxItems);
    historyStore.set('commands', newCommands);
    saveHistory();
  }

  showCopyFeedback($('#save-btn'), '💾 保存');
}

/**
 * 履歴をクリア
 */
function clearHistory() {
  historyStore.set('commands', []);
  saveHistory();
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

  if (commands.length === 0) {
    list.innerHTML = '<p class="empty-message">履歴はありません</p>';
    return;
  }

  commands.forEach(entry => {
    const time = new Date(entry.timestamp).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const item = createElement('div', { className: 'history-item' }, [
      createElement('div', { className: 'command' }, entry.command),
      createElement('div', { className: 'time' }, time),
    ]);

    list.appendChild(item);
  });
}

export default { initSidePanel, setOutput };
