/**
 * Minecraft Wiki画像URL生成 - 共通モジュール
 * 全ツールで統一された画像URLを生成
 */

const WIKI_BASE = 'https://minecraft.wiki/images';

/**
 * アイテムID → Wiki画像ファイル名（拡張子含む）のマッピング
 * GIF形式やPNG形式で名前が異なる場合に使用
 */
const ITEM_FILE_MAP = {
  // === コマンドブロック系（GIF形式 - アニメーション対応） ===
  'command_block': 'Command_Block.gif',
  'chain_command_block': 'Chain_Command_Block.gif',
  'repeating_command_block': 'Repeating_Command_Block.gif',
  // === 構造ブロック系 ===
  'structure_block': 'Structure_Block.png',
  'jigsaw': 'Jigsaw_Block.png',
  // === 本・エンチャント系（GIF形式） ===
  'enchanted_book': 'Enchanted_Book.gif',
  'written_book': 'Written_Book.gif',
  'compass': 'Compass.gif',
  'clock': 'Clock.gif',
  // === 経験値の瓶（GIF形式） ===
  'experience_bottle': 'Bottle_o%27_Enchanting.gif',
  // === ネザースター（GIF形式 - アニメーション対応） ===
  'nether_star': 'Nether_Star.gif',
  // === ポーション系 - ITEM_NAME_MAPで個別に定義（GIF形式は使用しない） ===
  // 注意: Wikiではポーションは効果ごとに異なる画像があるため、
  // 基本アイテム（Water_Bottle等）はITEM_NAME_MAPで定義
};

/**
 * Inviconが存在しないエンティティ用のEntitySprite画像マッピング
 * EntitySprite_形式のURLを返す
 */
const ENTITY_SPRITE_MAP = {
  'experience_orb': 'experience-orb',
  'lightning_bolt': 'lightning',
  'falling_block': 'falling-block',
};

/**
 * アイテムID → Wiki画像名のマッピング
 * Wiki上の名前がアイテムIDと異なる場合に使用
 */
