# Codex CLI連携スキル

OpenAI Codex CLIを使用してコード生成・エラー解決を行います。
**ChatGPT Plusサブスクリプション**に含まれており、追加費用なしで利用できます。

## 使用方法

```
/codex タスク内容
```

## 実行されるコマンド

$ARGUMENTS を受け取り、Codex CLIを**非対話モード**で実行します：

```bash
codex exec "$ARGUMENTS"
```

> **非対話モード（`codex exec`）を使用する理由:**
> - Claude Codeからの自動呼び出しに最適（対話入力が不要）
> - 結果を出力して終了するので、バックグラウンド実行に適している
> - 入力待ちでハングアップしない

## コマンド例

```bash
# 非対話モード（推奨 - Claude Code連携用）
codex exec "Minecraftのsummonコマンドジェネレーターを作成"
codex exec "このエラーを修正: TypeError: Cannot read property"

# ヘルパースクリプト経由（非対話モード）
node scripts/codex-helper.js "タスク内容"
node scripts/codex-helper.js --error "エラーメッセージ"
node scripts/codex-helper.js --file path/to/file.js "修正内容"

# 対話モード（手動実行時のみ）
codex
```

## 自動発動条件

- 同じエラーが3回以上発生
- 「Codexで」「GPTで」と明示的に依頼
- Claude単体では解決困難なタスク

## このプロジェクトでの主な用途

- Minecraftコマンドパーサー・ジェネレーターの実装
- フロントエンドUIコンポーネントの作成
- SEO最適化コードの生成
- バグ修正・エラー解決

## 使用モデル

- **gpt-5.2-codex-high** - 高性能推論モード

## セットアップ

```bash
npm install -g @openai/codex
codex --login
```

## 必要なもの

- **ChatGPT Plus** ($20/月)
- Node.js
- Codex CLI v0.92.0以上

## 使用量上限について

使用量上限に達した場合、即座に報告し使用を停止します。
追加課金を防ぐため、制限が回復するまで該当CLIは使用しません。
