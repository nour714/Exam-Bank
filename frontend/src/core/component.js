/**
 * Base Component Lifecycle Class.
 * Enforces a standardized lifecycle for all UI components to prevent memory leaks.
 */
export class BaseComponent {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this._cleanups = [];
    this._children = [];
    this._isMounted = false;
  }

  /**
   * 1. Create and return the DOM element. Must be implemented by child.
   * @returns {HTMLElement}
   */
  render() {
    throw new Error('Component must implement render()');
  }

  /**
   * 2. Called immediately after the component is attached to the DOM.
   * Override to fetch data or setup 3rd party libraries.
   */
  mount() {
    this._isMounted = true;
  }

  /**
   * 3. Called when props or state change.
   */
  update(newProps) {
    this.props = { ...this.props, ...newProps };
    // Child implements specific DOM patch logic here
  }

  /**
   * 4. Called right before the component is destroyed.
   * Ideal for fade-out animations.
   */
  beforeUnmount() {}

  /**
   * 5. Called to completely destroy the component.
   * Cleans up event listeners, timers, subscriptions, children, and DOM nodes.
   */
  destroy() {
    this.beforeUnmount();

    // Destroy all registered children first
    for (const child of this._children) {
      try {
        child.destroy();
      } catch (e) {
        console.error('[BaseComponent] Error destroying child:', e);
      }
    }
    this._children = [];

    // Execute all registered cleanup functions
    for (const cleanup of this._cleanups) {
      try {
        cleanup();
      } catch (e) {
        console.error('[BaseComponent] Error in cleanup function:', e);
      }
    }
    this._cleanups = [];

    // Remove from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element = null;
    this._isMounted = false;
  }

  // ─── Lifecycle Helpers ─────────────────────────────

  /**
   * Register a child component for lifecycle management.
   * The child will be automatically destroyed when this component is destroyed.
   * @param {BaseComponent} child
   */
  registerChild(child) {
    this._children.push(child);
  }

  /**
   * Update component state and re-render in place.
   * Shallow merges newState into this.state, then swaps the DOM element.
   * @param {Object} newState
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    if (this._isMounted && this.element && this.element.parentNode) {
      const parent = this.element.parentNode;
      const oldEl = this.element;

      // Destroy old children before re-render
      for (const child of this._children) {
        try { child.destroy(); } catch(e) { /* ignore */ }
      }
      this._children = [];

      const newEl = this.render();
      parent.replaceChild(newEl, oldEl);
      this._isMounted = true;
    }
  }

  /**
   * Register a cleanup function to be called on destroy().
   * @param {Function} fn 
   */
  onCleanup(fn) {
    this._cleanups.push(fn);
  }

  /**
   * Register a DOM event listener that auto-cleans up.
   */
  addEventListener(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    this.onCleanup(() => target.removeEventListener(type, listener, options));
  }

  /**
   * Set an interval that auto-cleans up.
   */
  setInterval(fn, delay) {
    const id = setInterval(fn, delay);
    this.onCleanup(() => clearInterval(id));
    return id;
  }

  /**
   * Set a timeout that auto-cleans up.
   */
  setTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    this.onCleanup(() => clearTimeout(id));
    return id;
  }
}

