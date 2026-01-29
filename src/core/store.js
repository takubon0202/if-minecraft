/**
 * Simple State Store - Observerパターンベースの状態管理
 */

class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Map();
    this.globalListeners = [];
  }

  /**
   * 状態を取得
   * @param {string} key - 取得するキー（ドット記法対応）
   */
  get(key) {
    if (!key) return this.state;
    return key.split('.').reduce((obj, k) => obj?.[k], this.state);
  }

  /**
   * 状態を更新
   * @param {string} key - 更新するキー
   * @param {any} value - 新しい値
   */
  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let target = this.state;

    for (const k of keys) {
      if (!(k in target)) target[k] = {};
      target = target[k];
    }

    const oldValue = target[lastKey];
    target[lastKey] = value;

    // リスナーに通知
    this.notify(key, value, oldValue);
  }

  /**
   * 状態をマージ更新
   * @param {Object} partial - マージするオブジェクト
   */
  merge(partial) {
    Object.entries(partial).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * 特定キーの変更をサブスクライブ
   * @param {string} key - 監視するキー
   * @param {Function} callback - コールバック関数
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    // アンサブスクライブ関数を返す
    return () => {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  /**
   * 全ての変更をサブスクライブ
   * @param {Function} callback - コールバック関数
   */
  subscribeAll(callback) {
    this.globalListeners.push(callback);
    return () => {
      const index = this.globalListeners.indexOf(callback);
      if (index > -1) this.globalListeners.splice(index, 1);
    };
  }

  /**
   * リスナーに通知
   */
  notify(key, newValue, oldValue) {
    // 特定キーのリスナーに通知
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(cb => cb(newValue, oldValue, key));
    }

    // 親キーのリスナーにも通知
    const parts = key.split('.');
    while (parts.length > 1) {
      parts.pop();
      const parentKey = parts.join('.');
      if (this.listeners.has(parentKey)) {
        this.listeners.get(parentKey).forEach(cb => cb(this.get(parentKey), null, parentKey));
      }
    }

    // グローバルリスナーに通知
    this.globalListeners.forEach(cb => cb(key, newValue, oldValue));
  }
}

// アプリケーション用ストア
export const workspaceStore = new Store({
  tabs: [],
  activeTabId: null,
  version: '1.21.11',
});

export const dataStore = new Store({
  items: [],
  blocks: [],
  entities: [],
  effects: [],
  enchantments: [],
  loaded: false,
});

export const historyStore = new Store({
  commands: [],
  maxItems: 50,
});

export { Store };
export default { workspaceStore, dataStore, historyStore };
