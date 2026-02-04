# MC Tool Hub - Minecraft Command Generator

Minecraft Java Edition **1.12.2 〜 1.21.11** 対応のコマンド生成ツール ポータルサイト。
Vanilla JavaScript による軽量・高速な SPA アーキテクチャを採用。
マルチバージョン対応で、各バージョンに適したコマンド構文を自動生成。

> **Note**: This project is not affiliated with Mojang Studios or Microsoft.

---

## 目次

- [機能](#機能)
- [デモ](#デモ)
- [技術スタック](#技術スタック)
- [ツール一覧](#ツール一覧)
- [プロジェクト構造](#プロジェクト構造)
- [開発環境セットアップ](#開発環境セットアップ)
- [npm スクリプト](#npm-スクリプト)
- [アーキテクチャ](#アーキテクチャ)
- [ツールプラグインシステム](#ツールプラグインシステム)
- [AI CLI 統合](#ai-cli-統合)
- [品質評価システム](#品質評価システム)
- [データ管理](#データ管理)
- [デプロイ](#デプロイ)
- [今後の開発予定](#今後の開発予定)
- [ライセンス](#ライセンス)

---

## 機能

### 主要機能

- **17種類のツール**: リファレンス、コマンド生成、テキスト系
- **マルチバージョン対応**: 1.12.2〜1.21.11の5つのバージョングループに対応
- **Minecraft Wiki画像**: 公式Wiki準拠のアイテム・エンティティ画像
- **Minecraft風ツールチップ**: ホバー時にゲーム内UIスタイルで表示
- **ゲーム画面風プレビュー**: インベントリスロット風のリアルタイムプレビュー
- **ダークモード対応**: 各ツール固有のテーマカラー
- **タブ管理**: 複数ツールの同時利用
- **コマンド履歴**: 生成したコマンドの自動保存

### バージョン対応

| バージョングループ | 対応バージョン | コマンド形式 |
|-------------------|---------------|--------------|
| **latest** | 1.21+ | コンポーネント形式（最新） |
| **component** | 1.20.5〜1.20.6 | コンポーネント形式 |
| **nbt-modern** | 1.16〜1.20.4 | NBT形式（モダン） |
| **nbt-legacy** | 1.13〜1.15 | NBT形式（レガシー） |
| **legacy** | 1.12.2以前 | 数値ID形式 |

### 特別機能

- **Antigravity エフェクト**: Google Antigravity インスパイアの物理演出（Konami Code で発動）
- **共有機能**: URLパラメータによるコマンド共有
- **オートコンプリート**: アイテム・エンティティIDの入力補完
- **カスタム名の色選択**: Minecraft標準16色から選択可能

---

## デモ

**GitHub Pages**: https://takubon0202.github.io/if-minecraft/

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| **言語** | Vanilla JavaScript (ES Modules) |
| **ビルド** | Vite 5.x |
| **スタイル** | CSS Custom Properties（Minecraft風テーマ） |
| **状態管理** | カスタム Flux パターン（Observer） |
| **ルーティング** | Hash-based Router（GitHub Pages対応） |
| **物理エンジン** | Matter.js（Antigravity用） |
| **CI/CD** | GitHub Actions |
| **ホスティング** | GitHub Pages |

---

## ツール一覧

### リファレンス（5種）

| ツール | 説明 | 機能 |
|--------|------|------|
| **ID Browser** | Minecraft ID 検索 | アイテム・エンティティ・ブロックIDの検索・コピー |
| **Block IDs** | ブロックID一覧 | カテゴリ別ブロック検索、Wiki画像付き |
| **Color Codes** | カラーコード一覧 | 16色+装飾コード、プレビュー付き |
| **Target Selector** | ターゲットセレクター | @p/@a/@r/@e/@sの引数生成 |
| **Coordinate** | 座標ヘルパー | 絶対/相対/ローカル座標変換 |

### コマンド生成（7種）

| ツール | 説明 | 機能 |
|--------|------|------|
| **/give Generator** | アイテム付与 | エンチャント、コンポーネント、カスタム名、Lore、インベントリ風プレビュー |
| **/summon Generator** | エンティティ召喚 | 80種+エンティティ、NBT、エフェクト、JSONテキスト、エンティティスロットプレビュー |
| **Zombie Summoner** | 最強ゾンビ生成 | 装備6スロット、エンチャント、属性、プリセット |
| **/enchant Generator** | エンチャント | 全42種、最大Lv255、カテゴリ別プリセット、カスタム名色選択、属性追加 |
| **/potion Generator** | ポーション | 全33種エフェクト、4タイプ、カテゴリ別プリセット、カスタムカラー |
| **Smithing Generator** | 鍛冶型 | 19種トリムパターン、11種素材、防具プレビュー |
| **WorldEdit** | WorldEditコマンド生成 | 69種コマンド、615ブロック対応、エンティティ操作、バイオーム変更 |

### テキスト系（6種）

| ツール | 説明 | 機能 |
|--------|------|------|
| **JSON Text** | JSONテキスト生成 | 16色、スタイル、クリック/ホバーイベント |
| **/tellraw Generator** | tellrawコマンド | 複数セグメント、プレビュー |
| **/title Generator** | titleコマンド | title/subtitle/actionbar |
| **Sign Editor** | 看板テキスト | 4行編集、発光テキスト対応 |
| **Book Editor** | 本テキスト | 複数ページ、署名設定 |

### エンチャントツールの詳細機能

| 機能 | 説明 |
|------|------|
| **カテゴリ別プリセット** | 攻撃/採掘/防御/遠距離/極限の5カテゴリに分類されたプリセット |
| **レベル入力UI** | グリッド内で直接レベル設定（1〜255、Max/255ボタン付き） |
| **カスタム名の色選択** | Minecraft標準16色から選択、プレビューにリアルタイム反映 |
| **属性追加** | 攻撃力、移動速度、最大体力などの属性を追加可能 |
| **マルチバージョン対応** | 1.12.2〜1.21.11の各バージョンに適したコマンド構文を自動生成 |

### ポーションツールの詳細機能

| 機能 | 説明 |
|------|------|
| **カテゴリ別プリセット** | 戦闘/ユーティリティ/探検/極限の4カテゴリに分類されたプリセット |
| **効果レベル・時間設定** | グリッド内で直接レベルと持続時間を設定 |
| **無限効果** | 持続時間を無限（-1）に設定可能 |
| **4種ポーションタイプ** | 通常/スプラッシュ/残留/効果付きの矢 |
| **カスタムカラー** | ポーション液体の色をカスタマイズ |

### WorldEditツールの詳細機能

| 機能 | 説明 |
|------|------|
| **69種コマンド** | 選択範囲、ブロック編集、クリップボード、図形生成、ブラシ、ユーティリティ、ナビゲーション、バイオーム、スナップショット、エンティティ |
| **615ブロック対応** | 1.12〜1.21.11の全バージョンブロック（22カテゴリ） |
| **エンティティ操作** | /remove、//copy -e、//paste -e、//butcher（10種フラグ） |
| **バイオーム変更** | 57種バイオーム対応（//setbiome、//replacebiome） |
| **ブロック状態指定** | facing、axis、half、waterloggedなどプリセット付き |
| **マスク・パターン** | 複数ブロックのランダム配置、条件付き置換 |

### WorldEditエンティティタイプ（17種）

| カテゴリ | タイプ |
|----------|--------|
| **エイリアス** | items, arrows, boats, minecarts, tnt, xp, paintings, itemframes, armorstands, endercrystals |
| **投擲物** | snowball, egg, ender_pearl, trident, firework_rocket |
| **その他** | falling_block, lightning_bolt |

### カスタム名の色（16色）

| 色 | ID | 用途 |
|----|-----|------|
| 白/黄/金/水色 | white/yellow/gold/aqua | 明るい色、タイトル向け |
| 黄緑/青/ピンク/赤 | green/blue/light_purple/red | 強調色、重要アイテム向け |
| 灰/暗灰/青緑/緑 | gray/dark_gray/dark_aqua/dark_green | 落ち着いた色 |
| 紺/紫/暗赤/黒 | dark_blue/dark_purple/dark_red/black | ダーク系、呪いアイテム向け |

### 各ツールのテーマカラー

| ツール | テーマ | カラー |
|--------|--------|--------|
| エンチャント | エンチャント光 | 紫/マゼンタ |
| ポーション | ポーション色 | ピンク/赤紫 |
| ブロックID | 土/草ブロック | 茶/緑 |
| 鍛冶型 | ネザライト/銅 | オレンジ/銅 |
| ゾンビ召喚 | ゾンビ肌 | 緑/暗緑 |
| Summon | コマンドブロック | 青紫/紺 |
| JSONテキスト | エンチャント本 | 紫/マゼンタ |

---

## プロジェクト構造

```
if-minecraft/
├── .claude/                    # Claude CLI 設定
│   ├── commands/               # カスタムコマンド
│   │   ├── codex.md           # Codex CLI 連携（非対話モード）
│   │   ├── antigravity.md     # Antigravity 物理演出
│   │   ├── evaluate.md        # ページ品質評価
│   │   ├── persona.md         # ペルソナ視点評価
│   │   └── review.md          # 総合レビュー
│   ├── skills/                 # スキルファイル
│   │   ├── gemini.md          # Gemini CLI 連携（3系のみ）
│   │   └── research.md        # リサーチスキル
│   └── settings.json          # AI CLI 統合設定
│
├── src/                        # ソースコード
│   ├── index.html             # エントリーポイント
│   │
│   ├── app/                   # アプリケーション層
│   │   ├── app.js             # メインエントリー
│   │   ├── shell.js           # App Shell
│   │   ├── tabs.js            # タブ管理
│   │   ├── nav.js             # ナビゲーション
│   │   └── sidepanel.js       # サイドパネル
│   │
│   ├── core/                  # コアライブラリ
│   │   ├── router.js          # ハッシュルーター
│   │   ├── store.js           # 状態管理
│   │   ├── dom.js             # DOM ユーティリティ
│   │   ├── clipboard.js       # クリップボード操作
│   │   ├── storage.js         # LocalStorage
│   │   ├── share.js           # 共有機能
│   │   ├── wiki-images.js     # Wiki画像URL生成
│   │   ├── mc-tooltip.js      # Minecraft風ツールチップ
│   │   └── version-compat.js  # マルチバージョン対応
│   │
│   ├── styles/                # スタイルシート
│   │   ├── theme.css          # Minecraft テーマ
│   │   ├── app.css            # アプリスタイル
│   │   └── antigravity.css    # 物理演出スタイル
│   │
│   ├── scripts/               # クライアントスクリプト
│   │   └── antigravity.js     # Matter.js 物理演出
│   │
│   └── tools/                 # ツールプラグイン（18種）
│       ├── id-browser/        # ID ブラウザ
│       ├── block-ids/         # ブロックID一覧
│       ├── color-codes/       # カラーコード
│       ├── target-selector/   # ターゲットセレクター
│       ├── coordinate/        # 座標ヘルパー
│       ├── give/              # /give ジェネレーター
│       ├── summon/            # /summon ジェネレーター
│       ├── summon-zombie/     # ゾンビ召喚
│       ├── enchant/           # エンチャント
│       ├── potion/            # ポーション
│       ├── smithing/          # 鍛冶型
│       ├── worldedit/         # WorldEditコマンド
│       ├── json-text/         # JSONテキスト
│       ├── tellraw/           # tellraw
│       ├── title/             # title
│       ├── sign/              # 看板
│       └── book/              # 本
│
├── data/generated/            # Minecraftデータ
├── docs/                      # ドキュメント
├── scripts/                   # ヘルパースクリプト
├── CLAUDE.md                  # Claude 用コンテキスト
├── package.json               # npm 設定
├── vite.config.js             # Vite 設定
└── README.md                  # このファイル
```

---

## 開発環境セットアップ

### 必須要件

- Node.js 20.x 以上
- npm 10.x 以上
- Git

### オプション（AI CLI 統合）

- Claude CLI（Claude Code）
- Codex CLI 0.92.0+
- Gemini CLI 0.26.0+

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/takubon0202/if-minecraft.git
cd if-minecraft

# 依存関係をインストール
npm install

# Minecraft データを取得
npm run mc:data:update

# データを検証
npm run mc:data:validate

# 開発サーバーを起動
npm run dev
```

開発サーバーが起動します。アクセス先: http://localhost:3000/if-minecraft/

---

## npm スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動（自動リロード） |
| `npm run build` | 本番ビルド（`dist/` に出力） |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run mc:data:update` | Minecraft データを最新版に更新 |
| `npm run mc:data:validate` | データの整合性を検証 |

---

## アーキテクチャ

### App Shell パターン

```
┌─────────────────────────────────────────────────────────────┐
│                        Header                                │
├──────────┬────────────────────────────────┬─────────────────┤
│          │         Tab Bar                │                 │
│   Left   ├────────────────────────────────┤    Side         │
│   Nav    │                                │    Panel        │
│          │       Main Content             │                 │
│  (Tools) │       (Tool UI)                │  (Output/       │
│          │                                │   History/      │
│          │                                │   Help)         │
└──────────┴────────────────────────────────┴─────────────────┘
```

### 状態管理（Flux パターン）

```javascript
// store.js - Observable Store
const store = createStore(initialState);

// 購読
store.subscribe((state, prevState) => {
  // 状態変更時の処理
});

// 更新
store.set({ key: value });
store.update(state => ({ ...state, key: value }));
```

### ルーティング

ハッシュベースのルーティングで GitHub Pages に対応。

```
https://example.com/if-minecraft/#/tool/give
                                  ↑
                            Hash Router
```

---

## ツールプラグインシステム

各ツールは独立したプラグインとして実装されています。

### ファイル構成

```
tools/[tool-name]/
├── manifest.js    # メタデータ定義
├── ui.js          # UI レンダリング・イベント
└── engine.js      # コマンド生成ロジック（任意）
```

### マニフェスト例

```javascript
// manifest.js
export const manifest = {
  id: 'give',
  title: '/give コマンド',
  description: 'アイテム付与コマンドを生成',
  category: 'generator',
  keywords: ['give', 'item', 'enchant'],
  icon: '🎁',
  version: '1.0.0',
};
```

### UI 実装例

```javascript
// ui.js
import { getInviconUrl } from '../../core/wiki-images.js';
import { applyTooltip } from '../../core/mc-tooltip.js';

export function render(manifest) {
  return `<div class="tool-panel">...</div>`;
}

export function init(container) {
  // イベントリスナー設定
}
```

### 新しいツールの追加方法

1. `src/tools/[tool-name]/` ディレクトリを作成
2. `manifest.js`、`ui.js`（必要なら `engine.js`）を作成
3. `src/app/app.js` の `TOOLS` 配列にインポートを追加

---

## AI CLI 統合

このプロジェクトは複数の AI CLI ツールを統合した開発ワークフローを採用しています。

### AI 役割分担

| AI | 担当領域 | モデル |
|----|----------|--------|
| **Claude Opus 4.5** | 基本構築、コア機能、データ層、全体統括 | claude-opus-4-5 |
| **Gemini 3 Pro** | ページデザイン、UI/UX、コマンド解説 | gemini-3-pro-preview |
| **Gemini 3 Flash** | 高速処理、軽量タスク | gemini-3-flash-preview |
| **Codex** | コード生成、最適化、エラー解決 | gpt-5.2-codex-high |

### Claude カスタムコマンド

| コマンド | 説明 | 実行内容 |
|----------|------|----------|
| `/codex [タスク]` | Codex CLI 呼び出し（非対話モード） | `echo "[タスク]" \| codex exec - --sandbox read-only` |
| `/gemini [タスク]` | Gemini CLI 呼び出し | `gemini -m gemini-3-pro-preview "[タスク]"` |
| `/research [内容]` | 最新情報リサーチ | 日付付きでGemini 3 Proに調査依頼 |
| `/antigravity` | 物理演出実装 | Matter.js による Antigravity 効果 |
| `/evaluate` | ページ品質評価 | SEO、事業内容、分かりやすさ、申込意欲 |
| `/persona` | ペルソナ視点評価 | 初心者・中級・上級の3ペルソナ |
| `/review` | 総合レビュー | `/evaluate` + `/persona` 統合 |

### AI CLI 使用ルール

**Gemini（Gemini 3系のみ使用）:**
```bash
gemini -m gemini-3-pro-preview "今日は2026年2月4日です。[質問]"
```
- Gemini 2.5系は使用禁止

**Codex（非対話モード必須）:**
```bash
echo "今日は2026年2月4日です。[質問]" | codex exec - --sandbox read-only
```
- `codex exec -` 形式でstdinからプロンプトを渡す

### Gemini CLI 拡張機能

このプロジェクトでは以下のGemini CLI拡張機能を使用しています。

| 拡張機能 | バージョン | 用途 | コマンド |
|----------|------------|------|----------|
| **code-review** | 0.1.0 | コードレビュー自動化 | `/code-review` |
| **conductor** | 0.2.0 | 機能計画策定・実装管理 | - |
| **gemini-cli-jules** | 0.1.0 | 非同期コーディングエージェント | `/jules [タスク]` |
| **gemini-cli-security** | 0.4.0 | セキュリティ脆弱性分析 | `/security:analyze` |
| **nanobanana** | 1.0.10 | 画像生成・編集・復元 | `/icon`, `/pattern`, `/diagram`, `/edit`, `/restore` |

#### Jules（非同期エージェント）

バックグラウンドでコーディングタスクを実行し、GitHubにPRを作成します。

```bash
# Gemini CLI対話モードで
/jules このファイルにユニットテストを追加して
/jules プロジェクト全体のコードフォーマットを統一して
/jules status  # 進捗確認
```

適したタスク: ユニットテスト追加、コードリファクタリング、依存関係アップグレード

#### Security（脆弱性分析）

```bash
# 包括的スキャン
/security:analyze
```

検出可能な脆弱性:
- ハードコードされた秘密（APIキー、パスワード）
- アクセス制御の欠陥（IDOR、権限昇格）
- インジェクション（SQLi、XSS、コマンドインジェクション）
- 認証の問題
- LLM安全性（プロンプトインジェクション）
- プライバシー違反

重大度レベル: Critical / High / Medium / Low

#### Nano Banana（画像生成）

```bash
# アイコン生成
/icon Minecraft風のダイヤソード 32x32 --count=3 --styles=pixel-art

# シームレスパターン
/pattern 石レンガテクスチャ --seamless --density=medium

# ダイアグラム
/diagram システム構成図 --labels
```

#### 拡張機能管理

```bash
# 一覧表示
gemini extensions list

# インストール
gemini extensions install https://github.com/gemini-cli-extensions/[name] --auto-update

# 有効化/無効化
gemini extensions enable [name]
gemini extensions disable [name]
```

---

## 品質評価システム

### /evaluate コマンド

ページ品質を4観点で採点（各25点、合計100点）。

| 観点 | 評価項目 |
|------|----------|
| **SEO** (25点) | メタタグ、見出し構造、画像alt、構造化データ |
| **事業内容の明確さ** (25点) | サービス内容、ターゲット、差別化 |
| **分かりやすさ** (25点) | 文章、用語説明、ナビゲーション |
| **申込意欲** (25点) | CTA配置、メリット、利用手順 |

**合格基準**: 90点以上

### /persona コマンド

3つのターゲットペルソナ視点で評価。

| ペルソナ | プロフィール | 評価観点 |
|----------|--------------|----------|
| **太郎くん** | 12歳、3ヶ月プレイ歴 | 初心者でも使えるか |
| **花子さん** | 16歳、2年プレイ歴 | 中級者に便利な機能があるか |
| **けんじさん** | 24歳、8年プレイ歴 | 上級者向けの細かい設定が可能か |

---

## データ管理

### ブロックデータ（src/data/blocks.js）

WorldEditツール用の包括的なブロックデータベース。

| 項目 | 値 |
|------|-----|
| **総ブロック数** | 615個 |
| **対応バージョン** | 1.12〜1.21.11（47バージョン） |
| **カテゴリ数** | 22種類 |

#### バージョン別ブロック数

| バージョン | ブロック数 | 追加内容 |
|-----------|----------|----------|
| 1.21.11 | 615 | 1.21.10/11はブロック追加なし |
| 1.21.9 | 615 | 棚12種、銅製品6種+酸化バリエーション |
| 1.21.6 | 569 | dried_ghast_block |
| 1.21.5 | 568 | 茂み、ホタルの茂み、野草など7種 |
| 1.21.4 | 561 | ペールガーデン30種（ペールオーク、レジン） |
| 1.21 | 531 | トライアルチャンバー関連 |
| 1.20 | 465 | サクラ、考古学関連 |
| 1.12 | 262 | ベースブロック |

### Minecraft データ構造

```json
// data/generated/1.21.11/registries.json
{
  "minecraft:item": { "entries": {...} },
  "minecraft:block": { "entries": {...} },
  "minecraft:entity_type": { "entries": {...} },
  "minecraft:mob_effect": { "entries": {...} },
  "minecraft:enchantment": { "entries": {...} }
}
```

### データ更新スクリプト

```bash
# データを最新化
npm run mc:data:update

# データを検証
npm run mc:data:validate
```

---

## デプロイ

### GitHub Pages 自動デプロイ

`main` ブランチへのプッシュで自動的にデプロイされます。

**ワークフロー**: `.github/workflows/pages.yml`

```
実行フロー:
1. Checkout
2. Node.js 20 セットアップ
3. npm ci（依存関係インストール）
4. npm run build（Vite ビルド）
5. GitHub Pages へデプロイ
```

### 手動デプロイ

```bash
# ビルド
npm run build

# dist/ フォルダを任意のホスティングにアップロード
```

---

## 今後の開発予定

### 完了した機能

- [x] マルチバージョン対応（1.12.2〜1.21.11）
- [x] ゲーム画面風プレビュー（インベントリスロット、ツールチップ）
- [x] カテゴリ別プリセット（エンチャント、ポーション）
- [x] カスタム名の色選択（16色対応）
- [x] レベル入力UI（グリッド内直接入力）

### Phase 2 - ツール拡充

- [ ] `/execute` コマンドジェネレーター
- [ ] `/fill` コマンドジェネレーター
- [ ] `/setblock` コマンドジェネレーター
- [ ] `/tp` コマンドジェネレーター
- [ ] NBT エディター（ビジュアル）

### Phase 3 - 高度な機能

- [ ] コマンドブロック連携ガイド
- [ ] データパック生成
- [ ] リソースパック生成
- [ ] Bedrock Edition 対応

### Phase 4 - コミュニティ

- [ ] コマンド共有ギャラリー
- [ ] ユーザー投稿テンプレート
- [ ] 多言語対応（i18n）

---

## ライセンス

MIT License

---

## クレジット

| 担当 | AI/技術 |
|------|---------|
| 基本構築 | Claude Opus 4.5 |
| UI/UXデザイン | Gemini 3 Pro |
| コード最適化 | Codex (GPT 5.2) |
| 物理エンジン | Matter.js |
| ビルドツール | Vite |
| アイコン画像 | Minecraft Wiki |

---

**Not affiliated with Mojang Studios or Microsoft.**

Built with Claude Opus 4.5 & Gemini 3 Pro & Codex
