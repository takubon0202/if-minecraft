/**
 * Potion Generator - UI (minecraft-blog.net参考)
 * 全33種エフェクト対応、検索機能、無限効果、バージョン対応
 * Minecraft Wiki画像使用
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { workspaceStore } from '../../core/store.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl, getEffectIconUrl } from '../../core/wiki-images.js';
import { compareVersions, getVersionGroup, getVersionNote } from '../../core/version-compat.js';
import { RichTextEditor, RICH_TEXT_EDITOR_CSS } from '../../core/rich-text-editor.js';

// 全エフェクト一覧（33種類+）- colorは色付き円のフォールバック用
const EFFECTS = [
  // 有益（Beneficial）
  { id: 'speed', name: '移動速度上昇', en: 'Speed', type: 'beneficial', color: '#7CAFC6' },
  { id: 'haste', name: '採掘速度上昇', en: 'Haste', type: 'beneficial', color: '#D9C043' },
  { id: 'strength', name: '攻撃力上昇', en: 'Strength', type: 'beneficial', color: '#932423' },
  { id: 'instant_health', name: '即時回復', en: 'Instant Health', type: 'beneficial', color: '#F82423' },
  { id: 'jump_boost', name: '跳躍力上昇', en: 'Jump Boost', type: 'beneficial', color: '#22FF4C' },
  { id: 'regeneration', name: '再生', en: 'Regeneration', type: 'beneficial', color: '#CD5CAB' },
  { id: 'resistance', name: '耐性', en: 'Resistance', type: 'beneficial', color: '#99453A' },
  { id: 'fire_resistance', name: '火炎耐性', en: 'Fire Resistance', type: 'beneficial', color: '#E49A3A' },
  { id: 'water_breathing', name: '水中呼吸', en: 'Water Breathing', type: 'beneficial', color: '#2E5299' },
  { id: 'invisibility', name: '透明化', en: 'Invisibility', type: 'beneficial', color: '#7F8392' },
  { id: 'night_vision', name: '暗視', en: 'Night Vision', type: 'beneficial', color: '#1F1FA1' },
  { id: 'health_boost', name: '体力増強', en: 'Health Boost', type: 'beneficial', color: '#F87D23' },
  { id: 'absorption', name: '衝撃吸収', en: 'Absorption', type: 'beneficial', color: '#2552A5' },
  { id: 'saturation', name: '満腹度回復', en: 'Saturation', type: 'beneficial', color: '#F82423' },
  { id: 'luck', name: '幸運', en: 'Luck', type: 'beneficial', color: '#339900' },
  { id: 'slow_falling', name: '低速落下', en: 'Slow Falling', type: 'beneficial', color: '#FFEFD1' },
  { id: 'conduit_power', name: 'コンジットパワー', en: 'Conduit Power', type: 'beneficial', color: '#1DC2D1' },
  { id: 'dolphins_grace', name: 'イルカの好意', en: "Dolphin's Grace", type: 'beneficial', color: '#88A3BE' },
  { id: 'hero_of_the_village', name: '村の英雄', en: 'Hero of the Village', type: 'beneficial', color: '#44FF44' },
  // 有害（Harmful）
  { id: 'slowness', name: '移動速度低下', en: 'Slowness', type: 'harmful', color: '#5A6C81' },
  { id: 'mining_fatigue', name: '採掘速度低下', en: 'Mining Fatigue', type: 'harmful', color: '#4A4217' },
  { id: 'instant_damage', name: '即時ダメージ', en: 'Instant Damage', type: 'harmful', color: '#430A09' },
  { id: 'nausea', name: '吐き気', en: 'Nausea', type: 'harmful', color: '#551D4A' },
  { id: 'blindness', name: '盲目', en: 'Blindness', type: 'harmful', color: '#1F1F23' },
  { id: 'hunger', name: '空腹', en: 'Hunger', type: 'harmful', color: '#587653' },
  { id: 'weakness', name: '弱体化', en: 'Weakness', type: 'harmful', color: '#484D48' },
  { id: 'poison', name: '毒', en: 'Poison', type: 'harmful', color: '#4E9331' },
  { id: 'wither', name: 'ウィザー', en: 'Wither', type: 'harmful', color: '#352A27' },
  { id: 'levitation', name: '浮遊', en: 'Levitation', type: 'harmful', color: '#CEFFFF' },
  { id: 'unluck', name: '不運', en: 'Bad Luck', type: 'harmful', color: '#C0A44D' },
  { id: 'bad_omen', name: '不吉な予感', en: 'Bad Omen', type: 'harmful', color: '#0B6138' },
  { id: 'darkness', name: '暗闇', en: 'Darkness', type: 'harmful', color: '#292929' },
  { id: 'infested', name: '虫食い', en: 'Infested', type: 'harmful', color: '#8B8B8B' },
  { id: 'oozing', name: '滲出', en: 'Oozing', type: 'harmful', color: '#2E8B57' },
  { id: 'weaving', name: '巣張り', en: 'Weaving', type: 'harmful', color: '#666666' },
  { id: 'wind_charged', name: '蓄風', en: 'Wind Charged', type: 'harmful', color: '#B0E0E6' },
  // 中立（Neutral）
  { id: 'glowing', name: '発光', en: 'Glowing', type: 'neutral', color: '#94A061' },
  { id: 'trial_omen', name: 'トライアルの前兆', en: 'Trial Omen', type: 'neutral', color: '#5D3FD3' },
  { id: 'raid_omen', name: '襲撃の前兆', en: 'Raid Omen', type: 'neutral', color: '#8B0000' },
];

// ポーションタイプ
const POTION_TYPES = [
  { id: 'potion', name: '通常のポーション' },
  { id: 'splash_potion', name: 'スプラッシュポーション' },
  { id: 'lingering_potion', name: '残留ポーション' },
  { id: 'tipped_arrow', name: '効果付きの矢' },
];

// エフェクトアイコンのHTML生成（画像またはカラー円フォールバック）
function renderEffectIcon(effectId, color, size = 18) {
  const iconUrl = getEffectIconUrl(effectId);
  return `<img src="${iconUrl}" alt="" class="effect-icon-img" width="${size}" height="${size}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'"><span class="effect-icon-fallback" style="display:none;background-color:${color}"></span>`;
}

// プリセットカテゴリ
const PRESET_CATEGORIES = {
  combat: { name: '戦闘', icon: 'netherite_sword', color: '#c80000' },
  utility: { name: 'ユーティリティ', icon: 'compass', color: '#4decf2' },
  exploration: { name: '探検', icon: 'spyglass', color: '#5cb746' },
  extreme: { name: '極限', icon: 'nether_star', color: '#ff55ff' },
};

// プリセット（カテゴリ付き）
const PRESETS = [
  // 戦闘
  { id: 'healing2', name: '回復II', category: 'combat', desc: '即時回復 効果レベル2', effects: [{ id: 'instant_health', duration: 1, amplifier: 1 }] },
  { id: 'strength2', name: '力II', category: 'combat', desc: '攻撃力上昇 1:30', effects: [{ id: 'strength', duration: 1800, amplifier: 1 }] },
  { id: 'regen2', name: '再生II', category: 'combat', desc: '再生能力 0:22', effects: [{ id: 'regeneration', duration: 450, amplifier: 1 }] },
  { id: 'resistance', name: '耐性', category: 'combat', desc: 'ダメージ軽減 5:00', effects: [{ id: 'resistance', duration: 6000, amplifier: 0 }] },
  // ユーティリティ
  { id: 'speed2', name: '俊敏II', category: 'utility', desc: '移動速度上昇 1:30', effects: [{ id: 'speed', duration: 1800, amplifier: 1 }] },
  { id: 'jump', name: '跳躍II', category: 'utility', desc: 'ジャンプ力増加 3:00', effects: [{ id: 'jump_boost', duration: 3600, amplifier: 1 }] },
  { id: 'invis', name: '透明化', category: 'utility', desc: '姿を消す 3:00', effects: [{ id: 'invisibility', duration: 3600, amplifier: 0 }] },
  { id: 'slow_fall', name: '低速落下', category: 'utility', desc: '落下速度減少 3:00', effects: [{ id: 'slow_falling', duration: 3600, amplifier: 0 }] },
  // 探検
  { id: 'night', name: '暗視', category: 'exploration', desc: '暗所でも視界良好 3:00', effects: [{ id: 'night_vision', duration: 3600, amplifier: 0 }] },
  { id: 'water', name: '水中呼吸', category: 'exploration', desc: '水中での呼吸 3:00', effects: [{ id: 'water_breathing', duration: 3600, amplifier: 0 }] },
  { id: 'fire', name: '耐火', category: 'exploration', desc: '火炎ダメージ無効 3:00', effects: [{ id: 'fire_resistance', duration: 3600, amplifier: 0 }] },
  { id: 'conduit', name: 'コンジット', category: 'exploration', desc: '水中能力向上 5:00', effects: [{ id: 'conduit_power', duration: 6000, amplifier: 0 }] },
  // 極限
  { id: 'god', name: '全能ポーション', category: 'extreme', desc: '全有益効果無限', effects: [
    { id: 'strength', duration: -1, amplifier: 4 },
    { id: 'speed', duration: -1, amplifier: 4 },
    { id: 'regeneration', duration: -1, amplifier: 4 },
    { id: 'resistance', duration: -1, amplifier: 4 },
    { id: 'fire_resistance', duration: -1, amplifier: 0 },
    { id: 'night_vision', duration: -1, amplifier: 0 },
    { id: 'water_breathing', duration: -1, amplifier: 0 },
    { id: 'jump_boost', duration: -1, amplifier: 2 },
    { id: 'haste', duration: -1, amplifier: 2 },
  ]},
  { id: 'death', name: '即死ポーション', category: 'extreme', desc: '即時ダメージ最大', effects: [
    { id: 'instant_damage', duration: 1, amplifier: 255 },
  ]},
  { id: 'chaos', name: '混沌ポーション', category: 'extreme', desc: '有害効果の嵐', effects: [
    { id: 'poison', duration: -1, amplifier: 5 },
    { id: 'wither', duration: -1, amplifier: 2 },
    { id: 'slowness', duration: -1, amplifier: 5 },
    { id: 'weakness', duration: -1, amplifier: 5 },
    { id: 'blindness', duration: -1, amplifier: 0 },
    { id: 'nausea', duration: -1, amplifier: 0 },
  ]},
];

let selectedEffects = [];
let searchQuery = '';
let customNameEditor = null;

/**
 * UIをレンダリング
 */
