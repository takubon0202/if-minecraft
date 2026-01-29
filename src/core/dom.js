/**
 * DOM Utilities - 軽量DOM操作ヘルパー
 */

/**
 * 要素を取得
 * @param {string} selector - CSSセレクタ
 * @param {Element} parent - 親要素（デフォルト: document）
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);

/**
 * 複数要素を取得
 * @param {string} selector - CSSセレクタ
 * @param {Element} parent - 親要素（デフォルト: document）
 */
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/**
 * 要素を作成
 * @param {string} tag - タグ名
 * @param {Object} attrs - 属性オブジェクト
 * @param {Array|string} children - 子要素
 */
export const createElement = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v;
      });
    } else {
      el.setAttribute(key, value);
    }
  });

  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        el.appendChild(child);
      }
    });
  }

  return el;
};

/**
 * HTMLテンプレートからDocumentFragmentを作成
 * @param {string} html - HTMLテンプレート
 */
export const htmlToFragment = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
};

/**
 * 要素を空にする
 * @param {Element} el - 対象要素
 */
export const empty = (el) => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
  return el;
};

/**
 * クラストグル
 * @param {Element} el - 対象要素
 * @param {string} className - クラス名
 * @param {boolean} force - 強制的に追加/削除
 */
export const toggleClass = (el, className, force) => {
  el.classList.toggle(className, force);
};

/**
 * イベントデリゲーション
 * @param {Element} parent - 親要素
 * @param {string} event - イベント名
 * @param {string} selector - 対象セレクタ
 * @param {Function} handler - ハンドラー
 */
export const delegate = (parent, event, selector, handler) => {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e, target);
    }
  });
};

/**
 * debounce
 * @param {Function} fn - 関数
 * @param {number} delay - 遅延（ms）
 */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * throttle
 * @param {Function} fn - 関数
 * @param {number} limit - 制限（ms）
 */
export const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default { $, $$, createElement, htmlToFragment, empty, toggleClass, delegate, debounce, throttle };
