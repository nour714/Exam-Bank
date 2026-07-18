/**
 * FilterEngine
 * 
 * Manages the state of generic filters independently of the UI.
 * Allows components to set, clear, and subscribe to filter changes.
 */
export class FilterEngine {
  /**
   * @param {Object} options
   * @param {Array<Object>} [options.schema] - Array of filter definitions (e.g. { id, type, defaultValue })
   * @param {Function} [options.onChange]    - Callback fired when filters change
   */
  constructor(options = {}) {
    this.schema = options.schema || [];
    this._filters = new Map();
    this._subscribers = new Set();

    // Initialize defaults from schema
    for (const def of this.schema) {
      if (def.defaultValue !== undefined) {
        this._filters.set(def.id, def.defaultValue);
      }
    }

    if (options.onChange) {
      this.subscribe(options.onChange);
    }
  }

  /**
   * Returns a plain object of all active (non-null/undefined/empty) filters.
   */
  getActiveFilters() {
    const active = {};
    for (const [key, value] of this._filters.entries()) {
      if (value !== null && value !== undefined && value !== '') {
        // For arrays, ensure they aren't empty
        if (Array.isArray(value) && value.length === 0) continue;
        active[key] = value;
      }
    }
    return active;
  }

  setFilter(id, value) {
    // Basic structural equality check to avoid redundant notifies
    const current = this._filters.get(id);
    if (JSON.stringify(current) === JSON.stringify(value)) return;

    this._filters.set(id, value);
    this._notify();
  }

  removeFilter(id) {
    if (!this._filters.has(id)) return;
    this._filters.delete(id);
    this._notify();
  }

  clearFilters() {
    let changed = false;
    // We only clear filters that are active. 
    // We optionally restore defaultValues if configured that way, 
    // but typically clear means empty.
    if (this._filters.size > 0) {
      this._filters.clear();
      changed = true;
    }

    // Re-apply defaults
    for (const def of this.schema) {
      if (def.defaultValue !== undefined) {
        this._filters.set(def.id, def.defaultValue);
        changed = true;
      }
    }

    if (changed) this._notify();
  }

  subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  _notify() {
    const active = this.getActiveFilters();
    for (const cb of this._subscribers) {
      cb(active);
    }
  }
}
