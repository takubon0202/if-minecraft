#!/usr/bin/env node
/**
 * Minecraft Data Update Script
 * Minecraft 26.1 のデータを取得・更新（データソース: PrismarineJS 1.21）
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// Minecraft バージョン（表示用）
const MC_VERSION = '26.1';
// mcdata のデータソースバージョン（PrismarineJS が 26.x 未対応の間は 1.21 を使用）
const MC_DATA_SOURCE_VERSION = '1.21';

// データソース（公式マニフェストまたはコミュニティAPI）
const SOURCES = {
  versionManifest: 'https://launchermeta.mojang.com/mc/game/version_manifest_v2.json',
  // mcdata は GitHub raw を使用
  mcdataBase: 'https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/pc',
};

/**
 * JSONを取得
 */
async function fetchJson(url) {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.json();
}

/**
 * バージョンマニフェストから対象バージョンのURLを取得
 */
async function getVersionUrl(targetVersion) {
  const manifest = await fetchJson(SOURCES.versionManifest);
  const version = manifest.versions.find(v => v.id === targetVersion);
  if (!version) {
    // 近いバージョンを探す（26.x 系 → 1.21 系の順）
    const similar = manifest.versions.find(v => v.id.startsWith('26.')) || manifest.versions.find(v => v.id.startsWith('1.21'));
    if (similar) {
      console.warn(`Version ${targetVersion} not found, using ${similar.id}`);
      return similar.url;
    }
    throw new Error(`Version ${targetVersion} not found`);
  }
  return version.url;
}

/**
 * mcdata からアイテム一覧を取得
 */
async function getItems() {
  try {
    // 1.21 のデータを使用
    const url = `${SOURCES.mcdataBase}/${MC_DATA_SOURCE_VERSION}/items.json`;
    const items = await fetchJson(url);
    return items.map(item => `minecraft:${item.name}`);
  } catch (e) {
    console.warn('Failed to fetch from mcdata, using fallback');
    return getFallbackItems();
  }
}

/**
 * mcdata からエンティティ一覧を取得
 */
async function getEntities() {
  try {
    const url = `${SOURCES.mcdataBase}/${MC_DATA_SOURCE_VERSION}/entities.json`;
    const entities = await fetchJson(url);
    return entities.map(entity => `minecraft:${entity.name}`);
  } catch (e) {
    console.warn('Failed to fetch entities from mcdata, using fallback');
    return getFallbackEntities();
  }
}

/**
 * mcdata からブロック一覧を取得
 */
async function getBlocks() {
  try {
    const url = `${SOURCES.mcdataBase}/${MC_DATA_SOURCE_VERSION}/blocks.json`;
    const blocks = await fetchJson(url);
    return blocks.map(block => `minecraft:${block.name}`);
  } catch (e) {
    console.warn('Failed to fetch blocks from mcdata, using fallback');
    return getFallbackBlocks();
  }
}

/**
 * mcdata からエンチャント一覧を取得
 */
async function getEnchantments() {
  try {
    const url = `${SOURCES.mcdataBase}/${MC_DATA_SOURCE_VERSION}/enchantments.json`;
    const enchants = await fetchJson(url);
    return enchants.map(ench => ({
      id: `minecraft:${ench.name}`,
      name: ench.displayName || ench.name,
      maxLevel: ench.maxLevel || 5,
      category: ench.category || 'unknown',
    }));
  } catch (e) {
    console.warn('Failed to fetch enchantments from mcdata, using fallback');
    return getFallbackEnchantments();
  }
}

/**
 * mcdata からエフェクト一覧を取得
 */
async function getEffects() {
  try {
    const url = `${SOURCES.mcdataBase}/${MC_DATA_SOURCE_VERSION}/effects.json`;
    const effects = await fetchJson(url);
    return effects.map(effect => ({
      id: `minecraft:${effect.name}`,
      name: effect.displayName || effect.name,
      type: effect.type || 'neutral',
    }));
  } catch (e) {
    console.warn('Failed to fetch effects from mcdata, using fallback');
    return getFallbackEffects();
  }
}

