// oauth2.parser

import { AxiosResponse } from 'axios';
import { NotFound, InternalServerError, InvalidParameter } from '../utils/error';
import { Forbidden } from '../auth/auth.error';
import { ScopeType } from '../scope/scope.interface';

export interface IClientBasicInformation {
    name: string;
    teamId?: string;
    teamName?: string;
    redirectUris: string[];
    hostUris: string[];
    scopes?: string[];
}

export interface IClientInformation extends IClientBasicInformation {
    id: string;
    secret: string;
    registrationToken: string;
    audienceId: string;
}

export interface IScopeBasicInformation {
    value: string;
    clientId: string;
    type: string;
    description: string;
}

export interface IScopeInformation extends IScopeBasicInformation {
    permittedClients: string[];
}

export enum ParsingObjectType { CLIENT = 'CLIENT', SCOPE = 'SCOPE' }

// TODO: Proper implement parseResponse without strange return type
export class OAuth2Parser {

    /**
     * Parses the response from the authorization server
     * @param response - The response from the authorization server
     */
    static parseResponse(response: AxiosResponse, objType: ParsingObjectType) {

        switch (response.status) {

        // Data received - Read/Create requests
        // TODO: Maybe add more parsing in future
        case 200:
        case 201:
            if (objType === ParsingObjectType.SCOPE) {
                return OAuth2Parser.parseScopeFullInfo(response.data);
            }

            return OAuth2Parser.parseClientFullInfo(response.data);

        // Response OK without data - Delete requests
        case 204:
            return true;

        // Invalid request or registration error
        case 400:
            throw new InvalidParameter(response.data ? response.data.message : 'Invalid request occurred');

        // When 401 Unauthorized received, means the client/scope doesn't exists.
        case 401:
            throw new NotFound(`${objType === ParsingObjectType.SCOPE ? 'Scope' : 'Client' } not exists.`);

        // When 403 Forbidden received, means the requests unauthorized for performing.
        case 403:
            throw new Forbidden('The action is not allowed for this client.');

        // Unknown error occurred
        default:
            throw new InternalServerError(response.data || 'Unexpected behaviour noticed');
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
            ...(clientInformation.hostUris ? { hostUris: clientInformation.hostUris } : {}),
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
            audienceId: clientInformation.audienceId,
            ...OAuth2Parser.parseClientInfoToModel(clientInformation),
        };
    }

    /**
     * Parsing scope information from oauth2 to model to store in db.
     * @param scopeInformation - Scope information received by oauth2 server
     * @param creator - Creator field (which is missing in oauth2 server)
     */
    static parseScopeInfoToModel(scopeInformation: IScopeInformation, creator: string) {
        return {
            ...scopeInformation,
            creator,
        };
    }

    /**
     * Parsing scope information received by oauth server to readable format for web client
     * @param scopeInformation - Scope information received from oauth server
     * @returns Scope information in readable format for the web client
     */
    private static parseScopeFullInfo(scopeInformation: IScopeInformation) {
        return {
            ...scopeInformation,
        };
    }
}
