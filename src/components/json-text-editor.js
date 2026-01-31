/**
 * JSON Text Editor Component
 * Minecraft JSON Text Component の編集UI
 * tellraw, title, sign, book で共通使用
 */

import { $, $$, createElement, delegate } from '../core/dom.js';

// Minecraft カラーコード
export const MC_COLORS = {
  black: '#000000',
  dark_blue: '#0000AA',
  dark_green: '#00AA00',
  dark_aqua: '#00AAAA',
  dark_red: '#AA0000',
  dark_purple: '#AA00AA',
  gold: '#FFAA00',
  gray: '#AAAAAA',
  dark_gray: '#555555',
  blue: '#5555FF',
  green: '#55FF55',
  aqua: '#55FFFF',
  red: '#FF5555',
  light_purple: '#FF55FF',
  yellow: '#FFFF55',
  white: '#FFFFFF',
};

// クリックイベントアクション
export const CLICK_ACTIONS = [
  { value: '', label: '-- なし --' },
  { value: 'open_url', label: 'URLを開く' },
  { value: 'run_command', label: 'コマンドを実行' },
  { value: 'suggest_command', label: 'コマンドを提案' },
  { value: 'copy_to_clipboard', label: 'クリップボードにコピー' },
];

// ホバーイベントアクション
export const HOVER_ACTIONS = [
  { value: '', label: '-- なし --' },
  { value: 'show_text', label: 'テキストを表示' },
  { value: 'show_item', label: 'アイテムを表示' },
  { value: 'show_entity', label: 'エンティティを表示' },
];

/**
 * JSON Text Component のデフォルト値
 */
export function createDefaultComponent() {
  return {
    text: '',
    color: '',
    bold: false,
    italic: false,
    underlined: false,
    strikethrough: false,
    obfuscated: false,
    clickEvent: null,
    hoverEvent: null,
  };
}

/**
 * JSON Text Editor UI をレンダリング
 * @param {string} id - エディタのID
 * @param {Object} options - オプション
 */
