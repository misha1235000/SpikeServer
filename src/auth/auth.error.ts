// auth.error

import { BaseError } from '../utils/error';

export class InvalidParameter extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Parameter Provided', 400);
    }
}

export class InvalidToken extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Token Provided', 400);
    }
}

export class Unauthorized extends BaseError {
    constructor(message?: string) {
        super(message || 'Unauthorized', 401);
    }
}
