/**
 * Color Codes Reference - UI
 */

import { $, delegate } from '../../core/dom.js';
import { copyToClipboard } from '../../core/clipboard.js';
import { getInviconUrl } from '../../core/wiki-images.js';

// Minecraftカラーコード
const COLOR_CODES = [
  { code: '0', name: 'black', hex: '#000000', motd: '\\u00A70' },
  { code: '1', name: 'dark_blue', hex: '#0000AA', motd: '\\u00A71' },
  { code: '2', name: 'dark_green', hex: '#00AA00', motd: '\\u00A72' },
  { code: '3', name: 'dark_aqua', hex: '#00AAAA', motd: '\\u00A73' },
  { code: '4', name: 'dark_red', hex: '#AA0000', motd: '\\u00A74' },
  { code: '5', name: 'dark_purple', hex: '#AA00AA', motd: '\\u00A75' },
  { code: '6', name: 'gold', hex: '#FFAA00', motd: '\\u00A76' },
  { code: '7', name: 'gray', hex: '#AAAAAA', motd: '\\u00A77' },
  { code: '8', name: 'dark_gray', hex: '#555555', motd: '\\u00A78' },
  { code: '9', name: 'blue', hex: '#5555FF', motd: '\\u00A79' },
  { code: 'a', name: 'green', hex: '#55FF55', motd: '\\u00A7a' },
  { code: 'b', name: 'aqua', hex: '#55FFFF', motd: '\\u00A7b' },
  { code: 'c', name: 'red', hex: '#FF5555', motd: '\\u00A7c' },
  { code: 'd', name: 'light_purple', hex: '#FF55FF', motd: '\\u00A7d' },
  { code: 'e', name: 'yellow', hex: '#FFFF55', motd: '\\u00A7e' },
  { code: 'f', name: 'white', hex: '#FFFFFF', motd: '\\u00A7f' },
];

