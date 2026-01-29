# Gemini CLI連携スキル

Google Gemini CLIを使用してコード生成・エラー解決を行います。
**Gemini AI Pro サブスクリプション**に含まれており、追加費用なしで利用できます。

## 使用方法

```
/gemini タスク内容
```

## 実行されるコマンド

$ARGUMENTS を受け取り、Gemini CLIを実行します：

```bash
gemini -m gemini-3-pro-preview "$ARGUMENTS"
```

## 利用可能なモデル

### メイン（常にこちらを使用）

| モデル | 説明 | 用途 |
|--------|------|------|
| `gemini-3-pro-preview` | **推奨** - 最高品質の推論・コーディング | 複雑なタスク、設計、分析 |
| `gemini-3-flash-preview` | **高速** - 低レイテンシ | 単純なタスク、素早い回答 |

### フォールバック（エラー時のみ）

| モデル | 説明 |
|--------|------|
| `gemini-2.5-pro` | Gemini 3がエラーの場合のみ使用 |
| `gemini-2.5-flash` | Gemini 3 Flashがエラーの場合のみ使用 |

> **注意**: 2.5系は通常使用しません。Gemini 3系でエラーが発生した場合のみフォールバックとして使用してください。

## コマンド例

```bash
# 推奨：Gemini 3 Pro（デフォルト）
gemini "Minecraftのgiveコマンドを解説して"
gemini -m gemini-3-pro-preview "複雑なコマンドブロックシステムを設計"

# 高速処理：Gemini 3 Flash
gemini -m gemini-3-flash-preview "エンチャントIDの一覧を教えて"

# 自動承認モード（YOLO）
gemini -y "ファイルを修正して"
gemini --yolo "テストを実行"

# 対話モード
gemini
```

## このプロジェクトでの主な用途

- Minecraftコマンドの詳細解説
- コマンド構文の検証・デバッグ
- SEOコンテンツの生成・最適化
- マルチモーダル処理（画像からコマンド抽出等）

## Agent Skills

```bash
gemini skills list       # スキル一覧
gemini skills enable X   # スキル有効化
gemini skills disable X  # スキル無効化
```

## 拡張機能

```bash
gemini extensions list        # 拡張機能一覧
gemini extensions install X   # インストール
```

## セットアップ

```bash
npm install -g @google/gemini-cli
gemini  # 初回起動時にGoogleログイン
```

## 必要なもの

- **Gemini AI Pro** サブスクリプション ($19.99/月)
- Node.js

OAuth認証のみで利用可能。APIキーは不要です。

## 使用量上限について

使用量上限に達した場合、即座に報告し使用を停止します。
追加課金を防ぐため、制限が回復するまで該当CLIは使用しません。
