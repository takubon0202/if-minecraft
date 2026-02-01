/**
 * Tellraw Generator - UI
 * minecraft.tools スタイルの高度なリッチテキストエディター
 */

import { $, debounce } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { getVersionNote, compareVersions } from '../../core/version-compat.js';

let editor = null;

// CSSをdocument.headに追加
const rteStyleElement = document.createElement('style');
rteStyleElement.textContent = RICH_TEXT_EDITOR_CSS;
document.head.appendChild(rteStyleElement);

// ターゲットセレクター
const TARGET_OPTIONS = [
  { id: '@a', name: '全プレイヤー', icon: 'ender_eye' },
  { id: '@p', name: '最も近いプレイヤー', icon: 'player_head' },
  { id: '@s', name: '自分自身', icon: 'armor_stand' },
  { id: '@r', name: 'ランダム', icon: 'experience_bottle' },
];

// フォーム状態
let formState = {
  target: '@a',
};

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const tempEditor = new RichTextEditor('tellraw-editor', {
    placeholder: 'メッセージを入力...',
    showClickEvent: true,
    showHoverEvent: true,
    showPreview: false,
  });

  return `
    <div class="tool-panel tellraw-tool mc-themed" id="tellraw-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'paper')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/tellraw コマンド</h2>
            <p class="header-subtitle">リッチテキストメッセージを送信</p>
          </div>
        </div>
        <span class="version-badge" id="tellraw-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="tellraw-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="tellraw-version-note"></p>

      <!-- ゲーム画面風プレビュー -->
      <div class="mc-game-screen-preview" id="tellraw-game-preview">
        <div class="mc-game-screen">
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
          <div class="mc-chat-area" id="tellraw-chat-preview">
            <div class="mc-chat-message">
              <span class="mc-color-white mc-placeholder">テキストを入力するとここにプレビューが表示されます</span>
            </div>
          </div>
        </div>
      </div>

      <form class="tool-form mc-form" id="tellraw-form">
        <!-- ステップ1: ターゲット選択 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>ターゲット選択</h3>
          </div>

          <div class="target-selector-grid">
            ${TARGET_OPTIONS.map(t => `
              <button type="button" class="target-option ${t.id === '@a' ? 'active' : ''}" data-target="${t.id}">
                <img src="${getInviconUrl(t.icon)}" alt="" class="target-icon mc-pixelated" onerror="this.style.opacity='0.3'">
                <div class="target-info">
                  <span class="target-id">${t.id}</span>
                  <span class="target-desc">${t.name}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </section>

        <!-- ステップ2: メッセージ入力 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>メッセージ内容</h3>
          </div>
          <p class="section-desc">1文字ごとに色・書式を設定可能</p>
          ${tempEditor.render()}
        </section>

        <!-- ステップ3: 使い方ガイド -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>使い方ガイド</h3>
          </div>

          <div class="behavior-grid">
            <div class="guide-card">
              <img src="${getInviconUrl('book')}" alt="" class="guide-icon mc-pixelated">
              <div class="guide-text">
                <span class="guide-title">テキスト選択</span>
                <span class="guide-desc">範囲選択して色・書式を適用</span>
              </div>
            </div>
            <div class="guide-card">
              <img src="${getInviconUrl('name_tag')}" alt="" class="guide-icon mc-pixelated">
              <div class="guide-text">
                <span class="guide-title">カラー適用</span>
                <span class="guide-desc">16色 + HEXカラー対応</span>
              </div>
            </div>
            <div class="guide-card">
              <img src="${getInviconUrl('oak_sign')}" alt="" class="guide-icon mc-pixelated">
              <div class="guide-text">
                <span class="guide-title">イベント</span>
                <span class="guide-desc">クリック/ホバーで対話機能追加</span>
              </div>
            </div>
            <div class="guide-card">
              <img src="${getInviconUrl('command_block')}" alt="" class="guide-icon mc-pixelated">
              <div class="guide-text">
                <span class="guide-title">ショートカット</span>
                <span class="guide-desc">Ctrl+B/I/U で書式適用</span>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // RichTextEditor初期化
  editor = new RichTextEditor('tellraw-editor', {
    placeholder: 'メッセージを入力...',
    showClickEvent: true,
    showHoverEvent: true,
    showPreview: false,
  });

  editor.init(container);

  // onChangeコールバックを設定
  editor.options.onChange = debounce(() => {
    updateGamePreview();
    updateCommand();
  }, 100);

  // ターゲット選択
  const targetButtons = container.querySelectorAll('.target-option');
  targetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      targetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      formState.target = btn.dataset.target;
      updateCommand();
    });
  });

  // グローバルバージョン変更時にコマンド再生成
  window.addEventListener('mc-version-change', () => {
    updateVersionDisplay();
    updateCommand();
  });

  // リセットボタン
  $('#tellraw-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期表示
  updateVersionDisplay();
  updateCommand();
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // ターゲットをデフォルトに
  const targetButtons = container.querySelectorAll('.target-option');
  targetButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.target === '@a') {
      btn.classList.add('active');
    }
  });
  formState.target = '@a';

  // エディターをクリア
  if (editor) {
    editor.clear(container);
  }

  // コマンド更新
  updateCommand();
}