export function renderJsonTextEditor(id, options = {}) {
  const {
    placeholder = 'テキストを入力...',
    showClickEvent = true,
    showHoverEvent = true,
    multiline = false,
  } = options;

  const colorOptions = Object.entries(MC_COLORS)
    .map(([name, hex]) => `<option value="${name}" style="color:${hex}">${name}</option>`)
    .join('');

  const clickEventOptions = CLICK_ACTIONS
    .map(a => `<option value="${a.value}">${a.label}</option>`)
    .join('');

  const hoverEventOptions = HOVER_ACTIONS
    .map(a => `<option value="${a.value}">${a.label}</option>`)
    .join('');

  return `
    <div class="json-text-editor" id="${id}">
      <div class="jte-toolbar">
        <select class="jte-color mc-select" title="色">
          <option value="">デフォルト</option>
          ${colorOptions}
        </select>
        <button type="button" class="jte-btn jte-bold" data-style="bold" title="太字 (Bold)">B</button>
        <button type="button" class="jte-btn jte-italic" data-style="italic" title="斜体 (Italic)">I</button>
        <button type="button" class="jte-btn jte-underline" data-style="underlined" title="下線 (Underlined)">U</button>
        <button type="button" class="jte-btn jte-strike" data-style="strikethrough" title="取り消し線 (Strikethrough)">S</button>
        <button type="button" class="jte-btn jte-obf" data-style="obfuscated" title="難読化 (Obfuscated)">?</button>
        <button type="button" class="jte-btn jte-add-segment" title="テキスト追加">+ セグメント</button>
      </div>

      <div class="jte-segments" id="${id}-segments">
        <!-- セグメントはJSで動的生成 -->
      </div>

      ${showClickEvent ? `
      <div class="jte-events">
        <div class="jte-event-group">
          <label>クリックイベント</label>
          <select class="jte-click-action mc-select">
            ${clickEventOptions}
          </select>
          <input type="text" class="jte-click-value mc-input" placeholder="値 (URL/コマンド)" style="display:none">
        </div>
        ${showHoverEvent ? `
        <div class="jte-event-group">
          <label>ホバーイベント</label>
          <select class="jte-hover-action mc-select">
            ${hoverEventOptions}
          </select>
          <input type="text" class="jte-hover-value mc-input" placeholder="値" style="display:none">
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div class="jte-preview">
        <label>プレビュー</label>
        <div class="jte-preview-box" id="${id}-preview">
          <span class="preview-placeholder">テキストを入力するとプレビューが表示されます</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * セグメント（テキスト部品）を追加
 */
export function addSegment(editorId, initialData = null) {
  const container = $(`#${editorId}-segments`);
  const data = initialData || createDefaultComponent();
  const segmentId = `${editorId}-seg-${Date.now()}`;

  const colorOptions = Object.entries(MC_COLORS)
    .map(([name, hex]) => `<option value="${name}" ${data.color === name ? 'selected' : ''} style="color:${hex}">${name}</option>`)
    .join('');

  const segment = createElement('div', { className: 'jte-segment', dataset: { segmentId } });
  segment.innerHTML = `
    <input type="text" class="jte-text mc-input" value="${escapeHtml(data.text)}" placeholder="テキスト">
    <select class="jte-seg-color mc-select" title="色">
      <option value="" ${!data.color ? 'selected' : ''}>継承</option>
      ${colorOptions}
    </select>
    <div class="jte-seg-styles">
      <button type="button" class="jte-btn ${data.bold ? 'active' : ''}" data-style="bold" title="太字">B</button>
      <button type="button" class="jte-btn ${data.italic ? 'active' : ''}" data-style="italic" title="斜体">I</button>
      <button type="button" class="jte-btn ${data.underlined ? 'active' : ''}" data-style="underlined" title="下線">U</button>
      <button type="button" class="jte-btn ${data.strikethrough ? 'active' : ''}" data-style="strikethrough" title="取消線">S</button>
      <button type="button" class="jte-btn ${data.obfuscated ? 'active' : ''}" data-style="obfuscated" title="難読化">?</button>
    </div>
    <button type="button" class="jte-remove-segment" title="削除">×</button>
  `;

  container.appendChild(segment);
  return segment;
}

/**
 * エディタを初期化
 */
export function initJsonTextEditor(editorId, onChange) {
  const editor = $(`#${editorId}`);
  if (!editor) return;

  // 初期セグメントを追加
  addSegment(editorId);

  // セグメント追加ボタン
  delegate(editor, 'click', '.jte-add-segment', () => {
    addSegment(editorId);
    triggerChange();
  });

  // セグメント削除
  delegate(editor, 'click', '.jte-remove-segment', (e, target) => {
    const segment = target.closest('.jte-segment');
    const segments = $$('.jte-segment', editor);
    if (segments.length > 1) {
      segment.remove();
      triggerChange();
    }
  });

  // スタイルトグル
  delegate(editor, 'click', '.jte-seg-styles .jte-btn', (e, target) => {
    target.classList.toggle('active');
    triggerChange();
  });

  // テキスト・色変更
  delegate(editor, 'input', '.jte-text, .jte-seg-color', () => {
    triggerChange();
  });
  delegate(editor, 'change', '.jte-seg-color', () => {
    triggerChange();
  });

  // クリック/ホバーイベント
  delegate(editor, 'change', '.jte-click-action', (e, target) => {
    const valueInput = editor.querySelector('.jte-click-value');
    valueInput.style.display = target.value ? 'block' : 'none';
    triggerChange();
  });
  delegate(editor, 'change', '.jte-hover-action', (e, target) => {
    const valueInput = editor.querySelector('.jte-hover-value');
    valueInput.style.display = target.value ? 'block' : 'none';
    triggerChange();
  });
  delegate(editor, 'input', '.jte-click-value, .jte-hover-value', () => {
    triggerChange();
  });

  function triggerChange() {
    const data = getEditorData(editorId);
    updatePreview(editorId, data);
    if (onChange) onChange(data);
  }

  // 初期プレビュー
  triggerChange();

  return {
    getData: () => getEditorData(editorId),
    setData: (data) => setEditorData(editorId, data),
  };
}

/**
 * エディタからデータを取得
 */
export function getEditorData(editorId) {
  const editor = $(`#${editorId}`);
  if (!editor) return [];

  const segments = $$('.jte-segment', editor);
  const components = segments.map(seg => {
    const component = {
      text: seg.querySelector('.jte-text').value,
    };

    const color = seg.querySelector('.jte-seg-color').value;
    if (color) component.color = color;

    const styles = seg.querySelectorAll('.jte-seg-styles .jte-btn.active');
    styles.forEach(btn => {
      component[btn.dataset.style] = true;
    });

    return component;
  }).filter(c => c.text); // 空のテキストは除外

  // クリックイベント
  const clickAction = editor.querySelector('.jte-click-action')?.value;
  const clickValue = editor.querySelector('.jte-click-value')?.value;
  if (clickAction && clickValue && components.length > 0) {
    components[0].clickEvent = {
      action: clickAction,
      value: clickValue,
    };
  }

  // ホバーイベント
  const hoverAction = editor.querySelector('.jte-hover-action')?.value;
  const hoverValue = editor.querySelector('.jte-hover-value')?.value;
  if (hoverAction && hoverValue && components.length > 0) {
    components[0].hoverEvent = {
      action: hoverAction,
      contents: hoverAction === 'show_text' ? { text: hoverValue } : hoverValue,
    };
  }

  return components;
}

/**
 * エディタにデータをセット
 */
export function setEditorData(editorId, components) {
  const container = $(`#${editorId}-segments`);
  if (!container) return;

  // 既存のセグメントをクリア
  container.innerHTML = '';

  // コンポーネントからセグメントを作成
  if (Array.isArray(components) && components.length > 0) {
    components.forEach(comp => addSegment(editorId, comp));
  } else {
    addSegment(editorId);
  }
}

/**
 * プレビューを更新
 */
export function updatePreview(editorId, components) {
  const preview = $(`#${editorId}-preview`);
  if (!preview) return;

  if (!components || components.length === 0) {
    preview.innerHTML = '<span class="preview-placeholder">テキストを入力するとプレビューが表示されます</span>';
    stopObfuscatedAnimation(editorId);
    return;
  }

  preview.innerHTML = components.map((comp, index) => {
    const classes = ['mc-text-segment'];

    // 色クラス
    if (comp.color) {
      classes.push(`mc-color-${comp.color.replace('_', '-')}`);
    } else {
      classes.push('mc-color-white');
    }

    // スタイルクラス
    if (comp.bold) classes.push('mc-bold');
    if (comp.italic) classes.push('mc-italic');
    if (comp.underlined) classes.push('mc-underlined');
    if (comp.strikethrough) classes.push('mc-strikethrough');

    // クリック/ホバーイベント表示
    let eventIndicators = '';
    if (comp.clickEvent) {
      classes.push('mc-clickable');
      eventIndicators += `<span class="mc-event-indicator mc-click-indicator" title="クリック: ${comp.clickEvent.action}">⚡</span>`;
    }
    if (comp.hoverEvent) {
      classes.push('mc-hoverable');
      eventIndicators += `<span class="mc-event-indicator mc-hover-indicator" title="ホバー: ${comp.hoverEvent.action}">💬</span>`;
    }

    // 難読化テキスト
    if (comp.obfuscated) {
      classes.push('mc-obfuscated');
      return `<span class="${classes.join(' ')}" data-text="${escapeHtml(comp.text)}" data-index="${index}">${escapeHtml(comp.text)}</span>${eventIndicators}`;
    }

    return `<span class="${classes.join(' ')}">${escapeHtml(comp.text)}</span>${eventIndicators}`;
  }).join('');

  // 難読化アニメーション開始
  startObfuscatedAnimation(editorId);
}

// 難読化アニメーション管理
const obfuscatedIntervals = new Map();
const OBFUSCATED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

function startObfuscatedAnimation(editorId) {
  stopObfuscatedAnimation(editorId);

  const preview = $(`#${editorId}-preview`);
  if (!preview) return;

  const obfuscatedElements = preview.querySelectorAll('.mc-obfuscated');
  if (obfuscatedElements.length === 0) return;

  const intervalId = setInterval(() => {
    obfuscatedElements.forEach(el => {
      const originalText = el.dataset.text || '';
      let newText = '';
      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === ' ') {
          newText += ' ';
        } else {
          newText += OBFUSCATED_CHARS[Math.floor(Math.random() * OBFUSCATED_CHARS.length)];
        }
      }
      el.textContent = newText;
    });
  }, 50);

  obfuscatedIntervals.set(editorId, intervalId);
}

