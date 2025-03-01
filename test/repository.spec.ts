import { InMemoryEventStore } from '../src/store/in-memory-event-store';
import { EventSourcedRepository } from '../src/store/event-sourced-repository';
import { InMemorySnapshotStore } from '../src/store/in-memory-snapshot-store';
import { DomainEvent } from '../src/domain/events/domain-event.interface';
import { AggregateRoot } from '../src/domain/aggregate-root.abstract';
import { v4 as uuidv4 } from 'uuid';

type TestAggregateState = { foo: string };

class TestAggregate extends AggregateRoot {
    private foo = '';

    public setFoo(value: string): void {
        this.recordEvent({
            eventId: uuidv4(),
            eventType: 'FooUpdated',
            aggregateType: 'TestAggregate',
            aggregateId: 'AGG-1',
            version: 0,
            occurredOn: new Date(),
            recordedOn: new Date(),
            payload: { value },
        });
    }

    protected applyEvent(event: DomainEvent): void {
        if (event.eventType === 'FooUpdated') {
            this.foo = event.payload.value as string;
        }
    }

    public toState(): TestAggregateState {
        return { foo: this.foo };
    }

    public static fromState(state: TestAggregateState): TestAggregate {
        const agg = new TestAggregate();
        agg.foo = state.foo;
        return agg;
    }

    public getFoo(): string {
        return this.foo;
    }
}

