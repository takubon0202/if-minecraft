/**
 * Book Generator - UI
 */

import { $, createElement, debounce } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import {
  renderJsonTextEditor,
  initJsonTextEditor,
  addSegment,
  getEditorData,
  setEditorData,
  componentsToJson,
} from '../../components/json-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';

let pages = [];
let currentPage = 0;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="book-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'written_book')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <button type="button" class="reset-btn" id="book-reset-btn" title="設定をリセット">リセット</button>
      </div>

      <form class="tool-form" id="book-form">
        <!-- 本の情報 -->
        <div class="form-row">
          <div class="form-group">
            <label for="book-title">本のタイトル</label>
            <input type="text" id="book-title" class="mc-input" placeholder="冒険の書" value="冒険の書">
          </div>
          <div class="form-group">
            <label for="book-author">著者名</label>
            <input type="text" id="book-author" class="mc-input" placeholder="Steve" value="Steve">
          </div>
        </div>

        <!-- ページナビゲーション -->
        <div class="book-nav">
          <button type="button" id="book-prev-page" class="mc-btn" disabled>◀ 前へ</button>
          <span class="page-indicator">
            ページ <span id="book-current-page">1</span> / <span id="book-total-pages">1</span>
          </span>
          <button type="button" id="book-next-page" class="mc-btn">次へ ▶</button>
          <button type="button" id="book-add-page" class="mc-btn mc-btn-primary">+ ページ追加</button>
          <button type="button" id="book-remove-page" class="mc-btn mc-btn-danger" disabled>ページ削除</button>
        </div>

        <!-- ページエディタ -->
        <div class="form-group">
          <label>ページ内容（1ページ最大256文字）</label>
          <div id="book-page-editor">
            ${renderJsonTextEditor('book-editor', {
              showClickEvent: true,
              showHoverEvent: true,
            })}
          </div>
        </div>

        <!-- 生成数 -->
        <div class="form-group">
          <label for="book-count">個数</label>
          <input type="number" id="book-count" class="mc-input" value="1" min="1" max="64">
        </div>
      </form>

      <!-- プレビュー -->
      <div class="book-preview">
        <label>プレビュー</label>
        <div class="book-preview-box" id="book-preview">
          <div class="book-header">
            <span class="book-title-preview">冒険の書</span>
            <span class="book-author-preview">by Steve</span>
          </div>
          <div class="book-content-preview" id="book-content-preview">
            ここにページ内容が表示されます
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // 初期ページを作成
  pages = [[]];
  currentPage = 0;

  // エディタ初期化
  const editor = initJsonTextEditor('book-editor', debounce(() => {
    saveCurrentPage();
    updateCommand();
  }, 150));

  // ページナビゲーション
  $('#book-prev-page', container)?.addEventListener('click', () => {
    if (currentPage > 0) {
      saveCurrentPage();
      currentPage--;
      loadCurrentPage();
      updateNavButtons();
    }
  });

  $('#book-next-page', container)?.addEventListener('click', () => {
    if (currentPage < pages.length - 1) {
      saveCurrentPage();
      currentPage++;
      loadCurrentPage();
      updateNavButtons();
    }
  });

  $('#book-add-page', container)?.addEventListener('click', () => {
    saveCurrentPage();
    pages.push([]);
    currentPage = pages.length - 1;
    loadCurrentPage();
    updateNavButtons();
    updateCommand();
  });

  $('#book-remove-page', container)?.addEventListener('click', () => {
    if (pages.length > 1) {
      pages.splice(currentPage, 1);
      if (currentPage >= pages.length) currentPage = pages.length - 1;
      loadCurrentPage();
      updateNavButtons();
      updateCommand();
    }
  });

  // フォーム変更
  $('#book-title', container)?.addEventListener('input', debounce(updateCommand, 150));
  $('#book-author', container)?.addEventListener('input', debounce(updateCommand, 150));
  $('#book-count', container)?.addEventListener('input', debounce(updateCommand, 150));

  // プレビュー更新
  $('#book-title', container)?.addEventListener('input', updatePreview);
  $('#book-author', container)?.addEventListener('input', updatePreview);

  // リセットボタン
  $('#book-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  updateNavButtons();
  updateCommand();
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // 本のタイトルをデフォルトに
  const titleInput = $('#book-title', container);
  if (titleInput) titleInput.value = '冒険の書';

  // 著者名をデフォルトに
  const authorInput = $('#book-author', container);
  if (authorInput) authorInput.value = 'Steve';

  // 個数をデフォルトに
  const countInput = $('#book-count', container);
  if (countInput) countInput.value = '1';

  // ページをリセット（1ページだけに）
  pages = [[]];
  currentPage = 0;

  // エディタをリセット
  setEditorData('book-editor', []);

  // ナビゲーション更新
  updateNavButtons();

  // プレビュー更新
  updatePreview();

  // コマンド更新
  updateCommand();
}