/**
 * バージョン表示を更新
 */
function updateVersionDisplay() {
  const version = workspaceStore.get('version') || '1.21';
  const note = document.getElementById('tellraw-version-note');
  const badge = document.getElementById('tellraw-version-badge');

  if (badge) {
    badge.textContent = version + '+';
  }

  if (note) {
    const versionNote = getVersionNote(version);

    // tellrawが使えないバージョンの警告
    if (compareVersions(version, '1.7') < 0) {
      note.textContent = '注意: このバージョンでは /tellraw コマンドは使用できません';
      note.style.color = 'var(--mc-color-redstone)';
    } else if (compareVersions(version, '1.16') < 0) {
      note.textContent = `${version} - HEXカラーは非対応（16色のみ）`;
      note.style.color = 'var(--mc-color-gold)';
    } else {
      note.textContent = `現在のバージョン: ${version} - ${versionNote}`;
      note.style.color = 'var(--mc-color-diamond)';
    }
  }
}

/**
 * ゲーム画面プレビューを更新
 */
function updateGamePreview() {
  const chatPreview = document.getElementById('tellraw-chat-preview');
  if (!chatPreview || !editor) return;

  const groups = editor.getFormattedGroups();

  if (!groups || groups.length === 0) {
    chatPreview.innerHTML = `
      <div class="mc-chat-message">
        <span class="mc-color-white mc-placeholder">テキストを入力するとここにプレビューが表示されます</span>
      </div>
    `;
    return;
  }

  const messageHtml = groups.map((group, index) => {
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

    // 難読化テキスト
    if (group.obfuscated) {
      return `<span class="${classes.join(' ')}" style="${style}" data-text="${escapeHtml(group.text)}" data-index="${index}">${text}</span>`;
    }

    return `<span class="${classes.join(' ')}" style="${style}">${text}</span>`;
  }).join('');

  chatPreview.innerHTML = `<div class="mc-chat-message">${messageHtml}</div>`;

  // 難読化アニメーション
  startChatObfuscatedAnimation();
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const target = formState.target || '@a';
  const globalVersion = workspaceStore.get('version') || '1.21';

  if (!editor) return;

  // JSON形式で出力（tellrawはJSON Text Component形式を使用）
  const jsonText = editor.getJSON();

  if (!jsonText) {
    setOutput(`/tellraw ${target} ""`, 'tellraw', { target, version: globalVersion });
    return;
  }

  const command = `/tellraw ${target} ${jsonText}`;

  setOutput(command, 'tellraw', { target, version: globalVersion });
}

// 難読化アニメーション
let chatObfuscatedInterval = null;
const OBFUSCATED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

