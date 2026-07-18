import { api } from './http/api-client.js';
import { store } from '../core/state-store.js';
import { router } from '../core/router.js';
import { eventBus } from '../core/event-bus.js';
import { TokenManager } from './http/token-manager.js';

/**
 * Authentication Service.
 * Manages login, register, token lifecycle, and session recovery.
 * Fully compliant with security requirements:
 * - Access token is kept in memory only via TokenManager.
 * - Refresh token is handled natively by the browser via HTTP-Only cookies.
 */
export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    this._setSession(res.data);
    return res.data;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    this._setSession(res.data);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch { /* Ignore network errors on logout */ }
    this._clearSession();
    router.navigate('/login');
  },

  /**
   * Attempt to recover session on app load using the HTTP-only refresh token cookie.
   * We just make the call, and the browser attaches the cookie.
   */
  async recoverSession() {
    try {
      // The API client is configured with credentials: true to send cookies
      const res = await api.post('/auth/refresh');
      this._setSession(res.data);
      eventBus.emit('auth.session.restored', res.data.user);
      return true;
    } catch {
      this._clearSession();
      return false;
    }
  },

  isAuthenticated() {
    return !!TokenManager.getToken();
  },
  
  getAccessToken() {
    return TokenManager.getToken();
  },

  hasPermission(permission) {
    const perms = store.get('permissions') || [];
    return perms.includes(permission) || perms.includes('*');
  },

  hasRole(role) {
    const user = store.get('user');
    return user?.role === role;
  },

  _setSession(data) {
    TokenManager.setToken(data.accessToken);
    store.set('user', data.user);
    store.set('permissions', data.permissions || []);
    store.set('tenant', data.tenant || null);
    eventBus.emit('auth.login', data.user); // Switched to auth.login as requested
  },

  _clearSession() {
    TokenManager.clearToken();
    store.set('user', null);
    store.set('permissions', []);
    store.set('tenant', null);
    eventBus.emit('auth.logout'); // Switched to auth.logout as requested
  },
};

// Listen for session expiry from interceptor
eventBus.on('auth:expired', () => {
  authService._clearSession();
  router.navigate('/login');
});
