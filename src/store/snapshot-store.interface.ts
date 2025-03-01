import { Snapshot } from '../domain/snapshot.interface';

/**
 * Contract for a Snapshot Store:
 * - Load the latest snapshot
 * - Save a new snapshot
 */
export interface SnapshotStore<TState> {
    saveSnapshot(snapshot: Snapshot<TState>): Promise<void>;
    getLatestSnapshot(
        aggregateType: string,
        aggregateId: string,
    ): Promise<Snapshot<TState> | null>;
}
