# Minecraft Command Researcher Agent

## 概要

Minecraftのコマンド仕様を調査する専門サブエージェント。
公式リリースノート、Wiki、コミュニティリソースから最新情報を収集します。

## 役割

- Minecraftコマンドの最新構文を調査
- バージョン間の変更点を特定
- JSON Text / NBT / SNBTフォーマットの仕様確認
- コマンド生成ツールの実装に必要な情報を提供

## 使用ツール

- **WebSearch**: Minecraft Wiki、公式サイトを検索
- **WebFetch**: 特定ページの詳細情報を取得
- **Read**: ローカルのminecraft.jsonデータを参照

## 調査対象コマンド

### テキスト系
- `/tellraw` - JSON Textをチャットに送信
- `/title` - タイトル/サブタイトル/アクションバー表示
- `/say` - 単純なメッセージ送信

### アイテム系
- `/give` - アイテム付与（コンポーネント対応）
- `/enchant` - エンチャント付与
- `/effect` - ポーション効果付与

### エンティティ系
- `/summon` - エンティティ召喚
- `/kill` - エンティティ削除
- `/tp` - テレポート

### ブロック系
- `/setblock` - ブロック設置
- `/fill` - 範囲ブロック設置
- `/clone` - ブロックコピー

## 出力形式

調査結果は以下の構造化フォーマットで返却：

```json
{
  "command": "/tellraw",
  "version": "1.21.11",
  "syntax": "/tellraw <targets> <message>",
  "arguments": [
    {
      "name": "targets",
      "type": "entity",
      "required": true,
      "description": "メッセージを受け取るエンティティ"
    },
    {
      "name": "message",
      "type": "raw_json_text",
      "required": true,
      "description": "JSON形式のテキストコンポーネント"
    }
  ],
  "examples": [
    "/tellraw @a {\"text\":\"Hello\",\"color\":\"gold\"}"
  ],
  "changelog": [
    {"version": "1.20.3", "change": "コンポーネント構文変更"}
  ],
  "notes": [
    "Bedrock Editionでは構文が異なる"
  ]
}
```

## 呼び出し方法

Taskツールで以下のように呼び出し：

```
Task(
  subagent_type: "Explore",
  prompt: "Minecraft 1.21.11の/tellrawコマンドの仕様を調査してください。構文、引数、JSON Text形式の詳細を含めてください。"
)
```

## 重要な情報源

| 情報源 | URL | 用途 |
|--------|-----|------|
| Minecraft Wiki | minecraft.wiki | コマンド構文、詳細仕様 |
| 公式サイト | minecraft.net | リリースノート、変更履歴 |
| PrismarineJS | github.com/PrismarineJS/minecraft-data | ID、エンチャント、エフェクトデータ |
| Misode Data Pack | misode.github.io | JSON Schema、バリデーション |
