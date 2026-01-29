#!/usr/bin/env node
/**
 * Gemini Helper - Google Gemini CLI連携スクリプト
 *
 * Minecraftコマンドサイト プロジェクト用
 * Geminiサブスクリプションに含まれるGemini CLIを使用します。
 *
 * ★ Gemini 3系のみ使用（2.5系は使用しない）
 *
 * 使用モデル:
 *   - gemini-3-pro-preview（デフォルト・複雑なタスク用）
 *   - gemini-3-flash-preview（高速処理用）
 *
 * 使用方法:
 *   node scripts/gemini-helper.js "タスク内容"
 *   node scripts/gemini-helper.js --flash "簡単な質問"
 *   node scripts/gemini-helper.js --error "エラーメッセージ"
 *   node scripts/gemini-helper.js --file path/to/file.js "修正内容"
 *   node scripts/gemini-helper.js --interactive
 *   node scripts/gemini-helper.js --yolo "タスク"
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// ★★★ Gemini 3系のみ使用（フォールバックなし）★★★
const MODELS = {
  PRO: 'gemini-3-pro-preview',     // デフォルト・複雑なタスク用
  FLASH: 'gemini-3-flash-preview'  // 高速処理用
};

// デフォルト設定
const CONFIG = {
  model: MODELS.PRO,  // デフォルトはGemini 3 Pro Preview
  yolo: true          // デフォルトで自動承認モード
};

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

function checkGeminiInstalled() {
  try {
    execSync('gemini --version', { stdio: 'pipe' });
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
      prompt = `以下のファイルを修正してください。\n\nファイル: ${fileInfo.name}\nタスク: ${task}\n\n現在のコード:\n\`\`\`javascript\n${fileInfo.content}\n\`\`\``;
      break;
    case 'minecraft':
      prompt = `Minecraftコマンドサイト開発タスク:\n\n${task}\n\n${PROJECT_CONTEXT}`;
      break;
    default:
      prompt = task;
  }
  return prompt;
}

function runGeminiInteractive(model) {
  console.log('Gemini CLI を対話モードで起動します...');
  console.log(`モデル: ${model}`);
  console.log('終了するには Ctrl+C または /exit を入力\n');

  const args = ['-m', model];
  const gemini = spawn('gemini', args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  gemini.on('close', (code) => {
    console.log(`\nGemini CLI 終了 (code: ${code})`);
  });
}

/**
 * Gemini CLIを実行（Gemini 3系のみ、フォールバックなし）
 */
