/**
 * Advanced Text Editor for Minecraft JSON Text Component
 *
 * minecraft.tools スタイルの高度なリッチテキストエディター
 * - 1文字ごとの色・書式設定
 * - クリックイベント・ホバーイベント
 * - バージョン別出力（1.12.2〜1.21.5+）
 * - WYSIWYG編集
 */

import { $, $$, createElement, delegate } from '../core/dom.js';
import { workspaceStore } from '../core/store.js';
import { compareVersions } from '../core/version-compat.js';

// Minecraft 16色カラーパレット
export const MC_COLORS = [
  { id: 'black', name: '黒', hex: '#000000', code: '0' },
  { id: 'dark_blue', name: '紺', hex: '#0000AA', code: '1' },
  { id: 'dark_green', name: '深緑', hex: '#00AA00', code: '2' },
  { id: 'dark_aqua', name: '青緑', hex: '#00AAAA', code: '3' },
  { id: 'dark_red', name: '暗赤', hex: '#AA0000', code: '4' },
  { id: 'dark_purple', name: '紫', hex: '#AA00AA', code: '5' },
  { id: 'gold', name: '金', hex: '#FFAA00', code: '6' },
  { id: 'gray', name: '灰', hex: '#AAAAAA', code: '7' },
  { id: 'dark_gray', name: '暗灰', hex: '#555555', code: '8' },
  { id: 'blue', name: '青', hex: '#5555FF', code: '9' },
  { id: 'green', name: '緑', hex: '#55FF55', code: 'a' },
  { id: 'aqua', name: '水色', hex: '#55FFFF', code: 'b' },
  { id: 'red', name: '赤', hex: '#FF5555', code: 'c' },
  { id: 'light_purple', name: '桃', hex: '#FF55FF', code: 'd' },
  { id: 'yellow', name: '黄', hex: '#FFFF55', code: 'e' },
  { id: 'white', name: '白', hex: '#FFFFFF', code: 'f' },
];

// 書式オプション
export const FORMAT_OPTIONS = [
  { id: 'bold', name: '太字', icon: 'B', key: 'b' },
  { id: 'italic', name: '斜体', icon: 'I', key: 'i' },
  { id: 'underlined', name: '下線', icon: 'U', key: 'u' },
  { id: 'strikethrough', name: '打消', icon: 'S', key: 's' },
  { id: 'obfuscated', name: '難読', icon: '?', key: 'o' },
];

// クリックイベントアクション
export const CLICK_ACTIONS = [
  { value: '', label: 'なし' },
  { value: 'run_command', label: 'コマンド実行' },
  { value: 'suggest_command', label: 'コマンド提案' },
  { value: 'open_url', label: 'URL開く' },
  { value: 'copy_to_clipboard', label: 'コピー' },
  { value: 'change_page', label: 'ページ移動' },
];

// ホバーイベントアクション
export const HOVER_ACTIONS = [
  { value: '', label: 'なし' },
  { value: 'show_text', label: 'テキスト表示' },
  { value: 'show_item', label: 'アイテム表示' },
  { value: 'show_entity', label: 'エンティティ表示' },
];

/**
 * Advanced Text Editor クラス
 */
