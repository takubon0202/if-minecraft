/**
 * Potion Generator - UI (minecraft-blog.net参考)
 * 全33種エフェクト対応、検索機能、無限効果、バージョン対応
 * Minecraft Wiki画像使用
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { setOutput } from '../../app/sidepanel.js';

// Minecraft Wiki画像ベースURL
const WIKI_IMG_BASE = 'https://minecraft.wiki/images/';

// エフェクトアイコンURL生成（ステータスエフェクト）
function getEffectIconUrl(effectId) {
  // エフェクトIDからWiki画像名へのマッピング
  const effectIconMap = {
    'speed': 'Effect_Speed',
    'haste': 'Effect_Haste',
    'strength': 'Effect_Strength',
    'instant_health': 'Effect_Instant_Health',
    'jump_boost': 'Effect_Jump_Boost',
    'regeneration': 'Effect_Regeneration',
    'resistance': 'Effect_Resistance',
    'fire_resistance': 'Effect_Fire_Resistance',
    'water_breathing': 'Effect_Water_Breathing',
    'invisibility': 'Effect_Invisibility',
    'night_vision': 'Effect_Night_Vision',
    'health_boost': 'Effect_Health_Boost',
    'absorption': 'Effect_Absorption',
    'saturation': 'Effect_Saturation',
    'luck': 'Effect_Luck',
    'slow_falling': 'Effect_Slow_Falling',
    'conduit_power': 'Effect_Conduit_Power',
    'dolphins_grace': 'Effect_Dolphin%27s_Grace',
    'hero_of_the_village': 'Effect_Hero_of_the_Village',
    'slowness': 'Effect_Slowness',
    'mining_fatigue': 'Effect_Mining_Fatigue',
    'instant_damage': 'Effect_Instant_Damage',
    'nausea': 'Effect_Nausea',
    'blindness': 'Effect_Blindness',
    'hunger': 'Effect_Hunger',
    'weakness': 'Effect_Weakness',
    'poison': 'Effect_Poison',
    'wither': 'Effect_Wither',
    'levitation': 'Effect_Levitation',
    'unluck': 'Effect_Bad_Luck',
    'bad_omen': 'Effect_Bad_Omen',
    'darkness': 'Effect_Darkness',
    'infested': 'Effect_Infested',
    'oozing': 'Effect_Oozing',
    'weaving': 'Effect_Weaving',
    'wind_charged': 'Effect_Wind_Charged',
    'glowing': 'Effect_Glowing',
    'trial_omen': 'Effect_Trial_Omen',
    'raid_omen': 'Effect_Raid_Omen',
  };
  const iconName = effectIconMap[effectId];
  return iconName ? `${WIKI_IMG_BASE}${iconName}.png` : null;
}

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
  { id: 'infested', name: '蝕み', en: 'Infested', type: 'harmful', color: '#8B8B8B' },
  { id: 'oozing', name: '滲み出し', en: 'Oozing', type: 'harmful', color: '#2E8B57' },
  { id: 'weaving', name: '紡糸', en: 'Weaving', type: 'harmful', color: '#666666' },
  { id: 'wind_charged', name: '風纏い', en: 'Wind Charged', type: 'harmful', color: '#B0E0E6' },
  // 中立（Neutral）
  { id: 'glowing', name: '発光', en: 'Glowing', type: 'neutral', color: '#94A061' },
  { id: 'trial_omen', name: 'トライアルの前兆', en: 'Trial Omen', type: 'neutral', color: '#5D3FD3' },
  { id: 'raid_omen', name: '襲撃の前兆', en: 'Raid Omen', type: 'neutral', color: '#8B0000' },
];

// ポーションタイプ - Minecraft Wiki画像URL使用
const POTION_TYPES = [
  { id: 'potion', name: '通常のポーション', icon: `${WIKI_IMG_BASE}Invicon_Potion.png` },
  { id: 'splash_potion', name: 'スプラッシュポーション', icon: `${WIKI_IMG_BASE}Invicon_Splash_Potion.png` },
  { id: 'lingering_potion', name: '残留ポーション', icon: `${WIKI_IMG_BASE}Invicon_Lingering_Potion.png` },
  { id: 'tipped_arrow', name: '効果付きの矢', icon: `${WIKI_IMG_BASE}Invicon_Tipped_Arrow.png` },
];

// エフェクトアイコンのHTML生成（画像またはカラー円）
function renderEffectIcon(effectId, color, size = 18) {
  const iconUrl = getEffectIconUrl(effectId);
  if (iconUrl) {
    return `<img src="${iconUrl}" alt="" class="effect-icon-img" width="${size}" height="${size}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'"><span class="effect-icon-fallback" style="display:none;background-color:${color}"></span>`;
  }
  return `<span class="effect-icon-circle" style="background-color:${color}"></span>`;
}

// プリセット
const PRESETS = [
  { id: 'healing2', name: '回復II', effects: [{ id: 'instant_health', duration: 1, amplifier: 1 }] },
  { id: 'strength2', name: '力II', effects: [{ id: 'strength', duration: 1800, amplifier: 1 }] },
  { id: 'speed2', name: '俊敏II', effects: [{ id: 'speed', duration: 1800, amplifier: 1 }] },
  { id: 'regen2', name: '再生II', effects: [{ id: 'regeneration', duration: 450, amplifier: 1 }] },
  { id: 'invis', name: '透明化', effects: [{ id: 'invisibility', duration: 3600, amplifier: 0 }] },
  { id: 'night', name: '暗視', effects: [{ id: 'night_vision', duration: 3600, amplifier: 0 }] },
  { id: 'water', name: '水中呼吸', effects: [{ id: 'water_breathing', duration: 3600, amplifier: 0 }] },
  { id: 'fire', name: '耐火', effects: [{ id: 'fire_resistance', duration: 3600, amplifier: 0 }] },
  { id: 'god', name: '全能', effects: [
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
];

let selectedEffects = [];
let searchQuery = '';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel potion-tool" id="potion-panel">
      <div class="tool-header">
        <span class="tool-icon">${manifest.icon}</span>
        <h2>${manifest.title}</h2>
        <span class="version-badge">1.21.11</span>
      </div>

      <form class="tool-form" id="potion-form">
        <!-- ポーションタイプ選択（タブ形式） -->
        <div class="form-group">
          <label>ポーションタイプ</label>
          <div class="potion-type-tabs" id="potion-type-tabs">
            ${POTION_TYPES.map((t, i) => `
              <button type="button" class="type-tab ${i === 0 ? 'active' : ''}" data-type="${t.id}">
                <img src="${t.icon}" alt="${t.name}" class="tab-icon-img" width="32" height="32" loading="lazy">
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
          <div class="form-group">
            <label for="potion-name">カスタム名</label>
            <input type="text" id="potion-name" class="mc-input" placeholder="例: 最強のポーション">
          </div>
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

        <!-- プリセット -->
        <div class="form-group">
          <label>プリセット</label>
          <div class="preset-grid">
            ${PRESETS.map(p => `
              <button type="button" class="preset-btn" data-preset="${p.id}" title="${p.effects.map(e => EFFECTS.find(ef => ef.id === e.id)?.name).join(', ')}">
                ${p.name}
              </button>
            `).join('')}
            <button type="button" class="preset-btn preset-clear" data-preset="clear">クリア</button>
          </div>
        </div>
      </form>

      <!-- プレビュー -->
      <div class="potion-preview-section">
        <h3>プレビュー</h3>
        <div class="potion-preview">
          <div class="preview-bottle-area">
            <div class="preview-bottle" id="preview-bottle">
              <div class="bottle-liquid" id="bottle-liquid"></div>
              <div class="bottle-particles" id="bottle-particles"></div>
            </div>
            <div class="preview-type" id="preview-type">通常のポーション</div>
          </div>
          <div class="preview-info">
            <div class="preview-name" id="preview-name">ポーション</div>
            <div class="preview-effects" id="preview-effects">
              <p class="text-muted">エフェクトなし</p>
            </div>
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

  // エフェクト追加
  delegate(container, 'click', '.effect-item', (e, target) => {
    const effectId = target.dataset.effect;
    if (!selectedEffects.find(e => e.id === effectId)) {
      selectedEffects.push({ id: effectId, duration: 600, amplifier: 0, infinite: false });
      target.classList.add('selected');
      renderSelectedEffects(container);
      updateCommand(container);
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

  updatePreview(container);
  updateCommand(container);
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
        <span class="effect-icon">${renderEffectIcon(e.id, e.color, 18)}</span>
        <span class="effect-name">${e.name}</span>
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
  const liquid = $('#bottle-liquid', container);
  const particles = $('#bottle-particles', container);
  const typeEl = $('#preview-type', container);
  const nameEl = $('#preview-name', container);
  const effectsEl = $('#preview-effects', container);
  const bottleEl = $('#preview-bottle', container);

  const activeType = $('.type-tab.active', container);
  const potionType = POTION_TYPES.find(t => t.id === activeType?.dataset.type) || POTION_TYPES[0];
  const customName = $('#potion-name', container)?.value;
  const useColor = $('#potion-use-color', container)?.checked;
  const customColor = $('#potion-color', container)?.value;

  // ボトルタイプによるクラス変更
  if (bottleEl) {
    bottleEl.className = `preview-bottle ${potionType.id}`;
  }

  // 液体の色
  if (liquid) {
    if (useColor && customColor) {
      liquid.style.backgroundColor = customColor;
    } else if (selectedEffects.length > 0) {
      const firstEffect = EFFECTS.find(e => e.id === selectedEffects[0].id);
      liquid.style.backgroundColor = firstEffect?.color || '#3F76E4';
    } else {
      liquid.style.backgroundColor = '#3F76E4';
    }
  }

  // タイプ表示
  if (typeEl) {
    typeEl.textContent = potionType.name;
  }

  // 名前表示
  if (nameEl) {
    nameEl.textContent = customName || 'ポーション';
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
        return `
          <div class="preview-effect-item" style="color: ${info?.color || '#fff'}">
            ${renderEffectIcon(e.id, info?.color || '#fff', 16)} ${info?.name || e.id}${level} <span class="time">(${time})</span>
          </div>
        `;
      }).join('');
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
 * コマンドを更新（1.21.5形式）
 */
