#!/usr/bin/env node
/**
 * Codex Helper - OpenAI Codex CLI連携スクリプト
 *
 * Minecraftコマンドサイト プロジェクト用
 *
 * 使用方法:
 *   node scripts/codex-helper.js "タスク内容"
 *   node scripts/codex-helper.js --error "エラーメッセージ"
 *   node scripts/codex-helper.js --file path/to/file.js "修正内容"
 *   node scripts/codex-helper.js --interactive
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// プロジェクト情報
const PROJECT_CONTEXT = `# プロジェクト情報
Minecraftコマンド解説・ジェネレーターサイト

## 技術スタック
- JavaScript/TypeScript
- HTML/CSS
- フレームワーク（React/Next.js/Astro等）

## 主な機能
- Minecraftコマンドの解説ページ
- コマンドジェネレーター（/give, /summon, /execute等）
- NBTタグエディター
- ターゲットセレクター解説

## コーディング規約
- 日本語でコメント
- セマンティックHTML
- アクセシビリティ配慮
- SEO最適化`;

function checkCodexInstalled() {
  try {
    execSync('codex --version', { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function readFile(filePath) {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath : path.join(process.cwd(), filePath);
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (e) {
    console.error(`ファイル読み込みエラー: ${filePath}`);
    return null;
  }
}

function generatePrompt(task, mode = 'general', fileInfo = null) {
  let prompt = '';
  switch (mode) {
    case 'error':
      prompt = `以下のエラーを解決してください。原因を分析し、修正コードを提示してください。\n\nエラー:\n${task}`;
      break;
    case 'file':
      prompt = `以下のファイルを修正してください。\n\nファイル: ${fileInfo.name}\nタスク: ${task}\n\n現在のコード:\n\`\`\`\n${fileInfo.content}\n\`\`\``;
      break;
    case 'minecraft':
      prompt = `Minecraftコマンドサイト開発タスク:\n\n${task}\n\n${PROJECT_CONTEXT}`;
      break;
    default:
      prompt = task;
  }
  return prompt;
}

function runCodexInteractive() {
  console.log('Codex CLI を対話モードで起動します...\n');
  const codex = spawn('codex', [], { stdio: 'inherit', shell: true, cwd: process.cwd() });
  codex.on('close', (code) => console.log(`\nCodex CLI 終了 (code: ${code})`));
}

function runCodexWithPrompt(prompt) {
  console.log('Codex CLI を非対話モードで実行中...\n');
  // 非対話モード（codex exec）を使用 - Claude Code連携に最適
  const codex = spawn('codex', ['exec', prompt], { stdio: 'inherit', shell: true, cwd: process.cwd() });
  codex.on('close', (code) => {
    if (code !== 0) {
      // 使用量上限エラーをチェック
      console.error(`\nCodex CLI がエラーで終了しました (code: ${code})`);
      console.log('\n※ 使用量上限に達した可能性があります。');
      console.log('  制限が回復するまで待つか、他のAI（Claude/Gemini）を使用してください。');
    }
  });
}

function writeProjectContext() {
  const codexMdPath = path.join(process.cwd(), 'CODEX.md');
  if (fs.existsSync(codexMdPath)) return;
  try {
    fs.writeFileSync(codexMdPath, PROJECT_CONTEXT, 'utf8');
    console.log('CODEX.md を作成しました');
  } catch (e) {}
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Codex Helper - OpenAI Codex CLI連携');
    console.log('Minecraftコマンドサイト プロジェクト用\n');
    console.log('使用方法:');
    console.log('  node scripts/codex-helper.js "タスク内容"');
    console.log('  node scripts/codex-helper.js --error "エラーメッセージ"');
    console.log('  node scripts/codex-helper.js --file path/to/file.js "修正内容"');
    console.log('  node scripts/codex-helper.js --minecraft "Minecraft関連タスク"');
    console.log('  node scripts/codex-helper.js --interactive\n');
    console.log('または直接: codex exec "タスク内容"');
    process.exit(0);
  }

  if (!checkCodexInstalled()) {
    console.error('エラー: Codex CLIがインストールされていません。');
    console.log('\nインストール: npm install -g @openai/codex');
    console.log('ログイン: codex --login');
    process.exit(1);
  }

  writeProjectContext();

  if (args[0] === '--interactive' || args[0] === '-i') {
    runCodexInteractive();
    return;
  }

  let prompt = '', mode = 'general', fileInfo = null;

  if (args[0] === '--error' || args[0] === '-e') {
    mode = 'error';
    prompt = generatePrompt(args.slice(1).join(' '), mode);
  } else if (args[0] === '--file' || args[0] === '-f') {
    mode = 'file';
    const filePath = args[1];
    const content = readFile(filePath);
    if (!content) process.exit(1);
    fileInfo = { name: path.basename(filePath), content };
    const task = args.slice(2).join(' ') || '改善してください';
    prompt = generatePrompt(task, mode, fileInfo);
  } else if (args[0] === '--minecraft' || args[0] === '-mc') {
    mode = 'minecraft';
    prompt = generatePrompt(args.slice(1).join(' '), mode);
  } else {
    prompt = generatePrompt(args.join(' '), mode);
  }

  runCodexWithPrompt(prompt);
}

main();
