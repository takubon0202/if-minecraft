/**
 * Minecraft風ツールチップコンポーネント
 * Minecraft Wikiのようなゲーム内UIスタイルのツールチップ
 */

import { getInviconUrl } from './wiki-images.js';

// アイテムデータ（基本的なもの）
const ITEM_DATA = {
  // 剣
  wooden_sword: { name: '木の剣', attack: 4, speed: 1.6, durability: 59, rarity: 'common' },
  stone_sword: { name: '石の剣', attack: 5, speed: 1.6, durability: 131, rarity: 'common' },
  iron_sword: { name: '鉄の剣', attack: 6, speed: 1.6, durability: 250, rarity: 'common' },
  golden_sword: { name: '金の剣', attack: 4, speed: 1.6, durability: 32, rarity: 'common' },
  diamond_sword: { name: 'ダイヤモンドの剣', attack: 7, speed: 1.6, durability: 1561, rarity: 'common' },
  netherite_sword: { name: 'ネザライトの剣', attack: 8, speed: 1.6, durability: 2031, rarity: 'common' },

  // 斧
  wooden_axe: { name: '木の斧', attack: 7, speed: 0.8, durability: 59, rarity: 'common' },
  stone_axe: { name: '石の斧', attack: 9, speed: 0.8, durability: 131, rarity: 'common' },
  iron_axe: { name: '鉄の斧', attack: 9, speed: 0.9, durability: 250, rarity: 'common' },
  golden_axe: { name: '金の斧', attack: 7, speed: 1.0, durability: 32, rarity: 'common' },
  diamond_axe: { name: 'ダイヤモンドの斧', attack: 9, speed: 1.0, durability: 1561, rarity: 'common' },
  netherite_axe: { name: 'ネザライトの斧', attack: 10, speed: 1.0, durability: 2031, rarity: 'common' },

  // ツルハシ
  wooden_pickaxe: { name: '木のツルハシ', attack: 2, speed: 1.2, durability: 59, rarity: 'common' },
  stone_pickaxe: { name: '石のツルハシ', attack: 3, speed: 1.2, durability: 131, rarity: 'common' },
  iron_pickaxe: { name: '鉄のツルハシ', attack: 4, speed: 1.2, durability: 250, rarity: 'common' },
  golden_pickaxe: { name: '金のツルハシ', attack: 2, speed: 1.2, durability: 32, rarity: 'common' },
  diamond_pickaxe: { name: 'ダイヤモンドのツルハシ', attack: 5, speed: 1.2, durability: 1561, rarity: 'common' },
  netherite_pickaxe: { name: 'ネザライトのツルハシ', attack: 6, speed: 1.2, durability: 2031, rarity: 'common' },

  // 防具（ヘルメット）
  leather_helmet: { name: '革の帽子', armor: 1, durability: 55, rarity: 'common' },
  chainmail_helmet: { name: 'チェーンのヘルメット', armor: 2, durability: 165, rarity: 'common' },
  iron_helmet: { name: '鉄のヘルメット', armor: 2, durability: 165, rarity: 'common' },
  golden_helmet: { name: '金のヘルメット', armor: 2, durability: 77, rarity: 'common' },
  diamond_helmet: { name: 'ダイヤモンドのヘルメット', armor: 3, toughness: 2, durability: 363, rarity: 'common' },
  netherite_helmet: { name: 'ネザライトのヘルメット', armor: 3, toughness: 3, knockbackResistance: 1, durability: 407, rarity: 'common' },
  turtle_helmet: { name: 'カメの甲羅', armor: 2, durability: 275, rarity: 'common', effect: '水中呼吸 (10秒)' },

  // 防具（チェストプレート）
  leather_chestplate: { name: '革の上着', armor: 3, durability: 80, rarity: 'common' },
  chainmail_chestplate: { name: 'チェーンのチェストプレート', armor: 5, durability: 240, rarity: 'common' },
  iron_chestplate: { name: '鉄のチェストプレート', armor: 6, durability: 240, rarity: 'common' },
  golden_chestplate: { name: '金のチェストプレート', armor: 5, durability: 112, rarity: 'common' },
  diamond_chestplate: { name: 'ダイヤモンドのチェストプレート', armor: 8, toughness: 2, durability: 528, rarity: 'common' },
  netherite_chestplate: { name: 'ネザライトのチェストプレート', armor: 8, toughness: 3, knockbackResistance: 1, durability: 592, rarity: 'common' },
  elytra: { name: 'エリトラ', durability: 432, rarity: 'uncommon', desc: '滑空できる' },

  // 防具（レギンス）
  leather_leggings: { name: '革のズボン', armor: 2, durability: 75, rarity: 'common' },
  chainmail_leggings: { name: 'チェーンのレギンス', armor: 4, durability: 225, rarity: 'common' },
  iron_leggings: { name: '鉄のレギンス', armor: 5, durability: 225, rarity: 'common' },
  golden_leggings: { name: '金のレギンス', armor: 3, durability: 105, rarity: 'common' },
  diamond_leggings: { name: 'ダイヤモンドのレギンス', armor: 6, toughness: 2, durability: 495, rarity: 'common' },
  netherite_leggings: { name: 'ネザライトのレギンス', armor: 6, toughness: 3, knockbackResistance: 1, durability: 555, rarity: 'common' },

  // 防具（ブーツ）
  leather_boots: { name: '革のブーツ', armor: 1, durability: 65, rarity: 'common' },
  chainmail_boots: { name: 'チェーンのブーツ', armor: 1, durability: 195, rarity: 'common' },
  iron_boots: { name: '鉄のブーツ', armor: 2, durability: 195, rarity: 'common' },
  golden_boots: { name: '金のブーツ', armor: 1, durability: 91, rarity: 'common' },
  diamond_boots: { name: 'ダイヤモンドのブーツ', armor: 3, toughness: 2, durability: 429, rarity: 'common' },
  netherite_boots: { name: 'ネザライトのブーツ', armor: 3, toughness: 3, knockbackResistance: 1, durability: 481, rarity: 'common' },

  // 弓・クロスボウ
  bow: { name: '弓', attack: '1-10', durability: 384, rarity: 'common' },
  crossbow: { name: 'クロスボウ', attack: '6-11', durability: 465, rarity: 'common' },
  trident: { name: 'トライデント', attack: 9, speed: 1.1, durability: 250, rarity: 'common' },
  mace: { name: 'メイス', attack: 6, speed: 0.6, durability: 500, rarity: 'common', desc: '落下ダメージボーナス' },

  // 槍
  wooden_spear: { name: '木の槍', attack: 1, speed: 1.54, durability: 59, rarity: 'common', desc: '突撃攻撃（リーチ2〜4.5）' },
  stone_spear: { name: '石の槍', attack: 2, speed: 1.33, durability: 131, rarity: 'common', desc: '突撃攻撃（リーチ2〜4.5）' },
  copper_spear: { name: '銅の槍', attack: 2, speed: 1.18, durability: 190, rarity: 'common', desc: '突撃攻撃（リーチ2〜4.5）' },
  iron_spear: { name: '鉄の槍', attack: 3.5, speed: 1.05, durability: 250, rarity: 'common', desc: '突撃攻撃（リーチ2〜4.5）' },
  golden_spear: { name: '金の槍', attack: 1, speed: 1.05, durability: 32, rarity: 'common', desc: '突撃攻撃（リーチ2〜4.5）' },
  diamond_spear: { name: 'ダイヤモンドの槍', attack: 4, speed: 0.95, durability: 1561, rarity: 'common', desc: '突撃攻撃（リーチ2〜4.5）' },
  netherite_spear: { name: 'ネザライトの槍', attack: 5, speed: 0.87, durability: 2031, rarity: 'common', desc: '突撃攻撃（リーチ2〜4.5）' },

  // その他
  shield: { name: '盾', durability: 336, rarity: 'common', desc: '攻撃をブロック' },
  fishing_rod: { name: '釣り竿', durability: 64, rarity: 'common' },
  enchanted_book: { name: 'エンチャントの本', rarity: 'uncommon', desc: 'エンチャントを付与' },
};

