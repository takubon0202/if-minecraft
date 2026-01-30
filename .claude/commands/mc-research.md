# Minecraft コマンド仕様調査スキル

Minecraftの最新コマンド仕様をリリースノートやWikiから調査し、正確な情報を提供します。
**Gemini CLI**を使用してWebリサーチを行います。

## 使用方法

```
/mc-research [コマンド名またはトピック]
```

## 調査手順

### 1. Gemini CLIでWebリサーチを実行

**必ずGemini CLIを使用してWeb検索を行います：**

```bash
# 基本的な調査
gemini "Minecraft Java Edition $ARGUMENTS コマンド構文 変更履歴 最新バージョン"

# 特定バージョンの調査
gemini "Minecraft 1.21.5 $ARGUMENTS 仕様変更"

# Wikiページの直接参照
gemini "https://minecraft.wiki/w/Commands/$ARGUMENTS の内容を詳しく教えて"
```

### 2. 情報源の優先順位

1. **Minecraft Wiki** (minecraft.wiki)
   - https://minecraft.wiki/w/Commands
   - https://minecraft.wiki/w/Text_component_format

2. **公式リリースノート** (minecraft.net)
   - 各バージョンのChangelog

3. **PrismarineJS minecraft-data**
   - https://github.com/PrismarineJS/minecraft-data

### 3. 調査対象

$ARGUMENTS が指定された場合、以下を調査：

- コマンド構文（Syntax）
- 必須/オプション引数
- 対応バージョン
- 変更履歴（いつ追加/変更されたか）
- JSON/SNBT形式の詳細（該当する場合）
- 1.21.5以降の新形式への対応

### 4. 出力形式

```markdown
## [コマンド名] - Minecraft [バージョン]

### 構文
/command <必須> [オプション]

### 引数
| 引数 | 型 | 説明 |
|------|-----|------|
| ... | ... | ... |

### バージョン履歴
- 1.21.5: [SNBT形式への移行等]
- 1.21: [変更内容]
- 1.20: [変更内容]

### 使用例
/command example

### 注意事項
- ...
```

## 実行方法

1. **Gemini CLIでWebリサーチ**を実行
2. 取得した情報を上記形式でレポート作成
3. 必要に応じてClaudeが補足・修正

**調査対象**: $ARGUMENTS
