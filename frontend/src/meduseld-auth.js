/**
 * Meduseld Accounts - Auth Client (ES Module)
 * For React/Vite apps. Vanilla JS apps use the UMD version via script tag.
 */

const ACCOUNTS_URL = 'https://accounts.meduseld.io';

class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export class MeduseldAuth {
  constructor(appId, options = {}) {
    this.appId = appId;
    this.baseUrl = options.baseUrl || ACCOUNTS_URL;
    this.user = null;
    this.csrfToken = null;
    this._refreshing = null;
    this._listeners = [];
  }

  async init() {
    try {
      const data = await this._request('/auth/refresh', { method: 'POST' });
      if (data?.user) {
        this.user = data.user;
        this.csrfToken = data.csrfToken;
        this._notify();
        return this.user;
      }
    } catch {
      // Not logged in
    }
    return null;
  }

  isAuthenticated() {
    return this.user !== null;
  }

  getUser() {
    return this.user;
  }

  login(returnUrl) {
    const redirect = returnUrl || window.location.href;
    window.location.href = `${this.baseUrl}?redirect=${encodeURIComponent(redirect)}`;
  }

  async loginInline(email, password) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new AuthError(data.error || 'Login failed', res.status);
    }
    this.user = data.user;
    this.csrfToken = data.csrfToken;
    this._notify();
    return data;
  }

  async signupInline(email, password, displayName) {
    const res = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName: displayName || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new AuthError(data.error || 'Signup failed', res.status);
    }
    this.user = data.user;
    this.csrfToken = data.csrfToken;
    this._notify();
    return data;
  }

  async logout() {
    try {
      await this._request('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    this.user = null;
    this.csrfToken = null;
    this._notify();
  }

  onAuthChange(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(cb => cb !== callback);
    };
  }

  async loadData(key = 'default') {
    if (!this.user) return null;
    try {
      const result = await this._request(`/data/${this.appId}/${key}`);
      return result.data;
    } catch (err) {
      if (err.status === 404) return null;
      console.error(`Failed to load synced data (${this.appId}/${key}):`, err);
      return null;
    }
  }

  async saveData(data, key = 'default') {
    if (!this.user) return false;
    try {
      await this._request(`/data/${this.appId}/${key}`, {
        method: 'PUT',
        body: { data },
      });
      return true;
    } catch (err) {
      console.error(`Failed to save synced data (${this.appId}/${key}):`, err);
      return false;
    }
  }

  async deleteData(key = 'default') {
    if (!this.user) return false;
    try {
      await this._request(`/data/${this.appId}/${key}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      console.error(`Failed to delete synced data (${this.appId}/${key}):`, err);
      return false;
    }
  }

  async sync(localData, localUpdatedAt, key = 'default') {
    if (!this.user) return { source: 'none', data: localData };
    try {
      const result = await this._request(`/data/${this.appId}/${key}`);
      const serverUpdatedAt = new Date(result.updatedAt).getTime();
      const localTime = new Date(localUpdatedAt).getTime();
      if (serverUpdatedAt > localTime) {
        return { source: 'server', data: result.data };
      } else if (localTime > serverUpdatedAt) {
        await this.saveData(localData, key);
        return { source: 'local', data: localData };
      }
      return { source: 'none', data: localData };
    } catch (err) {
      if (err.status === 404) {
        await this.saveData(localData, key);
        return { source: 'local', data: localData };
      }
      console.error(`Sync failed (${this.appId}/${key}):`, err);
      return { source: 'none', data: localData };
    }
  }

  _notify() {
    const state = { user: this.user };
    for (const cb of this._listeners) {
      try { cb(state); } catch (e) { console.error('Auth listener error:', e); }
    }
  }

  async _request(path, options = {}) {
    const { method = 'GET', body } = options;
    const opts = {
      method,
      credentials: 'include',
      headers: {},
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && this.csrfToken) {
      opts.headers['X-CSRF-Token'] = this.csrfToken;
    }
    const res = await fetch(`${this.baseUrl}${path}`, opts);
    if (res.status === 401) {
      const data = await res.json().catch(() => ({}));
      if (data.code === 'TOKEN_EXPIRED' && !options._isRetry) {
        const refreshed = await this._refresh();
        if (refreshed) {
          return this._request(path, { ...options, _isRetry: true });
        }
      }
      this.user = null;
      this.csrfToken = null;
      this._notify();
      throw new AuthError(data.error || 'Not authenticated', 401);
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new AuthError(data.error || `Request failed (${res.status})`, res.status);
    }
    return res.json();
  }

  async _refresh() {
    if (this._refreshing) return this._refreshing;
    this._refreshing = (async () => {
      try {
        const data = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        }).then(r => r.ok ? r.json() : null);
        if (data?.user) {
          this.user = data.user;
          this.csrfToken = data.csrfToken;
          this._notify();
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this._refreshing = null;
      }
    })();
    return this._refreshing;
  }
}