function runGeminiWithPrompt(prompt, model, yolo = false) {
  console.log('Gemini CLI を実行中...');
  console.log(`モデル: ${model} (Gemini 3系)`);
  if (yolo) console.log('モード: YOLO（自動承認）');
  console.log('');

  const args = ['-m', model];
  if (yolo) args.push('-y');
  args.push(prompt);

  const gemini = spawn('gemini', args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  gemini.on('close', (code) => {
    if (code !== 0) {
      console.error(`\nGemini CLI がエラーで終了しました (code: ${code})`);
      console.log('\n★ Gemini 3系のみ使用しています（フォールバックなし）');
      console.log('  エラーが続く場合は、しばらく待ってから再試行してください。');
      console.log('  または他のAI（Claude/Codex）を使用してください。');
    }
  });
}

function writeProjectContext() {
  const geminiMdPath = path.join(process.cwd(), 'GEMINI.md');
  if (fs.existsSync(geminiMdPath)) return;
  try {
    fs.writeFileSync(geminiMdPath, PROJECT_CONTEXT, 'utf8');
    console.log('GEMINI.md を作成しました（プロジェクト情報）');
  } catch (e) {}
}

async function main() {
  const args = process.argv.slice(2);

  // ヘルプ表示
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Gemini Helper - Google Gemini CLI連携');
    console.log('Minecraftコマンドサイト プロジェクト用');
    console.log('');
    console.log('★ Gemini 3系のみ使用（フォールバックなし）');
    console.log('');
    console.log('使用モデル:');
    console.log(`  - ${MODELS.PRO} (デフォルト)`);
    console.log(`  - ${MODELS.FLASH} (--flash オプション)`);
    console.log('');
    console.log('使用方法:');
    console.log('  node scripts/gemini-helper.js "タスク内容"        # Gemini 3 Pro Preview');
    console.log('  node scripts/gemini-helper.js --flash "質問"      # Gemini 3 Flash Preview');
    console.log('  node scripts/gemini-helper.js --error "エラー"    # エラー解決');
    console.log('  node scripts/gemini-helper.js --file X.js "修正"  # ファイル修正');
    console.log('  node scripts/gemini-helper.js --minecraft "タスク" # MC用タスク');
    console.log('  node scripts/gemini-helper.js --interactive       # 対話モード');
    console.log('  node scripts/gemini-helper.js --yolo "タスク"     # 自動承認');
    console.log('');
    console.log('または直接Gemini CLIを使用:');
    console.log(`  gemini -m ${MODELS.PRO} "タスク"`);
    console.log(`  gemini -m ${MODELS.FLASH} "簡単な質問"`);
    console.log('');
    console.log('セットアップ:');
    console.log('  npm install -g @google/gemini-cli');
    console.log('  gemini  # 初回起動時にGoogleログイン');
    process.exit(0);
  }

  // Gemini CLIの存在確認
  if (!checkGeminiInstalled()) {
    console.error('エラー: Gemini CLIがインストールされていません。');
    console.log('');
    console.log('インストール方法:');
    console.log('  npm install -g @google/gemini-cli');
    console.log('');
    console.log('ログイン:');
    console.log('  gemini  # 初回起動時にブラウザでGoogleログイン');
    process.exit(1);
  }

  // GEMINI.md を作成
  writeProjectContext();

  let model = CONFIG.model;  // デフォルト: gemini-3-pro-preview
  let yolo = CONFIG.yolo;

  // 引数解析
  let prompt = '';
  let mode = 'general';
  let fileInfo = null;
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    // モデル指定（Gemini 3系のみ許可）
    if (arg === '--model' || arg === '-m') {
      const requestedModel = args[i + 1];
      if (requestedModel === MODELS.PRO || requestedModel === MODELS.FLASH) {
        model = requestedModel;
      } else {
        console.warn(`警告: ${requestedModel} は許可されていません。Gemini 3系のみ使用可能です。`);
        console.log(`デフォルトの ${MODELS.PRO} を使用します。`);
      }
      i += 2;
      continue;
    }

    // 高速モード（Gemini 3 Flash Preview）
    if (arg === '--flash' || arg === '-f') {
      model = MODELS.FLASH;
      i++;
      continue;
    }

    // YOLOモード
    if (arg === '--yolo' || arg === '-y') {
      yolo = true;
      i++;
      continue;
    }

    // 対話モード
    if (arg === '--interactive' || arg === '-i') {
      runGeminiInteractive(model);
      return;
    }

    // エラー解決モード
    if (arg === '--error' || arg === '-e') {
      mode = 'error';
      prompt = args.slice(i + 1).join(' ');
      break;
    }

    // Minecraft関連タスクモード
    if (arg === '--minecraft' || arg === '-mc') {
      mode = 'minecraft';
      prompt = args.slice(i + 1).join(' ');
      break;
    }

    // ファイル修正モード
    if (arg === '--file') {
      mode = 'file';
      const filePath = args[i + 1];
      const content = readFile(filePath);
      if (!content) {
        process.exit(1);
      }
      fileInfo = { name: path.basename(filePath), content };
      const task = args.slice(i + 2).join(' ') || '改善してください';
      prompt = generatePrompt(task, mode, fileInfo);
      break;
    }

    // 通常のプロンプト
    prompt = args.slice(i).join(' ');
    break;
  }

  if (!prompt) {
    console.error('プロンプトが指定されていません。');
    process.exit(1);
  }

  // プロンプト生成（特殊モードの場合）
  if (mode === 'error' || mode === 'minecraft') {
    prompt = generatePrompt(prompt, mode);
  }

  // Gemini実行（Gemini 3系のみ、フォールバックなし）
  runGeminiWithPrompt(prompt, model, yolo);
}

main();
