// client.error

import { BaseError, InvalidParameter } from '../utils/error';

export class InvalidCallback extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid Callback Provided', 400);
    }
}

export class InvalidClientId extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Client Id Provided');
    }
}

export class InvalidAudienceId extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Audience Id Provided');
    }
}

export class InvalidHostname extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Hostname Provided');
    }
}

export class InvalidName extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Name Provided');
    }
}
