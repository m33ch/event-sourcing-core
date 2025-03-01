import { AggregateRoot } from '../src/domain/aggregate-root.abstract';
import { DomainEvent } from '../src/domain/events/domain-event.interface';
import { DomainEventContext } from '../src/domain/events/domain-event-context';
import { v4 as uuidv4 } from 'uuid';

class FakeAggregate extends AggregateRoot {
    private data: string[] = [];

    public addData(value: string): void {
        this.recordEvent({
            eventId: uuidv4(),
            eventType: 'DataAdded',
            aggregateType: 'FakeAggregate',
            aggregateId: 'FAKE-1',
            version: 0,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: { value },
        });
    }

    public addUnknown(): void {
        this.recordEvent({
            eventId: uuidv4(),
            eventType: 'UnknownType',
            aggregateType: 'FakeAggregate',
            aggregateId: 'FAKE-1',
            version: 0,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: {},
        });
    }

    public doNoPayload(): void {
        this.recordEvent({
            eventId: uuidv4(),
            eventType: 'NoPayloadEvent',
            aggregateType: 'TestAggregate',
            aggregateId: 'NO-PAYLOAD-ID',
            version: 0,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: {},
        });
    }

    protected applyEvent(event: DomainEvent): void {
        if (event.eventType === 'DataAdded') {
            this.data.push(event.payload.value as string);
        } else if (event.eventType === 'UnknownType') {
            // do nothing
        }
    }

    public getData(): string[] {
        return this.data;
    }
}

describe('AggregateRoot (FakeAggregate)', () => {
    it('should record and apply known events', () => {
        const agg = new FakeAggregate();
        agg.addData('hello');
        agg.addData('world');

        const events = agg.pullUncommittedEvents();
        expect(events).toHaveLength(2);
        expect(agg.getData()).toEqual(['hello', 'world']);
    });

    it('should handle unknown event type (branch coverage)', () => {
        const agg = new FakeAggregate();
        agg.addUnknown();

        const events = agg.pullUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0].eventType).toBe('UnknownType');
        expect(agg.getData()).toEqual([]);
    });

    it('should rehydrate from events not sorted to cover version logic', () => {
        const agg = new FakeAggregate();

        const e1: DomainEvent = {
            eventId: uuidv4(),
            eventType: 'DataAdded',
            aggregateType: 'FakeAggregate',
            aggregateId: 'FAKE-1',
            version: 2,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: { value: 'world' },
        };
        const e0: DomainEvent = {
            eventId: uuidv4(),
            eventType: 'DataAdded',
            aggregateType: 'FakeAggregate',
            aggregateId: 'FAKE-1',
            version: 1,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: { value: 'hello' },
        };

        agg.rehydrateFromHistory([e1, e0]);
        expect(agg.getData()).toEqual(['hello', 'world']);
    });

    it('should handle recordEvent with no payload', () => {
        const agg = new FakeAggregate();
        agg.doNoPayload();
        const events = agg.pullUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0].payload).toEqual({});
    });

    it('should create an empty instance with no uncommitted events', () => {
        const instance = FakeAggregate.createEmpty();
        expect(instance).toBeInstanceOf(FakeAggregate);
        expect(instance.pullUncommittedEvents()).toEqual([]);
    });

    it('should assign correlationId and causationId from context when recording an event', async () => {
        await DomainEventContext.run(
            {
                correlationId: 'test-correlation',
                causationStack: ['test-causation'],
            },
            async () => {
                const agg = new FakeAggregate();
                agg.addData('test');
                const events = agg.pullUncommittedEvents();
                expect(events).toHaveLength(1);
                expect(events[0].correlationId).toBe('test-correlation');
                expect(events[0].causationId).toBe('test-causation');
            },
        );
    });
});
