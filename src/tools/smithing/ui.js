/**
 * Smithing/Trim Generator - UI
 */

import { $, $$, debounce } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';

// トリムパターン
const TRIM_PATTERNS = [
  { id: 'coast', name: 'コースト（海岸）' },
  { id: 'dune', name: 'デューン（砂丘）' },
  { id: 'eye', name: 'アイ（目）' },
  { id: 'host', name: 'ホスト（宿主）' },
  { id: 'raiser', name: 'レイザー' },
  { id: 'rib', name: 'リブ（肋骨）' },
  { id: 'sentry', name: 'セントリー（歩哨）' },
  { id: 'shaper', name: 'シェイパー' },
  { id: 'silence', name: 'サイレンス（静寂）' },
  { id: 'snout', name: 'スナウト（鼻）' },
  { id: 'spire', name: 'スパイア（尖塔）' },
  { id: 'tide', name: 'タイド（潮）' },
  { id: 'vex', name: 'ヴェックス' },
  { id: 'ward', name: 'ウォード（守護）' },
  { id: 'wayfinder', name: 'ウェイファインダー' },
  { id: 'wild', name: 'ワイルド（野生）' },
  { id: 'bolt', name: 'ボルト' },
  { id: 'flow', name: 'フロー' },
];

// トリム素材
const TRIM_MATERIALS = [
  { id: 'quartz', name: 'クォーツ', color: '#E3D4C4' },
  { id: 'iron', name: '鉄', color: '#CECECE' },
  { id: 'netherite', name: 'ネザライト', color: '#3D3B3B' },
  { id: 'redstone', name: 'レッドストーン', color: '#971607' },
  { id: 'copper', name: '銅', color: '#B4684D' },
  { id: 'gold', name: '金', color: '#DEB12D' },
  { id: 'emerald', name: 'エメラルド', color: '#11A036' },
  { id: 'diamond', name: 'ダイヤモンド', color: '#6EECD2' },
  { id: 'lapis', name: 'ラピスラズリ', color: '#21497B' },
  { id: 'amethyst', name: 'アメジスト', color: '#9A5CC6' },
  { id: 'resin', name: '樹脂', color: '#D98B34' },
];

// 防具素材
const ARMOR_MATERIALS = [
  { id: 'leather', name: '革' },
  { id: 'chainmail', name: 'チェーン' },
  { id: 'iron', name: '鉄' },
  { id: 'golden', name: '金' },
  { id: 'diamond', name: 'ダイヤモンド' },
  { id: 'netherite', name: 'ネザライト' },
];

// 防具タイプ
const ARMOR_TYPES = [
  { id: 'helmet', name: 'ヘルメット' },
  { id: 'chestplate', name: 'チェストプレート' },
  { id: 'leggings', name: 'レギンス' },
  { id: 'boots', name: 'ブーツ' },
];

/**
 * UIをレンダリング
 */
export function render(manifest) {
  const patternOptions = TRIM_PATTERNS.map(p =>
    `<option value="${p.id}">${p.name}</option>`
  ).join('');

  const materialOptions = TRIM_MATERIALS.map(m =>
    `<option value="${m.id}" style="background-color:${m.color}">${m.name}</option>`
  ).join('');

  const armorMaterialOptions = ARMOR_MATERIALS.map(m =>
    `<option value="${m.id}">${m.name}</option>`
  ).join('');

  const armorTypeOptions = ARMOR_TYPES.map(t =>
    `<option value="${t.id}">${t.name}</option>`
  ).join('');

  return `
    <div class="tool-panel" id="smithing-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
      </div>

      <form class="tool-form" id="smithing-form">
        <!-- 防具選択 -->
        <div class="form-row">
          <div class="form-group">
            <label for="armor-material">防具素材</label>
            <select id="armor-material" class="mc-select">
              ${armorMaterialOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="armor-type">防具タイプ</label>
            <select id="armor-type" class="mc-select">
              ${armorTypeOptions}
            </select>
          </div>
        </div>

        <!-- トリム選択 -->
        <div class="form-row">
          <div class="form-group">
            <label for="trim-pattern">トリムパターン</label>
            <select id="trim-pattern" class="mc-select">
              ${patternOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="trim-material">トリム素材</label>
            <select id="trim-material" class="mc-select">
              ${materialOptions}
            </select>
          </div>
        </div>

        <!-- フルセット生成 -->
        <div class="form-group">
          <label class="option-label">
            <input type="checkbox" id="generate-full-set">
            フルセット（4部位）を生成
          </label>
        </div>

        <!-- クイック選択 -->
        <div class="form-group">
          <label>パターンクイック選択</label>
          <div class="pattern-grid" id="pattern-grid">
            ${TRIM_PATTERNS.map(p => `
              <button type="button" class="pattern-btn" data-pattern="${p.id}" title="${p.name}">
                ${p.name.split('（')[0]}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label>素材クイック選択</label>
          <div class="material-grid" id="material-grid">
            ${TRIM_MATERIALS.map(m => `
              <button type="button" class="material-btn" data-material="${m.id}"
                      style="background-color:${m.color}" title="${m.name}">
              </button>
            `).join('')}
          </div>
        </div>
      </form>

      <!-- プレビュー -->
      <div class="trim-preview">
        <label>プレビュー</label>
        <div class="preview-armor" id="preview-armor">
          <div class="armor-piece helmet">
            <div class="armor-base"></div>
            <div class="armor-trim" id="preview-helmet-trim"></div>
          </div>
          <div class="armor-piece chestplate">
            <div class="armor-base"></div>
            <div class="armor-trim" id="preview-chestplate-trim"></div>
          </div>
          <div class="armor-piece leggings">
            <div class="armor-base"></div>
            <div class="armor-trim" id="preview-leggings-trim"></div>
          </div>
          <div class="armor-piece boots">
            <div class="armor-base"></div>
            <div class="armor-trim" id="preview-boots-trim"></div>
          </div>
        </div>
        <div class="preview-info">
          <span id="preview-pattern-name">コースト</span>
          <span id="preview-material-name" style="color: #E3D4C4">クォーツ</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // フォーム変更
  ['#armor-material', '#armor-type', '#trim-pattern', '#trim-material', '#generate-full-set'].forEach(sel => {
    $(sel, container)?.addEventListener('change', () => {
      updateCommand();
      updatePreview(container);
    });
  });

  // パターンクイック選択
  container.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('#trim-pattern', container).value = btn.dataset.pattern;
      container.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateCommand();
      updatePreview(container);
    });
  });

  // 素材クイック選択
  container.querySelectorAll('.material-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('#trim-material', container).value = btn.dataset.material;
      container.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateCommand();
      updatePreview(container);
    });
  });

  // 初期選択
  container.querySelector('.pattern-btn')?.classList.add('active');
  container.querySelector('.material-btn')?.classList.add('active');

  updateCommand();
  updatePreview(container);
}

