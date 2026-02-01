/**
 * Rich Text Editor for Minecraft Custom Names
 * JSON Text Component / SNBT形式に対応したリッチテキストエディター
 *
 * 機能:
 * - 16色 + RGB カスタムカラー
 * - 書式設定（太字、斜体、下線、打消し線、難読化）
 * - 1文字ごとの色・書式設定
 * - SNBT形式出力（1.21.5+対応）
 */

// Minecraft定義済みカラー（16色）
export const MC_COLORS = [
  { id: 'black', name: '黒', hex: '#000000' },
  { id: 'dark_blue', name: '紺', hex: '#0000AA' },
  { id: 'dark_green', name: '深緑', hex: '#00AA00' },
  { id: 'dark_aqua', name: '青緑', hex: '#00AAAA' },
  { id: 'dark_red', name: '暗赤', hex: '#AA0000' },
  { id: 'dark_purple', name: '紫', hex: '#AA00AA' },
  { id: 'gold', name: '金', hex: '#FFAA00' },
  { id: 'gray', name: '灰', hex: '#AAAAAA' },
  { id: 'dark_gray', name: '暗灰', hex: '#555555' },
  { id: 'blue', name: '青', hex: '#5555FF' },
  { id: 'green', name: '緑', hex: '#55FF55' },
  { id: 'aqua', name: '水色', hex: '#55FFFF' },
  { id: 'red', name: '赤', hex: '#FF5555' },
  { id: 'light_purple', name: '桃', hex: '#FF55FF' },
  { id: 'yellow', name: '黄', hex: '#FFFF55' },
  { id: 'white', name: '白', hex: '#FFFFFF' },
];

// 書式オプション
export const FORMAT_OPTIONS = [
  { id: 'bold', name: '太字', icon: 'B', shortcut: 'Ctrl+B' },
  { id: 'italic', name: '斜体', icon: 'I', shortcut: 'Ctrl+I' },
  { id: 'underlined', name: '下線', icon: 'U', shortcut: 'Ctrl+U' },
  { id: 'strikethrough', name: '打消', icon: 'S', shortcut: 'Ctrl+S' },
  { id: 'obfuscated', name: '難読', icon: '?', shortcut: 'Ctrl+O' },
];

/**
 * リッチテキストエディターの状態を管理するクラス
 */
