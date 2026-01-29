/**
 * Tool Shell - ツールのロードと管理
 */

import { $, empty, createElement } from '../core/dom.js';
import { workspaceStore } from '../core/store.js';
import { addTab, activateTab } from './tabs.js';

// 現在ロードされているツール
const loadedTools = new Map();

/**
 * ツールをロード
 * @param {string} toolId - ツールID
 * @param {Object} toolModule - ツールモジュール
 */
export async function loadTool(toolId, toolModule) {
  const { manifest } = toolModule;

  // ウェルカム画面を非表示
  const welcome = $('#welcome-screen');
  if (welcome) {
    welcome.style.display = 'none';
  }

  // タブを追加（または既存をアクティブ化）
  const existingTab = workspaceStore.get('tabs').find(t => t.toolId === toolId);
  if (existingTab) {
    activateTab(existingTab.id);
  } else {
    addTab(toolId, manifest.title);
  }

  // ツールUIをレンダリング
  await renderTool(toolId, toolModule);
}

/**
 * ツールUIをレンダリング
 */
async function renderTool(toolId, toolModule) {
  const content = $('#tool-content');

  // 既存のツールコンテナを非表示
  content.querySelectorAll('.tool-container').forEach(el => {
    el.style.display = 'none';
  });

  // 既にレンダリング済みの場合は表示
  let container = content.querySelector(`[data-tool-id="${toolId}"]`);
  if (container) {
    container.style.display = 'block';
    return;
  }

  // 新しいコンテナを作成
  container = createElement('div', {
    className: 'tool-container mc-anim-pop',
    dataset: { toolId }
  });

  // ツールUIを動的にインポート
  try {
    const { render, init } = await import(`../tools/${toolId}/ui.js`);

    // UIをレンダリング
    const ui = render(toolModule.manifest);
    if (typeof ui === 'string') {
      container.innerHTML = ui;
    } else if (ui instanceof Element) {
      container.appendChild(ui);
    }

    content.appendChild(container);

    // ツール初期化
    if (init) {
      await init(container);
    }

    loadedTools.set(toolId, { container, module: toolModule });
  } catch (err) {
    console.error(`Failed to load tool UI: ${toolId}`, err);
    container.innerHTML = `
      <div class="tool-panel">
        <h2>ツール読み込みエラー</h2>
        <p>${toolId} の読み込みに失敗しました。</p>
        <pre>${err.message}</pre>
      </div>
    `;
    content.appendChild(container);
  }
}

/**
 * ツールを閉じる
 * @param {string} toolId - ツールID
 */
export function closeTool(toolId) {
  const content = $('#tool-content');
  const container = content.querySelector(`[data-tool-id="${toolId}"]`);
  if (container) {
    container.remove();
  }
  loadedTools.delete(toolId);
}

/**
 * ツールマニフェストを取得
 * @param {string} toolId - ツールID
 */
export function getToolManifest(toolId) {
  const tool = loadedTools.get(toolId);
  return tool?.module.manifest;
}

/**
 * ロード済みツールを取得
 */
export function getLoadedTools() {
  return loadedTools;
}

export default { loadTool, closeTool, getToolManifest, getLoadedTools };
