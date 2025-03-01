/**
 * Represents a snapshot of the state of an aggregate at a certain version.
 *
 * TState = the data structure with the serialized information.
 */
export interface Snapshot<TState> {
    aggregateId: string;
    aggregateType: string;
    version: number;
    state: TState;
    createdAt: Date;
    metadata?: Record<string, unknown>;
}