export function render(manifest) {
  // リッチテキストエディターのインスタンスを作成
  customNameEditor = new RichTextEditor('potion-name-rte', {
    placeholder: '例: 最強のポーション',
    showPreview: true,
    onChange: () => {} // 初期化時に更新
  });
  return `
    <style>${RICH_TEXT_EDITOR_CSS}</style>
    <div class="tool-panel potion-tool" id="potion-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'potion')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="version-badge" id="potion-version-badge">1.21+</span>
        <button type="button" class="reset-btn" id="potion-reset-btn" title="設定をリセット">リセット</button>
      </div>
      <p class="version-note" id="potion-version-note"></p>

      <form class="tool-form" id="potion-form">
        <!-- ポーションタイプ選択（タブ形式） -->
        <div class="form-group">
          <label>ポーションタイプ</label>
          <div class="potion-type-tabs" id="potion-type-tabs">
            ${POTION_TYPES.map((t, i) => `
              <button type="button" class="type-tab ${i === 0 ? 'active' : ''}" data-type="${t.id}">
                <img src="${getInviconUrl(t.id)}" alt="${t.name}" class="tab-icon-img" width="32" height="32" loading="lazy" onerror="this.style.opacity='0.3'">
                <span class="tab-name">${t.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 設定行 -->
        <div class="form-row">
          <div class="form-group">
            <label for="potion-count">個数</label>
            <input type="number" id="potion-count" class="mc-input" value="1" min="1" max="64">
          </div>
        </div>

        <!-- カスタム名（リッチテキストエディター） -->
        <div class="form-group">
          <label>カスタム名 <small style="color: var(--mc-text-muted);">（1文字ごとに色や書式を設定可能）</small></label>
          ${customNameEditor.render()}
        </div>

        <!-- カスタムカラー -->
        <div class="form-group">
          <label>
            <input type="checkbox" id="potion-use-color"> カスタム色を使用
          </label>
          <div class="color-picker-row" id="color-picker-row" style="display: none;">
            <input type="color" id="potion-color" value="#3F76E4">
            <input type="text" id="potion-color-hex" class="mc-input" value="#3F76E4" style="width: 100px;">
            <div class="color-preview" id="color-preview"></div>
          </div>
        </div>

        <!-- エフェクト検索 -->
        <div class="form-group">
          <label>エフェクトを追加</label>
          <input type="text" id="effect-search" class="mc-input effect-search" placeholder="エフェクト名で検索...">
        </div>

        <!-- エフェクトタブとグリッド -->
        <div class="form-group">
          <div class="effect-tabs">
            <button type="button" class="effect-tab active" data-type="beneficial">
              <span class="tab-dot beneficial"></span>有益 (${EFFECTS.filter(e => e.type === 'beneficial').length})
            </button>
            <button type="button" class="effect-tab" data-type="harmful">
              <span class="tab-dot harmful"></span>有害 (${EFFECTS.filter(e => e.type === 'harmful').length})
            </button>
            <button type="button" class="effect-tab" data-type="neutral">
              <span class="tab-dot neutral"></span>中立 (${EFFECTS.filter(e => e.type === 'neutral').length})
            </button>
            <button type="button" class="effect-tab" data-type="all">
              全て (${EFFECTS.length})
            </button>
          </div>
          <div class="effect-grid-container">
            <div class="effect-grid" id="effect-grid"></div>
          </div>
        </div>

        <!-- 選択されたエフェクト -->
        <div class="form-group">
          <label>選択中のエフェクト <span id="effect-count">(0)</span></label>
          <div class="selected-effects" id="selected-effects">
            <p class="empty-message">上のグリッドからエフェクトをクリックして追加</p>
          </div>
        </div>

        <!-- プリセット（カテゴリ別） -->
        <div class="form-group">
          <label>プリセット</label>
          <div class="preset-categories">
            ${Object.entries(PRESET_CATEGORIES).map(([catId, cat]) => `
              <div class="preset-category" data-category="${catId}">
                <div class="preset-category-header" style="border-left-color: ${cat.color};">
                  <img src="${getInviconUrl(cat.icon)}" class="preset-category-icon mc-wiki-image" width="16" height="16" alt="">
                  <span>${cat.name}</span>
                </div>
                <div class="preset-category-buttons">
                  ${PRESETS.filter(p => p.category === catId).map(p => `
                    <button type="button" class="preset-btn" data-preset="${p.id}" title="${p.desc || p.effects.map(e => EFFECTS.find(ef => ef.id === e.id)?.name).join(', ')}">
                      <span>${p.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="preset-btn preset-clear" data-preset="clear" style="margin-top: 8px;">
            クリア
          </button>
        </div>
      </form>

      <!-- Minecraft風ゲーム画面プレビュー -->
      <div class="potion-preview-section">
        <h3>プレビュー</h3>
        <div class="mc-inventory-preview">
          <!-- インベントリスロット風表示 -->
          <div class="mc-inv-slot-large potion-slot" id="potion-preview-slot">
            <img class="mc-inv-item-img" id="potion-icon-img" src="" alt="">
            <span class="mc-inv-count" id="potion-count-display">1</span>
            <div class="liquid-overlay" id="liquid-overlay"></div>
          </div>

          <!-- Minecraft風ツールチップ -->
          <div class="mc-item-tooltip potion-tooltip" id="potion-item-tooltip">
            <div class="tooltip-name" id="potion-preview-name">ポーション</div>
            <div class="tooltip-effects" id="preview-effects">
              <p class="text-muted">エフェクトなし</p>
            </div>
            <div class="tooltip-meta">
              <span class="tooltip-id" id="potion-type-display">minecraft:potion</span>
            </div>
          </div>
        </div>

        <!-- アイテム情報バー -->
        <div class="item-stats-bar">
          <div class="stat-item">
            <span class="stat-label">タイプ</span>
            <span class="stat-value" id="potion-stat-type">通常</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">エフェクト</span>
            <span class="stat-value" id="potion-stat-effects">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">合計時間</span>
            <span class="stat-value" id="potion-stat-duration">0:00</span>
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
  selectedEffects = [];
  searchQuery = '';

  // リッチテキストエディターの初期化
  if (customNameEditor) {
    customNameEditor.init(container);
    customNameEditor.options.onChange = () => {
      updatePreview(container);
      updateCommand(container);
    };
  }

  // エフェクトグリッド初期表示
  renderEffectGrid(container, 'beneficial');

  // ポーションタイプ選択
  delegate(container, 'click', '.type-tab', (e, target) => {
    $$('.type-tab', container).forEach(t => t.classList.remove('active'));
    target.classList.add('active');
    updatePreview(container);
    updateCommand(container);
  });

  // エフェクトタブ切り替え
  delegate(container, 'click', '.effect-tab', (e, target) => {
    $$('.effect-tab', container).forEach(t => t.classList.remove('active'));
    target.classList.add('active');
    renderEffectGrid(container, target.dataset.type);
  });

  // エフェクト検索
  $('#effect-search', container)?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value.toLowerCase();
    const activeTab = $('.effect-tab.active', container);
    renderEffectGrid(container, activeTab?.dataset.type || 'beneficial');
  }, 150));

  // エフェクト追加（追加ボタンクリック）
  delegate(container, 'click', '.effect-add-btn', (e, target) => {
    e.stopPropagation();
    const effectId = target.dataset.effect;
    const effectItem = target.closest('.effect-item');

    if (!selectedEffects.find(e => e.id === effectId)) {
      // 入力値を取得
      const levelInput = effectItem?.querySelector(`.effect-level-input[data-effect="${effectId}"]`);
      const durationInput = effectItem?.querySelector(`.effect-duration-input[data-effect="${effectId}"]`);
      const infiniteInput = effectItem?.querySelector(`.effect-infinite-input[data-effect="${effectId}"]`);

      const amplifier = Math.max(0, (parseInt(levelInput?.value) || 1) - 1);
      const durationSec = parseInt(durationInput?.value) || 30;
      const infinite = infiniteInput?.checked || false;
      const duration = infinite ? -1 : durationSec * 20;

      selectedEffects.push({ id: effectId, duration, amplifier, infinite });
      effectItem?.classList.add('selected');
      renderSelectedEffects(container);
      updateCommand(container);
    }
  });

  // グリッド内の無限チェックボックス変更時
  delegate(container, 'change', '.effect-infinite-input', (e, target) => {
    e.stopPropagation();
    const effectId = target.dataset.effect;
    const effectItem = target.closest('.effect-item');
    const durationInput = effectItem?.querySelector(`.effect-duration-input[data-effect="${effectId}"]`);
    if (durationInput) {
      durationInput.disabled = target.checked;
      if (target.checked) {
        durationInput.value = '∞';
      } else {
        durationInput.value = '30';
      }
    }
  });

  // エフェクト削除
  delegate(container, 'click', '.effect-remove', (e, target) => {
    const effectId = target.dataset.effect;
    selectedEffects = selectedEffects.filter(e => e.id !== effectId);
    $(`.effect-item[data-effect="${effectId}"]`, container)?.classList.remove('selected');
    renderSelectedEffects(container);
    updateCommand(container);
  });

  // 無限効果チェック
  delegate(container, 'change', '.effect-infinite', (e, target) => {
    const effectId = target.dataset.effect;
    const effect = selectedEffects.find(e => e.id === effectId);
    if (effect) {
      effect.infinite = target.checked;
      effect.duration = target.checked ? -1 : 600;
      const durationInput = $(`.effect-duration[data-effect="${effectId}"]`, container);
      if (durationInput) {
        durationInput.disabled = target.checked;
        durationInput.value = target.checked ? '∞' : '30';
      }
      updateCommand(container);
    }
  });

  // 持続時間・レベル変更
  delegate(container, 'input', '.effect-duration, .effect-amplifier', debounce((e, target) => {
    const effectId = target.dataset.effect;
    const effect = selectedEffects.find(e => e.id === effectId);
    if (effect && !effect.infinite) {
      if (target.classList.contains('effect-duration')) {
        effect.duration = (parseInt(target.value) || 30) * 20;
      } else {
        effect.amplifier = Math.max(0, (parseInt(target.value) || 1) - 1);
      }
      updateCommand(container);
    }
  }, 100));

  // プリセット
  delegate(container, 'click', '.preset-btn', (e, target) => {
    applyPreset(target.dataset.preset, container);
  });

  // カスタム色トグル
  $('#potion-use-color', container)?.addEventListener('change', (e) => {
    $('#color-picker-row', container).style.display = e.target.checked ? 'flex' : 'none';
    updatePreview(container);
    updateCommand(container);
  });

  // カラー同期
  $('#potion-color', container)?.addEventListener('input', (e) => {
    $('#potion-color-hex', container).value = e.target.value;
    $('#color-preview', container).style.backgroundColor = e.target.value;
    updatePreview(container);
    updateCommand(container);
  });
  $('#potion-color-hex', container)?.addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      $('#potion-color', container).value = e.target.value;
      $('#color-preview', container).style.backgroundColor = e.target.value;
      updatePreview(container);
      updateCommand(container);
    }
  });

  // フォーム変更
  ['#potion-count', '#potion-name'].forEach(sel => {
    $(sel, container)?.addEventListener('input', debounce(() => {
      updatePreview(container);
      updateCommand(container);
    }, 150));
  });

  // グローバルバージョン変更時にコマンド再生成
  window.addEventListener('mc-version-change', () => {
    updateVersionDisplay(container);
    updateCommand(container);
  });

  // リセットボタン
  $('#potion-reset-btn', container)?.addEventListener('click', () => {
    resetForm(container);
  });

  // 初期表示
  updateVersionDisplay(container);
  updatePreview(container);
  updateCommand(container);
}

