// oauth2.parser

import { AxiosResponse } from 'axios';
import { NotFound, InternalServerError } from '../utils/error';
import { Forbidden } from '../auth/auth.error';

export interface IClientBasicInformation {
    name: string;
    redirectUris: string[];
    hostUri: string;
}

export interface IClientInformation extends IClientBasicInformation {
    id: string;
    secret: string;
    registrationToken: string;
}

// TODO: Proper implement parseResponse without strange return type
export class OAuth2Parser {

    /**
     * Parses the response from the authorization server
     * @param response - The response from the authorization server
     */
    static parseResponse(response: AxiosResponse) {

        switch (response.status) {

        // Data received - Read/Create requests
        // TODO: Maybe add more parsing in future
        case 200:
        case 201:
            return OAuth2Parser.parseClientFullInfo(response.data);

        // Response OK without data - Delete requests
        case 204:
            return true;

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
            ...(clientInformation.hostUri ? { hostUri: clientInformation.hostUri } : {}),
            ...(clientInformation.registrationToken ? { token: clientInformation.registrationToken } : {}),
        };
    }

    /**
     * Parses client information to readable information to web client
     * @param clientInformation - Whole client information to parse to readable information to web client
     * @returns Client information in readable format for the web client
     */
    private static parseClientFullInfo(clientInformation: IClientInformation) {
        return {
            redirectUris: clientInformation.redirectUris,
            secret: clientInformation.secret,
            ...OAuth2Parser.parseClientInfoToModel(clientInformation),
        };
    }
}
