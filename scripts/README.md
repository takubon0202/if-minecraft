# AI CLIヘルパースクリプト

このディレクトリには、AI CLI（Codex/Gemini）との連携を効率化するヘルパースクリプトが含まれています。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `codex-helper.js` | OpenAI Codex CLI連携スクリプト |
| `gemini-helper.js` | Google Gemini CLI連携スクリプト |

## セットアップ

### 1. CLIのインストール

```bash
# Codex CLI
npm install -g @openai/codex

# Gemini CLI
npm install -g @google/gemini-cli
```

### 2. ログイン

```bash
# Codex（ChatGPT Plusアカウント）
codex --login

# Gemini（Googleアカウント）
gemini  # 初回起動時にブラウザでログイン
```

## 使用方法

### Codex Helper

```bash
# 基本的なタスク
node scripts/codex-helper.js "タスク内容"

# エラー解決
node scripts/codex-helper.js --error "エラーメッセージ"

# ファイル修正
node scripts/codex-helper.js --file path/to/file.js "修正内容"

# Minecraft関連タスク
node scripts/codex-helper.js --minecraft "コマンドジェネレーターを実装"

# 対話モード
node scripts/codex-helper.js --interactive
```

### Gemini Helper

```bash
# 基本的なタスク（Gemini 3 Pro）
node scripts/gemini-helper.js "タスク内容"

# 高速処理（Gemini 3 Flash）
node scripts/gemini-helper.js --fast "簡単な質問"

# エラー解決
node scripts/gemini-helper.js --error "エラーメッセージ"

# ファイル修正
node scripts/gemini-helper.js --file path/to/file.js "修正内容"

# Minecraft関連タスク
node scripts/gemini-helper.js --minecraft "コマンドジェネレーターを実装"

# 対話モード
node scripts/gemini-helper.js --interactive

# 自動承認モード（YOLO）
node scripts/gemini-helper.js --yolo "タスク内容"
```

## モデル一覧

### Codex
- `gpt-5.2-codex` - デフォルト

### Gemini

| 優先度 | モデル | 用途 |
|--------|--------|------|
| 1 | `gemini-3-pro-preview` | 推奨・デフォルト |
| 2 | `gemini-3-flash-preview` | 高速処理用 |
| 3 | `gemini-2.5-pro` | フォールバック |
| 4 | `gemini-2.5-flash` | フォールバック |

## サブスクリプション

| CLI | サブスク | 月額 |
|-----|---------|------|
| Codex | ChatGPT Plus | $20 |
| Gemini | Gemini AI Pro | $19.99 |

## 注意事項

### 使用量上限

使用量上限に達した場合：
1. 即座に「上限に達しました」と報告
2. 制限が回復するまで該当CLIは使用しない
3. 代替として上限に達していない別のCLIを提案

これは追加課金を防ぐための重要なルールです。

### 自動承認モード

- **Codex**: `approval_policy = "never"` （デフォルトで自動承認）
- **Gemini**: `yolo = true` （デフォルトで自動承認）

### 非対話モード

Claude Code連携時は必ず非対話モードを使用してください：
- Codex: `codex exec "タスク"`
- Gemini: 通常の `gemini "タスク"` で非対話実行可能
