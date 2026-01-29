/**
 * Block IDs - UI
 * Minecraft Java Edition 1.21.5対応のブロックID一覧ツール
 */

import { $, $$, debounce, delegate } from '../../core/dom.js';
import { copyToClipboard } from '../../core/clipboard.js';
import { getInviconUrl } from '../../core/wiki-images.js';

// ブロックカテゴリ定義
const CATEGORIES = [
  { id: 'all', label: '全て', iconItem: 'chest' },
  { id: 'building', label: '建築', iconItem: 'bricks' },
  { id: 'decoration', label: '装飾', iconItem: 'lantern' },
  { id: 'nature', label: '自然', iconItem: 'oak_leaves' },
  { id: 'redstone', label: 'レッドストーン', iconItem: 'redstone' },
  { id: 'functional', label: '機能ブロック', iconItem: 'crafting_table' },
  { id: 'other', label: 'その他', iconItem: 'command_block' },
];

// ブロックデータ（200種類以上）
const BLOCKS = [
  // === 建築ブロック (Building) ===
  // 石系
  { id: 'stone', name: '石', desc: '基本的な建築ブロック', category: 'building' },
  { id: 'cobblestone', name: '丸石', desc: '石を採掘すると入手できる', category: 'building' },
  { id: 'mossy_cobblestone', name: '苔むした丸石', desc: 'ダンジョンや巨大樹の遺跡で見つかる', category: 'building' },
  { id: 'stone_bricks', name: '石レンガ', desc: '石を精錬して作る装飾ブロック', category: 'building' },
  { id: 'mossy_stone_bricks', name: '苔むした石レンガ', desc: '要塞や廃坑で見つかる', category: 'building' },
  { id: 'cracked_stone_bricks', name: 'ひび割れた石レンガ', desc: '石レンガを精錬して作る', category: 'building' },
  { id: 'chiseled_stone_bricks', name: '模様入り石レンガ', desc: '装飾用の石レンガ', category: 'building' },
  { id: 'smooth_stone', name: '滑らかな石', desc: '石を精錬して作る', category: 'building' },
  { id: 'granite', name: '花崗岩', desc: 'ピンク色の自然石', category: 'building' },
  { id: 'polished_granite', name: '磨かれた花崗岩', desc: '花崗岩を加工したもの', category: 'building' },
  { id: 'diorite', name: '閃緑岩', desc: '白っぽい自然石', category: 'building' },
  { id: 'polished_diorite', name: '磨かれた閃緑岩', desc: '閃緑岩を加工したもの', category: 'building' },
  { id: 'andesite', name: '安山岩', desc: 'グレーの自然石', category: 'building' },
  { id: 'polished_andesite', name: '磨かれた安山岩', desc: '安山岩を加工したもの', category: 'building' },
  { id: 'deepslate', name: '深層岩', desc: 'Y=0以下で見つかる硬い石', category: 'building' },
  { id: 'cobbled_deepslate', name: '深層岩の丸石', desc: '深層岩を採掘すると入手', category: 'building' },
  { id: 'polished_deepslate', name: '磨かれた深層岩', desc: '深層岩を加工したもの', category: 'building' },
  { id: 'deepslate_bricks', name: '深層岩レンガ', desc: '深層岩から作るレンガ', category: 'building' },
  { id: 'deepslate_tiles', name: '深層岩タイル', desc: '深層岩の装飾ブロック', category: 'building' },
  { id: 'chiseled_deepslate', name: '模様入り深層岩', desc: '装飾用の深層岩', category: 'building' },
  { id: 'tuff', name: '凝灰岩', desc: '深層で見つかる灰色の石', category: 'building' },
  { id: 'calcite', name: '方解石', desc: 'アメジストジオードを囲む白い石', category: 'building' },
  { id: 'dripstone_block', name: '鍾乳石ブロック', desc: '鍾乳洞で見つかる', category: 'building' },

  // レンガ・砂岩系
  { id: 'bricks', name: 'レンガ', desc: '粘土から作る赤いブロック', category: 'building' },
  { id: 'sandstone', name: '砂岩', desc: '砂から作る黄色いブロック', category: 'building' },
  { id: 'chiseled_sandstone', name: '模様入り砂岩', desc: '装飾用の砂岩', category: 'building' },
  { id: 'cut_sandstone', name: '研がれた砂岩', desc: '滑らかな砂岩', category: 'building' },
  { id: 'smooth_sandstone', name: '滑らかな砂岩', desc: '精錬した砂岩', category: 'building' },
  { id: 'red_sandstone', name: '赤い砂岩', desc: '赤い砂から作る', category: 'building' },
  { id: 'chiseled_red_sandstone', name: '模様入り赤い砂岩', desc: '装飾用の赤い砂岩', category: 'building' },
  { id: 'cut_red_sandstone', name: '研がれた赤い砂岩', desc: '滑らかな赤い砂岩', category: 'building' },
  { id: 'smooth_red_sandstone', name: '滑らかな赤い砂岩', desc: '精錬した赤い砂岩', category: 'building' },

  // ネザー系
  { id: 'netherrack', name: 'ネザーラック', desc: 'ネザーの基本ブロック', category: 'building' },
  { id: 'nether_bricks', name: 'ネザーレンガ', desc: 'ネザー要塞の主な構成ブロック', category: 'building' },
  { id: 'red_nether_bricks', name: '赤いネザーレンガ', desc: 'ネザーウォートとネザーレンガで作る', category: 'building' },
  { id: 'chiseled_nether_bricks', name: '模様入りネザーレンガ', desc: '装飾用のネザーレンガ', category: 'building' },
  { id: 'cracked_nether_bricks', name: 'ひび割れたネザーレンガ', desc: 'ネザーレンガを精錬', category: 'building' },
  { id: 'basalt', name: '玄武岩', desc: 'ソウルサンドの谷で見つかる', category: 'building' },
  { id: 'polished_basalt', name: '磨かれた玄武岩', desc: '玄武岩を加工したもの', category: 'building' },
  { id: 'smooth_basalt', name: '滑らかな玄武岩', desc: '玄武岩を精錬', category: 'building' },
  { id: 'blackstone', name: 'ブラックストーン', desc: '玄武岩デルタで見つかる黒い石', category: 'building' },
  { id: 'polished_blackstone', name: '磨かれたブラックストーン', desc: 'ブラックストーンを加工', category: 'building' },
  { id: 'polished_blackstone_bricks', name: '磨かれたブラックストーンレンガ', desc: '装飾用ブラックストーン', category: 'building' },
  { id: 'chiseled_polished_blackstone', name: '模様入り磨かれたブラックストーン', desc: '装飾ブロック', category: 'building' },
  { id: 'gilded_blackstone', name: '金箔付きブラックストーン', desc: '砦の遺跡で見つかる', category: 'building' },

  // エンド系
  { id: 'end_stone', name: 'エンドストーン', desc: 'エンドの基本ブロック', category: 'building' },
  { id: 'end_stone_bricks', name: 'エンドストーンレンガ', desc: 'エンドストーンから作る', category: 'building' },
  { id: 'purpur_block', name: 'プルプァブロック', desc: 'コーラスフルーツから作る紫ブロック', category: 'building' },
  { id: 'purpur_pillar', name: 'プルプァの柱', desc: 'プルプァブロックの柱型', category: 'building' },

  // 銅系
  { id: 'copper_block', name: '銅ブロック', desc: '銅インゴットから作る', category: 'building' },
  { id: 'exposed_copper', name: '風化した銅', desc: '少し酸化した銅', category: 'building' },
  { id: 'weathered_copper', name: '錆びた銅', desc: 'さらに酸化した銅', category: 'building' },
  { id: 'oxidized_copper', name: '酸化した銅', desc: '完全に酸化した銅', category: 'building' },
  { id: 'cut_copper', name: '切り込み入りの銅', desc: '加工した銅', category: 'building' },
  { id: 'waxed_copper_block', name: 'ワックスがけされた銅ブロック', desc: '酸化しない銅', category: 'building' },

  // プリズマリン系
  { id: 'prismarine', name: 'プリズマリン', desc: '海底神殿で見つかる', category: 'building' },
  { id: 'prismarine_bricks', name: 'プリズマリンレンガ', desc: '海底神殿の装飾ブロック', category: 'building' },
  { id: 'dark_prismarine', name: 'ダークプリズマリン', desc: '暗い色のプリズマリン', category: 'building' },
  { id: 'sea_lantern', name: 'シーランタン', desc: '海底神殿の光源', category: 'building' },

  // クォーツ系
  { id: 'quartz_block', name: 'クォーツブロック', desc: 'ネザークォーツから作る白いブロック', category: 'building' },
  { id: 'chiseled_quartz_block', name: '模様入りクォーツブロック', desc: '装飾用クォーツ', category: 'building' },
  { id: 'quartz_pillar', name: 'クォーツの柱', desc: 'クォーツブロックの柱型', category: 'building' },
  { id: 'quartz_bricks', name: 'クォーツレンガ', desc: 'クォーツのレンガ模様', category: 'building' },
  { id: 'smooth_quartz', name: '滑らかなクォーツ', desc: '精錬したクォーツ', category: 'building' },

  // コンクリート
  { id: 'white_concrete', name: '白色のコンクリート', desc: '滑らかで鮮やかな白ブロック', category: 'building' },
  { id: 'orange_concrete', name: '橙色のコンクリート', desc: '滑らかで鮮やかなオレンジブロック', category: 'building' },
  { id: 'magenta_concrete', name: '赤紫色のコンクリート', desc: '滑らかで鮮やかなマゼンタブロック', category: 'building' },
  { id: 'light_blue_concrete', name: '空色のコンクリート', desc: '滑らかで鮮やかな水色ブロック', category: 'building' },
  { id: 'yellow_concrete', name: '黄色のコンクリート', desc: '滑らかで鮮やかな黄色ブロック', category: 'building' },
  { id: 'lime_concrete', name: '黄緑色のコンクリート', desc: '滑らかで鮮やかなライムブロック', category: 'building' },
  { id: 'pink_concrete', name: '桃色のコンクリート', desc: '滑らかで鮮やかなピンクブロック', category: 'building' },
  { id: 'gray_concrete', name: '灰色のコンクリート', desc: '滑らかで鮮やかなグレーブロック', category: 'building' },
  { id: 'light_gray_concrete', name: '薄灰色のコンクリート', desc: '滑らかで鮮やかなライトグレーブロック', category: 'building' },
  { id: 'cyan_concrete', name: '青緑色のコンクリート', desc: '滑らかで鮮やかなシアンブロック', category: 'building' },
  { id: 'purple_concrete', name: '紫色のコンクリート', desc: '滑らかで鮮やかな紫ブロック', category: 'building' },
  { id: 'blue_concrete', name: '青色のコンクリート', desc: '滑らかで鮮やかな青ブロック', category: 'building' },
  { id: 'brown_concrete', name: '茶色のコンクリート', desc: '滑らかで鮮やかな茶色ブロック', category: 'building' },
  { id: 'green_concrete', name: '緑色のコンクリート', desc: '滑らかで鮮やかな緑ブロック', category: 'building' },
  { id: 'red_concrete', name: '赤色のコンクリート', desc: '滑らかで鮮やかな赤ブロック', category: 'building' },
  { id: 'black_concrete', name: '黒色のコンクリート', desc: '滑らかで鮮やかな黒ブロック', category: 'building' },

  // テラコッタ
  { id: 'terracotta', name: 'テラコッタ', desc: '粘土を精錬して作る', category: 'building' },
  { id: 'white_terracotta', name: '白色のテラコッタ', desc: '白く染めたテラコッタ', category: 'building' },
  { id: 'orange_terracotta', name: '橙色のテラコッタ', desc: 'オレンジに染めたテラコッタ', category: 'building' },
  { id: 'magenta_terracotta', name: '赤紫色のテラコッタ', desc: 'マゼンタに染めたテラコッタ', category: 'building' },
  { id: 'light_blue_terracotta', name: '空色のテラコッタ', desc: '水色に染めたテラコッタ', category: 'building' },
  { id: 'yellow_terracotta', name: '黄色のテラコッタ', desc: '黄色に染めたテラコッタ', category: 'building' },
  { id: 'lime_terracotta', name: '黄緑色のテラコッタ', desc: 'ライムに染めたテラコッタ', category: 'building' },
  { id: 'pink_terracotta', name: '桃色のテラコッタ', desc: 'ピンクに染めたテラコッタ', category: 'building' },
  { id: 'gray_terracotta', name: '灰色のテラコッタ', desc: 'グレーに染めたテラコッタ', category: 'building' },
  { id: 'light_gray_terracotta', name: '薄灰色のテラコッタ', desc: 'ライトグレーに染めたテラコッタ', category: 'building' },
  { id: 'cyan_terracotta', name: '青緑色のテラコッタ', desc: 'シアンに染めたテラコッタ', category: 'building' },
  { id: 'purple_terracotta', name: '紫色のテラコッタ', desc: '紫に染めたテラコッタ', category: 'building' },
  { id: 'blue_terracotta', name: '青色のテラコッタ', desc: '青に染めたテラコッタ', category: 'building' },
  { id: 'brown_terracotta', name: '茶色のテラコッタ', desc: '茶色に染めたテラコッタ', category: 'building' },
  { id: 'green_terracotta', name: '緑色のテラコッタ', desc: '緑に染めたテラコッタ', category: 'building' },
  { id: 'red_terracotta', name: '赤色のテラコッタ', desc: '赤に染めたテラコッタ', category: 'building' },
  { id: 'black_terracotta', name: '黒色のテラコッタ', desc: '黒に染めたテラコッタ', category: 'building' },
  { id: 'white_glazed_terracotta', name: '白色の彩釉テラコッタ', desc: '模様入りの白いテラコッタ', category: 'building' },

  // 木材系
  { id: 'oak_planks', name: 'オークの板材', desc: 'オークの原木から作る', category: 'building' },
  { id: 'spruce_planks', name: 'トウヒの板材', desc: 'トウヒの原木から作る', category: 'building' },
  { id: 'birch_planks', name: 'シラカバの板材', desc: 'シラカバの原木から作る', category: 'building' },
  { id: 'jungle_planks', name: 'ジャングルの板材', desc: 'ジャングルの原木から作る', category: 'building' },
  { id: 'acacia_planks', name: 'アカシアの板材', desc: 'アカシアの原木から作る', category: 'building' },
  { id: 'dark_oak_planks', name: 'ダークオークの板材', desc: 'ダークオークの原木から作る', category: 'building' },
  { id: 'mangrove_planks', name: 'マングローブの板材', desc: 'マングローブの原木から作る', category: 'building' },
  { id: 'cherry_planks', name: 'サクラの板材', desc: 'サクラの原木から作る', category: 'building' },
  { id: 'bamboo_planks', name: '竹の板材', desc: '竹から作る', category: 'building' },
  { id: 'bamboo_mosaic', name: '竹細工', desc: '竹の装飾ブロック', category: 'building' },
  { id: 'crimson_planks', name: '真紅の板材', desc: '真紅の幹から作る', category: 'building' },
  { id: 'warped_planks', name: '歪んだ板材', desc: '歪んだ幹から作る', category: 'building' },

  // 原木
  { id: 'oak_log', name: 'オークの原木', desc: 'オークの木から入手', category: 'building' },
  { id: 'spruce_log', name: 'トウヒの原木', desc: 'トウヒの木から入手', category: 'building' },
  { id: 'birch_log', name: 'シラカバの原木', desc: 'シラカバの木から入手', category: 'building' },
  { id: 'jungle_log', name: 'ジャングルの原木', desc: 'ジャングルの木から入手', category: 'building' },
  { id: 'acacia_log', name: 'アカシアの原木', desc: 'アカシアの木から入手', category: 'building' },
  { id: 'dark_oak_log', name: 'ダークオークの原木', desc: 'ダークオークの木から入手', category: 'building' },
  { id: 'mangrove_log', name: 'マングローブの原木', desc: 'マングローブの木から入手', category: 'building' },
  { id: 'cherry_log', name: 'サクラの原木', desc: 'サクラの木から入手', category: 'building' },
  { id: 'crimson_stem', name: '真紅の幹', desc: 'ネザーの真紅の森で入手', category: 'building' },
  { id: 'warped_stem', name: '歪んだ幹', desc: 'ネザーの歪んだ森で入手', category: 'building' },
  { id: 'bamboo_block', name: '竹ブロック', desc: '竹を束ねたブロック', category: 'building' },

  // === 装飾ブロック (Decoration) ===
  // ガラス系
  { id: 'glass', name: 'ガラス', desc: '砂を精錬して作る透明ブロック', category: 'decoration' },
  { id: 'glass_pane', name: '板ガラス', desc: '薄いガラスパネル', category: 'decoration' },
  { id: 'tinted_glass', name: '遮光ガラス', desc: '光を通さないガラス', category: 'decoration' },
  { id: 'white_stained_glass', name: '白色の色付きガラス', desc: '白く染めたガラス', category: 'decoration' },
  { id: 'orange_stained_glass', name: '橙色の色付きガラス', desc: 'オレンジに染めたガラス', category: 'decoration' },
  { id: 'magenta_stained_glass', name: '赤紫色の色付きガラス', desc: 'マゼンタに染めたガラス', category: 'decoration' },
  { id: 'light_blue_stained_glass', name: '空色の色付きガラス', desc: '水色に染めたガラス', category: 'decoration' },
  { id: 'yellow_stained_glass', name: '黄色の色付きガラス', desc: '黄色に染めたガラス', category: 'decoration' },
  { id: 'lime_stained_glass', name: '黄緑色の色付きガラス', desc: 'ライムに染めたガラス', category: 'decoration' },
  { id: 'pink_stained_glass', name: '桃色の色付きガラス', desc: 'ピンクに染めたガラス', category: 'decoration' },
  { id: 'gray_stained_glass', name: '灰色の色付きガラス', desc: 'グレーに染めたガラス', category: 'decoration' },
  { id: 'light_gray_stained_glass', name: '薄灰色の色付きガラス', desc: 'ライトグレーに染めたガラス', category: 'decoration' },
  { id: 'cyan_stained_glass', name: '青緑色の色付きガラス', desc: 'シアンに染めたガラス', category: 'decoration' },
  { id: 'purple_stained_glass', name: '紫色の色付きガラス', desc: '紫に染めたガラス', category: 'decoration' },
  { id: 'blue_stained_glass', name: '青色の色付きガラス', desc: '青に染めたガラス', category: 'decoration' },
  { id: 'brown_stained_glass', name: '茶色の色付きガラス', desc: '茶色に染めたガラス', category: 'decoration' },
  { id: 'green_stained_glass', name: '緑色の色付きガラス', desc: '緑に染めたガラス', category: 'decoration' },
  { id: 'red_stained_glass', name: '赤色の色付きガラス', desc: '赤に染めたガラス', category: 'decoration' },
  { id: 'black_stained_glass', name: '黒色の色付きガラス', desc: '黒に染めたガラス', category: 'decoration' },

  // 光源
  { id: 'torch', name: '松明', desc: '基本的な光源', category: 'decoration' },
  { id: 'soul_torch', name: 'ソウルトーチ', desc: '青い炎の松明', category: 'decoration' },
  { id: 'lantern', name: 'ランタン', desc: '松明より明るい吊り下げ光源', category: 'decoration' },
  { id: 'soul_lantern', name: 'ソウルランタン', desc: '青い炎のランタン', category: 'decoration' },
  { id: 'glowstone', name: 'グロウストーン', desc: 'ネザーで見つかる光るブロック', category: 'decoration' },
  { id: 'shroomlight', name: 'シュルームライト', desc: '巨大キノコから取れる光源', category: 'decoration' },
  { id: 'end_rod', name: 'エンドロッド', desc: 'エンドシティで見つかる光源', category: 'decoration' },
  { id: 'ochre_froglight', name: '黄土色のフロッグライト', desc: '温帯カエルが作る光源', category: 'decoration' },
  { id: 'verdant_froglight', name: '新緑色のフロッグライト', desc: '寒帯カエルが作る光源', category: 'decoration' },
  { id: 'pearlescent_froglight', name: '真珠色のフロッグライト', desc: '熱帯カエルが作る光源', category: 'decoration' },

  // 羊毛・カーペット
  { id: 'white_wool', name: '白色の羊毛', desc: '羊から取れるふわふわブロック', category: 'decoration' },
  { id: 'orange_wool', name: '橙色の羊毛', desc: 'オレンジの羊毛', category: 'decoration' },
  { id: 'magenta_wool', name: '赤紫色の羊毛', desc: 'マゼンタの羊毛', category: 'decoration' },
  { id: 'light_blue_wool', name: '空色の羊毛', desc: '水色の羊毛', category: 'decoration' },
  { id: 'yellow_wool', name: '黄色の羊毛', desc: '黄色の羊毛', category: 'decoration' },
  { id: 'lime_wool', name: '黄緑色の羊毛', desc: 'ライムの羊毛', category: 'decoration' },
  { id: 'pink_wool', name: '桃色の羊毛', desc: 'ピンクの羊毛', category: 'decoration' },
  { id: 'gray_wool', name: '灰色の羊毛', desc: 'グレーの羊毛', category: 'decoration' },
  { id: 'light_gray_wool', name: '薄灰色の羊毛', desc: 'ライトグレーの羊毛', category: 'decoration' },
  { id: 'cyan_wool', name: '青緑色の羊毛', desc: 'シアンの羊毛', category: 'decoration' },
  { id: 'purple_wool', name: '紫色の羊毛', desc: '紫の羊毛', category: 'decoration' },
  { id: 'blue_wool', name: '青色の羊毛', desc: '青の羊毛', category: 'decoration' },
  { id: 'brown_wool', name: '茶色の羊毛', desc: '茶色の羊毛', category: 'decoration' },
  { id: 'green_wool', name: '緑色の羊毛', desc: '緑の羊毛', category: 'decoration' },
  { id: 'red_wool', name: '赤色の羊毛', desc: '赤の羊毛', category: 'decoration' },
  { id: 'black_wool', name: '黒色の羊毛', desc: '黒の羊毛', category: 'decoration' },
  { id: 'white_carpet', name: '白色のカーペット', desc: '薄い白の敷物', category: 'decoration' },
  { id: 'moss_carpet', name: '苔のカーペット', desc: '苔ブロックから作る', category: 'decoration' },

  // その他装飾
  { id: 'white_banner', name: '白色の旗', desc: '装飾用の白い旗', category: 'decoration' },
  { id: 'oak_sign', name: 'オークの看板', desc: 'テキストを書ける看板', category: 'decoration' },
  { id: 'oak_hanging_sign', name: 'オークの吊り看板', desc: '吊り下げタイプの看板', category: 'decoration' },
  { id: 'flower_pot', name: '植木鉢', desc: '花や苗木を飾れる', category: 'decoration' },
  { id: 'painting', name: '絵画', desc: '壁に飾る絵', category: 'decoration' },
  { id: 'item_frame', name: '額縁', desc: 'アイテムを飾れるフレーム', category: 'decoration' },
  { id: 'glow_item_frame', name: '発光する額縁', desc: '光る額縁', category: 'decoration' },
  { id: 'armor_stand', name: '防具立て', desc: '防具を飾れるスタンド', category: 'decoration' },
  { id: 'decorated_pot', name: '飾り壺', desc: '壺の欠片で作る装飾ブロック', category: 'decoration' },
  { id: 'bell', name: '鐘', desc: '村で見つかる鳴らせるブロック', category: 'decoration' },
  { id: 'chain', name: '鎖', desc: '吊り下げ装飾用', category: 'decoration' },
  { id: 'lightning_rod', name: '避雷針', desc: '雷を集める', category: 'decoration' },

  // === 自然ブロック (Nature) ===
  // 土系
  { id: 'dirt', name: '土', desc: '最も一般的なブロック', category: 'nature' },
  { id: 'grass_block', name: '草ブロック', desc: '草が生えた土', category: 'nature' },
  { id: 'podzol', name: 'ポドゾル', desc: '巨大タイガで見つかる土', category: 'nature' },
  { id: 'mycelium', name: '菌糸', desc: 'キノコ島で見つかる', category: 'nature' },
  { id: 'coarse_dirt', name: '粗い土', desc: '草が生えない土', category: 'nature' },
  { id: 'rooted_dirt', name: '根付いた土', desc: '垂れ根が生える土', category: 'nature' },
  { id: 'mud', name: '泥', desc: 'マングローブ湿地で見つかる', category: 'nature' },
  { id: 'packed_mud', name: '固めた泥', desc: '泥を加工したブロック', category: 'nature' },
  { id: 'mud_bricks', name: '泥レンガ', desc: '固めた泥から作る', category: 'nature' },
  { id: 'farmland', name: '耕地', desc: '作物を植えられる土', category: 'nature' },
  { id: 'dirt_path', name: '土の道', desc: '村で見つかる踏み固められた道', category: 'nature' },

  // 砂・砂利
  { id: 'sand', name: '砂', desc: '砂漠やビーチで見つかる', category: 'nature' },
  { id: 'red_sand', name: '赤い砂', desc: '荒野で見つかる', category: 'nature' },
  { id: 'gravel', name: '砂利', desc: '落下するブロック', category: 'nature' },
  { id: 'suspicious_sand', name: '怪しげな砂', desc: '遺跡で見つかるブラシで掘れる砂', category: 'nature' },
  { id: 'suspicious_gravel', name: '怪しげな砂利', desc: 'ブラシで掘れる砂利', category: 'nature' },
  { id: 'clay', name: '粘土', desc: '水辺で見つかる', category: 'nature' },

  // 葉
  { id: 'oak_leaves', name: 'オークの葉', desc: 'オークの木の葉', category: 'nature' },
  { id: 'spruce_leaves', name: 'トウヒの葉', desc: 'トウヒの木の葉', category: 'nature' },
  { id: 'birch_leaves', name: 'シラカバの葉', desc: 'シラカバの木の葉', category: 'nature' },
  { id: 'jungle_leaves', name: 'ジャングルの葉', desc: 'ジャングルの木の葉', category: 'nature' },
  { id: 'acacia_leaves', name: 'アカシアの葉', desc: 'アカシアの木の葉', category: 'nature' },
  { id: 'dark_oak_leaves', name: 'ダークオークの葉', desc: 'ダークオークの木の葉', category: 'nature' },
  { id: 'mangrove_leaves', name: 'マングローブの葉', desc: 'マングローブの木の葉', category: 'nature' },
  { id: 'cherry_leaves', name: 'サクラの葉', desc: 'サクラの木の葉（桃色）', category: 'nature' },
  { id: 'azalea_leaves', name: 'ツツジの葉', desc: 'ツツジの葉', category: 'nature' },
  { id: 'flowering_azalea_leaves', name: '開花したツツジの葉', desc: '花が咲いたツツジの葉', category: 'nature' },

  // 花
  { id: 'dandelion', name: 'タンポポ', desc: '黄色い小さな花', category: 'nature' },
  { id: 'poppy', name: 'ポピー', desc: '赤い小さな花', category: 'nature' },
  { id: 'blue_orchid', name: 'ヒスイラン', desc: '青い花（湿地限定）', category: 'nature' },
  { id: 'allium', name: 'アリウム', desc: '紫の球状の花', category: 'nature' },
  { id: 'azure_bluet', name: 'ヒナソウ', desc: '小さな白い花', category: 'nature' },
  { id: 'red_tulip', name: '赤いチューリップ', desc: '赤いチューリップ', category: 'nature' },
  { id: 'orange_tulip', name: '橙色のチューリップ', desc: 'オレンジのチューリップ', category: 'nature' },
  { id: 'white_tulip', name: '白いチューリップ', desc: '白いチューリップ', category: 'nature' },
  { id: 'pink_tulip', name: '桃色のチューリップ', desc: 'ピンクのチューリップ', category: 'nature' },
  { id: 'oxeye_daisy', name: 'フランスギク', desc: '白と黄色の花', category: 'nature' },
  { id: 'cornflower', name: 'ヤグルマギク', desc: '青い花', category: 'nature' },
  { id: 'lily_of_the_valley', name: 'スズラン', desc: '白い鈴状の花', category: 'nature' },
  { id: 'wither_rose', name: 'ウィザーローズ', desc: 'ウィザーが倒したMobから', category: 'nature' },
  { id: 'torchflower', name: 'トーチフラワー', desc: '考古学で入手できる花', category: 'nature' },
  { id: 'pitcher_plant', name: 'ウツボカズラ', desc: '考古学で入手できる植物', category: 'nature' },
  { id: 'sunflower', name: 'ヒマワリ', desc: '2ブロック高の黄色い花', category: 'nature' },
  { id: 'lilac', name: 'ライラック', desc: '2ブロック高の紫の花', category: 'nature' },
  { id: 'rose_bush', name: 'バラの低木', desc: '2ブロック高の赤い花', category: 'nature' },
  { id: 'peony', name: 'ボタン', desc: '2ブロック高のピンクの花', category: 'nature' },

  // キノコ・苔
  { id: 'brown_mushroom', name: '茶キノコ', desc: '暗い場所で育つキノコ', category: 'nature' },
  { id: 'red_mushroom', name: '赤キノコ', desc: '赤い傘のキノコ', category: 'nature' },
  { id: 'brown_mushroom_block', name: '茶キノコブロック', desc: '巨大キノコの傘部分', category: 'nature' },
  { id: 'red_mushroom_block', name: '赤キノコブロック', desc: '巨大キノコの傘部分', category: 'nature' },
  { id: 'mushroom_stem', name: 'キノコの軸', desc: '巨大キノコの軸', category: 'nature' },
  { id: 'moss_block', name: '苔ブロック', desc: '緑のふわふわブロック', category: 'nature' },
  { id: 'hanging_roots', name: '垂れ根', desc: '根付いた土の下に生える', category: 'nature' },
  { id: 'glow_lichen', name: 'ヒカリゴケ', desc: '暗い洞窟で光る', category: 'nature' },
  { id: 'spore_blossom', name: '胞子の花', desc: '繁茂した洞窟の天井に', category: 'nature' },
  { id: 'big_dripleaf', name: '大きなドリップリーフ', desc: '乗ると傾く大きな葉', category: 'nature' },
  { id: 'small_dripleaf', name: '小さなドリップリーフ', desc: '小さなドリップリーフ', category: 'nature' },

  // 水中
  { id: 'kelp', name: 'コンブ', desc: '海で育つ植物', category: 'nature' },
  { id: 'dried_kelp_block', name: '乾燥したコンブブロック', desc: '燃料にもなるブロック', category: 'nature' },
  { id: 'seagrass', name: '海草', desc: '海底に生える', category: 'nature' },
  { id: 'sea_pickle', name: 'シーピクルス', desc: '水中で光る', category: 'nature' },
  { id: 'tube_coral', name: 'クダサンゴ', desc: '青いサンゴ', category: 'nature' },
  { id: 'brain_coral', name: 'ノウサンゴ', desc: 'ピンクのサンゴ', category: 'nature' },
  { id: 'bubble_coral', name: 'ミズタマサンゴ', desc: '紫のサンゴ', category: 'nature' },
  { id: 'fire_coral', name: 'ミレポラサンゴ', desc: '赤いサンゴ', category: 'nature' },
  { id: 'horn_coral', name: 'シカツノサンゴ', desc: '黄色のサンゴ', category: 'nature' },

  // 鉱石
  { id: 'coal_ore', name: '石炭鉱石', desc: '石炭を含む石', category: 'nature' },
  { id: 'deepslate_coal_ore', name: '深層石炭鉱石', desc: '深層岩の石炭鉱石', category: 'nature' },
  { id: 'iron_ore', name: '鉄鉱石', desc: '鉄を含む石', category: 'nature' },
  { id: 'deepslate_iron_ore', name: '深層鉄鉱石', desc: '深層岩の鉄鉱石', category: 'nature' },
  { id: 'copper_ore', name: '銅鉱石', desc: '銅を含む石', category: 'nature' },
  { id: 'deepslate_copper_ore', name: '深層銅鉱石', desc: '深層岩の銅鉱石', category: 'nature' },
  { id: 'gold_ore', name: '金鉱石', desc: '金を含む石', category: 'nature' },
  { id: 'deepslate_gold_ore', name: '深層金鉱石', desc: '深層岩の金鉱石', category: 'nature' },
  { id: 'nether_gold_ore', name: 'ネザー金鉱石', desc: 'ネザーの金鉱石', category: 'nature' },
  { id: 'redstone_ore', name: 'レッドストーン鉱石', desc: 'レッドストーンを含む石', category: 'nature' },
  { id: 'deepslate_redstone_ore', name: '深層レッドストーン鉱石', desc: '深層岩のレッドストーン鉱石', category: 'nature' },
  { id: 'emerald_ore', name: 'エメラルド鉱石', desc: 'エメラルドを含む石（山岳限定）', category: 'nature' },
  { id: 'deepslate_emerald_ore', name: '深層エメラルド鉱石', desc: '深層岩のエメラルド鉱石', category: 'nature' },
  { id: 'lapis_ore', name: 'ラピスラズリ鉱石', desc: 'ラピスラズリを含む石', category: 'nature' },
  { id: 'deepslate_lapis_ore', name: '深層ラピスラズリ鉱石', desc: '深層岩のラピスラズリ鉱石', category: 'nature' },
  { id: 'diamond_ore', name: 'ダイヤモンド鉱石', desc: 'ダイヤモンドを含む石', category: 'nature' },
  { id: 'deepslate_diamond_ore', name: '深層ダイヤモンド鉱石', desc: '深層岩のダイヤモンド鉱石', category: 'nature' },
  { id: 'nether_quartz_ore', name: 'ネザークォーツ鉱石', desc: 'ネザーのクォーツ鉱石', category: 'nature' },
  { id: 'ancient_debris', name: '古代の残骸', desc: 'ネザライトの原料', category: 'nature' },
  { id: 'amethyst_block', name: 'アメジストブロック', desc: '紫の結晶ブロック', category: 'nature' },
  { id: 'amethyst_cluster', name: 'アメジストクラスター', desc: '成長したアメジスト', category: 'nature' },
  { id: 'budding_amethyst', name: '芽生えたアメジスト', desc: 'アメジストが育つブロック', category: 'nature' },

  // 鉱石ブロック
  { id: 'coal_block', name: '石炭ブロック', desc: '石炭9個で作成', category: 'nature' },
  { id: 'raw_iron_block', name: '鉄の原石ブロック', desc: '鉄の原石9個で作成', category: 'nature' },
  { id: 'raw_copper_block', name: '銅の原石ブロック', desc: '銅の原石9個で作成', category: 'nature' },
  { id: 'raw_gold_block', name: '金の原石ブロック', desc: '金の原石9個で作成', category: 'nature' },
  { id: 'iron_block', name: '鉄ブロック', desc: '鉄インゴット9個で作成', category: 'nature' },
  { id: 'gold_block', name: '金ブロック', desc: '金インゴット9個で作成', category: 'nature' },
  { id: 'diamond_block', name: 'ダイヤモンドブロック', desc: 'ダイヤモンド9個で作成', category: 'nature' },
  { id: 'emerald_block', name: 'エメラルドブロック', desc: 'エメラルド9個で作成', category: 'nature' },
  { id: 'lapis_block', name: 'ラピスラズリブロック', desc: 'ラピスラズリ9個で作成', category: 'nature' },
  { id: 'redstone_block', name: 'レッドストーンブロック', desc: 'レッドストーン9個で作成', category: 'nature' },
  { id: 'netherite_block', name: 'ネザライトブロック', desc: 'ネザライトインゴット9個で作成', category: 'nature' },

  // 氷・雪
  { id: 'ice', name: '氷', desc: '凍った水', category: 'nature' },
  { id: 'packed_ice', name: '氷塊', desc: '滑りやすい氷', category: 'nature' },
  { id: 'blue_ice', name: '青氷', desc: '最も滑る氷', category: 'nature' },
  { id: 'snow', name: '雪', desc: '積もった雪', category: 'nature' },
  { id: 'snow_block', name: '雪ブロック', desc: '雪玉4個で作成', category: 'nature' },
  { id: 'powder_snow', name: '粉雪', desc: '沈む雪', category: 'nature' },

  // === レッドストーン (Redstone) ===
  { id: 'redstone_wire', name: 'レッドストーンダスト', desc: '回路の基本', category: 'redstone' },
  { id: 'redstone_torch', name: 'レッドストーントーチ', desc: '常時オンの信号源', category: 'redstone' },
  { id: 'redstone_lamp', name: 'レッドストーンランプ', desc: '信号で光る光源', category: 'redstone' },
  { id: 'lever', name: 'レバー', desc: 'オン/オフ切替スイッチ', category: 'redstone' },
  { id: 'stone_button', name: '石のボタン', desc: '押すと一時的に信号を出す', category: 'redstone' },
  { id: 'oak_button', name: 'オークのボタン', desc: '木製のボタン', category: 'redstone' },
  { id: 'stone_pressure_plate', name: '石の感圧板', desc: 'エンティティを検知', category: 'redstone' },
  { id: 'oak_pressure_plate', name: 'オークの感圧板', desc: '木製の感圧板', category: 'redstone' },
  { id: 'light_weighted_pressure_plate', name: '軽量カンシツ板', desc: 'アイテム数を検知', category: 'redstone' },
  { id: 'heavy_weighted_pressure_plate', name: '重量カンシツ板', desc: 'エンティティ数を検知', category: 'redstone' },
  { id: 'tripwire_hook', name: 'トリップワイヤーフック', desc: '糸と組み合わせて罠を作る', category: 'redstone' },
  { id: 'daylight_detector', name: '日照センサー', desc: '明るさを検知', category: 'redstone' },
  { id: 'target', name: 'ターゲット', desc: '矢が当たると信号を出す', category: 'redstone' },
  { id: 'sculk_sensor', name: 'スカルクセンサー', desc: '振動を検知する', category: 'redstone' },
  { id: 'calibrated_sculk_sensor', name: '調律されたスカルクセンサー', desc: '特定の振動を検知', category: 'redstone' },
  { id: 'repeater', name: 'リピーター', desc: '信号を延長・遅延', category: 'redstone' },
  { id: 'comparator', name: 'コンパレーター', desc: '信号を比較・検出', category: 'redstone' },
  { id: 'piston', name: 'ピストン', desc: 'ブロックを押す', category: 'redstone' },
  { id: 'sticky_piston', name: '粘着ピストン', desc: 'ブロックを押し引き', category: 'redstone' },
  { id: 'slime_block', name: 'スライムブロック', desc: '跳ねる・ピストンと連動', category: 'redstone' },
  { id: 'honey_block', name: 'ハチミツブロック', desc: '減速・ピストンと連動', category: 'redstone' },
  { id: 'observer', name: 'オブザーバー', desc: 'ブロック変化を検知', category: 'redstone' },
  { id: 'dropper', name: 'ドロッパー', desc: 'アイテムをドロップ', category: 'redstone' },
  { id: 'dispenser', name: 'ディスペンサー', desc: 'アイテムを発射', category: 'redstone' },
  { id: 'hopper', name: 'ホッパー', desc: 'アイテムを移送', category: 'redstone' },
  { id: 'note_block', name: '音符ブロック', desc: '音を鳴らす', category: 'redstone' },
  { id: 'jukebox', name: 'ジュークボックス', desc: 'レコードを再生', category: 'redstone' },
  { id: 'tnt', name: 'TNT', desc: '爆発物', category: 'redstone' },
  { id: 'oak_door', name: 'オークのドア', desc: '開閉できるドア', category: 'redstone' },
  { id: 'iron_door', name: '鉄のドア', desc: 'レッドストーンで開く', category: 'redstone' },
  { id: 'oak_trapdoor', name: 'オークのトラップドア', desc: '開閉できる床', category: 'redstone' },
  { id: 'iron_trapdoor', name: '鉄のトラップドア', desc: 'レッドストーンで開く', category: 'redstone' },
  { id: 'oak_fence_gate', name: 'オークのフェンスゲート', desc: '開閉できる柵', category: 'redstone' },
  { id: 'rail', name: 'レール', desc: 'トロッコ用の線路', category: 'redstone' },
  { id: 'powered_rail', name: 'パワードレール', desc: 'トロッコを加速', category: 'redstone' },
  { id: 'detector_rail', name: 'ディテクターレール', desc: 'トロッコを検知', category: 'redstone' },
  { id: 'activator_rail', name: 'アクティベーターレール', desc: 'トロッコを起動', category: 'redstone' },
  { id: 'crafter', name: 'クラフター', desc: '自動クラフト機', category: 'redstone' },

  // === 機能ブロック (Functional) ===
  { id: 'crafting_table', name: '作業台', desc: 'クラフトに使用', category: 'functional' },
  { id: 'furnace', name: 'かまど', desc: '精錬に使用', category: 'functional' },
  { id: 'blast_furnace', name: '溶鉱炉', desc: '鉱石を高速精錬', category: 'functional' },
  { id: 'smoker', name: '燻製器', desc: '食料を高速調理', category: 'functional' },
  { id: 'campfire', name: '焚き火', desc: '食料を調理・煙を出す', category: 'functional' },
  { id: 'soul_campfire', name: 'ソウルキャンプファイア', desc: '青い炎の焚き火', category: 'functional' },
  { id: 'anvil', name: '金床', desc: '修理・名前付け', category: 'functional' },
  { id: 'chipped_anvil', name: '欠けた金床', desc: '使用で壊れかけた金床', category: 'functional' },
  { id: 'damaged_anvil', name: '損傷した金床', desc: 'さらに壊れかけた金床', category: 'functional' },
  { id: 'grindstone', name: '砥石', desc: 'エンチャント除去・修理', category: 'functional' },
  { id: 'stonecutter', name: '石切台', desc: '石系ブロックの加工', category: 'functional' },
  { id: 'smithing_table', name: '鍛冶台', desc: 'ネザライト装備作成', category: 'functional' },
  { id: 'loom', name: '織機', desc: '旗のパターン作成', category: 'functional' },
  { id: 'cartography_table', name: '製図台', desc: '地図の操作', category: 'functional' },
  { id: 'fletching_table', name: '矢細工台', desc: '村人の職業ブロック', category: 'functional' },
  { id: 'enchanting_table', name: 'エンチャントテーブル', desc: 'エンチャント付与', category: 'functional' },
  { id: 'bookshelf', name: '本棚', desc: 'エンチャントレベル上昇', category: 'functional' },
  { id: 'chiseled_bookshelf', name: '模様入りの本棚', desc: '本を収納できる本棚', category: 'functional' },
  { id: 'brewing_stand', name: '醸造台', desc: 'ポーション醸造', category: 'functional' },
  { id: 'cauldron', name: '大釜', desc: '水やポーションを貯める', category: 'functional' },
  { id: 'chest', name: 'チェスト', desc: '27スロットの収納', category: 'functional' },
  { id: 'trapped_chest', name: 'トラップチェスト', desc: '開けると信号を出す', category: 'functional' },
  { id: 'ender_chest', name: 'エンダーチェスト', desc: 'どこでも同じ中身', category: 'functional' },
  { id: 'barrel', name: '樽', desc: '27スロットの収納', category: 'functional' },
  { id: 'shulker_box', name: 'シュルカーボックス', desc: '持ち運べる収納', category: 'functional' },
  { id: 'white_bed', name: '白色のベッド', desc: '白いベッド・スポーン地点設定', category: 'functional' },
  { id: 'red_bed', name: '赤色のベッド', desc: '赤のベッド', category: 'functional' },
  { id: 'beacon', name: 'ビーコン', desc: 'バフ効果を与える', category: 'functional' },
  { id: 'conduit', name: 'コンジット', desc: '水中呼吸を与える', category: 'functional' },
  { id: 'respawn_anchor', name: 'リスポーンアンカー', desc: 'ネザーでのスポーン地点', category: 'functional' },
  { id: 'lodestone', name: 'ロードストーン', desc: 'コンパスの指す先を設定', category: 'functional' },
  { id: 'lectern', name: '書見台', desc: '本を置いて読める', category: 'functional' },
  { id: 'composter', name: 'コンポスター', desc: '植物を骨粉に変える', category: 'functional' },
  { id: 'beehive', name: 'ミツバチの巣箱', desc: 'ハチを飼育', category: 'functional' },
  { id: 'bee_nest', name: 'ミツバチの巣', desc: '自然生成されるハチの巣', category: 'functional' },

  // === その他 (Other) ===
  { id: 'spawner', name: 'スポナー', desc: 'モンスターを生成', category: 'other' },
  { id: 'trial_spawner', name: 'トライアルスポナー', desc: 'トライアルチャンバーのスポナー', category: 'other' },
  { id: 'vault', name: 'ヴォールト', desc: 'トライアルチャンバーの報酬', category: 'other' },
  { id: 'barrier', name: 'バリアブロック', desc: '透明な通れないブロック', category: 'other' },
  { id: 'light', name: '光ブロック', desc: '透明な光源', category: 'other' },
  { id: 'structure_void', name: 'ストラクチャーヴォイド', desc: 'ストラクチャー用空白', category: 'other' },
  { id: 'structure_block', name: 'ストラクチャーブロック', desc: '構造物の保存・読込', category: 'other' },
  { id: 'jigsaw', name: 'ジグソーブロック', desc: '構造物の接続', category: 'other' },
  { id: 'command_block', name: 'コマンドブロック', desc: 'コマンドを実行', category: 'other' },
  { id: 'chain_command_block', name: 'チェーンコマンドブロック', desc: '連鎖コマンド実行', category: 'other' },
  { id: 'repeating_command_block', name: 'リピートコマンドブロック', desc: '繰り返しコマンド実行', category: 'other' },
  { id: 'sculk', name: 'スカルク', desc: 'ディープダークのブロック', category: 'other' },
  { id: 'sculk_vein', name: 'スカルクヴェイン', desc: 'スカルクの薄い層', category: 'other' },
  { id: 'sculk_catalyst', name: 'スカルクカタリスト', desc: 'モブの死でスカルクを広げる', category: 'other' },
  { id: 'sculk_shrieker', name: 'スカルクシュリーカー', desc: 'ウォーデンを呼ぶ', category: 'other' },
  { id: 'water', name: '水', desc: '水源ブロック', category: 'other' },
  { id: 'lava', name: '溶岩', desc: '溶岩源ブロック', category: 'other' },
  { id: 'fire', name: '火', desc: '燃えるブロック', category: 'other' },
  { id: 'soul_fire', name: 'ソウルファイア', desc: '青い炎', category: 'other' },
  { id: 'crying_obsidian', name: '泣く黒曜石', desc: 'リスポーンアンカーの材料', category: 'other' },
  { id: 'obsidian', name: '黒曜石', desc: 'ネザーポータルの材料', category: 'other' },
  { id: 'bedrock', name: '岩盤', desc: '破壊不可能なブロック', category: 'other' },
  { id: 'end_portal_frame', name: 'エンドポータルフレーム', desc: 'エンドへのポータル', category: 'other' },
  { id: 'end_portal', name: 'エンドポータル', desc: 'エンドへワープ', category: 'other' },
  { id: 'nether_portal', name: 'ネザーポータル', desc: 'ネザーへワープ', category: 'other' },
  { id: 'end_gateway', name: 'エンドゲートウェイ', desc: 'エンド内をテレポート', category: 'other' },
  { id: 'dragon_egg', name: 'ドラゴンの卵', desc: 'エンダードラゴンを倒すと出現', category: 'other' },
  { id: 'sponge', name: 'スポンジ', desc: '水を吸収', category: 'other' },
  { id: 'wet_sponge', name: '濡れたスポンジ', desc: '水を吸収したスポンジ', category: 'other' },
  { id: 'cobweb', name: 'クモの巣', desc: '移動速度を低下', category: 'other' },
  { id: 'hay_block', name: '干草の俵', desc: '麦9個で作成・落下ダメージ軽減', category: 'other' },
  { id: 'melon', name: 'スイカ', desc: 'スイカの実', category: 'other' },
  { id: 'pumpkin', name: 'カボチャ', desc: 'カボチャの実', category: 'other' },
  { id: 'carved_pumpkin', name: '彫られたカボチャ', desc: '顔が彫られたカボチャ', category: 'other' },
  { id: 'jack_o_lantern', name: 'ジャック・オ・ランタン', desc: '光るカボチャ', category: 'other' },
  { id: 'cake', name: 'ケーキ', desc: '7回食べられる', category: 'other' },
  { id: 'candle', name: 'ロウソク', desc: '光源・ケーキに乗せられる', category: 'other' },
  { id: 'skeleton_skull', name: 'スケルトンの頭', desc: 'スケルトンの頭蓋骨', category: 'other' },
  { id: 'wither_skeleton_skull', name: 'ウィザースケルトンの頭', desc: 'ウィザー召喚に必要', category: 'other' },
  { id: 'zombie_head', name: 'ゾンビの頭', desc: 'ゾンビの頭', category: 'other' },
  { id: 'creeper_head', name: 'クリーパーの頭', desc: 'クリーパーの頭', category: 'other' },
  { id: 'piglin_head', name: 'ピグリンの頭', desc: 'ピグリンの頭', category: 'other' },
  { id: 'dragon_head', name: 'ドラゴンの頭', desc: 'エンダードラゴンの頭', category: 'other' },
  { id: 'player_head', name: 'プレイヤーの頭', desc: 'プレイヤーの頭', category: 'other' },
  { id: 'heavy_core', name: 'ヘビーコア', desc: 'メイスの材料', category: 'other' },
  { id: 'copper_grate', name: '銅の格子', desc: '銅製の装飾ブロック', category: 'building' },
  { id: 'copper_bulb', name: '銅の電球', desc: 'レッドストーンで光る銅製光源', category: 'redstone' },
  { id: 'copper_door', name: '銅のドア', desc: '銅製のドア', category: 'redstone' },
  { id: 'copper_trapdoor', name: '銅のトラップドア', desc: '銅製のトラップドア', category: 'redstone' },
  { id: 'chiseled_copper', name: '模様入りの銅', desc: '装飾用の銅ブロック', category: 'building' },
  { id: 'tuff_bricks', name: '凝灰岩レンガ', desc: '凝灰岩から作るレンガ', category: 'building' },
  { id: 'chiseled_tuff', name: '模様入り凝灰岩', desc: '装飾用の凝灰岩', category: 'building' },
  { id: 'chiseled_tuff_bricks', name: '模様入り凝灰岩レンガ', desc: '装飾用の凝灰岩レンガ', category: 'building' },
  { id: 'polished_tuff', name: '磨かれた凝灰岩', desc: '凝灰岩を加工したもの', category: 'building' },
];

