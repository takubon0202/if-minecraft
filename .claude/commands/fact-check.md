# ファクトチェックスキル - Minecraft情報検証

プロジェクト内のMinecraft関連データ（エンチャント名、効果名、アイテムID等）が正確かを検証します。
**Gemini CLI**と**Codex CLI**を活用して高精度な検証を行います。

## 使用方法

```
/fact-check [対象] [--strict]
```

### 対象
- `enchant` - エンチャント情報の検証
- `effect` - ポーション効果情報の検証
- `item` - アイテムID・名称の検証
- `trim` - 防具トリム情報の検証
- `all` - 全項目を検証
- `[ファイルパス]` - 特定ファイルを検証

### オプション
- `--strict` - 厳格モード（警告も不合格扱い）

## AI活用戦略

### Gemini CLI - 公式情報の検証

**Geminiの強み:**
- リアルタイムWiki検索
- 日本語翻訳の正確性確認
- バージョン間の変更点把握

```bash
# エンチャント名の検証
gemini "Minecraft Java Edition sharpness の正式な日本語名は？ 公式翻訳を教えて"

# ポーション効果名の検証
gemini "Minecraft 1.21 の infested, oozing, weaving, wind_charged の正式な日本語名は？"

# 最大レベルの検証
gemini "Minecraft $ENCHANT_ID の最大エンチャントレベルは？"
```

### Codex CLI - データ整合性チェック

**Codexの強み:**
- コード構造の分析
- データフォーマットの検証
- 修正コードの生成

```bash
# プロジェクト内データの抽出・分析
codex "src/tools/enchant/ui.js からエンチャント定義を抽出してJSONで出力"

# 公式データとの比較
codex "以下のエンチャント定義とMinecraft Wikiの情報を比較して差分を報告: [データ]"

# 修正コードの生成
codex "以下の間違いを修正するコードを生成: [差分リスト]"
```

## 検証プロセス

### ステップ1: Codexでプロジェクトデータ抽出

```bash
codex "プロジェクトから$TARGETのデータを抽出してJSON形式で出力"
```

### ステップ2: Geminiで公式情報取得

```bash
gemini "Minecraft Wiki $TARGET 一覧 正式名称 最新バージョン"
```

### ステップ3: 差分検出と検証

```bash
# Codexで差分分析
codex "プロジェクトデータ: [A] 公式データ: [B] の差分を検出"
```

### ステップ4: 修正提案生成

```bash
# Codexで修正コード生成
codex "以下の差分を修正するためのコード変更を生成: [差分]"
```

## 検証プロセス詳細

### 1. データ抽出

対象ファイルから検証対象データを抽出:

```javascript
// 検証対象ファイル
src/tools/enchant/ui.js    // エンチャント定義
src/tools/potion/ui.js     // ポーション効果定義
src/tools/smithing/ui.js   // 鍛冶・トリム定義
src/core/wiki-images.js    // アイテムID・Wiki名マッピング
data/generated/*.json      // 生成データ
```

### 2. 公式情報との照合

**Minecraft Wikiで検証:**

```bash
# エンチャント検証
WebFetch("https://minecraft.wiki/w/Enchanting", "全エンチャントの英語ID、日本語名、最大レベルを教えて")

# ポーション効果検証
WebFetch("https://minecraft.wiki/w/Effect", "全ステータス効果の英語ID、日本語名を教えて")

# トリム検証
WebFetch("https://minecraft.wiki/w/Smithing", "防具トリムの全パターンと素材を教えて")
```

### 3. 差分検出

| 検証項目 | チェック内容 |
|----------|-------------|
| ID一致 | minecraft:XXX 形式が正しいか |
| 日本語名 | 公式翻訳と一致するか |
| 英語名 | Wiki記載名と一致するか |
| 最大レベル | 正しい最大レベルか |
| 対応バージョン | 指定バージョンで存在するか |

## 検証項目詳細

### エンチャント検証