const ITEM_NAME_MAP = {
  // === 革防具（Leather → 特殊名称） ===
  'leather_helmet': 'Leather_Cap',
  'leather_chestplate': 'Leather_Tunic',
  'leather_leggings': 'Leather_Pants',
  'leather_boots': 'Leather_Boots',

  // === カメの甲羅 ===
  'turtle_helmet': 'Turtle_Shell',

  // === 頭 ===
  'player_head': 'Steve%27s_Head',
  'zombie_head': 'Zombie_Head',
  'skeleton_skull': 'Skeleton_Skull',
  'wither_skeleton_skull': 'Wither_Skeleton_Skull',
  'creeper_head': 'Creeper_Head',
  'piglin_head': 'Piglin_Head',
  'dragon_head': 'Dragon_Head',

  // === 特殊アイテム ===
  'redstone': 'Redstone',  // "Redstone"（Redstone_Dustではない）
  'glowstone_dust': 'Glowstone_Dust',
  'blaze_powder': 'Blaze_Powder',
  'fire_charge': 'Fire_Charge',
  'ender_pearl': 'Ender_Pearl',
  'ender_eye': 'Eye_of_Ender',
  'enchanted_book': 'Enchanted_Book',
  'written_book': 'Written_Book',
  'writable_book': 'Book_and_Quill',
  'map': 'Empty_Map',
  'filled_map': 'Map',

  // === 弓・クロスボウ ===
  'bow': 'Bow',
  'crossbow': 'Crossbow',

  // === その他の武器・ツール ===
  'trident': 'Trident',
  'fishing_rod': 'Fishing_Rod',
  'mace': 'Mace',
  'shield': 'Shield',
  'shears': 'Shears',
  'flint_and_steel': 'Flint_and_Steel',
  'brush': 'Brush',
  'carrot_on_a_stick': 'Carrot_on_a_Stick',
  'warped_fungus_on_a_stick': 'Warped_Fungus_on_a_Stick',

  // === ポーション（効果なし/汎用） ===
  'potion': 'Water_Bottle',
  'splash_potion': 'Splash_Water_Bottle',
  'lingering_potion': 'Lingering_Water_Bottle',
  'tipped_arrow': 'Tipped_Arrow',

  // === 効果付きポーション（代表例） ===
  'potion_healing': 'Potion_of_Healing',
  'splash_potion_healing': 'Splash_Potion_of_Healing',
  'lingering_potion_healing': 'Lingering_Potion_of_Healing',

  // === 食料 ===
  'cooked_beef': 'Steak',
  'cooked_porkchop': 'Cooked_Porkchop',
  'cooked_mutton': 'Cooked_Mutton',
  'cooked_chicken': 'Cooked_Chicken',
  'cooked_rabbit': 'Cooked_Rabbit',
  'cooked_cod': 'Cooked_Cod',
  'cooked_salmon': 'Cooked_Salmon',
  'baked_potato': 'Baked_Potato',
  'golden_apple': 'Golden_Apple',
  'enchanted_golden_apple': 'Enchanted_Golden_Apple',

  // === 鍛冶型テンプレート ===
  'netherite_upgrade_smithing_template': 'Netherite_Upgrade',
  'coast_armor_trim_smithing_template': 'Coast_Armor_Trim',
  'dune_armor_trim_smithing_template': 'Dune_Armor_Trim',
  'eye_armor_trim_smithing_template': 'Eye_Armor_Trim',
  'host_armor_trim_smithing_template': 'Host_Armor_Trim',
  'raiser_armor_trim_smithing_template': 'Raiser_Armor_Trim',
  'rib_armor_trim_smithing_template': 'Rib_Armor_Trim',
  'sentry_armor_trim_smithing_template': 'Sentry_Armor_Trim',
  'shaper_armor_trim_smithing_template': 'Shaper_Armor_Trim',
  'silence_armor_trim_smithing_template': 'Silence_Armor_Trim',
  'snout_armor_trim_smithing_template': 'Snout_Armor_Trim',
  'spire_armor_trim_smithing_template': 'Spire_Armor_Trim',
  'tide_armor_trim_smithing_template': 'Tide_Armor_Trim',
  'vex_armor_trim_smithing_template': 'Vex_Armor_Trim',
  'ward_armor_trim_smithing_template': 'Ward_Armor_Trim',
  'wayfinder_armor_trim_smithing_template': 'Wayfinder_Armor_Trim',
  'wild_armor_trim_smithing_template': 'Wild_Armor_Trim',
  'flow_armor_trim_smithing_template': 'Flow_Armor_Trim',
  'bolt_armor_trim_smithing_template': 'Bolt_Armor_Trim',

  // === 素材 ===
  'amethyst_shard': 'Amethyst_Shard',
  'copper_ingot': 'Copper_Ingot',
  'iron_ingot': 'Iron_Ingot',
  'gold_ingot': 'Gold_Ingot',
  'netherite_ingot': 'Netherite_Ingot',
  'diamond': 'Diamond',
  'emerald': 'Emerald',
  'lapis_lazuli': 'Lapis_Lazuli',
  'quartz': 'Nether_Quartz',

  // === ブロック（特殊名称） ===
  'grass_block': 'Grass_Block',
  'dirt_path': 'Dirt_Path',
  'farmland': 'Farmland',
  'podzol': 'Podzol',
  'mycelium': 'Mycelium',
  'soul_sand': 'Soul_Sand',
  'soul_soil': 'Soul_Soil',
  'netherrack': 'Netherrack',
  'end_stone': 'End_Stone',
  'glowstone': 'Glowstone',
  'sea_lantern': 'Sea_Lantern',
  'shroomlight': 'Shroomlight',
  'crying_obsidian': 'Crying_Obsidian',
  'respawn_anchor': 'Respawn_Anchor',
  'lodestone': 'Lodestone',

  // === レッドストーン関連 ===
  'redstone_block': 'Block_of_Redstone',
  'redstone_lamp': 'Redstone_Lamp',
  'redstone_torch': 'Redstone_Torch',
  'repeater': 'Redstone_Repeater',
  'comparator': 'Redstone_Comparator',
  'observer': 'Observer',
  'piston': 'Piston',
  'sticky_piston': 'Sticky_Piston',
  'dispenser': 'Dispenser',
  'dropper': 'Dropper',
  'hopper': 'Hopper',
  'lever': 'Lever',
  'tripwire_hook': 'Tripwire_Hook',
  'daylight_detector': 'Daylight_Detector',
  'target': 'Target',
  'note_block': 'Note_Block',
  'jukebox': 'Jukebox',

  // === 機能ブロック ===
  'crafting_table': 'Crafting_Table',
  'furnace': 'Furnace',
  'blast_furnace': 'Blast_Furnace',
  'smoker': 'Smoker',
  'smithing_table': 'Smithing_Table',
  'fletching_table': 'Fletching_Table',
  'cartography_table': 'Cartography_Table',
  'loom': 'Loom',
  'stonecutter': 'Stonecutter',
  'grindstone': 'Grindstone',
  'anvil': 'Anvil',
  'enchanting_table': 'Enchanting_Table',
  'brewing_stand': 'Brewing_Stand',
  'cauldron': 'Cauldron',
  'beacon': 'Beacon',
  'conduit': 'Conduit',
  'end_portal_frame': 'End_Portal_Frame',
  'ender_chest': 'Ender_Chest',
  'shulker_box': 'Shulker_Box',
  'barrel': 'Barrel',
  'chest': 'Chest',
  'trapped_chest': 'Trapped_Chest',
  'lectern': 'Lectern',
  'composter': 'Composter',
  'bell': 'Bell',
  'campfire': 'Campfire',
  'soul_campfire': 'Soul_Campfire',
  'lantern': 'Lantern',
  'soul_lantern': 'Soul_Lantern',
  'torch': 'Torch',
  'soul_torch': 'Soul_Torch',

  // === モブ（エンティティ）===
  'zombie': 'Zombie',
  'zombie_villager': 'Zombie_Villager',
  'husk': 'Husk',
  'drowned': 'Drowned',
  'zombified_piglin': 'Zombified_Piglin',
  'skeleton': 'Skeleton',
  'wither_skeleton': 'Wither_Skeleton',
  'stray': 'Stray',
  'creeper': 'Creeper',
  'spider': 'Spider',
  'cave_spider': 'Cave_Spider',
  'enderman': 'Enderman',
  'slime': 'Slime',
  'magma_cube': 'Magma_Cube',
  'blaze': 'Blaze',
  'ghast': 'Ghast',
  'wither': 'Wither',
  'ender_dragon': 'Ender_Dragon',
  'piglin': 'Piglin',
  'piglin_brute': 'Piglin_Brute',
  'hoglin': 'Hoglin',
  'zoglin': 'Zoglin',
  'warden': 'Warden',
  'breeze': 'Breeze',
};

