// scope.error

import { BaseError, InvalidParameter } from '../utils/error';

export class InvalidScopeValue extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Scope Value Provided');
    }
}

export class InvalidCreatorValue extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Creator Provided');
    }
}

export class InvalidDescriptionValue extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Description Provided');
    }
}
