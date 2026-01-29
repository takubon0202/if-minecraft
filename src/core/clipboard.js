/**
 * Clipboard Utilities - クリップボード操作
 */

/**
 * テキストをクリップボードにコピー
 * @param {string} text - コピーするテキスト
 * @returns {Promise<boolean>} - 成功/失敗
 */
export const copyToClipboard = async (text) => {
  try {
    // 新しいClipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // フォールバック: execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('クリップボードへのコピーに失敗:', err);
    return false;
  }
};

/**
 * クリップボードからテキストを読み取り
 * @returns {Promise<string|null>}
 */
export const readFromClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
    return null;
  } catch (err) {
    console.error('クリップボードからの読み取りに失敗:', err);
    return null;
  }
};

/**
 * コピー成功時のフィードバック表示
 * @param {Element} button - ボタン要素
 * @param {string} originalText - 元のテキスト
 */
export const showCopyFeedback = (button, originalText = null) => {
  const original = originalText || button.textContent;
  button.textContent = 'コピーしました！';
  button.classList.add('copied');

  setTimeout(() => {
    button.textContent = original;
    button.classList.remove('copied');
  }, 2000);
};

export default { copyToClipboard, readFromClipboard, showCopyFeedback };
