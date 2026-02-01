/**
 * JSON Text Generator - UI
 * Minecraft JSON Text Component 生成ツール
 * summonデザイン統一（青系グラデーション）
 */

import { $, $$, createElement, debounce, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { workspaceStore } from '../../core/store.js';
import {
  MC_COLORS,
  CLICK_ACTIONS,
  HOVER_ACTIONS,
  SELECTORS,
  OUTPUT_FORMATS,
  createDefaultSegment,
  generateCommand,
  getColorHex,
} from './engine.js';

// フォーム状態
let formState = {
  segments: [createDefaultSegment()],
  outputFormat: 'tellraw',
  selector: '@a',
};

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel json-text-tool mc-themed" id="json-text-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl('enchanted_book')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>JSONテキストジェネレーター</h2>
            <p class="header-subtitle">リッチなチャットメッセージを作成</p>
          </div>
        </div>
        <span class="version-badge" id="json-text-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="json-text-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="json-text-version-note"></p>

      <form class="tool-form mc-form" id="json-text-form">

        <!-- ステップ1: 出力形式選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>出力形式</h3>
          </div>

          <div class="jt-format-selector">
            <div class="format-tabs" id="format-tabs">
              ${OUTPUT_FORMATS.map(f => `
                <button type="button" class="format-tab ${f.id === 'tellraw' ? 'active' : ''}"
                        data-format="${f.id}">
                  ${f.name}
                </button>
              `).join('')}
            </div>

            <div class="selector-row">
              <label>ターゲット:</label>
              <div class="selector-buttons" id="selector-buttons">
                ${SELECTORS.map(s => `
                  <button type="button" class="selector-btn ${s.id === '@a' ? 'active' : ''}"
                          data-selector="${s.id}" title="${s.desc}">
                    ${s.id}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- ステップ2: テキストセグメント -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>テキスト入力</h3>
          </div>

          <div class="jt-segments-container" id="segments-container">
            <!-- セグメントはJSで動的生成 -->
          </div>

          <button type="button" class="jt-add-segment-btn" id="add-segment-btn">
            <span class="btn-icon">+</span>
            テキストセグメントを追加
          </button>
        </section>

        <!-- ステップ3: プレビュー -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>プレビュー</h3>
          </div>

          <div class="jt-preview-container">
            <div class="jt-preview-box" id="preview-box">
              <span class="preview-placeholder">テキストを入力するとプレビューが表示されます</span>
            </div>
            <p class="preview-hint">※ 難読化テキストはアニメーション表示されます</p>
          </div>
        </section>

      </form>
    </div>
  `;
}

/**
 * セグメントHTMLを生成
 */
function renderSegment(segment, index) {
  const colorOptions = MC_COLORS.map(c => `
    <option value="${c.id}" ${segment.color === c.id ? 'selected' : ''}>
      ${c.name}
    </option>
  `).join('');

  const clickOptions = CLICK_ACTIONS.map(a => `
    <option value="${a.id}" ${segment.clickAction === a.id ? 'selected' : ''}>
      ${a.name}
    </option>
  `).join('');

  const hoverOptions = HOVER_ACTIONS.map(a => `
    <option value="${a.id}" ${segment.hoverAction === a.id ? 'selected' : ''}>
      ${a.name}
    </option>
  `).join('');

  const selectorOptions = SELECTORS.map(s => `
    <option value="${s.id}" ${segment.selector === s.id ? 'selected' : ''}>
      ${s.id} - ${s.desc}
    </option>
  `).join('');

  const clickPlaceholder = CLICK_ACTIONS.find(a => a.id === segment.clickAction)?.placeholder || '';
  const hoverPlaceholder = HOVER_ACTIONS.find(a => a.id === segment.hoverAction)?.placeholder || '';

  return `
    <div class="jt-segment" data-segment-id="${segment.id}" data-index="${index}">
      <div class="segment-header">
        <span class="segment-number">#${index + 1}</span>
        <div class="segment-type-toggle">
          <button type="button" class="type-btn ${segment.type === 'text' ? 'active' : ''}" data-type="text">
            テキスト
          </button>
          <button type="button" class="type-btn ${segment.type === 'selector' ? 'active' : ''}" data-type="selector">
            セレクター
          </button>
        </div>
        <button type="button" class="segment-remove-btn" title="削除">×</button>
      </div>

      <div class="segment-body">
        <!-- テキスト入力 or セレクター選択 -->
        <div class="segment-input-row">
          ${segment.type === 'text' ? `
            <input type="text" class="jt-input segment-text"
                   value="${escapeHtml(segment.text)}"
                   placeholder="テキストを入力...">
          ` : `
            <select class="jt-select segment-selector">
              ${selectorOptions}
            </select>
          `}
        </div>

        <!-- カラーパレット -->
        <div class="segment-color-row">
          <label>色:</label>
          <div class="color-palette">
            <button type="button" class="color-swatch ${!segment.color ? 'active' : ''}"
                    data-color="" title="デフォルト" style="background: linear-gradient(135deg, #888 50%, #444 50%);">
            </button>
            ${MC_COLORS.map(c => `
              <button type="button" class="color-swatch ${segment.color === c.id ? 'active' : ''}"
                      data-color="${c.id}" title="${c.name}" style="background-color: ${c.hex};">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- スタイルボタン -->
        <div class="segment-style-row">
          <label>スタイル:</label>
          <div class="style-buttons">
            <button type="button" class="style-btn ${segment.bold ? 'active' : ''}"
                    data-style="bold" title="太字">
              <strong>B</strong>
            </button>
            <button type="button" class="style-btn ${segment.italic ? 'active' : ''}"
                    data-style="italic" title="斜体">
              <em>I</em>
            </button>
            <button type="button" class="style-btn ${segment.underlined ? 'active' : ''}"
                    data-style="underlined" title="下線">
              <u>U</u>
            </button>
            <button type="button" class="style-btn ${segment.strikethrough ? 'active' : ''}"
                    data-style="strikethrough" title="取り消し線">
              <s>S</s>
            </button>
            <button type="button" class="style-btn obfuscated-btn ${segment.obfuscated ? 'active' : ''}"
                    data-style="obfuscated" title="難読化">
              <span>?!</span>
            </button>
          </div>
        </div>

        <!-- イベント設定（折りたたみ） -->
        <details class="segment-events">
          <summary>クリック/ホバーイベント</summary>
          <div class="events-content">
            <div class="event-row">
              <label>クリック:</label>
              <select class="jt-select click-action">
                ${clickOptions}
              </select>
              <input type="text" class="jt-input click-value"
                     value="${escapeHtml(segment.clickValue)}"
                     placeholder="${clickPlaceholder}"
                     style="display: ${segment.clickAction ? 'block' : 'none'}">
            </div>
            <div class="event-row">
              <label>ホバー:</label>
              <select class="jt-select hover-action">
                ${hoverOptions}
              </select>
              <input type="text" class="jt-input hover-value"
                     value="${escapeHtml(segment.hoverValue)}"
                     placeholder="${hoverPlaceholder}"
                     style="display: ${segment.hoverAction ? 'block' : 'none'}">
            </div>
          </div>
        </details>
      </div>
    </div>
  `;
}

/**
 * 全セグメントをレンダリング
 */
function renderAllSegments(container) {
  container.innerHTML = formState.segments.map((seg, i) => renderSegment(seg, i)).join('');
}

/**
 * プレビューを更新
 */
function updatePreview(container) {
  const previewBox = $('#preview-box', container);
  if (!previewBox) return;

  const validSegments = formState.segments.filter(s =>
    (s.type === 'text' && s.text) || s.type === 'selector'
  );

  if (validSegments.length === 0) {
    previewBox.innerHTML = '<span class="preview-placeholder">テキストを入力するとプレビューが表示されます</span>';
    return;
  }

  previewBox.innerHTML = validSegments.map(seg => {
    let text = seg.type === 'selector' ? seg.selector : seg.text;
    let style = '';
    let classes = [];

    // 色
    if (seg.color) {
      style += `color: ${getColorHex(seg.color)};`;
    }

    // スタイル
    if (seg.bold) style += 'font-weight: bold;';
    if (seg.italic) style += 'font-style: italic;';
    if (seg.underlined) classes.push('preview-underlined');
    if (seg.strikethrough) classes.push('preview-strikethrough');
    if (seg.obfuscated) classes.push('mc-obfuscated');

    const classAttr = classes.length > 0 ? `class="${classes.join(' ')}"` : '';

    return `<span ${classAttr} style="${style}">${escapeHtml(text)}</span>`;
  }).join('');
}

/**
 * コマンドを更新
 */
function updateCommand(container) {
  const version = workspaceStore.get('version') || '1.21';
  const command = generateCommand(
    formState.segments,
    formState.outputFormat,
    formState.selector,
    version
  );
  setOutput(command, 'json-text', { ...formState, version });
  updatePreview(container);
}

/**
 * 初期化
 */
export function init(container) {
  const segmentsContainer = $('#segments-container', container);

  // 初期セグメントをレンダリング
  renderAllSegments(segmentsContainer);

  // 出力形式切り替え
  delegate(container, 'click', '.format-tab', (e, target) => {
    const format = target.dataset.format;
    formState.outputFormat = format;

    $$('.format-tab', container).forEach(t => t.classList.remove('active'));
    target.classList.add('active');

    // Raw JSON の場合はセレクター非表示
    const selectorRow = $('.selector-row', container);
    if (selectorRow) {
      selectorRow.style.display = format === 'raw' ? 'none' : 'flex';
    }

    updateCommand(container);
  });

  // セレクター切り替え
  delegate(container, 'click', '.selector-btn', (e, target) => {
    const selector = target.dataset.selector;
    formState.selector = selector;

    $$('.selector-btn', container).forEach(b => b.classList.remove('active'));
    target.classList.add('active');

    updateCommand(container);
  });

  // セグメント追加
  $('#add-segment-btn', container)?.addEventListener('click', () => {
    formState.segments.push(createDefaultSegment());
    renderAllSegments(segmentsContainer);
    updateCommand(container);
  });

  // セグメント削除
  delegate(segmentsContainer, 'click', '.segment-remove-btn', (e, target) => {
    if (formState.segments.length <= 1) return;

    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    formState.segments = formState.segments.filter(s => s.id !== segmentId);
    renderAllSegments(segmentsContainer);
    updateCommand(container);
  });

  // タイプ切り替え（テキスト/セレクター）
  delegate(segmentsContainer, 'click', '.type-btn', (e, target) => {
    const type = target.dataset.type;
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);

    if (segment) {
      segment.type = type;
      renderAllSegments(segmentsContainer);
      updateCommand(container);
    }
  });

  // テキスト入力
  delegate(segmentsContainer, 'input', '.segment-text', debounce((e, target) => {
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);

    if (segment) {
      segment.text = target.value;
      updateCommand(container);
    }
  }, 100));

  // セレクター選択
  delegate(segmentsContainer, 'change', '.segment-selector', (e, target) => {
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);

    if (segment) {
      segment.selector = target.value;
      updateCommand(container);
    }
  });

  // 色選択
  delegate(segmentsContainer, 'click', '.color-swatch', (e, target) => {
    const color = target.dataset.color;
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);

    if (segment) {
      segment.color = color;
      $$('.color-swatch', segmentEl).forEach(s => s.classList.remove('active'));
      target.classList.add('active');
      updateCommand(container);
    }
  });

  // スタイルトグル
  delegate(segmentsContainer, 'click', '.style-btn', (e, target) => {
    const style = target.dataset.style;
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);

    if (segment) {
      segment[style] = !segment[style];
      target.classList.toggle('active');
      updateCommand(container);
    }
  });

  // クリックイベント変更
  delegate(segmentsContainer, 'change', '.click-action', (e, target) => {
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);
    const valueInput = segmentEl.querySelector('.click-value');

    if (segment) {
      segment.clickAction = target.value;
      segment.clickValue = '';

      const action = CLICK_ACTIONS.find(a => a.id === target.value);
      if (valueInput) {
        valueInput.style.display = target.value ? 'block' : 'none';
        valueInput.placeholder = action?.placeholder || '';
        valueInput.value = '';
      }

      updateCommand(container);
    }
  });

  // クリックイベント値
  delegate(segmentsContainer, 'input', '.click-value', debounce((e, target) => {
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);

    if (segment) {
      segment.clickValue = target.value;
      updateCommand(container);
    }
  }, 100));

  // ホバーイベント変更
  delegate(segmentsContainer, 'change', '.hover-action', (e, target) => {
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);
    const valueInput = segmentEl.querySelector('.hover-value');

    if (segment) {
      segment.hoverAction = target.value;
      segment.hoverValue = '';

      const action = HOVER_ACTIONS.find(a => a.id === target.value);
      if (valueInput) {
        valueInput.style.display = target.value ? 'block' : 'none';
        valueInput.placeholder = action?.placeholder || '';
        valueInput.value = '';
      }

      updateCommand(container);
    }
  });

  // ホバーイベント値
  delegate(segmentsContainer, 'input', '.hover-value', debounce((e, target) => {
    const segmentEl = target.closest('.jt-segment');
    const segmentId = segmentEl.dataset.segmentId;
    const segment = formState.segments.find(s => s.id === segmentId);

    if (segment) {
      segment.hoverValue = target.value;
      updateCommand(container);
    }
  }, 100));

  // リセットボタン
  $('#json-text-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container, segmentsContainer);
  });

  // 初期コマンド生成
  updateCommand(container);
}

/**
 * フォームをリセット
 */
function resetForm(container, segmentsContainer) {
  // 状態をデフォルトに戻す
  formState = {
    segments: [createDefaultSegment()],
    outputFormat: 'tellraw',
    selector: '@a',
  };

  // 出力形式タブをリセット
  $$('.format-tab', container).forEach(t => t.classList.remove('active'));
  const defaultFormatTab = $(`.format-tab[data-format="tellraw"]`, container);
  if (defaultFormatTab) {
    defaultFormatTab.classList.add('active');
  }

  // セレクターボタンをリセット
  $$('.selector-btn', container).forEach(b => b.classList.remove('active'));
  const defaultSelectorBtn = $(`.selector-btn[data-selector="@a"]`, container);
  if (defaultSelectorBtn) {
    defaultSelectorBtn.classList.add('active');
  }

  // セレクター行を表示
  const selectorRow = $('.selector-row', container);
  if (selectorRow) {
    selectorRow.style.display = 'flex';
  }

  // セグメントを再レンダリング
  renderAllSegments(segmentsContainer);

  // コマンドを更新
  updateCommand(container);
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
    .replace(/"/g, '&quot;');
}

// スタイル
const style = document.createElement('style');
style.textContent = `
  /* JSON Text Generator - エンチャント本風テーマ */
  .json-text-tool.mc-themed {
    background: linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%);
    border-radius: 0;
    border: 4px solid #2a1a4a;
    box-shadow:
      inset 2px 2px 0 rgba(170, 100, 255, 0.1),
      inset -2px -2px 0 rgba(0, 0, 0, 0.3),
      0 8px 32px rgba(100, 50, 150, 0.3);
  }

  /* ヘッダー - 紫/マゼンタ系 */
  .jt-header-banner {
    background: linear-gradient(90deg, #4a1a6b 0%, #6b2a8c 50%, #4a1a6b 100%);
    padding: 20px 24px;
    margin: -16px -16px 24px -16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #2a0a4a;
    position: relative;
  }

  .jt-header-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23000' opacity='0.15'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .json-text-tool .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .json-text-tool .header-icon {
    width: 48px;
    height: 48px;
    filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.5));
  }

  .json-text-tool .header-text h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: bold;
    text-shadow: 2px 2px 0 #2a0a4a;
  }

  .json-text-tool .header-subtitle {
    margin: 4px 0 0 0;
    color: rgba(255, 200, 255, 0.8);
    font-size: 0.85rem;
  }

  .json-text-tool .version-badge {
    background: linear-gradient(180deg, #aa66ff 0%, #8844cc 100%);
    color: #ffffff;
    padding: 6px 12px;
    font-weight: bold;
    font-size: 0.8rem;
    border: 2px solid #6633aa;
    position: relative;
    z-index: 1;
  }

  /* セクション */
  .jt-section {
    background: rgba(100, 50, 150, 0.1);
    border: 2px solid rgba(170, 100, 255, 0.2);
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .json-text-tool .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .json-text-tool .step-number {
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #aa66ff 0%, #7744bb 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
    border: 2px solid #5533aa;
  }

  .json-text-tool .section-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
  }

  /* 出力形式タブ */
  .jt-format-selector {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .format-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .format-tab {
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(170, 100, 255, 0.3);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.85rem;
  }

  .format-tab:hover {
    background: rgba(170, 100, 255, 0.2);
    border-color: #aa66ff;
  }

  .format-tab.active {
    background: linear-gradient(180deg, #aa66ff 0%, #7744bb 100%);
    border-color: #aa66ff;
    color: #ffffff;
  }

  .selector-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .selector-row label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .selector-buttons {
    display: flex;
    gap: 6px;
  }

  .selector-btn {
    padding: 8px 14px;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(170, 100, 255, 0.3);
    color: #55ffff;
    cursor: pointer;
    font-family: var(--mc-font-mono, monospace);
    font-size: 0.85rem;
    transition: all 0.15s;
  }

  .selector-btn:hover {
    background: rgba(170, 100, 255, 0.2);
  }

  .selector-btn.active {
    background: rgba(85, 255, 255, 0.2);
    border-color: #55ffff;
  }

  /* セグメント */
  .jt-segments-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
  }

  .jt-segment {
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(170, 100, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
  }

  .segment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: rgba(170, 100, 255, 0.15);
    border-bottom: 1px solid rgba(170, 100, 255, 0.2);
  }

  .segment-number {
    color: #aa66ff;
    font-weight: bold;
    font-size: 0.85rem;
  }

  .segment-type-toggle {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  .type-btn {
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.15s;
  }

  .type-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .type-btn.active {
    background: rgba(170, 100, 255, 0.3);
    border-color: #aa66ff;
    color: #ffffff;
  }

  .segment-remove-btn {
    background: none;
    border: none;
    color: #ff5555;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px 8px;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  .segment-remove-btn:hover {
    opacity: 1;
  }

  .segment-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .segment-input-row {
    display: flex;
  }

  .segment-input-row .jt-input,
  .segment-input-row .jt-select {
    flex: 1;
  }

  /* カラーパレット */
  .segment-color-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .segment-color-row label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    min-width: 50px;
  }

  .color-palette {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .color-swatch {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .color-swatch:hover {
    transform: scale(1.2);
    z-index: 1;
  }

  .color-swatch.active {
    border-color: #ffffff;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  }

  /* スタイルボタン */
  .segment-style-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .segment-style-row label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    min-width: 50px;
  }

  .style-buttons {
    display: flex;
    gap: 6px;
  }

  .style-btn {
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .style-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .style-btn.active {
    background: rgba(170, 100, 255, 0.4);
    border-color: #aa66ff;
    color: #ffffff;
  }

  .obfuscated-btn span {
    font-family: var(--mc-font-mono, monospace);
    font-size: 0.75rem;
  }

  /* イベント設定 */
  .segment-events {
    margin-top: 8px;
  }

  .segment-events summary {
    cursor: pointer;
    color: rgba(170, 100, 255, 0.8);
    font-size: 0.85rem;
    padding: 8px 0;
    user-select: none;
  }

  .segment-events summary:hover {
    color: #aa66ff;
  }

  .events-content {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(170, 100, 255, 0.2);
    border-radius: 4px;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .event-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .event-row label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    min-width: 60px;
  }

  .event-row .jt-select {
    min-width: 150px;
  }

  .event-row .jt-input {
    flex: 1;
    min-width: 200px;
  }

  /* セグメント追加ボタン */
  .jt-add-segment-btn {
    width: 100%;
    padding: 14px;
    background: rgba(170, 100, 255, 0.1);
    border: 2px dashed rgba(170, 100, 255, 0.4);
    color: rgba(170, 100, 255, 0.8);
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s;
  }

  .jt-add-segment-btn:hover {
    background: rgba(170, 100, 255, 0.2);
    border-color: #aa66ff;
    color: #aa66ff;
  }

  .btn-icon {
    font-size: 1.2rem;
    font-weight: bold;
  }

  /* プレビュー - Minecraftチャット風 */
  .jt-preview-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .jt-preview-box {
    /* Minecraftチャット風の半透明背景 */
    background: linear-gradient(180deg,
      rgba(0, 0, 0, 0.55) 0%,
      rgba(0, 0, 0, 0.45) 100%
    );
    color: #ffffff;
    padding: 12px 16px;
    min-height: 80px;
    /* Minecraftフォント風 */
    font-family: 'Minecraft', 'Unifont', var(--mc-font-mono, 'Courier New', monospace);
    font-size: 16px;
    line-height: 1.4;
    /* Minecraftのテキストシャドウ */
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8);
    /* チャットウィンドウ風のボーダー */
    border: none;
    border-radius: 0;
    position: relative;
    /* 背景画像でMinecraft風のテクスチャ感を出す */
    background-image:
      linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.45) 100%),
      url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='4' height='4' fill='%23222'/%3E%3Crect x='0' y='0' width='2' height='2' fill='%23282828'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23282828'/%3E%3C/svg%3E");
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
      0 4px 16px rgba(0, 0, 0, 0.4);
  }

  /* チャットメッセージのライン表示 */
  .jt-preview-box span {
    display: inline;
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8);
  }

  .preview-placeholder {
    color: rgba(255, 255, 255, 0.35);
    font-style: italic;
    text-shadow: none;
  }

  /* プレイヤー名風のスタイル（オプション） */
  .jt-preview-box .preview-playername {
    color: #FFAA00;
  }

  .jt-preview-box .preview-operator {
    color: #FF5555;
  }

  .preview-hint {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
    margin: 0;
  }

  .preview-underlined {
    text-decoration: underline;
  }

  .preview-strikethrough {
    text-decoration: line-through;
  }

  /* 難読化アニメーション */
  .mc-obfuscated {
    animation: mcObfuscate 0.1s infinite;
    font-family: var(--mc-font-mono, monospace);
  }

  @keyframes mcObfuscate {
    0% { opacity: 1; letter-spacing: 0; }
    25% { opacity: 0.8; letter-spacing: 1px; }
    50% { opacity: 1; letter-spacing: -1px; }
    75% { opacity: 0.9; letter-spacing: 2px; }
    100% { opacity: 1; letter-spacing: 0; }
  }

  /* 入力フィールド */
  .json-text-tool .jt-input {
    background: #0f0f1a;
    color: #ffffff;
    border: 2px solid rgba(170, 100, 255, 0.3);
    padding: 10px 14px;
    font-size: 0.95rem;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .json-text-tool .jt-input:focus {
    border-color: #aa66ff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(170, 100, 255, 0.2);
  }

  .json-text-tool .jt-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .json-text-tool .jt-select {
    background: #0f0f1a;
    color: #ffffff;
    border: 2px solid rgba(170, 100, 255, 0.3);
    padding: 10px 14px;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .json-text-tool .jt-select:focus {
    border-color: #aa66ff;
    outline: none;
  }

  /* レスポンシブ */
  @media (max-width: 600px) {
    .format-tabs {
      flex-direction: column;
    }

    .format-tab {
      width: 100%;
      text-align: center;
    }

    .selector-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .selector-buttons {
      flex-wrap: wrap;
    }

    .segment-color-row,
    .segment-style-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .color-palette {
      width: 100%;
    }

    .event-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .event-row .jt-select,
    .event-row .jt-input {
      width: 100%;
    }
  }

  /* ピクセル風画像 */
  .mc-pixelated {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
`;
document.head.appendChild(style);

export default { render, init };