// 状態管理
let currentCategory = 'all';
let searchQuery = '';
let viewMode = 'grid';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="block-ids-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'grass_block')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
        <span class="version-badge">MC ${manifest.minecraftVersion}</span>
      </div>

      <div class="block-ids-controls">
        <div class="category-tabs">
          ${CATEGORIES.map(cat => `
            <button class="category-tab ${cat.id === currentCategory ? 'active' : ''}"
                    data-category="${cat.id}">
              <img src="${getInviconUrl(cat.iconItem)}" class="category-icon mc-wiki-image" width="16" height="16" alt="">
              <span class="label">${cat.label}</span>
            </button>
          `).join('')}
        </div>

        <div class="search-row">
          <div class="search-box">
            <input type="search" id="block-search" class="mc-input"
                   placeholder="検索... (例: stone, 石, レンガ)"
                   autocomplete="off">
            <span class="search-hint">日本語/英語対応</span>
          </div>
          <div class="view-toggle">
            <button class="view-btn ${viewMode === 'grid' ? 'active' : ''}" data-view="grid" title="グリッド表示">
              <span>▦</span>
            </button>
            <button class="view-btn ${viewMode === 'list' ? 'active' : ''}" data-view="list" title="リスト表示">
              <span>☰</span>
            </button>
          </div>
        </div>
      </div>

      <div class="block-results" id="block-results"></div>

      <div class="block-ids-footer">
        <span id="result-count">0件</span>
        <span class="tip">クリックでIDをコピー</span>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  delegate(container, 'click', '.category-tab', (e, target) => {
    currentCategory = target.dataset.category;
    updateCategoryTabs(container);
    renderResults(container);
  });

  const searchInput = $('#block-search', container);
  searchInput?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderResults(container);
  }, 200));

  delegate(container, 'click', '.view-btn', (e, target) => {
    viewMode = target.dataset.view;
    updateViewButtons(container);
    renderResults(container);
  });

  delegate(container, 'click', '.block-item', async (e, target) => {
    const id = target.dataset.id;
    const fullId = `minecraft:${id}`;
    const success = await copyToClipboard(fullId);
    if (success) {
      target.classList.add('copied');
      showCopyToast(container, fullId);
      setTimeout(() => target.classList.remove('copied'), 1000);
    }
  });

  renderResults(container);
}

