/**
 * Hash Router - シンプルなハッシュベースルーター
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.onRouteChange = null;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  /**
   * ルートを登録
   * @param {string} path - ルートパス（例: '/tool/give'）
   * @param {Function} handler - ハンドラー関数
   */
  register(path, handler) {
    this.routes.set(path, handler);
  }

  /**
   * 現在のハッシュからルートを解析
   */
  parseHash() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    return { path, params };
  }

  /**
   * ルート変更を処理
   */
  handleRoute() {
    const { path, params } = this.parseHash();
    this.currentRoute = path;

    // 完全一致を試行
    if (this.routes.has(path)) {
      this.routes.get(path)(params);
      if (this.onRouteChange) this.onRouteChange(path, params);
      return;
    }

    // パターンマッチを試行（/tool/:id など）
    for (const [pattern, handler] of this.routes) {
      const match = this.matchPattern(pattern, path);
      if (match) {
        handler({ ...Object.fromEntries(params), ...match });
        if (this.onRouteChange) this.onRouteChange(path, params);
        return;
      }
    }

    // 404: デフォルトルートにフォールバック
    if (this.routes.has('/')) {
      this.routes.get('/')(params);
    }
  }

  /**
   * パターンマッチング
   * @param {string} pattern - ルートパターン（例: '/tool/:id'）
   * @param {string} path - 実際のパス
   */
  matchPattern(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  /**
   * プログラムでナビゲート
   * @param {string} path - ナビゲート先のパス
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * 現在のルートを取得
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

export const router = new Router();
export default router;
