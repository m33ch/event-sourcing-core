import { DomainEvent } from './domain-event.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for domain events.
 * Implements DomainEvent and IEvent (required for the NestJS CQRS EventBus).
 *
 * Concrete subclasses (e.g., CustomerCreatedEvent) can extend it,
 * providing their own payload and using the class name as the eventType.
 */
export abstract class BaseDomainEvent<
    Payload = Record<string, unknown>,
    Metadata = Record<string, unknown>,
> implements DomainEvent<Payload, Metadata>
{
    public readonly eventId: string;
    public readonly eventType: string;
    public readonly aggregateType: string;
    public readonly aggregateId: string;
    public version: number;
    public readonly occurredOn: Date;
    public readonly recordedOn: Date;
    public readonly tenantId?: string;
    public readonly correlationId?: string;
    public readonly causationId?: string;
    public readonly metadata?: Metadata;
    public readonly payload: Payload;

    constructor(
        aggregateType: string,
        aggregateId: string,
        payload: Payload,
        tenantId?: string,
        correlationId?: string,
        causationId?: string,
        metadata?: Metadata,
    ) {
        this.eventId = uuidv4();
        this.eventType = this.constructor.name;
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = new Date();
        this.recordedOn = new Date();
        this.correlationId = correlationId;
        this.tenantId = tenantId;
        this.causationId = causationId;
        this.metadata = metadata;
        this.version = 0; // verrà aggiornato in fase di persistenza
    }
}
