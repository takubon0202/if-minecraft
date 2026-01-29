/**
 * Smithing/Trim Generator - UI
 * 全19種トリムパターン、全11種素材、全7種防具素材対応
 * 1.21.5コンポーネント形式出力
 * Minecraft Wiki画像使用
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl, wikiImg } from '../../core/wiki-images.js';

// ======================================
// 画像URLヘルパー（共通モジュール使用）
// ======================================

/**
 * 防具のWiki画像URLを取得
 * @param {string} material - 素材ID（例: "diamond"）
 * @param {string} type - 部位ID（例: "helmet"）
 * @returns {string} 画像URL
 */
function getArmorImageUrl(material, type) {
  // 防具アイテムID: material_type (例: diamond_chestplate)
  return getInviconUrl(`${material}_${type}`);
}

/**
 * トリムテンプレートのWiki画像URLを取得
 * @param {string} patternId - パターンID（例: "coast"）
 * @returns {string} 画像URL
 */
function getTrimTemplateImageUrl(patternId) {
  if (patternId === 'netherite_upgrade') {
    return getInviconUrl('netherite_upgrade_smithing_template');
  }
  // トリムテンプレートID: {pattern}_armor_trim_smithing_template
  return getInviconUrl(`${patternId}_armor_trim_smithing_template`);
}

/**
 * 素材アイテムのWiki画像URLを取得
 * @param {string} itemId - アイテムID（例: "diamond", "gold_ingot"）
 * @returns {string} 画像URL
 */
function getMaterialImageUrl(itemId) {
  return getInviconUrl(itemId);
}

// ======================================
// データ定義
// ======================================

// トリムパターン（全19種 - 18種装飾 + 1種ネザライト強化）
const TRIM_PATTERNS = [
  // 装飾系（アルファベット順）
  { id: 'bolt', name: 'ボルト', en: 'Bolt', structure: 'トライアルチャンバー', category: 'decoration' },
  { id: 'coast', name: 'コースト', en: 'Coast', structure: '難破船', category: 'decoration' },
  { id: 'dune', name: 'デューン', en: 'Dune', structure: '砂漠のピラミッド', category: 'decoration' },
  { id: 'eye', name: 'アイ', en: 'Eye', structure: '要塞', category: 'decoration' },
  { id: 'flow', name: 'フロー', en: 'Flow', structure: 'トライアルチャンバー', category: 'decoration' },
  { id: 'host', name: 'ホスト', en: 'Host', structure: 'トライアルチャンバー', category: 'decoration' },
  { id: 'raiser', name: 'レイザー', en: 'Raiser', structure: 'トライアルチャンバー', category: 'decoration' },
  { id: 'rib', name: 'リブ', en: 'Rib', structure: 'ネザー要塞', category: 'decoration' },
  { id: 'sentry', name: 'セントリー', en: 'Sentry', structure: 'ピリジャーの前哨基地', category: 'decoration' },
  { id: 'shaper', name: 'シェイパー', en: 'Shaper', structure: 'トライアルチャンバー', category: 'decoration' },
  { id: 'silence', name: 'サイレンス', en: 'Silence', structure: '古代都市', category: 'decoration' },
  { id: 'snout', name: 'スナウト', en: 'Snout', structure: '砦の遺跡', category: 'decoration' },
  { id: 'spire', name: 'スパイア', en: 'Spire', structure: 'エンドシティ', category: 'decoration' },
  { id: 'tide', name: 'タイド', en: 'Tide', structure: '海底遺跡', category: 'decoration' },
  { id: 'vex', name: 'ヴェックス', en: 'Vex', structure: '森の洋館', category: 'decoration' },
  { id: 'ward', name: 'ウォード', en: 'Ward', structure: '古代都市', category: 'decoration' },
  { id: 'wayfinder', name: 'ウェイファインダー', en: 'Wayfinder', structure: 'トライアルチャンバー', category: 'decoration' },
  { id: 'wild', name: 'ワイルド', en: 'Wild', structure: 'ジャングルの寺院', category: 'decoration' },
  // ネザライト強化（特殊）
  { id: 'netherite_upgrade', name: 'ネザライト強化', en: 'Netherite Upgrade', structure: '砦の遺跡', category: 'upgrade' },
];

