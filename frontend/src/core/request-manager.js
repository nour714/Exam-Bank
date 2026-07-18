/**
 * Global Request Manager
 * Handles request deduplication and cancellation (AbortController).
 */
export class RequestManager {
  constructor() {
    this._inflight = new Map();
    this._controllers = new Map();
  }

  /**
   * Execute a request with deduplication.
   * If a request with the same key is already inflight, returns the existing promise.
   * 
   * @param {string} key - Unique identifier for the request
   * @param {Function} requestFn - Function that takes an AbortSignal and returns a Promise
   * @returns {Promise<any>}
   */
  async execute(key, requestFn) {
    if (this._inflight.has(key)) {
      return this._inflight.get(key);
    }

    const controller = new AbortController();
    this._controllers.set(key, controller);

    const promise = requestFn(controller.signal)
      .finally(() => {
        this._inflight.delete(key);
        this._controllers.delete(key);
      });

    this._inflight.set(key, promise);
    return promise;
  }

  /**
   * Cancel an inflight request.
   * @param {string} key 
   */
  cancel(key) {
    if (this._controllers.has(key)) {
      this._controllers.get(key).abort();
      this._controllers.delete(key);
      this._inflight.delete(key);
    }
  }

  /**
   * Cancel all inflight requests.
   */
  cancelAll() {
    for (const controller of this._controllers.values()) {
      controller.abort();
    }
    this._controllers.clear();
    this._inflight.clear();
  }
}

export const requestManager = new RequestManager();