export class RichTextEditor {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      placeholder: 'テキストを入力...',
      showPreview: true,
      onChange: null,
      ...options
    };

    // 各文字のフォーマット情報を保持
    // [{char: 'A', color: 'gold', bold: true, ...}, ...]
    this.characters = [];

    // 現在の選択範囲
    this.selection = { start: 0, end: 0 };

    // 現在適用中の書式
    this.currentFormat = {
      color: 'white',
      bold: false,
      italic: false,
      underlined: false,
      strikethrough: false,
      obfuscated: false,
    };
  }

  /**
   * エディターをレンダリング
   */
  render() {
    return `
      <div class="rich-text-editor" id="${this.containerId}">
        <!-- ツールバー -->
        <div class="rte-toolbar">
          <!-- 上段: 書式ボタン -->
          <div class="rte-toolbar-row">
            <span class="rte-color-label">文字色</span>
            <div class="rte-format-buttons">
              ${FORMAT_OPTIONS.map(fmt => `
                <button type="button" class="rte-btn rte-format-btn" data-format="${fmt.id}" title="${fmt.name} (${fmt.shortcut})">
                  ${fmt.icon}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 下段: カラーパレット（2行×8列グリッド） -->
          <div class="rte-color-section">
            <div class="rte-color-palette">
              ${MC_COLORS.map(c => `
                <button type="button" class="rte-color-btn ${c.id === 'white' ? 'active' : ''}"
                        data-color="${c.id}" data-hex="${c.hex}"
                        style="background-color: ${c.hex};" title="${c.name}">
                </button>
              `).join('')}
            </div>
            <div class="rte-custom-color">
              <input type="color" class="rte-color-picker" id="${this.containerId}-color-picker" value="#FFFFFF">
              <span class="rte-color-label">カスタムRGB</span>
            </div>
          </div>
        </div>

        <!-- 入力エリア -->
        <div class="rte-input-wrapper">
          <div class="rte-input" contenteditable="true" id="${this.containerId}-input"
               data-placeholder="${this.options.placeholder}"></div>
        </div>

        <!-- プレビュー -->
        ${this.options.showPreview ? `
          <div class="rte-preview-section">
            <label class="rte-preview-label">Minecraftプレビュー</label>
            <div class="rte-preview mc-chat-bg" id="${this.containerId}-preview"></div>
          </div>
        ` : ''}

        <!-- 出力（非表示） -->
        <input type="hidden" id="${this.containerId}-output" value="">
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
    const colorPicker = editor.querySelector(`#${this.containerId}-color-picker`);

    // 書式ボタンクリック
    editor.querySelectorAll('.rte-format-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = btn.dataset.format;
        this.toggleFormat(format);
        btn.classList.toggle('active', this.currentFormat[format]);
        this.updatePreview(container);
      });
    });

    // カラーボタンクリック
    editor.querySelectorAll('.rte-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const color = btn.dataset.color;
        this.setColor(color);
        editor.querySelectorAll('.rte-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyFormatToSelection(container);
        this.updatePreview(container);
      });
    });

    // カスタムカラー選択
    colorPicker?.addEventListener('input', (e) => {
      const hex = e.target.value;
      this.setColor(hex);
      editor.querySelectorAll('.rte-color-btn').forEach(b => b.classList.remove('active'));
      this.applyFormatToSelection(container);
      this.updatePreview(container);
    });

    // 入力変更
    input?.addEventListener('input', () => {
      this.parseInput(input);
      this.updatePreview(container);
      this.triggerChange();
    });

    // 選択変更
    input?.addEventListener('mouseup', () => this.updateSelection(input));
    input?.addEventListener('keyup', () => this.updateSelection(input));

    // キーボードショートカット
    input?.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b': e.preventDefault(); this.toggleFormat('bold'); break;
          case 'i': e.preventDefault(); this.toggleFormat('italic'); break;
          case 'u': e.preventDefault(); this.toggleFormat('underlined'); break;
        }
        this.updateToolbarState(editor);
        this.updatePreview(container);
      }
    });
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
  applyFormatToSelection(container) {
    const input = container.querySelector(`#${this.containerId}-input`);
    if (!input) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.toString().length > 0) {
        // 選択範囲がある場合、その部分に書式を適用
        this.wrapSelection(range);
      }
    }
  }

  /**
   * 選択範囲をラップ
   */
  wrapSelection(range) {
    const span = document.createElement('span');
    span.style.color = this.getColorHex(this.currentFormat.color);
    if (this.currentFormat.bold) span.style.fontWeight = 'bold';
    if (this.currentFormat.italic) span.style.fontStyle = 'italic';
    if (this.currentFormat.underlined) span.style.textDecoration = 'underline';
    if (this.currentFormat.strikethrough) span.style.textDecoration = 'line-through';

    span.dataset.mcColor = this.currentFormat.color;
    span.dataset.mcBold = this.currentFormat.bold;
    span.dataset.mcItalic = this.currentFormat.italic;
    span.dataset.mcUnderlined = this.currentFormat.underlined;
    span.dataset.mcStrikethrough = this.currentFormat.strikethrough;
    span.dataset.mcObfuscated = this.currentFormat.obfuscated;

    try {
      range.surroundContents(span);
    } catch (e) {
      // 複雑な選択の場合は単純に挿入
      const text = range.toString();
      range.deleteContents();
      span.textContent = text;
      range.insertNode(span);
    }
  }

  /**
   * 入力をパース
   */
  parseInput(input) {
    this.characters = [];
    const walk = (node, format = { ...this.currentFormat }) => {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const char of node.textContent) {
          this.characters.push({ char, ...format });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const newFormat = { ...format };
        if (node.dataset?.mcColor) newFormat.color = node.dataset.mcColor;
        if (node.dataset?.mcBold === 'true') newFormat.bold = true;
        if (node.dataset?.mcItalic === 'true') newFormat.italic = true;
        if (node.dataset?.mcUnderlined === 'true') newFormat.underlined = true;
        if (node.dataset?.mcStrikethrough === 'true') newFormat.strikethrough = true;
        if (node.dataset?.mcObfuscated === 'true') newFormat.obfuscated = true;

        for (const child of node.childNodes) {
          walk(child, newFormat);
        }
      }
    };
    walk(input);
  }

  /**
   * 選択状態を更新
   */
  updateSelection(input) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // 選択位置の書式を現在の書式として設定
    }
  }

  /**
   * ツールバー状態を更新
   */
  updateToolbarState(editor) {
    editor.querySelectorAll('.rte-format-btn').forEach(btn => {
      const format = btn.dataset.format;
      btn.classList.toggle('active', this.currentFormat[format]);
    });
  }

  /**
   * プレビューを更新
   */
  updatePreview(container) {
    const preview = container.querySelector(`#${this.containerId}-preview`);
    const output = container.querySelector(`#${this.containerId}-output`);
    const input = container.querySelector(`#${this.containerId}-input`);

    if (!preview || !input) return;

    // プレーンテキスト取得
    const plainText = input.textContent || '';

    if (!plainText) {
      preview.innerHTML = '<span class="rte-placeholder">プレビュー</span>';
      if (output) output.value = '';
      return;
    }

    // プレビュー用HTML生成
    let previewHtml = '';
    this.parseInput(input);

    for (const c of this.characters) {
      let style = `color: ${this.getColorHex(c.color)};`;
      if (c.bold) style += 'font-weight: bold;';
      if (c.italic) style += 'font-style: italic;';
      if (c.underlined) style += 'text-decoration: underline;';
      if (c.strikethrough) style += 'text-decoration: line-through;';
      if (c.obfuscated) style += 'animation: obfuscate 0.1s infinite;';

      const escaped = c.char.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      previewHtml += `<span style="${style}">${escaped}</span>`;
    }

    preview.innerHTML = previewHtml || '<span class="rte-placeholder">プレビュー</span>';

    // SNBT出力を生成
    if (output) {
      output.value = this.generateSNBT();
    }

    this.triggerChange();
  }

  /**
   * 文字をグループ化（共通処理）
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
        currentGroup = { ...c, text: c.char, formatKey };
        delete currentGroup.char;
        groups.push(currentGroup);
      }
    }

    return groups;
  }

  /**
   * JSON形式のテキストコンポーネントを生成
   * Minecraft 1.20.5-1.21.4向け
   * 形式: {"text":"...",color":"red","bold":true}
   */
  generateJSON() {
    const groups = this.getFormattedGroups();
    if (groups.length === 0) return '';

    // 単一グループの場合
    if (groups.length === 1) {
      return JSON.stringify(this.formatToJSONObject(groups[0]));
    }

    // 複数グループの場合は配列形式
    const components = groups.map(g => this.formatToJSONObject(g));
    return JSON.stringify(components);
  }

  /**
   * SNBT形式のテキストコンポーネントを生成
   * Minecraft 1.21.5以降向け
   * 形式: {text:"...",color:"red",bold:true}
   */
  generateSNBT() {
    const groups = this.getFormattedGroups();
    if (groups.length === 0) return '';

    // 単一グループの場合
    if (groups.length === 1) {
      return this.formatToSNBTString(groups[0]);
    }

    // 複数グループの場合は配列形式
    const components = groups.map(g => this.formatToSNBTString(g));
    return `[${components.join(',')}]`;
  }

  /**
   * 単一フォーマットグループをJSONオブジェクトに変換
   */
  formatToJSONObject(group) {
    const obj = {
      text: group.text,
      italic: false  // アイテム名のデフォルト斜体を無効化
    };

    // 色（whiteは省略可能だが明示的に設定）
    if (group.color && group.color !== 'white') {
      obj.color = group.color;
    }

    // 書式
    if (group.bold) obj.bold = true;
    if (group.italic) obj.italic = true;
    if (group.underlined) obj.underlined = true;
    if (group.strikethrough) obj.strikethrough = true;
    if (group.obfuscated) obj.obfuscated = true;

    return obj;
  }

  /**
   * 単一フォーマットグループをSNBT文字列に変換
   * SNBT形式: {text:"...",color:"red",bold:true}
   */
  formatToSNBTString(group) {
    const parts = [`text:"${this.escapeString(group.text)}"`];

    // italic:false（アイテム名のデフォルト斜体を無効化）
    parts.push('italic:false');

    // 色
    if (group.color && group.color !== 'white') {
      parts.push(`color:"${group.color}"`);
    }

    // 書式
    if (group.bold) parts.push('bold:true');
    if (group.italic) {
      // italicがtrueの場合、先に追加したfalseを置き換え
      const idx = parts.indexOf('italic:false');
      if (idx !== -1) parts[idx] = 'italic:true';
    }
    if (group.underlined) parts.push('underlined:true');
    if (group.strikethrough) parts.push('strikethrough:true');
    if (group.obfuscated) parts.push('obfuscated:true');

    return `{${parts.join(',')}}`;
  }

  /**
   * 文字列をエスケープ
   */
  escapeString(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
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
   * 変更コールバックを呼び出し
   */
  triggerChange() {
    if (this.options.onChange) {
      this.options.onChange(this.generateSNBT(), this.getPlainText());
    }
  }

  /**
   * プレーンテキストを取得
   */
  getPlainText() {
    return this.characters.map(c => c.char).join('');
  }

  /**
   * JSON形式の出力を取得
   * Minecraft 1.20.5-1.21.4向け
   */
  getJSON() {
    return this.generateJSON();
  }

  /**
   * SNBT形式の出力を取得
   * Minecraft 1.21.5以降向け
   */
  getSNBT() {
    return this.generateSNBT();
  }

  /**
   * テキストを設定
   */
  setText(text, container) {
    const input = container.querySelector(`#${this.containerId}-input`);
    if (input) {
      input.textContent = text;
      this.parseInput(input);
      this.updatePreview(container);
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
      this.updatePreview(container);
    }
  }
}

