// scope.validator

import { IScope } from './scope.interface';
import { InvalidScopeValue, InvalidCreatorValue, InvalidDescriptionValue } from './scope.error';
import { NotFound } from '../utils/error';
import { ClientRepository } from '../client/client.repository';

export class ScopeValidator {

    static isValid(scope: IScope): boolean {
        return scope && ScopeValidator.isAudienceIdValid(scope.audienceId as string) &&
                        ScopeValidator.isPermittedClientsValid(scope.permittedClients) &&
                        ScopeValidator.isScopeValueValid(scope.value) &&
                        ScopeValidator.isDescriptionValid(scope.description) &&
                        ScopeValidator.isCreatorValid(scope.creator);
    }

    static async isClientIdValid(clientId: string) {
        const returnedClient = await ClientRepository.findById(clientId);

        if (returnedClient) {
            return true;
        }

        throw new NotFound('Client not found.');
    }

    static async isAudienceIdValid(audienceId: string) {
        const returnedClient = await ClientRepository.findByAudienceId(audienceId);

        if (returnedClient) {
            return true;
        }

        throw new NotFound('Client not found.');
    }

    static async isPermittedClientsValid(permittedClients: string[]) {
        const returnedPermittedClients = await ClientRepository.findByIds(permittedClients);

        if (returnedPermittedClients.length === permittedClients.length) {
            return true;
        }

        throw new NotFound('Some of the permitted clients not found.');
    }

    static isCreatorValid(creator: string): boolean {
        if (typeof creator === 'string') {
            return true;
        }

        throw new InvalidCreatorValue('Creator value must be a type of string.');
    }

    static isScopeValueValid(value: string): boolean {
        if (typeof value === 'string') {
            return true;
        }

        throw new InvalidScopeValue('Scope value must be a type of string.');
    }

    static isDescriptionValid(description: string): boolean {
        if (typeof description === 'string') {
            return true;
        }

        throw new InvalidDescriptionValue('Description value must be a type of string.');
    }
}
