// oauth2.parser

import { AxiosResponse } from 'axios';
import { NotFound, InternalServerError } from '../utils/error';
import { Forbidden } from '../auth/auth.error';
import { IClient } from '../client/client.interface';

export interface IClientBasicInformation {
    name: string;
    redirectUris: [string];
    hostUri: string;
}

export interface IClientInformation extends IClientBasicInformation {
    id: string;
    secret: string;
    registrationToken: string;
}

export class OAuth2Parser {

    /**
     * Parses the response from the authorization server
     * @param response - The response from the authorization server
     */
    static parseResponse(response: AxiosResponse) {

        switch (response.status) {

        // Data received - Read requests
        // TODO: Maybe add more parsing in future
        case 200:
            return response.data as IClientInformation;

        // Response OK without data - Delete requests
        case 204:
            return 'Client deleted successfully';

        // When 401 Unauthorized received, means the client doesn't exists.
        case 401:
            throw new NotFound('Client not exists.');

        // When 403 Forbidden received, means the requests unauthorized for performing.
        case 403:
            throw new Forbidden('The action is not allowed for this client.');

        // Unknown error occurred
        default:
            throw new InternalServerError('Unexpected behaviour noticed');
        }
    }

    /**
     * Parses client information to client model represent in the db
     *
     * @param clientInformation - Partial or whole client information to parse to client model
     * @returns Partial client model from the client information provided
     * TODO: Add correct type instead any
     */
    static parseClientInfoToModel(clientInformation: Partial<IClientInformation>) : any {

        return {
            ...(clientInformation.id ? { clientId: clientInformation.id } : {}),
            ...(clientInformation.name ? { name: clientInformation.name } : {}),
            ...(clientInformation.hostUri ? { hostname: clientInformation.hostUri } : {}),
            ...(clientInformation.registrationToken ? { token: clientInformation.registrationToken } : {}),
        };
    }

}
