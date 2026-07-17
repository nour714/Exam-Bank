const EventEmitter = require('events');
const { logger } = require('../logger');

/**
 * EventBus Abstraction
 * Currently uses Local EventEmitter.
 * Future migration: Map emit/on to Redis Streams or RabbitMQ.
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase limit for enterprise scale modules
    this.setMaxListeners(50);
  }

  /**
   * Publish an event to the bus.
   * @param {string} eventName 
   * @param {Object} payload 
   */
  publish(eventName, payload) {
    logger.debug({ eventName, payload }, 'EventBus: Event Published');
    this.emit(eventName, payload);
  }

  /**
   * Subscribe to an event.
   * @param {string} eventName 
   * @param {Function} handler 
   */
  subscribe(eventName, handler) {
    logger.info(`EventBus: Subscribed to ${eventName}`);
    const wrappedHandler = async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error({ eventName, error }, 'EventBus: Handler Execution Failed');
      }
    };
    handler.__wrappedHandler = wrappedHandler;
    this.on(eventName, wrappedHandler);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} eventName 
   * @param {Function} handler 
   */
  unsubscribe(eventName, handler) {
    logger.info(`EventBus: Unsubscribed from ${eventName}`);
    this.removeListener(eventName, handler.__wrappedHandler || handler);
  }
}

const eventBus = new EventBus();

module.exports = {
  eventBus,
  EventBus,
};