/**
 * 現在のページを保存
 */
function saveCurrentPage() {
  const data = getEditorData('book-editor');
  pages[currentPage] = data;
}

/**
 * 現在のページを読み込み
 */
function loadCurrentPage() {
  const segmentsContainer = $('#book-editor-segments');
  if (segmentsContainer) {
    segmentsContainer.innerHTML = '';
    const pageData = pages[currentPage] || [];
    if (pageData.length === 0) {
      addSegment('book-editor');
    } else {
      pageData.forEach(comp => addSegment('book-editor', comp));
    }
  }
}

/**
 * ナビゲーションボタンを更新
 */
function updateNavButtons() {
  $('#book-current-page').textContent = currentPage + 1;
  $('#book-total-pages').textContent = pages.length;

  const prevBtn = $('#book-prev-page');
  const nextBtn = $('#book-next-page');
  const removeBtn = $('#book-remove-page');

  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage >= pages.length - 1;
  if (removeBtn) removeBtn.disabled = pages.length <= 1;
}

/**
 * プレビューを更新
 */
function updatePreview() {
  const title = $('#book-title')?.value || '';
  const author = $('#book-author')?.value || '';

  const titleEl = $('.book-title-preview');
  const authorEl = $('.book-author-preview');

  if (titleEl) titleEl.textContent = title;
  if (authorEl) authorEl.textContent = author ? `by ${author}` : '';
}

/**
 * コマンドを更新
 */
function updateCommand() {
  saveCurrentPage();

  const title = $('#book-title')?.value || '本';
  const author = $('#book-author')?.value || 'Unknown';
  const count = parseInt($('#book-count')?.value) || 1;

  // ページをJSON形式に変換
  const pagesJson = pages.map(pageComponents => {
    if (!pageComponents || pageComponents.length === 0) {
      return '""';
    }
    return componentsToJson(pageComponents);
  });

  // コンポーネント形式（1.20.5+）- 名前空間付き
  const components = [
    `minecraft:written_book_content={pages:[${pagesJson.join(',')}],title:"${escapeString(title)}",author:"${escapeString(author)}"}`,
  ];

  const command = `/give @p minecraft:written_book[${components.join(',')}]${count > 1 ? ` ${count}` : ''}`;

  // プレビュー更新
  const contentPreview = $('#book-content-preview');
  if (contentPreview && pages[currentPage]) {
    contentPreview.innerHTML = pages[currentPage].map(comp => {
      let style = '';
      if (comp.color) style += `color: ${comp.color};`;
      if (comp.bold) style += 'font-weight: bold;';
      if (comp.italic) style += 'font-style: italic;';
      return `<span style="${style}">${escapeHtml(comp.text)}</span>`;
    }).join('') || '<span class="placeholder">ここにページ内容が表示されます</span>';
  }

  setOutput(command, 'book', { title, author, count, pages });
}

function escapeString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .book-nav {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .page-indicator {
    font-weight: bold;
    padding: 0 var(--mc-space-md);
  }

  .book-preview {
    margin-top: var(--mc-space-lg);
  }

  .book-preview > label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-xs);
  }

  .book-preview-box {
    background: linear-gradient(135deg, #f5e6c8, #e8d4a8);
    border: 4px solid #8b6b3d;
    padding: var(--mc-space-md);
    min-height: 200px;
    max-width: 300px;
  }

  .book-header {
    border-bottom: 2px solid #8b6b3d;
    padding-bottom: var(--mc-space-sm);
    margin-bottom: var(--mc-space-md);
    text-align: center;
  }

  .book-title-preview {
    display: block;
    font-weight: bold;
    font-size: 1rem;
    color: #1f1f1f;
  }

  .book-author-preview {
    display: block;
    font-size: 0.75rem;
    color: #555;
    font-style: italic;
  }

  .book-content-preview {
    font-family: var(--mc-font-mono);
    font-size: 0.8rem;
    color: #1f1f1f;
    line-height: 1.5;
  }

  .book-content-preview .placeholder {
    color: #999;
    font-style: italic;
  }
`;
document.head.appendChild(style);

export default { render, init };