// レアリティカラー
const RARITY_COLORS = {
  common: '#FFFFFF',
  uncommon: '#FFFF55',
  rare: '#55FFFF',
  epic: '#FF55FF',
};

// ツールチップ要素
let tooltipElement = null;

/**
 * ツールチップを初期化
 */
export function initTooltip() {
  if (tooltipElement) return;

  tooltipElement = document.createElement('div');
  tooltipElement.className = 'mc-tooltip';
  tooltipElement.style.display = 'none';
  document.body.appendChild(tooltipElement);

  // スタイルを追加
  const style = document.createElement('style');
  style.textContent = `
    .mc-tooltip {
      position: fixed;
      z-index: 10000;
      pointer-events: none;
      font-family: 'Minecraft', 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      white-space: normal;

      /* Minecraft風背景（完全不透明） */
      background-color: #100010;
      background-image:
        linear-gradient(180deg, #100010 0%, #1a0a1a 100%),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.02) 2px,
          rgba(255,255,255,0.02) 4px
        );
      border: 3px solid #5000aa;
      outline: 2px solid #28007f;
      box-shadow:
        inset 0 0 0 1px rgba(80, 0, 170, 0.5),
        0 0 20px rgba(80, 0, 170, 0.3),
        4px 4px 0 rgba(0, 0, 0, 0.8);

      padding: 8px 12px;
      max-width: 280px;
    }

    .mc-tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .mc-tooltip-icon {
      width: 32px;
      height: 32px;
      image-rendering: pixelated;
      filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.5));
    }

    .mc-tooltip-name {
      font-weight: bold;
      text-shadow: 2px 2px 0 #3f3f3f;
    }

    .mc-tooltip-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #5000aa, transparent);
      margin: 6px 0;
    }

    .mc-tooltip-stats {
      color: #aaaaaa;
      font-size: 13px;
    }

    .mc-tooltip-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 2px 0;
    }

    .mc-tooltip-stat-icon {
      width: 9px;
      height: 9px;
      display: inline-block;
    }

    .mc-tooltip-stat-icon.attack {
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 9 9'%3E%3Cpath fill='%23aa0000' d='M4 0h1v1h1v1h1v1h1v1h1v1h-1v1h-1v-1h-1v-1h-1v1h-1v1h-1v-1h-1v-1h1v-1h1v-1h-1v-1z'/%3E%3C/svg%3E") no-repeat center;
    }

    .mc-tooltip-stat-icon.speed {
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 9 9'%3E%3Cpath fill='%23ffaa00' d='M2 0h5v1h1v2h-1v1h-2v1h-1v1h-1v2h-2v-1h1v-2h1v-1h1v-1h-1v-1h-2v-1h1z'/%3E%3C/svg%3E") no-repeat center;
    }

    .mc-tooltip-stat-icon.armor {
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 9 9'%3E%3Cpath fill='%23aaaaaa' d='M1 1h7v1h1v4h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-4h1z'/%3E%3C/svg%3E") no-repeat center;
    }

    .mc-tooltip-stat-icon.durability {
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 9 9'%3E%3Crect fill='%2355ff55' x='0' y='3' width='9' height='3'/%3E%3C/svg%3E") no-repeat center;
    }

    .mc-tooltip-stat-value {
      color: #55ff55;
    }

    .mc-tooltip-stat-value.attack {
      color: #aa0000;
    }

    .mc-tooltip-stat-label {
      color: #555555;
    }

    .mc-tooltip-equipped {
      color: #555555;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .mc-tooltip-desc {
      color: #aa00aa;
      font-style: italic;
      margin-top: 4px;
      font-size: 12px;
    }

    .mc-tooltip-effect {
      color: #5555ff;
      font-size: 12px;
      margin-top: 2px;
    }

    /* ツールチップトリガー */
    [data-mc-tooltip] {
      cursor: help;
    }
  `;
  document.head.appendChild(style);

  // グローバルイベントリスナー
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('mousemove', handleMouseMove);
}

