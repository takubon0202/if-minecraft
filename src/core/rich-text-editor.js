/**
 * Rich Text Editor for Minecraft Custom Names
 * JSON Text Component / SNBT形式に対応したリッチテキストエディター
 *
 * 機能:
 * - 16色 + RGB カスタムカラー
 * - 書式設定（太字、斜体、下線、打消し線、難読化）
 * - 1文字ごとの色・書式設定
 * - プレビュー上の文字クリックで選択
 * - 全選択・一括適用機能
 * - SNBT/JSON形式出力（1.21.5+対応）
 */

// Minecraft定義済みカラー（16色）
export const MC_COLORS = [
  { id: 'black', name: '黒', hex: '#000000', code: '§0' },
  { id: 'dark_blue', name: '紺', hex: '#0000AA', code: '§1' },
  { id: 'dark_green', name: '深緑', hex: '#00AA00', code: '§2' },
  { id: 'dark_aqua', name: '青緑', hex: '#00AAAA', code: '§3' },
  { id: 'dark_red', name: '暗赤', hex: '#AA0000', code: '§4' },
  { id: 'dark_purple', name: '紫', hex: '#AA00AA', code: '§5' },
  { id: 'gold', name: '金', hex: '#FFAA00', code: '§6' },
  { id: 'gray', name: '灰', hex: '#AAAAAA', code: '§7' },
  { id: 'dark_gray', name: '暗灰', hex: '#555555', code: '§8' },
  { id: 'blue', name: '青', hex: '#5555FF', code: '§9' },
  { id: 'green', name: '緑', hex: '#55FF55', code: '§a' },
  { id: 'aqua', name: '水色', hex: '#55FFFF', code: '§b' },
  { id: 'red', name: '赤', hex: '#FF5555', code: '§c' },
  { id: 'light_purple', name: '桃', hex: '#FF55FF', code: '§d' },
  { id: 'yellow', name: '黄', hex: '#FFFF55', code: '§e' },
  { id: 'white', name: '白', hex: '#FFFFFF', code: '§f' },
];

// 書式オプション
export const FORMAT_OPTIONS = [
  { id: 'bold', name: '太字', icon: 'B', shortcut: 'Ctrl+B' },
  { id: 'italic', name: '斜体', icon: 'I', shortcut: 'Ctrl+I' },
  { id: 'underlined', name: '下線', icon: 'U', shortcut: 'Ctrl+U' },
  { id: 'strikethrough', name: '打消', icon: 'S', shortcut: '' },
  { id: 'obfuscated', name: '難読', icon: '?', shortcut: '' },
];

/**
 * 高度なリッチテキストエディタークラス
 * minecraft.tools/en/tellraw.phpのように1文字ずつ編集可能
 */
