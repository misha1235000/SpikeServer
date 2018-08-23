// oauth2.error

import { InvalidParameter } from '../utils/error';

export class InvalidClientInformation extends InvalidParameter {
    constructor(message?: string) {
        super(message || 'Invalid Client Information');
    }
}
