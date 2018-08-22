// team.error

import { InvalidParameter } from '../utils/error';

export class InvalidTeamname extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Team Name Provided');
    }
}

export class InvalidPassword extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Password Provided');
    }
}
