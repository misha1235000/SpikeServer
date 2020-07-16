// client.validator

import { IClient } from './client.interface';
import { TeamRepository } from '../team/team.repository';
import { InvalidClientId, InvalidName, InvalidHostname, InvalidAudienceId } from './client.error';
import { NotFound } from '../utils/error';

export class ClientValidator {

    static isValid(client: IClient): boolean {
        return client && ClientValidator.isClientIdValid(client.clientId) &&
                       ClientValidator.isTokenValid(client.token) &&
                       ClientValidator.isAudienceIdValid(client.audienceId) &&
                       ClientValidator.isTeamIdValid(client.teamId as string) &&
                       ClientValidator.isNameValid(client.name) &&
                       ClientValidator.isHostnameValid(client.hostUris);
    }

    static isClientIdValid(clientId: string): boolean {
        if (typeof clientId === 'string') {
            return true;
        }

        throw new InvalidClientId('ClientId must be a type of string.');
    }

    static isAudienceIdValid(audienceId: string): boolean {
        if (typeof audienceId === 'string') {
            return true;
        }

        throw new InvalidAudienceId('ClientId must be a type of string.');
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
    static isHostnameValid(hostnames: string[]): boolean {
        const hostnameRegex = /^(https:\/\/([A-Za-z0-9\._\-]+)([A-Za-z0-9]+))(:[1-9][0-9]{0,3}|:[1-5][0-9]{4}|:6[0-4][0-9]{3}|:65[0-4][0-9]{2}|:655[0-2][0-9]|:6553[0-5])?$/;
        let isValidHost = true;

        for (let currHostIndex = 0; currHostIndex < hostnames.length; currHostIndex++) {
            if (!hostnameRegex.test(hostnames[currHostIndex])) {
                isValidHost = false;
            }
        }

        if (isValidHost === true) {
            return true;
        }

        throw new InvalidHostname('Hostname Invalid. Need to be https://BASE_URL');
    }
}
