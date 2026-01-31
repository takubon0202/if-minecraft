#!/usr/bin/env node
/**
 * リンク切れ確認スクリプト
 * Minecraft Wiki画像URLを検証し、404エラーを検出します
 *
 * 使用方法:
 *   node scripts/check-links.js [--fix] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// wiki-images.jsから関数をインポート
import { getInviconUrl, getEffectIconUrl } from '../src/core/wiki-images.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// コマンドライン引数
const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const VERBOSE = args.includes('--verbose');

// 検査対象ファイル
const TARGET_FILES = [
  'src/core/wiki-images.js',
  'src/tools/potion/ui.js',
  'src/tools/enchant/ui.js',
  'src/tools/smithing/ui.js',
];

// Wiki画像URLのベース
const WIKI_BASE = 'https://minecraft.wiki/images/';

// 結果格納
const results = {
  total: 0,
  ok: 0,
  broken: [],
  redirects: [],
  errors: [],
};

/**
 * ファイルからURLを抽出
 */
function extractUrls(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const urls = [];

  // 画像URLパターン
  const patterns = [
    /https:\/\/minecraft\.wiki\/images\/[^\s'"`)]+/g,
    /getInviconUrl\(['"]([^'"]+)['"]\)/g,
    /getEffectIconUrl\(['"]([^'"]+)['"]\)/g,
  ];

  // 直接URL
  const directMatches = content.match(patterns[0]) || [];
  directMatches.forEach(url => {
    urls.push({ url, line: getLineNumber(content, url), type: 'direct' });
  });

  // 関数呼び出しから推定（wiki-images.jsのマッピングを使用）
  let match;
  const inviconRegex = /getInviconUrl\(['"]([^'"]+)['"]\)/g;
  while ((match = inviconRegex.exec(content)) !== null) {
    const itemId = match[1];
    // wiki-images.jsのマッピングを使用して正しいURLを取得
    const url = getInviconUrl(itemId);
    urls.push({
      url,
      itemId,
      line: getLineNumber(content, match[0]),
      type: 'invicon',
    });
  }

  const effectRegex = /getEffectIconUrl\(['"]([^'"]+)['"]\)/g;
  while ((match = effectRegex.exec(content)) !== null) {
    const effectId = match[1];
    // wiki-images.jsのマッピングを使用して正しいURLを取得
    const url = getEffectIconUrl(effectId);
    if (url) {
      urls.push({
        url,
        effectId,
        line: getLineNumber(content, match[0]),
        type: 'effect',
      });
    }
  }

  return urls;
}

/**
 * 行番号を取得
 */
function getLineNumber(content, searchStr) {
  const index = content.indexOf(searchStr);
  if (index === -1) return 0;
  return content.substring(0, index).split('\n').length;
}


/**
 * URLの存在を確認（簡易版 - HEADリクエスト）
 */
async function checkUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
    });

    if (response.status === 200) {
      return { status: 'ok', code: 200 };
    } else if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      return { status: 'redirect', code: response.status, location };
    } else if (response.status === 404) {
      return { status: 'broken', code: 404 };
    } else {
      return { status: 'error', code: response.status };
    }
  } catch (error) {
    return { status: 'error', code: 0, message: error.message };
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== リンク切れ確認スクリプト ===\n');
  console.log(`検査日時: ${new Date().toLocaleString()}`);
  console.log(`モード: ${FIX_MODE ? '自動修正' : '検査のみ'}\n`);

  const allUrls = [];

  // ファイルからURL抽出
  for (const file of TARGET_FILES) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const urls = extractUrls(filePath);
      urls.forEach(u => {
        u.file = file;
        allUrls.push(u);
      });
      if (VERBOSE) {
        console.log(`${file}: ${urls.length}件のURL抽出`);
      }
    }
  }

  console.log(`検査対象: ${TARGET_FILES.length}ファイル`);
  console.log(`検査URL数: ${allUrls.length}件\n`);

  // 重複を除去
  const uniqueUrls = [...new Map(allUrls.map(u => [u.url, u])).values()];
  results.total = uniqueUrls.length;

  console.log('検査中...\n');

  // URLチェック
  for (const urlInfo of uniqueUrls) {
    const result = await checkUrl(urlInfo.url);

    if (result.status === 'ok') {
      results.ok++;
      if (VERBOSE) console.log(`  ✓ ${urlInfo.url}`);
    } else if (result.status === 'broken') {
      results.broken.push({ ...urlInfo, ...result });
      console.log(`  ✗ ${urlInfo.url} (404)`);
    } else if (result.status === 'redirect') {
      results.redirects.push({ ...urlInfo, ...result });
      if (VERBOSE) console.log(`  → ${urlInfo.url} (${result.code})`);
    } else {
      results.errors.push({ ...urlInfo, ...result });
      if (VERBOSE) console.log(`  ? ${urlInfo.url} (${result.message || result.code})`);
    }
  }

  // 結果出力
  console.log('\n【検査結果サマリー】');
  console.log(`  正常: ${results.ok}件`);
  console.log(`  リンク切れ: ${results.broken.length}件`);
  console.log(`  リダイレクト: ${results.redirects.length}件`);
  console.log(`  エラー: ${results.errors.length}件`);

  if (results.broken.length > 0) {
    console.log('\n【リンク切れ一覧】');
    results.broken.forEach((b, i) => {
      console.log(`\n${i + 1}. ${b.file}:${b.line}`);
      console.log(`   URL: ${b.url}`);
      console.log(`   エラー: 404 Not Found`);
      if (b.itemId) console.log(`   アイテムID: ${b.itemId}`);
      if (b.effectId) console.log(`   エフェクトID: ${b.effectId}`);
    });
  }

  if (results.redirects.length > 0) {
    console.log('\n【要確認（リダイレクト）】');
    results.redirects.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.file}:${r.line}`);
      console.log(`   元URL: ${r.url}`);
      console.log(`   リダイレクト先: ${r.location}`);
    });
  }

  // 判定
  console.log('\n【判定】');
  if (results.broken.length === 0) {
    console.log('✓ 合格 - リンク切れはありません');
    process.exit(0);
  } else {
    console.log(`✗ 不合格 - ${results.broken.length}件のリンク切れがあります`);
    process.exit(1);
  }
}

main().catch(console.error);
