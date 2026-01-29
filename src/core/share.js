/**
 * Share Utilities - URL共有機能
 */

import { copyToClipboard } from './clipboard.js';

/**
 * 状態をURLパラメータにエンコード
 * @param {Object} state - 状態オブジェクト
 * @returns {string} - エンコードされた文字列
 */
export const encodeState = (state) => {
  try {
    const json = JSON.stringify(state);
    return btoa(encodeURIComponent(json));
  } catch (err) {
    console.error('状態エンコードエラー:', err);
    return '';
  }
};

/**
 * URLパラメータから状態をデコード
 * @param {string} encoded - エンコードされた文字列
 * @returns {Object|null} - 状態オブジェクト
 */
export const decodeState = (encoded) => {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (err) {
    console.error('状態デコードエラー:', err);
    return null;
  }
};

/**
 * 共有URLを生成
 * @param {string} toolId - ツールID
 * @param {Object} state - 状態オブジェクト
 * @returns {string} - 共有URL
 */
export const generateShareUrl = (toolId, state) => {
  const base = window.location.origin + window.location.pathname;
  const encoded = encodeState(state);
  return `${base}#/tool/${toolId}?state=${encoded}`;
};

/**
 * 共有URLをクリップボードにコピー
 * @param {string} toolId - ツールID
 * @param {Object} state - 状態オブジェクト
 * @returns {Promise<boolean>}
 */
export const copyShareUrl = async (toolId, state) => {
  const url = generateShareUrl(toolId, state);
  return await copyToClipboard(url);
};

/**
 * 現在のURLから状態を読み取り
 * @returns {Object|null}
 */
export const getStateFromUrl = () => {
  const hash = window.location.hash;
  const match = hash.match(/[?&]state=([^&]+)/);
  if (match) {
    return decodeState(match[1]);
  }
  return null;
};

/**
 * Web Share API（対応ブラウザのみ）
 * @param {string} title - タイトル
 * @param {string} text - テキスト
 * @param {string} url - URL
 */
export const webShare = async (title, text, url) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Web Share エラー:', err);
      }
      return false;
    }
  }
  // フォールバック: URLをコピー
  return await copyToClipboard(url);
};

export default { encodeState, decodeState, generateShareUrl, copyShareUrl, getStateFromUrl, webShare };
