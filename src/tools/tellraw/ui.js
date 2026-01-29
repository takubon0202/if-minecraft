/**
 * Tellraw Generator - UI
 */

import { $, debounce } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import {
  renderJsonTextEditor,
  initJsonTextEditor,
  componentsToJson,
} from '../../components/json-text-editor.js';

let editorInstance = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="tellraw-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
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

        <!-- バージョン選択 -->
        <div class="form-group">
          <label>出力バージョン</label>
          <div class="version-options">
            <label class="option-label">
              <input type="radio" name="tellraw-version" value="1.20+" checked>
              1.20.3+ (最新)
            </label>
            <label class="option-label">
              <input type="radio" name="tellraw-version" value="1.16+">
              1.16 - 1.20.2
            </label>
            <label class="option-label">
              <input type="radio" name="tellraw-version" value="1.13+">
              1.13 - 1.15
            </label>
          </div>
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

  // バージョン変更
  container.querySelectorAll('input[name="tellraw-version"]').forEach(radio => {
    radio.addEventListener('change', updateCommand);
  });

  // 初期コマンド生成
  updateCommand();
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const target = $('#tellraw-target')?.value || '@a';
  const version = document.querySelector('input[name="tellraw-version"]:checked')?.value || '1.20+';
  const components = editorInstance?.getData() || [];

  const jsonText = componentsToJson(components);

  let command;
  if (version === '1.20+') {
    // 1.20.3+ では $ プレフィックスでマクロ対応
    command = `/tellraw ${target} ${jsonText}`;
  } else {
    command = `/tellraw ${target} ${jsonText}`;
  }

  setOutput(command, 'tellraw', { target, version, components });
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .version-options {
    display: flex;
    gap: var(--mc-space-md);
    flex-wrap: wrap;
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
`;
document.head.appendChild(style);

export default { render, init };
