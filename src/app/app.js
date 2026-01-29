/**
 * MC Tool Hub - Main Application Entry
 */

import router from '../core/router.js';
import { workspaceStore, dataStore } from '../core/store.js';
import storage from '../core/storage.js';
import { $, $$, delegate } from '../core/dom.js';
import { initTabs } from './tabs.js';
import { initNav } from './nav.js';
import { initSidePanel } from './sidepanel.js';
import { loadTool, getToolManifest } from './shell.js';
import { initTooltip } from '../core/mc-tooltip.js';

// ツールマニフェストをインポート
// リファレンス
import * as idBrowser from '../tools/id-browser/manifest.js';
import * as blockIds from '../tools/block-ids/manifest.js';
import * as colorCodes from '../tools/color-codes/manifest.js';
import * as targetSelector from '../tools/target-selector/manifest.js';
import * as coordinate from '../tools/coordinate/manifest.js';
// コマンド生成
import * as give from '../tools/give/manifest.js';
import * as summon from '../tools/summon/manifest.js';
import * as summonZombie from '../tools/summon-zombie/manifest.js';
import * as enchant from '../tools/enchant/manifest.js';
import * as potion from '../tools/potion/manifest.js';
import * as smithing from '../tools/smithing/manifest.js';
// テキスト系
import * as jsonText from '../tools/json-text/manifest.js';
import * as tellraw from '../tools/tellraw/manifest.js';
import * as title from '../tools/title/manifest.js';
import * as sign from '../tools/sign/manifest.js';
import * as book from '../tools/book/manifest.js';

// 登録済みツール
const tools = new Map();

/**
 * アプリケーション初期化
 */
async function init() {
  console.log('MC Tool Hub initializing...');

  // ツール登録 - リファレンス
  registerTool(idBrowser);
  registerTool(blockIds);
  registerTool(colorCodes);
  registerTool(targetSelector);
  registerTool(coordinate);
  // コマンド生成
  registerTool(give);
  registerTool(summon);
  registerTool(summonZombie);
  registerTool(enchant);
  registerTool(potion);
  registerTool(smithing);
  // テキスト系
  registerTool(jsonText);
  registerTool(tellraw);
  registerTool(title);
  registerTool(sign);
  registerTool(book);

  // コンポーネント初期化
  initNav();
  initTabs();
  initSidePanel();
  initTooltip(); // Minecraft風ツールチップ

  // ルーター設定
  setupRouter();

  // バージョンデータ読み込み
  await loadVersionData();

  // 保存された状態を復元
  restoreState();

  // Antigravity（イースターエッグ）
  setupAntigravity();

  // ショートカットキー
  setupKeyboardShortcuts();

  console.log('MC Tool Hub initialized!');
}

/**
 * ツールを登録
 */
function registerTool(toolModule) {
  if (toolModule.manifest) {
    tools.set(toolModule.manifest.id, toolModule);
    console.log(`Tool registered: ${toolModule.manifest.id}`);
  }
}

/**
 * ルーターをセットアップ
 */
function setupRouter() {
  // ホーム
  router.register('/', () => {
    showWelcomeScreen();
  });

  // ツールルート
  router.register('/tool/:id', (params) => {
    const toolId = params.id;
    if (tools.has(toolId)) {
      loadTool(toolId, tools.get(toolId));
    } else {
      console.warn(`Unknown tool: ${toolId}`);
      showWelcomeScreen();
    }
  });

  // ルート変更時にナビゲーションを更新
  router.onRouteChange = (path) => {
    updateNavActiveState(path);
  };
}

/**
 * バージョンデータを読み込み
 */
async function loadVersionData() {
  const version = workspaceStore.get('version');
  console.log(`Loading data for Minecraft ${version}...`);

  try {
    // データファイルを読み込み（存在する場合）
    const response = await fetch(`/if-minecraft/data/generated/${version}/registries.json`);
    if (response.ok) {
      const data = await response.json();
      processRegistryData(data);
    } else {
      console.warn('Registry data not found, using fallback');
      loadFallbackData();
    }
  } catch (err) {
    console.error('Failed to load version data:', err);
    loadFallbackData();
  }
}

/**
 * レジストリデータを処理
 */
function processRegistryData(data) {
  // アイテム
  if (data['minecraft:item']) {
    dataStore.set('items', Object.keys(data['minecraft:item'].entries || {}));
  }
  // ブロック
  if (data['minecraft:block']) {
    dataStore.set('blocks', Object.keys(data['minecraft:block'].entries || {}));
  }
  // エンティティ
  if (data['minecraft:entity_type']) {
    dataStore.set('entities', Object.keys(data['minecraft:entity_type'].entries || {}));
  }
  // エフェクト
  if (data['minecraft:mob_effect']) {
    dataStore.set('effects', Object.keys(data['minecraft:mob_effect'].entries || {}));
  }
  // エンチャント
  if (data['minecraft:enchantment']) {
    dataStore.set('enchantments', Object.keys(data['minecraft:enchantment'].entries || {}));
  }

  dataStore.set('loaded', true);
  console.log('Registry data loaded');
}

