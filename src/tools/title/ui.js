/**
 * Title Generator - UI
 * minecraft.tools スタイルの高度なリッチテキストエディター
 */

import { $, $$, debounce } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { compareVersions, getVersionNote } from '../../core/version-compat.js';

let titleEditor = null;
let subtitleEditor = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const tempTitleEditor = new RichTextEditor('title-editor', {
    placeholder: 'タイトルを入力...',
    showClickEvent: false,
    showHoverEvent: false,
    showPreview: false,
  });

  const tempSubtitleEditor = new RichTextEditor('subtitle-editor', {
    placeholder: 'サブタイトルを入力...',
    showClickEvent: false,
    showHoverEvent: false,
    showPreview: false,
  });

  return `
    <style>${RICH_TEXT_EDITOR_CSS}</style>
    <div class="tool-panel title-tool mc-themed" id="title-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'name_tag')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/title コマンド</h2>
            <p class="header-subtitle">画面にテキストを表示</p>
          </div>
        </div>
        <span class="version-badge" id="title-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="title-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="title-version-note"></p>

      <!-- ゲーム画面風プレビュー -->
      <div class="mc-title-screen-preview" id="title-game-preview">
        <div class="mc-title-screen">
          <div class="mc-title-content">
            <div class="mc-main-title" id="title-preview-main">
              <span class="mc-color-white mc-placeholder">タイトル</span>
            </div>
            <div class="mc-subtitle" id="title-preview-sub">
              <span class="mc-color-white mc-placeholder">サブタイトル</span>
            </div>
          </div>
          <div class="mc-actionbar-area">
            <div class="mc-actionbar" id="title-preview-actionbar"></div>
            <div class="mc-hotbar">
              <div class="mc-hotbar-slot active"></div>
              <div class="mc-hotbar-slot"></div>
              <div class="mc-hotbar-slot"></div>
              <div class="mc-hotbar-slot"></div>
              <div class="mc-hotbar-slot"></div>
              <div class="mc-hotbar-slot"></div>
              <div class="mc-hotbar-slot"></div>
              <div class="mc-hotbar-slot"></div>
              <div class="mc-hotbar-slot"></div>
            </div>
          </div>
        </div>

        <!-- プレビュー統計バー -->
        <div class="preview-stats-bar">
          <div class="stat-item">
            <span class="stat-label">タイプ</span>
            <span class="stat-value" id="title-stat-type">タイトル</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">ターゲット</span>
            <span class="stat-value" id="title-stat-target">@a</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">文字数</span>
            <span class="stat-value" id="title-stat-chars">0</span>
          </div>
        </div>
      </div>

      <form class="tool-form mc-form" id="title-form">
        <!-- ステップ1: ターゲット選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>ターゲット選択</h3>
          </div>
          <select id="title-target" class="mc-select">
            <option value="@a">@a (全プレイヤー)</option>
            <option value="@p">@p (最も近いプレイヤー)</option>
            <option value="@s">@s (自分自身)</option>
            <option value="@r">@r (ランダムなプレイヤー)</option>
          </select>
        </section>

        <!-- ステップ2: 表示タイプ -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>表示タイプ</h3>
          </div>
          <div class="type-options">
            <label class="option-label">
              <input type="radio" name="title-type" value="title" checked>
              タイトル
            </label>
            <label class="option-label">
              <input type="radio" name="title-type" value="subtitle">
              サブタイトル
            </label>
            <label class="option-label">
              <input type="radio" name="title-type" value="actionbar">
              アクションバー
            </label>
            <label class="option-label">
              <input type="radio" name="title-type" value="both">
              タイトル + サブタイトル
            </label>
          </div>
        </section>

        <!-- ステップ3: テキスト入力 -->
        <section class="form-section mc-section" id="title-text-group">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>タイトルテキスト</h3>
          </div>
          <p class="section-hint">1文字ごとに色・書式を設定可能</p>
          ${tempTitleEditor.render()}
        </section>

        <!-- サブタイトルテキスト（高度なエディター） -->
        <section class="form-section mc-section" id="subtitle-text-group" style="display:none">
          <div class="section-header">
            <span class="step-number">3b</span>
            <h3>サブタイトルテキスト</h3>
          </div>
          ${tempSubtitleEditor.render()}
        </section>

        <!-- ステップ4: タイミング設定 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">4</span>
            <h3>タイミング設定 <span class="optional-badge">任意</span></h3>
          </div>
          <p class="section-hint">1チック = 1/20秒</p>
          <div class="timing-row">
            <div class="timing-item">
              <label for="title-fadein">フェードイン</label>
              <input type="number" id="title-fadein" class="mc-input" value="10" min="0" max="1000">
            </div>
            <div class="timing-item">
              <label for="title-stay">表示時間</label>
              <input type="number" id="title-stay" class="mc-input" value="70" min="0" max="10000">
            </div>
            <div class="timing-item">
              <label for="title-fadeout">フェードアウト</label>
              <input type="number" id="title-fadeout" class="mc-input" value="20" min="0" max="1000">
            </div>
          </div>
          <label class="option-label timing-checkbox">
            <input type="checkbox" id="title-include-times" checked>
            タイミング設定を含める
          </label>
        </section>

        <!-- ステップ5: 使い方 -->
        <section class="form-section mc-section tool-info-section">
          <div class="section-header">
            <span class="step-number">?</span>
            <h3>使い方</h3>
          </div>
          <ul class="tool-info-list">
            <li>テキストを入力し、範囲選択して色・書式を適用</li>
            <li>1文字ごとに異なる色・スタイルを設定可能</li>
            <li>Ctrl+B(太字)、Ctrl+I(斜体)、Ctrl+U(下線)のショートカット対応</li>
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
  // タイトルエディタ初期化
  titleEditor = new RichTextEditor('title-editor', {
    placeholder: 'タイトルを入力...',
    showClickEvent: false,
    showHoverEvent: false,
    showPreview: false,
    onChange: debounce(() => {
      updateGamePreview();
      updateCommand();
    }, 100),
  });
  titleEditor.init(container);

  // サブタイトルエディタ初期化
  subtitleEditor = new RichTextEditor('subtitle-editor', {
    placeholder: 'サブタイトルを入力...',
    showClickEvent: false,
    showHoverEvent: false,
    showPreview: false,
    onChange: debounce(() => {
      updateGamePreview();
      updateCommand();
    }, 100),
  });
  subtitleEditor.init(container);

  // 表示タイプ変更
  $$('input[name="title-type"]', container).forEach(radio => {
    radio.addEventListener('change', (e) => {
      const type = e.target.value;
      const titleGroup = $('#title-text-group', container);
      const subtitleGroup = $('#subtitle-text-group', container);

      if (type === 'subtitle') {
        titleGroup.style.display = 'none';
        subtitleGroup.style.display = 'block';
      } else if (type === 'both') {
        titleGroup.style.display = 'block';
        subtitleGroup.style.display = 'block';
      } else {
        titleGroup.style.display = 'block';
        subtitleGroup.style.display = 'none';
      }
      updateGamePreview();
      updateCommand();
    });
  });

  // その他のフォーム変更
  $('#title-target', container)?.addEventListener('change', updateCommand);
  $('#title-fadein', container)?.addEventListener('input', debounce(updateCommand, 150));
  $('#title-stay', container)?.addEventListener('input', debounce(updateCommand, 150));
  $('#title-fadeout', container)?.addEventListener('input', debounce(updateCommand, 150));
  $('#title-include-times', container)?.addEventListener('change', updateCommand);

  // グローバルバージョン変更時にコマンド再生成
  window.addEventListener('mc-version-change', () => {
    updateVersionDisplay(container);
    updateCommand();
  });

  // リセットボタン
  $('#title-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期表示
  updateVersionDisplay(container);
  updateGamePreview();
  updateCommand();
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // ターゲットをデフォルトに
  const targetSelect = $('#title-target', container);
  if (targetSelect) targetSelect.value = '@a';

  // 表示タイプをデフォルトに
  const titleRadio = document.querySelector('input[name="title-type"][value="title"]');
  if (titleRadio) {
    titleRadio.checked = true;
    const titleGroup = $('#title-text-group', container);
    const subtitleGroup = $('#subtitle-text-group', container);
    if (titleGroup) titleGroup.style.display = 'block';
    if (subtitleGroup) subtitleGroup.style.display = 'none';
  }

  // タイミング設定をデフォルトに
  const fadeInInput = $('#title-fadein', container);
  const stayInput = $('#title-stay', container);
  const fadeOutInput = $('#title-fadeout', container);
  if (fadeInInput) fadeInInput.value = '10';
  if (stayInput) stayInput.value = '70';
  if (fadeOutInput) fadeOutInput.value = '20';

  // タイミングを含めるチェックボックス
  const includeTimesCheckbox = $('#title-include-times', container);
  if (includeTimesCheckbox) includeTimesCheckbox.checked = true;

  // エディタをクリア
  if (titleEditor) titleEditor.clear(container);
  if (subtitleEditor) subtitleEditor.clear(container);

  // 更新
  updateGamePreview();
  updateCommand();
}

/**
 * バージョン表示を更新
 */
function updateVersionDisplay(container) {
  const version = workspaceStore.get('version') || '1.21';
  const badge = $('#title-version-badge', container);
  const note = $('#title-version-note', container);

  if (badge) {
    badge.textContent = version + '+';
  }
  if (note) {
    if (compareVersions(version, '1.8') < 0) {
      note.textContent = '注意: このバージョンでは /title コマンドは使用できません';
      note.style.color = 'var(--mc-color-redstone)';
    } else if (compareVersions(version, '1.16') < 0) {
      note.textContent = `${version} - HEXカラーは非対応（16色のみ）`;
      note.style.color = 'var(--mc-color-gold)';
    } else {
      note.textContent = getVersionNote(version);
      note.style.color = 'var(--mc-color-diamond)';
    }
  }
}

/**
 * ゲーム画面プレビューを更新
 */
function updateGamePreview() {
  const type = document.querySelector('input[name="title-type"]:checked')?.value || 'title';
  const target = $('#title-target')?.value || '@a';

  const mainTitle = document.getElementById('title-preview-main');
  const subtitle = document.getElementById('title-preview-sub');
  const actionbar = document.getElementById('title-preview-actionbar');

  if (!mainTitle || !subtitle || !actionbar) return;

  // リセット
  mainTitle.innerHTML = '';
  subtitle.innerHTML = '';
  actionbar.innerHTML = '';
  mainTitle.style.display = 'none';
  subtitle.style.display = 'none';
  actionbar.style.display = 'none';

  const titleGroups = titleEditor?.getFormattedGroups() || [];
  const subtitleGroups = subtitleEditor?.getFormattedGroups() || [];

  if (type === 'title' || type === 'both') {
    mainTitle.style.display = 'block';
    mainTitle.innerHTML = renderGroups(titleGroups, true);
  }

  if (type === 'subtitle' || type === 'both') {
    subtitle.style.display = 'block';
    const groups = subtitleGroups.length > 0 ? subtitleGroups : (type === 'both' ? [] : titleGroups);
    subtitle.innerHTML = renderGroups(groups, false);
  }

  if (type === 'actionbar') {
    actionbar.style.display = 'block';
    actionbar.innerHTML = renderGroups(titleGroups, false);
  }

  // 統計バー更新
  updateTitleStats(target, type, titleGroups, subtitleGroups);
}

/**
 * グループをHTMLにレンダリング
 */
function renderGroups(groups, isMainTitle) {
  if (!groups || groups.length === 0) {
    const placeholder = isMainTitle ? 'タイトル' : 'サブタイトル';
    return `<span class="mc-color-white mc-placeholder">${placeholder}</span>`;
  }

  return groups.map((group, index) => {
    const classes = ['mc-text-segment'];

    // 色クラス
    if (group.color) {
      if (group.color.startsWith('#')) {
        // HEXカラーはインラインスタイル
      } else {
        classes.push(`mc-color-${group.color.replace('_', '-')}`);
      }
    } else {
      classes.push('mc-color-white');
    }

    // スタイルクラス
    if (group.bold) classes.push('mc-bold');
    if (group.italic) classes.push('mc-italic');
    if (group.underlined) classes.push('mc-underlined');
    if (group.strikethrough) classes.push('mc-strikethrough');
    if (group.obfuscated) classes.push('mc-obfuscated');

    const style = group.color?.startsWith('#') ? `color: ${group.color};` : '';
    const text = escapeHtml(group.text).replace(/\n/g, '<br>');

    if (group.obfuscated) {
      return `<span class="${classes.join(' ')}" style="${style}" data-text="${escapeHtml(group.text)}" data-index="${index}">${text}</span>`;
    }

    return `<span class="${classes.join(' ')}" style="${style}">${text}</span>`;
  }).join('');
}

/**
 * 統計バーを更新
 */
function updateTitleStats(target, type, titleGroups, subtitleGroups) {
  const statTypeEl = document.getElementById('title-stat-type');
  const statTargetEl = document.getElementById('title-stat-target');
  const statCharsEl = document.getElementById('title-stat-chars');

  const typeNames = {
    title: 'タイトル',
    subtitle: 'サブタイトル',
    actionbar: 'アクションバー',
    both: 'タイトル+サブ'
  };

  if (statTypeEl) statTypeEl.textContent = typeNames[type] || 'タイトル';
  if (statTargetEl) statTargetEl.textContent = target;

  if (statCharsEl) {
    let totalChars = 0;
    titleGroups.forEach(g => totalChars += (g.text || '').length);
    if (type === 'both' || type === 'subtitle') {
      subtitleGroups.forEach(g => totalChars += (g.text || '').length);
    }
    statCharsEl.textContent = totalChars;
  }
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const target = $('#title-target')?.value || '@a';
  const type = document.querySelector('input[name="title-type"]:checked')?.value || 'title';
  const includeTimes = $('#title-include-times')?.checked;

  const fadeIn = parseInt($('#title-fadein')?.value) || 10;
  const stay = parseInt($('#title-stay')?.value) || 70;
  const fadeOut = parseInt($('#title-fadeout')?.value) || 20;

  const globalVersion = workspaceStore.get('version') || '1.21';
  const commands = [];

  // タイミング設定
  if (includeTimes) {
    commands.push(`/title ${target} times ${fadeIn} ${stay} ${fadeOut}`);
  }

  // コマンド生成
  if (type === 'title' || type === 'both') {
    const json = titleEditor?.getOutput(globalVersion) || '""';
    commands.push(`/title ${target} title ${json}`);
  }

  if (type === 'subtitle' || type === 'both') {
    const subtitleGroups = subtitleEditor?.getFormattedGroups() || [];
    const useSubtitle = subtitleGroups.length > 0;
    const json = useSubtitle
      ? subtitleEditor.getOutput(globalVersion)
      : titleEditor?.getOutput(globalVersion) || '""';
    commands.push(`/title ${target} subtitle ${json}`);
  }

  if (type === 'actionbar') {
    const json = titleEditor?.getOutput(globalVersion) || '""';
    commands.push(`/title ${target} actionbar ${json}`);
  }

  const command = commands.join('\n');
  setOutput(command, 'title', { target, type, fadeIn, stay, fadeOut, version: globalVersion });
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
  /* ===== summonツール統一デザイン ===== */

  /* ヘッダー（黄色系グラデーション - /title用） */
  .title-tool .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, #f5c542 0%, #d4a120 100%);
    border-radius: 8px 8px 0 0;
    margin: calc(-1 * var(--mc-space-lg));
    margin-bottom: var(--mc-space-lg);
  }

  .title-tool .header-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .title-tool .header-icon {
    width: 48px;
    height: 48px;
  }

  .title-tool .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .title-tool .header-subtitle {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.9);
  }

  .title-tool .version-badge {
    background: rgba(0,0,0,0.3);
    color: white;
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 3px;
    margin-left: auto;
  }

  /* セクション構造 */
  .title-tool .form-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .title-tool .section-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-sm);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .title-tool .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #f5c542 0%, #d4a120 100%);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .title-tool .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  .title-tool .optional-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    background: rgba(255,255,255,0.15);
    border-radius: 4px;
    color: #aaaaaa;
    margin-left: 8px;
  }

  .title-tool .section-hint {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.85rem;
    color: #aaaaaa;
  }

  /* 表示タイプオプション */
  .title-tool .type-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--mc-space-md);
  }

  .title-tool .type-options .option-label {
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

  .title-tool .type-options .option-label:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .title-tool .type-options .option-label:has(input:checked) {
    background: linear-gradient(180deg, rgba(245, 197, 66, 0.3) 0%, rgba(212, 161, 32, 0.3) 100%);
    border-color: #f5c542;
  }

  .title-tool .type-options input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #f5c542;
  }

  /* タイミング設定 */
  .title-tool .timing-row {
    display: flex;
    gap: var(--mc-space-md);
    flex-wrap: wrap;
    margin-bottom: var(--mc-space-md);
  }

  .title-tool .timing-item {
    flex: 1;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
  }

  .title-tool .timing-item label {
    font-size: 0.8rem;
    color: #cccccc;
  }

  .title-tool .timing-item input {
    width: 100%;
    background: #2a2a2a;
    color: #ffffff;
    border: 2px solid #444444;
    border-radius: 4px;
    padding: 8px 12px;
  }

  .title-tool .timing-checkbox {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    cursor: pointer;
    color: #ffffff;
  }

  .title-tool .timing-checkbox:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
  }

  .title-tool .timing-checkbox:has(input:checked) {
    background: linear-gradient(180deg, rgba(245, 197, 66, 0.3) 0%, rgba(212, 161, 32, 0.3) 100%);
    border-color: #f5c542;
  }

  .title-tool .timing-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #f5c542;
  }

  /* 使い方セクション */
  .title-tool .tool-info-section {
    background: linear-gradient(180deg, rgba(50,50,60,0.8) 0%, rgba(35,35,45,0.9) 100%);
    border-color: #4a4a5a;
  }

  .title-tool .tool-info-section .step-number {
    background: linear-gradient(180deg, #6b9ac4 0%, #4a7aa3 100%);
  }

  .title-tool .tool-info-list {
    margin: 0;
    padding-left: var(--mc-space-lg);
    color: #cccccc;
  }

  .title-tool .tool-info-list li {
    margin-bottom: var(--mc-space-xs);
    font-size: 0.85rem;
  }

  /* ゲーム画面風プレビュー */
  .mc-title-screen-preview {
    margin-bottom: var(--mc-space-lg);
    border: 2px solid var(--mc-border-dark);
    border-radius: 4px;
    overflow: hidden;
  }

  .mc-title-screen {
    position: relative;
    background: linear-gradient(180deg, #78A7FF 0%, #6B9AE8 50%, #5B8AD8 100%);
    min-height: 280px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .mc-title-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: linear-gradient(180deg,
      rgba(0,0,0,0.1) 0%,
      rgba(0,0,0,0.3) 40%,
      rgba(0,0,0,0.3) 60%,
      rgba(0,0,0,0.1) 100%
    );
  }

  .mc-main-title {
    font-family: 'Minecraft', 'Courier New', monospace;
    font-size: 48px;
    line-height: 1.2;
    text-align: center;
    -webkit-font-smoothing: none;
    margin-bottom: 8px;
  }

  .mc-main-title .mc-color-white { text-shadow: 4px 4px 0 #3f3f3f; }
  .mc-main-title .mc-color-gold { text-shadow: 4px 4px 0 #2a2a00; }
  .mc-main-title .mc-color-red { text-shadow: 4px 4px 0 #3f1515; }
  .mc-main-title .mc-color-aqua { text-shadow: 4px 4px 0 #153f3f; }
  .mc-main-title .mc-color-green { text-shadow: 4px 4px 0 #153f15; }
  .mc-main-title .mc-color-yellow { text-shadow: 4px 4px 0 #3f3f15; }
  .mc-main-title .mc-color-light-purple { text-shadow: 4px 4px 0 #3f153f; }
  .mc-main-title .mc-color-blue { text-shadow: 4px 4px 0 #15153f; }

  .mc-subtitle {
    font-family: 'Minecraft', 'Courier New', monospace;
    font-size: 24px;
    line-height: 1.2;
    text-align: center;
    -webkit-font-smoothing: none;
  }

  .mc-subtitle .mc-color-white { text-shadow: 2px 2px 0 #3f3f3f; }

  .mc-placeholder {
    opacity: 0.5;
  }

  .mc-actionbar-area {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .mc-actionbar {
    font-family: 'Minecraft', 'Courier New', monospace;
    font-size: 16px;
    text-align: center;
    padding: 4px 12px;
    margin-bottom: 4px;
    -webkit-font-smoothing: none;
    display: none;
  }

  .mc-hotbar {
    display: flex;
    justify-content: center;
    gap: 2px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.3);
  }

  .mc-hotbar-slot {
    width: 36px;
    height: 36px;
    background: rgba(139, 139, 139, 0.5);
    border: 2px solid;
    border-color: #373737 #ffffff #ffffff #373737;
    box-sizing: border-box;
  }

  .mc-hotbar-slot.active {
    border-color: #ffffff #373737 #373737 #ffffff;
    background: rgba(200, 200, 200, 0.6);
  }

  /* Minecraft カラークラス */
  .mc-color-black { color: #000000; text-shadow: 2px 2px 0 #000000; }
  .mc-color-dark-blue { color: #0000AA; text-shadow: 2px 2px 0 #00002A; }
  .mc-color-dark-green { color: #00AA00; text-shadow: 2px 2px 0 #002A00; }
  .mc-color-dark-aqua { color: #00AAAA; text-shadow: 2px 2px 0 #002A2A; }
  .mc-color-dark-red { color: #AA0000; text-shadow: 2px 2px 0 #2A0000; }
  .mc-color-dark-purple { color: #AA00AA; text-shadow: 2px 2px 0 #2A002A; }
  .mc-color-gold { color: #FFAA00; text-shadow: 2px 2px 0 #2A2A00; }
  .mc-color-gray { color: #AAAAAA; text-shadow: 2px 2px 0 #2A2A2A; }
  .mc-color-dark-gray { color: #555555; text-shadow: 2px 2px 0 #151515; }
  .mc-color-blue { color: #5555FF; text-shadow: 2px 2px 0 #15153F; }
  .mc-color-green { color: #55FF55; text-shadow: 2px 2px 0 #153F15; }
  .mc-color-aqua { color: #55FFFF; text-shadow: 2px 2px 0 #153F3F; }
  .mc-color-red { color: #FF5555; text-shadow: 2px 2px 0 #3F1515; }
  .mc-color-light-purple { color: #FF55FF; text-shadow: 2px 2px 0 #3F153F; }
  .mc-color-yellow { color: #FFFF55; text-shadow: 2px 2px 0 #3F3F15; }
  .mc-color-white { color: #FFFFFF; text-shadow: 2px 2px 0 #3F3F3F; }

  .mc-bold { font-weight: bold; }
  .mc-italic { font-style: italic; }
  .mc-underlined { text-decoration: underline; }
  .mc-strikethrough { text-decoration: line-through; }
  .mc-obfuscated { font-family: 'Minecraft', monospace; letter-spacing: 1px; }

  /* プレビュー統計バー */
  .preview-stats-bar {
    display: flex;
    gap: var(--mc-space-lg);
    padding: var(--mc-space-sm) var(--mc-space-md);
    margin-top: var(--mc-space-sm);
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preview-stats-bar .stat-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
  }

  .preview-stats-bar .stat-label {
    font-size: 0.75rem;
    color: #888;
  }

  .preview-stats-bar .stat-value {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--mc-color-diamond, #55ffff);
    font-family: var(--mc-font-mono, monospace);
  }
`;
document.head.appendChild(style);

export default { render, init };