```javascript
// 検証対象
{
  id: 'sharpness',        // ✓ 英語ID
  name: 'ダメージ増加',    // ✓ 日本語名（公式翻訳）
  en: 'Sharpness',        // ✓ 英語表示名
  defaultMax: 5,          // ✓ 最大レベル
  desc: '...',            // 説明（任意）
}

// よくある間違い
// ❌ 'ダメージ強化' → ✓ 'ダメージ増加'
// ❌ 'sweeping' → ✓ 'sweeping_edge'
// ❌ maxLevel: 10 → ✓ defaultMax: 5
```

### ポーション効果検証

```javascript
// 検証対象
{
  id: 'speed',            // ✓ 英語ID
  name: '移動速度上昇',    // ✓ 日本語名（公式翻訳）
  en: 'Speed',            // ✓ 英語表示名
}

// 1.21で変更された効果名
// ❌ '蝕み' → ✓ '虫食い' (infested)
// ❌ '滲み出し' → ✓ '滲出' (oozing)
// ❌ '紡糸' → ✓ '巣張り' (weaving)
// ❌ '風纏い' → ✓ '蓄風' (wind_charged)
```

### アイテムID検証

```javascript
// 検証対象
{
  itemId: 'netherite_sword',  // ✓ 正しいID
  wikiName: 'Netherite_Sword', // ✓ Wiki画像名
}

// よくある間違い
// ❌ 'gold_sword' → ✓ 'golden_sword'
// ❌ 'Redstone_Dust' → ✓ 'Redstone'
```

## 出力フォーマット

```
=== ファクトチェックレポート ===

検証日時: [日時]
対象: $ARGUMENTS
検証項目数: XX件

【検証結果サマリー】
- 正確: XX件 ✓
- 要修正: XX件 ✗
- 警告: XX件 ⚠

【要修正項目】
1. [ファイル:行番号]
   項目: エンチャント名
   現在値: "ダメージ強化"
   正しい値: "ダメージ増加"
   根拠: https://minecraft.wiki/w/Sharpness

2. [ファイル:行番号]
   項目: ポーション効果名
   現在値: "蝕み"
   正しい値: "虫食い"
   根拠: 1.21での公式翻訳変更

【警告項目】
1. [ファイル:行番号]
   項目: 最大レベル
   現在値: 5
   Wiki値: 5 (ただしコマンドでは255まで設定可能)
   対応: 確認のみ、修正不要

【合格/不合格】
要修正: X件 → [合格: 0件 / 不合格: 1件以上]
```

## 合格基準

- **合格**: 要修正 0件
- **条件付き合格**: 警告のみ（--strictでは不合格）
- **不合格**: 要修正 1件以上

## 自動修正

検出した問題の自動修正:

```bash
/fact-check all --fix
```

## 実行例

```bash
# 全項目検証
/fact-check all

# エンチャントのみ検証
/fact-check enchant

# 厳格モード
/fact-check all --strict

# 特定ファイル検証
/fact-check src/tools/potion/ui.js

# 自動修正付き
/fact-check all --fix
```

## 検証データベース

### 正式な日本語名一覧（1.21.11時点）

**エンチャント（一部）:**
| ID | 日本語名 | 最大Lv |
|----|---------|--------|
| sharpness | ダメージ増加 | 5 |
| smite | アンデッド特効 | 5 |
| bane_of_arthropods | 虫特効 | 5 |
| knockback | ノックバック | 2 |
| fire_aspect | 火属性 | 2 |
| looting | ドロップ増加 | 3 |
| sweeping_edge | 範囲ダメージ増加 | 3 |
| density | 重撃 | 5 |
| breach | 防具貫通 | 4 |
| wind_burst | ウィンドバースト | 3 |

**ポーション効果（一部）:**
| ID | 日本語名 |
|----|---------|
| speed | 移動速度上昇 |
| slowness | 移動速度低下 |
| infested | 虫食い |
| oozing | 滲出 |
| weaving | 巣張り |
| wind_charged | 蓄風 |

## 連携スキル

- **/research** - 最新情報の調査
- **/link-check** - 画像URLの検証
- **/update-readme** - 修正結果の反映
