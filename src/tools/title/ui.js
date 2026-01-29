/**
 * Title Generator - UI
 */

import { $, $$, debounce } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import {
  renderJsonTextEditor,
  initJsonTextEditor,
  componentsToJson,
} from '../../components/json-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';

let titleEditor = null;
let subtitleEditor = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="title-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'name_tag')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
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

  updateCommand();
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

  const commands = [];

  // タイミング設定
  if (includeTimes) {
    commands.push(`/title ${target} times ${fadeIn} ${stay} ${fadeOut}`);
  }

  // コマンド生成
  if (type === 'title' || type === 'both') {
    const json = componentsToJson(titleComponents);
    commands.push(`/title ${target} title ${json}`);
  }

  if (type === 'subtitle' || type === 'both') {
    const json = componentsToJson(subtitleComponents.length > 0 ? subtitleComponents : titleComponents);
    commands.push(`/title ${target} subtitle ${json}`);
  }

  if (type === 'actionbar') {
    const json = componentsToJson(titleComponents);
    commands.push(`/title ${target} actionbar ${json}`);
  }

  const command = commands.join('\n');
  setOutput(command, 'title', { target, type, fadeIn, stay, fadeOut });
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

export default { render, init };
