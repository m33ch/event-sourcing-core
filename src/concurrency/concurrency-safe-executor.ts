import { ConcurrencyException } from './concurrency.exception';

export class ConcurrencySafeExecutor {
    constructor(
        private readonly maxRetries: number = 3,
        private readonly log?: (msg: string) => void,
    ) {}

    public getMaxRetries(): number {
        return this.maxRetries;
    }

    /**
     * Executes "operation()" up to maxRetries times if a ConcurrencyException occurs.
     * @param operation asynchronous callback that might throw ConcurrencyException
     */
    public async execute<T>(operation: () => Promise<T>): Promise<T> {
        let attempt = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            attempt++;
            try {
                // Execute the callback
                const result = await operation();
                return result;
            } catch (err) {
                // If it's a concurrency conflict and we haven't exceeded the attempts
                if (
                    err instanceof ConcurrencyException &&
                    attempt < this.maxRetries
                ) {
                    this.log?.(
                        `[ConcurrencySafeExecutor] Concurrency conflict (attempt ${attempt}), retrying...`,
                    );
                    continue; // retry
                }
                // Otherwise, rethrow the exception
                throw err;
            }
        }
    }
}
