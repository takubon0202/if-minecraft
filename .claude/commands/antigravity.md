# Antigravity スキル

Google Antigravity（https://antigravity.google/）インスパイアの物理演出をページに適用します。

## 使用方法

```
/antigravity [オプション]
```

## 機能

### 1. 重力落下エフェクト
ページ上の要素が重力に従って落下し、画面下部に積み重なります。

### 2. インタラクティブ操作
- マウスドラッグで要素を掴んで移動
- 投げると慣性で飛んでいく
- 要素同士が衝突して跳ね返る

### 3. イースターエッグ
- Konami Code（↑↑↓↓←→←→BA）で重力反転
- デバイスシェイクで要素散乱
- ダブルクリックで要素爆発

## 実行されるコマンド

```bash
gemini -m gemini-3-pro "Antigravity効果をページに実装: $ARGUMENTS"
```

## オプション

```bash
/antigravity                    # デフォルト設定で適用
/antigravity --gravity=0.5      # 重力を弱く
/antigravity --bounce=0.9       # 反発を強く
/antigravity --selector="h1,p"  # 対象要素を指定
/antigravity --generate         # スクリプトファイルを生成
```

## 生成されるファイル

```
src/
├── scripts/
│   └── antigravity.js    # Antigravityメインスクリプト
└── styles/
    └── antigravity.css   # Antigravity用スタイル
```

## 使用ライブラリ

- **Matter.js** - 2D物理エンジン
- **html2canvas** - DOM要素のキャプチャ

## コード例

### 基本的な使い方

```javascript
// Antigravityを初期化
import { initAntigravity } from './scripts/antigravity.js';

// ボタンクリックで発動
document.getElementById('antigravity-btn').addEventListener('click', () => {
  initAntigravity({
    gravity: 1.0,
    restitution: 0.6,
    friction: 0.1,
    selector: 'h1, h2, p, img, .card'
  });
});
```

### イースターエッグとして仕込む

```javascript
// Konami Codeで発動
let konamiCode = [];
const konamiSequence = [38,38,40,40,37,39,37,39,66,65];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.keyCode);
  if (konamiCode.length > 10) konamiCode.shift();
  if (konamiCode.join(',') === konamiSequence.join(',')) {
    initAntigravity();
  }
});
```

## Minecraftサイトでの活用例

- 404ページでブロックが落下するエフェクト
- コマンド生成完了時のお祝いエフェクト
- イースターエッグとして隠しページに実装

## アクセシビリティ配慮

```css
@media (prefers-reduced-motion: reduce) {
  .antigravity-active * {
    animation: none !important;
    transition: none !important;
  }
}
```

## 注意事項

- 本番環境ではパフォーマンスに注意
- モバイル対応（タッチイベント）
- `prefers-reduced-motion`を尊重して動きを抑制するオプション
