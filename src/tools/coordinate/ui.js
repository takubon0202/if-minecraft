/**
 * Coordinate Calculator - UI
 */

import { $, $$, delegate, debounce } from '../../core/dom.js';
import { copyToClipboard } from '../../core/clipboard.js';
import { setOutput } from '../../app/sidepanel.js';
import { getInviconUrl } from '../../core/wiki-images.js';

/**
 * UIをレンダリング
 */
export function render(manifest) {
  return `
    <div class="tool-panel" id="coordinate-panel">
      <div class="tool-header">
        <img src="${getInviconUrl(manifest.iconItem || 'filled_map')}" class="tool-header-icon mc-wiki-image" width="32" height="32" alt="">
        <h2>${manifest.title}</h2>
      </div>

      <!-- ネザー⇔オーバーワールド変換 -->
      <div class="coord-section">
        <h3>ネザー⇔オーバーワールド変換</h3>
        <p class="section-hint">ネザーのX/Z座標は1/8スケール（Y座標は変換なし）</p>

        <div class="converter-grid">
          <div class="coord-input-group">
            <label>オーバーワールド座標</label>
            <div class="coord-inputs">
              <div class="coord-field">
                <span class="coord-label">X</span>
                <input type="number" id="ow-x" class="mc-input coord-num" value="0">
              </div>
              <div class="coord-field">
                <span class="coord-label">Y</span>
                <input type="number" id="ow-y" class="mc-input coord-num" value="64">
              </div>
              <div class="coord-field">
                <span class="coord-label">Z</span>
                <input type="number" id="ow-z" class="mc-input coord-num" value="0">
              </div>
            </div>
          </div>

          <div class="converter-arrow">⇄</div>

          <div class="coord-input-group">
            <label>ネザー座標</label>
            <div class="coord-inputs">
              <div class="coord-field">
                <span class="coord-label">X</span>
                <input type="number" id="nether-x" class="mc-input coord-num" value="0">
              </div>
              <div class="coord-field">
                <span class="coord-label">Y</span>
                <input type="number" id="nether-y" class="mc-input coord-num" value="64">
              </div>
              <div class="coord-field">
                <span class="coord-label">Z</span>
                <input type="number" id="nether-z" class="mc-input coord-num" value="0">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 距離計算 -->
      <div class="coord-section">
        <h3>距離計算</h3>
        <div class="distance-grid">
          <div class="coord-input-group">
            <label>地点A</label>
            <div class="coord-inputs">
              <div class="coord-field">
                <span class="coord-label">X</span>
                <input type="number" id="dist-a-x" class="mc-input coord-num" value="0">
              </div>
              <div class="coord-field">
                <span class="coord-label">Y</span>
                <input type="number" id="dist-a-y" class="mc-input coord-num" value="64">
              </div>
              <div class="coord-field">
                <span class="coord-label">Z</span>
                <input type="number" id="dist-a-z" class="mc-input coord-num" value="0">
              </div>
            </div>
          </div>

          <div class="coord-input-group">
            <label>地点B</label>
            <div class="coord-inputs">
              <div class="coord-field">
                <span class="coord-label">X</span>
                <input type="number" id="dist-b-x" class="mc-input coord-num" value="100">
              </div>
              <div class="coord-field">
                <span class="coord-label">Y</span>
                <input type="number" id="dist-b-y" class="mc-input coord-num" value="64">
              </div>
              <div class="coord-field">
                <span class="coord-label">Z</span>
                <input type="number" id="dist-b-z" class="mc-input coord-num" value="100">
              </div>
            </div>
          </div>
        </div>

        <div class="distance-results">
          <div class="result-item">
            <span class="result-label">3D距離（直線）</span>
            <span class="result-value" id="distance-3d">141.42</span>
            <span class="result-unit">ブロック</span>
          </div>
          <div class="result-item">
            <span class="result-label">2D距離（水平）</span>
            <span class="result-value" id="distance-2d">141.42</span>
            <span class="result-unit">ブロック</span>
          </div>
          <div class="result-item">
            <span class="result-label">Y差</span>
            <span class="result-value" id="distance-y">0</span>
            <span class="result-unit">ブロック</span>
          </div>
        </div>
      </div>

      <!-- チャンク計算 -->
      <div class="coord-section">
        <h3>チャンク計算</h3>
        <p class="section-hint">ブロック座標からチャンク座標を計算</p>

        <div class="chunk-grid">
          <div class="coord-input-group">
            <label>ブロック座標</label>
            <div class="coord-inputs">
              <div class="coord-field">
                <span class="coord-label">X</span>
                <input type="number" id="block-x" class="mc-input coord-num" value="0">
              </div>
              <div class="coord-field">
                <span class="coord-label">Z</span>
                <input type="number" id="block-z" class="mc-input coord-num" value="0">
              </div>
            </div>
          </div>

          <div class="chunk-results">
            <div class="result-item">
              <span class="result-label">チャンク座標</span>
              <span class="result-value" id="chunk-coord">0, 0</span>
            </div>
            <div class="result-item">
              <span class="result-label">チャンク内位置</span>
              <span class="result-value" id="chunk-local">0, 0</span>
            </div>
            <div class="result-item">
              <span class="result-label">リージョンファイル</span>
              <span class="result-value" id="region-file">r.0.0.mca</span>
            </div>
          </div>
        </div>
      </div>

      <!-- テレポートコマンド生成 -->
      <div class="coord-section">
        <h3>テレポートコマンド生成</h3>
        <div class="tp-grid">
          <div class="form-group">
            <label for="tp-target">ターゲット</label>
            <select id="tp-target" class="mc-select">
              <option value="@s">@s（自分）</option>
              <option value="@p">@p（最寄りプレイヤー）</option>
              <option value="@a">@a（全プレイヤー）</option>
              <option value="@e">@e（全エンティティ）</option>
            </select>
          </div>

          <div class="coord-input-group">
            <label>移動先座標</label>
            <div class="coord-inputs">
              <div class="coord-field">
                <span class="coord-label">X</span>
                <input type="text" id="tp-x" class="mc-input" value="~" placeholder="~ または数値">
              </div>
              <div class="coord-field">
                <span class="coord-label">Y</span>
                <input type="text" id="tp-y" class="mc-input" value="~" placeholder="~ または数値">
              </div>
              <div class="coord-field">
                <span class="coord-label">Z</span>
                <input type="text" id="tp-z" class="mc-input" value="~" placeholder="~ または数値">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="tp-facing"> 向きを指定
            </label>
          </div>

          <div class="tp-facing-options" id="tp-facing-options" style="display: none;">
            <div class="coord-input-group">
              <label>向く座標</label>
              <div class="coord-inputs">
                <div class="coord-field">
                  <span class="coord-label">X</span>
                  <input type="text" id="tp-face-x" class="mc-input" value="~">
                </div>
                <div class="coord-field">
                  <span class="coord-label">Y</span>
                  <input type="text" id="tp-face-y" class="mc-input" value="~">
                </div>
                <div class="coord-field">
                  <span class="coord-label">Z</span>
                  <input type="text" id="tp-face-z" class="mc-input" value="~">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 座標リファレンス -->
      <div class="reference-section">
        <h3>座標リファレンス</h3>
        <div class="ref-grid">
          <div class="ref-card">
            <h4>絶対座標</h4>
            <code>100 64 -200</code>
            <p>ワールドの固定位置</p>
          </div>
          <div class="ref-card">
            <h4>相対座標（~）</h4>
            <code>~10 ~ ~-5</code>
            <p>実行位置からの相対</p>
          </div>
          <div class="ref-card">
            <h4>ローカル座標（^）</h4>
            <code>^ ^1 ^5</code>
            <p>向いている方向基準<br>（左右, 上下, 前後）</p>
          </div>
        </div>

        <div class="y-levels">
          <h4>主要なY座標</h4>
          <table class="mc-table">
            <tr><td>319</td><td>ビルド上限</td></tr>
            <tr><td>256</td><td>旧ビルド上限（1.17以前）</td></tr>
            <tr><td>128</td><td>ネザー天井</td></tr>
            <tr><td>64</td><td>海面レベル</td></tr>
            <tr><td>0</td><td>旧最低高度</td></tr>
            <tr><td>-59</td><td>岩盤層開始</td></tr>
            <tr><td>-64</td><td>ビルド下限</td></tr>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * 初期化
 */
export function init(container) {
  // ネザー変換（オーバーワールド→ネザー）
  ['ow-x', 'ow-y', 'ow-z'].forEach(id => {
    $(`#${id}`, container)?.addEventListener('input', debounce(() => {
      updateNetherFromOverworld(container);
      updateTpCommand(container);
    }, 100));
  });

  // ネザー変換（ネザー→オーバーワールド）
  ['nether-x', 'nether-y', 'nether-z'].forEach(id => {
    $(`#${id}`, container)?.addEventListener('input', debounce(() => {
      updateOverworldFromNether(container);
    }, 100));
  });

  // 距離計算
  ['dist-a-x', 'dist-a-y', 'dist-a-z', 'dist-b-x', 'dist-b-y', 'dist-b-z'].forEach(id => {
    $(`#${id}`, container)?.addEventListener('input', debounce(() => {
      updateDistance(container);
    }, 100));
  });

  // チャンク計算
  ['block-x', 'block-z'].forEach(id => {
    $(`#${id}`, container)?.addEventListener('input', debounce(() => {
      updateChunk(container);
    }, 100));
  });

  // テレポートコマンド
  ['tp-target', 'tp-x', 'tp-y', 'tp-z', 'tp-face-x', 'tp-face-y', 'tp-face-z'].forEach(id => {
    const el = $(`#${id}`, container);
    if (el) {
      el.addEventListener('input', () => updateTpCommand(container));
      el.addEventListener('change', () => updateTpCommand(container));
    }
  });

  // 向き指定チェックボックス
  $('#tp-facing', container)?.addEventListener('change', (e) => {
    $('#tp-facing-options', container).style.display = e.target.checked ? 'block' : 'none';
    updateTpCommand(container);
  });

  // 初期計算
  updateDistance(container);
  updateChunk(container);
  updateTpCommand(container);
}

