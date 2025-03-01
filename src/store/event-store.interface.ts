import { DomainEvent } from '../domain/events/domain-event.interface';

export interface LoadOptions {
    /**
     * If true, include all events (including "delete" events).
     * If false (or omitted), the caller may choose to exclude delete events.
     */
    includeDeleted?: boolean;
    /**
     * Optional function to filter events.
     * If it returns false for a specific event, that event will be excluded.
     */
    filter?: (event: DomainEvent) => boolean;
}

/**
 * Contract for an Event Store that handles:
 * - Loading events from a stream
 * - Appending new events with concurrency control
 */
export interface EventStore {
    loadEvents(
        aggregateType: string,
        aggregateId: string,
        options?: LoadOptions,
    ): Promise<DomainEvent[]>;
    appendEvents(
        aggregateType: string,
        aggregateId: string,
        events: DomainEvent[],
        expectedVersion: number,
    ): Promise<void>;
}