// トリム素材（全11種）
const TRIM_MATERIALS = [
  { id: 'amethyst', name: 'アメジスト', en: 'Amethyst', color: '#9A5CC6', item: 'amethyst_shard' },
  { id: 'copper', name: '銅', en: 'Copper', color: '#B4684D', item: 'copper_ingot' },
  { id: 'diamond', name: 'ダイヤモンド', en: 'Diamond', color: '#6EECD2', item: 'diamond' },
  { id: 'emerald', name: 'エメラルド', en: 'Emerald', color: '#11A036', item: 'emerald' },
  { id: 'gold', name: '金', en: 'Gold', color: '#DEB12D', item: 'gold_ingot' },
  { id: 'iron', name: '鉄', en: 'Iron', color: '#CECECE', item: 'iron_ingot' },
  { id: 'lapis', name: 'ラピスラズリ', en: 'Lapis', color: '#21497B', item: 'lapis_lazuli' },
  { id: 'netherite', name: 'ネザライト', en: 'Netherite', color: '#3D3B3B', item: 'netherite_ingot' },
  { id: 'quartz', name: 'クォーツ', en: 'Quartz', color: '#E3D4C4', item: 'quartz' },
  { id: 'redstone', name: 'レッドストーン', en: 'Redstone', color: '#971607', item: 'redstone' },
  { id: 'resin', name: '樹脂', en: 'Resin', color: '#D98B34', item: 'resin_brick' },
];

// 防具素材（全7種 - 銅装備含む）
const ARMOR_MATERIALS = [
  { id: 'leather', name: '革', en: 'Leather', color: '#8B4513', upgradable: false },
  { id: 'chainmail', name: 'チェーン', en: 'Chainmail', color: '#808080', upgradable: false },
  { id: 'iron', name: '鉄', en: 'Iron', color: '#D8D8D8', upgradable: false },
  { id: 'copper', name: '銅', en: 'Copper', color: '#B87333', upgradable: false },
  { id: 'golden', name: '金', en: 'Golden', color: '#FFD700', upgradable: false },
  { id: 'diamond', name: 'ダイヤモンド', en: 'Diamond', color: '#5ECDFA', upgradable: true },
  { id: 'netherite', name: 'ネザライト', en: 'Netherite', color: '#3D3B3B', upgradable: false },
];

// 防具タイプ（4部位）
const ARMOR_TYPES = [
  { id: 'helmet', name: 'ヘルメット', en: 'Helmet' },
  { id: 'chestplate', name: 'チェストプレート', en: 'Chestplate' },
  { id: 'leggings', name: 'レギンス', en: 'Leggings' },
  { id: 'boots', name: 'ブーツ', en: 'Boots' },
];

// プリセット
const PRESETS = [
  { name: 'ダイヤ+サイレンス+アメジスト', armorMaterial: 'diamond', pattern: 'silence', trimMaterial: 'amethyst' },
  { name: 'ネザライト+スパイア+金', armorMaterial: 'netherite', pattern: 'spire', trimMaterial: 'gold' },
  { name: '鉄+コースト+銅', armorMaterial: 'iron', pattern: 'coast', trimMaterial: 'copper' },
  { name: '金+ワイルド+エメラルド', armorMaterial: 'golden', pattern: 'wild', trimMaterial: 'emerald' },
  { name: 'ダイヤ+ウォード+ダイヤ', armorMaterial: 'diamond', pattern: 'ward', trimMaterial: 'diamond' },
  { name: '銅+ボルト+レッドストーン', armorMaterial: 'copper', pattern: 'bolt', trimMaterial: 'redstone' },
  { name: 'チェーン+デューン+クォーツ', armorMaterial: 'chainmail', pattern: 'dune', trimMaterial: 'quartz' },
  { name: '革+フロー+樹脂', armorMaterial: 'leather', pattern: 'flow', trimMaterial: 'resin' },
];