// フォールバックデータ（オフライン時やAPI障害時）
function getFallbackItems() {
  return [
    // 基本ブロック（アイテムとしても存在）
    'minecraft:stone', 'minecraft:dirt', 'minecraft:grass_block', 'minecraft:cobblestone',
    'minecraft:oak_planks', 'minecraft:oak_log', 'minecraft:sand', 'minecraft:gravel',
    // ツール・武器
    'minecraft:diamond_sword', 'minecraft:diamond_pickaxe', 'minecraft:diamond_axe',
    'minecraft:diamond_shovel', 'minecraft:diamond_hoe', 'minecraft:netherite_sword',
    'minecraft:netherite_pickaxe', 'minecraft:bow', 'minecraft:crossbow',
    'minecraft:trident', 'minecraft:shield', 'minecraft:diamond_helmet',
    'minecraft:diamond_chestplate', 'minecraft:diamond_leggings', 'minecraft:diamond_boots',
    'minecraft:elytra', 'minecraft:totem_of_undying', 'minecraft:golden_apple',
    'minecraft:enchanted_golden_apple', 'minecraft:ender_pearl', 'minecraft:fire_charge',
    'minecraft:firework_rocket', 'minecraft:potion', 'minecraft:splash_potion',
    'minecraft:lingering_potion', 'minecraft:experience_bottle', 'minecraft:written_book',
    'minecraft:map', 'minecraft:compass', 'minecraft:clock', 'minecraft:name_tag',
    'minecraft:golden_dandelion',
  ];
}

function getFallbackEntities() {
  return [
    'minecraft:zombie', 'minecraft:skeleton', 'minecraft:creeper', 'minecraft:spider',
    'minecraft:enderman', 'minecraft:blaze', 'minecraft:ghast', 'minecraft:wither_skeleton',
    'minecraft:witch', 'minecraft:slime', 'minecraft:magma_cube', 'minecraft:phantom',
    'minecraft:drowned', 'minecraft:husk', 'minecraft:stray', 'minecraft:pillager',
    'minecraft:vindicator', 'minecraft:evoker', 'minecraft:ravager', 'minecraft:vex',
    'minecraft:warden', 'minecraft:breeze', 'minecraft:pig', 'minecraft:cow',
    'minecraft:sheep', 'minecraft:chicken', 'minecraft:wolf', 'minecraft:cat',
    'minecraft:horse', 'minecraft:villager', 'minecraft:iron_golem', 'minecraft:snow_golem',
    'minecraft:ender_dragon', 'minecraft:wither', 'minecraft:elder_guardian',
    'minecraft:armor_stand', 'minecraft:item', 'minecraft:experience_orb',
    'minecraft:falling_block', 'minecraft:tnt', 'minecraft:arrow', 'minecraft:fireball',
  ];
}

function getFallbackBlocks() {
  return [
    'minecraft:stone', 'minecraft:granite', 'minecraft:diorite', 'minecraft:andesite',
    'minecraft:grass_block', 'minecraft:dirt', 'minecraft:cobblestone', 'minecraft:oak_planks',
    'minecraft:oak_log', 'minecraft:glass', 'minecraft:diamond_ore', 'minecraft:diamond_block',
    'minecraft:gold_ore', 'minecraft:gold_block', 'minecraft:iron_ore', 'minecraft:iron_block',
    'minecraft:coal_ore', 'minecraft:coal_block', 'minecraft:obsidian', 'minecraft:bedrock',
    'minecraft:water', 'minecraft:lava', 'minecraft:sand', 'minecraft:gravel',
    'minecraft:oak_leaves', 'minecraft:torch', 'minecraft:chest', 'minecraft:crafting_table',
    'minecraft:furnace', 'minecraft:enchanting_table', 'minecraft:anvil', 'minecraft:beacon',
    'minecraft:command_block', 'minecraft:structure_block', 'minecraft:barrier',
  ];
}

function getFallbackEnchantments() {
  return [
    { id: 'minecraft:sharpness', name: 'ダメージ増加', maxLevel: 5, category: 'weapon' },
    { id: 'minecraft:smite', name: 'アンデッド特効', maxLevel: 5, category: 'weapon' },
    { id: 'minecraft:bane_of_arthropods', name: '虫特効', maxLevel: 5, category: 'weapon' },
    { id: 'minecraft:knockback', name: 'ノックバック', maxLevel: 2, category: 'weapon' },
    { id: 'minecraft:fire_aspect', name: '火属性', maxLevel: 2, category: 'weapon' },
    { id: 'minecraft:looting', name: 'ドロップ増加', maxLevel: 3, category: 'weapon' },
    { id: 'minecraft:sweeping_edge', name: '範囲ダメージ増加', maxLevel: 3, category: 'weapon' },
    { id: 'minecraft:efficiency', name: '効率強化', maxLevel: 5, category: 'tool' },
    { id: 'minecraft:silk_touch', name: 'シルクタッチ', maxLevel: 1, category: 'tool' },
    { id: 'minecraft:fortune', name: '幸運', maxLevel: 3, category: 'tool' },
    { id: 'minecraft:unbreaking', name: '耐久力', maxLevel: 3, category: 'all' },
    { id: 'minecraft:mending', name: '修繕', maxLevel: 1, category: 'all' },
    { id: 'minecraft:protection', name: 'ダメージ軽減', maxLevel: 4, category: 'armor' },
    { id: 'minecraft:fire_protection', name: '火炎耐性', maxLevel: 4, category: 'armor' },
    { id: 'minecraft:blast_protection', name: '爆発耐性', maxLevel: 4, category: 'armor' },
    { id: 'minecraft:projectile_protection', name: '飛び道具耐性', maxLevel: 4, category: 'armor' },
    { id: 'minecraft:feather_falling', name: '落下耐性', maxLevel: 4, category: 'boots' },
    { id: 'minecraft:power', name: '射撃ダメージ増加', maxLevel: 5, category: 'bow' },
    { id: 'minecraft:infinity', name: '無限', maxLevel: 1, category: 'bow' },
  ];
}

