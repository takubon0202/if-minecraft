# リサーチスキル - Minecraft最新情報調査

Minecraftの最新バージョン、コマンド仕様、アイテム情報を調査し、プロジェクトが最新状態かを確認します。
**Gemini CLI**と**Codex CLI**を活用して高品質な調査を行います。

## 使用方法

```
/research [トピック]
```

### トピック例

- `version` - 最新バージョン情報
- `command [コマンド名]` - 特定コマンドの最新仕様
- `enchant` - エンチャント一覧と最新変更
- `effect` - ポーション効果一覧
- `trim` - 防具トリム素材・パターン
- `all` - 全般的な最新情報

## AI活用戦略

### Gemini CLI - Web検索・最新情報収集

**Geminiの強み:**
- リアルタイムWeb検索
- 最新のリリースノート確認
- Wiki情報の要約

```bash
# 最新バージョン情報
gemini "Minecraft Java Edition 最新バージョン 2024年 リリースノート"

# 特定トピックの詳細調査
gemini "Minecraft 1.21 $ARGUMENTS 仕様変更 新機能"

# Wiki情報の確認
gemini "minecraft.wiki $ARGUMENTS の最新情報を教えて"
```

### Codex CLI - データ構造・コード分析

**Codexの強み:**
- JSONデータ構造の生成
- コード例の作成
- 技術仕様の整理

```bash
# データ構造の生成
codex "Minecraft 1.21のエンチャント一覧をJSONで出力して"

# コマンド構文の確認
codex "Minecraft /giveコマンドのコンポーネント形式の構文を教えて"

# 実装例の生成
codex "$ARGUMENTS のJavaScript実装例を作成して"
```

## 調査手順

### ステップ1: Geminiで最新情報収集

```bash
# 必ずGemini CLIを実行
gemini "Minecraft Java Edition $ARGUMENTS 最新 変更点 2024"
```

### ステップ2: Codexでデータ構造化

```bash
# Geminiの結果をCodexで構造化
codex "以下の情報をJSON形式で整理して: [Geminiの結果]"
```

### ステップ3: Wiki直接参照で検証

```bash
# WebFetchで公式Wiki確認
WebFetch("https://minecraft.wiki/w/$TOPIC", "詳細仕様を教えて")
```

### ステップ4: クロスチェック

Gemini、Codex、Wikiの3つの情報源で一致を確認:
- 一致 → 確定情報として採用
- 不一致 → Wikiを優先、要追加調査

## 調査対象

### バージョン情報
- 最新安定版バージョン
- スナップショット/プレリリース情報
- 次期アップデート予定

### コマンド仕様
- `/give` - アイテム付与（コンポーネント形式）
- `/effect` - ポーション効果
- `/enchant` - エンチャント
- `/summon` - エンティティ召喚
- `/tellraw` - JSON Text
- `/title` - タイトル表示

### データ定義
- エンチャント一覧（ID、最大レベル、対応アイテム）
- ポーション効果一覧（ID、日本語名、効果）
- 防具トリム（パターン、素材）
- 新アイテム・新モブ

## 出力フォーマット

```markdown
=== Minecraft リサーチレポート ===

調査日時: [日時]
対象: $ARGUMENTS
現在のプロジェクト対応バージョン: 1.21.11

【最新バージョン情報】
- 安定版: X.XX.X
- スナップショット: XXwXXa

【変更点・新機能】
1. [変更内容1]
2. [変更内容2]

【プロジェクトへの影響】
- [ ] 対応が必要な変更
- [x] 既に対応済み

【推奨アクション】
1. [具体的なアクション]

【情報源】
- [URL1]
- [URL2]
```

## 自動チェック項目

### エンチャント
- [ ] 新エンチャントの追加有無
- [ ] 既存エンチャントの仕様変更
- [ ] 最大レベルの変更

### ポーション効果
- [ ] 新効果の追加有無
- [ ] 効果名の変更（日本語/英語）
- [ ] 効果の仕様変更

### コマンド構文
- [ ] 新形式（SNBT等）への移行
- [ ] 引数の追加・変更
- [ ] 非推奨コマンドの確認

## 実行例

```bash
# 最新バージョン確認
/research version

# エンチャント情報
/research enchant

# 特定コマンド
/research command give

# 全般調査
/research all
```

## 連携スキル

- **/fact-check** - 調査結果の検証
- **/mc-research** - 詳細なコマンド仕様調査
- **/update-readme** - 調査結果をREADMEに反映