// 現在の選択状態
let state = {
  armorMaterial: 'diamond',
  armorType: 'chestplate',
  pattern: 'coast',
  trimMaterial: 'quartz',
  fullSet: false,
  searchQuery: '',
};

// ======================================
// UIレンダリング
// ======================================

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel smithing-panel" id="smithing-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'smithing_table')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
      </div>

      <form class="tool-form" id="smithing-form">
        <!-- 検索・プリセット -->
        <div class="smithing-search-section">
          <div class="form-group">
            <label for="smithing-search">パターン検索</label>
            <input type="text" id="smithing-search" class="mc-input smithing-search-input"
                   placeholder="パターン名で検索..." autocomplete="off">
          </div>
          <div class="form-group">
            <label>プリセット</label>
            <div class="preset-grid" id="preset-grid">
              ${PRESETS.map((p, i) => `
                <button type="button" class="preset-btn" data-preset="${i}" title="${p.name}">
                  <span class="preset-color" style="background: linear-gradient(135deg, ${ARMOR_MATERIALS.find(m => m.id === p.armorMaterial)?.color || '#888'} 50%, ${TRIM_MATERIALS.find(m => m.id === p.trimMaterial)?.color || '#888'} 50%)"></span>
                  <span class="preset-name">${p.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- メインコンテンツ -->
        <div class="smithing-main-content">
          <!-- 左：選択パネル -->
          <div class="smithing-selection-panel">
            <!-- 防具素材選択 -->
            <div class="selection-section">
              <label class="section-label">防具素材</label>
              <div class="armor-material-grid" id="armor-material-grid">
                ${ARMOR_MATERIALS.map(m => `
                  <button type="button" class="armor-material-btn ${m.id === state.armorMaterial ? 'active' : ''}"
                          data-armor-material="${m.id}" title="${m.name}"
                          style="--armor-color: ${m.color}">
                    ${wikiImg(getArmorImageUrl(m.id, 'chestplate'), m.name, 32)}
                    <span class="material-label">${m.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 防具部位選択 -->
            <div class="selection-section">
              <label class="section-label">防具部位</label>
              <div class="armor-type-grid" id="armor-type-grid">
                ${ARMOR_TYPES.map(t => `
                  <button type="button" class="armor-type-btn ${t.id === state.armorType ? 'active' : ''}"
                          data-armor-type="${t.id}" title="${t.name}">
                    ${wikiImg(getArmorImageUrl(state.armorMaterial, t.id), t.name, 32)}
                    <span class="armor-label">${t.name}</span>
                  </button>
                `).join('')}
              </div>
              <label class="fullset-toggle">
                <input type="checkbox" id="generate-full-set" ${state.fullSet ? 'checked' : ''}>
                <span>フルセット（4部位）を生成</span>
              </label>
            </div>

            <!-- トリムパターン選択 -->
            <div class="selection-section">
              <label class="section-label">トリムパターン（全19種）</label>
              <div class="pattern-grid" id="pattern-grid">
                ${renderPatternButtons()}
              </div>
            </div>

            <!-- トリム素材選択 -->
            <div class="selection-section">
              <label class="section-label">トリム素材（全11種）</label>
              <div class="trim-material-grid" id="trim-material-grid">
                ${TRIM_MATERIALS.map(m => `
                  <button type="button" class="trim-material-btn ${m.id === state.trimMaterial ? 'active' : ''}"
                          data-trim-material="${m.id}" title="${m.name}"
                          style="--trim-color: ${m.color}">
                    ${wikiImg(getMaterialImageUrl(m.item), m.name, 32)}
                    <span class="material-name">${m.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 右：プレビューパネル -->
          <div class="smithing-preview-panel">
            <label class="section-label">プレビュー</label>
            <div class="armor-preview-container" id="armor-preview">
              ${renderArmorPreview()}
            </div>
            <div class="preview-info" id="preview-info">
              ${renderPreviewInfo()}
            </div>
          </div>
        </div>
      </form>
    </div>
  `;
}

/**
 * パターンボタンをレンダリング
 */
function renderPatternButtons(filter = '') {
  const filtered = TRIM_PATTERNS.filter(p => {
    if (!filter) return true;
    const query = filter.toLowerCase();
    return p.name.toLowerCase().includes(query) ||
           p.en.toLowerCase().includes(query) ||
           p.structure.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    return '<div class="no-results">該当するパターンがありません</div>';
  }

  return filtered.map(p => `
    <button type="button" class="pattern-btn ${p.id === state.pattern ? 'active' : ''} ${p.category === 'upgrade' ? 'upgrade-pattern' : ''}"
            data-pattern="${p.id}" title="${p.name} (${p.en}) - ${p.structure}">
      ${wikiImg(getTrimTemplateImageUrl(p.id), p.en, 32)}
      <span class="pattern-name">${p.name}</span>
      <span class="pattern-en">${p.en}</span>
    </button>
  `).join('');
}

/**
 * 防具プレビューをレンダリング
 */
function renderArmorPreview() {
  const armorMat = ARMOR_MATERIALS.find(m => m.id === state.armorMaterial);
  const trimMat = TRIM_MATERIALS.find(m => m.id === state.trimMaterial);
  const patternInfo = TRIM_PATTERNS.find(p => p.id === state.pattern);

  const armorColor = armorMat?.color || '#888';
  const trimColor = trimMat?.color || '#888';

  // ネザライト強化の場合は特別表示
  if (patternInfo?.category === 'upgrade') {
    const armorType = ARMOR_TYPES.find(t => t.id === state.armorType);
    return `
      <div class="upgrade-preview">
        <div class="upgrade-icon">
          <span class="upgrade-before">${wikiImg(getArmorImageUrl('diamond', state.armorType), 'Diamond ' + (armorType?.en || ''), 48)}</span>
          <span class="upgrade-arrow">+</span>
          <span class="upgrade-material">${wikiImg(getMaterialImageUrl('netherite_ingot'), 'Netherite Ingot', 32)}</span>
          <span class="upgrade-arrow">=</span>
          <span class="upgrade-after">${wikiImg(getArmorImageUrl('netherite', state.armorType), 'Netherite ' + (armorType?.en || ''), 48)}</span>
        </div>
        <div class="upgrade-label">ネザライト強化</div>
      </div>
    `;
  }

  return `
    <div class="armor-display">
      <div class="armor-figure">
        ${ARMOR_TYPES.map(type => `
          <div class="armor-piece ${type.id} ${state.fullSet || type.id === state.armorType ? 'active' : ''}">
            ${wikiImg(getArmorImageUrl(state.armorMaterial, type.id), state.armorMaterial + ' ' + type.en, 48)}
          </div>
        `).join('')}
      </div>
      <div class="preview-trim-info">
        <span class="trim-pattern-preview">
          ${wikiImg(getTrimTemplateImageUrl(state.pattern), patternInfo?.en || '', 24)}
          <span>${patternInfo?.name || ''}</span>
        </span>
        <span class="trim-material-preview" style="color: ${trimColor}">
          ${wikiImg(getMaterialImageUrl(trimMat?.item || ''), trimMat?.name || '', 24)}
          <span>${trimMat?.name || ''}</span>
        </span>
      </div>
    </div>
  `;
}

/**
 * プレビュー情報をレンダリング
 */
function renderPreviewInfo() {
  const armorMat = ARMOR_MATERIALS.find(m => m.id === state.armorMaterial);
  const trimMat = TRIM_MATERIALS.find(m => m.id === state.trimMaterial);
  const patternInfo = TRIM_PATTERNS.find(p => p.id === state.pattern);

  return `
    <div class="info-row">
      <span class="info-label">防具:</span>
      <span class="info-value" style="color: ${armorMat?.color || '#888'}">${armorMat?.name || ''}</span>
    </div>
    <div class="info-row">
      <span class="info-label">パターン:</span>
      <span class="info-value">${patternInfo?.name || ''} (${patternInfo?.en || ''})</span>
    </div>
    <div class="info-row">
      <span class="info-label">素材:</span>
      <span class="info-value" style="color: ${trimMat?.color || '#888'}">${trimMat?.name || ''}</span>
    </div>
    <div class="info-row">
      <span class="info-label">入手:</span>
      <span class="info-value structure">${patternInfo?.structure || ''}</span>
    </div>
  `;
}

// ======================================
// 初期化・イベント処理
// ======================================

/**
 * 初期化
 */
export function init(container) {
  // 検索入力
  const searchInput = $('#smithing-search', container);
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.searchQuery = e.target.value;
      updatePatternGrid(container);
    }, 200));
  }

  // プリセットクリック
  delegate(container, 'click', '.preset-btn', (e, target) => {
    const presetIndex = parseInt(target.dataset.preset);
    const preset = PRESETS[presetIndex];
    if (preset) {
      state.armorMaterial = preset.armorMaterial;
      state.pattern = preset.pattern;
      state.trimMaterial = preset.trimMaterial;
      updateAllUI(container);
      updateCommand();
    }
  });

  // 防具素材クリック
  delegate(container, 'click', '.armor-material-btn', (e, target) => {
    state.armorMaterial = target.dataset.armorMaterial;
    updateActiveButton(container, '.armor-material-btn', 'data-armor-material', state.armorMaterial);
    updateArmorTypeGrid(container);
    updatePreview(container);
    updateCommand();
  });

  // 防具部位クリック
  delegate(container, 'click', '.armor-type-btn', (e, target) => {
    state.armorType = target.dataset.armorType;
    updateActiveButton(container, '.armor-type-btn', 'data-armor-type', state.armorType);
    updatePreview(container);
    updateCommand();
  });

  // パターンクリック
  delegate(container, 'click', '.pattern-btn', (e, target) => {
    state.pattern = target.dataset.pattern;
    updateActiveButton(container, '.pattern-btn', 'data-pattern', state.pattern);
    updatePreview(container);
    updateCommand();
  });

  // トリム素材クリック
  delegate(container, 'click', '.trim-material-btn', (e, target) => {
    state.trimMaterial = target.dataset.trimMaterial;
    updateActiveButton(container, '.trim-material-btn', 'data-trim-material', state.trimMaterial);
    updatePreview(container);
    updateCommand();
  });

  // フルセットチェック
  const fullSetCheckbox = $('#generate-full-set', container);
  if (fullSetCheckbox) {
    fullSetCheckbox.addEventListener('change', (e) => {
      state.fullSet = e.target.checked;
      updatePreview(container);
      updateCommand();
    });
  }

  // 初期コマンド生成
  updateCommand();
}

/**
 * アクティブボタンを更新
 */
function updateActiveButton(container, selector, attr, value) {
  container.querySelectorAll(selector).forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute(attr) === value);
  });
}

