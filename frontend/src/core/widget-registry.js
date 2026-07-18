/**
 * Global Widget Registry
 * Allows dynamic composition of UI zones (e.g., dashboard, sidebar, settings)
 * without hardcoding components. Essential for the plugin architecture.
 */
class WidgetRegistry {
  constructor() {
    /** @type {Map<string, Map<string, { componentClass: Function, options: Object }>>} */
    this.zones = new Map();
  }

  /**
   * Register a widget into a specific zone.
   * @param {string} zone - The UI zone (e.g., 'dashboard', 'sidebar')
   * @param {string} id - Unique ID for the widget
   * @param {Function} componentClass - The BaseComponent class to instantiate
   * @param {Object} [options={}] - Optional metadata (e.g., order, permissions required)
   */
  register(zone, id, componentClass, options = {}) {
    if (!this.zones.has(zone)) {
      this.zones.set(zone, new Map());
    }
    
    this.zones.get(zone).set(id, {
      componentClass,
      options: { order: 99, ...options }
    });
  }

  /**
   * Unregister a widget.
   * @param {string} zone 
   * @param {string} id 
   */
  unregister(zone, id) {
    if (this.zones.has(zone)) {
      this.zones.get(zone).delete(id);
    }
  }

  /**
   * Get all registered widgets for a zone, sorted by order.
   * @param {string} zone 
   * @returns {Array<{ id: string, componentClass: Function, options: Object }>}
   */
  getWidgets(zone) {
    if (!this.zones.has(zone)) return [];

    const widgets = Array.from(this.zones.get(zone).entries()).map(([id, def]) => ({
      id,
      componentClass: def.componentClass,
      options: def.options
    }));

    // Sort by order
    return widgets.sort((a, b) => a.options.order - b.options.order);
  }
}

export const widgetRegistry = new WidgetRegistry();
