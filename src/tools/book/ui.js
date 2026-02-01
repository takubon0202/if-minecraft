/**
 * Book Generator - UI
 * minecraft.tools スタイルの高度なリッチテキストエディター
 */

import { $, createElement, debounce } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';
import { getInviconUrl } from '../../core/wiki-images.js';
import { compareVersions } from '../../core/version-compat.js';

let pages = []; // 各ページのRichTextEditorインスタンス
let pageData = []; // 各ページのデータ
let currentPage = 0;
let currentEditor = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const tempEditor = new RichTextEditor('book-page-editor', {
    placeholder: 'ページ内容を入力...',
    showClickEvent: true,
    showHoverEvent: true,
    showPreview: true,
  });

  return `
    <style>${RICH_TEXT_EDITOR_CSS}</style>
    <div class="tool-panel book-tool mc-themed" id="book-panel">
      <!-- ヘッダー -->
      <div class="tool-header mc-header-banner">
        <div class="header-content">
          <img src="${getInviconUrl(manifest.iconItem || 'written_book')}" alt="" class="header-icon mc-pixelated">
          <div class="header-text">
            <h2>/give 本コマンド</h2>
            <p class="header-subtitle">カスタム本を作成</p>
          </div>
        </div>
        <span class="version-badge" id="book-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="book-reset-btn" title="設定をリセット">リセット</button>
      </div>

      <form class="tool-form mc-form" id="book-form">
        <!-- ステップ1: 本の情報 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <h3>本の情報</h3>
          </div>
          <div class="book-info-grid">
            <div class="book-info-input">
              <label for="book-title">本のタイトル</label>
              <input type="text" id="book-title" class="mc-input" placeholder="冒険の書" value="冒険の書">
            </div>
            <div class="book-info-input">
              <label for="book-author">著者名</label>
              <input type="text" id="book-author" class="mc-input" placeholder="Steve" value="Steve">
            </div>
          </div>
        </section>

        <!-- ステップ2: ページ編集 -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <h3>ページ編集</h3>
          </div>

          <!-- ページナビゲーション -->
          <div class="book-nav">
            <button type="button" id="book-prev-page" class="mc-btn" disabled>&#9664; 前へ</button>
            <span class="page-indicator">
              ページ <span id="book-current-page">1</span> / <span id="book-total-pages">1</span>
            </span>
            <button type="button" id="book-next-page" class="mc-btn">次へ &#9654;</button>
            <button type="button" id="book-add-page" class="mc-btn mc-btn-primary">+ ページ追加</button>
            <button type="button" id="book-remove-page" class="mc-btn mc-btn-danger" disabled>ページ削除</button>
          </div>

          <!-- ページエディタ（リッチテキストエディター） -->
          <div class="page-editor-wrapper">
            <label>ページ内容（1文字ごとに色・書式を設定可能）</label>
            <div class="book-rte-container">
              ${tempEditor.render()}
            </div>
          </div>
        </section>

        <!-- ステップ3: オプション -->
        <section class="form-section mc-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <h3>オプション</h3>
          </div>
          <div class="count-input-group">
            <label for="book-count">個数</label>
            <input type="number" id="book-count" class="mc-input count-input" value="1" min="1" max="64">
          </div>
        </section>
      </form>

      <!-- プレビュー -->
      <div class="book-preview-section">
        <h3>プレビュー</h3>
        <div class="book-preview-box" id="book-preview">
          <div class="book-header-preview">
            <span class="book-title-preview" id="book-title-preview">冒険の書</span>
            <span class="book-author-preview" id="book-author-preview">by Steve</span>
          </div>
          <div class="book-content-preview" id="book-content-preview">
            ここにページ内容が表示されます
          </div>
          <div class="book-page-number">ページ <span id="book-preview-page">1</span></div>
        </div>
      </div>

      <div class="tool-info">
        <h4>使い方</h4>
        <ul>
          <li>テキストを入力し、範囲選択して色・書式を適用</li>
          <li>1文字ごとに異なる色・スタイルを設定可能</li>
          <li>クリック/ホバーイベントで対話機能追加</li>
          <li>ページを追加して複数ページの本を作成</li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // 初期ページデータを作成
  pageData = [{ groups: [], clickEvent: null, hoverEvent: null }];
  currentPage = 0;

  // RichTextEditor初期化
  currentEditor = new RichTextEditor('book-page-editor', {
    placeholder: 'ページ内容を入力...',
    showClickEvent: true,
    showHoverEvent: true,
    showPreview: true,
    onChange: debounce(() => {
      saveCurrentPage();
      updatePreview();
      updateCommand();
    }, 100),
  });

  currentEditor.init(container);

  // ページナビゲーション
  $('#book-prev-page', container)?.addEventListener('click', () => {
    if (currentPage > 0) {
      saveCurrentPage();
      currentPage--;
      loadCurrentPage(container);
      updateNavButtons();
      updatePreview();
    }
  });

  $('#book-next-page', container)?.addEventListener('click', () => {
    if (currentPage < pageData.length - 1) {
      saveCurrentPage();
      currentPage++;
      loadCurrentPage(container);
      updateNavButtons();
      updatePreview();
    }
  });

  $('#book-add-page', container)?.addEventListener('click', () => {
    saveCurrentPage();
    pageData.push({ groups: [], clickEvent: null, hoverEvent: null });
    currentPage = pageData.length - 1;
    loadCurrentPage(container);
    updateNavButtons();
    updatePreview();
    updateCommand();
  });

  $('#book-remove-page', container)?.addEventListener('click', () => {
    if (pageData.length > 1) {
      pageData.splice(currentPage, 1);
      if (currentPage >= pageData.length) currentPage = pageData.length - 1;
      loadCurrentPage(container);
      updateNavButtons();
      updatePreview();
      updateCommand();
    }
  });

  // フォーム変更
  $('#book-title', container)?.addEventListener('input', debounce(() => {
    updatePreview();
    updateCommand();
  }, 150));
  $('#book-author', container)?.addEventListener('input', debounce(() => {
    updatePreview();
    updateCommand();
  }, 150));
  $('#book-count', container)?.addEventListener('input', debounce(updateCommand, 150));

  // リセットボタン
  $('#book-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // バージョン変更
  window.addEventListener('mc-version-change', () => {
    updateVersionBadge();
    updateCommand();
  });

  updateVersionBadge();
  updateNavButtons();
  updatePreview();
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
  pageData = [{ groups: [], clickEvent: null, hoverEvent: null }];
  currentPage = 0;

  // エディターをクリア
  if (currentEditor) {
    currentEditor.clear(container);
  }

  // ナビゲーション更新
  updateNavButtons();

  // プレビュー更新
  updatePreview();

  // コマンド更新
  updateCommand();
}

/**
 * バージョンバッジを更新
 */
function updateVersionBadge() {
  const version = workspaceStore.get('version') || '1.21';
  const badge = document.getElementById('book-version-badge');
  if (badge) {
    badge.textContent = version + '+';
  }
}

/**
 * 現在のページを保存
 */
function saveCurrentPage() {
  if (!currentEditor) return;

  const groups = currentEditor.getFormattedGroups();
  pageData[currentPage] = {
    groups,
    clickEvent: currentEditor.clickEvent,
    hoverEvent: currentEditor.hoverEvent,
  };
}

/**
 * 現在のページを読み込み
 */
function loadCurrentPage(container) {
  if (!currentEditor) return;

  // エディターをクリア
  currentEditor.clear(container);

  // ページデータがあれば復元（今後の拡張用）
  // 現時点では単純にクリアのみ
}

/**
 * ナビゲーションボタンを更新
 */
function updateNavButtons() {
  const currentPageEl = document.getElementById('book-current-page');
  const totalPagesEl = document.getElementById('book-total-pages');
  if (currentPageEl) currentPageEl.textContent = currentPage + 1;
  if (totalPagesEl) totalPagesEl.textContent = pageData.length;

  const prevBtn = $('#book-prev-page');
  const nextBtn = $('#book-next-page');
  const removeBtn = $('#book-remove-page');

  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage >= pageData.length - 1;
  if (removeBtn) removeBtn.disabled = pageData.length <= 1;
}

/**
 * プレビューを更新
 */
function updatePreview() {
  const title = $('#book-title')?.value || '';
  const author = $('#book-author')?.value || '';

  // タイトル・著者プレビュー
  const titlePreview = document.getElementById('book-title-preview');
  const authorPreview = document.getElementById('book-author-preview');
  if (titlePreview) titlePreview.textContent = title;
  if (authorPreview) authorPreview.textContent = author ? `by ${author}` : '';

  // ページ番号
  const pageNumber = document.getElementById('book-preview-page');
  if (pageNumber) pageNumber.textContent = currentPage + 1;

  // コンテンツプレビュー
  const contentPreview = document.getElementById('book-content-preview');
  if (!contentPreview || !currentEditor) return;

  const groups = currentEditor.getFormattedGroups();

  if (!groups || groups.length === 0) {
    contentPreview.innerHTML = '<span class="placeholder">ここにページ内容が表示されます</span>';
    return;
  }

  contentPreview.innerHTML = groups.map((group) => {
    const classes = ['book-text-segment'];

    // 色クラス
    if (group.color) {
      if (group.color.startsWith('#')) {
        // HEXカラーはインラインスタイル
      } else {
        classes.push(`book-color-${group.color.replace('_', '-')}`);
      }
    }

    // スタイルクラス
    if (group.bold) classes.push('book-bold');
    if (group.italic) classes.push('book-italic');
    if (group.underlined) classes.push('book-underlined');
    if (group.strikethrough) classes.push('book-strikethrough');

    const style = group.color?.startsWith('#') ? `color: ${group.color};` : '';
    const text = escapeHtml(group.text).replace(/\n/g, '<br>');

    return `<span class="${classes.join(' ')}" style="${style}">${text}</span>`;
  }).join('');
}

/**
 * コマンドを更新
 */
function updateCommand() {
  saveCurrentPage();

  const title = $('#book-title')?.value || '本';
  const author = $('#book-author')?.value || 'Unknown';
  const count = parseInt($('#book-count')?.value) || 1;
  const globalVersion = workspaceStore.get('version') || '1.21';

  // 各ページをJSON/SNBT形式に変換
  const pagesOutput = pageData.map(page => {
    if (!page.groups || page.groups.length === 0) {
      return '""';
    }

    // グループからコンポーネントを生成
    const groups = page.groups;

    if (compareVersions(globalVersion, '1.21') >= 0) {
      // SNBT形式
      if (groups.length === 0) return '""';

      if (groups.length === 1) {
        return formatGroupToSNBT(groups[0], page.clickEvent, page.hoverEvent);
      }

      const components = groups.map((g, idx) =>
        formatGroupToSNBT(g, idx === 0 ? page.clickEvent : null, idx === 0 ? page.hoverEvent : null)
      );
      return `[${components.join(',')}]`;
    } else {
      // JSON形式
      if (groups.length === 0) return '""';

      const components = groups.map((g, idx) => {
        const obj = { text: g.text };
        if (g.color && g.color !== 'white') obj.color = g.color;
        if (g.bold) obj.bold = true;
        if (g.italic) obj.italic = true;
        if (g.underlined) obj.underlined = true;
        if (g.strikethrough) obj.strikethrough = true;
        if (g.obfuscated) obj.obfuscated = true;
        if (idx === 0 && page.clickEvent) obj.clickEvent = page.clickEvent;
        if (idx === 0 && page.hoverEvent) obj.hoverEvent = page.hoverEvent;
        return obj;
      });

      if (components.length === 1) {
        return JSON.stringify(components[0]);
      }
      return JSON.stringify(['', ...components]);
    }
  });

  // コマンド生成
  let command;
  if (compareVersions(globalVersion, '1.20.5') >= 0) {
    // 1.20.5+: コンポーネント形式
    const pagesStr = pagesOutput.join(',');
    const components = [
      `minecraft:written_book_content={pages:[${pagesStr}],title:"${escapeSnbt(title)}",author:"${escapeSnbt(author)}"}`,
    ];
    command = `/give @p minecraft:written_book[${components.join(',')}]${count > 1 ? ` ${count}` : ''}`;
  } else {
    // 1.20.4以前: NBT形式
    const pagesStr = pagesOutput.map(p => `'${p}'`).join(',');
    command = `/give @p minecraft:written_book{pages:[${pagesStr}],title:"${escapeString(title)}",author:"${escapeString(author)}"}${count > 1 ? ` ${count}` : ''}`;
  }

  setOutput(command, 'book', { title, author, count, pages: pageData });
}

/**
 * グループをSNBT形式に変換
 */
function formatGroupToSNBT(group, clickEvent, hoverEvent) {
  const parts = [`text:"${escapeSnbt(group.text)}"`];

  if (group.color && group.color !== 'white') {
    parts.push(`color:"${group.color}"`);
  }

  if (group.bold) parts.push('bold:true');
  if (group.italic) parts.push('italic:true');
  if (group.underlined) parts.push('underlined:true');
  if (group.strikethrough) parts.push('strikethrough:true');
  if (group.obfuscated) parts.push('obfuscated:true');

  if (clickEvent) {
    const clickParts = [`action:"${clickEvent.action}"`];
    const value = clickEvent.value;

    switch (clickEvent.action) {
      case 'run_command':
        clickParts.push(`command:"${escapeSnbt(value.startsWith('/') ? value.slice(1) : value)}"`);
        break;
      case 'suggest_command':
        clickParts.push(`command:"${escapeSnbt(value)}"`);
        break;
      case 'open_url':
        clickParts.push(`url:"${escapeSnbt(value)}"`);
        break;
      case 'change_page':
        clickParts.push(`page:${parseInt(value) || 1}`);
        break;
    }
    parts.push(`click_event:{${clickParts.join(',')}}`);
  }

  if (hoverEvent) {
    const hoverParts = [`action:"${hoverEvent.action}"`];
    if (hoverEvent.action === 'show_text') {
      const text = typeof hoverEvent.contents === 'object'
        ? hoverEvent.contents.text
        : String(hoverEvent.contents);
      hoverParts.push(`value:{text:"${escapeSnbt(text)}"}`);
    }
    parts.push(`hover_event:{${hoverParts.join(',')}}`);
  }

  return `{${parts.join(',')}}`;
}

function escapeString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeSnbt(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
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
  /* ===== Book Tool - summonデザイン統一 ===== */

  /* ヘッダー（茶色系グラデーション - 本のテーマカラー） */
  .book-tool .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, #8b6b3d 0%, #5d472a 100%);
    border-radius: 8px 8px 0 0;
    margin: calc(-1 * var(--mc-space-lg));
    margin-bottom: var(--mc-space-lg);
  }

  .book-tool .header-content {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .book-tool .header-icon {
    width: 48px;
    height: 48px;
  }

  .book-tool .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .book-tool .header-subtitle {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.8);
  }

  .book-tool .version-badge {
    background: rgba(255,255,255,0.2);
    color: white;
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 3px;
    margin-left: auto;
  }

  /* セクション構造 */
  .book-tool .form-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .book-tool .section-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-sm);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .book-tool .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #8b6b3d 0%, #5d472a 100%);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .book-tool .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  /* 本の情報グリッド */
  .book-tool .book-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--mc-space-md);
  }

  .book-tool .book-info-input label {
    display: block;
    color: #cccccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-xs);
  }

  /* ページナビゲーション */
  .book-tool .book-nav {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-lg);
    flex-wrap: wrap;
    padding: var(--mc-space-md);
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
  }

  .book-tool .page-indicator {
    font-weight: bold;
    padding: 0 var(--mc-space-md);
    color: #ffffff;
  }

  .book-tool .book-nav .mc-btn {
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .book-tool .book-nav .mc-btn:hover:not(:disabled) {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    border-color: #666666;
  }

  .book-tool .book-nav .mc-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .book-tool .book-nav .mc-btn-primary {
    background: linear-gradient(180deg, #8b6b3d 0%, #5d472a 100%);
    border-color: #5d472a;
  }

  .book-tool .book-nav .mc-btn-primary:hover {
    background: linear-gradient(180deg, #a07a45 0%, #6d5432 100%);
  }

  .book-tool .book-nav .mc-btn-danger {
    background: linear-gradient(180deg, #e04040 0%, #c80000 100%);
    border-color: #a00000;
  }

  .book-tool .book-nav .mc-btn-danger:hover:not(:disabled) {
    background: linear-gradient(180deg, #ff5050 0%, #e00000 100%);
  }

  /* ページエディタ */
  .book-tool .page-editor-wrapper label {
    display: block;
    color: #cccccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-sm);
  }

  /* 個数入力 */
  .book-tool .count-input-group label {
    display: block;
    color: #cccccc;
    font-size: 0.9rem;
    margin-bottom: var(--mc-space-xs);
  }

  .book-tool .count-input {
    width: 100px;
  }

  /* プレビューセクション */
  .book-tool .book-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    border-radius: 8px;
  }

  .book-tool .book-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
  }

  .book-tool .book-preview-box {
    background: linear-gradient(135deg, #f5e6c8, #e8d4a8);
    border: 4px solid #8b6b3d;
    padding: var(--mc-space-md);
    min-height: 250px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .book-tool .book-header-preview {
    border-bottom: 2px solid #8b6b3d;
    padding-bottom: var(--mc-space-sm);
    margin-bottom: var(--mc-space-md);
    text-align: center;
  }

  .book-tool .book-title-preview {
    display: block;
    font-weight: bold;
    font-size: 1rem;
    color: #1f1f1f;
  }

  .book-tool .book-author-preview {
    display: block;
    font-size: 0.75rem;
    color: #555;
    font-style: italic;
  }

  .book-tool .book-content-preview {
    flex: 1;
    font-family: var(--mc-font-mono);
    font-size: 0.85rem;
    color: #1f1f1f;
    line-height: 1.5;
    overflow-y: auto;
  }

  .book-tool .book-content-preview .placeholder {
    color: #999;
    font-style: italic;
  }

  .book-tool .book-page-number {
    text-align: center;
    font-size: 0.75rem;
    color: #666;
    padding-top: var(--mc-space-sm);
    border-top: 1px solid #8b6b3d;
    margin-top: var(--mc-space-md);
  }

  /* 本のテキストカラー */
  .book-text-segment { display: inline; }
  .book-color-black { color: #000000; }
  .book-color-dark-blue { color: #0000AA; }
  .book-color-dark-green { color: #00AA00; }
  .book-color-dark-aqua { color: #00AAAA; }
  .book-color-dark-red { color: #AA0000; }
  .book-color-dark-purple { color: #AA00AA; }
  .book-color-gold { color: #AA5500; }
  .book-color-gray { color: #555555; }
  .book-color-dark-gray { color: #333333; }
  .book-color-blue { color: #3333FF; }
  .book-color-green { color: #00AA00; }
  .book-color-aqua { color: #00AAAA; }
  .book-color-red { color: #AA0000; }
  .book-color-light-purple { color: #AA00AA; }
  .book-color-yellow { color: #AA5500; }

  .book-bold { font-weight: bold; }
  .book-italic { font-style: italic; }
  .book-underlined { text-decoration: underline; }
  .book-strikethrough { text-decoration: line-through; }

  /* 使い方セクション */
  .book-tool .tool-info {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: linear-gradient(180deg, rgba(60,60,60,0.8) 0%, rgba(40,40,40,0.9) 100%);
    border: 2px solid #555555;
    border-left: 4px solid #8b6b3d;
    border-radius: 0 8px 8px 0;
  }

  .book-tool .tool-info h4 {
    margin: 0 0 var(--mc-space-sm) 0;
    color: #8b6b3d;
  }

  .book-tool .tool-info ul {
    margin: 0;
    padding-left: var(--mc-space-lg);
  }

  .book-tool .tool-info li {
    margin-bottom: var(--mc-space-xs);
    font-size: 0.85rem;
    color: #cccccc;
  }
`;
document.head.appendChild(style);

export default { render, init };
