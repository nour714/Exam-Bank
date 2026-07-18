/**
 * Token Manager for secure in-memory storage.
 * Breaks circular dependencies between auth.service and interceptors.
 */
let _accessToken = null;

export const TokenManager = {
  getToken() {
    return _accessToken;
  },
  setToken(token) {
    _accessToken = token;
  },
  clearToken() {
    _accessToken = null;
  }
};