/**
 * パターングリッドを更新
 */
function updatePatternGrid(container) {
  const grid = $('#pattern-grid', container);
  if (grid) {
    grid.innerHTML = renderPatternButtons(state.searchQuery);
  }
}

/**
 * 防具部位グリッドを更新（素材変更時に画像も更新）
 */
function updateArmorTypeGrid(container) {
  const grid = $('#armor-type-grid', container);
  if (grid) {
    grid.innerHTML = ARMOR_TYPES.map(t => `
      <button type="button" class="armor-type-btn ${t.id === state.armorType ? 'active' : ''}"
              data-armor-type="${t.id}" title="${t.name}">
        ${wikiImg(getArmorImageUrl(state.armorMaterial, t.id), t.name, 32)}
        <span class="armor-label">${t.name}</span>
      </button>
    `).join('');
  }
}

/**
 * プレビューを更新
 */
function updatePreview(container) {
  const preview = $('#armor-preview', container);
  const info = $('#preview-info', container);
  if (preview) {
    preview.innerHTML = renderArmorPreview();
  }
  if (info) {
    info.innerHTML = renderPreviewInfo();
  }
}

/**
 * 全UIを更新
 */
function updateAllUI(container) {
  updateActiveButton(container, '.armor-material-btn', 'data-armor-material', state.armorMaterial);
  updateArmorTypeGrid(container);
  updateActiveButton(container, '.pattern-btn', 'data-pattern', state.pattern);
  updateActiveButton(container, '.trim-material-btn', 'data-trim-material', state.trimMaterial);
  updatePreview(container);
}