/**
 * エフェクトID → Wiki画像名のマッピング
 */
const EFFECT_NAME_MAP = {
  'speed': 'Speed',
  'slowness': 'Slowness',
  'haste': 'Haste',
  'mining_fatigue': 'Mining_Fatigue',
  'strength': 'Strength',
  'instant_health': 'Instant_Health',
  'instant_damage': 'Instant_Damage',
  'jump_boost': 'Jump_Boost',
  'nausea': 'Nausea',
  'regeneration': 'Regeneration',
  'resistance': 'Resistance',
  'fire_resistance': 'Fire_Resistance',
  'water_breathing': 'Water_Breathing',
  'invisibility': 'Invisibility',
  'blindness': 'Blindness',
  'night_vision': 'Night_Vision',
  'hunger': 'Hunger',
  'weakness': 'Weakness',
  'poison': 'Poison',
  'wither': 'Wither',
  'health_boost': 'Health_Boost',
  'absorption': 'Absorption',
  'saturation': 'Saturation',
  'glowing': 'Glowing',
  'levitation': 'Levitation',
  'luck': 'Luck',
  'unluck': 'Bad_Luck',
  'slow_falling': 'Slow_Falling',
  'conduit_power': 'Conduit_Power',
  'dolphins_grace': 'Dolphin%27s_Grace',
  'bad_omen': 'Bad_Omen',
  'hero_of_the_village': 'Hero_of_the_Village',
  'darkness': 'Darkness',
  'trial_omen': 'Trial_Omen',
  'raid_omen': 'Raid_Omen',
  'wind_charged': 'Wind_Charged',
  'weaving': 'Weaving',
  'oozing': 'Oozing',
  'infested': 'Infested',
};

