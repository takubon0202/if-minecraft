/**
 * Sign Generator - UI
 */

import { $, $$, debounce } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import { MC_COLORS } from '../../components/json-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';

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
    <div class="tool-panel" id="sign-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'oak_sign')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <button type="button" class="reset-btn" id="sign-reset-btn" title="設定をリセット">リセット</button>
      </div>

      <form class="tool-form" id="sign-form">
        <!-- 看板タイプ -->
        <div class="form-row">
          <div class="form-group">
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
          <div class="form-group">
            <label for="sign-facing">向き</label>
            <select id="sign-facing" class="mc-select">
              <option value="north">北 (North)</option>
              <option value="south">南 (South)</option>
              <option value="east">東 (East)</option>
              <option value="west">西 (West)</option>
            </select>
          </div>
        </div>

        <!-- 座標 -->
        <div class="form-group">
          <label for="sign-pos">座標</label>
          <input type="text" id="sign-pos" class="mc-input" value="~ ~ ~" placeholder="x y z">
        </div>

        <!-- 行1-4 -->
        <div class="sign-lines">
          ${[1, 2, 3, 4].map(i => `
            <div class="sign-line">
              <label>行 ${i}</label>
              <div class="line-input">
                <input type="text" id="sign-line${i}" class="mc-input" placeholder="テキスト">
                <select id="sign-color${i}" class="mc-select sign-color" title="色">
                  <option value="">デフォルト</option>
                  ${colorOptions}
                </select>
                <label class="style-check">
                  <input type="checkbox" id="sign-bold${i}"> B
                </label>
                <label class="style-check">
                  <input type="checkbox" id="sign-italic${i}"> I
                </label>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- オプション -->
        <div class="form-row">
          <div class="form-group">
            <label class="option-label">
              <input type="checkbox" id="sign-glowing">
              発光テキスト
            </label>
          </div>
          <div class="form-group">
            <label class="option-label">
              <input type="checkbox" id="sign-waxed">
              蝋引き（編集不可）
            </label>
          </div>
        </div>

        <!-- 出力形式 -->
        <div class="form-group">
          <label>出力形式</label>
          <div class="output-options">
            <label class="option-label">
              <input type="radio" name="sign-output" value="setblock" checked>
              /setblock
            </label>
            <label class="option-label">
              <input type="radio" name="sign-output" value="give">
              /give
            </label>
          </div>
        </div>
      </form>

      <!-- プレビュー -->
      <div class="sign-preview">
        <label>プレビュー</label>
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
  // フォーム変更
  container.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', debounce(updateCommand, 150));
    el.addEventListener('change', updateCommand);
  });

  // リセットボタン
  $('#sign-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  updateCommand();
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

  // 各行をリセット
  for (let i = 1; i <= 4; i++) {
    const lineInput = $(`#sign-line${i}`, container);
    const colorSelect = $(`#sign-color${i}`, container);
    const boldCheck = $(`#sign-bold${i}`, container);
    const italicCheck = $(`#sign-italic${i}`, container);

    if (lineInput) lineInput.value = '';
    if (colorSelect) colorSelect.value = '';
    if (boldCheck) boldCheck.checked = false;
    if (italicCheck) italicCheck.checked = false;
  }

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

  const lines = [];
  const previewLines = $('#sign-preview')?.querySelectorAll('.preview-line') || [];

  for (let i = 1; i <= 4; i++) {
    const text = $(`#sign-line${i}`)?.value || '';
    const color = $(`#sign-color${i}`)?.value || '';
    const bold = $(`#sign-bold${i}`)?.checked;
    const italic = $(`#sign-italic${i}`)?.checked;

    // JSON Text Component
    const component = { text };
    if (color) component.color = color;
    if (bold) component.bold = true;
    if (italic) component.italic = true;

    lines.push(JSON.stringify(component));

    // プレビュー更新
    if (previewLines[i - 1]) {
      let style = '';
      if (color && MC_COLORS[color]) style += `color: ${MC_COLORS[color]};`;
      if (bold) style += 'font-weight: bold;';
      if (italic) style += 'font-style: italic;';
      if (glowing) style += 'text-shadow: 0 0 5px currentColor;';
      previewLines[i - 1].innerHTML = `<span style="${style}">${escapeHtml(text) || '&nbsp;'}</span>`;
    }
  }

  let command;
  if (outputType === 'setblock') {
    // /setblock形式
    const frontText = `front_text:{messages:[${lines.join(',')}]${glowing ? ',has_glowing_text:1b' : ''}}`;
    const blockState = `[facing=${facing}]`;
    const nbt = `{${waxed ? 'is_waxed:1b,' : ''}${frontText}}`;
    command = `/setblock ${pos} minecraft:${signType}${blockState}${nbt}`;
  } else {
    // /give形式
    const frontText = `front_text={messages:[${lines.join(',')}]${glowing ? ',has_glowing_text:1b' : ''}}`;
    const components = [frontText];
    if (waxed) components.push('is_waxed={}');
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
  .sign-lines {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-md);
  }

  .sign-line label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-xs);
  }

  .line-input {
    display: flex;
    gap: var(--mc-space-xs);
    align-items: center;
  }

  .line-input input[type="text"] {
    flex: 1;
  }

  .sign-color {
    width: 100px;
  }

  .style-check {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.75rem;
    font-weight: bold;
    cursor: pointer;
  }

  .output-options {
    display: flex;
    gap: var(--mc-space-md);
  }

  .sign-preview {
    margin-top: var(--mc-space-lg);
  }

  .sign-preview label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-xs);
  }

  .sign-preview-box {
    background: linear-gradient(135deg, #c4a265, #8b6b3d);
    border: 4px solid #5d3f2e;
    padding: var(--mc-space-md);
    text-align: center;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  .preview-line {
    font-family: var(--mc-font-mono);
    font-size: 0.85rem;
    color: #1f1f1f;
    min-height: 1.2em;
  }
`;
document.head.appendChild(style);

export default { render, init };
