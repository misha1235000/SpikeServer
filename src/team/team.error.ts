// team.error

import { InvalidParameter } from '../utils/error';

export class InvalidTeamname extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Team Name Provided');
    }
}

export class InvalidTeamInformation extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Team Information Provided');
    }
}

export class MissingUsers extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Missing Users in Team');
    }
}