/**
 * フォールバックデータ（基本的なID）
 */
function loadFallbackData() {
  // 最小限のフォールバックデータ
  dataStore.set('items', [
    'minecraft:diamond_sword', 'minecraft:diamond_pickaxe', 'minecraft:diamond',
    'minecraft:iron_ingot', 'minecraft:gold_ingot', 'minecraft:stone',
    'minecraft:dirt', 'minecraft:grass_block', 'minecraft:oak_log',
    'minecraft:apple', 'minecraft:bread', 'minecraft:cooked_beef',
  ]);
  dataStore.set('entities', [
    'minecraft:zombie', 'minecraft:skeleton', 'minecraft:creeper',
    'minecraft:spider', 'minecraft:pig', 'minecraft:cow', 'minecraft:sheep',
    'minecraft:chicken', 'minecraft:villager', 'minecraft:iron_golem',
  ]);
  dataStore.set('effects', [
    'minecraft:speed', 'minecraft:slowness', 'minecraft:strength',
    'minecraft:regeneration', 'minecraft:invisibility', 'minecraft:night_vision',
  ]);
  dataStore.set('enchantments', [
    'minecraft:sharpness', 'minecraft:smite', 'minecraft:unbreaking',
    'minecraft:efficiency', 'minecraft:fortune', 'minecraft:protection',
  ]);
  dataStore.set('loaded', true);
  console.log('Fallback data loaded');
}

/**
 * 保存された状態を復元
 */
function restoreState() {
  // タブ状態を復元
  const savedTabs = storage.load('tabs', []);
  if (savedTabs.length > 0) {
    workspaceStore.set('tabs', savedTabs);
  }

  // アクティブタブを復元
  const activeTabId = storage.load('activeTabId');
  if (activeTabId) {
    workspaceStore.set('activeTabId', activeTabId);
  }

  // バージョンを復元
  const savedVersion = storage.load('version', '1.21.11');
  workspaceStore.set('version', savedVersion);

  // バージョンセレクターを更新
  const versionSelect = $('#mc-version');
  if (versionSelect) {
    versionSelect.value = savedVersion;
  }
}

/**
 * ウェルカム画面を表示
 */
function showWelcomeScreen() {
  const content = $('#tool-content');
  const welcome = $('#welcome-screen');
  if (welcome) {
    welcome.style.display = 'block';
  }

  // 他のツールコンテンツを非表示
  $$('.tool-container', content).forEach(el => {
    el.style.display = 'none';
  });
}

/**
 * ナビゲーションのアクティブ状態を更新
 */
function updateNavActiveState(path) {
  $$('.tool-list a').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === '#' + path);
  });
}

/**
 * Antigravityをセットアップ
 */
function setupAntigravity() {
  const btn = $('#antigravity-trigger');
  if (btn) {
    btn.addEventListener('click', () => {
      if (window.Antigravity) {
        if (window.Antigravity.isActive()) {
          window.Antigravity.stop();
        } else {
          window.Antigravity.init({
            selector: 'h1, h2, h3, .quick-tool-btn, .mc-btn, .tab',
            gravity: 1.0,
            restitution: 0.7,
          });
        }
      } else {
        console.log('Antigravity not loaded');
      }
    });
  }

  // Konami Code
  let konamiBuffer = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

  document.addEventListener('keydown', (e) => {
    konamiBuffer.push(e.code);
    if (konamiBuffer.length > konamiSequence.length) {
      konamiBuffer.shift();
    }
    if (konamiBuffer.join(',') === konamiSequence.join(',')) {
      console.log('Konami Code activated!');
      if (window.Antigravity) {
        window.Antigravity.init();
      }
      konamiBuffer = [];
    }
  });
}

/**
 * キーボードショートカット
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+C: コマンドをコピー
    if (e.ctrlKey && e.key === 'c' && !window.getSelection().toString()) {
      const copyBtn = $('#copy-btn');
      if (copyBtn && !copyBtn.disabled) {
        copyBtn.click();
      }
    }

    // Ctrl+S: 履歴に保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      const saveBtn = $('#save-btn');
      if (saveBtn && !saveBtn.disabled) {
        saveBtn.click();
      }
    }
  });
}

// Quick Toolボタンのイベント
delegate(document.body, 'click', '.quick-tool-btn', (e, target) => {
  const toolId = target.dataset.tool;
  if (toolId) {
    router.navigate(`/tool/${toolId}`);
  }
});

// バージョン変更
$('#mc-version')?.addEventListener('change', async (e) => {
  const version = e.target.value;
  workspaceStore.set('version', version);
  storage.save('version', version);
  await loadVersionData();
});

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', init);

// グローバルに公開（デバッグ用）
window.MCToolHub = {
  router,
  workspaceStore,
  dataStore,
  tools,
};
