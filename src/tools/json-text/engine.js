/**
 * JSON Text Generator - Engine
 * JSONテキストコンポーネント生成ロジック（マルチバージョン対応）
 */

import { getVersionGroup, compareVersions } from '../../core/version-compat.js';

// Minecraft 16色カラー
export const MC_COLORS = [
  { id: 'black', name: '黒', hex: '#000000', code: '0' },
  { id: 'dark_blue', name: '紺', hex: '#0000AA', code: '1' },
  { id: 'dark_green', name: '緑', hex: '#00AA00', code: '2' },
  { id: 'dark_aqua', name: '青緑', hex: '#00AAAA', code: '3' },
  { id: 'dark_red', name: '暗赤', hex: '#AA0000', code: '4' },
  { id: 'dark_purple', name: '紫', hex: '#AA00AA', code: '5' },
  { id: 'gold', name: '金', hex: '#FFAA00', code: '6' },
  { id: 'gray', name: '灰', hex: '#AAAAAA', code: '7' },
  { id: 'dark_gray', name: '暗灰', hex: '#555555', code: '8' },
  { id: 'blue', name: '青', hex: '#5555FF', code: '9' },
  { id: 'green', name: '黄緑', hex: '#55FF55', code: 'a' },
  { id: 'aqua', name: '水色', hex: '#55FFFF', code: 'b' },
  { id: 'red', name: '赤', hex: '#FF5555', code: 'c' },
  { id: 'light_purple', name: 'ピンク', hex: '#FF55FF', code: 'd' },
  { id: 'yellow', name: '黄', hex: '#FFFF55', code: 'e' },
  { id: 'white', name: '白', hex: '#FFFFFF', code: 'f' },
];

// クリックイベントアクション
export const CLICK_ACTIONS = [
  { id: '', name: '-- なし --', placeholder: '' },
  { id: 'open_url', name: 'URLを開く', placeholder: 'https://example.com' },
  { id: 'run_command', name: 'コマンド実行', placeholder: '/tp @s ~ ~10 ~' },
  { id: 'suggest_command', name: 'コマンド提案', placeholder: '/give @s diamond' },
  { id: 'copy_to_clipboard', name: 'クリップボードにコピー', placeholder: 'コピーするテキスト' },
];

// ホバーイベントアクション
export const HOVER_ACTIONS = [
  { id: '', name: '-- なし --', placeholder: '' },
  { id: 'show_text', name: 'テキスト表示', placeholder: 'ホバー時に表示するテキスト' },
  { id: 'show_item', name: 'アイテム表示', placeholder: 'minecraft:diamond_sword' },
];

// ターゲットセレクター
export const SELECTORS = [
  { id: '@p', name: '@p', desc: '最も近いプレイヤー' },
  { id: '@a', name: '@a', desc: '全プレイヤー' },
  { id: '@r', name: '@r', desc: 'ランダムなプレイヤー' },
  { id: '@e', name: '@e', desc: '全エンティティ' },
  { id: '@s', name: '@s', desc: 'コマンド実行者' },
];

// 出力形式
export const OUTPUT_FORMATS = [
  { id: 'tellraw', name: '/tellraw', template: '/tellraw {selector} {json}' },
  { id: 'title', name: '/title (title)', template: '/title {selector} title {json}' },
  { id: 'subtitle', name: '/title (subtitle)', template: '/title {selector} subtitle {json}' },
  { id: 'actionbar', name: '/title (actionbar)', template: '/title {selector} actionbar {json}' },
  { id: 'raw', name: 'Raw JSON', template: '{json}' },
];

/**
 * テキストセグメントのデフォルト値
 */
export function createDefaultSegment() {
  return {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    type: 'text', // 'text' or 'selector'
    text: '',
    selector: '@p',
    color: '',
    bold: false,
    italic: false,
    underlined: false,
    strikethrough: false,
    obfuscated: false,
    clickAction: '',
    clickValue: '',
    hoverAction: '',
    hoverValue: '',
  };
}

/**
 * セグメントをJSON Text Componentに変換（バージョン対応）
 * @param {Object} segment - テキストセグメント
 * @param {string} version - Minecraftバージョン（デフォルト: 1.21）
 */