export class RichTextEditor {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      placeholder: 'テキストを入力...',
      showPreview: true,
      showClickEvent: false,
      showHoverEvent: false,
      onChange: null,
      ...options
    };

    // 各文字のフォーマット情報を保持
    // [{char: 'A', color: 'gold', bold: true, ...}, ...]
    this.characters = [];

    // 選択中の文字インデックス（複数選択対応）
    this.selectedIndices = new Set();

    // 現在適用中の書式
    this.currentFormat = {
      color: 'white',
      bold: false,
      italic: false,
      underlined: false,
      strikethrough: false,
      obfuscated: false,
    };

    // クリック/ホバーイベント
    this.clickEvent = null;
    this.hoverEvent = null;

    // 難読化アニメーション用
    this.obfuscatedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    this.obfuscatedInterval = null;
  }

  /**
   * エディターをレンダリング
   */
  render() {
    const colorButtons = MC_COLORS.map(c => `
      <button type="button" class="rte-color-btn ${c.id === 'white' ? 'active' : ''}"
              data-color="${c.id}" data-hex="${c.hex}"
              style="background-color: ${c.hex};" title="${c.name} (${c.code})">
      </button>
    `).join('');

    const formatButtons = FORMAT_OPTIONS.map(fmt => `
      <button type="button" class="rte-format-btn" data-format="${fmt.id}" title="${fmt.name}${fmt.shortcut ? ' (' + fmt.shortcut + ')' : ''}">
        <span class="rte-format-icon">${fmt.icon}</span>
        <span class="rte-format-label">${fmt.name}</span>
      </button>
    `).join('');

    return `
      <div class="rich-text-editor rte-advanced" id="${this.containerId}">
        <!-- ツールバー -->
        <div class="rte-toolbar">
          <!-- カラーパレット -->
          <div class="rte-section rte-color-section">
            <div class="rte-section-header">
              <span class="rte-section-title">文字色</span>
              <div class="rte-custom-color">
                <input type="color" class="rte-color-picker" id="${this.containerId}-color-picker" value="#FFFFFF" title="カスタムRGB">
                <span class="rte-color-hex" id="${this.containerId}-color-hex">#FFFFFF</span>
              </div>
            </div>
            <div class="rte-color-palette">
              ${colorButtons}
            </div>
          </div>

          <!-- 書式ボタン -->
          <div class="rte-section rte-format-section">
            <div class="rte-section-header">
              <span class="rte-section-title">スタイル</span>
            </div>
            <div class="rte-format-buttons">
              ${formatButtons}
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="rte-section rte-action-section">
            <button type="button" class="rte-action-btn" data-action="select-all" title="全ての文字を選択">
              <span class="rte-action-icon">✓</span>
              <span class="rte-action-label">全選択</span>
            </button>
            <button type="button" class="rte-action-btn" data-action="apply-all" title="選択中の書式を全文字に適用">
              <span class="rte-action-icon">⬤</span>
              <span class="rte-action-label">一括適用</span>
            </button>
            <button type="button" class="rte-action-btn rte-clear-btn" data-action="clear" title="書式をリセット">
              <span class="rte-action-icon">✕</span>
              <span class="rte-action-label">クリア</span>
            </button>
          </div>
        </div>

        <!-- 文字入力エリア -->
        <div class="rte-input-section">
          <label class="rte-label">テキスト入力</label>
          <input type="text" class="rte-text-input" id="${this.containerId}-text-input"
                 placeholder="${this.options.placeholder}" autocomplete="off">
          <div class="rte-hint">入力後、下のプレビューで文字をクリックして個別に編集できます</div>
        </div>

        <!-- 文字別プレビュー（クリック可能） -->
        <div class="rte-char-editor-section">
          <label class="rte-label">文字別エディター <span class="rte-label-hint">（クリックで選択、Shift+クリックで複数選択）</span></label>
          <div class="rte-char-grid" id="${this.containerId}-char-grid">
            <span class="rte-placeholder-text">文字を入力してください</span>
          </div>
        </div>

        <!-- Minecraftプレビュー -->
        ${this.options.showPreview ? `
          <div class="rte-preview-section">
            <label class="rte-label">Minecraftプレビュー</label>
            <div class="rte-preview mc-chat-bg" id="${this.containerId}-preview">
              <span class="rte-placeholder-text">プレビュー</span>
            </div>
          </div>
        ` : ''}

        <!-- クリック/ホバーイベント -->
        ${this.options.showClickEvent || this.options.showHoverEvent ? `
          <div class="rte-events-section">
            ${this.options.showClickEvent ? `
              <div class="rte-event-group">
                <label class="rte-label">クリックイベント</label>
                <div class="rte-event-row">
                  <select class="rte-event-select mc-select" id="${this.containerId}-click-action">
                    <option value="">なし</option>
                    <option value="run_command">コマンド実行</option>
                    <option value="suggest_command">コマンド提案</option>
                    <option value="open_url">URL開く</option>
                    <option value="copy_to_clipboard">コピー</option>
                  </select>
                  <input type="text" class="rte-event-input mc-input" id="${this.containerId}-click-value" placeholder="値..." style="display:none">
                </div>
              </div>
            ` : ''}
            ${this.options.showHoverEvent ? `
              <div class="rte-event-group">
                <label class="rte-label">ホバーイベント</label>
                <div class="rte-event-row">
                  <select class="rte-event-select mc-select" id="${this.containerId}-hover-action">
                    <option value="">なし</option>
                    <option value="show_text">テキスト表示</option>
                    <option value="show_item">アイテム表示</option>
                  </select>
                  <input type="text" class="rte-event-input mc-input" id="${this.containerId}-hover-value" placeholder="内容..." style="display:none">
                </div>
              </div>
            ` : ''}
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

    const textInput = editor.querySelector(`#${this.containerId}-text-input`);
    const colorPicker = editor.querySelector(`#${this.containerId}-color-picker`);
    const colorHex = editor.querySelector(`#${this.containerId}-color-hex`);

    // テキスト入力変更
    textInput?.addEventListener('input', () => {
      this.updateCharactersFromInput(textInput.value);
      this.renderCharGrid(editor);
      this.updatePreview(editor);
      this.triggerChange();
    });

    // カラーボタンクリック
    editor.querySelectorAll('.rte-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const color = btn.dataset.color;
        this.setColor(color);
        editor.querySelectorAll('.rte-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (colorHex) colorHex.textContent = btn.dataset.hex;
        this.applyFormatToSelected(editor);
      });
    });

    // カスタムカラー
    colorPicker?.addEventListener('input', (e) => {
      const hex = e.target.value;
      this.setColor(hex);
      editor.querySelectorAll('.rte-color-btn').forEach(b => b.classList.remove('active'));
      if (colorHex) colorHex.textContent = hex;
      this.applyFormatToSelected(editor);
    });

    // 書式ボタン
    editor.querySelectorAll('.rte-format-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = btn.dataset.format;
        this.toggleFormat(format);
        btn.classList.toggle('active', this.currentFormat[format]);
        this.applyFormatToSelected(editor);
      });
    });

    // アクションボタン
    editor.querySelectorAll('.rte-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        this.handleAction(action, editor);
      });
    });

    // イベント設定
    this.setupEventHandlers(editor);

    // 初期レンダリング
    this.renderCharGrid(editor);
    this.updatePreview(editor);
  }

  /**
   * テキストから文字配列を更新
   */
  updateCharactersFromInput(text) {
    const oldChars = this.characters;
    this.characters = [];

    for (let i = 0; i < text.length; i++) {
      // 既存の文字のフォーマットを維持
      if (oldChars[i] && oldChars[i].char === text[i]) {
        this.characters.push(oldChars[i]);
      } else {
        this.characters.push({
          char: text[i],
          ...this.currentFormat
        });
      }
    }
  }

  /**
   * 文字別グリッドをレンダリング
   */
  renderCharGrid(editor) {
    const grid = editor.querySelector(`#${this.containerId}-char-grid`);
    if (!grid) return;

    if (this.characters.length === 0) {
      grid.innerHTML = '<span class="rte-placeholder-text">文字を入力してください</span>';
      return;
    }

    grid.innerHTML = this.characters.map((c, i) => {
      const isSelected = this.selectedIndices.has(i);
      let style = `color: ${this.getColorHex(c.color)};`;
      if (c.bold) style += 'font-weight: bold;';
      if (c.italic) style += 'font-style: italic;';
      if (c.underlined) style += 'text-decoration: underline;';
      if (c.strikethrough) style += 'text-decoration: line-through;';

      const escaped = c.char === ' ' ? '&nbsp;' : c.char.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `
        <div class="rte-char-box ${isSelected ? 'selected' : ''} ${c.obfuscated ? 'obfuscated' : ''}"
             data-index="${i}" style="${style}" title="クリックで選択">
          <span class="rte-char-display">${escaped}</span>
          <span class="rte-char-color-bar" style="background-color: ${this.getColorHex(c.color)}"></span>
        </div>
      `;
    }).join('');

    // 文字ボックスにクリックイベント
    grid.querySelectorAll('.rte-char-box').forEach(box => {
      box.addEventListener('click', (e) => {
        const index = parseInt(box.dataset.index);
        this.handleCharClick(index, e.shiftKey, editor);
      });
    });
  }

  /**
   * 文字クリック処理
   */
  handleCharClick(index, shiftKey, editor) {
    if (shiftKey && this.selectedIndices.size > 0) {
      // Shift+クリック: 範囲選択
      const lastSelected = Math.max(...this.selectedIndices);
      const start = Math.min(lastSelected, index);
      const end = Math.max(lastSelected, index);
      for (let i = start; i <= end; i++) {
        this.selectedIndices.add(i);
      }
    } else if (this.selectedIndices.has(index)) {
      // 選択解除
      this.selectedIndices.delete(index);
    } else {
      // 新規選択（Shiftなしなら単一選択）
      if (!shiftKey) this.selectedIndices.clear();
      this.selectedIndices.add(index);
    }

    // 選択された文字のフォーマットをツールバーに反映
    if (this.selectedIndices.size === 1) {
      const char = this.characters[index];
      this.currentFormat = {
        color: char.color,
        bold: char.bold,
        italic: char.italic,
        underlined: char.underlined,
        strikethrough: char.strikethrough,
        obfuscated: char.obfuscated,
      };
      this.updateToolbarState(editor);
    }

    this.renderCharGrid(editor);
  }

  /**
   * アクション処理
   */
  handleAction(action, editor) {
    switch (action) {
      case 'select-all':
        this.selectedIndices = new Set(this.characters.map((_, i) => i));
        this.renderCharGrid(editor);
        break;
      case 'apply-all':
        // 全文字に現在のフォーマットを適用
        this.characters.forEach(c => {
          c.color = this.currentFormat.color;
          c.bold = this.currentFormat.bold;
          c.italic = this.currentFormat.italic;
          c.underlined = this.currentFormat.underlined;
          c.strikethrough = this.currentFormat.strikethrough;
          c.obfuscated = this.currentFormat.obfuscated;
        });
        this.renderCharGrid(editor);
        this.updatePreview(editor);
        this.triggerChange();
        break;
      case 'clear':
        // 書式リセット
        this.currentFormat = {
          color: 'white',
          bold: false,
          italic: false,
          underlined: false,
          strikethrough: false,
          obfuscated: false,
        };
        this.characters.forEach(c => {
          c.color = 'white';
          c.bold = false;
          c.italic = false;
          c.underlined = false;
          c.strikethrough = false;
          c.obfuscated = false;
        });
        this.selectedIndices.clear();
        this.updateToolbarState(editor);
        this.renderCharGrid(editor);
        this.updatePreview(editor);
        this.triggerChange();
        break;
    }
  }

  /**
   * 選択された文字に書式を適用
   */
  applyFormatToSelected(editor) {
    if (this.selectedIndices.size === 0) return;

    this.selectedIndices.forEach(i => {
      if (this.characters[i]) {
        this.characters[i].color = this.currentFormat.color;
        this.characters[i].bold = this.currentFormat.bold;
        this.characters[i].italic = this.currentFormat.italic;
        this.characters[i].underlined = this.currentFormat.underlined;
        this.characters[i].strikethrough = this.currentFormat.strikethrough;
        this.characters[i].obfuscated = this.currentFormat.obfuscated;
      }
    });

    this.renderCharGrid(editor);
    this.updatePreview(editor);
    this.triggerChange();
  }

  /**
   * ツールバー状態を更新
   */
  updateToolbarState(editor) {
    // カラーボタン
    editor.querySelectorAll('.rte-color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === this.currentFormat.color);
    });

    // 書式ボタン
    editor.querySelectorAll('.rte-format-btn').forEach(btn => {
      const format = btn.dataset.format;
      btn.classList.toggle('active', this.currentFormat[format]);
    });

    // カラーピッカー
    const colorHex = editor.querySelector(`#${this.containerId}-color-hex`);
    if (colorHex) {
      colorHex.textContent = this.getColorHex(this.currentFormat.color);
    }
  }

  /**
   * イベントハンドラー設定
   */
  setupEventHandlers(editor) {
    const setupEvent = (type) => {
      const actionEl = editor.querySelector(`#${this.containerId}-${type}-action`);
      const valueEl = editor.querySelector(`#${this.containerId}-${type}-value`);
      if (actionEl && valueEl) {
        actionEl.addEventListener('change', () => {
          valueEl.style.display = actionEl.value ? 'block' : 'none';
          this.updateEvent(type, actionEl.value, valueEl.value);
          this.triggerChange();
        });
        valueEl.addEventListener('input', () => {
          this.updateEvent(type, actionEl.value, valueEl.value);
          this.triggerChange();
        });
      }
    };
    setupEvent('click');
    setupEvent('hover');
  }

  /**
   * イベント更新
   */
  updateEvent(type, action, value) {
    if (type === 'click') {
      this.clickEvent = action ? { action, value } : null;
    } else {
      this.hoverEvent = action ? { action, contents: action === 'show_text' ? { text: value } : value } : null;
    }
  }

  /**
   * プレビュー更新
   */
  updatePreview(editor) {
    const preview = editor.querySelector(`#${this.containerId}-preview`);
    const output = editor.querySelector(`#${this.containerId}-output`);

    if (!preview) return;

    if (this.characters.length === 0) {
      preview.innerHTML = '<span class="rte-placeholder-text">プレビュー</span>';
      if (output) output.value = '';
      return;
    }

    // プレビュー用HTML生成
    let previewHtml = '';
    for (const c of this.characters) {
      let style = `color: ${this.getColorHex(c.color)};`;
      if (c.bold) style += 'font-weight: bold;';
      if (c.italic) style += 'font-style: italic;';
      let textDec = '';
      if (c.underlined) textDec += 'underline ';
      if (c.strikethrough) textDec += 'line-through ';
      if (textDec) style += `text-decoration: ${textDec.trim()};`;

      const escaped = c.char === ' ' ? '&nbsp;' : c.char.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const obfClass = c.obfuscated ? 'obfuscated-char' : '';
      previewHtml += `<span class="mc-text-char ${obfClass}" style="${style}">${escaped}</span>`;
    }

    preview.innerHTML = previewHtml;

    // 難読化アニメーション
    this.startObfuscatedAnimation(preview);

    // SNBT出力を生成
    if (output) {
      output.value = this.generateSNBT();
    }
  }

  /**
   * 難読化アニメーション
   */
  startObfuscatedAnimation(preview) {
    if (this.obfuscatedInterval) {
      clearInterval(this.obfuscatedInterval);
    }

    const obfChars = preview.querySelectorAll('.obfuscated-char');
    if (obfChars.length === 0) return;

    this.obfuscatedInterval = setInterval(() => {
      obfChars.forEach(el => {
        const randomChar = this.obfuscatedChars[Math.floor(Math.random() * this.obfuscatedChars.length)];
        el.textContent = randomChar;
      });
    }, 50);
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
   * 文字をグループ化
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
   */
  generateJSON() {
    const groups = this.getFormattedGroups();
    if (groups.length === 0) return '';

    if (groups.length === 1) {
      const obj = this.formatToJSONObject(groups[0]);
      // クリック/ホバーイベント追加
      if (this.clickEvent) obj.clickEvent = this.clickEvent;
      if (this.hoverEvent) obj.hoverEvent = this.hoverEvent;
      return JSON.stringify(obj);
    }

    const components = groups.map((g, i) => {
      const obj = this.formatToJSONObject(g);
      // 最初の要素にイベント追加
      if (i === 0) {
        if (this.clickEvent) obj.clickEvent = this.clickEvent;
        if (this.hoverEvent) obj.hoverEvent = this.hoverEvent;
      }
      return obj;
    });
    return JSON.stringify(components);
  }

  /**
   * SNBT形式のテキストコンポーネントを生成
   */
  generateSNBT() {
    const groups = this.getFormattedGroups();
    if (groups.length === 0) return '';

    if (groups.length === 1) {
      return this.formatToSNBTString(groups[0], true);
    }

    const components = groups.map((g, i) => this.formatToSNBTString(g, i === 0));
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

    if (group.color && group.color !== 'white') {
      obj.color = group.color;
    }

    if (group.bold) obj.bold = true;
    if (group.italic) obj.italic = true;
    if (group.underlined) obj.underlined = true;
    if (group.strikethrough) obj.strikethrough = true;
    if (group.obfuscated) obj.obfuscated = true;

    return obj;
  }

  /**
   * 単一フォーマットグループをSNBT文字列に変換
   */
  formatToSNBTString(group, includeEvents = false) {
    const parts = [`text:"${this.escapeString(group.text)}"`];

    parts.push('italic:false');

    if (group.color && group.color !== 'white') {
      if (group.color.startsWith('#')) {
        parts.push(`color:"${group.color}"`);
      } else {
        parts.push(`color:"${group.color}"`);
      }
    }

    if (group.bold) parts.push('bold:true');
    if (group.italic) {
      const idx = parts.indexOf('italic:false');
      if (idx !== -1) parts[idx] = 'italic:true';
    }
    if (group.underlined) parts.push('underlined:true');
    if (group.strikethrough) parts.push('strikethrough:true');
    if (group.obfuscated) parts.push('obfuscated:true');

    // クリック/ホバーイベント
    if (includeEvents) {
      if (this.clickEvent) {
        parts.push(`click_event:{action:"${this.clickEvent.action}",value:"${this.escapeString(this.clickEvent.value)}"}`);
      }
      if (this.hoverEvent) {
        if (this.hoverEvent.action === 'show_text') {
          parts.push(`hover_event:{action:"show_text",contents:"${this.escapeString(this.hoverEvent.contents.text || '')}"}`);
        }
      }
    }

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
   */
  getJSON() {
    return this.generateJSON();
  }

  /**
   * SNBT形式の出力を取得
   */
  getSNBT() {
    return this.generateSNBT();
  }

  /**
   * テキストを設定
   */
  setText(text, container) {
    const textInput = container.querySelector(`#${this.containerId}-text-input`);
    if (textInput) {
      textInput.value = text;
      this.updateCharactersFromInput(text);
      this.renderCharGrid(container.querySelector(`#${this.containerId}`));
      this.updatePreview(container.querySelector(`#${this.containerId}`));
    }
  }

  /**
   * クリア
   */
  clear(container) {
    const textInput = container.querySelector(`#${this.containerId}-text-input`);
    if (textInput) textInput.value = '';
    this.characters = [];
    this.selectedIndices.clear();
    const editor = container.querySelector(`#${this.containerId}`);
    if (editor) {
      this.renderCharGrid(editor);
      this.updatePreview(editor);
    }
  }

  /**
   * 破棄
   */
  destroy() {
    if (this.obfuscatedInterval) {
      clearInterval(this.obfuscatedInterval);
    }
  }
}

/**
 * リッチテキストエディターのCSS
 */
export const RICH_TEXT_EDITOR_CSS = `
  .rich-text-editor.rte-advanced {
    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
    border: 2px solid #444444;
    border-radius: 8px;
    overflow: hidden;
  }

  /* ツールバー */
  .rte-advanced .rte-toolbar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
    border-bottom: 2px solid #444444;
  }

  .rte-advanced .rte-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rte-advanced .rte-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .rte-advanced .rte-section-title {
    font-size: 0.85rem;
    font-weight: bold;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* カラーパレット - 大きく見やすく */
  .rte-advanced .rte-color-palette {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
    max-width: 400px;
  }

  .rte-advanced .rte-color-btn {
    width: 100%;
    aspect-ratio: 1;
    min-width: 36px;
    min-height: 36px;
    border: 3px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3);
  }

  .rte-advanced .rte-color-btn:hover {
    transform: scale(1.15);
    z-index: 1;
    border-color: rgba(255,255,255,0.6);
    box-shadow: 0 0 12px rgba(255,255,255,0.3);
  }

  .rte-advanced .rte-color-btn.active {
    border-color: #ffffff;
    box-shadow: 0 0 16px rgba(255,255,255,0.5), inset 0 0 8px rgba(255,255,255,0.3);
    transform: scale(1.1);
  }

  .rte-advanced .rte-custom-color {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rte-advanced .rte-color-picker {
    width: 48px;
    height: 36px;
    border: 2px solid #555555;
    border-radius: 6px;
    cursor: pointer;
    background: transparent;
  }

  .rte-advanced .rte-color-hex {
    font-family: var(--mc-font-mono, monospace);
    font-size: 0.8rem;
    color: #aaaaaa;
    min-width: 70px;
  }

  /* 書式ボタン - 大きく分かりやすく */
  .rte-advanced .rte-format-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .rte-advanced .rte-format-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.85rem;
  }

  .rte-advanced .rte-format-btn:hover {
    background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
    transform: translateY(-2px);
  }

  .rte-advanced .rte-format-btn.active {
    background: linear-gradient(180deg, #5cb746 0%, #3a8128 100%);
    border-color: #5cb746;
  }

  .rte-advanced .rte-format-icon {
    font-weight: bold;
    font-size: 1rem;
  }

  .rte-advanced .rte-format-label {
    font-size: 0.75rem;
  }

  /* アクションボタン */
  .rte-advanced .rte-action-section {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .rte-advanced .rte-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    border: 2px solid #555555;
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
  }

  .rte-advanced .rte-action-btn:hover {
    background: linear-gradient(180deg, #2563eb 0%, #1a4480 100%);
    border-color: #2563eb;
  }

  .rte-advanced .rte-clear-btn:hover {
    background: linear-gradient(180deg, #e04040 0%, #c80000 100%);
    border-color: #e04040;
  }

  .rte-advanced .rte-action-icon {
    font-size: 0.9rem;
  }

  .rte-advanced .rte-action-label {
    font-size: 0.75rem;
  }

  /* 入力セクション */
  .rte-advanced .rte-input-section {
    padding: 16px;
    border-bottom: 1px solid #333333;
  }

  .rte-advanced .rte-label {
    display: block;
    font-size: 0.85rem;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8px;
  }

  .rte-advanced .rte-label-hint {
    font-weight: normal;
    font-size: 0.75rem;
    color: #888888;
  }

  .rte-advanced .rte-text-input {
    width: 100%;
    padding: 12px 16px;
    background: #1a1a1a;
    border: 2px solid #444444;
    border-radius: 6px;
    color: #ffffff;
    font-family: 'Minecraft', var(--mc-font-mono, monospace);
    font-size: 1.1rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .rte-advanced .rte-text-input:focus {
    border-color: #5cb746;
  }

  .rte-advanced .rte-hint {
    margin-top: 8px;
    font-size: 0.75rem;
    color: #888888;
  }

  /* 文字別エディター */
  .rte-advanced .rte-char-editor-section {
    padding: 16px;
    border-bottom: 1px solid #333333;
  }

  .rte-advanced .rte-char-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 16px;
    background: #1a1a1a;
    border: 2px solid #444444;
    border-radius: 6px;
    min-height: 80px;
    align-content: flex-start;
  }

  .rte-advanced .rte-char-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 48px;
    background: #2a2a2a;
    border: 2px solid #444444;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Minecraft', var(--mc-font-mono, monospace);
    font-size: 1.2rem;
    transition: all 0.15s;
    user-select: none;
  }

  .rte-advanced .rte-char-box:hover {
    border-color: #666666;
    background: #3a3a3a;
    transform: translateY(-2px);
  }

  .rte-advanced .rte-char-box.selected {
    border-color: #5cb746;
    background: rgba(92, 183, 70, 0.2);
    box-shadow: 0 0 8px rgba(92, 183, 70, 0.4);
  }

  .rte-advanced .rte-char-box.obfuscated .rte-char-display {
    animation: obfuscate-flash 0.1s infinite;
  }

  .rte-advanced .rte-char-display {
    text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
  }

  .rte-advanced .rte-char-color-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 0 0 2px 2px;
  }

  /* プレビュー */
  .rte-advanced .rte-preview-section {
    padding: 16px;
  }

  .rte-advanced .rte-preview {
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.85);
    border: 2px solid #444444;
    border-radius: 6px;
    font-family: 'Minecraft', var(--mc-font-mono, monospace);
    font-size: 1.3rem;
    min-height: 60px;
    text-shadow: 2px 2px 0 #3f3f3f;
    letter-spacing: 1px;
  }

  .rte-advanced .mc-text-char {
    display: inline;
  }

  .rte-advanced .rte-placeholder-text {
    color: #555555;
    font-style: italic;
  }

  /* イベントセクション */
  .rte-advanced .rte-events-section {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-top: 1px solid #333333;
  }

  .rte-advanced .rte-event-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rte-advanced .rte-event-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .rte-advanced .rte-event-select {
    flex: 1;
    min-width: 150px;
  }

  .rte-advanced .rte-event-input {
    flex: 2;
    min-width: 200px;
  }

  /* アニメーション */
  @keyframes obfuscate-flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* レスポンシブ */
  @media (max-width: 600px) {
    .rte-advanced .rte-color-palette {
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
    }

    .rte-advanced .rte-color-btn {
      min-width: 28px;
      min-height: 28px;
    }

    .rte-advanced .rte-char-box {
      width: 32px;
      height: 40px;
      font-size: 1rem;
    }
  }
`;

export default RichTextEditor;