/**
 * プレビューを更新
 */
function updatePreview(container) {
  const pattern = $('#trim-pattern', container)?.value || 'coast';
  const material = $('#trim-material', container)?.value || 'quartz';

  const patternInfo = TRIM_PATTERNS.find(p => p.id === pattern);
  const materialInfo = TRIM_MATERIALS.find(m => m.id === material);

  $('#preview-pattern-name', container).textContent = patternInfo?.name || pattern;
  const materialName = $('#preview-material-name', container);
  materialName.textContent = materialInfo?.name || material;
  materialName.style.color = materialInfo?.color || '#888';

  // トリムカラー適用
  container.querySelectorAll('.armor-trim').forEach(trim => {
    trim.style.borderColor = materialInfo?.color || '#888';
  });
}

/**
 * コマンドを更新
 */
function updateCommand() {
  const armorMaterial = $('#armor-material')?.value || 'diamond';
  const armorType = $('#armor-type')?.value || 'chestplate';
  const pattern = $('#trim-pattern')?.value || 'coast';
  const material = $('#trim-material')?.value || 'quartz';
  const fullSet = $('#generate-full-set')?.checked;

  const generateItem = (type) => {
    const itemId = `minecraft:${armorMaterial}_${type}`;
    const trimComponent = `trim={pattern:"minecraft:${pattern}",material:"minecraft:${material}"}`;
    return `/give @p ${itemId}[${trimComponent}]`;
  };

  let command;
  if (fullSet) {
    command = ARMOR_TYPES.map(t => generateItem(t.id)).join('\n');
  } else {
    command = generateItem(armorType);
  }

  setOutput(command, 'smithing', { armorMaterial, armorType, pattern, material, fullSet });
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .pattern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--mc-space-xs);
    max-height: 150px;
    overflow-y: auto;
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
  }

  .pattern-btn {
    padding: var(--mc-space-xs) var(--mc-space-sm);
    font-size: 0.7rem;
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    cursor: pointer;
    transition: all 0.15s;
  }

  .pattern-btn:hover {
    background-color: var(--mc-color-stone-300);
  }

  .pattern-btn.active {
    border-color: var(--mc-color-grass-main);
    background-color: var(--mc-color-grass-light);
    color: white;
  }

  .material-grid {
    display: flex;
    gap: var(--mc-space-xs);
    flex-wrap: wrap;
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
  }

  .material-btn {
    width: 32px;
    height: 32px;
    border: 3px solid var(--mc-border-dark);
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
  }

  .material-btn:hover {
    transform: scale(1.1);
  }

  .material-btn.active {
    border-color: white;
    box-shadow: 0 0 0 2px var(--mc-color-grass-main);
  }

  .trim-preview {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .trim-preview > label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-sm);
  }

  .preview-armor {
    display: flex;
    justify-content: center;
    gap: var(--mc-space-lg);
    padding: var(--mc-space-lg);
    background-color: var(--mc-bg-panel);
  }

  .armor-piece {
    position: relative;
    width: 40px;
  }

  .armor-piece .armor-base {
    background-color: #5ECDFA;
    border: 3px solid #444;
  }

  .armor-piece.helmet .armor-base {
    height: 30px;
    border-radius: 4px 4px 0 0;
  }

  .armor-piece.chestplate .armor-base {
    height: 50px;
  }

  .armor-piece.leggings .armor-base {
    height: 40px;
  }

  .armor-piece.boots .armor-base {
    height: 25px;
    border-radius: 0 0 4px 4px;
  }

  .armor-trim {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 50%;
    border: 3px solid #E3D4C4;
    border-radius: 2px;
    pointer-events: none;
  }

  .preview-info {
    display: flex;
    justify-content: center;
    gap: var(--mc-space-md);
    margin-top: var(--mc-space-md);
    font-size: 0.85rem;
  }
`;
document.head.appendChild(style);

export default { render, init };
