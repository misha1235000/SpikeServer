// client.validator

import { IClient } from './client.interface';

export class ClientValidator {

    static isValid(client: IClient): boolean {
        return client && ClientValidator.isClientIdValid(client.clientId) &&
                       ClientValidator.isTokenValid(client.token) &&
                       ClientValidator.isTeamIdValid(client.teamId) &&
                       ClientValidator.isNameValid(client.name) &&
                       ClientValidator.isHostnameValid(client.hostname);
    }

    static isClientIdValid(clientId: string): boolean {
        return true;
    }

    static isTokenValid(token: string): boolean {
        return true;
    }

    static isTeamIdValid(teamId: string): boolean {
        return true;
    }

    static isNameValid(name: string): boolean {
        return true;
    }
    static isHostnameValid(hostname: string): boolean {
        return true;
    }
}
