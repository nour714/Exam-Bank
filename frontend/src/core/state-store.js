import { eventBus } from './event-bus.js';

/**
 * Reactive State Store using Proxy.
 * Components subscribe to specific keys and are notified on change.
 */
class StateStore {
  constructor() {
    this._state = {};
    /** @type {Map<string, Set<Function>>} */
    this._subscribers = new Map();

    this.state = new Proxy(this._state, {
      set: (target, key, value) => {
        const oldValue = target[key];
        target[key] = value;

        if (oldValue !== value) {
          this._notify(key, value, oldValue);
        }
        return true;
      },
    });
  }

  /**
   * Get a value from the store.
   */
  get(key) {
    return this._state[key];
  }

  /**
   * Set a value in the store.
   */
  set(key, value) {
    this.state[key] = value;
  }

  /**
   * Merge an object into the store (shallow merge on a specific key).
   */
  merge(key, partial) {
    const current = this._state[key] || {};
    this.state[key] = { ...current, ...partial };
  }

  /**
   * Subscribe to changes on a specific key.
   * @param {string} key
   * @param {Function} callback - (newValue, oldValue) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._subscribers.has(key)) {
      this._subscribers.set(key, new Set());
    }
    this._subscribers.get(key).add(callback);

    return () => {
      this._subscribers.get(key)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of a key change.
   * @private
   */
  _notify(key, newValue, oldValue) {
    const subs = this._subscribers.get(key);
    if (subs) {
      for (const fn of subs) {
        try {
          fn(newValue, oldValue);
        } catch (err) {
          console.error(`[StateStore] Error in subscriber for '${key}':`, err);
        }
      }
    }

    // Also emit on the global EventBus for cross-cutting concerns
    eventBus.emit(`store:${key}:changed`, { key, newValue, oldValue });
  }

  /**
   * Reset a key to null.
   */
  reset(key) {
    this.state[key] = null;
  }

  /**
   * Reset the entire store.
   */
  resetAll() {
    for (const key of Object.keys(this._state)) {
      this._state[key] = null;
    }
    this._subscribers.clear();
  }
}

export const store = new StateStore();

// Initialize default state slices
store.set('user', null);
store.set('tenant', null);
store.set('permissions', []);
store.set('theme', localStorage.getItem('theme') || 'light');
store.set('language', localStorage.getItem('language') || 'en');
store.set('notifications', []);
store.set('activeExams', []);
store.set('studyGroups', []);
store.set('sidebarCollapsed', false);

// Question Bank Hierarchy Selection
store.set('qbSelectedSubject', null);
store.set('qbSelectedUnit', null);
store.set('qbSelectedLesson', null);