function stopObfuscatedAnimation(editorId) {
  const intervalId = obfuscatedIntervals.get(editorId);
  if (intervalId) {
    clearInterval(intervalId);
    obfuscatedIntervals.delete(editorId);
  }
}

/**
 * JSON Text ComponentをJSON/SNBT文字列に変換
 * @param {Array} components - コンポーネント配列
 * @param {Object} options - オプション
 * @param {string} options.version - 出力バージョン ('1.21.5+', '1.20+', '1.16+', '1.13+', '1.12-')
 * @param {boolean} options.arrayFormat - 配列形式で出力
 */
export function componentsToJson(components, options = {}) {
  const { version = '1.21.5+', arrayFormat = false } = options;

  if (!components || components.length === 0) {
    return '""';
  }

  // 単一のテキストのみの場合はシンプルな形式
  if (components.length === 1 && !components[0].color && !hasStyles(components[0])) {
    // 1.21.5+ではSNBT形式で文字列を出力
    if (version === '1.21.5+') {
      return `"${escapeSnbtString(components[0].text)}"`;
    }
    return JSON.stringify(components[0].text);
  }

  // バージョン判定
  const isNewFormat = version === '1.21.5+';

  // 1.21.5+の場合はSNBT形式で出力
  if (isNewFormat) {
    return componentsToSNBT(components, { arrayFormat });
  }

  // 1.20以前はJSON形式で出力
  const result = components.map(comp => {
    const obj = { text: comp.text };

    // 色（1.12でも使用可能）
    if (comp.color) obj.color = comp.color;

    // スタイル（1.12でも使用可能）
    if (comp.bold) obj.bold = true;
    if (comp.italic) obj.italic = true;
    if (comp.underlined) obj.underlined = true;
    if (comp.strikethrough) obj.strikethrough = true;
    if (comp.obfuscated) obj.obfuscated = true;

    // クリックイベント（キャメルケース）
    if (comp.clickEvent) {
      obj.clickEvent = comp.clickEvent;
    }

    // ホバーイベント（キャメルケース）
    if (comp.hoverEvent) {
      obj.hoverEvent = comp.hoverEvent;
    }

    return obj;
  });

  // 配列形式（最初の要素が空文字列でextraとして追加するパターン）
  if (arrayFormat) {
    return JSON.stringify(['', ...result]);
  }

  // 単一オブジェクトまたは配列
  if (result.length === 1) {
    return JSON.stringify(result[0]);
  }

  return JSON.stringify(result);
}

