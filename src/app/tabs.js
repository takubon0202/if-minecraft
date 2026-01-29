/**
 * Tabs Manager - タブ管理
 */

import { $, empty, createElement, delegate } from '../core/dom.js';
import { workspaceStore } from '../core/store.js';
import storage from '../core/storage.js';
import router from '../core/router.js';
import { closeTool } from './shell.js';

let tabIdCounter = 0;

/**
 * タブシステムを初期化
 */
export function initTabs() {
  const container = $('#tabs-container');
  const addBtn = $('#tab-add-btn');

  // 新しいタブボタン
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      router.navigate('/');
    });
  }

  // タブクリックイベント
  delegate(container, 'click', '.tab', (e, target) => {
    if (!e.target.classList.contains('tab-close')) {
      const tabId = target.dataset.tabId;
      activateTab(tabId);
    }
  });

  // タブ閉じるボタン
  delegate(container, 'click', '.tab-close', (e, target) => {
    e.stopPropagation();
    const tab = target.closest('.tab');
    const tabId = tab.dataset.tabId;
    closeTab(tabId);
  });

  // ストア変更を監視
  workspaceStore.subscribe('tabs', renderTabs);
  workspaceStore.subscribe('activeTabId', updateActiveTab);

  // 初期レンダリング
  renderTabs(workspaceStore.get('tabs'));
}

/**
 * タブを追加
 * @param {string} toolId - ツールID
 * @param {string} title - タブタイトル
 */
export function addTab(toolId, title) {
  const tabs = workspaceStore.get('tabs');
  const tabId = `tab-${++tabIdCounter}`;

  const newTab = {
    id: tabId,
    toolId,
    title,
  };

  workspaceStore.set('tabs', [...tabs, newTab]);
  workspaceStore.set('activeTabId', tabId);

  saveTabs();
  return tabId;
}

/**
 * タブを閉じる
 * @param {string} tabId - タブID
 */
export function closeTab(tabId) {
  const tabs = workspaceStore.get('tabs');
  const activeTabId = workspaceStore.get('activeTabId');
  const tabIndex = tabs.findIndex(t => t.id === tabId);

  if (tabIndex === -1) return;

  const closedTab = tabs[tabIndex];
  const newTabs = tabs.filter(t => t.id !== tabId);
  workspaceStore.set('tabs', newTabs);

  // ツールUIを閉じる
  closeTool(closedTab.toolId);

  // アクティブタブが閉じられた場合
  if (activeTabId === tabId) {
    if (newTabs.length > 0) {
      // 隣のタブをアクティブに
      const nextIndex = Math.min(tabIndex, newTabs.length - 1);
      activateTab(newTabs[nextIndex].id);
    } else {
      workspaceStore.set('activeTabId', null);
      router.navigate('/');
    }
  }

  saveTabs();
}

/**
 * タブをアクティブ化
 * @param {string} tabId - タブID
 */
export function activateTab(tabId) {
  const tabs = workspaceStore.get('tabs');
  const tab = tabs.find(t => t.id === tabId);

  if (tab) {
    workspaceStore.set('activeTabId', tabId);
    router.navigate(`/tool/${tab.toolId}`);
    saveTabs();
  }
}

/**
 * タブをレンダリング
 */
function renderTabs(tabs) {
  const container = $('#tabs-container');
  if (!container) return;

  empty(container);

  tabs.forEach(tab => {
    const tabEl = createElement('div', {
      className: 'tab',
      dataset: { tabId: tab.id }
    }, [
      createElement('span', { className: 'tab-title' }, tab.title),
      createElement('button', { className: 'tab-close', title: '閉じる' }, '×')
    ]);

    container.appendChild(tabEl);
  });

  updateActiveTab(workspaceStore.get('activeTabId'));
}

/**
 * アクティブタブを更新
 */
function updateActiveTab(activeTabId) {
  const container = $('#tabs-container');
  if (!container) return;

  container.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tabId === activeTabId);
  });
}

/**
 * タブ状態を保存
 */
function saveTabs() {
  storage.save('tabs', workspaceStore.get('tabs'));
  storage.save('activeTabId', workspaceStore.get('activeTabId'));
}

export default { initTabs, addTab, closeTab, activateTab };
