// client.error

import { BaseError } from '../utils/error';

export class DuplicateUnique extends BaseError {
    constructor(message?: string) {
        super(message || 'Duplicate Unique Field', 400);
    }
}

export class NotFound extends BaseError {
    constructor(message?: string) {
        super(message || 'Not Found', 404);
    }
}

export class InvalidParameter extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Parameter Provided', 400);
    }
}

export class InvalidCallback extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Callback Provided', 400);
    }
}

export class InvalidClientId extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Client Id Provided', 400);
    }
}

export class InvalidHostname extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Hostname Provided', 400);
    }
}

export class InvalidName extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Name Provided', 400);
    }
}
