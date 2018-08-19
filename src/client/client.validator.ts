// client.validator

import { IClient } from './client.interface';
import { UserRepository } from '../user/user.repository';

export class ClientValidator {

    static isValid(client: IClient): boolean {
        return client && ClientValidator.isClientIdValid(client.clientId) &&
                       ClientValidator.isTokenValid(client.token) &&
                       ClientValidator.isTeamIdValid(client.teamId) &&
                       ClientValidator.isNameValid(client.name) &&
                       ClientValidator.isHostnameValid(client.hostname);
    }

    static isClientIdValid(clientId: string): boolean {
        return typeof clientId === 'string';
    }

    static isTokenValid(token: string): boolean {
        return typeof token === 'string';
    }

    static async isTeamIdValid(teamId: string) {
        try {
            const returnedUser = await UserRepository.findById(teamId);

            return !!returnedUser;
        } catch (error) { // TODO: Refactor with errorHandler!!!!!!
            return false;
        }
    }

    static isNameValid(name: string): boolean {
        const nameRegex: RegExp = /[A-Za-z0-9]{4,30}/m;

        return nameRegex.test(name);
    }
    static isHostnameValid(hostname: string): boolean {
        const hostnameRegex = /^https:\/\/(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/m;

        return hostnameRegex.test(hostname);
    }
}
