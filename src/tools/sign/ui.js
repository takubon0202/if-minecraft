/**
 * Sign Generator - UI
 * 看板コマンド生成ツール
 * Minecraft公式サイト風デザイン
 */

import { $, $$, debounce } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import { MC_COLORS } from '../../components/json-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';

// 行ごとのRTEインスタンス
let line1Editor = null;
let line2Editor = null;
let line3Editor = null;
let line4Editor = null;

// 看板の種類
const SIGN_TYPES = [
  { id: 'oak_sign', name: 'オーク' },
  { id: 'spruce_sign', name: 'トウヒ' },
  { id: 'birch_sign', name: 'シラカバ' },
  { id: 'jungle_sign', name: 'ジャングル' },
  { id: 'acacia_sign', name: 'アカシア' },
  { id: 'dark_oak_sign', name: 'ダークオーク' },
  { id: 'mangrove_sign', name: 'マングローブ' },
  { id: 'cherry_sign', name: 'サクラ' },
  { id: 'bamboo_sign', name: '竹' },
  { id: 'crimson_sign', name: '真紅' },
  { id: 'warped_sign', name: '歪んだ' },
];

const HANGING_SIGN_TYPES = SIGN_TYPES.map(s => ({
  id: s.id.replace('_sign', '_hanging_sign'),
  name: s.name + '（吊り下げ）',
}));

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const signOptions = SIGN_TYPES.map(s =>
    `<option value="${s.id}">${s.name}</option>`
  ).join('');

  const hangingOptions = HANGING_SIGN_TYPES.map(s =>
    `<option value="${s.id}">${s.name}</option>`
  ).join('');

  const colorOptions = Object.entries(MC_COLORS).map(([name, hex]) =>
    `<option value="${name}" style="color:${hex}">${name}</option>`
  ).join('');

  return `
    <div class="tool-panel sign-tool mc-themed" id="sign-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'oak_sign')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/setblock 看板</h2>
            <p class="header-subtitle">カスタム看板コマンドを生成</p>
          </div>
        </div>
        <span class="version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="sign-reset-btn" title="設定をリセット">リセット</button>
      </div>

      <form class="tool-form mc-form" id="sign-form">

        <!-- ステップ1: 看板タイプ選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>看板の種類・向き</h3>
          </div>

          <div class="sign-type-row">
            <div class="sign-type-group">
              <label for="sign-type">看板の種類</label>
              <select id="sign-type" class="mc-select">
                <optgroup label="通常">
                  ${signOptions}
                </optgroup>
                <optgroup label="吊り下げ">
                  ${hangingOptions}
                </optgroup>
              </select>
            </div>
            <div class="sign-facing-group">
              <label for="sign-facing">向き</label>
              <select id="sign-facing" class="mc-select">
                <option value="north">北 (North)</option>
                <option value="south">南 (South)</option>
                <option value="east">東 (East)</option>
                <option value="west">西 (West)</option>
              </select>
            </div>
          </div>
        </section>

        <!-- ステップ2: 座標設定 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>設置位置</h3>
          </div>

          <div class="coordinate-input">
            <div class="coord-preset-btns">
              <button type="button" class="coord-preset active" data-pos="~ ~ ~">
                現在地 <code>~ ~ ~</code>
              </button>
              <button type="button" class="coord-preset" data-pos="~ ~1 ~">
                1ブロック上 <code>~ ~1 ~</code>
              </button>
              <button type="button" class="coord-preset" data-pos="~ ~ ~1">
                前方1m <code>~ ~ ~1</code>
              </button>
            </div>
            <div class="coord-custom">
              <label>カスタム座標:</label>
              <input type="text" id="sign-pos" class="mc-input coord-input" value="~ ~ ~" placeholder="x y z">
            </div>
          </div>
        </section>

        <!-- ステップ3: テキスト入力（リッチテキストエディター） -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>テキスト入力</h3>
          </div>

          <div class="sign-lines-rte">
            <div class="sign-line-rte">
              <label class="sign-line-label">行 1</label>
              <div id="sign-line1-editor-container"></div>
            </div>
            <div class="sign-line-rte">
              <label class="sign-line-label">行 2</label>
              <div id="sign-line2-editor-container"></div>
            </div>
            <div class="sign-line-rte">
              <label class="sign-line-label">行 3</label>
              <div id="sign-line3-editor-container"></div>
            </div>
            <div class="sign-line-rte">
              <label class="sign-line-label">行 4</label>
              <div id="sign-line4-editor-container"></div>
            </div>
          </div>
        </section>

        <!-- ステップ4: オプション -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">4</span>
            <h3>オプション</h3>
          </div>

          <div class="behavior-grid">
            <label class="behavior-option">
              <input type="checkbox" id="sign-glowing">
              <div class="option-content">
                <img src="${getInviconUrl('glow_ink_sac')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">発光テキスト</span>
                  <span class="option-desc">イカスミで光らせる</span>
                </div>
              </div>
            </label>

            <label class="behavior-option">
              <input type="checkbox" id="sign-waxed">
              <div class="option-content">
                <img src="${getInviconUrl('honeycomb')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">蝋引き</span>
                  <span class="option-desc">編集できなくする</span>
                </div>
              </div>
            </label>
          </div>
        </section>

        <!-- ステップ5: 出力形式 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">5</span>
            <h3>出力形式</h3>
          </div>

          <div class="output-format-grid">
            <label class="output-option">
              <input type="radio" name="sign-output" value="setblock" checked>
              <div class="option-content">
                <img src="${getInviconUrl('command_block')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">/setblock</span>
                  <span class="option-desc">ブロックを直接設置</span>
                </div>
              </div>
            </label>

            <label class="output-option">
              <input type="radio" name="sign-output" value="give">
              <div class="option-content">
                <img src="${getInviconUrl('chest')}" alt="" class="option-icon mc-pixelated">
                <div class="option-text">
                  <span class="option-name">/give</span>
                  <span class="option-desc">アイテムとして入手</span>
                </div>
              </div>
            </label>
          </div>
        </section>
      </form>

      <!-- プレビュー -->
      <div class="sign-preview-section">
        <h3>プレビュー</h3>
        <div class="sign-preview-box" id="sign-preview">
          <div class="preview-line"></div>
          <div class="preview-line"></div>
          <div class="preview-line"></div>
          <div class="preview-line"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // リッチテキストエディターを初期化
  initRichTextEditors(container);

  // フォーム変更
  container.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', debounce(updateCommand, 150));
    el.addEventListener('change', updateCommand);
  });

  // 座標プリセット
  $$('.coord-preset', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const pos = btn.dataset.pos;
      $('#sign-pos', container).value = pos;

      $$('.coord-preset', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      updateCommand();
    });
  });

  // リセットボタン
  $('#sign-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  updateCommand();
}

/**
 * リッチテキストエディターを初期化
 */
function initRichTextEditors(container) {
  const editorOptions = {
    placeholder: 'テキストを入力...',
    showPreview: false,
    showClickEvent: false,
    showHoverEvent: false,
    onChange: () => updateCommand()
  };

  // 行1のエディター
  line1Editor = new RichTextEditor('sign-line1-editor', editorOptions);
  const line1Container = container.querySelector('#sign-line1-editor-container');
  if (line1Container) {
    line1Container.innerHTML = line1Editor.render();
    line1Editor.init(container);
  }

  // 行2のエディター
  line2Editor = new RichTextEditor('sign-line2-editor', editorOptions);
  const line2Container = container.querySelector('#sign-line2-editor-container');
  if (line2Container) {
    line2Container.innerHTML = line2Editor.render();
    line2Editor.init(container);
  }

  // 行3のエディター
  line3Editor = new RichTextEditor('sign-line3-editor', editorOptions);
  const line3Container = container.querySelector('#sign-line3-editor-container');
  if (line3Container) {
    line3Container.innerHTML = line3Editor.render();
    line3Editor.init(container);
  }

  // 行4のエディター
  line4Editor = new RichTextEditor('sign-line4-editor', editorOptions);
  const line4Container = container.querySelector('#sign-line4-editor-container');
  if (line4Container) {
    line4Container.innerHTML = line4Editor.render();
    line4Editor.init(container);
  }
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // 看板の種類をデフォルトに
  const signType = $('#sign-type', container);
  if (signType) signType.value = 'oak_sign';

  // 向きをデフォルトに
  const facing = $('#sign-facing', container);
  if (facing) facing.value = 'north';

  // 座標をデフォルトに
  const pos = $('#sign-pos', container);
  if (pos) pos.value = '~ ~ ~';

  // 座標プリセットをリセット
  $$('.coord-preset', container).forEach(b => {
    b.classList.toggle('active', b.dataset.pos === '~ ~ ~');
  });

  // 各行のRTEをクリア
  if (line1Editor) line1Editor.clear(container);
  if (line2Editor) line2Editor.clear(container);
  if (line3Editor) line3Editor.clear(container);
  if (line4Editor) line4Editor.clear(container);

  // オプションをリセット
  const glowing = $('#sign-glowing', container);
  const waxed = $('#sign-waxed', container);
  if (glowing) glowing.checked = false;
  if (waxed) waxed.checked = false;

  // 出力形式をデフォルトに
  const setblockRadio = container.querySelector('input[name="sign-output"][value="setblock"]');
  if (setblockRadio) setblockRadio.checked = true;

  // コマンド更新
  updateCommand();
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const signType = $('#sign-type')?.value || 'oak_sign';
  const facing = $('#sign-facing')?.value || 'north';
  const pos = $('#sign-pos')?.value || '~ ~ ~';
  const glowing = $('#sign-glowing')?.checked;
  const waxed = $('#sign-waxed')?.checked;
  const outputType = document.querySelector('input[name="sign-output"]:checked')?.value || 'setblock';

  // RTEから各行のSNBTを取得
  const editors = [line1Editor, line2Editor, line3Editor, line4Editor];
  const lines = [];
  const previewLines = $('#sign-preview')?.querySelectorAll('.preview-line') || [];

  for (let i = 0; i < 4; i++) {
    const editor = editors[i];
    let lineJson;

    if (editor && editor.characters && editor.characters.length > 0) {
      // RTEからSNBT形式を取得
      lineJson = editor.getSNBT();
    } else {
      // 空の場合はデフォルト
      lineJson = '{"text":""}';
    }

    lines.push(lineJson);

    // プレビュー更新
    if (previewLines[i] && editor) {
      const plainText = editor.getPlainText();
      let previewHtml = '';

      if (editor.characters && editor.characters.length > 0) {
        for (const c of editor.characters) {
          let style = `color: ${editor.getColorHex(c.color)};`;
          if (c.bold) style += 'font-weight: bold;';
          if (c.italic) style += 'font-style: italic;';
          if (c.underlined) style += 'text-decoration: underline;';
          if (c.strikethrough) style += 'text-decoration: line-through;';
          if (glowing) style += 'text-shadow: 0 0 5px currentColor;';

          const escaped = c.char === ' ' ? '&nbsp;' : c.char.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          previewHtml += `<span style="${style}">${escaped}</span>`;
        }
      }

      previewLines[i].innerHTML = previewHtml || '&nbsp;';
    }
  }

  let command;
  if (outputType === 'setblock') {
    // /setblock形式（NBT形式）
    const frontText = `front_text:{messages:[${lines.join(',')}]${glowing ? ',has_glowing_text:1b' : ''}}`;
    const blockState = `[facing=${facing}]`;
    const nbt = `{${waxed ? 'is_waxed:1b,' : ''}${frontText}}`;
    command = `/setblock ${pos} minecraft:${signType}${blockState}${nbt}`;
  } else {
    // /give形式（コンポーネント形式、名前空間付き）
    const frontText = `minecraft:front_text={messages:[${lines.join(',')}]${glowing ? ',has_glowing_text:1b' : ''}}`;
    const components = [frontText];
    if (waxed) components.push('minecraft:is_waxed={}');
    command = `/give @p minecraft:${signType}[${components.join(',')}]`;
  }

  setOutput(command, 'sign', { signType, facing, pos, lines, glowing, waxed, outputType });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  /* ===== Sign Tool - Minecraft風デザイン ===== */

  /* Minecraft風テーマ */
  .sign-tool.mc-themed {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 0;
    border: 4px solid #0f0f23;
    box-shadow:
      inset 2px 2px 0 rgba(255,255,255,0.1),
      inset -2px -2px 0 rgba(0,0,0,0.3),
      0 8px 32px rgba(0,0,0,0.5);
  }

  .sign-tool .mc-pixelated {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  /* ヘッダー - 茶色系グラデーション（木製アイテム） */
  .sign-tool .mc-header-banner {
    background: linear-gradient(90deg, #6b4423 0%, #8b5a2b 50%, #6b4423 100%);
    padding: 20px 24px;
    margin: -16px -16px 24px -16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #3d2817;
    position: relative;
  }

  .sign-tool .mc-header-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23000' opacity='0.1'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .sign-tool .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .sign-tool .header-icon {
    width: 48px;
    height: 48px;
    filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.5));
  }

  .sign-tool .header-text h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: bold;
    text-shadow: 2px 2px 0 #3d2817;
  }

  .sign-tool .header-subtitle {
    margin: 4px 0 0 0;
    color: rgba(255,255,255,0.8);
    font-size: 0.85rem;
  }

  .sign-tool .version-badge {
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
  .sign-tool .mc-section {
    background: rgba(255,255,255,0.05);
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .sign-tool .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .sign-tool .step-number {
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #8b5a2b 0%, #6b4423 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
    border: 2px solid #3d2817;
  }

  .sign-tool .section-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
    flex: 1;
  }

  /* 看板タイプ選択 */
  .sign-tool .sign-type-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }

  .sign-tool .sign-type-group label,
  .sign-tool .sign-facing-group label {
    display: block;
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    margin-bottom: 8px;
  }

  /* 座標入力 */
  .sign-tool .coordinate-input {
    margin-bottom: 0;
  }

  .sign-tool .coord-preset-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .sign-tool .coord-preset {
    padding: 10px 16px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.8);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.85rem;
  }

  .sign-tool .coord-preset code {
    display: block;
    color: #d4a12a;
    margin-top: 4px;
    font-size: 0.75rem;
  }

  .sign-tool .coord-preset:hover {
    background: rgba(255,255,255,0.1);
  }

  .sign-tool .coord-preset.active {
    background: rgba(139, 90, 43, 0.3);
    border-color: #8b5a2b;
  }

  .sign-tool .coord-custom {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sign-tool .coord-custom label {
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
  }

  .sign-tool .coord-input {
    flex: 1;
    max-width: 200px;
  }

  /* テキスト入力 */
  .sign-tool .sign-lines {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-md);
  }

  .sign-tool .sign-line > label {
    display: block;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.6);
    margin-bottom: var(--mc-space-xs);
  }

  .sign-tool .line-input {
    display: flex;
    gap: var(--mc-space-sm);
    align-items: center;
  }

  .sign-tool .line-input input[type="text"] {
    flex: 1;
  }

  .sign-tool .sign-color {
    width: 100px;
  }

  .sign-tool .style-check {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    cursor: pointer;
    transition: all 0.15s;
    color: rgba(255,255,255,0.7);
  }

  .sign-tool .style-check:hover {
    background: rgba(255,255,255,0.1);
  }

  .sign-tool .style-check:has(input:checked) {
    background: rgba(139, 90, 43, 0.3);
    border-color: #8b5a2b;
    color: #ffffff;
  }

  .sign-tool .style-check input {
    display: none;
  }

  /* 動作設定 */
  .sign-tool .behavior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .sign-tool .behavior-option {
    cursor: pointer;
  }

  .sign-tool .behavior-option input {
    display: none;
  }

  .sign-tool .option-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    transition: all 0.15s;
  }

  .sign-tool .behavior-option:hover .option-content {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.2);
  }

  .sign-tool .behavior-option input:checked + .option-content {
    background: rgba(139, 90, 43, 0.2);
    border-color: #8b5a2b;
  }

  .sign-tool .option-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .sign-tool .option-text {
    display: flex;
    flex-direction: column;
  }

  .sign-tool .option-name {
    color: #ffffff;
    font-weight: 500;
  }

  .sign-tool .option-desc {
    color: rgba(255,255,255,0.5);
    font-size: 0.75rem;
  }

  /* 出力形式 */
  .sign-tool .output-format-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .sign-tool .output-option {
    cursor: pointer;
  }

  .sign-tool .output-option input {
    display: none;
  }

  .sign-tool .output-option .option-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
    transition: all 0.15s;
  }

  .sign-tool .output-option:hover .option-content {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.2);
  }

  .sign-tool .output-option input:checked + .option-content {
    background: rgba(139, 90, 43, 0.2);
    border-color: #8b5a2b;
  }

  /* 入力フィールド共通 */
  .sign-tool .mc-input {
    background: #1a1a2e;
    color: #ffffff;
    border: 2px solid rgba(255,255,255,0.2);
    padding: 10px 14px;
    font-size: 0.95rem;
  }

  .sign-tool .mc-input:focus {
    border-color: #8b5a2b;
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.3);
  }

  .sign-tool .mc-select {
    background: #1a1a2e;
    color: #ffffff;
    border: 2px solid rgba(255,255,255,0.2);
    padding: 10px 14px;
  }

  .sign-tool .mc-select:focus {
    border-color: #8b5a2b;
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.3);
  }

  /* プレビューセクション */
  .sign-tool .sign-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    border-radius: 6px;
  }

  .sign-tool .sign-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
    text-transform: uppercase;
  }

  .sign-tool .sign-preview-box {
    background: linear-gradient(135deg, #c4a265, #8b6b3d);
    border: 4px solid #5d3f2e;
    padding: var(--mc-space-lg);
    text-align: center;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
  }

  .sign-tool .preview-line {
    font-family: var(--mc-font-mono);
    font-size: 0.9rem;
    color: #1f1f1f;
    min-height: 1.4em;
    text-shadow: 1px 1px 0 rgba(255,255,255,0.2);
  }

  /* ダークモードでのコントラスト改善 */
  @media (prefers-color-scheme: dark) {
    .sign-tool .sign-line > label {
      color: #a0a0a0;
    }

    .sign-tool .section-header h3 {
      color: #f0f0f0;
    }

    .sign-tool .coord-custom label {
      color: #c0c0c0;
    }

    .sign-tool .option-name {
      color: #f0f0f0;
    }

    .sign-tool .option-desc {
      color: #a0a0a0;
    }

    .sign-tool .mc-input,
    .sign-tool .mc-select {
      background: #1e1e3c;
      color: #f0f0f0;
      border-color: rgba(139, 90, 43, 0.4);
    }

    .sign-tool .mc-input:focus,
    .sign-tool .mc-select:focus {
      border-color: #8b5a2b;
      box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.3);
    }

    .sign-tool .mc-input::placeholder {
      color: #707090;
    }
  }

  /* レスポンシブ */
  @media (max-width: 600px) {
    .sign-tool .sign-type-row {
      grid-template-columns: 1fr;
    }

    .sign-tool .behavior-grid,
    .sign-tool .output-format-grid {
      grid-template-columns: 1fr;
    }

    .sign-tool .line-input {
      flex-wrap: wrap;
    }

    .sign-tool .line-input input[type="text"] {
      width: 100%;
    }

    .sign-tool .sign-color {
      flex: 1;
    }
  }

  /* ===== リッチテキストエディター用スタイル ===== */

  /* RTEコンテナ */
  .sign-tool .sign-lines-rte {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-lg);
  }

  .sign-tool .sign-line-rte {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
  }

  .sign-tool .sign-line-label {
    font-size: 0.9rem;
    font-weight: bold;
    color: rgba(255,255,255,0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* RTE内のスタイル調整（看板用） */
  .sign-tool .rich-text-editor.rte-advanced {
    background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
    border: 2px solid rgba(139, 90, 43, 0.4);
    border-radius: 6px;
  }

  .sign-tool .rte-advanced .rte-toolbar {
    background: linear-gradient(180deg, #3a3a4e 0%, #2a2a3e 100%);
    border-bottom: 2px solid rgba(139, 90, 43, 0.3);
    padding: 12px;
    gap: 10px;
  }

  .sign-tool .rte-advanced .rte-input-section {
    padding: 12px;
    border-bottom: 1px solid rgba(139, 90, 43, 0.2);
  }

  .sign-tool .rte-advanced .rte-char-editor-section {
    padding: 12px;
    border-bottom: 1px solid rgba(139, 90, 43, 0.2);
  }

  .sign-tool .rte-advanced .rte-char-grid {
    min-height: 60px;
    background: #1a1a2e;
    border-color: rgba(139, 90, 43, 0.3);
  }

  .sign-tool .rte-advanced .rte-char-box {
    background: #2a2a3e;
    border-color: rgba(139, 90, 43, 0.3);
  }

  .sign-tool .rte-advanced .rte-char-box:hover {
    border-color: #8b5a2b;
    background: #3a3a4e;
  }

  .sign-tool .rte-advanced .rte-char-box.selected {
    border-color: #8b5a2b;
    background: rgba(139, 90, 43, 0.2);
    box-shadow: 0 0 8px rgba(139, 90, 43, 0.4);
  }

  .sign-tool .rte-advanced .rte-text-input {
    background: #1a1a2e;
    border-color: rgba(139, 90, 43, 0.3);
  }

  .sign-tool .rte-advanced .rte-text-input:focus {
    border-color: #8b5a2b;
    box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.3);
  }

  .sign-tool .rte-advanced .rte-format-btn.active {
    background: linear-gradient(180deg, #8b5a2b 0%, #6b4423 100%);
    border-color: #8b5a2b;
  }

  /* RTE CSS */
  ${RICH_TEXT_EDITOR_CSS}
`;
document.head.appendChild(style);

export default { render, init };
