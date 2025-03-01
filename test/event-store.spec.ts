import { DomainEvent } from '../src/domain/events/domain-event.interface';
import { v4 as uuidv4 } from 'uuid';
import { ConcurrencyException, InMemoryEventStore } from '../src';

describe('InMemoryEventStore', () => {
    let store: InMemoryEventStore;

    beforeEach(() => {
        store = new InMemoryEventStore();
    });

    it('should load empty if no events appended', async () => {
        const events = await store.loadEvents('Order', '123');
        expect(events).toEqual([]);
    });

    it('should append and load events', async () => {
        const event: DomainEvent = {
            eventId: uuidv4(),
            eventType: 'TestEvent',
            aggregateType: 'Order',
            aggregateId: '123',
            version: 1,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: { foo: 'bar' },
        };
        await store.appendEvents('Order', '123', [event], 0);

        const loaded = await store.loadEvents('Order', '123');
        expect(loaded.length).toBe(1);
        expect(loaded[0].eventType).toBe('TestEvent');
    });

    it('should throw ConcurrencyException if version mismatch', async () => {
        const e1: DomainEvent = {
            eventId: uuidv4(),
            eventType: 'TestEvent1',
            aggregateType: 'Order',
            aggregateId: '123',
            version: 1,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: {},
        };
        await store.appendEvents('Order', '123', [e1], 0);

        const e2: DomainEvent = {
            eventId: uuidv4(),
            eventType: 'TestEvent2',
            aggregateType: 'Order',
            aggregateId: '123',
            version: 2,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: {},
        };

        await expect(
            store.appendEvents('Order', '123', [e2], 0),
        ).rejects.toThrow(ConcurrencyException);
    });
});