/**
 * コンポーネントをSNBT形式に変換（1.21.5+向け）
 * SNBT形式: {text:"...",color:"red",bold:true}（引用符なしキー）
 */
function componentsToSNBT(components, options = {}) {
  const { arrayFormat = false } = options;

  const snbtComponents = components.map(comp => componentToSNBT(comp));

  if (arrayFormat) {
    return `["",${snbtComponents.join(',')}]`;
  }

  if (snbtComponents.length === 1) {
    return snbtComponents[0];
  }

  return `[${snbtComponents.join(',')}]`;
}

/**
 * 単一コンポーネントをSNBT形式に変換
 */
function componentToSNBT(comp) {
  const parts = [];

  // text（必須）
  parts.push(`text:"${escapeSnbtString(comp.text)}"`);

  // 色
  if (comp.color) {
    parts.push(`color:"${comp.color}"`);
  }

  // 書式
  if (comp.bold) parts.push('bold:true');
  if (comp.italic) parts.push('italic:true');
  if (comp.underlined) parts.push('underlined:true');
  if (comp.strikethrough) parts.push('strikethrough:true');
  if (comp.obfuscated) parts.push('obfuscated:true');

  // クリックイベント（1.21.5+形式: snake_case）
  if (comp.clickEvent) {
    const clickEvent = convertClickEventToNewFormat(comp.clickEvent);
    parts.push(`click_event:${objectToSNBT(clickEvent)}`);
  }

  // ホバーイベント（1.21.5+形式: snake_case）
  if (comp.hoverEvent) {
    const hoverEvent = convertHoverEventToNewFormat(comp.hoverEvent);
    parts.push(`hover_event:${objectToSNBT(hoverEvent)}`);
  }

  return `{${parts.join(',')}}`;
}