// フォーマットコード
const FORMAT_CODES = [
  { code: 'k', name: 'obfuscated', description: '難読化（ランダム文字）', class: 'obfuscated' },
  { code: 'l', name: 'bold', description: '太字', class: 'bold' },
  { code: 'm', name: 'strikethrough', description: '取り消し線', class: 'strikethrough' },
  { code: 'n', name: 'underline', description: '下線', class: 'underline' },
  { code: 'o', name: 'italic', description: '斜体', class: 'italic' },
  { code: 'r', name: 'reset', description: 'リセット', class: '' },
];

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="color-codes-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'red_dye')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
      </div>

      <div class="color-section">
        <h3>カラーコード</h3>
        <p class="section-hint">クリックでコードをコピー</p>
        <div class="color-grid">
          ${COLOR_CODES.map(c => `
            <div class="color-item" data-code="§${c.code}" style="background-color: ${c.hex}">
              <div class="color-info" style="color: ${isLight(c.hex) ? '#000' : '#fff'}">
                <span class="code">§${c.code}</span>
                <span class="name">${c.name}</span>
                <span class="hex">${c.hex}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="format-section">
        <h3>フォーマットコード</h3>
        <div class="format-grid">
          ${FORMAT_CODES.map(f => `
            <div class="format-item" data-code="§${f.code}">
              <span class="code">§${f.code}</span>
              <span class="preview ${f.class}">サンプル</span>
              <span class="description">${f.description}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="usage-section">
        <h3>使用方法</h3>
        <div class="usage-tabs">
          <button class="usage-tab active" data-tab="chat">チャット/看板</button>
          <button class="usage-tab" data-tab="json">JSON Text</button>
          <button class="usage-tab" data-tab="motd">server.properties</button>
        </div>
        <div class="usage-content" id="usage-content">
          <div class="usage-panel active" data-panel="chat">
            <pre>§6金色 §lの太字§r テキスト</pre>
            <p>§ (セクション記号) + コードを使用</p>
          </div>
          <div class="usage-panel" data-panel="json">
            <pre>{"text":"Hello","color":"gold","bold":true}</pre>
            <p>color, bold, italic などのプロパティを使用</p>
          </div>
          <div class="usage-panel" data-panel="motd">
            <pre>motd=\\u00A76Gold \\u00A7lBold\\u00A7r Text</pre>
            <p>\\u00A7 (Unicode) を使用</p>
          </div>
        </div>
      </div>

      <div class="converter-section">
        <h3>コンバーター</h3>
        <div class="form-group">
          <label for="color-input">テキストを入力（§ コード付き）</label>
          <input type="text" id="color-input" class="mc-input" placeholder="§6Gold §lBold">
        </div>
        <div class="converter-outputs">
          <div class="output-item">
            <label>プレビュー</label>
            <div class="preview-box" id="converter-preview"></div>
          </div>
          <div class="output-item">
            <label>JSON Text</label>
            <pre class="output-code" id="converter-json"></pre>
          </div>
          <div class="output-item">
            <label>MOTD形式</label>
            <pre class="output-code" id="converter-motd"></pre>
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
  // カラー/フォーマットコードをクリックでコピー
  delegate(container, 'click', '.color-item, .format-item', async (e, target) => {
    const code = target.dataset.code;
    await copyToClipboard(code);
    showCopied(target);
  });

  // 使用方法タブ
  delegate(container, 'click', '.usage-tab', (e, target) => {
    const tab = target.dataset.tab;
    container.querySelectorAll('.usage-tab').forEach(t => t.classList.remove('active'));
    target.classList.add('active');
    container.querySelectorAll('.usage-panel').forEach(p => {
      p.classList.toggle('active', p.dataset.panel === tab);
    });
  });

  // コンバーター
  $('#color-input', container)?.addEventListener('input', (e) => {
    updateConverter(container, e.target.value);
  });
}

/**
 * コンバーター更新
 */
function updateConverter(container, text) {
  const preview = $('#converter-preview', container);
  const jsonOutput = $('#converter-json', container);
  const motdOutput = $('#converter-motd', container);

  // プレビュー
  if (preview) {
    preview.innerHTML = parseColorCodes(text);
  }

  // JSON Text
  if (jsonOutput) {
    jsonOutput.textContent = toJsonText(text);
  }

  // MOTD
  if (motdOutput) {
    motdOutput.textContent = toMotd(text);
  }
}

/**
 * カラーコードをHTMLに変換
 */
function parseColorCodes(text) {
  let html = '';
  let currentColor = '';
  let styles = [];

  const regex = /§([0-9a-fklmnor])/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      const segment = text.slice(lastIndex, match.index);
      html += `<span style="${buildStyle(currentColor, styles)}">${escapeHtml(segment)}</span>`;
    }

    const code = match[1].toLowerCase();

    if (code === 'r') {
      currentColor = '';
      styles = [];
    } else if ('0123456789abcdef'.includes(code)) {
      const colorInfo = COLOR_CODES.find(c => c.code === code);
      currentColor = colorInfo?.hex || '';
    } else {
      const formatInfo = FORMAT_CODES.find(f => f.code === code);
      if (formatInfo && formatInfo.class) {
        styles.push(formatInfo.class);
      }
    }

    lastIndex = regex.lastIndex;
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    const segment = text.slice(lastIndex);
    html += `<span style="${buildStyle(currentColor, styles)}">${escapeHtml(segment)}</span>`;
  }

  return html || '<span class="placeholder">プレビューがここに表示されます</span>';
}

function buildStyle(color, styles) {
  const parts = [];
  if (color) parts.push(`color: ${color}`);
  if (styles.includes('bold')) parts.push('font-weight: bold');
  if (styles.includes('italic')) parts.push('font-style: italic');
  if (styles.includes('underline')) parts.push('text-decoration: underline');
  if (styles.includes('strikethrough')) parts.push('text-decoration: line-through');
  return parts.join('; ');
}

