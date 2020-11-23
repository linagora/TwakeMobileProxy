export class Forbidden extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, Forbidden.prototype);
    }
}