/**
 * オーバーワールドからネザー座標を更新
 */
function updateNetherFromOverworld(container) {
  const owX = parseFloat($('#ow-x', container)?.value) || 0;
  const owY = parseFloat($('#ow-y', container)?.value) || 64;
  const owZ = parseFloat($('#ow-z', container)?.value) || 0;

  $('#nether-x', container).value = Math.floor(owX / 8);
  $('#nether-y', container).value = owY;
  $('#nether-z', container).value = Math.floor(owZ / 8);
}

/**
 * ネザーからオーバーワールド座標を更新
 */
function updateOverworldFromNether(container) {
  const netherX = parseFloat($('#nether-x', container)?.value) || 0;
  const netherY = parseFloat($('#nether-y', container)?.value) || 64;
  const netherZ = parseFloat($('#nether-z', container)?.value) || 0;

  $('#ow-x', container).value = netherX * 8;
  $('#ow-y', container).value = netherY;
  $('#ow-z', container).value = netherZ * 8;
}

/**
 * 距離を更新
 */
function updateDistance(container) {
  const ax = parseFloat($('#dist-a-x', container)?.value) || 0;
  const ay = parseFloat($('#dist-a-y', container)?.value) || 0;
  const az = parseFloat($('#dist-a-z', container)?.value) || 0;
  const bx = parseFloat($('#dist-b-x', container)?.value) || 0;
  const by = parseFloat($('#dist-b-y', container)?.value) || 0;
  const bz = parseFloat($('#dist-b-z', container)?.value) || 0;

  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;

  const dist3d = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const dist2d = Math.sqrt(dx * dx + dz * dz);

  $('#distance-3d', container).textContent = dist3d.toFixed(2);
  $('#distance-2d', container).textContent = dist2d.toFixed(2);
  $('#distance-y', container).textContent = Math.abs(dy).toFixed(0);
}

