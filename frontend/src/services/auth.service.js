import { api } from './http/api-client.js';
import { store } from '../core/state-store.js';
import { router } from '../core/router.js';
import { eventBus } from '../core/event-bus.js';

/**
 * Authentication Service.
 * Manages login, register, token lifecycle, and session recovery.
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
   * Attempt to recover session on app load using stored refresh token.
   */
  async recoverSession() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const res = await api.post('/auth/refresh', { refreshToken });
      this._setSession(res.data);
      return true;
    } catch {
      this._clearSession();
      return false;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
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
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    store.set('user', data.user);
    store.set('permissions', data.permissions || []);
    store.set('tenant', data.tenant || null);
    eventBus.emit('auth:logged_in', data.user);
  },

  _clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    store.set('user', null);
    store.set('permissions', []);
    store.set('tenant', null);
    eventBus.emit('auth:logged_out');
  },
};

// Listen for session expiry from interceptor
window.addEventListener('auth:session_expired', () => {
  authService._clearSession();
  router.navigate('/login');
});
