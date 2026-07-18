/**
 * SelectionManager
 * 
 * Reusable manager for tracking selection state (single or multiple).
 * Operates independently of the DOM. Exposes a subscription model.
 */
export class SelectionManager {
  /**
   * @param {Object} options
   * @param {boolean} [options.multi=true] - Whether multiple selection is allowed
   * @param {Function} [options.onChange]  - Callback fired when selection changes
   */
  constructor(options = {}) {
    this.multi = options.multi !== false;
    this._selectedIds = new Set();
    this._subscribers = new Set();

    if (options.onChange) {
      this.subscribe(options.onChange);
    }
  }

  get selectedIds() {
    return Array.from(this._selectedIds);
  }

  get selectedCount() {
    return this._selectedIds.size;
  }

  isSelected(id) {
    return this._selectedIds.has(id);
  }

  select(id) {
    if (this._selectedIds.has(id)) return;
    
    if (!this.multi) {
      this._selectedIds.clear();
    }
    this._selectedIds.add(id);
    this._notify();
  }

  deselect(id) {
    if (!this._selectedIds.has(id)) return;
    this._selectedIds.delete(id);
    this._notify();
  }

  toggle(id) {
    if (this.isSelected(id)) {
      this.deselect(id);
    } else {
      this.select(id);
    }
  }

  selectAll(ids) {
    if (!this.multi) throw new Error('[SelectionManager] Cannot selectAll when multi is false');
    
    let changed = false;
    for (const id of ids) {
      if (!this._selectedIds.has(id)) {
        this._selectedIds.add(id);
        changed = true;
      }
    }
    
    if (changed) this._notify();
  }

  clear() {
    if (this._selectedIds.size === 0) return;
    this._selectedIds.clear();
    this._notify();
  }

  subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  _notify() {
    const ids = this.selectedIds;
    for (const cb of this._subscribers) {
      cb(ids, this.selectedCount);
    }
  }
}
