/**
 * Minecraft バージョン互換性モジュール
 * 1.12.2から1.21.x までの主要バージョンに対応
 */

/**
 * サポートするMinecraftバージョン一覧
 * 主要なコマンド形式の変更があったバージョンを基準に分類
 */
export const MC_VERSIONS = [
  // 最新（コンポーネント形式）
  { value: '1.21', label: '1.21.x (最新)', group: 'latest' },
  { value: '1.20.5', label: '1.20.5 - 1.20.6', group: 'component' },

  // NBT形式（1.16以降）
  { value: '1.20', label: '1.20 - 1.20.4', group: 'nbt-modern' },
  { value: '1.19', label: '1.19.x', group: 'nbt-modern' },
  { value: '1.18', label: '1.18.x', group: 'nbt-modern' },
  { value: '1.17', label: '1.17.x', group: 'nbt-modern' },
  { value: '1.16', label: '1.16.x', group: 'nbt-modern' },

  // NBT形式（1.13-1.15）
  { value: '1.15', label: '1.15.x', group: 'nbt-legacy' },
  { value: '1.14', label: '1.14.x', group: 'nbt-legacy' },
  { value: '1.13', label: '1.13.x (The Flattening)', group: 'nbt-legacy' },

  // レガシー形式（1.12.2以前）- 数値IDとデータ値使用
  { value: '1.12', label: '1.12.x (レガシー)', group: 'legacy' },
];

/**
 * バージョングループ
 */
export const VERSION_GROUPS = {
  latest: {
    label: '1.21+ (最新コンポーネント形式)',
    description: 'コンポーネント形式、click_event/hover_event',
    features: ['component', 'snake_case_events', 'hex_colors', 'string_ids'],
  },
  component: {
    label: '1.20.5-1.20.6 (コンポーネント導入)',
    description: 'コンポーネント形式への移行期',
    features: ['component', 'camelCase_events', 'hex_colors', 'string_ids'],
  },
  'nbt-modern': {
    label: '1.16-1.20.4 (モダンNBT)',
    description: 'NBT形式、16進カラー対応',
    features: ['nbt', 'camelCase_events', 'hex_colors', 'string_ids'],
  },
  'nbt-legacy': {
    label: '1.13-1.15 (NBT)',
    description: 'The Flattening以降、NBT形式',
    features: ['nbt', 'camelCase_events', 'string_ids'],
  },
  legacy: {
    label: '1.12.x以前 (レガシー)',
    description: '数値ID、データ値、旧NBTタグ',
    features: ['legacy_nbt', 'numeric_ids', 'data_values', 'ench_tag'],
  },
};

/**
 * バージョンを比較
 * @param {string} v1 - バージョン1
 * @param {string} v2 - バージョン2
 * @returns {number} v1 > v2: 1, v1 < v2: -1, v1 == v2: 0
 */
