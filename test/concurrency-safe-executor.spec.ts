import { ConcurrencySafeExecutor } from '../src/concurrency/concurrency-safe-executor';
import { ConcurrencyException } from '../src/concurrency/concurrency.exception';

describe('ConcurrencySafeExecutor', () => {
    it('should default maxRetries to 3 if not provided', () => {
        const executor = new ConcurrencySafeExecutor();
        expect(executor.getMaxRetries()).toBe(3);
    });

    it('should return result if operation succeeds on first try', async () => {
        const executor = new ConcurrencySafeExecutor(3);
        const operation = jest.fn().mockResolvedValue('success');
        const result = await executor.execute(operation);
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on ConcurrencyException and eventually succeed', async () => {
        let callCount = 0;
        const operation = jest.fn().mockImplementation(async () => {
            callCount++;
            if (callCount < 3) {
                throw new ConcurrencyException('Conflict');
            }
            return 'success after retries';
        });

        const logFn = jest.fn();
        const executor = new ConcurrencySafeExecutor(5, logFn);
        const result = await executor.execute(operation);
        expect(result).toBe('success after retries');
        expect(operation).toHaveBeenCalledTimes(3);
        expect(logFn).toHaveBeenCalledTimes(2);
    });

    it('should throw error if non-ConcurrencyException is thrown', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Other error'));
        const executor = new ConcurrencySafeExecutor(3);
        await expect(executor.execute(operation)).rejects.toThrow(
            'Other error',
        );
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw error if maxRetries is exceeded', async () => {
        const operation = jest
            .fn()
            .mockRejectedValue(new ConcurrencyException('Conflict'));
        const executor = new ConcurrencySafeExecutor(3);
        await expect(executor.execute(operation)).rejects.toThrow(
            ConcurrencyException,
        );
        expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not crash if log is undefined when a ConcurrencyException occurs', async () => {
        let attempt = 0;
        const operation = jest.fn().mockImplementation(async () => {
            attempt++;
            if (attempt < 2) {
                throw new ConcurrencyException('Conflict');
            }
            return 'result without log';
        });

        const executor = new ConcurrencySafeExecutor(3);
        const result = await executor.execute(operation);
        expect(result).toBe('result without log');
        expect(operation).toHaveBeenCalledTimes(2);
    });
});