function getFallbackEffects() {
  return [
    { id: 'minecraft:speed', name: '移動速度上昇', type: 'beneficial' },
    { id: 'minecraft:slowness', name: '移動速度低下', type: 'harmful' },
    { id: 'minecraft:haste', name: '採掘速度上昇', type: 'beneficial' },
    { id: 'minecraft:mining_fatigue', name: '採掘速度低下', type: 'harmful' },
    { id: 'minecraft:strength', name: '攻撃力上昇', type: 'beneficial' },
    { id: 'minecraft:instant_health', name: '即時回復', type: 'beneficial' },
    { id: 'minecraft:instant_damage', name: '即時ダメージ', type: 'harmful' },
    { id: 'minecraft:jump_boost', name: '跳躍力上昇', type: 'beneficial' },
    { id: 'minecraft:nausea', name: '吐き気', type: 'harmful' },
    { id: 'minecraft:regeneration', name: '再生', type: 'beneficial' },
    { id: 'minecraft:resistance', name: '耐性', type: 'beneficial' },
    { id: 'minecraft:fire_resistance', name: '火炎耐性', type: 'beneficial' },
    { id: 'minecraft:water_breathing', name: '水中呼吸', type: 'beneficial' },
    { id: 'minecraft:invisibility', name: '透明化', type: 'beneficial' },
    { id: 'minecraft:blindness', name: '盲目', type: 'harmful' },
    { id: 'minecraft:night_vision', name: '暗視', type: 'beneficial' },
    { id: 'minecraft:hunger', name: '空腹', type: 'harmful' },
    { id: 'minecraft:weakness', name: '弱体化', type: 'harmful' },
    { id: 'minecraft:poison', name: '毒', type: 'harmful' },
    { id: 'minecraft:wither', name: 'ウィザー', type: 'harmful' },
    { id: 'minecraft:health_boost', name: '体力増強', type: 'beneficial' },
    { id: 'minecraft:absorption', name: '衝撃吸収', type: 'beneficial' },
    { id: 'minecraft:saturation', name: '満腹度回復', type: 'beneficial' },
    { id: 'minecraft:glowing', name: '発光', type: 'neutral' },
    { id: 'minecraft:levitation', name: '浮遊', type: 'harmful' },
    { id: 'minecraft:luck', name: '幸運', type: 'beneficial' },
    { id: 'minecraft:unluck', name: '不運', type: 'harmful' },
    { id: 'minecraft:slow_falling', name: '低速落下', type: 'beneficial' },
    { id: 'minecraft:conduit_power', name: 'コンジットパワー', type: 'beneficial' },
    { id: 'minecraft:dolphins_grace', name: 'イルカの好意', type: 'beneficial' },
    { id: 'minecraft:bad_omen', name: '不吉な予感', type: 'harmful' },
    { id: 'minecraft:hero_of_the_village', name: '村の英雄', type: 'beneficial' },
    { id: 'minecraft:darkness', name: '暗闇', type: 'harmful' },
  ];
}

/**
 * メイン処理
 */
async function main() {
  console.log(`\n📦 Minecraft ${MC_VERSION} Data Update\n`);

  // データディレクトリを作成
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    // 並列でデータ取得
    const [items, entities, blocks, enchantments, effects] = await Promise.all([
      getItems(),
      getEntities(),
      getBlocks(),
      getEnchantments(),
      getEffects(),
    ]);

    // データオブジェクトを構築
    const data = {
      version: MC_VERSION,
      updatedAt: new Date().toISOString(),
      items,
      entities,
      blocks,
      enchantments,
      effects,
    };

    // JSON ファイルに保存
    const outputPath = path.join(DATA_DIR, 'minecraft.json');
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log('\n✅ Data update completed!');
    console.log(`   Items: ${items.length}`);
    console.log(`   Entities: ${entities.length}`);
    console.log(`   Blocks: ${blocks.length}`);
    console.log(`   Enchantments: ${enchantments.length}`);
    console.log(`   Effects: ${effects.length}`);
    console.log(`\n   Output: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Error updating data:', error.message);
    process.exit(1);
  }
}

main();
