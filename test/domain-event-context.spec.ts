import { DomainEventContext } from '../src/domain/events/domain-event-context';

describe('DomainEventContext', () => {
    it('should return undefined for correlationId and causationId when no context is set', () => {
        // Fuori dal contesto AsyncLocalStorage, getStore() restituisce undefined
        expect(DomainEventContext.getCorrelationId()).toBeUndefined();
        expect(DomainEventContext.getCurrentCausationId()).toBeUndefined();
    });

    it('should run callback with provided correlationId and empty causationStack', async () => {
        await DomainEventContext.run(
            { correlationId: 'test-corr' },
            async () => {
                expect(DomainEventContext.getCorrelationId()).toBe('test-corr');
                expect(
                    DomainEventContext.getCurrentCausationId(),
                ).toBeUndefined();
            },
        );
    });

    it('should use default empty values when run with empty context', async () => {
        await DomainEventContext.run({}, async () => {
            expect(DomainEventContext.getCorrelationId()).toBe('');
            expect(DomainEventContext.getCurrentCausationId()).toBeUndefined();
        });
    });

    it('should push and pop causationId correctly', async () => {
        await DomainEventContext.run({ correlationId: 'corr' }, async () => {
            // Inizialmente la pila è vuota
            expect(DomainEventContext.getCurrentCausationId()).toBeUndefined();

            // Push di un causationId
            DomainEventContext.pushCausationId('cause1');
            expect(DomainEventContext.getCurrentCausationId()).toBe('cause1');

            // Push di un altro causationId
            DomainEventContext.pushCausationId('cause2');
            expect(DomainEventContext.getCurrentCausationId()).toBe('cause2');

            // Pop: ora la cima della pila deve essere 'cause1'
            DomainEventContext.popCausationId();
            expect(DomainEventContext.getCurrentCausationId()).toBe('cause1');

            // Pop: la pila si svuota
            DomainEventContext.popCausationId();
            expect(DomainEventContext.getCurrentCausationId()).toBeUndefined();
        });
    });

    it('getCausationId should return the same as getCurrentCausationId', async () => {
        await DomainEventContext.run({ correlationId: 'corr' }, async () => {
            expect(DomainEventContext.getCausationId()).toBe(
                DomainEventContext.getCurrentCausationId(),
            );
            DomainEventContext.pushCausationId('x');
            expect(DomainEventContext.getCausationId()).toBe('x');
        });
    });
});
