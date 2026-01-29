---
name: antigravity
description: Google Antigravityインスパイアの物理演出をページに適用するスキル
---

# Antigravity スキル

Google Antigravity（https://antigravity.google/）にインスパイアされた物理演出機能。
Matter.js物理エンジンを使用して、ページ要素に重力を適用し、インタラクティブに操作可能にします。

## 機能

### 1. Gravity Drop（重力落下）
ページの要素が重力に従って落下します。

**使用例:**
```
gemini "antigravity: このページに重力効果を追加して"
```

### 2. Interactive Physics（インタラクティブ物理）
マウスで要素をドラッグして投げることができます。

**特徴:**
- 要素同士の衝突判定
- 壁（画面端）での跳ね返り
- 摩擦・反発係数の調整

### 3. Easter Egg Mode（イースターエッグ）
特定のキーワードや操作で隠し機能が発動します。

## 実装コード

### Matter.js を使用した基本実装

```javascript
// Antigravity効果を適用
function applyAntigravity() {
  // Matter.jsのモジュール
  const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Runner } = Matter;

  // エンジン作成
  const engine = Engine.create();
  const world = engine.world;

  // レンダラー作成
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: 'transparent'
    }
  });

  // ページ要素を物理オブジェクトに変換
  const elements = document.querySelectorAll('h1, h2, h3, p, img, button, a, div.card');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const body = Bodies.rectangle(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      rect.width,
      rect.height,
      {
        restitution: 0.6,  // 反発係数
        friction: 0.1,     // 摩擦
        render: {
          sprite: {
            texture: elementToImage(el),
            xScale: 1,
            yScale: 1
          }
        }
      }
    );
    World.add(world, body);
    el.style.visibility = 'hidden';
  });

  // 壁（画面端）を追加
  const walls = [
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 30, window.innerWidth, 60, { isStatic: true }),
    Bodies.rectangle(-30, window.innerHeight / 2, 60, window.innerHeight, { isStatic: true }),
    Bodies.rectangle(window.innerWidth + 30, window.innerHeight / 2, 60, window.innerHeight, { isStatic: true })
  ];
  World.add(world, walls);

  // マウス操作を追加
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });
  World.add(world, mouseConstraint);

  // 実行
  Render.run(render);
  Runner.run(Runner.create(), engine);
}

// 要素を画像に変換
function elementToImage(element) {
  // html2canvasを使用して要素をキャプチャ
  return html2canvas(element).then(canvas => canvas.toDataURL());
}
```

### CDN読み込み

```html
<!-- Matter.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
<!-- html2canvas（要素キャプチャ用） -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

## 使用方法

### 自動適用
```bash
gemini --antigravity  # 現在のページにAntigravity効果を適用
```

### スクリプト生成
```bash
gemini "antigravity: Minecraftコマンドサイト用のAntigravityスクリプトを生成"
```

### カスタマイズ
```bash
gemini "antigravity: 重力を弱めに、反発を強めに調整したバージョン"
```

## オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `gravity` | 重力の強さ（0-2） | 1.0 |
| `restitution` | 反発係数（0-1） | 0.6 |
| `friction` | 摩擦係数（0-1） | 0.1 |
| `selector` | 対象要素のセレクタ | 'h1,h2,h3,p,img,button' |

## イースターエッグ

- **Konami Code**: ↑↑↓↓←→←→BA で重力反転
- **シェイク**: デバイスを振ると全要素が散乱
- **ダブルクリック**: 要素が爆発して分散

## 注意事項

- パフォーマンスに影響するため、本番環境では隠し機能として実装推奨
- モバイルではタッチ操作に対応
- アクセシビリティに配慮し、`prefers-reduced-motion`を尊重
