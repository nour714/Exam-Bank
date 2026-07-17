/**
 * System-level role names.
 * These roles are seeded into the database and cannot be deleted.
 */
const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  // Future roles
  PARENT: 'parent',
  MODERATOR: 'moderator',
});

/**
 * Login history statuses.
 */
const LOGIN_STATUS = Object.freeze({
  SUCCESS: 'success',
  FAILED_CREDENTIALS: 'failed_credentials',
  FAILED_LOCKED: 'failed_locked',
  FAILED_INACTIVE: 'failed_inactive',
});

/**
 * Maximum failed login attempts before account lockout.
 */
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Account lockout duration in minutes.
 */
const LOCKOUT_DURATION_MINUTES = 15;

/**
 * Audit log action verbs.
 */
const AUDIT_ACTIONS = Object.freeze({
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  ROLE_ASSIGN: 'role_assign',
  ROLE_REVOKE: 'role_revoke',
});

module.exports = {
  ROLES,
  LOGIN_STATUS,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
  AUDIT_ACTIONS,
};
