# Minecraft コマンド仕様調査スキル

Minecraftの最新コマンド仕様をリリースノートやWikiから調査し、正確な情報を提供します。

## 使用方法

```
/mc-research [コマンド名またはトピック]
```

## 調査手順

### 1. 情報源の優先順位

1. **公式リリースノート** (minecraft.net)
   - https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-1
   - 各バージョンのChangelog

2. **Minecraft Wiki** (minecraft.wiki)
   - https://minecraft.wiki/w/Commands
   - https://minecraft.wiki/w/Raw_JSON_text_format

3. **PrismarineJS minecraft-data**
   - https://github.com/PrismarineJS/minecraft-data

### 2. 調査対象

$ARGUMENTS が指定された場合、以下を調査：

- コマンド構文（Syntax）
- 必須/オプション引数
- 対応バージョン
- 変更履歴（いつ追加/変更されたか）
- JSON形式の詳細（該当する場合）
- NBT/SNBT仕様（該当する場合）

### 3. 出力形式

```markdown
## [コマンド名] - Minecraft [バージョン]

### 構文
/command <必須> [オプション]

### 引数
| 引数 | 型 | 説明 |
|------|-----|------|
| ... | ... | ... |

### バージョン履歴
- 1.21: [変更内容]
- 1.20: [変更内容]

### 使用例
/command example

### 注意事項
- ...
```

## 実行

WebSearchとWebFetchを使用して最新情報を取得し、上記形式でレポートを作成してください。

**調査対象**: $ARGUMENTS
