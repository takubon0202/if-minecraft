/**
 * Give Generator - Engine
 * コマンド生成ロジック（マルチバージョン対応）
 */

import {
  getVersionGroup,
  compareVersions,
  ENCHANT_ID_MAP,
} from '../../core/version-compat.js';

/**
 * /give コマンドを生成
 * @param {Object} state - フォーム状態
 * @param {string} version - Minecraftバージョン（デフォルト: 1.21）
 * @returns {string} - 生成されたコマンド
 */
export function generateGiveCommand(state, version = '1.21') {
  const group = getVersionGroup(version);

  switch (group) {
    case 'latest':
    case 'component':
      return generateGiveComponent(state, version);
    case 'nbt-modern':
    case 'nbt-legacy':
      return generateGiveNBT(state, version);
    case 'legacy':
      return generateGiveLegacy(state, version);
    default:
      return generateGiveComponent(state, version);
  }
}

/**
 * コンポーネント形式（1.20.5+）
 */
function generateGiveComponent(state, version) {
  const {
    target,
    item,
    count,
    customName,
    lore,
    unbreakable,
    enchantments,
    rawComponents,
  } = state;

  // アイテムID
  const itemId = item.includes(':') ? item : `minecraft:${item}`;

  // 1.21.5以降は簡略形式が使用可能
  const useSimplifiedForm = compareVersions(version, '1.21.5') >= 0;

  // コンポーネントを構築
  const components = [];

  // カスタム名（名前空間付き）
  if (customName) {
    const escapedName = escapeJsonString(customName);
    components.push(`minecraft:custom_name='{"text":"${escapedName}","italic":false}'`);
  }

  // 説明文（名前空間付き）
  if (lore) {
    const loreLines = lore.split('\n').filter(l => l.trim());
    if (loreLines.length > 0) {
      const loreJson = loreLines.map(line => `'{"text":"${escapeJsonString(line)}"}'`).join(',');
      components.push(`minecraft:lore=[${loreJson}]`);
    }
  }

  // 耐久無限（名前空間付き）
  if (unbreakable) {
    components.push('minecraft:unbreakable={}');
  }

  // エンチャント
  if (enchantments.length > 0) {
    const enchantLevels = enchantments.map(e => `"minecraft:${e.id}":${e.level}`).join(',');
    // エンチャントの本は stored_enchantments を使用
    const isEnchantedBook = itemId.includes('enchanted_book');
    const componentName = isEnchantedBook ? 'minecraft:stored_enchantments' : 'minecraft:enchantments';

    if (useSimplifiedForm) {
      // 1.21.5+: 簡略形式
      components.push(`${componentName}={${enchantLevels}}`);
    } else {
      // 1.20.5-1.21.4: 長い形式（levelsラッパー必須）
      components.push(`${componentName}={levels:{${enchantLevels}}}`);
    }
  }

  // Raw Components
  if (rawComponents?.trim()) {
    components.push(rawComponents.trim());
  }

  // コマンド構築
  let command = `/give ${target} ${itemId}`;

  if (components.length > 0) {
    command += `[${components.join(',')}]`;
  }

  if (count !== 1) {
    command += ` ${count}`;
  }

  return command;
}

/**
 * NBT形式（1.13-1.20.4）
 */
function generateGiveNBT(state, version) {
  const {
    target,
    item,
    count,
    customName,
    lore,
    unbreakable,
    enchantments,
    rawComponents,
  } = state;

  // アイテムID
  const itemId = item.includes(':') ? item : `minecraft:${item}`;

  // NBTを構築
  const nbtParts = [];

  // display: カスタム名・説明文
  const displayParts = [];
  if (customName) {
    // 1.13以降はJSON形式
    const escapedName = escapeJsonString(customName);
    displayParts.push(`Name:'{"text":"${escapedName}","italic":false}'`);
  }

  if (lore) {
    const loreLines = lore.split('\n').filter(l => l.trim());
    if (loreLines.length > 0) {
      const loreJson = loreLines.map(line => `'{"text":"${escapeJsonString(line)}"}'`).join(',');
      displayParts.push(`Lore:[${loreJson}]`);
    }
  }

  if (displayParts.length > 0) {
    nbtParts.push(`display:{${displayParts.join(',')}}`);
  }

  // 耐久無限
  if (unbreakable) {
    nbtParts.push('Unbreakable:1b');
  }

  // エンチャント（Enchantmentsタグ）
  if (enchantments.length > 0) {
    const enchantList = enchantments.map(e =>
      `{id:"minecraft:${e.id}",lvl:${e.level}s}`
    ).join(',');
    // エンチャントの本は StoredEnchantments を使用
    const isEnchantedBook = itemId.includes('enchanted_book');
    const tagName = isEnchantedBook ? 'StoredEnchantments' : 'Enchantments';
    nbtParts.push(`${tagName}:[${enchantList}]`);
  }

  // Raw NBT
  if (rawComponents?.trim()) {
    nbtParts.push(rawComponents.trim());
  }

  // コマンド構築
  let command = `/give ${target} ${itemId}`;

  if (nbtParts.length > 0) {
    command += `{${nbtParts.join(',')}}`;
  }

  if (count !== 1) {
    command += ` ${count}`;
  }

  return command;
}