/**
 * チャンク情報を更新
 */
function updateChunk(container) {
  const blockX = parseInt($('#block-x', container)?.value) || 0;
  const blockZ = parseInt($('#block-z', container)?.value) || 0;

  const chunkX = Math.floor(blockX / 16);
  const chunkZ = Math.floor(blockZ / 16);
  const localX = ((blockX % 16) + 16) % 16;
  const localZ = ((blockZ % 16) + 16) % 16;
  const regionX = Math.floor(chunkX / 32);
  const regionZ = Math.floor(chunkZ / 32);

  $('#chunk-coord', container).textContent = `${chunkX}, ${chunkZ}`;
  $('#chunk-local', container).textContent = `${localX}, ${localZ}`;
  $('#region-file', container).textContent = `r.${regionX}.${regionZ}.mca`;
}

/**
 * テレポートコマンドを更新
 */
function updateTpCommand(container) {
  const target = $('#tp-target', container)?.value || '@s';
  const x = $('#tp-x', container)?.value || '~';
  const y = $('#tp-y', container)?.value || '~';
  const z = $('#tp-z', container)?.value || '~';
  const facing = $('#tp-facing', container)?.checked;

  let command = `/tp ${target} ${x} ${y} ${z}`;

  if (facing) {
    const fx = $('#tp-face-x', container)?.value || '~';
    const fy = $('#tp-face-y', container)?.value || '~';
    const fz = $('#tp-face-z', container)?.value || '~';
    command += ` facing ${fx} ${fy} ${fz}`;
  }

  setOutput(command, 'coordinate', { target, x, y, z, facing });
}

