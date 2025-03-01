import { AsyncLocalStorage } from 'async_hooks';

interface EventContext {
    correlationId: string;
    causationStack: string[];
}

export const eventContextStorage = new AsyncLocalStorage<EventContext>();

export class DomainEventContext {
    /**
     * Executes the callback within a context that includes correlationId
     * and an empty causationId stack.
     */
    public static run<T>(
        context: Partial<EventContext>,
        callback: () => Promise<T>,
    ): Promise<T> {
        const initialContext: EventContext = {
            correlationId: context.correlationId ?? '',
            causationStack: context.causationStack ?? [],
        };
        return eventContextStorage.run(initialContext, callback);
    }

    public static getCorrelationId(): string | undefined {
        const store = eventContextStorage.getStore();
        return store?.correlationId;
    }

    /**
     * Returns the current causationId, which is the last value in the stack.
     */
    public static getCurrentCausationId(): string | undefined {
        const store = eventContextStorage.getStore();
        if (store && store.causationStack.length > 0) {
            return store.causationStack[store.causationStack.length - 1];
        }
        return undefined;
    }

    /**
     * Pushes a new causationId onto the current context stack.
     */
    public static pushCausationId(id: string): void {
        const store = eventContextStorage.getStore();
        if (store) {
            store.causationStack.push(id);
        }
    }

    /**
     * Removes the last causationId from the current context stack.
     */
    public static popCausationId(): void {
        const store = eventContextStorage.getStore();
        if (store && store.causationStack.length > 0) {
            store.causationStack.pop();
        }
    }

    /**
     * Alias for getCurrentCausationId(), useful for consistency with other APIs.
     */
    public static getCausationId(): string | undefined {
        return this.getCurrentCausationId();
    }
}
