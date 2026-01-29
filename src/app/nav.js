/**
 * Navigation Manager - ナビゲーション管理
 */

import { $, $$, delegate, debounce } from '../core/dom.js';
import router from '../core/router.js';

/**
 * ナビゲーションを初期化
 */
export function initNav() {
  const searchInput = $('#tool-search');

  // 検索機能
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 200));
  }

  // ナビゲーションリンク
  delegate($('#left-nav'), 'click', '.tool-list a', (e, target) => {
    e.preventDefault();
    const href = target.getAttribute('href');
    if (href) {
      router.navigate(href.replace('#', ''));
    }
  });

  // カテゴリ折りたたみ
  delegate($('#left-nav'), 'click', '.category-title', (e, target) => {
    const category = target.closest('.category');
    category.classList.toggle('collapsed');
  });
}

/**
 * 検索処理
 */
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const toolLinks = $$('.tool-list a');

  toolLinks.forEach(link => {
    const text = link.textContent.toLowerCase();
    const matches = !query || text.includes(query);
    link.parentElement.style.display = matches ? '' : 'none';
  });

  // カテゴリの表示/非表示
  $$('.category').forEach(category => {
    const hasVisibleItems = category.querySelectorAll('.tool-list li[style=""]').length > 0 ||
                            category.querySelectorAll('.tool-list li:not([style])').length > 0;
    category.style.display = hasVisibleItems ? '' : 'none';
  });
}

/**
 * ナビゲーションのアクティブ状態を設定
 * @param {string} toolId - ツールID
 */
export function setActiveNav(toolId) {
  $$('.tool-list a').forEach(link => {
    const linkToolId = link.dataset.tool;
    link.classList.toggle('active', linkToolId === toolId);
  });
}

export default { initNav, setActiveNav };