function updateCommand(container) {
  const activeType = $('.type-tab.active', container);
  const potionType = activeType?.dataset.type || 'potion';
  const count = parseInt($('#potion-count', container)?.value) || 1;
  const customName = $('#potion-name', container)?.value;
  const useColor = $('#potion-use-color', container)?.checked;
  const color = $('#potion-color', container)?.value;

  const components = [];

  // カスタム名
  if (customName) {
    components.push(`custom_name='"${customName}"'`);
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
    components.push(`potion_contents={custom_effects:[${effectsJson}]}`);
  }

  // カスタム色
  if (useColor && color) {
    const colorInt = parseInt(color.replace('#', ''), 16);
    if (selectedEffects.length > 0) {
      // potion_contentsにマージ
      const lastComp = components[components.length - 1];
      if (lastComp && lastComp.startsWith('potion_contents=')) {
        components[components.length - 1] = lastComp.replace('}', `,custom_color:${colorInt}}`);
      }
    } else {
      components.push(`potion_contents={custom_color:${colorInt}}`);
    }
  }

  let command = `/give @p minecraft:${potionType}`;
  if (components.length > 0) {
    command += `[${components.join(',')}]`;
  }
  if (count > 1) {
    command += ` ${count}`;
  }

  setOutput(command, 'potion', {
    potionType,
    count,
    customName,
    effects: selectedEffects,
    customColor: useColor ? color : null
  });
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

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .potion-tool .version-badge {
    background: var(--mc-color-grass-main);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    margin-left: auto;
  }

  /* ポーションタイプタブ */
  .potion-type-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--mc-space-xs);
  }

  .type-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--mc-space-sm);
    background: var(--mc-bg-panel);
    border: 2px solid var(--mc-border-dark);
    cursor: pointer;
    transition: all 0.2s;
  }

  .type-tab:hover {
    background: var(--mc-color-stone-300);
  }

  .type-tab.active {
    background: var(--mc-color-grass-main);
    color: white;
    border-color: var(--mc-color-grass-dark);
  }

  .type-tab .tab-icon-img {
    width: 32px;
    height: 32px;
    image-rendering: pixelated;
  }

  .type-tab .tab-name {
    font-size: 0.7rem;
    text-align: center;
  }

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
    background: #3F76E4;
  }

  /* エフェクト検索 */
  .effect-search {
    margin-bottom: var(--mc-space-sm);
  }

  /* エフェクトタブ */
  .effect-tabs {
    display: flex;
    gap: var(--mc-space-xs);
    margin-bottom: var(--mc-space-sm);
    flex-wrap: wrap;
  }

  .effect-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: var(--mc-space-xs) var(--mc-space-md);
    background: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.15s;
  }

  .effect-tab:hover {
    background: var(--mc-color-stone-300);
  }

  .effect-tab.active {
    background: var(--mc-color-grass-main);
    color: white;
  }

  .tab-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .tab-dot.beneficial { background: #5CB746; }
  .tab-dot.harmful { background: #E74C3C; }
  .tab-dot.neutral { background: #95A5A6; }

  /* エフェクトグリッド */
  .effect-grid-container {
    max-height: 280px;
    overflow-y: auto;
    border: 1px solid var(--mc-border-dark);
    background: var(--mc-bg-panel);
  }

  .effect-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 4px;
    padding: var(--mc-space-sm);
  }

  .effect-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--mc-bg-surface);
    border: 2px solid transparent;
    border-left: 4px solid var(--effect-color);
    cursor: pointer;
    transition: all 0.15s;
  }

  .effect-item:hover {
    background: var(--mc-color-stone-300);
    transform: translateY(-1px);
  }

  .effect-item.selected {
    background: rgba(92, 183, 70, 0.2);
    border-color: var(--mc-color-grass-main);
    box-shadow: 0 0 8px rgba(92, 183, 70, 0.3);
  }

  .effect-item .effect-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .effect-item .effect-icon-img,
  .selected-effect .effect-icon-img,
  .preview-effect-item .effect-icon-img {
    image-rendering: pixelated;
    vertical-align: middle;
  }

  .effect-icon-fallback,
  .effect-icon-circle {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .effect-item .effect-name {
    font-size: 0.75rem;
    flex: 1;
  }

  /* 選択されたエフェクト */
  .selected-effects {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm);
    background: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    min-height: 80px;
    max-height: 300px;
    overflow-y: auto;
  }

  .selected-effect {
    background: var(--mc-bg-surface);
    border-left: 4px solid var(--effect-color);
    padding: var(--mc-space-sm);
  }

  .effect-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    margin-bottom: var(--mc-space-xs);
  }

  .effect-header .effect-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .effect-header .effect-label {
    flex: 1;
    font-weight: bold;
    font-size: 0.85rem;
  }

  .effect-header .effect-remove {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: var(--mc-color-redstone);
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.7;
  }

  .effect-header .effect-remove:hover {
    opacity: 1;
  }

  .effect-controls {
    display: flex;
    gap: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
  }

  .control-group input[type="number"],
  .control-group input[type="text"] {
    width: 70px;
    padding: 4px 6px;
    font-size: 0.8rem;
  }

  .infinite-check {
    margin-left: auto;
  }

  .infinite-check input {
    margin-right: 4px;
  }

  /* プリセット */
  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-xs);
  }

  .preset-btn {
    padding: var(--mc-space-xs) var(--mc-space-sm);
    background: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.15s;
  }

  .preset-btn:hover {
    background: var(--mc-color-grass-light);
    border-color: var(--mc-color-grass-main);
  }

  .preset-btn.preset-clear {
    background: var(--mc-color-redstone);
    color: white;
    border-color: #8B0000;
  }

  /* プレビューセクション */
  .potion-preview-section {
    margin-top: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .potion-preview-section h3 {
    margin: 0 0 var(--mc-space-md) 0;
    font-size: 0.9rem;
    color: var(--mc-text-muted);
  }

  .potion-preview {
    display: flex;
    gap: var(--mc-space-xl);
    align-items: flex-start;
  }

  .preview-bottle-area {
    text-align: center;
  }

  .preview-bottle {
    width: 64px;
    height: 80px;
    position: relative;
    margin: 0 auto var(--mc-space-sm);
  }

  .preview-bottle::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 16px;
    background: linear-gradient(to bottom, #666, #444);
    border-radius: 4px 4px 0 0;
  }

  .preview-bottle::after {
    content: '';
    position: absolute;
    top: 16px;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, rgba(255,255,255,0.1), transparent, rgba(0,0,0,0.1));
    border: 3px solid #555;
    border-radius: 0 0 16px 16px;
  }

  .bottle-liquid {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    height: 55%;
    background: #3F76E4;
    border-radius: 0 0 12px 12px;
    transition: background-color 0.3s;
    z-index: 1;
  }

  /* ポーションタイプ別スタイル */
  .preview-bottle.splash_potion {
    transform: rotate(-15deg);
  }

  .preview-bottle.lingering_potion .bottle-liquid {
    animation: pulse 2s ease-in-out infinite;
  }

  .preview-bottle.tipped_arrow {
    width: 48px;
    height: 100px;
    background: none;
  }

  .preview-bottle.tipped_arrow::before {
    display: none;
  }

  .preview-bottle.tipped_arrow::after {
    border-radius: 0;
    border: none;
    background: linear-gradient(to bottom, transparent 0%, #8B4513 10%, #8B4513 90%, transparent 100%);
    clip-path: polygon(50% 0%, 60% 5%, 60% 85%, 70% 85%, 50% 100%, 30% 85%, 40% 85%, 40% 5%);
  }

  .preview-bottle.tipped_arrow .bottle-liquid {
    bottom: auto;
    top: 0;
    height: 20%;
    border-radius: 0;
    left: 35%;
    right: 35%;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .preview-type {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .preview-info {
    flex: 1;
  }

  .preview-name {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: var(--mc-space-sm);
    color: var(--mc-color-diamond);
  }

  .preview-effects {
    font-size: 0.85rem;
  }

  .preview-effect-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
  }

  .preview-effect-item .time {
    opacity: 0.7;
    font-size: 0.8em;
  }

  .text-muted {
    color: var(--mc-text-muted);
  }

  @media (max-width: 600px) {
    .potion-type-tabs {
      grid-template-columns: repeat(2, 1fr);
    }

    .effect-grid {
      grid-template-columns: 1fr;
    }

    .effect-controls {
      flex-direction: column;
      gap: var(--mc-space-xs);
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
