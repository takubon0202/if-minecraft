---
name: antigravity
description: ターミナル内でASCIIアートによるAntigravity風物理演出を行うスキル
hooks: []
---

# Antigravity スキル（ターミナル専用）

Google Antigravity（https://antigravity.google/）にインスパイアされた**ターミナル内**物理演出機能。
**ブラウザは一切開きません。** ASCIIアートとテキストアニメーションで重力演出を行います。

## 重要な制約

- **ブラウザを開かない**: 絶対にWebブラウザを起動しません
- **vite/npmに影響しない**: `npm run dev`, `vite`, その他のビルドコマンドをフックしません
- **ターミナル内完結**: 全ての演出はターミナル/コンソール内で行います

## 機能

### 1. ASCII Gravity Drop（ASCIIアート落下）

ターミナル内でASCIIアートが重力に従って落下するアニメーション。

**使用例:**
```
gemini "antigravity: ASCIIアートを落下させて"
```

**出力例:**
```
    ██████
    ██  ██
    ██████
      ↓
      ↓
      ↓
  ══════════
```

### 2. Text Physics（テキスト物理）

文字が跳ねたり、散らばったりするターミナルアニメーション。

**使用例:**
```
gemini "antigravity: 'Minecraft' のテキストを物理演出して"
```

**出力例:**
```
Frame 1:  M i n e c r a f t
Frame 2:  M  i n  e c r  a f t
Frame 3:   M   i  n   e  c  r   a  f  t
Frame 4:  ═══════════════════════════════
          M i  n e  c r a  f t
```

### 3. Block Fall（ブロック落下）

Minecraftのブロックを模したASCIIアートが落下。

**使用例:**
```
gemini "antigravity: Minecraftブロックを落下させて"
```

**出力例:**
```
  ┌───┐
  │ ▓ │  ← 草ブロック
  └───┘
    ↓
  ┌───┐
  │ ░ │  ← 土ブロック
  └───┘
    ↓
════════════
  ┌───┬───┐
  │ ▓ │ ░ │
  └───┴───┘
```

## 実装（ターミナルASCIIアニメーション）

```python
import time
import os

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def antigravity_animation():
    frames = [
        """
        ██████
        ██  ██
        ██████



        ══════════════
        """,
        """

        ██████
        ██  ██
        ██████


        ══════════════
        """,
        """


        ██████
        ██  ██
        ██████

        ══════════════
        """,
        """



        ██████
        ██  ██
        ██████
        ══════════════
        """
    ]

    for frame in frames:
        clear_screen()
        print(frame)
        time.sleep(0.3)

    print("\\n✓ Antigravity complete!")

if __name__ == "__main__":
    antigravity_animation()
```

## 使用方法

### 基本使用
```bash
gemini "antigravity"  # ターミナル内でASCIIアニメーション
```

### カスタムテキスト
```bash
gemini "antigravity: 'Hello World' を落下させて"
```

### Minecraftテーマ
```bash
gemini "antigravity: Minecraftブロックを落下させて"
```

## オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `text` | 落下させるテキスト | 'ANTIGRAVITY' |
| `speed` | アニメーション速度（秒） | 0.3 |
| `style` | 'block', 'text', 'minecraft' | 'block' |

## このスキルがしないこと

- ❌ Webブラウザを開く
- ❌ npm run dev / vite をフックする
- ❌ 外部URLにアクセスする
- ❌ GUIアプリケーションを起動する

## このスキルがすること

- ✓ ターミナル内でASCIIアートを表示
- ✓ テキストアニメーションを実行
- ✓ Minecraftテーマの演出を提供
