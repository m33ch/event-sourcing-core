import { DomainEvent } from '../domain/events/domain-event.interface';
import { Saga } from './saga.interface';

/**
 * Base implementation of a Saga (Process Manager):
 * - Map of handlers based on eventType
 */
export abstract class AbstractSaga implements Saga {
    private handlers = new Map<string, (event: DomainEvent) => Promise<void>>();

    constructor() {
        this.registerHandlers();
    }

    protected abstract registerHandlers(): void;

    protected on(
        eventType: string,
        handler: (event: DomainEvent) => Promise<void>,
    ) {
        this.handlers.set(eventType, handler);
    }

    public async handle(event: DomainEvent): Promise<void> {
        const h = this.handlers.get(event.eventType);
        if (h) {
            await h(event);
        }
    }
}