/**
 * JSON Text形式に変換
 */
function toJsonText(text) {
  // 簡易変換
  const components = [];
  let current = { text: '' };

  const regex = /§([0-9a-fklmnor])/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      current.text = text.slice(lastIndex, match.index);
      if (current.text) components.push({ ...current });
    }

    const code = match[1].toLowerCase();

    if (code === 'r') {
      current = { text: '' };
    } else if ('0123456789abcdef'.includes(code)) {
      const colorInfo = COLOR_CODES.find(c => c.code === code);
      current = { ...current, text: '', color: colorInfo?.name };
    } else {
      const formatMap = { k: 'obfuscated', l: 'bold', m: 'strikethrough', n: 'underlined', o: 'italic' };
      if (formatMap[code]) {
        current = { ...current, text: '', [formatMap[code]]: true };
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    current.text = text.slice(lastIndex);
    if (current.text) components.push(current);
  }

  if (components.length === 0) return '""';
  if (components.length === 1) return JSON.stringify(components[0]);
  return JSON.stringify(components);
}

/**
 * MOTD形式に変換
 */
function toMotd(text) {
  return text.replace(/§/g, '\\u00A7');
}

function showCopied(el) {
  el.classList.add('copied');
  setTimeout(() => el.classList.remove('copied'), 1000);
}

function escapeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .color-section, .format-section, .usage-section, .converter-section {
    margin-bottom: var(--mc-space-lg);
  }

  .section-hint {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-sm);
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--mc-space-xs);
  }

  .color-item {
    padding: var(--mc-space-md);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    border: 2px solid transparent;
  }

  .color-item:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .color-item.copied {
    border-color: var(--mc-color-grass-main);
  }

  .color-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.75rem;
  }

  .color-info .code {
    font-weight: bold;
    font-family: var(--mc-font-mono);
  }

  .format-grid {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
  }

  .format-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .format-item:hover {
    background-color: var(--mc-bg-panel);
  }

  .format-item.copied {
    border-color: var(--mc-color-grass-main);
  }

  .format-item .code {
    font-family: var(--mc-font-mono);
    font-weight: bold;
    width: 40px;
  }

  .format-item .preview {
    width: 80px;
  }

  .format-item .preview.bold { font-weight: bold; }
  .format-item .preview.italic { font-style: italic; }
  .format-item .preview.underline { text-decoration: underline; }
  .format-item .preview.strikethrough { text-decoration: line-through; }
  .format-item .preview.obfuscated { animation: obf 0.1s infinite; }

  @keyframes obf {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .usage-tabs {
    display: flex;
    gap: var(--mc-space-xs);
    margin-bottom: var(--mc-space-sm);
  }

  .usage-tab {
    padding: var(--mc-space-sm) var(--mc-space-md);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.8rem;
  }

  .usage-tab.active {
    background-color: var(--mc-color-grass-main);
    color: white;
  }

  .usage-panel {
    display: none;
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
  }

  .usage-panel.active {
    display: block;
  }

  .usage-panel pre {
    background-color: var(--mc-color-obsidian);
    color: var(--mc-color-stone-200);
    padding: var(--mc-space-sm);
    margin: 0 0 var(--mc-space-sm) 0;
    font-family: var(--mc-font-mono);
    font-size: 0.8rem;
  }

  .converter-outputs {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-md);
  }

  .output-item label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-xs);
  }

  .preview-box {
    background-color: var(--mc-color-obsidian);
    color: white;
    padding: var(--mc-space-md);
    min-height: 40px;
    font-family: var(--mc-font-mono);
  }

  .output-code {
    background-color: var(--mc-bg-panel);
    padding: var(--mc-space-sm);
    margin: 0;
    font-family: var(--mc-font-mono);
    font-size: 0.75rem;
    overflow-x: auto;
  }

  .placeholder {
    color: var(--mc-text-muted);
    font-style: italic;
  }
`;
document.head.appendChild(style);

export default { render, init };