/**
 * リッチテキストエディターのCSS
 */
export const RICH_TEXT_EDITOR_CSS = `
  .rich-text-editor {
    background: var(--mc-bg-surface, #2a2a2a);
    border: 2px solid var(--mc-border-dark, #1a1a1a);
    border-radius: 6px;
    overflow: hidden;
  }

  .rte-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: var(--mc-bg-panel, #1a1a1a);
    border-bottom: 1px solid var(--mc-border-dark, #333);
  }

  .rte-toolbar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .rte-format-buttons {
    display: flex;
    gap: 4px;
  }

  .rte-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--mc-bg-surface, #3a3a3a);
    border: 2px solid var(--mc-border-dark, #555);
    border-radius: 4px;
    color: var(--mc-text-primary, #fff);
    cursor: pointer;
    font-weight: bold;
    font-size: 0.9rem;
    transition: all 0.15s;
  }

  .rte-btn:hover {
    background: var(--mc-bg-hover, #4a4a4a);
    transform: translateY(-1px);
  }

  .rte-btn.active {
    background: var(--mc-color-grass-main, #5CB746);
    border-color: var(--mc-color-grass-dark, #3d8c2e);
    color: white;
  }

  .rte-color-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .rte-color-label-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: var(--mc-text-muted, #aaa);
  }

  .rte-color-palette {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    width: 100%;
    max-width: 280px;
  }

  .rte-color-btn {
    width: 100%;
    aspect-ratio: 1;
    min-width: 28px;
    max-width: 32px;
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .rte-color-btn:hover {
    transform: scale(1.15);
    z-index: 1;
    border-color: rgba(255,255,255,0.5);
  }

  .rte-color-btn.active {
    border-color: white;
    box-shadow: 0 0 8px rgba(255,255,255,0.6);
    transform: scale(1.1);
  }

  .rte-custom-color {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .rte-color-picker {
    width: 40px;
    height: 28px;
    border: 2px solid var(--mc-border-dark, #555);
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
  }

  .rte-color-picker::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  .rte-color-picker::-webkit-color-swatch {
    border-radius: 2px;
    border: none;
  }

  .rte-color-label {
    font-size: 0.75rem;
    color: var(--mc-text-muted, #888);
  }

  .rte-input-wrapper {
    padding: 8px;
  }

  .rte-input {
    min-height: 60px;
    padding: 8px;
    background: var(--mc-bg-panel, #1a1a1a);
    border: 1px solid var(--mc-border-dark, #333);
    border-radius: 4px;
    color: var(--mc-text-primary, #fff);
    font-family: 'Minecraft', monospace;
    font-size: 1rem;
    line-height: 1.5;
    outline: none;
  }

  .rte-input:focus {
    border-color: var(--mc-color-diamond, #5ECDFA);
  }

  .rte-input:empty:before {
    content: attr(data-placeholder);
    color: var(--mc-text-muted, #666);
  }

  .rte-preview-section {
    padding: 8px;
    border-top: 1px solid var(--mc-border-dark, #333);
  }

  .rte-preview-label {
    display: block;
    font-size: 0.75rem;
    color: var(--mc-text-muted, #888);
    margin-bottom: 4px;
  }

  .rte-preview {
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    font-family: 'Minecraft', monospace;
    font-size: 1rem;
    min-height: 24px;
    text-shadow: 2px 2px 0 #3f3f3f;
  }

  .rte-placeholder {
    color: #666;
    font-style: italic;
  }

  @keyframes obfuscate {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

export default RichTextEditor;