/**
 * フォームをリセット
 */
function resetForm(container) {
  // エフェクトをクリア
  selectedEffects = [];
  searchQuery = '';

  // 検索フィールドをクリア
  const searchInput = $('#effect-search', container);
  if (searchInput) searchInput.value = '';

  // ポーションタイプを通常に戻す
  $$('.type-tab', container).forEach((t, i) => {
    t.classList.toggle('active', i === 0);
  });

  // 個数をリセット
  const countInput = $('#potion-count', container);
  if (countInput) countInput.value = '1';

  // リッチテキストエディターをクリア
  if (customNameEditor) {
    customNameEditor.clear(container);
  }

  // カスタム色をオフに
  const useColor = $('#potion-use-color', container);
  if (useColor) useColor.checked = false;
  const colorRow = $('#color-picker-row', container);
  if (colorRow) colorRow.style.display = 'none';
  const colorInput = $('#potion-color', container);
  if (colorInput) colorInput.value = '#3F76E4';
  const colorHex = $('#potion-color-hex', container);
  if (colorHex) colorHex.value = '#3F76E4';
  const colorPreview = $('#color-preview', container);
  if (colorPreview) colorPreview.style.backgroundColor = '#3F76E4';

  // エフェクトタブを有益に戻す
  $$('.effect-tab', container).forEach((t, i) => {
    t.classList.toggle('active', i === 0);
  });

  // エフェクトグリッドをリセット
  $$('.effect-item.selected', container).forEach(el => el.classList.remove('selected'));
  renderEffectGrid(container, 'beneficial');

  // 選択されたエフェクトの表示を更新
  renderSelectedEffects(container);

  // プレビューとコマンドを更新
  updatePreview(container);
  updateCommand(container);
}

