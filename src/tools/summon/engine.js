/**
 * Summon Generator - Engine
 * コマンド生成ロジック
 */

/**
 * /summon コマンドを生成
 * 1.21+ NBT: エンティティタグはPascalCase, アイテムデータはsnake_case
 * @param {Object} state - フォーム状態
 * @returns {string} - 生成されたコマンド
 */
export function generateSummonCommand(state) {
  const {
    entity,
    pos,
    customName,
    noAI,
    silent,
    invulnerable,
    persistenceRequired,
    effects,
    rawNBT,
  } = state;

  // エンティティID
  const entityId = entity.includes(':') ? entity : `minecraft:${entity}`;

  // NBTタグを構築（1.21+ エンティティタグはPascalCase）
  const nbtParts = [];

  // カスタム名（JSON text componentを直接使用可能にする）
  if (customName) {
    // JSONかどうかを判定（{で始まる場合はJSON text component）
    if (customName.trim().startsWith('{')) {
      // JSON text componentとしてそのまま使用
      nbtParts.push(`CustomName:'${customName}'`);
    } else {
      // 単純なテキストの場合はJSON形式に変換
      const escapedName = escapeJsonString(customName);
      nbtParts.push(`CustomName:'{"text":"${escapedName}"}'`);
    }
  }

  // オプション（1.21+ エンティティタグはPascalCase）
  if (noAI) nbtParts.push('NoAI:1b');
  if (silent) nbtParts.push('Silent:1b');
  if (invulnerable) nbtParts.push('Invulnerable:1b');
  if (persistenceRequired) nbtParts.push('PersistenceRequired:1b');

  // エフェクト（1.20.5+ active_effects snake_case形式）
  if (effects.length > 0) {
    const effectsNBT = effects.map(e => {
      return `{id:"minecraft:${e.id}",amplifier:${e.amplifier}b,duration:${e.duration}}`;
    }).join(',');
    nbtParts.push(`active_effects:[${effectsNBT}]`);
  }

  // Raw NBT
  if (rawNBT.trim()) {
    nbtParts.push(rawNBT.trim());
  }

  // コマンド構築
  let command = `/summon ${entityId} ${pos}`;

  // NBTがある場合
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
    .replace(/'/g, "\\'");
}

/**
 * コマンドを検証
 */
export function validateSummonCommand(command) {
  const errors = [];

  if (!command.startsWith('/summon ')) {
    errors.push('コマンドは /summon で始まる必要があります');
  }

  // 波括弧のバランスチェック
  let braceCount = 0;
  for (const char of command) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  if (braceCount !== 0) {
    errors.push('波括弧 { } のバランスが取れていません');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default { generateSummonCommand, validateSummonCommand };