/**
 * JavaScriptオブジェクトをSNBT形式に変換
 */
function objectToSNBT(obj) {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'string') return `"${escapeSnbtString(obj)}"`;

  if (Array.isArray(obj)) {
    return `[${obj.map(item => objectToSNBT(item)).join(',')}]`;
  }

  if (typeof obj === 'object') {
    const parts = Object.entries(obj).map(([key, value]) => {
      return `${key}:${objectToSNBT(value)}`;
    });
    return `{${parts.join(',')}}`;
  }

  return String(obj);
}

/**
 * SNBT用文字列エスケープ
 */
function escapeSnbtString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * clickEventを1.21.5+の新形式に変換
 * 旧: { action: "run_command", value: "/say hello" }
 * 新: { action: "run_command", command: "say hello" }
 */
function convertClickEventToNewFormat(clickEvent) {
  const { action, value } = clickEvent;
  const newEvent = { action };

  switch (action) {
    case 'open_url':
      newEvent.url = value;
      break;
    case 'run_command':
      // 1.21.5+ではスラッシュ不要
      newEvent.command = value.startsWith('/') ? value.slice(1) : value;
      break;
    case 'suggest_command':
      newEvent.command = value;
      break;
    case 'copy_to_clipboard':
      newEvent.contents = value;
      break;
    case 'change_page':
      newEvent.page = parseInt(value) || 1;
      break;
    default:
      newEvent.value = value;
  }

  return newEvent;
}

/**
 * hoverEventを1.21.5+の新形式に変換
 * 旧: { action: "show_text", contents: { text: "Hello" } }
 * 新: { action: "show_text", value: { text: "Hello" } }
 */
function convertHoverEventToNewFormat(hoverEvent) {
  const { action, contents } = hoverEvent;
  const newEvent = { action };

  switch (action) {
    case 'show_text':
      // 1.21.5+では value フィールドを使用
      newEvent.value = contents;
      break;
    case 'show_item':
      // アイテム情報をインライン化
      if (typeof contents === 'object') {
        Object.assign(newEvent, contents);
      } else {
        newEvent.id = contents;
      }
      break;
    case 'show_entity':
      // エンティティ情報をインライン化、フィールド名変更
      if (typeof contents === 'object') {
        newEvent.id = contents.type || contents.id;
        newEvent.uuid = contents.id || contents.uuid;
        if (contents.name) newEvent.name = contents.name;
      }
      break;
    default:
      newEvent.contents = contents;
  }

  return newEvent;
}

