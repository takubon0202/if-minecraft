/**
 * ID Browser - UI
 */

import { $, $$, createElement, debounce, delegate } from '../../core/dom.js';
import { dataStore } from '../../core/store.js';
import { copyToClipboard, showCopyFeedback } from '../../core/clipboard.js';
import { getInviconUrl } from '../../core/wiki-images.js';

const CATEGORIES = [
  { id: 'items', label: 'アイテム', iconItem: 'chest' },
  { id: 'blocks', label: 'ブロック', iconItem: 'grass_block' },
  { id: 'entities', label: 'エンティティ', iconItem: 'zombie_head' },
  { id: 'effects', label: 'エフェクト', iconItem: 'potion' },
  { id: 'enchantments', label: 'エンチャント', iconItem: 'enchanted_book' },
];

let currentCategory = 'items';
let searchQuery = '';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="id-browser-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'book')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
      </div>

      <div class="id-browser-controls">
        <div class="category-tabs">
          ${CATEGORIES.map(cat => `
            <button class="category-tab ${cat.id === currentCategory ? 'active' : ''}"
                    data-category="${cat.id}">
              <img src="${getInviconUrl(cat.iconItem)}" class="category-icon mc-wiki-image" width="16" height="16" alt="">
              <span class="label">${cat.label}</span>
            </button>
          `).join('')}
        </div>

        <div class="search-box">
          <input type="search" id="id-search" class="mc-input"
                 placeholder="IDを検索... (例: diamond, zombie)"
                 autocomplete="off">
          <span class="search-hint">minecraft: は省略可</span>
        </div>
      </div>

      <div class="id-results" id="id-results">
        <p class="loading-message">データを読み込み中...</p>
      </div>

      <div class="id-browser-footer">
        <span id="result-count">0件</span>
        <span class="tip">クリックでコピー</span>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // カテゴリタブ
  delegate(container, 'click', '.category-tab', (e, target) => {
    currentCategory = target.dataset.category;
    updateCategoryTabs(container);
    renderResults(container);
  });

  // 検索
  const searchInput = $('#id-search', container);
  searchInput?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderResults(container);
  }, 200));

  // IDクリックでコピー
  delegate(container, 'click', '.id-item', async (e, target) => {
    const id = target.dataset.id;
    const success = await copyToClipboard(id);
    if (success) {
      target.classList.add('copied');
      setTimeout(() => target.classList.remove('copied'), 1000);
    }
  });

  // データ読み込み完了を待って初期レンダリング
  if (dataStore.get('loaded')) {
    renderResults(container);
  } else {
    dataStore.subscribe('loaded', (loaded) => {
      if (loaded) renderResults(container);
    });
  }
}

/**
 * カテゴリタブを更新
 */
function updateCategoryTabs(container) {
  $$('.category-tab', container).forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === currentCategory);
  });
}

/**
 * 結果をレンダリング
 */
function renderResults(container) {
  const resultsEl = $('#id-results', container);
  const countEl = $('#result-count', container);

  const allIds = dataStore.get(currentCategory) || [];

  // フィルタリング
  let filteredIds = allIds;
  if (searchQuery) {
    filteredIds = allIds.filter(id => {
      const shortId = id.replace('minecraft:', '');
      return id.includes(searchQuery) || shortId.includes(searchQuery);
    });
  }

  // カウント更新
  countEl.textContent = `${filteredIds.length}件`;

  // 結果が多すぎる場合は制限
  const displayIds = filteredIds.slice(0, 200);
  const hasMore = filteredIds.length > 200;

  if (displayIds.length === 0) {
    resultsEl.innerHTML = `
      <p class="empty-message">
        ${searchQuery ? `"${searchQuery}" に一致するIDが見つかりません` : 'データがありません'}
      </p>
    `;
    return;
  }

  resultsEl.innerHTML = `
    <div class="id-grid">
      ${displayIds.map(id => {
        const shortId = id.replace('minecraft:', '');
        return `
          <div class="id-item" data-id="${id}" title="${id}">
            <span class="id-text">${shortId}</span>
          </div>
        `;
      }).join('')}
    </div>
    ${hasMore ? `<p class="more-hint">他 ${filteredIds.length - 200} 件... 検索で絞り込んでください</p>` : ''}
  `;
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .id-browser-controls {
    margin-bottom: var(--mc-space-md);
  }

  .category-tabs {
    display: flex;
    gap: var(--mc-space-xs);
    margin-bottom: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .category-tab {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.8rem;
    transition: background-color 0.15s;
  }

  .category-tab:hover {
    background-color: var(--mc-color-stone-300);
  }

  .category-tab.active {
    background-color: var(--mc-color-grass-main);
    color: white;
    font-weight: bold;
  }

  .category-icon {
    width: 16px;
    height: 16px;
    image-rendering: pixelated;
  }

  .search-box {
    position: relative;
  }

  .search-box input {
    width: 100%;
  }

  .search-hint {
    position: absolute;
    right: var(--mc-space-md);
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.7rem;
    color: var(--mc-text-muted);
  }

  .id-results {
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    padding: var(--mc-space-sm);
  }

  .id-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--mc-space-xs);
  }

  .id-item {
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-family: var(--mc-font-mono);
    font-size: 0.75rem;
    transition: background-color 0.15s, transform 0.1s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .id-item:hover {
    background-color: var(--mc-color-grass-light);
    color: white;
    transform: scale(1.02);
  }

  .id-item.copied {
    background-color: var(--mc-color-gold);
    color: var(--mc-color-stone-900);
  }

  .id-browser-footer {
    display: flex;
    justify-content: space-between;
    margin-top: var(--mc-space-sm);
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .loading-message,
  .empty-message,
  .more-hint {
    text-align: center;
    padding: var(--mc-space-lg);
    color: var(--mc-text-muted);
  }
`;
document.head.appendChild(style);

export default { render, init };
