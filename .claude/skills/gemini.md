# Gemini CLI 連携スキル

Google Gemini CLI を使用してリサーチ・コード生成を行います。

## 重要: Gemini 3系のみ使用

**使用可能なモデル**:
- `gemini-3-pro-preview` - 詳細な調査、複雑なタスク
- `gemini-3-flash-preview` - 高速処理、簡易タスク

**使用禁止**:
- Gemini 2.5系（gemini-2.5-pro, gemini-2.5-flash等）は絶対に使用しない

## 今日の日付

2026年1月31日

すべての調査・リサーチには必ずこの日付を含めてください。

## 正しいコマンド形式

```bash
# 推奨: Gemini 3 Pro（非対話モード）
gemini -m gemini-3-pro-preview "今日は2026年1月31日です。[質問]"

# 高速: Gemini 3 Flash
gemini -m gemini-3-flash-preview "今日は2026年1月31日です。[質問]"
```

## プロジェクトでの主な用途

- Minecraft バージョン別ブロック/アイテム調査
- WorldEdit コマンド仕様調査
- エンチャント/ポーション効果名調査
- 最新アップデート情報収集

## コマンド例

```bash
# Minecraft ブロック調査
gemini -m gemini-3-pro-preview "今日は2026年1月31日です。Minecraft Java Edition 1.21.11で追加されたブロックを教えてください。"

# WorldEdit コマンド調査
gemini -m gemini-3-pro-preview "今日は2026年1月31日です。WorldEditの//setbiomeコマンドの使い方を教えてください。"
```

## 使用量上限について

使用量上限に達した場合、即座に報告し使用を停止します。
