import { validate as uuidValidate } from 'uuid';
import { BaseDomainEvent } from '../src/domain/events/base-domain-event.interface';

//
// Definiamo una classe concreta di test per BaseDomainEvent
//
class TestDomainEvent extends BaseDomainEvent {
    // La classe non necessita di implementazioni aggiuntive per il test
    // perché BaseDomainEvent implementa tutto nel costruttore.
    // Per comodità, possiamo lasciare il costruttore ereditato.
}

describe('BaseDomainEvent', () => {
    it('should populate default values when minimal parameters are provided', () => {
        const aggregateType = 'TestAggregate';
        const aggregateId = 'agg-123';
        // Non passiamo payload, tenantId, correlationId, causationId, metadata
        const event = new TestDomainEvent(aggregateType, aggregateId);

        // eventId: generato automaticamente e deve essere un UUID valido
        expect(event.eventId).toBeDefined();
        expect(typeof event.eventId).toBe('string');
        expect(uuidValidate(event.eventId)).toBe(true);

        // eventType deve corrispondere al nome della classe concreta
        expect(event.eventType).toBe('TestDomainEvent');

        // aggregateType e aggregateId sono quelli passati
        expect(event.aggregateType).toBe(aggregateType);
        expect(event.aggregateId).toBe(aggregateId);

        // Il payload di default deve essere un oggetto vuoto
        expect(event.payload).toEqual({});

        // Le date devono essere istanze di Date e vicine all'istante corrente
        expect(event.occurredOn).toBeInstanceOf(Date);
        expect(event.recordedOn).toBeInstanceOf(Date);
        const now = Date.now();
        expect(Math.abs(event.occurredOn.getTime() - now)).toBeLessThan(1000);
        expect(Math.abs(event.recordedOn.getTime() - now)).toBeLessThan(1000);

        // version è inizialmente 0
        expect(event.version).toBe(0);

        // I campi opzionali non sono definiti
        expect(event.tenantId).toBeUndefined();
        expect(event.correlationId).toBeUndefined();
        expect(event.causationId).toBeUndefined();
        expect(event.metadata).toBeUndefined();
    });

    it('should populate all fields when provided', () => {
        const aggregateType = 'Order';
        const aggregateId = 'order-456';
        const payload = { total: 100, currency: 'USD' };
        const tenantId = 'tenant-001';
        const correlationId = 'corr-123';
        const causationId = 'cause-456';
        const metadata = { source: 'API' };

        const event = new TestDomainEvent(
            aggregateType,
            aggregateId,
            payload,
            tenantId,
            correlationId,
            causationId,
            metadata,
        );

        expect(event.aggregateType).toBe(aggregateType);
        expect(event.aggregateId).toBe(aggregateId);
        expect(event.payload).toEqual(payload);
        expect(event.tenantId).toBe(tenantId);
        expect(event.correlationId).toBe(correlationId);
        expect(event.causationId).toBe(causationId);
        expect(event.metadata).toEqual(metadata);
    });

    it('should update eventType based on concrete class name', () => {
        const event = new TestDomainEvent('SomeType', 'some-id');
        expect(event.eventType).toBe('TestDomainEvent');
    });

    it('should generate new eventId for each instance', () => {
        const event1 = new TestDomainEvent('A', '1');
        const event2 = new TestDomainEvent('A', '1');
        expect(event1.eventId).not.toBe(event2.eventId);
        expect(uuidValidate(event1.eventId)).toBe(true);
        expect(uuidValidate(event2.eventId)).toBe(true);
    });
});
