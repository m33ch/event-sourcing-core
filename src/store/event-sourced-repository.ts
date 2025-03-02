import { EventStore, LoadOptions } from './event-store.interface';
import { SnapshotStore } from './snapshot-store.interface';
import { AggregateRoot } from '../domain/aggregate-root.abstract';
import { Snapshot } from '../domain/snapshot.interface';
import { DomainEvent } from '../domain/events/domain-event.interface';

export class EventSourcedRepository<TAggregate extends AggregateRoot, TState> {
    constructor(
        private eventStore: EventStore,
        private snapshotStore: SnapshotStore<TState>,
        private aggregateFactory: (state: TState) => TAggregate,
        private stateExtractor: (aggregate: TAggregate) => TState,
        private aggregateType: string,
        private snapshotThreshold = 0,
    ) {}

    public async load(
        aggregateId: string,
        options?: LoadOptions,
    ): Promise<TAggregate | null> {
        // 1) Load the latest snapshot
        const snapshot = await this.snapshotStore.getLatestSnapshot(
            this.aggregateType,
            aggregateId,
        );

        let aggregate: TAggregate;
        let startVersion = 0;

        if (snapshot) {
            // create the aggregate from the state
            aggregate = this.aggregateFactory(snapshot.state);
            // rehydrate only the version
            aggregate.setVersion(snapshot.version);
            startVersion = snapshot.version;
        } else {
            // no snapshot => create an "empty" aggregate
            aggregate = this.aggregateFactory({} as TState);
        }

        // 2) Load all events
        const allEvents: DomainEvent[] = await this.eventStore.loadEvents(
            this.aggregateType,
            aggregateId,
            options,
        );
        if (!snapshot && allEvents.length === 0) {
            return null; // does not exist
        }

        const subsequentEvents = allEvents.filter(
            e => e.version > startVersion,
        );

        aggregate.rehydrateFromHistory(subsequentEvents);

        const currentVersion = await this.eventStore.getLastVersion(
            this.aggregateType,
            aggregateId,
        );
        aggregate.setVersion(currentVersion);

        return aggregate;
    }

    public async save(
        aggregateId: string,
        agg: TAggregate,
    ): Promise<DomainEvent[]> {
        const uncommitted = agg.pullUncommittedEvents();
        if (uncommitted.length === 0) return [];

        // version before these new events
        const oldVersion = agg.getVersion() - uncommitted.length;

        // append
        await this.eventStore.appendEvents(
            this.aggregateType,
            aggregateId,
            uncommitted,
            oldVersion,
        );

        // snapshot if threshold > 0
        if (
            this.snapshotThreshold > 0 &&
            agg.getVersion() % this.snapshotThreshold === 0
        ) {
            const state = this.stateExtractor(agg);
            const snapshot: Snapshot<TState> = {
                aggregateId,
                aggregateType: this.aggregateType,
                version: agg.getVersion(),
                state,
                createdAt: new Date(),
            };
            await this.snapshotStore.saveSnapshot(snapshot);
        }

        return uncommitted;
    }
}
