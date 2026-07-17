/**
 * Centralized Module Loader.
 * Sits between the Router and the Feature Modules to manage lazy loading,
 * initialization, and lifecycle disposal (caching).
 */
class ModuleLoader {
  constructor() {
    /** @type {Map<string, Object>} Cache of loaded modules */
    this.moduleCache = new Map();
    /** @type {Object} The currently active module instance */
    this.activeModule = null;
  }

  /**
   * Load and mount a feature module dynamically.
   * @param {string} moduleName - Unique identifier for caching
   * @param {Function} importFn - Function returning a Promise of the module (e.g., () => import('../pages/dashboard/dashboard.js'))
   * @param {Object} params - Route parameters to pass to the module
   * @returns {Promise<HTMLElement>} The DOM node to mount
   */
  async load(moduleName, importFn, params = {}) {
    // 1. Dispose previous module if needed
    this._disposeActive();

    try {
      let moduleDefinition;

      // 2. Fetch from cache or lazy load
      if (this.moduleCache.has(moduleName)) {
        moduleDefinition = this.moduleCache.get(moduleName);
      } else {
        const imported = await importFn();
        // Assume default export is the Module class/factory
        moduleDefinition = imported.default || Object.values(imported)[0];
        this.moduleCache.set(moduleName, moduleDefinition);
      }

      // 3. Initialize module instance
      // If it's a class with a mount/render lifecycle
      if (typeof moduleDefinition === 'function' && moduleDefinition.prototype && moduleDefinition.prototype.render) {
        this.activeModule = new moduleDefinition(params);
        const element = this.activeModule.render();
        
        // Trigger mount lifecycle after a tick to ensure DOM insertion
        setTimeout(() => {
          if (this.activeModule && this.activeModule.mount) {
            this.activeModule.mount();
          }
        }, 0);

        return element;
      } 
      // If it's a simple async function (like our existing Phase 9 pages)
      else if (typeof moduleDefinition === 'function') {
        const element = await moduleDefinition(params);
        this.activeModule = { destroy: () => {} }; // Dummy cleanup for functional components
        return element;
      }

      throw new Error(`Module ${moduleName} does not export a valid component or function.`);

    } catch (error) {
      console.error(`[ModuleLoader] Failed to load module: ${moduleName}`, error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'p-6 text-center text-danger';
      errorDiv.innerHTML = `<h3>Failed to load module</h3><p>${error.message}</p>`;
      return errorDiv;
    }
  }

  /**
   * Dispose the currently active module, triggering garbage collection.
   */
  _disposeActive() {
    if (this.activeModule) {
      if (typeof this.activeModule.destroy === 'function') {
        this.activeModule.destroy();
      }
      this.activeModule = null;
    }
  }

  /**
   * Preload a module in the background without mounting it.
   */
  async preload(moduleName, importFn) {
    if (!this.moduleCache.has(moduleName)) {
      try {
        const imported = await importFn();
        const moduleDefinition = imported.default || Object.values(imported)[0];
        this.moduleCache.set(moduleName, moduleDefinition);
      } catch (e) {
        console.warn(`[ModuleLoader] Preload failed for ${moduleName}`, e);
      }
    }
  }
}

export const moduleLoader = new ModuleLoader();
