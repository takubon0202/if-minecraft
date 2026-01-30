/**
 * Tellraw Generator - UI
 */

import { $, debounce } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import {
  renderJsonTextEditor,
  initJsonTextEditor,
  componentsToJson,
  setEditorData,
  MC_COLORS,
} from '../../components/json-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { getVersionNote, compareVersions } from '../../core/version-compat.js';

let editorInstance = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel tellraw-tool" id="tellraw-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'paper')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="version-badge">1.21.5+</span>
        <button type="button" class="reset-btn" id="tellraw-reset-btn" title="設定をリセット">リセット</button>
      </div>

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
              <span class="mc-color-white">テキストを入力するとここにプレビューが表示されます</span>
            </div>
          </div>
        </div>
      </div>

      <form class="tool-form" id="tellraw-form">
        <!-- ターゲット -->
        <div class="form-group">
          <label for="tellraw-target">ターゲット（誰に送信するか）</label>
          <select id="tellraw-target" class="mc-select">
            <option value="@a">@a (全プレイヤー)</option>
            <option value="@p">@p (最も近いプレイヤー)</option>
            <option value="@s">@s (自分自身)</option>
            <option value="@r">@r (ランダムなプレイヤー)</option>
          </select>
        </div>

        <!-- JSON Text Editor -->
        <div class="form-group">
          <label>メッセージ内容</label>
          ${renderJsonTextEditor('tellraw-editor', {
            showClickEvent: true,
            showHoverEvent: true,
          })}
        </div>

        <!-- バージョン情報 -->
        <div class="form-group">
          <p class="version-note" id="tellraw-version-note"></p>
        </div>
      </form>

      <div class="tool-info">
        <h4>使い方</h4>
        <ul>
          <li>テキストセグメントを追加して装飾</li>
          <li>各セグメントに色・スタイルを設定</li>
          <li>クリック/ホバーイベントで対話機能追加</li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // JSON Text Editor初期化
  editorInstance = initJsonTextEditor('tellraw-editor', debounce(updateCommand, 150));

  // ターゲット変更
  $('#tellraw-target', container)?.addEventListener('change', updateCommand);

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
  const targetSelect = $('#tellraw-target', container);
  if (targetSelect) targetSelect.value = '@a';

  // クリックイベントをリセット
  const clickAction = container.querySelector('.jte-click-action');
  const clickValue = container.querySelector('.jte-click-value');
  if (clickAction) clickAction.value = '';
  if (clickValue) {
    clickValue.value = '';
    clickValue.style.display = 'none';
  }

  // ホバーイベントをリセット
  const hoverAction = container.querySelector('.jte-hover-action');
  const hoverValue = container.querySelector('.jte-hover-value');
  if (hoverAction) hoverAction.value = '';
  if (hoverValue) {
    hoverValue.value = '';
    hoverValue.style.display = 'none';
  }

  // エディタをリセット
  setEditorData('tellraw-editor', []);

  // コマンド更新
  updateCommand();
}

/**
 * バージョン表示を更新
 */
function updateVersionDisplay() {
  const version = workspaceStore.get('version') || '1.21';
  const note = document.getElementById('tellraw-version-note');

  if (note) {
    const versionNote = getVersionNote(version);

    // tellrawが使えないバージョンの警告
    if (compareVersions(version, '1.7') < 0) {
      note.textContent = '注意: このバージョンでは /tellraw コマンドは使用できません';
      note.style.color = 'var(--mc-color-redstone)';
    } else {
      note.textContent = `現在のバージョン: ${version} - ${versionNote}`;
      note.style.color = 'var(--mc-color-diamond)';
    }
  }
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const target = $('#tellraw-target')?.value || '@a';
  const globalVersion = workspaceStore.get('version') || '1.21';
  const components = editorInstance?.getData() || [];

  // バージョンをcomponentsToJson用の形式に変換
  let version = '1.21.5+';
  if (compareVersions(globalVersion, '1.21') >= 0) {
    version = '1.21.5+';
  } else if (compareVersions(globalVersion, '1.20') >= 0) {
    version = '1.20+';
  } else if (compareVersions(globalVersion, '1.16') >= 0) {
    version = '1.16+';
  } else if (compareVersions(globalVersion, '1.13') >= 0) {
    version = '1.13+';
  } else {
    version = '1.12-';
  }

  // ゲーム画面プレビューを更新
  updateGamePreview(components);

  // バージョンに応じたJSON生成
  const jsonText = componentsToJson(components, { version });

  const command = `/tellraw ${target} ${jsonText}`;

  setOutput(command, 'tellraw', { target, version: globalVersion, components });
}

/**
 * ゲーム画面プレビューを更新
 */
function updateGamePreview(components) {
  const chatPreview = document.getElementById('tellraw-chat-preview');
  if (!chatPreview) return;

  if (!components || components.length === 0) {
    chatPreview.innerHTML = `
      <div class="mc-chat-message">
        <span class="mc-color-white mc-placeholder">テキストを入力するとここにプレビューが表示されます</span>
      </div>
    `;
    return;
  }

  const messageHtml = components.map((comp, index) => {
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

  chatPreview.innerHTML = `<div class="mc-chat-message">${messageHtml}</div>`;

  // 難読化アニメーション
  startChatObfuscatedAnimation();
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
        if (originalText[i] === ' ') {
          newText += ' ';
        } else {
          newText += OBFUSCATED_CHARS[Math.floor(Math.random() * OBFUSCATED_CHARS.length)];
        }
      }
      el.textContent = newText;
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
  .tellraw-tool .version-badge {
    background: var(--mc-color-grass-main);
    color: white;
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 3px;
    margin-left: auto;
  }

  .version-options {
    display: flex;
    gap: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .version-note {
    margin-top: var(--mc-space-sm);
    font-size: 0.75rem;
    color: var(--mc-color-diamond);
    font-style: italic;
  }

  .tool-info {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border-left: 4px solid var(--mc-color-diamond);
  }

  .tool-info h4 {
    margin: 0 0 var(--mc-space-sm) 0;
    color: var(--mc-color-diamond);
  }

  .tool-info ul {
    margin: 0;
    padding-left: var(--mc-space-lg);
  }

  .tool-info li {
    margin-bottom: var(--mc-space-xs);
    font-size: 0.85rem;
  }

  /* ゲーム画面風プレビュー */
  .mc-game-screen-preview {
    margin-bottom: var(--mc-space-lg);
    border: 2px solid var(--mc-border-dark);
    border-radius: 4px;
    overflow: hidden;
  }

  .mc-game-screen {
    position: relative;
    background: linear-gradient(180deg, #78A7FF 0%, #6B9AE8 50%, #5B8AD8 100%);
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  /* チャットエリア */
  .mc-chat-area {
    background: rgba(0, 0, 0, 0.5);
    padding: 8px 12px;
    max-height: 120px;
    overflow-y: auto;
    font-family: 'Minecraft', 'Courier New', monospace;
    font-size: 16px;
    line-height: 1.4;
    -webkit-font-smoothing: none;
  }

  .mc-chat-message {
    margin-bottom: 2px;
  }

  .mc-placeholder {
    opacity: 0.6;
    font-style: italic;
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

  /* Minecraft カラークラス（チャット用） */
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

  .mc-bold { font-weight: bold; }
  .mc-italic { font-style: italic; }
  .mc-underlined { text-decoration: underline; }
  .mc-strikethrough { text-decoration: line-through; }
  .mc-obfuscated { font-family: 'Minecraft', monospace; letter-spacing: 1px; }
`;
document.head.appendChild(style);

export default { render, init };
