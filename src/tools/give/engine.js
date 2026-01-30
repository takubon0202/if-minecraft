/**
 * Give Generator - Engine
 * コマンド生成ロジック
 */

/**
 * /give コマンドを生成
 * @param {Object} state - フォーム状態
 * @returns {string} - 生成されたコマンド
 */
export function generateGiveCommand(state) {
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

  // アイテムID（minecraft:プレフィックスを正規化）
  const itemId = item.includes(':') ? item : `minecraft:${item}`;

  // コンポーネントを構築（1.21.5+ Data Components形式）
  const components = [];

  // カスタム名（JSONテキスト形式）
  if (customName) {
    const escapedName = escapeJsonString(customName);
    components.push(`custom_name='{"text":"${escapedName}","italic":false}'`);
  }

  // 説明文（Lore）- JSONテキストのリスト形式
  if (lore) {
    const loreLines = lore.split('\n').filter(l => l.trim());
    if (loreLines.length > 0) {
      const loreJson = loreLines.map(line => `'{"text":"${escapeJsonString(line)}"}'`).join(',');
      components.push(`lore=[${loreJson}]`);
    }
  }

  // 耐久無限
  if (unbreakable) {
    components.push('unbreakable={}');
  }

  // エンチャント
  if (enchantments.length > 0) {
    const enchantLevels = enchantments.map(e => `"minecraft:${e.id}":${e.level}`).join(',');
    components.push(`enchantments={levels:{${enchantLevels}}}`);
  }

  // Raw Components
  if (rawComponents.trim()) {
    components.push(rawComponents.trim());
  }

  // コマンド構築
  let command = `/give ${target} ${itemId}`;

  // コンポーネントがある場合
  if (components.length > 0) {
    command += `[${components.join(',')}]`;
  }

  // 個数（1以外の場合のみ）
  if (count !== 1) {
    command += ` ${count}`;
  }

  return command;
}

/**
 * JSON文字列をエスケープ
 * @param {string} str - エスケープする文字列
 * @returns {string}
 */
function escapeJsonString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

/**
 * コマンドを検証
 * @param {string} command - 検証するコマンド
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateGiveCommand(command) {
  const errors = [];

  // 基本的な構文チェック
  if (!command.startsWith('/give ')) {
    errors.push('コマンドは /give で始まる必要があります');
  }

  // ターゲットチェック
  const targetMatch = command.match(/\/give\s+(@[psar]|[\w]+)/);
  if (!targetMatch) {
    errors.push('有効なターゲットが指定されていません');
  }

  // アイテムIDチェック
  const itemMatch = command.match(/\/give\s+\S+\s+([\w:]+)/);
  if (!itemMatch) {
    errors.push('アイテムIDが指定されていません');
  }

  // ブラケットのバランスチェック
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

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default { generateGiveCommand, validateGiveCommand };
