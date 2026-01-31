# MC Tool Hub - Minecraft コマンド生成ツール

## プロジェクト概要

Minecraft Java Edition 1.21.11対応のコマンド生成ツールポータルサイト。
将来のバージョン（1.26.1等）にも対応できる設計。

## 技術スタック

- **フロントエンド**: HTML / CSS / JavaScript（Vanilla SPA）
- **ビルド**: Vite（静的出力）
- **デプロイ**: GitHub Pages

## AI役割分担

| AI | 担当領域 |
|----|---------|
| **Claude Opus 4.5** | 基本構築、App Shell、コア機能、データ層 |
| **Gemini 3 Pro** | ページデザイン、Google Antigravity演出、UI/UX、リサーチ |
| **Codex** | コード生成、ツールエンジン、最適化 |

## Gemini使用ルール（重要）

- **使用可能**: `gemini-3-pro-preview`, `gemini-3-flash-preview` のみ
- **使用禁止**: Gemini 2.5系（gemini-2.5-pro, gemini-2.5-flash等）は絶対に使用しない
- **リサーチ時**: 必ず「今日は2026年1月31日です」をプロンプトに含める

```bash
# 正しい使用法
gemini -m gemini-3-pro-preview "今日は2026年1月31日です。[質問]"
```

## ディレクトリ構造

```
if-minecraft/
├── CLAUDE.md              # このファイル
├── agents/                # サブエージェント定義
├── docs/                  # ドキュメント
├── scripts/               # データ更新スクリプト
├── data/generated/        # Minecraftデータ
├── public/                # 静的アセット
└── src/                   # ソースコード
    ├── index.html
    ├── styles/
    ├── core/              # コアライブラリ
    ├── app/               # アプリケーション
    └── tools/             # ツールプラグイン
```

## コマンド

```bash
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run mc:data:update   # Minecraftデータ更新
npm run mc:data:validate # データ検証
```

## 対応バージョン

- Minecraft Java Edition 1.21.11（現在）
- 将来バージョン対応設計

## 重要な注意事項

- 外部サイトのコード・デザインはコピーしない
- 機能パリティのみ参考にし、オリジナル実装
- フッターに "Not affiliated with Mojang/Microsoft" を明記