function hasStyles(comp) {
  return comp.bold || comp.italic || comp.underlined || comp.strikethrough || comp.obfuscated || comp.clickEvent || comp.hoverEvent;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .json-text-editor {
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    padding: var(--mc-space-md);
  }

  .jte-toolbar {
    display: flex;
    gap: var(--mc-space-xs);
    margin-bottom: var(--mc-space-md);
    flex-wrap: wrap;
    align-items: center;
  }

  .jte-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.15s;
  }

  .jte-btn:hover {
    background-color: var(--mc-color-stone-300);
  }

  .jte-btn.active {
    background-color: var(--mc-color-grass-main);
    color: white;
  }

  .jte-bold { font-weight: bold; }
  .jte-italic { font-style: italic; }
  .jte-underline { text-decoration: underline; }
  .jte-strike { text-decoration: line-through; }
  .jte-obf { font-family: var(--mc-font-mono); }

  .jte-add-segment {
    width: auto;
    padding: 0 var(--mc-space-sm);
    font-size: 0.75rem;
  }

  .jte-segments {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-md);
  }

  .jte-segment {
    display: flex;
    gap: var(--mc-space-xs);
    align-items: center;
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .jte-segment .jte-text {
    flex: 1;
    min-width: 150px;
  }

  .jte-segment .jte-seg-color {
    width: 100px;
  }

  .jte-seg-styles {
    display: flex;
    gap: 2px;
  }

  .jte-seg-styles .jte-btn {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }

  .jte-remove-segment {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.25rem;
  }

  .jte-events {
    display: flex;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .jte-event-group {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
    flex: 1;
    min-width: 200px;
  }

  .jte-event-group label {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .jte-preview {
    margin-top: var(--mc-space-md);
  }

  .jte-preview label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-xs);
  }

  .jte-preview-box {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: var(--mc-space-md);
    min-height: 40px;
    font-family: 'Minecraft', 'Courier New', monospace;
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: none;
    image-rendering: pixelated;
  }

  .jte-preview-box .preview-placeholder {
    color: var(--mc-text-muted);
    font-style: italic;
  }

  /* Minecraft カラークラス */
  .mc-text-segment { display: inline; }
  .mc-color-black { color: #000000; text-shadow: 1px 1px 0 #000000; }
  .mc-color-dark-blue { color: #0000AA; text-shadow: 1px 1px 0 #00002A; }
  .mc-color-dark-green { color: #00AA00; text-shadow: 1px 1px 0 #002A00; }
  .mc-color-dark-aqua { color: #00AAAA; text-shadow: 1px 1px 0 #002A2A; }
  .mc-color-dark-red { color: #AA0000; text-shadow: 1px 1px 0 #2A0000; }
  .mc-color-dark-purple { color: #AA00AA; text-shadow: 1px 1px 0 #2A002A; }
  .mc-color-gold { color: #FFAA00; text-shadow: 1px 1px 0 #2A2A00; }
  .mc-color-gray { color: #AAAAAA; text-shadow: 1px 1px 0 #2A2A2A; }
  .mc-color-dark-gray { color: #555555; text-shadow: 1px 1px 0 #151515; }
  .mc-color-blue { color: #5555FF; text-shadow: 1px 1px 0 #15153F; }
  .mc-color-green { color: #55FF55; text-shadow: 1px 1px 0 #153F15; }
  .mc-color-aqua { color: #55FFFF; text-shadow: 1px 1px 0 #153F3F; }
  .mc-color-red { color: #FF5555; text-shadow: 1px 1px 0 #3F1515; }
  .mc-color-light-purple { color: #FF55FF; text-shadow: 1px 1px 0 #3F153F; }
  .mc-color-yellow { color: #FFFF55; text-shadow: 1px 1px 0 #3F3F15; }
  .mc-color-white { color: #FFFFFF; text-shadow: 1px 1px 0 #3F3F3F; }

  /* Minecraft スタイルクラス */
  .mc-bold { font-weight: bold; text-shadow: 2px 1px 0 currentColor, 1px 1px 0 rgba(0,0,0,0.5) !important; }
  .mc-italic { font-style: italic; }
  .mc-underlined { text-decoration: underline; }
  .mc-strikethrough { text-decoration: line-through; }
  .mc-obfuscated { font-family: 'Minecraft', monospace; }

  /* イベントインジケーター */
  .mc-clickable { cursor: pointer; }
  .mc-clickable:hover { text-decoration: underline; }
  .mc-event-indicator {
    font-size: 0.7em;
    vertical-align: super;
    margin-left: 2px;
    opacity: 0.7;
  }
`;
document.head.appendChild(style);

export default {
  renderJsonTextEditor,
  initJsonTextEditor,
  addSegment,
  getEditorData,
  setEditorData,
  componentsToJson,
  MC_COLORS,
  CLICK_ACTIONS,
  HOVER_ACTIONS,
};