export function compareVersions(v1, v2) {
  const parse = (v) => v.split('.').map(n => parseInt(n) || 0);
  const p1 = parse(v1);
  const p2 = parse(v2);

  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

/**
 * バージョンが指定範囲内かチェック
 */
export function isVersionInRange(version, min, max) {
  return compareVersions(version, min) >= 0 && compareVersions(version, max) <= 0;
}

/**
 * バージョンのグループを取得
 */
export function getVersionGroup(version) {
  if (compareVersions(version, '1.21') >= 0) return 'latest';
  if (compareVersions(version, '1.20.5') >= 0) return 'component';
  if (compareVersions(version, '1.16') >= 0) return 'nbt-modern';
  if (compareVersions(version, '1.13') >= 0) return 'nbt-legacy';
  return 'legacy';
}

/**
 * バージョンが特定機能をサポートしているかチェック
 */
export function supportsFeature(version, feature) {
  const group = getVersionGroup(version);
  return VERSION_GROUPS[group]?.features.includes(feature) || false;
}

/**
 * コマンド機能の対応状況
 */
export const COMMAND_FEATURES = {
  // /give コマンド
  give: {
    component_format: { minVersion: '1.20.5', description: 'コンポーネント形式 [...]' },
    nbt_format: { minVersion: '1.13', maxVersion: '1.20.4', description: 'NBT形式 {...}' },
    data_values: { maxVersion: '1.12.2', description: 'データ値（メタデータ）' },
    numeric_ids: { maxVersion: '1.12.2', description: '数値アイテムID' },
  },

  // /summon コマンド
  summon: {
    snake_case_ids: { minVersion: '1.13', description: 'スネークケースID (armor_stand)' },
    camel_case_ids: { maxVersion: '1.12.2', description: 'キャメルケースID (ArmorStand)' },
    strict_json_names: { minVersion: '1.13', description: 'カスタム名のJSON形式厳格化' },
  },

  // エンチャント
  enchant: {
    enchantments_component: { minVersion: '1.20.5', description: 'enchantmentsコンポーネント' },
    enchantments_tag: { minVersion: '1.13', maxVersion: '1.20.4', description: 'Enchantmentsタグ' },
    ench_tag: { maxVersion: '1.12.2', description: 'Enchタグ（数値ID可）' },
    string_ids: { minVersion: '1.13', description: '文字列エンチャントID' },
    numeric_ids: { maxVersion: '1.12.2', description: '数値エンチャントID' },
  },

  // ポーション効果
  effect: {
    give_clear_subcommand: { minVersion: '1.13', description: 'give/clearサブコマンド' },
    string_ids: { minVersion: '1.13', description: '文字列効果ID' },
    numeric_ids: { maxVersion: '1.12.2', description: '数値効果ID' },
    infinite_duration: { minVersion: '1.19.4', description: '無限効果 (infinite)' },
  },

  // テキストコマンド
  text: {
    snake_case_events: { minVersion: '1.21', description: 'click_event/hover_event形式' },
    camel_case_events: { maxVersion: '1.20.6', description: 'clickEvent/hoverEvent形式' },
    hex_colors: { minVersion: '1.16', description: '16進カラーコード (#RRGGBB)' },
    strict_json: { minVersion: '1.13', description: '厳格なJSON形式' },
  },

  // /title コマンド
  title: {
    available: { minVersion: '1.8', description: '/titleコマンド' },
    times_subcommand: { minVersion: '1.8', description: 'times サブコマンド' },
  },
};

/**
 * 指定バージョンでコマンド機能が使用可能かチェック
 */
export function isFeatureAvailable(version, command, feature) {
  const featureInfo = COMMAND_FEATURES[command]?.[feature];
  if (!featureInfo) return false;

  const { minVersion, maxVersion } = featureInfo;

  if (minVersion && compareVersions(version, minVersion) < 0) return false;
  if (maxVersion && compareVersions(version, maxVersion) > 0) return false;

  return true;
}

/**
 * エンチャントID変換（数値 ⇔ 文字列）
 */
export const ENCHANT_ID_MAP = {
  // 数値ID: 文字列ID
  0: 'protection',
  1: 'fire_protection',
  2: 'feather_falling',
  3: 'blast_protection',
  4: 'projectile_protection',
  5: 'respiration',
  6: 'aqua_affinity',
  7: 'thorns',
  8: 'depth_strider',
  9: 'frost_walker',
  10: 'binding_curse',
  16: 'sharpness',
  17: 'smite',
  18: 'bane_of_arthropods',
  19: 'knockback',
  20: 'fire_aspect',
  21: 'looting',
  22: 'sweeping_edge',
  32: 'efficiency',
  33: 'silk_touch',
  34: 'unbreaking',
  35: 'fortune',
  48: 'power',
  49: 'punch',
  50: 'flame',
  51: 'infinity',
  61: 'luck_of_the_sea',
  62: 'lure',
  65: 'loyalty',
  66: 'impaling',
  67: 'riptide',
  68: 'channeling',
  70: 'mending',
  71: 'vanishing_curse',
};

/**
 * ポーション効果ID変換（数値 ⇔ 文字列）
 */
export const EFFECT_ID_MAP = {
  1: 'speed',
  2: 'slowness',
  3: 'haste',
  4: 'mining_fatigue',
  5: 'strength',
  6: 'instant_health',
  7: 'instant_damage',
  8: 'jump_boost',
  9: 'nausea',
  10: 'regeneration',
  11: 'resistance',
  12: 'fire_resistance',
  13: 'water_breathing',
  14: 'invisibility',
  15: 'blindness',
  16: 'night_vision',
  17: 'hunger',
  18: 'weakness',
  19: 'poison',
  20: 'wither',
  21: 'health_boost',
  22: 'absorption',
  23: 'saturation',
  24: 'glowing',
  25: 'levitation',
  26: 'luck',
  27: 'unluck',
  28: 'slow_falling',
  29: 'conduit_power',
  30: 'dolphins_grace',
  31: 'bad_omen',
  32: 'hero_of_the_village',
  33: 'darkness',
};

/**
 * アイテムコンポーネント形式への変換
 * @param {string} version - ターゲットバージョン
 * @param {Object} itemData - アイテムデータ
 * @returns {string} フォーマットされたアイテム文字列
 */
export function formatItemForVersion(version, itemData) {
  const { id, count = 1, nbt, components } = itemData;
  const group = getVersionGroup(version);

  // 名前空間を追加
  const fullId = id.includes(':') ? id : `minecraft:${id}`;

  switch (group) {
    case 'latest':
    case 'component':
      return formatItemComponent(fullId, count, components || nbt);
    case 'nbt-modern':
    case 'nbt-legacy':
      return formatItemNBT(fullId, count, nbt);
    case 'legacy':
      return formatItemLegacy(itemData);
    default:
      return formatItemNBT(fullId, count, nbt);
  }
}

/**
 * コンポーネント形式でアイテムをフォーマット（1.20.5+）
 */
function formatItemComponent(id, count, data) {
  if (!data || Object.keys(data).length === 0) {
    return count > 1 ? `${id} ${count}` : id;
  }

  const components = [];

  // エンチャント
  if (data.Enchantments || data.enchantments) {
    const enchants = data.Enchantments || data.enchantments;
    const levels = {};
    enchants.forEach(e => {
      const enchId = e.id?.replace('minecraft:', '') || e.id;
      levels[`"minecraft:${enchId}"`] = e.lvl || e.level || 1;
    });
    components.push(`enchantments={levels:{${Object.entries(levels).map(([k, v]) => `${k}:${v}`).join(',')}}}`);
  }

  // カスタム名
  if (data.display?.Name || data.custom_name) {
    const name = data.display?.Name || data.custom_name;
    components.push(`custom_name='${name}'`);
  }

  // 耐久値
  if (data.Damage !== undefined) {
    components.push(`damage=${data.Damage}`);
  }

  // カスタムデータ（その他のNBT）
  if (data.custom_data) {
    components.push(`custom_data=${JSON.stringify(data.custom_data)}`);
  }

  if (components.length === 0) {
    return count > 1 ? `${id} ${count}` : id;
  }

  return `${id}[${components.join(',')}]${count > 1 ? ` ${count}` : ''}`;
}

/**
 * NBT形式でアイテムをフォーマット（1.13-1.20.4）
 */
function formatItemNBT(id, count, nbt) {
  if (!nbt || Object.keys(nbt).length === 0) {
    return count > 1 ? `${id} ${count}` : id;
  }

  // NBTをSNBT形式に変換
  const snbt = objectToSNBT(nbt);
  return `${id}${snbt}${count > 1 ? ` ${count}` : ''}`;
}

/**
 * レガシー形式でアイテムをフォーマット（1.12.2以前）
 */
function formatItemLegacy(itemData) {
  const { id, count = 1, damage = 0, nbt } = itemData;

  // 数値IDまたは文字列ID（名前空間なし）
  const itemId = id.replace('minecraft:', '');

  // レガシーNBTに変換（Enchantments → Ench）
  const legacyNbt = convertToLegacyNBT(nbt);

  if (!legacyNbt || Object.keys(legacyNbt).length === 0) {
    return damage > 0 ? `${itemId} ${count} ${damage}` : `${itemId} ${count}`;
  }

  const snbt = objectToSNBT(legacyNbt);
  return `${itemId} ${count} ${damage} ${snbt}`;
}

/**
 * NBTをレガシー形式に変換
 */
function convertToLegacyNBT(nbt) {
  if (!nbt) return null;

  const legacy = { ...nbt };

  // Enchantments → Ench、文字列ID → 数値ID
  if (legacy.Enchantments) {
    legacy.Ench = legacy.Enchantments.map(e => {
      const stringId = e.id?.replace('minecraft:', '');
      const numericId = Object.entries(ENCHANT_ID_MAP).find(([, v]) => v === stringId)?.[0];
      return {
        id: numericId ? parseInt(numericId) : 0,
        lvl: e.lvl || e.level || 1,
      };
    });
    delete legacy.Enchantments;
  }

  return legacy;
}

/**
 * オブジェクトをSNBT形式の文字列に変換
 */
export function objectToSNBT(obj, indent = false) {
  if (obj === null || obj === undefined) return '';

  const formatValue = (value) => {
    if (typeof value === 'string') {
      // JSON文字列の場合はそのまま
      if (value.startsWith('{') || value.startsWith('"')) {
        return value;
      }
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return String(value);
      return `${value}f`;
    }
    if (typeof value === 'boolean') {
      return value ? '1b' : '0b';
    }
    if (Array.isArray(value)) {
      return `[${value.map(formatValue).join(',')}]`;
    }
    if (typeof value === 'object') {
      return objectToSNBT(value);
    }
    return String(value);
  };

  const pairs = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}:${formatValue(v)}`);

  return `{${pairs.join(',')}}`;
}

/**
 * JSON Text Componentをバージョンに応じてフォーマット
 */
export function formatTextComponentForVersion(version, components) {
  const useSnakeCase = compareVersions(version, '1.21') >= 0;
  const useHexColors = compareVersions(version, '1.16') >= 0;

  const formatComponent = (comp) => {
    const result = { text: comp.text || '' };

    // 色
    if (comp.color) {
      if (comp.color.startsWith('#') && !useHexColors) {
        // 16進数を最も近いMinecraftカラーに変換
        result.color = hexToMcColor(comp.color);
      } else {
        result.color = comp.color;
      }
    }

    // スタイル
    if (comp.bold) result.bold = true;
    if (comp.italic) result.italic = true;
    if (comp.underlined) result.underlined = true;
    if (comp.strikethrough) result.strikethrough = true;
    if (comp.obfuscated) result.obfuscated = true;

    // クリックイベント
    if (comp.clickEvent) {
      const eventKey = useSnakeCase ? 'click_event' : 'clickEvent';
      result[eventKey] = formatClickEvent(comp.clickEvent, version, useSnakeCase);
    }

    // ホバーイベント
    if (comp.hoverEvent) {
      const eventKey = useSnakeCase ? 'hover_event' : 'hoverEvent';
      result[eventKey] = formatHoverEvent(comp.hoverEvent, version, useSnakeCase);
    }

    return result;
  };

  if (!Array.isArray(components)) {
    return JSON.stringify(formatComponent(components));
  }

  if (components.length === 0) return '""';
  if (components.length === 1) {
    const comp = components[0];
    if (!comp.color && !comp.bold && !comp.italic && !comp.clickEvent && !comp.hoverEvent) {
      return JSON.stringify(comp.text || '');
    }
    return JSON.stringify(formatComponent(comp));
  }

  return JSON.stringify(components.map(formatComponent));
}

/**
 * クリックイベントをフォーマット
 */
function formatClickEvent(event, version, useSnakeCase) {
  const { action, value } = event;

  if (useSnakeCase) {
    // 1.21+の新形式
    switch (action) {
      case 'open_url':
        return { action, url: value };
      case 'run_command':
        // スラッシュを削除
        return { action, command: value.startsWith('/') ? value.slice(1) : value };
      case 'suggest_command':
        return { action, command: value };
      case 'copy_to_clipboard':
        return { action, contents: value };
      default:
        return { action, value };
    }
  }

  // 旧形式
  return { action, value };
}

/**
 * ホバーイベントをフォーマット
 */
function formatHoverEvent(event, version, useSnakeCase) {
  const { action, contents } = event;

  if (useSnakeCase && action === 'show_text') {
    return { action, value: contents };
  }

  return { action, contents };
}

/**
 * 16進数カラーコードを最も近いMinecraftカラーに変換
 */
function hexToMcColor(hex) {
  const mcColors = {
    black: '#000000',
    dark_blue: '#0000AA',
    dark_green: '#00AA00',
    dark_aqua: '#00AAAA',
    dark_red: '#AA0000',
    dark_purple: '#AA00AA',
    gold: '#FFAA00',
    gray: '#AAAAAA',
    dark_gray: '#555555',
    blue: '#5555FF',
    green: '#55FF55',
    aqua: '#55FFFF',
    red: '#FF5555',
    light_purple: '#FF55FF',
    yellow: '#FFFF55',
    white: '#FFFFFF',
  };

  const hexToRgb = (h) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  const target = hexToRgb(hex);
  if (!target) return 'white';

  let closest = 'white';
  let minDist = Infinity;

  for (const [name, mcHex] of Object.entries(mcColors)) {
    const mc = hexToRgb(mcHex);
    const dist = Math.sqrt(
      Math.pow(target.r - mc.r, 2) +
      Math.pow(target.g - mc.g, 2) +
      Math.pow(target.b - mc.b, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = name;
    }
  }

  return closest;
}

/**
 * バージョン選択UIをレンダリング
 */
export function renderVersionSelector(selectedVersion = '1.21', id = 'mc-version-select') {
  const groups = {
    '最新': MC_VERSIONS.filter(v => v.group === 'latest' || v.group === 'component'),
    'モダン (1.16-1.20.4)': MC_VERSIONS.filter(v => v.group === 'nbt-modern'),
    'クラシック (1.13-1.15)': MC_VERSIONS.filter(v => v.group === 'nbt-legacy'),
    'レガシー (1.12.x)': MC_VERSIONS.filter(v => v.group === 'legacy'),
  };

  let html = `<select id="${id}" class="mc-select mc-version-selector">`;

  for (const [groupLabel, versions] of Object.entries(groups)) {
    html += `<optgroup label="${groupLabel}">`;
    for (const v of versions) {
      const selected = v.value === selectedVersion ? 'selected' : '';
      html += `<option value="${v.value}" ${selected}>${v.label}</option>`;
    }
    html += '</optgroup>';
  }

  html += '</select>';
  return html;
}

/**
 * バージョン注釈を取得
 */
export function getVersionNote(version) {
  const group = getVersionGroup(version);
  const notes = {
    latest: 'コンポーネント形式、click_event/hover_event（スネークケース）',
    component: 'コンポーネント形式への移行期、clickEvent/hoverEvent',
    'nbt-modern': 'NBT形式、16進カラーコード対応、clickEvent/hoverEvent',
    'nbt-legacy': 'NBT形式、基本カラーのみ',
    legacy: '数値ID/データ値、Enchタグ、旧形式NBT',
  };
  return notes[group] || '';
}

export default {
  MC_VERSIONS,
  VERSION_GROUPS,
  COMMAND_FEATURES,
  compareVersions,
  isVersionInRange,
  getVersionGroup,
  supportsFeature,
  isFeatureAvailable,
  formatItemForVersion,
  formatTextComponentForVersion,
  objectToSNBT,
  renderVersionSelector,
  getVersionNote,
  ENCHANT_ID_MAP,
  EFFECT_ID_MAP,
};