function startChatObfuscatedAnimation() {
  if (chatObfuscatedInterval) {
    clearInterval(chatObfuscatedInterval);
  }

  const chatPreview = document.getElementById('tellraw-chat-preview');
  if (!chatPreview) return;

  const obfuscatedElements = chatPreview.querySelectorAll('.mc-obfuscated');
  if (obfuscatedElements.length === 0) return;

  chatObfuscatedInterval = setInterval(() => {
    obfuscatedElements.forEach(el => {
      const originalText = el.dataset.text || '';
      let newText = '';
      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === ' ' || originalText[i] === '\n') {
          newText += originalText[i] === '\n' ? '<br>' : ' ';
        } else {
          newText += OBFUSCATED_CHARS[Math.floor(Math.random() * OBFUSCATED_CHARS.length)];
        }
      }
      el.innerHTML = newText;
    });
  }, 50);
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
  /* ===== tellrawツール統一デザイン ===== */

  /* ヘッダー（黄色系グラデーション - コミュニケーション系ツール） */
  .tellraw-tool .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, #f5c842 0%, #d4a012 100%);
    border-radius: 8px 8px 0 0;
    margin: calc(-1 * var(--mc-space-lg));
    margin-bottom: var(--mc-space-lg);
  }

  .tellraw-tool .header-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .tellraw-tool .header-icon {
    width: 48px;
    height: 48px;
  }

  .tellraw-tool .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #1a1a1a;
    text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
  }

  .tellraw-tool .header-subtitle {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: rgba(0,0,0,0.7);
  }

  .tellraw-tool .version-badge {
    background: rgba(0,0,0,0.2);
    color: #1a1a1a;
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 3px;
    margin-left: auto;
  }

  .tellraw-tool .reset-btn {
    background: rgba(0,0,0,0.2);
    color: #1a1a1a;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.15s;
  }

  .tellraw-tool .reset-btn:hover {
    background: rgba(0,0,0,0.3);
  }

  .tellraw-tool .version-note {
    margin-top: var(--mc-space-sm);
    font-size: 0.75rem;
    color: var(--mc-color-diamond);
    font-style: italic;
  }

  /* セクション構造 */
  .tellraw-tool .form-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .tellraw-tool .section-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-sm);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .tellraw-tool .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #f5c842 0%, #d4a012 100%);
    color: #1a1a1a;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
  }

  .tellraw-tool .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  .tellraw-tool .section-desc {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.85rem;
    color: #aaaaaa;
  }

  /* ターゲット選択グリッド */
  .tellraw-tool .target-selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--mc-space-md);
  }

  .tellraw-tool .target-option {
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

  .tellraw-tool .target-option:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .tellraw-tool .target-option.active {
    background: linear-gradient(180deg, rgba(245, 200, 66, 0.3) 0%, rgba(212, 160, 18, 0.3) 100%);
    border-color: #f5c842;
  }

  .tellraw-tool .target-option .target-icon {
    width: 32px;
    height: 32px;
  }

  .tellraw-tool .target-option .target-info {
    display: flex;
    flex-direction: column;
  }

  .tellraw-tool .target-option .target-id {
    font-weight: bold;
    color: #ffffff;
    font-family: var(--mc-font-mono);
  }

  .tellraw-tool .target-option .target-desc {
    font-size: 0.75rem;
    color: #aaaaaa;
  }

  /* behavior-grid（ガイドカード用） */
  .tellraw-tool .behavior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--mc-space-md);
  }

  .tellraw-tool .guide-card {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    transition: all 0.15s;
  }

  .tellraw-tool .guide-card:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .tellraw-tool .guide-icon {
    width: 32px;
    height: 32px;
  }

  .tellraw-tool .guide-text {
    display: flex;
    flex-direction: column;
  }

  .tellraw-tool .guide-title {
    font-weight: bold;
    color: #ffffff;
    font-size: 0.9rem;
  }

  .tellraw-tool .guide-desc {
    font-size: 0.75rem;
    color: #aaaaaa;
  }

  /* ゲーム画面風プレビュー */
  .tellraw-tool .mc-game-screen-preview {
    margin-bottom: var(--mc-space-lg);
    border: 2px solid var(--mc-border-dark);
    border-radius: 4px;
    overflow: hidden;
  }

  .tellraw-tool .mc-game-screen {
    position: relative;
    background: linear-gradient(180deg, #78A7FF 0%, #6B9AE8 50%, #5B8AD8 100%);
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  /* チャットエリア */
  .tellraw-tool .mc-chat-area {
    background: rgba(0, 0, 0, 0.5);
    padding: 8px 12px;
    max-height: 120px;
    overflow-y: auto;
    font-family: 'Minecraft', 'Courier New', monospace;
    font-size: 16px;
    line-height: 1.4;
    -webkit-font-smoothing: none;
  }

  .tellraw-tool .mc-chat-message {
    margin-bottom: 2px;
  }

  .tellraw-tool .mc-placeholder {
    opacity: 0.6;
    font-style: italic;
  }

  /* ホットバー */
  .tellraw-tool .mc-hotbar {
    display: flex;
    justify-content: center;
    gap: 2px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.3);
  }

  .tellraw-tool .mc-hotbar-slot {
    width: 36px;
    height: 36px;
    background: rgba(139, 139, 139, 0.5);
    border: 2px solid;
    border-color: #373737 #ffffff #ffffff #373737;
    box-sizing: border-box;
  }

  .tellraw-tool .mc-hotbar-slot.active {
    border-color: #ffffff #373737 #373737 #ffffff;
    background: rgba(200, 200, 200, 0.6);
  }

  /* Minecraft カラークラス（チャット用） */
  .tellraw-tool .mc-color-black { color: #000000; text-shadow: 1px 1px 0 #000000; }
  .tellraw-tool .mc-color-dark-blue { color: #0000AA; text-shadow: 1px 1px 0 #00002A; }
  .tellraw-tool .mc-color-dark-green { color: #00AA00; text-shadow: 1px 1px 0 #002A00; }
  .tellraw-tool .mc-color-dark-aqua { color: #00AAAA; text-shadow: 1px 1px 0 #002A2A; }
  .tellraw-tool .mc-color-dark-red { color: #AA0000; text-shadow: 1px 1px 0 #2A0000; }
  .tellraw-tool .mc-color-dark-purple { color: #AA00AA; text-shadow: 1px 1px 0 #2A002A; }
  .tellraw-tool .mc-color-gold { color: #FFAA00; text-shadow: 1px 1px 0 #2A2A00; }
  .tellraw-tool .mc-color-gray { color: #AAAAAA; text-shadow: 1px 1px 0 #2A2A2A; }
  .tellraw-tool .mc-color-dark-gray { color: #555555; text-shadow: 1px 1px 0 #151515; }
  .tellraw-tool .mc-color-blue { color: #5555FF; text-shadow: 1px 1px 0 #15153F; }
  .tellraw-tool .mc-color-green { color: #55FF55; text-shadow: 1px 1px 0 #153F15; }
  .tellraw-tool .mc-color-aqua { color: #55FFFF; text-shadow: 1px 1px 0 #153F3F; }
  .tellraw-tool .mc-color-red { color: #FF5555; text-shadow: 1px 1px 0 #3F1515; }
  .tellraw-tool .mc-color-light-purple { color: #FF55FF; text-shadow: 1px 1px 0 #3F153F; }
  .tellraw-tool .mc-color-yellow { color: #FFFF55; text-shadow: 1px 1px 0 #3F3F15; }
  .tellraw-tool .mc-color-white { color: #FFFFFF; text-shadow: 1px 1px 0 #3F3F3F; }

  .tellraw-tool .mc-bold { font-weight: bold; }
  .tellraw-tool .mc-italic { font-style: italic; }
  .tellraw-tool .mc-underlined { text-decoration: underline; }
  .tellraw-tool .mc-strikethrough { text-decoration: line-through; }
  .tellraw-tool .mc-obfuscated { font-family: 'Minecraft', monospace; letter-spacing: 1px; }
`;
document.head.appendChild(style);

export default { render, init };
