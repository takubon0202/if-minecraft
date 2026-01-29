# Minecraft Command Tool Hub

Minecraft Java Edition 1.21.11 対応のコマンド生成ツール集。

## 機能

- **ID Browser**: アイテム・エンティティ・ブロックIDの検索
- **/give Generator**: アイテム付与コマンドの生成（エンチャント、コンポーネント対応）
- **/summon Generator**: エンティティ召喚コマンドの生成（NBT、エフェクト対応）

## 技術スタック

- **Vanilla JS** (ES Modules)
- **Vite** (ビルド & 開発サーバー)
- **CSS Custom Properties** (Minecraft風テーマ)

## 開発

```bash
# 依存関係のインストール
npm install

# Minecraftデータの更新
npm run mc:data:update

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build
```

## デプロイ

GitHub Pages に自動デプロイされます（main ブランチへのプッシュ時）。

## ライセンス

MIT

---

Built with Claude Opus 4.5 & Gemini 3 Pro
