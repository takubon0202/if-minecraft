#!/usr/bin/env node
/**
 * Minecraft Data Validation Script
 * データの整合性と完全性をチェック
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'minecraft.json');

// 検証ルール（フォールバックデータでも通過できる基準）
const VALIDATION_RULES = {
  items: {
    minCount: 30,  // フォールバック対応
    pattern: /^minecraft:[a-z_]+$/,
    required: [
      'minecraft:diamond_sword',
      'minecraft:stone',
      'minecraft:dirt',
    ],
  },
  entities: {
    minCount: 30,
    pattern: /^minecraft:[a-z_]+$/,
    required: [
      'minecraft:zombie',
      'minecraft:skeleton',
      'minecraft:creeper',
    ],
  },
  blocks: {
    minCount: 30,  // フォールバック対応
    pattern: /^minecraft:[a-z_]+$/,
    required: [
      'minecraft:stone',
      'minecraft:grass_block',
      'minecraft:dirt',
    ],
  },
  enchantments: {
    minCount: 10,
    requiredFields: ['id', 'name', 'maxLevel'],
  },
  effects: {
    minCount: 20,
    requiredFields: ['id', 'name', 'type'],
  },
};

/**
 * 配列データを検証
 */
function validateArray(data, key, rules) {
  const errors = [];
  const warnings = [];
  const arr = data[key];

  if (!Array.isArray(arr)) {
    errors.push(`${key} is not an array`);
    return { errors, warnings };
  }

  // 最小数チェック
  if (rules.minCount && arr.length < rules.minCount) {
    warnings.push(`${key}: Expected at least ${rules.minCount} items, got ${arr.length}`);
  }

  // パターンチェック（文字列配列の場合）
  if (rules.pattern && typeof arr[0] === 'string') {
    const invalid = arr.filter(item => !rules.pattern.test(item));
    if (invalid.length > 0) {
      errors.push(`${key}: Invalid format: ${invalid.slice(0, 3).join(', ')}...`);
    }
  }

  // 必須項目チェック
  if (rules.required) {
    const missing = rules.required.filter(item => !arr.includes(item));
    if (missing.length > 0) {
      errors.push(`${key}: Missing required items: ${missing.join(', ')}`);
    }
  }

  // オブジェクト配列のフィールドチェック
  if (rules.requiredFields && typeof arr[0] === 'object') {
    arr.forEach((item, index) => {
      rules.requiredFields.forEach(field => {
        if (item[field] === undefined) {
          errors.push(`${key}[${index}]: Missing required field '${field}'`);
        }
      });
    });
  }

  // 重複チェック
  const ids = arr.map(item => typeof item === 'string' ? item : item.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    warnings.push(`${key}: Found duplicates: ${[...new Set(duplicates)].join(', ')}`);
  }

  return { errors, warnings };
}

/**
 * バージョン情報を検証
 */
function validateVersion(data) {
  const errors = [];
  const warnings = [];

  if (!data.version) {
    errors.push('Missing version field');
  } else if (!/^1\.\d+(\.\d+)?$/.test(data.version)) {
    errors.push(`Invalid version format: ${data.version}`);
  }

  if (!data.updatedAt) {
    warnings.push('Missing updatedAt field');
  } else {
    const updatedDate = new Date(data.updatedAt);
    const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 30) {
      warnings.push(`Data is ${Math.floor(daysSinceUpdate)} days old, consider updating`);
    }
  }

  return { errors, warnings };
}

/**
 * メイン処理
 */
async function main() {
  console.log('\n🔍 Validating Minecraft Data\n');

  let data;
  try {
    const content = await fs.readFile(DATA_PATH, 'utf-8');
    data = JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Data file not found. Run "npm run mc:data:update" first.\n');
    } else {
      console.error(`❌ Failed to read data file: ${error.message}\n`);
    }
    process.exit(1);
  }

  const allErrors = [];
  const allWarnings = [];

  // バージョン検証
  const versionResult = validateVersion(data);
  allErrors.push(...versionResult.errors);
  allWarnings.push(...versionResult.warnings);

  // 各データカテゴリを検証
  for (const [key, rules] of Object.entries(VALIDATION_RULES)) {
    const result = validateArray(data, key, rules);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  // 結果表示
  console.log('📋 Validation Results:\n');
  console.log(`   Version: ${data.version || 'unknown'}`);
  console.log(`   Updated: ${data.updatedAt || 'unknown'}`);
  console.log('');
  console.log('   Data counts:');
  console.log(`   - Items: ${data.items?.length || 0}`);
  console.log(`   - Entities: ${data.entities?.length || 0}`);
  console.log(`   - Blocks: ${data.blocks?.length || 0}`);
  console.log(`   - Enchantments: ${data.enchantments?.length || 0}`);
  console.log(`   - Effects: ${data.effects?.length || 0}`);
  console.log('');

  if (allWarnings.length > 0) {
    console.log('⚠️  Warnings:');
    allWarnings.forEach(w => console.log(`   - ${w}`));
    console.log('');
  }

  if (allErrors.length > 0) {
    console.log('❌ Errors:');
    allErrors.forEach(e => console.log(`   - ${e}`));
    console.log('');
    process.exit(1);
  }

  console.log('✅ All validations passed!\n');
}

main();
