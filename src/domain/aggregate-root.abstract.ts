import { DomainEventContext } from './events/domain-event-context';
import { DomainEvent } from './events/domain-event.interface';

/**
 * Base class for an event-sourced AggregateRoot:
 * - Version management
 * - List of "uncommitted" events
 * - recordEvent(...) function to generate and apply a DomainEvent
 */
export abstract class AggregateRoot {
    private uncommittedEvents: DomainEvent[] = [];
    private version = 0;

    public static createEmpty<T extends AggregateRoot>(this: {
        prototype: T;
    }): T {
        const aggregate = Object.create(this.prototype);
        aggregate.uncommittedEvents = [];
        return aggregate;
    }

    /**
     * Records a DomainEvent: assigns the current version to the event,
     * adds it to the list of uncommitted events, increments the version,
     * and applies the change to the domain via applyEvent().
     *
     * @param event - An instance of DomainEvent (or one of its derived classes)
     */
    protected recordEvent(event: DomainEvent): void {
        // Assigns the version to the event
        event.version = this.version + 1;
        if (!event.correlationId) {
            event.correlationId = DomainEventContext.getCorrelationId();
        }
        if (!event.causationId) {
            event.causationId = DomainEventContext.getCausationId();
        }
        this.uncommittedEvents.push(event);
        this.version++;
        this.applyEvent(event);
    }

    /**
     * Subclasses must implement how to mutate the state based on a certain event.
     */
    protected abstract applyEvent(event: DomainEvent): void;

    /**
     * Allows setting the version of the aggregate
     * (used when reloading from a snapshot).
     */
    public setVersion(newVersion: number): void {
        this.version = newVersion;
    }

    /**
     * Rehydrates the state from historical events without generating "uncommitted events".
     */
    public rehydrateFromHistory(events: DomainEvent[]) {
        // Sort by version
        events.sort((a, b) => a.version - b.version);

        for (const e of events) {
            this.version = e.version;
            this.applyEvent(e);
        }
    }

    /**
     * Returns and resets the "new" events.
     */
    public pullUncommittedEvents(): DomainEvent[] {
        const events = [...this.uncommittedEvents];
        this.uncommittedEvents = [];
        return events;
    }

    /**
     * Current version of the aggregate.
     */
    public getVersion(): number {
        return this.version;
    }
}