/**
 * アイテムIDをPascalCase（アンダースコア区切り）に変換
 * @param {string} itemId
 * @returns {string}
 */
function toPascalCase(itemId) {
  return itemId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
}

/**
 * アイテムのInvicon画像URLを取得
 * @param {string} itemId - アイテムID (例: diamond_sword)
 * @returns {string} 画像URL
 */
export function getInviconUrl(itemId) {
  if (!itemId) return `${WIKI_BASE}/Invicon_Barrier.png`;

  // EntitySprite形式のエンティティを確認（Inviconが存在しないもの）
  const entitySprite = ENTITY_SPRITE_MAP[itemId];
  if (entitySprite) {
    return `${WIKI_BASE}/EntitySprite_${entitySprite}.png`;
  }

  // GIF形式などファイル名が特殊な場合を確認
  const fileMapping = ITEM_FILE_MAP[itemId];
  if (fileMapping) {
    return `${WIKI_BASE}/Invicon_${fileMapping}`;
  }

  // 名前マッピングを確認
  const mappedName = ITEM_NAME_MAP[itemId];
  if (mappedName) {
    return `${WIKI_BASE}/Invicon_${mappedName}.png`;
  }

  // 標準変換
  return `${WIKI_BASE}/Invicon_${toPascalCase(itemId)}.png`;
}

// エフェクトIDの特殊マッピング（Wiki上の名前が異なる場合）
const EFFECT_SPECIAL_MAP = {
  'poison': 'fatal-poison',
  'instant_damage': 'instant-damage',
  'instant_health': 'instant-health',
  'jump_boost': 'jump-boost',
  'mining_fatigue': 'mining-fatigue',
  'health_boost': 'health-boost',
  'water_breathing': 'water-breathing',
  'fire_resistance': 'fire-resistance',
  'night_vision': 'night-vision',
  'slow_falling': 'slow-falling',
  'conduit_power': 'conduit-power',
  'dolphins_grace': 'dolphins-grace',
  'bad_omen': 'bad-omen',
  'hero_of_the_village': 'hero-of-the-village',
  'trial_omen': 'trial-omen',
  'raid_omen': 'raid-omen',
  'wind_charged': 'wind-charged',
};

/**
 * エフェクトアイコン画像URLを取得
 * Minecraft WikiはEffectSprite_形式（ハイフン区切り、小文字）を使用
 * @param {string} effectId - エフェクトID (例: speed, fire_resistance)
 * @returns {string} 画像URL
 */
export function getEffectIconUrl(effectId) {
  if (!effectId) return null;

  // 特殊マッピングを確認
  const specialName = EFFECT_SPECIAL_MAP[effectId];
  if (specialName) {
    return `${WIKI_BASE}/EffectSprite_${specialName}.png`;
  }

  // アンダースコアをハイフンに変換（Wiki形式）
  const wikiName = effectId.replace(/_/g, '-');
  return `${WIKI_BASE}/EffectSprite_${wikiName}.png`;
}

/**
 * エンティティ画像URLを取得（JE形式）
 * @param {string} entityId - エンティティID (例: zombie)
 * @returns {string} 画像URL
 */
