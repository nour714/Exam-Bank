const { EventBus } = require('../../src/shared/events/index');

describe('EventBus (Unit)', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should subscribe and publish events', async () => {
    const handler = jest.fn();
    eventBus.subscribe('test.event', handler);

    await eventBus.publish('test.event', { data: 123 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ data: 123 });
  });

  it('should allow unsubscribing', async () => {
    const handler = jest.fn();
    eventBus.subscribe('test.event', handler);
    eventBus.unsubscribe('test.event', handler);

    await eventBus.publish('test.event', { data: 123 });

    expect(handler).not.toHaveBeenCalled();
  });
});
