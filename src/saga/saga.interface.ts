import { DomainEvent } from '../domain/events/domain-event.interface';

export interface Saga {
    handle(event: DomainEvent): Promise<void>;
}
