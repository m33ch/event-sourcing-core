import { Snapshot } from '../domain/snapshot.interface';
import { SnapshotStore } from './snapshot-store.interface';

export class InMemorySnapshotStore<TState extends Record<string, unknown>>
    implements SnapshotStore<TState>
{
    private snapshots = new Map<string, Snapshot<TState>[]>();

    public async saveSnapshot(snapshot: Snapshot<TState>): Promise<void> {
        const key = this.getKey(snapshot.aggregateType, snapshot.aggregateId);
        const arr = this.snapshots.get(key) || [];
        arr.push(snapshot);
        this.snapshots.set(key, arr);
    }

    public async getLatestSnapshot(
        aggregateType: string,
        aggregateId: string,
    ): Promise<Snapshot<TState> | null> {
        const key = this.getKey(aggregateType, aggregateId);
        const arr = this.snapshots.get(key) || [];
        if (arr.length === 0) return null;
        arr.sort((a, b) => b.version - a.version);
        return arr[0];
    }

    private getKey(aggregateType: string, aggregateId: string) {
        return `${aggregateType}#${aggregateId}`;
    }
}
