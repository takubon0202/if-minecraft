/**
 * Target Selector Builder - UI
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { copyToClipboard } from '../../core/clipboard.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';

// 基本セレクター
const BASE_SELECTORS = [
  { value: '@a', name: '全プレイヤー', description: 'すべてのプレイヤーを選択' },
  { value: '@p', name: '最寄りプレイヤー', description: '最も近いプレイヤーを選択' },
  { value: '@r', name: 'ランダムプレイヤー', description: 'ランダムに1人選択' },
  { value: '@s', name: '実行者自身', description: 'コマンド実行者' },
  { value: '@e', name: '全エンティティ', description: 'すべてのエンティティ（プレイヤー含む）' },
  { value: '@n', name: '最寄りエンティティ', description: '最も近いエンティティ（1.20.2+）' },
];

// セレクター引数
const SELECTOR_ARGS = [
  { id: 'x', name: 'X座標', type: 'number', description: '検索開始のX座標' },
  { id: 'y', name: 'Y座標', type: 'number', description: '検索開始のY座標' },
  { id: 'z', name: 'Z座標', type: 'number', description: '検索開始のZ座標' },
  { id: 'distance', name: '距離', type: 'range', description: '距離の範囲（例: ..5, 3..10）' },
  { id: 'dx', name: '範囲X', type: 'number', description: 'ボリューム選択のX幅' },
  { id: 'dy', name: '範囲Y', type: 'number', description: 'ボリューム選択のY幅' },
  { id: 'dz', name: '範囲Z', type: 'number', description: 'ボリューム選択のZ幅' },
  { id: 'limit', name: '上限', type: 'number', description: '選択する最大数' },
  { id: 'sort', name: 'ソート', type: 'select', options: ['nearest', 'furthest', 'random', 'arbitrary'], description: '選択順序' },
  { id: 'type', name: 'タイプ', type: 'text', description: 'エンティティタイプ（!で除外）' },
  { id: 'name', name: '名前', type: 'text', description: 'エンティティ名（!で除外）' },
  { id: 'tag', name: 'タグ', type: 'text', description: 'スコアボードタグ（!で除外）' },
  { id: 'team', name: 'チーム', type: 'text', description: 'チーム名（!で除外）' },
  { id: 'scores', name: 'スコア', type: 'text', description: 'スコア条件（例: {score=5..}）' },
  { id: 'level', name: 'レベル', type: 'range', description: '経験値レベルの範囲' },
  { id: 'gamemode', name: 'ゲームモード', type: 'select', options: ['survival', 'creative', 'adventure', 'spectator'], description: 'ゲームモード（!で除外）' },
  { id: 'x_rotation', name: 'X回転', type: 'range', description: 'ピッチ（上下向き）' },
  { id: 'y_rotation', name: 'Y回転', type: 'range', description: 'ヨー（左右向き）' },
  { id: 'nbt', name: 'NBT', type: 'text', description: 'NBTデータ（!で除外）' },
  { id: 'advancements', name: '進捗', type: 'text', description: '進捗条件' },
  { id: 'predicate', name: 'プレディケート', type: 'text', description: 'プレディケートID' },
];

let activeArgs = {};

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const selectorOptions = BASE_SELECTORS.map(s =>
    `<option value="${s.value}">${s.value} - ${s.name}</option>`
  ).join('');

  return `
    <div class="tool-panel" id="target-selector-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'compass')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
      </div>

      <form class="tool-form" id="selector-form">
        <!-- 基本セレクター -->
        <div class="form-group">
          <label for="base-selector">基本セレクター</label>
          <select id="base-selector" class="mc-select">
            ${selectorOptions}
          </select>
          <p class="selector-desc" id="selector-desc">すべてのプレイヤーを選択</p>
        </div>

        <!-- 引数追加 -->
        <div class="form-group">
          <label>引数を追加</label>
          <div class="arg-buttons">
            ${SELECTOR_ARGS.map(arg => `
              <button type="button" class="arg-btn" data-arg="${arg.id}" title="${arg.description}">
                ${arg.id}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- アクティブな引数 -->
        <div class="form-group">
          <label>設定中の引数</label>
          <div class="active-args" id="active-args">
            <p class="empty-message">引数ボタンをクリックして追加</p>
          </div>
        </div>
      </form>

      <!-- リファレンス -->
      <div class="reference-section">
        <h3>クイックリファレンス</h3>
        <div class="reference-grid">
          ${BASE_SELECTORS.map(s => `
            <div class="ref-item">
              <code class="ref-code">${s.value}</code>
              <span class="ref-desc">${s.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 使用例 -->
      <div class="examples-section">
        <h3>使用例（クリックでコピー）</h3>
        <div class="examples-list">
          <div class="example-item" data-selector="@a[distance=..10]">
            <code>@a[distance=..10]</code>
            <span>10ブロック以内の全プレイヤー</span>
          </div>
          <div class="example-item" data-selector="@e[type=zombie,limit=5,sort=nearest]">
            <code>@e[type=zombie,limit=5,sort=nearest]</code>
            <span>最も近いゾンビ5体</span>
          </div>
          <div class="example-item" data-selector="@a[gamemode=survival,tag=!vip]">
            <code>@a[gamemode=survival,tag=!vip]</code>
            <span>VIPタグがないサバイバルプレイヤー</span>
          </div>
          <div class="example-item" data-selector="@e[type=!player,distance=..20]">
            <code>@e[type=!player,distance=..20]</code>
            <span>20ブロック以内のプレイヤー以外</span>
          </div>
          <div class="example-item" data-selector="@a[scores={kills=10..}]">
            <code>@a[scores={kills=10..}]</code>
            <span>killsスコアが10以上のプレイヤー</span>
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
  activeArgs = {};

  // 基本セレクター変更
  $('#base-selector', container)?.addEventListener('change', (e) => {
    const selector = BASE_SELECTORS.find(s => s.value === e.target.value);
    $('#selector-desc', container).textContent = selector?.description || '';
    updateOutput();
  });

  // 引数追加
  delegate(container, 'click', '.arg-btn', (e, target) => {
    const argId = target.dataset.arg;
    if (!activeArgs[argId]) {
      activeArgs[argId] = '';
      target.classList.add('active');
      renderActiveArgs(container);
    }
  });

  // 引数削除
  delegate(container, 'click', '.remove-arg', (e, target) => {
    const argId = target.dataset.arg;
    delete activeArgs[argId];
    container.querySelector(`.arg-btn[data-arg="${argId}"]`)?.classList.remove('active');
    renderActiveArgs(container);
    updateOutput();
  });

  // 引数値変更
  delegate(container, 'input', '.arg-value', debounce((e, target) => {
    const argId = target.dataset.arg;
    activeArgs[argId] = target.value;
    updateOutput();
  }, 150));

  // 例をコピー
  delegate(container, 'click', '.example-item', async (e, target) => {
    const selector = target.dataset.selector;
    await copyToClipboard(selector);
    target.classList.add('copied');
    setTimeout(() => target.classList.remove('copied'), 1000);
  });

  updateOutput();
}

/**
 * アクティブな引数をレンダリング
 */
