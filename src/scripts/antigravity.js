/**
 * Antigravity.js - Google Antigravityインスパイアの物理演出
 *
 * Matter.jsを使用してページ要素に物理演算を適用し、
 * インタラクティブに操作可能にします。
 *
 * @see https://antigravity.google/
 */

(function() {
  'use strict';

  // デフォルト設定
  const DEFAULT_CONFIG = {
    gravity: 1.0,
    restitution: 0.6,
    friction: 0.1,
    frictionAir: 0.01,
    selector: 'h1, h2, h3, p, img, button, a, .card, .block',
    enableMouse: true,
    enableTouch: true,
    enableKonami: true,
    enableShake: true,
    respectReducedMotion: true
  };

  // Konami Code シーケンス
  const KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  let engine, render, runner, world;
  let bodies = [];
  let originalElements = new Map();
  let isActive = false;
  let konamiBuffer = [];

  /**
   * Antigravityを初期化
   * @param {Object} config - 設定オプション
   */
  function initAntigravity(config = {}) {
    const options = { ...DEFAULT_CONFIG, ...config };

    // reduced-motion設定を確認
    if (options.respectReducedMotion &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('Antigravity: prefers-reduced-motion が有効のためスキップ');
      return;
    }

    // 既にアクティブなら停止
    if (isActive) {
      stopAntigravity();
    }

    // Matter.jsが読み込まれているか確認
    if (typeof Matter === 'undefined') {
      console.error('Antigravity: Matter.js が読み込まれていません');
      loadMatterJS().then(() => initAntigravity(config));
      return;
    }

    const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Runner, Events } = Matter;

    // エンジン作成
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = options.gravity;

    // キャンバスコンテナ作成
    const container = document.createElement('div');
    container.id = 'antigravity-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(container);

    // レンダラー作成
    render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    render.canvas.style.pointerEvents = 'auto';

    // 壁（画面端）を追加
    const wallThickness = 60;
    const walls = [
      // 床
      Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight + wallThickness / 2,
        window.innerWidth * 2,
        wallThickness,
        { isStatic: true, render: { visible: false } }
      ),
      // 左壁
      Bodies.rectangle(
        -wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight * 2,
        { isStatic: true, render: { visible: false } }
      ),
      // 右壁
      Bodies.rectangle(
        window.innerWidth + wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight * 2,
        { isStatic: true, render: { visible: false } }
      )
    ];
    World.add(world, walls);

    // ページ要素を物理オブジェクトに変換
    const elements = document.querySelectorAll(options.selector);
    elements.forEach(el => {
      if (el.closest('#antigravity-container')) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      // 元の状態を保存
      originalElements.set(el, {
        visibility: el.style.visibility,
        position: el.style.position
      });

      // 物理ボディ作成
      const body = Bodies.rectangle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        rect.width,
        rect.height,
        {
          restitution: options.restitution,
          friction: options.friction,
          frictionAir: options.frictionAir,
          render: {
            fillStyle: getComputedStyle(el).backgroundColor || '#ffffff',
            strokeStyle: getComputedStyle(el).borderColor || '#000000',
            lineWidth: 1
          },
          label: el.tagName,
          element: el
        }
      );

      bodies.push({ body, element: el, rect });
      World.add(world, body);

      // 元の要素を非表示
      el.style.visibility = 'hidden';
    });

    // DOM要素と物理ボディを同期
    Events.on(engine, 'afterUpdate', () => {
      bodies.forEach(({ body, element, rect }) => {
        // 物理ボディの位置に合わせてDOM要素を移動
        // ここでは単純にキャンバス描画のみ使用
      });
    });

    // マウス操作
    if (options.enableMouse) {
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false }
        }
      });
      World.add(world, mouseConstraint);
      render.mouse = mouse;
    }

    // タッチ操作
    if (options.enableTouch) {
      enableTouchSupport(render.canvas);
    }

    // Konami Code
    if (options.enableKonami) {
      enableKonamiCode();
    }

    // シェイク検出
    if (options.enableShake) {
      enableShakeDetection();
    }

    // 実行
    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);

    isActive = true;
    console.log('Antigravity: 有効化されました');

    // カスタムイベント発火
    document.dispatchEvent(new CustomEvent('antigravity:start'));
  }

  /**
   * Antigravityを停止
   */
  function stopAntigravity() {
    if (!isActive) return;

    // 元の状態に復元
    originalElements.forEach((original, el) => {
      el.style.visibility = original.visibility || '';
      el.style.position = original.position || '';
    });
    originalElements.clear();

    // Matter.jsをクリーンアップ
    if (render) {
      Matter.Render.stop(render);
      render.canvas.remove();
    }
    if (runner) {
      Matter.Runner.stop(runner);
    }
    if (engine) {
      Matter.World.clear(world);
      Matter.Engine.clear(engine);
    }

    // コンテナを削除
    const container = document.getElementById('antigravity-container');
    if (container) container.remove();

    bodies = [];
    isActive = false;
    console.log('Antigravity: 停止しました');

    // カスタムイベント発火
    document.dispatchEvent(new CustomEvent('antigravity:stop'));
  }

  /**
   * 重力を反転
   */
  function reverseGravity() {
    if (!isActive || !world) return;
    world.gravity.y *= -1;
    console.log('Antigravity: 重力反転！', world.gravity.y);

    // 視覚的フィードバック
    document.body.style.transition = 'filter 0.3s';
    document.body.style.filter = 'invert(1)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, 300);
  }

  /**
   * 要素を爆発させる
   */
  function explodeElements() {
    if (!isActive) return;

    bodies.forEach(({ body }) => {
      const force = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5
      };
      Matter.Body.applyForce(body, body.position, force);
    });
    console.log('Antigravity: 爆発！');
  }

  /**
   * Matter.jsを動的に読み込む
   */
  function loadMatterJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * タッチサポートを有効化
   */
  function enableTouchSupport(canvas) {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  /**
   * Konami Codeを有効化
   */
  function enableKonamiCode() {
    document.addEventListener('keydown', (e) => {
      konamiBuffer.push(e.code);
      if (konamiBuffer.length > KONAMI_SEQUENCE.length) {
        konamiBuffer.shift();
      }
      if (konamiBuffer.join(',') === KONAMI_SEQUENCE.join(',')) {
        if (isActive) {
          reverseGravity();
        } else {
          initAntigravity();
        }
        konamiBuffer = [];
      }
    });
  }

  /**
   * シェイク検出を有効化
   */
  function enableShakeDetection() {
    let lastX, lastY, lastZ;
    const threshold = 15;

    window.addEventListener('devicemotion', (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (lastX !== undefined) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        if (deltaX + deltaY + deltaZ > threshold) {
          explodeElements();
        }
      }
      lastX = x;
      lastY = y;
      lastZ = z;
    });
  }

  // グローバルに公開
  window.Antigravity = {
    init: initAntigravity,
    stop: stopAntigravity,
    reverse: reverseGravity,
    explode: explodeElements,
    isActive: () => isActive
  };

  // ESモジュール用エクスポート
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initAntigravity, stopAntigravity, reverseGravity, explodeElements };
  }

})();
