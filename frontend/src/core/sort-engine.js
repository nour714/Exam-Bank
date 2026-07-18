/**
 * SortEngine
 * 
 * Manages generic sorting state independent of UI.
 */
export class SortEngine {
  /**
   * @param {Object} options
   * @param {string} [options.defaultField='createdAt']
   * @param {string} [options.defaultDirection='desc']
   * @param {Function} [options.onChange]
   */
  constructor(options = {}) {
    this._field = options.defaultField || 'createdAt';
    this._direction = options.defaultDirection || 'desc';
    this._subscribers = new Set();

    if (options.onChange) {
      this.subscribe(options.onChange);
    }
  }

  getCurrentSort() {
    return {
      field: this._field,
      direction: this._direction
    };
  }

  setSort(field, direction) {
    if (this._field === field && this._direction === direction) return;
    this._field = field;
    this._direction = direction;
    this._notify();
  }

  subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  _notify() {
    const sort = this.getCurrentSort();
    for (const cb of this._subscribers) {
      cb(sort);
    }
  }
}