export class AdvancedTextEditor {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      placeholder: 'テキストを入力...',
      showClickEvent: true,
      showHoverEvent: true,
      showPreview: true,
      maxLength: null,
      onChange: null,
      ...options
    };

    // 1文字ごとのフォーマット情報
    // [{char: 'H', color: 'red', bold: true, italic: false, ...}, ...]
    this.characters = [];

    // 現在適用中の書式（新規入力時に使用）
    this.currentFormat = {
      color: 'white',
      bold: false,
      italic: false,
      underlined: false,
      strikethrough: false,
      obfuscated: false,
    };

    // イベント設定
    this.clickEvent = null;
    this.hoverEvent = null;

    // 難読化アニメーション用
    this.obfuscatedInterval = null;
  }

  /**
   * エディターHTMLをレンダリング
   */
  render() {
    const colorButtons = MC_COLORS.map(c => `
      <button type="button" class="ate-color-btn ${c.id === 'white' ? 'active' : ''}"
              data-color="${c.id}" data-hex="${c.hex}"
              style="background-color: ${c.hex};" title="${c.name} (§${c.code})">
      </button>
    `).join('');

    const formatButtons = FORMAT_OPTIONS.map(fmt => `
      <button type="button" class="ate-btn ate-format-btn" data-format="${fmt.id}" title="${fmt.name}">
        <span class="ate-btn-icon">${fmt.icon}</span>
      </button>
    `).join('');

    const clickOptions = CLICK_ACTIONS.map(a =>
      `<option value="${a.value}">${a.label}</option>`
    ).join('');

    const hoverOptions = HOVER_ACTIONS.map(a =>
      `<option value="${a.value}">${a.label}</option>`
    ).join('');

    return `
      <div class="advanced-text-editor" id="${this.containerId}">
        <!-- ツールバー -->
        <div class="ate-toolbar">
          <div class="ate-toolbar-row">
            <!-- 書式ボタン -->
            <div class="ate-format-group">
              ${formatButtons}
            </div>

            <!-- カラーパレット -->
            <div class="ate-color-group">
              <div class="ate-color-palette">
                ${colorButtons}
              </div>
              <div class="ate-custom-color">
                <input type="color" class="ate-color-picker" id="${this.containerId}-picker" value="#FFFFFF" title="カスタムカラー (1.16+)">
                <span class="ate-color-hex" id="${this.containerId}-hex">#FFFFFF</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 入力エリア -->
        <div class="ate-input-wrapper">
          <div class="ate-input" contenteditable="true" id="${this.containerId}-input"
               data-placeholder="${this.options.placeholder}" spellcheck="false"></div>
          ${this.options.maxLength ? `
            <div class="ate-char-count">
              <span id="${this.containerId}-count">0</span>/${this.options.maxLength}
            </div>
          ` : ''}
        </div>

        ${this.options.showClickEvent || this.options.showHoverEvent ? `
        <!-- イベント設定 -->
        <div class="ate-events">
          ${this.options.showClickEvent ? `
          <div class="ate-event-group">
            <label>クリックイベント</label>
            <div class="ate-event-row">
              <select class="ate-event-action mc-select" id="${this.containerId}-click-action">
                ${clickOptions}
              </select>
              <input type="text" class="ate-event-value mc-input" id="${this.containerId}-click-value"
                     placeholder="値を入力..." style="display:none">
            </div>
          </div>
          ` : ''}
          ${this.options.showHoverEvent ? `
          <div class="ate-event-group">
            <label>ホバーイベント</label>
            <div class="ate-event-row">
              <select class="ate-event-action mc-select" id="${this.containerId}-hover-action">
                ${hoverOptions}
              </select>
              <input type="text" class="ate-event-value mc-input" id="${this.containerId}-hover-value"
                     placeholder="表示テキスト..." style="display:none">
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${this.options.showPreview ? `
        <!-- プレビュー -->
        <div class="ate-preview-section">
          <label class="ate-preview-label">Minecraftプレビュー</label>
          <div class="ate-preview mc-chat-bg" id="${this.containerId}-preview">
            <span class="ate-placeholder">${this.options.placeholder}</span>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * イベントハンドラーを初期化
   */
  init(container) {
    const editor = container.querySelector(`#${this.containerId}`);
    if (!editor) return;

    const input = editor.querySelector(`#${this.containerId}-input`);
    const colorPicker = editor.querySelector(`#${this.containerId}-picker`);

    // 書式ボタンクリック
    editor.querySelectorAll('.ate-format-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = btn.dataset.format;
        this.toggleFormat(format);
        btn.classList.toggle('active', this.currentFormat[format]);
        this.applyFormatToSelection(input);
        this.updatePreview(editor);
        this.triggerChange();
      });
    });

    // カラーボタンクリック
    editor.querySelectorAll('.ate-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const color = btn.dataset.color;
        this.setColor(color);
        editor.querySelectorAll('.ate-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyFormatToSelection(input);
        this.updatePreview(editor);
        this.triggerChange();
      });
    });

    // カスタムカラー選択
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        const hex = e.target.value;
        this.setColor(hex);
        const hexDisplay = editor.querySelector(`#${this.containerId}-hex`);
        if (hexDisplay) hexDisplay.textContent = hex;
        editor.querySelectorAll('.ate-color-btn').forEach(b => b.classList.remove('active'));
        this.applyFormatToSelection(input);
        this.updatePreview(editor);
        this.triggerChange();
      });
    }

    // 入力変更
    if (input) {
      input.addEventListener('input', () => {
        this.parseInput(input);
        this.updateCharCount(editor);
        this.updatePreview(editor);
        this.triggerChange();
      });

      // キー入力前に現在の書式を適用
      input.addEventListener('keypress', (e) => {
        // Enterキーは改行として処理
        if (e.key === 'Enter') {
          e.preventDefault();
          document.execCommand('insertText', false, '\n');
        }
      });

      // 選択変更時に書式ボタンの状態を更新
      input.addEventListener('mouseup', () => this.updateToolbarState(editor, input));
      input.addEventListener('keyup', () => this.updateToolbarState(editor, input));

      // フォーカス時のプレースホルダー処理
      input.addEventListener('focus', () => {
        if (input.textContent === '') {
          input.classList.add('focused');
        }
      });

      input.addEventListener('blur', () => {
        input.classList.remove('focused');
      });

      // キーボードショートカット
      input.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
          const formatMap = { b: 'bold', i: 'italic', u: 'underlined' };
          const format = formatMap[e.key.toLowerCase()];
          if (format) {
            e.preventDefault();
            this.toggleFormat(format);
            this.applyFormatToSelection(input);
            this.updateToolbarState(editor, input);
            this.updatePreview(editor);
            this.triggerChange();
          }
        }
      });
    }

    // クリックイベント設定
    const clickAction = editor.querySelector(`#${this.containerId}-click-action`);
    const clickValue = editor.querySelector(`#${this.containerId}-click-value`);
    if (clickAction) {
      clickAction.addEventListener('change', () => {
        if (clickValue) {
          clickValue.style.display = clickAction.value ? 'block' : 'none';
        }
        this.updateClickEvent(editor);
        this.triggerChange();
      });
    }
    if (clickValue) {
      clickValue.addEventListener('input', () => {
        this.updateClickEvent(editor);
        this.triggerChange();
      });
    }

    // ホバーイベント設定
    const hoverAction = editor.querySelector(`#${this.containerId}-hover-action`);
    const hoverValue = editor.querySelector(`#${this.containerId}-hover-value`);
    if (hoverAction) {
      hoverAction.addEventListener('change', () => {
        if (hoverValue) {
          hoverValue.style.display = hoverAction.value ? 'block' : 'none';
        }
        this.updateHoverEvent(editor);
        this.triggerChange();
      });
    }
    if (hoverValue) {
      hoverValue.addEventListener('input', () => {
        this.updateHoverEvent(editor);
        this.triggerChange();
      });
    }

    // 初期プレビュー
    this.updatePreview(editor);
  }

  /**
   * 書式をトグル
   */
  toggleFormat(format) {
    this.currentFormat[format] = !this.currentFormat[format];
  }

  /**
   * 色を設定
   */
  setColor(color) {
    this.currentFormat.color = color;
  }

  /**
   * 選択範囲に書式を適用
   */
  applyFormatToSelection(input) {
    if (!input) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // 選択範囲がない

    // 選択テキストを取得
    const selectedText = range.toString();
    if (!selectedText) return;

    // 新しいスパン要素を作成
    const span = this.createFormattedSpan(selectedText);

    // 選択範囲を削除して新しいスパンを挿入
    range.deleteContents();
    range.insertNode(span);

    // カーソルを末尾に移動
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    newRange.collapse(false);
    selection.addRange(newRange);

    // 内部モデルを更新
    this.parseInput(input);
  }

  /**
   * 書式付きスパン要素を作成
   */
  createFormattedSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;

    // スタイルを適用
    span.style.color = this.getColorHex(this.currentFormat.color);
    if (this.currentFormat.bold) span.style.fontWeight = 'bold';
    if (this.currentFormat.italic) span.style.fontStyle = 'italic';
    if (this.currentFormat.underlined) span.style.textDecoration = 'underline';
    if (this.currentFormat.strikethrough) {
      span.style.textDecoration = span.style.textDecoration
        ? span.style.textDecoration + ' line-through'
        : 'line-through';
    }

    // データ属性で書式情報を保存
    span.dataset.mcColor = this.currentFormat.color;
    span.dataset.mcBold = this.currentFormat.bold;
    span.dataset.mcItalic = this.currentFormat.italic;
    span.dataset.mcUnderlined = this.currentFormat.underlined;
    span.dataset.mcStrikethrough = this.currentFormat.strikethrough;
    span.dataset.mcObfuscated = this.currentFormat.obfuscated;

    return span;
  }

  /**
   * 入力をパースして内部モデルを更新
   */
  parseInput(input) {
    this.characters = [];

    const walk = (node, format = { ...this.currentFormat, color: 'white' }) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        for (const char of text) {
          this.characters.push({ char, ...format });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const newFormat = { ...format };

        // data属性から書式を取得
        if (node.dataset?.mcColor) newFormat.color = node.dataset.mcColor;
        if (node.dataset?.mcBold === 'true') newFormat.bold = true;
        if (node.dataset?.mcItalic === 'true') newFormat.italic = true;
        if (node.dataset?.mcUnderlined === 'true') newFormat.underlined = true;
        if (node.dataset?.mcStrikethrough === 'true') newFormat.strikethrough = true;
        if (node.dataset?.mcObfuscated === 'true') newFormat.obfuscated = true;

        // BRタグは改行として処理
        if (node.tagName === 'BR') {
          this.characters.push({ char: '\n', ...newFormat });
          return;
        }

        for (const child of node.childNodes) {
          walk(child, newFormat);
        }
      }
    };

    walk(input);
  }

  /**
   * ツールバーの状態を更新
   */
  updateToolbarState(editor, input) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let container = range.startContainer;

    // テキストノードの場合は親要素を取得
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    // data属性から書式を取得
    if (container && container.dataset) {
      const formats = ['bold', 'italic', 'underlined', 'strikethrough', 'obfuscated'];
      formats.forEach(fmt => {
        const btn = editor.querySelector(`.ate-format-btn[data-format="${fmt}"]`);
        if (btn) {
          const isActive = container.dataset[`mc${fmt.charAt(0).toUpperCase() + fmt.slice(1)}`] === 'true';
          btn.classList.toggle('active', isActive);
          this.currentFormat[fmt] = isActive;
        }
      });

      // 色
      if (container.dataset.mcColor) {
        this.currentFormat.color = container.dataset.mcColor;
        editor.querySelectorAll('.ate-color-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.color === container.dataset.mcColor);
        });
      }
    }
  }

  /**
   * 文字数カウントを更新
   */
  updateCharCount(editor) {
    if (!this.options.maxLength) return;

    const countEl = editor.querySelector(`#${this.containerId}-count`);
    if (countEl) {
      const count = this.characters.length;
      countEl.textContent = count;
      countEl.style.color = count > this.options.maxLength ? 'var(--mc-color-redstone)' : '';
    }
  }

  /**
   * プレビューを更新
   */
  updatePreview(editor) {
    const preview = editor.querySelector(`#${this.containerId}-preview`);
    if (!preview) return;

    // 難読化アニメーションを停止
    if (this.obfuscatedInterval) {
      clearInterval(this.obfuscatedInterval);
      this.obfuscatedInterval = null;
    }

    if (this.characters.length === 0) {
      preview.innerHTML = `<span class="ate-placeholder">${this.options.placeholder}</span>`;
      return;
    }

    // 連続する同じ書式の文字をグループ化
    const groups = this.getFormattedGroups();

    // HTMLを生成
    preview.innerHTML = groups.map((group, idx) => {
      const classes = ['mc-text-segment'];

      // 色クラス
      if (group.color) {
        if (group.color.startsWith('#')) {
          // HEXカラー
        } else {
          classes.push(`mc-color-${group.color.replace('_', '-')}`);
        }
      } else {
        classes.push('mc-color-white');
      }

      // スタイルクラス
      if (group.bold) classes.push('mc-bold');
      if (group.italic) classes.push('mc-italic');
      if (group.underlined) classes.push('mc-underlined');
      if (group.strikethrough) classes.push('mc-strikethrough');
      if (group.obfuscated) classes.push('mc-obfuscated');

      // HEXカラーの場合はインラインスタイル
      const style = group.color?.startsWith('#') ? `color: ${group.color};` : '';

      const text = this.escapeHtml(group.text).replace(/\n/g, '<br>');

      if (group.obfuscated) {
        return `<span class="${classes.join(' ')}" style="${style}" data-text="${this.escapeHtml(group.text)}" data-idx="${idx}">${text}</span>`;
      }

      return `<span class="${classes.join(' ')}" style="${style}">${text}</span>`;
    }).join('');

    // 難読化アニメーション開始
    this.startObfuscatedAnimation(preview);
  }

  /**
   * 難読化アニメーション
   */
  startObfuscatedAnimation(preview) {
    const obfuscatedElements = preview.querySelectorAll('.mc-obfuscated');
    if (obfuscatedElements.length === 0) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

    this.obfuscatedInterval = setInterval(() => {
      obfuscatedElements.forEach(el => {
        const originalText = el.dataset.text || '';
        let newText = '';
        for (let i = 0; i < originalText.length; i++) {
          if (originalText[i] === ' ' || originalText[i] === '\n') {
            newText += originalText[i];
          } else {
            newText += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        el.innerHTML = newText.replace(/\n/g, '<br>');
      });
    }, 50);
  }

  /**
   * クリックイベントを更新
   */
  updateClickEvent(editor) {
    const action = editor.querySelector(`#${this.containerId}-click-action`)?.value;
    const value = editor.querySelector(`#${this.containerId}-click-value`)?.value;

    if (action && value) {
      this.clickEvent = { action, value };
    } else {
      this.clickEvent = null;
    }
  }

  /**
   * ホバーイベントを更新
   */
  updateHoverEvent(editor) {
    const action = editor.querySelector(`#${this.containerId}-hover-action`)?.value;
    const value = editor.querySelector(`#${this.containerId}-hover-value`)?.value;

    if (action && value) {
      this.hoverEvent = { action, contents: action === 'show_text' ? { text: value } : value };
    } else {
      this.hoverEvent = null;
    }
  }

  /**
   * 連続する同じ書式の文字をグループ化
   */
  getFormattedGroups() {
    if (this.characters.length === 0) return [];

    const groups = [];
    let currentGroup = null;

    for (const c of this.characters) {
      const formatKey = JSON.stringify({
        color: c.color,
        bold: c.bold,
        italic: c.italic,
        underlined: c.underlined,
        strikethrough: c.strikethrough,
        obfuscated: c.obfuscated,
      });

      if (currentGroup && currentGroup.formatKey === formatKey) {
        currentGroup.text += c.char;
      } else {
        currentGroup = {
          text: c.char,
          color: c.color,
          bold: c.bold,
          italic: c.italic,
          underlined: c.underlined,
          strikethrough: c.strikethrough,
          obfuscated: c.obfuscated,
          formatKey,
        };
        groups.push(currentGroup);
      }
    }

    return groups;
  }

  /**
   * JSON形式で出力（1.12-1.20.4向け）
   */
  generateJSON(options = {}) {
    const { version = '1.20+', includeEvents = true } = options;
    const groups = this.getFormattedGroups();

    if (groups.length === 0) return '""';

    const components = groups.map((group, idx) => {
      const obj = { text: group.text };

      // 色
      if (group.color && group.color !== 'white') {
        // 1.16未満はHEXカラー非対応
        if (group.color.startsWith('#') && compareVersions(version, '1.16') < 0) {
          // HEXカラーを最も近いMC色に変換
          obj.color = this.hexToMcColor(group.color);
        } else {
          obj.color = group.color;
        }
      }

      // 書式
      if (group.bold) obj.bold = true;
      if (group.italic) obj.italic = true;
      if (group.underlined) obj.underlined = true;
      if (group.strikethrough) obj.strikethrough = true;
      if (group.obfuscated) obj.obfuscated = true;

      // イベント（最初のグループのみ）
      if (includeEvents && idx === 0) {
        if (this.clickEvent) {
          obj.clickEvent = this.clickEvent;
        }
        if (this.hoverEvent) {
          obj.hoverEvent = this.hoverEvent;
        }
      }

      return obj;
    });

    // 単一コンポーネントの場合
    if (components.length === 1) {
      return JSON.stringify(components[0]);
    }

    // 配列形式（空文字列を先頭に）
    return JSON.stringify(['', ...components]);
  }

  /**
   * SNBT形式で出力（1.21.5+向け）
   */
  generateSNBT(options = {}) {
    const { includeEvents = true } = options;
    const groups = this.getFormattedGroups();

    if (groups.length === 0) return '""';

    const components = groups.map((group, idx) => {
      const parts = [`text:"${this.escapeSnbt(group.text)}"`];

      // 色
      if (group.color && group.color !== 'white') {
        parts.push(`color:"${group.color}"`);
      }

      // 書式
      if (group.bold) parts.push('bold:true');
      if (group.italic) parts.push('italic:true');
      if (group.underlined) parts.push('underlined:true');
      if (group.strikethrough) parts.push('strikethrough:true');
      if (group.obfuscated) parts.push('obfuscated:true');

      // イベント（最初のグループのみ、snake_case形式）
      if (includeEvents && idx === 0) {
        if (this.clickEvent) {
          const clickParts = [`action:"${this.clickEvent.action}"`];
          const value = this.clickEvent.value;

          switch (this.clickEvent.action) {
            case 'run_command':
              clickParts.push(`command:"${this.escapeSnbt(value.startsWith('/') ? value.slice(1) : value)}"`);
              break;
            case 'suggest_command':
              clickParts.push(`command:"${this.escapeSnbt(value)}"`);
              break;
            case 'open_url':
              clickParts.push(`url:"${this.escapeSnbt(value)}"`);
              break;
            case 'copy_to_clipboard':
              clickParts.push(`contents:"${this.escapeSnbt(value)}"`);
              break;
            case 'change_page':
              clickParts.push(`page:${parseInt(value) || 1}`);
              break;
          }
          parts.push(`click_event:{${clickParts.join(',')}}`);
        }
        if (this.hoverEvent) {
          const hoverParts = [`action:"${this.hoverEvent.action}"`];

          if (this.hoverEvent.action === 'show_text') {
            if (typeof this.hoverEvent.contents === 'object' && this.hoverEvent.contents.text) {
              hoverParts.push(`value:{text:"${this.escapeSnbt(this.hoverEvent.contents.text)}"}`);
            } else {
              hoverParts.push(`value:"${this.escapeSnbt(String(this.hoverEvent.contents))}"`);
            }
          }
          parts.push(`hover_event:{${hoverParts.join(',')}}`);
        }
      }

      return `{${parts.join(',')}}`;
    });

    // 単一コンポーネントの場合
    if (components.length === 1) {
      return components[0];
    }

    // 配列形式
    return `[${components.join(',')}]`;
  }

  /**
   * バージョンに応じた出力を取得
   */
  getOutput(version = null) {
    const globalVersion = version || workspaceStore.get('version') || '1.21';

    if (compareVersions(globalVersion, '1.21') >= 0) {
      return this.generateSNBT();
    } else {
      return this.generateJSON({ version: globalVersion });
    }
  }

  /**
   * データを取得（他ツールとの互換性用）
   */
  getData() {
    return this.getFormattedGroups().map(g => ({
      text: g.text,
      color: g.color,
      bold: g.bold,
      italic: g.italic,
      underlined: g.underlined,
      strikethrough: g.strikethrough,
      obfuscated: g.obfuscated,
      clickEvent: this.clickEvent,
      hoverEvent: this.hoverEvent,
    }));
  }

  /**
   * プレーンテキストを取得
   */
  getPlainText() {
    return this.characters.map(c => c.char).join('');
  }

  /**
   * テキストをセット
   */
  setText(text, container) {
    const input = container.querySelector(`#${this.containerId}-input`);
    if (input) {
      input.textContent = text;
      this.parseInput(input);
      this.updatePreview(container.querySelector(`#${this.containerId}`));
    }
  }

  /**
   * クリア
   */
  clear(container) {
    const input = container.querySelector(`#${this.containerId}-input`);
    if (input) {
      input.innerHTML = '';
      this.characters = [];
      this.clickEvent = null;
      this.hoverEvent = null;
      this.updatePreview(container.querySelector(`#${this.containerId}`));
    }
  }

  /**
   * 変更コールバック
   */
  triggerChange() {
    if (this.options.onChange) {
      this.options.onChange(this.getOutput(), this.getPlainText());
    }
  }

  /**
   * カラーIDからHEX値を取得
   */
  getColorHex(color) {
    if (color.startsWith('#')) return color;
    const mcColor = MC_COLORS.find(c => c.id === color);
    return mcColor?.hex || '#FFFFFF';
  }

  /**
   * HEXカラーを最も近いMC色に変換
   */
  hexToMcColor(hex) {
    // 簡易実装：最も近い色を見つける
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    let minDistance = Infinity;
    let closestColor = 'white';

    for (const mc of MC_COLORS) {
      const mr = parseInt(mc.hex.slice(1, 3), 16);
      const mg = parseInt(mc.hex.slice(3, 5), 16);
      const mb = parseInt(mc.hex.slice(5, 7), 16);

      const distance = Math.sqrt(
        Math.pow(r - mr, 2) +
        Math.pow(g - mg, 2) +
        Math.pow(b - mb, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = mc.id;
      }
    }

    return closestColor;
  }

  /**
   * SNBT用エスケープ
   */
  escapeSnbt(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }

  /**
   * HTML用エスケープ
   */
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

/**
 * CSSスタイル
 */
export const ADVANCED_TEXT_EDITOR_CSS = `
  .advanced-text-editor {
    background: var(--mc-bg-surface, #2a2a2a);
    border: 2px solid var(--mc-border-dark, #1a1a1a);
    border-radius: 6px;
    overflow: hidden;
  }

  .ate-toolbar {
    padding: 8px;
    background: var(--mc-bg-panel, #1a1a1a);
    border-bottom: 1px solid var(--mc-border-dark, #333);
  }

  .ate-toolbar-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .ate-format-group {
    display: flex;
    gap: 4px;
  }

  .ate-btn {
    padding: 6px 10px;
    background: var(--mc-bg-surface, #3a3a3a);
    border: 1px solid var(--mc-border-dark, #555);
    border-radius: 4px;
    color: var(--mc-text-primary, #fff);
    cursor: pointer;
    font-weight: bold;
    transition: all 0.15s;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ate-btn:hover {
    background: var(--mc-bg-hover, #4a4a4a);
  }

  .ate-btn.active {
    background: var(--mc-color-grass-main, #5CB746);
    border-color: var(--mc-color-grass-dark, #3d8c2e);
    color: white;
  }

  .ate-format-btn .ate-btn-icon {
    font-family: serif;
  }

  .ate-format-btn[data-format="bold"] .ate-btn-icon { font-weight: bold; }
  .ate-format-btn[data-format="italic"] .ate-btn-icon { font-style: italic; }
  .ate-format-btn[data-format="underlined"] .ate-btn-icon { text-decoration: underline; }
  .ate-format-btn[data-format="strikethrough"] .ate-btn-icon { text-decoration: line-through; }

  .ate-color-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ate-color-palette {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
  }

  .ate-color-btn {
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .ate-color-btn:hover {
    transform: scale(1.15);
    z-index: 1;
  }

  .ate-color-btn.active {
    border-color: white;
    box-shadow: 0 0 4px rgba(255,255,255,0.6);
  }

  .ate-custom-color {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ate-color-picker {
    width: 32px;
    height: 24px;
    border: 1px solid var(--mc-border-dark, #555);
    border-radius: 3px;
    cursor: pointer;
    padding: 0;
  }

  .ate-color-hex {
    font-size: 0.7rem;
    color: var(--mc-text-muted, #888);
    font-family: monospace;
  }

  .ate-input-wrapper {
    padding: 8px;
    position: relative;
  }

  .ate-input {
    min-height: 80px;
    padding: 12px;
    background: var(--mc-bg-panel, #1a1a1a);
    border: 1px solid var(--mc-border-dark, #333);
    border-radius: 4px;
    color: var(--mc-text-primary, #fff);
    font-family: 'Minecraft', monospace;
    font-size: 1rem;
    line-height: 1.5;
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .ate-input:focus {
    border-color: var(--mc-color-diamond, #5ECDFA);
  }

  .ate-input:empty:before {
    content: attr(data-placeholder);
    color: var(--mc-text-muted, #666);
  }

  .ate-char-count {
    position: absolute;
    right: 16px;
    bottom: 16px;
    font-size: 0.75rem;
    color: var(--mc-text-muted, #888);
  }

  .ate-events {
    display: flex;
    gap: 16px;
    padding: 8px;
    border-top: 1px solid var(--mc-border-dark, #333);
    flex-wrap: wrap;
  }

  .ate-event-group {
    flex: 1;
    min-width: 200px;
  }

  .ate-event-group label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted, #888);
    margin-bottom: 4px;
  }

  .ate-event-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ate-preview-section {
    padding: 8px;
    border-top: 1px solid var(--mc-border-dark, #333);
  }

  .ate-preview-label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted, #888);
    margin-bottom: 4px;
  }

  .ate-preview {
    padding: 12px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    font-family: 'Minecraft', monospace;
    font-size: 1rem;
    min-height: 40px;
    line-height: 1.5;
  }

  .ate-placeholder {
    color: #666;
    font-style: italic;
  }

  /* Minecraft カラークラス */
  .mc-text-segment { display: inline; }
  .mc-color-black { color: #000000; text-shadow: 1px 1px 0 #000000; }
  .mc-color-dark-blue { color: #0000AA; text-shadow: 1px 1px 0 #00002A; }
  .mc-color-dark-green { color: #00AA00; text-shadow: 1px 1px 0 #002A00; }
  .mc-color-dark-aqua { color: #00AAAA; text-shadow: 1px 1px 0 #002A2A; }
  .mc-color-dark-red { color: #AA0000; text-shadow: 1px 1px 0 #2A0000; }
  .mc-color-dark-purple { color: #AA00AA; text-shadow: 1px 1px 0 #2A002A; }
  .mc-color-gold { color: #FFAA00; text-shadow: 1px 1px 0 #2A2A00; }
  .mc-color-gray { color: #AAAAAA; text-shadow: 1px 1px 0 #2A2A2A; }
  .mc-color-dark-gray { color: #555555; text-shadow: 1px 1px 0 #151515; }
  .mc-color-blue { color: #5555FF; text-shadow: 1px 1px 0 #15153F; }
  .mc-color-green { color: #55FF55; text-shadow: 1px 1px 0 #153F15; }
  .mc-color-aqua { color: #55FFFF; text-shadow: 1px 1px 0 #153F3F; }
  .mc-color-red { color: #FF5555; text-shadow: 1px 1px 0 #3F1515; }
  .mc-color-light-purple { color: #FF55FF; text-shadow: 1px 1px 0 #3F153F; }
  .mc-color-yellow { color: #FFFF55; text-shadow: 1px 1px 0 #3F3F15; }
  .mc-color-white { color: #FFFFFF; text-shadow: 1px 1px 0 #3F3F3F; }

  /* スタイル */
  .mc-bold { font-weight: bold; text-shadow: 2px 1px 0 currentColor, 1px 1px 0 rgba(0,0,0,0.5) !important; }
  .mc-italic { font-style: italic; }
  .mc-underlined { text-decoration: underline; }
  .mc-strikethrough { text-decoration: line-through; }
  .mc-obfuscated { font-family: 'Minecraft', monospace; }
`;

// CSSを自動追加
const styleEl = document.createElement('style');
styleEl.textContent = ADVANCED_TEXT_EDITOR_CSS;
document.head.appendChild(styleEl);

export default AdvancedTextEditor;
