export class Forbidden extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, Forbidden.prototype);
    }
}

export class BadRequest extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, BadRequest.prototype);
    }
}