/**
 * レガシー形式（1.12.2以前）
 */
function generateGiveLegacy(state, version) {
  const {
    target,
    item,
    count,
    damage = 0,
    customName,
    lore,
    unbreakable,
    enchantments,
    rawComponents,
  } = state;

  // アイテムID（minecraft:プレフィックスを削除）
  const itemId = item.replace('minecraft:', '');

  // NBTを構築
  const nbtParts = [];

  // display: カスタム名・説明文（1.12では単純文字列）
  const displayParts = [];
  if (customName) {
    displayParts.push(`Name:"${escapeJsonString(customName)}"`);
  }

  if (lore) {
    const loreLines = lore.split('\n').filter(l => l.trim());
    if (loreLines.length > 0) {
      const loreJson = loreLines.map(line => `"${escapeJsonString(line)}"`).join(',');
      displayParts.push(`Lore:[${loreJson}]`);
    }
  }

  if (displayParts.length > 0) {
    nbtParts.push(`display:{${displayParts.join(',')}}`);
  }

  // 耐久無限
  if (unbreakable) {
    nbtParts.push('Unbreakable:1b');
  }

  // エンチャント（Enchタグ、数値ID）
  if (enchantments.length > 0) {
    const enchantList = enchantments.map(e => {
      // 文字列IDを数値IDに変換
      const numericId = Object.entries(ENCHANT_ID_MAP)
        .find(([, name]) => name === e.id)?.[0] || 0;
      return `{id:${numericId}s,lvl:${e.level}s}`;
    }).join(',');
    nbtParts.push(`ench:[${enchantList}]`);
  }

  // Raw NBT
  if (rawComponents?.trim()) {
    nbtParts.push(rawComponents.trim());
  }

  // コマンド構築
  // 1.12形式: /give <target> <item> [count] [damage] [nbt]
  let command = `/give ${target} ${itemId} ${count}`;

  // ダメージ値（NBTがある場合は必須）
  if (nbtParts.length > 0 || damage > 0) {
    command += ` ${damage}`;
  }

  if (nbtParts.length > 0) {
    command += ` {${nbtParts.join(',')}}`;
  }

  return command;
}

/**
 * JSON文字列をエスケープ
 */
function escapeJsonString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

/**
 * コマンドを検証
 */
export function validateGiveCommand(command) {
  const errors = [];

  if (!command.startsWith('/give ')) {
    errors.push('コマンドは /give で始まる必要があります');
  }

  const targetMatch = command.match(/\/give\s+(@[psar]|[\w]+)/);
  if (!targetMatch) {
    errors.push('有効なターゲットが指定されていません');
  }

  const itemMatch = command.match(/\/give\s+\S+\s+([\w:]+)/);
  if (!itemMatch) {
    errors.push('アイテムIDが指定されていません');
  }

  const brackets = { '[': 0, '{': 0 };
  for (const char of command) {
    if (char === '[') brackets['[']++;
    if (char === ']') brackets['[']--;
    if (char === '{') brackets['{']++;
    if (char === '}') brackets['{']--;
  }
  if (brackets['['] !== 0) {
    errors.push('角括弧 [ ] のバランスが取れていません');
  }
  if (brackets['{'] !== 0) {
    errors.push('波括弧 { } のバランスが取れていません');
  }

  return { valid: errors.length === 0, errors };
}

export default { generateGiveCommand, validateGiveCommand };