/**
 * バージョン表示を更新
 */
function updateVersionDisplay(container) {
  const version = workspaceStore.get('version') || '1.21';
  const badge = $('#potion-version-badge', container);
  const note = $('#potion-version-note', container);

  if (badge) {
    badge.textContent = version + '+';
  }
  if (note) {
    // ポーションコマンドの警告
    if (compareVersions(version, '1.9') < 0) {
      note.textContent = '注意: このバージョンでは効果付きポーションの付与には異なる形式が必要です';
      note.style.color = 'var(--mc-color-redstone)';
    } else {
      note.textContent = getVersionNote(version);
      note.style.color = 'var(--mc-color-diamond)';
    }
  }
}

/**
 * エフェクトグリッドをレンダリング
 */
function renderEffectGrid(container, type) {
  const grid = $('#effect-grid', container);
  if (!grid) return;

  let effects = type === 'all' ? EFFECTS : EFFECTS.filter(e => e.type === type);

  if (searchQuery) {
    effects = effects.filter(e =>
      e.name.toLowerCase().includes(searchQuery) ||
      e.en.toLowerCase().includes(searchQuery) ||
      e.id.toLowerCase().includes(searchQuery)
    );
  }

  if (effects.length === 0) {
    grid.innerHTML = '<p class="empty-message">該当するエフェクトがありません</p>';
    return;
  }

  grid.innerHTML = effects.map(e => {
    const isSelected = selectedEffects.some(se => se.id === e.id);
    return `
      <div class="effect-item ${e.type} ${isSelected ? 'selected' : ''}"
           data-effect="${e.id}"
           style="--effect-color: ${e.color}"
           title="${e.en}">
        <div class="effect-item-header">
          <span class="effect-icon">${renderEffectIcon(e.id, e.color, 18)}</span>
          <span class="effect-name">${e.name}</span>
        </div>
        <div class="effect-level-selector">
          <div class="effect-input-group">
            <label>Lv:</label>
            <input type="number" class="effect-level-input mc-input"
                   data-effect="${e.id}" value="1" min="1" max="255"
                   onclick="event.stopPropagation()">
          </div>
          <div class="effect-input-group">
            <label>秒:</label>
            <input type="number" class="effect-duration-input mc-input"
                   data-effect="${e.id}" value="30" min="1" max="99999"
                   onclick="event.stopPropagation()">
          </div>
          <label class="effect-infinite-check">
            <input type="checkbox" class="effect-infinite-input" data-effect="${e.id}"
                   onclick="event.stopPropagation()">
            <span>∞</span>
          </label>
          <button type="button" class="effect-add-btn" data-effect="${e.id}" title="追加">+</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 選択されたエフェクトをレンダリング
 */
function renderSelectedEffects(container) {
  const list = $('#selected-effects', container);
  const countEl = $('#effect-count', container);
  if (!list) return;

  if (countEl) {
    countEl.textContent = `(${selectedEffects.length})`;
  }

  if (selectedEffects.length === 0) {
    list.innerHTML = '<p class="empty-message">上のグリッドからエフェクトをクリックして追加</p>';
    updatePreview(container);
    return;
  }

  list.innerHTML = selectedEffects.map(e => {
    const info = EFFECTS.find(ef => ef.id === e.id);
    const durationSec = e.infinite ? '∞' : Math.floor(e.duration / 20);
    return `
      <div class="selected-effect" style="--effect-color: ${info?.color || '#888'}">
        <div class="effect-header">
          <span class="effect-icon">${renderEffectIcon(e.id, info?.color || '#888', 20)}</span>
          <span class="effect-label">${info?.name || e.id}</span>
          <button type="button" class="effect-remove" data-effect="${e.id}" title="削除">x</button>
        </div>
        <div class="effect-controls">
          <label class="control-group">
            <span>時間(秒)</span>
            <input type="${e.infinite ? 'text' : 'number'}"
                   class="effect-duration mc-input"
                   data-effect="${e.id}"
                   value="${durationSec}"
                   min="1" max="99999"
                   ${e.infinite ? 'disabled' : ''}>
          </label>
          <label class="control-group">
            <span>レベル</span>
            <input type="number" class="effect-amplifier mc-input" data-effect="${e.id}"
                   value="${e.amplifier + 1}" min="1" max="255">
          </label>
          <label class="control-group infinite-check">
            <input type="checkbox" class="effect-infinite" data-effect="${e.id}" ${e.infinite ? 'checked' : ''}>
            <span>無限</span>
          </label>
        </div>
      </div>
    `;
  }).join('');

  updatePreview(container);
}

/**
 * プレビューを更新
 */
function updatePreview(container) {
  const iconImg = $('#potion-icon-img', container);
  const liquidOverlay = $('#liquid-overlay', container);
  const nameEl = $('#potion-preview-name', container);
  const effectsEl = $('#preview-effects', container);
  const typeDisplayEl = $('#potion-type-display', container);
  const countDisplayEl = $('#potion-count-display', container);
  const previewSlot = $('#potion-preview-slot', container);

  // 統計バー
  const statTypeEl = $('#potion-stat-type', container);
  const statEffectsEl = $('#potion-stat-effects', container);
  const statDurationEl = $('#potion-stat-duration', container);

  const activeType = $('.type-tab.active', container);
  const potionType = POTION_TYPES.find(t => t.id === activeType?.dataset.type) || POTION_TYPES[0];
  const customName = customNameEditor?.getPlainText() || '';
  const count = parseInt($('#potion-count', container)?.value) || 1;
  const useColor = $('#potion-use-color', container)?.checked;
  const customColor = $('#potion-color', container)?.value;

  // アイコン設定
  if (iconImg) {
    iconImg.src = getInviconUrl(potionType.id);
    iconImg.alt = potionType.name;
    iconImg.style.opacity = '1';
    iconImg.onerror = () => { iconImg.style.opacity = '0.3'; };
  }

  // 液体オーバーレイの色
  if (liquidOverlay) {
    let liquidColor;
    if (useColor && customColor) {
      liquidColor = customColor;
    } else if (selectedEffects.length > 0) {
      const firstEffect = EFFECTS.find(e => e.id === selectedEffects[0].id);
      liquidColor = firstEffect?.color || '#3F76E4';
    } else {
      liquidColor = '#3F76E4';
    }
    liquidOverlay.style.backgroundColor = liquidColor;
  }

  // タイプID表示
  if (typeDisplayEl) {
    typeDisplayEl.textContent = `minecraft:${potionType.id}`;
  }

  // 個数表示
  if (countDisplayEl) {
    countDisplayEl.textContent = count > 1 ? count : '';
    countDisplayEl.style.display = count > 1 ? 'block' : 'none';
  }

  // 名前表示
  if (nameEl) {
    nameEl.textContent = customName || potionType.name;
    if (selectedEffects.length > 0) {
      nameEl.classList.add('enchanted');
    } else {
      nameEl.classList.remove('enchanted');
    }
  }

  // スロットのエフェクトグロー
  if (previewSlot) {
    if (selectedEffects.length > 0) {
      previewSlot.classList.add('has-effects');
      // 最初のエフェクトの色でグロー
      const firstEffect = EFFECTS.find(e => e.id === selectedEffects[0].id);
      previewSlot.style.setProperty('--effect-glow-color', firstEffect?.color || '#3F76E4');
    } else {
      previewSlot.classList.remove('has-effects');
    }
  }

  // エフェクト一覧
  if (effectsEl) {
    if (selectedEffects.length === 0) {
      effectsEl.innerHTML = '<p class="text-muted">エフェクトなし</p>';
    } else {
      effectsEl.innerHTML = selectedEffects.map(e => {
        const info = EFFECTS.find(ef => ef.id === e.id);
        const level = e.amplifier > 0 ? ` ${toRoman(e.amplifier + 1)}` : '';
        const time = formatDuration(e.duration);
        const isBeneficial = info?.type === 'beneficial';
        return `
          <div class="preview-effect-item ${isBeneficial ? 'beneficial' : 'harmful'}" style="color: ${info?.color || '#fff'}">
            ${renderEffectIcon(e.id, info?.color || '#fff', 16)} ${info?.name || e.id}${level} <span class="time">(${time})</span>
          </div>
        `;
      }).join('');
    }
  }

  // 統計バー更新
  const typeNames = { potion: '通常', splash_potion: 'スプラッシュ', lingering_potion: '残留', tipped_arrow: '矢' };
  if (statTypeEl) statTypeEl.textContent = typeNames[potionType.id] || '通常';
  if (statEffectsEl) statEffectsEl.textContent = selectedEffects.length;

  // 合計時間計算
  if (statDurationEl) {
    if (selectedEffects.length === 0) {
      statDurationEl.textContent = '0:00';
    } else {
      const hasInfinite = selectedEffects.some(e => e.duration === -1);
      if (hasInfinite) {
        statDurationEl.textContent = '∞';
      } else {
        const maxDuration = Math.max(...selectedEffects.map(e => e.duration));
        statDurationEl.textContent = formatDuration(maxDuration);
      }
    }
  }
}

/**
 * プリセットを適用
 */
function applyPreset(presetId, container) {
  if (presetId === 'clear') {
    selectedEffects = [];
    $$('.effect-item.selected', container).forEach(el => el.classList.remove('selected'));
  } else {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      selectedEffects = preset.effects.map(e => ({
        ...e,
        infinite: e.duration === -1,
      }));
      // グリッドの選択状態を更新
      $$('.effect-item', container).forEach(el => {
        const isSelected = selectedEffects.some(se => se.id === el.dataset.effect);
        el.classList.toggle('selected', isSelected);
      });
    }
  }
  renderSelectedEffects(container);
  updateCommand(container);
}

/**
 * コマンドを更新（バージョン対応）
 */
function updateCommand(container) {
  const activeType = $('.type-tab.active', container);
  const potionType = activeType?.dataset.type || 'potion';
  const count = parseInt($('#potion-count', container)?.value) || 1;
  // リッチテキストエディターからJSON形式のカスタム名を取得
  const customNameJSON = customNameEditor?.getJSON() || '';
  const customNamePlain = customNameEditor?.getPlainText() || '';
  const useColor = $('#potion-use-color', container)?.checked;
  const color = $('#potion-color', container)?.value;

  // 現在のバージョンを取得
  const version = workspaceStore.get('version') || '1.21';
  const versionGroup = getVersionGroup(version);

  let command;

  if (versionGroup === 'latest' || versionGroup === 'component') {
    // 1.20.5+ コンポーネント形式（JSON Text Component）
    command = generateComponentCommand(container, potionType, count, customNameJSON, useColor, color);
  } else if (versionGroup === 'nbt-modern' || versionGroup === 'nbt-legacy') {
    // 1.13-1.20.4 NBT形式（JSON Text Component）
    command = generateNBTCommand(container, potionType, count, customNameJSON, useColor, color);
  } else {
    // 1.12- レガシー形式（プレーンテキストのみ）
    command = generateLegacyCommand(container, potionType, count, customNamePlain, useColor, color);
  }

  setOutput(command, 'potion', {
    potionType,
    count,
    customName: customNamePlain,
    effects: selectedEffects,
    customColor: useColor ? color : null,
    version
  });
}

/**
 * コンポーネント形式（1.20.5+）
 */
function generateComponentCommand(container, potionType, count, customNameJSON, useColor, color) {
  const components = [];

  // カスタム名（JSON Text Component形式）
  // 形式: minecraft:custom_name='{"text":"名前","color":"gold","bold":true}'
  if (customNameJSON) {
    components.push(`minecraft:custom_name='${customNameJSON}'`);
  }

  // ポーション効果
  if (selectedEffects.length > 0) {
    const effectsJson = selectedEffects.map(e => {
      const ampInput = $(`.effect-amplifier[data-effect="${e.id}"]`, container)?.value;
      const durInput = $(`.effect-duration[data-effect="${e.id}"]`, container)?.value;
      const isInfinite = $(`.effect-infinite[data-effect="${e.id}"]`, container)?.checked;

      const amplifier = Math.max(0, (parseInt(ampInput) || 1) - 1);
      const duration = isInfinite ? -1 : (parseInt(durInput) || 30) * 20;

      return `{id:"minecraft:${e.id}",amplifier:${amplifier},duration:${duration}}`;
    }).join(',');
    components.push(`minecraft:potion_contents={custom_effects:[${effectsJson}]}`);
  }

  // カスタム色
  if (useColor && color) {
    const colorInt = parseInt(color.replace('#', ''), 16);
    if (selectedEffects.length > 0) {
      const lastComp = components[components.length - 1];
      if (lastComp && lastComp.startsWith('minecraft:potion_contents=')) {
        components[components.length - 1] = lastComp.replace('}', `,custom_color:${colorInt}}`);
      }
    } else {
      components.push(`minecraft:potion_contents={custom_color:${colorInt}}`);
    }
  }

  let command = `/give @p minecraft:${potionType}`;
  if (components.length > 0) {
    command += `[${components.join(',')}]`;
  }
  if (count > 1) {
    command += ` ${count}`;
  }

  return command;
}

/**
 * NBT形式（1.13-1.20.4）
 */
function generateNBTCommand(container, potionType, count, customNameJSON, useColor, color) {
  const nbtParts = [];

  // カスタム名（JSON Text Component形式）
  // 形式: display:{Name:'{"text":"名前","color":"gold"}'}
  if (customNameJSON) {
    nbtParts.push(`display:{Name:'${customNameJSON}'}`);
  }

  // ポーション効果
  if (selectedEffects.length > 0) {
    const effectsList = selectedEffects.map(e => {
      const ampInput = $(`.effect-amplifier[data-effect="${e.id}"]`, container)?.value;
      const durInput = $(`.effect-duration[data-effect="${e.id}"]`, container)?.value;
      const isInfinite = $(`.effect-infinite[data-effect="${e.id}"]`, container)?.checked;

      const amplifier = Math.max(0, (parseInt(ampInput) || 1) - 1);
      const duration = isInfinite ? 999999 : (parseInt(durInput) || 30) * 20;

      return `{Id:${getEffectNumericId(e.id)},Amplifier:${amplifier}b,Duration:${duration}}`;
    }).join(',');
    nbtParts.push(`CustomPotionEffects:[${effectsList}]`);
  }

  // カスタム色
  if (useColor && color) {
    const colorInt = parseInt(color.replace('#', ''), 16);
    nbtParts.push(`CustomPotionColor:${colorInt}`);
  }

  let command = `/give @p minecraft:${potionType}`;
  if (nbtParts.length > 0) {
    command += `{${nbtParts.join(',')}}`;
  }
  if (count > 1) {
    command += ` ${count}`;
  }

  return command;
}

/**
 * レガシー形式（1.12-）
 */
function generateLegacyCommand(container, potionType, count, customNamePlain, useColor, color) {
  // 1.12ではポーションは damage value で指定
  const nbtParts = [];

  // カスタム名（レガシー形式ではプレーンテキスト）
  if (customNamePlain) {
    nbtParts.push(`display:{Name:"${customNamePlain}"}`);
  }

  // ポーション効果
  if (selectedEffects.length > 0) {
    const effectsList = selectedEffects.map(e => {
      const ampInput = $(`.effect-amplifier[data-effect="${e.id}"]`, container)?.value;
      const durInput = $(`.effect-duration[data-effect="${e.id}"]`, container)?.value;
      const isInfinite = $(`.effect-infinite[data-effect="${e.id}"]`, container)?.checked;

      const amplifier = Math.max(0, (parseInt(ampInput) || 1) - 1);
      const duration = isInfinite ? 999999 : (parseInt(durInput) || 30) * 20;

      return `{Id:${getEffectNumericId(e.id)}b,Amplifier:${amplifier}b,Duration:${duration}}`;
    }).join(',');
    nbtParts.push(`CustomPotionEffects:[${effectsList}]`);
  }

  // カスタム色
  if (useColor && color) {
    const colorInt = parseInt(color.replace('#', ''), 16);
    nbtParts.push(`CustomPotionColor:${colorInt}`);
  }

  // 1.12ではアイテムID形式が異なる
  const legacyPotionId = potionType === 'splash_potion' ? 'splash_potion'
    : potionType === 'lingering_potion' ? 'lingering_potion'
    : potionType === 'tipped_arrow' ? 'tipped_arrow'
    : 'potion';

  let command = `/give @p minecraft:${legacyPotionId} ${count} 0`;
  if (nbtParts.length > 0) {
    command += ` {${nbtParts.join(',')}}`;
  }

  return command;
}

/**
 * エフェクトの数値IDを取得（1.12-1.20.4用）
 */
function getEffectNumericId(effectId) {
  const effectIdMap = {
    'speed': 1,
    'slowness': 2,
    'haste': 3,
    'mining_fatigue': 4,
    'strength': 5,
    'instant_health': 6,
    'instant_damage': 7,
    'jump_boost': 8,
    'nausea': 9,
    'regeneration': 10,
    'resistance': 11,
    'fire_resistance': 12,
    'water_breathing': 13,
    'invisibility': 14,
    'blindness': 15,
    'night_vision': 16,
    'hunger': 17,
    'weakness': 18,
    'poison': 19,
    'wither': 20,
    'health_boost': 21,
    'absorption': 22,
    'saturation': 23,
    'glowing': 24,
    'levitation': 25,
    'luck': 26,
    'unluck': 27,
    'slow_falling': 28,
    'conduit_power': 29,
    'dolphins_grace': 30,
    'bad_omen': 31,
    'hero_of_the_village': 32,
    'darkness': 33,
    'trial_omen': 34,
    'raid_omen': 35,
    'wind_charged': 36,
    'weaving': 37,
    'oozing': 38,
    'infested': 39,
  };
  return effectIdMap[effectId] || 1;
}

function toRoman(num) {
  const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return roman[num] || num.toString();
}

function formatDuration(ticks) {
  if (ticks === -1) return '∞';
  const seconds = Math.floor(ticks / 20);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  return `0:${secs.toString().padStart(2, '0')}`;
}

// スタイル追加（ポーション固有スタイルのみ - 共通スタイルはtheme.cssに定義）
const style = document.createElement('style');
style.textContent = `
  /* 設定行（横並び） */
  .form-row {
    display: flex;
    gap: var(--mc-space-md);
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .form-row .form-group {
    flex: 1;
    min-width: 120px;
  }

  .form-row .form-group label {
    display: block;
    margin-bottom: var(--mc-space-xs);
    font-weight: 500;
    white-space: nowrap;
  }

  /* ポーションタイプタブ（4列グリッド） */
  .potion-type-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--mc-space-xs);
  }

  /* エフェクトタイプ色分け */
  .tab-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .tab-dot.beneficial { background: #5CB746; }
  .tab-dot.harmful { background: #E74C3C; }
  .tab-dot.neutral { background: #95A5A6; }

  /* エフェクトアイコン */
  .effect-item .effect-icon,
  .effect-header .effect-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .effect-item .effect-icon { width: 18px; height: 18px; }
  .effect-header .effect-icon { width: 20px; height: 20px; }

  .effect-icon-img { image-rendering: pixelated; vertical-align: middle; }
  .effect-icon-fallback {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .effect-item .effect-name { font-size: 0.8rem; flex: 1; color: #e8e8e8; font-weight: 500; }

  /* エフェクトグリッドアイテム（レベル入力付き） */
  .effect-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
    padding: var(--mc-space-sm);
    background: rgba(60, 60, 60, 0.5);
    max-height: 350px;
    overflow-y: auto;
    border-radius: 6px;
  }

  .effect-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: rgba(70, 70, 70, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    border-left: 4px solid var(--effect-color);
    transition: all 0.15s;
  }

  .effect-item:hover {
    background: rgba(92, 183, 70, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .effect-item.selected {
    background: rgba(92, 183, 70, 0.25);
    border-color: var(--mc-color-grass-main);
  }

  .effect-item.beneficial { border-left-color: #5CB746; }
  .effect-item.harmful { border-left-color: #E74C3C; }
  .effect-item.neutral { border-left-color: #95A5A6; }

  .effect-item .effect-item-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .effect-item .effect-level-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .effect-item .effect-input-group {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .effect-item .effect-input-group label {
    font-size: 0.7rem;
    color: #b0b0b0;
    font-weight: bold;
  }

  .effect-item .effect-level-input,
  .effect-item .effect-duration-input {
    width: 50px;
    padding: 4px 6px;
    font-size: 0.8rem;
    font-weight: bold;
    text-align: center;
    background: rgba(40, 40, 40, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #6EECD2;
    border-radius: 4px;
  }

  .effect-item .effect-level-input:focus,
  .effect-item .effect-duration-input:focus {
    outline: none;
    border-color: var(--mc-color-diamond);
  }

  .effect-item .effect-infinite-check {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.7rem;
    color: var(--mc-color-gold);
    cursor: pointer;
  }

  .effect-item .effect-add-btn {
    padding: 3px 8px;
    font-size: 0.9rem;
    font-weight: bold;
    background: var(--mc-color-grass-main);
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    margin-left: auto;
    transition: all 0.15s;
  }

  .effect-item .effect-add-btn:hover {
    background: var(--mc-color-grass-light);
    transform: scale(1.05);
  }

  .effect-item.selected .effect-add-btn {
    background: var(--mc-text-muted);
    cursor: not-allowed;
  }

  .effect-header .effect-label { flex: 1; font-weight: bold; font-size: 0.85rem; }
  .effect-header .effect-remove {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .effect-header .effect-remove:hover { opacity: 1; }

  /* エフェクトコントロール */
  .effect-controls { display: flex; gap: var(--mc-space-md); flex-wrap: wrap; }
  .control-group {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--mc-text-secondary);
  }
  .control-group input { width: 70px; padding: 4px 6px; font-size: 0.8rem; }
  .infinite-check { margin-left: auto; }
  .infinite-check input { margin-right: 4px; }

  /* カラーピッカー */
  .color-picker-row {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-top: var(--mc-space-sm);
  }
  .color-preview {
    width: 32px;
    height: 32px;
    border: 2px solid var(--mc-border-dark);
    border-radius: 4px;
  }

  /* ポーションプレビュー */
  .potion-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 2px solid var(--mc-border-dark);
    border-radius: 6px;
    box-shadow: var(--mc-shadow-inset);
  }
  .potion-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
    text-transform: uppercase;
  }

  /* Minecraft風インベントリプレビュー */
  .potion-tool .mc-inventory-preview {
    display: flex;
    align-items: flex-start;
    gap: var(--mc-space-md);
    padding: var(--mc-space-md);
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 3px solid #3d3d3d;
    border-radius: 4px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }

  .potion-tool .mc-inv-slot-large {
    position: relative;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #8b8b8b 0%, #373737 100%);
    border: 2px solid;
    border-color: #373737 #fff #fff #373737;
    box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .potion-tool .mc-inv-slot-large.has-effects {
    animation: potion-glow 2s ease-in-out infinite;
  }

  @keyframes potion-glow {
    0%, 100% {
      box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a, 0 0 10px var(--effect-glow-color, #3F76E4);
    }
    50% {
      box-shadow: inset 2px 2px 0 #555, inset -2px -2px 0 #1a1a1a, 0 0 20px var(--effect-glow-color, #3F76E4), 0 0 30px var(--effect-glow-color, #3F76E4);
    }
  }

  .potion-tool .mc-inv-item-img {
    width: 48px;
    height: 48px;
    image-rendering: pixelated;
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
    transition: transform 0.2s ease;
    z-index: 2;
    position: relative;
  }

  .potion-tool .liquid-overlay {
    position: absolute;
    bottom: 12px;
    left: 18px;
    right: 18px;
    height: 28px;
    background: #3F76E4;
    border-radius: 0 0 8px 8px;
    opacity: 0.6;
    z-index: 1;
    transition: background-color 0.3s;
    mix-blend-mode: multiply;
  }

  .potion-tool .mc-inv-slot-large:hover .mc-inv-item-img {
    transform: scale(1.1);
  }

  .potion-tool .mc-inv-count {
    position: absolute;
    bottom: 2px;
    right: 4px;
    font-family: 'Minecraft', monospace;
    font-size: 14px;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 0 #3f3f3f;
    line-height: 1;
    z-index: 3;
  }

  .potion-tool .mc-item-tooltip {
    flex: 1;
    background: linear-gradient(180deg, #100010 0%, #1a001a 100%);
    border: 2px solid;
    border-color: #5000aa #28007f #28007f #5000aa;
    padding: 8px 12px;
    min-width: 180px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }

  .potion-tool .tooltip-name {
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 4px;
  }

  .potion-tool .tooltip-name.enchanted {
    color: #55ffff;
    text-shadow: 0 0 10px rgba(85, 255, 255, 0.5);
  }

  .potion-tool .tooltip-effects {
    border-top: 1px solid rgba(128, 0, 255, 0.3);
    padding-top: 6px;
    margin-top: 4px;
  }

  .potion-tool .tooltip-meta {
    border-top: 1px solid rgba(128, 0, 255, 0.2);
    padding-top: 6px;
    margin-top: 8px;
  }

  .potion-tool .tooltip-id {
    font-family: var(--mc-font-mono);
    font-size: 0.7rem;
    color: #555;
  }

  .potion-tool .item-stats-bar {
    display: flex;
    gap: var(--mc-space-lg);
    padding: var(--mc-space-sm) var(--mc-space-md);
    margin-top: var(--mc-space-sm);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .potion-tool .stat-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
  }

  .potion-tool .stat-label {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .potion-tool .stat-value {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--mc-color-diamond);
    font-family: var(--mc-font-mono);
  }

  /* プレビュー情報 */
  .preview-effect-item { display: flex; align-items: center; gap: 6px; padding: 2px 0; font-size: 0.85rem; }
  .preview-effect-item .time { opacity: 0.7; font-size: 0.8em; }
  .preview-effect-item.beneficial { color: #5CB746; }
  .preview-effect-item.harmful { color: #E74C3C; }

  /* レスポンシブ */
  @media (max-width: 600px) {
    .potion-type-tabs { grid-template-columns: repeat(2, 1fr); }
    .effect-controls { flex-direction: column; gap: var(--mc-space-xs); }
  }
`;
document.head.appendChild(style);

export default { render, init };
