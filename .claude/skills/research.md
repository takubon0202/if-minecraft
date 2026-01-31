# Research スキル - Minecraft 最新情報調査

今日の日付（2026年1月31日）時点の最新情報を調査します。

## 使用方法

```
/research <調査内容>
```

## 重要な設定

**必ずGemini 3系のみを使用**:
- `gemini-3-pro-preview` - 詳細な調査
- `gemini-3-flash-preview` - 簡易な調査

**絶対にGemini 2.5系は使用禁止**

## 調査時のプロンプト形式

```bash
gemini -m gemini-3-pro-preview "今日は2026年1月31日です。[調査内容]"
```

## 調査対象例

- Minecraft Java Edition のバージョン別追加ブロック
- WorldEdit コマンド仕様
- エンチャント/ポーション効果の正式名称
- バイオーム情報
- アップデート内容

## 実行例

```bash
# バージョン別ブロック調査
gemini -m gemini-3-pro-preview "今日は2026年1月31日です。Minecraft Java Edition 1.21.5から1.21.11までで追加されたブロックを全て教えてください。"

# WorldEditコマンド調査
gemini -m gemini-3-pro-preview "今日は2026年1月31日です。WorldEdit 7.xの全コマンドと引数を教えてください。"
```

## 注意事項

- 必ず「今日は2026年1月31日です」を調査プロンプトに含める
- Gemini 2.5系は絶対に使用しない
- 調査結果はファクトチェック前に実装に使用可能
