export interface DomainEvent<
    Payload = Record<string, unknown>,
    Metadata = Record<string, unknown>,
> {
    /**
     * Unique identifier of the event (UUID).
     */
    eventId: string;

    /**
     * Name/type of the event (e.g., "OrderCreatedEvent").
     */
    eventType: string;

    /**
     * Type of aggregate (e.g., "Order", "User").
     */
    aggregateType: string;

    /**
     * Identifier of the aggregate.
     */
    aggregateId: string;

    /**
     * Version (revision) of the event in the aggregate stream.
     */
    version: number;

    /**
     * Date and time when the event occurred in the domain.
     */
    occurredOn: Date;

    /**
     * Date and time when it was recorded in the system.
     */
    recordedOn: Date;

    /**
     * Represents the ID of the organizational entity, opens to multi-tenant system.
     */
    tenantId?: string;

    /**
     * ID to track the entire flow (requestId, correlationId).
     */
    correlationId?: string;

    /**
     * ID of an event that caused this event (chaining).
     */
    causationId?: string;

    /**
     * Arbitrary metadata (e.g., user, IP, context).
     */
    metadata?: Metadata;

    /**
     * Payload of the event.
     */
    payload: Payload;

    /**
     * Determines if it is a deletion event.
     */
    isDeletionEvent?: boolean;
}