/**
 * マウスオーバーハンドラ
 */
function handleMouseOver(e) {
  const target = e.target.closest('[data-mc-tooltip]');
  if (!target) return;

  const itemId = target.dataset.mcTooltip;
  const customData = target.dataset.mcTooltipData;

  let data;
  if (customData) {
    try {
      data = JSON.parse(customData);
    } catch (err) {
      data = ITEM_DATA[itemId] || { name: itemId };
    }
  } else {
    data = ITEM_DATA[itemId] || { name: itemId };
  }

  showTooltip(itemId, data, e);
}

/**
 * マウスアウトハンドラ
 */
function handleMouseOut(e) {
  const target = e.target.closest('[data-mc-tooltip]');
  if (target) {
    hideTooltip();
  }
}

/**
 * マウス移動ハンドラ
 */
function handleMouseMove(e) {
  if (tooltipElement && tooltipElement.style.display !== 'none') {
    positionTooltip(e);
  }
}

/**
 * ツールチップを表示
 */
function showTooltip(itemId, data, event) {
  if (!tooltipElement) return;

  const rarityColor = RARITY_COLORS[data.rarity] || RARITY_COLORS.common;

  let html = `
    <div class="mc-tooltip-header">
      <img src="${getInviconUrl(itemId)}" alt="" class="mc-tooltip-icon" onerror="this.style.display='none'">
      <span class="mc-tooltip-name" style="color: ${rarityColor}">${data.name || itemId}</span>
    </div>
  `;

  // ステータスがある場合
  if (data.attack || data.armor || data.speed || data.durability) {
    html += '<div class="mc-tooltip-divider"></div>';

    // 「利き手に持ったとき:」または「装備したとき:」を先に表示
    if (data.attack || data.speed) {
      html += '<div class="mc-tooltip-equipped">利き手に持ったとき:</div>';
    } else if (data.armor) {
      html += '<div class="mc-tooltip-equipped">装備したとき:</div>';
    }

    // ステータスを表示
    html += '<div class="mc-tooltip-stats">';

    if (data.attack) {
      html += `
        <div class="mc-tooltip-stat">
          <span class="mc-tooltip-stat-icon attack"></span>
          <span class="mc-tooltip-stat-value attack">${data.attack}</span>
          <span class="mc-tooltip-stat-label">攻撃力</span>
        </div>
      `;
    }

    if (data.speed) {
      html += `
        <div class="mc-tooltip-stat">
          <span class="mc-tooltip-stat-icon speed"></span>
          <span class="mc-tooltip-stat-value">${data.speed}</span>
          <span class="mc-tooltip-stat-label">攻撃速度</span>
        </div>
      `;
    }

    if (data.armor) {
      html += `
        <div class="mc-tooltip-stat">
          <span class="mc-tooltip-stat-icon armor"></span>
          <span class="mc-tooltip-stat-value">${data.armor}</span>
          <span class="mc-tooltip-stat-label">防御力</span>
        </div>
      `;
    }

    if (data.toughness) {
      html += `
        <div class="mc-tooltip-stat">
          <span class="mc-tooltip-stat-icon armor"></span>
          <span class="mc-tooltip-stat-value">${data.toughness}</span>
          <span class="mc-tooltip-stat-label">防具強度</span>
        </div>
      `;
    }

    html += '</div>';

    // 耐久値は別セクション
    if (data.durability) {
      html += '<div class="mc-tooltip-divider"></div>';
      html += `
        <div class="mc-tooltip-stat">
          <span class="mc-tooltip-stat-icon durability"></span>
          <span class="mc-tooltip-stat-value">${data.durability}</span>
          <span class="mc-tooltip-stat-label">耐久値</span>
        </div>
      `;
    }
  }

  // 効果
  if (data.effect) {
    html += `<div class="mc-tooltip-effect">${data.effect}</div>`;
  }

  // 説明
  if (data.desc) {
    html += `<div class="mc-tooltip-desc">${data.desc}</div>`;
  }

  tooltipElement.innerHTML = html;
  tooltipElement.style.display = 'block';
  positionTooltip(event);
}

/**
 * ツールチップを非表示
 */
function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.style.display = 'none';
  }
}

/**
 * ツールチップを位置決め
 */
function positionTooltip(event) {
  if (!tooltipElement) return;

  const padding = 15;
  const rect = tooltipElement.getBoundingClientRect();

  let x = event.clientX + padding;
  let y = event.clientY + padding;

  // 右端からはみ出す場合
  if (x + rect.width > window.innerWidth - padding) {
    x = event.clientX - rect.width - padding;
  }

  // 下端からはみ出す場合
  if (y + rect.height > window.innerHeight - padding) {
    y = event.clientY - rect.height - padding;
  }

  tooltipElement.style.left = x + 'px';
  tooltipElement.style.top = y + 'px';
}

/**
 * アイテムにツールチップを適用
 */
export function applyTooltip(element, itemId, customData = null) {
  element.dataset.mcTooltip = itemId;
  if (customData) {
    element.dataset.mcTooltipData = JSON.stringify(customData);
  }
}

/**
 * アイテムデータを追加
 */
export function addItemData(itemId, data) {
  ITEM_DATA[itemId] = data;
}

export default {
  initTooltip,
  applyTooltip,
  addItemData,
  showTooltip,
  hideTooltip,
};
