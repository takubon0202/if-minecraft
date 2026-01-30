/**
 * Title Generator - UI
 */

import { $, $$, debounce } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import {
  renderJsonTextEditor,
  initJsonTextEditor,
  componentsToJson,
  setEditorData,
} from '../../components/json-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { compareVersions, getVersionNote } from '../../core/version-compat.js';

let titleEditor = null;
let subtitleEditor = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel title-tool" id="title-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'name_tag')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="version-badge" id="title-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="title-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="title-version-note"></p>

      <!-- ゲーム画面風プレビュー -->
      <div class="mc-title-screen-preview" id="title-game-preview">
        <div class="mc-title-screen">
          <div class="mc-title-content">
            <div class="mc-main-title" id="title-preview-main">
              <span class="mc-color-white">タイトル</span>
            </div>
            <div class="mc-subtitle" id="title-preview-sub">
              <span class="mc-color-white">サブタイトル</span>
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

      <form class="tool-form" id="title-form">
        <!-- ターゲット -->
        <div class="form-group">
          <label for="title-target">ターゲット</label>
          <select id="title-target" class="mc-select">
            <option value="@a">@a (全プレイヤー)</option>
            <option value="@p">@p (最も近いプレイヤー)</option>
            <option value="@s">@s (自分自身)</option>
            <option value="@r">@r (ランダムなプレイヤー)</option>
          </select>
        </div>

        <!-- 表示タイプ -->
        <div class="form-group">
          <label>表示タイプ</label>
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
        </div>

        <!-- タイトルテキスト -->
        <div class="form-group" id="title-text-group">
          <label>タイトルテキスト</label>
          ${renderJsonTextEditor('title-editor', {
            showClickEvent: false,
            showHoverEvent: false,
          })}
        </div>

        <!-- サブタイトルテキスト -->
        <div class="form-group" id="subtitle-text-group" style="display:none">
          <label>サブタイトルテキスト</label>
          ${renderJsonTextEditor('subtitle-editor', {
            showClickEvent: false,
            showHoverEvent: false,
          })}
        </div>

        <!-- タイミング設定 -->
        <div class="form-group">
          <label>表示タイミング（チック = 1/20秒）</label>
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
        </div>

        <!-- タイミングを含めるか -->
        <div class="form-group">
          <label class="option-label">
            <input type="checkbox" id="title-include-times" checked>
            タイミング設定を含める
          </label>
        </div>
      </form>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // エディタ初期化
  titleEditor = initJsonTextEditor('title-editor', debounce(updateCommand, 150));
  subtitleEditor = initJsonTextEditor('subtitle-editor', debounce(updateCommand, 150));

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
    // 表示状態も更新
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

  // エディタをリセット
  setEditorData('title-editor', []);
  setEditorData('subtitle-editor', []);

  // コマンド更新
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
    // titleが使えないバージョンの警告
    if (compareVersions(version, '1.8') < 0) {
      note.textContent = '注意: このバージョンでは /title コマンドは使用できません';
      note.style.color = 'var(--mc-color-redstone)';
    } else {
      note.textContent = getVersionNote(version);
      note.style.color = 'var(--mc-color-diamond)';
    }
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

  const titleComponents = titleEditor?.getData() || [];
  const subtitleComponents = subtitleEditor?.getData() || [];

  // ゲーム画面プレビューを更新
  updateGamePreview(type, titleComponents, subtitleComponents);

  // 統計バーを更新
  updateTitleStats(target, type, titleComponents, subtitleComponents);

  // 現在のバージョンを取得
  const globalVersion = workspaceStore.get('version') || '1.21';

  // バージョンをcomponentsToJson用の形式に変換
  let jsonVersion = '1.21.5+';
  if (compareVersions(globalVersion, '1.21') >= 0) {
    jsonVersion = '1.21.5+';
  } else if (compareVersions(globalVersion, '1.20') >= 0) {
    jsonVersion = '1.20+';
  } else if (compareVersions(globalVersion, '1.16') >= 0) {
    jsonVersion = '1.16+';
  } else if (compareVersions(globalVersion, '1.13') >= 0) {
    jsonVersion = '1.13+';
  } else {
    jsonVersion = '1.12-';
  }

  const commands = [];

  // タイミング設定
  if (includeTimes) {
    commands.push(`/title ${target} times ${fadeIn} ${stay} ${fadeOut}`);
  }

  // コマンド生成（バージョン対応）
  const jsonOptions = { version: jsonVersion };

  if (type === 'title' || type === 'both') {
    const json = componentsToJson(titleComponents, jsonOptions);
    commands.push(`/title ${target} title ${json}`);
  }

  if (type === 'subtitle' || type === 'both') {
    const json = componentsToJson(subtitleComponents.length > 0 ? subtitleComponents : titleComponents, jsonOptions);
    commands.push(`/title ${target} subtitle ${json}`);
  }

  if (type === 'actionbar') {
    const json = componentsToJson(titleComponents, jsonOptions);
    commands.push(`/title ${target} actionbar ${json}`);
  }

  const command = commands.join('\n');
  setOutput(command, 'title', { target, type, fadeIn, stay, fadeOut, version: globalVersion });
}

