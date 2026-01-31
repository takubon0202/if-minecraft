# README更新スキル - 最新仕様への自動更新

README.mdをプロジェクトの最新状態に自動更新します。

## 使用方法

```
/update-readme [セクション]
```

### セクション
- `all` - 全セクション更新
- `features` - 機能一覧更新
- `tools` - ツール一覧更新
- `version` - 対応バージョン更新
- `commands` - 利用可能スキル一覧更新
- `changelog` - 変更履歴追加

## 更新プロセス

### 1. 現状分析

```javascript
// 分析対象
README.md                    // 現在のREADME
package.json                 // バージョン情報
src/tools/*/manifest.json    // ツール情報
.claude/commands/*.md        // スキル一覧
CHANGELOG.md                 // 変更履歴（あれば）
```

### 2. 情報収集

**プロジェクト情報:**
- 実装済みツール一覧
- 対応Minecraftバージョン
- 利用可能スキル
- 最新のコミット履歴

**コード分析:**
- 各ツールの機能
- サポートするコマンド形式
- 特殊機能（リッチテキストエディター等）

### 3. README生成

以下のセクションを自動生成/更新:

## README構造

```markdown
# MC Tool Hub - Minecraft コマンド生成ツール

## 概要
Minecraft Java Edition対応のコマンド生成ツールポータルサイト。

## 対応バージョン
- Minecraft Java Edition X.XX.XX（最新）
- コンポーネント形式（1.20.5+）
- NBT形式（1.13-1.20.4）
- レガシー形式（1.12-）

## 機能一覧

### ツール
| ツール | 説明 | 対応コマンド |
|--------|------|-------------|
| ポーション | ポーション生成 | /give |
| エンチャント | エンチャント付与 | /give |
| 鍛冶 | 防具トリム | /give |
| ... | ... | ... |

### 特殊機能
- リッチテキストエディター（カスタム名の色・書式設定）
- Minecraftプレビュー
- Wiki画像表示

## 利用可能スキル

### 開発支援
| スキル | 説明 |
|--------|------|
| /research | 最新情報調査 |
| /fact-check | 情報正確性検証 |
| /link-check | リンク切れ確認 |
| /update-readme | README更新 |

### 品質評価
| スキル | 説明 |
|--------|------|
| /evaluate | ページ品質評価 |
| /persona | ユーザー視点評価 |
| /review | 総合レビュー |

### 外部連携
| スキル | 説明 |
|--------|------|
| /gemini | Gemini CLI連携 |
| /codex | Codex CLI連携 |
| /mc-research | コマンド仕様調査 |

## コマンド

```bash
npm run dev              # 開発サーバー
npm run build            # 本番ビルド
npm run check:links      # リンク切れチェック
npm run mc:data:update   # Minecraftデータ更新
```

## 技術スタック
- フロントエンド: HTML / CSS / JavaScript（Vanilla SPA）
- ビルド: Vite
- デプロイ: GitHub Pages

## ディレクトリ構造
...

## 変更履歴
- YYYY-MM-DD: [変更内容]
- ...

## ライセンス
MIT

---
*Not affiliated with Mojang/Microsoft*
```

## 更新ロジック

### ツール一覧の自動生成

```javascript
// src/tools/*/manifest.json から収集
const tools = glob('src/tools/*/manifest.json')
  .map(f => JSON.parse(read(f)))
  .map(m => ({
    name: m.title,
    description: m.description,
    icon: m.iconItem,
  }));
```

### スキル一覧の自動生成

```javascript
// .claude/commands/*.md から収集
const skills = glob('.claude/commands/*.md')
  .map(f => ({
    name: path.basename(f, '.md'),
    description: extractFirstLine(f),
  }));
```

### バージョン情報の更新

```javascript
// data/generated/minecraft.json から取得
const mcVersion = require('./data/generated/minecraft.json').version;
```

## 出力フォーマット

```
=== README更新レポート ===

更新日時: [日時]
対象セクション: $ARGUMENTS

【更新内容】
1. [セクション名]: [変更概要]
2. [セクション名]: [変更概要]

【差分プレビュー】
--- 変更前
+++ 変更後
@@ -XX,X +XX,X @@
- 古い内容
+ 新しい内容

【確認】
README.mdを更新しますか？ (y/n)
```

## 実行例

```bash
# 全セクション更新
/update-readme all

# ツール一覧のみ更新
/update-readme tools

# スキル一覧更新
/update-readme commands

# 変更履歴追加
/update-readme changelog "リッチテキストエディター追加"
```

## 自動更新トリガー

以下の変更時に自動更新を推奨:

1. **新ツール追加時** → `/update-readme tools`
2. **新スキル追加時** → `/update-readme commands`
3. **バージョン更新時** → `/update-readme version`
4. **大きな機能追加時** → `/update-readme all`

## 連携スキル

- **/research** - 最新情報の収集
- **/fact-check** - 内容の検証
- **/review** - 最終確認