function updateCategoryTabs(container) {
  $$('.category-tab', container).forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === currentCategory);
  });
}

function updateViewButtons(container) {
  $$('.view-btn', container).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewMode);
  });
}

function renderResults(container) {
  const resultsEl = $('#block-results', container);
  const countEl = $('#result-count', container);

  let filteredBlocks = BLOCKS;

  if (currentCategory !== 'all') {
    filteredBlocks = filteredBlocks.filter(block => block.category === currentCategory);
  }

  if (searchQuery) {
    filteredBlocks = filteredBlocks.filter(block => {
      return block.id.includes(searchQuery) ||
             block.name.includes(searchQuery) ||
             block.desc.includes(searchQuery);
    });
  }

  countEl.textContent = `${filteredBlocks.length}件`;

  const displayBlocks = filteredBlocks.slice(0, 300);
  const hasMore = filteredBlocks.length > 300;

  if (displayBlocks.length === 0) {
    resultsEl.innerHTML = `
      <p class="empty-message">
        ${searchQuery ? `"${searchQuery}" に一致するブロックが見つかりません` : 'ブロックがありません'}
      </p>
    `;
    return;
  }

  if (viewMode === 'grid') {
    resultsEl.innerHTML = `
      <div class="block-grid">
        ${displayBlocks.map(block => `
          <div class="block-item" data-id="${block.id}" title="${block.desc}">
            <img class="block-icon" src="${getInviconUrl(block.id)}" alt="${block.name}" loading="lazy" onerror="this.style.opacity='0.3'">
            <span class="block-name">${block.name}</span>
            <span class="block-id">${block.id}</span>
          </div>
        `).join('')}
      </div>
      ${hasMore ? `<p class="more-hint">他 ${filteredBlocks.length - 300} 件... 検索で絞り込んでください</p>` : ''}
    `;
  } else {
    resultsEl.innerHTML = `
      <div class="block-list">
        ${displayBlocks.map(block => `
          <div class="block-item list-item" data-id="${block.id}">
            <img class="block-icon" src="${getInviconUrl(block.id)}" alt="${block.name}" loading="lazy" onerror="this.style.opacity='0.3'">
            <div class="block-info">
              <span class="block-name">${block.name}</span>
              <span class="block-id">minecraft:${block.id}</span>
            </div>
            <span class="block-desc">${block.desc}</span>
          </div>
        `).join('')}
      </div>
      ${hasMore ? `<p class="more-hint">他 ${filteredBlocks.length - 300} 件... 検索で絞り込んでください</p>` : ''}
    `;
  }
}