/**
 * ゲーム画面プレビューを更新
 */
function updateGamePreview(type, titleComponents, subtitleComponents) {
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

  if (type === 'title' || type === 'both') {
    mainTitle.style.display = 'block';
    mainTitle.innerHTML = renderComponents(titleComponents, true);
    startTitleObfuscatedAnimation('title-preview-main');
  }

  if (type === 'subtitle' || type === 'both') {
    subtitle.style.display = 'block';
    const subComps = subtitleComponents.length > 0 ? subtitleComponents : (type === 'both' ? [] : titleComponents);
    subtitle.innerHTML = renderComponents(subComps, false);
    startTitleObfuscatedAnimation('title-preview-sub');
  }

  if (type === 'actionbar') {
    actionbar.style.display = 'block';
    actionbar.innerHTML = renderComponents(titleComponents, false);
    startTitleObfuscatedAnimation('title-preview-actionbar');
  }
}

/**
 * 統計バーを更新
 */
function updateTitleStats(target, type, titleComponents, subtitleComponents) {
  const statTypeEl = document.getElementById('title-stat-type');
  const statTargetEl = document.getElementById('title-stat-target');
  const statCharsEl = document.getElementById('title-stat-chars');

  // タイプ表示
  const typeNames = {
    title: 'タイトル',
    subtitle: 'サブタイトル',
    actionbar: 'アクションバー',
    both: 'タイトル+サブ'
  };
  if (statTypeEl) {
    statTypeEl.textContent = typeNames[type] || 'タイトル';
  }

  // ターゲット表示
  if (statTargetEl) {
    statTargetEl.textContent = target;
  }

  // 文字数を計算
  if (statCharsEl) {
    let totalChars = 0;
    titleComponents.forEach(c => {
      totalChars += (c.text || '').length;
    });
    if (type === 'both' || type === 'subtitle') {
      subtitleComponents.forEach(c => {
        totalChars += (c.text || '').length;
      });
    }
    statCharsEl.textContent = totalChars;
  }
}

/**
 * コンポーネントをHTMLにレンダリング
 */
function renderComponents(components, isMainTitle) {
  if (!components || components.length === 0) {
    const placeholder = isMainTitle ? 'タイトル' : 'サブタイトル';
    return `<span class="mc-color-white mc-placeholder">${placeholder}</span>`;
  }

  return components.map((comp, index) => {
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

    // 難読化テキスト
    if (comp.obfuscated) {
      classes.push('mc-obfuscated');
      return `<span class="${classes.join(' ')}" data-text="${escapeHtml(comp.text)}" data-index="${index}">${escapeHtml(comp.text)}</span>`;
    }

    return `<span class="${classes.join(' ')}">${escapeHtml(comp.text)}</span>`;
  }).join('');
}

// 難読化アニメーション
const titleObfuscatedIntervals = new Map();
const OBFUSCATED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

function startTitleObfuscatedAnimation(elementId) {
  // 既存のインターバルをクリア
  const existingInterval = titleObfuscatedIntervals.get(elementId);
  if (existingInterval) {
    clearInterval(existingInterval);
  }

  const container = document.getElementById(elementId);
  if (!container) return;

  const obfuscatedElements = container.querySelectorAll('.mc-obfuscated');
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

  titleObfuscatedIntervals.set(elementId, intervalId);
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
  .title-tool .version-badge {
    background: var(--mc-color-grass-main);
    color: white;
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 3px;
    margin-left: auto;
  }

  .type-options {
    display: flex;
    gap: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .timing-row {
    display: flex;
    gap: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .timing-item {
    flex: 1;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
  }

  .timing-item label {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .timing-item input {
    width: 100%;
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

  /* タイトルコンテンツ（中央揃え） */
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

  /* アクションバーエリア */
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

  /* ホットバー */
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
