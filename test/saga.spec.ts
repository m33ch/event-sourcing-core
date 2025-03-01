import { AbstractSaga, DomainEvent } from '../src';

class TestSaga extends AbstractSaga {
    public lastHandledEventType: string | null = null;

    protected registerHandlers(): void {
        this.on('EventA', this.handleEventA.bind(this));
        this.on('EventB', this.handleEventB.bind(this));
    }

    private async handleEventA(event: DomainEvent) {
        this.lastHandledEventType = event.eventType;
    }

    private async handleEventB(event: DomainEvent) {
        this.lastHandledEventType = event.eventType;
    }
}

describe('AbstractSaga', () => {
    it('should handle registered event types', async () => {
        const saga = new TestSaga();
        const eventA: DomainEvent = {
            eventId: '1',
            eventType: 'EventA',
            aggregateType: 'Test',
            aggregateId: 'agg1',
            version: 1,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: {},
        };
        await saga.handle(eventA);

        expect(saga.lastHandledEventType).toBe('EventA');
    });

    it('should ignore unregistered event types', async () => {
        const saga = new TestSaga();
        const eventX: DomainEvent = {
            eventId: '1',
            eventType: 'UnknownEvent',
            aggregateType: 'Test',
            aggregateId: 'agg1',
            version: 1,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: {},
        };
        await saga.handle(eventX);

        expect(saga.lastHandledEventType).toBeNull();
    });
});