describe('EventSourcedRepository', () => {
    let eventStore: InMemoryEventStore;
    let snapshotStore: InMemorySnapshotStore<TestAggregateState>;
    let repo: EventSourcedRepository<TestAggregate, TestAggregateState>;

    beforeEach(() => {
        eventStore = new InMemoryEventStore();
        snapshotStore = new InMemorySnapshotStore<TestAggregateState>();
        repo = new EventSourcedRepository<TestAggregate, TestAggregateState>(
            eventStore,
            snapshotStore,
            state => TestAggregate.fromState(state),
            agg => agg.toState(),
            'TestAggregate',
            2, // snapshot threshold
        );
    });

    it('should return null if no snapshot and no events', async () => {
        const loaded = await repo.load('AGG-1');
        expect(loaded).toBeNull();
    });

    it('should save and load an aggregate', async () => {
        const agg = new TestAggregate();
        agg.setFoo('hello');
        // Salva l'aggregato; save restituisce gli eventi "uncommitted" che sono stati salvati
        const uncommitted = await repo.save('AGG-1', agg);
        expect(uncommitted).toHaveLength(1);

        // Carica l'aggregato ricostruito dai soli eventi
        const loaded = await repo.load('AGG-1');
        expect(loaded).not.toBeNull();
        expect(loaded?.getFoo()).toBe('hello');
    });

    it('should create a snapshot after threshold is reached', async () => {
        const agg = new TestAggregate();
        // Primo evento: version 1
        agg.setFoo('first');
        await repo.save('AGG-1', agg);

        // Secondo evento: version 2 -> soglia raggiunta, snapshot creato
        agg.setFoo('second');
        await repo.save('AGG-1', agg);

        const snap = await snapshotStore.getLatestSnapshot(
            'TestAggregate',
            'AGG-1',
        );
        expect(snap).not.toBeNull();
        expect(snap?.version).toBe(2);
        expect(snap?.state.foo).toBe('second');
    });

    it('should return null if no snapshot and no events for a new aggregate id', async () => {
        const loaded = await repo.load('NO-SNAPSHOT-NO-EVENTS');
        expect(loaded).toBeNull();
    });

    it('should load from events if no snapshot but there are events', async () => {
        const agg = new TestAggregate();
        agg.setFoo('some data');
        await repo.save('AGG-2', agg);

        const loaded = await repo.load('AGG-2');
        expect(loaded).not.toBeNull();
        expect(loaded?.getFoo()).toBe('some data');
    });

    it('should load from snapshot with no subsequent events', async () => {
        const agg = new TestAggregate();
        agg.setFoo('first'); // version 1
        await repo.save('AGG-3', agg);

        agg.setFoo('second'); // version 2 -> snapshot creato
        await repo.save('AGG-3', agg);

        const loaded = await repo.load('AGG-3');
        expect(loaded?.getFoo()).toBe('second');
    });

    it('should not create snapshot if snapshotThreshold is 0', async () => {
        const repoNoSnap = new EventSourcedRepository<
            TestAggregate,
            TestAggregateState
        >(
            eventStore,
            snapshotStore,
            state => TestAggregate.fromState(state),
            agg => agg.toState(),
            'TestAggregate',
            0, // snapshot threshold 0 => nessun snapshot
        );

        const agg = new TestAggregate();
        agg.setFoo('first');
        await repoNoSnap.save('ZERO-SNAP', agg);

        const snapshot = await snapshotStore.getLatestSnapshot(
            'TestAggregate',
            'ZERO-SNAP',
        );
        expect(snapshot).toBeNull();
    });

    it('should not create snapshot if version is not multiple of threshold', async () => {
        const repoThreshold2 = new EventSourcedRepository<
            TestAggregate,
            TestAggregateState
        >(
            eventStore,
            snapshotStore,
            state => TestAggregate.fromState(state),
            agg => agg.toState(),
            'TestAggregate',
            2,
        );

        const agg = new TestAggregate();
        agg.setFoo('once'); // version 1: non multiplo di 2
        await repoThreshold2.save('NON-MULTIPLE', agg);

        let snap = await snapshotStore.getLatestSnapshot(
            'TestAggregate',
            'NON-MULTIPLE',
        );
        expect(snap).toBeNull();

        agg.setFoo('twice'); // version 2: multiplo di 2
        await repoThreshold2.save('NON-MULTIPLE', agg);

        snap = await snapshotStore.getLatestSnapshot(
            'TestAggregate',
            'NON-MULTIPLE',
        );
        expect(snap).not.toBeNull();
        expect(snap?.version).toBe(2);
    });

    it('should create multiple snapshots if version hits threshold multiple times', async () => {
        const repoMultiSnap = new EventSourcedRepository<
            TestAggregate,
            TestAggregateState
        >(
            eventStore,
            snapshotStore,
            state => TestAggregate.fromState(state),
            agg => agg.toState(),
            'TestAggregate',
            2,
        );

        const agg = new TestAggregate();
        agg.setFoo('first'); // version 1
        await repoMultiSnap.save('MULTI-SNAP', agg);

        agg.setFoo('second'); // version 2 -> snapshot
        await repoMultiSnap.save('MULTI-SNAP', agg);

        agg.setFoo('third'); // version 3 (no snapshot)
        await repoMultiSnap.save('MULTI-SNAP', agg);

        agg.setFoo('fourth'); // version 4 -> snapshot
        await repoMultiSnap.save('MULTI-SNAP', agg);

        const snap = await snapshotStore.getLatestSnapshot(
            'TestAggregate',
            'MULTI-SNAP',
        );
        expect(snap).not.toBeNull();
        expect(snap?.version).toBe(4);
    });

    it('should use default snapshotThreshold=0 if not provided', async () => {
        const repoDefault = new EventSourcedRepository<
            TestAggregate,
            TestAggregateState
        >(
            eventStore,
            snapshotStore,
            state => TestAggregate.fromState(state),
            agg => agg.toState(),
            'TestAggregate', // threshold omitted => default to 0
        );

        const agg = new TestAggregate();
        agg.setFoo('default param');
        await repoDefault.save('DEFAULT-THRESHOLD', agg);

        const snap = await snapshotStore.getLatestSnapshot(
            'TestAggregate',
            'DEFAULT-THRESHOLD',
        );
        expect(snap).toBeNull();
    });

    it('should do nothing if there are no uncommitted events', async () => {
        const agg = new TestAggregate();
        // No events are added, so pullUncommittedEvents() returns []
        const savedEvents = await repo.save('NO-EVENTS-AGG', agg);
        expect(savedEvents).toHaveLength(0);

        const loadedEvents = await eventStore.loadEvents(
            'TestAggregate',
            'NO-EVENTS-AGG',
        );
        expect(loadedEvents).toHaveLength(0);

        const snap = await snapshotStore.getLatestSnapshot(
            'TestAggregate',
            'NO-EVENTS-AGG',
        );
        expect(snap).toBeNull();
    });
});
