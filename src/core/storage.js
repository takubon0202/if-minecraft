/**
 * Storage Utilities - LocalStorage/SessionStorage操作
 */

const PREFIX = 'mc-tool-hub:';

/**
 * LocalStorageに保存
 * @param {string} key - キー
 * @param {any} value - 値（自動的にJSON化）
 */
export const save = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('LocalStorage保存エラー:', err);
    return false;
  }
};

/**
 * LocalStorageから読み取り
 * @param {string} key - キー
 * @param {any} defaultValue - デフォルト値
 */
export const load = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error('LocalStorage読み取りエラー:', err);
    return defaultValue;
  }
};

/**
 * LocalStorageから削除
 * @param {string} key - キー
 */
export const remove = (key) => {
  try {
    localStorage.removeItem(PREFIX + key);
    return true;
  } catch (err) {
    console.error('LocalStorage削除エラー:', err);
    return false;
  }
};

/**
 * プレフィックス付きの全キーをクリア
 */
export const clearAll = () => {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(PREFIX))
      .forEach(key => localStorage.removeItem(key));
    return true;
  } catch (err) {
    console.error('LocalStorageクリアエラー:', err);
    return false;
  }
};

/**
 * 保存データのエクスポート
 */
export const exportData = () => {
  const data = {};
  Object.keys(localStorage)
    .filter(key => key.startsWith(PREFIX))
    .forEach(key => {
      data[key.replace(PREFIX, '')] = load(key.replace(PREFIX, ''));
    });
  return data;
};

/**
 * 保存データのインポート
 * @param {Object} data - インポートするデータ
 */
export const importData = (data) => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      save(key, value);
    });
    return true;
  } catch (err) {
    console.error('データインポートエラー:', err);
    return false;
  }
};

export default { save, load, remove, clearAll, exportData, importData };
