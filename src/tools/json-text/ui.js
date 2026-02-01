/**
 * JSON Text Generator - UI
 * Minecraft JSON Text Component 生成ツール
 * summonデザイン統一（青系グラデーション）
 */

import { $, $$, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { workspaceStore } from '../../core/store.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';
import {
  SELECTORS,
  OUTPUT_FORMATS,
  createDefaultSegment,
} from './engine.js';

// リッチテキストエディターインスタンス
let jsonTextEditor = null;

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
  // リッチテキストエディターのインスタンスを作成
  jsonTextEditor = new RichTextEditor('json-text-editor', {
    placeholder: 'メッセージを入力...',
    showPreview: true,
    showClickEvent: true,
    showHoverEvent: true,
    onChange: () => {}
  });

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

        <!-- ステップ2: テキスト入力（リッチテキストエディター） -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>テキスト入力</h3>
          </div>
          <p class="section-hint">1文字ごとに色や書式を設定可能。クリック/ホバーイベントも設定できます。</p>
          ${jsonTextEditor.render()}
        </section>

      </form>
    </div>
    <style>${RICH_TEXT_EDITOR_CSS}</style>
  `;
}


/**
 * コマンドを更新
 */
function updateCommand(container) {
  const version = workspaceStore.get('version') || '1.21';

  // リッチテキストエディターからJSON/SNBTを取得
  const jsonText = jsonTextEditor?.getJSON() || '';
  const plainText = jsonTextEditor?.getPlainText() || '';

  // 出力形式に応じてコマンドを生成
  let command = '';
  if (plainText) {
    switch (formState.outputFormat) {
      case 'tellraw':
        command = `tellraw ${formState.selector} ${jsonText}`;
        break;
      case 'title':
        command = `title ${formState.selector} title ${jsonText}`;
        break;
      case 'subtitle':
        command = `title ${formState.selector} subtitle ${jsonText}`;
        break;
      case 'actionbar':
        command = `title ${formState.selector} actionbar ${jsonText}`;
        break;
      case 'raw':
        command = jsonText;
        break;
      default:
        command = `tellraw ${formState.selector} ${jsonText}`;
    }
  }

  setOutput(command, 'json-text', { ...formState, version, plainText });
}

/**
 * 初期化
 */
export function init(container) {
  // リッチテキストエディターの初期化
  if (jsonTextEditor) {
    jsonTextEditor.init(container);
    jsonTextEditor.options.onChange = () => {
      updateCommand(container);
    };
  }

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

  // リセットボタン
  $('#json-text-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期コマンド生成
  updateCommand(container);
}

/**
 * フォームをリセット
 */
function resetForm(container) {
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

  // リッチテキストエディターをクリア
  if (jsonTextEditor) {
    jsonTextEditor.clear(container);
  }

  // コマンドを更新
  updateCommand(container);
}

// スタイル
const style = document.createElement('style');
style.textContent = `
  /* JSON Text Generator - summonデザイン統一（青系グラデーション） */
  .json-text-tool.mc-themed {
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

  /* ヘッダー - 青系グラデーション */
  .json-text-tool .mc-header-banner {
    background: linear-gradient(90deg, #1a5276 0%, #2874a6 50%, #1a5276 100%);
    padding: 20px 24px;
    margin: -16px -16px 24px -16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #0d3d56;
    position: relative;
  }

  .json-text-tool .mc-header-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23000' opacity='0.1'/%3E%3C/svg%3E");
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
    text-shadow: 2px 2px 0 #0d3d56;
  }

  .json-text-tool .header-subtitle {
    margin: 4px 0 0 0;
    color: rgba(255,255,255,0.8);
    font-size: 0.85rem;
  }

  .json-text-tool .version-badge {
    background: linear-gradient(180deg, #f2c13d 0%, #d4a12a 100%);
    color: #1a1a2e;
    padding: 6px 12px;
    font-weight: bold;
    font-size: 0.8rem;
    border: 2px solid #8b6914;
    position: relative;
    z-index: 1;
  }

  .json-text-tool .version-note {
    color: var(--mc-color-diamond);
    font-size: 0.85rem;
    margin: 0 0 16px 0;
    padding: 0 4px;
  }

  /* セクション */
  .json-text-tool .mc-section {
    background: rgba(255,255,255,0.05);
    border: 2px solid rgba(255,255,255,0.1);
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
    background: linear-gradient(180deg, #2874a6 0%, #1a5276 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
    border: 2px solid #0d3d56;
  }

  .json-text-tool .section-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
    flex: 1;
  }

  .json-text-tool .section-hint {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    margin: 0 0 16px 0;
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

  .json-text-tool .format-tab {
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.85rem;
  }

  .json-text-tool .format-tab:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(40, 116, 166, 0.5);
  }

  .json-text-tool .format-tab.active {
    background: linear-gradient(180deg, #2874a6 0%, #1a5276 100%);
    border-color: #2874a6;
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

  .json-text-tool .selector-btn {
    padding: 8px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.1);
    color: #55ffff;
    cursor: pointer;
    font-family: var(--mc-font-mono, monospace);
    font-size: 0.85rem;
    transition: all 0.15s;
  }

  .json-text-tool .selector-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .json-text-tool .selector-btn.active {
    background: rgba(77, 236, 242, 0.2);
    border-color: #4decf2;
  }

  /* セグメント */
  .jt-segments-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
  }

  .jt-segment {
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .segment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: rgba(40, 116, 166, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .segment-number {
    color: #4decf2;
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
    background: rgba(40, 116, 166, 0.3);
    border-color: #2874a6;
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

  .json-text-tool .style-btn {
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .json-text-tool .style-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .json-text-tool .style-btn.active {
    background: rgba(242, 193, 61, 0.3);
    border-color: #f2c13d;
    color: #f2c13d;
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
    color: rgba(77, 236, 242, 0.8);
    font-size: 0.85rem;
    padding: 8px 0;
    user-select: none;
  }

  .segment-events summary:hover {
    color: #4decf2;
  }

  .events-content {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
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
    background: rgba(40, 116, 166, 0.1);
    border: 2px dashed rgba(40, 116, 166, 0.4);
    color: rgba(40, 116, 166, 0.8);
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s;
  }

  .jt-add-segment-btn:hover {
    background: rgba(40, 116, 166, 0.2);
    border-color: #2874a6;
    color: #2874a6;
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
    background: #1a1a2e;
    color: #ffffff;
    border: 2px solid rgba(255,255,255,0.2);
    padding: 10px 14px;
    font-size: 0.95rem;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .json-text-tool .jt-input:focus {
    border-color: #2874a6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 116, 166, 0.2);
  }

  .json-text-tool .jt-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .json-text-tool .jt-select {
    background: #1a1a2e;
    color: #ffffff;
    border: 2px solid rgba(255,255,255,0.2);
    padding: 10px 14px;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .json-text-tool .jt-select:focus {
    border-color: #2874a6;
    outline: none;
  }

  /* レスポンシブ */
  @media (max-width: 600px) {
    .format-tabs {
      flex-direction: column;
    }

    .json-text-tool .format-tab {
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

  /* ダークモードでのコントラスト改善 */
  @media (prefers-color-scheme: dark) {
    .json-text-tool .section-header h3 {
      color: #f0f0f0;
    }

    .json-text-tool .selector-row label {
      color: #c0c0c0;
    }

    .json-text-tool .segment-color-row label,
    .json-text-tool .segment-style-row label {
      color: #c0c0c0;
    }

    .json-text-tool .event-row label {
      color: #c0c0c0;
    }

    .json-text-tool .jt-input,
    .json-text-tool .jt-select {
      background: #1e1e3c;
      color: #f0f0f0;
      border-color: rgba(40, 116, 166, 0.4);
    }

    .json-text-tool .jt-input:focus,
    .json-text-tool .jt-select:focus {
      border-color: #2874a6;
      box-shadow: 0 0 0 3px rgba(40, 116, 166, 0.3);
    }

    .json-text-tool .jt-input::placeholder {
      color: #707090;
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
