// auth.error

import { BaseError, InvalidParameter } from '../utils/error';

export class InvalidToken extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Token Provided');
    }
}

export class Unauthorized extends BaseError {
    constructor(message?: string) {
        super(message || 'Unauthorized', 401);
    }
}

export class Forbidden extends BaseError {
    constructor(message?: string) {
        super(message || 'Access is Forbidden', 403);
    }
}