function showCopyToast(container, text) {
  const existing = container.querySelector('.copy-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.textContent = `コピーしました: ${text}`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  #block-ids-panel .tool-header {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
  }

  .version-badge {
    margin-left: auto;
    font-size: 0.7rem;
    padding: 2px 8px;
    background-color: var(--mc-color-grass-main);
    color: white;
    border-radius: 2px;
  }

  .block-ids-controls {
    margin-bottom: var(--mc-space-md);
  }

  .category-tabs {
    display: flex;
    gap: var(--mc-space-xs);
    margin-bottom: var(--mc-space-md);
    flex-wrap: wrap;
  }

  .category-tab {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    font-size: 0.8rem;
    transition: background-color 0.15s;
  }

  .category-tab:hover {
    background-color: var(--mc-color-stone-300);
  }

  .category-tab.active {
    background-color: var(--mc-color-grass-main);
    color: white;
    font-weight: bold;
  }

  .category-icon {
    width: 16px;
    height: 16px;
    image-rendering: pixelated;
  }

  .search-row {
    display: flex;
    gap: var(--mc-space-sm);
    align-items: stretch;
  }

  .search-box {
    position: relative;
    flex: 1;
  }

  .search-box input {
    width: 100%;
  }

  .search-hint {
    position: absolute;
    right: var(--mc-space-md);
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.7rem;
    color: var(--mc-text-muted);
  }

  .view-toggle {
    display: flex;
    border: 1px solid var(--mc-border-dark);
  }

  .view-btn {
    padding: var(--mc-space-sm) var(--mc-space-md);
    background-color: var(--mc-bg-panel);
    border: none;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.15s;
  }

  .view-btn:hover {
    background-color: var(--mc-color-stone-300);
  }

  .view-btn.active {
    background-color: var(--mc-color-grass-main);
    color: white;
  }

  .block-results {
    min-height: 200px;
    max-height: 500px;
    overflow-y: auto;
    background-color: var(--mc-bg-panel);
    border: 1px solid var(--mc-border-dark);
    padding: var(--mc-space-sm);
  }

  .block-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--mc-space-xs);
  }

  .block-grid .block-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--mc-space-sm);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    transition: background-color 0.15s, transform 0.1s;
    text-align: center;
  }

  .block-grid .block-item:hover {
    background-color: var(--mc-color-grass-light);
    color: white;
    transform: scale(1.02);
  }

  .block-grid .block-icon {
    width: 32px;
    height: 32px;
    margin-bottom: var(--mc-space-xs);
    image-rendering: pixelated;
    object-fit: contain;
  }

  .block-grid .block-name {
    font-size: 0.75rem;
    font-weight: bold;
    margin-bottom: 2px;
    line-height: 1.2;
  }

  .block-grid .block-id {
    font-size: 0.65rem;
    font-family: var(--mc-font-mono);
    color: var(--mc-text-muted);
    word-break: break-all;
  }

  .block-grid .block-item:hover .block-id {
    color: rgba(255, 255, 255, 0.8);
  }

  .block-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .block-list .block-item {
    display: flex;
    align-items: center;
    gap: var(--mc-space-sm);
    padding: var(--mc-space-sm) var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .block-list .block-item:hover {
    background-color: var(--mc-color-grass-light);
    color: white;
  }

  .block-list .block-icon {
    width: 32px;
    height: 32px;
    image-rendering: pixelated;
    object-fit: contain;
  }

  .block-list .block-info {
    display: flex;
    flex-direction: column;
    min-width: 180px;
  }

  .block-list .block-name {
    font-size: 0.85rem;
    font-weight: bold;
  }

  .block-list .block-id {
    font-size: 0.7rem;
    font-family: var(--mc-font-mono);
    color: var(--mc-text-muted);
  }

  .block-list .block-item:hover .block-id {
    color: rgba(255, 255, 255, 0.8);
  }

  .block-list .block-desc {
    flex: 1;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    text-align: right;
  }

  .block-list .block-item:hover .block-desc {
    color: rgba(255, 255, 255, 0.7);
  }

  .block-item.copied {
    background-color: var(--mc-color-gold) !important;
    color: var(--mc-color-stone-900) !important;
  }

  .block-item.copied .block-id,
  .block-item.copied .block-desc {
    color: var(--mc-color-stone-700) !important;
  }

  .block-ids-footer {
    display: flex;
    justify-content: space-between;
    margin-top: var(--mc-space-sm);
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .empty-message,
  .more-hint {
    text-align: center;
    padding: var(--mc-space-lg);
    color: var(--mc-text-muted);
  }

  .copy-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background-color: var(--mc-color-stone-800);
    color: white;
    padding: var(--mc-space-sm) var(--mc-space-lg);
    border-radius: 4px;
    font-size: 0.85rem;
    z-index: 1000;
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
  }

  .copy-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  /* ダークモードでのコントラスト改善（茶/緑テーマ - 土/草ブロック） */
  @media (prefers-color-scheme: dark) {
    #block-ids-panel .category-tab {
      background: #252520;
      color: #e0e0e0;
      border-color: #555;
    }

    #block-ids-panel .category-tab:hover {
      background: rgba(92, 183, 70, 0.2);
    }

    #block-ids-panel .category-tab.active {
      background: #5cb746;
      color: white;
    }

    #block-ids-panel .search-box input {
      background: #252520;
      color: #e8e8e8;
      border-color: #555;
    }

    #block-ids-panel .search-box input:focus {
      border-color: #5cb746;
      box-shadow: 0 0 0 2px rgba(92, 183, 70, 0.3);
    }

    #block-ids-panel .search-hint {
      color: #888;
    }

    #block-ids-panel .view-btn {
      background: #252520;
      color: #e0e0e0;
      border-color: #555;
    }

    #block-ids-panel .view-btn:hover {
      background: rgba(92, 183, 70, 0.2);
    }

    #block-ids-panel .view-btn.active {
      background: #5cb746;
      color: white;
    }

    #block-ids-panel .block-results {
      background: #1a1a1a;
      border-color: #555;
    }

    #block-ids-panel .block-grid .block-item {
      background: #252520;
      border-color: #444;
    }

    #block-ids-panel .block-grid .block-item:hover {
      background: #5cb746;
    }

    #block-ids-panel .block-grid .block-name {
      color: #e8e8e8;
    }

    #block-ids-panel .block-grid .block-id {
      color: #b0b0b0;
    }

    #block-ids-panel .block-list .block-item {
      background: #252520;
      border-color: #444;
    }

    #block-ids-panel .block-list .block-item:hover {
      background: #5cb746;
    }

    #block-ids-panel .block-list .block-name {
      color: #e8e8e8;
    }

    #block-ids-panel .block-list .block-id {
      color: #b0b0b0;
    }

    #block-ids-panel .block-list .block-desc {
      color: #888;
    }

    #block-ids-panel .block-ids-footer {
      color: #888;
    }

    #block-ids-panel .empty-message,
    #block-ids-panel .more-hint {
      color: #888;
    }

    #block-ids-panel .copy-toast {
      background: #333;
      color: #e8e8e8;
    }
  }
`;
document.head.appendChild(style);

export default { render, init };
