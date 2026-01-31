# リンク切れ確認スキル

プロジェクト内のMinecraft Wiki画像URLや外部リンクを検証し、404エラーを検出・報告します。

## 使用方法

```
/link-check [オプション]
```

### オプション

- `--all` - 全ファイルをチェック
- `--wiki` - Wiki画像URLのみチェック
- `--fix` - 検出した問題を自動修正
- `[ファイルパス]` - 特定ファイルのみチェック

## 検証手順

### 1. 対象ファイルの特定

以下のファイルからURLを抽出：

```javascript
// 主要な検証対象
src/core/wiki-images.js    // Wiki画像URL定義
src/tools/*/ui.js          // 各ツールのUI
src/styles/*.css           // 背景画像等
```

### 2. URL抽出パターン

```javascript
// Wiki画像URL
https://minecraft.wiki/images/[ImageName].png
https://minecraft.wiki/images/Invicon_[Item].png
https://minecraft.wiki/images/Effect_[Effect].png

// 外部リソース
https://[domain]/[path]
```

### 3. 検証プロセス

1. **URL抽出**: Grepで対象ファイルからURL/画像パスを抽出
2. **存在確認**: WebFetchで各URLにアクセスし、レスポンスを確認
3. **結果分類**:
   - 200 OK: 正常
   - 404 Not Found: リンク切れ
   - 301/302: リダイレクト（要確認）
   - Timeout: 接続エラー

### 4. Wiki画像URLの検証

Minecraft Wiki画像の命名規則を確認：

| カテゴリ | URL形式 | 例 |
|----------|---------|-----|
| アイテム | `Invicon_[Name].png` | `Invicon_Diamond_Sword.png` |
| エフェクト | `Effect_[Name].png` | `Effect_Speed.png` |
| トリム素材 | `[Material]_Armor_Trim.png` | `Gold_Armor_Trim.png` |
| 防具 | `[Material]_[ArmorType].png` | `Netherite_Chestplate.png` |

### 5. 修正候補の提案

リンク切れを検出した場合、以下の方法で修正候補を提案：

1. **命名規則の確認**: アンダースコア、スペース、大文字小文字
2. **代替画像の検索**: 類似名の画像を検索
3. **Wiki APIで検索**: 正確な画像名をAPIで確認

## 出力フォーマット

```
=== リンク切れ確認レポート ===

検査日時: [日時]
検査対象: [ファイル数]件
検査URL数: [URL数]件

【検査結果サマリー】
- 正常: XX件
- リンク切れ: XX件
- リダイレクト: XX件
- エラー: XX件

【リンク切れ一覧】
1. [ファイル:行番号]
   URL: https://...
   エラー: 404 Not Found
   提案: https://... (修正候補)

2. [ファイル:行番号]
   URL: https://...
   エラー: 404 Not Found
   提案: 画像名を確認してください

【要確認（リダイレクト）】
1. [ファイル:行番号]
   元URL: https://...
   リダイレクト先: https://...

【修正コマンド】
以下のコマンドで自動修正できます：
/link-check --fix

【合格/不合格】
リンク切れ: X件 → [合格: 0件 / 不合格: 1件以上]
```

## 合格基準

- **合格**: リンク切れ 0件
- **警告**: リダイレクトのみ存在
- **不合格**: リンク切れ 1件以上

## 実行例

```bash
# 全ファイルチェック
/link-check --all

# Wiki画像のみチェック
/link-check --wiki

# 特定ファイルチェック
/link-check src/core/wiki-images.js

# 自動修正付きチェック
/link-check --fix
```

## 検証対象Wiki画像一覧

### アイテムアイコン (Invicon)

- 武器: `diamond_sword`, `netherite_sword`, `bow`, `crossbow`, `mace`
- 防具: `diamond_helmet`, `netherite_chestplate`, etc.
- ツール: `diamond_pickaxe`, `netherite_axe`, etc.
- ポーション: `potion`, `splash_potion`, `lingering_potion`, `tipped_arrow`
- その他: `enchanted_book`, `redstone`, `compass`, etc.

### エフェクトアイコン (Effect)

- 有益: `Speed`, `Haste`, `Strength`, `Regeneration`, etc.
- 有害: `Slowness`, `Poison`, `Wither`, `Darkness`, etc.
- 中立: `Glowing`, `Trial_Omen`, etc.

### トリム素材

- `Amethyst`, `Copper`, `Diamond`, `Emerald`, `Gold`, etc.

## 自動修正ロジック

```javascript
// 修正パターン
const FIX_PATTERNS = {
  // スペースをアンダースコアに
  'Diamond Sword' -> 'Diamond_Sword',

  // 小文字を大文字に（各単語の先頭）
  'diamond_sword' -> 'Diamond_Sword',

  // 特殊な命名規則
  'redstone_dust' -> 'Redstone',
  'tipped_arrow' -> 'Arrow_of_Slowness',
};
```

## 関連スキル

- **/evaluate** - ページ全体の品質評価
- **/mc-research** - Wiki情報の調査
- **/review** - 総合レビュー