/**
 * コマンドを更新（1.21.5コンポーネント形式）
 */
function updateCommand() {
  const patternInfo = TRIM_PATTERNS.find(p => p.id === state.pattern);

  // ネザライト強化の場合
  if (patternInfo?.category === 'upgrade') {
    const generateUpgradeItem = (type) => {
      // ダイヤモンド装備をネザライトに強化
      const sourceId = `minecraft:diamond_${type}`;
      const targetId = `minecraft:netherite_${type}`;
      return `/give @p ${targetId}`;
    };

    let command;
    if (state.fullSet) {
      command = ARMOR_TYPES.map(t => generateUpgradeItem(t.id)).join('\n');
    } else {
      command = generateUpgradeItem(state.armorType);
    }

    setOutput(command, 'smithing', { ...state });
    return;
  }

  // 通常のトリム
  const generateItem = (type) => {
    const itemId = `minecraft:${state.armorMaterial}_${type}`;
    // 1.21.5コンポーネント形式
    const trimComponent = `trim={pattern:"minecraft:${state.pattern}",material:"minecraft:${state.trimMaterial}"}`;
    return `/give @p ${itemId}[${trimComponent}]`;
  };

  let command;
  if (state.fullSet) {
    command = ARMOR_TYPES.map(t => generateItem(t.id)).join('\n');
  } else {
    command = generateItem(state.armorType);
  }

  setOutput(command, 'smithing', { ...state });
}

