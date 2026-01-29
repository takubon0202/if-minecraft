#!/usr/bin/env node
/**
 * AI CLI統合セットアップスクリプト
 *
 * 使用方法:
 *   node scripts/setup.js
 *   node scripts/setup.js --check
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  return major >= 18;
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function runChecks() {
  log('\n╔══════════════════════════════════════════════════════╗', 'cyan');
  log('║     AI CLI統合 セットアップ確認                       ║', 'cyan');
  log('╚══════════════════════════════════════════════════════╝\n', 'cyan');

  let allPassed = true;

  // Node.js
  log('【Node.js】', 'blue');
  if (checkNodeVersion()) {
    log(`  ✓ Node.js ${process.version} - OK`, 'green');
  } else {
    log(`  ✗ Node.js ${process.version} - 18以上が必要`, 'red');
    allPassed = false;
  }

  // Codex CLI
  log('\n【Codex CLI】', 'blue');
  if (checkCommand('codex')) {
    log('  ✓ Codex CLIがインストールされています', 'green');
  } else {
    log('  ✗ Codex CLIがインストールされていません', 'red');
    log('    → npm install -g @openai/codex', 'yellow');
    allPassed = false;
  }

  // Gemini CLI
  log('\n【Gemini CLI】', 'blue');
  if (checkCommand('gemini')) {
    log('  ✓ Gemini CLIがインストールされています', 'green');
  } else {
    log('  ✗ Gemini CLIがインストールされていません', 'red');
    log('    → npm install -g @google/gemini-cli', 'yellow');
    allPassed = false;
  }

  // 設定ファイル
  log('\n【設定ファイル】', 'blue');
  const requiredFiles = [
    '.claude/settings.json',
    '.claude/commands/codex.md',
    '.claude/commands/gemini.md',
    '.claude/commands/evaluate.md',
    '.claude/commands/persona.md',
    '.claude/commands/review.md',
    '.gemini/skills/minecraft-helper/SKILL.md',
    'scripts/codex-helper.js',
    'scripts/gemini-helper.js',
    'CODEX.md',
    'GEMINI.md'
  ];

  for (const file of requiredFiles) {
    if (checkFileExists(file)) {
      log(`  ✓ ${file}`, 'green');
    } else {
      log(`  ✗ ${file} - 見つかりません`, 'red');
      allPassed = false;
    }
  }

  // 結果
  log('\n' + '─'.repeat(50), 'cyan');
  if (allPassed) {
    log('\n✅ すべてのチェックに合格しました！', 'green');
    log('\n使用可能なスキル:', 'blue');
    log('  /codex    - Codex CLIを使用してタスクを実行', 'cyan');
    log('  /gemini   - Gemini CLIを使用してタスクを実行', 'cyan');
    log('  /evaluate - ページの技術的評価', 'cyan');
    log('  /persona  - ペルソナ視点での評価', 'cyan');
    log('  /review   - 統合レビュー（evaluate + persona）', 'cyan');
  } else {
    log('\n⚠️  一部のチェックに失敗しました。上記の指示に従ってセットアップを完了してください。', 'yellow');
  }

  log('\n');
  return allPassed;
}

function showHelp() {
  log('\nAI CLI統合セットアップスクリプト\n');
  log('使用方法:');
  log('  node scripts/setup.js        セットアップ確認を実行');
  log('  node scripts/setup.js --help このヘルプを表示');
  log('\nインストール手順:');
  log('  1. npm install -g @openai/codex');
  log('  2. npm install -g @google/gemini-cli');
  log('  3. codex --login');
  log('  4. gemini  # ブラウザでGoogleログイン');
  log('  5. node scripts/setup.js  # 確認');
}

// メイン
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else {
  runChecks();
}
