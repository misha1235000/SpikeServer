// team.error

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

export class InvalidTeamname extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Team Name Provided', 400);
    }
}

export class InvalidPassword extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Password Provided', 400);
    }
}
