// client.validator

import { IClient } from './client.interface';
import { TeamRepository } from '../team/team.repository';
import { InvalidClientId, InvalidName, InvalidHostname } from './client.error';
import { NotFound } from '../utils/error';

export class ClientValidator {

    static isValid(client: IClient): boolean {
        return client && ClientValidator.isClientIdValid(client.clientId) &&
                       ClientValidator.isTokenValid(client.token) &&
                       ClientValidator.isTeamIdValid(client.teamId) &&
                       ClientValidator.isNameValid(client.name) &&
                       ClientValidator.isHostnameValid(client.hostUri);
    }

    static isClientIdValid(clientId: string): boolean {
        if (typeof clientId === 'string') {
            return true;
        }

        throw new InvalidClientId('ClientId must be a type of string.');
    }

    static isTokenValid(token: string): boolean {
        if (typeof token === 'string') {
            return true;
        }

        throw new InvalidClientId('Token must be a type of string.');
    }

    static async isTeamIdValid(teamId: string) {
        const returnedTeam = await TeamRepository.findById(teamId);

        if (returnedTeam) {
            return true;
        }

        throw new NotFound('Client not found.');
    }

    static isNameValid(name: string): boolean {
        const nameRegex: RegExp = /[A-Za-z0-9]{4,30}/m;

        if (nameRegex.test(name)) {
            return true;
        }

        throw new InvalidName('Client Name Invalid. 4 - 30 characters, contains letters or numbers');
    }
    static isHostnameValid(hostname: string): boolean {
        const hostnameRegex = /^https:\/\/(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/m;

        if (hostnameRegex.test(hostname)) {
            return true;
        }

        throw new InvalidHostname('Hostname Invalid. Need to be https://BASE_URL');
    }
}
