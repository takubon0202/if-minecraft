/**
 * Swing Command Generator - UI
 * エンティティの腕を振る /swing コマンドを生成（26.1+）
 */

import { $, $$, delegate } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';

// ターゲットセレクター
const TARGET_SELECTORS = [
  { value: '@s', label: '@s (自分自身)' },
  { value: '@a', label: '@a (全プレイヤー)' },
  { value: '@p', label: '@p (最も近いプレイヤー)' },
  { value: '@r', label: '@r (ランダムなプレイヤー)' },
  { value: '@e', label: '@e (全エンティティ)' },
  { value: 'custom', label: 'カスタム...' },
];

// ハンド選択
const HAND_OPTIONS = [
  { value: 'mainhand', label: 'メインハンド（右手）' },
  { value: 'offhand', label: 'オフハンド（左手）' },
];

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel swing-tool mc-themed" id="swing-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'armor_stand')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/swing コマンド</h2>
            <p class="header-subtitle">エンティティの腕を振る</p>
          </div>
        </div>
        <span class="version-badge" id="swing-version-badge">26.1+</span>
        <button type="button" class="reset-btn" id="swing-reset-btn" title="設定をリセット">リセット</button>
      </div>

      <!-- バージョン警告 -->
      <div class="mc-version-warning" id="swing-version-warning">
        <p>このコマンドは Minecraft 26.1 以降でのみ使用できます。</p>
      </div>

      <form class="tool-form mc-form" id="swing-form">
        <!-- ステップ1: ターゲット選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>ターゲット選択</h3>
          </div>
          <select id="swing-target" class="mc-select">
            ${TARGET_SELECTORS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
          </select>
          <input type="text" id="swing-custom-target" class="mc-input" placeholder="例: @e[type=armor_stand]" style="display:none; margin-top: 8px;">
        </section>

        <!-- ステップ2: ハンド選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>ハンド選択</h3>
          </div>
          <div class="hand-options">
            ${HAND_OPTIONS.map((h, i) => `
              <label class="option-label">
                <input type="radio" name="swing-hand" value="${h.value}" ${i === 0 ? 'checked' : ''}>
                ${h.label}
              </label>
            `).join('')}
          </div>
        </section>

        <!-- ステップ3: 使い方 -->
        <section class="form-section mc-section tool-info-section">
          <div class="section-header">
            <span class="step-number">?</span>
            <h3>使い方</h3>
          </div>
          <ul class="tool-info-list">
            <li>/swing コマンドは Minecraft 26.1 で追加された新コマンドです</li>
            <li>プレイヤーやエンティティの腕を振るアニメーションを再生します</li>
            <li>マネキン (armor_stand) のアニメーション制御などに使用できます</li>
          </ul>
        </section>
      </form>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  const targetSelect = $('#swing-target', container);
  const customInput = $('#swing-custom-target', container);

  // ターゲット変更
  if (targetSelect) {
    targetSelect.addEventListener('change', () => {
      if (targetSelect.value === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
      } else {
        customInput.style.display = 'none';
      }
      updateCommand();
    });
  }

  // カスタムターゲット入力
  if (customInput) {
    customInput.addEventListener('input', () => {
      updateCommand();
    });
  }

  // ハンド変更
  $$('input[name="swing-hand"]', container).forEach(radio => {
    radio.addEventListener('change', () => {
      updateCommand();
    });
  });

  // リセットボタン
  $('#swing-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期コマンド生成
  updateCommand();
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  const targetSelect = $('#swing-target', container);
  const customInput = $('#swing-custom-target', container);

  if (targetSelect) targetSelect.value = '@s';
  if (customInput) {
    customInput.value = '';
    customInput.style.display = 'none';
  }

  const mainhandRadio = document.querySelector('input[name="swing-hand"][value="mainhand"]');
  if (mainhandRadio) mainhandRadio.checked = true;

  updateCommand();
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const targetSelect = $('#swing-target');
  const customInput = $('#swing-custom-target');
  const hand = document.querySelector('input[name="swing-hand"]:checked')?.value || 'mainhand';

  let target = targetSelect?.value || '@s';
  if (target === 'custom') {
    target = customInput?.value?.trim() || '@s';
  }

  const command = `/swing ${target} ${hand}`;
  setOutput(command, 'swing', { target, hand });
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  /* ===== /swing ツールデザイン ===== */

  /* ヘッダー（紫系グラデーション - /swing用） */
  .swing-tool .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, #9b59b6 0%, #7d3c98 100%);
    border-radius: 8px 8px 0 0;
    margin: calc(-1 * var(--mc-space-lg));
    margin-bottom: var(--mc-space-lg);
  }

  .swing-tool .header-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .swing-tool .header-icon {
    width: 48px;
    height: 48px;
  }

  .swing-tool .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .swing-tool .header-subtitle {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.9);
  }

  .swing-tool .version-badge {
    background: rgba(0,0,0,0.3);
    color: white;
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 3px;
    margin-left: auto;
  }

  /* バージョン警告 */
  .mc-version-warning {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: rgba(255, 170, 0, 0.15);
    border: 2px solid var(--mc-color-gold, #FFAA00);
    border-radius: 8px;
    color: var(--mc-color-gold, #FFAA00);
    font-size: 0.9rem;
  }

  .mc-version-warning p {
    margin: 0;
  }

  /* セクション構造 */
  .swing-tool .form-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .swing-tool .section-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-sm);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .swing-tool .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #9b59b6 0%, #7d3c98 100%);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .swing-tool .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  /* ハンド選択オプション */
  .swing-tool .hand-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--mc-space-md);
  }

  .swing-tool .hand-options .option-label {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .swing-tool .hand-options .option-label:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .swing-tool .hand-options .option-label:has(input:checked) {
    background: linear-gradient(180deg, rgba(155, 89, 182, 0.3) 0%, rgba(125, 60, 152, 0.3) 100%);
    border-color: #9b59b6;
  }

  .swing-tool .hand-options input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #9b59b6;
  }

  /* 使い方セクション */
  .swing-tool .tool-info-section {
    background: linear-gradient(180deg, rgba(50,50,60,0.8) 0%, rgba(35,35,45,0.9) 100%);
    border-color: #4a4a5a;
  }

  .swing-tool .tool-info-section .step-number {
    background: linear-gradient(180deg, #6b9ac4 0%, #4a7aa3 100%);
  }

  .swing-tool .tool-info-list {
    margin: 0;
    padding-left: var(--mc-space-lg);
    color: #cccccc;
  }

  .swing-tool .tool-info-list li {
    margin-bottom: var(--mc-space-xs);
    font-size: 0.85rem;
  }
`;
document.head.appendChild(style);

export default { render, init };
