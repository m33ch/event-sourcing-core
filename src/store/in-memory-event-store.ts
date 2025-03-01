import { EventStore } from './event-store.interface';
import { DomainEvent } from '../domain/events/domain-event.interface';
import { ConcurrencyException } from '../concurrency/concurrency.exception';

/**
 * In-memory implementation of the Event Store (non-persistent).
 */
export class InMemoryEventStore implements EventStore {
    private streams = new Map<string, DomainEvent[]>();

    public async loadEvents(
        aggregateType: string,
        aggregateId: string,
    ): Promise<DomainEvent[]> {
        const key = this.getKey(aggregateType, aggregateId);
        const events = this.streams.get(key) || [];
        // sort by version
        return [...events].sort((a, b) => a.version - b.version);
    }

    public async appendEvents(
        aggregateType: string,
        aggregateId: string,
        events: DomainEvent[],
        expectedVersion: number,
    ): Promise<void> {
        const key = this.getKey(aggregateType, aggregateId);
        const current = this.streams.get(key) || [];

        // get the current version
        const currentVersion = current.reduce(
            (max, e) => Math.max(max, e.version),
            0,
        );

        if (currentVersion !== expectedVersion) {
            throw new ConcurrencyException(
                `Expected version ${expectedVersion}, but got ${currentVersion}`,
            );
        }

        const updated = [...current, ...events];
        this.streams.set(key, updated);
    }

    private getKey(aggregateType: string, aggregateId: string) {
        return `${aggregateType}#${aggregateId}`;
    }
}
