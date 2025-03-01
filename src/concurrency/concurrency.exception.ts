export class ConcurrencyException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConcurrencyException';
    }
}