// スタイル追加
const style = document.createElement('style');
style.textContent = `
  .coord-section {
    margin-bottom: var(--mc-space-lg);
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .coord-section h3 {
    margin: 0 0 var(--mc-space-sm) 0;
    font-size: 1rem;
  }

  .section-hint {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
    margin-bottom: var(--mc-space-md);
  }

  .converter-grid, .distance-grid, .chunk-grid, .tp-grid {
    display: flex;
    flex-direction: column;
    gap: var(--mc-space-md);
  }

  .converter-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--mc-space-md);
  }

  @media (max-width: 768px) {
    .converter-grid {
      grid-template-columns: 1fr;
    }
    .converter-arrow {
      transform: rotate(90deg);
    }
  }

  .converter-arrow {
    font-size: 1.5rem;
    color: var(--mc-color-grass-main);
    text-align: center;
  }

  .coord-input-group label {
    display: block;
    font-size: 0.8rem;
    font-weight: bold;
    margin-bottom: var(--mc-space-xs);
  }

  .coord-inputs {
    display: flex;
    gap: var(--mc-space-sm);
  }

  .coord-field {
    display: flex;
    align-items: center;
    gap: var(--mc-space-xs);
  }

  .coord-label {
    font-weight: bold;
    font-family: var(--mc-font-mono);
    min-width: 16px;
  }

  .coord-num {
    width: 80px;
  }

  .distance-results, .chunk-results {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mc-space-md);
    margin-top: var(--mc-space-md);
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-panel);
  }

  .result-item {
    display: flex;
    align-items: baseline;
    gap: var(--mc-space-xs);
  }

  .result-label {
    font-size: 0.8rem;
    color: var(--mc-text-muted);
  }

  .result-value {
    font-family: var(--mc-font-mono);
    font-weight: bold;
    font-size: 1.1rem;
    color: var(--mc-color-diamond);
  }

  .result-unit {
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .reference-section {
    margin-top: var(--mc-space-lg);
  }

  .ref-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--mc-space-md);
    margin-bottom: var(--mc-space-lg);
  }

  .ref-card {
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .ref-card h4 {
    margin: 0 0 var(--mc-space-sm) 0;
    font-size: 0.9rem;
  }

  .ref-card code {
    display: block;
    font-family: var(--mc-font-mono);
    color: var(--mc-color-grass-main);
    margin-bottom: var(--mc-space-sm);
    font-size: 0.9rem;
  }

  .ref-card p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--mc-text-muted);
  }

  .y-levels {
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-surface);
    border: 1px solid var(--mc-border-dark);
  }

  .y-levels h4 {
    margin: 0 0 var(--mc-space-sm) 0;
    font-size: 0.9rem;
  }

  .mc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }

  .mc-table td {
    padding: var(--mc-space-xs) var(--mc-space-sm);
    border-bottom: 1px solid var(--mc-border-dark);
  }

  .mc-table td:first-child {
    font-family: var(--mc-font-mono);
    font-weight: bold;
    color: var(--mc-color-diamond);
    width: 60px;
  }

  .tp-facing-options {
    margin-top: var(--mc-space-md);
    padding: var(--mc-space-md);
    background-color: var(--mc-bg-panel);
  }
`;
document.head.appendChild(style);

export default { render, init };
