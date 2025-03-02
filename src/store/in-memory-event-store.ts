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

        const currentVersion = await this.getLastVersion(
            aggregateType,
            aggregateId,
        );

        if (currentVersion !== expectedVersion) {
            throw new ConcurrencyException(
                `Expected version ${expectedVersion}, but got ${currentVersion}`,
            );
        }

        const currentEvents = this.streams.get(key) || [];
        const updated = [...currentEvents, ...events];
        this.streams.set(key, updated);
    }

    public async getLastVersion(
        aggregateType: string,
        aggregateId: string,
    ): Promise<number> {
        const key = this.getKey(aggregateType, aggregateId);
        const events = this.streams.get(key) || [];

        return events.reduce((max, e) => Math.max(max, e.version), 0);
    }

    private getKey(aggregateType: string, aggregateId: string) {
        return `${aggregateType}#${aggregateId}`;
    }
}