export function getEntityImageUrl(entityId) {
  if (!entityId) return null;

  const mappedName = ITEM_NAME_MAP[entityId];
  const name = mappedName || toPascalCase(entityId);

  return `${WIKI_BASE}/${name}_JE.png`;
}

/**
 * スポーンエッグが存在しないエンティティ
 * これらのエンティティはアイテムのInviconを代わりに返す
 */
const NON_SPAWNABLE_ENTITIES = new Set([
  // オブジェクト系エンティティ
  'armor_stand',
  'item_frame',
  'glow_item_frame',
  'painting',
  'minecart',
  'chest_minecart',
  'hopper_minecart',
  'tnt_minecart',
  'furnace_minecart',
  'command_block_minecart',
  'boat',
  'chest_boat',
  'tnt',
  'falling_block',
  'experience_orb',
  'lightning_bolt',
  // プレイヤー
  'player',
  // 投射物
  'arrow',
  'spectral_arrow',
  'trident',
  'fireball',
  'small_fireball',
  'dragon_fireball',
  'wither_skull',
  'shulker_bullet',
  'llama_spit',
  'evoker_fangs',
  'wind_charge',
]);

/**
 * スポーンエッグ画像URLを取得
 * スポーンエッグが存在しないエンティティはアイテムInviconを返す
 * @param {string} entityId - エンティティID (例: zombie)
 * @returns {string} 画像URL
 */
export function getSpawnEggUrl(entityId) {
  if (!entityId) return null;

  // スポーンエッグが存在しないエンティティはInviconを返す
  if (NON_SPAWNABLE_ENTITIES.has(entityId)) {
    return getInviconUrl(entityId);
  }

  const name = toPascalCase(entityId);
  return `${WIKI_BASE}/Invicon_${name}_Spawn_Egg.png`;
}

/**
 * 画像要素を生成するヘルパー
 * @param {string} url - 画像URL
 * @param {string} alt - alt属性
 * @param {number} size - サイズ（px）
 * @param {string} className - 追加のクラス名
 * @returns {string} HTML文字列
 */
export function wikiImg(url, alt = '', size = 32, className = '') {
  return `<img src="${url}" alt="${alt}" width="${size}" height="${size}"
    class="mc-wiki-img ${className}"
    style="image-rendering: pixelated;"
    loading="lazy"
    onerror="this.style.opacity='0.3'">`;
}

/**
 * フォールバック付き画像要素を生成
 * @param {string} url - 画像URL
 * @param {string} alt - alt属性
 * @param {number} size - サイズ（px）
 * @param {string} fallbackColor - フォールバック時の背景色
 * @returns {string} HTML文字列
 */
export function wikiImgWithFallback(url, alt = '', size = 32, fallbackColor = '#666') {
  return `<div class="mc-wiki-img-wrapper" style="width:${size}px;height:${size}px;background:${fallbackColor};display:inline-flex;align-items:center;justify-content:center;">
    <img src="${url}" alt="${alt}" width="${size}" height="${size}"
      class="mc-wiki-img"
      style="image-rendering: pixelated;"
      loading="lazy"
      onerror="this.style.display='none'">
  </div>`;
}

/**
 * 装飾済み防具（Trimmed Armor）のInvicon画像URLを取得
 * Wiki形式: Invicon_[TrimMaterial]_Trim_[ArmorMaterial]_[ArmorType].png
 * @param {string} armorMaterial - 防具素材 (例: diamond, netherite, iron)
 * @param {string} armorType - 防具部位 (例: helmet, chestplate, leggings, boots)
 * @param {string} trimMaterial - トリム素材 (例: quartz, gold, copper)
 * @returns {string} 画像URL
 */
