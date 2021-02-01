// oauth2.controller

import axios from 'axios';
import { create, AccessToken } from 'simple-oauth2';
import { config } from '../config';
import { LOG_LEVEL, log, parseLogData } from '../utils/logger';
import { OAuth2Parser, IClientInformation, IClientBasicInformation, IScopeBasicInformation, ParsingObjectType, IScopeInformation } from './oauth2.parser';
import { ClientRepository } from '../client/client.repository';
import { NotFound, InvalidParameter } from '../utils/error';
import { InvalidClientInformation } from './oauth2.error';

// TODO: Need to add the server token somehow in the authroization server api requests

export class OAuth2Controller {
    static readonly OAUTH_MESSAGES = {
        GET_TOKEN_ERROR: 'Error occured while getting a token.',
        ID_PARAMETER_MISSING: 'Client id Parameter is missing.',
        NO_STACK: 'No stack was found.',
    };

    // OAuth2 configured root flow with Client Credentials options
    static oauth2Flow = create(config.clientCredentials as any);

    // Client Credentials flow shirnked to easy callable function which returns access token which
    // Should be wrapped via accessToken.create for parsing the response from the authorization server
    static clientCredentialsFlow =
        OAuth2Controller.oauth2Flow.clientCredentials.getToken.bind({}, config.tokenConfig);

    // Contains the Access Token
    static accessToken: AccessToken | null  = null;

    /**
     * Returns the access token from the authorization server and save it in the controller
     */
    static async getToken() {
        try {
            // If there's already an access token, need to check it's validity
            if (OAuth2Controller.accessToken) {

                // Check if access token expired
                if (!OAuth2Controller.accessToken.expired()) {
                    return OAuth2Controller.accessToken.token.access_token;
                }
            }

            // All other cases require creating new access token
            const result = await OAuth2Controller.clientCredentialsFlow();
            OAuth2Controller.accessToken = OAuth2Controller.oauth2Flow.accessToken.create(result);
            return OAuth2Controller.accessToken.token.access_token;
        } catch (err) {
            log(LOG_LEVEL.INFO, parseLogData(OAuth2Controller.OAUTH_MESSAGES.GET_TOKEN_ERROR,
                                             'OAuth2Controller',
                                             '400',
                                             err));

            throw err;
        }
    }

    /**
     * Register client in the authorization server
     *
     * @param clientInformation - Client information to register
     */
    static async registerClient(clientInformation: IClientBasicInformation) {
        // Register the client in the authorization server
        const response = await axios.post(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_CLIENT_MANAGEMENT_ENDPOINT}`,
            { clientInformation },
            { headers: { 'Authorization-Registrer': await OAuth2Controller.getToken() } },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.CLIENT);
    }

    /**
     * Gets client's active tokens count list from authorization server.
     *
     * @param clientId - Client id of the client
     * @param clientToken - Client token for managing the client
     */
    static async getClientActiveTokens(clientId: string, clientToken: string) {
        const response = await axios.get(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_CLIENT_MANAGEMENT_ENDPOINT}/${clientId}/${config.OAUTH_CLIENT_MANAGEMENT_ACTIVE_TOKENS_ENDPOINT}`,
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.TOKEN_LIST);
    }

    /**
     * Reads client information from authorization server
     *
     * @param clientId - Client id of the client to read
     * @param clientToken - Client token for managing the client
     */
    static async readClientInformation(clientId: string, clientToken: string) {

        // Read client information from authorization server
        const response = await axios.get(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_CLIENT_MANAGEMENT_ENDPOINT}/${clientId}`,
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.CLIENT);
    }

    /**
     * Updates client information in authorization server
     * @param clientId - Client id of the client to update
     * @param clientInformation - Client information to update
     * @param clientToken - Client token for managing the client
     */
    static async updateClientInformation(clientId: string,
                                         clientInformation: Partial<IClientBasicInformation>,
                                         clientToken: string) {

        // Checks if included client id
        if (clientId) {

            const response = await axios.put(
                `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_CLIENT_MANAGEMENT_ENDPOINT}/${clientId}`,
                { clientInformation },
                {
                    headers: {
                        'Authorization-Registrer': await OAuth2Controller.getToken(),
                        Authorization: clientToken,
                    },
                },
            );

            return OAuth2Parser.parseResponse(response, ParsingObjectType.CLIENT);
        }

        log(LOG_LEVEL.INFO, parseLogData(OAuth2Controller.OAUTH_MESSAGES.ID_PARAMETER_MISSING,
                                         'OAuth2Controller',
                                         '400',
                                         OAuth2Controller.OAUTH_MESSAGES.NO_STACK));

        throw new InvalidClientInformation('Client id parameter is missing');
    }

    /**
     * Reset client credentials (Client ID, Client Secret) for specific client
     * @param clientId - Client id of the client to reset
     * @param clientToken - Client token for managing the client
     * @returns Client with updated id and secret
     */
    static async resetClientCredentials(clientId: string, clientToken: string) {

        // Reset client credentials (Client ID, Client Secret)
        const response = await axios.patch(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_CLIENT_MANAGEMENT_ENDPOINT}/${clientId}`, {},
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.CLIENT);
    }

    /**
     * Deletes client from the authorization server
     * @param clientId - Client id of the client to delete
     * @param clientToken - Client token for managing the client
     * @returns Boolean indicates if the client deleted otherwise throws error
     */
    static async deleteClient(clientId: string, clientToken: string) {

        // Delete from authorization server
        const response = await axios.delete(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_CLIENT_MANAGEMENT_ENDPOINT}/${clientId}`,
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.CLIENT);
    }

    /**
     * Create new scope in authorization server for specific client.
     * @param scopeInformation - Scope information to create a scope
     * @param clientToken - Client token for managing the client
     * @param clientId - Client id of the scope owner.
     */
    static async createScope(scopeInformation: IScopeBasicInformation, clientToken: string, clientId: string) {

        // Create scope in oauth server for the client
        const response = await axios.post(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_SCOPE_MANAGEMENT_ENDPOINT}/${clientId}`,
            { scopeInformation },
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.SCOPE);
    }

    /**
     * Update scope which belongs to specific client.
     * @param clientId - Client id of the scope owner.
     * @param clientToken - Client token for managing the client.
     * @param audienceId - Audience id of the scope owner.
     * @param value - Value of the scope.
     * @param scopeInformation - Scope Information to update.
     */
    static async updateScope(clientId: string, clientToken: string, audienceId: string, value: string, scopeInformation: Partial<IScopeInformation>) {
        // Update scope in oauth server for the client
        const response = await axios.put(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_SCOPE_MANAGEMENT_ENDPOINT}/?clientId=${clientId}`,
            { scopeInformation: {...scopeInformation, audienceId, value } },
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.SCOPE);
    }

    /**
     * Delete scope which belongs to specific client.    
     * @param clientId - Client id of the scope owner. 
     * @param clientToken - Client token for managing the client.
     * @param audienceId - Audience id of the scope owner.
     * @param value - Scope value.
     */
    static async deleteScope(clientId: string, clientToken: string, audienceId: string, value: string) {
        const response = await axios.delete(
            `${config.OAUTH_MANAGEMENT_ENDPOINT}/${config.OAUTH_SCOPE_MANAGEMENT_ENDPOINT}/?clientId=${clientId}&audienceId=${audienceId}&value=${value}`,
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response, ParsingObjectType.SCOPE);
    }
}
