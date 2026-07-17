/**
 * Domain events emitted by the Auth module.
 * Other modules subscribe via the EventBus to react without coupling.
 */
module.exports = Object.freeze({
  USER_REGISTERED: 'auth:user_registered',
  USER_LOGGED_IN: 'auth:user_logged_in',
  USER_LOGGED_OUT: 'auth:user_logged_out',
  USER_PASSWORD_CHANGED: 'auth:user_password_changed',
  USER_ACCOUNT_LOCKED: 'auth:user_account_locked',
  TOKEN_REUSE_DETECTED: 'auth:token_reuse_detected',
  ALL_SESSIONS_REVOKED: 'auth:all_sessions_revoked',
});