export function getTrimmedArmorUrl(armorMaterial, armorType, trimMaterial) {
  if (!armorMaterial || !armorType || !trimMaterial) {
    return getInviconUrl(`${armorMaterial}_${armorType}`);
  }

  // 防具素材のマッピング（Wiki上の名前に変換）
  const armorMaterialMap = {
    'leather': 'Leather',
    'chainmail': 'Chainmail',
    'iron': 'Iron',
    'copper': 'Copper',
    'golden': 'Golden',  // 金防具は "Golden"
    'diamond': 'Diamond',
    'netherite': 'Netherite',
  };

  // トリム素材のマッピング（Wiki上の名前に変換）
  // Wiki上のファイル名は短縮形を使用
  const trimMaterialMap = {
    'amethyst': 'Amethyst',
    'copper': 'Copper',
    'diamond': 'Diamond',
    'emerald': 'Emerald',
    'gold': 'Gold',
    'iron': 'Iron',
    'lapis': 'Lapis',        // "Lapis"（Lapis_Lazuliではない）
    'netherite': 'Netherite',
    'quartz': 'Quartz',
    'redstone': 'Redstone',
    'resin': 'Resin',        // "Resin"（Resin_Brickではない）
  };

  // 防具部位のマッピング
  const armorTypeMap = {
    'helmet': 'Helmet',
    'chestplate': 'Chestplate',
    'leggings': 'Leggings',
    'boots': 'Boots',
  };

  // 革防具の特殊な名前
  const leatherArmorMap = {
    'helmet': 'Cap',
    'chestplate': 'Tunic',
    'leggings': 'Pants',
    'boots': 'Boots',
  };

  const trimMat = trimMaterialMap[trimMaterial] || toPascalCase(trimMaterial);
  const armorMat = armorMaterialMap[armorMaterial] || toPascalCase(armorMaterial);

  // 革防具は特殊な名前を使用
  let armorTypeName;
  if (armorMaterial === 'leather') {
    armorTypeName = leatherArmorMap[armorType] || toPascalCase(armorType);
  } else {
    armorTypeName = armorTypeMap[armorType] || toPascalCase(armorType);
  }

  // Wiki形式: Invicon_[TrimMaterial]_Trim_[ArmorMaterial]_[ArmorType].png
  return `${WIKI_BASE}/Invicon_${trimMat}_Trim_${armorMat}_${armorTypeName}.png`;
}

/**
 * 防具トリムパターンの3Dサンプルモデル画像URLを取得
 * Wiki形式: Armor_Trim_[Pattern]_(sample_model).png
 * @param {string} patternId - パターンID (例: coast, dune, spire)
 * @returns {string} 画像URL
 */
export function getArmorTrimSampleModelUrl(patternId) {
  if (!patternId || patternId === 'netherite_upgrade') {
    return null; // ネザライト強化はサンプルモデルなし
  }

  // パターン名のマッピング（Wiki上の名前に変換）
  const patternNameMap = {
    'bolt': 'Bolt',
    'coast': 'Coast',
    'dune': 'Dune',
    'eye': 'Eye',
    'flow': 'Flow',
    'host': 'Host',
    'raiser': 'Raiser',
    'rib': 'Rib',
    'sentry': 'Sentry',
    'shaper': 'Shaper',
    'silence': 'Silence',
    'snout': 'Snout',
    'spire': 'Spire',
    'tide': 'Tide',
    'vex': 'Vex',
    'ward': 'Ward',
    'wayfinder': 'Wayfinder',
    'wild': 'Wild',
  };

  const patternName = patternNameMap[patternId] || toPascalCase(patternId);

  // Wiki形式: Armor_Trim_[Pattern]_(sample_model).png
  return `${WIKI_BASE}/Armor_Trim_${patternName}_(sample_model).png`;
}

export default {
  getInviconUrl,
  getEffectIconUrl,
  getEntityImageUrl,
  getSpawnEggUrl,
  getTrimmedArmorUrl,
  getArmorTrimSampleModelUrl,
  wikiImg,
  wikiImgWithFallback,
  ITEM_NAME_MAP,
  EFFECT_NAME_MAP,
};
