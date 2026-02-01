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
  // === エンチャント金リンゴ（GIF形式 - アニメーション対応） ===
  'enchanted_golden_apple': 'Enchanted_Golden_Apple.gif',
  // === 光源ブロック系（GIF形式 - アニメーション対応） ===
  'sea_lantern': 'Sea_Lantern.gif',
  // === スカルク系（GIF形式 - アニメーション対応） ===
  'sculk': 'Sculk.gif',
  'sculk_vein': 'Sculk_Vein.gif',
  'sculk_sensor': 'Sculk_Sensor.gif',
  'sculk_shrieker': 'Sculk_Shrieker.gif',
  'calibrated_sculk_sensor': 'Calibrated_Sculk_Sensor.gif',
  // === ネザー木材系（GIF形式 - アニメーション対応） ===
  'crimson_stem': 'Crimson_Stem.gif',
  'warped_stem': 'Warped_Stem.gif',
  'crimson_hyphae': 'Crimson_Hyphae.gif',
  'warped_hyphae': 'Warped_Hyphae.gif',
  // === プリズマリン系（GIF形式） ===
  'prismarine': 'Prismarine.gif',
  // === マグマブロック（GIF形式） ===
  'magma_block': 'Magma_Block.gif',
  // === 石切台（GIF形式） ===
  'stonecutter': 'Stonecutter.gif',
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
  'player_head': 'Player_Head',  // Steve%27s_Headは存在しない
  'zombie_head': 'Zombie_Head',
  'skeleton_skull': 'Skeleton_Skull',
  'wither_skeleton_skull': 'Wither_Skeleton_Skull',
  'creeper_head': 'Creeper_Head',
  'piglin_head': 'Piglin_Head',
  'dragon_head': 'Dragon_Head',

  // === 特殊アイテム ===
  'redstone': 'Redstone',  // "Redstone"（Redstone_Dustではない）
  'redstone_wire': 'Redstone',  // ブロックIDだがInviconはRedstone
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
  'tipped_arrow': 'Arrow_of_Slowness',  // 汎用の効果付き矢アイコン（Tipped_Arrowは存在しない）

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
  // enchanted_golden_appleはITEM_FILE_MAPでGIF形式として定義

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

  // === 1.21.9+ 銅時代ブロック（The Copper Age） ===
  // 銅の鎖（Waxed版はWikiに画像なし、非Waxed版で代用）
  'copper_chain': 'Copper_Chain',
  'exposed_copper_chain': 'Exposed_Copper_Chain',
  'weathered_copper_chain': 'Weathered_Copper_Chain',
  'oxidized_copper_chain': 'Oxidized_Copper_Chain',
  'waxed_copper_chain': 'Copper_Chain',
  'waxed_exposed_copper_chain': 'Exposed_Copper_Chain',
  'waxed_weathered_copper_chain': 'Weathered_Copper_Chain',
  'waxed_oxidized_copper_chain': 'Oxidized_Copper_Chain',
  // 銅の松明（JE2_BE2形式 - バージョン依存のため）
  'copper_torch': 'Copper_Torch_JE2_BE2',
  'exposed_copper_torch': 'Copper_Torch_JE2_BE2',
  'weathered_copper_torch': 'Copper_Torch_JE2_BE2',
  'oxidized_copper_torch': 'Copper_Torch_JE2_BE2',
  'waxed_copper_torch': 'Copper_Torch_JE2_BE2',
  'waxed_exposed_copper_torch': 'Copper_Torch_JE2_BE2',
  'waxed_weathered_copper_torch': 'Copper_Torch_JE2_BE2',
  'waxed_oxidized_copper_torch': 'Copper_Torch_JE2_BE2',
  // 銅のバー（Waxed版はWikiに画像なし、非Waxed版で代用）
  'copper_bars': 'Copper_Bars',
  'exposed_copper_bars': 'Exposed_Copper_Bars',
  'weathered_copper_bars': 'Weathered_Copper_Bars',
  'oxidized_copper_bars': 'Oxidized_Copper_Bars',
  'waxed_copper_bars': 'Copper_Bars',
  'waxed_exposed_copper_bars': 'Exposed_Copper_Bars',
  'waxed_weathered_copper_bars': 'Weathered_Copper_Bars',
  'waxed_oxidized_copper_bars': 'Oxidized_Copper_Bars',
  // 銅のランタン（Waxed版はWikiに画像なし、非Waxed版で代用）
  'copper_lantern': 'Copper_Lantern',
  'exposed_copper_lantern': 'Exposed_Copper_Lantern',
  'weathered_copper_lantern': 'Weathered_Copper_Lantern',
  'oxidized_copper_lantern': 'Oxidized_Copper_Lantern',
  'waxed_copper_lantern': 'Copper_Lantern',
  'waxed_exposed_copper_lantern': 'Exposed_Copper_Lantern',
  'waxed_weathered_copper_lantern': 'Weathered_Copper_Lantern',
  'waxed_oxidized_copper_lantern': 'Oxidized_Copper_Lantern',
  // 銅のチェスト（Waxed版はWikiに画像なし、非Waxed版で代用）
  'copper_chest': 'Copper_Chest',
  'exposed_copper_chest': 'Exposed_Copper_Chest',
  'weathered_copper_chest': 'Weathered_Copper_Chest',
  'oxidized_copper_chest': 'Oxidized_Copper_Chest',
  'waxed_copper_chest': 'Copper_Chest',
  'waxed_exposed_copper_chest': 'Exposed_Copper_Chest',
  'waxed_weathered_copper_chest': 'Weathered_Copper_Chest',
  'waxed_oxidized_copper_chest': 'Oxidized_Copper_Chest',
  // 棚（木材別）
  'shelf': 'Oak_Shelf',  // 汎用はOakで代用
  'oak_shelf': 'Oak_Shelf',
  'spruce_shelf': 'Spruce_Shelf',
  'birch_shelf': 'Birch_Shelf',
  'jungle_shelf': 'Jungle_Shelf',
  'acacia_shelf': 'Acacia_Shelf',
  'dark_oak_shelf': 'Dark_Oak_Shelf',
  'mangrove_shelf': 'Mangrove_Shelf',
  'cherry_shelf': 'Cherry_Shelf',
  'bamboo_shelf': 'Bamboo_Shelf',
  'crimson_shelf': 'Crimson_Shelf',
  'warped_shelf': 'Warped_Shelf',
  'pale_oak_shelf': 'Pale_Oak_Shelf',

  // 乾燥したガストブロック
  'dried_ghast_block': 'Dried_Ghast',

  // カエルライト（汎用はOchreで代用）
  'froglight': 'Ochre_Froglight',

  // === 1.21.5+ ペールガーデン・銅時代ブロック ===
  'pale_oak_log': 'Pale_Oak_Log',
  'pale_oak_wood': 'Pale_Oak_Wood',
  'stripped_pale_oak_log': 'Stripped_Pale_Oak_Log',
  'stripped_pale_oak_wood': 'Stripped_Pale_Oak_Wood',
  'pale_oak_planks': 'Pale_Oak_Planks',
  'pale_oak_stairs': 'Pale_Oak_Stairs',
  'pale_oak_slab': 'Pale_Oak_Slab',
  'pale_oak_fence': 'Pale_Oak_Fence',
  'pale_oak_fence_gate': 'Pale_Oak_Fence_Gate',
  'pale_oak_door': 'Pale_Oak_Door',
  'pale_oak_trapdoor': 'Pale_Oak_Trapdoor',
  'pale_oak_pressure_plate': 'Pale_Oak_Pressure_Plate',
  'pale_oak_button': 'Pale_Oak_Button',
  'pale_oak_sign': 'Pale_Oak_Sign',
  'pale_oak_hanging_sign': 'Pale_Oak_Hanging_Sign',
  'pale_oak_leaves': 'Pale_Oak_Leaves',
  'pale_oak_sapling': 'Pale_Oak_Sapling',
  'pale_moss_block': 'Pale_Moss_Block',
  'pale_moss_carpet': 'Pale_Moss_Carpet',
  'pale_hanging_moss': 'Pale_Hanging_Moss',
  'creaking_heart': 'Creaking_Heart',
  'open_eyeblossom': 'Open_Eyeblossom',
  'closed_eyeblossom': 'Closed_Eyeblossom',
  'eyeblossom': 'Eyeblossom',
  'resin_block': 'Block_of_Resin',
  'resin_bricks': 'Resin_Bricks',
  'resin_brick_stairs': 'Resin_Brick_Stairs',
  'resin_brick_slab': 'Resin_Brick_Slab',
  'resin_brick_wall': 'Resin_Brick_Wall',
  'chiseled_resin_bricks': 'Chiseled_Resin_Bricks',
  'resin_clump': 'Resin_Clump',
  'firefly_bush': 'Firefly_Bush',
  'bush': 'Bush',
  'short_dry_grass': 'Dead_Bush',  // Wikiに画像なし、Dead_Bushで代用
  'tall_dry_grass': 'Dead_Bush',   // Wikiに画像なし、Dead_Bushで代用
  'cactus_flower': 'Cactus',       // Wikiに画像なし、Cactusで代用
  'leaf_litter': 'Leaf_Litter',
  'wildflowers': 'Wildflowers',
  // 銅ブロック系（Waxed版はWikiに画像なし、非Waxed版で代用）
  'copper_grate': 'Copper_Grate',
  'exposed_copper_grate': 'Exposed_Copper_Grate',
  'weathered_copper_grate': 'Weathered_Copper_Grate',
  'oxidized_copper_grate': 'Oxidized_Copper_Grate',
  'waxed_copper_grate': 'Copper_Grate',
  'waxed_exposed_copper_grate': 'Exposed_Copper_Grate',
  'waxed_weathered_copper_grate': 'Weathered_Copper_Grate',
  'waxed_oxidized_copper_grate': 'Oxidized_Copper_Grate',
  'copper_bulb': 'Copper_Bulb',
  'exposed_copper_bulb': 'Exposed_Copper_Bulb',
  'weathered_copper_bulb': 'Weathered_Copper_Bulb',
  'oxidized_copper_bulb': 'Oxidized_Copper_Bulb',
  'waxed_copper_bulb': 'Copper_Bulb',
  'waxed_exposed_copper_bulb': 'Exposed_Copper_Bulb',
  'waxed_weathered_copper_bulb': 'Weathered_Copper_Bulb',
  'waxed_oxidized_copper_bulb': 'Oxidized_Copper_Bulb',
  'copper_door': 'Copper_Door',
  'exposed_copper_door': 'Exposed_Copper_Door',
  'weathered_copper_door': 'Weathered_Copper_Door',
  'oxidized_copper_door': 'Oxidized_Copper_Door',
  'waxed_copper_door': 'Copper_Door',
  'waxed_exposed_copper_door': 'Exposed_Copper_Door',
  'waxed_weathered_copper_door': 'Weathered_Copper_Door',
  'waxed_oxidized_copper_door': 'Oxidized_Copper_Door',
  'copper_trapdoor': 'Copper_Trapdoor',
  'exposed_copper_trapdoor': 'Exposed_Copper_Trapdoor',
  'weathered_copper_trapdoor': 'Weathered_Copper_Trapdoor',
  'oxidized_copper_trapdoor': 'Oxidized_Copper_Trapdoor',
  'waxed_copper_trapdoor': 'Copper_Trapdoor',
  'waxed_exposed_copper_trapdoor': 'Exposed_Copper_Trapdoor',
  'waxed_weathered_copper_trapdoor': 'Weathered_Copper_Trapdoor',
  'waxed_oxidized_copper_trapdoor': 'Oxidized_Copper_Trapdoor',
  // トライアルチャンバー系
  'trial_spawner': 'Trial_Spawner',
  'vault': 'Vault',
  'heavy_core': 'Heavy_Core',
  'crafter': 'Crafter',
  'tuff_stairs': 'Tuff_Stairs',
  'tuff_slab': 'Tuff_Slab',
  'tuff_wall': 'Tuff_Wall',
  'polished_tuff': 'Polished_Tuff',
  'polished_tuff_stairs': 'Polished_Tuff_Stairs',
  'polished_tuff_slab': 'Polished_Tuff_Slab',
  'polished_tuff_wall': 'Polished_Tuff_Wall',
  'tuff_bricks': 'Tuff_Bricks',
  'tuff_brick_stairs': 'Tuff_Brick_Stairs',
  'tuff_brick_slab': 'Tuff_Brick_Slab',
  'tuff_brick_wall': 'Tuff_Brick_Wall',
  'chiseled_tuff': 'Chiseled_Tuff',
  'chiseled_tuff_bricks': 'Chiseled_Tuff_Bricks',
  // Chiseled Copper（Waxed版はWikiに画像なし、非Waxed版で代用）
  'chiseled_copper': 'Chiseled_Copper',
  'exposed_chiseled_copper': 'Exposed_Chiseled_Copper',
  'weathered_chiseled_copper': 'Weathered_Chiseled_Copper',
  'oxidized_chiseled_copper': 'Oxidized_Chiseled_Copper',
  'waxed_chiseled_copper': 'Chiseled_Copper',
  'waxed_exposed_chiseled_copper': 'Exposed_Chiseled_Copper',
  'waxed_weathered_chiseled_copper': 'Weathered_Chiseled_Copper',
  'waxed_oxidized_chiseled_copper': 'Oxidized_Chiseled_Copper',

  // === 植物・装飾ブロック（特殊名称） ===
  'grass': 'Short_Grass',  // 1.20.3以降 grass → short_grass に変更
  'short_grass': 'Short_Grass',
  'tall_grass': 'Tall_Grass',
  'seagrass': 'Seagrass',
  'tall_seagrass': 'Seagrass',  // Tall SeagrassはInvicon存在しない、Seagrassで代用
  'lily_of_the_valley': 'Lily_of_the_Valley',
  'vine': 'Vines',  // 複数形
  'cave_vines': 'Glow_Berries',  // cave_vinesはアイテムなし、Glow Berriesで代用
  'cave_vines_plant': 'Glow_Berries',
  'glow_berries': 'Glow_Berries',
  'big_dripleaf': 'Big_Dripleaf',
  'small_dripleaf': 'Small_Dripleaf',
  'dripleaf': 'Big_Dripleaf',  // dripleafはbig_dripleafで代用
  'weeping_vines': 'Weeping_Vines',
  'twisting_vines': 'Twisting_Vines',
  'hanging_roots': 'Hanging_Roots',
  'spore_blossom': 'Spore_Blossom',
  'azalea': 'Azalea',
  'flowering_azalea': 'Flowering_Azalea',
  'azalea_leaves': 'Azalea_Leaves',
  'flowering_azalea_leaves': 'Flowering_Azalea_Leaves',
  'moss_block': 'Moss_Block',
  'moss_carpet': 'Moss_Carpet',
  'glow_lichen': 'Glow_Lichen',
  // sculk系はITEM_FILE_MAPでGIF形式として定義
  'sculk_catalyst': 'Sculk_Catalyst',  // catalystはPNG形式
  'frogspawn': 'Frogspawn',
  'ochre_froglight': 'Ochre_Froglight',
  'verdant_froglight': 'Verdant_Froglight',
  'pearlescent_froglight': 'Pearlescent_Froglight',
  'mangrove_roots': 'Mangrove_Roots',
  'muddy_mangrove_roots': 'Muddy_Mangrove_Roots',
  'mud': 'Mud',
  'packed_mud': 'Packed_Mud',
  'mud_bricks': 'Mud_Bricks',
  'cherry_leaves': 'Cherry_Leaves',
  'pink_petals': 'Pink_Petals',
  'pitcher_plant': 'Pitcher_Plant',
  'pitcher_pod': 'Pitcher_Pod',
  'torchflower': 'Torchflower',
  'torchflower_seeds': 'Torchflower_Seeds',
  'sniffer_egg': 'Sniffer_Egg',

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
  // sea_lanternはITEM_FILE_MAPでGIF形式として定義
  'shroomlight': 'Shroomlight',
  'crying_obsidian': 'Crying_Obsidian',
  'respawn_anchor': 'Respawn_Anchor',
  'lodestone': 'Lodestone',

  // === 鉱石・金属ブロック（Block of 形式）===
  'coal_block': 'Block_of_Coal',
  'iron_block': 'Block_of_Iron',
  'raw_iron_block': 'Block_of_Raw_Iron',
  'copper_block': 'Block_of_Copper',
  'raw_copper_block': 'Block_of_Raw_Copper',
  'gold_block': 'Block_of_Gold',
  'raw_gold_block': 'Block_of_Raw_Gold',
  'lapis_block': 'Block_of_Lapis_Lazuli',
  'diamond_block': 'Block_of_Diamond',
  'netherite_block': 'Block_of_Netherite',
  'amethyst_block': 'Block_of_Amethyst',
  'emerald_block': 'Block_of_Emerald',
  'quartz_block': 'Block_of_Quartz',

  // === 鉱石ブロック ===
  'lapis_ore': 'Lapis_Lazuli_Ore',
  'deepslate_lapis_ore': 'Deepslate_Lapis_Lazuli_Ore',

  // === 農業・植物ブロック ===
  'hay_block': 'Hay_Bale',
  'sweet_berry_bush': 'Sweet_Berries',  // ブッシュはアイテム無し、ベリーで代用
  'nether_portal': 'Obsidian',  // ポータルはアイテム無し、黒曜石で代用

  // === ライトブロック ===
  'light': 'Light_15',  // Light Block (レベル15)

  // === 銅ブロック各状態 ===
  'exposed_copper': 'Exposed_Copper',
  'weathered_copper': 'Weathered_Copper',
  'oxidized_copper': 'Oxidized_Copper',
  // Waxed銅ブロック（Wikiに画像なし、非Waxed版で代用）
  'waxed_copper_block': 'Block_of_Copper',
  'waxed_exposed_copper': 'Exposed_Copper',
  'waxed_weathered_copper': 'Weathered_Copper',
  'waxed_oxidized_copper': 'Oxidized_Copper',
  'cut_copper': 'Cut_Copper',
  'exposed_cut_copper': 'Exposed_Cut_Copper',
  'weathered_cut_copper': 'Weathered_Cut_Copper',
  'oxidized_cut_copper': 'Oxidized_Cut_Copper',
  'waxed_cut_copper': 'Cut_Copper',
  'waxed_exposed_cut_copper': 'Exposed_Cut_Copper',
  'waxed_weathered_cut_copper': 'Weathered_Cut_Copper',
  'waxed_oxidized_cut_copper': 'Oxidized_Cut_Copper',
  'cut_copper_stairs': 'Cut_Copper_Stairs',
  'exposed_cut_copper_stairs': 'Exposed_Cut_Copper_Stairs',
  'weathered_cut_copper_stairs': 'Weathered_Cut_Copper_Stairs',
  'oxidized_cut_copper_stairs': 'Oxidized_Cut_Copper_Stairs',
  'waxed_cut_copper_stairs': 'Cut_Copper_Stairs',
  'waxed_exposed_cut_copper_stairs': 'Exposed_Cut_Copper_Stairs',
  'waxed_weathered_cut_copper_stairs': 'Weathered_Cut_Copper_Stairs',
  'waxed_oxidized_cut_copper_stairs': 'Oxidized_Cut_Copper_Stairs',
  'cut_copper_slab': 'Cut_Copper_Slab',
  'exposed_cut_copper_slab': 'Exposed_Cut_Copper_Slab',
  'weathered_cut_copper_slab': 'Weathered_Cut_Copper_Slab',
  'oxidized_cut_copper_slab': 'Oxidized_Cut_Copper_Slab',
  'waxed_cut_copper_slab': 'Cut_Copper_Slab',
  'waxed_exposed_cut_copper_slab': 'Exposed_Cut_Copper_Slab',
  'waxed_weathered_cut_copper_slab': 'Weathered_Cut_Copper_Slab',
  'waxed_oxidized_cut_copper_slab': 'Oxidized_Cut_Copper_Slab',

  // === 特殊ブロック ===
  'tnt': 'TNT',  // toPascalCaseは'Tnt'を返すが、WikiはTNT（大文字）
  'totem_of_undying': 'Totem_of_Undying',  // ofは小文字
  'spawner': 'Monster_Spawner',
  'jack_o_lantern': 'Jack_o%27Lantern',
  'chain': 'Iron_Chain',
  'water': 'Water_Bucket',  // ブロックはアイテム無し、バケツで代用
  'lava': 'Lava_Bucket',    // ブロックはアイテム無し、バケツで代用
  'air': 'Barrier',         // 空気は不可視、バリアで代用
  'void_air': 'Barrier',
  'cave_air': 'Barrier',

  // === ベッド ===
  'white_bed': 'White_Bed',
  'orange_bed': 'Orange_Bed',
  'magenta_bed': 'Magenta_Bed',
  'light_blue_bed': 'Light_Blue_Bed',
  'yellow_bed': 'Yellow_Bed',
  'lime_bed': 'Lime_Bed',
  'pink_bed': 'Pink_Bed',
  'gray_bed': 'Gray_Bed',
  'light_gray_bed': 'Light_Gray_Bed',
  'cyan_bed': 'Cyan_Bed',
  'purple_bed': 'Purple_Bed',
  'blue_bed': 'Blue_Bed',
  'brown_bed': 'Brown_Bed',
  'green_bed': 'Green_Bed',
  'red_bed': 'Red_Bed',
  'black_bed': 'Black_Bed',
  'bed': 'Red_Bed',

  // === 木材・ネザー材 ===
  'bamboo_block': 'Block_of_Bamboo',
  'stripped_bamboo_block': 'Block_of_Stripped_Bamboo',
  // crimson_stem, warped_stem, crimson_hyphae, warped_hyphaeはITEM_FILE_MAPでGIF形式として定義
  'stripped_crimson_stem': 'Stripped_Crimson_Stem',
  'stripped_crimson_hyphae': 'Stripped_Crimson_Hyphae',
  'stripped_warped_stem': 'Stripped_Warped_Stem',
  'stripped_warped_hyphae': 'Stripped_Warped_Hyphae',

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