export function segmentToComponent(segment, version = '1.21') {
  const component = {};
  const useSnakeCase = compareVersions(version, '1.21') >= 0;

  // テキストまたはセレクター
  if (segment.type === 'selector') {
    component.selector = segment.selector;
  } else {
    component.text = segment.text;
  }

  // 色
  if (segment.color) {
    component.color = segment.color;
  }

  // スタイル
  if (segment.bold) component.bold = true;
  if (segment.italic) component.italic = true;
  if (segment.underlined) component.underlined = true;
  if (segment.strikethrough) component.strikethrough = true;
  if (segment.obfuscated) component.obfuscated = true;

  // クリックイベント（1.21+: snake_case, それ以前: camelCase）
  if (segment.clickAction && segment.clickValue) {
    const eventKey = useSnakeCase ? 'click_event' : 'clickEvent';

    if (useSnakeCase) {
      // 1.21+ の新形式
      const event = { action: segment.clickAction };
      switch (segment.clickAction) {
        case 'open_url':
          event.url = segment.clickValue;
          break;
        case 'run_command':
          // 1.21+ではスラッシュを除去
          event.command = segment.clickValue.startsWith('/')
            ? segment.clickValue.slice(1)
            : segment.clickValue;
          break;
        case 'suggest_command':
          event.command = segment.clickValue;
          break;
        case 'copy_to_clipboard':
          event.contents = segment.clickValue;
          break;
        default:
          event.value = segment.clickValue;
      }
      component[eventKey] = event;
    } else {
      // 旧形式
      component[eventKey] = {
        action: segment.clickAction,
        value: segment.clickValue,
      };
    }
  }

  // ホバーイベント（1.21+: snake_case, それ以前: camelCase）
  if (segment.hoverAction && segment.hoverValue) {
    const eventKey = useSnakeCase ? 'hover_event' : 'hoverEvent';

    if (segment.hoverAction === 'show_text') {
      component[eventKey] = {
        action: 'show_text',
        contents: segment.hoverValue,
      };
    } else if (segment.hoverAction === 'show_item') {
      component[eventKey] = {
        action: 'show_item',
        contents: {
          id: segment.hoverValue,
        },
      };
    }
  }

  return component;
}

/**
 * 複数セグメントをJSON Text配列に変換（バージョン対応）
 * @param {Array} segments - テキストセグメント配列
 * @param {string} version - Minecraftバージョン（デフォルト: 1.21）
 */
export function segmentsToJson(segments, version = '1.21') {
  const validSegments = segments.filter(s =>
    (s.type === 'text' && s.text) || s.type === 'selector'
  );

  if (validSegments.length === 0) {
    return '""';
  }

  const components = validSegments.map(s => segmentToComponent(s, version));
  const useSnakeCase = compareVersions(version, '1.21') >= 0;

  // 単一コンポーネントでシンプルな場合
  if (components.length === 1) {
    const c = components[0];
    const clickKey = useSnakeCase ? 'click_event' : 'clickEvent';
    const hoverKey = useSnakeCase ? 'hover_event' : 'hoverEvent';
    const hasExtras = c.color || c.bold || c.italic || c.underlined ||
                      c.strikethrough || c.obfuscated || c[clickKey] || c[hoverKey];

    // プレーンテキストのみ
    if (!hasExtras && c.text !== undefined) {
      return JSON.stringify(c.text);
    }

    return JSON.stringify(c);
  }

  // 複数コンポーネントは配列形式
  return JSON.stringify(components);
}

/**
 * コマンドを生成（バージョン対応）
 * @param {Array} segments - テキストセグメント配列
 * @param {string} format - 出力形式（tellraw, title等）
 * @param {string} selector - ターゲットセレクター
 * @param {string} version - Minecraftバージョン（デフォルト: 1.21）
 */
export function generateCommand(segments, format, selector, version = '1.21') {
  const json = segmentsToJson(segments, version);
  const formatInfo = OUTPUT_FORMATS.find(f => f.id === format) || OUTPUT_FORMATS[0];

  return formatInfo.template
    .replace('{selector}', selector)
    .replace('{json}', json);
}

/**
 * 色IDからHEXを取得
 */
export function getColorHex(colorId) {
  const color = MC_COLORS.find(c => c.id === colorId);
  return color ? color.hex : '#FFFFFF';
}

export default {
  MC_COLORS,
  CLICK_ACTIONS,
  HOVER_ACTIONS,
  SELECTORS,
  OUTPUT_FORMATS,
  createDefaultSegment,
  segmentToComponent,
  segmentsToJson,
  generateCommand,
  getColorHex,
};
