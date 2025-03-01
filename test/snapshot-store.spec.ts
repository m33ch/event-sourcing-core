import { InMemorySnapshotStore } from '../src/store/in-memory-snapshot-store';
import { Snapshot } from '../src/domain/snapshot.interface';

interface TestState extends Record<string, unknown> {
    foo: string;
}

describe('InMemorySnapshotStore', () => {
    let store: InMemorySnapshotStore<TestState>;

    beforeEach(() => {
        store = new InMemorySnapshotStore<TestState>();
    });

    it('should return null when no snapshot is saved', async () => {
        const snapshot = await store.getLatestSnapshot('TestAggregate', 'ID-1');
        expect(snapshot).toBeNull();
    });

    it('should save and return the latest snapshot based on version', async () => {
        const now = new Date();
        const snapshot1: Snapshot<TestState> = {
            aggregateId: 'ID-1',
            aggregateType: 'TestAggregate',
            version: 1,
            state: { foo: 'bar1' },
            createdAt: now,
        };

        const snapshot2: Snapshot<TestState> = {
            aggregateId: 'ID-1',
            aggregateType: 'TestAggregate',
            version: 3,
            state: { foo: 'bar3' },
            createdAt: new Date(now.getTime() + 1000),
        };

        const snapshot3: Snapshot<TestState> = {
            aggregateId: 'ID-1',
            aggregateType: 'TestAggregate',
            version: 2,
            state: { foo: 'bar2' },
            createdAt: new Date(now.getTime() + 500),
        };

        await store.saveSnapshot(snapshot1);
        await store.saveSnapshot(snapshot2);
        await store.saveSnapshot(snapshot3);

        const latestSnapshot = await store.getLatestSnapshot(
            'TestAggregate',
            'ID-1',
        );
        expect(latestSnapshot).not.toBeNull();
        expect(latestSnapshot!.version).toBe(3);
        expect(latestSnapshot!.state.foo).toBe('bar3');
    });

    it('should handle snapshots for different aggregates independently', async () => {
        const snapshotA: Snapshot<TestState> = {
            aggregateId: 'ID-A',
            aggregateType: 'AggregateA',
            version: 1,
            state: { foo: 'stateA' },
            createdAt: new Date(),
        };

        const snapshotB: Snapshot<TestState> = {
            aggregateId: 'ID-B',
            aggregateType: 'AggregateB',
            version: 1,
            state: { foo: 'stateB' },
            createdAt: new Date(),
        };

        await store.saveSnapshot(snapshotA);
        await store.saveSnapshot(snapshotB);

        const latestA = await store.getLatestSnapshot('AggregateA', 'ID-A');
        const latestB = await store.getLatestSnapshot('AggregateB', 'ID-B');

        expect(latestA).not.toBeNull();
        expect(latestA!.state.foo).toBe('stateA');
        expect(latestB).not.toBeNull();
        expect(latestB!.state.foo).toBe('stateB');
    });
});
