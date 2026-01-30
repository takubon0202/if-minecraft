/**
 * Summon Generator - Engine
 * コマンド生成ロジック
 */

/**
 * /summon コマンドを生成
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

  // NBTタグを構築（1.21.5+ スネークケース形式）
  const nbtParts = [];

  // カスタム名
  if (customName) {
    const escapedName = escapeJsonString(customName);
    nbtParts.push(`custom_name:'{"text":"${escapedName}"}'`);
  }

  // オプション（1.21.5+ はスネークケース）
  if (noAI) nbtParts.push('no_ai:true');
  if (silent) nbtParts.push('silent:true');
  if (invulnerable) nbtParts.push('invulnerable:true');
  if (persistenceRequired) nbtParts.push('persistence_required:true');

  // エフェクト
  if (effects.length > 0) {
    const effectsNBT = effects.map(e => {
      return `{id:"minecraft:${e.id}",amplifier:${e.amplifier},duration:${e.duration}}`;
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