function renderActiveArgs(container) {
  const list = $('#active-args', container);
  if (!list) return;

  const argIds = Object.keys(activeArgs);
  if (argIds.length === 0) {
    list.innerHTML = '<p class="empty-message">引数ボタンをクリックして追加</p>';
    return;
  }

  list.innerHTML = argIds.map(argId => {
    const arg = SELECTOR_ARGS.find(a => a.id === argId);
    let input;

    if (arg?.type === 'select' && arg.options) {
      const options = arg.options.map(o => `<option value="${o}">${o}</option>`).join('');
      input = `<select class="arg-value mc-select" data-arg="${argId}">
        <option value="">選択...</option>
        ${options}
      </select>`;
    } else {
      input = `<input type="text" class="arg-value mc-input" data-arg="${argId}"
                      value="${activeArgs[argId]}" placeholder="${arg?.description || ''}">`;
    }

    return `
      <div class="active-arg">
        <span class="arg-name">${argId}</span>
        ${input}
        <button type="button" class="remove-arg" data-arg="${argId}">×</button>
      </div>
    `;
  }).join('');
}

/**
 * 出力を更新
 */
function updateOutput() {
  const base = $('#base-selector')?.value || '@a';

  const args = Object.entries(activeArgs)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join(',');

  const selector = args ? `${base}[${args}]` : base;

  setOutput(selector, 'target-selector', { base, args: activeArgs });
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .selector-desc {
    font-size: 0.75rem;
    color: var(--mc-text-secondary);
    margin-top: var(--mc-space-xs);
  }

  .arg-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    border-radius: var(--mc-radius-md);
  }

  .arg-btn {
    padding: var(--mc-space-xs) var(--mc-space-sm);
    font-size: 0.7rem;
    font-family: var(--mc-font-mono);
    background-color: var(--mc-bg-panel);
    color: var(--mc-text-primary);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    transition: all 0.15s;
    border-radius: var(--mc-radius-sm);
  }

  .arg-btn:hover {
    background-color: var(--mc-color-grass-light);
    color: #fff;
    border-color: var(--mc-color-grass-main);
  }

  .arg-btn.active {
    background-color: var(--mc-color-grass-main);
    color: #fff;
    border-color: var(--mc-color-grass-main);
  }

  .active-args {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    border-radius: var(--mc-radius-md);
    min-height: 60px;
  }

  .active-arg {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    border-radius: var(--mc-radius-sm);
  }

  .active-arg .arg-name {
    font-family: var(--mc-font-mono);
    font-weight: bold;
    min-width: 80px;
    color: var(--mc-color-grass-main);
  }

  .active-arg .arg-value {
    flex: 1;
    color: var(--mc-text-primary);
  }

  .active-arg .remove-arg {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.25rem;
  }

  .active-arg .remove-arg:hover {
    transform: scale(1.2);
  }

  .reference-section, .examples-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    border-radius: var(--mc-radius-md);
  }

  .reference-section h3, .examples-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 1rem;
    color: var(--mc-text-primary);
  }

  .reference-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--mc-space-sm);
  }

  .ref-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    border-radius: var(--mc-radius-sm);
  }

  .ref-code {
    font-family: var(--mc-font-mono);
    font-weight: bold;
    color: var(--mc-color-grass-main);
  }

  .ref-desc {
    font-size: 0.75rem;
    color: var(--mc-text-primary);
  }

  .examples-list {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-xs);
  }

  .example-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-md);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    border-radius: var(--mc-radius-sm);
    cursor: pointer;
    transition: all 0.15s;
  }

  .example-item:hover {
    background-color: var(--mc-color-grass-light);
    border-color: var(--mc-color-grass-main);
  }

  .example-item:hover code,
  .example-item:hover span {
    color: #fff;
  }

  .example-item.copied {
    background-color: var(--mc-color-grass-main);
  }

  .example-item.copied code,
  .example-item.copied span {
    color: #fff;
  }

  .example-item code {
    font-family: var(--mc-font-mono);
    font-size: 0.8rem;
    color: var(--mc-color-diamond);
  }

  .example-item span {
    font-size: 0.75rem;
    color: var(--mc-text-secondary);
  }
`;
document.head.appendChild(style);

export default { render, init };