// ======================================
// スタイル
// ======================================

const style = document.createElement('style');
style.textContent = `
  /* Wiki画像アイコン */
  .mc-wiki-img {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    vertical-align: middle;
  }

  /* メインレイアウト */
  .smithing-panel {
    max-width: 100%;
  }

  .smithing-search-section {
    margin-bottom: var(--mc-space-lg);
    padding-bottom: var(--mc-space-lg);
    border-bottom: 2px solid var(--mc-border-dark);
  }

  .smithing-search-input {
    width: 100%;
    max-width: 400px;
  }

  .smithing-main-content {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: var(--mc-space-xl);
  }

  @media (max-width: 900px) {
    .smithing-main-content {
      grid-template-columns: 1fr;
    }
  }

  /* プリセット */
  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-sm);
  }

  .preset-btn {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-xs) var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 2px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.15s;
  }

  .preset-btn:hover {
    background-color: var(--mc-color-stone-300);
    transform: translateY(-1px);
  }

  .preset-color {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1px solid var(--mc-border-darker);
  }

  .preset-name {
    color: var(--mc-text-secondary);
  }

  /* セクション */
  .selection-section {
    margin-bottom: var(--mc-space-lg);
  }

  .section-label {
    display: block;
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* 防具素材グリッド */
  .armor-material-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-xs);
  }

  .armor-material-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    cursor: pointer;
    transition: all 0.15s;
    min-width: 70px;
  }

  .armor-material-btn:hover {
    background-color: var(--mc-color-stone-300);
    transform: translateY(-2px);
  }

  .armor-material-btn.active {
    border-color: var(--mc-color-grass-main);
    background-color: var(--mc-color-grass-light);
    color: white;
  }

  .material-label {
    font-size: 0.7rem;
    font-weight: 500;
    text-align: center;
  }

  /* 防具部位グリッド */
  .armor-type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-sm);
  }

  .armor-type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    cursor: pointer;
    transition: all 0.15s;
    min-height: 70px;
  }

  .armor-type-btn:hover {
    background-color: var(--mc-color-stone-300);
    transform: translateY(-2px);
  }

  .armor-type-btn.active {
    border-color: var(--mc-color-grass-main);
    background-color: var(--mc-color-grass-light);
    color: white;
  }

  .armor-label {
    font-size: 0.7rem;
    text-align: center;
  }

  .fullset-toggle {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    font-size: 0.85rem;
    cursor: pointer;
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
  }

  .fullset-toggle input {
    cursor: pointer;
  }

  /* パターングリッド */
  .pattern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--mc-space-xs);
    max-height: 280px;
    overflow-y: auto;
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
  }

  .pattern-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    cursor: pointer;
    transition: all 0.15s;
    min-height: 80px;
  }

  .pattern-btn:hover {
    background-color: var(--mc-color-stone-300);
    transform: scale(1.02);
  }

  .pattern-btn.active {
    border-color: var(--mc-color-grass-main);
    background-color: var(--mc-color-grass-light);
    color: white;
  }

  .pattern-btn.upgrade-pattern {
    background: linear-gradient(135deg, var(--mc-bg-surface) 0%, #4a3b5c 100%);
    border-color: #6b4c8c;
  }

  .pattern-btn.upgrade-pattern.active {
    background: linear-gradient(135deg, var(--mc-color-grass-light) 0%, #6b4c8c 100%);
  }

  .pattern-name {
    font-size: 0.75rem;
    font-weight: bold;
    text-align: center;
  }

  .pattern-en {
    font-size: 0.6rem;
    color: var(--mc-text-muted);
  }

  .pattern-btn.active .pattern-en {
    color: rgba(255,255,255,0.8);
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--mc-space-lg);
    color: var(--mc-text-muted);
  }

  /* トリム素材グリッド */
  .trim-material-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-sm);
  }

  .trim-material-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 3px solid var(--mc-border-dark);
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    min-width: 60px;
  }

  .trim-material-btn:hover {
    transform: scale(1.05);
    z-index: 1;
    background-color: var(--mc-color-stone-300);
  }

  .trim-material-btn.active {
    border-color: var(--trim-color, var(--mc-color-grass-main));
    box-shadow: 0 0 0 2px var(--trim-color, var(--mc-color-grass-main)), 0 4px 8px rgba(0,0,0,0.3);
    transform: scale(1.05);
    z-index: 2;
    background-color: var(--mc-color-stone-300);
  }

  .trim-material-btn .material-name {
    font-size: 0.6rem;
    color: var(--mc-text-secondary);
    white-space: nowrap;
    text-align: center;
  }

  .trim-material-btn.active .material-name {
    color: var(--mc-text-primary);
    font-weight: bold;
  }

  /* プレビューパネル */
  .smithing-preview-panel {
    background-color: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    padding: var(--mc-space-md);
  }

  .armor-preview-container {
    background-color: var(--mc-bg-panel);
    padding: var(--mc-space-lg);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .armor-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--mc-space-md);
  }

  .armor-figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .armor-piece {
    position: relative;
    opacity: 0.3;
    transition: all 0.2s;
    filter: grayscale(0.5);
  }

  .armor-piece.active {
    opacity: 1;
    transform: scale(1.1);
    filter: none;
  }

  .armor-piece .mc-wiki-img {
    display: block;
  }

  /* プレビュー下部のトリム情報 */
  .preview-trim-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    border-radius: 4px;
  }

  .trim-pattern-preview,
  .trim-material-preview {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
    font-size: 0.8rem;
  }

  .trim-pattern-preview span,
  .trim-material-preview span {
    font-weight: 500;
  }

  /* ネザライト強化プレビュー */
  .upgrade-preview {
    text-align: center;
    padding: var(--mc-space-md);
  }

  .upgrade-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .upgrade-before, .upgrade-after {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upgrade-arrow {
    color: var(--mc-text-muted);
    font-size: 1.5rem;
    font-weight: bold;
  }

  .upgrade-material {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upgrade-label {
    font-size: 1rem;
    font-weight: bold;
    color: var(--mc-color-gold);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background-color: var(--mc-bg-panel);
    border: 2px solid var(--mc-color-gold);
    border-radius: 4px;
  }

  /* プレビュー情報 */
  .preview-info {
    margin-top: var(--mc-space-md);
    padding-top: var(--mc-space-md);
    border-top: 1px solid var(--mc-border-dark);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: var(--mc-space-xs) 0;
    font-size: 0.8rem;
  }

  .info-label {
    color: var(--mc-text-muted);
  }

  .info-value {
    font-weight: 500;
  }

  .info-value.structure {
    color: var(--mc-color-gold);
    font-size: 0.75rem;
  }

  /* ダークモードでのコントラスト改善（オレンジ/銅テーマ） */
  @media (prefers-color-scheme: dark) {
    .smithing-panel .preset-btn {
      background: #2a2520;
      color: #e0e0e0;
      border-color: #555;
    }

    .smithing-panel .preset-btn:hover {
      background: rgba(184, 104, 77, 0.3);
      border-color: #b4684d;
    }

    .smithing-panel .preset-name {
      color: #e0e0e0;
    }

    .smithing-panel .section-label {
      color: #b0b0b0;
    }

    .smithing-panel .armor-material-btn,
    .smithing-panel .armor-type-btn {
      background: #2a2520;
      color: #e0e0e0;
      border-color: #555;
    }

    .smithing-panel .armor-material-btn:hover,
    .smithing-panel .armor-type-btn:hover {
      background: rgba(184, 104, 77, 0.2);
    }

    .smithing-panel .armor-material-btn.active,
    .smithing-panel .armor-type-btn.active {
      background: #b4684d;
      color: white;
      border-color: #8b5040;
    }

    .smithing-panel .material-label,
    .smithing-panel .armor-label {
      color: inherit;
    }

    .smithing-panel .fullset-toggle {
      background: #2a2520;
      color: #e0e0e0;
      border-color: #555;
    }

    .smithing-panel .pattern-grid {
      background: #1a1a1a;
      border-color: #555;
    }

    .smithing-panel .pattern-btn {
      background: #2a2520;
      color: #e0e0e0;
      border-color: #555;
    }

    .smithing-panel .pattern-btn:hover {
      background: rgba(184, 104, 77, 0.2);
    }

    .smithing-panel .pattern-btn.active {
      background: #b4684d;
      color: white;
      border-color: #8b5040;
    }

    .smithing-panel .pattern-name {
      color: inherit;
    }

    .smithing-panel .pattern-en {
      color: #b0b0b0;
    }

    .smithing-panel .pattern-btn.active .pattern-en {
      color: rgba(255, 255, 255, 0.8);
    }

    .smithing-panel .trim-material-btn {
      background: #2a2520;
      color: #e0e0e0;
      border-color: #555;
    }

    .smithing-panel .trim-material-btn:hover {
      background: rgba(184, 104, 77, 0.2);
    }

    .smithing-panel .trim-material-btn .material-name {
      color: #b0b0b0;
    }

    .smithing-panel .trim-material-btn.active .material-name {
      color: #e8e8e8;
    }

    .smithing-panel .smithing-preview-panel {
      background: #2a2520;
      border-color: #555;
    }

    .smithing-panel .armor-preview-container {
      background: #1a1a1a;
    }

    .smithing-panel .preview-trim-info {
      background: #2a2520;
      border-color: #555;
    }

    .smithing-panel .trim-pattern-preview span,
    .smithing-panel .trim-material-preview span {
      color: #e0e0e0;
    }

    .smithing-panel .upgrade-label {
      background: #2a2520;
      border-color: #b4684d;
      color: #ffaa44;
    }

    .smithing-panel .upgrade-arrow {
      color: #b0b0b0;
    }

    .smithing-panel .preview-info {
      border-top-color: #555;
    }

    .smithing-panel .info-label {
      color: #b0b0b0;
    }

    .smithing-panel .info-value {
      color: #e0e0e0;
    }

    .smithing-panel .no-results {
      color: #b0b0b0;
    }

    .smithing-panel .mc-input {
      background: #2a2a2a;
      color: #e8e8e8;
      border-color: #555;
    }

    .smithing-panel .mc-input:focus {
      border-color: #b4684d;
      box-shadow: 0 0 0 2px rgba(184, 104, 77, 0.3);
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
