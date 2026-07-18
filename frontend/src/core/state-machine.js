/**
 * UI State Machine
 * Manages standard UI states: 'loading', 'ready', 'empty', 'error', 'offline'.
 */
export class StateMachine {
  /**
   * @param {Object} options
   * @param {string} [options.initial='loading']
   * @param {Function} [options.onChange] - Callback fired when state changes (newState, oldState, data)
   */
  constructor(options = {}) {
    this.validStates = ['loading', 'ready', 'empty', 'error', 'offline'];
    this.state = options.initial || 'loading';
    this.data = null; // Associated data (e.g., error message or empty message)
    this.onChange = options.onChange || (() => {});
  }

  /**
   * Transition to a new state.
   * @param {string} newState 
   * @param {any} [data=null] - Optional data for the new state
   */
  transition(newState, data = null) {
    if (!this.validStates.includes(newState)) {
      throw new Error(`[StateMachine] Invalid state: ${newState}`);
    }

    if (this.state !== newState || this.data !== data) {
      const oldState = this.state;
      this.state = newState;
      this.data = data;
      this.onChange(newState, oldState, data);
    }
  }

  /**
   * Helper to check the current state.
   */
  is(state) {
    return this.state === state;
  }
}
